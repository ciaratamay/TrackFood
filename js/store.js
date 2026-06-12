/* ===== TrackFood: storage + state + math ===== */
'use strict';

const DB_NAME = 'nibble'; /* kept from v1 so existing installs keep their data after the rename */
const DB_VER = 1;
let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('foods'))   db.createObjectStore('foods', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('users'))   db.createObjectStore('users', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('entries')) {
        const s = db.createObjectStore('entries', { keyPath: 'id' });
        s.createIndex('byUserDate', ['userId', 'date'], { unique: false });
      }
      if (!db.objectStoreNames.contains('meta'))    db.createObjectStore('meta', { keyPath: 'k' });
      if (!db.objectStoreNames.contains('backups')) db.createObjectStore('backups', { keyPath: 'slot' });
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode) { return _db.transaction(store, mode).objectStore(store); }
function reqP(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }

function dbGetAll(store) { return reqP(tx(store, 'readonly').getAll()); }
function dbGet(store, key) { return reqP(tx(store, 'readonly').get(key)); }
function dbPut(store, val) { return reqP(tx(store, 'readwrite').put(val)); }
function dbDel(store, key) { return reqP(tx(store, 'readwrite').delete(key)); }
function dbClear(store) { return reqP(tx(store, 'readwrite').clear()); }

/* In-memory mirror for fast UI rendering */
const State = {
  foods: [],            /* array of food objects */
  foodById: {},
  users: [],
  currentUserId: null,
  currentDate: todayStr(),
  currentCat: 'fruit',
  meta: {},             /* misc settings: backupTimes, lastBackup, lastBackupDate */
};

function todayStr(d) {
  const x = d ? new Date(d) : new Date();
  return x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
}
function uid(prefix) { return (prefix||'') + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* Bring a food up to the current shape:
   - cats: array (was cat: string); built-ins get recategorised via CAT_REMAP
   - promptAdd: per-food sauce/topping follow-up groups (default none)
   - drinks get a 200 ml serving as the default portion */
function canonicalizeFood(f) {
  if (!Array.isArray(f.cats)) {
    const remap = CAT_REMAP[(f.name || '').toLowerCase()];
    f.cats = remap ? remap.slice() : [f.cat || 'misc'];
    delete f.cat;
  }
  if (!Array.isArray(f.promptAdd)) f.promptAdd = [];
  if (f.cats.includes('drinks')) {
    f.per = f.per || 'ml';
    const has200 = (f.servings || []).some(s => s.grams === 200);
    if (!has200) {
      f.servings = f.servings || [];
      f.servings.unshift({ name: '1 glass', grams: 200 });
    }
  }
  return f;
}

/* ---------- bootstrap ---------- */
async function initStore() {
  await openDB();
  State.foods = await dbGetAll('foods');
  State.users = await dbGetAll('users');
  const metaRows = await dbGetAll('meta');
  for (const m of metaRows) State.meta[m.k] = m.v;

  /* First run: seed foods + create a default user */
  if (State.foods.length === 0) {
    for (const f of SEED_FOODS) await dbPut('foods', canonicalizeFood(f));
    State.foods = await dbGetAll('foods');
  } else {
    /* upgrade existing installs in place (cat -> cats, new fields) */
    for (const f of State.foods) {
      if (!Array.isArray(f.cats) || !Array.isArray(f.promptAdd)) {
        canonicalizeFood(f);
        await dbPut('foods', f);
      }
    }
  }
  if (State.users.length === 0) {
    const u = newUser('Me');
    await dbPut('users', u);
    State.users = [u];
  }
  reindexFoods();
  State.currentUserId = State.meta.currentUserId && State.users.some(u=>u.id===State.meta.currentUserId)
    ? State.meta.currentUserId : State.users[0].id;
  if (!State.meta.backupTimes) State.meta.backupTimes = ['06:00', '20:00'];
  if (!Array.isArray(State.meta.disabledCats)) State.meta.disabledCats = [];
  if (!Array.isArray(State.meta.customCats)) State.meta.customCats = [];
}

function reindexFoods() {
  State.foodById = Object.fromEntries(State.foods.map(f => [f.id, f]));
}

function newUser(name) {
  return {
    id: uid('u_'),
    name: name || 'User',
    dob: '',
    sex: 'm',
    kcalTarget: null,
    targets: {},                       /* key -> manual override */
    shown: DEFAULT_SHOWN.slice(),      /* nutrients on overview screen */
    starred: DEFAULT_STARRED.slice(),  /* nutrients with bars on day screen */
    limits: DEFAULT_LIMITS.slice(),    /* nutrients treated as upper-limit (red when over) */
    measures: [],                      /* {date, weightKg, heightCm} growth log */
  };
}

async function saveMeta(k, v) { State.meta[k] = v; await dbPut('meta', { k, v }); }
async function saveUser(u) {
  await dbPut('users', u);
  const i = State.users.findIndex(x => x.id === u.id);
  if (i >= 0) State.users[i] = u; else State.users.push(u);
}
async function saveFood(food) {
  await dbPut('foods', food);
  const i = State.foods.findIndex(x => x.id === food.id);
  if (i >= 0) State.foods[i] = food; else State.foods.push(food);
  reindexFoods();
}
async function deleteFood(id) {
  await dbDel('foods', id);
  State.foods = State.foods.filter(f => f.id !== id);
  reindexFoods();
}

function currentUser() { return State.users.find(u => u.id === State.currentUserId) || State.users[0]; }

/* ---------- diary entries ---------- */
async function getEntries(userId, date) {
  const idx = tx('entries', 'readonly').index('byUserDate');
  return reqP(idx.getAll(IDBKeyRange.only([userId, date])));
}
async function addEntry(foodId, qty, serving) {
  const e = {
    id: uid('e_'),
    userId: State.currentUserId,
    date: State.currentDate,
    foodId, qty,
    servingName: serving.name,
    servingGrams: serving.grams,
    ts: Date.now(),
    order: Date.now(),
  };
  await dbPut('entries', e);
  /* bump usage stats on the food for sorting tiles */
  const f = State.foodById[foodId];
  if (f) { f.uses = (f.uses||0) + 1; f.lastUsed = Date.now(); await saveFood(f); }
  return e;
}
async function updateEntry(e) { await dbPut('entries', e); }
async function deleteEntry(id) { await dbDel('entries', id); }

async function getDatesWithEntries(userId) {
  const all = await dbGetAll('entries');
  const set = new Set();
  for (const e of all) if (e.userId === userId) set.add(e.date);
  return set;
}

/* ---------- nutrient math ---------- */
/* grams for one entry */
function entryGrams(e) { return e.qty * e.servingGrams; }

/* nutrient totals for a set of entries: {key: value} */
function totalsFor(entries) {
  const t = {};
  for (const e of entries) {
    const f = State.foodById[e.foodId];
    if (!f) continue;
    const grams = entryGrams(e);
    const factor = grams / 100;             /* values stored per 100 g/ml */
    for (const [k, v] of Object.entries(f.n)) {
      t[k] = (t[k] || 0) + v * factor;
    }
  }
  return t;
}

/* per-entry contribution to one nutrient, for the breakdown screen */
function contributions(entries, key) {
  const out = [];
  for (const e of entries) {
    const f = State.foodById[e.foodId];
    if (!f) continue;
    const v = (f.n[key] || 0) * entryGrams(e) / 100;
    if (v > 0) out.push({ entry: e, food: f, value: v });
  }
  out.sort((a, b) => b.value - a.value);
  return out;
}

/* suggest foods to close a gap on `key`: rank DB foods by nutrient per typical serving */
function suggestForNutrient(key, excludeFoodIds) {
  const ex = new Set(excludeFoodIds || []);
  const scored = [];
  for (const f of State.foods) {
    const per100 = f.n[key];
    if (!per100 || per100 <= 0) continue;
    if (ex.has(f.id)) continue;
    /* use the food's first non-gram serving if present, else 100 g */
    let serv = (f.servings && f.servings[0]) ? f.servings[0] : { name: '100' + f.per, grams: 100 };
    const amount = per100 * serv.grams / 100;
    scored.push({ food: f, serving: serv, amount });
  }
  scored.sort((a, b) => b.amount - a.amount);
  return scored.slice(0, 5);
}

/* ---------- trends: average over days that have >=1 entry ---------- */
async function trendAverages(userId, days) {
  const all = await dbGetAll('entries');
  const end = new Date(State.currentDate + 'T00:00:00');
  const start = new Date(end); start.setDate(start.getDate() - (days - 1));
  const byDate = {};
  for (const e of all) {
    if (e.userId !== userId) continue;
    const d = new Date(e.date + 'T00:00:00');
    if (d < start || d > end) continue;
    (byDate[e.date] = byDate[e.date] || []).push(e);
  }
  const loggedDates = Object.keys(byDate);
  const sum = {};
  for (const date of loggedDates) {
    const t = totalsFor(byDate[date]);
    for (const [k, v] of Object.entries(t)) sum[k] = (sum[k] || 0) + v;
  }
  const n = loggedDates.length || 1;
  const avg = {};
  for (const [k, v] of Object.entries(sum)) avg[k] = v / n;
  return { avg, loggedCount: loggedDates.length, window: days };
}

/* ---------- backups ---------- */
async function exportData() {
  const foods = State.foods;
  const users = State.users;
  const entries = await dbGetAll('entries');
  const meta = State.meta;
  return { app: 'trackfood', version: 2, exportedAt: new Date().toISOString(), foods, users, entries, meta };
}
function downloadBackup(obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trackfood-backup-' + todayStr() + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* rotating internal snapshots: 3 slots, newest overwrites oldest */
async function autoSnapshot() {
  const data = await exportData();
  const existing = await dbGetAll('backups');
  existing.sort((a, b) => (a.at || 0) - (b.at || 0));
  let slot;
  if (existing.length < 3) {
    const used = new Set(existing.map(b => b.slot));
    slot = [0, 1, 2].find(s => !used.has(s));
  } else {
    slot = existing[0].slot; /* oldest */
  }
  await dbPut('backups', { slot, at: Date.now(), date: todayStr(), data });
}
async function listSnapshots() {
  const rows = await dbGetAll('backups');
  rows.sort((a, b) => (b.at || 0) - (a.at || 0));
  return rows;
}
async function restoreData(obj) {
  const okApp = obj && (obj.app === 'trackfood' || obj.app === 'nibble');
  if (!okApp || !Array.isArray(obj.foods)) throw new Error('Not a TrackFood backup file.');
  await dbClear('foods'); await dbClear('users'); await dbClear('entries');
  for (const f of obj.foods)   await dbPut('foods', canonicalizeFood(f));
  for (const u of obj.users)   await dbPut('users', u);
  for (const e of (obj.entries||[])) await dbPut('entries', e);
  if (obj.meta) for (const [k, v] of Object.entries(obj.meta)) await dbPut('meta', { k, v });
  /* reload memory */
  State.foods = await dbGetAll('foods');
  State.users = await dbGetAll('users');
  State.meta = {};
  for (const m of await dbGetAll('meta')) State.meta[m.k] = m.v;
  reindexFoods();
  if (!State.users.some(u => u.id === State.currentUserId)) State.currentUserId = State.users[0]?.id;
}

/* decide whether to prompt for a download backup right now */
function shouldPromptBackup() {
  const times = State.meta.backupTimes || ['06:00','20:00'];
  const today = todayStr();
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const lastByWindow = State.meta.lastBackupWindow || {}; /* {date: [bool per window]} */
  const todayWindows = lastByWindow[today] || [];
  for (let i = 0; i < times.length; i++) {
    const [h, m] = times[i].split(':').map(Number);
    const winMin = h*60 + m;
    if (nowMin >= winMin && !todayWindows[i]) return i; /* this window is due and not yet backed up */
  }
  return -1;
}
async function markBackupDone(windowIndex) {
  const today = todayStr();
  const map = State.meta.lastBackupWindow || {};
  const arr = map[today] || [];
  if (windowIndex >= 0) arr[windowIndex] = true;
  /* keep only last few dates */
  map[today] = arr;
  const keys = Object.keys(map).sort();
  while (keys.length > 5) delete map[keys.shift()];
  await saveMeta('lastBackupWindow', map);
}

if (typeof module !== 'undefined') module.exports = {
  todayStr, totalsFor, contributions, suggestForNutrient, newUser, entryGrams,
};

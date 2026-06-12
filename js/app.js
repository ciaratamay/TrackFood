/* ===== TrackFood: app screens, flows, and boot ===== */
'use strict';

const USER_COLORS = ['#0E9F6E','#6E8FC9','#C97B4B','#9A78C4','#C95C7E','#3FA8A0','#C9A23C','#5B7D9E'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const SEG_COLORS = ['#0E9F6E','#6E8FC9','#C97B4B','#9A78C4','#C95C7E','#3FA8A0','#C9A23C','#5B7D9E','#B0795A','#7FA86B'];

let curEntries = [];      /* entries for current user + date */
let backupWindowDue = -1; /* index of a backup window that is due, or -1 */
let undoBuffer = null;    /* last deleted entry/entries, one step of undo */

/* ---------- category helpers ---------- */
function foodCats(f) { return Array.isArray(f.cats) ? f.cats : [f.cat || 'misc']; }
function foodInCat(f, k) { return foodCats(f).includes(k); }
function customCats() { return State.meta.customCats || []; }
function disabledCats() { return new Set(State.meta.disabledCats || []); }
/* tabs on the rail: enabled built-ins + user-added customs */
function railCats() {
  const dis = disabledCats();
  return CATS.filter(c => !dis.has(c.k)).concat(customCats());
}
/* categories a food can belong to (everything except the grouped Sauces tab) */
function selectableCats() {
  return CATS.filter(c => !c.grouped).concat(EXTRA_CATS).concat(customCats());
}
function catInfoOf(k) {
  return CAT_BY_KEY[k] || customCats().find(c => c.k === k) || { k, label: k, emoji: '\uD83C\uDF7D\uFE0F' };
}

/* ---------- small helpers ---------- */
function userColor(u, idx) { return u.color || USER_COLORS[idx % USER_COLORS.length]; }
function isLimitFor(key, u) { return (u.limits || []).includes(key); }
function formatQty(q) {
  if (q == null) return '';
  let s = Number(q).toFixed(2);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
function prettyDate(ds) {
  const d = new Date(ds + 'T00:00:00');
  const today = todayStr();
  const yest = todayStr(new Date(Date.now() - 86400000));
  let main;
  if (ds === today) main = 'Today';
  else if (ds === yest) main = 'Yesterday';
  else main = WDAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  const sub = d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  return { main, sub };
}

async function loadEntries() {
  curEntries = await getEntries(State.currentUserId, State.currentDate);
}
async function rerender() {
  await loadEntries();
  render();
}

/* ---------- top-level frame ---------- */
function render() {
  const app = $('#app');
  clear(app);
  app.appendChild(topBar());
  app.appendChild(userBar());
  if (backupWindowDue >= 0) app.appendChild(backupBanner());
  app.appendChild(el('div', { class: 'body' }, [catRail(), panel()]));
}

function topBar() {
  return el('div', { class: 'topbar' }, [
    el('button', { class: 'iconbtn', 'aria-label': 'Menu', onClick: openMenu }, '\u2630'),
    el('div', { class: 'brand' }, 'TrackFood'),
    el('div', { class: 'spacer' }),
  ]);
}

/* horizontal user chips */
function userBar() {
  const bar = el('div', { class: 'userbar' });
  State.users.forEach((u, i) => {
    const chip = el('button', {
      class: 'uchip' + (u.id === State.currentUserId ? ' sel' : ''),
      onClick: () => {
        if (u.id === State.currentUserId) { openUserEditor(u); return; }
        State.currentUserId = u.id;
        saveMeta('currentUserId', u.id);
        rerender();
      },
    }, [
      el('span', { class: 'av', style: { background: userColor(u, i) } },
        (u.name || '?').trim().charAt(0).toUpperCase() || '?'),
      el('span', null, u.name || '?'),
    ]);
    bar.appendChild(chip);
  });
  bar.appendChild(el('button', { class: 'uchip add', onClick: () => openUserEditor(null) }, '\uFF0B Add'));
  return bar;
}

function backupBanner() {
  return el('div', { class: 'banner' }, [
    el('div', null, 'Back up your data?'),
    el('div', { class: 'b-actions' }, [
      el('button', { class: 'yes', onClick: doDownload }, 'Download'),
      el('button', { class: 'no', onClick: () => { backupWindowDue = -1; render(); } }, 'Later'),
    ]),
  ]);
}

function catRail() {
  const rail = el('div', { class: 'rail-cats' });
  const tabs = [{ k: 'diary', label: 'Diary', emoji: '\uD83D\uDCD3' }].concat(railCats());
  tabs.forEach(c => {
    const tab = el('button', {
      class: 'cattab' + (State.currentCat === c.k ? ' sel' : ''),
      onClick: () => { State.currentCat = c.k; render(); },
    }, [el('div', { class: 'e' }, c.emoji), el('div', null, c.label)]);
    rail.appendChild(tab);
  });
  return rail;
}

function panel() {
  const p = el('div', { class: 'panel' });
  p.appendChild(dateStrip());
  const cur = State.currentCat;
  if (cur === 'diary') {
    p.appendChild(barsBlock());
    p.appendChild(el('div', { class: 'scroll' }, diaryList()));
  } else if (CAT_BY_KEY[cur] && CAT_BY_KEY[cur].grouped) {
    p.appendChild(el('div', { class: 'scroll' }, saucesPanel()));
  } else {
    p.appendChild(el('div', { class: 'scroll' }, foodGrid(cur)));
  }
  return p;
}

function dateStrip() {
  const pd = prettyDate(State.currentDate);
  return el('div', { class: 'datestrip' }, [
    el('button', { class: 'arrow', 'aria-label': 'Previous day', onClick: () => shiftDate(-1) }, '\u2039'),
    el('button', { class: 'date', onClick: openDatePicker }, [
      el('span', null, pd.main),
      el('small', null, pd.sub),
    ]),
    el('button', { class: 'arrow', 'aria-label': 'Next day', onClick: () => shiftDate(1) }, '\u203a'),
  ]);
}
function shiftDate(delta) {
  const d = new Date(State.currentDate + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  State.currentDate = todayStr(d);
  rerender();
}
function openDatePicker() {
  const inp = el('input', { type: 'date', value: State.currentDate,
    style: { width: '100%', padding: '12px', border: '1px solid var(--line)', borderRadius: '11px', background: 'var(--surface)' } });
  openSheet([sheetHead('Pick a date'), sheetBody([
    field('Date', inp),
    el('button', { class: 'btn', onClick: () => { if (inp.value) State.currentDate = inp.value; closeSheet(); rerender(); } }, 'Go to date'),
    el('button', { class: 'btn ghost', style: { marginTop: '8px' }, onClick: () => { State.currentDate = todayStr(); closeSheet(); rerender(); } }, 'Jump to today'),
  ])]);
}

/* ---------- nutrient bars (diary view) ---------- */
function nutrientBar(key, value, target, isLimit, onTap) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = isLimit && target && value > target;
  const bar = el('div', { class: 'bar' + (over ? ' over' : '') }, [
    el('div', { class: 'lab' }, labelOf(key)),
    el('div', { class: 'track' }, el('div', { class: 'fill', style: { width: (over ? 100 : pct) + '%' } })),
    el('div', { class: 'val num' }, nVal(key, value) + (target ? (' / ' + nVal(key, target)) : '') + ' ' + unitOf(key)),
  ]);
  if (typeof onTap === 'function') { bar.style.cursor = 'pointer'; bar.addEventListener('click', onTap); }
  return bar;
}

function barsBlock() {
  const u = currentUser();
  const starred = (u.starred && u.starred.length) ? u.starred : DEFAULT_STARRED;
  if (!curEntries.length) {
    return el('div', { class: 'bars empty' }, 'No food logged yet for this day. Pick a category on the left to start.');
  }
  const totals = totalsFor(curEntries);
  const block = el('div', { class: 'bars' });
  starred.forEach(key => {
    if (!NUTR_BY_KEY[key]) return;
    const val = totals[key] || 0;
    const t = targetFor(key, u);
    block.appendChild(nutrientBar(key, val, t, isLimitFor(key, u), () => openNutrientDetail(key)));
  });
  return block;
}

/* ---------- diary list ---------- */
function arrangeEntries(entries) {
  const sorted = entries.slice().sort((a, b) => (a.order || a.ts || 0) - (b.order || b.ts || 0));
  const subsByParent = {};
  const tops = [];
  for (const e of sorted) {
    if (e.parentId) (subsByParent[e.parentId] = subsByParent[e.parentId] || []).push(e);
    else tops.push(e);
  }
  const topIds = new Set(tops.map(t => t.id));
  const out = [];
  for (const e of tops) {
    out.push({ e, sub: false });
    for (const s of (subsByParent[e.id] || [])) out.push({ e: s, sub: true });
  }
  for (const e of sorted) if (e.parentId && !topIds.has(e.parentId)) out.push({ e, sub: false });
  return out;
}

function diaryList() {
  const wrap = el('div', { class: 'diary' });
  if (!curEntries.length) {
    wrap.appendChild(el('div', { class: 'empty-day' }, 'Nothing logged yet. Tap a category on the left, then a food to add it here.'));
    return wrap;
  }
  for (const { e, sub } of arrangeEntries(curEntries)) {
    const f = State.foodById[e.foodId];
    const grams = entryGrams(e);
    const kcal = f ? (f.n.kcal || 0) * grams / 100 : 0;
    const per = f ? (f.per || 'g') : 'g';
    const servLine = e.qty === 1 ? e.servingName : (formatQty(e.qty) + ' \u00d7 ' + e.servingName);
    const row = el('div', { class: 'entry' + (sub ? ' sub' : ''), onClick: () => openEntryEditor(e) }, [
      el('div', { class: 'e' }, f ? (f.emoji || '\uD83C\uDF7D\uFE0F') : '\u2753'),
      el('div', { class: 'meta' }, [
        el('div', { class: 'nm' }, f ? f.name : '(deleted food)'),
        el('div', { class: 'sv' }, servLine + ' \u00b7 ' + Math.round(grams) + ' ' + per),
      ]),
      el('div', { class: 'kc num' }, Math.round(kcal) + ' kcal'),
    ]);
    wrap.appendChild(row);
  }
  return wrap;
}

/* ---------- food grid (logging) ---------- */
function pin(label, onClick, primary) { return el('button', { class: 'pin' + (primary ? ' primary' : ''), onClick }, label); }

function foodTile(f, onClick) {
  const t = el('button', { class: 'tile', onClick: onClick || (() => openServingSheet(f)) }, [
    el('div', { class: 'e' }, f.emoji || '\uD83C\uDF7D\uFE0F'),
    el('div', { class: 'nm' }, f.name),
  ]);
  onLongPress(t, () => openFoodActions(f));
  return t;
}

/* long-press action sheet for any food */
function openFoodActions(f) {
  openSheet([sheetHead(f.name, f.emoji), sheetBody([
    el('button', { class: 'btn ghost', onClick: () => openFoodEditor(f) }, '\u270F\uFE0F Edit (name, icon, categories, nutrients)'),
    el('button', { class: 'btn danger', style: { marginTop: '8px' }, onClick: () => {
      confirmSheet({ title: 'Delete \u201C' + f.name + '\u201D?', body: 'It disappears from your food lists. Past diary days that used it will show \u201C(deleted food)\u201D.',
        danger: true, okLabel: 'Delete', onOk: async () => { await deleteFood(f.id); toast('Deleted'); await rerender(); } });
    } }, '\uD83D\uDDD1 Delete food'),
  ])]);
}

function standardPins(presetCat) {
  return [
    pin('\uFF0B Add food', () => openFoodEditor(null, presetCat), true),
    pin('\uD83D\uDCD6 Recipe', () => openRecipeBuilder(presetCat)),
    pin('\u2B07 Import', () => openImport()),
    pin('\uD83C\uDF10 Online', () => openOffSearch(presetCat)),
  ];
}

function foodGrid(cat) {
  const wrap = el('div', { class: 'grid-wrap' });
  const pinned = el('div', { class: 'pinned' }, standardPins(cat));
  const info = catInfoOf(cat);
  const tiles = el('div', { class: 'tiles' });
  const search = el('input', { class: 'search', type: 'search', placeholder: 'Search ' + info.label.toLowerCase() + '\u2026',
    oninput: () => renderTiles(search.value) });

  function listFor(filter) {
    let list = State.foods.filter(f => foodInCat(f, cat));
    if (filter) { const q = filter.toLowerCase(); list = list.filter(f => f.name.toLowerCase().includes(q)); }
    list.sort((a, b) => (b.uses || 0) - (a.uses || 0) || a.name.localeCompare(b.name));
    return list;
  }
  function renderTiles(filter) {
    clear(tiles);
    const list = listFor(filter);
    if (!list.length) { tiles.appendChild(el('div', { class: 'tiles-empty' }, 'No foods here yet. Tap \u201CAdd food\u201D to create one, or long-press any food elsewhere to edit its categories.')); return; }
    list.forEach(f => tiles.appendChild(foodTile(f)));
  }
  renderTiles('');
  wrap.append(pinned, search, tiles);
  return wrap;
}

/* Sauces tab: all five groups under headings */
function saucesPanel() {
  const wrap = el('div', { class: 'grid-wrap' });
  wrap.appendChild(el('div', { class: 'pinned' }, standardPins('sauce_savoury')));
  const search = el('input', { class: 'search', type: 'search', placeholder: 'Search sauces, spreads, oils\u2026' });
  const groupsBox = el('div');
  function draw(filter) {
    clear(groupsBox);
    const q = (filter || '').toLowerCase();
    let any = false;
    EXTRA_CATS.forEach(g => {
      let list = State.foods.filter(f => foodInCat(f, g.k));
      if (q) list = list.filter(f => f.name.toLowerCase().includes(q));
      if (!list.length) return;
      any = true;
      list.sort((a, b) => (b.uses || 0) - (a.uses || 0) || a.name.localeCompare(b.name));
      groupsBox.appendChild(el('div', { class: 'grouphead' }, g.label));
      const tiles = el('div', { class: 'tiles' });
      list.forEach(f => tiles.appendChild(foodTile(f)));
      groupsBox.appendChild(tiles);
    });
    if (!any) groupsBox.appendChild(el('div', { class: 'tiles-empty' }, 'No matches.'));
  }
  search.addEventListener('input', () => draw(search.value));
  draw('');
  wrap.append(search, groupsBox);
  return wrap;
}

/* ---------- serving picker / logging ---------- */
function openServingSheet(food, opts) {
  opts = opts || {};
  const per = food.per || 'g';
  const named = (food.servings && food.servings.length) ? food.servings.slice() : [];
  const rawServ = { name: per, grams: 1, raw: true };

  let sel, qty;
  if (opts.editEntry) {
    const e = opts.editEntry;
    if (e.servingName === per && e.servingGrams === 1) { sel = rawServ; qty = e.qty; }
    else {
      sel = named.find(s => s.name === e.servingName && s.grams === e.servingGrams)
            || { name: e.servingName, grams: e.servingGrams };
      qty = e.qty;
    }
  } else {
    sel = named.length ? named[0] : rawServ;
    qty = sel.raw ? 100 : 1;
  }

  const qtyInput = numInput({ value: qty, step: 'any', min: '0' });
  qtyInput.addEventListener('input', () => { qty = parseNum(qtyInput.value, 0); updatePreview(); });
  const preview = el('div', { class: 'previewkc' });
  const list = el('div', { class: 'servlist' });

  function gramsNow() { return sel.raw ? qty : qty * sel.grams; }
  function updatePreview() {
    const g = gramsNow();
    const kcal = (food.n.kcal || 0) * g / 100;
    preview.textContent = Math.round(g) + ' ' + per + '  \u00b7  ' + Math.round(kcal) + ' kcal';
  }
  function selectServing(s) {
    sel = s;
    if (s.raw && qty <= 1) { qty = 100; qtyInput.value = 100; }
    if (!s.raw && qty === 100) { qty = 1; qtyInput.value = 1; }
    rebuildList(); updatePreview();
  }
  function rebuildList() {
    clear(list);
    named.concat([rawServ]).forEach(s => {
      const isSel = (s === sel) || (sel && s.name === sel.name && s.grams === sel.grams);
      list.appendChild(el('div', { class: 'servopt' + (isSel ? ' sel' : ''), onClick: () => selectServing(s) }, [
        el('span', null, s.raw ? ('Enter exact ' + per) : s.name),
        el('span', { class: 'g' }, s.raw ? '' : (s.grams + ' ' + per)),
      ]));
    });
    list.appendChild(el('div', { class: 'servopt', onClick: openCustom }, [
      el('span', null, '\uFF0B Custom serving'), el('span', { class: 'g' }, ''),
    ]));
  }
  function openCustom() {
    const nm = textInput({ placeholder: 'e.g. 1 carton' });
    const gr = numInput({ placeholder: per, step: 'any', min: '0' });
    openSheet([sheetHead('Custom serving', food.emoji), sheetBody([
      field('Serving name', nm),
      field('Weight in ' + per, gr),
      el('button', { class: 'btn', onClick: async () => {
        const g = parseNum(gr.value, 0); const name = (nm.value || '').trim();
        if (!name || !(g > 0)) { toast('Enter a name and a weight'); return; }
        const s = { name, grams: g };
        food.servings = food.servings || [];
        food.servings.push(s);
        await saveFood(food);
        named.push(s); sel = s;
        reopen();
      } }, 'Save serving'),
      el('button', { class: 'btn ghost', style: { marginTop: '8px' }, onClick: reopen }, 'Back'),
    ])]);
  }
  function doAdd() {
    const q = parseNum(qtyInput.value, 0);
    if (!(q > 0)) { toast('Enter a quantity'); return; }
    const serving = sel.raw ? { name: per, grams: 1 } : { name: sel.name, grams: sel.grams };
    (async () => {
      if (opts.editEntry) {
        const e = opts.editEntry;
        e.qty = q; e.servingName = serving.name; e.servingGrams = serving.grams;
        await updateEntry(e);
        closeSheet(); toast('Updated'); await rerender();
      } else {
        const e = await addEntry(food.id, q, serving);
        if (opts.parentId) { e.parentId = opts.parentId; await updateEntry(e); }
        closeSheet(); await rerender();
        const groups = (food.promptAdd || []).filter(k => EXTRA_CATS.some(g => g.k === k));
        if (!opts.noFollowup && !opts.parentId && groups.length) openToppingFollowup(e.id, groups);
        else toast('Added');
      }
    })();
  }
  /* entries delete without confirmation, with one step of undo */
  function doDelete() {
    (async () => {
      const removed = [opts.editEntry];
      for (const s of curEntries) if (s.parentId === opts.editEntry.id) removed.push(s);
      for (const r of removed) await deleteEntry(r.id);
      undoBuffer = removed;
      closeSheet(); await rerender();
      toastAction('Entry deleted', 'Undo', async () => {
        if (!undoBuffer) return;
        for (const r of undoBuffer) await updateEntry(r); /* dbPut restores it */
        undoBuffer = null;
        await rerender();
      });
    })();
  }
  function buildMain() {
    rebuildList(); updatePreview();
    return [sheetHead(food.name, food.emoji), sheetBody([
      el('div', { class: 'qrow' }, [
        qtyInput,
        el('div', { class: 'muted', style: { flex: '1', fontSize: '13px' } }, 'amount \u00d7 serving below'),
      ]),
      list, preview,
      el('button', { class: 'btn', onClick: doAdd }, opts.editEntry ? 'Save changes' : 'Add to diary'),
      opts.editEntry ? el('button', { class: 'btn danger', style: { marginTop: '8px' }, onClick: doDelete }, 'Delete entry') : null,
    ])];
  }
  function reopen() { openSheet(buildMain()); }
  reopen();
}

function openEntryEditor(entry) {
  const f = State.foodById[entry.foodId];
  if (!f) {
    (async () => {
      await deleteEntry(entry.id);
      undoBuffer = [entry];
      await rerender();
      toastAction('Removed (its food was deleted)', 'Undo', async () => {
        if (!undoBuffer) return;
        for (const r of undoBuffer) await updateEntry(r);
        undoBuffer = null;
        await rerender();
      });
    })();
    return;
  }
  openServingSheet(f, { editEntry: entry });
}

/* follow-up offering only the groups this food asks for */
function openToppingFollowup(parentId, groupKeys) {
  function group(catKey) {
    const g = EXTRA_CATS.find(x => x.k === catKey);
    if (!g) return null;
    const foods = State.foods.filter(f => foodInCat(f, catKey)).sort((a, b) => (b.uses || 0) - (a.uses || 0) || a.name.localeCompare(b.name));
    if (!foods.length) return null;
    const wrap = el('div', { class: 'addmore' }, [el('div', { class: 'lbl' }, g.label)]);
    foods.forEach(f => wrap.appendChild(pin((f.emoji || '') + ' ' + f.name, () => openServingSheet(f, { parentId, noFollowup: true }))));
    return wrap;
  }
  openSheet([sheetHead('Add anything on it?'), sheetBody([
    el('div', { class: 'muted', style: { marginTop: '0', fontSize: '13px' } }, 'Optional \u2014 each one is logged under the food you just added.'),
    groupKeys.map(group),
    el('button', { class: 'btn ghost', style: { marginTop: '14px' }, onClick: closeSheet }, 'Done'),
  ])]);
}

/* ---------- nutrient detail + suggestions ---------- */
function openNutrientDetail(key) {
  const u = currentUser();
  const total = totalsFor(curEntries)[key] || 0;
  const target = targetFor(key, u);
  const contribs = contributions(curEntries, key);
  const stackTotal = contribs.reduce((s, c) => s + c.value, 0) || 1;

  const stack = el('div', { style: { display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', background: 'var(--line)', margin: '6px 0 16px' } });
  contribs.forEach((c, i) => stack.appendChild(el('div', { style: { width: (c.value / stackTotal * 100) + '%', background: SEG_COLORS[i % SEG_COLORS.length] } })));

  const rows = el('div', { class: 'contrib' });
  if (!contribs.length) rows.appendChild(el('div', { class: 'muted' }, 'Nothing logged today contains this nutrient.'));
  contribs.forEach((c, i) => rows.appendChild(el('div', { class: 'c' }, [
    el('div', { class: 'top' }, [
      el('span', null, (c.food.emoji || '') + ' ' + c.food.name),
      el('small', null, nVal(key, c.value) + ' ' + unitOf(key)),
    ]),
    el('div', { class: 't' }, el('i', { style: { width: (c.value / stackTotal * 100) + '%', background: SEG_COLORS[i % SEG_COLORS.length] } })),
  ])));

  openSheet([sheetHead(labelOf(key)), sheetBody([
    el('div', { class: 'center', style: { margin: '2px 0 6px' } }, [
      el('div', { class: 'num', style: { fontSize: '26px', fontWeight: '700' } }, nVal(key, total) + ' ' + unitOf(key)),
      target ? el('div', { class: 'muted', style: { fontSize: '13px' } }, (isLimitFor(key, u) ? 'limit ' : 'target ') + nVal(key, target) + ' ' + unitOf(key)) : null,
    ]),
    contribs.length ? stack : null,
    rows,
    el('button', { class: 'btn ghost', style: { marginTop: '10px' }, onClick: () => showSuggestions(key) }, 'Suggest foods to add'),
  ])]);
}

function showSuggestions(key) {
  const eaten = Array.from(new Set(curEntries.map(e => e.foodId)));
  const sugg = suggestForNutrient(key, eaten).slice(0, 3);
  openSheet([sheetHead('Best for ' + labelOf(key)), sheetBody([
    el('div', { class: 'muted', style: { marginTop: '0', fontSize: '13px' } }, 'From your food list, per typical serving:'),
    sugg.length
      ? sugg.map(s => el('div', { class: 'servopt', onClick: () => openServingSheet(s.food) }, [
          el('span', null, (s.food.emoji || '') + ' ' + s.food.name),
          el('span', { class: 'g' }, nVal(key, s.amount) + ' ' + unitOf(key) + ' / ' + s.serving.name),
        ]))
      : el('div', { class: 'muted' }, 'No foods with this nutrient yet.'),
  ])]);
}

/* ---------- shared editor widgets ---------- */
/* grid of checkboxes; returns {node, get()} of selected keys */
function checkGroup(items, selected) {
  const sel = new Set(selected || []);
  const node = el('div', { class: 'checkwrap' });
  items.forEach(it => {
    const cb = el('input', { type: 'checkbox', checked: sel.has(it.k) });
    cb.addEventListener('change', () => { cb.checked ? sel.add(it.k) : sel.delete(it.k); });
    node.appendChild(el('label', { class: 'check' }, [cb, el('span', null, (it.emoji ? it.emoji + ' ' : '') + it.label)]));
  });
  return { node, get: () => items.map(i => i.k).filter(k => sel.has(k)) };
}

/* ---------- custom food editor ---------- */
function emptyFood(cat) {
  return { id: null, name: '', emoji: '\uD83C\uDF7D\uFE0F', cats: [cat || 'misc'], per: 'g', n: {}, servings: [], promptAdd: [], src: 'custom', uses: 0, lastUsed: 0 };
}
function openFoodEditor(existing, presetCat) {
  const food = existing
    ? canonicalizeFood(JSON.parse(JSON.stringify(existing)))
    : emptyFood(presetCat);
  const nameI = textInput({ value: food.name, placeholder: 'Food name' });
  const picker = emojiPicker(food.emoji);
  const catChecks = checkGroup(selectableCats(), food.cats);
  const promptChecks = checkGroup(EXTRA_CATS, food.promptAdd);
  const perSel = el('select', null, [el('option', { value: 'g' }, 'grams (g)'), el('option', { value: 'ml' }, 'millilitres (ml)')]);
  perSel.value = food.per || 'g';

  /* servings editor */
  let servs = (food.servings || []).map(s => ({ name: s.name, grams: s.grams }));
  const servBox = el('div');
  function drawServs() {
    clear(servBox);
    servs.forEach((s, i) => {
      const nm = textInput({ value: s.name, placeholder: 'e.g. 1 portion', oninput: () => { s.name = nm.value; } });
      const gr = numInput({ value: s.grams, step: 'any', min: '0', oninput: () => { s.grams = parseNum(gr.value, 0); } });
      servBox.appendChild(el('div', { class: 'field2', style: { alignItems: 'flex-end', marginBottom: '7px' } }, [
        el('div', { style: { flex: '2' } }, nm),
        el('div', { style: { flex: '1' } }, gr),
        el('button', { class: 'iconbtn', onClick: () => { servs.splice(i, 1); drawServs(); }, 'aria-label': 'Remove' }, '\u2715'),
      ]));
    });
    servBox.appendChild(el('button', { class: 'btn ghost sm', onClick: () => { servs.push({ name: '', grams: 0 }); drawServs(); } }, '\uFF0B Add serving'));
  }
  drawServs();

  /* nutrient grid */
  const nInputs = {};
  const grid = el('div', { class: 'nutr-grid' });
  NUTR.forEach(nt => {
    const inp = numInput({ value: (food.n[nt.k] != null ? food.n[nt.k] : ''), step: 'any', min: '0', placeholder: nt.unit });
    nInputs[nt.k] = inp;
    grid.appendChild(el('div', { class: 'nf' }, field(nt.label + ' (' + nt.unit + ')', inp)));
  });

  function save() {
    const name = (nameI.value || '').trim();
    if (!name) { toast('Give the food a name'); return; }
    let cats = catChecks.get();
    if (!cats.length) cats = ['misc'];
    const cleanServs = servs.filter(s => s.name.trim() && s.grams > 0).map(s => ({ name: s.name.trim(), grams: Number(s.grams) }));
    const n = {};
    for (const nt of NUTR) {
      const raw = nInputs[nt.k].value;
      if (raw !== '' && raw != null) { const v = Number(raw); if (Number.isFinite(v) && v >= 0) n[nt.k] = v; }
    }
    const out = {
      id: food.id || uid('f_'),
      name, emoji: picker.get(), cats, per: perSel.value,
      n, servings: cleanServs, promptAdd: promptChecks.get(),
      src: food.src || 'custom', uses: food.uses || 0, lastUsed: food.lastUsed || 0,
    };
    (async () => {
      await saveFood(out);
      closeSheet(); toast(existing ? 'Saved' : 'Food added'); await rerender();
    })();
  }
  function removeFood() {
    confirmSheet({ title: 'Delete \u201C' + food.name + '\u201D?', danger: true, okLabel: 'Delete',
      onOk: async () => { await deleteFood(food.id); closeSheet(); toast('Deleted'); await rerender(); } });
  }

  openSheet([sheetHead(existing ? 'Edit food' : 'New food'), sheetBody([
    field('Name', nameI),
    field('Icon', picker.node),
    el('div', { class: 'subhead' }, 'Categories'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '6px' } }, 'Tick every list this food should appear in.'),
    catChecks.node,
    field('Measured per', perSel),
    el('div', { class: 'subhead' }, 'Servings'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '8px' } }, 'Weight of one of each serving. You can always enter exact g/ml when logging.'),
    servBox,
    el('div', { class: 'subhead' }, 'Prompt to add after logging'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '6px' } }, 'After you log this food, offer these toppings (e.g. savoury sauce for pasta, spreads for bread). Leave all unticked for no prompt.'),
    promptChecks.node,
    el('div', { class: 'subhead' }, 'Nutrients per 100 g/ml'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '8px' } }, 'Leave a box blank for \u201Cno data\u201D.'),
    grid,
    el('button', { class: 'btn', style: { marginTop: '16px' }, onClick: save }, 'Save food'),
    existing ? el('button', { class: 'btn danger', style: { marginTop: '8px' }, onClick: removeFood }, 'Delete food') : null,
  ])]);
}

/* ---------- recipe builder ---------- */
function openRecipeBuilder(presetCat) {
  const ingredients = []; /* {food, grams} */
  const nameI = textInput({ placeholder: 'e.g. Mum\u2019s lasagne' });
  const picker = emojiPicker('\uD83C\uDF72');
  const catChecks = checkGroup(selectableCats(), [presetCat || 'misc']);
  const servingsI = numInput({ value: 4, step: '1', min: '1' });
  const ingBox = el('div');
  const summary = el('div');

  function totalsAndGrams() {
    const t = {};
    let g = 0;
    for (const ing of ingredients) {
      g += ing.grams;
      const f = ing.food;
      for (const [k, v] of Object.entries(f.n)) t[k] = (t[k] || 0) + v * ing.grams / 100;
    }
    return { t, g };
  }
  function drawIngredients() {
    clear(ingBox);
    if (!ingredients.length) ingBox.appendChild(el('div', { class: 'muted', style: { fontSize: '13px', padding: '4px 0' } }, 'No ingredients yet.'));
    ingredients.forEach((ing, i) => {
      ingBox.appendChild(el('div', { class: 'entry' }, [
        el('div', { class: 'e' }, ing.food.emoji || '\uD83C\uDF7D\uFE0F'),
        el('div', { class: 'meta' }, [
          el('div', { class: 'nm' }, ing.food.name),
          el('div', { class: 'sv' }, Math.round(ing.grams) + ' ' + (ing.food.per || 'g')),
        ]),
        el('button', { class: 'iconbtn', onClick: () => { ingredients.splice(i, 1); drawIngredients(); drawSummary(); }, 'aria-label': 'Remove' }, '\u2715'),
      ]));
    });
    ingBox.appendChild(el('button', { class: 'btn ghost sm', style: { marginTop: '6px' }, onClick: pickIngredient }, '\uFF0B Add ingredient'));
  }
  function pickIngredient() {
    const tiles = el('div', { class: 'tiles' });
    function draw(filter) {
      clear(tiles);
      let list = State.foods.slice();
      if (filter) { const q = filter.toLowerCase(); list = list.filter(f => f.name.toLowerCase().includes(q)); }
      else list = list.sort((a, b) => (b.uses || 0) - (a.uses || 0)).slice(0, 40);
      list.sort((a, b) => a.name.localeCompare(b.name));
      list.forEach(f => tiles.appendChild(foodTile(f, () => chooseAmount(f))));
    }
    const search = el('input', { class: 'search', type: 'search', placeholder: 'Search all foods\u2026', oninput: () => draw(search.value) });
    draw('');
    openSheet([sheetHead('Add ingredient'), sheetBody([search, tiles])]);
  }
  function chooseAmount(f) {
    const per = f.per || 'g';
    const named = (f.servings || []).slice();
    const rawServ = { name: per, grams: 1, raw: true };
    let sel = named.length ? named[0] : rawServ;
    let qty = sel.raw ? 100 : 1;
    const qtyInput = numInput({ value: qty, step: 'any', min: '0' });
    qtyInput.addEventListener('input', () => { qty = parseNum(qtyInput.value, 0); });
    const list = el('div', { class: 'servlist' });
    function redraw() {
      clear(list);
      named.concat([rawServ]).forEach(s => {
        const isSel = (s === sel) || (s.name === sel.name && s.grams === sel.grams);
        list.appendChild(el('div', { class: 'servopt' + (isSel ? ' sel' : ''), onClick: () => {
          sel = s; if (s.raw && qty <= 1) { qty = 100; qtyInput.value = 100; } redraw();
        } }, [el('span', null, s.raw ? ('Enter exact ' + per) : s.name), el('span', { class: 'g' }, s.raw ? '' : (s.grams + ' ' + per))]));
      });
    }
    redraw();
    openSheet([sheetHead('How much ' + f.name + '?', f.emoji), sheetBody([
      el('div', { class: 'qrow' }, [qtyInput, el('div', { class: 'muted', style: { flex: '1', fontSize: '13px' } }, 'amount \u00d7 serving')]),
      list,
      el('button', { class: 'btn', onClick: () => {
        const q = parseNum(qtyInput.value, 0);
        if (!(q > 0)) { toast('Enter an amount'); return; }
        const grams = sel.raw ? q : q * sel.grams;
        ingredients.push({ food: f, grams });
        openRecipeReopen();
      } }, 'Add to recipe'),
    ])]);
  }
  function drawSummary() {
    clear(summary);
    const { t, g } = totalsAndGrams();
    const servCount = Math.max(1, parseNum(servingsI.value, 1));
    const perServ = {};
    for (const [k, v] of Object.entries(t)) perServ[k] = v / servCount;
    const show = ['kcal', 'protein', 'carbs', 'fat', 'sugar', 'fiber'];
    summary.appendChild(el('div', { class: 'subhead' }, 'Per serving (' + Math.round(g / servCount) + ' g)'));
    const tbl = el('div', { class: 'bars' });
    show.forEach(k => {
      if (perServ[k] == null) return;
      tbl.appendChild(el('div', { class: 'bar' }, [
        el('div', { class: 'lab' }, labelOf(k)),
        el('div', { class: 'val num', style: { textAlign: 'left' } }, nVal(k, perServ[k]) + ' ' + unitOf(k) + '  (total ' + nVal(k, t[k] || 0) + ' ' + unitOf(k) + ')'),
      ]));
    });
    summary.appendChild(tbl);
  }
  servingsI.addEventListener('input', drawSummary);

  function saveRecipe() {
    const name = (nameI.value || '').trim();
    if (!name) { toast('Name your recipe'); return; }
    if (!ingredients.length) { toast('Add at least one ingredient'); return; }
    const { t, g } = totalsAndGrams();
    if (!(g > 0)) { toast('Ingredient weights are zero'); return; }
    const servCount = Math.max(1, Math.round(parseNum(servingsI.value, 1)));
    let cats = catChecks.get();
    if (!cats.length) cats = ['misc'];
    const n = {};
    for (const [k, v] of Object.entries(t)) n[k] = v / g * 100; /* per 100 g */
    const portion = g / servCount;
    const out = {
      id: uid('f_'), name, emoji: picker.get(), cats, per: 'g',
      n, servings: [{ name: '1 portion', grams: Math.round(portion) }, { name: 'whole recipe', grams: Math.round(g) }],
      promptAdd: [], src: 'recipe', uses: 0, lastUsed: 0,
    };
    (async () => { await saveFood(out); closeSheet(); toast('Recipe saved as a food'); await rerender(); })();
  }
  function build() {
    drawIngredients(); drawSummary();
    return [sheetHead('New recipe'), sheetBody([
      field('Recipe name', nameI),
      field('Icon', picker.node),
      el('div', { class: 'subhead' }, 'Categories'),
      catChecks.node,
      field('Makes (servings)', servingsI),
      el('div', { class: 'subhead' }, 'Ingredients'),
      ingBox,
      summary,
      el('button', { class: 'btn', style: { marginTop: '16px' }, onClick: saveRecipe }, 'Save recipe as food'),
    ])];
  }
  function openRecipeReopen() { openSheet(build()); }
  openRecipeReopen();
}

/* ---------- import ---------- */
function openImport() {
  const ta = el('textarea', { placeholder: 'Paste food JSON here\u2026' });
  const preview = el('div');
  function doPreview() {
    clear(preview);
    const res = parseImport(ta.value || '');
    if (!res.ok) {
      preview.appendChild(el('div', { class: 'muted' }, (res.errors[0] || 'Could not read that.')));
      return;
    }
    const f = res.food;
    const nCount = Object.keys(f.n).length;
    const catLabels = f.cats.map(k => catInfoOf(k).label).join(', ');
    preview.appendChild(el('div', { class: 'seclist' }, [
      el('div', { class: 'row' }, [el('div', { class: 'e', style: { fontSize: '26px' } }, f.emoji), el('div', { class: 'grow' }, [el('div', { style: { fontWeight: '600' } }, f.name), el('small', null, catLabels + ' \u00b7 ' + nCount + ' nutrients \u00b7 ' + (f.servings.length) + ' serving(s)')])]),
    ]));
    if (res.errors.length) preview.appendChild(el('div', { class: 'hint' }, res.errors.join(' ')));
    preview.appendChild(el('button', { class: 'btn', style: { marginTop: '10px' }, onClick: () => {
      const out = canonicalizeFood({ id: uid('f_'), name: f.name, emoji: f.emoji, cats: f.cats, per: f.per, n: f.n,
        servings: f.servings.length ? f.servings : [], src: 'import', uses: 0, lastUsed: 0 });
      (async () => { await saveFood(out); closeSheet(); toast('Imported \u201C' + f.name + '\u201D \u2014 long-press it any time to edit'); await rerender(); })();
    } }, 'Save imported food'));
  }
  openSheet([sheetHead('Import food'), sheetBody([
    el('div', { class: 'muted', style: { marginTop: '0', fontSize: '13px' } }, 'Paste JSON in the template format. Ask Claude in another chat to fill the template for any recipe or product.'),
    el('button', { class: 'btn ghost sm', onClick: async () => {
      try { await navigator.clipboard.writeText(importTemplate()); toast('Template copied'); }
      catch (e) { ta.value = importTemplate(); toast('Template placed in the box'); }
    } }, 'Copy template'),
    field('JSON', ta),
    el('button', { class: 'btn ghost', onClick: doPreview }, 'Preview'),
    preview,
  ])]);
}

/* ---------- Open Food Facts online search ---------- */
const OFF_MAP = {
  'energy-kcal_100g': ['kcal', 1], 'proteins_100g': ['protein', 1], 'carbohydrates_100g': ['carbs', 1],
  'sugars_100g': ['sugar', 1], 'fat_100g': ['fat', 1], 'saturated-fat_100g': ['satfat', 1], 'fiber_100g': ['fiber', 1],
  'sodium_100g': ['sodium', 1000], 'salt_100g': ['sodium', 393.7], /* salt g -> sodium mg (fallback) */
  'calcium_100g': ['calcium', 1000], 'iron_100g': ['iron', 1000], 'magnesium_100g': ['magnesium', 1000],
  'zinc_100g': ['zinc', 1000], 'potassium_100g': ['potassium', 1000], 'phosphorus_100g': ['phosphorus', 1000],
  'vitamin-c_100g': ['c', 1000], 'vitamin-a_100g': ['vita', 1000000], 'vitamin-d_100g': ['d', 1000000],
  'vitamin-e_100g': ['e', 1000], 'vitamin-b6_100g': ['b6', 1000], 'vitamin-b12_100g': ['b12', 1000000],
  'vitamin-b1_100g': ['b1', 1000], 'vitamin-b2_100g': ['b2', 1000], 'vitamin-b9_100g': ['b9', 1000000],
};
function mapOff(nutriments) {
  const n = {};
  if (!nutriments) return n;
  for (const [offKey, [our, mult]] of Object.entries(OFF_MAP)) {
    const raw = nutriments[offKey];
    if (raw != null && raw !== '') {
      const v = Number(raw);
      if (Number.isFinite(v) && v >= 0 && n[our] == null) n[our] = Math.round(v * mult * 1000) / 1000;
    }
  }
  return n;
}
/* Two endpoints: the new Search-a-licious API (CORS-friendly), then the
   classic cgi search as a fallback. */
async function offQuery(q) {
  const fields = 'product_name,brands,nutriments';
  try {
    const r = await fetch('https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q) +
      '&page_size=20&fields=' + fields);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const hits = data.hits || data.products || [];
    if (hits.length) return hits;
  } catch (e) { /* fall through to legacy endpoint */ }
  const r2 = await fetch('https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
    '&search_simple=1&action=process&json=1&page_size=20&fields=' + fields);
  if (!r2.ok) throw new Error('HTTP ' + r2.status);
  const data2 = await r2.json();
  return data2.products || [];
}
function openOffSearch(cat) {
  const input = el('input', { class: 'search', type: 'search', placeholder: 'Search products online\u2026' });
  const results = el('div', { class: 'servlist' });
  const status = el('div', { class: 'muted', style: { fontSize: '13px', padding: '4px 0' } });
  async function run() {
    const q = (input.value || '').trim();
    if (!q) return;
    status.textContent = 'Searching\u2026'; clear(results);
    try {
      const prods = (await offQuery(q)).filter(p => p.product_name && p.nutriments);
      status.textContent = prods.length ? '' : 'No results. Try different words, or add the food manually.';
      prods.forEach(p => {
        const nm = p.product_name + (p.brands ? (' \u00b7 ' + String(p.brands).split(',')[0]) : '');
        results.appendChild(el('div', { class: 'servopt', onClick: () => {
          const n = mapOff(p.nutriments);
          const food = canonicalizeFood({ id: uid('f_'), name: p.product_name, emoji: '\uD83C\uDF7D\uFE0F',
            cats: [cat || 'misc'], per: 'g', n, servings: [{ name: '100 g', grams: 100 }],
            src: 'off', uses: 0, lastUsed: 0 });
          (async () => { await saveFood(food); toast('Added \u2014 long-press it to edit categories or servings'); await rerender(); openServingSheet(food); })();
        } }, [el('span', null, nm), el('span', { class: 'g' }, (p.nutriments['energy-kcal_100g'] != null ? Math.round(p.nutriments['energy-kcal_100g']) + ' kcal/100g' : ''))]));
      });
    } catch (e) {
      status.textContent = 'Search failed (' + (e.message || 'network error') + '). If this keeps happening the food database may be temporarily down \u2014 you can add the food manually instead.';
    }
  }
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  openSheet([sheetHead('Search online'), sheetBody([
    el('div', { class: 'muted', style: { marginTop: '0', fontSize: '13px' } }, 'Looks up Open Food Facts. Values land per 100 g \u2014 check them and set a serving before logging.'),
    input,
    el('button', { class: 'btn ghost sm', onClick: run }, 'Search'),
    status, results,
  ])]);
}

/* ---------- manage foods ---------- */
function openManageFoods() {
  const tiles = el('div', { class: 'seclist' });
  function draw(filter) {
    clear(tiles);
    let list = State.foods.slice();
    if (filter) { const q = filter.toLowerCase(); list = list.filter(f => f.name.toLowerCase().includes(q)); }
    list.sort((a, b) => a.name.localeCompare(b.name));
    list.slice(0, 200).forEach(f => {
      tiles.appendChild(el('div', { class: 'row', onClick: () => openFoodEditor(f) }, [
        el('div', { class: 'e', style: { fontSize: '22px' } }, f.emoji || '\uD83C\uDF7D\uFE0F'),
        el('div', { class: 'grow' }, [el('div', { style: { fontWeight: '600', fontSize: '14px' } }, f.name),
          el('small', null, foodCats(f).map(k => catInfoOf(k).label).join(', ') + (f.src && f.src !== 'builtin' ? ' \u00b7 ' + f.src : ''))]),
        el('div', { class: 'tag' }, nVal('kcal', f.n.kcal || 0) + ' kcal'),
      ]));
    });
    if (!list.length) tiles.appendChild(el('div', { class: 'row' }, el('div', { class: 'muted' }, 'No matches.')));
  }
  const search = el('input', { class: 'search', type: 'search', placeholder: 'Search all foods\u2026', oninput: () => draw(search.value) });
  draw('');
  openSheet([sheetHead('Manage foods'), sheetBody([
    el('div', { class: 'pinned' }, [pin('\uFF0B Add food', () => openFoodEditor(null, 'misc'), true), pin('\uD83D\uDCD6 Recipe', () => openRecipeBuilder())]),
    search, tiles,
  ])]);
}

/* ---------- categories manager (universal, in Settings) ---------- */
function openCategories() {
  const dis = new Set(State.meta.disabledCats || []);
  const builtinBox = el('div');
  CATS.forEach(c => {
    const cb = el('input', { type: 'checkbox', checked: !dis.has(c.k) });
    cb.addEventListener('change', () => { cb.checked ? dis.delete(c.k) : dis.add(c.k); });
    builtinBox.appendChild(el('label', { class: 'check' }, [cb, el('span', null, c.emoji + ' ' + c.label)]));
  });

  const customBox = el('div');
  function drawCustom() {
    clear(customBox);
    const customs = State.meta.customCats || [];
    if (!customs.length) customBox.appendChild(el('div', { class: 'muted', style: { fontSize: '13px', padding: '4px 0' } }, 'No custom categories yet.'));
    customs.forEach(c => {
      customBox.appendChild(el('div', { class: 'row', style: { border: '1px solid var(--line)', borderRadius: '10px', marginBottom: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' } }, [
        el('span', { style: { fontSize: '20px' } }, c.emoji),
        el('span', { style: { flex: '1', fontWeight: '600', fontSize: '14px' } }, c.label),
        el('button', { class: 'iconbtn', 'aria-label': 'Remove', onClick: () => {
          confirmSheet({ title: 'Remove \u201C' + c.label + '\u201D?', body: 'Foods in it keep their other categories; any food only in this category moves to Misc.',
            danger: true, okLabel: 'Remove', onOk: async () => {
              State.meta.customCats = (State.meta.customCats || []).filter(x => x.k !== c.k);
              await saveMeta('customCats', State.meta.customCats);
              for (const f of State.foods) {
                if (foodInCat(f, c.k)) {
                  f.cats = foodCats(f).filter(k => k !== c.k);
                  if (!f.cats.length) f.cats = ['misc'];
                  await saveFood(f);
                }
              }
              if (State.currentCat === c.k) State.currentCat = 'diary';
              openCategories(); await rerender();
            } });
        } }, '\u2715'),
      ]));
    });
  }
  drawCustom();

  const newName = textInput({ placeholder: 'e.g. Breakfast, Lunch, Dinner' });
  const newPicker = emojiPicker('\uD83C\uDF71');

  openSheet([sheetHead('Categories'), sheetBody([
    el('div', { class: 'muted', style: { marginTop: '0', fontSize: '13px' } }, 'Applies to the whole app, for everyone.'),
    el('div', { class: 'subhead' }, 'Built-in tabs'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '6px' } }, 'Untick to hide a tab. Foods keep their categories, so re-ticking brings everything back.'),
    builtinBox,
    el('div', { class: 'subhead' }, 'Your categories'),
    customBox,
    field('New category name', newName),
    field('Icon', newPicker.node),
    el('button', { class: 'btn ghost sm', onClick: async () => {
      const label = (newName.value || '').trim();
      if (!label) { toast('Name the category'); return; }
      const c = { k: 'c_' + uid(''), label, emoji: newPicker.get() };
      State.meta.customCats = (State.meta.customCats || []).concat([c]);
      await saveMeta('customCats', State.meta.customCats);
      newName.value = '';
      drawCustom(); render();
      toast('Added \u2014 tick it on any food to use it');
    } }, '\uFF0B Add category'),
    el('button', { class: 'btn', style: { marginTop: '16px' }, onClick: async () => {
      State.meta.disabledCats = Array.from(dis);
      await saveMeta('disabledCats', State.meta.disabledCats);
      if (dis.has(State.currentCat)) State.currentCat = 'diary';
      closeSheet(); toast('Saved'); render();
    } }, 'Save'),
  ])]);
}

/* ---------- user editor ---------- */
function openUserEditor(existing) {
  const isNew = !existing;
  const u = existing ? JSON.parse(JSON.stringify(existing)) : newUser('');
  if (isNew) u.color = USER_COLORS[State.users.length % USER_COLORS.length];

  const nameI = textInput({ value: u.name, placeholder: 'Name' });
  const dobI = el('input', { type: 'date', value: u.dob || '', style: { width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: '11px', background: 'var(--surface)' } });
  const sexSel = el('select', null, [el('option', { value: 'm' }, 'Male'), el('option', { value: 'f' }, 'Female')]);
  sexSel.value = u.sex || 'm';
  const kcalI = numInput({ value: (u.kcalTarget != null ? u.kcalTarget : ''), step: '10', min: '0', placeholder: 'auto by age' });

  /* colour swatches */
  let color = u.color || USER_COLORS[0];
  const swatches = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });
  USER_COLORS.forEach(col => {
    const sw = el('button', { style: { width: '34px', height: '34px', borderRadius: '50%', background: col, border: col === color ? '3px solid var(--ink)' : '2px solid var(--line)' },
      onClick: () => { color = col; Array.from(swatches.children).forEach((b, i) => b.style.border = USER_COLORS[i] === color ? '3px solid var(--ink)' : '2px solid var(--line)'); } });
    swatches.appendChild(sw);
  });

  /* nutrient settings table — energy lives in the field above, so skip kcal here */
  const shown = new Set(u.shown && u.shown.length ? u.shown : DEFAULT_SHOWN);
  const starred = new Set(u.starred && u.starred.length ? u.starred : DEFAULT_STARRED);
  const limits = new Set(u.limits && u.limits.length ? u.limits : DEFAULT_LIMITS);
  const targetInputs = {};
  const nutrTable = el('div');
  NUTR.forEach(nt => {
    if (nt.k === 'kcal') return; /* single source of truth: the energy field above */
    const draft = { dob: dobI.value, sex: sexSel.value, kcalTarget: parseNum(kcalI.value, null), targets: u.targets || {} };
    const def = defaultTarget(nt.k, draft);
    const tgt = el('input', { class: 'tgt num', type: 'number', step: 'any', min: '0',
      value: (u.targets && u.targets[nt.k] != null ? u.targets[nt.k] : ''), placeholder: (def != null ? String(def) : '\u2014') });
    targetInputs[nt.k] = tgt;
    const showCb = el('input', { type: 'checkbox', checked: shown.has(nt.k) });
    showCb.addEventListener('change', () => { showCb.checked ? shown.add(nt.k) : shown.delete(nt.k); });
    const starBtn = el('button', { class: 'toggle ' + (starred.has(nt.k) ? 'on' : 'off') }, '\u2B50');
    starBtn.addEventListener('click', () => { starred.has(nt.k) ? starred.delete(nt.k) : starred.add(nt.k); starBtn.className = 'toggle ' + (starred.has(nt.k) ? 'on' : 'off'); });
    const limBtn = el('button', { class: 'toggle ' + (limits.has(nt.k) ? 'on' : 'off') }, '\uD83D\uDED1');
    limBtn.addEventListener('click', () => { limits.has(nt.k) ? limits.delete(nt.k) : limits.add(nt.k); limBtn.className = 'toggle ' + (limits.has(nt.k) ? 'on' : 'off'); });

    nutrTable.appendChild(el('div', { class: 'nutr-row' }, [
      el('div', { class: 'name' }, [nt.label, el('div', { class: 'hint' }, nt.unit)]),
      el('label', { class: 'check', title: 'Show on trends' }, [showCb]),
      starBtn, limBtn,
    ]));
    nutrTable.appendChild(el('div', { class: 'field2', style: { margin: '0 0 6px 2px', alignItems: 'center' } }, [
      el('div', { class: 'muted', style: { fontSize: '11px', flex: '1' } }, 'target / limit'),
      el('div', { style: { flex: '0 0 90px' } }, tgt),
    ]));
  });

  /* growth log */
  let measures = (u.measures || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const growthBox = el('div');
  function drawGrowth() {
    clear(growthBox);
    measures.forEach((m, i) => {
      growthBox.appendChild(el('div', { class: 'row', style: { borderRadius: '10px', border: '1px solid var(--line)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px' } }, [
        el('div', { style: { flex: '1' } }, [el('div', { style: { fontWeight: '600', fontSize: '14px' } }, m.date),
          el('small', { class: 'muted' }, (m.weightKg ? m.weightKg + ' kg' : '') + (m.weightKg && m.heightCm ? ' \u00b7 ' : '') + (m.heightCm ? m.heightCm + ' cm' : ''))]),
        el('button', { class: 'iconbtn', onClick: () => { measures.splice(i, 1); drawGrowth(); }, 'aria-label': 'Remove' }, '\u2715'),
      ]));
    });
    const dI = el('input', { type: 'date', value: todayStr(), style: { padding: '9px', border: '1px solid var(--line)', borderRadius: '9px' } });
    const wI = numInput({ placeholder: 'kg', step: 'any', min: '0', style: { width: '70px' } });
    const hI = numInput({ placeholder: 'cm', step: 'any', min: '0', style: { width: '70px' } });
    growthBox.appendChild(el('div', { class: 'field2', style: { alignItems: 'center', marginTop: '6px' } }, [
      el('div', { style: { flex: '2' } }, dI), el('div', null, wI), el('div', null, hI),
      el('button', { class: 'btn ghost sm', style: { flex: '0 0 auto', width: 'auto', padding: '9px 12px' }, onClick: () => {
        const w = parseNum(wI.value, null), h = parseNum(hI.value, null);
        if (w == null && h == null) { toast('Enter weight or height'); return; }
        measures.push({ date: dI.value || todayStr(), weightKg: w, heightCm: h });
        measures.sort((a, b) => (a.date < b.date ? 1 : -1));
        drawGrowth();
      } }, 'Add'),
    ]));
  }
  drawGrowth();

  function save() {
    const name = (nameI.value || '').trim();
    if (!name) { toast('Enter a name'); return; }
    const targets = {};
    for (const k of Object.keys(targetInputs)) { const v = targetInputs[k].value; if (v !== '' && v != null && Number.isFinite(Number(v))) targets[k] = Number(v); }
    const out = Object.assign({}, u, {
      name, dob: dobI.value || '', sex: sexSel.value, color,
      kcalTarget: kcalI.value !== '' ? parseNum(kcalI.value, null) : null,
      targets,
      shown: NUTR.filter(nt => shown.has(nt.k)).map(nt => nt.k),
      starred: NUTR.filter(nt => starred.has(nt.k)).map(nt => nt.k),
      limits: NUTR.filter(nt => limits.has(nt.k)).map(nt => nt.k),
      measures,
    });
    (async () => {
      await saveUser(out);
      if (isNew) { State.currentUserId = out.id; await saveMeta('currentUserId', out.id); }
      closeSheet(); toast('Saved'); await rerender();
    })();
  }
  function removeUser() {
    if (State.users.length <= 1) { toast('Keep at least one person'); return; }
    confirmSheet({ title: 'Delete ' + u.name + '?', body: 'Their diary entries stay in the database but become hidden.', danger: true, okLabel: 'Delete',
      onOk: async () => {
        await dbDel('users', u.id);
        State.users = State.users.filter(x => x.id !== u.id);
        if (State.currentUserId === u.id) { State.currentUserId = State.users[0].id; await saveMeta('currentUserId', State.currentUserId); }
        closeSheet(); toast('Deleted'); await rerender();
      } });
  }

  openSheet([sheetHead(isNew ? 'Add person' : 'Edit ' + (u.name || 'person')), sheetBody([
    field('Name', nameI),
    el('div', { class: 'field2' }, [field('Date of birth', dobI), field('Sex', sexSel)]),
    field('Daily energy target (kcal)', kcalI, 'Blank = estimate from age. This is the only place to set it.'),
    field('Colour', swatches),
    el('div', { class: 'subhead' }, 'Nutrients'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '6px' } }, 'Checkbox = show on trends. \u2B50 = bar on the day screen. \uD83D\uDED1 = treat as an upper limit (red when over). Blank target = auto by age/sex.'),
    nutrTable,
    el('div', { class: 'subhead' }, 'Growth log'),
    growthBox,
    el('button', { class: 'btn', style: { marginTop: '16px' }, onClick: save }, isNew ? 'Add person' : 'Save'),
    !isNew ? el('button', { class: 'btn danger', style: { marginTop: '8px' }, onClick: removeUser }, 'Delete person') : null,
  ])]);
}

/* ---------- trends ---------- */
function openTrends() {
  const u = currentUser();
  let mode = 'today';
  const body = el('div');
  function draw() {
    clear(body);
    const shown = (u.shown && u.shown.length) ? u.shown : DEFAULT_SHOWN;
    if (mode === 'today') {
      const totals = totalsFor(curEntries);
      body.appendChild(el('div', { class: 'muted', style: { fontSize: '12px', margin: '2px 0 8px' } }, 'Totals for ' + prettyDate(State.currentDate).main.toLowerCase()));
      const bars = el('div', { class: 'bars' });
      shown.forEach(k => { if (NUTR_BY_KEY[k]) bars.appendChild(nutrientBar(k, totals[k] || 0, targetFor(k, u), isLimitFor(k, u), null)); });
      body.appendChild(bars);
    } else {
      const days = mode === '7' ? 7 : 30;
      body.appendChild(el('div', { class: 'muted', style: { fontSize: '12px', margin: '2px 0 8px' } }, 'Loading\u2026'));
      trendAverages(u.id, days).then(r => {
        clear(body);
        body.appendChild(el('div', { class: 'muted', style: { fontSize: '12px', margin: '2px 0 8px' } },
          r.loggedCount ? ('Average over ' + r.loggedCount + ' logged day' + (r.loggedCount === 1 ? '' : 's') + ' (last ' + days + ')') : 'No days logged in the last ' + days + ' days.'));
        const bars = el('div', { class: 'bars' });
        shown.forEach(k => { if (NUTR_BY_KEY[k]) bars.appendChild(nutrientBar(k, r.avg[k] || 0, targetFor(k, u), isLimitFor(k, u), null)); });
        body.appendChild(bars);
      });
    }
  }
  const pills = el('div', { class: 'pillrow' });
  [['today', 'Today'], ['7', '7-day avg'], ['30', '30-day avg']].forEach(([m, lbl]) => {
    const b = el('button', { class: mode === m ? 'sel' : '', onClick: () => { mode = m; Array.from(pills.children).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); draw(); } }, lbl);
    pills.appendChild(b);
  });
  draw();
  openSheet([sheetHead('Trends'), sheetBody([pills, body])]);
}

/* ---------- settings ---------- */
function timeStyleObj() { return { width: '100%', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: '11px', background: 'var(--surface)' }; }
function openSettings() {
  const times = (State.meta.backupTimes || ['06:00', '20:00']).slice();
  const t1 = el('input', { type: 'time', value: times[0] || '06:00', style: timeStyleObj() });
  const t2 = el('input', { type: 'time', value: times[1] || '20:00', style: timeStyleObj() });
  const fileInp = el('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' } });
  fileInp.addEventListener('change', () => {
    const file = fileInp.files && fileInp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let obj; try { obj = JSON.parse(reader.result); } catch (e) { toast('Not a valid backup file'); return; }
      confirmSheet({ title: 'Restore this backup?', body: 'It replaces all current foods, people and diary entries.', danger: true, okLabel: 'Restore',
        onOk: async () => { try { await restoreData(obj); State.currentCat = 'diary'; closeSheet(); toast('Restored'); await rerender(); } catch (e) { toast(e.message || 'Restore failed'); } } });
    };
    reader.readAsText(file);
  });

  const snapBox = el('div');
  function drawSnaps() {
    clear(snapBox);
    listSnapshots().then(rows => {
      if (!rows.length) { snapBox.appendChild(el('div', { class: 'muted', style: { fontSize: '13px' } }, 'No internal snapshots yet.')); return; }
      const list = el('div', { class: 'seclist' });
      rows.forEach(r => {
        const when = new Date(r.at || 0);
        const lbl = (r.date || '') + ' \u00b7 ' + when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        list.appendChild(el('div', { class: 'row' }, [
          el('div', { class: 'grow' }, [el('div', { style: { fontWeight: '600', fontSize: '14px' } }, lbl),
            el('small', null, (r.data && r.data.entries ? r.data.entries.length : 0) + ' entries')]),
          el('button', { class: 'btn ghost sm', style: { width: 'auto', padding: '8px 12px' }, onClick: () => {
            confirmSheet({ title: 'Restore this snapshot?', body: 'Replaces current data.', danger: true, okLabel: 'Restore',
              onOk: async () => { try { await restoreData(r.data); State.currentCat = 'diary'; closeSheet(); toast('Restored'); await rerender(); } catch (e) { toast('Restore failed'); } } });
          } }, 'Restore'),
        ]));
      });
      snapBox.appendChild(list);
    });
  }
  drawSnaps();

  openSheet([sheetHead('Settings'), sheetBody([
    el('div', { class: 'subhead', style: { marginTop: '0' } }, 'Categories'),
    el('button', { class: 'btn ghost', onClick: openCategories }, '\uD83D\uDDC2 Edit categories (tabs)'),
    el('div', { class: 'subhead' }, 'Backup reminders'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '8px' } }, 'When you open TrackFood after one of these times and haven\u2019t backed up that window yet, it offers a download.'),
    el('div', { class: 'field2' }, [field('Time 1', t1), field('Time 2', t2)]),
    el('button', { class: 'btn sm', onClick: async () => { await saveMeta('backupTimes', [t1.value || '06:00', t2.value || '20:00']); toast('Saved'); } }, 'Save reminder times'),
    el('div', { class: 'subhead' }, 'Backup & restore'),
    el('button', { class: 'btn', onClick: doDownload }, 'Download backup now'),
    el('button', { class: 'btn ghost', style: { marginTop: '8px' }, onClick: () => fileInp.click() }, 'Restore from a file'),
    fileInp,
    el('div', { class: 'subhead' }, 'Internal snapshots'),
    el('div', { class: 'hint', style: { marginTop: '-4px', marginBottom: '8px' } }, 'Three automatic copies kept inside the app as a safety net.'),
    snapBox,
  ])]);
}

/* ---------- menu ---------- */
function seclistRow(emoji, label, onClick) {
  return el('div', { class: 'row', onClick }, [
    el('div', { style: { fontSize: '20px', width: '26px', textAlign: 'center' } }, emoji),
    el('div', { class: 'grow', style: { fontWeight: '600', fontSize: '15px' } }, label),
    el('div', { class: 'muted' }, '\u203a'),
  ]);
}
function openMenu() {
  const u = currentUser();
  openSheet([sheetHead('Menu'), sheetBody([
    el('div', { class: 'seclist' }, [
      seclistRow('\uD83D\uDC64', 'Edit ' + (u ? u.name : 'person'), () => openUserEditor(u)),
      seclistRow('\u2795', 'Add person', () => openUserEditor(null)),
      seclistRow('\uD83D\uDCC8', 'Trends', openTrends),
      seclistRow('\uD83C\uDF7D\uFE0F', 'Manage foods', openManageFoods),
      seclistRow('\uD83D\uDDC2', 'Categories', openCategories),
      seclistRow('\uD83D\uDCBE', 'Download backup', doDownload),
      seclistRow('\u2699\uFE0F', 'Settings', openSettings),
    ]),
    el('div', { class: 'muted center', style: { fontSize: '12px', marginTop: '10px' } }, 'TrackFood \u00b7 everything stays on this device'),
  ])]);
}

/* ---------- backup actions ---------- */
async function doDownload() {
  try {
    const data = await exportData();
    downloadBackup(data);
    await autoSnapshot();
    if (backupWindowDue >= 0) { await markBackupDone(backupWindowDue); backupWindowDue = -1; }
    toast('Backup downloaded');
    render();
  } catch (e) { toast('Backup failed'); }
}

/* ---------- boot ---------- */
async function boot() {
  try {
    await initStore();
  } catch (e) {
    $('#app').appendChild(el('div', { style: { padding: '24px' } }, 'Could not open local storage: ' + (e.message || e)));
    return;
  }
  State.currentCat = 'diary';
  State.currentDate = todayStr();
  if (navigator.storage && navigator.storage.persist) { try { await navigator.storage.persist(); } catch (e) {} }
  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('sw.js'); } catch (e) {} }
  try { await autoSnapshot(); } catch (e) {}
  backupWindowDue = shouldPromptBackup();
  await rerender();
}
boot();

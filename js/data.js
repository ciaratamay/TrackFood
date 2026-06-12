/* ===== Nibble: data definitions (no DOM access in this file) ===== */
'use strict';

/* Nutrient registry. Values are always stored per 100 g (or 100 ml for liquids). */
const NUTR = [
  { k:'kcal',      label:'Energy',        unit:'kcal' },
  { k:'protein',   label:'Protein',       unit:'g' },
  { k:'carbs',     label:'Carbohydrate',  unit:'g' },
  { k:'fat',       label:'Fat',           unit:'g' },
  { k:'satfat',    label:'Saturated fat', unit:'g' },
  { k:'monofat',   label:'Monounsat. fat',unit:'g' },
  { k:'polyfat',   label:'Polyunsat. fat',unit:'g' },
  { k:'omega3',    label:'Omega-3 (ALA)', unit:'g' },
  { k:'chol',      label:'Cholesterol',   unit:'mg' },
  { k:'sugar',     label:'Sugar',         unit:'g' },
  { k:'fiber',     label:'Fibre',         unit:'g' },
  { k:'vita',      label:'Vitamin A',     unit:'µg' },
  { k:'b1',        label:'Vitamin B1',    unit:'mg' },
  { k:'b2',        label:'Vitamin B2',    unit:'mg' },
  { k:'b3',        label:'Vitamin B3',    unit:'mg' },
  { k:'b5',        label:'Vitamin B5',    unit:'mg' },
  { k:'b6',        label:'Vitamin B6',    unit:'mg' },
  { k:'b9',        label:'Folate (B9)',   unit:'µg' },
  { k:'b12',       label:'Vitamin B12',   unit:'µg' },
  { k:'c',         label:'Vitamin C',     unit:'mg' },
  { k:'d',         label:'Vitamin D',     unit:'µg' },
  { k:'e',         label:'Vitamin E',     unit:'mg' },
  { k:'vitk',      label:'Vitamin K',     unit:'µg' },
  { k:'choline',   label:'Choline',       unit:'mg' },
  { k:'calcium',   label:'Calcium',       unit:'mg' },
  { k:'iron',      label:'Iron',          unit:'mg' },
  { k:'magnesium', label:'Magnesium',     unit:'mg' },
  { k:'zinc',      label:'Zinc',          unit:'mg' },
  { k:'potassium', label:'Potassium',     unit:'mg' },
  { k:'sodium',    label:'Sodium',        unit:'mg' },
  { k:'phosphorus',label:'Phosphorus',    unit:'mg' },
  { k:'copper',    label:'Copper',        unit:'mg' },
  { k:'manganese', label:'Manganese',     unit:'mg' },
  { k:'selenium',  label:'Selenium',      unit:'µg' },
  { k:'iodine',    label:'Iodine',        unit:'µg' },
];
const NUTR_BY_KEY = Object.fromEntries(NUTR.map(n => [n.k, n]));

/* Sensible defaults for a new user */
const DEFAULT_SHOWN   = ['kcal','protein','carbs','fat','sugar','fiber','vita','b9','b12','c','d','e','calcium','iron','magnesium','zinc','potassium','sodium','selenium','iodine'];
const DEFAULT_STARRED = ['kcal','fiber','calcium','iron','d'];
const DEFAULT_LIMITS  = ['sugar','sodium'];

/* Categories */
const CATS = [
  { k:'fruit',         label:'Fruit',           emoji:'🍎', color:'#D95D5D' },
  { k:'veg',           label:'Vegetables',      emoji:'🥦', color:'#5A9E69' },
  { k:'grains',        label:'Grains',          emoji:'🍞', color:'#C99A3C' },
  { k:'meat_fish',     label:'Meat & fish',     emoji:'🍗', color:'#BF7048' },
  { k:'dairy',         label:'Dairy',           emoji:'🧀', color:'#6E97C9' },
  { k:'misc',          label:'Misc',            emoji:'🍪', color:'#9A78C4' },
];
/* Categories that exist as food types but are reached via pinned buttons, not the rail */
const EXTRA_CATS = [
  { k:'sauce_savoury', label:'Sauce (savoury)', emoji:'🥫', color:'#A85C7E' },
  { k:'sauce_sweet',   label:'Sauce (sweet)',   emoji:'🍯', color:'#C98A3C' },
  { k:'condiment',     label:'Oils & condiments', emoji:'🫒', color:'#8A8A6A' },
];
const ALL_CATS = CATS.concat(EXTRA_CATS);
const CAT_BY_KEY = Object.fromEntries(ALL_CATS.map(c => [c.k, c]));

/* Default calorie targets by age band (kcal/day, rough midpoints, always overridable) */
const KCAL_DEFAULT = { '1-3':1200, '4-6':1500, '7-10':1800, '11-14':2200, '15-17':2400, 'adult':2000 };

/* EFSA dietary reference values (PRI or AI) by age band.
   Where male/female differ, value is {m:..., f:...}. These are starting
   defaults only; every target can be overridden per user. */
const RDA = {
  protein:   { '1-3':13,  '4-6':18,  '7-10':25,  '11-14':42,  '15-17':{m:52,f:45}, 'adult':{m:56,f:46} },
  fiber:     { '1-3':10,  '4-6':14,  '7-10':16,  '11-14':19,  '15-17':21,  'adult':25 },
  vita:      { '1-3':250, '4-6':300, '7-10':400, '11-14':600, '15-17':{m:750,f:650}, 'adult':{m:750,f:650} },
  b1:        { '1-3':0.5, '4-6':0.6, '7-10':0.7, '11-14':0.9, '15-17':1.1, 'adult':1.1 },
  b2:        { '1-3':0.6, '4-6':0.7, '7-10':1.0, '11-14':1.4, '15-17':1.6, 'adult':1.6 },
  b3:        { '1-3':7,   '4-6':9,   '7-10':11,  '11-14':14,  '15-17':16,  'adult':16 },
  b5:        { '1-3':4,   '4-6':4,   '7-10':4,   '11-14':5,   '15-17':5,   'adult':5 },
  b6:        { '1-3':0.6, '4-6':0.7, '7-10':1.0, '11-14':1.4, '15-17':{m:1.7,f:1.6}, 'adult':{m:1.7,f:1.6} },
  b9:        { '1-3':120, '4-6':140, '7-10':200, '11-14':270, '15-17':330, 'adult':330 },
  b12:       { '1-3':1.5, '4-6':1.5, '7-10':2.5, '11-14':3.5, '15-17':4,   'adult':4 },
  c:         { '1-3':20,  '4-6':30,  '7-10':45,  '11-14':70,  '15-17':{m:100,f:90}, 'adult':{m:110,f:95} },
  d:         { '1-3':15,  '4-6':15,  '7-10':15,  '11-14':15,  '15-17':15,  'adult':15 },
  e:         { '1-3':6,   '4-6':9,   '7-10':9,   '11-14':13,  '15-17':{m:13,f:11}, 'adult':{m:13,f:11} },
  vitk:      { '1-3':12,  '4-6':20,  '7-10':30,  '11-14':45,  '15-17':65,  'adult':70 },
  choline:   { '1-3':140, '4-6':170, '7-10':250, '11-14':340, '15-17':400, 'adult':400 },
  calcium:   { '1-3':450, '4-6':800, '7-10':800, '11-14':1150,'15-17':1150,'adult':950 },
  iron:      { '1-3':7,   '4-6':7,   '7-10':11,  '11-14':{m:11,f:13}, '15-17':{m:11,f:13}, 'adult':{m:11,f:16} },
  magnesium: { '1-3':170, '4-6':230, '7-10':230, '11-14':{m:300,f:250}, '15-17':{m:300,f:250}, 'adult':{m:350,f:300} },
  zinc:      { '1-3':4.3, '4-6':5.5, '7-10':7.4, '11-14':10.7,'15-17':{m:14.2,f:11.9}, 'adult':{m:9.4,f:7.5} },
  potassium: { '1-3':800, '4-6':1100,'7-10':1800,'11-14':2700,'15-17':3500,'adult':3500 },
  sodium:    { '1-3':1100,'4-6':1300,'7-10':1700,'11-14':2000,'15-17':2000,'adult':2000 },
  phosphorus:{ '1-3':250, '4-6':440, '7-10':440, '11-14':640, '15-17':640, 'adult':550 },
  copper:    { '1-3':0.7, '4-6':1.0, '7-10':1.0, '11-14':1.3, '15-17':1.3, 'adult':{m:1.6,f:1.3} },
  manganese: { '1-3':0.5, '4-6':1.0, '7-10':1.5, '11-14':2.0, '15-17':2.0, 'adult':3.0 },
  selenium:  { '1-3':15,  '4-6':20,  '7-10':35,  '11-14':55,  '15-17':70,  'adult':70 },
  iodine:    { '1-3':90,  '4-6':90,  '7-10':90,  '11-14':120, '15-17':130, 'adult':150 },
};

function ageYears(dobStr, onDate) {
  if (!dobStr) return 30;
  const dob = new Date(dobStr + 'T00:00:00');
  const ref = onDate ? new Date(onDate + 'T00:00:00') : new Date();
  let y = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) y--;
  return Math.max(0, y);
}
function ageBand(years) {
  if (years <= 3)  return '1-3';
  if (years <= 6)  return '4-6';
  if (years <= 10) return '7-10';
  if (years <= 14) return '11-14';
  if (years <= 17) return '15-17';
  return 'adult';
}
/* Default target for a nutrient given user profile. Returns null when no default applies. */
function defaultTarget(key, user) {
  const band = ageBand(ageYears(user.dob));
  const sexKey = user.sex === 'f' ? 'f' : 'm';
  const kcal = user.kcalTarget || KCAL_DEFAULT[band];
  switch (key) {
    case 'kcal':   return kcal;
    case 'carbs':  return Math.round(kcal * 0.50 / 4);   /* 50 % energy */
    case 'fat':    return Math.round(kcal * 0.35 / 9);   /* 35 % energy */
    case 'satfat': return Math.round(kcal * 0.10 / 9);   /* <10 % energy */
    case 'sugar':  return Math.round(kcal * 0.10 / 4);   /* free sugars <10 % energy (WHO) */
    case 'omega3': return Math.round(kcal * 0.005 / 9 * 10) / 10; /* ALA 0.5 % energy */
    default: {
      const row = RDA[key];
      if (!row) return null;
      let v = row[band];
      if (v && typeof v === 'object') v = v[sexKey];
      return v ?? null;
    }
  }
}
/* Resolved target: user override wins, otherwise the computed default. */
function targetFor(key, user) {
  if (user.targets && user.targets[key] != null && user.targets[key] !== '') {
    const v = Number(user.targets[key]);
    return Number.isFinite(v) ? v : null;
  }
  return defaultTarget(key, user);
}

/* Import template keys -> internal keys */
const IMPORT_KEYS = {
  energy_kcal:'kcal', protein_g:'protein', carbs_g:'carbs', fat_g:'fat',
  satfat_g:'satfat', monofat_g:'monofat', polyfat_g:'polyfat', omega3_g:'omega3',
  cholesterol_mg:'chol', sugar_g:'sugar', fiber_g:'fiber',
  vitamin_a_ug:'vita', vitamin_b1_mg:'b1', vitamin_b2_mg:'b2', vitamin_b3_mg:'b3',
  vitamin_b5_mg:'b5', vitamin_b6_mg:'b6', folate_ug:'b9', vitamin_b12_ug:'b12',
  vitamin_c_mg:'c', vitamin_d_ug:'d', vitamin_e_mg:'e', vitamin_k_ug:'vitk',
  choline_mg:'choline', calcium_mg:'calcium', iron_mg:'iron', magnesium_mg:'magnesium',
  zinc_mg:'zinc', potassium_mg:'potassium', sodium_mg:'sodium', phosphorus_mg:'phosphorus',
  copper_mg:'copper', manganese_mg:'manganese', selenium_ug:'selenium', iodine_ug:'iodine',
};
const IMPORT_CATS = ['fruit','veg','grains','meat_fish','dairy','misc','sauce_savoury','sauce_sweet','condiment'];

function importTemplate() {
  const nut = {};
  for (const k of Object.keys(IMPORT_KEYS)) nut[k] = 0;
  return JSON.stringify({
    name: 'Food name',
    category: 'grains  (one of: ' + IMPORT_CATS.join(', ') + ')',
    emoji: '🍽️',
    per: '100g  (or 100ml for liquids)',
    servings: [ { name: '1 portion', grams: 150 } ],
    nutrients: nut,
  }, null, 2);
}

/* Parse + validate pasted import JSON. Returns {ok, food?, errors[]} */
function parseImport(text) {
  const errors = [];
  let obj;
  try { obj = JSON.parse(text); }
  catch (e) { return { ok:false, errors:['Not valid JSON: ' + e.message] }; }
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return { ok:false, errors:['Expected a single JSON object.'] };
  }
  const name = String(obj.name || '').trim();
  if (!name) errors.push('Missing "name".');
  let cat = String(obj.category || '').trim().toLowerCase().split(/[\s(]/)[0];
  if (!IMPORT_CATS.includes(cat)) { errors.push('Unknown category "' + (obj.category||'') + '" — using misc.'); cat = 'misc'; }
  const per = String(obj.per || '100g').includes('ml') ? 'ml' : 'g';
  const emoji = (typeof obj.emoji === 'string' && obj.emoji.trim()) ? obj.emoji.trim() : '🍽️';
  const n = {};
  const src = obj.nutrients || {};
  for (const [tk, ik] of Object.entries(IMPORT_KEYS)) {
    if (src[tk] != null && src[tk] !== '') {
      const v = Number(src[tk]);
      if (Number.isFinite(v) && v >= 0) { if (v > 0) n[ik] = v; }
      else errors.push('Ignored non-numeric value for ' + tk + '.');
    }
  }
  if (src.energy_kcal != null && n.kcal == null) n.kcal = 0; /* keep explicit zero kcal */
  const servings = [];
  if (Array.isArray(obj.servings)) {
    for (const s of obj.servings) {
      const g = Number(s && s.grams);
      const sn = String((s && s.name) || '').trim();
      if (sn && Number.isFinite(g) && g > 0) servings.push({ name: sn, grams: g });
      else errors.push('Skipped an invalid serving entry.');
    }
  }
  if (!name) return { ok:false, errors };
  return { ok:true, errors, food: { name, cat, emoji, per, n, servings, src:'import' } };
}

/* Emoji library for the picker (includes generic plates/bowls for custom foods) */
const EMOJI_LIB = (
  '🍽️ 🥘 🍲 🥣 🍱 🫕 🥡 🍛 🍜 🥧 🥪 🌯 🌮 🫔 🥙 🧆 🍔 🍕 🌭 🍟 ' +
  '🍎 🍏 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🫒 🍋‍🟩 ' +
  '🥦 🥕 🌽 🥔 🍠 🥒 🥬 🥗 🍆 🫑 🧅 🧄 🍄 🫘 🌶️ 🥑 🎃 🫛 ' +
  '🍞 🥖 🥨 🥯 🥐 🫓 🥞 🧇 🍚 🍝 🍙 🍘 🥟 🍢 ' +
  '🍗 🍖 🥩 🥓 🍤 🐟 🐠 🦐 🦀 🍣 🥚 🍳 🧈 ' +
  '🥛 🧀 🍦 🍨 🍧 🍮 🥤 🧋 🍼 ' +
  '🍪 🍩 🍰 🎂 🧁 🍫 🍬 🍭 🍡 🍯 🥜 🌰 🍿 🧂 🥫 🍶 🫙 💊 🧃 ☕ 🫖 🧉 🥧'
).split(' ').filter(Boolean);

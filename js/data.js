/* ===== TrackFood: data definitions (no DOM access in this file) ===== */
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

/* Rail categories (built in; each can be hidden via Settings, and users can add custom ones).
   'sauces' is a grouped tab that shows the EXTRA_CATS below under headings. */
const CATS = [
  { k:'fruit',     label:'Fruit',       emoji:'🍎' },
  { k:'veg',       label:'Vegetables',  emoji:'🥦' },
  { k:'grains',    label:'Grains',      emoji:'🍞' },
  { k:'meat_fish', label:'Meat & fish', emoji:'🍗' },
  { k:'dairy',     label:'Dairy',       emoji:'🧀' },
  { k:'nuts',      label:'Nuts & seeds',emoji:'🥜' },
  { k:'drinks',    label:'Drinks',      emoji:'🥤' },
  { k:'sauces',    label:'Sauces',      emoji:'🥫', grouped:true },
  { k:'treats',    label:'Treats',      emoji:'🍪' },
  { k:'misc',      label:'Misc',        emoji:'🍱' },
];
/* Sauce/topping groups: shown under the Sauces tab and used for per-food
   "prompt to add" follow-ups. */
const EXTRA_CATS = [
  { k:'sauce_savoury', label:'Savoury sauces', emoji:'🥫' },
  { k:'sauce_sweet',   label:'Sweet sauces',   emoji:'🍯' },
  { k:'condiment',     label:'Condiments',     emoji:'🧂' },
  { k:'spread',        label:'Spreads',        emoji:'🫙' },
  { k:'oil',           label:'Oils',           emoji:'🫒' },
];
const ALL_CATS = CATS.concat(EXTRA_CATS);
const CAT_BY_KEY = Object.fromEntries(ALL_CATS.map(c => [c.k, c]));
/* keys a food may belong to (everything except the grouped 'sauces' pseudo-tab) */
const FOOD_CAT_KEYS = ALL_CATS.filter(c => !c.grouped).map(c => c.k);

/* Recategorisation of built-in foods (applied on seed + on upgrade of existing
   installs). name (lowercase) -> cats array. Unlisted foods keep their cat. */
const CAT_REMAP = {
  /* nuts & seeds (out of misc) */
  'almonds (ground)':['nuts'], 'cashews':['nuts'], 'walnuts':['nuts'], 'pistachios':['nuts'],
  'chia seeds':['nuts'], 'sunflower seeds':['nuts'], 'trail mix':['nuts'],
  'peanut butter':['nuts','spread'],
  /* treats (out of misc/dairy) */
  'chocolate (milk)':['treats'], 'chocolate buttons':['treats'], 'crisps':['treats'],
  'digestive biscuit':['treats'], 'flapjack':['treats'], 'gummy sweets':['treats'],
  'jelly':['treats'], 'marshmallows':['treats'], 'muffin (blueberry)':['treats'],
  'plain biscuit (rich tea)':['treats'], 'cereal bar':['treats'], 'yoghurt-coated raisins':['treats'],
  'doughnut (sugared)':['treats'], 'brownie':['treats'], 'fruit pastilles':['treats'],
  'scone':['treats'], 'popcorn (plain)':['treats'],
  'ice cream (vanilla)':['dairy','treats'], 'frozen yoghurt':['dairy','treats'],
  /* drinks (milks stay visible in dairy too) */
  'milk (whole)':['dairy','drinks'], 'milk (semi-skimmed)':['dairy','drinks'], 'milk (skimmed)':['dairy','drinks'],
  'oat milk':['dairy','drinks'], 'almond milk':['dairy','drinks'], 'soy milk':['dairy','drinks'],
  'yoghurt drink':['dairy','drinks'], 'milkshake':['drinks'],
  'fruit juice (orange)':['drinks'], 'smoothie (kids carton)':['drinks'], 'squash (diluted)':['drinks'],
  'hot chocolate (made w/ milk)':['drinks'], 'water':['drinks'],
  /* spreads */
  'jam':['spread'], 'strawberry jam':['spread'], 'honey':['spread','sauce_sweet'],
  'chocolate hazelnut spread':['spread','sauce_sweet'], 'lemon curd':['spread'],
  'yeast extract (marmite)':['spread'], 'butter (salted)':['dairy','spread'],
  /* oils (out of condiment) */
  'olive oil (evoo)':['oil'], 'rapeseed oil':['oil'], 'sunflower oil':['oil'],
  'vegetable oil':['oil'], 'coconut oil':['oil'], 'sesame oil':['oil'],
};

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
const IMPORT_CATS = FOOD_CAT_KEYS.slice();

function importTemplate() {
  const nut = {};
  for (const k of Object.keys(IMPORT_KEYS)) nut[k] = 0;
  return JSON.stringify({
    name: 'Food name',
    categories: ['grains'],
    categories_available: IMPORT_CATS,
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
  /* accept categories:[..] (new) or category:'..' (old) */
  let rawCats = Array.isArray(obj.categories) ? obj.categories : [obj.category];
  let cats = rawCats
    .map(c => String(c || '').trim().toLowerCase().split(/[\s(]/)[0])
    .filter(c => IMPORT_CATS.includes(c));
  if (!cats.length) { errors.push('No valid category — using misc.'); cats = ['misc']; }
  cats = Array.from(new Set(cats));
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
  return { ok:true, errors, food: { name, cats, emoji, per, n, servings, src:'import' } };
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

/* EU Nutrient Reference Values (Reg. 1169/2011, Annex XIII), in each nutrient's
   stored unit. Used to let people enter a label's "%NRV" and convert to an amount.
   Only nutrients with an official NRV are listed; macros/energy have none here. */
const NRV = {
  c: 80, iron: 14, calcium: 800, magnesium: 375, zinc: 10, potassium: 2000,
  phosphorus: 700, copper: 1, manganese: 2, selenium: 55, iodine: 150,
  vita: 800, d: 5, e: 12, vitk: 75,
  b1: 1.1, b2: 1.4, b3: 16, b5: 6, b6: 1.4, b9: 200, b12: 2.5,
};

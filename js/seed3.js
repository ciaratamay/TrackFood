/* ===== TrackFood: seed foods batch 3 (appended to SEED_FOODS) =====
   More sweet/savoury sauces and common child staples.
   Values per 100 g/ml from CoFID / USDA typical figures. */
'use strict';

(function () {
  let id = 0;
  function f(name, cat, emoji, per, n, servings) {
    return { id: 'seed3_' + (id++), name, cat, emoji, per: per || 'g',
      n: n || {}, servings: servings || [], src: 'builtin', uses: 0, lastUsed: 0 };
  }
  const S = (name, grams) => ({ name, grams });
  const rows = [];
  const add = (...r) => { for (const x of r) rows.push(x); };

  /* ---------- SWEET SAUCES ---------- */
  add(
    f('Chocolate hazelnut spread','sauce_sweet','🍫','g',
      {kcal:539,protein:6.3,carbs:57.5,fat:30.9,satfat:10.6,sugar:56.3,fiber:3.4,calcium:108,iron:4},
      [S('1 tsp',7),S('1 tbsp',20)]),
    f('Strawberry jam','sauce_sweet','🍓','g',
      {kcal:250,protein:0.4,carbs:62,fat:0.1,sugar:60,fiber:1,c:3},
      [S('1 tsp',7),S('1 tbsp',20)]),
    f('Lemon curd','sauce_sweet','🍋','g',
      {kcal:300,protein:1.5,carbs:60,fat:5,satfat:2,sugar:55},
      [S('1 tsp',7),S('1 tbsp',20)]),
    f('Caramel / toffee sauce','sauce_sweet','🍯','g',
      {kcal:389,protein:1.5,carbs:65,fat:14,satfat:9,sugar:58,calcium:60},
      [S('1 tsp',7),S('1 tbsp',20)]),
    f('Strawberry sauce','sauce_sweet','🍓','g',
      {kcal:130,protein:0.6,carbs:32,fat:0.1,sugar:28,fiber:1,c:20},
      [S('1 tbsp',20)]),
    f('Apple sauce','sauce_sweet','🍎','g',
      {kcal:60,protein:0.2,carbs:14,fat:0.1,sugar:12,fiber:1,c:1},
      [S('1 tbsp',20)]),
  );

  /* ---------- SAVOURY SAUCES ---------- */
  add(
    f('BBQ sauce','sauce_savoury','🍖','g',
      {kcal:172,protein:0.8,carbs:41,fat:0.6,sugar:33,sodium:815},
      [S('1 tbsp',17)]),
    f('Brown sauce','sauce_savoury','🟤','g',
      {kcal:120,protein:1.1,carbs:27,fat:0.1,sugar:23,sodium:800},
      [S('1 tbsp',17)]),
    f('Sweet chilli sauce','sauce_savoury','🌶️','g',
      {kcal:230,protein:0.5,carbs:57,fat:0.1,sugar:51,sodium:600},
      [S('1 tbsp',18)]),
    f('Salad cream','sauce_savoury','🥗','g',
      {kcal:348,protein:1.5,carbs:17,fat:31,satfat:2.5,sugar:13,sodium:1000},
      [S('1 tbsp',15)]),
    f('Tartare sauce','sauce_savoury','🐟','g',
      {kcal:358,protein:1,carbs:9,fat:36,satfat:3,sugar:5,sodium:600},
      [S('1 tbsp',15)]),
    f('White sauce (béchamel)','sauce_savoury','🥛','g',
      {kcal:130,protein:4,carbs:10,fat:8,satfat:5,sugar:5,calcium:120},
      [S('2 tbsp',40)]),
    f('Tomato salsa','sauce_savoury','🍅','g',
      {kcal:36,protein:1.5,carbs:7,fat:0.2,sugar:4,fiber:1.5,c:10,sodium:430},
      [S('1 tbsp',16)]),
  );

  /* ---------- CONDIMENTS ---------- */
  add(
    f('Balsamic vinegar','condiment','🫙','ml',
      {kcal:88,protein:0.5,carbs:17,sugar:15,sodium:23},
      [S('1 tbsp',16)]),
    f('Tomato purée','condiment','🍅','g',
      {kcal:100,protein:4.5,carbs:19,fat:0.5,sugar:13,fiber:3,c:21,potassium:1014,vita:75},
      [S('1 tbsp',15)]),
    f('Yeast extract (Marmite)','condiment','🟤','g',
      {kcal:250,protein:34,carbs:24,fat:0.1,sodium:4300,b1:4,b2:8.6,b3:130,b9:1010,b12:25},
      [S('1 scrape',4)]),
  );

  /* ---------- FRUIT ---------- */
  add(
    f('Grapefruit','fruit','🍊','g',
      {kcal:42,protein:0.8,carbs:9,fat:0.1,sugar:9,fiber:1.6,c:31,vita:58,potassium:135},
      [S('½ grapefruit',120)]),
    f('Sultanas','fruit','🍇','g',
      {kcal:296,protein:2.7,carbs:70,fat:0.4,sugar:69,fiber:2,potassium:710,iron:1.8},
      [S('1 tbsp',30)]),
    f('Lychees','fruit','🍈','g',
      {kcal:66,protein:0.8,carbs:16.5,fat:0.4,sugar:15,fiber:1.3,c:71,potassium:171},
      [S('5 lychees',50)]),
  );

  /* ---------- VEG ---------- */
  add(
    f('Sugar snap peas','veg','🫛','g',
      {kcal:42,protein:2.8,carbs:7.5,fat:0.2,sugar:4,fiber:2.6,c:60,vitk:25},
      [S('1 handful',40)]),
    f('Swede','veg','🥔','g',
      {kcal:38,protein:1.1,carbs:8.6,fat:0.2,sugar:4.5,fiber:2.3,c:25,potassium:305},
      [S('1 portion',80)]),
    f('Cherry tomatoes','veg','🍅','g',
      {kcal:18,protein:0.9,carbs:3.9,fat:0.2,sugar:2.6,fiber:1.2,c:14,vita:42,potassium:237},
      [S('5 tomatoes',75)]),
    f('Red cabbage','veg','🥬','g',
      {kcal:31,protein:1.4,carbs:7.4,fat:0.2,sugar:3.8,fiber:2.1,c:57,vitk:38,potassium:243},
      [S('1 portion',80)]),
  );

  /* ---------- GRAINS ---------- */
  add(
    f('Rice Krispies','grains','🥣','g',
      {kcal:382,protein:6,carbs:87,fat:1,sugar:10,fiber:1.5,iron:8,b1:1.2,b9:333,b12:1.7},
      [S('1 bowl',30)]),
    f('Bran flakes','grains','🥣','g',
      {kcal:356,protein:10,carbs:67,fat:2,sugar:16,fiber:15,iron:18,b9:333,b12:1.7},
      [S('1 bowl',40)]),
    f('Granola','grains','🥣','g',
      {kcal:471,protein:10,carbs:64,fat:20,satfat:3,sugar:20,fiber:6,iron:3,magnesium:90},
      [S('1 portion',45)]),
    f('Croissant','grains','🥐','g',
      {kcal:414,protein:8,carbs:46,fat:21,satfat:12,sugar:8,fiber:2.6,calcium:37,iron:2},
      [S('1 croissant',60)]),
    f('Yorkshire pudding','grains','🥧','g',
      {kcal:211,protein:6.6,carbs:25,fat:9.9,satfat:2,sugar:2,calcium:120,iron:1.4},
      [S('1 pudding',30)]),
  );

  /* ---------- MEAT / FISH / PROTEIN ---------- */
  add(
    f('Frankfurter / hot dog','meat_fish','🌭','g',
      {kcal:290,protein:11,carbs:4,fat:26,satfat:10,sugar:1,sodium:980,iron:1},
      [S('1 sausage',47)]),
    f('Fish cake','meat_fish','🐟','g',
      {kcal:200,protein:9,carbs:18,fat:10,satfat:1.5,sodium:450,calcium:40},
      [S('1 cake',50)]),
    f('Quorn pieces','meat_fish','🍢','g',
      {kcal:92,protein:14,carbs:4.5,fat:2,fiber:5.5,sodium:250},
      [S('1 portion',75)]),
    f('Veggie sausage','meat_fish','🌱','g',
      {kcal:200,protein:12,carbs:12,fat:11,satfat:1.5,fiber:4,sodium:600},
      [S('1 sausage',50)]),
    f('Duck (cooked)','meat_fish','🦆','g',
      {kcal:195,protein:25,carbs:0,fat:10,satfat:3,iron:2.7,zinc:2.5,b12:0.4},
      [S('1 portion',100)]),
  );

  /* ---------- DAIRY ---------- */
  add(
    f('Cheese string','dairy','🧀','g',
      {kcal:328,protein:24,carbs:0.1,fat:25,satfat:16,calcium:700,sodium:600},
      [S('1 string',20)]),
    f('Squirty cream','dairy','🍨','g',
      {kcal:257,protein:2,carbs:11,fat:23,satfat:15,sugar:9,calcium:75},
      [S('1 swirl',15)]),
    f('Halloumi','dairy','🧀','g',
      {kcal:321,protein:22,carbs:2,fat:25,satfat:16,calcium:700,sodium:1500},
      [S('2 slices',60)]),
    f('Frozen yoghurt','dairy','🍦','g',
      {kcal:127,protein:3,carbs:22,fat:3.6,satfat:2,sugar:20,calcium:100},
      [S('1 scoop',60)]),
  );

  /* ---------- MISC / SNACKS ---------- */
  add(
    f('Walnuts','misc','🌰','g',
      {kcal:654,protein:15,carbs:14,fat:65,satfat:6,fiber:6.7,omega3:9,magnesium:158,b9:98},
      [S('1 handful',30)]),
    f('Pistachios','misc','🥜','g',
      {kcal:562,protein:20,carbs:28,fat:45,satfat:5.4,fiber:10,sugar:8,potassium:1025,b6:1.7,magnesium:121},
      [S('1 handful',30)]),
    f('Doughnut (sugared)','misc','🍩','g',
      {kcal:403,protein:6,carbs:47,fat:21,satfat:9,sugar:20,calcium:60,iron:1.5},
      [S('1 doughnut',60)]),
    f('Brownie','misc','🍫','g',
      {kcal:466,protein:6,carbs:56,fat:25,satfat:8,sugar:40,fiber:2,iron:2},
      [S('1 piece',40)]),
    f('Fruit pastilles','misc','🍬','g',
      {kcal:345,protein:3.5,carbs:81,fat:0,sugar:60,fiber:0},
      [S('1 tube',50)]),
  );

  /* Merge into the global SEED_FOODS (defined in seed.js, loaded first) */
  if (typeof SEED_FOODS !== 'undefined') {
    for (const r of rows) SEED_FOODS.push(r);
  }
})();

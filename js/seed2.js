/* ===== Nibble: seed foods batch 2 (appended to SEED_FOODS) ===== */
'use strict';

(function () {
  let id = 0;
  function f(name, cat, emoji, per, n, servings) {
    return { id: 'seed2_' + (id++), name, cat, emoji, per: per || 'g',
      n: n || {}, servings: servings || [], src: 'builtin', uses: 0, lastUsed: 0 };
  }
  const S = (name, grams) => ({ name, grams });
  const rows = [];
  const add = (...r) => { for (const x of r) rows.push(x); };

  /* FRUIT */
  add(
    f('Nectarine','fruit','🍑','g',{kcal:44,protein:1.1,carbs:8.9,fat:0.3,sugar:7.9,fiber:1.7,c:5.4,potassium:201,vita:17},[S('1 nectarine',140)]),
    f('Pomegranate','fruit','🍎','g',{kcal:83,protein:1.7,carbs:18.7,fat:1.2,sugar:13.7,fiber:4,c:10.2,vitk:16.4,potassium:236,b9:38},[S('½ fruit',80)]),
    f('Fig (fresh)','fruit','🍑','g',{kcal:74,protein:0.8,carbs:19,fat:0.3,sugar:16,fiber:2.9,calcium:35,potassium:232},[S('1 fig',50)]),
    f('Blackberries','fruit','🫐','g',{kcal:43,protein:1.4,carbs:4.9,fat:0.5,sugar:4.9,fiber:5.3,c:21,vitk:19.8,manganese:0.65},[S('1 handful',60)]),
    f('Satsuma','fruit','🍊','g',{kcal:36,protein:0.7,carbs:8.5,fat:0.1,sugar:8.4,fiber:1.3,c:30,potassium:130},[S('1 satsuma',70)]),
    f('Lemon','fruit','🍋','g',{kcal:29,protein:1.1,carbs:9.3,fat:0.3,sugar:2.5,fiber:2.8,c:53,potassium:138},[S('1 wedge',15)]),
    f('Coconut (fresh)','fruit','🥥','g',{kcal:354,protein:3.3,carbs:15,fat:33,satfat:30,fiber:9,potassium:356,magnesium:32,manganese:1.5,iron:2.4},[S('1 piece',40)]),
    f('Prunes','fruit','🍇','g',{kcal:240,protein:2.2,carbs:64,fat:0.4,sugar:38,fiber:7.1,potassium:732,vita:39,vitk:60,iron:0.9},[S('1 prune',9)]),
  );
  /* VEG */
  add(
    f('Cabbage','veg','🥬','g',{kcal:25,protein:1.3,carbs:5.8,fat:0.1,sugar:3.2,fiber:2.5,c:37,vitk:76,b9:43,potassium:170},[S('1 handful',60)]),
    f('Kale','veg','🥬','g',{kcal:49,protein:4.3,carbs:8.8,fat:0.9,sugar:2.3,fiber:3.6,c:120,vita:500,vitk:705,calcium:150,potassium:491},[S('1 handful',30)]),
    f('Asparagus','veg','🥬','g',{kcal:20,protein:2.2,carbs:3.9,fat:0.1,sugar:1.9,fiber:2.1,vitk:41.6,b9:52,c:5.6,e:1.1},[S('3 spears',45)]),
    f('Aubergine','veg','🍆','g',{kcal:25,protein:1,carbs:6,fat:0.2,sugar:3.5,fiber:3,potassium:229,manganese:0.23,b6:0.08},[S('3 slices',80)]),
    f('Leek','veg','🥬','g',{kcal:61,protein:1.5,carbs:14,fat:0.3,sugar:3.9,fiber:1.8,vitk:47,b9:64,iron:2.1,manganese:0.48},[S('½ leek',60)]),
    f('Celery','veg','🥬','g',{kcal:14,protein:0.7,carbs:3,fat:0.2,sugar:1.8,fiber:1.6,vitk:29.3,potassium:260,b9:36},[S('1 stick',40)]),
    f('Radish','veg','🍅','g',{kcal:16,protein:0.7,carbs:3.4,fat:0.1,sugar:1.9,fiber:1.6,c:14.8,potassium:233},[S('3 radishes',45)]),
    f('Pumpkin','veg','🎃','g',{kcal:26,protein:1,carbs:6.5,fat:0.1,sugar:2.8,fiber:0.5,vita:426,c:9,potassium:340},[S('2 tbsp',80)]),
    f('Spring onion','veg','🧅','g',{kcal:32,protein:1.8,carbs:7.3,fat:0.2,fiber:2.6,vitk:207,c:18.8,b9:64},[S('1 onion',15)]),
    f('Garlic','veg','🧄','g',{kcal:149,protein:6.4,carbs:33,fat:0.5,fiber:2.1,c:31,b6:1.2,manganese:1.7,selenium:14},[S('1 clove',4)]),
    f('Edamame','veg','🫛','g',{kcal:121,protein:11,carbs:9,fat:5,fiber:5,b9:311,iron:2.3,magnesium:64,vitk:27},[S('2 tbsp',70)]),
  );
  /* GRAINS */
  add(
    f('Pancake','grains','🥞','g',{kcal:227,protein:6.4,carbs:28,fat:10,sugar:6,fiber:1,calcium:120,iron:1.5,b2:0.2},[S('1 pancake',40)]),
    f('Waffle','grains','🧇','g',{kcal:291,protein:7.9,carbs:33,fat:14,sugar:5,sodium:511,calcium:140,iron:2.5},[S('1 waffle',38)]),
    f('Brioche','grains','🍞','g',{kcal:330,protein:8.5,carbs:50,fat:11,satfat:5,sugar:9,calcium:60,iron:2},[S('1 slice',35)]),
    f('Crumpet','grains','🫓','g',{kcal:177,protein:5.4,carbs:36,fat:0.6,sugar:1,fiber:1.7,calcium:110,iron:1.2,b1:0.3},[S('1 crumpet',50)]),
    f('Noodles (egg, cooked)','grains','🍜','g',{kcal:138,protein:4.5,carbs:25,fat:2.1,sugar:0.6,fiber:1.2,selenium:20,b2:0.1},[S('1 nest',75)]),
    f('Gnocchi','grains','🥟','g',{kcal:152,protein:3.6,carbs:31,fat:1.2,sugar:0.5,fiber:1.7,sodium:380,potassium:180},[S('1 portion',150)]),
    f('Muesli','grains','🥣','g',{kcal:362,protein:9.7,carbs:66,fat:5.9,sugar:16,fiber:7.6,iron:3.6,magnesium:90,zinc:2.5},[S('1 bowl',50)]),
    f('Shredded wheat','grains','🌾','g',{kcal:340,protein:11.5,carbs:68,fat:2.5,sugar:0.7,fiber:9.8,iron:3.4,magnesium:110,zinc:2.3},[S('2 pieces',45)]),
    f('Polenta (cooked)','grains','🍚','g',{kcal:85,protein:2,carbs:18,fat:0.4,fiber:1,vita:14,selenium:7},[S('2 tbsp',80)]),
    f('Crispbread (Ryvita)','grains','🍘','g',{kcal:334,protein:9.6,carbs:65,fat:1.7,sugar:1.2,fiber:15,iron:3.4,magnesium:100,zinc:2.6},[S('1 slice',10)]),
  );
  /* MEAT & FISH */
  add(
    f('Lamb (cooked)','meat_fish','🥩','g',{kcal:294,protein:25,carbs:0,fat:21,satfat:9,iron:1.9,zinc:4.5,b12:2.6,b3:6,selenium:20},[S('1 portion',90)]),
    f('Bacon (grilled)','meat_fish','🥓','g',{kcal:541,protein:37,carbs:1.4,fat:42,satfat:14,sodium:2100,b1:0.5,zinc:3,selenium:35},[S('1 rasher',25)]),
    f('Chicken nuggets','meat_fish','🍗','g',{kcal:296,protein:15,carbs:18,fat:19,satfat:3.5,sodium:500,iron:1,calcium:30},[S('1 nugget',18),S('4 nuggets',72)]),
    f('Meatballs','meat_fish','🍖','g',{kcal:197,protein:14,carbs:5,fat:13,satfat:5,iron:1.6,zinc:3,b12:1,sodium:480},[S('1 meatball',20)]),
    f('Haddock (cooked)','meat_fish','🐟','g',{kcal:104,protein:24,carbs:0,fat:0.6,d:1.4,b12:1.6,selenium:34,iodine:200,phosphorus:200},[S('1 fillet',120)]),
    f('Pollock fish fingers','meat_fish','🐟','g',{kcal:200,protein:12,carbs:19,fat:9,satfat:1.2,sodium:340,calcium:25,iodine:30},[S('1 finger',28)]),
    f('Chorizo','meat_fish','🌭','g',{kcal:455,protein:24,carbs:1.9,fat:38,satfat:14,sodium:1240,b1:0.5,zinc:3.3,selenium:21},[S('3 slices',15)]),
    f('Liver (cooked)','meat_fish','🥩','g',{kcal:175,protein:27,carbs:3.9,fat:5,iron:6.5,zinc:4,b12:70,vita:9440,b2:2.8,b9:253,copper:12},[S('1 small portion',40)]),
    f('Trout (cooked)','meat_fish','🐟','g',{kcal:190,protein:27,carbs:0,fat:8.5,omega3:1,d:16,b12:5.4,selenium:24,phosphorus:270},[S('1 fillet',100)]),
    f('Beans on... (kidney beans)','meat_fish','🫘','g',{kcal:127,protein:8.7,carbs:22.8,fat:0.5,fiber:7.4,iron:2.9,b9:130,magnesium:45,potassium:405,zinc:1},[S('2 tbsp',80)]),
  );
  /* DAIRY */
  add(
    f('Cheese (parmesan)','dairy','🧀','g',{kcal:402,protein:36,carbs:3.2,fat:29,satfat:19,calcium:1184,sodium:1600,b12:1.2,zinc:2.8,phosphorus:694},[S('1 tbsp grated',5)]),
    f('Cheese (feta)','dairy','🧀','g',{kcal:264,protein:14,carbs:1.5,fat:21,satfat:15,calcium:493,sodium:1140,b12:1.7,phosphorus:337},[S('1 cube',20)]),
    f('Cheese (brie)','dairy','🧀','g',{kcal:343,protein:21,carbs:0.5,fat:28,satfat:18,calcium:184,sodium:629,b12:1.6,vita:174},[S('1 wedge',30)]),
    f('Milk (skimmed)','dairy','🥛','ml',{kcal:35,protein:3.6,carbs:5,fat:0.1,sugar:5,calcium:124,b12:0.9,iodine:30,phosphorus:95},[S('1 glass',200)]),
    f('Soy milk','dairy','🥛','ml',{kcal:43,protein:3.3,carbs:1.2,fat:1.8,sugar:0.6,calcium:120,d:1.5,b12:0.4,b2:0.21},[S('1 glass',200)]),
    f('Almond milk','dairy','🥛','ml',{kcal:24,protein:0.5,carbs:2.4,fat:1.1,sugar:2.4,calcium:120,d:1.5,e:6,b12:0.4},[S('1 glass',200)]),
    f('Cottage cheese','dairy','🧀','g',{kcal:98,protein:11,carbs:3.4,fat:4.3,satfat:1.7,calcium:83,b12:0.4,selenium:9.5,phosphorus:159,sodium:364},[S('2 tbsp',60)]),
    f('Crème fraîche','dairy','🥛','g',{kcal:299,protein:2.4,carbs:2.9,fat:31,satfat:20,calcium:79,vita:280},[S('1 tbsp',30)]),
    f('Rice pudding','dairy','🍮','g',{kcal:97,protein:3.4,carbs:16,fat:2,sugar:11,calcium:110,b12:0.3},[S('½ tin',100)]),
    f('Yoghurt drink','dairy','🥛','ml',{kcal:71,protein:2.7,carbs:13,fat:1.1,sugar:12,calcium:100,d:0.5},[S('1 bottle',100)]),
  );
  /* MISC */
  add(
    f('Falafel','misc','🧆','g',{kcal:333,protein:13,carbs:32,fat:18,fiber:5,iron:3.4,b9:78,magnesium:82,zinc:1.5},[S('1 falafel',25)]),
    f('Pizza (cheese & tomato)','misc','🍕','g',{kcal:266,protein:11,carbs:33,fat:10,satfat:4.5,sugar:3.6,calcium:188,sodium:600,iron:2,b3:3},[S('1 slice',100)]),
    f('Sausage roll','misc','🥐','g',{kcal:344,protein:9,carbs:25,fat:23,satfat:9,sodium:600,iron:1.4},[S('1 roll',60)]),
    f('Scone','misc','🥐','g',{kcal:362,protein:7.2,carbs:54,fat:14,satfat:6,sugar:9,calcium:230,iron:2},[S('1 scone',55)]),
    f('Muffin (blueberry)','misc','🧁','g',{kcal:377,protein:5,carbs:51,fat:17,satfat:3,sugar:28,calcium:90,iron:1.5},[S('1 muffin',60)]),
    f('Flapjack','misc','🍪','g',{kcal:466,protein:5,carbs:60,fat:23,satfat:10,sugar:34,fiber:3.5,iron:2,magnesium:55},[S('1 piece',40)]),
    f('Gummy sweets','misc','🍬','g',{kcal:343,protein:6.9,carbs:77,fat:0.2,sugar:46},[S('5 sweets',20)]),
    f('Marshmallows','misc','🍬','g',{kcal:318,protein:1.8,carbs:81,fat:0.2,sugar:58},[S('3 mallows',21)]),
    f('Pretzels','misc','🥨','g',{kcal:380,protein:10,carbs:80,fat:3,fiber:3,sodium:1240,iron:4.6,b9:160},[S('1 handful',25)]),
    f('Trail mix','misc','🥜','g',{kcal:484,protein:14,carbs:45,fat:29,fiber:6,iron:3,magnesium:160,zinc:3,potassium:640},[S('1 handful',30)]),
    f('Sunflower seeds','misc','🌰','g',{kcal:584,protein:21,carbs:20,fat:51,fiber:8.6,e:35,magnesium:325,selenium:53,zinc:5,b1:1.5},[S('1 tbsp',10)]),
    f('Chia seeds','misc','🌰','g',{kcal:486,protein:17,carbs:42,fat:31,omega3:18,fiber:34,calcium:631,iron:7.7,magnesium:335,zinc:4.6},[S('1 tbsp',12)]),
    f('Hot chocolate (made w/ milk)','misc','☕','ml',{kcal:84,protein:3.4,carbs:11,fat:3,sugar:10,calcium:110,b12:0.4,iron:0.4},[S('1 mug',200)]),
    f('Milkshake','misc','🥤','ml',{kcal:88,protein:3.2,carbs:13,fat:2.9,sugar:13,calcium:110,b2:0.2},[S('1 glass',200)]),
    f('Cereal bar','misc','🍫','g',{kcal:418,protein:6,carbs:68,fat:13,satfat:6,sugar:30,fiber:4,iron:2.5,calcium:120},[S('1 bar',25)]),
    f('Yoghurt-coated raisins','misc','🍇','g',{kcal:435,protein:3.5,carbs:71,fat:16,satfat:14,sugar:64,calcium:90},[S('1 handful',25)]),
    f('Olives','misc','🫒','g',{kcal:115,protein:0.8,carbs:6,fat:11,satfat:1.4,fiber:3.2,sodium:1556,iron:3.3,vita:20,e:3.8},[S('5 olives',20)]),
    f('Pickle / gherkin','misc','🥒','g',{kcal:11,protein:0.3,carbs:2.3,fat:0.2,fiber:1.2,sodium:1208,vitk:53},[S('1 gherkin',30)]),
  );

  /* Merge into the global SEED_FOODS (defined in seed.js, loaded first) */
  if (typeof SEED_FOODS !== 'undefined') {
    for (const r of rows) SEED_FOODS.push(r);
  }
})();

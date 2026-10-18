const X=(n,s,r,rest,tip,c)=>({n,s,r,rest,tip,c:!!c});

const WORKOUTS={
push:{title:'Push — Chest · Shoulders · Triceps',code:'PUSH',short:'Push',
 gym:[
  X('Barbell Bench Press',4,'6-8',120,'Shoulder blades pinched, feet planted, bar to lower chest, 2-second lowering.',1),
  X('Incline Dumbbell Press',3,'8-10',90,'30° bench. Full stretch at the bottom, no bouncing.',1),
  X('Seated Dumbbell Shoulder Press',3,'8-10',90,'Ribs down, glutes tight, avoid over-arching.'),
  X('Cable Fly / Pec Deck',3,'12-15',60,'Squeeze 1 s at peak, slow controlled stretch.'),
  X('Dumbbell Lateral Raise',4,'15-20',45,'Lead with elbows, stop at shoulder height, no swinging.'),
  X('Rope Triceps Pushdown',3,'10-12',60,'Elbows pinned to ribs, spread rope at bottom.'),
  X('Overhead Triceps Extension',2,'12-15',60,'Deep stretch on the long head of triceps.')],
 home:[
  X('Feet-Elevated Push-Up',4,'8-15',90,'Feet on a chair, 3-s lowering. Load a backpack once 15 reps feel easy.',1),
  X('Pike Push-Up',3,'6-12',90,'Hips high; head travels between hands. Elevate feet to progress.',1),
  X('Diamond Push-Up',3,'8-12',75,'Hands under chest; elbows tucked. Drop to knees only if form breaks.'),
  X('Chair / Bench Dips',3,'10-20',60,'Shoulders down and back; do not sink too deep.'),
  X('Bottle / Backpack Lateral Raise',4,'15-25',45,'Use water jugs or a loaded backpack held by the strap.'),
  X('Slow-Tempo Push-Up (4 s down)',3,'8-12',60,'Pause 1 s at the bottom. Pure time-under-tension.'),
  X('Counter Triceps Extension',2,'10-15',60,'Hands on a sturdy counter/table edge, lower head toward hands.')]},
pull:{title:'Pull — Back · Biceps · Rear Delts',code:'PULL',short:'Pull',
 gym:[
  X('Lat Pulldown (wide or neutral grip)',4,'8-12',90,'Pull elbows down and in toward ribs; full lat stretch at top, squeeze at collarbone.',1),
  X('Barbell / Chest-Supported Row',4,'8-10',90,'Flat back, squeeze shoulder blades together at the top.',1),
  X('Seated Cable Row',3,'10-12',75,'Neutral grip; avoid leaning back to cheat.'),
  X('Face Pull',3,'15-20',45,'Rope to forehead, externally rotate at the end.'),
  X('Straight-Arm Pulldown',2,'12-15',60,'Feel the lats stretch and contract; arms nearly straight.'),
  X('Incline Dumbbell Curl',3,'10-12',60,'Deep stretch at the bottom, no swinging.'),
  X('Hammer Curl',3,'10-12',60,'Neutral grip hits brachialis and forearms.')],
 home:[
  X('Door Towel Incline Row',4,'10-15',90,'Loop a sturdy towel around door handles (or knot over door top). Lean back ~45-60°, pull chest to door driving elbows down and back.',1),
  X('Backpack Bent-Over Row (Loaded)',4,'10-15',75,'Hinge at hips ~45°, flat back. Heavy backpack with books/water. Squeeze shoulder blades together 1 s.',1),
  X('Table Inverted Row or Doorframe Row',3,'8-12',75,'Lie under a sturdy table and grip edge, or grip sturdy doorframe. Keep body in a straight plank, pull chest up.',1),
  X('Prone Y-T-W Raise (Rear Delts & Traps)',3,'10-12',45,'Lie face down on floor. Lift arms in Y, T, then W shapes with thumbs pointing up; pause 1 s at peak.'),
  X('Backpack Biceps Curl',3,'12-15',60,'Hold loaded backpack by the handle/straps. Pin elbows to sides, curl up, 3-second slow lowering.'),
  X('Towel Isometric Biceps Curl',3,'20-30 s',45,'Stand on middle of a sturdy towel, grip ends palms-up. Pull upward at 90° elbow bend with maximum force against immovable resistance.'),
  X('Superman Lat-Pull Hold',3,'30-40 s',45,'Lie prone, lift chest and thighs. Reach arms forward, then drive elbows back into lats as if pulling down.')]},
legs:{title:'Legs — Quads · Glutes · Calves',code:'LEGS',short:'Legs',
 gym:[
  X('Barbell Back Squat',4,'6-8',150,'Brace the core, knees track over toes, hit at least parallel depth.',1),
  X('Leg Press',3,'10-12',100,'Feet shoulder-width; do not lock knees at the top.',1),
  X('Romanian Deadlift',3,'8-10',100,'Push hips back, soft knees, bar close to legs.'),
  X('Walking Lunge',3,'12 / leg',75,'Long stride, upright torso.'),
  X('Leg Extension',3,'12-15',60,'Squeeze at the top for 1 s.'),
  X('Standing Calf Raise',4,'12-20',45,'Full stretch at the bottom, pause at the top.')],
 home:[
  X('Bulgarian Split Squat (backpack)',4,'8-12 / leg',90,'Rear foot on a chair; most of the weight on the front leg.',1),
  X('Backpack Goblet Squat (3-1-1 tempo)',4,'12-20',75,'Hold backpack on chest, 3-s down, 1-s pause, drive up fast.',1),
  X('Single-Leg Romanian Deadlift',3,'10-12 / leg',75,'Hinge on one leg, keep hips square to the floor.'),
  X('Reverse Lunge',3,'12 / leg',60,'Step back, drop the back knee close to the floor.'),
  X('Wall Sit',3,'45-60 s',60,'Thighs parallel to the floor; add a backpack on thighs.'),
  X('Single-Leg Calf Raise',4,'15-25',45,'On a stair edge. Full range, pause on top.')]},
cond:{title:'Conditioning + Core — Fat Burn Day',code:'HIIT',short:'HIIT + Core',
 gym:[
  X('Interval Rounds: Bike / Rower / Treadmill',6,'30 s hard / 90 s easy',0,'Hard = ~9/10 effort. Easy = slow pedalling/walking. Rounds scale by phase.',1),
  X('Sled Push or Battle Ropes',4,'30 s',60,'All-out for 30 s, then rest fully.',1),
  X('Cable Crunch',3,'12-15',45,'Curl the ribcage to the pelvis, do not pull with arms.'),
  X('Hanging Leg Raise',3,'10-15',45,'No swinging; tilt pelvis up at the top.'),
  X('Ab Wheel Rollout',3,'8-12',45,'Stop where the lower back starts to sag.'),
  X('Pallof Press',3,'10 / side',45,'Resist rotation; slow press, 1-s hold.'),
  X('Easy Zone-2 Walk / Incline Treadmill',1,'15 min',0,'Conversational pace; helps recovery and steps.')],
 home:[
  X('Tabata Block A: Burpees / Mountain Climbers',6,'20 s on / 10 s off',60,'Pick 2 moves, alternate each round. Rounds scale by phase.',1),
  X('Tabata Block B: High Knees / Skater Hops',4,'30 s on / 15 s off',60,'Quiet landings, stay light on the feet.',1),
  X('Dead Bug',3,'10 / side',45,'Lower back pressed into the floor throughout.'),
  X('Bicycle Crunch',3,'20-30',45,'Slow and controlled; rotate the torso, not just the elbows.'),
  X('Hollow Body Hold',3,'20-40 s',45,'Ribs down, lower back flat; bend knees to make it easier.'),
  X('Reverse Crunch',3,'12-15',45,'Curl hips off the floor; no momentum.'),
  X('Easy Walk / Stair Climb',1,'15 min',0,'Conversational pace. Helps recovery and step count.')]},
upper:{title:'Upper Hypertrophy — Shoulders · Arms · V-Taper',code:'UPPR',short:'Upper',
 gym:[
  X('Standing Overhead Press',4,'6-8',120,'Squeeze glutes, head through at the top, bar over mid-foot.',1),
  X('Weighted Dips (chest lean)',3,'8-12',90,'Lean forward slightly; stop if shoulders pinch.',1),
  X('One-Arm Dumbbell / T-Bar Row',3,'10-12',75,'Pull toward hip, avoid twisting.'),
  X('Cable Lateral Raise',4,'15-20',45,'Constant tension; light and strict.'),
  X('Reverse Pec Deck',3,'15-20',45,'Lead with the elbows; no shrugging.'),
  X('EZ-Bar Curl',3,'8-12',60,'Elbows fixed, squeeze at the top.'),
  X('Close-Grip Bench / Skull Crusher',3,'8-12',75,'Lower to forehead/chest slowly; elbows narrow.')],
 home:[
  X('Pike Push-Up (feet elevated)',4,'6-12',90,'Elevate feet on a chair; head between hands; strict shoulders-over-wrists.',1),
  X('Archer Push-Up',3,'6-10 / side',90,'Shift weight to one arm; the other arm stays straight.',1),
  X('Backpack Row (heavy)',4,'10-15',75,'Pause 1 s at the top. Use the heaviest backpack you can control.'),
  X('Bottle Lateral Raise',4,'15-25',45,'Slow lowering over 3 s; no momentum.'),
  X('Bent-Over Reverse Fly',3,'15-20',45,'Bottles or light backpack; squeeze shoulder blades.'),
  X('Backpack Curl',3,'10-15',60,'Slow 3-s lowering; elbows fixed.'),
  X('Bench Dips (feet elevated)',3,'AMRAP',60,'Last set to technical failure.')]},
post:{title:'Posterior Chain — Hamstrings · Glutes · Back',code:'POST',short:'Posterior',
 gym:[
  X('Conventional / Trap-Bar Deadlift',4,'4-6',180,'Flat back, push the floor away; reset every rep.',1),
  X('Barbell Hip Thrust',4,'8-12',90,'Chin tucked, pause at lockout, avoid hyper-extending the lower back.',1),
  X('Bulgarian Split Squat',3,'8-10 / leg',90,'Slight forward lean to bias glutes.'),
  X('Lying / Seated Leg Curl',3,'10-15',60,'Slow 3-s lowering.'),
  X('45° Back Extension',3,'12-15',60,'Round-free neutral spine; squeeze glutes at the top.'),
  X('Seated Calf Raise',4,'12-20',45,'Full range, 1-s pause at the stretch.')],
 home:[
  X('Single-Leg Hip Thrust (backpack)',4,'10-15 / leg',75,'Shoulders on a couch/chair, drive through the heel.',1),
  X('Single-Leg Romanian Deadlift (backpack)',4,'8-12 / leg',75,'Hinge slowly; stay balanced, hips level.',1),
  X('Assisted Nordic Hamstring Curl',3,'5-8',90,'Anchor heels under a couch. Lower as slowly as possible, push off the floor to return.'),
  X('Towel Slider Hamstring Curl',3,'10-15',60,'Heels on towel on a smooth floor; hips high.'),
  X('Backpack Good Morning',3,'12-15',60,'Neutral spine; stop when hamstrings are stretched.'),
  X('Glute Bridge March',3,'12 / leg',45,'Keep hips level while alternately lifting each foot.'),
  X('Single-Leg Calf Raise',4,'15-25',45,'Slow, full range.')]}
};
const CYCLE=['push','pull','legs','cond','upper','post'];
const WARM={
 push:['2 min jump rope / jumping jacks','Arm circles ×10 each way','Band-free scapular push-ups ×10','Light ramp-up set (≈50% load × 10, ≈70% × 5)'],
 pull:['2 min light cardio / jumping jacks','Cat-cow ×10','Doorframe scapular retractions / floor slides 2×15','Ramp-up set (≈50% load × 10, ≈70% × 5)'],
 legs:['3 min bike/brisk walk','Bodyweight squat ×15','Leg swings ×10/leg','Hip 90/90 switches ×8','Ramp-up set (≈50% × 8, ≈70% × 4)'],
 cond:['3 min easy jog / jump rope','High knees 2×20 s','World\'s-greatest-stretch ×5/side','1 progressive 20-s fast burst'],
 upper:['2 min jump rope','Shoulder dislocates with towel ×10','Push-up ×8 slow','Ramp-up set for the first lift'],
 post:['3 min bike/brisk walk','Glute bridge ×15','Hip hinge drill (dowel/bottle) ×12','Bird dog ×8/side','Ramp-up set (≈50% × 6, ≈70% × 3)']};
const COOL=['5 min easy walk to bring heart-rate down','Static stretch of the trained muscles: 2 × 30 s each','Slow nasal breathing 2 min (4 s in / 6 s out)','Protein + carbs within ~2 h (see Provisions tab)'];
const MOBILITY=['Cat-cow ×10','Child\'s pose 45 s','90/90 hip switches ×8/side','Thoracic rotations ×8/side','Couch stretch 40 s/side','Hamstring floss 8/side','Deep breathing 2 min'];
const REST_PLAN=[
 'Sleep target 8–9 h tonight; lights out early.',
 'Easy 30–40 min walk (outdoors if possible) — no intensity.',
 '15 min full-body mobility + foam rolling (use the mobility list).',
 'Eat at maintenance calories today (see Provisions tab), carbs slightly higher.',
 'Hydrate: 35–40 ml/kg body weight; add 1 tbsp Isabgol at night with warm water.',
 'Take progress photos + review your week; prep Indian meals for the next days.',
 'No lifting, no HIIT. This is your weekly rest day: it prevents overreaching and is when you actually grow.'];
const P=[
 {id:1,name:'Floor 1 · Awakening',days:'Days 1–7',rir:'3 reps in reserve (RPE 7)',tempo:'3-1-1',cls:'b2',note:'Groove perfect technique and establish loads. One fewer set than the full plan.'},
 {id:2,name:'Floor 2 · Forging',days:'Days 8–14',rir:'2 reps in reserve (RPE 8)',tempo:'2-1-1',cls:'b4',note:'Full prescribed volume. Add 1–2 reps or 2–5% load versus last week.'},
 {id:3,name:'Floor 3 · Trial',days:'Days 15–21',rir:'1 rep in reserve (RPE 8–9)',tempo:'2-0-1',cls:'b3',note:'+1 set on the big compound lifts. Push loads.'},
 {id:4,name:'Floor 4 · Ascension',days:'Days 22–30',rir:'0–1 reps in reserve (RPE 9)',tempo:'2-0-1',cls:'b1',note:'+1 set on compounds, plus a drop-set / rest-pause on the last set of isolation moves.'}];
/* One rest day per week: Days 7, 14, 21, 28. The other six days of each week run the 6-session cycle. */
const isRest=d=>d%7===0&&d<=28;
const phaseOf=d=>isRest(d)?null:d<=7?P[0]:d<=14?P[1]:d<=21?P[2]:P[3];
const typeOf=d=>{if(isRest(d))return 'rest';const i=(d-1)-Math.floor((d-1)/7);return CYCLE[i%6];};
const BENCH=[
 ['pushups','Max strict push-ups (reps)'],['pullups','Max door towel rows or inverted rows (reps)'],
 ['squats','Bodyweight squats in 60 s (reps)'],['plank','Plank hold (seconds)'],['burpees','Burpees in 60 s (reps)']];
const CHECKPOINTS=[1,8,15,22,30];
const MEAS=[['weight','Weight (kg)'],['neck','Neck (cm)'],['chest','Chest (cm)'],['waist','Waist @ navel (cm)'],['hips','Hips (cm)'],['arm','Arm flexed (cm)'],['thigh','Thigh (cm)']];

const FOODS=[
 // id, name, kcal, p, c, f, type ('p'=protein, 'c'=carb, 'f'=fat, 'v'=veggie/fiber, 'x'=fiber-special) per 100g approx (Indian Food Composition Tables / IFCT)
 ['chicken','Chicken breast (skinless, cooked/seared)',165,31,0,3.6,'p'],
 ['egg','Whole eggs (boiled/bhurji, ~2 large)',143,12.6,0.7,9.5,'p'],
 ['eggw','Egg whites (boiled/scrambled, ~3 whites)',52,10.9,0.7,0.2,'p'],
 ['fish','Rohu / Katla / Basa fish (curry/pan-seared)',128,24,0,2.8,'p'],
 ['dal_moong','Yellow Moong Dal (cooked thick, 1 katori ~150g)',105,7.2,19.5,0.4,'p'],
 ['chana','Kala Chana / Chickpeas (boiled, spiced)',164,8.9,27.4,2.6,'p'],
 ['rajma','Rajma / Kidney Beans (boiled/curry)',127,8.7,22.8,0.5,'p'],
 ['paneer','Low-fat Cow Paneer (pan-seared/bhurji)',240,20,3,16,'p'],
 ['curd','Homemade Curd / Dahi (low-fat/toned)',62,4.3,5,3.1,'p'],
 ['soya','Soya Chunks (dry, Nutrela)',336,52,33,0.5,'p'],
 ['whey','Whey Protein isolate/concentrate (1 scoop)',395,80,6,4.5,'p'],
 ['isabgol','Isabgol Psyllium Husk (100% natural soluble fiber)',18,0.5,2,0.1,'v'],
 ['palak','Palak / Spinach & Methi (steamed/sauteed)',23,2.9,3.6,0.4,'v'],
 ['greenveg','Green Sabzi: Lauki / Bhindi / French Beans / Capsicum',32,2,5.2,0.3,'v'],
 ['roti','Whole Wheat Phulka / Roti (1 med ~30g atta)',340,13,72,2.5,'c'],
 ['rice','Steamed White / Brown Basmati Rice (cooked)',130,2.7,28,0.3,'c'],
 ['oats','Rolled Oats (dry)',379,13.2,67.7,6.5,'c'],
 ['sweetp','Boiled Sweet Potato (Shakarkandi)',90,2,20.7,0.2,'c'],
 ['banana','Fresh Banana (1 medium)',89,1.1,22.8,0.3,'c'],
 ['ghee','Desi Cow Ghee (1 tsp = 5g)',900,0,0,100,'f'],
 ['mustard','Mustard / Cold-pressed Oil (1 tsp = 5g)',884,0,0,100,'f'],
 ['almond','Almonds / Badam (raw)',579,21.2,21.6,49.9,'f']
];
const FOOD=Object.fromEntries(FOODS.map(f=>[f[0],{id:f[0],n:f[1],k:f[2],p:f[3],c:f[4],f:f[5],t:f[6]}]));

const MENUS={
 nonveg:[
  {name:'Indian Hunter Day A (Chicken + Eggs + Dal + Roti + Isabgol)',meals:[
   ['Morning Ritual','1 glass warm water + 1 tbsp Isabgol (7g) or fresh lemon water. Awakens gut motility & fiber shield.'],
   ['Breakfast (40g P)','3 Whole Eggs + 3-4 Egg Whites Scramble/Bhurji (sautéed with onion, green chillies, tomato, 1/2 tsp ghee) + 2 Whole Wheat Rotis.'],
   ['Lunch (45g P)','200g Self-Cooked Tawa Chicken Breast / Chicken Curry (prepared in 1 tsp mustard oil with turmeric, cumin, coriander) + 1 bowl Dal Palak (moong dal + spinach) + 150g steamed Basmati rice + fresh cucumber-onion salad.'],
   ['Pre/Post-Workout (30g P)','1 scoop Whey protein in water (or 3 boiled egg whites + 200ml Chaas/buttermilk) + 1 ripe banana + 10 soaked almonds.'],
   ['Dinner (40g P)','180g Pan-seared Chicken Breast or Homestyle Egg Curry (3 boiled eggs) + 1 large katori Green Sabzi (Bhindi / Lauki / French Beans) + 2 Rotis + 100g fresh curd/dahi.'],
   ['Night Recovery','1 glass warm water with 1 tbsp Isabgol (if not taken in morning). Deep sleep preparation.']
  ]},
  {name:'Indian Hunter Day B (Eggs + Lentils + Fish/Chicken + Sabzi)',meals:[
   ['Morning Ritual','1 glass warm water with fresh lemon & a pinch of pink salt.'],
   ['Breakfast (38g P)','4 Boiled Eggs (2 whole, 2 whites) sliced with chaat masala + 60g rolled oats cooked in milk with banana and cinnamon.'],
   ['Lunch (45g P)','200g Pan-seared Rohu/Katla Fish or Chicken Breast + 1.5 katori Boiled Rajma / Kala Chana with onion-tomato tadka + 2 Whole Wheat Rotis + salad.'],
   ['Pre/Post-Workout (28g P)','1 scoop Whey protein or 250ml homemade toned lassi (sugar-free) + 1 fruit (apple/banana) + 8 walnuts/almonds.'],
   ['Dinner (40g P)','150g Chicken Keema or Paneer-Egg Bhurji + 1 bowl steamed Dal Moong + 1 large bowl Palak / Methi Sabzi + 1 roti or 150g sweet potato.'],
   ['Night Recovery','1 tbsp Isabgol in 250ml warm water. Ensures smooth digestion of high-protein load.']
  ]}
 ],
 egg:[
  {name:'Indian Eggetarian Hunter Day A (Eggs + Dal + Paneer + Chana)',meals:[
   ['Morning Ritual','1 glass warm water + 1 tbsp Isabgol (7g). High-fiber start.'],
   ['Breakfast (35g P)','4 Egg Whites + 2 Whole Egg Bhurji with tomatoes, onions & green chilies + 2 Whole Wheat Rotis + green tea.'],
   ['Lunch (42g P)','120g Pan-seared Low-fat Paneer + 1.5 katori thick Moong Dal Palak + 150g steamed rice + raw salad with lemon juice.'],
   ['Pre/Post-Workout (30g P)','1 scoop Whey protein (or 4 boiled egg whites + 40g roasted chana) + 1 banana + 10 almonds.'],
   ['Dinner (38g P)','Egg Curry (3 boiled eggs) in tomato-onion homestyle gravy (1 tsp ghee) + 1 large bowl Lauki / Bhindi Sabzi + 2 Rotis + 100g fresh curd.'],
   ['Night Recovery','Warm water with pinch of cinnamon.']
  ]},
  {name:'Indian Eggetarian Hunter Day B (Eggs + Rajma + Curd + Greens)',meals:[
   ['Morning Ritual','1 glass warm water with lemon juice.'],
   ['Breakfast (36g P)','Oats cooked with milk, 1 scoop Whey & banana OR 3 Boiled Eggs + 2 slices brown bread / 1 roti.'],
   ['Lunch (40g P)','1.5 katori Rajma curry + 150g rice + 2 Boiled Eggs + large cucumber & carrot salad.'],
   ['Pre/Post-Workout (25g P)','250ml Curd / Greek yogurt + 1 tbsp peanut butter + 1 apple.'],
   ['Dinner (38g P)','Paneer Bhurji (150g paneer with peas and capsicum) + 1 bowl Moong Dal + 2 rotis + green veggie sabzi.'],
   ['Night Recovery','1 tbsp Isabgol in 250ml warm water.']
  ]}
 ],
 veg:[
  {name:'Indian Vegetarian Hunter Day A (Soya Chunks + Paneer + Dal + Isabgol)',meals:[
   ['Morning Ritual','1 glass warm water + 1 tbsp Isabgol (7g) for clean digestion.'],
   ['Breakfast (32g P)','Moong Dal Chilla (2 large) stuffed with 60g crushed paneer, coriander & green chillies + mint chutney + 150g curd.'],
   ['Lunch (45g P)','50g Soya Chunks (Nutrela dry wt = 26g protein) curry in tomato-ginger-garlic gravy + 1 katori thick Dal + 150g rice + green salad + 1 tsp cow ghee.'],
   ['Pre/Post-Workout (30g P)','1 scoop Whey protein in water + 1 banana + 10 almonds OR 40g roasted chana + 250ml toned milk.'],
   ['Dinner (38g P)','150g Low-fat Paneer Tikka / Bhurji + 1 large bowl Palak / Methi Sabzi + 2 Whole Wheat Rotis + 100g curd.'],
   ['Night Recovery','Warm water with 1 tbsp Isabgol.']
  ]},
  {name:'Indian Vegetarian Hunter Day B (Kala Chana + Paneer + Dal + Oats)',meals:[
   ['Morning Ritual','1 glass warm water with lemon and pink salt.'],
   ['Breakfast (34g P)','Rolled Oats (60g) cooked in 250ml toned milk + 1 scoop Whey + 1 chopped banana + cinnamon.'],
   ['Lunch (40g P)','1.5 katori Boiled Kala Chana / Chickpea Sundal/Salad with onion, tomato, lemon + 1 katori Dal Palak + 2 Rotis + curd.'],
   ['Pre/Post-Workout (25g P)','Paneer cubes (80g) with chaat masala + 1 fruit + roasted seeds.'],
   ['Dinner (38g P)','Soya Bhurji (45g soya granules/chunks boiled & scrambled with veggies) + 1 bowl Lauki Sabzi + 2 Rotis + salad.'],
   ['Night Recovery','1 tbsp Isabgol in warm water.']
  ]}
 ]
};

const REFS=[
 ['Train each muscle ≥2×/week','Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. Sports Med. 2016;46(11):1689–1697.','Effects of resistance training frequency on measures of muscle hypertrophy meta-analysis'],
 ['≥10 hard sets per muscle/week gives more growth','Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci. 2017;35(11):1073–1082.','Dose-response relationship between weekly resistance training volume and increases in muscle mass'],
 ['Light/high-rep (home) training builds muscle similarly if taken close to failure','Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. Strength and hypertrophy adaptations between low- vs. high-load resistance training. J Strength Cond Res. 2017;31(12):3508–3523.','Strength and hypertrophy adaptations between low- vs. high-load resistance training'],
 ['Rest ≥60–180 s between big sets','Schoenfeld BJ et al. Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. J Strength Cond Res. 2016;30(7):1805–1812.','Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men'],
 ['Protein ≈1.6 g/kg plateau, up to 2.2 g/kg','Morton RW et al. Protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. Br J Sports Med. 2018;52(6):376–384.','protein supplementation resistance training-induced gains muscle mass strength meta-analysis Morton'],
 ['Higher protein and slow loss (0.5–1% BW/wk) in a cut','Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. J Int Soc Sports Nutr. 2014;11:20.','Evidence-based recommendations for natural bodybuilding contest preparation nutrition and supplementation'],
 ['Soluble fiber (Isabgol/Psyllium) optimizes gut microbiome & metabolic health','Anderson JW et al. Cholesterol-lowering effects of psyllium intake adjunctive to diet therapy: a comprehensive meta-analysis. Am J Clin Nutr. 2000;71(2):472-479.','psyllium fiber intake cholesterol metabolic effects meta-analysis'],
 ['Slower weight loss preserves lean mass & performance','Garthe I et al. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. Int J Sport Nutr Exerc Metab. 2011;21(2):97–104.','Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes'],
 ['Resting energy equation used for calories','Mifflin MD et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241–247.','A new predictive equation for resting energy expenditure in healthy individuals'],
 ['Spread protein over ~4 meals (≈0.4 g/kg/meal)','Schoenfeld BJ, Aragon AA. How much protein can the body use in a single meal for muscle-building? J Int Soc Sports Nutr. 2018;15:10.','How much protein can the body use in a single meal for muscle-building'],
 ['Fat loss + muscle gain simultaneously is possible (novices, high protein)','Barakat C et al. Body recomposition: can we lose fat and gain muscle at the same time? Strength Cond J. 2020;42(5):7–21.','Body recomposition can we lose fat and gain muscle at the same time'],
 ['Short HIIT improves fitness & fat oxidation','Gibala MJ, Little JP, MacDonald MJ, Hawley JA. Physiological adaptations to low-volume, high-intensity interval training in health and disease. J Physiol. 2012;590(5):1077–1084.','Physiological adaptations to low-volume high-intensity interval training in health and disease'],
 ['General exercise prescription (ACSM)','Garber CE et al. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness. Med Sci Sports Exerc. 2011;43(7):1334–1359.','Quantity and quality of exercise for developing and maintaining cardiorespiratory musculoskeletal and neuromotor fitness'],
 ['Physical activity guideline (150–300 min/week)','Bull FC et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451–1462.','World Health Organization 2020 guidelines on physical activity and sedentary behaviour'],
 ['Creatine monohydrate 3–5 g/day: safe & effective','Kreider RB et al. ISSN position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. J Int Soc Sports Nutr. 2017;14:18.','International Society of Sports Nutrition position stand safety and efficacy of creatine supplementation'],
 ['Caffeine 3–6 mg/kg improves performance','Guest NS et al. ISSN position stand: caffeine and exercise performance. J Int Soc Sports Nutr. 2021;18:1.','International society of sports nutrition position stand caffeine and exercise performance'],
 ['Caffeine within 6 h of bedtime disrupts sleep','Drake C, Roehrs T, Shambroom J, Roth T. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med. 2013;9(11):1195–1200.','Caffeine effects on sleep taken 0 3 or 6 hours before going to bed'],
 ['Sleep ≥7 h/night','Watson NF et al. Recommended amount of sleep for a healthy adult: AASM and SRS consensus. Sleep. 2015;38(6):843–844.','Recommended amount of sleep for a healthy adult joint consensus statement'],
 ['Short sleep undermines fat loss (more lean mass lost)','Nedeltcheva AV et al. Insufficient sleep undermines dietary efforts to reduce adiposity. Ann Intern Med. 2010;153(7):435–441.','Insufficient sleep undermines dietary efforts to reduce adiposity'],
 ['Hydration during exercise','Sawka MN et al. ACSM position stand: exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377–390.','American College of Sports Medicine position stand exercise and fluid replacement'],
 ['Overtraining risk & monitoring (why a weekly rest day + readiness checks matter)','Meeusen R et al. Prevention, diagnosis and treatment of the overtraining syndrome: ECSS and ACSM consensus. Med Sci Sports Exerc. 2013;45(1):186–205.','Prevention diagnosis and treatment of the overtraining syndrome joint consensus statement ECSS ACSM'],
 ['High protein is safe for healthy kidneys','Devries MC et al. Changes in kidney function do not differ between healthy adults consuming higher- vs lower-protein diets: a meta-analysis. J Nutr. 2018;148(11):1760–1775.','Changes in kidney function do not differ between healthy adults consuming higher- compared with lower- or normal-protein diets'],
 ['Alcohol impairs post-exercise muscle protein synthesis','Parr EB et al. Alcohol ingestion impairs maximal post-exercise rates of myofibrillar protein synthesis. PLoS ONE. 2014;9(2):e88384.','Alcohol ingestion impairs maximal post-exercise rates of myofibrillar protein synthesis following a single bout of concurrent training'],
 ['Intermittent diet breaks (our maintenance day) — suggestive, not conclusive','Byrne NM et al. Intermittent energy restriction improves weight loss efficiency in obese men: the MATADOR study. Int J Obes. 2018;42(2):129–138.','Intermittent energy restriction improves weight loss efficiency in obese men MATADOR'],
 ['Body-fat estimate (US Navy circumference method, ±3–4 % error)','Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men and women from body circumferences and height. Naval Health Research Center Reports 84-11 & 84-29. 1984.','Hodgdon Beckett prediction of percent body fat US Navy body circumferences and height']];

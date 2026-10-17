// Automated Test Suite for Transform30 / Hunter System
var window = { matchMedia: function(){ return { matches: false }; }, addEventListener: function(){}, scrollTo: function(){}, location: { hash: "", protocol: "https:" } };
var setInterval = function(){ return 1; };
var clearInterval = function(){};
var setTimeout = function(fn){ return 1; };
var clearTimeout = function(){};
var requestAnimationFrame = function(fn){ return 1; };
var document = {
  getElementById: function(){ return { value: "", children: [], classList: { add: function(){}, remove: function(){}, toggle: function(){} }, textContent: "", style: {}, appendChild: function(){} }; },
  querySelector: function(){ return { classList: { add: function(){}, remove: function(){}, toggle: function(){} }, textContent: "", style: {}, children: [], appendChild: function(){} }; },
  querySelectorAll: function(){ return []; },
  createElement: function(){ return { classList: { add: function(){}, remove: function(){} }, setAttribute: function(){}, appendChild: function(){}, children: [] }; },
  addEventListener: function(){},
  visibilityState: "visible"
};
var navigator = { vibrate: function(){}, storage: {}, serviceWorker: { register: function(){ return Promise.resolve({ update: function(){ return Promise.resolve(); } }); }, ready: Promise.resolve({ update: function(){ return Promise.resolve(); } }) } };
var localStorage = (function(){
  var store = {};
  return {
    getItem: function(k){ return store[k] || null; },
    setItem: function(k, v){ store[k] = String(v); },
    removeItem: function(k){ delete store[k]; },
    clear: function(){ store = {}; }
  };
})();
var location = { hash: "", protocol: "https:" };

load("build/data.js");
load("build/logic.js");

var passed = 0;
var failed = 0;

function assert(cond, msg){
  if(cond){
    passed++;
    print("  [PASS] " + msg);
  } else {
    failed++;
    print("  [FAIL] " + msg);
  }
}

print("==================================================");
print("STARTING HUNTER SYSTEM TEST SUITE");
print("==================================================");

// --------------------------------------------------
print("\n--- Test Suite 1: State & Profile Calculations ---");
// --------------------------------------------------
S = defState();
S.hunter.awakened = true;
S.profile = {sex:'male', age:24, h:170, w:73, act:1.55, goal:'cut', diet:'nonveg'};
var pr = calc(S.profile);
assert(pr !== null, "Profile calculation returns valid nutrition object");
assert(pr.bmr === 1678, "BMR correctly calculated (~1678 kcal for 170cm, 73kg, 24yo male)");
assert(pr.prot === 161, "Cut protein target correctly set (~161g)");
assert(pr.waterTrain === 3.2, "Training water intake target correctly set to 3.2 L");
assert(pr.water === 2.7, "Rest water intake target correctly set to 2.7 L");

// --------------------------------------------------
print("\n--- Test Suite 2: Day 1 Training & Metric Progression ---");
// --------------------------------------------------
S.start = todayStr();
var cd = curDay();
assert(cd === 1, "Current day is Day 1");
var p1 = plan(1);
assert(!p1.rest, "Day 1 is not a rest day");
assert(p1.W.short === 'Push', "Day 1 workout is Push Training");
assert(p1.ex.length === 7, "Day 1 Gym has 7 exercises");

var totalSets = p1.ex.reduce(function(acc, q){ return acc + q.sets; }, 0);
assert(totalSets === 16, "Phase 1 Gym Push total sets correctly scaled to 16 sets (bench 3, incline 2, shoulder 2, fly 2, lat 3, rope 2, ext 2)");

// Initially 0 sets done
var eInit = evalAll();
assert(eInit.days[1].pct === 0, "Day 1 initial completion is 0%");
assert(!canClear(1), "canClear(1) is false when 0% sets done");

// Log 1 set of Barbell Bench Press
var k = key(1, 'gym');
S.done[k] = S.done[k] || {};
S.done[k][0] = [true];
_ev = null;
var e1 = evalAll();
assert(e1.days[1].pct > 0 && e1.days[1].pct < 0.1, "1 set logged: pct is ~6.25%");
assert(e1.stats.STR > 10, "STR increased above base 10 after 1 lifting set");
assert(!canClear(1), "canClear(1) is still false (< 70%)");

// Complete 12 sets (75% completion >= 70% threshold)
var logged = 0;
p1.ex.forEach(function(ex, i){
  S.done[k][i] = [];
  for(var j = 0; j < ex.sets; j++){
    if(logged < 12){
      S.done[k][i][j] = true;
      logged++;
    }
  }
});
_ev = null;
var e12 = evalAll();
assert(e12.days[1].pct >= 0.7, "12/16 sets logged: pct is >= 70% (" + Math.round(e12.days[1].pct*100) + "%)");
assert(canClear(1), "canClear(1) is now TRUE");

// Clear Day 1 quest
S.completed[1] = true;
_ev = null;
var eClear = evalAll();
assert(eClear.cleared === 1, "Cleared days counter incremented to 1");
assert(eClear.streak === 1, "Streak counter incremented to 1");
assert(eClear.stats.SEN === 12, "Sense stat increased by +2 upon quest clear");
assert(eClear.xp >= 190, "EXP awarded for completed sets + clear bonus + streak (EXP: " + eClear.xp + ")");

// --------------------------------------------------
print("\n--- Test Suite 3: Home Mode Switching & Tracking ---");
// --------------------------------------------------
var pH = planFor(1, 'home');
assert(pH.ex[0].n === 'Feet-Elevated Push-Up', "Home mode alternative loaded correctly");
var kH = key(1, 'home');
S.done[kH] = {};
pH.ex.forEach(function(ex, i){
  S.done[kH][i] = [];
  for(var j = 0; j < ex.sets; j++){ S.done[kH][i][j] = true; }
});
S.modes[1] = 'home';
_ev = null;
var eHome = evalAll();
assert(eHome.days[1].pct === 1.0, "Home mode full workout logged at 100%");
assert(eHome.homeClear === 1, "Home mode clear recorded for 'No Excuses' achievement");

// --------------------------------------------------
print("\n--- Test Suite 4: Metrics, Water Tracking & Sub-Quests ---");
// --------------------------------------------------
var x1 = D(1);
// Water tracking
x1.water = 1000;
assert(!SUBQ[0].ok(x1, pr), "Water 1000 mL is below target (3200 mL)");
x1.water = 3250;
assert(SUBQ[0].ok(x1, pr), "Water 3250 mL satisfies daily target");

// Other sub-quests
x1.isabgol = true;
assert(SUBQ[1].ok(x1, pr), "Isabgol fiber checked");
x1.steps = 8500;
assert(SUBQ[2].ok(x1, pr), "8500 steps satisfies 8,000 steps target");
x1.diet = true;
assert(SUBQ[3].ok(x1, pr), "Clean Indian diet followed");
x1.greenveg = true;
assert(SUBQ[4].ok(x1, pr), "Green veggies eaten");
x1.sleep = 8.0;
assert(SUBQ[5].ok(x1, pr), "8h sleep satisfies sleep target");
x1.mob = true;
assert(SUBQ[6].ok(x1, pr), "8-min mobility checked");
x1.prot = 155;
assert(SUBQ[7].ok(x1, pr), "155g protein satisfies protein target");

// Fatigue scan metrics
x1.sore = 2;
x1.energy = 4;
// Hunter log metrics
x1.weight = 72.8;
x1.note = "Crushed Push workout in home mode";

_ev = null;
var ePerf = evalAll();
assert(ePerf.days[1].perfect, "Day 1 marked as PERFECT clear (quest + all 8 sub-quests)");
assert(ePerf.perfect === 1, "Perfect days counter incremented to 1");
assert(ePerf.stats.VIT >= 18, "Vitality stat increased significantly (VIT: " + ePerf.stats.VIT + ")");
assert(ePerf.stats.INT >= 13, "Intelligence stat increased from logging metrics (INT: " + ePerf.stats.INT + ")");
assert(ePerf.stats.SEN >= 16, "Sense stat increased from streak, mobility, and perfect clear (SEN: " + ePerf.stats.SEN + ")");
assert(ePerf.level >= 5, "Hunter leveled up from Level 1 to Level " + ePerf.level + " from Day 1 gains");

// --------------------------------------------------
print("\n--- Test Suite 5: Penalty Quest Trigger & Redemption ---");
// --------------------------------------------------
// Simulate Day 2 arrives when Day 1 was NOT completed
var S_fail = defState();
S_fail.hunter.awakened = true;
S_fail.start = '2026-10-15'; // 2 days ago
// S_fail.completed[1] is false
var pend = 0;
// curDay would be 3, check days 1 and 2
for(var d = 1; d < 3; d++){
  if(!isRest(d) && !S_fail.completed[d] && !S_fail.redeem[d]){
    pend = d;
    break;
  }
}
assert(pend === 1, "Day 1 uncompleted quest accurately triggers penalty quest on Day 2+");

// Redeem penalty quest
S_fail.pen[1] = {0: true, 1: true, 2: true};
S_fail.redeem[1] = true;
var pendAfter = 0;
for(var d2 = 1; d2 < 3; d2++){
  if(!isRest(d2) && !S_fail.completed[d2] && !S_fail.redeem[d2]){
    pendAfter = d2;
    break;
  }
}
assert(pendAfter === 2, "Day 1 penalty resolved and redeemed successfully");

// --------------------------------------------------
print("\n--- Test Suite 6: Weekly Safe Zone / Rest Day (Days 7, 14, 21, 28) ---");
// --------------------------------------------------
assert(isRest(7), "Day 7 is a weekly Safe Zone / Rest day");
assert(isRest(14), "Day 14 is a weekly Safe Zone / Rest day");
assert(isRest(21), "Day 21 is a weekly Safe Zone / Rest day");
assert(isRest(28), "Day 28 is a weekly Safe Zone / Rest day");
assert(!isRest(1) && !isRest(6) && !isRest(8), "Training days are not rest days (1 rest day per week)");

var pRest = plan(7);
assert(pRest.rest === true, "Day 7 plan has rest: true");
assert(REST_PLAN.length === 7, "Recovery protocol has 7 checklist items");

// Check rest day checklist
S.restchk[7] = {0: true, 1: true, 2: true, 3: true, 4: true}; // 5 of 7 = 71.4% >= 70%
_ev = null;
var eRest = evalAll();
assert(eRest.days[7].pct >= 0.7, "Rest day completion 5/7 >= 70% (" + Math.round(eRest.days[7].pct*100) + "%)");
S.completed[7] = true;
_ev = null;
var eRestClear = evalAll();
assert(eRestClear.cleared === 2, "Rest day quest cleared without heavy lifting sets (cleared: " + eRestClear.cleared + "/30)");

// --------------------------------------------------
print("\n--- Test Suite 7: Leveling & Rank Progression to Shadow Monarch ---");
// --------------------------------------------------
assert(lvlOf(0) === 1, "0 EXP is Level 1");
assert(rankOf(1, false).k === 'E', "Level 1 is Rank E ('The Weakest Hunter')");
assert(rankOf(10, false).k === 'D', "Level 10 is Rank D ('Awakened Hunter')");
assert(rankOf(20, false).k === 'C', "Level 20 is Rank C ('Iron-Willed Hunter')");
assert(rankOf(30, false).k === 'B', "Level 30 is Rank B ('Elite Hunter')");
assert(rankOf(40, false).k === 'A', "Level 40 is Rank A ('Nation-Class Hunter')");
assert(rankOf(50, false).k === 'S', "Level 50 is Rank S ('S-Rank Hunter')");

// Shadow Monarch ascension
assert(rankOf(50, false).t === 'S-Rank Hunter', "Level 50 before Day 30 is S-Rank");
assert(rankOf(50, true).t === 'Shadow Monarch', "Level 50 + Day 30 cleared ascends to Shadow Monarch");

// --------------------------------------------------
print("\n--- Test Suite 8: JSON Backup & Storage Persistence ---");
// --------------------------------------------------
save();
var exported = localStorage.getItem(KEY);
assert(exported !== null && exported.length > 50, "State successfully saved to localStorage");
var parsed = JSON.parse(exported);
assert(parsed.hunter.awakened === true, "Persisted hunter awakening is true");
assert(parsed.completed[1] === true, "Persisted Day 1 completion status is intact");
assert(parsed.daily[1].water === 3250, "Persisted Day 1 water intake matches 3250 mL");

print("==================================================");
print("TEST RUN SUMMARY: " + passed + " PASSED, " + failed + " FAILED");
print("==================================================");

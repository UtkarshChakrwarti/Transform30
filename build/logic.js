
/* ============================================================
   HUNTER SYSTEM — gamified layer (Solo-Leveling style)
   ============================================================ */
// Rename floors (phases) in System language
['Floor 1 · Awakening','Floor 2 · Forging','Floor 3 · Trial','Floor 4 · Ascension'].forEach((n,i)=>{P[i].name=n;});
const FLOOR_LORE=['Learn the System. Build form. Establish your baseline.','Volume rises. The weak are filtered out here.','Heavy overload. Every compound lift gains a set.','Peak intensity. Break limits to claim the Monarch\'s throne.'];

const KEY='transform30_v1';
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const defState=()=>({v:2,start:null,gmode:'gym',modes:{},done:{},loads:{},completed:{},daily:{},meas:{},bench:{},restchk:{},
  profile:{sex:'male',age:24,h:170,w:73,act:1.55,goal:'cut',diet:'nonveg'},pb:{meal:0,p:'chicken',c:'rice',f:'ghee'},
  hunter:{name:'',awakened:false},seen:{},ach:{},redeem:{},pen:{},codexTab:'records',
  alarm:{on:false,from:'07:00',to:'22:00',every:30,sound:true,vib:true,lastSlot:-1,ntfyOn:false,ntfy:'',sched:{}}});
let S;
function load(){
  try{const r=localStorage.getItem(KEY);
    if(r){const o=JSON.parse(r),d=defState();
      const m=Object.assign(d,o);
      ['profile','pb','hunter','alarm'].forEach(k=>{m[k]=Object.assign(defState()[k],o[k]||{});});
      // players who used the earlier plain-tracker build skip nothing: they just see the awakening once
      return m;}
  }catch(e){console.warn(e)}
  return defState();
}
let _ev=null;
function save(){_ev=null;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){toast('[ALERT] Storage blocked or full','r');}}
S=load();
const TABS=['status','quests','dungeon','fuel','codex'];
let view=(location.hash||'#status').slice(1);if(!TABS.includes(view))view='status';
let selDay=null;

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const D=d=>(S.daily[d]=S.daily[d]||{});
const toMin=t=>{const [a,b]=String(t||'0:0').split(':');return (+a||0)*60+(+b||0);};
const daysSinceStart=()=>{if(!S.start)return 0;const a=new Date(S.start+'T00:00:00'),b=new Date(todayStr()+'T00:00:00');return Math.round((b-a)/864e5)+1;};
const curDay=()=>S.start?Math.min(30,Math.max(1,daysSinceStart())):1;
const dayMode=d=>S.modes[d]||S.gmode;
const key=(d,m)=>d+':'+m;
const pad2=n=>String(n).padStart(2,'0');

/* ---------- readiness + plan ---------- */
function readiness(d){
  const x=D(d);if(x.sleep==null||x.sore==null||x.energy==null||x.sleep===''||x.sore===''||x.energy==='')return {lvl:'full',score:null};
  const sl=x.sleep>=7?2:x.sleep>=6?1:0,so=x.sore<=2?2:x.sore==3?1:0,en=x.energy>=4?2:x.energy==3?1:0;
  const t=sl+so+en;return {lvl:t>=5?'full':t>=3?'mod':'low',score:t};
}
function planFor(d,mode){
  const type=typeOf(d);if(type==='rest')return {type,rest:true};
  const ph=phaseOf(d),W=WORKOUTS[type],r=readiness(d);
  const ex=W[mode].map(e=>{
    let s=e.s;
    if(ph.id===1)s=Math.max(e.s>1?2:1,s-1);
    if(ph.id>=3&&e.c)s+=1;
    if(r.lvl==='mod'&&s>1)s=Math.max(2,s-1);
    if(r.lvl==='low'&&s>1)s=Math.max(1,Math.round(s*0.6));
    const isIso=!e.c&&e.s>=2&&e.rest>0;
    return {...e,sets:s,tech:(ph.id===4&&isIso&&r.lvl==='full')};
  });
  return {type,rest:false,mode,ph,W,ex,r};
}
const plan=d=>planFor(d,dayMode(d));

/* ---------- nutrition / body maths ---------- */
function calc(p){
  const w=+p.w,h=+p.h,a=+p.age;if(!(w>20&&h>100&&a>10))return null;
  const bmr=10*w+6.25*h-5*a+(p.sex==='male'?5:-161),tdee=bmr*(+p.act);
  const adj={cut:-0.20,recomp:-0.10,maint:0,bulk:0.08}[p.goal];
  let kcal=tdee*(1+adj);const warn=[];
  const floor=Math.max(p.sex==='male'?1500:1200,bmr*0.95);
  if(kcal<floor){kcal=floor;warn.push('Calories were raised to a safe floor (≈ your resting energy). Do not eat lower than this.');}
  kcal=Math.round(kcal/10)*10;
  const gkg={cut:2.2,recomp:2.0,maint:1.8,bulk:1.8}[p.goal],prot=Math.round(w*gkg);
  let fat=Math.round(Math.max(w*0.8,kcal*0.2/9)),carb=Math.round((kcal-prot*4-fat*9)/4);
  if(carb<w*2){carb=Math.round(w*2);fat=Math.round((kcal-prot*4-carb*4)/9);if(fat<w*0.6){fat=Math.round(w*0.6);warn.push('Macros are tight for this calorie level — consider a smaller deficit.');}}
  const weekly=(tdee-kcal)*7;
  return {bmr:Math.round(bmr),tdee:Math.round(tdee),kcal,prot,carb,fat,fiber:Math.round(kcal/1000*14),water:+(w*0.037).toFixed(1),waterTrain:+(w*0.037+0.5).toFixed(1),
    est30:+((tdee-kcal)*30/7700).toFixed(1),pct:+(weekly/7700/w*100).toFixed(2),caff:Math.min(400,Math.round(w*3)),warn,rest:Math.round(tdee/10)*10};
}
function navyBF(m,p){
  const h=+p.h,w=+m.waist,n=+m.neck,hp=+m.hips;if(!(h&&w&&n))return null;let bf;
  if(p.sex==='male'){if(w<=n)return null;bf=495/(1.0324-0.19077*Math.log10(w-n)+0.15456*Math.log10(h))-450;}
  else{if(!hp||w+hp<=n)return null;bf=495/(1.29579-0.35004*Math.log10(w+hp-n)+0.221*Math.log10(h))-450;}
  return isFinite(bf)?Math.max(2,Math.min(60,bf)):null;
}

/* ---------- the System: XP, stats, ranks, titles ---------- */
const STATS=[['STR','Strength'],['AGI','Agility'],['VIT','Vitality'],['INT','Intelligence'],['SEN','Sense']];
const XP_DIV=45;
const cumXp=L=>Math.round(XP_DIV*Math.pow(L-1,1.5));
const lvlOf=xp=>Math.max(1,1+Math.floor(Math.pow(Math.max(0,xp)/XP_DIV,2/3)+1e-9));
const RANKS=[{k:'E',min:1,c:'#8ea8c8',t:'The Weakest Hunter'},{k:'D',min:10,c:'#35e0a1',t:'Awakened Hunter'},{k:'C',min:20,c:'#3db8ff',t:'Iron-Willed Hunter'},
  {k:'B',min:30,c:'#9b6bff',t:'Elite Hunter'},{k:'A',min:40,c:'#ff9f43',t:'Nation-Class Hunter'},{k:'S',min:50,c:'#ff4d6d',t:'S-Rank Hunter'}];
const MONARCH={k:'M',c:'#b28cff',t:'Shadow Monarch'};
const rankOf=(level,monarch)=>{if(monarch)return MONARCH;let r=RANKS[0];RANKS.forEach(x=>{if(level>=x.min)r=x;});return r;};
const SUBQ=[
 {id:'water',n:'Water Intake Target (3.2 L)',xp:30,st:'VIT',v:1.5,tag:'H2O',ok:(x,pr)=>(x.water||0)>=(pr?pr.waterTrain*1000:3200)},
 {id:'isabgol',n:'Isabgol Fiber (1 tbsp warm water)',xp:25,st:'VIT',v:1.5,tag:'FIBER',ok:x=>!!x.isabgol},
 {id:'steps',n:'8,000 Steps Active',xp:30,st:'AGI',v:1.5,tag:'STEPS',ok:x=>(+x.steps||0)>=8000},
 {id:'diet',n:'Indian Clean Diet Followed',xp:50,st:'VIT',v:2,tag:'DIET',ok:x=>!!x.diet},
 {id:'greenveg',n:'Green Veggies (Palak/Lauki/Beans)',xp:25,st:'VIT',v:1.5,tag:'GREENS',ok:x=>!!x.greenveg},
 {id:'sleep',n:'Sleep 7 h+',xp:30,st:'VIT',v:1.5,tag:'SLEEP',ok:x=>(+x.sleep||0)>=7},
 {id:'mob',n:'Mobility 8 min',xp:20,st:'SEN',v:1,tag:'MOBIL',ok:x=>!!x.mob},
 {id:'prot',n:'Protein Target (Chicken/Eggs/Dal)',xp:25,st:'STR',v:1.5,tag:'PROT',ok:(x,pr)=>!!pr&&(+x.prot||0)>=pr.prot*0.9}];
const PEN_TASKS=['50 bodyweight squats (any number of sets)','25 push-ups (knees allowed)','20-minute brisk walk or easy jog'];
const ACH=[
 ['first','First Gate','Clear your first Daily Quest','GATE',c=>c.cleared>=1],
 ['s3','Spark of Will','3-day clear streak','III',c=>c.best>=3],
 ['s7','Wolf of Resolve','7-day clear streak','VII',c=>c.best>=7],
 ['s14','Iron Will','14-day clear streak','XIV',c=>c.best>=14],
 ['s21','The Unbreakable','21-day clear streak','XXI',c=>c.best>=21],
 ['perf3','Flawless Hunter','3 perfect days (quest + every sub-quest)','PERF',c=>c.perfect>=3],
 ['perf10','Perfectionist','10 perfect days','MASTER',c=>c.perfect>=10],
 ['hyd','Water Mage','Hit the hydration goal on 7 days','H2O',c=>c.waterD>=7],
 ['diet','Iron Stomach','Follow the diet on 14 days','DIET',c=>c.dietD>=14],
 ['sleep','Well Rested','Sleep 7 h+ on 10 days','REST',c=>c.sleepD>=10],
 ['home','No Excuses','Clear a quest in Home mode','HOME',c=>c.homeClear>=1],
 ['redeem','Redeemed','Complete a Penalty Quest','PEN',c=>c.redeemed>=1],
 ['l10','Rank D Awakening','Reach level 10','RNK-D',c=>c.level>=10],
 ['l30','Elite Rising','Reach level 30','RNK-B',c=>c.level>=30],
 ['l50','S-Rank Hunter','Reach level 50','RNK-S',c=>c.level>=50],
 ['bench','Beyond Limits','Beat your Day-1 benchmark in any Rank Test','PR-UP',c=>c.benchUp],
 ['monarch','Shadow Monarch','Clear Day 30 at level 50 or higher','MONARCH',c=>c.monarch]];

function evalAll(){
  const pr=calc(S.profile),cd=curDay();
  let xp=0,streak=0,best=0,cleared=0,perfect=0,waterD=0,dietD=0,sleepD=0,homeClear=0,missed=0,redeemed=0;
  const st={STR:10,AGI:10,VIT:10,INT:10,SEN:10},days={};
  for(let d=1;d<=30;d++){
    const x=D(d),rest=isRest(d),done=!!S.completed[d];let dx=0,pct=0,mode=dayMode(d),subs=0;
    if(rest){
      const chk=S.restchk[d]||{},n=REST_PLAN.filter((_,i)=>chk[i]).length;
      dx+=n*12;st.VIT+=n;pct=n/REST_PLAN.length;
    }else{
      let bs=-1,bt=1,be=0;
      ['gym','home'].forEach(m=>{
        const p=planFor(d,m),a=S.done[key(d,m)]||{};let s=0,t=0,e=0;
        p.ex.forEach((ex,i)=>{const c=(a[i]||[]).slice(0,ex.sets).filter(Boolean).length;s+=c;t+=ex.sets;if(c===ex.sets&&ex.sets>0)e++;});
        if(s>bs||(s===bs&&m===dayMode(d))){bs=s;bt=t;mode=m;be=e;}
      });
      pct=bt?bs/bt:0;dx+=bs*8+be*10;
      if(typeOf(d)==='cond'){st.AGI+=bs*0.4+be*0.5;}else{st.STR+=bs*0.5+be*0.5;}
    }
    SUBQ.forEach(q=>{if(q.ok(x,pr)){dx+=q.xp;st[q.st]+=q.v;subs++;
      if(q.id==='water')waterD++;if(q.id==='diet')dietD++;if(q.id==='sleep')sleepD++;}});
    const rd=x.sleep!==undefined&&x.sleep!==''&&x.sore!==undefined&&x.sore!==''&&x.energy!==undefined&&x.energy!=='';
    if(rd)st.INT+=1.5;if(x.weight)st.INT+=1;if(x.note)st.INT+=0.5;
    const isPerfect=done&&subs===SUBQ.length;
    if(done){
      streak++;best=Math.max(best,streak);cleared++;
      dx+=(rest?60:100)+Math.min(50,5*streak);st.SEN+=2;
      if(isPerfect){dx+=100;st.SEN+=3;perfect++;}
      if(!rest&&mode==='home')homeClear++;
    }else if(d<cd&&!rest){
      streak=0;missed++;
      if(S.redeem[d]){dx+=20;redeemed++;}else dx-=40;
    }
    xp+=dx;days[d]={pct,subs,done,xp:dx,rest,perfect:isPerfect};
  }
  CHECKPOINTS.forEach(c=>{const m=S.meas[c]||{};const n=MEAS.filter(([k])=>k!=='weight'&&m[k]!==undefined&&m[k]!=='').length+(D(c).weight?1:0);if(n>=5){xp+=40;st.INT+=4;}});
  [1,15,30].forEach(c=>{const b=S.bench[c]||{};const n=BENCH.filter(([k])=>b[k]!==undefined&&b[k]!=='').length;if(n>=3){xp+=40;st.INT+=4;}});
  xp=Math.max(0,Math.round(xp));
  Object.keys(st).forEach(k=>st[k]=Math.round(st[k]));
  const level=lvlOf(xp),monarch=!!S.completed[30]&&level>=50;
  const b1=S.bench[1]||{},benchUp=BENCH.some(([k])=>[15,30].some(c=>{const v=(S.bench[c]||{})[k];return v!==undefined&&v!==''&&b1[k]!==undefined&&b1[k]!==''&&+v>+b1[k];}));
  return {xp,level,rank:rankOf(level,monarch),monarch,stats:st,streak,best,cleared,perfect,waterD,dietD,sleepD,homeClear,missed,redeemed,benchUp,days,
    cur:cumXp(level),next:cumXp(level+1)};
}
const ev=()=>_ev||(_ev=evalAll());
const canClear=d=>d<=curDay()&&ev().days[d].pct>=0.7;
const pendingPenalty=()=>{const cd=curDay();for(let d=1;d<cd;d++){if(!isRest(d)&&!S.completed[d]&&!S.redeem[d])return d;}return 0;};
const questPending=()=>!!S.start&&S.hunter.awakened&&daysSinceStart()>=1&&daysSinceStart()<=30&&!S.completed[curDay()];
const snap=()=>{const e=ev();return {xp:e.xp,level:e.level,rank:e.rank.k,stats:{...e.stats}};};

/* ============================================================
   FEEDBACK: sound, haptics, toast, overlays
   ============================================================ */
let actx=null;
function tone(f,t,dur,vol,type){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.frequency.value=f;o.connect(g);g.connect(actx.destination);
  const s=actx.currentTime+t;g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(vol||.15,s+.02);g.gain.exponentialRampToValueAtTime(.0001,s+dur);o.start(s);o.stop(s+dur+.05);}catch(_){}}
function sfx(k){
  if(!S.alarm.sound)return;
  if(k==='tick'){tone(660,0,.12,.1);}
  else if(k==='ding'){tone(880,0,.18,.12);tone(1320,.12,.3,.12);}
  else if(k==='sys'){tone(520,0,.12,.1,'triangle');tone(780,.1,.12,.1,'triangle');tone(1040,.2,.25,.1,'triangle');}
  else if(k==='level'){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.11,.3,.12,'triangle'));}
  else if(k==='alarm'){[0,.35,.7].forEach(t=>{tone(880,t,.18,.16,'square');tone(660,t+.18,.16,.16,'square');});}
}
const buzz=p=>{if(S.alarm.vib&&navigator.vibrate)try{navigator.vibrate(p);}catch(_){}};
function toast(m,c){const r=$('#toasts'),t=document.createElement('div');t.className='toast '+(c||'');t.textContent=m;r.appendChild(t);setTimeout(()=>{t.remove();},2400);}
const reduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function typeInto(el,html,cb){
  // type visible characters, keep tags intact
  if(!el)return;if(reduced()){el.innerHTML=html;cb&&cb();return;}
  let i=0,out='',inTag=false;el.classList.add('caret');
  const step=()=>{
    if(i>=html.length){el.classList.remove('caret');cb&&cb();return;}
    let n=0;while(i<html.length&&n<2){const c=html[i++];out+=c;if(c==='<')inTag=true;if(c==='>')inTag=false;if(!inTag)n++;}
    el.innerHTML=out;setTimeout(step,16);};
  step();
}
let winQ=[];
function ovRoot(){return $('#overlay');}
function pushWin(fn){winQ.push(fn);if(!ovRoot().children.length)nextWin();}
function nextWin(){const f=winQ.shift();if(f)f();}
function openWin(inner,o){
  o=o||{};const w=document.createElement('div');w.className='ovl '+(o.sheet?'sheet ':'')+(o.cls||'');
  w.innerHTML=`<div class="scrim" ${o.lock?'':'data-a="closewin"'}></div><div class="win"><div class="sw ${o.tone||''}">${o.sheet?'<div class="grab"></div>':''}${inner}</div></div>`;
  ovRoot().appendChild(w);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add('in')));return w;
}
function closeWin(){
  const r=ovRoot(),l=r.lastElementChild;if(!l){nextWin();return;}
  l.classList.remove('in');setTimeout(()=>{l.remove();if(!r.children.length)nextWin();},260);
}
function sysWin(title,msgHtml,buttons,o){
  o=o||{};
  const w=openWin(`<div class="wt">${title}</div><div class="sysmsg" id="typed"></div><div class="btn-row" style="margin-top:16px" id="wbtns" ${o.noType?'':'hidden'}>${buttons}</div>`,o);
  const t=w.querySelector('#typed'),b=w.querySelector('#wbtns');
  sfx('sys');buzz([30,40,30]);
  if(o.noType){t.innerHTML=msgHtml;}else typeInto(t,msgHtml,()=>{b.hidden=false;});
  return w;
}

/* ============================================================
   RENDER — shell
   ============================================================ */
const app=$('#app');
const TITLES={status:['Status','HUNTER'],quests:['Daily Quest','QUEST'],dungeon:['Dungeon','GATE'],fuel:['Provisions','NUTRITION'],codex:['Codex','ARCHIVE']};
function render(keepScroll){
  const y=window.scrollY;
  app.innerHTML=`<div class="view">${{status:rStatus,quests:rQuests,dungeon:rDungeon,fuel:rFuel,codex:rCodex}[view]()}</div>`;
  document.querySelectorAll('#tabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.v===view));
  $('#barTitle').textContent=TITLES[view][0];$('#barChip').textContent='SYSTEM · '+TITLES[view][1];
  updateBadges();
  if(view==='codex'&&S.codexTab==='records')drawChart();
  window.scrollTo(0,keepScroll?y:0);
}
function updateBadges(){
  const pend=questPending();
  $('#questDot').hidden=!pend;
  const bd=$('#bellDot');bd.hidden=!(pend||S.alarm.on);bd.classList.toggle('on',!!S.alarm.on);
  try{if(navigator.setAppBadge){pend?navigator.setAppBadge(1):navigator.clearAppBadge();}}catch(_){}
}
function setView(v,noscroll){view=v;try{history.replaceState(null,'','#'+v);}catch(_){}render(noscroll);}

/* ---------- small UI helpers ---------- */
const bar=(pct,cls)=>`<div class="bar2 ${cls||''}"><i style="width:${Math.round(Math.max(0,Math.min(1,pct))*100)}%"></i></div>`;
const chk=on=>`<span class="chk ${on?'on':''}">✓</span>`;
function radar(st){
  const keys=STATS.map(s=>s[0]),max=Math.max(60,...keys.map(k=>st[k]))*1.12,cx=150,cy=128,R=92;
  const pt=(i,f)=>{const a=-Math.PI/2+i*2*Math.PI/5;return [cx+R*f*Math.cos(a),cy+R*f*Math.sin(a)];};
  const ring=f=>keys.map((_,i)=>pt(i,f).map(n=>n.toFixed(1)).join(',')).join(' ');
  const poly=keys.map((k,i)=>pt(i,st[k]/max).map(n=>n.toFixed(1)).join(',')).join(' ');
  const spokes=keys.map((_,i)=>{const p=pt(i,1);return `<line x1="${cx}" y1="${cy}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" stroke="rgba(61,184,255,.22)"/>`;}).join('');
  const labels=keys.map((k,i)=>{const p=pt(i,1.27);return `<text x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="12" font-weight="700" fill="#8ceaff">${k} ${st[k]}</text>`;}).join('');
  return `<svg class="radar" viewBox="0 0 300 260" role="img" aria-label="Stat radar"><defs><linearGradient id="rdg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ceaff" stop-opacity=".55"/><stop offset="1" stop-color="#1f7bff" stop-opacity=".35"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
   ${[.25,.5,.75,1].map(f=>`<polygon points="${ring(f)}" fill="none" stroke="rgba(61,184,255,${f===1?.45:.2})"/>`).join('')}${spokes}
   <polygon points="${poly}" fill="url(#rdg)" stroke="#8ceaff" stroke-width="2" filter="url(#gl)"/>${labels}</svg>`;
}
function hexRank(r,size){return `<div class="rankhex" style="--rc:${r.c};${size?`width:${size}px;height:${Math.round(size*1.1)}px;font-size:${Math.round(size*.48)}px`:''}"><span>${r.k==='M'?'M':r.k}</span></div>`;}
const fmtXp=n=>n.toLocaleString('en-US');
const midnightLeft=()=>{const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.max(0,Math.floor((m-n)/60000));return Math.floor(s/60)+'h '+pad2(s%60)+'m';};

/* ============================================================
   STATUS
   ============================================================ */
function rStatus(){
  const e=ev(),cd=curDay(),r=e.rank,x=D(cd),pr=calc(S.profile);
  const rd=readiness(cd),hp=rd.score==null?100:Math.round(40+rd.score*10);
  const wl=x.water||0,tgt=pr?pr.waterTrain*1000:3200;
  const mp=pr?Math.min(100,Math.round(wl/tgt*100)):0;
  const pend=pendingPenalty(),isRestToday=isRest(cd);
  const pct=(e.xp-e.cur)/Math.max(1,e.next-e.cur);
  const name=S.hunter.name||'Player';
  if(!S.hunter.awakened){
    return `<div class="awaken-hero">
      <img src="icons/jinwoo.jpg" class="awaken-hero-bg" alt="Sung Jin-Woo">
      <div class="awaken-hero-overlay"></div>
      <div class="awaken-hero-top"><span>⚡</span> AWAKEN</div>
      <div class="awaken-hero-content">
        <h1 class="awaken-hero-title">YOUR AWAKENING BEGINS NOW!</h1>
        <p class="awaken-hero-sub">Walk your path. Take action. Conquer.<br>Become a legend!</p>
        <button class="btn awaken-hero-btn" data-a="aw-yes">Get Started</button>
      </div>
    </div>`;
  }
  let h=`<div class="large cinzel"><small>[ PLAYER STATUS ]</small>Status</div>`;
  h+=`<section class="sw ${e.monarch?'violet':''}" style="position:relative">
    <div style="position:absolute;top:14px;right:14px;display:flex;align-items:center;gap:8px">
      <img src="icons/jinwoo.jpg" style="width:38px;height:38px;object-fit:cover;border-radius:0;border:1px solid rgba(155,107,255,0.4);box-shadow:0 0 10px rgba(155,107,255,0.3)" alt="Avatar">
    </div>
    <div class="wt">Player</div>
    <div class="hunter">${hexRank(r)}<div><div class="hname">${esc(name)}</div><div class="htitle">${r.t}</div>
      <div class="lvl"><small>LEVEL</small>${e.level}</div></div></div>
    <div class="kv"><span>EXP</span><b>${fmtXp(e.xp)} / ${fmtXp(e.next)}</b></div>${bar(pct)}
    <div class="grid2" style="margin-top:14px"><div><div class="kv"><span>HP · RECOVERY</span><b>${hp}%</b></div>${bar(hp/100,hp<60?'r':'g')}</div>
      <div><div class="kv"><span>MP · HYDRATION</span><b>${(wl/1000).toFixed(2)} / ${(tgt/1000).toFixed(1)} L (${mp}%)</b></div>${bar(mp/100,'v')}</div></div>
    <div class="row" style="padding:10px 0 0;border:0;justify-content:space-between;align-items:center">
      <span class="tiny mono">[QUICK MANA]</span>
      <div style="display:flex;gap:6px">
        <button class="btn sm" data-a="water" data-d="${cd}" data-v="250">+250 mL</button>
        <button class="btn sm" data-a="water" data-d="${cd}" data-v="500">+500 mL</button>
      </div>
    </div></section>`;
  if(pend){h+=`<section class="sw warn"><div class="wt">Penalty</div><h2>Day ${pend} quest failed</h2><p class="sub" style="margin:6px 0 12px">−40 EXP and your streak was broken. Complete the Penalty Quest to cancel the penalty and earn +20 EXP.</p><button class="btn red" data-a="goto" data-d="${cd}">View penalty quest</button></section>`;}
  if(questPending()){
    const dd=e.days[cd],p=plan(cd);
    h+=`<section class="sw"><div class="wt">Daily quest</div><div class="row" style="padding:0;border:0"><div class="grow"><h2>${isRestToday?'Recovery Quest':esc(p.W.short+' Training')}</h2><div class="sub">Day ${cd} · ${Math.round(dd.pct*100)}% complete · ${midnightLeft()} left today</div></div>${isRestToday?'<span class="pill g">Safe zone</span>':`<span class="pill ${p.ph.cls==='b3'?'o':'v'}">${esc(p.ph.name.split(' · ')[0])}</span>`}</div>
      <div style="margin:12px 0">${bar(dd.pct,dd.pct>=0.7?'g':'')}</div>
      <button class="btn pri" data-a="goto" data-d="${cd}">Enter quest</button></section>`;
  }else if(S.start){
    h+=`<section class="sw gold"><div class="wt">Quest cleared</div><h2>${S.completed[cd]?'Day '+cd+' cleared':'Dungeon complete'}</h2><p class="sub" style="margin-top:6px">${cd>=30&&S.completed[30]?'You finished the 30-day dungeon.':'Rest, eat, and be ready. The next quest arrives at midnight.'}</p></section>`;
  }
  h+=`<section class="sw"><div class="wt">Attributes</div>${radar(e.stats)}<div class="stats">${STATS.map(([k,n])=>`<div class="stat"><span class="k">${k}</span>${bar(Math.min(1,e.stats[k]/Math.max(60,...Object.values(e.stats))))}<span class="n">${e.stats[k]}</span></div>`).join('')}</div>
    <p class="tiny" style="margin-top:10px">STR ← lifting sets · AGI ← HIIT &amp; steps · VIT ← diet, water, sleep, rest · INT ← logging &amp; tests · SENSE ← streaks &amp; mobility</p></section>`;
  const lvPct=Math.min(1,e.level/50);
  h+=`<section class="sw violet"><div class="wt">Path of the Monarch</div>
    <div class="row" style="padding:0;border:0;gap:14px">${hexRank(MONARCH,64)}<div class="grow"><h2>Shadow Monarch</h2><div class="sub">Reach <b>level 50</b> and clear <b>Day 30</b>.</div></div></div>
    <div class="kv" style="margin-top:12px"><span>LEVEL</span><b>${e.level} / 50</b></div>${bar(lvPct,'v')}
    <div class="kv"><span>DAY 30 GATE</span><b>${S.completed[30]?'CLEARED':'LOCKED'}</b></div>
    <p class="tiny" style="margin-top:6px">${e.level>=50?(S.completed[30]?'You are the Monarch.':'Level requirement met. Clear Day 30 to ascend.'):`${fmtXp(Math.max(0,cumXp(50)-e.xp))} EXP to go. Perfect days (quest + all sub-quests) give the most EXP.`}</p></section>`;
  h+=`<div class="tgrid"><div class="bigstat"><span>Streak</span><b>${e.streak} D</b></div><div class="bigstat"><span>Cleared</span><b>${e.cleared}/30</b></div>
    <div class="bigstat"><span>Perfect days</span><b>${e.perfect}</b></div><div class="bigstat"><span>Titles</span><b>${Object.keys(S.ach).length}/${ACH.length}</b></div></div>`;
  return h;
}

/* ============================================================
   WATER INTAKE CONSOLE & QUESTS
   ============================================================ */
function waterCounterBox(d,x,pr){
  const wl=x.water||0,tgt=pr?pr.waterTrain*1000:3200;
  const pct=Math.min(100,Math.round(wl/tgt*100));
  const rem=Math.max(0,tgt-wl);
  const done=wl>=tgt;
  return `<section class="sw ${done?'gold':''}"><div class="wt">Water Intake Counter · Mana Pool</div>
    <div class="row" style="padding:0;border:0;align-items:baseline">
      <div class="grow">
        <div style="font:800 26px var(--mono);color:var(--cyan);letter-spacing:-.02em;text-shadow:0 0 12px rgba(61,184,255,.6)">${wl.toLocaleString()} <span style="font-size:14px;color:var(--mut);font-weight:600">/ ${tgt.toLocaleString()} mL</span></div>
        <div class="sub" style="font-size:12.5px;margin-top:3px">${done?'[GOAL REACHED] Max Mana Pool active (+30 EXP)':`${rem.toLocaleString()} mL remaining to hit target`} · ${pct}%</div>
      </div>
      <span class="pill ${done?'g':'o'}">${pct}%</span>
    </div>
    <div style="margin:10px 0 12px">${bar(pct/100,done?'g':'v')}</div>
    <div class="grid3" style="gap:6px">
      <button class="btn sm" data-a="water" data-d="${d}" data-v="250">+250 mL <span class="tiny mono">[Glass]</span></button>
      <button class="btn sm" data-a="water" data-d="${d}" data-v="500">+500 mL <span class="tiny mono">[Bottle]</span></button>
      <button class="btn sm" data-a="water" data-d="${d}" data-v="750">+750 mL <span class="tiny mono">[Shaker]</span></button>
    </div>
    <div class="btn-row" style="margin-top:6px;gap:6px">
      <button class="btn sm" data-a="water" data-d="${d}" data-v="1000" style="flex:2">+1000 mL [1L Jug]</button>
      <button class="btn sm" data-a="water" data-d="${d}" data-v="-250" style="flex:1" ${wl<=0?'disabled':''}>−250 mL</button>
      <button class="btn sm red" data-a="water-reset" data-d="${d}" style="flex:1" ${wl<=0?'disabled':''}>Reset</button>
    </div>
  </section>`;
}

function openQuestInfoModal(d){
  const cd=d||curDay(),x=D(cd),pr=calc(S.profile),p=plan(cd);
  const mode=p.mode,sd=S.done[key(cd,mode)]||{};
  const wl=x.water||0,tgt=pr?pr.waterTrain*1000:3200;
  
  let list='';
  if(p.rest){
    const ck=S.restchk[cd]||{};
    list=REST_PLAN.map((t,i)=>{
      const ok=!!ck[i];
      return `<div class="quest-item-row"><div style="flex:1"><span class="quest-item-name">${esc(t)}</span><div style="font-size:11.5px;color:var(--mut)">Recovery Protocol</div></div><span class="quest-item-val">[ ${ok?'1 / 1':'0 / 1'} ]</span><span class="chk ${ok?'on':''}">${ok?'✓':''}</span></div>`;
    }).join('');
  } else {
    list=p.ex.map((q,i)=>{
      const a=sd[i]||[];
      const doneSets=a.slice(0,q.sets).filter(Boolean).length;
      const all=q.sets>0&&doneSets===q.sets;
      return `<div class="quest-item-row">
        <div style="flex:1"><span class="quest-item-name">${esc(q.n)}</span><div style="font-size:11.5px;color:var(--mut)">Daily Quest · ${esc(q.r)}</div></div>
        <span class="quest-item-val">[ ${doneSets} / ${q.sets} ]</span>
        <span class="chk ${all?'on':''}">${all?'✓':''}</span>
      </div>`;
    }).join('');
  }
  
  const wDone=wl>=tgt;
  list+=`<div class="quest-item-row">
    <div style="flex:1"><span class="quest-item-name">Water Intake (Mana Pool)</span><div style="font-size:11.5px;color:var(--mut)">Daily Hydration</div></div>
    <span class="quest-item-val">[ ${(wl/1000).toFixed(1)} / ${(tgt/1000).toFixed(1)} L ]</span>
    <span class="chk ${wDone?'on':''}">${wDone?'✓':''}</span>
  </div>`;

  const sDone=(x.steps||0)>=8000;
  list+=`<div class="quest-item-row">
    <div style="flex:1"><span class="quest-item-name">Daily Footsteps (Agility)</span><div style="font-size:11.5px;color:var(--mut)">Active Movement</div></div>
    <span class="quest-item-val">[ ${x.steps||0} / 8000 ]</span>
    <span class="chk ${sDone?'on':''}">${sDone?'✓':''}</span>
  </div>`;

  const dDone=!!x.diet&&!!x.greenveg;
  list+=`<div class="quest-item-row">
    <div style="flex:1"><span class="quest-item-name">Indian Fuel &amp; Greens (Vitality)</span><div style="font-size:11.5px;color:var(--mut)">Nutrition Protocol</div></div>
    <span class="quest-item-val">[ ${dDone?'1 / 1':'0 / 1'} ]</span>
    <span class="chk ${dDone?'on':''}">${dDone?'✓':''}</span>
  </div>`;

  openWin(`<div class="sw violet quest-modal-win">
    <div class="quest-modal-top">
      <div class="quest-info-tag"><span>[i]</span> QUEST INFO</div>
      <button class="icon-btn" data-a="closewin" style="width:32px;height:32px;min-height:32px">✕</button>
    </div>
    <p class="sub" style="font-size:13px;color:#c8adff;margin:8px 0">[Daily Quest: ${p.rest?'Recovery Protocol':esc(p.W.title)} has Arrived.]</p>
    <div class="quest-goal-title">GOAL</div>
    <div class="group" style="margin:12px 0 0;background:rgba(10,7,18,0.7)">
      ${list}
    </div>
    <div class="quest-warn-box">
      WARNING: Failure to complete the daily quest will result in an appropriate penalty.
    </div>
    <button class="btn pri" data-a="closewin" style="margin-top:14px;background:linear-gradient(135deg,#9b6bff,#6a3df0);color:#fff">[ PROCEED ]</button>
  </div>`,{sheet:true});
}

function rQuests(){
  const cd=curDay(),d=selDay??cd,locked=d>cd||!S.hunter.awakened,e=ev(),x=D(d),pr=calc(S.profile),p=plan(d),dd=e.days[d];
  if(!S.hunter.awakened){
    return `<div class="awaken-hero">
      <img src="icons/jinwoo.jpg" class="awaken-hero-bg" alt="Sung Jin-Woo">
      <div class="awaken-hero-overlay"></div>
      <div class="awaken-hero-top"><span>⚡</span> AWAKEN</div>
      <div class="awaken-hero-content">
        <h1 class="awaken-hero-title">YOUR AWAKENING BEGINS NOW!</h1>
        <p class="awaken-hero-sub">Walk your path. Take action. Conquer.<br>Become a legend!</p>
        <button class="btn awaken-hero-btn" data-a="aw-yes">Get Started</button>
      </div>
    </div>`;
  }
  let h=`<div class="large cinzel" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <span>DAILY QUESTS</span>
    <button class="btn sm pri" data-a="questinfo" data-d="${d}" style="width:auto;padding:0 12px;font-size:11px;letter-spacing:.12em">[ QUEST INFO ]</button>
  </div>`;
  h+=`<div class="row" style="padding:0 2px 12px;border:0"><button class="btn sm" data-a="prev" ${d<=1?'disabled':''} aria-label="Previous day">‹</button>
    <div class="grow" style="text-align:center"><div class="mono glowtxt" style="font-size:15px;letter-spacing:.14em">DAY ${d} / 30</div><div class="tiny">${d===cd&&S.start?'TODAY':d<cd?'PAST GATE':'LOCKED GATE'}</div></div>
    <button class="btn sm" data-a="next" ${d>=30?'disabled':''} aria-label="Next day">›</button></div>`;
  if(locked)h+=`<div class="note w mono">GATE LOCKED — this quest opens on Day ${d}. You may preview it below.</div>`;
  /* penalty quest */
  const pend=pendingPenalty();
  if(pend&&d===cd){
    const pw=S.pen[pend]||{};
    h+=`<section class="sw warn"><div class="wt">Penalty quest</div><h2>Day ${pend} was not cleared</h2><p class="sub" style="margin:6px 0 8px">The System demands redemption. Finish all three tasks (safely, with proper form) to remove the −40 EXP penalty.</p>
      <div class="group" style="margin:0 0 8px">${PEN_TASKS.map((t,i)=>`<button class="row" style="width:100%;text-align:left" data-a="pen" data-m="${pend}" data-i="${i}"><span class="grow lab">${t}</span>${chk(pw[i])}</button>`).join('')}</div>
      <p class="tiny">Stop if you feel pain, dizziness or chest discomfort.</p></section>`;
  }
  if(p.rest){
    const ck=S.restchk[d]||{};
    h+=`<section class="sw violet"><div class="wt">Safe zone</div><div class="row" style="padding:0;border:0"><div class="grow"><h2 class="cinzel">[SAFE ZONE] Recovery Protocol</h2><div class="sub">Day ${d} · rest &amp; rebuild · 1 Safe Zone per week</div></div><button class="btn sm pri" data-a="questinfo" data-d="${d}" style="width:auto;padding:0 10px">[ INFO ]</button></div>
      <p class="sub" style="margin:10px 0">Muscle is built while you recover. Do the checklist — a full ${REST_PLAN.length} gives max EXP.</p>
      <div class="group" style="margin:0">${REST_PLAN.map((t,i)=>`<button class="row" style="width:100%;text-align:left" data-a="restchk" data-d="${d}" data-i="${i}"><span class="grow" style="font-size:15px">${esc(t)}</span><span class="xp">+12</span>${chk(ck[i])}</button>`).join('')}</div>
      <details class="acc" style="margin-top:12px"><summary>[MOBILITY] Recovery Protocol (15 min)</summary><ul>${MOBILITY.map(m=>`<li>${m}</li>`).join('')}</ul></details></section>`;
  }else{
    const mode=p.mode,ph=p.ph,sd=S.done[key(d,mode)]||{},ld=S.loads[key(d,mode)]||{};
    const tot=p.ex.reduce((a,q)=>a+q.sets,0),dn=p.ex.reduce((a,q,i)=>a+((sd[i]||[]).slice(0,q.sets).filter(Boolean).length),0);
    h+=`<section class="sw violet">
      <div class="row" style="padding:0;border:0;align-items:center;justify-content:space-between">
        <div class="grow">
          <div class="wt">[QUEST · FLOOR ${ph.id}]</div>
          <h2 class="cinzel" style="font-size:22px;color:#f4efff">${esc(p.W.title)}</h2>
          <div class="sub" style="font-size:12.5px;margin-top:3px">Day ${d} / 30 · ${tot} Sets · ${Math.round(dd.pct*100)}% Complete</div>
        </div>
        <button class="btn sm pri" data-a="questinfo" data-d="${d}" style="width:auto;padding:0 12px;font-size:11px;background:linear-gradient(135deg,#9b6bff,#6a3df0);color:#fff">[ INFO ]</button>
      </div>
      <p class="tiny" style="margin:8px 0 10px">${esc(FLOOR_LORE[ph.id-1])}</p>
      <div class="seg ${mode==='home'?'home':''}" role="group" aria-label="Training location"><button class="${mode==='gym'?'on':''}" data-a="daymode" data-m="gym" data-d="${d}">GYM MODE</button><button class="${mode==='home'?'on':''}" data-a="daymode" data-m="home" data-d="${d}">HOME MODE (NO EQUIPMENT)</button></div>
      <div class="kv" style="margin-top:12px"><span>PROGRESS</span><b>${dn}/${tot} sets · ${Math.round(dd.pct*100)}%</b></div>${bar(dd.pct,dd.pct>=.7?'g':'')}
      <div class="row" style="padding:10px 0 0;border:0;gap:6px;flex-wrap:wrap"><span class="pill o">Up to +${tot*8+p.ex.length*10+100} EXP</span><span class="pill">${p.type==='cond'?'AGI':'STR'} growth</span>${(d===1||d===30)?'<span class="pill v">Rank test day</span>':''}</div></section>`;
    if(d===1||d===30)h+=`<div class="note i">[ASSESSMENT] <b>Rank Test:</b> record push-ups, pull-ups, squats, plank and burpees in <a href="#codex" data-a="goto-codex">Codex → Records</a>. ${d===30?'Compare with Day 1 to unlock “Beyond Limits”.':''}</div>`;
    /* fatigue scan */
    const rdn=p.r,lv=rdn.lvl;
    h+=`<div class="wt" style="margin:16px 4px 8px">Fatigue scan</div><div class="group"><div class="row"><span class="grow lab">Sleep last night</span><input type="number" inputmode="decimal" min="0" max="14" step="0.5" placeholder="h" data-f="daily" data-d="${d}" data-k="sleep" value="${x.sleep??''}"></div>
      <div class="row"><span class="grow lab">Muscle soreness</span><select data-f="daily" data-d="${d}" data-k="sore"><option value="">—</option>${[[1,'1 · Fresh'],[2,'2 · Mild'],[3,'3 · Moderate'],[4,'4 · High'],[5,'5 · Very high']].map(([v,l])=>`<option value="${v}" ${x.sore==v?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="row"><span class="grow lab">Energy / mood</span><select data-f="daily" data-d="${d}" data-k="energy"><option value="">—</option>${[[1,'1 · Drained'],[2,'2 · Low'],[3,'3 · Okay'],[4,'4 · Good'],[5,'5 · Great']].map(([v,l])=>`<option value="${v}" ${x.energy==v?'selected':''}>${l}</option>`).join('')}</select></div></div>
      <div class="note ${lv==='full'?'g':lv==='mod'?'w':'b'} mono">${lv==='full'?(rdn.score==null?'SCAN PENDING — default: full quest.':'STATUS GREEN — full quest.'):lv==='mod'?'STATUS AMBER — −1 set per exercise applied below.':'STATUS RED — reduced quest (~60% sets, RPE 6). Train light, never skip. Fever, chest pain or sharp pain: stop.'}</div>`;
    h+=`<details class="acc"><summary>[WARM-UP] Dynamic Preparation (8–10 min)</summary><ul>${WARM[p.type].map(w=>`<li>${esc(w)}</li>`).join('')}</ul></details>`;
    
    let planExHtml = '', compExHtml = '';
    p.ex.forEach((q,i)=>{
      const a=sd[i]||[],doneSets=a.slice(0,q.sets).filter(Boolean).length;
      const all=q.sets>0&&doneSets===q.sets;
      const card=`<div class="ex ${all?'done':''}" style="margin-bottom:10px">
        <div class="ex-h">
          <div class="exn">${i+1}</div>
          <div class="grow">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <h4>${esc(q.n)}</h4>
              <span class="quest-item-val" style="font-size:13px">[ ${doneSets} / ${q.sets} ]</span>
            </div>
            <div class="meta">${q.sets} × ${esc(q.r)}${q.rest?' · rest '+q.rest+'s':''}</div>
          </div>
        </div>
        <p class="tip">${esc(q.tip)}</p>
        ${q.tech?`<p class="tech">[PEAK INTENSITY]: ${mode==='gym'?'last set → drop-set (−25% load, near failure).':'last set → rest-pause (near failure, 15 s rest, repeat twice).'}</p>`:''}
        <div class="sets">${Array.from({length:q.sets},(_,j)=>`<button class="setb ${a[j]?'on':''}" data-a="set" data-d="${d}" data-m="${mode}" data-i="${i}" data-j="${j}" data-rest="${q.rest}" aria-label="Set ${j+1}">${a[j]?'✓':j+1}</button>`).join('')}</div>
        <input class="load" type="text" placeholder="Log load / notes (e.g. 60 kg × 8, 8, 7)" data-f="load" data-d="${d}" data-m="${mode}" data-i="${i}" value="${esc(ld[i]||'')}">
      </div>`;
      if(all) compExHtml += card;
      else planExHtml += card;
    });

    h += `<div class="section-hdr"><span>PLAN</span><span class="tiny mono">[PENDING]</span></div>`;
    h += planExHtml || `<div class="empty" style="padding:12px;font-size:13px;color:var(--green)">[ALL EXERCISES IN THIS QUEST CLEARED]</div>`;
    
    h += `<div class="section-hdr"><span>COMPLETED</span><span class="tiny mono" style="color:var(--green)">[CLEARED]</span></div>`;
    h += compExHtml || `<div class="empty" style="padding:10px;font-size:12.5px;color:var(--mut2)">Complete sets in PLAN above to log clears here.</div>`;

    h+=`<details class="acc" style="margin-top:14px"><summary>[COOL-DOWN] Post-Workout Recovery (5–8 min)</summary><ul>${COOL.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></details>`;
  }
  /* water counter & sub-quests */
  const wl=x.water||0,tgt=pr?pr.waterTrain*1000:3200;
  h+=waterCounterBox(d,x,pr);
  const sq=(q,right)=>{const ok=q.ok(x,pr);return `<div class="row"><span class="tag-badge ${q.st.toLowerCase()}">${q.tag}</span><div class="grow"><div class="lab">${q.n}</div><div class="hint">${right[0]}</div></div>${right[1]}<span class="xp">+${q.xp}</span>${chk(ok)}</div>`;};
  const [Q_w,Q_isab,Q_s,Q_d,Q_gveg,Q_sl,Q_m,Q_p]=SUBQ;
  const wpct=Math.min(100,Math.round(wl/tgt*100));
  h+=`<div class="wt" style="margin:18px 4px 8px">Daily Tasks &amp; Sub-quests</div><div class="group">
    ${sq(Q_w,[`${wl.toLocaleString()} / ${tgt.toLocaleString()} mL (${wpct}%)`,`<button class="btn sm" data-a="water" data-d="${d}" data-v="250">+250</button><button class="btn sm" data-a="water" data-d="${d}" data-v="500">+500</button>`])}
    ${sq(Q_isab,['1 tbsp (7g) in warm water (morning/bedtime)',`<button class="sw-toggle ${x.isabgol?'on':''}" data-a="tog" data-d="${d}" data-k="isabgol" aria-label="Isabgol taken"></button>`])}
    ${sq(Q_s,['Walk, climb stairs, stay active',`<input type="number" inputmode="numeric" min="0" step="100" placeholder="steps" data-f="daily" data-d="${d}" data-k="steps" value="${x.steps??''}" style="max-width:96px">`])}
    ${sq(Q_d,['Followed self-cooked Indian meal plan',`<button class="sw-toggle ${x.diet?'on':''}" data-a="tog" data-d="${d}" data-k="diet" aria-label="Diet followed"></button>`])}
    ${sq(Q_gveg,['Palak, Methi, Lauki, Bhindi, Beans or Capsicum',`<button class="sw-toggle ${x.greenveg?'on':''}" data-a="tog" data-d="${d}" data-k="greenveg" aria-label="Green veggies eaten"></button>`])}
    ${sq(Q_sl,[`Logged: ${x.sleep||'—'} h (Fatigue scan)`,''])}
    ${sq(Q_m,['Nightly 8-min joint mobility routine',`<button class="sw-toggle ${x.mob?'on':''}" data-a="tog" data-d="${d}" data-k="mob" aria-label="Mobility done"></button>`])}
    ${sq(Q_p,[pr?`Target ${pr.prot}g (Chicken/Eggs/Dal)`:'Set profile in Provisions',`<input type="number" inputmode="numeric" min="0" placeholder="g" data-f="daily" data-d="${d}" data-k="prot" value="${x.prot??''}" style="max-width:84px">`])}</div>`;
  h+=`<div class="wt" style="margin:18px 4px 8px">Hunter log</div><div class="group">
    <div class="row"><span class="grow lab">Morning weight</span><input type="number" inputmode="decimal" step="0.1" placeholder="kg" data-f="daily" data-d="${d}" data-k="weight" value="${x.weight??''}"></div>
    <div class="row"><span class="grow lab">Calories eaten</span><input type="number" inputmode="numeric" step="10" placeholder="kcal" data-f="daily" data-d="${d}" data-k="kcal" value="${x.kcal??''}"></div>
    <div class="row"><span class="grow"><div class="lab">Creatine 3–5 g</div><div class="hint">Optional supplement</div></span><button class="sw-toggle ${x.creat?'on':''}" data-a="tog" data-d="${d}" data-k="creat" aria-label="Creatine taken"></button></div>
    <div class="row" style="align-items:flex-start"><textarea data-f="daily" data-d="${d}" data-k="note" placeholder="Notes: PRs, pain, cravings…" style="min-height:64px">${esc(x.note||'')}</textarea></div></div>`;
  /* clear */
  const done=!!S.completed[d],ready=dd.pct>=0.7&&d<=cd;
  h+=`<button class="btn ${done?'':ready?'ok':'dis'}" data-a="clear" data-d="${d}" style="margin-top:6px">${done?'✓ Quest cleared — tap to undo':ready?(p.rest?'Clear recovery quest':'Clear Day '+d+' quest'):(d>cd?'Gate locked':'Complete 70% of the quest ('+Math.round(dd.pct*100)+'%)')}</button>
    <p class="tiny" style="text-align:center;margin-top:8px">Clearing grants the day's bonus EXP, streak bonus and stat points.</p>`;
  return h;
}

/* ============================================================
   DUNGEON
   ============================================================ */
function rDungeon(){
  const cd=curDay(),e=ev();
  let h=`<div class="large"><small>[ Dungeon: 30-day awakening ]</small>Dungeon</div><p class="lead">Four floors. 26 quests. 4 safe zones. At the end: the Monarch's gate.</p>`;
  h+=`<div class="legend" style="display:flex;gap:12px;flex-wrap:wrap;margin:0 2px 14px" ><span class="pill">Cleared</span><span class="pill o">Today</span><span class="pill r">Failed</span><span class="pill g">Safe zone</span><span class="pill v">Boss</span></div>`;
  P.forEach((ph,fi)=>{
    const from=fi===0?1:fi===1?8:fi===2?15:22,to=fi===3?30:from+6;
    const cleared=Array.from({length:to-from+1},(_,i)=>from+i).filter(d=>S.completed[d]).length;
    h+=`<section class="sw ${fi===3?'violet':''} floor"><div class="wt">${esc(ph.name.split(' · ')[0])}</div><div class="row" style="padding:0;border:0"><div class="grow"><h2>${esc(ph.name.split(' · ')[1])}</h2><div class="sub">${ph.days} · ${ph.rir}</div></div><span class="pill ${cleared===to-from+1?'g':''}">${cleared}/${to-from+1}</span></div><p class="tiny" style="margin:6px 0 12px">${esc(FLOOR_LORE[fi])}</p>`;
    for(let w=from;w<=to;w+=7){
      h+='<div class="weekrow">';
      for(let d=w;d<w+7;d++){
        if(d>to||d>30){h+='<div></div>';continue;}
        const t=typeOf(d),dn=!!S.completed[d],miss=d<cd&&!dn&&t!=='rest',cur=d===cd&&S.start;
        const cls=['node',t==='rest'?'rest':'',dn?'done':'',miss?'miss':'',cur?'cur':'',d>cd?'lock':'',d===30?'boss':''].join(' ');
        h+=`<button class="${cls}" data-a="goto" data-d="${d}" aria-label="Day ${d} ${t==='rest'?'safe zone':WORKOUTS[t].short}"><b>${d}</b><i>${d===30?'M':t==='rest'?'REST':dn?'OK':WORKOUTS[t].code}</i></button>`;
      }
      h+='</div>';
    }
    h+='</section>';
  });
  h+=`<section class="sw"><div class="wt">Quest rotation</div><div class="tw"><table><tr><th>#</th><th>Quest</th><th>Targets</th></tr>
    <tr><td>1</td><td>Push</td><td>Chest · shoulders · triceps</td></tr><tr><td>2</td><td>Pull</td><td>Back · biceps · rear delts</td></tr><tr><td>3</td><td>Legs</td><td>Quads · glutes · calves</td></tr>
    <tr><td>4</td><td>HIIT + Core</td><td>Fat burn · abs · recovery</td></tr><tr><td>5</td><td>Upper</td><td>Shoulders · arms · V-taper</td></tr><tr><td>6</td><td>Posterior</td><td>Hamstrings · glutes · back</td></tr>
    <tr><td>7</td><td>Safe zone</td><td>Full rest</td></tr></table></div>
    <div class="note w" style="margin-top:12px">[NOTE] Six training days a week is demanding (Meeusen 2013). The weekly safe zone and the Fatigue scan exist to prevent overtraining.</div></section>`;
  return h;
}

/* ============================================================
   FUEL (nutrition)
   ============================================================ */
function rFuel(){
  const pf=S.profile,r=calc(pf);
  const sel=(k,opts)=>`<select data-f="prof" data-k="${k}">${opts.map(([v,l])=>`<option value="${v}" ${String(pf[k])===String(v)?'selected':''}>${l}</option>`).join('')}</select>`;
  let h=`<div class="large"><small>[ Hunter provisions ]</small>Provisions</div><p class="lead">Calories, macros and meals tuned to your body. Mifflin–St Jeor + ISSN/ACSM guidance.</p>
  <section class="sw"><div class="wt">Your numbers</div><div class="grid2">
   <label class="field">Sex${sel('sex',[['male','Male'],['female','Female']])}</label><label class="field">Age<input type="number" inputmode="numeric" data-f="prof" data-k="age" value="${pf.age}" min="14" max="80"></label>
   <label class="field">Height (cm)<input type="number" inputmode="numeric" data-f="prof" data-k="h" value="${pf.h}" min="120" max="230"></label><label class="field">Weight (kg)<input type="number" inputmode="decimal" data-f="prof" data-k="w" value="${pf.w}" min="35" max="250" step="0.1"></label>
   <label class="field">Activity${sel('act',[['1.55','Desk job ×1.55'],['1.65','Some walking ×1.65'],['1.725','On feet ×1.725']])}</label><label class="field">Goal${sel('goal',[['cut','Max fat loss −20%'],['recomp','Recomp −10%'],['maint','Maintain'],['bulk','Lean gain +8%']])}</label></div>
   <label class="field" style="margin-top:12px">Food preference${sel('diet',[['nonveg','Non-vegetarian'],['egg','Eggetarian'],['veg','Vegetarian']])}</label></section>`;
  if(!r)return h+'<div class="note b">Enter a valid age, height and weight.</div>';
  h+=`<section class="sw"><div class="wt">Daily targets</div><div class="tgrid">
    <div class="bigstat"><span>Calories</span><b>${r.kcal}</b></div><div class="bigstat"><span>Protein</span><b>${r.prot} g</b></div><div class="bigstat"><span>Carbs</span><b>${r.carb} g</b></div><div class="bigstat"><span>Fat</span><b>${r.fat} g</b></div>
    <div class="bigstat"><span>Fibre</span><b>${r.fiber} g</b></div><div class="bigstat"><span>Water</span><b>${r.waterTrain} L</b></div><div class="bigstat"><span>Rest-day kcal</span><b>${r.rest}</b></div><div class="bigstat"><span>Max caffeine</span><b>${r.caff} mg</b></div></div>
   <p class="sub" style="margin-top:12px">BMR ${r.bmr} · maintenance ≈ ${r.tdee} kcal · ${pf.goal==='maint'?'aim: hold weight, build performance':(pf.goal==='bulk'?'surplus':'deficit')+' ≈ '+Math.abs(r.pct)+'% body weight/week · est. 30-day change ≈ <b>'+(pf.goal==='bulk'?'+':'−')+Math.abs(r.est30)+' kg</b>'} (rough; water shifts apply).</p>
   ${r.warn.map(w=>`<div class="note w">[WARNING] ${w}</div>`).join('')}${(pf.goal==='cut'&&r.pct>1)?'<div class="note b">Deficit over 1% BW/week risks muscle loss. Choose Recomp.</div>':''}</section>`;
  const splits=[['Breakfast',.25],['Lunch',.30],['Pre/Post-workout',.15],['Dinner',.30]];
  h+=`<section class="sw"><div class="wt">Meal split</div><p class="sub">≈0.4 g/kg protein per feeding across 4 meals (Schoenfeld &amp; Aragon 2018).</p><div class="tw"><table><tr><th>Meal</th><th>kcal</th><th>P</th><th>C</th><th>F</th></tr>${splits.map(([n,f])=>`<tr><td><b>${n}</b></td><td>${Math.round(r.kcal*f)}</td><td>${Math.round(r.prot*f)}g</td><td>${Math.round(r.carb*f)}g</td><td>${Math.round(r.fat*f)}g</td></tr>`).join('')}</table></div></section>`;
  const pb=S.pb,mi=Math.min(3,pb.meal),f=splits[mi][1],tp=r.prot*f,tc=r.carb*f,tf=r.fat*f,fp=FOOD[pb.p],fc=FOOD[pb.c],ff=FOOD[pb.f];
  const gP=fp.p>0?tp/fp.p*100:0,gC=fc.c>0?Math.max(0,tc-gP*fp.c/100)/fc.c*100:0,gF=ff.f>0?Math.max(0,tf-gP*fp.f/100-gC*fc.f/100)/ff.f*100:0;
  const opt=(t,cur)=>FOODS.filter(x=>t.includes(x[6])).map(x=>`<option value="${x[0]}" ${cur===x[0]?'selected':''}>${x[1]}</option>`).join('');
  h+=`<section class="sw"><div class="wt">Plate builder</div><p class="sub" style="margin-bottom:12px">Pick foods — quantities are calculated for the meal's macros.</p><div class="grid2">
   <label class="field">Meal<select data-f="pb" data-k="meal">${splits.map((s,i)=>`<option value="${i}" ${mi===i?'selected':''}>${s[0]}</option>`).join('')}</select></label><label class="field">Protein<select data-f="pb" data-k="p">${opt('p',pb.p)}</select></label>
   <label class="field">Carbs<select data-f="pb" data-k="c">${opt('c',pb.c)}</select></label><label class="field">Fat<select data-f="pb" data-k="f">${opt('f',pb.f)}</select></label></div>
   <div class="grid3" style="margin-top:12px"><div class="bigstat"><span>${esc(fp.n.split(',')[0])}</span><b>${Math.round(gP)}g</b></div><div class="bigstat"><span>${esc(fc.n.split(',')[0])}</span><b>${Math.round(gC)}g</b></div><div class="bigstat"><span>${esc(ff.n.split(' /')[0])}</span><b>${Math.round(gF)}g</b></div></div>
   <p class="tiny" style="margin-top:8px">Target: ${Math.round(r.kcal*f)} kcal · ${Math.round(tp)}P · ${Math.round(tc)}C · ${Math.round(tf)}F. Add vegetables freely.</p></section>`;
  const dn={nonveg:'Non-vegetarian',egg:'Eggetarian',veg:'Vegetarian'}[pf.diet];
  h+=`<section class="sw"><div class="wt">Sample menus · ${dn}</div><p class="sub">Alternate A/B and scale with the plate builder. ≤1 tsp oil per meal.</p>${MENUS[pf.diet].map(m=>`<h3>${m.name}</h3><div class="tw"><table>${m.meals.map(([a,b])=>`<tr><td style="width:100px"><b>${a}</b></td><td>${esc(b)}</td></tr>`).join('')}</table></div>`).join('')}</section>`;
  h+=`<section class="sw gold"><div class="wt">Self-Cook Indian Kitchen Protocol</div>
   <h2>Hunter Kitchen Preparation (15-Min Protocol)</h2>
   <p class="sub" style="margin-top:6px">Simple, fast, high-protein Indian cooking requiring minimal effort and zero junk.</p>
   <div class="group" style="margin-top:12px">
     <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
       <b style="color:var(--gold)">[01] Isabgol Fiber Protocol (Morning or Pre-Bed)</b>
       <span class="sub" style="font-size:13.5px">Mix 1 tablespoon (~7g) Isabgol (Psyllium Husk) into 250ml warm water with a squeeze of fresh lemon. Stir and drink <b>immediately</b> before it gels. Follow with 1 additional glass of water. Delivers ~5.5g soluble fiber, binds bile acids, regulates glucose, and eliminates constipation &amp; bloating from 150g+ protein.</span>
     </div>
     <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
       <b style="color:var(--cyan)">[02] Fast 12-Min Tawa Chicken Breast (45g Protein)</b>
       <span class="sub" style="font-size:13.5px">Dice 200–250g chicken breast into cubes. In a bowl, toss with 2 tbsp dahi, 1/2 tsp haldi, 1 tsp dhaniya powder, 1/2 tsp red chili, 1 tsp ginger-garlic paste, 1/2 tsp salt &amp; lemon juice. Heat <b>1 tsp mustard oil or cow ghee</b> on tawa/pan. Sear chicken on high flame for 3 mins. Lower heat, cover with lid for 6 mins. Add a handful of chopped palak (spinach) in the last 2 mins. Juicy and delicious.</span>
     </div>
     <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
       <b style="color:var(--green)">[03] High-Protein Masala Egg Bhurji (38g Protein)</b>
       <span class="sub" style="font-size:13.5px">Whisk 2 whole eggs + 4 egg whites with black pepper, salt and turmeric. In a pan with 1/2 tsp ghee, sauté 1 chopped onion, 1 green chili, 1 tomato for 2 mins. Pour eggs, scramble on medium flame for 3 mins until soft and fluffy. Pair with 2 hot whole-wheat rotis.</span>
     </div>
     <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
       <b style="color:var(--orange)">[04] Dal Palak One-Pot Power Batch</b>
       <span class="sub" style="font-size:13.5px">Wash 1 cup yellow moong dal. Pressure-cook with 2.5 cups water, 1 bunch chopped fresh spinach (palak), 1/2 tsp haldi and 1 tsp salt for 3 whistles (or 15 mins in pot). Tadka: heat 1 tsp cow ghee, add 1/2 tsp jeera, 3 minced garlic cloves, pinch of hing. Pour sizzling tadka into dal. Lasts 2–3 days in fridge.</span>
     </div>
     <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
       <b style="color:var(--violet)">[05] Boiled Kala Chana / Rajma Hunter Salad</b>
       <span class="sub" style="font-size:13.5px">Boil soaked kala chana (black chickpeas) or rajma. Toss 1.5 katoris with chopped cucumber, tomato, green chillies, coriander, lemon juice, rock salt and chaat masala. Add 50g paneer cubes or boiled egg whites. High fiber, high satiety.</span>
     </div>
     <div class="row" style="flex-direction:column;align-items:flex-start;gap:6px">
       <b style="color:var(--mut)">[06] Green Veggie Volume Shield</b>
       <span class="sub" style="font-size:13.5px">Cook a large bowl of Bhindi (okra), Lauki (bottle gourd), French beans, Methi or Capsicum with only 1 tsp oil, jeera, hing and spices. High volume fills the stomach completely, suppressing hunger hormones so your cut is effortless.</span>
     </div>
   </div></section>`;
  h+=`<details class="acc"><summary>[DATA] Food exchange table (per 100 g)</summary><div class="tw" style="padding:0 10px 10px"><table><tr><th>Food</th><th>kcal</th><th>P</th><th>C</th><th>F</th></tr>${FOODS.map(x=>`<tr><td>${esc(x[1])}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${x[5]}</td></tr>`).join('')}</table></div><p class="tiny" style="padding:0 14px 12px">USDA FoodData Central / IFCT approximations; ±10%.</p></details>`;
  h+=`<section class="sw"><div class="wt">Timing &amp; supplements</div><ul class="l"><li><b>Pre-workout (60–90 min):</b> carbs + protein. Don't train empty on heavy days.</li><li><b>Post-workout (≤2 h):</b> 25–40 g protein + carbs.</li><li><b>Only evidence-backed:</b> creatine monohydrate 3–5 g/day, whey if short on protein, caffeine ≤${r.caff} mg (not within 6 h of bed), vitamin D only if tested low.</li><li><b>Safe zones (7, 14, 21, 28):</b> eat maintenance (${r.rest} kcal), slightly more carbs.</li></ul></section>`;
  return h+dietPrecautions();
}
function dietPrecautions(){
  return `<section class="sw warn"><div class="wt">Diet precautions</div><ul class="l">
  <li><b>See a doctor first</b> with diabetes, kidney/liver/heart disease, hypertension, thyroid issues, pregnancy, medication, age under 18 or over 60, or any history of eating disorders.</li>
  <li><b>Never eat below the calorie floor</b> shown in Provisions (≈ resting energy).</li>
  <li><b>Pace:</b> ≈0.5–1% of body weight per week max (Garthe 2011; Helms 2014).</li>
  <li><b>No dehydration tricks:</b> diuretics, laxatives, sauna suits, fat burners and “detox” teas are dangerous.</li>
  <li><b>High protein (≤2.2 g/kg)</b> is safe for healthy kidneys (Devries 2018) — drink water; avoid with kidney disease.</li>
  <li><b>Electrolytes:</b> don't cut salt to zero when sweating heavily.</li>
  <li><b>Alcohol:</b> skip for 30 days (Parr 2014). <b>Caffeine:</b> ≤400 mg, none within 6 h of bed (Drake 2013).</li>
  <li><b>Warning signs — eat more &amp; stop the deficit:</b> dizziness, fainting, palpitations, missed periods, constant cold, hair loss, obsessive food thoughts, insomnia.</li>
  <li><b>After Day 30:</b> raise calories +100–150 kcal/week, don't rebound.</li></ul></section>`;
}

/* ============================================================
   CODEX
   ============================================================ */
function rCodex(){
  const t=S.codexTab;
  let h=`<div class="large"><small>[ Archive ]</small>Codex</div>
  <div class="seg" style="margin:6px 0 16px">${[['records','Records'],['titles','Titles'],['intel','Intel'],['system','System']].map(([k,l])=>`<button class="${t===k?'on':''}" data-a="ctab" data-k="${k}">${l}</button>`).join('')}</div>`;
  if(t==='records')return h+codexRecords();
  if(t==='titles')return h+codexTitles();
  if(t==='intel')return h+codexIntel();
  return h+codexSystem();
}
function codexRecords(){
  const e=ev(),pf=S.profile,ds=Object.entries(S.daily);
  const avg=k=>{const v=ds.map(([,x])=>+x[k]).filter(n=>n>0);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;};
  const sA=avg('sleep'),stA=avg('steps');
  let h=`<section class="sw"><div class="wt">Adherence</div><div class="tgrid"><div class="bigstat"><span>Cleared</span><b>${e.cleared}/30</b></div><div class="bigstat"><span>Streak</span><b>${e.streak}</b></div>
   <div class="bigstat"><span>Diet days</span><b>${e.dietD}</b></div><div class="bigstat"><span>Avg sleep</span><b>${sA?sA.toFixed(1)+'h':'—'}</b></div><div class="bigstat"><span>Avg steps</span><b>${stA?Math.round(stA).toLocaleString():'—'}</b></div><div class="bigstat"><span>Failed days</span><b>${e.missed}</b></div></div></section>`;
  h+=`<section class="sw"><div class="wt">Weight trend</div><div id="chartbox"></div></section>`;
  h+=`<section class="sw"><div class="wt">Measurements</div><p class="sub" style="margin-bottom:10px">Log on Days 1, 8, 15, 22, 30. Filling 5+ fields in a checkpoint awards +40 EXP and +4 INT.</p><div class="tw"><table><tr><th>Metric</th>${CHECKPOINTS.map(c=>`<th>D${c}</th>`).join('')}<th>Δ</th></tr>
  ${MEAS.map(([k,l])=>{const vals=CHECKPOINTS.map(c=>k==='weight'?(D(c).weight??''):((S.meas[c]||{})[k]??''));const first=vals.find(v=>v!==''),last=[...vals].reverse().find(v=>v!=='');const dl=(first!==undefined&&last!==undefined&&first!==last)?(last-first):null;
   return `<tr><td><b>${l}</b></td>${CHECKPOINTS.map((c,i)=>`<td><input type="number" inputmode="decimal" step="0.1" data-f="meas" data-c="${c}" data-k="${k}" value="${vals[i]}"></td>`).join('')}<td>${dl!==null?`<b style="color:${dl<0?'var(--green)':'var(--orange)'}">${dl>0?'+':''}${dl.toFixed(1)}</b>`:'—'}</td></tr>`;}).join('')}
  <tr><td><b>Body fat %</b></td>${CHECKPOINTS.map(c=>{const bf=navyBF(S.meas[c]||{},pf);return `<td>${bf?bf.toFixed(1)+'%':'—'}</td>`;}).join('')}<td></td></tr>
  <tr><td><b>Lean kg</b></td>${CHECKPOINTS.map(c=>{const bf=navyBF(S.meas[c]||{},pf),w=D(c).weight;return `<td>${bf&&w?(w*(1-bf/100)).toFixed(1):'—'}</td>`;}).join('')}<td></td></tr></table></div>
  <p class="tiny" style="margin-top:8px">Body fat: US Navy formula (±3–4%). Uses sex &amp; height from Provisions. Take front/side/back photos too.</p></section>`;
  h+=`<section class="sw"><div class="wt">Rank test</div><p class="sub" style="margin-bottom:10px">Test Day 1, 15 and 30 with identical form. Three+ values in a column = +40 EXP.</p><div class="tw"><table><tr><th>Test</th><th>D1</th><th>D15</th><th>D30</th><th>Δ</th></tr>
  ${BENCH.map(([k,l])=>{const v=[1,15,30].map(c=>(S.bench[c]||{})[k]??'');const dl=(v[0]!==''&&v[2]!=='')?(v[2]-v[0]):null;return `<tr><td>${l}</td>${[1,15,30].map((c,i)=>`<td><input type="number" inputmode="numeric" data-f="bench" data-c="${c}" data-k="${k}" value="${v[i]}"></td>`).join('')}<td>${dl!==null?`<b style="color:var(--green)">${dl>0?'+':''}${dl}</b>`:'—'}</td></tr>`;}).join('')}</table></div></section>`;
  return h;
}
function drawChart(){
  const box=$('#chartbox');if(!box)return;
  const pts=[];for(let d=1;d<=30;d++){const w=parseFloat(D(d).weight);if(w>0)pts.push([d,w]);}
  if(pts.length<2){box.innerHTML='<div class="note i">Log your morning weight in the Daily Quest (Hunter log) on 2+ days to see your trend.</div>';return;}
  const W=520,H=220,pl=40,pr=12,pt=12,pb=26,ws=pts.map(p=>p[1]),mn=Math.min(...ws)-0.5,mx=Math.max(...ws)+0.5;
  const X_=d=>pl+(d-1)/29*(W-pl-pr),Y=w=>pt+(1-(w-mn)/(mx-mn))*(H-pt-pb);
  const path=pts.map((p,i)=>(i?'L':'M')+X_(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');
  const ma=pts.map(([d])=>{const w=pts.filter(p=>p[0]<=d&&p[0]>d-7);return [d,w.reduce((a,b)=>a+b[1],0)/w.length];});
  const mpath=ma.map((p,i)=>(i?'L':'M')+X_(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');
  let g='';for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=Y(v);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="rgba(61,184,255,.15)"/><text x="${pl-6}" y="${y+4}" fill="#8ea8c8" font-size="11" text-anchor="end" font-family="ui-monospace,monospace">${v.toFixed(1)}</text>`;}
  for(let d=1;d<=30;d+=7)g+=`<text x="${X_(d)}" y="${H-8}" fill="#8ea8c8" font-size="11" text-anchor="middle" font-family="ui-monospace,monospace">D${d}</text>`;
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#9b6bff"/><stop offset="1" stop-color="#8ceaff"/></linearGradient></defs>${g}
   <path d="${path}" fill="none" stroke="#5f7898" stroke-width="1.5" stroke-dasharray="4 4"/><path d="${mpath}" fill="none" stroke="url(#lg)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
   ${pts.map(p=>`<circle cx="${X_(p[0])}" cy="${Y(p[1])}" r="4" fill="#02040b" stroke="#8ceaff" stroke-width="2"><title>Day ${p[0]}: ${p[1]} kg</title></circle>`).join('')}</svg>
   <div class="tiny">Dashed = daily · Solid = 7-day average · Change <b>${(pts[pts.length-1][1]-pts[0][1]).toFixed(1)} kg</b></div>`;
}
function codexTitles(){
  const un=Object.keys(S.ach).length;
  return `<section class="sw gold"><div class="wt">Titles</div><h2>${un} / ${ACH.length} acquired</h2><p class="sub" style="margin-top:4px">Titles are earned automatically from your actions.</p></section>
  <div class="group">${ACH.map(a=>{const got=!!S.ach[a[0]];return `<div class="ach ${got?'':'lock'}"><div class="em">${got?a[3]:'LOCK'}</div><div><b>${a[1]}</b><span>${a[2]}</span></div></div>`;}).join('')}</div>`;
}
function codexIntel(){
  const q=t=>'https://pubmed.ncbi.nlm.nih.gov/?term='+encodeURIComponent(t);
  return `<section class="sw gold"><div class="wt">Realistic expectations</div><div class="note g">With strict adherence, an average adult can expect roughly <b>2–5 kg fat loss</b>, a visibly smaller waist (≈3–6 cm) and — if new to lifting — <b>0.5–1.5 kg muscle</b> plus big strength gains. “10 kg in 30 days” claims need dangerous dehydration or starvation.</div>
  <div class="note w">Educational only, not medical advice. If you have any health condition, consult a doctor first.</div></section>
  <section class="sw warn"><div class="wt">Training precautions</div><ul class="l">
  <li><b>Stop and seek care:</b> chest pain, fainting, severe breathlessness, numbness, sudden sharp joint pain, or cola-coloured urine with severe muscle pain (possible rhabdomyolysis — emergency).</li>
  <li>Muscle burn is fine; joint pain isn't. Swap the exercise (Home version) — don't skip the day.</li>
  <li>Sick? Symptoms only above the neck → light session OK. Fever, body aches or chest symptoms → rest.</li>
  <li><b>Overtraining signs:</b> resting pulse +5–10 bpm for 3+ days, worse sleep, irritability, falling strength (Meeusen 2013). Choose a red scan, eat and sleep more.</li>
  <li>Increase loads only 2–5% when you hit the top of the rep range with clean form. Use safety pins/spotter; never test a 1-rep max.</li>
  <li>Home safety: only use truly sturdy furniture, clear space, shoes with grip.</li>
  <li><b>Sleep 7–9 h</b> (Watson 2015); sleep restriction cut the fat share of weight lost from 56% to 25% (Nedeltcheva 2010).</li>
  <li>Hydrate: sip 150–250 ml every 15–20 min in long or hot sessions (Sawka 2007).</li></ul>
  <details class="acc"><summary>[MOBILITY] 8-Minute Nightly Routine</summary><ul>${MOBILITY.map(m=>`<li>${m}</li>`).join('')}</ul></details></section>
  <section class="sw"><div class="wt">Research behind the System</div><p class="sub" style="margin-bottom:10px">Each row links to a PubMed search so you can verify the paper yourself.</p><div class="tw"><table><tr><th>Design decision</th><th>Source</th></tr>${REFS.map(r=>`<tr><td style="min-width:160px"><b>${esc(r[0])}</b></td><td>${esc(r[1])} <a href="${q(r[2])}" target="_blank" rel="noopener">PubMed ↗</a></td></tr>`).join('')}</table></div></section>${dietPrecautions()}`;
}
function codexSystem(){
  const A=S.alarm,perm=('Notification' in window)?Notification.permission:'unsupported';
  const standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  return `<section class="sw"><div class="wt">Hunter</div><div class="group" style="margin:0"><div class="row"><span class="grow lab">Name</span><input type="text" data-f="hname" value="${esc(S.hunter.name)}" placeholder="Player" maxlength="20"></div>
   <div class="row"><span class="grow lab">Day 1 date</span><input type="date" data-f="start" value="${S.start||todayStr()}"></div>
   <div class="row"><span class="grow lab">Default location</span><div class="seg ${S.gmode==='home'?'home':''}" style="min-width:150px"><button class="${S.gmode==='gym'?'on':''}" data-a="gmode" data-m="gym">Gym</button><button class="${S.gmode==='home'?'on':''}" data-a="gmode" data-m="home">Home</button></div></div></div></section>
  <section class="sw"><div class="wt">System alarm</div><p class="sub" style="margin-bottom:12px">Reminders every ${A.every} min until today's quest is cleared (${A.on?'ON':'OFF'}, notifications: ${perm}).</p><button class="btn pri" data-a="alarm">Alarm settings</button></section>
  <section class="sw"><div class="wt">Install on your phone</div><ul class="l"><li>${standalone?'[ACTIVE] Running as an installed app.':'Not installed yet.'}</li>
   <li><b>Host it over https</b> (free): drag this folder onto <b>app.netlify.com/drop</b>, or enable <b>GitHub Pages</b>, or use <b>Cloudflare Pages</b>. A file on your computer can't be installed on a phone.</li>
   <li><b>iPhone:</b> open the https link in <b>Safari</b> → Share → <b>Add to Home Screen</b>. Notifications need iOS 16.4+ and the installed app.</li>
   <li><b>Android:</b> open in Chrome → ⋮ → <b>Install app</b>.</li></ul></section>
  <section class="sw"><div class="wt">Data</div><p class="sub" style="margin-bottom:12px">All progress is stored on this device. Back up regularly.</p><div class="btn-row"><button class="btn" data-a="export">Export</button><label class="btn" style="cursor:pointer">Import<input type="file" accept="application/json" data-f="import" hidden></label></div>
   <button class="btn red" data-a="reset" style="margin-top:10px">Reset everything</button></section>
  <p class="tiny" style="text-align:center">Hunter System · inspired by the Solo Leveling “System”, not affiliated.</p>`;
}

/* ============================================================
   ALARM + NOTIFICATIONS
   ============================================================ */
let swReg=null;
const MSGS=[
 'Daily quest incomplete. Failure to clear it will trigger a penalty.',
 'Hunter, the gate is still open. Clear your quest before midnight.',
 'The System is watching. Your quest is unfinished.',
 'Weakness is a choice. Finish today\'s quest.',
 'Warning: penalty quest imminent. Complete today\'s quest now.'];
async function notify(title,body){
  try{
    if(!('Notification' in window)||Notification.permission!=='granted')return false;
    const opts={body,icon:'icons/icon-192.png',badge:'icons/favicon-32.png',tag:'daily-quest',renotify:true,vibrate:[220,90,220],data:{url:'./index.html#quests'}};
    const reg=swReg||(navigator.serviceWorker&&await navigator.serviceWorker.getRegistration());
    if(reg&&reg.showNotification){await reg.showNotification(title,opts);return true;}
    new Notification(title,opts);return true;
  }catch(e){return false;}
}
const slotId=(now)=>{const dayOrd=Math.floor((now.getTime()-now.getTimezoneOffset()*60000)/864e5);return dayOrd*1000+Math.floor((now.getHours()*60+now.getMinutes())/S.alarm.every);};
function showBanner(title,body){
  const b=$('#banner');b.innerHTML=`<div class="sw warn" style="margin:0"><div class="wt">${esc(title)}</div><div class="sysmsg" style="min-height:0;font-size:13.5px">${esc(body)}</div><div class="btn-row" style="margin-top:12px"><button class="btn sm red" data-a="bannergo">Enter quest</button><button class="btn sm" data-a="bannerx">Dismiss</button></div></div>`;
  b.classList.add('in');clearTimeout(showBanner.t);showBanner.t=setTimeout(()=>b.classList.remove('in'),15000);
}
function fireAlarm(auto){
  const cd=curDay(),dd=ev().days[cd],body=MSGS[Math.floor(Math.random()*MSGS.length)]+` (Day ${cd}: ${Math.round(dd.pct*100)}% · ${midnightLeft()} left)`;
  notify('[SYSTEM] Daily Quest incomplete',body);
  if(document.visibilityState==='visible'){showBanner('System alert',body);sfx('alarm');buzz([250,120,250,120,250]);}
}
function alarmTick(){
  updateBadges();const A=S.alarm;if(!A.on||!questPending())return;
  const now=new Date(),m=now.getHours()*60+now.getMinutes();
  if(m<toMin(A.from)||m>toMin(A.to))return;
  const sid=slotId(now);if(sid<=A.lastSlot)return;
  A.lastSlot=sid;save();fireAlarm();
}
/* ntfy.sh: free phone push with scheduled delivery + cancel (works with the app closed) */
const NTFY='https://ntfy.sh/';
const gameDayFor=dt=>{if(!S.start)return 0;const a=new Date(S.start+'T00:00:00'),b=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate());return Math.round((b-a)/864e5)+1;};
function ntfyWanted(){
  const A=S.alarm;if(!A.on||!A.ntfyOn||!A.ntfy||!S.start||!S.hunter.awakened)return [];
  const out=[],now=Date.now(),f=toMin(A.from),t=toMin(A.to),ev_=A.every;
  for(let k=0;k<3;k++){
    const base=new Date();base.setDate(base.getDate()+k);
    const gd=gameDayFor(base);if(gd<1||gd>30||S.completed[gd])continue;
    for(let m=Math.ceil(f/ev_)*ev_;m<=t;m+=ev_){
      const ts=new Date(base.getFullYear(),base.getMonth(),base.getDate(),Math.floor(m/60),m%60,0).getTime();
      if(ts<now+20000||ts>now+30*3600000)continue;
      out.push({id:'hq'+S.start.replace(/-/g,'')+'d'+gd+'m'+m,ts:Math.floor(ts/1000),gd});
    }
  }
  return out;
}
let ntfyBusy=false,ntfyTimer=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function ntfySoon(){clearTimeout(ntfyTimer);ntfyTimer=setTimeout(ntfySync,900);}
async function ntfySync(){
  const A=S.alarm;if(ntfyBusy||!A.ntfy||!(typeof fetch==='function'))return;
  ntfyBusy=true;
  try{
    const want=ntfyWanted(),wantIds=new Set(want.map(w=>w.id)),nowS=Date.now()/1000;
    Object.keys(A.sched).forEach(id=>{if(A.sched[id]<nowS)delete A.sched[id];});
    // cancel obsolete
    for(const id of Object.keys(A.sched)){
      if(!wantIds.has(id)){try{await fetch(NTFY+encodeURIComponent(A.ntfy)+'/'+id,{method:'DELETE'});}catch(_){break;}delete A.sched[id];await sleep(120);}
    }
    let n=0;
    for(const w of want){
      if(A.sched[w.id])continue;if(++n>60)break;
      const hd={'X-Delay':String(w.ts),'X-ID':w.id,'Title':'[SYSTEM] Daily Quest incomplete','Priority':'4','Tags':'warning'};
      if(location.protocol.startsWith('http'))hd['Click']=location.origin+location.pathname;
      const r=await fetch(NTFY+encodeURIComponent(A.ntfy),{method:'POST',body:'Day '+w.gd+' quest is unfinished. Clear it before midnight or face the penalty, Hunter.',headers:hd});
      if(!r.ok){if(r.status===429)toast('ntfy rate limit — will retry later','r');break;}
      A.sched[w.id]=w.ts;await sleep(150);
    }
    save();
  }catch(e){console.warn('ntfy',e);}
  ntfyBusy=false;
}
async function ntfyTest(){
  const A=S.alarm;if(!A.ntfy){toast('Enter or generate a topic first','r');return;}
  try{const r=await fetch(NTFY+encodeURIComponent(A.ntfy),{method:'POST',body:'The System is connected. You will be alerted here when your quest is incomplete.',headers:{'Title':'[SYSTEM] Link established','Tags':'zap','Priority':'3'}});toast(r.ok?'Test push sent — check your phone':'Push failed ('+r.status+')',r.ok?'':'r');}catch(_){toast('Network error — are you online?','r');}
}
function alarmSheet(){
  const A=S.alarm,perm=('Notification' in window)?Notification.permission:'unsupported';
  const tg=(k,on)=>`<button class="sw-toggle ${on?'on':''}" data-a="atog" data-k="${k}" aria-label="${k}"></button>`;
  const w=openWin(`<div class="wt">System alarm</div>
   <div class="group"><div class="row"><div class="grow"><div class="lab">Remind me every ${A.every} min</div><div class="hint">Only while today's quest is not cleared, within your waking window.</div></div>${tg('on',A.on)}</div>
    <div class="row"><span class="grow lab">Active from</span><input type="time" data-f="alarm" data-k="from" value="${A.from}"></div>
    <div class="row"><span class="grow lab">Until</span><input type="time" data-f="alarm" data-k="to" value="${A.to}"></div>
    <div class="row"><span class="grow lab">Interval</span><div class="seg" style="min-width:170px">${[15,30,60].map(v=>`<button class="${A.every===v?'on':''}" data-a="aevery" data-v="${v}">${v}m</button>`).join('')}</div></div>
    <div class="row"><span class="grow lab">Sound</span>${tg('sound',A.sound)}</div><div class="row"><span class="grow lab">Vibration</span>${tg('vib',A.vib)}</div></div>
   <div class="group"><div class="row"><div class="grow"><div class="lab">Notifications</div><div class="hint">Permission: <b>${perm}</b></div></div>${perm==='granted'||perm==='unsupported'?'':'<button class="btn sm pri" data-a="askperm">Allow</button>'}</div>
    <div class="row"><div class="grow"><div class="lab">Test alert</div><div class="hint">Fires the System alarm now.</div></div><button class="btn sm" data-a="atest">Test</button></div></div>
   <div class="wt" style="margin:14px 4px 8px">Phone push (works when app is closed)</div>
   <div class="group"><div class="row"><div class="grow"><div class="lab">ntfy.sh push</div><div class="hint">Free. Scheduled on their server and auto-cancelled when you clear the quest.</div></div>${tg('ntfyOn',A.ntfyOn)}</div>
    <div class="row"><input type="text" data-f="alarm" data-k="ntfy" value="${esc(A.ntfy)}" placeholder="secret topic name" style="max-width:none;flex:1;text-align:left" autocapitalize="none" autocorrect="off"><button class="btn sm" data-a="gentopic">Generate</button></div>
    <div class="row"><div class="grow hint">1) Install the <b>ntfy</b> app (iOS/Android). 2) Subscribe to your topic. 3) Open this app once a day to refresh the schedule.</div><button class="btn sm" data-a="ntfytest">Test push</button></div></div>
   <div class="note i">[NOTICE] Browsers cannot run background timers. In-app alerts fire while the app is open or recently in the background. For guaranteed half-hourly phone alerts use <b>ntfy</b>. Anyone who knows your topic name can read it — keep it secret.</div>
   <button class="btn" data-a="closewin">Done</button>`,{sheet:true});
  return w;
}

/* ============================================================
   FLOWS: awakening, daily arrival, rewards
   ============================================================ */
function awakenStart(){
  openWin(`<div class="awaken-hero" style="border-radius:0;margin:-18px;min-height:520px">
    <img src="icons/jinwoo.jpg" class="awaken-hero-bg" alt="Sung Jin-Woo">
    <div class="awaken-hero-overlay"></div>
    <div class="awaken-hero-top"><span>⚡</span> AWAKEN</div>
    <div class="awaken-hero-content">
      <h1 class="awaken-hero-title">YOUR AWAKENING BEGINS NOW!</h1>
      <p class="awaken-hero-sub">Walk your path. Take action. Conquer.<br>Become a legend!</p>
      <button class="btn awaken-hero-btn" data-a="aw-yes">Get Started</button>
    </div>
  </div>`,{lock:true});
}
function awakenForm(){
  const pf=S.profile;
  openWin(`<div class="wt">Player registration</div><div class="grid2">
   <label class="field" style="grid-column:1/-1">Hunter name<input type="text" id="aw-name" maxlength="20" placeholder="Sung Jin-Woo" autocomplete="off" value="${esc(S.hunter.name||'Sung Jin-Woo')}"></label>
   <label class="field">Sex<select id="aw-sex"><option value="male" ${pf.sex==='male'?'selected':''}>Male</option><option value="female" ${pf.sex==='female'?'selected':''}>Female</option></select></label>
   <label class="field">Age<input type="number" inputmode="numeric" id="aw-age" value="${pf.age||24}"></label>
   <label class="field">Height (cm)<input type="number" inputmode="numeric" id="aw-h" value="${pf.h||170}"></label>
   <label class="field">Weight (kg)<input type="number" inputmode="decimal" id="aw-w" value="${pf.w||73}" step="0.1"></label>
   <label class="field" style="grid-column:1/-1">Goal<select id="aw-goal"><option value="cut">Max fat loss</option><option value="recomp" ${(!pf.goal||pf.goal==='recomp')?'selected':''}>Recomposition</option><option value="maint" ${pf.goal==='maint'?'selected':''}>Maintain &amp; perform</option><option value="bulk" ${pf.goal==='bulk'?'selected':''}>Lean gain</option></select></label>
   <label class="field" style="grid-column:1/-1">Food<select id="aw-diet"><option value="nonveg" ${(!pf.diet||pf.diet==='nonveg')?'selected':''}>Non-vegetarian (Chicken, Eggs, Dal)</option><option value="egg" ${pf.diet==='egg'?'selected':''}>Eggetarian</option><option value="veg" ${pf.diet==='veg'?'selected':''}>Vegetarian</option></select></label></div>
   <div class="note w" style="margin-top:12px">Training this hard is demanding. Check with a doctor if you have any pre-existing medical conditions.</div>
   <button class="btn pri" data-a="aw-go" style="margin-top:6px">[ AWAKEN AS PLAYER ]</button>`,{lock:true,cls:'in'});
}
function questSummary(d){
  const p=plan(d);if(p.rest)return `Quest: <b>Recovery</b> (Safe zone)\nGoal: Complete the recovery checklist.`;
  const tot=p.ex.reduce((a,q)=>a+q.sets,0);
  return `Quest: <b>${esc(p.W.title)}</b>\nGoal: Clear <b>${tot}</b> sets (gym or home).\nReward: EXP, ${p.type==='cond'?'AGI':'STR'} growth.`;
}
function dailyArrival(d){
  S.seen[d]=true;save();
  openQuestInfoModal(d);
}
function clearWin(d,b,a){
  const dx=a.xp-b.xp,e=ev(),dd=e.days[d];
  const gains=STATS.map(([k])=>[k,a.stats[k]-b.stats[k]]).filter(x=>x[1]>0);
  const w=openWin(`<div class="wt">Quest cleared</div><div class="bigtitle">${dd.perfect?'Perfect clear':'Quest cleared'}</div>
    <div class="reward"><span>EXP</span><b id="xpc">+0</b></div>
    ${gains.map(([k,v])=>`<div class="reward stat"><span>${k}</span><b>+${v}</b></div>`).join('')}
    <div class="reward"><span>STREAK</span><b>${e.streak} D</b></div>
    <p class="sub" style="margin:10px 0 14px;text-align:center">${dd.perfect?'Every sub-quest done. +100 EXP perfect bonus.':'Clear every sub-quest for the perfect-day bonus.'}</p>
    <button class="btn pri" data-a="closewin">Continue</button>`,{tone:'gold'});
  sfx('ding');buzz([40,60,40,60,120]);
  const el=w.querySelector('#xpc');let t0=null;const tgt=Math.max(0,dx);
  const step=ts=>{t0=t0||ts;const k=Math.min(1,(ts-t0)/900);el.textContent='+'+Math.round(tgt*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);};
  reduced()?(el.textContent='+'+tgt):requestAnimationFrame(step);
}
function levelWin(a,b){
  const rk=rankOf(a.level,false),rankUp=a.rank!==b.rank;
  openWin(`<div class="wt">System</div><div class="bigtitle">${rankUp?'Rank up':'Level up'}</div><div style="display:grid;place-items:center;gap:10px;margin-bottom:12px">${hexRank(rk,96)}<div class="lvl"><small>LEVEL</small>${b.level} → ${a.level}</div><div class="htitle">${rk.t}</div></div>
    <button class="btn pri" data-a="closewin">Continue</button>`,{tone:rankUp?'violet':'gold'});
  sfx('level');buzz([60,60,60,60,200]);
}
function titleWin(x){
  const m=x[0]==='monarch';
  openWin(`<div class="wt">${m?'Ascension':'Title acquired'}</div><div class="bigtitle">${m?'Shadow Monarch':x[1]}</div>
    <div style="display:flex;justify-content:center;margin:8px 0 14px"><span class="pill gold" style="font-size:15px;padding:6px 16px;letter-spacing:.12em">[ ${x[3]} ]</span></div>
    <p class="sub" style="text-align:center;margin-bottom:14px">${m?'You have cleared the dungeon and risen beyond every rank. Arise.':esc(x[2])}</p><button class="btn pri" data-a="closewin">Continue</button>`,{tone:m?'violet':'gold'});
  sfx(m?'level':'ding');buzz([60,40,60]);
}
function afterChange(b,quiet){
  _ev=null;const e=ev(),newly=[];
  ACH.forEach(x=>{if(!S.ach[x[0]]&&x[4](e)){S.ach[x[0]]=Date.now();newly.push(x);}});
  if(newly.length)save();
  const a=snap();
  if(a.level>b.level||a.rank!==b.rank)pushWin(()=>levelWin(a,b));
  newly.forEach(x=>pushWin(()=>titleWin(x)));
  const dx=a.xp-b.xp;if(!quiet&&dx!==0)toast((dx>0?'+':'')+dx+' EXP',dx>0?'g':'r');
  updateBadges();
}

/* ============================================================
   EVENTS
   ============================================================ */
document.addEventListener('click',ev_=>{
  const el=ev_.target.closest('[data-a]');if(!el)return;
  const a=el.dataset.a,d=+el.dataset.d;
  if(el.tagName==='A')ev_.preventDefault();
  const b=()=>snap();
  switch(a){
   case 'tab':if(el.dataset.v===view){window.scrollTo({top:0,behavior:'smooth'});}else{if(el.dataset.v==='quests')selDay=null;setView(el.dataset.v);}break;
   case 'goto':selDay=d;setView('quests');break;
   case 'goto-codex':S.codexTab='records';save();setView('codex');break;
   case 'prev':selDay=Math.max(1,(selDay??curDay())-1);render(true);break;
   case 'next':selDay=Math.min(30,(selDay??curDay())+1);render(true);break;
   case 'ctab':S.codexTab=el.dataset.k;save();render();break;
   case 'gmode':S.gmode=el.dataset.m;S.modes={};save();render(true);break;
   case 'daymode':{const bf=b();S.modes[d]=el.dataset.m;save();afterChange(bf,true);render(true);break;}
   case 'questinfo':openQuestInfoModal(d||selDay||curDay());break;
   case 'awaken':awakenStart();break;
   case 'aw-no':closeWin();pushWin(()=>sysWin('System','<b>[SYSTEM]</b>\n\nDeclined.\n\nThe System will ask again.','<button class="btn pri" data-a="aw-again">Ask again</button>',{lock:true}));break;
   case 'aw-again':closeWin();pushWin(awakenStart);break;
   case 'aw-yes':closeWin();pushWin(awakenForm);break;
   case 'aw-go':{
     const g=id=>document.getElementById(id).value,nm=g('aw-name').trim();
     if(!nm){toast('Enter a hunter name','r');break;}
     const age=+g('aw-age'),h=+g('aw-h'),w=+g('aw-w');
     if(!(age>=14&&h>=120&&w>=35)){toast('Check age, height and weight','r');break;}
     S.hunter={name:nm,awakened:true};Object.assign(S.profile,{sex:g('aw-sex'),age,h,w,goal:g('aw-goal'),diet:g('aw-diet')});
     if(!S.start)S.start=todayStr();
     save();closeWin();render();sfx('level');
     pushWin(()=>dailyArrival(curDay()));
     break;}
   case 'arrival-ok':closeWin();pushWin(()=>sysWin('System','<b>[SYSTEM]</b>\n\nEnable the <b>System Alarm</b>?\n\nYou will be reminded every 30 minutes until your quest is cleared.','<button class="btn" data-a="closewin">Later</button><button class="btn pri" data-a="alarm-open">Enable</button>',{}));break;
   case 'alarm-open':closeWin();pushWin(alarmSheet);break;
   case 'alarm':if(!ovRoot().children.length)alarmSheet();break;
   case 'closewin':closeWin();break;
   case 'set':{
     if(d>curDay()){toast('Gate locked — opens on Day '+d,'r');break;}
     const k=key(d,el.dataset.m),i=+el.dataset.i,j=+el.dataset.j,bf=b();
     const o=S.done[k]=S.done[k]||{},arr=o[i]=o[i]||[];arr[j]=!arr[j];save();
     afterChange(bf,true);render(true);
     if(arr[j]){sfx('tick');buzz(15);if(+el.dataset.rest>0)startTimer(+el.dataset.rest);}
     break;}
   case 'restchk':{if(d>curDay()){toast('Gate locked','r');break;}const bf=b(),o=S.restchk[d]=S.restchk[d]||{};o[+el.dataset.i]=!o[+el.dataset.i];save();afterChange(bf,true);render(true);sfx('tick');break;}
   case 'tog':{if(d>curDay()){toast('Gate locked','r');break;}const bf=b(),x=D(d);x[el.dataset.k]=!x[el.dataset.k];save();afterChange(bf,false);render(true);buzz(12);break;}
   case 'water':{
     if(d>curDay()){toast('Gate locked — opens on Day '+d,'r');break;}
     const bf=b(),x=D(d),delta=+el.dataset.v,prev=x.water||0;
     x.water=Math.max(0,prev+delta);
     save();afterChange(bf,true);render(true);
     sfx('tick');buzz(12);
     const tgt=calc(S.profile)?calc(S.profile).waterTrain*1000:3200;
     if(x.water>=tgt&&prev<tgt){toast('Hydration goal achieved (+30 EXP)','g');sfx('level');}
     else if(delta>0){toast('+'+delta+' mL logged ('+x.water+' mL total)');}
     break;}
   case 'water-reset':{
     if(d>curDay()){toast('Gate locked','r');break;}
     const bf=b(),x=D(d);x.water=0;
     save();afterChange(bf,true);render(true);
     toast('Water counter reset to 0 mL');buzz(15);
     break;}
   case 'pen':{const m=+el.dataset.m,i=+el.dataset.i,bf=b(),o=S.pen[m]=S.pen[m]||{};o[i]=!o[i];
     if(PEN_TASKS.every((_,k)=>o[k])){S.redeem[m]=true;toast('Penalty redeemed. +60 EXP net','g');sfx('level');}else S.redeem[m]=false;
     save();afterChange(bf,true);render(true);break;}
   case 'clear':{
     if(S.completed[d]){const bf=b();S.completed[d]=false;save();afterChange(bf,false);render(true);ntfySoon();break;}
     if(d>curDay()){toast('Gate locked — opens on Day '+d,'r');break;}
     if(!canClear(d)){toast('Complete at least 70% of the quest first','r');buzz([20,40,20]);break;}
     const bf=b();S.completed[d]=true;save();const af=snap();
     pushWin(()=>clearWin(d,bf,af));afterChange(bf,true);render(true);ntfySoon();updateBadges();
     break;}
   case 'skiptimer':stopTimer();break;
   case 'bannergo':$('#banner').classList.remove('in');selDay=null;setView('quests');break;
   case 'bannerx':$('#banner').classList.remove('in');break;
   case 'atog':{const k=el.dataset.k,A=S.alarm;
     if(k==='on'){A.on=!A.on;if(A.on){A.lastSlot=slotId(new Date());if('Notification' in window&&Notification.permission==='default')Notification.requestPermission().then(()=>refreshSheet());}}
     else A[k]=!A[k];
     save();updateBadges();refreshSheet();ntfySoon();break;}
   case 'aevery':S.alarm.every=+el.dataset.v;S.alarm.lastSlot=slotId(new Date());save();refreshSheet();ntfySoon();break;
   case 'askperm':if('Notification' in window)Notification.requestPermission().then(()=>refreshSheet());break;
   case 'atest':{sfx('alarm');buzz([250,120,250]);notify('[SYSTEM] Test alert','This is how the System will warn you when your quest is incomplete.');showBanner('System alert','Test alert — the System will warn you like this.');break;}
   case 'gentopic':{const c='abcdefghjkmnpqrstuvwxyz23456789';let t='hunter-';for(let i=0;i<12;i++)t+=c[Math.floor(Math.random()*c.length)];S.alarm.ntfy=t;save();refreshSheet();ntfySoon();break;}
   case 'ntfytest':ntfyTest();break;
   case 'export':{const bl=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),u=URL.createObjectURL(bl),l=document.createElement('a');l.href=u;l.download='hunter-system-backup-'+todayStr()+'.json';l.click();URL.revokeObjectURL(u);break;}
   case 'reset':if(confirm('Delete ALL progress and start over? This cannot be undone.')){S=defState();save();selDay=null;render();toast('System reset');pushWin(awakenStart);}break;
  }
});
function refreshSheet(){const r=ovRoot(),l=r.lastElementChild;if(l&&l.classList.contains('sheet')){l.remove();alarmSheet();}}
document.addEventListener('change',e=>{
  const el=e.target,f=el.dataset.f;if(!f)return;
  const d=+el.dataset.d,val=el.type==='checkbox'?el.checked:el.value;
  switch(f){
   case 'start':{S.start=el.value||null;save();render(true);ntfySoon();break;}
   case 'hname':S.hunter.name=val.trim();save();break;
   case 'daily':{const bf=snap(),x=D(d);x[el.dataset.k]=(el.type==='number'&&val!=='')?+val:val;save();afterChange(bf,true);render(true);break;}
   case 'load':{const k=key(d,el.dataset.m);(S.loads[k]=S.loads[k]||{})[el.dataset.i]=val;save();break;}
   case 'prof':{const bf=snap();S.profile[el.dataset.k]=(['sex','goal','diet'].includes(el.dataset.k))?val:+val;save();afterChange(bf,true);render(true);break;}
   case 'pb':S.pb[el.dataset.k]=el.dataset.k==='meal'?+val:val;save();render(true);break;
   case 'meas':{const bf=snap(),c=el.dataset.c,k=el.dataset.k;if(k==='weight'){D(c).weight=val===''?'':+val;}else{(S.meas[c]=S.meas[c]||{})[k]=val===''?'':+val;}save();afterChange(bf,false);render(true);break;}
   case 'bench':{const bf=snap(),c=el.dataset.c;(S.bench[c]=S.bench[c]||{})[el.dataset.k]=val===''?'':+val;save();afterChange(bf,false);render(true);break;}
   case 'alarm':{S.alarm[el.dataset.k]=val;save();if(el.dataset.k!=='ntfy')S.alarm.lastSlot=slotId(new Date());ntfySoon();break;}
   case 'import':{const fl=el.files[0];if(!fl)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!=='object'||!o.v)throw 0;localStorage.setItem(KEY,JSON.stringify(o));S=load();save();render();toast('Backup imported');}catch(_){toast('Invalid backup file','r');}};r.readAsText(fl);break;}
  }
});
window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(TABS.includes(v)&&v!==view){view=v;render();}});
window.addEventListener('scroll',()=>{$('#bar').classList.toggle('scrolled',window.scrollY>30);},{passive:true});

/* rest timer */
const tm={end:0,total:0,iv:null};
function startTimer(sec){
  tm.total=sec;tm.end=Date.now()+sec*1000;
  const el=$('#timer');if(el)el.classList.add('show');
  if(!tm.iv)tm.iv=setInterval(tick,250);
  tick();
}
function stopTimer(){
  clearInterval(tm.iv);tm.iv=null;
  const el=$('#timer');if(el)el.classList.remove('show');
}
function tick(){
  const left=Math.max(0,Math.ceil((tm.end-Date.now())/1000));
  const tt=$('#tt'),tb=$('#tbar');
  if(tt)tt.textContent=Math.floor(left/60)+':'+pad2(left%60);
  if(tb)tb.style.width=(100-left/tm.total*100)+'%';
  if(left<=0){
    sfx('ding');buzz([200,100,200]);
    clearInterval(tm.iv);tm.iv=null;
    setTimeout(()=>{if(!tm.iv){const el=$('#timer');if(el)el.classList.remove('show');}},1200);
  }
}

/* ============================================================
   BOOT
   ============================================================ */
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
  navigator.serviceWorker.register('sw.js').then(r=>{
    swReg=r;
    r.update().catch(()=>{});
  }).catch(()=>{});
  navigator.serviceWorker.ready.then(r=>{swReg=r;r.update().catch(()=>{});}).catch(()=>{});
}
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
setInterval(alarmTick,20000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){alarmTick();dailyCheck();ntfySoon();}});
function dailyCheck(){
  if(!S.hunter.awakened||!S.start)return;const cd=curDay();
  if(daysSinceStart()>=1&&daysSinceStart()<=30&&!S.seen[cd]&&!ovRoot().children.length)pushWin(()=>dailyArrival(cd));
}
render();
if(!S.hunter.awakened)pushWin(awakenStart);else{dailyCheck();alarmTick();ntfySoon();}

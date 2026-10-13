const KEY='tcfb1_v1';
let S=JSON.parse(localStorage.getItem(KEY)||'{}');S.ans=S.ans||{R:{},G:{},L:{}};S.w=S.w||{};S.hist=S.hist||[];S.xp=S.xp||0;S.streak=S.streak||0;S.spk=S.spk||{};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const SEC={R:{n:'Compréhension écrite',en:'Reading',d:READING,ic:'Lecture',g:'Aa'},G:{n:'Structures de la langue',en:'Grammar practice',note:'Not an exam section in the TCF IRN',d:GRAMMAR,ic:'Langue',g:'§'},L:{n:'Compréhension orale',en:'Listening',d:LISTENING,ic:'Écoute',g:'∿'}};
const $=s=>document.querySelector(s),app=$('#app'),top_=$('#top');
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const day=d=>d.toISOString().slice(0,10);
const BANK_LV='B1'; // highest level tagged in the item bank; items may carry lv:'B2' later
function level(p,lv){lv=lv||BANK_LV;return p>=75?`${lv} ready`:p>=55?`${lv} close`:`${lv} not yet`}
function lvlTxt(c,t){if(!t)return'—';const p=Math.round(100*c/t);return `${c}/${t} (${p}%) · <b>${level(p)}</b>*`}
function score(k){const a=S.ans[k],d=SEC[k].d;let c=0,t=0;for(const i in a){t++;if(a[i]===d[i].a)c++}return[c,t]}
function streakAlive(){if(!S.last)return 0;const y=new Date();y.setDate(y.getDate()-1);return S.last===day(new Date())||S.last===day(y)?S.streak:0}
function addXP(n){S.xp+=n;const t=day(new Date());if(S.last!==t){const y=new Date();y.setDate(y.getDate()-1);S.streak=S.last===day(y)?S.streak+1:1;S.last=t}save()}
let timerId=null,mock=null;
function stopTimer(){clearInterval(timerId);timerId=null}
function confetti(){/* no celebration effects: feedback card gets a soft pulse */requestAnimationFrame(()=>{const r=document.querySelector('.fb');if(r)r.classList.add('pulse')})}
// ---- speech
let frVoice=null;
function pickVoice(){const v=speechSynthesis.getVoices();if(!v.length)return;frVoice=v.find(x=>x.lang==='fr-FR'&&/Thomas|Amélie|Audrey|Google/i.test(x.name))||v.find(x=>x.lang==='fr-FR')||v.find(x=>/^fr/i.test(x.lang))||null}
if('speechSynthesis'in window){pickVoice();speechSynthesis.addEventListener('voiceschanged',pickVoice)}
var player=new Audio();player.preload='auto';
function stopAudio(){try{player.pause()}catch(e){}if('speechSynthesis'in window)speechSynthesis.cancel()}
function ttsFallback(t,rate){if(!('speechSynthesis'in window)){alert('Audio could not play in this browser.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';if(!frVoice)pickVoice();if(frVoice)u.voice=frVoice;u.rate=rate||0.9;speechSynthesis.speak(u)}
function speak(t,rate){const k=window.AUDIO_MAP&&AUDIO_MAP[t];stopAudio();if(!k){ttsFallback(t,rate);return}
 const src='audio/'+k+(rate&&rate<0.8?'-slow':'')+'.mp3';
 if(!player.src.endsWith(src))player.src=src;player.currentTime=0;
 const p=player.play();if(p&&p.catch)p.catch(e=>{console.warn('audio fallback',e&&e.name);ttsFallback(t,rate)})}
// ---- chrome
function ring(f,sz=44,sw=4){const r=(sz-sw)/2,c=2*Math.PI*r;return `<svg class="pr" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" aria-hidden="true"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" stroke-width="${sw}" class="trk"/><circle cx="${sz/2}" cy="${sz/2}" r="${r}" stroke-width="${sw}" class="val" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-Math.max(0,Math.min(1,f)))}" transform="rotate(-90 ${sz/2} ${sz/2})"/></svg>`}
function topHome(){top_.className='';top_.innerHTML=`<div class="brand"><div class="brand-row"><span class="mono">tcf</span><em>IRN</em></div><a class="by" href="https://underkover.com" target="_blank" rel="noopener">by underkover</a></div><div class="pill" title="Practice days in a row">${streakAlive()} j</div><div class="pill" title="Practice points">${S.xp} pts</div>`}
function topSes(frac,extra=''){top_.className='ses';top_.innerHTML=`<button class="x-btn" aria-label="Fermer" onclick="${mock?"if(confirm('Quit the mock test?'))go('home')":"go('home')"}"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><div class="prog"><i style="width:${Math.max(0,Math.min(1,frac))*100}%"></i></div>${extra}`}
function hideBanner(){const f=document.querySelector('.fb');if(f)f.remove()}
function showBanner(ok,title,body,btn,fn){hideBanner();const a=document.createElement('aside');a.className='fb '+(ok?'ok':'bad');a.setAttribute('role','status');
 a.innerHTML=`<div class="fb-h"><span class="dot"></span><h3>${title}</h3></div><p>${body}</p><button class="btn pri w" id="cont">${btn||'Suite'} <span aria-hidden="true">→</span></button>`;
 const ft=app.querySelector('.nav');app.insertBefore(a,ft||null);$('#cont').onclick=fn;requestAnimationFrame(()=>{a.classList.add('on')})}
function tabs(cur){const t=[['home','Accueil','M3 10l7-6 7 6v7H3z'],['mockStart','Examen','M10 3a7 7 0 100 14 7 7 0 000-14zm0 3v4l3 2'],['writing','Écrit','M4 16l2-.5L16 5.5 14.5 4 4.5 14zM12 6l2 2'],['speaking','Oral','M10 3v8m-3-3a3 3 0 006 0M6 11a4 4 0 008 0m-4 4v2'],['welcome','Aperçu','M10 9v5m0-8v.01M10 2a8 8 0 100 16 8 8 0 000-16z']];
 return `<nav class="tabs" aria-label="Navigation"><div><span class="navbrand">tcf <em>IRN</em><a class="by" href="https://underkover.com" target="_blank" rel="noopener">by underkover</a></span>${t.map(([v,l,d])=>`<button class="${cur===v?'on':''}" onclick="go('${v}',0)"><svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg><span>${l}</span></button>`).join('')}</div></nav>`}
function foot(html){return `<div class="foot"><div>${html}</div></div>`}
// ---- router
function go(v,arg){stopTimer();hideBanner();stopAudio();scrollTo(0,0);
 if(v!=='mock')mock=null;document.body.dataset.v=v;({home,quiz,writing,speaking,mockStart,results,welcome}[v]||home)(arg)}
function home(){topHome();
 const st=streakAlive(),all=['L','G','R'].map(k=>score(k)),tot=all.reduce((a,b)=>a+b[1],0),cor=all.reduce((a,b)=>a+b[0],0),N=READING.length+GRAMMAR.length+LISTENING.length;
 const wd=Object.values(S.w).filter(x=>x.t&&x.t.trim()).length,sd=Object.keys(S.spk).length,h=new Date().getHours();
 const tile=(k,cls)=>{const[c,t]=score(k),d=SEC[k].d.length;return `<button class="tile ${cls}" onclick="go('quiz',{k:'${k}',i:firstUn('${k}')})"><span class="eyebrow">${SEC[k].ic}</span>${EMB[k]?ART(EMB[k],'emb'):`<span class="glyph" aria-hidden="true">${SEC[k].g}</span>`}<span class="tt">${SEC[k].en}</span><span class="meta">${t}/${d}${t?' · '+level(100*c/t)+'*':''}</span><span class="bar"><i style="width:${100*t/d}%"></i></span></button>`};
 app.innerHTML=`<section class="intro anim">${ART('hero-accent','heroart')}<p class="eyebrow">${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</p><h1>${h<18?'Bonjour':'Bonsoir'}, <i>on s'entraîne&nbsp;?</i></h1></section>
 <div class="bento">
  <div class="tile hero anim"><div class="ringwrap">${ring(N?tot/N:0,104,8)}<div class="rv"><b>${Math.round(100*tot/N)}%</b><span>done</span></div></div><div><span class="eyebrow">Progress</span><p class="lead">${tot} of ${N} questions answered${tot?` · <b>${level(100*cor/tot)}</b>*`:''}</p><p class="meta">${st?`${st} day${st>1?'s':''} in a row. Keep the rhythm.`:'Answer one question today to start a practice run.'}</p></div></div>
  ${tile('L','t-w anim')}${tile('G','anim')}${tile('R','anim')}
  <button class="tile anim" onclick="go('writing',0)"><span class="eyebrow">Production</span>${ART('emblem-writing','emb')}<span class="tt">Writing</span><span class="meta">${wd}/${WRITING.length} drafts</span><span class="bar"><i style="width:${100*wd/WRITING.length}%"></i></span></button>
  <button class="tile anim" onclick="go('speaking',0)"><span class="eyebrow">Production</span>${ART('emblem-speaking','emb')}<span class="tt">Speaking</span><span class="meta">${sd}/${SPEAKING.length} done</span><span class="bar"><i style="width:${100*sd/SPEAKING.length}%"></i></span></button>
  <button class="tile exam anim" onclick="go('mockStart')"><span class="eyebrow">Examen blanc</span><span class="tt">Short mock · IRN style</span><span class="meta">Listening then reading · separate timers</span><span class="arrow" aria-hidden="true">→</span></button>
 </div>
 ${S.hist.length?`<div class="card"><span class="eyebrow">Mock test history</span>${S.hist.filter(h=>h.t).slice(-5).reverse().map(h=>`<div class="hist"><span>${h.d}</span><b>${h.L?`L ${h.L[0]}/${h.L[1]} · R ${h.R[0]}/${h.R[1]}`:`${h.c}/${h.t}`}</b><span>${level(100*h.c/h.t)}*</span></div>`).join('')}</div>`:''}
 <p class="mut small">* A rough practice signal (ready ≥75%, close 55–74%, not yet &lt;55%) from B1-level questions only, not an official TCF result. In the real TCF IRN, listening and reading are scored out of 499 (B1 = 300–399, B2 = 400–499) and writing and speaking out of 20 (B1 = 6–9, B2 = 10–13).</p>
 <div class="scene">${ART('scene-band-wide','sw')}${ART('scene-band-mobile','sm')}</div>
<p class="site-credit"><a href="https://underkover.com" target="_blank" rel="noopener">by underkover</a><span aria-hidden="true"> · </span><a href="terms.html">Terms</a></p>
 <button class="btn ghost w" onclick="if(confirm('Erase all progress, points and practice days?')){localStorage.removeItem(KEY);location.reload()}">Reset progress</button>${tabs('home')}`}
function askSkip(onSave,onSkip){const prev=document.activeElement,m=document.createElement('div');m.className='modal-bg';
 m.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt" aria-describedby="md"><h3 id="mt">Vous avez choisi une réponse.</h3><p id="md">Valider cette réponse ou passer sans répondre&nbsp;?<br><span class="mut">You picked an answer. Save it or skip?</span></p><button class="btn pri w" id="m-save">Valider ma réponse <span class="en">save</span></button><button class="btn ghost w" id="m-skip">Passer sans répondre <span class="en">skip</span></button><button class="btn link w" id="m-x">Annuler <span class="en">cancel</span></button></div>`;
 document.body.appendChild(m);const bs=[...m.querySelectorAll('button')];
 const close=f=>{m.remove();document.removeEventListener('keydown',kd,true);if(f)f();else if(prev&&prev.focus)prev.focus()};
 const kd=e=>{if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab'){const a=bs.indexOf(document.activeElement),n=e.shiftKey?(a<=0?bs.length-1:a-1):(a+1)%bs.length;e.preventDefault();bs[n].focus()}};
 document.addEventListener('keydown',kd,true);m.onclick=e=>{if(e.target===m)close()};
 m.querySelector('#m-save').onclick=()=>close(onSave);m.querySelector('#m-skip').onclick=()=>close(onSkip);m.querySelector('#m-x').onclick=()=>close();
 bs[0].focus()}
const ART=(n,c)=>`<picture class="art ${c}" aria-hidden="true"><source media="(prefers-color-scheme:dark)" srcset="art/dark/${n}.webp"><img src="art/${n}.webp" alt="" loading="lazy" decoding="async"></picture>`;
const ARTD=(n,c)=>`<span class="art ${c}" aria-hidden="true"><img src="art/${n}.webp" alt="" loading="lazy" decoding="async"></span>`;
const EMB={L:'emblem-listening',R:'emblem-reading'};
function firstUn(k){const d=SEC[k].d;for(let i=0;i<d.length;i++)if(!(i in S.ans[k]))return i;return 0}
// ---- question card
function qHTML(k,q,chosen,show,sel){let h='';
 if(k==='L'){h+=`<div class="row" style="justify-content:center;margin:6px 0 10px"><button class="btn pri spk" aria-label="Écouter" onclick='speak(${JSON.stringify(q.s).replace(/'/g,"&#39;")})'><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg><span>Écouter</span></button><button class="btn ghost spk" aria-label="Lentement" onclick='speak(${JSON.stringify(q.s).replace(/'/g,"&#39;")},0.7)'><span class="slow">0.7×</span><span>Lentement</span></button></div><p class="mut" style="text-align:center">Tap to listen · replay as often as you like</p>`;
  if(show)h+=`<div class="text anim"><span class="eyebrow">Transcript</span>${esc(q.s)}</div>`}
 else if(q.t)h+=`<div class="text">${esc(q.t)}</div>`;
 h+=`<div class="q">${esc(q.q)}</div>`;
 q.o.forEach((o,j)=>{let c='';if(show){if(j===q.a)c='ok';else if(j===chosen)c='bad'}else if(j===sel)c='sel';h+=`<button class="opt ${c}" data-j="${j}" ${show?'disabled':''}><span class="k">${'ABCD'[j]}</span>${esc(o)}</button>`});
 return h}
const tag=k=>`<span class="chip">${SEC[k].ic} · ${SEC[k].en}</span>`;
function quiz({k,i}){const d=SEC[k].d,q=d[i],ch=S.ans[k][i],show=ch!==undefined;let sel=null;
 topSes(Object.keys(S.ans[k]).length/d.length,`<div class="pill">${S.xp} pts</div>`);
 const next=()=>i<d.length-1?go('quiz',{k,i:i+1}):go('results',k);
 const render=()=>{app.innerHTML=`<div class="anim">${tag(k)} <span class="mut">Question ${i+1}/${d.length}</span><div style="height:8px"></div>${qHTML(k,q,ch,show,sel)}</div>
  ${show?'':foot(`<button class="btn pri w" id="chk" ${sel===null?'disabled':''}>Valider la réponse</button>`)}
  <div class="row nav qnav"><button class="btn ghost back" aria-label="Question précédente" ${i?'':'disabled'} onclick="go('quiz',{k:'${k}',i:${i-1}})">←</button><button class="btn link skip" id="skip">Passer <span class="en">skip</span> →</button></div>`;
  app.querySelectorAll('.opt:not([disabled])').forEach(b=>b.onclick=()=>{sel=+b.dataset.j;render()});
  const commit=()=>{S.ans[k][i]=sel;const ok=sel===q.a;if(ok){addXP(10);confetti()}else addXP(2);go('quiz',{k,i,fresh:1})};
  const skip=()=>i===d.length-1?go('results',k):go('quiz',{k,i:i+1});
  const c=$('#chk');if(c)c.onclick=commit;
  $('#skip').onclick=()=>{if(show||sel===null)return skip();askSkip(commit,skip)}};
 render();
 if(show){const ok=ch===q.a;showBanner(ok,ok?'Correct'+(arguments[0].fresh?' · +10 pts':''):'Pas tout à fait · answer '+'ABCD'[q.a],esc(q.e),'Question suivante',next)}}
function results(k){const[c,t]=score(k),p=t?100*c/t:0;topSes(1);
 app.innerHTML=`<div class="anim" style="text-align:center">${ART('emblem-results','resart')}<div class="big">${ring(p/100,120,8)}<b>${Math.round(p)}%</b></div><h2>${SEC[k].n}</h2><p>${lvlTxt(c,t)}</p><p class="mut">Answered ${t} of ${SEC[k].d.length}. * Estimate only, not an official TCF result.</p></div>
 ${foot(`<div class="row"><button class="btn ghost" onclick="if(confirm('Clear answers for this section?')){S.ans['${k}']={};save();go('quiz',{k:'${k}',i:0})}">Refaire</button><button class="btn pri" onclick="go('home')">Continuer</button></div>`)}`;
 if(p>=70)confetti(160)}
// ---- mock
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const MOCK_PLAN=()=>[{k:'L',n:Math.min(25,LISTENING.length),min:0},{k:'R',n:Math.min(25,READING.length),min:0}].map(p=>({...p,min:Math.round(p.n*(p.k==='L'?20:35)/25)}));
function mockStart(){topSes(0);const P=MOCK_PLAN(),full=P.every(p=>p.n>=25);
 app.innerHTML=`<div class="anim" style="text-align:center">${ART('emblem-results','resart')}<h2>${full?'Mock test · TCF IRN style':'Short mock · TCF IRN style'}</h2></div><div class="card">The real TCF IRN starts with <b>listening (25 questions, 20 min)</b>, then <b>reading (25 questions, 35 min)</b>, each with its own time limit. There is no grammar section.${full?'':`<p>This is a <b>short mock</b> while the question bank grows: <b>${P[0].n} listening questions in ${P[0].min} min</b>, then <b>${P[1].n} reading questions in ${P[1].min} min</b> (time scaled to the real pace).</p>`}<p class="mut">No feedback until the end. You can go back within a section, not into a finished one. Writing and speaking are practised separately.</p></div>
 <label class="chk card"><input type="checkbox" id="rp"> Allow replays (practice mode). In the real exam each recording plays only once.</label>
 ${foot(`<button class="btn pri w" onclick="mockBegin($('#rp').checked)">Commencer</button>`)}`}
function mockBegin(replay){const pick=(k,n)=>shuffle(SEC[k].d.map((_,i)=>i)).slice(0,n).map(i=>({k,i}));
 const P=MOCK_PLAN();mock={P,ph:0,secs:P.map(p=>pick(p.k,p.n)),a:P.map(()=>({})),cur:0,played:{},replay:!!replay,end:Date.now()+P[0].min*60e3};mockShow()}
function tick(){const r=Math.max(0,mock.end-Date.now()),e=$('#clk');if(e)e.textContent=`${Math.floor(r/6e4)}:${String(Math.floor(r/1e3)%60).padStart(2,'0')}`;if(!r)mockNext(true)}
function mockNext(timeout){stopTimer();stopAudio();if(mock.ph<mock.P.length-1){const t=timeout;mock.ph++;mock.cur=0;topSes(.5);
  app.innerHTML=`<div class="anim" style="text-align:center">${ART('emblem-reading','resart')}<h2>${t?'Temps écoulé · ':''}Compréhension écrite</h2></div><div class="card">Listening is finished. Next: <b>${mock.P[1].n} reading questions in ${mock.P[1].min} min</b>. The timer starts when you press Commencer.</div>${foot(`<button class="btn pri w" id="nx">Commencer la lecture</button>`)}`;
  $('#nx').onclick=()=>{mock.end=Date.now()+mock.P[mock.ph].min*60e3;mockShow()}}else mockFinish(timeout)}
function mockPlay(i){const q=SEC.L.d[i];if(!mock.replay&&mock.played[i])return;mock.played[i]=1;speak(q.s);if(!mock.replay){const b=$('#mplay');if(b){b.disabled=true;b.querySelector('span').textContent='Écouté (once)'}}}
function mockShow(){stopAudio();scrollTo(0,0);stopTimer();
 const{ph,cur}=mock,qs=mock.secs[ph],A=mock.a[ph],{k,i}=qs[cur],q=SEC[k].d[i],ch=A[cur];
 topSes((ph+Object.keys(A).length/qs.length)/mock.P.length,'<div class="pill clk" id="clk"></div>');timerId=setInterval(tick,1000);tick();
 let body;if(k==='L'){const used=!mock.replay&&mock.played[i];body=`<div class="row" style="justify-content:center;margin:6px 0 10px"><button class="btn pri spk" id="mplay" ${used?'disabled':''} onclick="mockPlay(${i})"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg><span>${used?'Écouté (once)':'Écouter'}</span></button></div><p class="mut" style="text-align:center">${mock.replay?'Practice mode: replay allowed.':'Exam mode: the recording plays once.'}</p><div class="q">${esc(q.q)}</div>`+q.o.map((o,j)=>`<button class="opt ${j===ch?'sel':''}" data-j="${j}"><span class="k">${'ABCD'[j]}</span>${esc(o)}</button>`).join('')}else body=qHTML(k,q,null,false,ch);
 const last=cur===qs.length-1,lastSec=ph===mock.P.length-1;
 app.innerHTML=`<div class="anim">${tag(k)} <span class="mut">${cur+1}/${qs.length}</span><div style="height:8px"></div>${body}</div>
 ${foot(`<div class="row"><button class="btn ghost" style="flex:0 0 64px" ${cur?'':'disabled'} onclick="mock.cur--;mockShow()">←</button>${!last?`<button class="btn pri" onclick="mock.cur++;mockShow()">Suivant</button>`:`<button class="btn pri" onclick="if(confirm('${lastSec?'Finish and see score?':'Finish listening and start reading?'}'))mockNext()">${lastSec?'Terminer':'Section suivante'}</button>`}</div>`)}
 ${!last?`<button class="btn ghost w" onclick="if(confirm('${lastSec?'Finish now and see score?':'Finish listening now and start reading?'}'))mockNext()">${lastSec?"Terminer l'examen":'Terminer la section'}</button>`:''}`;
 app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{A[cur]=+b.dataset.j;mockShow()})}
function mockFinish(timeout){stopTimer();const m=mock;const by={};let c=0,t=0,ans=0;
 m.P.forEach((p,ph)=>{by[p.k]=[0,m.secs[ph].length];m.secs[ph].forEach(({k,i},n)=>{if(n in m.a[ph])ans++;if(m.a[ph][n]===SEC[k].d[i].a){by[k][0]++;c++}});t+=m.secs[ph].length});
 const saved=ans>0;if(saved){S.hist.push({d:new Date().toLocaleDateString('fr-FR'),c,t,L:by.L,R:by.R});addXP(c*3)}else save();
 mock=null;const p=100*c/t;topSes(1);
 app.innerHTML=`<div class="anim" style="text-align:center"><div class="big">${ring(p/100,120,8)}<b>${Math.round(p)}%</b></div><h2>${timeout?'Temps écoulé ! ':''}${c}/${t}</h2><p>${saved?`Overall: <b>${level(p)}</b>* · +${c*3} pts`:'No answers given, so this mock was not saved to your history.'}</p></div>
 <div class="sc">${m.P.map(({k})=>`<div><span class="eyebrow">${SEC[k].ic}</span><b>${by[k][0]}/${by[k][1]}</b><span class="mut">${level(100*by[k][0]/by[k][1])}*</span></div>`).join('')}</div>
 <p class="mut">* Practice signal from B1-level questions only, not an official TCF result. Unanswered questions count as wrong.</p><h2>Corrections</h2>
 ${m.P.map((_,ph)=>m.secs[ph].map(({k,i},n)=>{const q=SEC[k].d[i],a=m.a[ph][n],ok=a===q.a;return `<div class="card">${tag(k)}<div style="height:6px"></div>${qHTML(k,q,a,true)}<div class="text" style="background:${ok?'var(--okl)':'var(--badl)'}">${ok?'Correct —':'Answer '+'ABCD'[q.a]+' —'} ${esc(q.e)}</div></div>`}).join('')).join('')}
 ${foot(`<button class="btn pri w" onclick="go('home')">Continuer</button>`)}`}
// ---- writing
function wc(t){return(t.trim().match(/[\p{L}\p{N}'’-]+/gu)||[]).length}
function writing(n){const w=WRITING[n],st=S.w[n]||{t:'',c:[]};topSes((n+1)/WRITING.length,`<div class="pill">${S.xp} pts</div>`);
 app.innerHTML=`<div class="anim"><span class="chip">Production · Writing</span> <span class="mut">Tâche ${n+1}/${WRITING.length}</span>
 <div class="q">${esc(w.p)}</div><p class="mut">${esc(w.en)}</p>
 <textarea id="ta" placeholder="Écrivez ici…" autocapitalize="sentences">${esc(st.t)}</textarea><div class="row" style="justify-content:space-between;margin:6px 0 14px"><span id="wc"></span><span class="mut">Target ${w.min}–${w.max} words${w.ex?` · ${w.ex}`:''}</span></div>
 <div class="card"><span class="eyebrow">Self-check</span>${RUBRIC.map((r,j)=>`<label class="chk"><input type="checkbox" data-j="${j}" ${st.c.includes(j)?'checked':''}>${r}</label>`).join('')}<div id="rs" class="mut"></div></div>
 <button class="btn ghost w" onclick="this.nextElementSibling.hidden=!this.nextElementSibling.hidden">Show model answer</button><div class="model" hidden>${esc(w.m)}<div class="mut">(${wc(w.m)} words)</div></div></div>
 ${foot(`<div class="row"><button class="btn ghost" style="flex:0 0 64px" ${n?'':'disabled'} onclick="go('writing',${n-1})">←</button><button class="btn pri" id="done">${n<WRITING.length-1?'Continuer':'Terminer'}</button></div>`)}`;
 const ta=$('#ta'),upd=()=>{const c=wc(ta.value);$('#wc').innerHTML=`<b style="color:${c<w.min||c>w.max?'var(--bad)':'var(--ok)'}">${c} words</b>`;st.t=ta.value;st.c=[...app.querySelectorAll('.chk input:checked')].map(x=>+x.dataset.j);S.w[n]=st;save();$('#rs').textContent=`${st.c.length}/${RUBRIC.length} criteria ticked`};
 ta.oninput=upd;app.querySelectorAll('.chk input').forEach(x=>x.onchange=upd);upd();
 $('#done').onclick=()=>{const c=wc(ta.value);if(c>=w.min&&!st.xp){st.xp=1;addXP(20);save();confetti();showBanner(true,'Draft saved · +20 pts',`${c} words written. Compare with the model answer and tick the checklist.`,'Tâche suivante',()=>n<WRITING.length-1?go('writing',n+1):go('home'))}else n<WRITING.length-1?go('writing',n+1):go('home')}}
// ---- speaking
function fmt(s){return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function speaking(n){const s=SPEAKING[n];let left,phase;topSes((n+1)/SPEAKING.length,`<div class="pill">${S.xp} pts</div>`);
 app.innerHTML=`<div class="anim"><span class="chip">Production · Speaking</span> <span class="mut">Tâche ${n+1}/${SPEAKING.length}</span>
 <div class="q">${esc(s.p)}</div><p class="mut">${esc(s.en)}</p>
 <div class="card" style="text-align:center"><p class="mut">${s.prep?`${s.prep/60} min preparation, then speak for ${fmt(s.sec)}.`:`Speak out loud for about ${fmt(s.sec)}, no preparation. Tip: record yourself with Voice Memos.`}${s.ex?`<br>${s.ex}`:''}</p>
 <div class="timer" id="tm">${fmt(s.prep||s.sec)}</div><div class="mut" id="ph">${s.prep?'Préparation':'Prêt ?'}</div>
 <div class="row" style="margin-top:10px"><button class="btn pri" id="go">Démarrer</button><button class="btn ghost" style="flex:0 0 64px" onclick="go('speaking',${n})">↺</button></div></div>
 <button class="btn ghost w" onclick="this.nextElementSibling.hidden=!this.nextElementSibling.hidden">Show model answer</button><div hidden><div class="model">${esc(s.m)}</div><button class="btn pri w" onclick='speak(${JSON.stringify(s.m).replace(/'/g,"&#39;")},0.85)'>Listen to model</button></div></div>
 ${foot(`<div class="row"><button class="btn ghost" style="flex:0 0 64px" ${n?'':'disabled'} onclick="go('speaking',${n-1})">←</button><button class="btn pri" onclick="${n<SPEAKING.length-1?`go('speaking',${n+1})`:"go('home')"}">${n<SPEAKING.length-1?'Continuer':'Terminer'}</button></div>`)}`;
 $('#go').onclick=()=>{if(timerId)return;left=s.prep||s.sec;phase=s.prep?'prep':'talk';$('#ph').textContent=phase==='prep'?'Préparation…':'Parlez !';
  timerId=setInterval(()=>{left--;$('#tm').textContent=fmt(left);if(left<=0){if(phase==='prep'){phase='talk';left=s.sec;$('#ph').textContent='Parlez !'}else{stopTimer();$('#ph').textContent='Terminé';navigator.vibrate&&navigator.vibrate(300);if(!S.spk[n]){S.spk[n]=1;addXP(15)}confetti();showBanner(true,'Time · +15 pts','Now compare with the model answer.','OK',hideBanner)}}},1000)}}
const SEEN='tcfb1_seen';
function welcome(){top_.className='wl';top_.innerHTML=`<div class="brand"><div class="brand-row"><span class="mono">tcf</span><em>IRN</em></div><a class="by" href="https://underkover.com" target="_blank" rel="noopener">by underkover</a></div><button class="pill" onclick="startApp()">${localStorage.getItem(SEEN)?'Mon tableau →':'Passer →'}</button>`;
 const f=(n,t,d,e)=>`<li class="anim"><span class="num">${n}</span><div><b>${t}</b><span>${d}</span></div>${e?ARTD(e,'wemb'):''}</li>`;
 app.innerHTML=`<section class="wel">
 <div class="wel-hero anim"><p class="eyebrow">Free practice · TCF IRN · niveau B1</p>
 <h1 class="display">Le français<br><i>pour vivre en France.</i></h1>
 <p class="lede">Free practice for the <b>TCF IRN</b>. <b>B1</b> for the 10-year residence card, <b>B2</b> for French nationality. Questions here are at B1 level for now. Short daily sessions, explained in English.</p><p class="rules small"><b>Rules changed on 1 Jan 2026:</b> nationality (naturalisation or marriage) now needs B2, the 10-year card B1, a first multi-year card A2. <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F11926" target="_blank" rel="noopener">Nationality</a> · <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F34501" target="_blank" rel="noopener">Residence cards</a> (service-public.gouv.fr). Check with your préfecture and test centre which test version they accept.</p>
 <div class="cta"><button class="btn acc" onclick="startApp()">Commencer <span aria-hidden="true">→</span></button><a class="lnk" href="#inside" onclick="event.preventDefault();document.getElementById('inside').scrollIntoView({behavior:'smooth'})">What's inside</a></div>
 ${ARTD('hero-accent','whero')}<div class="stamp" aria-hidden="true"><span>B1</span><small>practice level</small></div></div>
 <h2 id="inside" class="anim">What's inside</h2>
 <ol class="feat">${f('01','Compréhension orale',`Listening: ${LISTENING.length} questions read aloud by a French (fr-FR) voice, with normal and slow replay.`,'emblem-listening')}
 ${f('02','Compréhension écrite',`Reading: ${READING.length} questions on everyday texts.`,'emblem-reading')}
 ${f('03','Structures de la langue',`Grammar practice: ${GRAMMAR.length} questions. Not an exam section in the TCF IRN.`)}
 ${f('04','Expression écrite',`Writing: ${WRITING.length} tasks with a word counter, checklist and model answers.`,'emblem-writing')}
 ${f('05','Expression orale',`Speaking: ${SPEAKING.length} timed tasks with model answers you can listen to.`,'emblem-speaking')}
 ${f('IRN','Short mock',`Listening then reading, each with its own timer, recordings played once (replays optional), full corrections.`,'emblem-results')}</ol>
 <div class="facts"><div class="card anim"><span class="eyebrow">In English</span>Every answer comes with a short English explanation.</div>
 <div class="card anim"><span class="eyebrow">Private</span>No account, no sign-up. Your progress stays on this device, in this browser.</div>
 <div class="card anim"><span class="eyebrow">Estimate only</span>The site only says “B1 ready / close / not yet” from practice scores. It is not an official TCF result.</div></div>
 <button class="btn acc w big-cta" onclick="startApp()">Commencer <span aria-hidden="true">→</span></button>
 <div class="scene wscene">${ARTD('scene-band-wide','sw')}${ARTD('scene-band-mobile','sm')}</div>
 <p class="mut small">Not affiliated with France Éducation international, which runs the TCF. Questions are practice material and may differ from the real exam.</p>
 <p class="site-credit"><a href="https://underkover.com" target="_blank" rel="noopener">by underkover</a><span aria-hidden="true"> · </span><a href="terms.html">Terms</a></p></section>`}
function startApp(){localStorage.setItem(SEEN,'1');go('home')}
go(localStorage.getItem(SEEN)?'home':'welcome');

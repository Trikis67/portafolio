/* ===== SONIDO: ambiente y teclas según el mundo (todo sintetizado con Web Audio, sin archivos) =====
   Taller: zumbido de taller + reloj · Cine: proyector suave en una sala tranquila · Computadora 2000: CRT, ventilador y disco duro
   Hacker: dron de sintetizador + pitidos de datos · Oeste: viento del desierto, guitarra lejana y espuelas. Empieza apagado; se recuerda la elección. */
(function(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 const btn=document.createElement('button');btn.type='button';btn.id='snd';btn.setAttribute('aria-pressed','false');btn.innerHTML='<i aria-hidden="true"></i><span>Sonido: no</span>';document.body.append(btn);
 let ctx=null,master=null,noise=null,amb=null,want=false,timers=[];
 try{want=localStorage.getItem('gsSound')==='1'}catch(e){}
 const world=()=>{const m=(document.body.className.match(/theme-(\w+)/)||[])[1];return m==='cine'||m==='pc'||m==='hacker'||m==='oeste'?m:'kraft'};
 function init(){if(ctx)return;ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  const len=ctx.sampleRate*2,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;noise=b}
 const now=()=>ctx.currentTime;
 function src(loop=true){const s=ctx.createBufferSource();s.buffer=noise;s.loop=loop;return s}
 function filt(type,f,q=1){const x=ctx.createBiquadFilter();x.type=type;x.frequency.value=f;x.Q.value=q;return x}
 function gain(v){const g=ctx.createGain();g.gain.value=v;return g}
 function osc(type,f){const o=ctx.createOscillator();o.type=type;o.frequency.value=f;return o}
 /* golpe corto de ruido filtrado (clics, teclas, disco duro) */
 function burst(dur,type,f,v,q=1,at=now()){const s=src(false),fl=filt(type,f,q),g=gain(0);s.connect(fl).connect(g).connect(master);g.gain.setValueAtTime(v,at);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.start(at,Math.random()*1.5);s.stop(at+dur+.02)}
 function tone(type,f,dur,v,at=now(),f2){const o=osc(type,f),g=gain(0);o.connect(g).connect(master);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.005);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+dur);o.start(at);o.stop(at+dur+.02)}
 /* cuerda pulsada: triángulo con armónico que se apaga, filtrado para sonar lejos */
 function pluck(f,at=now(),v=.03){[1,2].forEach((h,i)=>{const o=osc('triangle',f*h),g=gain(0),lp=filt('lowpass',1800);o.connect(lp).connect(g).connect(master);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v/(i+1),at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+1.6);o.start(at);o.stop(at+1.7)})}
 const every=(fn,min,max)=>{let id;const go=()=>{id=setTimeout(()=>{if(ctx&&want&&!document.hidden)fn();go()},min+Math.random()*(max-min));timers.push(id)};go()};
 /* ---------- ambientes ---------- */
 const AMB={
  kraft(){const n=src(),f=filt('lowpass',380),g=gain(.05);n.connect(f).connect(g).connect(master);n.start();let t=0;
   every(()=>{t^=1;tone('square',t?2100:1800,.025,.012);burst(.02,'bandpass',3200,.01,6)},1000,1000);return[n]},
  cine(){/* proyector: motor grave, el obturador que aletea suave, el aire de la sala y un acorde tibio que entra despacio */
   const mo=osc('sine',46),mg=gain(.006);mo.connect(filt('lowpass',120)).connect(mg).connect(master);
   const n=src(),f=filt('bandpass',1500,1.6),g=gain(.0032),lfo=osc('sine',12),lg=gain(.0026);lfo.connect(lg).connect(g.gain);n.connect(f).connect(filt('lowpass',2600)).connect(g).connect(master);
   const rm=src(),rf=filt('lowpass',240),rg=gain(.011);rm.connect(rf).connect(rg).connect(master);
   const pad=[110,138.6,164.8].map(fr=>{const o=osc('sine',fr),pg=gain(0),lp=filt('lowpass',480);o.connect(lp).connect(pg).connect(master);pg.gain.setValueAtTime(0,now());pg.gain.linearRampToValueAtTime(.0032,now()+5);o.start();return o});
   [mo,n,lfo,rm].forEach(x=>x.start());
   every(()=>{burst(.012,'bandpass',2300,.006,3);if(Math.random()<.4)burst(.012,'bandpass',2100,.004,3,now()+.09)},2600,6400);
   return[mo,n,lfo,rm,...pad]},
  pc(){const h1=osc('sine',60),h2=osc('sine',120),g1=gain(.018),g2=gain(.008);h1.connect(g1).connect(master);h2.connect(g2).connect(master);
   const n=src(),f=filt('lowpass',1100),g=gain(.022);n.connect(f).connect(g).connect(master);[h1,h2,n].forEach(x=>x.start());
   every(()=>{const k=3+Math.random()*4|0;for(let i=0;i<k;i++)burst(.008,'highpass',2500,.05,1,now()+i*(.03+Math.random()*.05))},3000,8000);return[h1,h2,n]},
  oeste(){const w=src(),wf=filt('bandpass',520,.9),wg=gain(.016),l1=osc('sine',.09),l1g=gain(260),l2=osc('sine',.05),l2g=gain(.008);
   l1.connect(l1g).connect(wf.frequency);l2.connect(l2g).connect(wg.gain);w.connect(wf).connect(wg).connect(master);[w,l1,l2].forEach(x=>x.start());
   const NOTES=[164.8,196,220,246.9,293.7,329.6];
   every(()=>{let at=now();const k=2+Math.random()*3|0;for(let i=0;i<k;i++){const f=NOTES[Math.random()*NOTES.length|0];pluck(f,at);at+=.32+Math.random()*.25}},5000,11000);
   every(()=>{for(let i=0;i<3;i++)tone('sine',4200+Math.random()*300,.03,.004,now()+i*.06)},3500,9000);
   every(()=>{for(let i=0;i<4;i++)tone('sine',2600+i*180,.25,.006,now()+i*.04)},14000,26000);
   return[w,l1,l2]},
  hacker(){const a=osc('sawtooth',55),b=osc('sawtooth',55.4),lp=filt('lowpass',320,4),g=gain(.03),lfo=osc('sine',.07),lg=gain(160);lfo.connect(lg).connect(lp.frequency);
   a.connect(lp);b.connect(lp);lp.connect(g).connect(master);[a,b,lfo].forEach(x=>x.start());
   every(()=>{const f=1200+Math.random()*1400;tone('sine',f,.06,.018);if(Math.random()<.5)tone('sine',f*1.5,.05,.012,now()+.07)},1500,4200);return[a,b,lfo]}};
 function stopAmb(){timers.forEach(clearTimeout);timers=[];if(amb){const old=amb;amb=null;setTimeout(()=>old.forEach(x=>{try{x.stop()}catch(e){}}),700)}}
 function startAmb(){if(!ctx)return;stopAmb();amb=AMB[world()]();}
 function fade(v){if(!ctx)return;master.gain.cancelScheduledValues(now());master.gain.setTargetAtTime(v,now(),.35)}
 /* ---------- teclas ---------- */
 const KEY={
  kraft(enter){if(enter){tone('sine',1800,.7,.05);tone('sine',2700,.5,.025)}else{burst(.035,'bandpass',2600+Math.random()*600,.09,3);tone('sine',120,.05,.04)}},
  cine(enter){tone('sine',enter?330:420+Math.random()*60,enter?.18:.06,.05,now(),enter?160:210)},
  pc(enter){burst(enter?.07:.04,'lowpass',enter?700:1100+Math.random()*300,.08)},
  oeste(enter){tone('sine',enter?560:760,enter?.16:.05,.04);if(enter)tone('sine',760,.06,.03,now()+.2)},
  hacker(enter){burst(.012,'highpass',4200,.07);tone('square',enter?880:2800+Math.random()*400,enter?.12:.012,.02);if(enter)tone('square',1320,.1,.015,now()+.08)}};
 addEventListener('keydown',e=>{if(!ctx||!want||e.repeat)return;const t=e.target;if(!t||!/INPUT|TEXTAREA/.test(t.tagName))return;if(e.key.length===1||e.key==='Backspace'||e.key==='Enter')KEY[world()](e.key==='Enter')},true);
 /* ---------- clics: más marcados sobre botones y enlaces, suaves en el resto ---------- */
 const CLICK={
  kraft(b){tone('sine',b?160:200,.06,b?.09:.04,now(),b?90:120);burst(.015,'bandpass',b?3400:2800,b?.06:.025,4)},
  cine(b){burst(.03,'bandpass',b?1500:1900,b?.09:.04,2);tone('triangle',b?240:300,.05,b?.04:.02,now(),b?160:220)},
  pc(b){burst(.006,'highpass',3000,b?.12:.06);burst(.006,'highpass',2400,b?.08:.04,1,now()+.06)},
  oeste(b){burst(.04,'lowpass',b?700:900,b?.12:.05,1.2);tone('sine',b?190:230,.07,b?.06:.025,now(),b?110:150)},
  hacker(b){tone('square',b?1600:2200,.03,b?.03:.015);if(b)tone('square',2400,.025,.02,now()+.035)}};
 addEventListener('pointerdown',e=>{if(!ctx||!want||e.button>0)return;const t=e.target,b=!!(t&&t.closest&&t.closest('a,button,[role=button],[role=menuitemradio],.tv,.map-lb,label,summary'));CLICK[world()](b)},true);
 /* ---------- scroll: el sonido sigue a la velocidad con la que bajas ---------- */
 let sNode=null,sGain=null,sWorld='',lastY=scrollY,acc=0,vel=0,sRaf=0;
 function scrollBed(){if(sNode){try{sNode.stop()}catch(e){}sNode=null}const w=world();sWorld=w;if(w==='pc'||w==='hacker')return;
  const n=src(),f=w==='cine'?filt('bandpass',1100,1.0):w==='oeste'?filt('bandpass',700,.7):filt('bandpass',2400,.6),g=gain(0);n.connect(f).connect(g).connect(master);
  n.start();sNode=n;sGain=g}
 function scrollTick(){sRaf=requestAnimationFrame(scrollTick);if(!ctx||!want||document.hidden)return;const y=scrollY,d=Math.abs(y-lastY);lastY=y;vel+=(d-vel)*.25;
  const w=world();if(w!==sWorld)scrollBed();
  if(sGain){sGain.gain.setTargetAtTime(Math.min(w==='cine'?.04:.09,vel*(w==='cine'?.0007:.0011)),now(),.05)}
  else{acc+=d;const step=w==='pc'?90:60;while(acc>step){acc-=step;if(w==='pc')burst(.006,'highpass',2600,.05);else tone('sine',2400+Math.random()*1600,.025,.008)}}}
 /* ---------- Orden de trabajo: se escribe en el ticket y, al completarla, el sello ---------- */
 const WRITE={
  kraft(){for(let i=0;i<7;i++)burst(.035,'bandpass',3000+Math.random()*1500,.035,3,now()+i*.045)},
  cine(){burst(.05,'bandpass',900,.12,1.5);tone('square',140,.05,.04);burst(.02,'highpass',3000,.05,1,now()+.07)},
  pc(){const o=osc('square',1150),g=gain(0),l=osc('square',38),lg=gain(.035);l.connect(lg).connect(g.gain);o.connect(filt('bandpass',1400,2)).connect(g).connect(master);o.start();l.start();o.stop(now()+.32);l.stop(now()+.32)},
  hacker(){[0,1,2,3].forEach(i=>tone('square',700+i*260,.035,.02,now()+i*.04))},
  oeste(){for(let i=0;i<6;i++)burst(.05,'bandpass',1800+Math.random()*900,.03,2,now()+i*.06)}};
 const STAMP={kraft(){tone('sine',90,.25,.18,now(),45);burst(.06,'lowpass',500,.18)},cine(){burst(.03,'highpass',2000,.22);tone('square',180,.08,.08)},
  pc(){tone('sine',1320,.5,.05);tone('sine',1760,.6,.04,now()+.12)},oeste(){tone('sine',80,.3,.2,now(),45);burst(.07,'lowpass',450,.2);[0,1,2].forEach(i=>tone('sine',2600+i*220,.4,.012,now()+.12+i*.05))},hacker(){[523,659,784,1046].forEach((f,i)=>tone('square',f,.16,.025,now()+i*.07))}};
 addEventListener('click',e=>{if(!ctx||!want)return;const b=e.target.closest&&e.target.closest('#orden .ow-o');if(b)setTimeout(()=>WRITE[world()](),20)},true);
 {const tk=document.querySelector('#orden .ow-tk');if(tk){let was=tk.classList.contains('ok');new MutationObserver(()=>{const ok=tk.classList.contains('ok');if(ok&&!was&&ctx&&want)setTimeout(()=>STAMP[world()](),140);was=ok}).observe(tk,{attributes:true,attributeFilter:['class']})}}
 /* ---------- transición al cambiar de mundo ---------- */
 const SWITCH_UNUSED={kraft(){for(let i=0;i<14;i++)burst(.04,'bandpass',800+i*40,.05,2,now()+i*.045)},cine(){const n=src(false),f=filt('lowpass',600),g=gain(0);n.connect(f).connect(g).connect(master);g.gain.linearRampToValueAtTime(.12,now()+.4);g.gain.linearRampToValueAtTime(0,now()+1.4);n.start();n.stop(now()+1.5)},
  pc(){tone('sine',15000,.6,.02);tone('sine',90,.4,.08,now(),40)},hacker(){for(let i=0;i<8;i++)tone('square',200+Math.random()*2000,.04,.03,now()+i*.05)}};
 let lastW=world();new MutationObserver(()=>{const w=world();if(w===lastW)return;lastW=w;if(ctx&&want)setTimeout(startAmb,600)}).observe(document.body,{attributes:true,attributeFilter:['class']});
 /* ---------- sonido de las intros (lo llama el motor de intros de index.html) ---------- */
 const rattle=(n,dt,f0,f1,v)=>{for(let i=0;i<n;i++)burst(.03,'bandpass',f0+(f1-f0)*i/n,v*(.7+Math.random()*.6),2.5,now()+i*dt)};
 const SFX={
  bark:null,
  kraft:{bark(){[0,.16].forEach(d=>{tone('sawtooth',420,.14,.06,now()+d,180);burst(.09,'bandpass',900,.07,1.5,now()+d)})},cover(){rattle(18,.035,1500,700,.06);setTimeout(()=>{tone('sine',70,.3,.2,now(),40);burst(.08,'lowpass',400,.2)},650)},
   open(){[0,.09,.22].forEach(t=>{tone('square',120,.05,.02,now()+t);burst(.01,'highpass',3000,.04,1,now()+t)});const h=osc('sawtooth',60),hg=gain(0),hf=filt('lowpass',300);h.connect(hf).connect(hg).connect(master);hg.gain.setValueAtTime(0,now()+.3);hg.gain.linearRampToValueAtTime(.025,now()+.4);hg.gain.linearRampToValueAtTime(0,now()+2.4);h.start();h.stop(now()+2.5);
    setTimeout(()=>rattle(40,.042,700,1700,.05),420);setTimeout(()=>{tone('sine',90,.25,.12,now(),50)},2300)}},
  cine:{bark(){[0,.18].forEach(d=>{tone('sawtooth',380,.18,.05,now()+d,170);burst(.12,'bandpass',800,.05,1.2,now()+d);tone('sawtooth',380,.18,.015,now()+d+.12,170)})},cover(){const n=src(false),f=filt('lowpass',700),g=gain(0);n.connect(f).connect(g).connect(master);g.gain.linearRampToValueAtTime(.13,now()+.45);g.gain.linearRampToValueAtTime(0,now()+.9);n.start();n.stop(now()+1)},
   open(){const n=src(false),f=filt('bandpass',1200,1),g=gain(0),l=osc('sine',12),lg=gain(.02);l.connect(lg).connect(g.gain);n.connect(f).connect(g).connect(master);g.gain.linearRampToValueAtTime(.025,now()+.6);g.gain.linearRampToValueAtTime(0,now()+2.4);n.start();l.start();n.stop(now()+2.5);l.stop(now()+2.5);
    burst(.02,'highpass',2500,.12);[[262,0],[330,.18],[392,.36],[523,.6]].forEach(([fr,t])=>tone('triangle',fr,1.2-t,.05,now()+.3+t))}},
  pc:{bark(){[0,.14].forEach(d=>{tone('square',520,.09,.05,now()+d,260);tone('square',260,.06,.03,now()+d+.06)})},cover(){tone('sine',80,.25,.14,now(),40);tone('sine',15600,.5,.012)},type(){tone('square',1000,.012,.012)},
   boot(){for(let i=0;i<6;i++)burst(.008,'highpass',2600,.06,1,now()+i*.07+Math.random()*.03);[523,659,784,988,1046].forEach((fr,i)=>tone('sine',fr,.9-i*.1,.05,now()+.45+i*.13))},
   open(){tone('sine',2200,.45,.06,now(),60);burst(.05,'lowpass',300,.1,1,now()+.4)}},
  oeste:{bark(){[0,.2].forEach(d=>{tone('sawtooth',360,.2,.05,now()+d,150);burst(.1,'bandpass',750,.06,1.3,now()+d)});tone('sawtooth',300,.5,.03,now()+.45,520)},
   cover(){const o=osc('sawtooth',260),g=gain(0),bp=filt('bandpass',900,6),v=osc('sine',9),vg=gain(18);v.connect(vg).connect(o.frequency);o.connect(bp).connect(g).connect(master);g.gain.setValueAtTime(0,now());g.gain.linearRampToValueAtTime(.03,now()+.1);o.frequency.linearRampToValueAtTime(520,now()+.6);g.gain.linearRampToValueAtTime(0,now()+.65);o.start();v.start();o.stop(now()+.7);v.stop(now()+.7);setTimeout(()=>{tone('sine',85,.25,.16,now(),45);burst(.06,'lowpass',380,.16)},640)},
   open(){const o=osc('sawtooth',420),g=gain(0),bp=filt('bandpass',1100,7),v=osc('sine',11),vg=gain(22);v.connect(vg).connect(o.frequency);o.connect(bp).connect(g).connect(master);g.gain.linearRampToValueAtTime(.025,now()+.1);o.frequency.linearRampToValueAtTime(240,now()+.9);g.gain.linearRampToValueAtTime(0,now()+1.0);o.start();v.start();o.stop(now()+1.05);v.stop(now()+1.05);
    [[164.8,.5],[246.9,.78],[329.6,1.06],[293.7,1.5],[246.9,1.8]].forEach(([f,d])=>pluck(f,now()+d,.04))}},
  hacker:{bark(){[0,.12,.24].forEach((d,i)=>tone('square',[700,520,880][i],.07,.035,now()+d))},cover(){for(let i=0;i<6;i++)tone('square',150+Math.random()*1800,.03,.035,now()+i*.04)},type(){burst(.01,'highpass',4200,.05);tone('square',2900+Math.random()*500,.01,.012)},
   open(){for(let i=0;i<8;i++){tone('square',200+Math.random()*2400,.03,.03,now()+i*.045);burst(.02,'highpass',3000,.04,1,now()+i*.045)}[523,659,784,1046].forEach((fr,i)=>tone('square',fr,.18,.025,now()+.45+i*.07))}}};
 let lastType=0;window.gsSfx=(w,phase)=>{if(!ctx||!want)return;const s=SFX[w]&&SFX[w][phase];if(!s)return;if(phase==='type'){const n=performance.now();if(n-lastType<45)return;lastType=n}try{s()}catch(e){}};
 /* ---------- encendido ---------- */
 function label(){btn.setAttribute('aria-pressed',String(want));btn.querySelector('span').textContent='Sonido: '+(want?'sí':'no');btn.classList.toggle('on',want)}
 function on(){init();ctx.resume();if(!amb)startAmb();if(!sRaf){lastY=scrollY;scrollBed();scrollTick()}fade(.55)}
 btn.addEventListener('click',e=>{e.stopPropagation();want=!want;try{localStorage.setItem('gsSound',want?'1':'0')}catch(x){}label();if(want)on();else{fade(0);setTimeout(()=>{if(!want)stopAmb()},800)}});
 const firstGesture=()=>{if(want)on();removeEventListener('pointerdown',firstGesture,true);removeEventListener('keydown',firstGesture,true)};
 addEventListener('pointerdown',firstGesture,true);addEventListener('keydown',firstGesture,true);
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(want)ctx.resume()});
 label();
})();

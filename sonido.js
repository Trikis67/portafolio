/* ===== SONIDO: ambiente y teclas según el mundo (todo sintetizado con Web Audio, sin archivos) =====
   Taller: zumbido de taller + reloj · Cine: proyector + acorde cálido · Computadora 2000: CRT, ventilador y disco duro
   Hacker: dron de sintetizador + pitidos de datos. Empieza apagado; se recuerda la elección. */
(function(){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 const btn=document.createElement('button');btn.type='button';btn.id='snd';btn.setAttribute('aria-pressed','false');btn.innerHTML='<i aria-hidden="true"></i><span>Sonido: no</span>';document.body.append(btn);
 let ctx=null,master=null,noise=null,amb=null,want=false,timers=[];
 try{want=localStorage.getItem('gsSound')==='1'}catch(e){}
 const world=()=>{const m=(document.body.className.match(/theme-(\w+)/)||[])[1];return m==='cine'||m==='pc'||m==='hacker'?m:'kraft'};
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
 const every=(fn,min,max)=>{let id;const go=()=>{id=setTimeout(()=>{if(ctx&&want&&!document.hidden)fn();go()},min+Math.random()*(max-min));timers.push(id)};go()};
 /* ---------- ambientes ---------- */
 const AMB={
  kraft(){const n=src(),f=filt('lowpass',380),g=gain(.05);n.connect(f).connect(g).connect(master);n.start();let t=0;
   every(()=>{t^=1;tone('square',t?2100:1800,.025,.012);burst(.02,'bandpass',3200,.01,6)},1000,1000);return[n]},
  cine(){const n=src(),f=filt('bandpass',900,.7),g=gain(.028),lfo=osc('square',24),lg=gain(.012);lfo.connect(lg).connect(g.gain);n.connect(f).connect(g).connect(master);
   const pad=[110,164.8,220].map(fr=>{const o=osc('triangle',fr),pg=gain(.008),lp=filt('lowpass',600);o.connect(lp).connect(pg).connect(master);o.start();return o});n.start();lfo.start();return[n,lfo,...pad]},
  pc(){const h1=osc('sine',60),h2=osc('sine',120),g1=gain(.018),g2=gain(.008);h1.connect(g1).connect(master);h2.connect(g2).connect(master);
   const n=src(),f=filt('lowpass',1100),g=gain(.022);n.connect(f).connect(g).connect(master);[h1,h2,n].forEach(x=>x.start());
   every(()=>{const k=3+Math.random()*4|0;for(let i=0;i<k;i++)burst(.008,'highpass',2500,.05,1,now()+i*(.03+Math.random()*.05))},3000,8000);return[h1,h2,n]},
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
  hacker(enter){burst(.012,'highpass',4200,.07);tone('square',enter?880:2800+Math.random()*400,enter?.12:.012,.02);if(enter)tone('square',1320,.1,.015,now()+.08)}};
 addEventListener('keydown',e=>{if(!ctx||!want||e.repeat)return;const t=e.target;if(!t||!/INPUT|TEXTAREA/.test(t.tagName))return;if(e.key.length===1||e.key==='Backspace'||e.key==='Enter')KEY[world()](e.key==='Enter')},true);
 /* ---------- clics: más marcados sobre botones y enlaces, suaves en el resto ---------- */
 const CLICK={
  kraft(b){tone('sine',b?160:200,.06,b?.09:.04,now(),b?90:120);burst(.015,'bandpass',b?3400:2800,b?.06:.025,4)},
  cine(b){burst(.03,'bandpass',b?1500:1900,b?.09:.04,2);tone('triangle',b?240:300,.05,b?.04:.02,now(),b?160:220)},
  pc(b){burst(.006,'highpass',3000,b?.12:.06);burst(.006,'highpass',2400,b?.08:.04,1,now()+.06)},
  hacker(b){tone('square',b?1600:2200,.03,b?.03:.015);if(b)tone('square',2400,.025,.02,now()+.035)}};
 addEventListener('pointerdown',e=>{if(!ctx||!want||e.button>0)return;const t=e.target,b=!!(t&&t.closest&&t.closest('a,button,[role=button],[role=menuitemradio],.tv,.map-lb,label,summary'));CLICK[world()](b)},true);
 /* ---------- scroll: el sonido sigue a la velocidad con la que bajas ---------- */
 let sNode=null,sGain=null,sWorld='',lastY=scrollY,acc=0,vel=0,sRaf=0;
 function scrollBed(){if(sNode){try{sNode.stop()}catch(e){}sNode=null}const w=world();sWorld=w;if(w==='pc'||w==='hacker')return;
  const n=src(),f=w==='cine'?filt('bandpass',1300,1.2):filt('bandpass',2400,.6),g=gain(0);n.connect(f).connect(g).connect(master);
  if(w==='cine'){const l=osc('square',26),lg=gain(.5);l.connect(lg).connect(g.gain);l.start();n._l=l}n.start();sNode=n;sGain=g}
 function scrollTick(){sRaf=requestAnimationFrame(scrollTick);if(!ctx||!want||document.hidden)return;const y=scrollY,d=Math.abs(y-lastY);lastY=y;vel+=(d-vel)*.25;
  const w=world();if(w!==sWorld)scrollBed();
  if(sGain){sGain.gain.setTargetAtTime(Math.min(.09,vel*(w==='cine'?.0016:.0011)),now(),.05)}
  else{acc+=d;const step=w==='pc'?90:60;while(acc>step){acc-=step;if(w==='pc')burst(.006,'highpass',2600,.05);else tone('sine',2400+Math.random()*1600,.025,.008)}}}
 /* ---------- Orden de trabajo: se escribe en el ticket y, al completarla, el sello ---------- */
 const WRITE={
  kraft(){for(let i=0;i<7;i++)burst(.035,'bandpass',3000+Math.random()*1500,.035,3,now()+i*.045)},
  cine(){burst(.05,'bandpass',900,.12,1.5);tone('square',140,.05,.04);burst(.02,'highpass',3000,.05,1,now()+.07)},
  pc(){const o=osc('square',1150),g=gain(0),l=osc('square',38),lg=gain(.035);l.connect(lg).connect(g.gain);o.connect(filt('bandpass',1400,2)).connect(g).connect(master);o.start();l.start();o.stop(now()+.32);l.stop(now()+.32)},
  hacker(){[0,1,2,3].forEach(i=>tone('square',700+i*260,.035,.02,now()+i*.04))}};
 const STAMP={kraft(){tone('sine',90,.25,.18,now(),45);burst(.06,'lowpass',500,.18)},cine(){burst(.03,'highpass',2000,.22);tone('square',180,.08,.08)},
  pc(){tone('sine',1320,.5,.05);tone('sine',1760,.6,.04,now()+.12)},hacker(){[523,659,784,1046].forEach((f,i)=>tone('square',f,.16,.025,now()+i*.07))}};
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
   open(){const n=src(false),f=filt('bandpass',1200,1),g=gain(0),l=osc('square',24),lg=gain(.04);l.connect(lg).connect(g.gain);n.connect(f).connect(g).connect(master);g.gain.linearRampToValueAtTime(.05,now()+.6);g.gain.linearRampToValueAtTime(0,now()+2.4);n.start();l.start();n.stop(now()+2.5);l.stop(now()+2.5);
    burst(.02,'highpass',2500,.12);[[262,0],[330,.18],[392,.36],[523,.6]].forEach(([fr,t])=>tone('triangle',fr,1.2-t,.05,now()+.3+t))}},
  pc:{bark(){[0,.14].forEach(d=>{tone('square',520,.09,.05,now()+d,260);tone('square',260,.06,.03,now()+d+.06)})},cover(){tone('sine',80,.25,.14,now(),40);tone('sine',15600,.5,.012)},type(){tone('square',1000,.012,.012)},
   boot(){for(let i=0;i<6;i++)burst(.008,'highpass',2600,.06,1,now()+i*.07+Math.random()*.03);[523,659,784,988,1046].forEach((fr,i)=>tone('sine',fr,.9-i*.1,.05,now()+.45+i*.13))},
   open(){tone('sine',2200,.45,.06,now(),60);burst(.05,'lowpass',300,.1,1,now()+.4)}},
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

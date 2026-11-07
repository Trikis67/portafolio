/* ===== NUESTRO MUNDO SECRETO: la experiencia escondida del comando "te amo" =====
   Se carga solo cuando alguien escribe "te amo" en la terminal.
   1) La pantalla se bloquea: en una pared con papel tapiz aparece una puertita; una llave la abre y se entra por un túnel de luz.
   2) Una pregunta que solo ella sabe abre las fotos (van cifradas en amor/, nadie más puede verlas).
   3) Un mundo 3D de noche violeta: un corazón de estrellas que late, nuestras fotos girando alrededor,
      botones de costura y luciérnagas flotando, y un jardín de flores que brillan.
   4) "Nuestra película": el video y las fotos una tras otra. 5) Una carta.
   Música: un vals de caja musical original, hecho en la página (sin archivos).
   Si todavía no hay fotos cifradas, se muestra todo con fotos de ejemplo. */
(function(){
 'use strict';
 const BASE='amor/',D=document,H=D.documentElement;
 const red=matchMedia('(prefers-reduced-motion: reduce)').matches,mob=matchMedia('(max-width:760px)').matches||!!window.TOUCH;
 let root=null,stage=null,info={nombre:'mi amor',desde:null,fotos:[],video:null,carta:null},key=null,man=null,urls=[],timers=[],three=null,music=null,closing=false;
 const T=(ms,fn)=>{const id=setTimeout(fn,ms);timers.push(id);return id};
 const wait=ms=>new Promise(r=>T(ms,r));
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

 /* ---------- estilos: noche violeta, papel tapiz, puertita y llave ---------- */
 const CSS=`
html.amor-lock,html.amor-lock body{overflow:hidden!important}
html.amor-lock body>*:not(#amor):not(script){visibility:hidden}
/* el portafolio esconde el cursor para dibujar el suyo; aquí vuelve el cursor normal */
body #amor,body #amor *,body.cc #amor,body.cc #amor *{cursor:auto!important}
body.cc #amor button,body.cc #amor .am-lb,body.cc #amor .am-lb *{cursor:pointer!important}
body.cc #amor input{cursor:text!important}
body.cc #amor canvas.am-c{cursor:grab!important}body.cc #amor canvas.am-c.hov{cursor:pointer!important}
#amor{--v1:#1a0d3a;--v2:#2c1660;--v3:#6b3fd1;--lila:#c9b6ff;--azul:#7ab8ff;--oro:#ffd166;--rosa:#ff8fc8;
 position:fixed;inset:0;z-index:2147483000;color:#efe7ff;background:radial-gradient(ellipse at 50% 65%,#3a1d7a 0%,var(--v2) 30%,var(--v1) 62%,#07031a 100%);font-family:'Alegreya Sans',system-ui,sans-serif;overflow:hidden;opacity:0;transition:opacity .9s ease;-webkit-tap-highlight-color:transparent;user-select:none}
#amor.on{opacity:1}
#amor .am-x{position:absolute;top:max(14px,env(safe-area-inset-top));right:16px;z-index:30;border:1px solid #c9b6ff40;background:#07031a80;color:#efe7ffcc;border-radius:99px;padding:7px 14px;font:13px 'Alegreya Sans',sans-serif;cursor:pointer;backdrop-filter:blur(6px)}
#amor .am-x:hover{color:#fff;border-color:#c9b6ffaa}
#amor .am-st{position:absolute;inset:0;display:grid;place-items:center;transition:opacity .9s ease}
#amor .am-st.out{opacity:0;pointer-events:none}
#amor canvas.am-c{position:absolute;inset:0;width:100%;height:100%;display:block}
/* intro: la pared, la puertita y la llave */
.am-wall{position:absolute;inset:0;opacity:0;animation:amIn 1s .2s ease forwards;
 background:radial-gradient(circle at 50% 50%,#0000 0 38%,#07031acc 85%),radial-gradient(circle at 20px 20px,#b59cff38 0 4px,#0000 5px) 0 0/40px 40px,radial-gradient(circle at 0 0,#7ab8ff22 0 3px,#0000 4px) 0 0/40px 40px,repeating-linear-gradient(90deg,#2a1658 0 22px,#24124d 22px 44px)}
.am-wall::after{content:"";position:absolute;left:0;right:0;bottom:0;height:16vh;background:linear-gradient(#3b2416,#24150c);box-shadow:0 -6px 0 #5a3a22}
.am-door{position:absolute;left:50%;top:50%;width:min(150px,30vw);aspect-ratio:3/4.4;translate:-50% -46%;perspective:700px;opacity:0;animation:amIn .8s .7s ease forwards}
.am-door .tn{position:absolute;inset:7px;border-radius:999px 999px 6px 6px;overflow:hidden;background:repeating-radial-gradient(circle at 50% 45%,#c9b6ff 0 6px,#7ab8ff 6px 12px,#6b3fd1 12px 18px,#2c1660 18px 26px);box-shadow:inset 0 0 40px #fff8}
.am-door .tn::after{content:"";position:absolute;inset:-50%;background:conic-gradient(from 0deg,#fff0,#ffffff55,#fff0 30%,#ffffff40 55%,#fff0 70%);animation:amSpin 3s linear infinite}
.am-door .fr{position:absolute;inset:0;border-radius:999px 999px 8px 8px;border:7px solid #8a5a32;box-shadow:0 0 0 3px #3b2314,0 18px 40px #000a,inset 0 0 0 2px #3b2314}
.am-door .lf{position:absolute;inset:7px;border-radius:999px 999px 6px 6px;transform-origin:0 50%;background:repeating-linear-gradient(90deg,#6b4022 0 14px,#5a351b 14px 16px);box-shadow:inset 0 0 0 5px #4a2c16;transition:transform 1.3s cubic-bezier(.5,0,.3,1)}
.am-door .lf i.kn{position:absolute;right:16%;top:56%;width:12%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a8,#d9a441 60%,#7a5212);box-shadow:0 2px 3px #0008}
.am-door .lf i.kh{position:absolute;right:18%;top:66%;width:7%;height:9%;background:#120804;border-radius:50% 50% 20% 20%;clip-path:polygon(50% 0,100% 30%,70% 45%,80% 100%,20% 100%,30% 45%,0 30%)}
.am-key{position:absolute;left:50%;top:50%;width:min(120px,24vw);translate:-50% -50%;opacity:0;filter:drop-shadow(0 4px 6px #0009) drop-shadow(0 0 10px #ffd16688)}
#amor.k1 .am-key{animation:amKey 1.4s cubic-bezier(.4,0,.2,1) forwards}
#amor.k2 .am-key{animation:amTurn .5s ease forwards}
#amor.k3 .am-door .lf{transform:rotateY(-108deg)}
#amor.k3 .am-key{opacity:0!important;transition:opacity .3s}
#amor.k4 .am-door{animation:amZoom 1.6s cubic-bezier(.7,0,.3,1) forwards}
#amor.k4 .am-wall{animation:amOut 1.2s .4s ease forwards}
@keyframes amIn{to{opacity:1}}@keyframes amOut{to{opacity:0}}@keyframes amSpin{to{rotate:360deg}}
@keyframes amKey{0%{opacity:0;transform:translate(-30vw,30vh) rotate(-40deg)}30%{opacity:1}100%{opacity:1;transform:translate(calc(min(150px,30vw)*.27),calc(min(150px,30vw)*.47)) rotate(0)}}
@keyframes amTurn{from{opacity:1;transform:translate(calc(min(150px,30vw)*.27),calc(min(150px,30vw)*.47)) rotate(0)}to{opacity:1;transform:translate(calc(min(150px,30vw)*.27),calc(min(150px,30vw)*.47)) rotate(90deg) scaleX(.6)}}
@keyframes amZoom{to{scale:16;opacity:.0}}
.am-txt{position:absolute;left:0;right:0;bottom:14vh;text-align:center;padding:0 20px;z-index:3}
.am-txt p{margin:.35em 0;font:italic 400 clamp(20px,3.4vw,34px)/1.3 'Newsreader',Georgia,serif;opacity:0;translate:0 10px;transition:opacity 1.2s,translate 1.2s;text-shadow:0 2px 20px #07031a}
.am-txt p.v{opacity:1;translate:0 0}
.am-txt p b{font-style:normal;font-weight:600;color:var(--oro)}
/* pregunta secreta: una etiqueta de llave */
.am-gate{position:relative;width:min(440px,90vw);text-align:center;padding:38px 28px 30px;border:1px solid #c9b6ff33;border-radius:22px;background:linear-gradient(160deg,#2c166099,#1a0d3acc);backdrop-filter:blur(14px);box-shadow:0 30px 80px -20px #000c,inset 0 1px 0 #ffffff1a}
.am-gate .k{display:block;width:74px;margin:0 auto 8px;animation:amFloat 3.4s ease-in-out infinite;filter:drop-shadow(0 0 12px #ffd16688)}
.am-gate h2{margin:0 0 6px;font:italic 400 28px/1.2 'Newsreader',Georgia,serif}
.am-gate p{margin:0 0 20px;color:var(--lila);font-size:15px}
.am-gate input{width:100%;box-sizing:border-box;padding:13px 14px;border-radius:12px;border:1px solid #c9b6ff44;background:#07031a99;color:#fff;font:17px 'Alegreya Sans',sans-serif;text-align:center;color-scheme:dark}
.am-gate button{margin-top:14px;width:100%;padding:13px;border:0;border-radius:12px;background:linear-gradient(135deg,#8b5cf6,#5b2bd6);color:#fff;font:700 16px 'Alegreya Sans',sans-serif;cursor:pointer;box-shadow:0 10px 30px -8px #8b5cf6aa}
.am-gate .e{min-height:22px;margin:12px 0 0;color:var(--rosa);font-size:14px}
.am-gate.no{animation:amNo .45s}
@keyframes amNo{20%,60%{translate:-9px 0}40%,80%{translate:9px 0}}
@keyframes amFloat{50%{translate:0 -6px;rotate:4deg}}
/* el mundo */
.am-hud{position:absolute;left:0;right:0;top:max(18px,env(safe-area-inset-top));text-align:center;pointer-events:none;z-index:5;padding:0 70px}
.am-hud h1{margin:0;font:italic 400 clamp(26px,4.4vw,48px)/1.1 'Newsreader',Georgia,serif;text-shadow:0 0 30px #8b5cf6aa}
.am-hud .d{margin-top:8px;font:13px/1.4 'Alegreya Sans',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--lila)}
.am-hud .d b{color:var(--oro);font-size:15px;letter-spacing:.08em}
.am-garden{position:absolute;left:0;right:0;bottom:0;height:22vh;pointer-events:none;z-index:2}
.am-garden svg{width:100%;height:100%}
.am-garden .amfl{animation:amGlow 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
@keyframes amGlow{50%{opacity:.55;scale:.94}}
.am-bar{position:absolute;left:50%;bottom:max(22px,env(safe-area-inset-bottom));translate:-50% 0;z-index:5;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:max-content;max-width:94vw}
.am-bar button{border:1px solid #c9b6ff40;background:#1a0d3a99;backdrop-filter:blur(10px);color:#efe7ff;border-radius:99px;padding:10px 18px;font:600 14px 'Alegreya Sans',sans-serif;cursor:pointer;transition:background .2s,translate .2s}
.am-bar button:hover{background:#2c1660cc;translate:0 -2px}
.am-bar button.p{background:linear-gradient(135deg,#8b5cf6,#5b2bd6);border-color:#0000}
.am-hint{position:absolute;left:0;right:0;bottom:calc(max(22px,env(safe-area-inset-bottom)) + 56px);text-align:center;font-size:13px;color:#c9b6ffbb;pointer-events:none;transition:opacity 1s;z-index:5}
.am-lb{position:absolute;inset:0;z-index:20;display:grid;place-items:center;background:#07031acc;backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .4s}
.am-lb.on{opacity:1;pointer-events:auto}
.am-lb figure{margin:0;padding:14px 14px 18px;background:#f8f4ff;border-radius:6px;box-shadow:0 40px 90px -20px #000,0 0 0 6px #8b5cf633;rotate:-1.5deg;max-width:min(88vw,720px);transition:scale .4s cubic-bezier(.2,1.3,.4,1);scale:.92}
.am-lb.on figure{scale:1}
.am-lb img{display:block;max-width:100%;max-height:68vh;border-radius:2px}
.am-lb figcaption{margin-top:12px;color:#2c1660;text-align:center;font:italic 20px 'Newsreader',Georgia,serif}
/* película */
.am-mv{position:absolute;inset:0;z-index:15;background:#07031a;opacity:0;pointer-events:none;transition:opacity .8s}
.am-mv.on{opacity:1;pointer-events:auto}
.am-mv .s{position:absolute;inset:0;opacity:0;transition:opacity 1.6s ease}
.am-mv .s.on{opacity:1}
.am-mv .s img,.am-mv video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.am-mv .s .bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(40px) brightness(.4) saturate(1.2) hue-rotate(-12deg);transform:scale(1.1)}
.am-mv .s.on img{animation:amKen 7s ease-out both}
@keyframes amKen{from{transform:scale(1.08) translate(1.5%,1%)}to{transform:scale(1) translate(0,0)}}
.am-mv .cap{position:absolute;left:0;right:0;bottom:calc(max(26px,env(safe-area-inset-bottom)) + 50px);text-align:center;padding:0 24px;font:italic 400 clamp(20px,3vw,32px)/1.3 'Newsreader',Georgia,serif;text-shadow:0 2px 18px #000;transition:opacity .8s}
.am-mv .dots{position:absolute;left:0;right:0;bottom:max(22px,env(safe-area-inset-bottom));display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:0 20px}
.am-mv .dots i{width:7px;height:7px;border-radius:50%;background:#ffffff33}.am-mv .dots i.on{background:var(--lila)}
.am-mv .bk{position:absolute;top:max(14px,env(safe-area-inset-top));left:16px;z-index:2}
.am-mv .bk button{border:1px solid #ffffff40;background:#0006;color:#fff;border-radius:99px;padding:7px 14px;font:13px 'Alegreya Sans',sans-serif;cursor:pointer}
.am-hud .m{margin-top:6px;font:italic 15px 'Newsreader',Georgia,serif;color:#efe7ffcc}.am-hud .m b{color:var(--oro);font-style:normal}
.am-lb figcaption small{display:block;margin-top:4px;font:600 12px 'Alegreya Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8b5cf6}
.am-mv .cap small{display:block;margin:0 0 6px;font:600 12px 'Alegreya Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--lila)}
.am-rz{position:absolute;inset:0;z-index:18;display:grid;place-items:center;background:#07031a99;backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s;padding:20px}
.am-rz.on{opacity:1;pointer-events:auto}
.am-rz .am-rzc{width:min(420px,100%);text-align:center;padding:30px 26px 24px;border-radius:22px;background:linear-gradient(160deg,#2c1660f2,#1a0d3af2);border:1px solid #c9b6ff44;box-shadow:0 30px 80px -20px #000c}
.am-rz .jar{display:block;font-size:46px;animation:amFloat 3s ease-in-out infinite}
.am-rz small{display:block;margin:6px 0 10px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--lila)}
.am-rz p{margin:0 0 20px;font:italic 400 clamp(20px,5vw,26px)/1.35 'Newsreader',Georgia,serif;min-height:3em}
.am-rz p.v{animation:amPop .5s cubic-bezier(.2,1.3,.4,1)}
@keyframes amPop{from{opacity:0;scale:.9}}
.am-rz button{border:0;border-radius:99px;padding:11px 22px;background:linear-gradient(135deg,#8b5cf6,#5b2bd6);color:#fff;font:700 15px 'Alegreya Sans',sans-serif;cursor:pointer}
/* celular */
@media (max-width:760px){
 .am-hud{padding:0 16px;top:max(56px,calc(env(safe-area-inset-top) + 48px))}
 .am-hud h1{font-size:clamp(24px,7.4vw,32px)}
 .am-hud .d{font-size:11px;letter-spacing:.12em}.am-hud .m{font-size:14px}
 .am-bar{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:calc(100vw - 24px);bottom:max(14px,env(safe-area-inset-bottom))}
 .am-bar button{padding:10px 6px;font-size:13px}.am-bar button.p{grid-column:1/-1}
 .am-hint{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 150px);padding:0 24px}
 .am-garden{height:13vh}
 #amor .am-x{padding:6px 12px;font-size:12px}
 .am-mv .cap{bottom:calc(max(20px,env(safe-area-inset-bottom)) + 34px)}
 .am-lb figure{padding:10px 10px 14px}.am-lb img{max-height:62vh}
 .am-door{width:min(130px,34vw)}.am-key{width:min(104px,28vw)}
 .am-txt{bottom:16vh}
}
/* carta */
.am-lt{position:absolute;inset:0;z-index:15;display:grid;place-items:center;background:#07031ad9;backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .6s;overflow:auto;padding:70px 16px 40px}
.am-lt.on{opacity:1;pointer-events:auto}
.am-lt article{width:min(620px,100%);background:#f8f4ff;color:#24124d;border-radius:4px;padding:44px 40px 38px;box-shadow:0 40px 90px -20px #000;position:relative;rotate:.6deg;background-image:repeating-linear-gradient(#0000 0 31px,#c9b6ff55 31px 32px)}
.am-lt article::before{content:"";position:absolute;top:-16px;left:50%;width:34px;height:34px;margin-left:-17px;border-radius:50%;background:radial-gradient(circle at 34% 34%,#24124d 0 3px,#0000 3.5px),radial-gradient(circle at 66% 34%,#24124d 0 3px,#0000 3.5px),radial-gradient(circle at 34% 66%,#24124d 0 3px,#0000 3.5px),radial-gradient(circle at 66% 66%,#24124d 0 3px,#0000 3.5px),radial-gradient(circle,#8b5cf6 0 60%,#5b2bd6 62%);box-shadow:0 3px 6px #0006}
.am-lt h3{margin:0 0 18px;font:italic 400 32px/1.1 'Newsreader',Georgia,serif;color:#5b2bd6}
.am-lt p{margin:0 0 14px;font:19px/1.6 'Newsreader',Georgia,serif}
.am-lt .f{margin-top:26px;text-align:right;font:italic 22px 'Newsreader',Georgia,serif;color:#5b2bd6}
.am-heart{position:absolute;z-index:25;pointer-events:none;font-size:22px;animation:amUp 2.8s ease-out forwards}
@keyframes amUp{from{opacity:1;translate:0 0;scale:.6}to{opacity:0;translate:var(--dx) -160px;scale:1.3}}
@media (max-width:560px){.am-lt article{padding:34px 22px 28px}.am-lt p{font-size:17px}.am-bar button{padding:9px 14px;font-size:13px}.am-garden{height:16vh}}
@media (prefers-reduced-motion:reduce){#amor *{animation-duration:.01s!important;animation-delay:0s!important}.am-mv .s.on img{animation:none}}
`;
 const KEY_SVG='<svg viewBox="0 0 120 44" aria-hidden="true"><defs><linearGradient id="amkg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#d9a441"/><stop offset="1" stop-color="#8a5a1a"/></linearGradient></defs><g fill="url(#amkg)" stroke="#5a3a10" stroke-width="1.2"><path d="M40 18h62v8h-6v8h-6v-8h-5v6h-6v-6H40z"/><path d="M22 4a18 18 0 1 0 0.01 0zm0 8a10 10 0 1 1-0.01 0z" fill-rule="evenodd"/><circle cx="22" cy="22" r="4" fill="#5a3a10"/></g></svg>';

 /* ---------- cifrado (WebCrypto: PBKDF2 + AES-GCM) ---------- */
 const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function deriveKey(ans){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(ans),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(man.salt),iterations:man.iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt'])}
 const dec=(k,iv,buf)=>crypto.subtle.decrypt({name:'AES-GCM',iv:b64(iv)},k,buf);
 const norm=s=>String(s||'').replace(/\D/g,'');
 const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
 const fmtF=s=>{if(!s)return '';const [y,m,d]=s.split('-').map(Number);return `${d} de ${MESES[m-1]} de ${y}`};
 /* cuántos meses cumplen y cuánto falta para el próximo mesiversario */
 function mesi(desde){if(!desde)return '';const [y,m,d]=desde.split('-').map(Number),hoy=new Date(),h0=new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate());
  let meses=(hoy.getFullYear()-y)*12+(hoy.getMonth()-(m-1));if(hoy.getDate()<d)meses--;
  const prox=new Date(y,m-1+meses+1,d),falta=Math.round((prox-h0)/864e5);
  if(hoy.getDate()===d&&meses>0)return meses%12===0?`¡Hoy cumplimos ${meses/12===1?'un año':meses/12+' años'}! 💜`:`¡Hoy cumplimos ${meses} meses! 💜`;
  const n=meses+1;return `Faltan <b>${falta}</b> ${falta===1?'día':'días'} para ${n%12===0?(n/12===1?'nuestro primer aniversario':'cumplir '+n/12+' años'):'cumplir '+n+' meses'}`}

 /* ---------- abrir / cerrar ---------- */
 window.loveOpen=async function(){
  if(root)return;closing=false;
  if(!D.getElementById('amor-css')){const st=D.createElement('style');st.id='amor-css';st.textContent=CSS;D.head.append(st)}
  root=D.createElement('div');root.id='amor';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Nuestro mundo secreto');
  root.innerHTML='<button class="am-x" type="button" aria-label="Volver al portafolio">✕ Volver al portafolio</button>';
  D.body.append(root);H.classList.add('amor-lock');
  root.querySelector('.am-x').onclick=close;addEventListener('keydown',onKey);
  requestAnimationFrame(()=>root.classList.add('on'));
  try{const r=await fetch(BASE+'manifest.json',{cache:'no-store'});if(r.ok)man=await r.json()}catch(e){}
  await intro();
  if(closing)return;
  if(man)gate();else{info.fotos=demoFotos();world()}
 };
 function onKey(e){if(e.key==='Escape'){const lb=root&&root.querySelector('.am-lb.on,.am-mv.on,.am-lt.on');if(lb){lb.classList.remove('on');if(lb.classList.contains('am-mv'))stopMovie()}else close()}}
 function close(){if(!root)return;closing=true;root.classList.remove('on');timers.forEach(clearTimeout);timers=[];if(music)music.stop();music=null;
  setTimeout(()=>{if(three)three.stop();three=null;urls.forEach(u=>URL.revokeObjectURL(u));urls=[];root&&root.remove();root=null;H.classList.remove('amor-lock');removeEventListener('keydown',onKey)},900)}
 function setStage(html,cls){const old=stage;stage=D.createElement('div');stage.className='am-st '+(cls||'');stage.innerHTML=html;root.append(stage);
  if(old){old.classList.add('out');setTimeout(()=>old.remove(),950)}return stage}

 /* ---------- 1. intro: la puertita en la pared, la llave y el túnel de luz ---------- */
 async function intro(){
  setStage(`<div class="am-wall"></div><div class="am-door"><div class="tn"></div><div class="lf"><i class="kn"></i><i class="kh"></i></div><div class="fr"></div></div><div class="am-key">${KEY_SVG}</div>
   <div class="am-txt"><p>Detrás de esta puertita</p><p>hay un mundo que solo es nuestro.</p><p>Bienvenida, <b>${esc(info.nombre)}</b>.</p></div>`);
  if(!music)music=makeMusic();
  if(red){root.classList.add('k3','k4');}
  else{await wait(1300);if(closing)return;root.classList.add('k1');if(music)music.chime(0);
   await wait(1450);if(closing)return;root.classList.add('k2');if(music)music.click();
   await wait(550);root.classList.add('k3');if(music)music.creak();
   await wait(1300);if(closing)return;root.classList.add('k4');if(music)music.chime(1)}
  await wait(red?200:1500);if(closing)return;
  const ps=stage.querySelectorAll('.am-txt p');for(const p of ps){p.classList.add('v');await wait(red?150:1400);if(closing)return}
  await wait(red?300:1200);root.classList.remove('k1','k2','k3','k4');
 }

 /* ---------- 2. la pregunta que solo ella sabe ---------- */
 function gate(){
  const st=setStage(`<form class="am-gate" autocomplete="off"><span class="k">${KEY_SVG}</span><h2>Solo tú tienes la llave</h2>
   <p>${esc(man.q||'¿Qué día empezó lo nuestro?')}</p><label style="position:absolute;left:-9999px" for="am-a">Respuesta</label>
   <input id="am-a" type="${man.tipo==='texto'?'text':'date'}" required><button type="submit">Abrir la puertita</button><div class="e" aria-live="polite"></div></form>`);
  const f=st.querySelector('form'),inp=st.querySelector('input'),e=st.querySelector('.e');setTimeout(()=>inp.focus(),400);
  f.onsubmit=async ev=>{ev.preventDefault();if(music)music.start();e.textContent='Girando la llave…';
   const ans=man.tipo==='texto'?inp.value.trim().toLowerCase():norm(inp.value);
   try{key=await deriveKey(ans);const j=JSON.parse(new TextDecoder().decode(await dec(key,man.iv,b64(man.ct))));Object.assign(info,j);
    e.textContent='Abriendo…';await loadFotos();if(closing)return;world()}
   catch(x){key=null;e.textContent='Esa llave no abre, mi amor. Intenta otra vez ❤';f.classList.remove('no');void f.offsetWidth;f.classList.add('no')}}
 }
 async function loadFotos(){
  const out=await Promise.all((info.fotos||[]).map(async p=>{try{const r=await fetch(BASE+p.f);const b=await dec(key,p.iv,await r.arrayBuffer());const u=URL.createObjectURL(new Blob([b],{type:'image/jpeg'}));urls.push(u);return {src:u,cap:p.cap||'',w:p.w,h:p.h,fecha:p.fecha||null}}catch(e){return null}}));
  info.fotos=out.filter(Boolean);if(info.video){info.video={pend:info.video}}
 }
 async function videoURL(){if(!info.video)return null;if(info.video.src)return info.video.src;const v=info.video.pend;try{const r=await fetch(BASE+v.f);const b=await dec(key,v.iv,await r.arrayBuffer());const u=URL.createObjectURL(new Blob([b],{type:v.type||'video/mp4'}));urls.push(u);info.video.src=u;return u}catch(e){return null}}
 function demoFotos(){const caps=['Nuestra primera foto','Tú y yo','Mi lugar favorito: contigo','Lo que viene','Siempre','De tu mano'],cols=[['#b18cff','#3a1d7a'],['#7ab8ff','#2c1660'],['#ffd166','#6b3fd1'],['#c9b6ff','#24124d'],['#ff8fc8','#3a1d7a'],['#9be7ff','#5b2bd6']];
  return caps.map((c,i)=>{const cv=D.createElement('canvas');cv.width=600;cv.height=600;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,600,600);gr.addColorStop(0,cols[i][0]);gr.addColorStop(1,cols[i][1]);g.fillStyle=gr;g.fillRect(0,0,600,600);
   g.fillStyle='#ffffff30';for(let k=0;k<40;k++){g.beginPath();g.arc(Math.random()*600,Math.random()*600,Math.random()*40,0,7);g.fill()}
   g.fillStyle='#fff';g.textAlign='center';g.font='120px serif';g.fillText('❤',300,300);g.font='italic 34px Georgia,serif';g.fillText('Aquí va una foto',300,380);g.font='24px Georgia,serif';g.fillText('de nosotros',300,418);
   return {src:cv.toDataURL('image/jpeg',.85),cap:c,w:600,h:600}})}

 /* ---------- 3. el mundo: corazón de estrellas, fotos, botones, luciérnagas y jardín ---------- */
 function gardenSVG(){let s='<svg viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="amfg"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#9be7ff"/><stop offset="1" stop-color="#7ab8ff00"/></radialGradient><radialGradient id="amfg2"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffb3e6"/><stop offset="1" stop-color="#ff8fc800"/></radialGradient></defs>';
  s+='<path d="M0 200V150Q100 120 220 140T470 132T720 146T980 128T1200 140V200Z" fill="#0b0524"/><path d="M0 200V170Q160 150 330 166T690 160T1010 170T1200 162V200Z" fill="#07031a"/>';
  for(let i=0;i<26;i++){const x=20+i*46+Math.sin(i*7)*14,h=40+((i*37)%50),c=i%3===0?'url(#amfg2)':'url(#amfg)';
   s+=`<path d="M${x} 200C${x+6} ${200-h*.5} ${x-6} ${200-h*.8} ${x+2} ${200-h}" stroke="#1d3a3a" stroke-width="2.5" fill="none"/><g class="amfl" style="animation-delay:${(i*0.37%3).toFixed(2)}s"><circle cx="${x+2}" cy="${200-h}" r="${9+(i%4)*3}" fill="${c}"/><circle cx="${x+2}" cy="${200-h}" r="2.6" fill="#fff"/></g>`}
  return s+'</svg>'}
 async function world(){
  const dias=info.desde?Math.max(0,Math.floor((Date.now()-new Date(info.desde+'T00:00:00'))/864e5)):null;
  const st=setStage(`<canvas class="am-c" aria-hidden="true"></canvas><div class="am-garden">${gardenSVG()}</div>
   <div class="am-hud"><h1>Nuestro mundo secreto</h1><div class="d">${dias!==null?`Gabriel <b>♥</b> ${esc(info.nombre)} · juntos desde hace <b>${dias.toLocaleString('es-GT')}</b> días`:`Gabriel <b>♥</b> ${esc(info.nombre)}`}</div>${info.desde?`<div class="m">${mesi(info.desde)}</div>`:''}</div>
   <div class="am-hint">${mob?'Toca':'Haz clic en'} una foto para verla de cerca · mueve ${mob?'el dedo':'el ratón'} para mirar alrededor</div>
   <div class="am-bar"><button type="button" class="p" data-a="mv">▶ Nuestra historia</button><button type="button" data-a="rz">🫙 Una razón</button><button type="button" data-a="lt">💌 Una carta</button><button type="button" data-a="hz">❤ Corazones</button><button type="button" data-a="mu">♪ Música</button></div>
   <div class="am-lb" role="dialog" aria-label="Foto"><figure><img alt=""><figcaption></figcaption></figure></div>
   <div class="am-mv" role="dialog" aria-label="Nuestra historia"><div class="bk"><button type="button">✕ Volver</button></div><div class="cap"></div><div class="dots"></div></div>
   <div class="am-lt" role="dialog" aria-label="Carta"><article></article></div>
   <div class="am-rz" role="dialog" aria-label="Una razón"><div class="am-rzc"><span class="jar" aria-hidden="true">🫙</span><small>Una razón por la que te amo</small><p></p><button type="button">Otra razón</button></div></div>`);
  if(music)music.start();
  st.querySelector('.am-bar').onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
   if(a==='mv')movie();else if(a==='rz')razon();else if(a==='lt')letter();else if(a==='hz')hearts(18);else if(a==='mu'&&music){music.toggle();b.textContent=music.on?'♪ Música':'♪ Sin música'}};
  const lb=st.querySelector('.am-lb');lb.onclick=()=>lb.classList.remove('on');
  const rz=st.querySelector('.am-rz');rz.onclick=e=>{if(e.target.tagName==='BUTTON')razon();else rz.classList.remove('on')};
  st.querySelector('.am-lt').onclick=e=>{if(e.target.classList.contains('am-lt'))e.currentTarget.classList.remove('on')};
  st.querySelector('.am-mv .bk button').onclick=()=>{st.querySelector('.am-mv').classList.remove('on');stopMovie()};
  T(9000,()=>{const h=st.querySelector('.am-hint');if(h)h.style.opacity=0});
  try{await ensureThree();three=scene3d(st.querySelector('canvas'),info.fotos,i=>openPhoto(i))}catch(e){console.warn('amor 3D',e)}
  T(1200,()=>hearts(10));
 }
 function openPhoto(i){const p=info.fotos[i];if(!p)return;const lb=stage.querySelector('.am-lb');lb.querySelector('img').src=p.src;lb.querySelector('img').alt=p.cap||'Foto de nosotros';lb.querySelector('figcaption').innerHTML=(p.cap?esc(p.cap):'')+(p.fecha?`<small>${fmtF(p.fecha)}</small>`:'');lb.classList.add('on');if(music)music.chime(2)}
 function hearts(n){if(!root)return;for(let i=0;i<n;i++)T(i*110,()=>{if(!root)return;const h=D.createElement('span');h.className='am-heart';h.textContent=['💜','💙','💖','✨','🗝️'][i%5];
  h.style.left=(10+Math.random()*80)+'vw';h.style.top=(55+Math.random()*30)+'vh';h.style.setProperty('--dx',(Math.random()*80-40)+'px');root.append(h);setTimeout(()=>h.remove(),3000)})}
 function ensureThree(){if(window.THREE)return Promise.resolve();return new Promise((ok,ko)=>{const s=D.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=ok;s.onerror=ko;D.head.append(s)})}

 function scene3d(cv,fotos,onPick){
  const T3=window.THREE,R=new T3.WebGLRenderer({canvas:cv,antialias:!mob,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,mob?1.5:2));
  const S=new T3.Scene(),C=new T3.PerspectiveCamera(mob?60:46,1,.1,400);C.position.set(0,2,mob?54:46);
  S.fog=new T3.FogExp2(0x1a0d3a,.006);
  const resize=()=>{const w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()};resize();addEventListener('resize',resize);
  const tex=(w,h,draw)=>{const c=D.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T3.CanvasTexture(c);return t};
  const dot=tex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fff');gr.addColorStop(.25,'#ffffffcc');gr.addColorStop(1,'#fff0');g.fillStyle=gr;g.fillRect(0,0,64,64)});
  /* corazón de estrellas en lila, azul y un poco de oro */
  const N=mob?3200:7000,pos=new Float32Array(N*3),col=new Float32Array(N*3),base=new Float32Array(N*3),c1=new T3.Color('#b18cff'),c2=new T3.Color('#7ab8ff'),c3=new T3.Color('#ffd166'),cc=new T3.Color();
  for(let i=0;i<N;i++){const t=Math.random()*Math.PI*2,shell=i<N*.72;let x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
   const k=shell?1+(Math.random()-.5)*.08:Math.random()*.95;x*=k*.62;y*=k*.62;const z=(Math.random()-.5)*(shell?5.5:8)*Math.sqrt(Math.max(.05,1-(x*x+y*y)/180));
   base[i*3]=x;base[i*3+1]=y+1.2;base[i*3+2]=z;cc.copy(c1).lerp(Math.random()<.82?c2:c3,Math.random()*.8);col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b}
  pos.set(base);const hg=new T3.BufferGeometry();hg.setAttribute('position',new T3.BufferAttribute(pos,3));hg.setAttribute('color',new T3.BufferAttribute(col,3));
  const heart=new T3.Points(hg,new T3.PointsMaterial({size:mob?.34:.28,map:dot,vertexColors:true,transparent:true,depthWrite:false,blending:T3.AdditiveBlending}));S.add(heart);
  /* cielo */
  const SN=mob?900:2200,sp=new Float32Array(SN*3);for(let i=0;i<SN;i++){const r=90+Math.random()*120,a=Math.random()*Math.PI*2,b=Math.acos(Math.random()*2-1);sp[i*3]=r*Math.sin(b)*Math.cos(a);sp[i*3+1]=r*Math.cos(b);sp[i*3+2]=r*Math.sin(b)*Math.sin(a)}
  const sg=new T3.BufferGeometry();sg.setAttribute('position',new T3.BufferAttribute(sp,3));const sky=new T3.Points(sg,new T3.PointsMaterial({size:.9,map:dot,color:0xd9ccff,transparent:true,opacity:.75,depthWrite:false,blending:T3.AdditiveBlending,fog:false}));S.add(sky);
  /* luciérnagas azules que se mueven despacio */
  const FN=mob?40:90,fp=new Float32Array(FN*3),fseed=[];for(let i=0;i<FN;i++){fp[i*3]=(Math.random()-.5)*70;fp[i*3+1]=(Math.random()-.5)*36;fp[i*3+2]=(Math.random()-.5)*40;fseed.push(Math.random()*9)}
  const fg=new T3.BufferGeometry();fg.setAttribute('position',new T3.BufferAttribute(fp,3));const flies=new T3.Points(fg,new T3.PointsMaterial({size:1.1,map:dot,color:0x9be7ff,transparent:true,opacity:.9,depthWrite:false,blending:T3.AdditiveBlending}));S.add(flies);const fbase=fp.slice();
  /* botones de costura flotando (decoración) */
  const btnCols=['#8b5cf6','#ffd166','#7ab8ff','#ff8fc8','#2c1660','#c9b6ff'],buttons=[];
  btnCols.forEach((c,ci)=>{const t=tex(128,128,(g,w)=>{g.fillStyle=c;g.beginPath();g.arc(64,64,58,0,7);g.fill();g.strokeStyle='#00000040';g.lineWidth=6;g.beginPath();g.arc(64,64,44,0,7);g.stroke();
    g.fillStyle='#ffffff30';g.beginPath();g.arc(48,44,18,0,7);g.fill();g.fillStyle='#0d0620';[[50,50],[78,50],[50,78],[78,78]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,8,0,7);g.fill()})});
   for(let k=0;k<(mob?2:3);k++){const sp2=new T3.Sprite(new T3.SpriteMaterial({map:t,transparent:true,depthWrite:false}));const s=1.4+Math.random()*1.6;sp2.scale.set(s,s,1);
    sp2.position.set((Math.random()-.5)*64,(Math.random()-.5)*34,-10-Math.random()*25);sp2.userData={sp:.2+Math.random()*.4,ph:Math.random()*9,y:sp2.position.y};S.add(sp2);buttons.push(sp2)}});
  /* nuestras fotos como polaroids (en el anillo van hasta 14; en la película salen todas) */
  const ring=new T3.Group();S.add(ring);ring.rotation.x=.18;const cards=[];const loader=new T3.TextureLoader();
  const shown=fotos.map((f,i)=>({f,i})).filter((x,k,a)=>a.length<=14||k%Math.ceil(a.length/14)===0).slice(0,14);
  const RR=mob?18:23;shown.forEach(({f,i},k)=>{const g=new T3.Group(),ar=f.w&&f.h?f.w/f.h:1,ph=3.4,pw=Math.min(4.6,ph*ar);
   const frame=new T3.Mesh(new T3.PlaneGeometry(pw+.5,ph+1.25),new T3.MeshBasicMaterial({color:0xffffff,fog:false}));frame.position.y=-.32;
   const tx=loader.load(f.src);const img=new T3.Mesh(new T3.PlaneGeometry(pw,ph),new T3.MeshBasicMaterial({map:tx,fog:false}));img.position.z=.01;
   const back=frame.clone();back.rotation.y=Math.PI;back.position.z=-.01;g.add(frame,img,back);
   const a=k/shown.length*Math.PI*2;g.userData={a,i,bob:Math.random()*6,tilt:(Math.random()-.5)*.22};g.children.forEach(m=>m.userData.card=g);ring.add(g);cards.push(g)});
  /* estrellas fugaces */
  const shoot=[];for(let i=0;i<3;i++){const m=new T3.Mesh(new T3.PlaneGeometry(6,.06),new T3.MeshBasicMaterial({color:0xe6dcff,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false}));m.userData.t=-Math.random()*8;S.add(m);shoot.push(m)}
  /* mirar alrededor y elegir una foto */
  let mx=0,my=0,tx2=0,ty2=0,drag=null;const ray=new T3.Raycaster(),v2=new T3.Vector2();
  const pt=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1]};
  cv.addEventListener('pointermove',e=>{const [x,y]=pt(e);tx2=x;ty2=y;if(drag)drag.dx+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0);v2.set(x,y);ray.setFromCamera(v2,C);cv.classList.toggle('hov',ray.intersectObjects(cards,true).length>0)});
  cv.addEventListener('pointerdown',()=>{drag={dx:0}});
  cv.addEventListener('pointerup',e=>{const was=drag;drag=null;if(was&&was.dx>12)return;const [x,y]=pt(e);v2.set(x,y);ray.setFromCamera(v2,C);const h=ray.intersectObjects(cards,true)[0];if(h)onPick(h.object.userData.card.userData.i);else hearts(4)});
  let run=true,last=performance.now(),t=0;const rnd=(a,b)=>a+Math.random()*(b-a);
  const beat=x=>{const p=x%0.86;return Math.exp(-Math.pow((p-.08)/.05,2))+.6*Math.exp(-Math.pow((p-.26)/.06,2))};
  function loop(now){if(!run)return;requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
   const b=red?0:beat(t);heart.scale.setScalar(1+b*.06);heart.rotation.y=Math.sin(t*.25)*.5;
   if(!red){const p=hg.attributes.position.array;for(let i=0;i<N;i+=7){const j=i*3;p[j]=base[j]+Math.sin(t*1.3+i)*.06;p[j+1]=base[j+1]+Math.cos(t*1.1+i)*.06}hg.attributes.position.needsUpdate=true;
    const q=fg.attributes.position.array;for(let i=0;i<FN;i++){const j=i*3,s=fseed[i];q[j]=fbase[j]+Math.sin(t*.3+s)*3;q[j+1]=fbase[j+1]+Math.sin(t*.5+s*2)*2;q[j+2]=fbase[j+2]+Math.cos(t*.25+s)*3}fg.attributes.position.needsUpdate=true;
    flies.material.opacity=.6+.3*Math.sin(t*2)}
   buttons.forEach(s=>{const u=s.userData;s.position.y=u.y+Math.sin(t*u.sp+u.ph)*1.5;s.material.rotation=Math.sin(t*u.sp*.7+u.ph)*.6});
   sky.rotation.y+=dt*.008;ring.rotation.y+=dt*(red?0:.09);
   cards.forEach(g=>{const u=g.userData,a=u.a;g.position.set(Math.cos(a)*RR,Math.sin(t*.6+u.bob)*.8+Math.sin(a*2)*2.2,Math.sin(a)*RR);g.lookAt(C.position);g.rotateZ(u.tilt)});
   shoot.forEach(m=>{m.userData.t+=dt;const k=m.userData.t;if(k<0){m.material.opacity=0;return}if(k>1.4){m.userData.t=-(4+Math.random()*9);m.position.set(rnd(-40,10),rnd(10,26),rnd(-60,-30));m.rotation.z=-.45;return}
    m.position.x+=dt*42;m.position.y-=dt*20;m.material.opacity=Math.sin(k/1.4*Math.PI)*.9});
   mx+=(tx2-mx)*.04;my+=(ty2-my)*.04;C.position.x=mx*9;C.position.y=2+my*6;C.lookAt(0,0,0);R.render(S,C)}
  requestAnimationFrame(loop);
  return {stop(){run=false;removeEventListener('resize',resize);R.dispose();hg.dispose();sg.dispose();fg.dispose()}};
 }

 /* ---------- 4. nuestra película: el video y luego cada foto una vez ---------- */
 let mvT=null;
 async function movie(){const mv=stage.querySelector('.am-mv');mv.querySelectorAll('.s,video').forEach(n=>n.remove());mv.classList.add('on');
  const fotos=info.fotos,cap=mv.querySelector('.cap'),dots=mv.querySelector('.dots');dots.innerHTML=fotos.map(()=>'<i></i>').join('');
  const vu=await videoURL();
  if(vu&&mv.classList.contains('on')){if(music)music.duck(true);const v=D.createElement('video');v.src=vu;v.playsInline=true;v.controls=true;v.autoplay=true;mv.prepend(v);cap.textContent='';
   await new Promise(r=>{v.onended=r;v.onerror=r;mvT=r});v.remove();if(music)music.duck(false);if(!mv.classList.contains('on'))return}
  let i=0,cur=null;const show=()=>{if(!mv.classList.contains('on'))return;const f=fotos[i];const s=D.createElement('div');s.className='s';
   s.innerHTML=`<div class="bg" style="background-image:url('${f.src}')"></div><img alt="${esc(f.cap||'Foto de nosotros')}" src="${f.src}">`;mv.insertBefore(s,cap);
   requestAnimationFrame(()=>s.classList.add('on'));if(cur){const c=cur;setTimeout(()=>c.remove(),1700)}cur=s;cap.style.opacity=0;
   setTimeout(()=>{cap.innerHTML=(f.fecha?`<small>${fmtF(f.fecha)}</small>`:'')+esc(f.cap||'');cap.style.opacity=1},500);dots.querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k===i));
   i++;if(i>=fotos.length){mvT=setTimeout(()=>{mv.classList.remove('on');letter()},4800);return}mvT=setTimeout(show,4300)};show()}
 function stopMovie(){if(typeof mvT==='function')mvT();else clearTimeout(mvT);const v=stage&&stage.querySelector('.am-mv video');if(v){v.pause();v.remove()}if(music)music.duck(false)}

 /* ---------- el frasco de razones: sale una distinta cada vez, sin repetir hasta acabarlas ---------- */
 const RZ=['Porque tu risa me arregla cualquier día.','Porque contigo hasta lo más simple es mi plan favorito.','Porque me apoyas en cada locura que se me ocurre.','Porque eres tú, y con eso basta.'];
 let bolsa=[];
 function razon(){const lista=info.razones&&info.razones.length?info.razones:RZ;if(!bolsa.length)bolsa=lista.map((_,i)=>i).sort(()=>Math.random()-.5);
  const rz=stage.querySelector('.am-rz'),p=rz.querySelector('p');p.classList.remove('v');void p.offsetWidth;p.textContent=lista[bolsa.pop()];p.classList.add('v');rz.classList.add('on');if(music)music.chime(2)}
 /* ---------- 5. la carta ---------- */
 function letter(){const lt=stage.querySelector('.am-lt'),n=esc(info.nombre);
  const parr=(info.carta&&info.carta.length?info.carta:[
   'Si algún día te preguntas dónde está mi lugar favorito, es este: cualquiera en el que estés tú.',
   'Entre tanto código y tantos proyectos, tú siempre eres la mejor parte de mi día. Gracias por estar ahí, por apoyarme en todo y por hacer que cada cosa nueva tenga sentido.',
   'Hice esta puertita escondida en mi portafolio para que, cada vez que la abras, recuerdes que aquí hay un mundo que es solo nuestro.',
   'Te amo demasiado.']).map(p=>`<p>${esc(p)}</p>`).join('');
  lt.querySelector('article').innerHTML=`<h3>Para ${n} 💜</h3>${parr}<div class="f">— Gabriel</div>`;lt.classList.add('on');hearts(12);if(music)music.chime(1)}

 /* ---------- música: un vals de caja musical original (3/4, re menor), hecho en la página ---------- */
 function makeMusic(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;let ctx=null,master=null,on=true,started=false,tm=null,step=0;
  const init=()=>{if(ctx)return;ctx=new AC();master=ctx.createGain();master.gain.value=0;
   const rv=ctx.createConvolver(),len=ctx.sampleRate*3,ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}rv.buffer=ir;
   const wet=ctx.createGain();wet.gain.value=.55;master.connect(ctx.destination);master.connect(rv);rv.connect(wet);wet.connect(ctx.destination)};
  const F=n=>{const m={C:-9,'C#':-8,D:-7,Eb:-6,E:-5,F:-4,'F#':-3,G:-2,Ab:-1,A:0,Bb:1,B:2},r=n.match(/^([A-G][b#]?)(\d)$/);return 440*Math.pow(2,(m[r[1]]+(+r[2]-4)*12)/12)};
  /* campanita de caja musical: tono puro + un brillo agudo que se apaga rápido */
  const box=(f,at,v=.06,dur=1.8)=>{[[1,v,dur],[4.02,v*.22,.35],[2,v*.18,dur*.6]].forEach(([m,g0,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f*m;o.connect(g).connect(master);
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(g0,at+.004);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.start(at);o.stop(at+d+.05)})};
  const pad=(fs,at,dur,v=.012)=>fs.forEach(f=>{const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;o.type='triangle';o.frequency.value=f;o.connect(lp).connect(g).connect(master);
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.6);g.gain.linearRampToValueAtTime(0,at+dur);o.start(at);o.stop(at+dur+.05)});
  /* melodía original: 16 compases de vals */
  const MEL=[['A4',0,'F4'],['D5',0,'A4'],['Bb4','A4','G4'],['A4',0,0],['G4',0,'E4'],['C#5',0,'A4'],['D5','E5','F5'],['E5',0,0],
             ['F5',0,'D5'],['Bb4',0,'G4'],['A4','G4','F4'],['E4',0,0],['F4','G4','A4'],['Bb4',0,'G4'],['A4','C#5','E5'],['D5',0,0]];
  const CHD=[['D3','F3','A3'],['D3','F3','A3'],['G2','Bb2','D3'],['D3','F3','A3'],['A2','C#3','E3'],['A2','C#3','E3'],['D3','F3','A3'],['A2','C#3','E3'],
             ['D3','F3','A3'],['G2','Bb2','D3'],['D3','F3','A3'],['A2','C#3','E3'],['D3','F3','A3'],['G2','Bb2','D3'],['A2','C#3','E3'],['D3','F3','A3']];
  const BEAT=.62;
  const tick=()=>{if(!ctx)return;const at=ctx.currentTime+.05,bar=Math.floor(step/3)%16,b=step%3,ch=CHD[bar];
   if(b===0){box(F(ch[0]),at,.05,2.2);pad(ch.map(n=>F(n)*2),at,BEAT*3)}else box(F(ch[b])*2,at,.022,1.1);
   const m=MEL[bar][b];if(m)box(F(m)*2,at+.01,.055,1.9);step++};
  return {get on(){return on},
   chime(k){try{init();ctx.resume();const at=ctx.currentTime;[['A5','D6','F6'],['D6','F6','A6','D7'],['F6','A6']][k||0].forEach((n,i)=>box(F(n),at+i*.09,.05,1.6))}catch(e){}},
   click(){try{init();const at=ctx.currentTime;[0,.07].forEach(d=>{const n=ctx.createBufferSource(),b=ctx.createBuffer(1,800,ctx.sampleRate),c=b.getChannelData(0);for(let i=0;i<800;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/800,4);n.buffer=b;const g=ctx.createGain();g.gain.value=.25;n.connect(g).connect(ctx.destination);n.start(at+d)})}catch(e){}},
   creak(){try{init();const at=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),bp=ctx.createBiquadFilter(),v=ctx.createOscillator(),vg=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(180,at);o.frequency.linearRampToValueAtTime(320,at+1.1);
    bp.type='bandpass';bp.frequency.value=900;bp.Q.value=6;v.frequency.value=11;vg.gain.value=14;v.connect(vg).connect(o.frequency);o.connect(bp).connect(g).connect(ctx.destination);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.025,at+.1);g.gain.linearRampToValueAtTime(0,at+1.2);o.start(at);v.start(at);o.stop(at+1.25);v.stop(at+1.25)}catch(e){}},
   start(){if(started)return;try{init();ctx.resume();started=true;master.gain.setTargetAtTime(on?.6:0,ctx.currentTime,1.2);tm=setInterval(tick,BEAT*1000)}catch(e){}},
   toggle(){on=!on;if(ctx)master.gain.setTargetAtTime(on?.6:0,ctx.currentTime,.4);if(!started&&on)this.start()},
   duck(d){if(ctx)master.gain.setTargetAtTime(d?0:(on?.6:0),ctx.currentTime,.5)},
   stop(){clearInterval(tm);if(ctx){master.gain.setTargetAtTime(0,ctx.currentTime,.3);const c=ctx;setTimeout(()=>{try{c.close()}catch(e){}},900)}ctx=null;started=false}};
 }
})();

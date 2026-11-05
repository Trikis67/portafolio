/* ===== TALLER 3D =====
   Fondo del portafolio: un escritorio de taller hecho con Three.js (r128).
   - La cámara recorre la mesa con el scroll; cada sección tiene sus objetos.
   - La lámpara sigue al ratón y proyecta sombras; los objetos cercanos se levantan.
   - La aguja de la brújula apunta al cursor y los engranes giran engranados.
   - Incluye el comando 'bigbang' de la terminal (window.bigBang).
   En celulares va en versión ligera: objetos más chicos al borde, la lámpara sigue al dedo o se pasea sola,
   y la cámara se inclina con el teléfono (Android). Sin Three.js queda el fondo CSS. */
(function(){
const cv=document.getElementById('bg'),H=document.documentElement;
if(!cv||typeof THREE==='undefined'){H.classList.remove('bb');return}
try{
const T=THREE,TAU=Math.PI*2,touch=!!window.TOUCH,lite=!!window.LITE||touch,still=typeof reduced!=='undefined'&&reduced;
const R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:!lite,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,touch?1.25:lite?1:1.5));R.setSize(innerWidth,innerHeight);
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.08;
R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
H.classList.add('has3d');
const S=new T.Scene(),C=new T.PerspectiveCamera(40,innerWidth/innerHeight,.1,140),MAXA=R.capabilities.getMaxAnisotropy();

/* Reflejos para los metales: un cuarto simple con tres ventanas de luz */
{const pm=new T.PMREMGenerator(R),es=new T.Scene();
 es.add(new T.Mesh(new T.BoxGeometry(20,10,20),new T.MeshBasicMaterial({color:0x3a2c1e,side:T.BackSide})));
 [[0,4.9,0,12,.1,6,0xfff0d8,3],[-9.9,2,0,.1,4,8,0xffe2b8,1.6],[9.9,1,3,.1,3,5,0xd8e4ff,1.2]].forEach(([x,y,z,w,h,d,c,k])=>{
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k)}));m.position.set(x,y,z);es.add(m)});
 S.environment=pm.fromScene(es,.04).texture;pm.dispose()}

/* ---------- utilidades ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a),ease=x=>1-Math.pow(1-x,3),texs=[];
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new T.CanvasTexture(c);
 t.encoding=T.sRGBEncoding;t.anisotropy=MAXA;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 t.redraw=()=>{g.clearRect(0,0,w,h);draw(g,w,h);t.needsUpdate=true};t.redraw();texs.push(t);return t}
if(document.fonts)document.fonts.ready.then(()=>texs.forEach(t=>t.redraw()));   /* repinta cuando cargan las fuentes */
function noise(g,w,h,n,a){for(let i=0;i<n;i++){g.fillStyle=Math.random()<.5?`rgba(0,0,0,${Math.random()*a})`:`rgba(255,255,255,${Math.random()*a})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}}
function paper(w,h,base,draw){return tex(w,h,(g,W,Hh)=>{g.fillStyle=base;g.fillRect(0,0,W,Hh);noise(g,W,Hh,W*Hh/70,.05);draw(g,W,Hh)})}
function wrap(g,txt,x,y,maxW,lh){let line='';for(const w of txt.split(' ')){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){g.fillText(line,x,y);line=w;y+=lh}else line=t}g.fillText(line,x,y);return y+lh}
function bars(g,x,y,w,rows,lh,col){g.fillStyle=col;for(let i=0;i<rows;i++)g.fillRect(x,y+i*lh,w*(i%5===4?rnd(.4,.7):rnd(.88,1)),lh*.38)}
const M=(c,r=.6,m=0,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{}));
const grp=(...m)=>{const g=new T.Group();g.add(...m);return g};
const ext=(s,d,bev=.03)=>{const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:20});g.rotateX(-Math.PI/2);g.translate(0,bev,0);return g};
function rr(s,x,y,w,h,r){s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function poly(p,n,r,rot=0){for(let i=0;i<n;i++){const a=i/n*TAU+rot,x=Math.cos(a)*r,y=Math.sin(a)*r;i?p.lineTo(x,y):p.moveTo(x,y)}p.closePath();return p}
const F={h:'"Alfa Slab One",serif',w:'"Rye",serif',m:'"Special Elite",monospace',s:'"Newsreader",serif',d:'"Alegreya Sans",sans-serif'};

/* ---------- materiales ---------- */
const brass=M(0xc9973f,.3,.92),steel=M(0xbcc3cb,.26,.95),dark=M(0x1d1a17,.45,.25),cream=M(0xece4d4,.35,0,{side:T.DoubleSide});

/* ---------- la mesa ---------- */
const deskTex=tex(1024,1024,(g,w,h)=>{g.fillStyle='#f4ede2';g.fillRect(0,0,w,h);
 for(let i=0;i<300;i++){const x=Math.random()*w,a=Math.random()*.08;g.strokeStyle=`rgba(95,58,22,${a})`;g.lineWidth=rnd(.6,3.2);g.beginPath();g.moveTo(x,0);
  for(let y=0;y<=h;y+=32)g.lineTo(x+Math.sin(y*.005+i*.7)*rnd(2,7),y);g.stroke()}
 for(let i=0;i<5;i++){const x=rnd(40,w-40),y=rnd(40,h-40);g.strokeStyle='rgba(90,50,18,.09)';for(let k=1;k<7;k++){g.lineWidth=1.2;g.beginPath();g.ellipse(x,y,k*4,k*11,0,0,TAU);g.stroke()}}
 noise(g,w,h,14000,.05);g.fillStyle='rgba(60,35,10,.22)';for(let x=0;x<w;x+=256)g.fillRect(x,0,3,h)},[3,9]);
const deskMat=M(0xd8c29d,.86,0,{map:deskTex,envMapIntensity:.25});
const desk=new T.Mesh(new T.PlaneGeometry(70,300),deskMat);desk.rotation.x=-Math.PI/2;desk.position.z=120;desk.receiveShadow=true;S.add(desk);

/* ---------- luces ---------- */
const hemi=new T.HemisphereLight(0xfff4e6,0x6b4a2a,.5);S.add(hemi);
const fill=new T.DirectionalLight(0xfff6ea,.26);fill.position.set(-6,10,6);S.add(fill);
const lamp=new T.SpotLight(0xffc98a,3.1,44,.4,.85,1.1);lamp.castShadow=true;
lamp.shadow.mapSize.set(lite?512:1024,lite?512:1024);lamp.shadow.camera.near=2;lamp.shadow.camera.far=32;lamp.shadow.bias=-.0005;S.add(lamp,lamp.target);

/* ---------- objetos ---------- */
function gear(r,teeth,depth=.32){const s=new T.Shape(),st=TAU/teeth,ri=r*.85;
 for(let i=0;i<teeth;i++){const a=i*st;[[ri,a],[r,a+st*.18],[r,a+st*.46],[ri,a+st*.64]].forEach(([rr2,aa],k)=>{const x=Math.cos(aa)*rr2,y=Math.sin(aa)*rr2;(i||k)?s.lineTo(x,y):s.moveTo(x,y)})}
 s.closePath();const h=new T.Path();h.absarc(0,0,r*.2,0,TAU,true);s.holes.push(h);
 for(let i=0;i<5;i++){const a=i/5*TAU,p=new T.Path();p.absarc(Math.cos(a)*r*.52,Math.sin(a)*r*.52,r*.15,0,TAU,true);s.holes.push(p)}
 const m=new T.Mesh(ext(s,depth,.04),brass),g=grp(m);g.userData.spin=m;return g}
function nut(r=.42){const s=poly(new T.Shape(),6,r),h=new T.Path();h.absarc(0,0,r*.46,0,TAU,true);s.holes.push(h);return grp(new T.Mesh(ext(s,r*.55),steel))}
function wrench(){const g=new T.Group(),L=5;g.add(new T.Mesh(ext(rr(new T.Shape(),-L/2,-.25,L,.5,.22),.16),steel));
 [[-L/2,1],[L/2,.82]].forEach(([x,k])=>{const s=new T.Shape();s.absarc(0,0,.78*k,0,TAU,false);s.holes.push(poly(new T.Path(),6,.42*k,Math.PI/6));const m=new T.Mesh(ext(s,.22),steel);m.position.x=x;g.add(m)});return g}
const dialTex=tex(512,512,(g,w)=>{const c=w/2;g.fillStyle='#efe5cf';g.fillRect(0,0,w,w);noise(g,w,w,3000,.05);g.strokeStyle='#3a2a18';g.fillStyle='#3a2a18';
 for(let i=0;i<72;i++){const a=i/72*TAU,l=i%9===0?34:i%3===0?20:10;g.lineWidth=i%9===0?4:2;g.beginPath();g.moveTo(c+Math.cos(a)*(c-12),c+Math.sin(a)*(c-12));g.lineTo(c+Math.cos(a)*(c-12-l),c+Math.sin(a)*(c-12-l));g.stroke()}
 g.font=`64px ${F.w}`;g.textAlign='center';g.textBaseline='middle';[['N',0,-1],['E',1,0],['S',0,1],['O',-1,0]].forEach(([t,x,y])=>{g.fillStyle=t==='N'?'#9e2a1e':'#3a2a18';g.fillText(t,c+x*(c-92),c+y*(c-92))});
 g.strokeStyle='rgba(58,42,24,.5)';g.lineWidth=2;g.beginPath();g.arc(c,c,c-120,0,TAU);g.stroke()});
function compass(){const g=new T.Group(),b=new T.Mesh(new T.CylinderGeometry(1.15,1.2,.28,48),brass);b.position.y=.14;g.add(b);
 const ring=new T.Mesh(new T.TorusGeometry(1.1,.07,12,48),brass);ring.rotation.x=Math.PI/2;ring.position.y=.3;g.add(ring);
 const dial=new T.Mesh(new T.CircleGeometry(1.02,48),M(0xffffff,.7,0,{map:dialTex}));dial.rotation.x=-Math.PI/2;dial.position.y=.285;g.add(dial);
 const nd=new T.Group(),n1=new T.Mesh(new T.ConeGeometry(.1,.85,4),M(0xb3261e,.4)),n2=new T.Mesh(new T.ConeGeometry(.1,.85,4),M(0xf2efe8,.4));
 n1.rotation.x=-Math.PI/2;n1.position.z=-.42;n2.rotation.x=Math.PI/2;n2.position.z=.42;nd.add(n1,n2,new T.Mesh(new T.CylinderGeometry(.08,.08,.08,16),brass));nd.position.y=.34;nd.scale.y=.4;g.add(nd);
 const gl=new T.Mesh(new T.CylinderGeometry(1.03,1.03,.03,48),M(0xffffff,.04,0,{transparent:true,opacity:.14}));gl.position.y=.42;gl.userData.ns=true;g.add(gl);
 const lp=new T.Mesh(new T.TorusGeometry(.22,.06,10,24),brass);lp.position.set(0,.16,-1.34);lp.rotation.x=Math.PI/2;g.add(lp);g.userData.needle=nd;return g}
function pencil(col=0xe0a526,L=4){const g=new T.Group(),y=.15;
 const parts=[[new T.CylinderGeometry(.14,.14,L,6),M(col,.55),0,1],[new T.ConeGeometry(.14,.45,6),M(0xe8c99a,.8),L/2+.225,-1],[new T.ConeGeometry(.046,.15,6),dark,L/2+.4,-1],
  [new T.CylinderGeometry(.15,.15,.3,14),steel,-L/2-.15,1],[new T.CylinderGeometry(.15,.15,.28,14),M(0xd9776e,.85),-L/2-.44,1]];
 parts.forEach(([geo,mat,x,dir])=>{const m=new T.Mesh(geo,mat);m.rotation.z=dir<0?-Math.PI/2:Math.PI/2;m.position.set(x,y,0);g.add(m)});return g}
function mug(col=0xe9e2d3){const pts=[[0,0],[.74,0],[.8,.06],[.8,1.5],[.72,1.5],[.72,.14],[0,.14]].map(([x,y])=>new T.Vector2(x,y)),mat=M(col,.32,0,{side:T.DoubleSide});
 const g=grp(new T.Mesh(new T.LatheGeometry(pts,40),mat)),h=new T.Mesh(new T.TorusGeometry(.38,.09,12,24,Math.PI),mat);h.rotation.z=-Math.PI/2;h.position.set(.8,.8,0);g.add(h);
 const cf=new T.Mesh(new T.CircleGeometry(.72,32),M(0x3b2312,.12));cf.rotation.x=-Math.PI/2;cf.position.y=1.22;g.add(cf);return g}
function sheet(w,h,map,curl=.08){const geo=new T.PlaneGeometry(w,h,14,1);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)/(w/2);p.setY(i,curl*x*x*x*x+.02)}geo.computeVertexNormals();return grp(new T.Mesh(geo,M(0xffffff,.92,0,{map,side:T.DoubleSide})))}
function box(w,h,d,mat,y=h/2){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.y=y;return m}
function topPlane(w,d,map,y,emis){const m=new T.Mesh(new T.PlaneGeometry(w,d),M(0xffffff,.5,0,emis?{map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.85}:{map}));m.rotation.x=-Math.PI/2;m.position.y=y;return m}

/* Texturas de papel */
const gacetaTex=paper(512,660,'#efe3c8',(g,w,h)=>{g.fillStyle='#2e271a';g.textAlign='center';g.font=`62px ${F.h}`;g.fillText('LA GACETA',w/2,82);
 g.fillRect(30,100,w-60,3);g.font=`16px ${F.m}`;g.fillText('EDICIÓN ESPECIAL · USAC · 2026',w/2,126);g.fillRect(30,140,w-60,1.5);
 g.font=`700 38px ${F.s}`;g.textAlign='left';const y=wrap(g,'Un estudiante, mil líneas de código',34,196,w-68,42);
 g.fillStyle='#b9ab8c';g.fillRect(34,y,w*.42,170);g.fillStyle='#8c7c5c';g.font=`54px ${F.d}`;g.textAlign='center';g.fillText('</>',34+w*.21,y+105);
 bars(g,w*.42+52,y+6,w*.5-56,9,19,'rgba(46,39,26,.55)');bars(g,34,y+192,w/2-50,14,19,'rgba(46,39,26,.5)');bars(g,w/2+16,y+192,w/2-50,14,19,'rgba(46,39,26,.5)')});
const matTex=tex(1024,780,(g,w,h)=>{g.fillStyle='#2f5b4d';g.fillRect(0,0,w,h);noise(g,w,h,8000,.05);
 for(let x=0;x<=w;x+=32){g.strokeStyle=x%160===0?'rgba(235,240,220,.42)':'rgba(235,240,220,.16)';g.lineWidth=x%160===0?2:1;g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}
 for(let y=0;y<=h;y+=32){g.strokeStyle=y%160===0?'rgba(235,240,220,.42)':'rgba(235,240,220,.16)';g.lineWidth=y%160===0?2:1;g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
 g.strokeStyle='rgba(235,240,220,.3)';g.lineWidth=2;g.beginPath();g.moveTo(0,h);g.lineTo(h,0);g.stroke();g.beginPath();g.arc(w-170,170,120,0,TAU);g.stroke();
 g.fillStyle='rgba(235,240,220,.55)';g.font=`18px ${F.m}`;for(let x=32;x<w;x+=160)g.fillText(String(x/32|0),x+4,22)});
const shopTex=tex(360,720,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.fillStyle='#111';g.font=`700 26px ${F.d}`;g.fillText('El Rack de las',22,62);g.fillText('Playeras',22,92);
 ['Todas','Nautica','XL','M'].forEach((t,i)=>{const x=22+i*80;g.lineWidth=2;g.strokeStyle='#111';g.fillStyle=i?'#fff':'#111';g.beginPath();g.roundRect?g.roundRect(x,112,70,30,15):g.rect(x,112,70,30);g.fill();g.stroke();g.fillStyle=i?'#111':'#fff';g.font=`15px ${F.d}`;g.fillText(t,x+12,133)});
 for(let i=0;i<4;i++){const x=22+(i%2)*162,y=162+(i/2|0)*232;g.fillStyle='#ecebe7';g.fillRect(x,y,152,170);g.font='70px sans-serif';g.fillText('👕',x+38,y+112);g.fillStyle='#111';g.font=`700 18px ${F.d}`;g.fillText(['Nautica','Polo','Nike','Puma'][i],x+2,y+196);g.fillStyle='#777';g.font=`15px ${F.d}`;g.fillText('Q 85',x+2,y+216)}
 g.fillStyle='#25d366';g.fillRect(22,h-82,w-44,52);g.fillStyle='#06361a';g.font=`700 20px ${F.d}`;g.textAlign='center';g.fillText('Pedir por WhatsApp',w/2,h-49)});
const receiptTex=paper(300,560,'#fbfaf6',(g,w,h)=>{g.fillStyle='#2b2b2b';g.textAlign='center';g.font=`26px ${F.m}`;g.fillText('PEDIDO',w/2,52);g.font=`18px ${F.m}`;g.fillText('#00167',w/2,80);
 g.textAlign='left';[['Playera Nautica XL','85'],['Polo M','90'],['Envío a domicilio','25']].forEach(([a,b],i)=>{g.fillText(a,20,140+i*38);g.textAlign='right';g.fillText(b,w-20,140+i*38);g.textAlign='left'});
 g.fillRect(20,262,w-40,2);g.font=`24px ${F.m}`;g.fillText('TOTAL',20,300);g.textAlign='right';g.fillText('Q 200',w-20,300);g.textAlign='center';g.font=`17px ${F.m}`;g.fillText('Enviado por WhatsApp',w/2,360);
 for(let x=24;x<w-24;x+=6)g.fillRect(x,400,Math.random()<.5?2:4,70)});
const sticky=(col,txt,sub)=>paper(256,256,col,(g,w)=>{g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,0,w,34);g.fillStyle='#2a2116';g.textAlign='center';g.font=`44px ${F.m}`;g.fillText(txt,w/2,128);g.font=`22px ${F.m}`;g.fillText(sub,w/2,178)});
const keyTex=t=>tex(128,128,(g,w)=>{g.fillStyle='#efe9dd';g.fillRect(0,0,w,w);g.fillStyle='#2a2116';g.font=`${t.length>2?34:46}px ${F.h}`;g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,w/2+2)});
const noteTex=tex(512,660,(g,w,h)=>{g.fillStyle='#1f3a5f';g.fillRect(0,0,w,h);noise(g,w,h,6000,.06);g.fillStyle='#f3ecdc';g.fillRect(90,200,w-150,190);g.fillStyle='#1f3a5f';g.textAlign='center';
 g.font=`52px ${F.h}`;g.fillText('USAC',90+(w-150)/2,272);g.font=`22px ${F.m}`;g.fillText('Ingeniería en Ciencias',90+(w-150)/2,318);g.fillText('y Sistemas',90+(w-150)/2,346);
 g.fillStyle='#0d1a2b';for(let y=40;y<h;y+=46){g.beginPath();g.arc(36,y,9,0,TAU);g.fill()}});
const certTex=paper(640,460,'#f6efdd',(g,w,h)=>{g.strokeStyle='#8a6a2a';g.lineWidth=6;g.strokeRect(22,22,w-44,h-44);g.lineWidth=2;g.strokeRect(36,36,w-72,h-72);g.fillStyle='#3a2a18';g.textAlign='center';
 g.font=`54px ${F.w}`;g.fillText('Certificado',w/2,122);g.font=`20px ${F.m}`;g.fillText('otorgado a',w/2,170);g.font=`italic 44px ${F.s}`;g.fillText('Gabriel Solís',w/2,228);
 g.fillRect(w/2-170,246,340,1.5);bars(g,w/2-180,282,360,3,22,'rgba(58,42,24,.45)')});
const crtTex=tex(512,384,(g,w,h)=>{g.fillStyle='#0b1a0f';g.fillRect(0,0,w,h);g.fillStyle='#7dff9a';g.font=`36px ${F.m}`;g.fillText('GS-OS v1.0',30,70);g.font=`24px ${F.m}`;
 ['> iniciando escritorio 3D…','> lab_binario   [ok]','> monitor       [ok]','> editor_js     [ok]','> listo_'].forEach((t,i)=>g.fillText(t,30,128+i*44));
 g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=4)g.fillRect(0,y,w,2)});
const floppyTex=tex(400,300,(g,w,h)=>{g.fillStyle='#f4f1ea';g.fillRect(0,0,w,h);g.fillStyle='#c0392b';g.fillRect(0,0,w,26);g.fillStyle='#2a2116';g.font=`40px ${F.h}`;g.fillText('GALERÍA 3D',24,98);
 g.font=`24px ${F.m}`;g.fillText('nivel 1 · proyectos',24,146);g.fillStyle='rgba(42,33,22,.25)';for(let y=180;y<h-20;y+=34)g.fillRect(24,y,w-48,2)});
const pcbTex=tex(512,352,(g,w,h)=>{g.fillStyle='#1d5a3a';g.fillRect(0,0,w,h);g.strokeStyle='#c9a24a';g.lineWidth=4;g.lineCap='round';
 for(let i=0;i<22;i++){let x=rnd(10,w-10),y=rnd(10,h-10);g.beginPath();g.moveTo(x,y);for(let k=0;k<3;k++){Math.random()<.5?x+=rnd(-120,120):y+=rnd(-90,90);g.lineTo(x,y)}g.stroke();g.fillStyle='#e0c070';g.beginPath();g.arc(x,y,6,0,TAU);g.fill()}
 g.fillStyle='rgba(255,255,255,.75)';g.font=`22px ${F.m}`;g.fillText('ESTADO EN VIVO  rev.B',18,h-18)});
const envTex=paper(600,400,'#d9b98a',(g,w,h)=>{g.strokeStyle='rgba(80,50,20,.45)';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(w/2,h*.58);g.lineTo(w,0);g.stroke();
 g.fillStyle='#b33a2a';g.fillRect(w-120,30,84,100);g.fillStyle='#f4e7cf';g.font=`46px ${F.h}`;g.textAlign='center';g.fillText('GT',w-78,98);
 g.fillStyle='#2a1c0f';g.textAlign='left';g.font=`34px ${F.m}`;g.fillText('¿Hablamos?',60,h-110);g.font=`22px ${F.m}`;g.fillText('De: Gabriel Solís · Guatemala',60,h-66)});

/* ---------- estaciones: los objetos de cada sección ---------- */
const world=new T.Group();S.add(world);
const tools=[],spinners=[],needles=[],leds=[],stations=[];
function put(st,o,x,z,ry=0,tool=true){o.traverse(m=>{if(m.isMesh){m.castShadow=!m.userData.ns;m.receiveShadow=true}});o.position.set(x,0,z);o.rotation.y=ry;
 o.userData.ph=Math.random()*TAU;o.userData.lift=0;st.add(o);if(tool)tools.push(o);return o}
function station(id,dy,build){const g=new T.Group();world.add(g);build(g);stations.push({g,id,dy})}

station('hero',0,s=>{
 put(s,sheet(8.6,6.6,matTex,.01),4.3,-.3,.04,false);
 put(s,sheet(3.5,4.5,gacetaTex,.12),3.0,-1.2,.16);
 const g1=gear(1.7,16),g2=gear(.95,9);put(s,g1,6.5,-2.7);put(s,g2,6.5+1.62,-2.7+1.72,.18);spinners.push([g1,1],[g2,-16/9]);
 const c=compass();put(s,c,1.9,2.3,.3);needles.push(c);
 put(s,wrench(),5.6,2.5,-.55);put(s,nut(),1.0,-3.1,.4);put(s,nut(.34),7.6,1.0,.1);put(s,pencil(),3.4,3.9,.28)});
station('projects',150,s=>{
 const ph=grp(box(1.7,.16,3.3,dark),topPlane(1.5,3.05,shopTex,.165,true));put(s,ph,6.4,-.2,-.22);
 put(s,sheet(1.35,2.5,receiptTex,.05),4.2,.3,.2)});
station('projects',.55,s=>{
 const chip=grp(box(1.6,.2,1.6,dark),topPlane(1.2,1.2,tex(128,128,(g,w)=>{g.fillStyle='#24211d';g.fillRect(0,0,w,w);g.fillStyle='#d9cfa8';g.font=`20px ${F.m}`;g.textAlign='center';g.fillText('RUST',w/2,54);g.fillText('OPT v0.2',w/2,84)}),.205));
 for(let i=0;i<7;i++)[[-.86,1],[.86,1],[-.86,0],[.86,0]].forEach(([o,ax])=>{const p=box(ax?.18:.08,.05,ax?.08:.18,brass,.06);p.position[ax?'x':'z']=o;p.position[ax?'z':'x']=-.6+i*.2;chip.add(p)});
 put(s,chip,-9.8,0,.35)});
station('servicios',150,s=>{
 [['#f7e27a','Web','landing'],['#f6a5b8','WhatsApp','pedidos'],['#a8e0c2','Panel','admin']].forEach(([c,t,u],i)=>put(s,sheet(1.9,1.9,sticky(c,t,u),.04),3.9+i*1.75,-.4+(i%2)*.9,rnd(-.25,.25)))});
station('about',150,s=>{put(s,mug(),6.6,-.4);put(s,pencil(0x3f6f8f,3.4),4.3,.5,-.5)});
station('skills',150,s=>{['JS','RS','PY','JV','</>','CSS'].forEach((t,i)=>{const k=grp(box(.95,.42,.95,M(0xe8e1d2,.5))),tp=topPlane(.8,.8,keyTex(t),.425);k.add(tp);put(s,k,3.8+(i%3)*1.35,-.7+(i/3|0)*1.4+(i%2)*.2,rnd(-.3,.3))})});
station('experiencia',150,s=>{put(s,wrench(),5.6,-.2,.5);put(s,nut(),3.5,.8,.2);put(s,nut(.3),7.9,.9,.9)});
station('educacion',150,s=>{put(s,grp(box(3.0,.22,3.9,M(0x1f3a5f,.6)),topPlane(3.0,3.9,noteTex,.225)),6.0,.1,-.12);put(s,pencil(0xc0392b,3),3.7,.9,.7)});
station('certs',150,s=>{put(s,sheet(3.8,2.75,certTex,.06),5.6,0,.1);const seal=grp(new T.Mesh(new T.CylinderGeometry(.42,.45,.12,28),M(0x9e1b1b,.38)));seal.children[0].position.y=.08;put(s,seal,7.0,.85)});
station('explorar',150,s=>{const crt=new T.Group(),bd=box(2.8,2.2,2.3,M(0xd9d0bc,.55),1.1);crt.add(bd);
 const sc=new T.Mesh(new T.PlaneGeometry(2.2,1.65),M(0xffffff,.3,0,{map:crtTex,emissive:0xffffff,emissiveMap:crtTex,emissiveIntensity:.9}));sc.position.set(0,1.18,1.16);crt.add(sc);put(s,crt,6.2,-.6,-.3)});
station('galeria',150,s=>{const fl=grp(box(2.1,.08,2.1,M(0x1e2a44,.45)),topPlane(1.6,1.2,floppyTex,.085));const sh=box(.9,.1,.75,steel,.06);sh.position.z=-.66;fl.add(sh);put(s,fl,5.8,-.1,.25)});
station('status',150,s=>{const b=grp(box(3.2,.1,2.2,M(0x1d5a3a,.5)),topPlane(3.2,2.2,pcbTex,.105));[[-.7,.1],[.6,-.4]].forEach(([x,z])=>{const c=box(.7,.14,.5,dark,.17);c.position.x=x;c.position.z=z;b.add(c)});
 const led=new T.Mesh(new T.SphereGeometry(.13,16,12),M(0xff3b2f,.3,0,{emissive:0xff2a1a,emissiveIntensity:1}));led.position.set(1.2,.2,.6);b.add(led);leds.push(led);put(s,b,6.0,0,-.15)});
station('contact',90,s=>{put(s,sheet(3.6,2.4,envTex,.03),6.0,-.2,-.12);put(s,pencil(),3.6,.9,.4)});

/* Coloca cada estación a la altura de su sección: la cámara retrocede con el scroll, así la mesa sube con la página (un poco más lento: profundidad) */
const K=.0105;let pageH=0,mob=false;
function layout(){pageH=H.scrollHeight;mob=innerWidth<760;stations.forEach(st=>{const el=document.getElementById(st.id);
 if(!el||!el.offsetParent&&st.id!=='hero'){st.g.visible=false;return}st.g.visible=true;
 /* celular: objetos a la mitad y pegados al borde derecho; en el hero, debajo de los botones */
 const hero=st.id==='hero',y=hero?(mob?el.offsetHeight-90:0):st.dy<1&&st.dy>0?el.offsetTop+el.offsetHeight*st.dy:el.offsetTop+st.dy,s=hero&&!mob?0:Math.max(0,y-innerHeight/2);
 st.g.position.z=s*K;st.g.scale.setScalar(mob?.5:1);st.g.position.x=mob?(hero?-1.6:-1.15):0})}
layout();addEventListener('load',layout);if(document.fonts)document.fonts.ready.then(layout);

/* ---------- motas de polvo en el haz de la lámpara ---------- */
const DN=lite?90:220,dp=new Float32Array(DN*3);for(let i=0;i<DN;i++)dp.set([rnd(-2.6,2.6),rnd(.2,7),rnd(-2.6,2.6)],i*3);
const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(dp,3));
const dust=new T.Points(dg,new T.PointsMaterial({color:0xffe2b0,size:.05,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));S.add(dust);

/* ---------- Big Bang (comando de la terminal) ---------- */
const NB=lite?700:2200,bp=new Float32Array(NB*3),bv=[];
for(let i=0;i<NB;i++){const th=Math.random()*TAU,ph=Math.acos(2*Math.random()-1),sp=.4+Math.random()*2.6;bv.push(Math.sin(ph)*Math.cos(th)*sp,Math.sin(ph)*Math.sin(th)*sp,Math.cos(ph)*sp)}
const bg2=new T.BufferGeometry();bg2.setAttribute('position',new T.BufferAttribute(bp,3));
const bm=new T.PointsMaterial({color:0xe0c690,size:.09,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}),bpts=new T.Points(bg2,bm);bpts.frustumCulled=false;
const core=new T.Mesh(new T.SphereGeometry(.25,24,24),new T.MeshBasicMaterial({color:0xf1e4c4}));
const wave=new T.Mesh(new T.SphereGeometry(1,32,16),new T.MeshBasicMaterial({color:0xc4573a,wireframe:true,transparent:true,opacity:0}));
const bang0=grp(bpts,core,wave);bang0.position.set(0,2.5,-.5);bang0.visible=false;S.add(bang0);
let bt=-1,skip=false;const FLs=typeof FL!=='undefined'?FL:null,capf=typeof cap==='function'?cap:()=>{};
window.bigBang=()=>{scrollTo({top:0,behavior:'instant'});skip=false;bt=performance.now();H.classList.add('bb');bang0.visible=core.visible=wave.visible=true;world.visible=desk.visible=dust.visible=false;core.scale.setScalar(.4);bm.opacity=0;capf('t = 0 · singularidad — clic para saltar')};
function bang(now){let e=(now-bt)/1000;if(skip)e=Math.max(e,5.4);const u=e-1.8;
 if(e<1.8){const k=e/1.8;core.scale.setScalar(.4+k*.6+Math.sin(e*40)*.06*k);C.position.x+=(Math.random()-.5)*.1*k;C.position.y+=(Math.random()-.5)*.1*k;if(FLs)FLs.style.opacity=k>.9?(k-.9)*10:0;return}
 core.visible=u<.5;core.scale.setScalar(1+u*12);if(FLs)FLs.style.opacity=Math.max(0,1-u*1.4);
 const g=ease(Math.min(u/5,1))*10;for(let i=0;i<NB*3;i++)bp[i]=bv[i]*g;bg2.attributes.position.needsUpdate=true;
 bm.opacity=u<3?.95:Math.max(0,.95*(1-(u-3)/2));wave.scale.setScalar(1+u*26);wave.material.opacity=Math.max(0,.7-u*.28);
 if(u>2.6){world.visible=desk.visible=dust.visible=true;world.scale.setScalar(Math.max(.001,ease(Math.min((u-2.6)/2,1))))}
 capf(u>3.4?'hola, soy gabriel solís':u>1.6?'t + 13.800.000.000 años':u>.2?'BIG BANG':'');if(u>3.6)H.classList.remove('bb');
 if(u>5){bt=-1;bang0.visible=false;world.scale.setScalar(1);if(FLs)FLs.style.opacity=0;capf('')}}
if(still||window.LITE)H.classList.remove('bb');
addEventListener('pointerdown',()=>{skip=true});addEventListener('keydown',()=>{skip=true});

/* ---------- tema: el color de la mesa sigue al tema elegido ---------- */
function readTheme(){const cs=getComputedStyle(document.body),bg=cs.getPropertyValue('--bg').trim();if(!bg)return;
 const c=new T.Color(bg);deskMat.color.copy(c);const hsl={};c.getHSL(hsl);const darkT=hsl.l<.3;
 hemi.intensity=darkT?.38:.5;lamp.intensity=darkT?3.6:3.1;dust.material.opacity=darkT?.75:.5}
readTheme();

/* ---------- entrada: ratón, scroll, tamaño ---------- */
let mx=0,my=0,hasMouse=false;const ndc=new T.Vector2(),ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
let sx=0,lastTouch=-1e9;
addEventListener('mousemove',e=>{if(touch)return;mx=e.clientX/innerWidth*2-1;my=-(e.clientY/innerHeight*2-1);sx=mx;hasMouse=true},{passive:true});
const onT=e=>{const p=e.touches&&e.touches[0];if(!p)return;mx=p.clientX/innerWidth*2-1;my=-(p.clientY/innerHeight*2-1);lastTouch=performance.now()};
addEventListener('touchstart',onT,{passive:true});addEventListener('touchmove',onT,{passive:true});
addEventListener('deviceorientation',e=>{if(e.gamma!=null)sx=Math.max(-1,Math.min(1,e.gamma/28))},{passive:true});
{let lw=innerWidth,lh=innerHeight,tm;addEventListener('resize',()=>{clearTimeout(tm);tm=setTimeout(()=>{if(innerWidth===lw&&Math.abs(innerHeight-lh)<150)return;lw=innerWidth;lh=innerHeight;C.aspect=lw/lh;C.updateProjectionMatrix();R.setSize(lw,lh);layout()},120)})}

/* ---------- bucle ---------- */
const lampT=new T.Vector3(6.5,0,-2.7),wp=new T.Vector3();let camZ=0,camX=0,lastY=scrollY,vel=0,raf=0,f=0,lastR=0,lt=performance.now(),spin=0;
function loop(){raf=requestAnimationFrame(loop);const now=performance.now();if(lite&&now-lastR<32)return;lastR=now;
 const os=document.getElementById('os');if(os&&os.classList.contains('on'))return;
 const raw=Math.min(1,(now-lt)/1e3),dt=Math.min(.05,raw),kf=r=>1-Math.exp(-raw*r);lt=now;
 const sy=scrollY;vel+=((sy-lastY)/Math.max(dt,.001)/2000-vel)*.1;lastY=sy;
 camZ+=(sy*K-camZ)*kf(5.5);camX+=(sx*(mob?.35:.7)-camX)*kf(3);
 C.position.set(camX,13.6,camZ+9.6);C.lookAt(camX*.4,0,camZ-.4);
 /* la lámpara apunta a donde está el ratón sobre la mesa */
 const tt=now/1e3,idle=touch&&now-lastTouch>2500;
 if(hasMouse||(touch&&!idle))ndc.set(mx,my);else ndc.set(.45*Math.sin(tt*.45),.3*Math.sin(tt*.33+1)-.05);   /* sin ratón ni dedo: la lámpara se pasea sola */
 ray.setFromCamera(ndc,C);if(ray.ray.intersectPlane(plane,hit))lampT.lerp(hit,kf(idle||!hasMouse&&!touch?2.5:8));
 lamp.position.set(lampT.x-1.6,9.5,lampT.z+2.6);lamp.target.position.copy(lampT);lamp.target.updateMatrixWorld();
 const t=now/1e3;
 if(!still){spin+=dt*(.35+Math.min(3,Math.abs(vel))*1.5);
  const a=dust.geometry.attributes.position;for(let i=0;i<DN;i++){let y=a.getY(i)+dt*.12;if(y>7)y=.2;a.setY(i,y);a.setX(i,a.getX(i)+Math.sin(t*.6+i)*.002)}a.needsUpdate=true}
 dust.position.set(lampT.x-.5,0,lampT.z+.8);
 spinners.forEach(([g,k])=>g.userData.spin.rotation.y=spin*k);
 /* los objetos cerca de la luz se levantan un poco (su sombra se separa) */
 tools.forEach(o=>{o.getWorldPosition(wp);const d=Math.hypot(wp.x-lampT.x,wp.z-lampT.z),tg=still?0:Math.pow(Math.max(0,1-d/3.4),2)*.6;
  o.userData.lift+=(tg-o.userData.lift)*kf(5);const l=o.userData.lift;o.position.y=l;o.rotation.x=l*.12*Math.sin(t*1.7+o.userData.ph);o.rotation.z=l*.12*Math.cos(t*1.3+o.userData.ph)});
 needles.forEach(c=>{c.getWorldPosition(wp);const want=Math.atan2(-(lampT.x-wp.x),-(lampT.z-wp.z))-c.rotation.y,n=c.userData.needle;let d=want-n.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));n.rotation.y+=d*kf(5)});
 leds.forEach(l=>l.material.emissiveIntensity=.4+.6*(.5+.5*Math.sin(t*4)));
 if(++f%45===0){readTheme();if(H.scrollHeight!==pageH)layout()}
 if(bt>=0)bang(now);R.render(S,C)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(!raf){lt=performance.now();loop()}});
loop();
}catch(err){console.error('Taller 3D:',err);H.classList.remove('bb','has3d')}
})();

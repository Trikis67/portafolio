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
const S=new T.Scene(),C=new T.PerspectiveCamera(40,innerWidth/innerHeight,1,220),MAXA=R.capabilities.getMaxAnisotropy();

/* Reflejos para los metales: un cuarto simple con tres ventanas de luz */
{const pm=new T.PMREMGenerator(R),es=new T.Scene();
 es.add(new T.Mesh(new T.BoxGeometry(20,10,20),new T.MeshBasicMaterial({color:0x3a2c1e,side:T.BackSide})));
 [[0,4.9,0,12,.1,6,0xfff0d8,3],[-9.9,2,0,.1,4,8,0xffe2b8,1.6],[9.9,1,3,.1,3,5,0xd8e4ff,1.2]].forEach(([x,y,z,w,h,d,c,k])=>{
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k)}));m.position.set(x,y,z);es.add(m)});
 S.environment=pm.fromScene(es,.04).texture;pm.dispose()}

/* ---------- utilidades ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a),ease=x=>1-Math.pow(1-x,3),texs=[];let MICRO=null;
const MICRO_DRAW=(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=110+Math.random()*40|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}};
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new T.CanvasTexture(c);
 t.encoding=T.sRGBEncoding;t.anisotropy=MAXA;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 t.redraw=()=>{g.clearRect(0,0,w,h);draw(g,w,h);t.needsUpdate=true};t.redraw();texs.push(t);return t}
if(document.fonts)document.fonts.ready.then(()=>texs.forEach(t=>t.redraw()));
MICRO=tex(256,256,MICRO_DRAW,[6,6]);MICRO.encoding=T.LinearEncoding;   /* repinta cuando cargan las fuentes */
function noise(g,w,h,n,a){for(let i=0;i<n;i++){g.fillStyle=Math.random()<.5?`rgba(0,0,0,${Math.random()*a})`:`rgba(255,255,255,${Math.random()*a})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}}
function paper(w,h,base,draw){return tex(w,h,(g,W,Hh)=>{g.fillStyle=base;g.fillRect(0,0,W,Hh);noise(g,W,Hh,W*Hh/70,.05);draw(g,W,Hh)})}
function wrap(g,txt,x,y,maxW,lh){let line='';for(const w of txt.split(' ')){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){g.fillText(line,x,y);line=w;y+=lh}else line=t}g.fillText(line,x,y);return y+lh}
function bars(g,x,y,w,rows,lh,col){g.fillStyle=col;for(let i=0;i<rows;i++)g.fillRect(x,y+i*lh,w*(i%5===4?rnd(.4,.7):rnd(.88,1)),lh*.38)}
const M=(c,r=.6,m=0,o)=>{const mt=new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{}));if(!mt.map&&!mt.emissiveMap&&MICRO&&!mt.transparent){mt.bumpMap=MICRO;mt.bumpScale=m>.5?.0025:.004}return mt};
const grp=(...m)=>{const g=new T.Group();g.add(...m);return g};
const ext=(s,d,bev=.03)=>{const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:20});g.rotateX(-Math.PI/2);g.translate(0,bev,0);return g};
function rr(s,x,y,w,h,r){s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function poly(p,n,r,rot=0){for(let i=0;i<n;i++){const a=i/n*TAU+rot,x=Math.cos(a)*r,y=Math.sin(a)*r;i?p.lineTo(x,y):p.moveTo(x,y)}p.closePath();return p}
const F={h:'"Alfa Slab One",serif',w:'"Rye",serif',m:'"Special Elite",monospace',s:'"Newsreader",serif',d:'"Alegreya Sans",sans-serif'};

/* ---------- materiales ---------- */
const brass=M(0xc9973f,.3,.92),steel=M(0xbcc3cb,.26,.95),dark=M(0x1d1a17,.45,.25),cream=M(0xece4d4,.35,0,{side:T.DoubleSide});

/* ---------- la mesa ---------- */
const deskTex=tex(1024,1024,(g,w,h)=>{g.fillStyle='#efe1c8';g.fillRect(0,0,w,h);
 for(let i=0;i<360;i++){const x=Math.random()*w,a=Math.random()*.12;g.strokeStyle=`rgba(90,52,18,${a})`;g.lineWidth=rnd(.6,3.6);g.beginPath();g.moveTo(x,0);for(let y=0;y<=h;y+=32)g.lineTo(x+Math.sin(y*.005+i*.7)*rnd(2,8),y);g.stroke()}
 for(let i=0;i<7;i++){const x=rnd(40,w-40),y=rnd(40,h-40);g.strokeStyle='rgba(80,44,14,.12)';for(let k=1;k<8;k++){g.lineWidth=1.3;g.beginPath();g.ellipse(x,y,k*4,k*12,0,0,TAU);g.stroke()}}
 for(let i=0;i<4;i++){const x=rnd(80,w-80),y=rnd(80,h-80),r=rnd(34,52);g.strokeStyle='rgba(70,36,10,.22)';g.lineWidth=rnd(3,6);g.beginPath();g.arc(x,y,r,rnd(0,1),rnd(4.6,6.2));g.stroke()}
 for(let i=0;i<6;i++){const x=rnd(0,w),y=rnd(0,h),r=rnd(40,110),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(60,30,8,.16)');gr.addColorStop(1,'rgba(60,30,8,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<70;i++){g.strokeStyle=`rgba(255,245,225,${rnd(.08,.22)})`;g.lineWidth=rnd(.5,1.4);const x=rnd(0,w),y=rnd(0,h),l=rnd(20,90),a=rnd(-.6,.6);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}
 noise(g,w,h,18000,.06);g.fillStyle='rgba(50,28,8,.3)';for(let x=0;x<w;x+=256){g.fillRect(x,0,3,h);for(let y=60;y<h;y+=300){g.fillStyle='rgba(30,18,6,.55)';g.beginPath();g.arc(x+14,y,3.5,0,TAU);g.arc(x+w*.0+242,y+120,3.5,0,TAU);g.fill();g.fillStyle='rgba(50,28,8,.3)'}}},[3,9]);
const deskMat=M(0xd8c29d,.86,0,{map:deskTex,envMapIntensity:.25});
const desk=new T.Mesh(new T.PlaneGeometry(300,200),deskMat);desk.rotation.x=-Math.PI/2;desk.position.set(55,0,0);desk.receiveShadow=true;S.add(desk);

/* ---------- luces ---------- */
const hemi=new T.HemisphereLight(0xfff4e6,0x6b4a2a,.5);S.add(hemi);
const fill=new T.DirectionalLight(0xfff6ea,.26);fill.position.set(-6,10,6);S.add(fill);
const rim=new T.DirectionalLight(0xffd9a8,.3);rim.position.set(4,7,-12);S.add(rim);
const lamp=new T.SpotLight(0xfff6ea,3.1,44,.4,.32,1.1);lamp.castShadow=true;
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
function sheet(w,h,map,curl=.08,lift=.02){const geo=new T.PlaneGeometry(w,h,14,1);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)/(w/2);p.setY(i,curl*x*x*x*x+lift)}geo.computeVertexNormals();
 return grp(new T.Mesh(geo,M(0xffffff,.92,0,{map,side:T.DoubleSide})))}
/* caja con aristas redondeadas: un rectángulo redondeado extruido con bisel suave arriba y abajo */
const RBC={};
function rbox(w,h,d){const r=Math.min(.085,Math.min(w,h,d)*.26),k=w.toFixed(3)+'_'+h.toFixed(3)+'_'+d.toFixed(3);if(RBC[k])return RBC[k];
 const iw=Math.max(.002,w-2*r),id=Math.max(.002,d-2*r),cr=Math.max(.0005,Math.min(iw,id)*.22,0);
 const s=rr(new T.Shape(),-iw/2,-id/2,iw,id,Math.min(cr,iw/2-.0001,id/2-.0001));
 const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,h-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:5});
 g.rotateX(-Math.PI/2);g.translate(0,r-h/2,0);g.computeBoundingBox();return RBC[k]=g}
function box(w,h,d,mat,y=h/2){const m=new T.Mesh(mat&&mat.map?new T.BoxGeometry(w,h,d):rbox(w,h,d),mat);m.position.y=y;return m}
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
/* =====================================================================
   MUNDO CINEMATOGRÁFICO: cada sección (y cada proyecto) es un capítulo con
   su propia toma de cámara. El scroll lleva la cámara de un objeto al siguiente.
   ===================================================================== */
const world=new T.Group();S.add(world);
const tools=[],spinners=[],needles=[],leds=[],shots=[],heroDrop=[];
function put(g,o,x,z,ry=0,tool=true){o.traverse(m=>{if(m.isMesh){m.castShadow=!m.userData.ns;m.receiveShadow=true}});o.position.set(x,0,z);o.rotation.y=ry;
 Object.assign(o.userData,{ph:Math.random()*TAU,lift:0,bx:x,bz:z,br:ry});g.add(o);if(tool)tools.push(o);return o}
function cluster(x,z){const g=new T.Group();g.position.set(x,0,z);world.add(g);return g}
/* una toma: qué elemento de la página la activa, a qué objeto mira y desde dónde (azimut, elevación, distancia) */
function shot(sel,obj,o){shots.push(Object.assign({sel,obj,az:.3,el:.82,d:8.5,fy:.4},o||{}))}

/* --- 00 · Hero: la base de corte con La Gaceta, engranes, brújula y herramientas (se arman al llegar) --- */
const HC=cluster(0,0);
const blueTex=tex(1024,780,(g,w,h)=>{g.fillStyle='#34506b';g.fillRect(0,0,w,h);for(let i=0;i<7;i++){const x=rnd(0,w),y=rnd(0,h),r=rnd(80,220),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(200,170,110,.22)');gr.addColorStop(1,'rgba(200,170,110,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}noise(g,w,h,14000,.08);g.strokeStyle='rgba(225,236,255,.16)';g.lineWidth=1;for(let x=0;x<=w;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<=h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
 g.strokeStyle='rgba(236,226,200,.78)';g.lineWidth=3;const cx=w*.68,cy=h*.42;g.beginPath();g.arc(cx,cy,150,0,TAU);g.stroke();g.beginPath();g.arc(cx,cy,40,0,TAU);g.stroke();for(let i=0;i<16;i++){const a=i/16*TAU;g.beginPath();g.moveTo(cx+Math.cos(a)*150,cy+Math.sin(a)*150);g.lineTo(cx+Math.cos(a)*185,cy+Math.sin(a)*185);g.stroke()}
 g.setLineDash([10,8]);g.beginPath();g.moveTo(cx-230,cy);g.lineTo(cx+230,cy);g.moveTo(cx,cy-230);g.lineTo(cx,cy+230);g.stroke();g.setLineDash([]);g.fillStyle='rgba(235,242,255,.9)';g.font=`26px ${F.m}`;g.fillText('Ø 340 mm',cx+160,cy-170);
 g.strokeRect(24,h-130,380,106);g.font=`22px ${F.m}`;g.fillText('PLANO Nº 26 · ENGRANE',40,h-90);g.fillText('TALLER G. SOLÍS · 1989',40,h-50)});
put(HC,sheet(8.6,6.6,blueTex,0,.018),0,0,.04,false);
const casTex=tex(512,320,(g,w,h)=>{g.fillStyle='#2b2b2b';g.fillRect(0,0,w,h);g.fillStyle='#efe3c4';g.fillRect(30,24,w-60,170);g.fillStyle='#c8211f';g.fillRect(30,24,w-60,22);g.fillStyle='#2a1c0f';g.font=`italic 44px ${F.s}`;g.fillText('Mix · 1989',56,112);
 g.font=`20px ${F.m}`;g.fillText('LADO A',56,160);[[150,236],[w-150,236]].forEach(([x,y])=>{g.fillStyle='#111';g.beginPath();g.arc(x,y,44,0,TAU);g.fill();g.fillStyle='#ddd';g.beginPath();g.arc(x,y,18,0,TAU);g.fill();g.fillStyle='#111';for(let i=0;i<6;i++){const a=i/6*TAU;g.fillRect(x+Math.cos(a)*12-3,y+Math.sin(a)*12-3,6,6)}});g.fillStyle='#4a3a2a';g.fillRect(200,220,w-400,34)});
const cassette=()=>grp(box(1.9,.2,1.2,M(0x2b2b2b,.4)),topPlane(1.9,1.2,casTex,.205));
put(HC,cassette(),-3.4,3.6,.5);{const c2=cassette();c2.children.forEach(m=>m.position.y+=.21);put(HC,c2,-3.3,3.7,.3)}
{const oil=new T.Group(),pts=[[0,0],[.62,0],[.66,.1],[.5,.75],[.18,.95],[0,.95]].map(([x,y])=>new T.Vector2(x,y));oil.add(new T.Mesh(new T.LatheGeometry(pts,28),M(0x8e1f1a,.45,.4)));
 const sp=new T.Mesh(new T.CylinderGeometry(.03,.08,1.2,10),M(0xc9973f,.3,.9));sp.position.set(.32,1.25,0);sp.rotation.z=-.6;oil.add(sp);oil.scale.setScalar(.72);put(HC,oil,5.4,2.3)}
const gz=put(HC,sheet(3.5,4.5,gacetaTex,.12,.07),-1.4,-.8,.16);
const g1=gear(1.7,16),g2=gear(.95,9);put(HC,g1,2.2,-2.3);put(HC,g2,2.2+1.62,-2.3+1.72,.18);spinners.push([g1,1],[g2,-16/9]);
const cmp=compass();put(HC,cmp,-2.5,2.5,.3);needles.push(cmp);
put(HC,wrench(),1.4,2.7,-.55);put(HC,nut(),-3.4,-2.9,.4);put(HC,nut(.34),3.6,1.2,.1);put(HC,pencil(),-.8,4.1,.28);
HC.children.forEach(o=>{if(tools.includes(o))heroDrop.push(o)});
shot('#hero',HC,{az:.12,el:.98,d:14.6,fy:0,fx:1.1});

/* =====================================================================
   MUNDOS: cada uno cambia la escena del inicio, la mesa y la luz
   (taller = el de siempre · cine · computadora · hacker · oeste)
   ===================================================================== */
const HEROES={kraft:{g:HC,drop:heroDrop.slice(),anc:[[g1,0,.55,0],[g2,0,.45,0],[cmp,0,.5,0],[gz,0,.2,.6]]}};
function heroOf(name,build){const g=cluster(0,0),before=tools.length;const anc=build(g);const drop=tools.slice(before).filter(o=>o.parent===g);g.visible=false;HEROES[name]={g,drop,anc}}
/* --- CINE: claqueta, rollo de película, palomitas y boletos --- */
const clapTex=tex(512,352,(g,w,h)=>{g.fillStyle='#161616';g.fillRect(0,0,w,h);noise(g,w,h,5000,.06);g.strokeStyle='rgba(240,240,240,.7)';g.lineWidth=3;
 g.strokeRect(20,20,w-40,h-40);g.beginPath();g.moveTo(20,130);g.lineTo(w-20,130);g.moveTo(20,236);g.lineTo(w-20,236);g.moveTo(w/2,130);g.lineTo(w/2,h-20);g.stroke();
 g.fillStyle='#f2f2f2';g.font=`40px ${F.h}`;g.fillText('GABRIEL SOLÍS',40,94);g.font=`20px ${F.m}`;g.fillText('ESCENA',40,166);g.fillText('TOMA',w/2+20,166);g.fillText('DIRECTOR',40,272);g.fillText('FECHA',w/2+20,272);
 g.font=`54px ${F.w}`;g.fillText('01',60,222);g.fillText('26',w/2+40,222);g.font=`24px ${F.m}`;g.fillText('USAC',60,316);g.fillText('2026',w/2+40,316)});
const stripeTex=tex(256,32,(g,w,h)=>{for(let x=-h;x<w+h;x+=32){g.fillStyle='#f2f2f2';g.beginPath();g.moveTo(x,h);g.lineTo(x+16,0);g.lineTo(x+32,0);g.lineTo(x+16,h);g.fill()}g.globalCompositeOperation='destination-over';g.fillStyle='#111';g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over'});
const popTex=tex(256,128,(g,w,h)=>{for(let x=0;x<w;x+=32){g.fillStyle=(x/32)%2?'#f4efe6':'#c8211f';g.fillRect(x,0,32,h)}g.fillStyle='#f4efe6';g.fillRect(0,46,w,36);g.fillStyle='#c8211f';g.font=`26px ${F.h}`;g.textAlign='center';g.fillText('POP',w/4,74);g.fillText('CORN',w*3/4,74)},null);
popTex.wrapS=T.RepeatWrapping;popTex.repeat.set(2,1);
const ticketTex=paper(400,180,'#f1d9a8',(g,w,h)=>{g.fillStyle='#b3261e';g.fillRect(0,0,70,h);g.save();g.translate(44,h/2);g.rotate(-Math.PI/2);g.fillStyle='#fff2df';g.font=`18px ${F.m}`;g.textAlign='center';g.fillText('Nº 0026',0,0);g.restore();
 g.fillStyle='#2a1c0f';g.font=`34px ${F.w}`;g.fillText('ADMISIÓN',96,70);g.font=`18px ${F.m}`;g.fillText('FUNCIÓN: PORTAFOLIO',98,108);g.fillText('SALA 1 · FILA G · ASIENTO S',98,138);
 g.fillStyle='rgba(42,28,15,.4)';for(let y=10;y<h;y+=14)g.fillRect(w-26,y,4,7)});
const filmTex=tex(512,96,(g,w,h)=>{g.fillStyle='#141210';g.fillRect(0,0,w,h);g.fillStyle='#e8dcc4';for(let x=8;x<w;x+=28){g.fillRect(x,6,14,10);g.fillRect(x,h-16,14,10)}
 for(let x=10;x<w;x+=124){g.fillStyle='#3a2e22';g.fillRect(x,24,110,48);g.fillStyle='rgba(230,180,80,.5)';g.fillRect(x+10,34,90,28)}});
heroOf('cine',g=>{
 const clap=new T.Group(),slate=box(3.4,.22,2.3,M(0x161616,.6),.11),face=topPlane(3.2,2.1,clapTex,.225);clap.add(slate,face);
 const arm=new T.Group();arm.position.set(0,.24,-1.15);arm.rotation.x=.55;const top=box(3.4,.14,.5,M(0xffffff,.5,0,{map:stripeTex}),.07);top.position.z=.25;arm.add(top);clap.add(arm);put(g,clap,-1.6,.2,.12);
 const reel=new T.Group(),rs=new T.Shape();rs.absarc(0,0,1.55,0,TAU,false);for(let i=0;i<5;i++){const a=i/5*TAU,p=new T.Path();p.absarc(Math.cos(a)*.85,Math.sin(a)*.85,.36,0,TAU,true);rs.holes.push(p)}
 const hub=new T.Path();hub.absarc(0,0,.14,0,TAU,true);rs.holes.push(hub);const d1=new T.Mesh(ext(rs,.06),M(0x9aa0a6,.3,.9));const d2=d1.clone();d2.position.y=.5;
 const core=new T.Mesh(new T.CylinderGeometry(1.15,1.15,.44,40),M(0x1b1712,.5));core.position.y=.28;const rin=new T.Group();rin.add(d1,d2,core);reel.add(rin);reel.userData.spin=rin;put(g,reel,2.4,-2.0,.2);spinners.push([reel,.35]);
 put(g,sheet(5.4,.9,filmTex,.04,.03),2.0,.9,-.55,false);
 const pop=new T.Group(),pts=[[0,0],[.78,0],[1.02,1.7],[.96,1.72],[.72,.06],[0,.06]].map(([x,y])=>new T.Vector2(x,y)),bucket=new T.Mesh(new T.LatheGeometry(pts,36),M(0xffffff,.55,0,{map:popTex,side:T.DoubleSide}));pop.add(bucket);
 {const kim=new T.InstancedMesh(new T.IcosahedronGeometry(.15,0),M(0xf3df9c,.8),46),o3=new T.Object3D();for(let i=0;i<46;i++){const r=Math.sqrt(Math.random())*.9,a=Math.random()*TAU;o3.position.set(Math.cos(a)*r,1.66+Math.random()*.35*(1-r),Math.sin(a)*r);o3.rotation.set(rnd(0,3),rnd(0,3),0);o3.updateMatrix();kim.setMatrixAt(i,o3.matrix)}pop.add(kim)}
 put(g,pop,3.2,2.2);const t1=put(g,sheet(2.4,1.08,ticketTex,.05,.04),-2.2,2.6,.35);put(g,sheet(2.4,1.08,ticketTex,.05,.06),-1.2,3.3,-.15);
 return [[clap,0,.4,-.4],[reel,0,.7,0],[pop,0,1.9,0],[t1,0,.15,0]]});
/* --- COMPUTADORA: monitor CRT, teclado, ratón y disquetes --- */
const dosTex=tex(512,384,(g,w,h)=>{const sky=g.createLinearGradient(0,0,0,h*.7);sky.addColorStop(0,'#2a6fd6');sky.addColorStop(1,'#9fd0ff');g.fillStyle=sky;g.fillRect(0,0,w,h);
 g.fillStyle='#4fa83a';g.beginPath();g.moveTo(0,h*.62);g.quadraticCurveTo(w*.35,h*.42,w,h*.6);g.lineTo(w,h);g.lineTo(0,h);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(w*.72,h*.2,60,16,0,0,TAU);g.ellipse(w*.8,h*.24,44,12,0,0,TAU);g.fill();
 g.fillStyle='#ece9d8';g.fillRect(110,70,300,170);const tb=g.createLinearGradient(0,70,0,98);tb.addColorStop(0,'#0058e6');tb.addColorStop(.5,'#3a93ff');tb.addColorStop(1,'#0050d0');g.fillStyle=tb;g.fillRect(110,70,300,28);
 g.fillStyle='#e04343';g.fillRect(384,74,20,20);g.fillStyle='#fff';g.font='bold 16px Tahoma,Verdana,sans-serif';g.fillText('GABRIEL.EXE',120,90);g.fillText('×',389,90);
 g.fillStyle='#14171f';g.font='16px Tahoma,Verdana,sans-serif';['Desarrollador web','Estudiante USAC','6 proyectos · 6 lenguajes'].forEach((s,i)=>g.fillText(s,126,128+i*30));
 const bar=g.createLinearGradient(0,h-34,0,h);bar.addColorStop(0,'#3a7bf0');bar.addColorStop(1,'#1d4fc4');g.fillStyle=bar;g.fillRect(0,h-34,w,34);
 g.fillStyle='#3c9a2e';g.beginPath();g.roundRect?g.roundRect(0,h-34,110,34,[0,14,14,0]):g.rect(0,h-34,110,34);g.fill();g.fillStyle='#fff';g.font='italic bold 18px Tahoma,sans-serif';g.fillText('inicio',26,h-11);
 g.fillStyle='#bfe0ff';g.font='13px Tahoma,sans-serif';g.fillText('12:00',w-50,h-12);[[24,24],[24,84]].forEach(([x,y])=>{g.fillStyle='#ffe28a';g.fillRect(x+8,y,28,24);g.fillStyle='#fff';g.font='11px Tahoma';g.fillText(y<50?'Mis proyectos':'Papelera',x-6,y+40)})});
const crtGrp=(screenTex,bodyCol)=>{const m=new T.Group();m.add(box(3.0,2.5,2.6,M(bodyCol,.55),1.25));const s=new T.Mesh(new T.PlaneGeometry(2.4,1.8),M(0xffffff,.3,0,{map:screenTex,emissive:0xffffff,emissiveMap:screenTex,emissiveIntensity:.85}));s.position.set(0,1.32,1.31);m.add(s);
 const st=box(1.6,.2,1.4,M(bodyCol,.6),.1);m.add(st);return m};
function keyboard(w,d,baseCol,keyCol,colorful){const k=new T.Group();k.add(box(w,.16,d,M(baseCol,.55)));const cols=Math.round(w/.3),rows=Math.round(d/.32),kg=rbox(.24,.1,.24);
 const im=new T.InstancedMesh(kg,M(0xffffff,colorful?.3:.6,0,colorful?{emissive:0x111111}:{}),cols*rows),mm=new T.Matrix4(),cc=new T.Color();let n=0;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){mm.makeTranslation(-w/2+.17+c*((w-.34)/(cols-1)),.21,-d/2+.18+r*((d-.36)/Math.max(1,rows-1)));im.setMatrixAt(n,mm);
  if(colorful)cc.setHSL((c/cols+r*.06)%1,.9,.55);else cc.set(keyCol);im.setColorAt(n++,cc)}k.add(im);return k}
const cdTex=tex(256,256,(g,w)=>{const c=w/2;if(g.createConicGradient){const gr=g.createConicGradient(0,c,c);['#ff8a8a','#ffe08a','#8affa0','#8adfff','#c08aff','#ff8ad8','#ff8a8a'].forEach((col,i,a)=>gr.addColorStop(i/(a.length-1),col));g.fillStyle=gr}else g.fillStyle='#c8d0d8';
 g.beginPath();g.arc(c,c,c,0,TAU);g.fill();g.fillStyle='rgba(225,230,238,.62)';g.beginPath();g.arc(c,c,c-2,0,TAU);g.fill();g.fillStyle='#9aa3ad';g.beginPath();g.arc(c,c,c*.3,0,TAU);g.fill();g.fillStyle='#3a3f46';g.beginPath();g.arc(c,c,c*.12,0,TAU);g.fill()});
function cdDisc(){const d=new T.Mesh(new T.CircleGeometry(.75,48),M(0xffffff,.18,.6,{map:cdTex}));d.rotation.x=-Math.PI/2;d.position.y=.02;return grp(d)}
heroOf('pc',g=>{put(g,sheet(5.6,4.2,tex(64,64,(x,w)=>{x.fillStyle='#2b4f8a';x.fillRect(0,0,w,w)}),0,.012),.6,.4,0,false);
 const mon=crtGrp(dosTex,0xc9ced6);put(g,mon,-.4,-1.6,.05);const kb=keyboard(4.0,1.4,0xbfc4cc,0xeceef2,false);put(g,kb,-.2,1.6,-.04);
 const mouse=new T.Mesh(new T.SphereGeometry(.42,24,16),M(0xc9ced6,.4));mouse.scale.set(1,.45,1.5);mouse.position.y=.18;const ms=grp(mouse);put(g,ms,2.6,1.5,.2);
 const fl=c=>grp(box(1.9,.07,1.9,M(c,.45)),topPlane(1.4,1.0,floppyTex,.075));const f1=fl(0x1e2a44);put(g,f1,3.0,-.6,.3);put(g,cdDisc(),3.1,-2.2,.2);
 {const sp=c=>{const s=grp(box(.9,1.5,.9,M(0x2b2f36,.4),.75));const cone=new T.Mesh(new T.CircleGeometry(.32,24),M(0x111,.6));cone.position.set(0,.85,.46);s.add(cone);return s};put(g,sp(),-3.4,-1.7,.25);put(g,sp(),2.6,-1.9,-.3)}put(g,pencil(0x1f4fa8,3),-3.2,2.6,.6);
 return [[mon,0,2.6,0],[kb,0,.3,0],[ms,0,.35,0],[f1,0,.15,0]]});
/* --- HACKER: laptop con terminal, teclado mecánico RGB, lata y placa --- */
const termTex=tex(512,320,(g,w,h)=>{g.fillStyle='#030806';g.fillRect(0,0,w,h);g.font=`18px Consolas,'Courier New',monospace`;
 ['$ whoami','gabriel_solis','$ ls proyectos/','el-rack/  optimizador/  panel-admin/  taller-3d/','$ cat stack.txt','js · rust · python · java · css · html','$ ./portafolio --run','[ok] taller cargado_'].forEach((t,i)=>{g.fillStyle=t[0]==='$'?'#39ff88':'#9fe8c0';g.fillText(t,18,34+i*34)});
 g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=3)g.fillRect(0,y,w,1)});
const canTex=tex(256,128,(g,w,h)=>{g.fillStyle='#0d1a12';g.fillRect(0,0,w,h);g.fillStyle='#39ff88';g.font=`40px ${F.h}`;g.textAlign='center';g.fillText('BYTE',w/4,78);g.fillText('BYTE',w*3/4,78);g.fillRect(0,10,w,6);g.fillRect(0,h-16,w,6)});
heroOf('hacker',g=>{put(g,sheet(6.2,4.4,tex(128,128,(x,w)=>{x.fillStyle='#0b1210';x.fillRect(0,0,w,w);x.strokeStyle='rgba(57,255,136,.25)';for(let i=0;i<=w;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,w);x.moveTo(0,i);x.lineTo(w,i);x.stroke()}},[3,2]),0,.012),.4,.3,0,false);
 const lap=new T.Group(),lb=box(3.4,.14,2.3,M(0x1a1d1f,.35,.6));lap.add(lb);const lid=new T.Group();lid.position.set(0,.14,-1.13);lid.rotation.x=1.22;
 const lidB=box(3.4,.08,2.2,M(0x1a1d1f,.35,.6),.04);lidB.position.z=-1.1;lid.add(lidB);const sc=new T.Mesh(new T.PlaneGeometry(3.1,1.95),M(0xffffff,.4,0,{map:termTex,emissive:0xffffff,emissiveMap:termTex,emissiveIntensity:1}));sc.rotation.x=-Math.PI/2;sc.position.set(0,.09,-1.1);lid.add(sc);lap.add(lid);
 put(g,lap,-.9,-1.2,.1);const kb=keyboard(3.6,1.25,0x0e0f10,0x222,true);const glow=box(3.7,.04,1.35,M(0x39ff88,.4,0,{emissive:0x39ff88,emissiveIntensity:1.2}),.02);glow.userData.ns=true;kb.add(glow);put(g,kb,-.6,1.7,-.06);
 const can=new T.Group(),cb=new T.Mesh(new T.CylinderGeometry(.42,.42,1.5,28,1,true),M(0xffffff,.35,.4,{map:canTex}));cb.position.y=.75;const ct=new T.Mesh(new T.CylinderGeometry(.4,.42,.06,28),M(0xb9c0c8,.25,.95));ct.position.y=1.52;can.add(cb,ct);put(g,can,2.9,.9);
 const pcb=grp(box(2.2,.08,1.5,M(0x0f3a26,.5)),topPlane(2.2,1.5,pcbTex,.085));const led=new T.Mesh(new T.SphereGeometry(.1,12,8),M(0x39ff88,.3,0,{emissive:0x39ff88,emissiveIntensity:1.2}));led.position.set(.8,.16,.5);pcb.add(led);leds.push(led);put(g,pcb,2.6,-1.6,-.3);
 return [[lap,0,1.6,-.6],[kb,0,.3,0],[can,0,1.6,0],[pcb,0,.2,0]]});

/* --- OESTE: cartel de "Se busca", estrella de sheriff, sombrero, herradura, cactus y lazo --- */
const wantedTex=paper(512,700,'#e6cd98',(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,h*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(90,50,15,.45)');g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.fillStyle='#3b2314';g.textAlign='center';g.font=`96px ${F.w}`;g.fillText('SE BUSCA',w/2,118);g.fillRect(44,138,w-88,5);g.fillRect(44,148,w-88,2);
 g.strokeStyle='#3b2314';g.lineWidth=6;g.strokeRect(104,176,w-208,270);g.fillStyle='rgba(59,35,20,.1)';g.fillRect(107,179,w-214,264);
 g.fillStyle='#2a170c';g.beginPath();g.moveTo(196,430);g.lineTo(206,236);g.lineTo(246,318);g.lineTo(300,228);g.lineTo(316,322);g.quadraticCurveTo(372,334,404,374);g.lineTo(338,398);g.lineTo(324,430);g.closePath();g.fill();
 g.fillStyle='#e6cd98';g.beginPath();g.arc(300,338,9,0,TAU);g.fill();
 g.fillStyle='#3b2314';g.font=`52px ${F.h}`;g.fillText('GABRIEL SOLÍS',w/2,516);g.font=`24px ${F.m}`;g.fillText('POR ESCRIBIR CÓDIGO DÍA Y NOCHE',w/2,556);
 g.font=`44px ${F.w}`;g.fillStyle='#8e2a1a';g.fillText('RECOMPENSA',w/2,620);g.font=`26px ${F.m}`;g.fillStyle='#3b2314';g.fillText('UN BUEN PROYECTO',w/2,660);
 [[18,18],[w-18,18],[18,h-18],[w-18,h-18]].forEach(([x,y])=>{g.fillStyle='#5a5a5a';g.beginPath();g.arc(x,y,7,0,TAU);g.fill()})});
const bountyTex=paper(256,340,'#e6cd98',(g,w,h)=>{g.fillStyle='#3b2314';g.textAlign='center';g.font=`44px ${F.w}`;g.fillText('SE BUSCA',w/2,56);g.strokeStyle='#3b2314';g.lineWidth=4;g.strokeRect(50,80,w-100,150);g.font=`22px ${F.m}`;g.fillText('$ 500',w/2,270);g.fillText('VIVO',w/2,302)});
function starShape(r,ri=.45){const s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,q=i%2?r*ri:r,x=Math.cos(a)*q,y=Math.sin(a)*q;i?s.lineTo(x,y):s.moveTo(x,y)}s.closePath();return s}
function sheriffStar(r){const g=new T.Group(),gm=M(0xd9a441,.26,.92);g.add(new T.Mesh(ext(starShape(r),.1,.025),gm));
 for(let i=0;i<5;i++){const a=Math.PI/2+i*TAU/5,b=new T.Mesh(new T.SphereGeometry(r*.13,16,12),gm);b.position.set(Math.cos(a)*r,.08,-Math.sin(a)*r);g.add(b)}
 const c=new T.Mesh(new T.CylinderGeometry(r*.38,r*.38,.05,32),M(0xb98a2e,.32,.9));c.position.y=.15;g.add(c);
 const tx=new T.Mesh(new T.CircleGeometry(r*.34,32),M(0xffffff,.4,.6,{map:tex(128,128,(x,W)=>{x.fillStyle='#b98a2e';x.fillRect(0,0,W,W);x.fillStyle='#4a2c0c';x.font=`26px ${F.w}`;x.textAlign='center';x.textBaseline='middle';x.fillText('SHERIFF',W/2,W/2)})}));tx.rotation.x=-Math.PI/2;tx.position.y=.18;g.add(tx);return g}
function cowHat(col=0x5a3318){const g=new T.Group(),m=M(col,.8);
 const pr=[[.06,0],[1.18,0],[1.4,.08],[1.52,.26],[1.49,.3],[1.36,.17],[1.14,.07],[.06,.07]].map(([x,y])=>new T.Vector2(x,y));
 const br=new T.Mesh(new T.LatheGeometry(pr,56),M(col,.8,0,{side:T.DoubleSide}));br.scale.z=.82;
 const cr=new T.Mesh(new T.CylinderGeometry(.6,.72,.84,40),m);cr.position.y=.47;cr.scale.z=.84;
 const dn=new T.Mesh(new T.SphereGeometry(.6,40,14,0,TAU,0,Math.PI/2),m);dn.position.y=.88;dn.scale.set(1,.28,.84);
 const cs=new T.Mesh(new T.SphereGeometry(.2,20,12),M(col,.85));cs.position.y=1.02;cs.scale.set(.5,.35,2.2);
 const band=new T.Mesh(new T.CylinderGeometry(.73,.74,.15,40,1,true),M(0x2a1a10,.55,0,{side:T.DoubleSide}));band.position.y=.15;band.scale.z=.84;
 const bk=new T.Mesh(new T.TorusGeometry(.07,.025,8,16),M(0xd9a441,.3,.9));bk.position.set(0,.15,.63);g.add(br,cr,dn,cs,band,bk);return g}
function horseshoe(){const g=new T.Group(),m=M(0x6d6a66,.42,.85),h=new T.Mesh(new T.TorusGeometry(.62,.12,14,48,Math.PI*1.5),m);h.rotation.x=-Math.PI/2;h.rotation.z=Math.PI*.75;h.position.y=.1;h.scale.set(1,1.15,.7);g.add(h);
 for(let i=0;i<6;i++){const a=Math.PI*.85+i*Math.PI*.26,n=new T.Mesh(new T.CylinderGeometry(.035,.035,.05,8),M(0x2a2622,.5));n.position.set(Math.cos(a)*.62,.17,-Math.sin(a)*.71);g.add(n)}return g}
function cactus(h=1.5){const g=new T.Group(),gm=M(0x557f3c,.72),pot=new T.Mesh(new T.CylinderGeometry(.52,.4,.62,32),M(0xb5562a,.78));pot.position.y=.31;
 const rim=new T.Mesh(new T.TorusGeometry(.52,.07,10,32),M(0xa44a22,.78));rim.rotation.x=Math.PI/2;rim.position.y=.62;const soil=new T.Mesh(new T.CircleGeometry(.48,28),M(0x4a2e1a,.95));soil.rotation.x=-Math.PI/2;soil.position.y=.6;g.add(pot,rim,soil);
 const stem=(r,len)=>{const s=new T.Group(),c=new T.Mesh(new T.CylinderGeometry(r,r*1.04,len,16),gm),tp=new T.Mesh(new T.SphereGeometry(r,16,10,0,TAU,0,Math.PI/2),gm);c.position.y=len/2;tp.position.y=len;s.add(c,tp);return s};
 const b=stem(.27,h);b.position.y=.6;g.add(b);
 [[-1,.55,.55],[1,.85,.45]].forEach(([s,y,len])=>{const a=new T.Group(),hz=new T.Mesh(new T.CylinderGeometry(.13,.13,.36,12),gm);hz.rotation.z=Math.PI/2;hz.position.x=s*.18;const up=stem(.14,len);up.position.set(s*.36,0,0);a.add(hz,up);a.position.y=.6+y;g.add(a)});
 const fl=new T.Mesh(new T.SphereGeometry(.09,12,8),M(0xe94a7a,.5));fl.position.y=.6+h+.24;fl.scale.y=.6;g.add(fl);return g}
function lasso(){const g=new T.Group(),m=M(0xc9a36a,.9);for(let i=0;i<4;i++){const r=new T.Mesh(new T.TorusGeometry(.62-i*.04,.045,8,40),m);r.rotation.x=Math.PI/2+rnd(-.08,.08);r.position.y=.05+i*.07;g.add(r)}
 const tl=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(.6,.08,0),new T.Vector3(1.1,.05,.4),new T.Vector3(1.4,.05,1.0)]),24,.045,6),m);g.add(tl);return g}
const cowhideTex=tex(256,256,(g,w)=>{g.fillStyle='#f1ebe0';g.fillRect(0,0,w,w);g.fillStyle='#3a2416';for(let i=0;i<9;i++){g.beginPath();const x=rnd(0,w),y=rnd(0,w),r=rnd(20,50);for(let k=0;k<12;k++){const a=k/12*TAU,q=r*(.6+Math.random()*.5);k?g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):g.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.fill()}noise(g,w,w,3000,.06)});
heroOf('oeste',g=>{put(g,sheet(6.4,4.8,cowhideTex,0,.012),.5,.2,.05,false);
 const pst=put(g,sheet(3.3,4.5,wantedTex,.05,.03),-.9,-.2,.06);
 const hat=put(g,cowHat(),2.1,.9,-.5);const star=put(g,sheriffStar(.72),.6,2.7,.25);
 const cac=put(g,cactus(1.5),3.4,-2.1);put(g,horseshoe(),-3.0,2.6,.4);put(g,lasso(),-3.3,-2.4,.2);
 return [[pst,0,.2,-1.3],[star,0,.35,0],[hat,0,1.2,0],[cac,0,2.3,0]]});

/* --- mesas de cada mundo --- */
const DESKS={kraft:deskTex,
 cine:tex(512,512,(g,w,h)=>{g.fillStyle='#4a0c12';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){const o=(y/64)%2?32:0;g.strokeStyle='rgba(230,180,80,.16)';g.lineWidth=2;g.beginPath();g.moveTo(x+o+32,y);g.lineTo(x+o+64,y+32);g.lineTo(x+o+32,y+64);g.lineTo(x+o,y+32);g.closePath();g.stroke();g.fillStyle='rgba(230,180,80,.12)';g.beginPath();g.arc(x+o+32,y+32,4,0,TAU);g.fill()}noise(g,w,h,14000,.08)},[18,12]),
 pc:tex(512,512,(g,w,h)=>{g.fillStyle='#d8d5cd';g.fillRect(0,0,w,h);noise(g,w,h,30000,.07);g.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<900;i++)g.fillRect(Math.random()*w,Math.random()*h,2,1)},[18,12]),
 hacker:tex(512,512,(g,w,h)=>{g.fillStyle='#070b0a';g.fillRect(0,0,w,h);g.strokeStyle='rgba(57,255,136,.07)';g.lineWidth=1;for(let i=0;i<=w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.moveTo(0,i);g.lineTo(w,i);g.stroke()}noise(g,w,h,9000,.05)},[18,12]),
 oeste:tex(512,512,(g,w,h)=>{const cs=['#8a5530','#7b4a28','#94603a','#80502c'];for(let i=0;i<8;i++){g.fillStyle=cs[i%4];g.fillRect(0,i*64,w,64);for(let k=0;k<34;k++){g.strokeStyle=`rgba(45,22,8,${.08+Math.random()*.14})`;g.lineWidth=1+Math.random()*1.4;const y=i*64+Math.random()*64;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd(-6,6),w*.65,y+rnd(-6,6),w,y+rnd(-4,4));g.stroke()}
  g.fillStyle='rgba(25,12,4,.6)';g.fillRect(0,i*64,w,3);g.fillStyle='rgba(255,220,170,.08)';g.fillRect(0,i*64+3,w,2);[(i*97)%w*.4+20,(i*61)%w*.4+w*.55].forEach(x=>{g.fillStyle='#2a1a10';g.beginPath();g.arc(x,i*64+32,4,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(x-1,i*64+31,1.5,0,TAU);g.fill()})}noise(g,w,h,16000,.07)},[10,10])};
const RIMU={uRimC:{value:new T.Color(0xffd9a8)},uRimK:{value:.28}},RIMK={kraft:.26,cine:.38,pc:.2,hacker:.55,oeste:.36};
const RIM={kraft:[0xffd9a8,.3],cine:[0xff6a4a,.5],pc:[0xbfd8ff,.38],hacker:[0x39ff88,.6],oeste:[0xffa04a,.55]};
const LOOK={kraft:{lamp:0xfff2e2,dust:0xffd9a0},cine:{lamp:0xfff1dc,li:4.4,hemi:.26,sky:0xffd9a8,gnd:0x2a0508,dust:0xffcf6a},pc:{lamp:0xffffff,li:1.8,hemi:.56,sky:0xffffff,gnd:0x8a8a80,dust:0xffffff},hacker:{lamp:0xe6fff0,li:3.6,hemi:.22,sky:0x99ffcc,gnd:0x001a0d,dust:0x39ff88},oeste:{lamp:0xfff0d8,li:2.2,hemi:.34,sky:0xffc890,gnd:0x3a1c0a,dust:0xffc080}};
let worldName='';
function worldFromBody(){const m=(document.body.className.match(/theme-(\w+)/)||[])[1];return HEROES[m]?m:'kraft'}


/* --- 01 · Proyectos: cada tarjeta tiene su objeto --- */
const PR=cluster(13,-5);
const phone=put(PR,grp(box(1.7,.16,3.3,dark),topPlane(1.5,3.05,shopTex,.165,true)),0,0,-.25);phone.userData.key='rack';
put(PR,sheet(1.35,2.5,receiptTex,.05),2.1,.6,.3);
shot('#projects',phone,{az:.5,el:.95,d:6.2});
const PO=cluster(20,2);
const chip=grp(box(1.6,.2,1.6,dark),topPlane(1.2,1.2,tex(128,128,(g,w)=>{g.fillStyle='#24211d';g.fillRect(0,0,w,w);g.fillStyle='#d9cfa8';g.font=`20px ${F.m}`;g.textAlign='center';g.fillText('RUST',w/2,54);g.fillText('OPT v0.3',w/2,84)}),.205));
for(let i=0;i<7;i++)[[-.86,1],[.86,1],[-.86,0],[.86,0]].forEach(([o,ax])=>{const p=box(ax?.18:.08,.05,ax?.08:.18,brass,.06);p.position[ax?'x':'z']=o;p.position[ax?'z':'x']=-.6+i*.2;chip.add(p)});
put(PO,chip,0,0,.35).userData.key='opt';put(PO,nut(.3),1.6,.9,.5);put(PO,gear(.7,10),-1.5,-.6);
shot('#projects .pc.opt',chip,{az:-.45,el:.9,d:5.4});
/* agenda de citas: un calendario de mesa de hojas arrancables y un celular con el chat del bot */
const PG=cluster(23,-11);
const calTex=tex(256,300,(g,w,h)=>{g.fillStyle='#fbf7ee';g.fillRect(0,0,w,h);g.fillStyle='#b3261e';g.fillRect(0,0,w,70);g.fillStyle='#fff';g.font=`700 34px ${F.d}`;g.textAlign='center';g.fillText('JUEVES',w/2,48);
 g.fillStyle='#1d1a17';g.font=`700 130px ${F.h}`;g.fillText('12',w/2,200);g.font=`24px ${F.m}`;g.fillStyle='#0f766e';g.fillText('10:30 · CITA',w/2,250);g.fillStyle='#8a8170';g.font=`18px ${F.m}`;g.fillText('NOVIEMBRE',w/2,282)});
const waTex=tex(256,480,(g,w,h)=>{g.fillStyle='#efeae2';g.fillRect(0,0,w,h);g.fillStyle='#0f766e';g.fillRect(0,0,w,64);g.fillStyle='#5eead4';g.beginPath();g.arc(34,32,18,0,TAU);g.fill();g.fillStyle='#fff';g.font=`600 20px ${F.d}`;g.fillText('Mi Negocio',62,30);g.font=`14px ${F.d}`;g.fillStyle='#ccfbf1';g.fillText('bot de citas',62,50);
 const bub=(x,y,bw,bh,c)=>{g.fillStyle=c;g.beginPath();g.roundRect?g.roundRect(x,y,bw,bh,10):g.rect(x,y,bw,bh);g.fill()};
 bub(150,84,90,34,'#d9fdd3');bub(14,130,200,96,'#fff');bub(190,238,50,34,'#d9fdd3');bub(14,284,190,70,'#fff');bub(14,366,210,62,'#fff');
 g.fillStyle='#111b21';g.font=`16px ${F.d}`;g.fillText('Hola',166,107);['1. Agendar cita','2. Ver mis citas','3. Cancelar'].forEach((x,i)=>g.fillText(x,26,160+i*24));g.fillText('1',210,261);g.fillText('9:00 · 10:30',26,312);g.fillText('3:00 p. m.',26,336);
 g.fillStyle='#0f766e';g.font=`700 17px ${F.d}`;g.fillText('✓ ¡Cita agendada!',26,394);g.fillStyle='#1a56c4';g.font=`14px ${F.d}`;g.fillText('Google Calendar',26,416)});
const calBlk=new T.Group();
{const base=box(1.9,.5,1.5,M(0x2a2622,.5,.2));calBlk.add(base);
 const pad=new T.Group();pad.position.set(0,.5,-.05);pad.rotation.x=-.42;const pg=box(1.7,1.95,.14,M(0xfbf7ee,.8),.98);pad.add(pg);
 const face=new T.Mesh(new T.PlaneGeometry(1.6,1.85),M(0xffffff,.8,0,{map:calTex}));face.position.set(0,.98,.075);pad.add(face);
 [-.5,0,.5].forEach(x=>{const r=new T.Mesh(new T.TorusGeometry(.08,.022,8,16),brass);r.position.set(x,1.95,0);r.rotation.y=Math.PI/2;pad.add(r)});calBlk.add(pad)}
put(PG,calBlk,0,0,.3).userData.key='agenda';
const waPh=grp(box(1.15,.12,2.2,dark),topPlane(1.0,1.95,waTex,.125,true));put(PG,waPh,2.1,.7,-.35);
put(PG,pencil(0xb3261e,2.2),-1.8,1.1,.9);
shot('#projects .pc.agd',calBlk,{az:.4,el:.78,d:6.2,fy:.7});
/* Triki Radar: una pantalla de radar con su barrido y las bases de una licitación bajo la lupa */
const PRD=cluster(15,9);
const scopeTex=tex(256,256,(g,w)=>{g.fillStyle='#04160d';g.fillRect(0,0,w,w);g.strokeStyle='rgba(80,255,160,.45)';g.lineWidth=2;[38,76,114].forEach(r=>{g.beginPath();g.arc(w/2,w/2,r,0,TAU);g.stroke()});
 g.strokeStyle='rgba(80,255,160,.25)';g.beginPath();g.moveTo(w/2,6);g.lineTo(w/2,w-6);g.moveTo(6,w/2);g.lineTo(w-6,w/2);g.stroke();
 [[172,88,6],[98,150,5],[152,188,4],[78,72,4],[190,150,3]].forEach(([x,y,r])=>{g.fillStyle='rgba(157,255,200,.35)';g.beginPath();g.arc(x,y,r*2.4,0,TAU);g.fill();g.fillStyle='#b8ffd8';g.beginPath();g.arc(x,y,r,0,TAU);g.fill()})});
const basesTex=paper(300,420,'#fbfaf6',(g,w,h)=>{g.fillStyle='#2b2b2b';g.font=`22px ${F.m}`;g.fillText('BASES DE LICITACIÓN',24,44);g.font=`15px ${F.m}`;g.fillStyle='#666';g.fillText('NOG 3261···· · pág. 4',24,70);
 for(let i=0;i<13;i++){const y=100+i*22,ww=rnd(160,250);if(i===3||i===7||i===10){g.fillStyle='rgba(232,97,58,.28)';g.fillRect(20,y-12,ww+8,18)}g.fillStyle='#bdbab2';g.fillRect(24,y-6,ww,6)}
 g.fillStyle='#1f6b3c';g.font=`700 18px ${F.d}`;g.fillText('✓ Leído por la IA',24,h-28)});
const radar=new T.Group();
{radar.add(box(2.6,.5,2.6,M(0x2a2622,.5,.3)));const bz=new T.Mesh(new T.CylinderGeometry(1.15,1.2,.16,48),M(0xb9bec4,.3,.85));bz.position.y=.58;radar.add(bz);
 const sc=new T.Mesh(new T.CircleGeometry(1.02,48),M(0xffffff,.4,0,{map:scopeTex,emissive:0xffffff,emissiveMap:scopeTex,emissiveIntensity:.9}));sc.rotation.x=-Math.PI/2;sc.position.y=.665;sc.userData.ns=true;radar.add(sc);
 const sw=new T.Group();sw.position.y=.672;const wd=new T.Mesh(new T.CircleGeometry(1.0,32,0,.75),new T.MeshBasicMaterial({color:0x5dffa8,transparent:true,opacity:.32,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));wd.rotation.x=-Math.PI/2;wd.userData.ns=true;sw.add(wd);radar.add(sw);radar.userData.spin=sw;
 [-.7,.7].forEach(x=>{const k=new T.Mesh(new T.CylinderGeometry(.13,.14,.12,20),M(0x111,.4));k.rotation.x=Math.PI/2;k.position.set(x,.28,1.32);radar.add(k)});
 const led=new T.Mesh(new T.SphereGeometry(.06,10,8),M(0xe8613a,.3,0,{emissive:0xe8613a,emissiveIntensity:1.4}));led.position.set(0,.3,1.31);led.userData.ns=true;radar.add(led);leds.push(led)}
put(PRD,radar,0,0,.2).userData.key='radar';spinners.push([radar,1.4]);
put(PRD,sheet(1.9,2.6,basesTex,.06,.03),2.4,.5,-.3);
{const lp=new T.Group(),rm=new T.Mesh(new T.TorusGeometry(.42,.06,12,32),M(0x2a2622,.4,.4));rm.rotation.x=Math.PI/2;rm.position.y=.12;const gl=new T.Mesh(new T.CircleGeometry(.4,28),M(0xdff4ff,.05,0,{transparent:true,opacity:.25}));gl.rotation.x=-Math.PI/2;gl.position.y=.12;gl.userData.ns=true;
 const hd=new T.Mesh(new T.CylinderGeometry(.07,.08,.8,12),M(0x6b4224,.6));hd.rotation.z=Math.PI/2;hd.position.set(.82,.1,0);lp.add(rm,gl,hd);put(PRD,lp,2.3,.1,.6)}
shot('#projects .pc.rad',radar,{az:-.4,el:.85,d:6.2,fy:.5});
const PA=cluster(27,-4);
const adminTex=tex(512,320,(g,w,h)=>{g.fillStyle='#f6f5f2';g.fillRect(0,0,w,h);g.fillStyle='#1d1a17';g.fillRect(0,0,120,h);g.fillStyle='#d9cfa8';g.font=`20px ${F.m}`;['Productos','Fotos','Marcas','Pedidos'].forEach((t,i)=>g.fillText(t,14,48+i*40));
 g.fillStyle='#111';g.font=`700 24px ${F.d}`;g.fillText('Panel de administración',140,40);
 for(let r=0;r<5;r++){g.fillStyle=r%2?'#ecebe7':'#fff';g.fillRect(140,64+r*46,w-160,42);g.fillStyle='#bbb';g.fillRect(150,72+r*46,26,26);g.fillStyle='#333';g.font=`17px ${F.d}`;g.fillText(['Nautica · XL','Polo · M','Nike · L','Puma · S','Adidas · M'][r],188,92+r*46);g.fillStyle='#25a35a';g.fillText('Q '+[85,90,95,80,88][r],w-90,92+r*46)}});
const laptop=new T.Group(),lb=box(3.2,.14,2.2,M(0xb9bec4,.32,.6));laptop.add(lb);
const lid=new T.Group();lid.position.set(0,.14,-1.08);lid.rotation.x=1.22;const lidB=box(3.2,.08,2.1,M(0xb9bec4,.32,.6),.04);lidB.position.z=-1.05;lid.add(lidB);
const scr=new T.Mesh(new T.PlaneGeometry(2.9,1.8),M(0xffffff,.4,0,{map:adminTex,emissive:0xffffff,emissiveMap:adminTex,emissiveIntensity:.8}));scr.rotation.x=-Math.PI/2;scr.position.set(0,.09,-1.05);lid.add(scr);laptop.add(lid);
put(PA,laptop,0,0,.25).userData.key='admin';
shot('#projects .pj .card:first-child',laptop,{az:.35,el:.62,d:6.8,fy:.8});
const PB=cluster(34,3);
const mini=new T.Group(),blk=M(0x2a2622,.4,.3);
{const base=new T.Mesh(new T.CylinderGeometry(.75,.85,.18,32),blk);base.position.y=.09;mini.add(base);
 const a1=new T.Mesh(new T.CylinderGeometry(.06,.06,1.9,12),brass);a1.position.set(.25,1.0,0);a1.rotation.z=-.3;mini.add(a1);
 const a2=new T.Mesh(new T.CylinderGeometry(.06,.06,1.6,12),brass);a2.position.set(.15,2.35,0);a2.rotation.z=1.05;mini.add(a2);
 const head=new T.Group();head.position.set(-.55,2.55,0);head.rotation.z=.5;
 const shade=new T.Mesh(new T.ConeGeometry(.55,.75,32,1,true),M(0x9c4a1a,.45,.2,{side:T.DoubleSide}));shade.position.y=-.2;head.add(shade);
 const bulb=new T.Mesh(new T.SphereGeometry(.2,16,12),M(0xfff1cf,.2,0,{emissive:0xffd79a,emissiveIntensity:1.4}));bulb.position.y=-.42;bulb.userData.ns=true;head.add(bulb);mini.add(head)}
put(PB,mini,0,0,.4).userData.key='site';put(PB,sheet(2.4,1.7,gacetaTex,.06,.03),1.6,1.2,-.3);
shot('#projects .pj .card:last-child',mini,{az:-.35,el:.55,d:6.6,fy:1.2});

/* --- 02 · Servicios: notas adhesivas --- */
const SV=cluster(42,-3);
[['#f7e27a','Web','landing'],['#f6a5b8','WhatsApp','pedidos'],['#a8e0c2','Panel','admin']].forEach(([c,t,u],i)=>put(SV,sheet(1.9,1.9,sticky(c,t,u),.04),-1.9+i*1.9,(i%2)*.8-.4,rnd(-.25,.25)));
put(SV,pencil(0x3f6f8f,3.4),.2,1.9,-.15);
shot('#servicios',SV,{az:.25,el:1.0,d:7.4,fy:0});
/* --- 03 · Sobre mí: café y lápiz --- */
const AB=cluster(50,3);
put(AB,mug(),0,0);put(AB,pencil(0x3f6f8f,3.4),-2.3,.8,-.5);put(AB,sheet(2.2,2.9,gacetaTex,.08,.03),1.9,-.5,-.3);
shot('#about',AB,{az:-.4,el:.75,d:6.4,fy:.7});
/* --- 04 · Stack: teclas --- */
const SK=cluster(58,-3);
['JS','RS','PY','JV','</>','CSS'].forEach((t,i)=>{const k=grp(box(.95,.42,.95,M(0xe8e1d2,.5)));k.add(topPlane(.8,.8,keyTex(t),.425));put(SK,k,-1.4+(i%3)*1.35,-.7+(i/3|0)*1.4+(i%2)*.2,rnd(-.3,.3))});
shot('#skills',SK,{az:.35,el:.85,d:6.6,fy:.2});
/* --- 05 · Trayectoria: llave y tuercas --- */
const EX=cluster(66,3);
put(EX,wrench(),0,0,.5);put(EX,nut(),-2.1,1,.2);put(EX,nut(.3),2.3,1.1,.9);put(EX,gear(1.1,12),1.6,-1.4);
shot('#experiencia',EX,{az:-.3,el:.9,d:7.2,fy:0});
/* --- 06 · Formación: libreta USAC, certificado y sello de cera --- */
const FO=cluster(74,-3);
put(FO,grp(box(3.0,.22,3.9,M(0x1f3a5f,.6)),topPlane(3.0,3.9,noteTex,.225)),-1.2,0,-.12);
put(FO,sheet(3.8,2.75,certTex,.06),2.3,.6,.18);const seal=grp(new T.Mesh(new T.CylinderGeometry(.42,.45,.12,28),M(0x9e1b1b,.38)));seal.children[0].position.y=.08;put(FO,seal,3.4,1.4);
shot('#formacion',FO,{az:.3,el:.95,d:8,fy:0});
/* --- 07 · Orden de trabajo: sello de goma --- */
const OR=cluster(82,3);
{const st=new T.Group(),wood=M(0x8a5a2b,.55),ink=M(0x9e1b1b,.5);const knob=new T.Mesh(new T.SphereGeometry(.42,24,16),wood),neck=new T.Mesh(new T.CylinderGeometry(.16,.22,.75,18),wood);
 neck.position.y=.9;knob.position.y=1.48;knob.scale.y=.85;st.add(box(1.5,.32,1.0,wood,.36),box(1.4,.12,.9,ink,.08),neck,knob);put(OR,st,.6,-.3,.4)}
put(OR,grp(box(2.0,.16,1.3,dark),topPlane(1.8,1.1,tex(64,64,(g,w)=>{g.fillStyle='#6e1712';g.fillRect(0,0,w,w);noise(g,w,w,600,.2)}),.165)),1.9,-1.7,-.2);
put(OR,sheet(1.35,2.5,receiptTex,.05),2.7,1.1,-.2);
shot('#orden',OR,{az:-.35,el:.8,d:6.6,fy:.5});
/* --- ★ Extras: GS-OS (monitor), Galería (disquete), Estado (placa) --- */
const XO=cluster(92,-3);
const cardTex=tex(512,292,(g,w,h)=>{g.fillStyle='#efe4cc';g.fillRect(0,0,w,h);noise(g,w,h,4000,.05);g.fillStyle='#2a1c0f';g.font=`44px ${F.h}`;g.fillText('Gabriel Solís',34,150);
 g.font=`20px ${F.d}`;g.fillStyle='#5a4530';g.fillText('Desarrollador web · USAC',36,188);g.strokeStyle='#9c4a1a';g.lineWidth=5;g.beginPath();g.arc(w-70,64,38,0,TAU);g.stroke();g.fillStyle='#9c4a1a';g.font=`28px ${F.h}`;g.textAlign='center';g.fillText('GS',w-70,74)});
{const st=grp(box(3.0,.2,1.72,M(0xe9ddc3,.85),.1),topPlane(3.0,1.72,cardTex,.205));put(XO,st,0,0,.1)}
put(XO,sheet(3.0,1.72,cardTex,.02,.03),2.6,1.6,-.5);
shot('#tarjeta',XO,{az:.25,el:.95,d:6.4,fy:0});
const XS=cluster(100,-3);
{const b=grp(box(3.2,.1,2.2,M(0x1d5a3a,.5)),topPlane(3.2,2.2,pcbTex,.105));[[-.7,.1],[.6,-.4]].forEach(([x,z])=>{const c=box(.7,.14,.5,dark,.17);c.position.x=x;c.position.z=z;b.add(c)});
 const led=new T.Mesh(new T.SphereGeometry(.13,16,12),M(0xff3b2f,.3,0,{emissive:0xff2a1a,emissiveIntensity:1}));led.position.set(1.2,.2,.6);b.add(led);leds.push(led);put(XS,b,0,0,-.15)}
shot('#status',XS,{az:.3,el:.9,d:6,fy:0});
/* --- Contacto: el sobre --- */
const CT=cluster(108,3);
put(CT,sheet(3.6,2.4,envTex,.03),0,0,-.12);put(CT,pencil(),-.6,1.7,.4);
shot('#contact',CT,{az:-.2,el:1.0,d:6.4,fy:0});
/* --- Final: la cámara se aleja y se ve todo el taller --- */
shot('#final',null,{f:new T.Vector3(48,0,0),az:-1.05,el:.66,d:96,fy:0,cen:1});

/* ---------- cada mundo viste los capítulos: utilería propia y materiales recoloreados ---------- */
const CHAP=[PR,PO,PA,PB,SV,AB,SK,EX,FO,OR,XO,XS,CT];CHAP.forEach(c=>{c.userData.base=[...c.children]});
const PROPS={
 cine:[()=>{const s=new T.Group(),b=new T.Mesh(new T.CylinderGeometry(.45,.55,1.1,24),M(0x151515,.4,.5));b.rotation.x=1.2;b.position.y=.5;const l=new T.Mesh(new T.CircleGeometry(.42,24),M(0xffe3a0,.2,0,{emissive:0xffd27a,emissiveIntensity:1.4}));l.position.set(0,.98,.48);l.rotation.x=-.37;l.userData.ns=true;s.add(b,l,box(.9,.12,.9,M(0x151515,.4,.5),.06));return s},
  ()=>{const r=new T.Group(),sh=new T.Shape();sh.absarc(0,0,.85,0,TAU,false);for(let i=0;i<5;i++){const a=i/5*TAU,p=new T.Path();p.absarc(Math.cos(a)*.48,Math.sin(a)*.48,.2,0,TAU,true);sh.holes.push(p)}r.add(new T.Mesh(ext(sh,.05),M(0xd4a84a,.3,.85)));return r},
  ()=>sheet(2.1,.95,ticketTex,.05,.03)],
 pc:[()=>cdDisc(),()=>grp(box(1.9,.07,1.9,M(0x2a4f9a,.45)),topPlane(1.4,1.0,floppyTex,.075)),
  ()=>{const m=new T.Mesh(new T.SphereGeometry(.38,20,14),M(0xc9ced6,.4));m.scale.set(1,.45,1.5);m.position.y=.16;return grp(m)}],
 hacker:[()=>{const c=new T.Group(),b=new T.Mesh(new T.CylinderGeometry(.36,.36,1.3,24,1,true),M(0xffffff,.35,.4,{map:canTex}));b.position.y=.65;const tp=new T.Mesh(new T.CylinderGeometry(.34,.36,.05,24),M(0xb9c0c8,.25,.95));tp.position.y=1.32;c.add(b,tp);return c},
  ()=>{const u=grp(box(1.1,.16,.42,M(0x101412,.4)),box(.38,.12,.3,M(0xb9c0c8,.25,.95),.06));u.children[1].position.x=.72;const l=new T.Mesh(new T.SphereGeometry(.05,8,6),M(0x39ff88,.3,0,{emissive:0x39ff88,emissiveIntensity:1.4}));l.position.set(-.35,.17,0);u.add(l);return u},
  ()=>{const pts=[];for(let i=0;i<6;i++)pts.push(new T.Vector3(-2.2+i*.9,.06,Math.sin(i*1.3)*.9));const tb=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),48,.05,6,false),M(0x39ff88,.4,0,{emissive:0x39ff88,emissiveIntensity:.9}));tb.userData.ns=true;return grp(tb)}]};
PROPS.oeste=[()=>horseshoe(),()=>{const c=cactus(.9);c.scale.setScalar(.8);return c},()=>sheet(1.3,1.75,bountyTex,.05,.03),()=>lasso()];
const DECO={cine:[],pc:[],hacker:[],oeste:[]};
CHAP.forEach((cl,ci)=>Object.keys(DECO).forEach(w=>{const g=new T.Group();g.visible=false;cl.add(g);DECO[w].push(g);
 [[-2.9,2.4],[3.1,-2.3]].forEach(([x,z],k)=>{const o=PROPS[w][(ci+k)%PROPS[w].length]();o.traverse(m=>{if(m.isMesh){m.castShadow=!m.userData.ns;m.receiveShadow=true;m.userData.deco=1}});o.position.set(x,0,z);o.rotation.y=rnd(-.6,.6);g.add(o)})}));
/* ---------- cada mundo tiene sus propios objetos en cada capítulo ---------- */
const lbl=(t,bg,fg,font,w=256,h=128)=>tex(w,h,(g,W,Hh)=>{g.fillStyle=bg;g.fillRect(0,0,W,Hh);g.fillStyle=fg;g.font=font||`40px ${F.h}`;g.textAlign='center';g.textBaseline='middle';
 const ls=t.split('\n'),lh=parseInt(g.font.match(/(\d+)px/)[1])*1.2;ls.forEach((l,i)=>g.fillText(l,W/2,Hh/2+(i-(ls.length-1)/2)*lh))});
const glowM=(c,i=1.2)=>M(c,.3,0,{emissive:c,emissiveIntensity:i});
const scrM=tx=>M(0xffffff,.35,0,{map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.9});
const cyl=(rt,rb,h,mat,y=h/2,seg=24)=>{const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg),mat);m.position.y=y;return m};
const disc=(r,tx,y)=>{const m=new T.Mesh(new T.CircleGeometry(r,32),M(0xffffff,.5,0,{map:tx}));m.rotation.x=-Math.PI/2;m.position.y=y;return m};
function easel(w,h,tx,col,lift=.9){const g=new T.Group(),fr=box(w+.2,h+.2,.12,M(col,.45,.3),0);fr.position.y=h/2+lift;const sc=new T.Mesh(new T.PlaneGeometry(w,h),scrM(tx));sc.position.set(0,h/2+lift,.07);g.add(fr,sc);
 [-1,1].forEach(s=>{const l=cyl(.05,.05,lift+.1,M(col,.45,.3));l.position.x=s*w*.38;g.add(l)});return g}
function keypad(w,d,y,col){const im=new T.InstancedMesh(rbox(.15,.05,.11),M(col,.5),12),o3=new T.Object3D();for(let i=0;i<12;i++){o3.position.set(-w/2+.2+(i%3)*(w-.4)/2,y,-d/2+.2+(i/3|0)*(d-.4)/3);o3.updateMatrix();im.setMatrixAt(i,o3.matrix)}return im}
function fan(r){const f=new T.Group(),bl=new T.Group();for(let i=0;i<7;i++){const b=box(r*.9,.02,.16,M(0x1c1f1e,.4),0);b.position.x=r*.45;const p=new T.Group();p.rotation.y=i/7*TAU;b.rotation.x=.4;p.add(b);bl.add(p)}
 bl.position.y=.37;f.add(cyl(r,r,.04,M(0x101211,.5),.35,28),bl);f.userData.spin=bl;return f}
function seat(){const s=new T.Group(),red=M(0x8e1520,.7);s.add(box(1.2,.5,1.1,M(0x1a1a1a,.5),.25),box(1.1,.25,1.0,red,.62));const bk=box(1.1,1.3,.22,red,0);bk.position.set(0,1.25,-.5);bk.rotation.x=-.15;s.add(bk);
 [-.62,.62].forEach(x=>{const a=box(.14,.5,1.0,M(0x1a1a1a,.5),.85);a.position.x=x;s.add(a)});return s}
const cardFront=tex(512,292,(g,w,h)=>{g.fillStyle='#0b1210';g.fillRect(0,0,w,h);g.strokeStyle='#39ff88';g.lineWidth=3;g.strokeRect(14,14,w-28,h-28);g.fillStyle='#39ff88';g.font='700 26px Consolas,monospace';
 g.fillText('ACCESO · NIVEL 7',34,64);g.font='44px '+F.h;g.fillStyle='#c8ffe0';g.fillText('Gabriel Solís',34,150);g.font='22px Consolas,monospace';g.fillStyle='#7fd4a6';g.fillText('dev@trikis.nl',34,196);
 g.fillStyle='#c9973f';g.fillRect(w-120,h-110,74,58);g.strokeStyle='#5a4214';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(w-120,h-96+i*12);g.lineTo(w-46,h-96+i*12);g.stroke()}});
const VAR={kraft:{},cine:{},pc:{},hacker:{},oeste:{}};   /* VAR[mundo] = Map(cluster -> grupo) ; VMAIN[mundo] = Map(cluster -> objeto principal) */
/* Oeste: solo los capítulos con objeto propio; los demás usan los del taller (madera y latón encajan) */
const wood=M(0x6b4224,.82),woodL=M(0x8a5a32,.8);
const signTex=(a,b,c)=>paper(320,190,'#e6cd98',(x,w,h)=>{x.fillStyle='#3b2314';x.textAlign='center';x.font=`40px ${F.w}`;x.fillText(a,w/2,60);x.font=`21px ${F.m}`;x.fillText(b,w/2,100);x.font=`50px ${F.h}`;x.fillStyle='#8e2a1a';x.fillText(c,w/2,162)});
const OESTE_B={
 PR:g=>{const s=new T.Group();[-1.15,1.15].forEach(x=>{const p=box(.16,2.7,.16,wood,1.35);p.position.x=x;s.add(p)});s.add(box(2.7,1.65,.12,woodL,1.85));
  const f=new T.Mesh(new T.PlaneGeometry(2.45,1.42),M(0xffffff,.85,0,{map:signTex('EL RACK','PLAYERAS · S A XL','Q 85')}));f.position.set(0,1.85,.065);s.add(f);put(g,s,0,0,-.15);
  put(g,sheet(1.3,1.75,bountyTex,.05,.03),2.3,1.0,.3);return s},
 PO:g=>{const w=new T.Group(),gd=M(0xd9a441,.24,.92);w.add(cyl(1.0,1.0,.24,gd,.12,48));
  const face=new T.Mesh(new T.CircleGeometry(.88,48),M(0xffffff,.5,0,{map:tex(256,256,(x,W)=>{x.fillStyle='#f4ecd8';x.fillRect(0,0,W,W);x.fillStyle='#2a1c0f';x.textAlign='center';x.textBaseline='middle';x.font=`26px ${F.h}`;
   ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach((n,i)=>{const a=i/12*TAU-Math.PI/2;x.fillText(n,W/2+Math.cos(a)*96,W/2+Math.sin(a)*96)});x.font=`18px ${F.m}`;x.fillText('OPTIMIZADOR',W/2,W*.68);
   x.strokeStyle='#2a1c0f';x.lineWidth=5;x.beginPath();x.moveTo(W/2,W/2);x.lineTo(W/2+40,W/2-50);x.stroke();x.lineWidth=3;x.beginPath();x.moveTo(W/2,W/2);x.lineTo(W/2-10,W/2-80);x.stroke()})}));
  face.rotation.x=-Math.PI/2;face.position.y=.245;w.add(face);const gl=new T.Mesh(new T.SphereGeometry(.9,32,10,0,TAU,0,.35),M(0xffffff,.05,0,{transparent:true,opacity:.18}));gl.position.y=-.32;gl.userData.ns=true;w.add(gl);
  const cr=cyl(.12,.12,.24,gd,0,16);cr.rotation.x=Math.PI/2;cr.position.set(0,.12,-1.1);w.add(cr);const rg=new T.Mesh(new T.TorusGeometry(.2,.035,8,20),gd);rg.position.set(0,.12,-1.34);w.add(rg);
  const ch=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.05,-1.5),new T.Vector3(-.8,.04,-2.0),new T.Vector3(-1.6,.04,-1.4),new T.Vector3(-2.0,.04,-.4)]),60,.03,6),gd);g.add(ch);put(g,w,0,0,.3);return w},
 SV:g=>{const p=new T.Group();p.add(box(.2,3.4,.2,wood,1.7));[['WEB',.35,2.9],['WHATSAPP',-.4,2.2],['PANEL',.25,1.5]].forEach(([t,r,y])=>{const a=new T.Group(),bd=box(2.0,.42,.1,woodL,0);a.add(bd);
   const tip=new T.Mesh(new T.CylinderGeometry(.3,.3,.1,3),woodL);tip.rotation.x=Math.PI/2;tip.rotation.y=Math.PI/2;tip.position.x=1.1;a.add(tip);const tx=new T.Mesh(new T.PlaneGeometry(1.8,.36),M(0xffffff,.8,0,{map:lbl(t,'#8a5a32','#f4e4c1',`44px ${F.w}`,384,80)}));tx.position.z=.055;a.add(tx);a.position.set(.5,y,0);a.rotation.y=r;p.add(a)});
  put(g,p,0,0,0);return p},
 AB:g=>{const en=M(0x2f5f8a,.35,.1),sp=new T.Group();const pts=[[0,0],[.58,0],[.62,.08],[.62,1.15],[.56,1.15],[.56,.1],[0,.1]].map(([x,y])=>new T.Vector2(x,y));sp.add(new T.Mesh(new T.LatheGeometry(pts,32),M(0x2f5f8a,.35,.1,{side:T.DoubleSide})));
  const rim=new T.Mesh(new T.TorusGeometry(.59,.03,8,32),M(0xe9e4da,.3));rim.rotation.x=Math.PI/2;rim.position.y=1.15;const hd=new T.Mesh(new T.TorusGeometry(.3,.06,10,20,Math.PI),en);hd.position.set(.62,.6,0);hd.rotation.z=-Math.PI/2;sp.add(rim,hd);
  const cof=new T.Mesh(new T.CircleGeometry(.55,28),M(0x3a1f0e,.2));cof.rotation.x=-Math.PI/2;cof.position.y=1.0;sp.add(cof);put(g,sp,0,0);
  const pot=new T.Group(),pp=[[0,0],[.7,0],[.8,.5],[.6,1.3],[.3,1.5],[0,1.55]].map(([x,y])=>new T.Vector2(x,y));pot.add(new T.Mesh(new T.LatheGeometry(pp,32),en));const spt=cyl(.06,.12,.7,en,0);spt.position.set(.75,.9,0);spt.rotation.z=-.9;pot.add(spt);put(g,pot,2.0,.4,-.3);return sp},
 SK:g=>{let m;['JS','RS','PY','JV','</>','CSS'].forEach((t,i)=>{const lg=new T.Group();lg.add(cyl(.58,.62,.32,M(0x8a5a32,.85),.16,28));const bark=new T.Mesh(new T.CylinderGeometry(.63,.66,.3,28,1,true),M(0x4a2c16,.95));bark.position.y=.15;lg.add(bark);
   const top=new T.Mesh(new T.CircleGeometry(.56,28),M(0xffffff,.8,0,{map:tex(128,128,(x,W)=>{x.fillStyle='#d6ae78';x.fillRect(0,0,W,W);x.strokeStyle='rgba(120,70,30,.35)';for(let r=8;r<64;r+=7){x.beginPath();x.arc(W/2,W/2,r,0,TAU);x.stroke()}x.fillStyle='#2a1406';x.font=`${t.length>2?34:48}px ${F.w}`;x.textAlign='center';x.textBaseline='middle';x.fillText(t,W/2,W/2+2)})}));
   top.rotation.x=-Math.PI/2;top.position.y=.325;lg.add(top);const o=put(g,lg,-1.4+(i%3)*1.4,-.7+(i/3|0)*1.4,rnd(-.4,.4));m=m||o});return m},
 XO:g=>{const s=sheriffStar(1.0);put(g,s,-.9,0,.2);const c=put(g,sheet(2.6,1.5,cardTex,.02,.03),1.4,.6,-.2);return s},
 XS:g=>{const l=new T.Group(),blk=M(0x2a2420,.5,.6);l.add(cyl(.5,.55,.14,blk,.07,24));const gl=new T.Mesh(new T.CylinderGeometry(.38,.38,1.0,24,1,true),M(0xffd9a0,.1,0,{transparent:true,opacity:.28,side:T.DoubleSide}));gl.position.y=.64;gl.userData.ns=true;
  const fl=new T.Mesh(new T.SphereGeometry(.13,16,12),M(0xffb050,.3,0,{emissive:0xff9a2a,emissiveIntensity:2.2}));fl.scale.y=1.7;fl.position.y=.6;fl.userData.ns=true;leds.push(fl);
  [-1,1].forEach(s=>{const b=box(.05,1.0,.05,blk,.64);b.position.x=s*.4;l.add(b)});const cap=new T.Mesh(new T.ConeGeometry(.5,.35,24),blk);cap.position.y=1.32;const hd=new T.Mesh(new T.TorusGeometry(.32,.03,8,24,Math.PI),blk);hd.position.y=1.5;l.add(gl,fl,cap,hd);put(g,l,0,0);return l},
 CT:g=>{const k=new T.Group();k.add(box(2.2,.2,1.2,woodL,.1));const lv=box(1.5,.08,.16,M(0xd9a441,.26,.92),.42);lv.rotation.z=.08;k.add(lv);const kn=cyl(.16,.18,.14,M(0x111,.4),.52);kn.position.x=.72;k.add(kn);
  [-.6,.0].forEach(x=>{const p=cyl(.07,.07,.3,M(0xd9a441,.26,.92),.32);p.position.x=x;k.add(p)});const wr=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-1.1,.1,0),new T.Vector3(-1.8,.05,.6),new T.Vector3(-2.6,.05,.2)]),30,.03,6),M(0x2a1a10,.6));g.add(wr);
  put(g,k,0,0,.2);put(g,sheet(3.0,2.0,envTex,.03),2.2,1.4,-.12);return k}};
const BUILD={
 kraft:{
  PR:g=>{const r=new T.Group(),en=M(0x2f4a3a,.45,.35),br=M(0xc9973f,.3,.9);r.add(box(2.4,.9,1.9,en,.45));const bed=box(2.3,.18,1.1,en,0);bed.position.set(0,1.0,.45);bed.rotation.x=.42;r.add(bed);
   const im=new T.InstancedMesh(new T.CylinderGeometry(.09,.09,.08,14),M(0xf2ead6,.4),24),o3=new T.Object3D();for(let i=0;i<24;i++){o3.position.set(-.9+(i%6)*.36,1.13+(i/6|0)*-.09,.2+(i/6|0)*.22);o3.rotation.x=.42;o3.updateMatrix();im.setMatrixAt(i,o3.matrix)}r.add(im);
   const top=box(1.2,.6,.5,en,0);top.position.set(.3,1.35,-.55);r.add(top);const d=new T.Mesh(new T.PlaneGeometry(1.0,.36),M(0xffffff,.5,0,{map:lbl('Q  85','#14110c','#f2c96a','bold 64px Courier New',256,96)}));d.position.set(.3,1.4,-.29);r.add(d);
   const trim=box(2.44,.06,1.94,br,.9);r.add(trim);const crank=cyl(.05,.05,.6,br,0);crank.rotation.z=Math.PI/2;crank.position.set(1.45,.6,0);r.add(crank);put(g,r,0,0,-.2);
   put(g,sheet(1.0,1.5,paper(160,240,'#f1e4c4',(x,w,h)=>{x.fillStyle='#2a1c0f';x.font=`30px ${F.m}`;x.textAlign='center';x.fillText('EL RACK',w/2,70);x.font=`54px ${F.h}`;x.fillText('Q85',w/2,150);x.beginPath();x.arc(w/2,24,8,0,TAU);x.stroke()}),.03,.03),2.2,1.2,.3);return r},
  PO:g=>{const m=new T.Group();m.add(box(1.7,.5,2.3,M(0x161412,.6),.25));const face=new T.Mesh(new T.PlaneGeometry(1.4,1.1),M(0xffffff,.6,0,{map:tex(280,220,(x,w,h)=>{x.fillStyle='#efe4c8';x.fillRect(0,0,w,h);x.strokeStyle='#2a1c0f';x.lineWidth=3;x.beginPath();x.arc(w/2,h*.95,h*.75,Math.PI*1.18,Math.PI*1.82);x.stroke();
     for(let i=0;i<=10;i++){const a=Math.PI*1.18+i/10*Math.PI*.64;x.beginPath();x.moveTo(w/2+Math.cos(a)*h*.75,h*.95+Math.sin(a)*h*.75);x.lineTo(w/2+Math.cos(a)*h*.64,h*.95+Math.sin(a)*h*.64);x.stroke()}
     x.strokeStyle='#b3261e';x.lineWidth=4;x.beginPath();x.moveTo(w/2,h*.95);x.lineTo(w/2+Math.cos(Math.PI*1.66)*h*.8,h*.95+Math.sin(Math.PI*1.66)*h*.8);x.stroke();x.fillStyle='#2a1c0f';x.font=`22px ${F.m}`;x.textAlign='center';x.fillText('OPTIMIZADOR',w/2,h*.62)})}));
   face.rotation.x=-Math.PI/2;face.position.set(0,.505,-.4);m.add(face);const kn=cyl(.28,.3,.18,M(0x2a2622,.5),.59);kn.position.z=.6;m.add(kn);put(g,m,0,0,.3);
   [[0xb3261e,-1.6],[0x111111,-1.9]].forEach(([c,x])=>{const p=new T.Group(),h=cyl(.07,.07,1.0,M(c,.5),0);h.rotation.z=Math.PI/2;h.position.set(0,.07,0);const tip=cyl(.015,.015,.4,steel,0);tip.rotation.z=Math.PI/2;tip.position.set(.7,.07,0);p.add(h,tip);p.position.set(x,0,1.6);p.rotation.y=.4;g.add(p)});return m},
  PA:g=>{const b=new T.Group(),wd=M(0x7a4b26,.6);b.add(box(2.2,.12,3.0,wd,.06));[[-1.06,0,.08,3.0],[1.06,0,.08,3.0]].forEach(([x,z,w,d])=>{const s=box(w,1.0,d,wd,.5);s.position.x=x;b.add(s)});[1.46,-1.46].forEach(z=>{const s=box(2.2,1.0,.08,wd,.5);s.position.z=z;b.add(s)});
   for(let i=0;i<9;i++){const c=new T.Mesh(new T.PlaneGeometry(2.0,1.25),M(0xffffff,.8,0,{map:i===8?lbl('PANEL\nADMIN','#f6efdd','#2a1c0f',`34px ${F.m}`,256,160):cream.map||null,color:0xf6efdd,side:T.DoubleSide}));c.position.set(0,.7,-1.2+i*.3);c.rotation.x=-.18;b.add(c)}
   const tab=box(.5,.18,.04,M(0xc9973f,.3,.9),1.05);tab.position.z=1.5;b.add(tab);put(g,b,0,0,.25);return b},
  SK:g=>{let m;['JS','RS','PY','JV','</>','CSS'].forEach((t,i)=>{const k=new T.Group();k.add(cyl(.06,.06,.55,steel,.28));const top=cyl(.42,.42,.08,M(0x141210,.4),.6);k.add(top);
   const face=new T.Mesh(new T.CircleGeometry(.36,28),M(0xffffff,.5,0,{map:lbl(t,'#141210','#f2ead6',`${t.length>2?38:52}px ${F.m}`,128,128)}));face.rotation.x=-Math.PI/2;face.position.y=.645;const ring=new T.Mesh(new T.TorusGeometry(.42,.035,8,32),M(0xd5d9de,.2,.95));ring.rotation.x=Math.PI/2;ring.position.y=.63;k.add(face,ring);
   const o=put(g,k,-1.4+(i%3)*1.35,-.7+(i/3|0)*1.4+(i%2)*.2,rnd(-.3,.3));m=m||o});return m},
  AB:g=>{const mg=mug(0xf3efe6);const rim=new T.Mesh(new T.TorusGeometry(.78,.035,8,40),M(0x1f4f8a,.4));rim.rotation.x=Math.PI/2;rim.position.y=1.5;mg.add(rim);[0,1].forEach(i=>{const ch=new T.Mesh(new T.CircleGeometry(.06,10),M(0x1d1a17,.6));ch.position.set(.55+i*.1,.5+i*.4,.58);ch.rotation.y=.8;mg.add(ch)});put(g,mg,0,0);put(g,pencil(0x3f6f8f,3.4),-2.3,.8,-.5);put(g,sheet(2.2,2.9,gacetaTex,.08,.03),1.9,-.5,-.3);return mg},
  XS:g=>{const r=new T.Group(),wd=M(0x4a2c14,.55);r.scale.setScalar(.72);r.add(box(3.0,1.8,1.4,wd,.9));const gr=new T.Mesh(new T.PlaneGeometry(1.5,1.2),M(0xffffff,.9,0,{map:tex(128,128,(x,w)=>{x.fillStyle='#c9b48a';x.fillRect(0,0,w,w);x.strokeStyle='rgba(60,40,20,.35)';for(let i=0;i<w;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,w);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}})}));gr.position.set(-.55,.95,.71);
   const dial=new T.Mesh(new T.PlaneGeometry(1.0,.5),M(0xffffff,.4,0,{map:lbl('88 · 96 · 104','#3a2208','#ffcf7a','bold 30px Courier New',256,96),emissive:0xffa040,emissiveIntensity:.6}));dial.position.set(.85,1.25,.71);
   r.add(gr,dial);[.55,1.15].forEach(x=>{const k=cyl(.16,.16,.14,M(0xe9dcc0,.4),0);k.rotation.x=Math.PI/2;k.position.set(x,.55,.75);r.add(k)});
   [-.9,0,.9].forEach(x=>{const tb=new T.Group(),gl=new T.Mesh(new T.CylinderGeometry(.18,.18,.62,16,1,true),M(0xffcf8a,.1,0,{transparent:true,opacity:.3,side:T.DoubleSide,envMapIntensity:.2}));gl.position.y=.31;gl.userData.ns=true;
    const fil=new T.Mesh(new T.CylinderGeometry(.06,.06,.36,8),M(0xff8a2a,.4,0,{emissive:0xff7a1a,emissiveIntensity:1.4}));fil.position.y=.3;fil.userData.ns=true;tb.add(gl,fil,cyl(.2,.2,.08,M(0x222,.5),.04));tb.position.set(x,1.8,-.25);r.add(tb);leds.push(fil)});put(g,r,0,0,-.15);return r},
  CT:g=>{const ph=new T.Group(),bk=M(0x8e1520,.35);ph.add(box(1.6,.5,1.7,bk,.25));const tp=box(1.3,.35,1.2,bk,.6);tp.rotation.x=-.25;tp.position.z=.1;ph.add(tp);
   const ds=new T.Shape();ds.absarc(0,0,.5,0,TAU,false);for(let i=0;i<10;i++){const a=Math.PI*.35+i/10*Math.PI*1.45,p=new T.Path();p.absarc(Math.cos(a)*.36,Math.sin(a)*.36,.07,0,TAU,true);ds.holes.push(p)}
   const dial=new T.Mesh(ext(ds,.04),M(0xf2ead6,.4));dial.position.set(0,.78,.42);dial.rotation.x=-.25;ph.add(dial);
   const hs=new T.Group(),bar=cyl(.12,.12,1.9,bk,0);bar.rotation.z=Math.PI/2;hs.add(bar);[-1,1].forEach(s=>{const e=new T.Mesh(new T.SphereGeometry(.26,18,12),bk);e.scale.set(1,.7,1);e.position.x=s*.95;hs.add(e)});hs.position.set(0,1.05,-.35);ph.add(hs);
   const pts=[];for(let i=0;i<=60;i++){const u=i/60;pts.push(new T.Vector3(1.0+u*1.6+Math.cos(u*40)*.12,.12+Math.sin(u*40)*.12,.2+u*1.2))}const cord=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),180,.035,6),M(0x1d1a17,.5));g.add(cord);
   put(g,ph,0,0,.2);put(g,sheet(3.6,2.4,envTex,.03),-2.6,1.4,-.12);return ph}},
 cine:{
  PR:g=>{const e=easel(1.7,2.5,shopTex,0xd4a84a);put(g,e,0,0,-.1);return e},
  PO:g=>{const c=grp(cyl(1.1,1.1,.34,M(0x9aa0a6,.3,.85)),disc(.95,lbl('OPTIMIZADOR\nv0.3 · Rust','#2b2b2b','#e6b450',`26px ${F.m}`,256,256),.345));put(g,c,0,0,.3);put(g,grp(cyl(1.1,1.1,.3,M(0x9aa0a6,.3,.85))),1.6,1.4);return c},
  PA:g=>{const scr=easel(3.4,2.0,adminTex,0x151515,.7);put(g,scr,0,-.8);
   const pj=new T.Group();pj.add(box(1.1,.7,1.5,M(0x2a2a2a,.45,.4),.5));const lens=cyl(.22,.26,.4,M(0x111,.2,.6),0);lens.rotation.x=Math.PI/2;lens.position.set(0,.55,-.9);pj.add(lens);
   [-.32,.32].forEach(z=>{const r=cyl(.42,.42,.06,M(0x9aa0a6,.3,.85),0);r.rotation.z=Math.PI/2;r.position.set(0,1.3,z);pj.add(r)});put(g,pj,.3,2.9,Math.PI);
   const beam=new T.Mesh(new T.ConeGeometry(1.7,3.2,32,1,true),new T.MeshBasicMaterial({color:0xffe6b0,transparent:true,opacity:.1,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
   beam.rotation.x=Math.PI/2;beam.position.set(.15,1.45,.9);beam.userData.ns=true;g.add(beam);return scr},
  PB:g=>{const ch=new T.Group(),wood=M(0x6b4423,.6);[[-.5,-.4],[.5,-.4],[-.5,.4],[.5,.4]].forEach(([x,z])=>{const l=box(.08,1.2,.08,wood,.6);l.position.set(x,0,z);l.rotation.z=x*.25;ch.add(l)});
   ch.add(box(1.1,.06,.9,M(0x1a1a1a,.8),1.05));const bk=new T.Mesh(new T.PlaneGeometry(1.1,.5),M(0xffffff,.8,0,{map:lbl('GABRIEL','#1a1a1a','#f2f2f2',`40px ${F.h}`,256,112),side:T.DoubleSide}));bk.position.set(0,1.85,-.42);ch.add(bk);
   [-.52,.52].forEach(x=>{const p=box(.07,1.0,.07,wood,1.6);p.position.set(x,0,-.42);ch.add(p)});put(g,ch,0,0,.5);return ch},
  SV:g=>{let m;[['WEB','landing'],['WHATSAPP','pedidos'],['PANEL','admin']].forEach(([a,b],i)=>{const tx=paper(400,180,'#f1d9a8',(x,w,h)=>{x.fillStyle='#b3261e';x.fillRect(0,0,64,h);x.fillStyle='#2a1c0f';x.font=`38px ${F.w}`;x.fillText(a,90,86);x.font=`20px ${F.m}`;x.fillText('ADMISIÓN · '+b,92,128)});
   const o=put(g,sheet(2.1,.95,tx,.04,.03),-1.6+i*1.6,(i%2)*1.0-.5,rnd(-.3,.3));m=m||o});return m},
  AB:g=>{const cup=new T.Group(),pts=[[0,0],[.5,0],[.62,1.6],[0,1.6]].map(([x,y])=>new T.Vector2(x,y));cup.add(new T.Mesh(new T.LatheGeometry(pts,28),M(0xc8211f,.5,0,{side:T.DoubleSide})));
   cup.add(cyl(.64,.64,.08,M(0xf4efe6,.4),1.62));const st=cyl(.04,.04,1.0,M(0xf4efe6,.4),2.0);st.rotation.z=.2;cup.add(st);put(g,cup,0,0);
   const bx=grp(box(.9,1.2,.5,M(0xffffff,.6,0,{map:lbl('DULCES','#e6b450','#5a0f16',`34px ${F.w}`)})));put(g,bx,1.6,.6,-.4);return cup},
  SK:g=>{let m;['JS','RS','PY','JV','</>','CSS'].forEach((t,i)=>{const c=grp(cyl(.55,.55,.2,M(0x9aa0a6,.3,.85)),disc(.5,keyTex(t),.205));const o=put(g,c,-1.4+(i%3)*1.4,-.7+(i/3|0)*1.4);m=m||o});return m},
  EX:g=>{const mg=new T.Group(),cone=new T.Mesh(new T.CylinderGeometry(.75,.18,1.7,28,1,true),M(0xd8d2c4,.45,0,{side:T.DoubleSide}));cone.rotation.z=Math.PI/2;cone.position.y=.6;
   const h=box(.2,.6,.2,M(0x1a1a1a,.5),.3);h.position.x=.3;mg.add(cone,h);put(g,mg,0,0,.5);return mg},
  FO:g=>{const tr=new T.Group(),gold=M(0xd4a84a,.25,.9);tr.add(box(1.0,.35,1.0,M(0x1a1a1a,.4),.17),cyl(.22,.3,.5,gold,.6),cyl(.16,.22,1.2,gold,1.45),new T.Mesh(new T.SphereGeometry(.24,20,14),gold));tr.children[3].position.y=2.25;
   put(g,tr,-.6,0);put(g,sheet(3.4,2.4,certTex,.06),2.4,.9,.2);return tr},
  OR:g=>{const cl=new T.Group();cl.add(box(3.0,.2,2.0,M(0x161616,.6),.1),topPlane(2.8,1.8,clapTex,.205));const arm=new T.Group();arm.position.set(0,.22,-1.0);arm.rotation.x=.5;const tp=box(3.0,.12,.45,M(0xffffff,.5,0,{map:stripeTex}),.06);tp.position.z=.22;arm.add(tp);cl.add(arm);put(g,cl,0,0,-.15);return cl},
  XO:g=>{const gold=M(0xd4a84a,.25,.9),post=()=>grp(cyl(.4,.4,.08,gold,.04),cyl(.07,.07,1.8,gold,.95),new T.Mesh(new T.SphereGeometry(.14,16,12),gold));
   const p1=post(),p2=post();p1.children[2].position.y=1.9;p2.children[2].position.y=1.9;put(g,p1,-1.8,0);put(g,p2,1.8,0);
   const rope=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-1.8,1.75,0),new T.Vector3(0,1.05,.1),new T.Vector3(1.8,1.75,0)]),32,.07,8),M(0x9e1b1b,.7));g.add(rope);
   const c=put(g,sheet(2.6,1.5,cardTex,.02,.03),0,1.6,.1);return c},
  XS:g=>{const lb=grp(box(3.0,1.1,.4,M(0x1a0505,.5),.8));const f=new T.Mesh(new T.PlaneGeometry(2.8,.9),M(0xffffff,.3,0,{map:lbl('● EN VIVO','#1a0505','#ff4d3a',`64px ${F.h}`,512,160),emissive:0xffffff,emissiveMap:lbl('● EN VIVO','#1a0505','#ff4d3a',`64px ${F.h}`,512,160),emissiveIntensity:1}));
   f.position.set(0,.8,.21);lb.add(f);[-1.2,1.2].forEach(x=>{const l=box(.1,.3,.1,M(0x222,.5),.15);l.position.x=x;lb.add(l)});put(g,lb,0,0);return lb},
  CT:g=>{const a=seat(),b=seat();put(g,a,-.7,0,.1);put(g,b,.7,0,.1);return a}},
 pc:{
  PR:g=>{const ph=new T.Group();ph.add(box(1.1,.32,2.4,M(0xb9bec4,.35,.5),.16));const sc=new T.Mesh(new T.PlaneGeometry(.8,.6),M(0xffffff,.6,0,{map:lbl('El Rack\nNautica XL\nQ 85','#a7b89a','#1d2a18','bold 22px monospace',160,120)}));
   sc.rotation.x=-Math.PI/2;sc.position.set(0,.33,-.55);ph.add(sc,keypad(.8,1.1,.34,0xe8e9ec));ph.children[2].position.z=.35;const ant=cyl(.07,.07,.45,M(0x555b62,.4),0);ant.position.set(.35,.4,-1.25);ph.add(ant);put(g,ph,0,0,-.25);return ph},
  PO:g=>{const tw=new T.Group();tw.add(box(1.3,2.6,2.6,M(0xc9ced6,.4,.3),1.3));const fp=new T.Mesh(new T.PlaneGeometry(1.15,2.4),M(0xffffff,.5,0,{map:tex(128,256,(x,w,h)=>{x.fillStyle='#b7bcc4';x.fillRect(0,0,w,h);x.fillStyle='#8a9099';[24,54].forEach(y=>x.fillRect(10,y,w-20,22));x.fillStyle='#2b2f36';x.fillRect(16,64,w-32,4);x.fillStyle='#39d65a';x.beginPath();x.arc(w/2,h-40,7,0,TAU);x.fill();x.fillStyle='#555';x.font='12px Tahoma';x.textAlign='center';x.fillText('OPTIMIZADOR',w/2,h-12)})}));
   fp.position.set(0,1.3,1.31);tw.add(fp);put(g,tw,0,0,-.35);return tw},
  PA:g=>{const m=crtGrp(adminTex,0xc9ced6);put(g,m,0,0,.2);return m},
  PB:g=>{const w=new T.Group();w.add(cyl(.5,.6,.12,M(0xc9ced6,.4),.06),cyl(.06,.06,.6,M(0xc9ced6,.4),.4));const b=new T.Mesh(new T.SphereGeometry(.5,24,16),M(0xe8e9ec,.35));b.position.y=1.05;
   const l=new T.Mesh(new T.CircleGeometry(.22,20),M(0x111,.1));l.position.set(0,1.05,.49);const led=new T.Mesh(new T.SphereGeometry(.05,8,6),glowM(0x39d65a));led.position.set(.28,1.3,.4);w.add(b,l,led);leds.push(led);put(g,w,0,0,.3);return w},
  SV:g=>{let m;['WEB','WHATSAPP','PANEL'].forEach((t,i)=>{const c=grp(box(1.7,.12,1.5,M(0xdfe6ee,.15,0,{transparent:true,opacity:.55}),.06),topPlane(1.5,.4,lbl(t,'#e8eef8','#0a58ca',`34px Tahoma`,256,72),.125),cdDisc());c.children[1].position.z=-.5;c.children[2].position.y=.05;const o=put(g,c,-1.9+i*1.9,(i%2)*.8-.4,rnd(-.2,.2));m=m||o});return m},
  AB:g=>{const mg=put(g,mug(0xf2f2f2),-.6,0);put(g,sheet(2.0,1.6,tex(64,64,(x,w)=>{x.fillStyle='#2b4f8a';x.fillRect(0,0,w,w)}),0,.012),1.6,.4,0,false);const ms=new T.Mesh(new T.SphereGeometry(.38,20,14),M(0xc9ced6,.4));ms.scale.set(1,.45,1.5);ms.position.y=.16;put(g,grp(ms),1.6,.4,.3);return mg},
  SK:g=>{const k=keyboard(4.2,1.5,0xbfc4cc,0xeceef2,false);put(g,k,0,0,-.08);return k},
  EX:g=>{const p=new T.Group();p.add(box(.8,.14,1.4,M(0xf4f4f4,.3),.07));const s=new T.Mesh(new T.PlaneGeometry(.6,.45),scrM(lbl('♪ 01:26','#10243f','#8fd0ff','bold 30px Tahoma',160,120)));s.rotation.x=-Math.PI/2;s.position.set(0,.145,-.35);
   const wh=new T.Mesh(new T.RingGeometry(.12,.3,28),M(0xd8dade,.4));wh.rotation.x=-Math.PI/2;wh.position.set(0,.145,.3);p.add(s,wh);put(g,p,0,0,.4);
   const cab=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.08,.7),new T.Vector3(.8,.05,1.6),new T.Vector3(1.6,.05,1.1),new T.Vector3(2.1,.12,.4)]),40,.025,6),M(0xf4f4f4,.4));g.add(cab);
   [[2.1,.4],[2.4,.9]].forEach(([x,z])=>{const e=new T.Mesh(new T.SphereGeometry(.16,14,10),M(0xf4f4f4,.3));e.position.set(x,.16,z);g.add(e)});return p},
  FO:g=>{const stk=new T.Group();[0x1e2a44,0x7a2a22,0x2e6b2a].forEach((c,i)=>{const f=grp(box(1.9,.07,1.9,M(c,.45)),topPlane(1.4,1.0,floppyTex,.075));f.position.y=i*.085;f.rotation.y=i*.22-.2;stk.add(f)});put(g,stk,0,0,.1);put(g,sheet(3.0,2.2,certTex,.04),2.4,.8,.15);return stk},
  OR:g=>{const pr=new T.Group();pr.add(box(2.6,.9,1.6,M(0xc9ced6,.4,.2),.45));const tr=box(2.0,.05,1.2,M(0xb0b5bd,.4),0);tr.position.set(0,1.2,-.9);tr.rotation.x=-1.0;pr.add(tr);put(g,pr,0,-.3);
   const sh=put(g,sheet(1.35,2.5,receiptTex,.05),0,1.6);return pr},
  XO:g=>{const pda=new T.Group();pda.add(box(1.1,.16,1.6,M(0x4a5058,.4,.3),.08));const sc=new T.Mesh(new T.PlaneGeometry(.9,1.1),scrM(cardTex));sc.rotation.x=-Math.PI/2;sc.position.set(0,.165,-.12);pda.add(sc);
   const sty=cyl(.03,.03,1.3,M(0xd5d9de,.3,.8),0);sty.rotation.z=Math.PI/2;sty.position.set(0,.1,.95);pda.add(sty);put(g,pda,0,0,.25);put(g,sheet(3.0,1.72,cardTex,.02,.03),2.4,1.2,-.4);return pda},
  XS:g=>{const md=new T.Group();md.add(box(1.9,.35,1.2,M(0x9aa0a8,.4,.2),.17));for(let i=0;i<6;i++){const l=new T.Mesh(new T.SphereGeometry(.05,8,6),glowM(i%3?0x39d65a:0xff8a3a));l.position.set(-.6+i*.24,.36,.45);md.add(l);leds.push(l)}put(g,md,0,0,-.15);return md},
  CT:g=>{const ph=new T.Group();ph.add(box(1.4,.4,1.2,M(0xe8e9ec,.4),.2));const hs=box(.5,.32,1.9,M(0xe8e9ec,.4),0);hs.position.set(0,.6,0);hs.rotation.x=.05;const ant=cyl(.05,.05,.5,M(0x555,.4),0);ant.position.set(.15,1.0,-.85);
   ph.add(hs,ant,keypad(.4,.8,.77,0x9aa0a8));ph.children[3].position.z=.3;put(g,ph,0,0,.3);return ph}},
 hacker:{
  PR:g=>{const ph=grp(box(1.6,.14,3.1,M(0x0c0f0e,.3,.5)),topPlane(1.42,2.85,termTex,.145,true));const ed=box(1.64,.04,3.14,glowM(0x39ff88,.5),.02);ed.userData.ns=true;ph.add(ed);put(g,ph,0,0,-.25);return ph},
  PO:g=>{const gpu=new T.Group();gpu.add(box(3.2,.35,1.3,M(0x141716,.35,.5),.18));[-.75,.75].forEach(x=>{const f=fan(.5);f.position.x=x;gpu.add(f);spinners.push([f,2.4])});
   const st=box(3.2,.04,.06,glowM(0x39ff88),.36);st.position.z=.64;st.userData.ns=true;gpu.add(st);put(g,gpu,0,0,.3);return gpu},
  PA:g=>{const mon=new T.Group();mon.add(cyl(.6,.7,.08,M(0x111,.4),.04),box(.16,1.0,.16,M(0x111,.4),.55));const sc=box(4.0,1.7,.12,M(0x0b0d0c,.4),1.85);mon.add(sc);
   const s=new T.Mesh(new T.PlaneGeometry(3.8,1.55),scrM(termTex));s.position.set(0,1.85,.07);mon.add(s);put(g,mon,0,0,.15);return mon},
  PB:g=>{const b=grp(box(2.2,.08,1.5,M(0x0f3a26,.5)),topPlane(2.2,1.5,pcbTex,.085));[[-.4,.1,.6,.4],[.6,-.3,.5,.5]].forEach(([x,z,w,d])=>{const c=box(w,.14,d,M(0x111,.4),.15);c.position.set(x,0,z);b.add(c)});
   [[1.0,.4],[1.0,-.1]].forEach(([x,z])=>{const u=box(.3,.25,.4,M(0xb9c0c8,.25,.95),.2);u.position.set(x,0,z);b.add(u)});const l=new T.Mesh(new T.SphereGeometry(.07,10,8),glowM(0x39ff88));l.position.set(-.9,.15,-.6);b.add(l);leds.push(l);put(g,b,0,0,-.2);return b},
  SV:g=>{let m;['WEB','WHATSAPP','PANEL'].forEach((t,i)=>{const u=grp(box(1.5,.18,.55,M(0x101412,.4)),topPlane(1.0,.4,lbl(t,'#0b1210','#39ff88','bold 30px Consolas,monospace',256,96),.185),box(.42,.14,.38,M(0xb9c0c8,.25,.95),.07));u.children[2].position.x=.95;const o=put(g,u,-.6+(i%2)*1.2,-1+i*1.0,rnd(-.4,.4));m=m||o});return m},
  AB:g=>{const hp=new T.Group(),band=new T.Mesh(new T.TorusGeometry(.75,.08,10,36,Math.PI),M(0x111,.4));band.position.y=.08;band.rotation.x=-Math.PI/2;
   [-.75,.75].forEach(x=>{const c=cyl(.32,.32,.22,M(0x161a18,.4),.12);c.position.x=x;const r=new T.Mesh(new T.TorusGeometry(.3,.03,8,24),glowM(0x39ff88,.9));r.rotation.x=-Math.PI/2;r.position.set(x,.24,0);r.userData.ns=true;hp.add(c,r)});hp.add(band);put(g,hp,-.4,0,.3);
   const can=new T.Group(),cb=new T.Mesh(new T.CylinderGeometry(.42,.42,1.5,28,1,true),M(0xffffff,.35,.4,{map:canTex}));cb.position.y=.75;can.add(cb,cyl(.4,.42,.06,M(0xb9c0c8,.25,.95),1.52));put(g,can,1.9,.6);return hp},
  SK:g=>{const k=keyboard(4.0,1.4,0x0e0f10,0x222,true);const gl=box(4.1,.04,1.5,glowM(0x39ff88),.02);gl.userData.ns=true;k.add(gl);put(g,k,0,0,-.08);return k},
  EX:g=>{const sv=new T.Group();sv.add(box(1.4,2.8,2.0,M(0x0e1110,.35,.5),1.4));for(let i=0;i<9;i++){const l=new T.Mesh(new T.SphereGeometry(.045,8,6),glowM(i%4?0x39ff88:0x2fd2ff));l.position.set(-.45+(i%3)*.12,.6+(i/3|0)*.6,1.01);sv.add(l);leds.push(l)}
   [.9,1.5,2.1].forEach(y=>{const s=box(1.2,.04,.02,M(0x1f4d3a,.4),y);s.position.z=1.0;sv.add(s)});put(g,sv,0,0,-.3);return sv},
  FO:g=>{const bk=grp(box(2.4,.5,3.2,M(0x0b1210,.6),.25),topPlane(2.4,3.2,lbl('MANUAL\nDEL\nHACKER','#0b1210','#39ff88',`44px Consolas,monospace`,256,340),.505));put(g,bk,0,0,-.2);put(g,sheet(3.0,2.2,certTex,.04),2.6,1.0,.2);return bk},
  OR:g=>{const pr=new T.Group();pr.add(box(1.6,.8,1.4,M(0x111,.4),.4));const sl=box(1.2,.03,.1,glowM(0x39ff88),.81);sl.position.z=-.2;sl.userData.ns=true;pr.add(sl);put(g,pr,0,-.4);put(g,sheet(1.2,2.4,receiptTex,.05),0,1.3);return pr},
  XO:g=>{const c=put(g,sheet(3.0,1.72,cardFront,.02,.03),0,0,.15);const ly=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.05,-.9),new T.Vector3(-.8,.05,-2.2),new T.Vector3(.6,.05,-2.8),new T.Vector3(1.4,.05,-1.6)]),40,.05,6),M(0x111,.5));g.add(ly);return c},
  XS:g=>{const r=new T.Group();r.add(box(2.4,.4,1.4,M(0x111,.4,.3),.2));[-.9,0,.9].forEach((x,i)=>{const a=cyl(.06,.06,1.3,M(0x161616,.4),0);a.position.set(x,.95,-.6);a.rotation.z=(i-1)*.25;r.add(a)});
   for(let i=0;i<5;i++){const l=new T.Mesh(new T.SphereGeometry(.05,8,6),glowM(0x39ff88));l.position.set(-.8+i*.4,.41,.5);r.add(l);leds.push(l)}put(g,r,0,0,-.1);return r},
  CT:g=>{const d=new T.Group(),dish=new T.Mesh(new T.SphereGeometry(1.1,32,16,0,TAU,0,Math.PI*.38),M(0xc9ced6,.35,.5,{side:T.DoubleSide}));dish.rotation.x=-2.2;dish.position.set(0,1.4,0);
   const arm=cyl(.05,.05,1.1,M(0x888,.4),0);arm.position.set(0,1.75,.45);arm.rotation.x=.9;const tip=new T.Mesh(new T.SphereGeometry(.09,10,8),glowM(0x39ff88));tip.position.set(0,2.15,.85);
   d.add(cyl(.5,.6,.1,M(0x222,.4),.05),cyl(.08,.08,1.2,M(0x333,.4),.65),dish,arm,tip);leds.push(tip);put(g,d,0,0,.3);return d}}};
BUILD.oeste=OESTE_B;
const VMAIN={kraft:new Map(),cine:new Map(),pc:new Map(),hacker:new Map(),oeste:new Map()},CID=['PR','PO','PA','PB','SV','AB','SK','EX','FO','OR','XO','XS','CT'];
CHAP.forEach((cl,i)=>Object.keys(BUILD).forEach(w=>{const fn=BUILD[w][CID[i]];if(!fn)return;const g=new T.Group();g.visible=false;cl.add(g);VAR[w][i]=g;VMAIN[w].set(cl,fn(g))}));
/* ---------- EL GUARDIÁN DEL TALLER: el perro del logo en 3D. Sigue el cursor, acompaña cada capítulo y se viste según el mundo ---------- */
var mBlob=null;const MH=cluster(46,-12);
const RUGS={kraft:tex(256,256,(g,w)=>{g.fillStyle='#8e2a1a';g.fillRect(0,0,w,w);g.strokeStyle='#e6c38a';g.lineWidth=8;g.strokeRect(14,14,w-28,w-28);for(let i=0;i<w;i+=16){g.fillStyle=(i/16)%2?'#6e1e12':'#a8392a';g.fillRect(28,i,w-56,8)}noise(g,w,w,3000,.1)}),
 cine:tex(256,256,(g,w)=>{g.fillStyle='#7a0f18';g.fillRect(0,0,w,w);g.strokeStyle='#e6b450';g.lineWidth=6;g.strokeRect(10,10,w-20,w-20);noise(g,w,w,4000,.12)}),
 pc:tex(256,256,(g,w)=>{g.fillStyle='#2b4f8a';g.fillRect(0,0,w,w);g.fillStyle='#fff';g.font='bold 26px Tahoma';g.textAlign='center';g.fillText('MOUSE PAD',w/2,w-24);noise(g,w,w,2000,.06)}),
 oeste:tex(256,256,(g,w)=>{g.fillStyle='#f1ebe0';g.fillRect(0,0,w,w);g.fillStyle='#3a2416';for(let i=0;i<8;i++){g.beginPath();const x=rnd(0,w),y=rnd(0,w),r=rnd(22,46);for(let k=0;k<12;k++){const a=k/12*TAU,q=r*(.6+Math.random()*.5);k?g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):g.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.fill()}g.strokeStyle='#8e2a1a';g.lineWidth=8;g.strokeRect(6,6,w-12,w-12)}),
 hacker:tex(256,256,(g,w)=>{g.fillStyle='#050a08';g.fillRect(0,0,w,w);g.strokeStyle='#39ff88';g.lineWidth=4;g.strokeRect(10,10,w-20,w-20);g.strokeStyle='rgba(57,255,136,.25)';g.lineWidth=1;for(let i=20;i<w;i+=20){g.beginPath();g.moveTo(i,10);g.lineTo(i,w-10);g.stroke()}})};
const rug=new T.Mesh(new T.CircleGeometry(1.7,40),M(0xffffff,.9,0,{map:RUGS.kraft}));rug.rotation.x=-Math.PI/2;rug.position.y=.02;rug.receiveShadow=true;MH.add(rug);
put(MH,sheet(1.6,1.0,lbl('GUARDIÁN','#f3e6c8','#2a1c0f',`34px ${F.h}`,256,160),.03,.03),2.4,1.6,-.4,false);
const MHHOME=new T.Vector3();MH.getWorldPosition(MHHOME);
const MASC=new T.Group(),mBody=new T.Group();MASC.add(mBody);world.add(MASC);
const fur=new T.MeshStandardMaterial({color:0x110c09,roughness:.6,envMapIntensity:.3,bumpMap:MICRO,bumpScale:.012}),tan=new T.MeshStandardMaterial({color:0xb67f45,roughness:.7,envMapIntensity:.32,bumpMap:MICRO,bumpScale:.01});
const fm=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m};
/* el perro del logo (negro y canela, orejas altas): formas suaves y redondas, sin cajas */
const bl=(r,mat,x,y,z,sx=1,sy=1,sz=1,ws=28,hs=20)=>{const m=fm(new T.SphereGeometry(r,ws,hs),mat,x,y,z);m.scale.set(sx,sy,sz);return m};
const nose=new T.MeshStandardMaterial({color:0x0b0908,roughness:.22,metalness:0,envMapIntensity:.8});
{/* torso sentado: un perfil girado (como un jarrón) inclinado hacia atrás, con cadera y muslos marcados */
 const tp=[[0,0],[.42,.04],[.6,.22],[.62,.48],[.56,.78],[.46,1.04],[.36,1.24],[.2,1.34],[0,1.36]].map(([x,y])=>new T.Vector2(x,y));
 const tor=fm(new T.LatheGeometry(tp,32),fur,0,.18,-.3);tor.rotation.x=.34;tor.scale.set(1,1,.86);mBody.add(tor);
 mBody.add(bl(.55,fur,0,.42,-.46,1.12,.8,1.08));
 [-1,1].forEach(s=>{
  mBody.add(bl(.36,fur,s*.4,.4,-.32,.66,1.02,1.22));            /* muslo trasero */
  mBody.add(bl(.13,fur,s*.46,.14,-.02,.7,.9,1.5));               /* corvejón */
  mBody.add(bl(.13,tan,s*.44,.06,.16,.95,.5,1.45));              /* pata trasera */
  /* pata delantera: brazo negro, media canela y pie con dedos */
  const lg=fm(new T.CylinderGeometry(.085,.11,.72,20),fur,s*.22,.62,.33);lg.rotation.x=-.06;mBody.add(lg);
  mBody.add(bl(.13,fur,s*.22,.98,.31,1,1.1,1));                  /* hombro */
  mBody.add(fm(new T.CylinderGeometry(.088,.094,.24,20),tan,s*.22,.2,.36));
  mBody.add(bl(.115,tan,s*.22,.07,.43,1,.5,1.3));
  [-.055,0,.055].forEach(dx=>mBody.add(bl(.04,tan,s*.22+dx,.05,.55,1,.75,1.1,12,10)))});
 mBody.add(bl(.32,tan,0,.92,.34,1,1.3,.55));                     /* pecho canela */
 mBody.add(bl(.38,fur,0,1.12,.22,1,1.1,.85));                     /* pecho alto negro */
 const neck=fm(new T.CylinderGeometry(.27,.38,.64,24),fur,0,1.36,.2);neck.rotation.x=.32;mBody.add(neck)}
/* cola: una curva de esferas que se adelgaza, con la punta canela */
const tailG=new T.Group();tailG.position.set(0,.36,-1.0);tailG.rotation.x=-1.05;
[[.13,.08,0],[.12,.24,.02],[.105,.4,.05],[.09,.55,.09],[.075,.68,.14]].forEach(([r,y,z],i)=>tailG.add(bl(r,i===4?tan:fur,0,y,z,1,1.25,1,18,14)));mBody.add(tailG);
const headG=new T.Group();headG.position.set(0,1.62,.38);mBody.add(headG);
{/* cabeza: cráneo, hocico largo y afinado, mandíbula canela, mejillas y cejas canela, nariz brillante */
 headG.add(bl(.44,fur,0,.28,-.02,1.04,.92,1.1));
 headG.add(bl(.3,fur,0,.3,.24,1,.78,1));                           /* frente que baja al hocico */
 const mz=fm(new T.CylinderGeometry(.12,.22,.62,24),fur,0,.16,.52);mz.rotation.x=Math.PI/2;mz.scale.set(1.05,1,.82);headG.add(mz);
 headG.add(bl(.12,fur,0,.17,.82,1,.82,.8));                        /* punta redonda */
 const jw=fm(new T.CylinderGeometry(.075,.13,.44,20),tan,0,.06,.5);jw.rotation.x=Math.PI/2;jw.scale.set(.95,1,.5);headG.add(jw);
 headG.add(bl(.085,nose,0,.2,.9,1.3,.85,.9,18,14));
 [-1,1].forEach(s=>{
  headG.add(bl(.1,tan,s*.15,.1,.36,1,.8,1.05));                     /* mejilla */
  headG.add(bl(.05,tan,s*.17,.45,.3,1.2,.6,.6,14,10));              /* ceja */
  headG.add(bl(.085,fur,s*.235,.32,.34,1,.85,.7));                  /* cuenca */
  headG.add(bl(.068,M(0xf1e4c4,.25),s*.24,.32,.37,1,.9,.8,16,12));  /* ojo */
  headG.add(bl(.04,M(0x0d0b09,.15),s*.25,.325,.415,1,1,.7,12,10));  /* pupila */
  const hl=bl(.012,new T.MeshBasicMaterial({color:0xffffff}),s*.24,.345,.445,1,1,1,8,6);hl.castShadow=false;headG.add(hl)})}
/* orejas: conos altos y huecos (abiertos al frente) con el interior canela, como en el logo */
const ears=[-1,1].map(s=>{const g=new T.Group();g.position.set(s*.25,.55,-.08);
 const e=new T.Mesh(new T.ConeGeometry(.21,.78,28),fur);e.position.y=.39;e.scale.z=.42;e.castShadow=true;
 const i=new T.Mesh(new T.ConeGeometry(.14,.6,24),tan);i.position.set(0,.33,.03);i.scale.z=.3;g.add(e,i);g.rotation.z=-s*.18;g.rotation.y=s*.3;g.rotation.x=-.1;headG.add(g);return g});
/* collar con la placa del logo */
const collar=fm(new T.TorusGeometry(.4,.055,8,22),M(0x8e2a1a,.5),0,1.28,.22);collar.rotation.x=Math.PI/2-.3;mBody.add(collar);
{const lt=new T.TextureLoader().load('logo-160.png');lt.encoding=T.sRGBEncoding;const tag=new T.Mesh(new T.CircleGeometry(.14,24),new T.MeshStandardMaterial({map:lt,roughness:.4,metalness:.3}));tag.position.set(0,1.1,.6);tag.rotation.x=-.35;mBody.add(tag)}
/* la ropa: cabeza, cuello y ojos. Cada mundo tiene su conjunto y el visitante puede vestirlo a su gusto (armario junto a la terminal) */
const WEAR={head:{},face:{},eyes:{},neck:{},body:{}};
const wg=(slot,id,parent,build)=>{const g=new T.Group();build(g);g.visible=false;g.userData.wear=slot+':'+id;g.traverse(m=>{if(m.isMesh&&!m.userData.ns){m.castShadow=true;m.receiveShadow=true}});parent.add(g);WEAR[slot][id]=g};
const gold=M(0xd4a84a,.28,.9);
wg('head','casco',headG,g=>{const c=new T.Mesh(new T.SphereGeometry(.5,18,10,0,TAU,0,Math.PI/2),M(0xf2c230,.45));c.position.y=.5;const br=new T.Mesh(new T.CylinderGeometry(.64,.64,.04,24),M(0xf2c230,.45));br.position.y=.52;
 const rib=new T.Mesh(new T.BoxGeometry(.08,.05,.9),M(0xe0ae1c,.45));rib.position.y=.98;g.add(c,br,rib)});
wg('head','boina',headG,g=>{const b=new T.Mesh(new T.SphereGeometry(.4,18,10),M(0x111111,.7));b.position.set(.05,.72,-.05);b.scale.set(1.05,.32,1.05);b.rotation.z=-.25;const st=new T.Mesh(new T.SphereGeometry(.05,8,6),M(0x111,.7));st.position.set(.05,.86,-.05);g.add(b,st)});
wg('head','gorra',headG,g=>{const c=new T.Mesh(new T.SphereGeometry(.47,18,10,0,TAU,0,Math.PI/2),M(0xb3261e,.55));c.position.y=.52;const v=new T.Mesh(new T.CylinderGeometry(.34,.34,.035,20,1,false,-Math.PI/2,Math.PI),M(0xb3261e,.55));v.position.set(0,.53,.36);v.scale.z=1.4;g.add(c,v)});
wg('head','copa',headG,g=>{const br=new T.Mesh(new T.CylinderGeometry(.52,.52,.04,24),M(0x111,.4));br.position.y=.6;const top=new T.Mesh(new T.CylinderGeometry(.3,.32,.6,24),M(0x111,.4));top.position.y=.92;const band=new T.Mesh(new T.CylinderGeometry(.325,.325,.1,24),M(0x8e1f1a,.5));band.position.y=.68;g.add(br,top,band)});
wg('head','corona',headG,g=>{const r=new T.Mesh(new T.CylinderGeometry(.34,.34,.18,20,1,true),M(0xd4a84a,.28,.9,{side:T.DoubleSide}));r.position.y=.66;g.add(r);for(let i=0;i<6;i++){const a=i/6*TAU,s2=new T.Mesh(new T.ConeGeometry(.07,.22,4),gold);s2.position.set(Math.cos(a)*.34,.86,Math.sin(a)*.34);g.add(s2)}
 const gem=new T.Mesh(new T.OctahedronGeometry(.06,0),M(0xb3261e,.2,.3));gem.position.set(0,.66,.35);g.add(gem)});
wg('head','audifonos',headG,g=>{const band=new T.Mesh(new T.TorusGeometry(.6,.045,8,28,Math.PI),M(0xc9ced6,.4,.3));band.position.set(0,.3,-.02);g.add(band);[-1,1].forEach(s=>{const c=new T.Mesh(new T.CylinderGeometry(.18,.18,.12,18),M(0x4a5058,.4,.3));c.position.set(s*.6,.3,-.02);c.rotation.z=Math.PI/2;g.add(c)})});
wg('head','capucha',headG,g=>{const h=new T.Mesh(new T.SphereGeometry(.6,16,10,0,TAU,0,Math.PI*.55),M(0x15181a,.8));h.position.set(0,.28,-.12);h.rotation.x=-.5;g.add(h)});
wg('neck','panuelo',mBody,g=>{const b=new T.Mesh(new T.ConeGeometry(.46,.5,6),M(0xb3261e,.6));b.position.set(0,1.08,.36);b.rotation.x=Math.PI+.35;b.scale.set(1,.55,.6);g.add(b)});
wg('neck','bufanda',mBody,g=>{const sc=new T.Mesh(new T.TorusGeometry(.43,.09,8,22),M(0xb3261e,.7));sc.position.set(0,1.3,.2);sc.rotation.x=Math.PI/2-.3;const tail=new T.Mesh(new T.BoxGeometry(.16,.5,.06),M(0xb3261e,.7));tail.position.set(.22,1.05,.55);tail.rotation.z=.2;g.add(sc,tail)});
wg('neck','corbatin',mBody,g=>{[-1,1].forEach(s=>{const c=new T.Mesh(new T.ConeGeometry(.11,.22,4),M(0x111,.45));c.rotation.z=s*Math.PI/2;c.position.set(s*.11,1.2,.56);g.add(c)});const k=new T.Mesh(new T.SphereGeometry(.05,8,6),M(0x111,.45));k.position.set(0,1.2,.58);g.add(k)});
wg('neck','cadena',mBody,g=>{const c=new T.Mesh(new T.TorusGeometry(.42,.035,6,28),gold);c.position.set(0,1.22,.24);c.rotation.x=Math.PI/2-.35;const p=new T.Mesh(new T.CylinderGeometry(.09,.09,.03,16),gold);p.position.set(0,1.02,.6);p.rotation.x=-1.2;g.add(c,p)});
wg('eyes','visor',headG,g=>{const v=new T.Mesh(new T.BoxGeometry(.78,.11,.06),M(0x39ff88,.3,0,{emissive:0x39ff88,emissiveIntensity:1.4}));v.position.set(0,.36,.44);v.userData.ns=true;g.add(v)});
wg('eyes','redondos',headG,g=>{[-1,1].forEach(s=>{const r=new T.Mesh(new T.TorusGeometry(.11,.018,6,20),M(0x2a2622,.4,.5));r.position.set(s*.29,.35,.45);r.rotation.y=s*.5;g.add(r)});const br=new T.Mesh(new T.BoxGeometry(.3,.02,.02),M(0x2a2622,.4,.5));br.position.set(0,.37,.5);g.add(br)});
wg('eyes','sol',headG,g=>{[-1,1].forEach(s=>{const l=new T.Mesh(new T.BoxGeometry(.24,.13,.03),M(0x0b0b0c,.08,.6));l.position.set(s*.27,.35,.46);l.rotation.y=s*.45;g.add(l)});const br=new T.Mesh(new T.BoxGeometry(.32,.025,.02),M(0x0b0b0c,.2,.6));br.position.set(0,.38,.5);g.add(br)});
wg('eyes','monoculo',headG,g=>{const r=new T.Mesh(new T.TorusGeometry(.12,.016,6,22),gold);r.position.set(.29,.35,.45);r.rotation.y=.5;const ch=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(.38,.27,.44),new T.Vector3(.45,.05,.3),new T.Vector3(.3,-.2,.2)]),12,.008,4),gold);g.add(r,ch)});
/* ---- más ropa: cabeza, cara, ojos, cuello y cuerpo (de los mundos y de la vida real) ---- */
const WM=(c,r=.6,m=0,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m,envMapIntensity:.4},o||{}));
const WMS=(c,r=.6)=>WM(c,r,0,{side:T.DoubleSide});
const wm=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);return m};
/* capa frontal de esfera: sirve para máscaras que se curvan con la cara */
const cap=(r,pl,tl,ts=.5)=>new T.SphereGeometry(r,32,24,Math.PI/2-pl/2,pl,ts,tl);
const paint=(w,h,f)=>{const x=tex(w,h,f);x.encoding=T.sRGBEncoding;return x};
/* cabeza */
wg('head','vaquero',headG,g=>{const pr=[[.08,0],[.62,0],[.74,.05],[.8,.12],[.79,.14],[.72,.08],[.6,.035],[.08,.035]].map(([x,y])=>new T.Vector2(x,y));const br=wm(new T.LatheGeometry(pr,40),WMS(0x7a4a24,.75),0,.6,-.02);br.rotation.x=-.08;
 const cr=wm(new T.CylinderGeometry(.3,.37,.42,28),WM(0x7a4a24,.75),0,.83,-.02);const dent=wm(new T.SphereGeometry(.3,24,10,0,TAU,0,Math.PI/2),WM(0x6a3e1c,.75),0,1.0,-.02);dent.scale.set(1,.35,1);
 const band=wm(new T.CylinderGeometry(.375,.375,.08,28,1,true),WMS(0x2a1a10,.6),0,.66,-.02);g.add(br,cr,dent,band)});
wg('head','chef',headG,g=>{const w=WM(0xf7f4ee,.85);const bnd=wm(new T.CylinderGeometry(.4,.42,.26,28),w,0,.68,-.02);g.add(bnd);
 [[0,1.02,0,.32],[-.22,.94,.06,.22],[.22,.94,.06,.22],[-.16,.96,-.2,.22],[.18,.97,-.18,.22],[0,.9,.2,.22]].forEach(([x,y,z,r])=>g.add(wm(new T.SphereGeometry(r,20,16),w,x,y,z)))});
wg('head','lana',headG,g=>{const st=paint(64,64,(c,w,h)=>{for(let i=0;i<8;i++){c.fillStyle=i%2?'#e0a52a':'#b3261e';c.fillRect(0,i*h/8,w,h/8)}});const k=WM(0xffffff,.95,0,{map:st});
 const hb=wm(new T.SphereGeometry(.47,28,16,0,TAU,0,Math.PI/2),k,0,.5,-.04);hb.scale.y=1.1;const rim=wm(new T.TorusGeometry(.46,.07,10,32),WM(0xb3261e,.95),0,.52,-.04);rim.rotation.x=Math.PI/2;
 const pom=wm(new T.IcosahedronGeometry(.13,2),WM(0xf3ead8,1),0,1.04,-.04);g.add(hb,rim,pom)});
wg('head','birrete',headG,g=>{const b=WM(0x14161a,.55);const base=wm(new T.CylinderGeometry(.36,.4,.24,28),b,0,.66,-.02);const top=wm(new T.BoxGeometry(.95,.04,.95),b,0,.8,-.02);top.rotation.y=Math.PI/4;
 const bt=wm(new T.CylinderGeometry(.04,.04,.03,10),gold,0,.83,-.02);const cord=wm(new T.CylinderGeometry(.01,.01,.5,6),gold,.33,.6,.25);cord.rotation.z=.15;const tas=wm(new T.ConeGeometry(.05,.16,10),gold,.36,.34,.25);g.add(base,top,bt,cord,tas)});
wg('head','fiesta',headG,g=>{const st=paint(128,128,(c,w,h)=>{c.fillStyle='#2f7fd6';c.fillRect(0,0,w,h);c.fillStyle='#f2c230';for(let i=-h;i<w;i+=26){c.beginPath();c.moveTo(i,h);c.lineTo(i+13,h);c.lineTo(i+13+h,0);c.lineTo(i+h,0);c.fill()}});
 const cn=wm(new T.ConeGeometry(.26,.68,28),WM(0xffffff,.6,0,{map:st}),.08,.98,-.02);cn.rotation.z=-.18;const pm=wm(new T.IcosahedronGeometry(.08,2),WM(0xb3261e,.9),.15,1.33,-.02);g.add(cn,pm)});
/* cara */
wg('face','anon',headG,g=>{const fc=paint(256,256,(c,w,h)=>{c.fillStyle='#f1e7d2';c.fillRect(0,0,w,h);const gr=c.createRadialGradient(w/2,h*.45,20,w/2,h*.45,w*.6);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(90,60,30,.25)');c.fillStyle=gr;c.fillRect(0,0,w,h);
  c.fillStyle='rgba(214,96,96,.45)';[[.3,.56],[.7,.56]].forEach(([x,y])=>{c.beginPath();c.ellipse(x*w,y*h,22,13,0,0,TAU);c.fill()});
  c.strokeStyle='#1a1410';c.lineCap='round';c.lineWidth=6;[[-1],[1]].forEach(([s])=>{c.beginPath();c.moveTo(w/2+s*14,h*.3);c.quadraticCurveTo(w/2+s*50,h*.2,w/2+s*86,h*.32);c.stroke()});
  c.fillStyle='#0b0908';[-1,1].forEach(s=>{c.beginPath();c.ellipse(w/2+s*48,h*.4,22,8,s*.12,0,TAU);c.fill()});
  c.fillStyle='#1a1410';c.beginPath();c.moveTo(w/2,h*.62);c.bezierCurveTo(w/2-30,h*.57,w/2-62,h*.6,w/2-80,h*.52);c.bezierCurveTo(w/2-70,h*.66,w/2-34,h*.68,w/2,h*.65);c.bezierCurveTo(w/2+34,h*.68,w/2+70,h*.66,w/2+80,h*.52);c.bezierCurveTo(w/2+62,h*.6,w/2+30,h*.57,w/2,h*.62);c.fill();
  c.lineWidth=4;c.beginPath();c.moveTo(w/2-44,h*.72);c.quadraticCurveTo(w/2,h*.79,w/2+44,h*.72);c.stroke();c.fillRect(w/2-3,h*.76,6,h*.14);
  c.strokeStyle='rgba(60,40,20,.35)';c.lineWidth=2;c.beginPath();c.moveTo(w/2,h*.36);c.lineTo(w/2-6,h*.52);c.lineTo(w/2+4,h*.54);c.stroke()});
 const mk=wm(cap(.56,2.0,1.75,.5),WM(0xffffff,.45,0,{map:fc,side:T.DoubleSide}),0,.24,.44);mk.scale.set(1,1.08,1.02);
 const strap=wm(new T.TorusGeometry(.47,.02,6,32),WM(0x111111,.6),0,.32,.02);strap.rotation.x=Math.PI/2;strap.scale.set(1,1.1,1);g.add(mk,strap)});
wg('face','cubrebocas',headG,g=>{const pl=paint(128,64,(c,w,h)=>{c.fillStyle='#8fc6e8';c.fillRect(0,0,w,h);c.fillStyle='rgba(40,90,130,.35)';for(let i=1;i<4;i++)c.fillRect(0,i*h/4-1,w,3);c.fillStyle='#e8f4fb';c.fillRect(0,0,w,4)});
 const mk=wm(cap(.3,2.2,1.4,.85),WM(0xffffff,.9,0,{map:pl,side:T.DoubleSide}),0,.14,.6);mk.scale.set(1.05,.75,1.05);g.add(mk);
 [-1,1].forEach(s=>{const e=wm(new T.TorusGeometry(.2,.012,6,20,Math.PI*1.1),WM(0xf3f6f8,.8),s*.33,.22,.38);e.rotation.y=s*Math.PI/2;g.add(e)})});
wg('face','bandana',headG,g=>{const bd=paint(128,128,(c,w,h)=>{c.fillStyle='#a9201a';c.fillRect(0,0,w,h);c.fillStyle='#f3ead8';for(let i=0;i<60;i++){c.beginPath();c.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,TAU);c.fill()}c.strokeStyle='#f3ead8';c.lineWidth=2;c.strokeRect(6,6,w-12,h-12)});
 const mk=wm(cap(.34,2.4,1.5,.95),WM(0xffffff,.85,0,{map:bd,side:T.DoubleSide}),0,.15,.52);mk.scale.set(1.15,.95,1.1);const tip=wm(new T.ConeGeometry(.2,.32,4),WM(0xa9201a,.85,0,{map:bd}),0,-.24,.6);tip.rotation.x=Math.PI;tip.scale.z=.35;g.add(mk,tip)});
wg('face','payaso',headG,g=>{g.add(wm(new T.SphereGeometry(.12,24,18),WM(0xe01b1b,.15,0,{envMapIntensity:1}),0,.2,.93))});
/* ojos */
wg('eyes','lentes3d',headG,g=>{const fr=WM(0xf4f1ea,.7);const f=wm(new T.BoxGeometry(.74,.17,.03),fr,0,.34,.46);g.add(f);
 [[-1,0xd8262b],[1,0x2fc6d8]].forEach(([s,c])=>{const l=wm(new T.PlaneGeometry(.22,.11),WM(c,.15,0,{transparent:true,opacity:.75,side:T.DoubleSide}),s*.2,.34,.48);l.userData.ns=true;g.add(l);const a=wm(new T.BoxGeometry(.02,.03,.5),fr,s*.37,.36,.22);g.add(a)})});
wg('eyes','pixel',headG,g=>{const k=WM(0x0b0b0c,.3);const px=.055;
 ['111111111111','011110011110','001100001100'].forEach((row,ry)=>[...row].forEach((v,i)=>{if(v==='1'){const b=wm(new T.BoxGeometry(px,px,.04),k,(i-5.5)*px,.4-ry*px,.47);g.add(b)}}));
 [-1,1].forEach(s=>{const sh=wm(new T.BoxGeometry(px*.9,px*.9,.04),WM(0xffffff,.3),s*.19-.03*s,.36,.495);g.add(sh)})});
wg('eyes','vr',headG,g=>{const bx=wm(rbox(.7,.28,.26),WM(0xf2f2f2,.35),0,.34,.5);const fp=wm(new T.PlaneGeometry(.6,.2),WM(0x0b0d12,.08,.3),0,.34,.635);
 const led=wm(new T.CircleGeometry(.018,10),WM(0x39ff88,.3,0,{emissive:0x39ff88,emissiveIntensity:2}),.24,.43,.637);led.userData.ns=true;const st=wm(new T.TorusGeometry(.45,.035,6,30),WM(0x26282c,.7),0,.34,.06);st.rotation.x=Math.PI/2;g.add(bx,fp,led,st)});
/* cuello */
wg('neck','gafete',mBody,g=>{const card=paint(128,176,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#0a62e8';c.fillRect(0,0,w,34);c.fillStyle='#fff';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('STAFF',w/2,24);
  c.fillStyle='#d9d4c8';c.fillRect(34,46,60,60);c.fillStyle='#1a130e';c.beginPath();c.moveTo(44,104);c.lineTo(64,56);c.lineTo(84,104);c.fill();c.fillStyle='#14171f';c.font='bold 15px sans-serif';c.fillText('GABRIEL',w/2,130);c.font='12px monospace';c.fillText('DEV · USAC',w/2,150)});
 const ly=wm(new T.TorusGeometry(.42,.018,6,30),WM(0x0a62e8,.6),0,1.26,.22);ly.rotation.x=Math.PI/2-.3;const cd=wm(new T.PlaneGeometry(.22,.3),WM(0xffffff,.5,0,{map:card,side:T.DoubleSide}),.0,.72,.67);cd.rotation.x=-.32;
 const clip=wm(new T.BoxGeometry(.05,.05,.02),WM(0xc9ced6,.3,.8),0,.88,.63);g.add(ly,cd,clip)});
wg('neck','medalla',mBody,g=>{const rb=wm(new T.TorusGeometry(.42,.03,6,30),WM(0x2f7fd6,.7),0,1.25,.22);rb.rotation.x=Math.PI/2-.3;const md=wm(new T.CylinderGeometry(.12,.12,.03,28),gold,0,.76,.66);md.rotation.x=Math.PI/2-.3;
 const st=wm(new T.CircleGeometry(.07,5),WM(0xb3261e,.4),0,.765,.682);st.rotation.x=-.3;g.add(rb,md,st)});
wg('neck','picos',mBody,g=>{const c=wm(new T.TorusGeometry(.41,.07,10,30),WM(0x111111,.45),0,1.28,.22);c.rotation.x=Math.PI/2-.3;g.add(c);
 for(let i=0;i<10;i++){const a=i/10*TAU,sp=wm(new T.ConeGeometry(.04,.12,10),WM(0xd8dde4,.2,.9),Math.sin(a)*.47,1.28-Math.cos(a)*.47*Math.sin(.3),.22+Math.cos(a)*.47*Math.cos(.3));sp.lookAt(0,1.28,.22);sp.rotateX(-Math.PI/2);g.add(sp)}});
/* cuerpo: prendas que siguen la forma del torso */
const TP=[[.64,.3],[.65,.48],[.59,.78],[.49,1.04],[.39,1.24],[.28,1.36]].map(([x,y])=>new T.Vector2(x,y));
function garment(g,mat,o={}){const tr=wm(new T.LatheGeometry(TP,36),mat,0,.18,-.3);tr.rotation.x=.34;tr.scale.set(1,1,.88);mat.side=T.DoubleSide;
 const ch=wm(new T.SphereGeometry(.39,28,20),mat,0,1.04,.24);ch.scale.set(1.02,1.18,.82);g.add(tr,ch);
 if(o.sleeves)[-1,1].forEach(s=>{const sl=wm(new T.CylinderGeometry(.125,.14,.42,20),mat,s*.22,.8,.33);sl.rotation.x=-.06;g.add(sl);if(o.cuff)g.add(wm(new T.TorusGeometry(.125,.03,8,20),o.cuff,s*.22,.6,.335)).children.at(-1).rotation.x=Math.PI/2})}
wg('body','hoodie',mBody,g=>{const m=WM(0x2b2e33,.92);garment(g,m,{sleeves:1,cuff:WM(0x1e2024,.95)});const hd=wm(new T.SphereGeometry(.42,24,16,0,TAU,0,Math.PI*.6),m,0,1.42,-.08);hd.rotation.x=-1.9;hd.scale.set(1.05,.8,.9);
 const pk=wm(new T.BoxGeometry(.5,.2,.05),WM(0x24272b,.95),0,.68,.5);pk.rotation.x=-.25;[-1,1].forEach(s=>{const d=wm(new T.CylinderGeometry(.012,.012,.3,6),WM(0xeeeeee,.6),s*.1,1.05,.58);g.add(d)});g.add(hd,pk)});
wg('body','bata',mBody,g=>{const m=WM(0xf4f6f6,.75);garment(g,m,{sleeves:1});[-1,1].forEach(s=>{const lp=wm(new T.BoxGeometry(.14,.4,.03),WM(0xe6eaea,.75),s*.13,1.12,.55);lp.rotation.set(-.3,0,s*.35);g.add(lp)});
 const pk=wm(new T.BoxGeometry(.16,.13,.02),WM(0xe6eaea,.75),.2,.9,.6);pk.rotation.x=-.3;const pen=wm(new T.CylinderGeometry(.012,.012,.16,8),WM(0x0a62e8,.4),.2,.98,.62);g.add(pk,pen)});
wg('body','chaleco',mBody,g=>{const m=WM(0xff6a1a,.6);garment(g,m);const rf=WM(0xe8eef2,.25,.6);
 [.6,.9].forEach(y=>{const b=wm(new T.CylinderGeometry(.66-.12*(y-.6),.66-.12*(y-.6),.07,36,1,true),rf,0,y,-.06);b.rotation.x=.34;b.scale.set(1.03,1,.92);b.material.side=T.DoubleSide;g.add(b)})});
wg('body','chamarra',mBody,g=>{const m=WM(0x3a2418,.38,.1);garment(g,m,{sleeves:1});const zp=wm(new T.BoxGeometry(.02,.6,.02),WM(0xc9ced6,.25,.9),.04,.98,.58);zp.rotation.x=-.32;
 [-1,1].forEach(s=>{const c=wm(new T.BoxGeometry(.2,.26,.04),WM(0x2e1c12,.4,.1),s*.18,1.3,.42);c.rotation.set(-.6,0,s*.5);g.add(c)});g.add(zp)});
wg('body','camiseta',mBody,g=>{const lt=new T.TextureLoader().load('logo-160.png');lt.encoding=T.sRGBEncoding;const m=WM(0xf2efe6,.85);garment(g,m,{sleeves:1});
 const lg=wm(new T.CircleGeometry(.16,28),WM(0xffffff,.6,0,{map:lt}),0,.98,.585);lg.rotation.x=-.3;g.add(lg)});
wg('body','sheriff',mBody,g=>{const m=WM(0x6a3e20,.55);garment(g,m);const st=sheriffStar(.13);st.rotation.x=Math.PI/2-.3;st.position.set(.2,1.04,.6);g.add(st);
 [-1,1].forEach(s=>{const fr=wm(new T.CylinderGeometry(.012,.012,.2,6),WM(0x4a2a14,.7),s*.5,.62,.2);g.add(fr)})});
wg('body','capa',mBody,g=>{const m=WMS(0xb3261e,.6);const cp=wm(new T.CylinderGeometry(.42,.85,1.3,32,1,true,Math.PI*.6,Math.PI*.8),m,0,.72,-.18);cp.rotation.x=.18;
 const cl=wm(new T.TorusGeometry(.4,.04,8,28),WM(0xd4a84a,.3,.9),0,1.3,.2);cl.rotation.x=Math.PI/2-.3;g.add(cp,cl)});
const WDEF={kraft:{head:'casco',face:'none',neck:'panuelo',eyes:'none',body:'chaleco'},cine:{head:'boina',face:'none',neck:'bufanda',eyes:'sol',body:'chamarra'},pc:{head:'audifonos',face:'none',neck:'gafete',eyes:'redondos',body:'camiseta'},hacker:{head:'none',face:'anon',neck:'none',eyes:'none',body:'hoodie'},oeste:{head:'vaquero',face:'bandana',neck:'none',eyes:'none',body:'sheriff'}};
let ward={mode:'auto',head:'none',face:'none',neck:'none',eyes:'none',body:'none'};try{const sv=JSON.parse(localStorage.getItem('gsWard')||'null');if(sv&&sv.mode)ward=sv}catch(e){}
function wearNow(){const o=ward.mode==='auto'?WDEF[worldName]||WDEF.kraft:ward;Object.entries(WEAR).forEach(([slot,items])=>Object.entries(items).forEach(([id,g])=>g.visible=o[slot]===id));syncPV(o);return o}
/* vista previa del armario: un probador 3D pequeño con una copia del guardián que gira */
let pv=null;
function syncPV(o){if(!pv)return;o=o||(ward.mode==='auto'?WDEF[worldName]||WDEF.kraft:ward);pv.dog.traverse(x=>{if(x.userData.wear){const [sl,id]=x.userData.wear.split(':');x.visible=o[sl]===id}});pv.hop=performance.now()}
window.gsWardPreview=cv=>{if(!pv){const r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;
  const sc=new T.Scene();sc.environment=S.environment;sc.add(new T.HemisphereLight(0xfff4e6,0x3a2a1a,.9));const dl=new T.DirectionalLight(0xffffff,1.1);dl.position.set(2.5,4,3.5);sc.add(dl);
  const cam=new T.PerspectiveCamera(30,1,.1,50);cam.position.set(0,1.75,6.6);cam.lookAt(0,1.2,0);
  const dog=mBody.clone(true);dog.position.set(0,0,0);dog.rotation.set(0,0,0);const base=new T.Mesh(new T.CylinderGeometry(1.1,1.2,.12,40),new T.MeshStandardMaterial({color:0x2a2622,roughness:.6}));base.position.y=-.06;
  sc.add(dog,base);pv={r,sc,cam,dog,on:false,hop:0,cv,w:0,h:0}}
 pv.on=true;syncPV()};
window.gsWardPreviewOff=()=>{if(pv)pv.on=false};
function pvFrame(now,dt){if(!pv||!pv.on)return;const w=pv.cv.clientWidth,h=pv.cv.clientHeight;if(w&&h&&(w!==pv.w||h!==pv.h)){pv.w=w;pv.h=h;pv.r.setSize(w,h,false);pv.cam.aspect=w/h;pv.cam.updateProjectionMatrix()}
 pv.dog.rotation.y+=dt*.7;const q=(now-pv.hop)/550;pv.dog.position.y=q<1?Math.sin(q*Math.PI)*.35:0;pv.r.render(pv.sc,pv.cam)}
window.gsWard={get:()=>({...ward,current:wearNow()}),set(slot,id){if(ward.mode==='auto'){Object.assign(ward,WDEF[worldName]||WDEF.kraft)}ward.mode='custom';ward[slot]=id;try{localStorage.setItem('gsWard',JSON.stringify(ward))}catch(e){}wearNow();petT=performance.now()},
 auto(){ward.mode='auto';try{localStorage.setItem('gsWard',JSON.stringify(ward))}catch(e){}wearNow();petT=performance.now()}};
MASC.scale.setScalar(.92);MASC.position.set(2.6,0,2.4);
let petT=-1,petN=0,earT=0,mYaw=0;const mPrev=new T.Vector3(),mSpot=new T.Vector3(),vR=new T.Vector3(),vF=new T.Vector3();
window.gsPet=()=>{petT=performance.now()};
function mascotDress(w){wearNow();rug.material.map=RUGS[w]||RUGS.kraft;rug.material.needsUpdate=true}
const mNdc=new T.Vector2(),mRay=new T.Raycaster(),mPlane=new T.Plane(new T.Vector3(0,1,0),0),mHit=new T.Vector3();
function mascotFrame(now,t,kf,ck){
 /* dónde se pone: en su capítulo, en su alfombra; en los demás, junto al objeto que se está viendo */
 const atHome=ck&&ck.sec&&ck.sec.id==='mascota';
 const atHero=ck&&ck.sec&&ck.sec.id==='hero';
 /* en los capítulos se sienta en una esquina de abajo de la pantalla (sobre la mesa) y se hace más chico cuando la cámara está cerca */
 let mSc=1;
 if(atHome){mSpot.copy(MHHOME)}else if(atHero){const hs=worldName==="cine"?[3.6,3.7]:[4.2,2.2];mSpot.set(hs[0],0,hs[1])}
 else{mNdc.set(mob?.5:.62,mob?-.42:-.5);mRay.setFromCamera(mNdc,C);if(mRay.ray.intersectPlane(mPlane,mHit)){mSpot.copy(mHit);mSpot.y=0}mSc=Math.max(.42,Math.min(1,cur.d/13))}
 if(cur.d>40||(mob&&!atHome&&!atHero))mSpot.copy(MHHOME);
 MASC.scale.setScalar(MASC.scale.x+(mSc-MASC.scale.x)*kf(3));
 mPrev.copy(MASC.position);MASC.position.x+=(mSpot.x-MASC.position.x)*kf(1.7);MASC.position.z+=(mSpot.z-MASC.position.z)*kf(1.7);
 const sp=Math.hypot(MASC.position.x-mPrev.x,MASC.position.z-mPrev.z),run=sp>.02;
 /* orientación: hacia donde corre; quieto, mira a la cámara */
 const want=run?Math.atan2(MASC.position.x-mPrev.x,MASC.position.z-mPrev.z):Math.atan2(C.position.x-MASC.position.x,C.position.z-MASC.position.z);
 let d=want-mYaw;d=Math.atan2(Math.sin(d),Math.cos(d));mYaw+=d*kf(run?8:3);MASC.rotation.y=mYaw;
 /* trote o respiración */
 let y=run&&!still?Math.abs(Math.sin(t*15))*.22:0;
 if(petT>0){const q=(now-petT)/650;if(q<1)y+=Math.sin(q*Math.PI)*.9;else if(now-petT>2400)petT=-1}
 MASC.position.y=y;if(mBlob){mBlob.position.set(MASC.position.x,.014,MASC.position.z);mBlob.material.opacity=.85*Math.max(.2,1-y*.8)}mBody.rotation.x=run?.12:0;mBody.scale.y=1+(still?0:Math.sin(t*2.2)*.015);
 /* la cabeza sigue al cursor (la lámpara) */
 if(!run){MASC.updateMatrixWorld();vF.copy(lampT);MASC.worldToLocal(vF);const yaw=Math.max(-.9,Math.min(.9,Math.atan2(vF.x,vF.z))),pitch=Math.max(-.35,Math.min(.25,-Math.atan2(1.4-vF.y,Math.hypot(vF.x,vF.z))*.6));
  headG.rotation.y+=(yaw-headG.rotation.y)*kf(5);headG.rotation.x+=(pitch-headG.rotation.x)*kf(5)}else{headG.rotation.y*=.9;headG.rotation.x*=.9}
 /* cola y orejas */
 const happy=petT>0||run;tailG.rotation.z=still?0:Math.sin(t*(happy?22:5.5))*(happy?.75:.3);
 if(now>earT){earT=now+2500+Math.random()*4000;ears[Math.random()<.5?0:1].userData.tw=now}
 ears.forEach((e,i)=>{const s=i?1:-1,tw=e.userData.tw&&now-e.userData.tw<260?Math.sin((now-e.userData.tw)/260*Math.PI)*.35:0;e.rotation.z=-s*(.16+(petT>0?-.12:0))+s*tw})}
shot('#mascota',MH,{az:.25,el:.52,d:6.4,fy:.9});
function dress(w){mascotDress(w);Object.entries(DECO).forEach(([k,gs])=>gs.forEach(g=>g.visible=k===w));
 CHAP.forEach((cl,i)=>{const u=VAR[w]&&VAR[w][i]?w:w==='oeste'?'kraft':w;cl.userData.base.forEach(o=>o.visible=u==='kraft'&&!VAR.kraft[i]);Object.keys(VAR).forEach(k=>{if(VAR[k][i])VAR[k][i].visible=k===u})})}
const HEROSET=new Set(Object.values(HEROES).map(h=>h.g));

/* ---------- llaves de scroll: en qué punto de la página empieza cada toma ---------- */
let keys=[],mob=false,pageH=0,finY0=1e9,finY1=1e9;var cur;const fv=new T.Vector3();
let offC=-1;function frame(){mob=innerWidth<760;offC=-1;applyOff(cur?cur.cen:0)}
/* desplaza el centro de la imagen: el objeto queda a la derecha (escritorio) o arriba (celular), el texto al otro lado; en el final, centrado */
function applyOff(c){const W=innerWidth,Hh=innerHeight;offC=c;C.setViewOffset(W,Hh,mob?0:-W*.2*(1-c),mob?Hh*.1*(1-c):0,W,Hh);C.updateProjectionMatrix()}
function layout(){pageH=H.scrollHeight;{const fn=document.getElementById('final');if(fn){finY0=fn.offsetTop;finY1=finY0+fn.offsetHeight}}const vh=innerHeight,max=Math.max(1,pageH-vh);
 keys=shots.map(s=>{const el=document.querySelector(s.sel);if(!el||!el.offsetParent&&el.tagName!=='FOOTER')return null;
  const top=el.getBoundingClientRect().top+scrollY,k=s.sel==='#hero'?0:s.sel==='#final'?Math.min(max,top-vh*.15):Math.min(max,Math.max(0,top-vh*.42));
  const sec=el.closest('section'),eb=sec&&sec.querySelector('.eyebrow'),h3=el.matches('.card')&&el.querySelector('h3');
  const lab=(h3?h3.textContent:eb?eb.textContent:'').replace(/\s+/g,' ').trim();return {s,k,el,sec,lab}}).filter(Boolean).sort((a,b)=>a.k-b.k);
 for(let i=1;i<keys.length;i++)if(keys[i].k<=keys[i-1].k+40)keys[i].k=keys[i-1].k+40;buildIndex()}
function pose(key,out){const s=key.s;if(s.obj){s.obj.getWorldPosition(fv);out.f.copy(fv)}else out.f.copy(s.f);out.f.y+=s.fy;out.f.x+=s.fx||0;out.cen=s.cen||0;out.az=s.az;out.el=s.el;out.d=mob?s.d*(innerWidth/innerHeight<.6?1.8:1.4):s.d;return out}
const P0={f:new T.Vector3()},P1={f:new T.Vector3()};cur={f:new T.Vector3(),az:.12,el:.98,d:13.2,cen:0},tgt={f:new T.Vector3()};let curKey=0,hold=1;
const sstep=x=>x<=0?0:x>=1?1:x*x*x*(x*(x*6-15)+10);
function target(y){if(!keys.length)return;let i=0;while(i<keys.length-1&&y>=keys[i+1].k)i++;curKey=i;
 if(i>=keys.length-1){pose(keys[i],tgt);hold=1;return}
 tgt.cen=0;
 const s=(y-keys[i].k)/(keys[i+1].k-keys[i].k),u=sstep((s-.45)/.55);hold=1-u;
 pose(keys[i],P0);pose(keys[i+1],P1);tgt.f.lerpVectors(P0.f,P1.f,u);
 let da=P1.az-P0.az;tgt.az=P0.az+da*u+(Math.min(s,.45)-.22)*.35*(1-u);   /* mientras lees, la cámara gira un poco alrededor del objeto */
 tgt.el=P0.el+(P1.el-P0.el)*u;tgt.cen=P0.cen+(P1.cen-P0.cen)*u;tgt.d=P0.d+(P1.d-P0.d)*u+Math.sin(u*Math.PI)*3.2}   /* a medio viaje se aleja: travelling */

/* ---------- interfaz de datos (HUD): etiquetas del hero, etiqueta del capítulo, índice y aviso ---------- */
const hud=document.createElement('div');hud.id='hud';hud.setAttribute('aria-hidden','true');
hud.innerHTML='<svg class="hud-l"><polyline/></svg><div class="hud-tag"><i></i><span></span></div><div class="hud-hint">Desliza para descubrir<b></b></div>';document.body.append(hud);
const hudLine=hud.querySelector('polyline'),tag=hud.querySelector('.hud-tag'),tagT=tag.querySelector('span'),hint=hud.querySelector('.hud-hint');
const stats=[...document.querySelectorAll('.stats > div')].map(d=>({n:(d.querySelector('[data-n]')||{}).dataset?.n||'',t:(d.querySelector('small')||{}).textContent||''}));
let anchors=[];function buildAnchors(w){anchors.forEach(a=>a.el.remove());anchors=HEROES[w].anc.slice(0,stats.length).map(([o,x,y,z],i)=>{const el=document.createElement('div');el.className='hud-lb';
 el.innerHTML=`<i></i><b>${String(stats[i].n).padStart(2,'0')}</b><span>${stats[i].t}</span>`;hud.append(el);return {o,off:new T.Vector3(x,y,z),el}})}
const idx=document.createElement('div');idx.id='chap';idx.setAttribute('role','navigation');idx.setAttribute('aria-label','Capítulos');document.body.append(idx);
function buildIndex(){const seen=new Set();idx.replaceChildren();keys.forEach((k,i)=>{if(!k.sec||seen.has(k.sec)||k.sec.id==='final')return;seen.add(k.sec);
 const a=document.createElement('a');a.href='#'+k.sec.id;const eb=k.sec.querySelector('.eyebrow i');a.innerHTML=`<b>${eb?eb.textContent:k.sec.id==='contact'?'✉':'00'}</b><span>${k.sec.id==='hero'?'Inicio':k.lab.replace(/^.*?—\s*/,'')}</span>`;a.dataset.sec=k.sec.id;idx.append(a)})}
const vp=new T.Vector3(),toScreen=(v,o)=>{vp.copy(v).project(C);o.x=(vp.x*.5+.5)*innerWidth;o.y=(-vp.y*.5+.5)*innerHeight;o.z=vp.z;return o},sp={};

/* ---------- motas de polvo en el haz de la lámpara ---------- */
const DN=lite?90:220,dp=new Float32Array(DN*3);for(let i=0;i<DN;i++)dp.set([rnd(-2.6,2.6),rnd(.2,7),rnd(-2.6,2.6)],i*3);
const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(dp,3));
const dust=new T.Points(dg,new T.PointsMaterial({color:0xffe2b0,size:.05,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));

/* ---------- Big Bang (comando de la terminal) ---------- */
const NB=lite?700:2200,bp=new Float32Array(NB*3),bv=[];
for(let i=0;i<NB;i++){const th=Math.random()*TAU,ph=Math.acos(2*Math.random()-1),sp2=.4+Math.random()*2.6;bv.push(Math.sin(ph)*Math.cos(th)*sp2,Math.sin(ph)*Math.sin(th)*sp2,Math.cos(ph)*sp2)}
const bg2=new T.BufferGeometry();bg2.setAttribute('position',new T.BufferAttribute(bp,3));
const bm=new T.PointsMaterial({color:0xe0c690,size:.09,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}),bpts=new T.Points(bg2,bm);bpts.frustumCulled=false;
const core=new T.Mesh(new T.SphereGeometry(.25,24,24),new T.MeshBasicMaterial({color:0xf1e4c4}));
const wave=new T.Mesh(new T.SphereGeometry(1,32,16),new T.MeshBasicMaterial({color:0xc4573a,wireframe:true,transparent:true,opacity:0}));
const bang0=grp(bpts,core,wave);bang0.position.set(0,2.5,0);bang0.visible=false;S.add(bang0);
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

/* ---------- tema: mesa y niebla siguen al tema elegido ---------- */
S.fog=new T.Fog(0xd8c29d,42,120);
function readTheme(){const cs=getComputedStyle(document.body),bg=cs.getPropertyValue('--bg').trim(),w=worldFromBody(),L=LOOK[w];
 if(w!==worldName){const prev=worldName;worldName=w;Object.entries(HEROES).forEach(([k,h])=>h.g.visible=k===w);deskMat.map=DESKS[w];deskMat.needsUpdate=true;buildAnchors(w);dress(w);
  if(prev&&!still&&scrollY<innerHeight*.5){HEROES[w].drop.forEach((o,i)=>{o.userData.drop={i,ox:rnd(-3,3),oy:rnd(7,11),oz:rnd(-3,3),rx:rnd(-2,2),rz:rnd(-2,2)}});dropT=performance.now()+1300}}
 const c=new T.Color(bg||'#d8c29d');S.fog.color.copy(c);
 if(w==='kraft'){deskMat.color.copy(c);const hsl={};c.getHSL(hsl);const darkT=hsl.l<.3;hemi.intensity=darkT?.34:.42;hemi.color.set(0xfff4e6);hemi.groundColor.set(0x6b4a2a);lamp.intensity=darkT?3.4:2.6}
 else{deskMat.color.set(0xffffff);hemi.intensity=L.hemi;hemi.color.set(L.sky);hemi.groundColor.set(L.gnd);lamp.intensity=L.li}
 lamp.color.set(L.lamp);dust.material.color.set(L.dust);rim.color.set(RIM[w][0]);rim.intensity=RIM[w][1];RIMU.uRimC.value.set(RIM[w][0]);RIMU.uRimK.value=RIMK[w];deskMat.bumpMap=DESKS[w];deskMat.bumpScale=.014;deskMat.needsUpdate=true;if(fx)fxWorld(w);dust.material.opacity=w==='kraft'?.5:.7}
readTheme();new MutationObserver(()=>readTheme()).observe(document.body,{attributes:true,attributeFilter:['class']});

/* ---------- entrada: ratón, dedo, inclinación, tamaño ---------- */
let mx=0,my=0,hasMouse=false;const ndc=new T.Vector2(),ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
let sx=0,sy2=0,lastTouch=-1e9;
addEventListener('mousemove',e=>{if(touch)return;mx=e.clientX/innerWidth*2-1;my=-(e.clientY/innerHeight*2-1);sx=mx;sy2=my;hasMouse=true},{passive:true});
const onT=e=>{const p=e.touches&&e.touches[0];if(!p)return;mx=p.clientX/innerWidth*2-1;my=-(p.clientY/innerHeight*2-1);lastTouch=performance.now()};
addEventListener('touchstart',onT,{passive:true});addEventListener('touchmove',onT,{passive:true});
addEventListener('deviceorientation',e=>{if(e.gamma!=null)sx=Math.max(-1,Math.min(1,e.gamma/28))},{passive:true});
frame();layout();addEventListener('load',layout);if(document.fonts)document.fonts.ready.then(layout);
{let lw=innerWidth,lh=innerHeight,tm;addEventListener('resize',()=>{clearTimeout(tm);tm=setTimeout(()=>{if(innerWidth===lw&&Math.abs(innerHeight-lh)<150)return;lw=innerWidth;lh=innerHeight;C.aspect=lw/lh;R.setSize(lw,lh);if(fx){fx.comp.setSize(lw,lh);fx.fin.uniforms.uRes.value.set(lw,lh)}frame();layout()},120)})}
target(scrollY);cur.f.copy(tgt.f);cur.az=tgt.az;cur.el=tgt.el;cur.d=tgt.d;cur.cen=tgt.cen||0;applyOff(cur.cen);

/* ---------- scroll suave con la rueda (solo ratón) ---------- */
let sTo=scrollY,sCur=scrollY,sOn=false;
const canScroll=el=>{for(;el&&el!==document.body&&el!==H;el=el.parentElement){const o=getComputedStyle(el).overflowY;if((o==='auto'||o==='scroll')&&el.scrollHeight>el.clientHeight+2)return true}return false};
if(!touch&&!still){addEventListener('wheel',e=>{if(e.ctrlKey||H.classList.contains('bb')||document.body.classList.contains('doomon')||canScroll(e.target))return;
  e.preventDefault();if(!sOn)sTo=sCur=scrollY;const d=e.deltaMode===1?e.deltaY*40:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;sTo=Math.max(0,Math.min(H.scrollHeight-innerHeight,sTo+d));sOn=true},{passive:false});
 addEventListener('keydown',()=>{sOn=false},true);addEventListener('pointerdown',()=>{sOn=false},true)}
function smooth(raw){if(!sOn)return;sCur+=(sTo-sCur)*(1-Math.exp(-raw*10));if(Math.abs(sTo-sCur)<.6){sCur=sTo;sOn=false}window.scrollTo({top:sCur,behavior:'instant'})}

/* ---------- la lámpara responde al contenido: al pasar por una tarjeta alumbra su objeto ---------- */
let focus=null;const fpos=new T.Vector3();
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 const key={};tools.forEach(o=>{if(o.userData.key)key[o.userData.key]=o});
 const first=sel=>{const s=shots.find(x=>x.sel===sel);if(!s||!s.obj)return null;return tools.includes(s.obj)?s.obj:s.obj.children.find(c=>tools.includes(c))};
 document.querySelectorAll('section .card').forEach(card=>{const sec=card.closest('section');if(!sec)return;const tx=card.textContent;
  const o=sec.id==='projects'?(/Rack/.test(tx)?key.rack:/Triki Radar/.test(tx)?key.radar:/Optimizador/.test(tx)?key.opt:/Agenda de citas/.test(tx)?key.agenda:/Panel de administraci/.test(tx)?key.admin:/Este portafolio/.test(tx)?key.site:null):first('#'+sec.id);if(!o)return;
  const pick=()=>{let c=o;while(c&&!CHAP.includes(c))c=c.parent;return c&&VMAIN[worldName]&&VMAIN[worldName].get(c)||o};card.addEventListener('pointerenter',()=>{focus=pick()});card.addEventListener('pointerleave',()=>{focus=null})})}

/* ---------- el hero se arma: las piezas caen sobre la mesa una tras otra ---------- */
const bounce=x=>{const n=7.5625,d=2.75;return x<1/d?n*x*x:x<2/d?n*(x-=1.5/d)*x+.75:x<2.5/d?n*(x-=2.25/d)*x+.9375:n*(x-=2.625/d)*x+.984375};
let dropT=-1;const dropOn=!still&&scrollY<innerHeight*.5;
if(dropOn)HEROES[worldName].drop.forEach((o,i)=>{o.userData.drop={i,ox:rnd(-3,3),oy:rnd(7,11),oz:rnd(-3,3),rx:rnd(-2,2),rz:rnd(-2,2)}});
hud.classList.toggle('pre',dropOn);


/* ---------- FINAL: la mesa completa como mapa del recorrido (se puede tocar para volver a cada capítulo) ---------- */
const mapEls=[],ROUTE_COL={kraft:0x5a4530,cine:0xe6b450,pc:0x0a58ca,hacker:0x39ff88,oeste:0x8e2a1a};
const mapCap=document.createElement('div');mapCap.className='map-cap';hud.append(mapCap);
const CAPS={kraft:'Fin del recorrido · toca una pieza para volver',cine:'FIN · Gracias por ver',pc:'¿Qué programa desea abrir?',hacker:'> conexión finalizada. elige un nodo_',oeste:'Fin del camino, forastero · elige una parada'};
const clusterOf=o=>{while(o&&o.parent!==world)o=o.parent;return o};
let route=null,routePulse=null,routeCurve=null,mapHover=null;
function buildMap(){mapEls.forEach(m=>m.el.remove());mapEls.length=0;const seen=new Set(),pts=[];
 keys.forEach(k=>{if(!k.sec||k.sec.id==='final'||!k.s.obj)return;const cl=clusterOf(k.s.obj);if(!cl||seen.has(cl))return;seen.add(cl);
  const ci=CHAP.indexOf(cl),num=String(mapEls.length).padStart(2,'0'),name=cl===MH?'Guardián':ci<0?'Inicio':['El Rack','Optimizador','Panel admin','Este portafolio','Servicios','Sobre mí','Stack','Trayectoria','Formación','Tu orden','Tarjeta','Estado','Contacto'][ci];
  const el=document.createElement('a');el.className='map-lb';el.href='#'+k.sec.id;el.innerHTML=`<i></i><b>${num}</b><span>${name}</span><em>10.0.0.${mapEls.length+2}</em>`;hud.append(el);
  const m={el,cl,sec:k.sec,k:k.k};el.addEventListener('click',e=>{e.preventDefault();goMap(m)});el.addEventListener('pointerenter',()=>{mapHover=m});el.addEventListener('pointerleave',()=>{if(mapHover===m)mapHover=null});
  mapEls.push(m);pts.push(new T.Vector3(cl.position.x,.08,cl.position.z))});
 if(route){S.remove(route);route.geometry.dispose()}if(pts.length<2)return;
 routeCurve=new T.CatmullRomCurve3(pts);const g=new T.BufferGeometry().setFromPoints(routeCurve.getPoints(pts.length*24));
 route=new T.Line(g,new T.LineDashedMaterial({color:ROUTE_COL.kraft,dashSize:.9,gapSize:.55,transparent:true,opacity:0}));route.computeLineDistances();S.add(route);
 if(!routePulse){routePulse=new T.Mesh(new T.SphereGeometry(.45,16,12),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}));S.add(routePulse)}}
function goMap(m){document.body.classList.remove('finale');window.scrollTo({top:Math.max(0,m.k+2),behavior:'smooth'})}
/* clic sobre la mesa: se lanza un rayo y se va al capítulo del objeto tocado */
const visibleUp=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
function pickMap(cx,cy){ndc.set(cx/innerWidth*2-1,-(cy/innerHeight*2-1));ray.setFromCamera(ndc,C);const hits=ray.intersectObjects(world.children,true);
 for(const h of hits){if(!visibleUp(h.object))continue;const cl=clusterOf(h.object);const m=mapEls.find(x=>x.cl===cl);if(m)return m}return null}
let mapMoveT=0;
addEventListener('pointermove',e=>{if(!document.body.classList.contains('finale')||e.target.closest&&e.target.closest('.map-lb,a,button'))return;const n=performance.now();if(n-mapMoveT<60)return;mapMoveT=n;
 const m=pickMap(e.clientX,e.clientY);mapHover=m;document.body.classList.toggle('map-pt',!!m);const r=document.getElementById('cr');if(r)r.classList.toggle('h',!!m)},{passive:true});
addEventListener('click',e=>{if(!document.body.classList.contains('finale')||e.target.closest&&e.target.closest('a,button,input,textarea,#term,#wpick'))return;const m=pickMap(e.clientX,e.clientY);if(m)goMap(m)});
function mapFrame(now,vis){const w=worldName;if(route){route.material.color.set(ROUTE_COL[w]);route.material.opacity=vis*(w==='hacker'?.9:.7);route.visible=vis>.01;
  routePulse.visible=vis>.01;routePulse.material.color.set(ROUTE_COL[w]);routePulse.material.opacity=vis;const u=(now/1e3*.045)%1;routeCurve.getPointAt(u,routePulse.position);routePulse.position.y=.5;
  const sc=w==='hacker'?1:w==='cine'?1.2:.8;routePulse.scale.setScalar(sc*(1+.25*Math.sin(now/180)))}
 hud.style.setProperty('--mv',vis.toFixed(3));if(mapCap.dataset.w!==w){mapCap.dataset.w=w;mapCap.textContent=CAPS[w]}
 if(vis<.01)return;mapEls.forEach(m=>{m.cl.getWorldPosition(tmp);tmp.y=2.2;toScreen(tmp,sp);m.el.style.transform=`translate(${sp.x.toFixed(1)}px,${sp.y.toFixed(1)}px)`;m.el.classList.toggle('on',mapHover===m)});
 if(mapHover&&!focus){const mm=VMAIN[worldName]&&VMAIN[worldName].get(mapHover.cl)||mapHover.cl.userData.base&&mapHover.cl.userData.base.find(o=>tools.includes(o));if(mm){mm.getWorldPosition(fpos);fpos.y=0;lampT.lerp(fpos,.12)}}}
let mapKeys=null;
/* ---------- bucle ---------- */
const lampT=new T.Vector3(2,0,-1),wp=new T.Vector3(),tmp=new T.Vector3();let relayout=false;new ResizeObserver(()=>{relayout=true}).observe(document.body);
let ft=0,fc=0,dprCut=false;
let lastY=scrollY,vel=0,raf=0,f=0,lastR=0,lt=performance.now(),spin=0,activeSec='';
function loop(){raf=requestAnimationFrame(loop);const now=performance.now();if(lite&&now-lastR<32)return;lastR=now;
 const os=document.getElementById('os');if(os&&os.classList.contains('on'))return;
 const raw=Math.min(1,(now-lt)/1e3),dt=Math.min(.05,raw),kf=r=>1-Math.exp(-raw*r);lt=now;
 ft+=raw;if(++fc===90){const av=ft/fc;if(fx&&fx.on&&now-fx.t0>4000&&!document.hidden){fx.bad=av>.022?fx.bad+1:0;if(fx.bad>=2)fxOff()}if(fx&&fx.on){}else if(!dprCut&&av>.024&&R.getPixelRatio()>1){dprCut=true;R.setPixelRatio(1);R.setSize(innerWidth,innerHeight);if(fx)fx.comp.setPixelRatio(1)}ft=fc=0}
 smooth(raw);
 const y=scrollY;vel+=((y-lastY)/Math.max(dt,.001)/2000-vel)*.1;lastY=y;
 /* cámara: persigue la toma del capítulo con suavidad */
 target(y);const k=kf(still?40:3.6);cur.f.lerp(tgt.f,k);cur.az+=(tgt.az-cur.az)*k;cur.el+=(tgt.el-cur.el)*k;cur.d+=(tgt.d-cur.d)*k;cur.cen+=((tgt.cen||0)-cur.cen)*k;
 if(Math.abs(cur.cen-offC)>.004)applyOff(cur.cen);
 S.fog.near=Math.max(42,cur.d*.85);S.fog.far=Math.max(120,cur.d*2.3);
 /* final: solo la mesa completa; el resto de la interfaz se esconde */
 const fin=y>finY0-innerHeight*.4&&y<finY1-innerHeight*1.05;if(fin!==document.body.classList.contains('finale'))document.body.classList.toggle('finale',fin);
 const az=cur.az+sx*.07,el=Math.min(1.45,Math.max(.25,cur.el+sy2*.035));
 C.position.set(cur.f.x+Math.sin(az)*Math.cos(el)*cur.d,cur.f.y+Math.sin(el)*cur.d,cur.f.z+Math.cos(az)*Math.cos(el)*cur.d);C.lookAt(cur.f);
 const far=cur.d>30,hg=HEROES[worldName].g;world.children.forEach(cl=>{const near=far||Math.hypot(cl.position.x-cur.f.x,cl.position.z-cur.f.z)<25;cl.visible=HEROSET.has(cl)?cl===hg&&near:near});
 const t=now/1e3;
 /* lámpara: sigue al ratón o al dedo; si no, se pasea alrededor del objeto del capítulo */
 const idle=touch?now-lastTouch>2500:!hasMouse;
 if(focus){focus.getWorldPosition(fpos);fpos.y=0;lampT.lerp(fpos,kf(4))}
 else if(!idle){ndc.set(mx,my);ray.setFromCamera(ndc,C);if(ray.ray.intersectPlane(plane,hit))lampT.lerp(hit,kf(8))}
 else{tmp.set(cur.f.x+Math.sin(t*.45)*2.4,0,cur.f.z+Math.sin(t*.33+1)*1.8);lampT.lerp(tmp,kf(2.5))}
 lamp.position.set(lampT.x-1.6,9.5,lampT.z+2.6);lamp.target.position.copy(lampT);lamp.target.updateMatrixWorld();
 if(!still){spin+=dt*(.35+Math.min(3,Math.abs(vel))*1.5);
  const a=dust.geometry.attributes.position;for(let i=0;i<DN;i++){let yy=a.getY(i)+dt*.12;if(yy>7)yy=.2;a.setY(i,yy);a.setX(i,a.getX(i)+Math.sin(t*.6+i)*.002)}a.needsUpdate=true}
 dust.position.set(lampT.x-.5,0,lampT.z+.8);
 spinners.forEach(([g,k2])=>g.userData.spin.rotation.y=spin*k2);
 /* caída inicial del hero (empieza cuando se abre el telón) */
 if(dropOn&&dropT<0&&!H.classList.contains('bb'))dropT=now+250;
 /* los objetos cerca de la luz se levantan un poco (su sombra se separa) */
 tools.forEach(o=>{if(!o.parent.visible)return;o.getWorldPosition(wp);const u=o.userData,d=Math.hypot(wp.x-lampT.x,wp.z-lampT.z),tg=still?0:o===focus?.8:Math.pow(Math.max(0,1-d/3.4),2)*.6;
  u.lift+=(tg-u.lift)*kf(5);let ox=0,oy=0,oz=0,rx=0,rz=0;
  if(u.drop){const dr=u.drop,q=dropT<0?0:Math.min(1,Math.max(0,(now-dropT-dr.i*110)/950));if(q>=1)delete u.drop;else{const e=1-ease(q),b=1-bounce(q);ox=dr.ox*e;oz=dr.oz*e;oy=dr.oy*b;rx=dr.rx*e;rz=dr.rz*e}}
  o.position.set(u.bx+ox,u.lift+oy,u.bz+oz);if(u.blob){u.blob.position.x=o.position.x+u.bo[0];u.blob.position.z=o.position.z+u.bo[1];u.blob.material.opacity=.85*Math.max(.15,1-o.position.y*.7)}o.rotation.x=u.lift*.12*Math.sin(t*1.7+u.ph)+rx;o.rotation.z=u.lift*.12*Math.cos(t*1.3+u.ph)+rz});
 needles.forEach(c=>{if(!c.parent.visible)return;c.getWorldPosition(wp);const want=Math.atan2(-(lampT.x-wp.x),-(lampT.z-wp.z))-c.rotation.y,n=c.userData.needle;let d=want-n.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));n.rotation.y+=d*kf(5)});
 leds.forEach((l,i)=>l.material.emissiveIntensity=.4+.6*(.5+.5*Math.sin(t*4+i)));
 mascotFrame(now,t,kf,keys[curKey]);pvFrame(now,dt);
 /* mapa del final: aparece cuando la cámara se aleja para ver toda la mesa */
 if(keys!==mapKeys){mapKeys=keys;buildMap()}
 mapFrame(now,Math.max(0,Math.min(1,(cur.d-40)/40)));
 /* HUD */
 const dropped=!dropOn||(dropT>0&&now-dropT>HEROES[worldName].drop.length*110+700);if(dropped&&hud.classList.contains('pre'))hud.classList.remove('pre');
 const heroVis=keys.length>1?Math.max(0,1-y/Math.max(1,keys[1].k*.55)):1;hud.style.setProperty('--hv',heroVis.toFixed(3));
 if(heroVis>0){const pts=[];anchors.forEach(a=>{a.o.getWorldPosition(tmp).add(a.off);toScreen(tmp,sp);a.el.style.transform=`translate(${sp.x.toFixed(1)}px,${sp.y.toFixed(1)}px)`;pts.push(sp.x.toFixed(1)+','+sp.y.toFixed(1))});hudLine.setAttribute('points',pts.join(' '))}
 const ck=keys[curKey];if(ck){if(ck.s.obj&&curKey>0){ck.s.obj.getWorldPosition(tmp);tmp.y+=ck.s.fy+.9;toScreen(tmp,sp);tag.style.transform=`translate(${sp.x.toFixed(1)}px,${sp.y.toFixed(1)}px)`;
   if(tagT.textContent!==ck.lab)tagT.textContent=ck.lab;tag.style.opacity=ck.lab?(Math.max(0,hold*1.6-.6)).toFixed(3):0}else tag.style.opacity=0;
  const sid=ck.sec?ck.sec.id:'';if(sid!==activeSec){activeSec=sid;idx.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.dataset.sec===sid))}}
 hint.classList.toggle('off',y>40);
 if(++f%45===0&&relayout){relayout=false;layout()}
 if(bt>=0)bang(now);if(fx&&fx.on){fx.fin.uniforms.uTime.value=now/1e3;fx.comp.render()}else R.render(S,C)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(!raf){lt=performance.now();loop()}});
/* sombras de contacto: una mancha suave bajo cada objeto, que se aclara cuando el objeto se levanta */
const blobTex=tex(128,128,(g,w)=>{const gr=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(.55,'rgba(0,0,0,.22)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,w)});
const blobM=()=>new T.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false,opacity:.85});
world.updateMatrixWorld(true);{const bb=new T.Box3(),bs=new T.Vector3(),bc=new T.Vector3();
 tools.forEach(o=>{if(!o.parent)return;bb.setFromObject(o);bb.getSize(bs);if(!isFinite(bs.x)||bs.x<.05)return;const m=new T.Mesh(new T.PlaneGeometry(1,1),blobM());m.rotation.x=-Math.PI/2;
  m.scale.set(bs.x*1.25+.35,bs.z*1.25+.35,1);bb.getCenter(bc);o.parent.worldToLocal(bc);m.position.set(bc.x,.013,bc.z);m.renderOrder=-1;o.parent.add(m);o.userData.blob=m;o.userData.bo=[bc.x-o.position.x,bc.z-o.position.z]})}
mBlob=new T.Mesh(new T.PlaneGeometry(2.2,2.2),blobM());mBlob.rotation.x=-Math.PI/2;mBlob.renderOrder=-1;world.add(mBlob);
/* contorno de luz: las figuras sólidas reciben un borde iluminado (fresnel) del color del mundo; la mesa, papeles y pantallas no */
function patchRim(mt){if(!mt||!mt.isMeshStandardMaterial||mt.map||mt.transparent||mt===deskMat||mt.userData.rim)return;mt.userData.rim=1;
 mt.onBeforeCompile=sh=>{sh.uniforms.uRimC=RIMU.uRimC;sh.uniforms.uRimK=RIMU.uRimK;sh.fragmentShader='uniform vec3 uRimC;\nuniform float uRimK;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',
  '#include <emissivemap_fragment>\n{float fr=1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);totalEmissiveRadiance+=uRimC*uRimK*pow(fr,3.0)*(1.0-.65*metalnessFactor);}')};mt.needsUpdate=true}
S.traverse(o=>{if(o.isMesh)[].concat(o.material).forEach(patchRim)});
Object.values(HEROES).forEach(h=>h.g.visible=true);Object.values(DECO).forEach(gs=>gs.forEach(g=>g.visible=true));Object.values(VAR).forEach(o=>Object.values(o).forEach(g=>g&&(g.visible=true)));Object.values(WEAR).forEach(o=>Object.values(o).forEach(g=>g.visible=true));try{R.compile(S,C)}catch(e){}dress(worldName);texs.forEach(x=>{try{R.initTexture&&R.initTexture(x)}catch(e){}});
Object.entries(HEROES).forEach(([k,h])=>h.g.visible=k===worldName);
/* ---------- EFECTOS DE IMAGEN por mundo (solo computadoras con buena tarjeta gráfica) ----------
   Escena → brillo (bloom) → paso final propio: tono ACES + sRGB una sola vez y luego el efecto del mundo
   (taller: viñeta cálida y grano · cine: brillo dorado, parpadeo y grano · computadora: CRT · hacker: neón, escaneo y separación de color) */
var fx=null;
const FXB={kraft:.12,cine:.42,pc:.1,hacker:.5,oeste:.2},FXM={kraft:0,cine:1,pc:2,hacker:3,oeste:4};
function fxWorld(w){if(!fx)return;fx.fin.uniforms.uMode.value=FXM[w]||0;fx.bloom.strength=FXB[w]||.2}
function fxOff(){if(!fx)return;fx.on=false;R.toneMapping=T.ACESFilmicToneMapping;console.info('Taller 3D: efectos apagados para mantener la fluidez')}
const loadJS=u=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=ko;document.head.append(s)});
if(!touch&&!lite&&R.capabilities.isWebGL2){const B='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
 (async()=>{try{for(const f of['shaders/CopyShader.js','shaders/LuminosityHighPassShader.js','postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/ShaderPass.js','postprocessing/UnrealBloomPass.js'])await loadJS(B+f);
  if(!T.EffectComposer)return;const W=innerWidth,Hh=innerHeight,rt=T.WebGLMultisampleRenderTarget?new T.WebGLMultisampleRenderTarget(W,Hh,{type:T.HalfFloatType,format:T.RGBAFormat}):new T.WebGLRenderTarget(W,Hh,{type:T.HalfFloatType,format:T.RGBAFormat});if(rt.samples!==undefined)rt.samples=4;
  lamp.shadow.mapSize.set(2048,2048);if(lamp.shadow.map){lamp.shadow.map.dispose();lamp.shadow.map=null}
  const comp=new T.EffectComposer(R,rt);comp.setPixelRatio(R.getPixelRatio());comp.setSize(W,Hh);comp.addPass(new T.RenderPass(S,C));
  const bloom=new T.UnrealBloomPass(new T.Vector2(W,Hh),.2,.35,1.35);comp.addPass(bloom);
  const fin=new T.ShaderPass({uniforms:{tDiffuse:{value:null},uTime:{value:0},uMode:{value:0},uRes:{value:new T.Vector2(W,Hh)},uExp:{value:.94}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime;uniform int uMode;uniform vec2 uRes;uniform float uExp;varying vec2 vUv;
    vec3 aces(vec3 x){x*=uExp;return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
    vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c));}
    float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec2 uv=vUv;
     vec4 base=texture2D(tDiffuse,uv);vec3 col=base.rgb;
     if(uMode==3){float o=.0011;col=vec3(texture2D(tDiffuse,uv+vec2(o,0.)).r,col.g,texture2D(tDiffuse,uv-vec2(o,0.)).b);}
     col=srgb(aces(col));vec2 q=vUv-.5;float vig=smoothstep(.9,.25,length(q*vec2(1.05,1.)));float g=hash(floor(vUv*uRes)+fract(uTime*7.)*91.)-.5;
     if(uMode==0){col=mix(col,col*vec3(1.03,.99,.93),.5);col*=mix(.88,1.,vig);col+=g*.022;}
     else if(uMode==1){col=mix(col,col*vec3(1.05,.98,.9),.45);col*=mix(.74,1.,vig);col+=g*.035;col*=.992+.008*sin(uTime*46.);}
     else if(uMode==2){col*=.985+.015*sin(vUv.y*uRes.y*1.5708);col*=mix(.94,1.,vig);}
     else if(uMode==3){col*=.94+.06*sin(vUv.y*uRes.y*1.5708);col*=mix(.78,1.,vig);col+=g*.02;}
     else{float l=dot(col,vec3(.299,.587,.114));col=mix(col,vec3(l)*vec3(1.1,.96,.8),.16);col*=vec3(1.03,1.,.94);col*=mix(.8,1.,vig);col+=g*.03;}
     gl_FragColor=vec4(col,base.a);}`});
  comp.addPass(fin);fx={comp,bloom,fin,on:true,t0:performance.now(),bad:0};R.toneMapping=T.NoToneMapping;fxWorld(worldName);
 }catch(e){console.warn('Taller 3D: efectos no disponibles',e)}})()}
loop();
}catch(err){console.error('Taller 3D:',err);H.classList.remove('bb','has3d')}
})();

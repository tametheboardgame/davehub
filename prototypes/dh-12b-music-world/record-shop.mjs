// DH-12B.1: a genuinely separate 3D record emporium, not a set in
// the Impossible Theatre. No audio or private, unapproved music data.
import * as THREE from './vendor/three-r159.module.min.js';
import {RACKS,rackFor,shopDestination,pullPosition,spinDisc,motion,focusAction}
 from './record-shop-mechanics.mjs?v=dh12b1-music-portals-v1';
import {buildRecordDimension} from './dimensional-art.mjs?v=dh12b2-dimensional-world-v1';
import {parseApprovedCatalogue,recordsForRack} from './approved-catalogue-client.mjs?v=dh12c2-approved-catalogue-v1';

const canvas=document.getElementById('record-shop-canvas');
const status=document.getElementById('record-shop-status');
const description=document.getElementById('record-shop-description');
const caption=document.getElementById('record-shop-caption');
const overview=document.getElementById('record-shop-overview');
const cataloguePanel=document.getElementById('record-shop-catalogue');
const catalogueItems=document.getElementById('record-shop-catalogue-items');
let approvedRecords=[];
const controls=Object.fromEntries(RACKS.map(r=>[r.id,document.getElementById('record-shop-'+r.id)]));
controls.listening=document.getElementById('record-shop-disc');
if(!canvas||!status||!description||!caption||!overview||
 Object.values(controls).some(x=>!x))throw Error('Record Shop needs the three shelves and listening controls');
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
let renderer=null;
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1.5));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.34;
}catch(e){
 status.textContent='3D view unavailable. The shelf controls still describe the shop.';
 console.warn('Record Shop WebGL unavailable',e);
}
const scene=new THREE.Scene();
scene.background=new THREE.Color('#0c172b');
scene.fog=new THREE.FogExp2('#151f32',.019);
const camera=new THREE.PerspectiveCamera(44,1,.1,100);
camera.position.set(7.4,5,12.7);
const aim=new THREE.Vector3(0,2.1,-1.25);
camera.lookAt(aim);
const destination=camera.position.clone(),target=aim.clone();
function mat(colour,rough=.72,metalness=.02){
 return new THREE.MeshStandardMaterial({color:colour,roughness:rough,metalness});
}
const oak=mat('#72503e'),darkOak=mat('#493638'),gold=mat('#d6ac6b',.38,.55),
 turquoise=mat('#397477'),violet=mat('#76546f'),
 cream=mat('#f1deb9'),ink=mat('#241d25',.48,.09);
const paperMats=RACKS.map(r=>mat(r.colour,.88,.01));
function group(name,parent=scene,x=0,y=0,z=0){
 const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;
}
function box(name,dims,loc,material,parent=scene){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(...dims),material);
 mesh.name=name;mesh.position.set(...loc);mesh.castShadow=true;mesh.receiveShadow=true;
 parent.add(mesh);return mesh;
}
function disk(name,rad,height,loc,material,parent=scene){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,height,48),material);
 mesh.name=name;mesh.position.set(...loc);mesh.castShadow=true;mesh.receiveShadow=true;
 parent.add(mesh);return mesh;
}
function torus(name,radius,tube,loc,material,parent=scene){
 const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,72),material);
 mesh.name=name;mesh.position.set(...loc);parent.add(mesh);return mesh;
}
function orb(name,radius,loc,material,parent=scene){
 const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(radius,1),material);
 mesh.name=name;mesh.position.set(...loc);mesh.castShadow=true;parent.add(mesh);return mesh;
}
function label(text,w=1.3){
 const cv=document.createElement('canvas');cv.width=720;cv.height=180;
 const c=cv.getContext('2d');c.fillStyle='#f0e0bf';c.fillRect(0,0,720,180);
 c.strokeStyle='#805e57';c.lineWidth=12;c.strokeRect(6,6,708,168);
 c.fillStyle='#342832';c.textAlign='center';c.textBaseline='middle';c.font='bold 71px Georgia,serif';
 c.fillText(text.toUpperCase(),360,94,675);
 const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
 return new THREE.Mesh(new THREE.PlaneGeometry(w,w*.25),
  new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
}
const ambient=new THREE.HemisphereLight('#f7e0c3','#384653',1.45);scene.add(ambient);
const sun=new THREE.DirectionalLight('#ffe7b6',1.7);sun.position.set(-4,9,7);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const lamp=new THREE.PointLight('#f6c58d',51,13,2);
lamp.position.set(0,5.3,2.0);scene.add(lamp);
const accent=new THREE.PointLight('#9bd4c6',30,9,2);accent.position.set(4.5,3.7,1.0);scene.add(accent);
// The shop is a walk-in timber room. The three racks are not flat cards.
box('real-shop-floor',[11.9,.34,10.8],[0,-.29,-.85],oak);
// This is NOT a sealed rectangular shop. Real lower walls and side pilasters
// leave arched openings to the impossible cosmic space beyond the racks.
box('rear-shop-moonstone-parapet',[11.9,1.02,.31],[0,.44,-5.9],darkOak);
for(const side of [-1,1]){
 box('open-side-gallery-parapet-'+side,[.34,1.15,7.6],
  [side*5.85,.48,-1.55],darkOak);
 box('crooked-corner-pilaster-'+side,[.42,4.40,.53],
  [side*5.80,2.15,-5.47],gold);
}
box('sculpted-ceiling-beam',[11.2,.25,.32],[0,5.0,-5.47],gold);
for(let i=0;i<14;i++)box('oak-floor-board-'+i,
 [11.4,.025,.08],[0,-.09,-5.5+i*.70],i%2?gold:darkOak);
for(const x of [-5.35,5.35])for(const z of [-4,1.0])
 box('wooden-pillar',[.28,4.9,.28],[x,2.4,z],gold);
for(let i=0;i<9;i++)torus('celestial-shop-orbital-'+i,
 .29+i*.09,.014,[0,4.43,-3.1],i%2?gold:cream).rotation.x=Math.PI/2;
const sign=label('THE RECORD EMPORIUM',3.2);
sign.position.set(0,4.20,-5.68);scene.add(sign);
// Ornate hanging pendant and actual fitted turntable.
const lightRig=group('brass-pendant',scene,0,5.0,1.2);
box('pendant-chain',[.04,.82,.04],[0,-.37,0],gold,lightRig);
disk('pendant-bell',.55,.19,[0,-.82,0],gold,lightRig);
orb('pendant-warm-bulb',.28,[0,-.94,0],cream,lightRig);
const rugs=group('needlepoint-rug');
box('ribbon-border',[8.7,.024,3.0],[0,-.09,1.2],violet,rugs);
box('ragged-rug',[8.45,.032,2.75],[0,-.077,1.2],turquoise,rugs);
for(let i=0;i<13;i++){
 const x=-3.75+i*.625;
 orb('rug-circular-motif-'+i,.055,[x,-.05,1.2],gold,rugs);
}
const pickables=[],crates={};
function register(root,id){
 root.traverse(node=>{if(node.isMesh){node.userData.recordShopAction=id;pickables.push(node);}});
}
for(const [index,r] of RACKS.entries()){
 const x=(index-1)*3.28;
 const rack=group('three-dimensional-record-rack-'+r.id,scene,x,.07,-3.24);
 const accentMat=paperMats[index];
 box(r.id+'-case',[2.65,3.05,.95],[0,1.62,0],oak,rack);
 box(r.id+'-backing',[2.37,2.74,.11],[0,1.64,.51],darkOak,rack);
 for(const side of [-1,1]){
  box(r.id+'-upright',[.14,3.05,.99],[side*1.29,1.62,.02],gold,rack);
 }
 const title=label(r.name,index===1?2.13:1.98);
 title.name=r.id+'-real-inscription';title.position.set(0,3.26,.55);rack.add(title);
 for(let shelf=0;shelf<2;shelf++){
  box(r.id+'-back-shelf-'+shelf,[2.48,.11,.86],[0,.66+shelf*1.38,.10],gold,rack);
 }
 const drawer=group('real-record-pull-out-'+r.id,rack,0,.68,.58);
 box(r.id+'-crate-base',[2.23,.11,.94],[0,0,.20],darkOak,drawer);
 box(r.id+'-crate-front',[2.28,.68,.11],[0,.38,.75],accentMat,drawer);
 box(r.id+'-crate-back',[2.22,.43,.11],[0,.34,-.24],gold,drawer);
 for(const side of [-1,1])box(r.id+'-crate-side',[.11,.44,.95],
  [side*1.08,.33,.26],gold,drawer);
 box(r.id+'-brass-handle',[.53,.11,.12],[0,.38,.83],gold,drawer);
 // Unpublished projects are NOT represented by invented real titles:
 // blank, distinct, three-dimensional sleeve placeholders only.
 for(let i=0;i<8;i++){
  const sleeve=box(r.id+'-unfiled-sleeve-'+i,
   [.21,.72,.68],[(i-3.5)*.25,.55,.12+(i%3)*.03],
   i%3===0?cream:i%3===1?accentMat:violet,drawer);
  sleeve.rotation.y=(i-3.5)*.028;
  box('sleeve-gold-spine-'+i,[.022,.63,.02],
   [(i-3.5)*.25,.55,.48+(i%3)*.03],gold,drawer);
 }
 // Abstract covers remain unlabelled until a separately approved projection exists.
 const displayCovers=[];
 for(let i=0;i<5;i++){
  const cover=box(r.id+'-display-sleeve-'+i,[.39,.73,.06],
   [(i-2)*.43,2.57,.54],i%2?accentMat:cream,rack);
  displayCovers.push(cover);
  orb('display-emblem-'+i,.07,[(i-2)*.43,2.61,.59],gold,rack);
 }
 register(rack,r.id);
 crates[r.id]={rack,drawer,displayCovers,homeZ:.58};
}
// The listening desk uses a real disc and tonearm, but cannot play any
// recording until a future publishing and rights approval.
const listening=group('record-shop-listening-desk',scene,3.75,.01,2.45);
box('listening-oak-plinth',[2.35,.32,1.73],[0,.69,0],oak,listening);
box('listening-brass-rim',[2.42,.055,1.79],[0,.88,0],gold,listening);
const disc=group('real-listening-record',listening,-.38,.95,0);
disk('large-grooved-vinyl',.62,.032,[0,0,0],ink,disc);
for(let i=0;i<7;i++){
 const groove=torus('record-physical-groove-'+i,.19+i*.06,.007,[0,.018,0],gold,disc);
 groove.rotation.x=Math.PI/2;
}
disk('plain-unpublished-label',.16,.038,[0,.023,0],turquoise,disc);
disk('spindle',.024,.12,[0,.09,0],gold,disc);
const arm=group('pivoted-real-listening-tonearm',listening,.72,.98,-.51);
disk('tonearm-bearing',.10,.12,[0,0,0],gold,arm);
box('tonearm-main-bar',[.075,.065,.89],[-.22,.12,.37],gold,arm).rotation.y=-.35;
box('tonearm-needle-head',[.15,.08,.15],[-.39,.08,.77],gold,arm);
register(listening,'listening');
const counter=group('shop-curiosity-counter',scene,-3.76,.02,2.6);
box('counter-front',[2.2,1.15,.85],[0,.54,0],oak,counter);
box('counter-top',[2.4,.14,1.02],[0,1.17,0],gold,counter);
const smallSign=label('MUSIC FINDS A HOME',1.8);smallSign.position.set(0,1.48,.11);counter.add(smallSign);
for(let i=0;i<3;i++)orb('counter-glass-marble-'+i,.12,
 [-.55+i*.55,1.38,-.13],i%2?turquoise:violet,counter);
// Cosmos, open celestial windows, a gold record-sigil floor, levitating
// vinyl and impossible stairs surround the original interactive racks.
const dimension=buildRecordDimension({
 THREE,scene,crates,listening,disc,reducedMotion:!!reduced?.matches
});
function paintApprovedCovers(){
 for(const rack of RACKS){
  const approved=recordsForRack(approvedRecords,rack.id).slice(0,5);
  for(const [index,record] of approved.entries()){
   const cover=crates[rack.id].displayCovers[index];
   if(!cover)continue;
   const cv=document.createElement('canvas');cv.width=384;cv.height=512;
   const c=cv.getContext('2d');
   c.fillStyle=rack.colour;c.fillRect(0,0,384,512);
   c.strokeStyle='#efd4a4';c.lineWidth=14;c.strokeRect(17,17,350,478);
   c.textAlign='center';c.fillStyle='#fff0d2';
   c.font='bold 31px Georgia,serif';
   c.fillText(rack.id==='bands'?record.artist:record.title,192,245,322);
   c.font='18px Georgia,serif';
   c.fillText(rack.id==='bands'?'ARTIST':record.artist,192,299,330);
   const texture=new THREE.CanvasTexture(cv);
   texture.colorSpace=THREE.SRGBColorSpace;
   cover.material=new THREE.MeshStandardMaterial({map:texture,roughness:.85});
  }
 }
}
function renderApprovedCatalogue(){
 const records=recordsForRack(approvedRecords,focused);
 cataloguePanel.hidden=!records.length;
 catalogueItems.replaceChildren();
 for(const record of records){
  const li=document.createElement('li');
  const title=document.createElement('strong');
  title.textContent=focused==='bands'?record.artist:record.title;
  const detail=document.createElement('span');
  detail.textContent=focused==='bands'?'Artist':record.artist+
   ' · '+(record.status==='scheduled'?'Coming '+(record.plannedReleaseDate||'soon'):record.type.toUpperCase());
  li.append(title,detail);catalogueItems.append(li);
 }
}
async function loadApprovedCatalogue(){
 // Deliberately same-origin static JSON, not a client-side private GitHub call.
 try{
  const res=await fetch('./approved-catalogue.json',{cache:'no-store',redirect:'error',credentials:'same-origin'});
  if(!res.ok)throw Error('approved catalogue unavailable');
  approvedRecords=parseApprovedCatalogue(await res.json());
  paintApprovedCovers();renderApprovedCatalogue();
 }catch(error){
  approvedRecords=[];
  console.warn('Record Shop approved catalogue not available',error);
 }
}

let focused=null,playing=false,discAngle=0;
function update(){
 for(const r of RACKS){
  const chosen=focused===r.id;
  controls[r.id].setAttribute('aria-pressed',String(chosen));
  controls[r.id].textContent=chosen?'Close '+r.name+' crate':r.name;
 }
 controls.listening.setAttribute('aria-pressed',String(playing));
 controls.listening.textContent=playing?'Stop the silent record':'Spin the silent record';
 const found=rackFor(focused);
 description.textContent=found?found.subtitle:
  focused==='listening'?'A grooved disc and a tiny tonearm, awaiting approved music.':
  'Three real racks and a very particular turntable. Choose something to inspect.';
 caption.textContent=found?found.name+' · '+(recordsForRack(approvedRecords,focused).length?'approved records available':'contents not yet published'):
  focused==='listening'?'A real listening mechanism with no audio loaded':
  'A physical home for future music projects.';
 renderApprovedCatalogue();
}
function targetCamera(){
 const ratio=canvas.clientWidth/Math.max(1,canvas.clientHeight);
 const pose=shopDestination(focused,ratio);
 destination.set(...pose.position);target.set(...pose.target);
 if(reduced?.matches){camera.position.copy(destination);aim.copy(target);camera.lookAt(aim);}
}
function focus(id){
 focused=focusAction(focused,id);
 if(id==='listening')playing=!playing;
 status.textContent=focused&&rackFor(focused)?
  rackFor(focused).name+' · the physical crate slides out. The empty sleeves are awaiting approved content.':
  focused==='listening'?(playing?'The silent record turns beneath its tonearm.':'The needle returns to rest.'):
  'The crates return to their shelves. Explore another part of the shop.';
 update();targetCamera();
}
function wholeShop(){
 focused=null;targetCamera();update();
 status.textContent='Back in the whole record shop. No private music or links have been published.';
}
for(const r of RACKS)controls[r.id].addEventListener('click',()=>focus(r.id));
controls.listening.addEventListener('click',()=>focus('listening'));
overview.addEventListener('click',wholeShop);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&focused){e.preventDefault();wholeShop();}});
const ray=new THREE.Raycaster(),point=new THREE.Vector2();
function pick(e){
 if(!renderer)return null;const rect=canvas.getBoundingClientRect();
 point.x=2*(e.clientX-rect.left)/rect.width-1;
 point.y=1-2*(e.clientY-rect.top)/rect.height;
 ray.setFromCamera(point,camera);
 return ray.intersectObjects(pickables,false)[0]?.object?.userData.recordShopAction||null;
}
let down=null;
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{
 if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>9){down=null;return;}
 down=null;const id=pick(e);if(id)focus(id);else if(focused)wholeShop();
});
canvas.addEventListener('pointermove',e=>{
 const id=pick(e);canvas.style.cursor=id?'pointer':'default';
 canvas.title=rackFor(id)?.name||(id==='listening'?'Use the silent record player':'The Record Shop');
});
function resize(){
 if(!renderer)return;
 const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();targetCamera();
}
window.addEventListener('resize',resize);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(canvas);
resize();update();loadApprovedCatalogue();
const clock=new THREE.Clock();
function frame(){
 const dt=Math.min(.08,clock.getDelta());
 for(const axis of ['x','y','z']){
  camera.position[axis]=motion(camera.position[axis],destination[axis],dt,2.8);
  aim[axis]=motion(aim[axis],target[axis],dt,2.8);
 }
 camera.lookAt(aim);
 for(const r of RACKS){
  const c=crates[r.id];
  c.drawer.position.z=motion(c.drawer.position.z,c.homeZ+pullPosition(focused,r.id),dt,4.0);
 }
 discAngle=spinDisc(discAngle,playing,dt);
 disc.rotation.y=discAngle;
 arm.rotation.y=motion(arm.rotation.y,playing?-.55:.23,dt,4.0);
 dimension.update(dt,playing);
 if(renderer)renderer.render(scene,camera);
 requestAnimationFrame(frame);
}
frame();

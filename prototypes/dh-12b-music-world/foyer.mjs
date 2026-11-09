// DH-12B.5: the doors open physically, the camera approaches, then the
// selected destination loads automatically. One action, not two.
import * as THREE from './vendor/three-r159.module.min.js';
import {DOORS,doorFor,doorAngle,approach,settled,isLocalMusicRoute} from './music-portals.mjs?v=dh12b1-music-portals-v1';
import {makeFoyerMaterials,makePortalSignTexture} from './foyer-surfaces.mjs?v=dh12b5-clean-journey-v1';
import {buildFoyerDimension} from './dimensional-art.mjs?v=dh12b2-dimensional-world-v1';
import {initialOrbit,dragOrbit,zoomOrbit,zoomPinch,orbitPose,dragDistance,pointerSeparation}
 from './foyer-orbit.mjs?v=dh12b3-orbit-portals-v1';

const canvas=document.getElementById('music-portals-canvas');
const status=document.getElementById('music-portal-status');
const overview=document.getElementById('music-portal-overview');
const overviewTray=document.getElementById('music-portal-view');
const orbitReset=document.getElementById('music-orbit-reset');
if(!orbitReset)throw Error('Missing foyer reset control');
const actions=Object.fromEntries(DOORS.map(d=>[d.id,document.getElementById('portal-'+d.id)]));
if(!canvas||!status||!overview||!overviewTray||Object.values(actions).some(x=>!x))
 throw Error('The Music world requires two reachable physical portals');

const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
let renderer=null;
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.36;
}catch(error){
 status.textContent='3D preview unavailable. The destination doors still work as accessible controls.';
 console.warn('Music world WebGL unavailable',error);
}
const scene=new THREE.Scene();
scene.background=new THREE.Color('#0c102a');
scene.fog=new THREE.FogExp2('#15142e',.014);
const camera=new THREE.PerspectiveCamera(44,1,.1,120);
const aim=new THREE.Vector3(0,1.95,-2.0);
camera.position.set(0,6.7,14.6);
camera.lookAt(aim);
const destination=camera.position.clone(),lookAt=aim.clone();
let orbit=initialOrbit();
const cameraBasePosition=new THREE.Vector3(),cameraBaseTarget=new THREE.Vector3();
function setOrbit(next){
 // Once a physical door is selected, leave the camera journey uninterrupted.
 if(selected)return;
 orbit=next;
 targetCamera();
}
function resetOrbit(){
 setOrbit(initialOrbit());
}
orbitReset.addEventListener('click',resetOrbit);
// Hand-authored procedural grain follows the actual curved/cast geometry.
const {golden,dark,stone,cream,amethyst,mint,wood,seam}=makeFoyerMaterials(THREE);
function group(name,parent=scene,xyz=[0,0,0]){
 const g=new THREE.Group();g.name=name;g.position.set(...xyz);parent.add(g);return g;
}
function box(name,dims,xyz,mat,parent=scene){
 const o=new THREE.Mesh(new THREE.BoxGeometry(...dims),mat);
 o.name=name;o.position.set(...xyz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function orb(name,r,xyz,mat,parent=scene){
 const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),mat);
 o.name=name;o.position.set(...xyz);o.castShadow=true;parent.add(o);return o;
}
function cylinder(name,rt,rb,h,xyz,mat,parent=scene){
 const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,24),mat);
 o.name=name;o.position.set(...xyz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function ring(name,r,t,xyz,mat,parent=scene,arc=Math.PI*2){
 const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,66,arc),mat);
 o.name=name;o.position.set(...xyz);parent.add(o);return o;
}
function sign(kind,w=2.66){
 const texture=makePortalSignTexture(THREE,kind);
 // One high-resolution, physically attached marquee per doorway.
 const label=new THREE.Mesh(new THREE.PlaneGeometry(w,w*350/1536),
  new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
 label.castShadow=false;
 return label;
}
scene.add(new THREE.HemisphereLight('#efe0ca','#352a4c',1.5));
const moon=new THREE.DirectionalLight('#f9dbb6',1.9);moon.position.set(-3,10,8);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);scene.add(moon);
for(const [i,color,x] of [[0,'#e7a0c0',-4],[1,'#85e1cd',4]]){
 const glow=new THREE.PointLight(color,47,13,2);glow.position.set(x,3.2,1.3);scene.add(glow);
}
const platform=cylinder('floating-crossroads-floor',7.2,7.65,.64,[0,-.4,-2.1],dark);
cylinder('inlaid-outer-circle',7.16,7.16,.055,[0,-.064,-2.1],golden);
cylinder('moonstone-disc',6.70,6.77,.075,[0,-.016,-2.1],stone);
for(let i=0;i<22;i++){
 const a=i*Math.PI*2/22;
 const x=Math.sin(a)*6.5,z=-2.1+Math.cos(a)*6.5;
 orb('perimeter-moon-stone-'+i,.07,[x,.052,z],i%2?golden:cream);
}
for(let i=0;i<7;i++){
 const z=1.0-i*.66;
 box('crossroads-gilded-inlay-'+i,[4.0,.035,.045],[0,.038,z],golden).rotation.y=0;
}
const constellation=group('musical-constellation');
for(let i=0;i<21;i++){
 const angle=i*2.399963;
 const radius=3.4+i%6*.45;
 const x=Math.sin(angle)*radius,y=4.3+(i%7)*.47,z=-4.5-Math.cos(angle)*1.9;
 orb('floating-musical-star-'+i,.07+(i%3)*.028,[x,y,z],i%2?golden:cream,constellation);
}
// Notes are actual sculpted spheres with stems and angled flags, not bitmap art.
function musicNote(index,x,y,z,parent=scene){
 const root=group('free-floating-musical-note-'+index,parent,[x,y,z]);
 const head=orb('note-head',.15,[0,0,0],golden,root);head.scale.set(1.4,.8,.6);head.rotation.z=-.4;
 box('note-stem',[.045,.57,.04],[.16,.26,0],golden,root);
 const flag=box('note-flag',[.33,.046,.044],[.30,.52,0],golden,root);flag.rotation.z=-.48;
 return root;
}
const notes=[];
for(let i=0;i<7;i++){
 const a=i*2.399963;
 const n=musicNote(i,Math.sin(a)*5.6,3.6+(i%3)*.65,-5.3+Math.cos(a)*2.8);
 n.userData.spin=(i%2?1:-1)*.06;notes.push(n);
}
const thresholds={};
const selectable=[];
function mark(o,id){
 o.traverse(node=>{
  if(node.isMesh){node.userData.musicDoor=id;selectable.push(node);}
 });
}
function makePortal(def,number){
 const atX=number===0?-3.25:3.25;
 const root=group('world-portal-'+def.id,scene,[atX,0,-3.4]);
 const motif=number===0?amethyst:mint;
 box('portal-threshold',[2.86,.20,.78],[0,.14,0],golden,root);
 box('outer-post-left',[.20,3.85,.55],[-1.31,2.05,-.28],golden,root);
 box('outer-post-right',[.20,3.85,.55],[1.31,2.05,-.28],golden,root);
 box('arch-keystone',[.54,.35,.64],[0,4.06,-.28],cream,root);
 const rounded=ring('sculpted-vault-top',1.30,.155,[0,3.72,-.27],golden,root,Math.PI);
 rounded.scale.y=.40;
 box('arch-top',[2.86,.29,.55],[0,3.72,-.28],motif,root);
 box('inner-portal-black-depth',[2.43,3.45,.08],[0,1.95,-.60],dark,root);
 const swirl=ring('threshold-starlight-ring',.83,.052,[0,2.16,-.54],number===0?cream:golden,root);
 swirl.scale.y=1.5;
 for(let k=0;k<8;k++){
  const a=k*Math.PI*2/8;
  orb('interior-mystery-light-'+k,.044,
   [Math.sin(a)*.85,2.16+Math.cos(a)*1.18,-.52],number===0?cream:seam,root);
 }
 const display=sign(def.id,2.66);
 // One legible engraved sign, not duplicated by a camera-anchored UI card.
 const plate=box('portal-carved-marquee-'+def.id,[2.80,.57,.18],
  [0,4.47,-.03],number===0?amethyst:mint,root);
 box('marquee-gilt-underline-'+def.id,[2.68,.042,.21],
  [0,4.17,.065],golden,root);
 display.name='gateway-inscription-'+def.id;
 display.position.set(0,4.47,.12);root.add(display);
 for(let i=0;i<9;i++){
  const x=-1.20+i*.30;
  orb('marquee-lamp-'+def.id+'-'+i,.050,
   [x,4.78,.12],number===0?cream:seam,root);
 }
 // The left and right doors each have an actual hinge at the outer jamb.
 const leaves={};
 for(const side of ['left','right']){
  const direction=side==='left'?-1:1;
  const hinge=group(def.id+'-'+side+'-hinge',root,[direction*1.16,1.99,.04]);
  box(def.id+'-'+side+'-door-leaf',[1.13,3.24,.13],[-direction*.565,0,0],
   number===0?wood:mint,hinge);
  for(let row=0;row<3;row++){
   box(def.id+'-'+side+'-raised-panel-'+row,
    [.72,.75,.023],[-direction*.565,.91-row*.91,.074],
    number===0?amethyst:stone,hinge);
  }
  orb('door-handle-'+side,.09,[-direction*.98,-.02,.16],golden,hinge);
  if(number===0){
   // The actual double doors now resemble miniature burgundy stage wings.
   // Real folded velvet strips travel with EACH original hinged door.
   for(let fold=0;fold<5;fold++){
    const x=-direction*(.15+fold*.19);
    const vel=box('stage-velvet-fluted-panel-'+side+'-'+fold,
     [.075,2.85,.075],[x,-.03,.14],amethyst,hinge);
    vel.rotation.z=direction*.017*(fold-2);
   }
   for(let lamp=0;lamp<5;lamp++){
    orb('stage-footlight-'+side+'-'+lamp,.058,
     [-direction*(.16+lamp*.19),-1.49,.22],cream,hinge);
   }
   const mask=orb('mini-comedy-tragedy-face-'+side,.205,
    [-direction*.55,.73,.17],cream,hinge);
   mask.scale.set(.88,1.20,.40);
   for(const eye of [-1,1]){
    orb('carved-mask-eye-'+side+'-'+eye,.028,
     [-direction*.55+eye*.070,.77,.262],dark,hinge);
   }
   const mouth=ring('engraved-theatre-mask-mouth-'+side,.084,.014,
    [-direction*.55,.66,.255],golden,hinge,Math.PI*.86);
   mouth.rotation.z=side==='left'?Math.PI:0;
  }else{
   // A real ornamental vinyl fixed to each door leaf, with raised grooves.
   const plate=cylinder('real-shop-door-vinyl-'+side,.36,.36,.035,
    [-direction*.55,.66,.15],dark,hinge);
   plate.rotation.x=Math.PI/2;
   for(const radius of [.24,.30]){
    ring('shop-door-record-groove-'+side+'-'+radius,radius,.012,
     [-direction*.55,.66,.185],seam,hinge);
   }
   orb('shop-door-vinyl-label-'+side,.102,
    [-direction*.55,.66,.201],mint,hinge);
   for(let k=0;k<3;k++){
    const miniSleeve=box('mini-hanging-sleeve-'+side+'-'+k,
     [.24,.27,.034],[-direction*(.30+k*.25),-.73+k*.13,.18],
     k%2?golden:stone,hinge);
    miniSleeve.rotation.z=direction*(k-1)*.08;
   }
  }
  leaves[side]=hinge;
  mark(hinge,def.id);
 }
 // The arch is also selectable, so users need not target a narrow leaf.
 mark(display,def.id);
 const light=new THREE.PointLight(number===0?'#dd8eb5':'#9fe0c6',17,7,1.6);
 light.position.set(0,2.4,1.1);root.add(light);
 return {root,leaves,light,id:def.id,position:atX};
}
DOORS.forEach((d,i)=>{thresholds[d.id]=makePortal(d,i);});
// An authored cosmos, physically separate fragments, endless stairs, sculpted
// portal ribs and animated dimensional veils surround the ORIGINAL hinges.
const dimension=buildFoyerDimension({
 THREE,scene,thresholds,reducedMotion:!!reduced?.matches
});
let selected=null,entering=false;
const clock=new THREE.Clock();
const desiredTarget=new THREE.Vector3(0,1.95,-2);
function targetCamera(){
 const aspect=Math.max(.4,canvas.clientWidth/Math.max(1,canvas.clientHeight));
 const narrow=aspect<.8;
 let xyz=[0,7.30,15.70],point=[0,2.22,-2.15];
 if(selected){
  const sign=selected==='theatre'?-1:1;
  xyz=[sign*3.2,3.3,narrow?10:5.5];
  point=[sign*3.25,narrow?1.37:2.2,-3.32];
 }else if(narrow){
  xyz=[0,9.1,20.5];point=[0,1.60,-2.75];
 }
 cameraBasePosition.set(...xyz);
 cameraBaseTarget.set(...point);
 const pose=orbitPose(xyz,point,orbit,{
  minRadius:selected?(narrow?6.8:3.8):(narrow?10.0:5.8),
  maxRadius:43
 });
 destination.set(...pose.position);
 desiredTarget.set(...pose.target);
 if(reduced?.matches){
  camera.position.copy(destination);aim.copy(desiredTarget);camera.lookAt(aim);
 }
}
function updateUI(){
 for(const door of DOORS){
  const button=actions[door.id],thisOne=selected===door.id;
  button.textContent=thisOne?(ready?'Enter '+door.label:'Opening '+door.label+'…'):
   'Open '+(door.id==='theatre'?'theatre doors':'record shop doors');
  button.dataset.ready=String(thisOne&&ready);
  button.setAttribute('aria-pressed',String(thisOne));
  button.setAttribute('aria-label',thisOne&&ready?'Enter '+door.label+' from the open doorway':
   'Open the physical '+door.label+' doors');
 }
 overviewTray.hidden=!selected;
}
function returnToCrossroads(){
 selected=null;ready=false;orbit=initialOrbit();targetCamera();updateUI();
 status.textContent='Both doors are visible again. Choose where the music takes you.';
}
function choose(id){
 const door=doorFor(id);if(!door)return;
 if(selected===id&&ready){
  // Only one of the two fixed, local, declared staging destinations.
  window.location.assign(door.route);return;
 }
 selected=id;ready=false;orbit=initialOrbit();targetCamera();updateUI();
 status.textContent=door.label+' · the real hinged doors are opening. Enter when they have opened.';
}
for(const d of DOORS)actions[d.id].addEventListener('click',()=>choose(d.id));
overview.addEventListener('click',returnToCrossroads);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&selected){e.preventDefault();returnToCrossroads();return;}
 if(e.altKey||e.ctrlKey||e.metaKey||e.target?.closest?.('input,textarea,select,[contenteditable]'))return;
 const keys={
  ArrowLeft:{dx:-35,dy:0},ArrowRight:{dx:35,dy:0},
  ArrowUp:{dx:0,dy:-35},ArrowDown:{dx:0,dy:35}
 };
 if(keys[e.key]){
  e.preventDefault();
  const {dx,dy}=keys[e.key];
  setOrbit(dragOrbit(orbit,dx,dy));
 }else if(['+','=','Add'].includes(e.key)){
  e.preventDefault();setOrbit(zoomOrbit(orbit,-155));
 }else if(['-','_','Subtract'].includes(e.key)){
  e.preventDefault();setOrbit(zoomOrbit(orbit,155));
 }else if(e.key==='Home'){
  e.preventDefault();resetOrbit();
 }
});
const pickRay=new THREE.Raycaster(),pointer=new THREE.Vector2();
function hit(e){
 if(!renderer)return null;
 const r=canvas.getBoundingClientRect();
 pointer.x=(e.clientX-r.left)/r.width*2-1;
 pointer.y=-(e.clientY-r.top)/r.height*2+1;
 pickRay.setFromCamera(pointer,camera);
 return pickRay.intersectObjects(selectable,false)[0]?.object?.userData.musicDoor||null;
}
// Google Earth-style orbit: real camera rotates around an actual point in
// the 3D island. A drag never becomes a portal click. Touch one finger orbits,
// two fingers pinch zoom; the wheel and keyboard are equivalents.
const pointers=new Map();
let gestureDragged=false,multiTouch=false,lastPinch=0;
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0&&e.pointerType==='mouse')return;
 canvas.setPointerCapture?.(e.pointerId);
 const point={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};
 pointers.set(e.pointerId,point);
 if(pointers.size>=2){
  multiTouch=true;gestureDragged=true;
  lastPinch=pointerSeparation(...[...pointers.values()].slice(0,2));
 }
 canvas.style.cursor='grabbing';
});
canvas.addEventListener('pointermove',e=>{
 if(pointers.has(e.pointerId)){
  const pointer=pointers.get(e.pointerId);
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
  pointer.x=e.clientX;pointer.y=e.clientY;
  if(pointers.size>=2){
   const pair=[...pointers.values()].slice(0,2);
   const separation=pointerSeparation(pair[0],pair[1]);
   if(lastPinch>1)setOrbit(zoomPinch(orbit,lastPinch,separation));
   lastPinch=separation;
   multiTouch=true;gestureDragged=true;
  }else if(dragDistance({x:pointer.startX,y:pointer.startY},pointer)>6){
   gestureDragged=true;
   setOrbit(dragOrbit(orbit,dx,dy,
    e.pointerType==='touch'?.0065:.0062));
  }
  canvas.style.cursor='grabbing';
  return;
 }
 const id=hit(e);
 canvas.style.cursor=id?'pointer':'grab';
 canvas.title=id?'Open '+doorFor(id).label+' or enter its doorway':
  'Drag to orbit around the World Between Notes';
});
canvas.addEventListener('pointerup',e=>{
 const pointer=pointers.get(e.pointerId);
 if(!pointer)return;
 const moved=dragDistance({x:pointer.startX,y:pointer.startY},
  {x:e.clientX,y:e.clientY});
 const shouldActivate=!gestureDragged&&!multiTouch&&moved<=7&&pointers.size===1;
 pointers.delete(e.pointerId);
 if(!pointers.size){
  gestureDragged=false;multiTouch=false;lastPinch=0;
  canvas.style.cursor='grab';
 }
 if(!shouldActivate)return;
 const id=hit(e);
 if(id)choose(id);
 else if(selected)returnToCrossroads();
});
canvas.addEventListener('pointercancel',e=>{
 pointers.delete(e.pointerId);
 gestureDragged=true;
 if(!pointers.size){
  multiTouch=false;lastPinch=0;gestureDragged=false;
  canvas.style.cursor='grab';
 }
});
canvas.addEventListener('wheel',e=>{
 e.preventDefault();
 setOrbit(zoomOrbit(orbit,e.deltaY));
},{passive:false});
function positionPortalSigns(){
 const width=canvas.clientWidth,height=canvas.clientHeight;
 if(!width||!height)return;
 for(const door of DOORS){
  const button=signs[door.id];
  const worldPoint=thresholds[door.id].root.localToWorld(
   new THREE.Vector3(0,5.35,.12));
  const p=worldPoint.project(camera);
  const x=(p.x*.5+.5)*width;
  const y=(-p.y*.5+.5)*height;
  const bottomSafe=height-(width<690?235:174);
  const inView=p.z>-1&&p.z<1&&x>75&&x<width-75&&
   y>(width<690?75:112)&&y<bottomSafe;
  button.hidden=!inView;
  if(inView){
   button.style.left=x+'px';
   button.style.top=y+'px';
  }
 }
}
const resize=()=>{
 if(!renderer)return;
 renderer.setSize(Math.max(1,canvas.clientWidth),Math.max(1,canvas.clientHeight),false);
 camera.aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);camera.updateProjectionMatrix();
 targetCamera();
};
window.addEventListener('resize',resize);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(canvas);
resize();targetCamera();updateUI();
let elapsed=0;
function frame(){
 const dt=Math.min(.08,clock.getDelta());elapsed+=dt;
 for(const axis of ['x','y','z']){
  camera.position[axis]=approach(camera.position[axis],destination[axis],dt,2.65);
  aim[axis]=approach(aim[axis],desiredTarget[axis],dt,2.65);
 }
 camera.lookAt(aim);
 for(const d of DOORS){
  const g=thresholds[d.id],opened=d.id===selected;
  for(const side of ['left','right']){
   const hinge=g.leaves[side];
   hinge.rotation.y=approach(hinge.rotation.y,doorAngle(opened,side),dt,3.5);
  }
  g.light.intensity=approach(g.light.intensity,opened?30:16,dt,4);
 }
 for(const n of notes){
  n.rotation.z+=dt*n.userData.spin;
  n.position.y+=Math.sin(elapsed*1.2+n.position.x)*dt*.012;
 }
 dimension.update(dt,selected);
 if(selected&&!ready){
  const opening=thresholds[selected];
  const doorsDone=['left','right'].every(side=>
   Math.abs(opening.leaves[side].rotation.y-doorAngle(true,side))<.035);
  const cameraDone=settled(camera.position.toArray(),destination.toArray(),.10)&&
   settled(aim.toArray(),desiredTarget.toArray(),.10);
  if(!renderer||(doorsDone&&cameraDone)){
   ready=true;updateUI();
   status.textContent='The '+doorFor(selected).label+' doors are open. Select Enter to go inside.';
  }
 }
 if(renderer)renderer.render(scene,camera);
 positionPortalSigns();
 requestAnimationFrame(frame);
}
frame();

// DH-12B.1: World Between Notes. The doors are real hinged meshes.
// First click opens and physically approaches a threshold; Enter goes inside.
import * as THREE from './vendor/three-r159.module.min.js';
import {DOORS,doorFor,doorAngle,approach,settled} from './music-portals.mjs?v=dh12b1-music-portals-v1';

const canvas=document.getElementById('music-portals-canvas');
const status=document.getElementById('music-portal-status');
const overview=document.getElementById('music-portal-overview');
const overviewTray=document.getElementById('music-portal-view');
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
}catch(error){
 status.textContent='3D preview unavailable. The destination doors still work as accessible controls.';
 console.warn('Music world WebGL unavailable',error);
}
const scene=new THREE.Scene();
scene.background=new THREE.Color('#1b1626');
scene.fog=new THREE.FogExp2('#1b1626',.023);
const camera=new THREE.PerspectiveCamera(44,1,.1,120);
const aim=new THREE.Vector3(0,1.95,-2.0);
camera.position.set(0,6.7,14.6);
camera.lookAt(aim);
const destination=camera.position.clone(),lookAt=aim.clone();
const golden=new THREE.MeshStandardMaterial({color:'#c9a47a',metalness:.58,roughness:.42});
const dark=new THREE.MeshStandardMaterial({color:'#372a39',metalness:.1,roughness:.8});
const stone=new THREE.MeshStandardMaterial({color:'#66526a',roughness:.86});
const cream=new THREE.MeshStandardMaterial({color:'#e7d2b1',roughness:.81});
const amethyst=new THREE.MeshStandardMaterial({color:'#614765',roughness:.75});
const mint=new THREE.MeshStandardMaterial({color:'#588b81',roughness:.67});
const wood=new THREE.MeshStandardMaterial({color:'#553b49',roughness:.68});
const seam=new THREE.MeshStandardMaterial({color:'#ecc995',metalness:.42,roughness:.44});
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
function sign(text,w=2.2){
 const graphic=document.createElement('canvas');graphic.width=700;graphic.height=160;
 const c=graphic.getContext('2d');
 c.fillStyle='#ecddc4';c.fillRect(0,0,700,160);
 c.strokeStyle='#8c6474';c.lineWidth=12;c.strokeRect(5,5,690,150);
 c.font='bold 61px Georgia,serif';c.fillStyle='#403044';c.textAlign='center';c.textBaseline='middle';
 c.fillText(text.toUpperCase(),350,83,650);
 const tex=new THREE.CanvasTexture(graphic);tex.colorSpace=THREE.SRGBColorSpace;
 return new THREE.Mesh(new THREE.PlaneGeometry(w,w*160/700),
  new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
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
 const display=sign(number===0?'MUSICALS':'RECORDS',1.91);
 display.name='gateway-inscription-'+def.id;display.position.set(0,4.38,.06);root.add(display);
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
let selected=null,ready=false;
const clock=new THREE.Clock();
const desiredTarget=new THREE.Vector3(0,1.95,-2);
function targetCamera(){
 const aspect=Math.max(.4,canvas.clientWidth/Math.max(1,canvas.clientHeight));
 const narrow=aspect<.8;
 let xyz=[0,6.7,14.6],point=[0,1.95,-2];
 if(selected){
  const sign=selected==='theatre'?-1:1;
  xyz=[sign*3.2,3.3,narrow?10:5.5];
  point=[sign*3.25,narrow?1.37:2.2,-3.32];
 }else if(narrow){
  xyz=[0,8.5,19.7];point=[0,1.4,-2.8];
 }
 destination.set(...xyz);desiredTarget.set(...point);
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
 selected=null;ready=false;targetCamera();updateUI();
 status.textContent='Both doors are visible again. Choose where the music takes you.';
}
function choose(id){
 const door=doorFor(id);if(!door)return;
 if(selected===id&&ready){
  // Only one of the two fixed, local, declared staging destinations.
  window.location.assign(door.route);return;
 }
 selected=id;ready=false;targetCamera();updateUI();
 status.textContent=door.label+' · the real hinged doors are opening. Enter when they have opened.';
}
for(const d of DOORS)actions[d.id].addEventListener('click',()=>choose(d.id));
overview.addEventListener('click',returnToCrossroads);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&selected){e.preventDefault();returnToCrossroads();}
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
let pressed=null;
canvas.addEventListener('pointerdown',e=>{pressed={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{
 if(!pressed||Math.hypot(e.clientX-pressed.x,e.clientY-pressed.y)>9){pressed=null;return;}
 pressed=null;const id=hit(e);if(id)choose(id);else if(selected)returnToCrossroads();
});
canvas.addEventListener('pointermove',e=>{
 const id=hit(e);
 canvas.style.cursor=id?'pointer':'default';
 canvas.title=id?'Open '+doorFor(id).label+' or enter its doorway':'The World Between Notes';
});
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
 requestAnimationFrame(frame);
}
frame();

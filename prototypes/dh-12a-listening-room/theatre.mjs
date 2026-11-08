// DH-12A.1: Geometry-first Impossible Theatre. No fake scene state frames,
// no recordings and no source or rights-sensitive music content.
import * as THREE from './vendor/three-r159.module.min.js';
import {
 STAGE_ACTS,CURTAIN_CLOSED_X,CURTAIN_OPEN_X,
 curtainX,actIndex,stageAngle,smoothTowards,
 recordAdvance,tonearmAngle,theatreState
} from './theatre-mechanics.mjs?v=dh12a-blockout-v1';
import {cameraPose,focusStatus,normalizeFocus} from './theatre-camera.mjs?v=dh12a2-camera-focus-v1';
import {SET_SCENES,sceneForSteps,toggleScene,resetScenes,mountLivingSets} from './theatre-scenery.mjs?v=dh12a3-living-sets-v1';

const canvas=document.getElementById('theatre-canvas');
const status=document.getElementById('theatre-status');
const openCurtains=document.getElementById('theatre-curtains');
const turnStage=document.getElementById('theatre-stage');
const playRecord=document.getElementById('theatre-record');
const reset=document.getElementById('theatre-reset');
const setButton=document.getElementById('theatre-set');
const setCaption=document.getElementById('theatre-set-caption');
const setDescription=document.getElementById('theatre-set-description');
const overviewButton=document.getElementById('theatre-overview');
const viewIndicator=document.getElementById('theatre-view');
const focusName=document.getElementById('theatre-focus-name');
const controls=[openCurtains,turnStage,playRecord,reset,overviewButton,setButton,setCaption,setDescription];
if(!canvas||!status||controls.some(x=>!x))throw Error('Missing DH-12A theatre controls');
let state=theatreState();
let activeSets=resetScenes();
let renderer=null;
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
}catch(err){
 status.textContent='This stage requires WebGL. The mechanical prototype cannot draw on this device.';
 console.warn('DH-12A WebGL preview unavailable',err);
}

const scene=new THREE.Scene();
scene.background=new THREE.Color('#171321');
scene.fog=new THREE.FogExp2('#171321',.034);
const camera=new THREE.PerspectiveCamera(43,1,.1,140);
const initialCamera=cameraPose(null);
camera.position.set(...initialCamera.position);
const aim=new THREE.Vector3(...initialCamera.target);
const desiredPosition=camera.position.clone();
const desiredAim=aim.clone();
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
let cameraFocus=null;
camera.lookAt(aim);
// One camera and continuous look-at point: the same movement used to inspect
// the Writing Room, rather than moving or duplicating physical theatre pieces.
function updateCameraDestination(){
 const pose=cameraPose(cameraFocus,
  canvas.clientWidth/Math.max(1,canvas.clientHeight),canvas.clientHeight);
 desiredPosition.set(...pose.position);
 desiredAim.set(...pose.target);
 if(reducedMotion?.matches){
  camera.position.copy(desiredPosition);
  aim.copy(desiredAim);
  camera.lookAt(aim);
 }
}
function inspectObject(id){
 const focus=normalizeFocus(id);
 if(!focus)return;
 cameraFocus=focus;
 document.body.dataset.theatreFocus=focus;
 viewIndicator.hidden=false;
 focusName.textContent=focusStatus(focus);
 updateCameraDestination();
}
function viewWholeTheatre(){
 if(!cameraFocus)return;
 cameraFocus=null;
 delete document.body.dataset.theatreFocus;
 viewIndicator.hidden=true;
 updateCameraDestination();
 status.textContent='The camera returns to the whole theatre. The physical mechanisms remain as you left them.';
}
const material=(colour,rough=.78,metalness=.0)=>new THREE.MeshStandardMaterial({
 color:colour,roughness:rough,metalness
});
const darkWood=material('#452f35',.75,.06);
const redWood=material('#73434b',.65,.12);
const agedGold=material('#c99d60',.36,.62);
const agedBrass=material('#9e7749',.43,.58);
const ink=material('#191824',.6,.02);
const violet=material('#493254',.68,.08);
const curtainMat=new THREE.MeshStandardMaterial({
 color:'#803654',side:THREE.DoubleSide,roughness:.91,metalness:0
});
function box(name,sizes,position,mat,parent=scene){
 const node=new THREE.Mesh(new THREE.BoxGeometry(...sizes),mat);
 node.name=name;node.position.set(...position);
 node.castShadow=true;node.receiveShadow=true;parent.add(node);
 return node;
}
function cylinder(name,radiusTop,radiusBottom,height,position,mat,parent=scene,segments=64){
 const node=new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments),mat);
 node.name=name;node.position.set(...position);
 node.castShadow=true;node.receiveShadow=true;parent.add(node);
 return node;
}
function torus(name,radius,tube,position,mat,parent=scene,arc=2*Math.PI){
 const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,9,96,arc),mat);
 mesh.name=name;mesh.position.set(...position);
 mesh.castShadow=true;parent.add(mesh);
 return mesh;
}
function sphere(name,radius,position,mat,parent=scene){
 const o=new THREE.Mesh(new THREE.IcosahedronGeometry(radius,1),mat);
 o.name=name;o.position.set(...position);o.castShadow=true;parent.add(o);return o;
}
function addLabel(text,width=1.3){
 const el=document.createElement('canvas');el.width=512;el.height=150;
 const ctx=el.getContext('2d');
 ctx.fillStyle='#f4dda9';ctx.fillRect(0,0,512,150);
 ctx.strokeStyle='#714857';ctx.lineWidth=9;ctx.strokeRect(4,4,504,142);
 ctx.fillStyle='#392e3f';ctx.font='bold 62px Georgia,serif';
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(text.toUpperCase(),256,79,472);
 const texture=new THREE.CanvasTexture(el);
 texture.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*150/512),
  new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
 return mesh;
}
const lighting=new THREE.HemisphereLight('#e9d8c8','#4d304a',1.0);scene.add(lighting);
const key=new THREE.DirectionalLight('#ffe0b4',1.55);
key.position.set(3,10,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
scene.add(key);
const leftFootlight=new THREE.PointLight('#ffc486',48,11,2);leftFootlight.position.set(-3,.9,2.8);scene.add(leftFootlight);
const rightFootlight=new THREE.PointLight('#b58bcf',35,11,2);rightFootlight.position.set(3,.9,2.8);scene.add(rightFootlight);
const spotlight=new THREE.SpotLight('#f9d6a6',105,19,.58,.50,1);
spotlight.position.set(-1,7.3,5.0);spotlight.target.position.set(0,.8,0);
scene.add(spotlight,spotlight.target);
const sideSpot=new THREE.SpotLight('#ad83d2',64,18,.62,.55,1);
sideSpot.position.set(4,6.0,1.5);sideSpot.target.position.set(0,.8,-.5);
scene.add(sideSpot,sideSpot.target);
// Everything is inside the same physical scale and camera, including its
// wooden plinth. Geometric ornaments and cloth folds are actual meshes.
const base=cylinder('theatre-plinth',5.0,5.3,.50,[0,.29,0],darkWood);
cylinder('inlaid-stage-edge',5.03,5.03,.075,[0,.53,0],agedBrass);
cylinder('upper-stage-board',4.63,4.75,.16,[0,.66,-.1],redWood);
for(let i=0;i<35;i++){
 const angle=i/35*Math.PI*2;
 sphere('floor-starlight-'+i,.055,[Math.sin(angle)*4.57,.77,Math.cos(angle)*4.57-.1],
  i%2?agedGold:agedBrass);
}
const backstage=box('back-wall',[9.2,4.3,.23],[0,2.82,-3.15],violet);
const frontWall=material('#20192d');
for(let i=0;i<16;i++){
 const a=(i*2.399963)%6.283;
 const x=-4.1+(i*1.29)%8.3;
 const y=1.1+(i*1.93)%3.6;
 sphere('painted-star-'+i,.048+(i%3)*.025,[x,y,-2.97],material(i%2?'#e5bd87':'#a2a1dd',.35,.25));
}
box('proscenium-left',[.46,4.3,.55],[-4.47,2.66,-1.56],agedBrass);
box('proscenium-right',[.46,4.3,.55],[4.47,2.66,-1.56],agedBrass);
const arch=torus('proscenium-real-arch',4.47,.16,[0,4.43,-1.57],agedGold,scene,Math.PI);
arch.rotation.z=0;
arch.scale.y=.33; // A shallow physical ellipse, not a giant arch outside the camera.
box('arch-keystone',[.65,.40,.65],[0,4.53,-1.55],agedGold);
const sign=addLabel('THE IMPOSSIBLE THEATRE',3.3);
sign.position.set(0,4.58,-1.13);scene.add(sign);
// True folded 3D curtain geometry, with sliding rigid groups on one rail.
function makeCurtain(side){
 const group=new THREE.Group();group.name=side+'-curtain-rig';
 group.position.x=curtainX(side,false);
 const w=3.25,h=3.57,columns=26,rows=12;
 const pos=[],uv=[],idx=[];
 for(let iy=0;iy<=rows;iy++){
  const v=iy/rows;
  for(let ix=0;ix<=columns;ix++){
   const u=ix/columns;
   const x=(u-.5)*w;
   const y=.85+(1-v)*h;
   const depth=Math.sin(u*Math.PI*14)*.105+(1-v)*.03;
   pos.push(x,y,depth);
   uv.push(u,v);
  }
 }
 for(let iy=0;iy<rows;iy++)for(let ix=0;ix<columns;ix++){
  const a=iy*(columns+1)+ix,b=a+1,c=a+columns+1,d=c+1;
  idx.push(a,c,b,b,c,d);
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setIndex(idx);geo.computeVertexNormals();
 const cloth=new THREE.Mesh(geo,curtainMat);
 cloth.name=side+'-folded-curtain';cloth.castShadow=true;cloth.receiveShadow=true;
 cloth.position.z=1.62;group.add(cloth);
 for(let n=0;n<7;n++){
  const x=(n/6-.5)*w;
  torus(side+'-curtain-ring-'+n,.068,.025,[x,4.42,1.59],agedGold,group);
 }
 // Tassel is attached to the cloth; it physically slides with it.
 const tie=box(side+'-tie',[.09,.13,.11],[side==='left'?.88:-.88,1.8,1.75],agedGold,group);
 tie.rotation.z=side==='left'?-.36:.36;
 scene.add(group);
 return group;
}
const curtains={left:makeCurtain('left'),right:makeCurtain('right')};
box('single-actual-curtain-rail',[9.0,.10,.16],[0,4.48,1.63],agedGold);
// Rotating stage with three proper set pieces, not three independent images.
const revolve=new THREE.Group();
revolve.name='stage-revolve';revolve.position.set(0,.78,-.55);scene.add(revolve);
cylinder('revolving-disk',3.14,3.16,.17,[0,.01,0],darkWood,revolve);
cylinder('revolve-inlay',3.01,3.02,.025,[0,.105,0],agedBrass,revolve);
cylinder('revolve-top',2.92,2.93,.034,[0,.13,0],violet,revolve);
for(let i=0;i<3;i++){
 const angle=i*Math.PI*2/3;
 const node=new THREE.Group();node.name='physical-act-'+STAGE_ACTS[i];
 node.position.set(Math.sin(angle)*1.56,.2,Math.cos(angle)*1.56);
 node.rotation.y=angle;revolve.add(node);
 const colour=[material('#7f5363',.5,.15),material('#546a7d',.5,.15),material('#6a6b59',.5,.15)][i];
 cylinder('act-stand-'+i,.66,.77,.18,[0,.10,0],agedBrass,node);
 box('act-side-left-'+i,[.13,1.88,.15],[-.53,1.1,-.18],agedGold,node);
 box('act-side-right-'+i,[.13,1.88,.15],[.53,1.1,-.18],agedGold,node);
 box('act-crosspiece-'+i,[1.16,.13,.16],[0,2.03,-.18],agedGold,node);
 box('act-colour-panel-'+i,[.91,1.55,.07],[0,1.14,-.24],colour,node);
 torus('act-window-'+i,.36,.07,[0,1.21,-.17],agedGold,node);
 sphere('act-core-'+i,.2,[0,1.2,-.1],material(['#edbc80','#a4b5d2','#c9bc8b'][i],.3,.32),node);
 const plate=addLabel(STAGE_ACTS[i],.88);plate.position.set(0,.40,-.08);node.add(plate);
}
const stageCrest=torus('inner-stage-crest',1.04,.075,[0,.25,0],agedGold,revolve);
stageCrest.rotation.x=Math.PI/2;
// Distinct physical miniature sets and surrounding fly-system are real mesh
// children of the SAME revolving stage, not scene swaps or HTML cards.
const livingSets=mountLivingSets({
 THREE,revolve,scene,box,cylinder,torus,sphere,material,addLabel
});
const lightCues=SET_SCENES.map(entry=>new THREE.Color(entry.colour));
// The original imagined listening room is represented by an actual
// gramophone-like player. It deliberately makes no audio until approved.
const deck=new THREE.Group();deck.name='physical-record-deck';
deck.position.set(3.6,.86,2.48);scene.add(deck);
box('player-wood-plinth',[1.62,.24,1.24],[0,.02,0],redWood,deck);
box('player-brass-edge',[1.66,.045,1.29],[0,.16,0],agedGold,deck);
const record=new THREE.Group();record.name='record-turning-axis';
record.position.set(-.24,.225,0);deck.add(record);
cylinder('record-disc',.48,.48,.025,[0,0,0],ink,record);
for(let i=1;i<=5;i++){
 const ring=torus('record-groove-'+i,.19+i*.05,.006,[0,.021,0],material('#6c586e',.35,.22),record);
 ring.rotation.x=Math.PI/2;
}
cylinder('record-label',.14,.14,.030,[0,.023,0],material('#c9957f',.45,.1),record);
cylinder('record-spindle',.021,.021,.14,[0,.09,0],agedGold,record);
const tonearm=new THREE.Group();tonearm.name='tonearm-real-pivot';
tonearm.position.set(.54,.28,-.35);deck.add(tonearm);
cylinder('tonearm-base',.11,.11,.14,[0,0,0],agedGold,tonearm);
const tonearmBar=box('tonearm-bar',[.08,.065,.70],[-.16,.15,.30],agedBrass,tonearm);
tonearmBar.rotation.y=.4;
box('needle-head',[.18,.11,.14],[-.30,.10,.64],agedGold,tonearm);
for(let i=0;i<4;i++){
 cylinder('player-foot-'+i,.09,.11,.09,[i%2?.62:-.62,-.16,i<2?-.43:.43],agedGold,deck,12);
}
const playerPlate=addLabel('THE LISTENING ROOM',1.28);playerPlate.position.set(0,.22,.67);deck.add(playerPlate);
// Picking is grounded to the same physical scene objects; parent metadata
// remains attached to the actual mesh hierarchy and not to invisible hotspots.
const hitTargets=[];
function registerClick(group,id){
 group.traverse(o=>{
  if(o.isMesh){
   o.userData.theatreClick=id;
   hitTargets.push(o);
  }
 });
}
registerClick(curtains.left,'curtains');
registerClick(curtains.right,'curtains');
registerClick(revolve,'act');
// The miniature mechanisms have priority over their parent revolving disk
// only when an actual sculpted part is hit. No invisible picking planes.
for(const select of livingSets.selectables){
 select.traverse(node=>{
  if(node.isMesh)node.userData.theatreClick='set';
 });
}
registerClick(deck,'record');
// The wire arch may be clicked even with the curtains closed as a fallback,
// but the accessible controls always work independently of 3D occlusion.
function syncSetControls(){
 const scene=sceneForSteps(state.stageSteps);
 const current=actIndex(state.stageSteps);
 const active=activeSets[current];
 setCaption.textContent=scene.title;
 setDescription.textContent=scene.description;
 setButton.textContent=active?'Let '+scene.name+' rest':'Bring '+scene.name+' to life';
 setButton.setAttribute('aria-pressed',String(active));
 setButton.setAttribute('aria-label',active?
  'Stop the physical '+scene.name+' set animation':
  'Animate the physical '+scene.name+' miniature set');
}
function toggleCurrentSet(){
 // Never animate hidden scenery behind closed curtains.
 if(!state.curtainsOpen)apply('curtains');
 inspectObject('act');
 const current=actIndex(state.stageSteps);
 activeSets=toggleScene(activeSets,current);
 syncSetControls();
 const info=sceneForSteps(state.stageSteps);
 status.textContent=info.title+' · '+(activeSets[current]?
  'The real little mechanisms come to life.':'The miniature mechanisms settle back to rest.');
}
function describe(next,action){
 if(action==='curtains')return next.curtainsOpen?
  'The real velvet curtains slide apart. There is an actual stage behind them.':
  'The two velvet curtains travel back to the middle of the rail.';
 if(action==='act')return 'The revolve turns to '+STAGE_ACTS[actIndex(next.stageSteps)]+
  '. Three physical sets, one shared rotating platform.';
 if(action==='record')return next.recordPlaying?
  'The record rotates and the tonearm swings into place. No audio is connected yet.':
  'The record stops; the real tonearm returns to its rest.';
 return 'The mechanical stage returns to its original position.';
}
function apply(action){
 const before=state;
 state=theatreState(state,{type:action});
 if(state===before)return;
 if(action==='act'||action==='reset')activeSets=resetScenes();
 openCurtains.textContent=state.curtainsOpen?'Close the curtains':'Open the curtains';
 openCurtains.setAttribute('aria-pressed',String(state.curtainsOpen));
 turnStage.textContent='Turn the stage · '+STAGE_ACTS[actIndex(state.stageSteps)];
 playRecord.textContent=state.recordPlaying?'Stop the record':'Start the record';
 playRecord.setAttribute('aria-pressed',String(state.recordPlaying));
 syncSetControls();
 status.textContent=describe(state,action);
}
function selectMechanism(id){
 if(id==='set'){toggleCurrentSet();return;}
 // The physical stage cannot be inspected if velvet is still in the way.
 if(id==='act'&&!state.curtainsOpen)apply('curtains');
 inspectObject(id);
 apply(id);
 status.textContent+=' The camera is moving in for a closer look.';
}
openCurtains.addEventListener('click',()=>selectMechanism('curtains'));
turnStage.addEventListener('click',()=>selectMechanism('act'));
setButton.addEventListener('click',toggleCurrentSet);
playRecord.addEventListener('click',()=>selectMechanism('record'));
overviewButton.addEventListener('click',viewWholeTheatre);
reset.addEventListener('click',()=>{
 apply('reset');
 viewWholeTheatre();
 status.textContent='The real curtains, stage and record player return to their original positions. Whole theatre view.';
});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape'||!cameraFocus)return;
 if(event.target?.closest?.('input,textarea,select,[contenteditable]'))return;
 event.preventDefault();
 viewWholeTheatre();
 overviewButton.blur();
});
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
function hit(event){
 if(!renderer)return null;
 const rect=canvas.getBoundingClientRect();
 if(!rect.width||!rect.height)return null;
 pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
 pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const target=raycaster.intersectObjects(hitTargets,false)[0]?.object;
 return target?.userData.theatreClick||null;
}
let start=null;
canvas.addEventListener('pointerdown',e=>{
 start={x:e.clientX,y:e.clientY};
});
canvas.addEventListener('pointerup',e=>{
 if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>9){start=null;return;}
 start=null;
 const picked=hit(e);
 if(picked)selectMechanism(picked);
 else if(cameraFocus)viewWholeTheatre();
});
canvas.addEventListener('pointermove',e=>{
 const picked=hit(e);
 canvas.style.cursor=picked?'pointer':'default';
 canvas.title=picked==='curtains'?'Approach and slide the physical velvet curtains':
  picked==='act'?'Approach and rotate the shared mechanical stage':
  picked==='set'?'Bring the physical '+sceneForSteps(state.stageSteps).name+' set to life':
  picked==='record'?'Approach and operate the real miniature gramophone':
  cameraFocus?'Return to the whole theatre':'The Impossible Theatre';
});
canvas.addEventListener('pointerleave',()=>{
 canvas.style.cursor='default';canvas.title='';
});
function resize(){
 if(!renderer)return;
 const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
 renderer.setSize(width,height,false);
 camera.aspect=width/height;
 camera.updateProjectionMatrix();
 updateCameraDestination();
}
window.addEventListener('resize',resize);
const resizeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
if(resizeObserver)resizeObserver.observe(canvas);
resize();
const clock=new THREE.Clock();
let recordAngle=0;
syncSetControls();
function frame(){
 const dt=Math.min(.08,clock.getDelta());
 const cameraSpeed=reducedMotion?.matches?1000:2.75;
 for(const axis of ['x','y','z']){
  camera.position[axis]=smoothTowards(camera.position[axis],desiredPosition[axis],dt,cameraSpeed);
  aim[axis]=smoothTowards(aim[axis],desiredAim[axis],dt,cameraSpeed);
 }
 camera.lookAt(aim);
 curtains.left.position.x=smoothTowards(curtains.left.position.x,curtainX('left',state.curtainsOpen),dt,4.7);
 curtains.right.position.x=smoothTowards(curtains.right.position.x,curtainX('right',state.curtainsOpen),dt,4.7);
 revolve.rotation.y=smoothTowards(revolve.rotation.y,stageAngle(state.stageSteps),dt,4.2);
 livingSets.update(dt,activeSets);
 // Real colour changes fall across the physical scenery as the stage turns.
 spotlight.color.lerp(lightCues[actIndex(state.stageSteps)],Math.min(1,dt*1.6));
 tonearm.rotation.y=smoothTowards(tonearm.rotation.y,tonearmAngle(state.recordPlaying),dt,5);
 recordAngle=recordAdvance(recordAngle,state.recordPlaying,dt);
 record.rotation.y=recordAngle;
 spotlight.intensity=smoothTowards(spotlight.intensity,state.curtainsOpen?115:48,dt,3.5);
 sideSpot.intensity=smoothTowards(sideSpot.intensity,state.curtainsOpen?72:38,dt,3.5);
 if(renderer)renderer.render(scene,camera);
 requestAnimationFrame(frame);
}
frame();

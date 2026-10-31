import * as THREE from './vendor/three-r159.module.min.js';

const plan=window.DH11RoomPlan;
if(!plan)throw Error('Missing DH-11C.2 room coordinates');
const canvas=document.getElementById('room-canvas');
const frame=document.getElementById('scene-frame');
const status=document.getElementById('interaction-status');
const tray=document.getElementById('interaction-tray');
const actions=document.getElementById('interaction-actions');
const homeButton=document.getElementById('home-button');
const focusButtons=[...document.querySelectorAll('[data-focus]')];
const cameraLabel=document.getElementById('camera-label');
const placeName=document.getElementById('place-name');
const placeDescription=document.getElementById('place-description');
const title=document.getElementById('interaction-title');
const copy=document.getElementById('interaction-copy');
const fallback=document.getElementById('scene-fallback');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{
 renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'default'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.18;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
}catch(error){
 fallback.hidden=false;
 fallback.textContent='WebGL could not start. Use the object selection buttons to read about the prototype, or return to the illustrated Writing room.';
 console.warn('DaveHub 3D unavailable',error);
}
const scene=new THREE.Scene();
scene.background=new THREE.Color('#1b1b2a');
scene.fog=new THREE.Fog('#1b1b2a',17,32);
const camera=new THREE.PerspectiveCamera(51,1,.08,80);
camera.position.set(...plan.HOME.position);
const focusPoint=new THREE.Vector3(...plan.HOME.target);
camera.lookAt(focusPoint);
const desiredPosition=camera.position.clone();
const desiredTarget=focusPoint.clone();
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const selectable=[];
const objects=new Map();
const accents=['#98bec4','#d0ae79','#789aab','#d9c2a7','#7d8d95'];
const matte=(hex,roughness=.85)=>new THREE.MeshStandardMaterial({color:hex,roughness,metalness:.08});
const mats={
 plaster:matte('#636775'),stone:matte('#555d66'),timber:matte('#756354'),
 darkwood:matte('#4b3f42'),edge:matte('#ad9478'),desk:matte('#766455'),
 brass:new THREE.MeshStandardMaterial({color:'#c2a26d',metalness:.55,roughness:.46}),
 paper:matte('#dbc9ab'),ink:matte('#494b57'),cabinet:matte('#57737b'),
 drawer:matte('#80989a'),rug:matte('#66505f'),glass:new THREE.MeshBasicMaterial({color:'#a4c3db',transparent:true,opacity:.7}),
 sky:new THREE.MeshBasicMaterial({color:'#6b8ca9',side:THREE.DoubleSide}),
 island:matte('#7e856e'),leaf:matte('#728b7b'),bin:matte('#677b81')
};
const box=(parent,w,h,d,mat,x=0,y=0,z=0)=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 mesh.position.set(x,y,z);
 parent.add(mesh);
 return mesh;
};
const sphere=(parent,r,mat,x=0,y=0,z=0)=>{
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat);
 mesh.position.set(x,y,z);parent.add(mesh);return mesh;
};
const cylinder=(parent,top,bottom,height,mat,x=0,y=0,z=0,sides=12)=>{
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,sides),mat);
 mesh.position.set(x,y,z);parent.add(mesh);return mesh;
};
const group=(parent,x=0,y=0,z=0)=>{
 const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;
};
const capture=(id,g)=>{
 const targets=[];
 g.traverse(o=>{if(o.isMesh){o.userData.objectId=id;selectable.push(o);targets.push(o);}});
 objects.set(id,{group:g,targets});
 return g;
};
function wallScene(){
 box(scene,14,.22,11,mats.darkwood,0,-.12,0);
 // Individual floor planks make room orientation visible at all camera angles.
 for(let x=-6.75;x<7;x+=.56)box(scene,.51,.016,10.7,x%2?mats.timber:mats.desk,x,.008,0);
 box(scene,14,6.4,.26,mats.plaster,0,3.2,-5.48);
 box(scene,.25,6.4,11,mats.stone,-6.97,3.2,0);
 box(scene,.25,6.4,11,mats.stone,6.97,3.2,0);
 for(const y of [.4,2.55,5.75]){
  box(scene,14,.11,.19,mats.timber,0,y,-5.3);
  for(const x of [-6.8,6.8])box(scene,.13,.12,11,mats.timber,x,y,0);
 }
 for(const x of [-6.6,-3.4,3.1,6.6]){
  box(scene,.2,6.25,.34,mats.darkwood,x,3.15,-5.15);
 }
 for(let z=-5;z<=5;z+=3.3)box(scene,14,.23,.3,mats.timber,0,6.0,z);
 box(scene,5.3,.025,3.65,mats.rug,.05,.045,1.12);
 for(const x of [-2.45,2.45]){
  box(scene,.07,.028,3.45,mats.edge,x,.065,1.12);
 }
 for(const z of [-.52,2.76])box(scene,5.1,.028,.06,mats.edge,.05,.065,z);
 scene.add(new THREE.HemisphereLight('#c3d4ea','#4d3842',2.25));
 const sun=new THREE.DirectionalLight('#ffe0ad',2.8);
 sun.position.set(-3,7,5);
 scene.add(sun);
 const lamp=new THREE.PointLight('#f1b982',26,7,2);
 lamp.position.set(-1.65,3.05,1.9);
 scene.add(lamp);
 const glow=new THREE.PointLight('#92b8d9',15,9,2);
 glow.position.set(.25,3.7,-3.5);scene.add(glow);
}
wallScene();

const cabinetDrawers=[];
function makeCabinet(){
 const g=group(scene,-4.7,0,-3.25);
 // A physical case: panels, aperture outlines, inner void, fixed single perspective.
 box(g,1.92,3.66,1.16,mats.cabinet,0,1.83,-.17);
 box(g,1.79,3.43,.075,mats.ink,0,1.83,.441);
 for(const x of [-.92,.92]){
  box(g,.1,3.66,1.2,mats.brass,x,1.83,-.16);
 }
 for(const y of [.12,3.58])box(g,1.99,.13,1.18,mats.brass,0,y,-.16);
 const names=['Finished','Drafts','Oddities','Fragments','Field Notes'];
 for(let i=0;i<5;i++){
  const yy=3.18-i*.615;
  box(g,1.67,.53,.06,mats.darkwood,0,yy,.493);
  const tray=group(g,0,yy,.52);
  box(tray,1.61,.48,.08,mats.drawer,0,0,0);
  box(tray,1.6,.075,.83,mats.timber,0,-.207,-.39);
  for(const x of [-.78,.78])box(tray,.07,.41,.83,mats.timber,x,-.015,-.39);
  box(tray,1.6,.35,.08,mats.timber,0,-.055,-.81);
  box(tray,.65,.16,.025,mats.paper,0,.095,.056);
  box(tray,.58,.055,.09,mats.brass,0,-.085,.123);
  for(let f=0;f<4;f++){
   const folder=box(tray,.23,.24,.018,mats.paper,-.48+f*.32,.06,-.3-f*.03);
   folder.rotation.y=(f%2?.12:-.1);
  }
  const tag=makeText(names[i],.38,.11,'#33434b','#efe0c2');
  tag.position.set(0,.095,.074);tray.add(tag);
  cabinetDrawers.push(tray);
 }
 const mesh=capture('cabinet',g);
 return mesh;
}
function makeText(text,w,h,colour='#30252d',fill='#e8d4b2'){
 const c=document.createElement('canvas');c.width=512;c.height=128;
 const ctx=c.getContext('2d');
 ctx.fillStyle=fill;ctx.fillRect(0,0,512,128);
 ctx.strokeStyle='#ab9474';ctx.lineWidth=9;ctx.strokeRect(7,7,498,114);
 ctx.fillStyle=colour;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 52px Georgia,serif';ctx.fillText(text,256,67,485);
 const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
 return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:false,side:THREE.DoubleSide}));
}
makeCabinet();

const loosePapers=[],paperStacks=[];
function makeDesk(){
 const g=group(scene,-.3,0,.6);
 box(g,4.5,.2,2.15,mats.desk,0,1.29,0);
 for(const x of [-1.98,1.98])for(const z of [-.85,.85])box(g,.21,1.15,.23,mats.darkwood,x,.61,z);
 box(g,4.04,.4,.12,mats.darkwood,0,1.0,.94);
 for(let i=0;i<13;i++){
  const x=-1.76+(i%5)*.67,z=-.66+Math.floor(i/5)*.52;
  const mesh=box(g,.49,.012,.32,mats.paper,x,1.41+(i%4)*.022,z);
  mesh.rotation.y=(i%3-1)*.22;
  if(i<6)loosePapers.push(mesh);
  paperStacks.push(mesh);
 }
 const shade=cylinder(g,.28,.47,.31,mats.brass,-1.67,2.32,-.43,10);
 cylinder(g,.035,.035,.96,mats.brass,-1.67,1.86,-.43);
 sphere(g,.095,mats.paper,-1.67,2.22,-.43);
 cylinder(g,.28,.28,.12,mats.timber,-1.67,1.4,-.43);
 const cup=cylinder(g,.13,.105,.26,mats.ink,-.88,1.53,.57);
 cup.rotation.z=.08;
 const file=group(g,-.55,1.42,-.7);
 box(file,.86,.14,.64,mats.darkwood);
 box(file,.66,.025,.44,mats.paper,0,.09,0);
 capture('desk',g);
 return g;
}
makeDesk();

let typeKey=null;
function makeTypewriter(){
 const g=group(scene,1.08,1.42,.66);
 box(g,.95,.21,.55,mats.ink,0,.07,0);
 box(g,.79,.2,.3,mats.stone,0,.2,-.08);
 for(let row=0;row<3;row++)for(let i=0;i<8;i++){
  const k=box(g,.067,.025,.059,mats.brass,-.34+i*.099,.194,.11+row*.092);
  if(row===1&&i===4)typeKey=k;
 }
 const roller=cylinder(g,.056,.056,.91,mats.ink,0,.38,-.22,12);
 roller.rotation.z=Math.PI/2;
 box(g,.64,.58,.02,mats.paper,0,.68,-.24);
 box(g,.57,.02,.015,mats.edge,0,.65,-.224);
 capture('typewriter',g);
 return g;
}
makeTypewriter();

const pullBooks=[];
function makeBookcase(){
 const g=group(scene,4.7,0,-3.85);
 box(g,3.1,4.47,.77,mats.darkwood,0,2.23,0);
 box(g,2.9,4.17,.12,mats.ink,0,2.22,.35);
 for(const x of [-1.5,1.5])box(g,.13,4.55,.81,mats.timber,x,2.23,.04);
 for(let y=.47;y<=4.08;y+=.91)box(g,3.04,.095,.84,mats.edge,0,y,.11);
 const colours=['#a59482','#6e737f','#9b8878','#b1a391','#5a7181','#7b6559','#a7a5a1'];
 for(let shelf=0;shelf<4;shelf++){
  for(let b=0;b<20;b++){
   const height=.43+((b*7+shelf*13)%7)*.044;
   const x=-1.32+b*.139,y=.54+shelf*.91+height/2;
   const bk=box(g,.111,height,.43,matte(colours[(shelf*4+b)%colours.length]),x,y,.44);
   if((b+shelf)%11===0)pullBooks.push(bk);
  }
 }
 box(g,3.3,.16,.97,mats.brass,0,4.51,.07);
 capture('bookcase',g);
 return g;
}
makeBookcase();
function makeBin(){
 const g=group(scene,-3.2,0,2.45);
 const bin=cylinder(g,.43,.36,.84,mats.bin,0,.44,0,13);
 bin.material.side=THREE.DoubleSide;
 cylinder(g,.43,.43,.055,mats.brass,0,.84,0,13);
 for(let i=0;i<9;i++){
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.15+(i%3)*.028,0),mats.paper);
  const t=i*2.39,r=.22+((i%3)*.04);m.position.set(Math.cos(t)*r,.82+(i%4)*.075,Math.sin(t)*r);
  m.rotation.set(.31*i,.72*i,.21*i);g.add(m);
 }
 capture('bin',g);return g;
}
makeBin();
let doorLeaf;
function makeDoor(){
 const g=group(scene,6.78,0,-.2);
 const frame=group(g,0,0,0);
 for(const x of [-1.2,1.2])box(frame,.12,4.6,.23,mats.edge,x,2.3,0);
 box(frame,2.56,.17,.25,mats.edge,0,4.55,0);
 // Door in the side wall; door leaf rotates around the vertical hinge.
 const hinge=group(g,-1.12,0,0);
 box(hinge,2.19,4.28,.12,mats.timber,1.095,2.21,0);
 for(const y of [.55,2,3.55])box(hinge,1.8,.045,.14,mats.brass,1.08,y,.075);
 sphere(hinge,.095,mats.brass,1.85,2.1,.15);
 g.rotation.y=-Math.PI/2;
 doorLeaf=hinge;
 capture('door',g);return g;
}
makeDoor();
const islandGroups=[];
function makeWindow(){
 const g=group(scene,.17,3.65,-5.31);
 box(g,3.4,2.75,.06,mats.edge,0,0,-.08);
 box(g,3.13,2.47,.04,mats.sky,0,0,-.032);
 // Islands are low-poly forms against a sky plane, never photographs.
 for(let i=0;i<3;i++){
  const cx=[-.9,.36,1.04][i],cy=[.1,.55,-.27][i],size=[.46,.56,.33][i];
  const island=group(g,cx,cy,.035);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(size*.8,size*.63,7),mats.island);
  cone.rotation.z=Math.PI;cone.position.y=-size*.32;island.add(cone);
  cylinder(island,size*.75,size*.64,size*.22,mats.leaf,0,0,0,7);
  box(island,size*.13,size*.52,size*.12,mats.paper,0,size*.25,0);
  box(island,size*.35,.09,.2,mats.paper,0,size*.5,0);
  islandGroups.push(island);
 }
 box(g,.09,2.7,.13,mats.edge,0,0,.12);
 box(g,3.3,.09,.13,mats.edge,0,0,.12);
 for(const x of [-1.58,1.58])box(g,.13,2.85,.16,mats.timber,x,0,.1);
 for(const y of [-1.33,1.33])box(g,3.42,.13,.16,mats.timber,0,y,.1);
 capture('window',g);return g;
}
makeWindow();

const copyById={
 desk:'The desk is piled with individually modelled paper sheets, an ink pot and a lamp. Rummage through the papers to move the top sheets.',
 cabinet:'The five drawers belong to one physical cabinet. Each drawer is a collection of 3D surfaces that move together, never a pasted illustration.',
 bookcase:'The shelves and books occupy real positions. Try pulling a book forward to reveal an unexpected gap.',
 typewriter:'The typewriter has separate keys, a roller and a paper sheet. Tap to press a key and advance the paper.',
 bin:'The bin contains crumpled, low-poly paper. Give the pile a rummage.',
 door:'The door opens on a real vertical hinge. It provides a way back towards the floating DaveHub islands.',
 window:'The distant islands are simple geometry behind the window frame. Their tiny movement is a first pass at bringing the world to life.'
};
let state=plan.next(null,{type:'init'});
const drawerHome=cabinetDrawers.map(x=>x.position.z);
const bookHome=pullBooks.map(x=>x.position.z);
const typeHome=typeKey?.position.y||.19;
let currentHover=null;
function focus(id){
 if(!plan.find(id))return;
 state=plan.next(state,{type:'focus',id});
 const obj=plan.find(id);
 desiredPosition.set(...obj.camera);
 desiredTarget.set(...obj.lookAt);
 homeButton.disabled=false;
 cameraLabel.textContent=obj.label.toUpperCase()+' CAMERA';
 placeName.textContent=obj.label;
 placeDescription.textContent=obj.action;
 for(const b of focusButtons)b.setAttribute('aria-pressed',String(b.dataset.focus===id));
 tray.hidden=false;title.textContent=obj.label;copy.textContent=copyById[id];
 renderControls(id);
 status.textContent=obj.label+' selected. The camera is approaching.';
 if(reduced.matches){camera.position.copy(desiredPosition);focusPoint.copy(desiredTarget);camera.lookAt(focusPoint);}
}
function home(){
 state=plan.next(state,{type:'home'});
 desiredPosition.set(...plan.HOME.position);desiredTarget.set(...plan.HOME.target);
 cameraLabel.textContent='OVERVIEW CAMERA';homeButton.disabled=true;
 placeName.textContent='The Manuscript Hoard';placeDescription.textContent='An actual 3D study. Explore its objects.';
 for(const b of focusButtons)b.setAttribute('aria-pressed','false');
 tray.hidden=true;
 if(reduced.matches){camera.position.copy(desiredPosition);focusPoint.copy(desiredTarget);camera.lookAt(focusPoint);}
}
const drawerNames=['Finished','Drafts','Oddities','Fragments','Field Notes'];
function renderControls(id){
 actions.replaceChildren();
 const add=(label,action)=>{
  const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);
  actions.append(b);
 };
 if(id==='cabinet'){
  drawerNames.forEach((n,i)=>add((state.drawer===i?'Close ':'Open ')+n,()=>{
   state=plan.next(state,{type:'drawer',index:i});
   status.textContent=n+(state.drawer===i?' drawer extended along the cabinet depth axis.':' drawer closed.');
   renderControls('cabinet');
  }));
 }else if(id==='desk')add('Move a paper stack',()=>{state=plan.next(state,{type:'paper'});status.textContent='Papers shifted: '+state.paper+' (up to ten).';});
 else if(id==='bookcase')add('Pull a book out',()=>{state=plan.next(state,{type:'book'});status.textContent='A book slides forward. Click again to inspect another.';});
 else if(id==='typewriter')add('Press a key',()=>{state=plan.next(state,{type:'type'});status.textContent='A key depresses. '+state.typed+' characters typed.';});
 else if(id==='bin')add('Rummage through paper',()=>{state=plan.next(state,{type:'bin'});status.textContent='The loose paper changes position.';});
 else if(id==='door'){
  add(state.doorOpen?'Close the door':'Open the door',()=>{state=plan.next(state,{type:'door'});status.textContent=state.doorOpen?'The door swings open on its hinge.':'The door swings shut.';renderControls('door');});
  if(state.doorOpen){const a=document.createElement('a');a.href='/';a.textContent='Return to DaveHub islands ↗';actions.append(a);}
 }else if(id==='window')add('Look at the islands',()=>{status.textContent='These are low-poly floating islands within the same 3D room.';});
}
for(const b of focusButtons)b.addEventListener('click',()=>focus(b.dataset.focus));
homeButton.addEventListener('click',home);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.focus){e.preventDefault();home();}});
function objectFromEvent(event){
 if(!renderer)return null;
 const rect=canvas.getBoundingClientRect();
 if(rect.width===0||rect.height===0)return null;
 pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects(selectable,false);
 return hits[0]?.object?.userData?.objectId||null;
}
canvas.addEventListener('pointermove',event=>{
 const hovered=objectFromEvent(event);
 if(hovered!==currentHover){currentHover=hovered;canvas.classList.toggle('interactive',!!hovered);canvas.title=hovered?'Explore '+plan.find(hovered).label:'';}
});
canvas.addEventListener('pointerleave',()=>{currentHover=null;canvas.classList.remove('interactive');canvas.title='';});
let pointerStart=null;
canvas.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
canvas.addEventListener('pointerup',event=>{
 if(!pointerStart||Math.hypot(pointerStart.x-event.clientX,pointerStart.y-event.clientY)>8){pointerStart=null;return;}
 pointerStart=null;
 const id=objectFromEvent(event);
 if(!id)return;
 if(state.focus===id){
  if(id==='cabinet')state=plan.next(state,{type:'drawer',index:0});
  else if(id==='desk')state=plan.next(state,{type:'paper'});
  else if(id==='bookcase')state=plan.next(state,{type:'book'});
  else if(id==='typewriter')state=plan.next(state,{type:'type'});
  else if(id==='bin')state=plan.next(state,{type:'bin'});
  else if(id==='door')state=plan.next(state,{type:'door'});
  renderControls(id);
  status.textContent=plan.find(id).label+' responds to your interaction.';
 }else focus(id);
});
function resize(){
 if(!renderer)return;
 const w=frame.clientWidth,h=frame.clientHeight;
 if(!w||!h)return;
 renderer.setSize(w,h,false);
 camera.aspect=w/h;
 // The taller camera frame still sees the room without distorting its world geometry.
 camera.fov=w<600?62:51;
 camera.updateProjectionMatrix();
}
if(renderer){
 resize();
 if(typeof ResizeObserver!=='undefined'){new ResizeObserver(resize).observe(frame);}
 else window.addEventListener('resize',resize);
}
const clock=new THREE.Clock();
function render(){
 const delta=Math.min(clock.getDelta(),.08);
 if(renderer){
  const rate=reduced.matches?1:1-Math.exp(-5.5*delta);
  camera.position.lerp(desiredPosition,rate);
  focusPoint.lerp(desiredTarget,rate);
  camera.lookAt(focusPoint);
  for(let i=0;i<cabinetDrawers.length;i++){
   const target=state.drawer===i ? .65 : 0;
   cabinetDrawers[i].position.z=THREE.MathUtils.lerp(cabinetDrawers[i].position.z,drawerHome[i]+target,rate);
  }
  for(let i=0;i<pullBooks.length;i++){
   const target=i===state.book ? .37 : 0;
   pullBooks[i].position.z=THREE.MathUtils.lerp(pullBooks[i].position.z,bookHome[i]+target,rate);
  }
  if(typeKey)typeKey.position.y=THREE.MathUtils.lerp(typeKey.position.y,typeHome+(state.typed>0?-.025:0),rate);
  if(doorLeaf)doorLeaf.rotation.y=THREE.MathUtils.lerp(doorLeaf.rotation.y,state.doorOpen?-.96:0,rate);
  loosePapers.forEach((mesh,i)=>{
   const target=state.paper>i? .1*Math.sin(i*1.9):0;
   mesh.rotation.z=THREE.MathUtils.lerp(mesh.rotation.z,target,rate);
  });
  if(!reduced.matches){
   const t=clock.elapsedTime;
   islandGroups.forEach((g,i)=>{g.position.y=[.1,.55,-.27][i]+Math.sin(t*.65+i)*.055;});
  }
  renderer.render(scene,camera);
 }
 requestAnimationFrame(render);
}
render();

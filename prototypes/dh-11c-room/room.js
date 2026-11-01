import * as THREE from './vendor/three-r159.module.min.js';
import {drawerIndexForMesh} from './drawer-picking.mjs';
import {paperPose,paperIndexForMesh,PAPER_LIMIT,pressDepth,typewriterFeed,TYPE_PAPER_HEIGHT,featuredBook,featuredBookIndexForMesh,FEATURED_BOOK_COUNT,bookPosition,binPaperIndexForMesh,binPaperPose,BIN_PAPER_COUNT,typedKeyIndex,TYPE_KEY_COUNT} from './furniture-motion.mjs';

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
const artLab=typeof document!=='undefined'&&document.body.dataset.artLab==='true';
const glbProof=document.body.dataset.glbProof==='true';
const shellProof=document.body.dataset.shellProof==='true';
const shellModelProof=document.body.dataset.shellModelProof==='true';
const furnitureModelProof=document.body.dataset.furnitureModelProof==='true';
let shellFallback=null;
const blenderCompare=document.body.dataset.blenderCompare==='true';
let glbExtension=1;
const bookMaterials=[];
const sceneLights={};
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
 if(shellModelProof){
  const manifest=window.DH11ShellAsset;
  if(!manifest||!manifest.parts?.length)throw Error('Missing DH-11C.4E shell asset manifest');
  shellFallback=group(scene);
  shellFallback.name='architecture_fallback';
  for(const part of manifest.parts)box(shellFallback,...part.size,mats[part.material],...part.position).name=part.name;
 }else{
 box(scene,14,.22,11,mats.darkwood,0,-.12,0);
 // Individual floor planks make room orientation visible at all camera angles.
 for(let x=-6.75;x<7;x+=.56)box(scene,.51,.016,10.7,x%2?mats.timber:mats.desk,x,.008,0);
 if(shellProof){
  const shell=window.DH11RoomShell;
  if(!shell||!shell.check())throw Error('Missing valid 3D aperture plan');
  for(const part of shell.panels){
   const m=box(scene,...part.dimensions,mats[part.material],...part.centre);
   m.name=part.id;
  }
  // Genuine architectural reveal surfaces around the wall thickness,
  // placed on the aperture EDGES rather than across the opening itself.
  for(const edge of [shell.window.xMin,shell.window.xMax])
   box(scene,.09,shell.window.yMax-shell.window.yMin,.34,mats.edge,edge,(shell.window.yMin+shell.window.yMax)/2,shell.window.wallZ);
  for(const edge of [shell.window.yMin,shell.window.yMax])
   box(scene,shell.window.xMax-shell.window.xMin,.09,.34,mats.edge,(shell.window.xMin+shell.window.xMax)/2,edge,shell.window.wallZ);
  // View through the open doorway into a small, actual neighbouring corridor.
  box(scene,2.85,.11,2.45,mats.darkwood,8.2,-.11,-.2);
  for(const z of [-1.47,1.07])box(scene,2.8,4.7,.12,mats.plaster,8.25,2.35,z);
  box(scene,.12,4.7,2.55,mats.stone,9.65,2.35,-.2);
  box(scene,2.8,.12,2.55,mats.timber,8.25,4.65,-.2);
 }else{
  box(scene,14,6.4,.26,mats.plaster,0,3.2,-5.48);
  box(scene,.25,6.4,11,mats.stone,6.97,3.2,0);
 }
 box(scene,.25,6.4,11,mats.stone,-6.97,3.2,0);
 for(const y of [.4,2.55,5.75]){
  if(shellProof&&y===2.55){
   // The original continuous skirting crossed the glass opening.
   box(scene,5.39,.11,.19,mats.timber,(-7-1.61)/2,y,-5.3);
   box(scene,5.05,.11,.19,mats.timber,(1.95+7)/2,y,-5.3);
  }else box(scene,14,.11,.19,mats.timber,0,y,-5.3);
  box(scene,.13,.12,11,mats.timber,-6.8,y,0);
  if(shellProof&&y<4.66){
   box(scene,.13,.12,4.02,mats.timber,6.8,y,(-5.5-1.48)/2);
   box(scene,.13,.12,4.42,mats.timber,6.8,y,(1.08+5.5)/2);
  }else box(scene,.13,.12,11,mats.timber,6.8,y,0);
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
 }
 const ambient=new THREE.HemisphereLight('#c3d4ea','#4d3842',2.25);
 sceneLights.ambient=ambient;scene.add(ambient);
 const sun=new THREE.DirectionalLight('#ffe0ad',2.8);
 sun.position.set(-3,7,5);
 sceneLights.sun=sun;scene.add(sun);
 const lamp=new THREE.PointLight('#f1b982',26,7,2);
 lamp.position.set(-1.65,3.05,1.9);
 sceneLights.lamp=lamp;scene.add(lamp);
 const glow=new THREE.PointLight('#92b8d9',15,9,2);
 glow.position.set(.25,3.7,-3.5);sceneLights.window=glow;scene.add(glow);
}
wallScene();
if(shellModelProof){
 // Only the isolated DH-11C.4E proof uses a GLB room shell.
 // A complete source-manifest mesh stays visible until the GLB loads, then is
 // hidden, so failed/missing model files never leave an empty room.
 const output=document.getElementById('shell-model-status');
 const report=message=>{if(output)output.textContent=message;};
 import('./vendor/GLTFLoader-r159.js').then(({GLTFLoader})=>{
  new GLTFLoader().load('../room/models/room-shell-blender-verified.glb',gltf=>{
   if(!gltf.scene.getObjectByName('room_shell_root'))throw Error('Room shell GLB root missing');
   const model=gltf.scene;model.name='room_shell_glb';
   model.traverse(o=>{if(o.isMesh)o.userData.architecture=true;});
   scene.add(model);
   if(shellFallback)shellFallback.visible=false;
   report('Blender-exported room architecture loaded: floor, beams, genuine door/window openings and corridor. The rest of the scene is unchanged.');
  },undefined,error=>{
   console.warn('Room GLB failed to load',error);
   report('Architecture GLB could not load. Rendering the identical source geometry as a safe fallback.');
  });
 }).catch(error=>{console.warn('Room GLB loader failed',error);report('GLB loader failed. Source geometry fallback remains visible.');});
}

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
if(!glbProof)makeCabinet();

const loosePapers=[],paperStacks=[];
let paperHomes=[];
function makeDesk(){
 const g=group(scene,-.3,0,.6);
 box(g,4.5,.2,2.15,mats.desk,0,1.29,0);
 for(const x of [-1.98,1.98])for(const z of [-.85,.85])box(g,.21,1.15,.23,mats.darkwood,x,.61,z);
 box(g,4.04,.4,.12,mats.darkwood,0,1.0,.94);
 // Paper locations avoid the lamp, open folder, typewriter and cup;
 // no sheet begins intersecting a prop or overhanging the tabletop.
 const paperLayout=[
  [.20,-.72],[.78,-.72],[1.36,-.72],[1.91,-.72],
  [-1.75,.18],[-1.05,0],[-.42,0],[.20,0],
  [-1.70,.65],[-.06,.68],[.34,.68],[1.02,.68],[1.72,.68]
 ];
 for(let i=0;i<13;i++){
  const [x,z]=paperLayout[i];
  // Desk surface top is 1.29 + .20/2 = 1.39m. Paper half-thickness is .006m.
  // Keep the first sheet 1mm above the surface, with sub-millimetre layer gaps.
  const mesh=box(g,.49,.012,.32,mats.paper,x,1.397+i*.00035,z);
  mesh.name='desk_paper_'+String(i).padStart(2,'0');
  mesh.rotation.y=(i%3-1)*.22;
  mesh.userData.paperIndex=i;
  if(i<PAPER_LIMIT)loosePapers.push(mesh);
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
paperHomes=loosePapers.map(m=>({x:m.position.x,y:m.position.y,z:m.position.z,yaw:m.rotation.y,tilt:m.rotation.z}));

let typeKey=null;
const typeKeys=[];
let typeKeyHomes=[],typePaper=null,typePaperHome=0,typePaperHomeScaleY=1;
let typePaperRule=null,typePaperRuleHome=0,typePlaten=null,typePlatenHome=null;
// The cylinder is modelled along local Y, then laid along the typewriter's X.
// Its spin must be around the CYLINDER'S LOCAL Y, not the room's vertical Y.
const platenAxis=new THREE.Vector3(0,1,0);
const platenSpin=new THREE.Quaternion(),platenTarget=new THREE.Quaternion();
let activePress=null,pressSerial=0;
function makeTypewriter(){
 const g=group(scene,1.08,1.42,.66);
 box(g,.95,.21,.55,mats.ink,0,.07,0);
 box(g,.79,.2,.3,mats.stone,0,.2,-.08);
 for(let row=0;row<3;row++)for(let i=0;i<8;i++){
  const k=box(g,.067,.025,.059,mats.brass,-.34+i*.099,.194,.11+row*.092);
  k.name='typewriter_key_'+row+'_'+i;
  typeKeys.push(k);
  if(row===1&&i===4)typeKey=k;
 }
 const roller=cylinder(g,.056,.056,.91,mats.ink,0,.38,-.22,12);
 roller.rotation.z=Math.PI/2;typePlaten=roller;
 typePaper=box(g,.64,.58,.02,mats.paper,0,.68,-.24);
 typePaperRule=box(g,.57,.02,.015,mats.edge,0,.65,-.224);
 capture('typewriter',g);
 return g;
}
makeTypewriter();
typeKeyHomes=typeKeys.map(key=>key.position.y);
typePaperHome=typePaper.position.y;typePaperHomeScaleY=typePaper.scale.y;
typePaperRuleHome=typePaperRule.position.y;typePlatenHome=typePlaten.quaternion.clone();

const pullBooks=[];
// Eight interactive books get unmistakable jewel-turquoise bindings and
// three gilded spine marks. The unlit gilt stays vivid in the dim study.
// Use opaque high-contrast pigment instead of relying on a faint emissive
// accent. All eight bindings are visibly different even under poor lighting.
const FEATURE_BOOK_COLOUR='#24f5da';
const featureBookGilt=new THREE.MeshBasicMaterial({color:'#ffe681',toneMapped:false});
function featuredBookColour(mesh){
 mesh.material.color.set(FEATURE_BOOK_COLOUR);
 if(mesh.material.emissive){
  mesh.material.emissive.set('#0f9f9e');
  mesh.material.emissiveIntensity=.85;
 }
}
function markFeaturedBook(mesh,index){
 mesh.userData.featuredBookIndex=index;
 mesh.material=mesh.material.clone();
 featuredBookColour(mesh);
 if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
 const bounds=mesh.geometry.boundingBox;
 // glTF uses a unit box plus mesh.scale, while the procedural fallback has
 // real-sized BoxGeometry. Compensate for that scale in all three dimensions.
 const dx=bounds.max.x-bounds.min.x,dy=bounds.max.y-bounds.min.y;
 const sy=Math.max(Math.abs(mesh.scale.y),.0001);
 const sz=Math.max(Math.abs(mesh.scale.z),.0001);
 const x=(bounds.min.x+bounds.max.x)/2,z=bounds.max.z+.004/sz;
 for(const [n,part,width,height] of [
  [0,.18,.9,.025],[1,.5,.58,.095],[2,.82,.9,.025]
 ]){
  const accent=new THREE.Mesh(
   new THREE.BoxGeometry(dx*width,height/sy,.006/sz),featureBookGilt);
  accent.position.set(x,bounds.min.y+dy*part,z);
  accent.name='featured_book_gilt_'+index+'_'+n;
  // The gilt can be clicked too, not only the coloured book underneath.
  accent.userData.featuredBookIndex=index;
  mesh.add(accent);
 }
}
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
   const bookMat=matte(colours[(shelf*4+b)%colours.length]);
   const bk=box(g,.111,height,.43,bookMat,x,y,.44);
   bk.name='book_'+shelf+'_'+String(b).padStart(2,'0');
   if(featuredBook(shelf,b)){
    markFeaturedBook(bk,pullBooks.length);
    pullBooks.push(bk);
   }
   // Art lab recolours the actual mesh material, including selected books.
   bookMaterials.push(bk.material);
  }
 }
 box(g,3.3,.16,.97,mats.brass,0,4.51,.07);
 capture('bookcase',g);
 return g;
}
makeBookcase();
const binPapers=[];
let binPaperHomes=[],binPaperProgress=Array(BIN_PAPER_COUNT).fill(0);
const binPaperHome=mesh=>({
 x:mesh.position.x,y:mesh.position.y,z:mesh.position.z,
 rx:mesh.rotation.x,ry:mesh.rotation.y,rz:mesh.rotation.z
});
function makeBin(){
 const g=group(scene,-3.2,0,2.45);
 const bin=cylinder(g,.43,.36,.84,mats.bin,0,.44,0,13);
 bin.material.side=THREE.DoubleSide;
 cylinder(g,.43,.43,.055,mats.brass,0,.84,0,13);
 for(let i=0;i<9;i++){
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.15+(i%3)*.028,0),mats.paper);
  const t=i*2.39,r=.22+((i%3)*.04);m.position.set(Math.cos(t)*r,.82+(i%4)*.075,Math.sin(t)*r);
  m.rotation.set(.31*i,.72*i,.21*i);
  m.name='bin_paper_'+i;
  m.userData.binPaperIndex=i;
  g.add(m);binPapers.push(m);
 }
 capture('bin',g);return g;
}
makeBin();
binPaperHomes=binPapers.map(binPaperHome);
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
 if(!shellProof)box(g,3.4,2.75,.06,mats.edge,0,0,-.08);
 box(g,3.13,2.47,.04,mats.sky,0,0,shellProof?-.54:-.032);
 // Islands are low-poly forms against a sky plane, never photographs.
 for(let i=0;i<3;i++){
  const cx=[-.9,.36,1.04][i],cy=[.1,.55,-.27][i],size=[.46,.56,.33][i];
  const island=group(g,cx,cy,shellProof?-.19:.035);
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

// DH-11C.3A opt-in art laboratory. This only recolours materials and lighting;
// camera, transforms, meshes, pivots, raycasting and interactions are unchanged.
// Normal DH-11C.2 preview has no art-lab flag and retains its exact baseline.
function setArtPreset(palette){
 for(const [name,material] of Object.entries(mats)){
  if(palette[name]&&material.color)material.color.set(palette[name]);
 }
 bookMaterials.forEach((material,i)=>material.color.set(palette.bookSpines[i%palette.bookSpines.length]));
 // Preserve highlighted bindings when an art-lab palette is selected.
 pullBooks.forEach(featuredBookColour);
 scene.background.set(palette.backdrop);
 if(scene.fog)scene.fog.color.set(palette.backdrop);
 sceneLights.ambient.color.set(palette.ambient);
 sceneLights.ambient.groundColor.set(palette.ground);
 sceneLights.ambient.intensity=palette.ambientIntensity;
 sceneLights.sun.color.set(palette.sun);
 sceneLights.sun.intensity=palette.sunIntensity;
 sceneLights.lamp.color.set(palette.lamp);
 sceneLights.lamp.intensity=palette.lampIntensity;
 sceneLights.window.color.set(palette.window);
 sceneLights.window.intensity=palette.windowIntensity;
 if(renderer)renderer.toneMappingExposure=palette.exposure;
}
if(artLab){
 const contract=window.DH11ArtPalettes;
 const options=[...document.querySelectorAll('[data-palette]')];
 if(!contract||options.length!==3)throw Error('DH-11C.3A art lab missing palette controls');
 const current=document.getElementById('style-current');
 const summary=document.getElementById('style-summary');
 function choose(id){
  const preset=contract.get(id);
  setArtPreset(preset);
  for(const option of options)option.setAttribute('aria-pressed',String(option.dataset.palette===preset.id));
  if(current)current.textContent=preset.name;
  if(summary)summary.textContent=preset.description;
  document.documentElement.style.setProperty('--style-accent',preset.brass);
 }
 for(const option of options)option.addEventListener('click',()=>choose(option.dataset.palette));
 choose(contract.all[0].id);
}

const copyById={
 desk:'Each sheet has two places on the desktop. Click a particular piece of paper to slide it out; click the same paper again to slide it back.',
 cabinet:'The five drawers belong to one physical cabinet. Each drawer is a collection of 3D surfaces that move together, never a pasted illustration.',
 bookcase:'Find the eight turquoise books with gold spine markings. Click one to pull it forward, then click it again to return it. The other 72 books stay on their shelves.',
 typewriter:'The typewriter has separate keys, a roller and a paper sheet. Tap to press a key and advance the paper.',
 bin:'Nine crumpled manuscripts are piled in this bin. Click a particular paper ball to toss it onto the floor; click the same one to return it. Each piece moves independently.',
 door:'The door opens on a real vertical hinge. It provides a way back towards the floating DaveHub islands.',
 window:'The distant islands are simple geometry behind the window frame. Their tiny movement is a first pass at bringing the world to life.'
};
let state=plan.next(null,{type:'init'});
const drawerHome=cabinetDrawers.map(x=>x.position.z);
let bookHome=pullBooks.map(x=>x.position.z);
// All 24 keys, the platen and the paper have separate animation references.
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
function bookDescription(index){
 const shelf=Math.floor(index/2),slot=(10-shelf)%10+(index%2)*10;
 return 'Shelf '+(shelf+1)+', book '+(slot+1);
}
function toggleBook(index){
 if(!Number.isInteger(index)||index<0||index>=FEATURED_BOOK_COUNT)return;
 const wasPulled=state.books[index];
 state=plan.next(state,{type:'book',index});
 if(wasPulled===state.books[index])return;
 status.textContent=bookDescription(index)+(state.books[index]?
  ' slides forward. Click it again to return it.':' slides back into its original slot.');
 syncBookControls();
}
function syncBookControls(){
 for(const button of actions.querySelectorAll('[data-book-index]')){
  const index=Number(button.dataset.bookIndex),pulled=state.books[index];
  button.textContent=bookDescription(index)+(pulled?' · return':' · pull');
  button.setAttribute('aria-pressed',String(pulled));
 }
}
function toggleBinPaper(index){
 if(!Number.isInteger(index)||index<0||index>=BIN_PAPER_COUNT)return;
 const wasOut=state.binPapers[index];
 state=plan.next(state,{type:'bin',index});
 if(state.binPapers[index]===wasOut)return;
 status.textContent='Crumpled paper '+(index+1)+(state.binPapers[index]?
  ' tumbles out of the bin onto the floor.':' returns to its original place in the bin.');
 syncBinPaperControls();
}
function syncBinPaperControls(){
 for(const button of actions.querySelectorAll('[data-bin-paper-index]')){
  const index=Number(button.dataset.binPaperIndex),out=state.binPapers[index];
  button.textContent='Paper '+(index+1)+(out?' · return':' · rummage');
  button.setAttribute('aria-pressed',String(out));
 }
}
function togglePaper(index){
 if(!Number.isInteger(index)||index<0||index>=PAPER_LIMIT)return;
 const wasMoved=state.papers[index];
 state=plan.next(state,{type:'paper',index});
 if(state.papers[index]===wasMoved)return;
 status.textContent='Sheet '+(index+1)+(state.papers[index]?
  ' slides to its second place on the desk.':' slides back to its original place.');
 syncPaperControls();
}
function syncPaperControls(){
 for(const button of actions.querySelectorAll('[data-paper-index]')){
  const index=Number(button.dataset.paperIndex),moved=state.papers[index];
  button.textContent='Sheet '+(index+1)+(moved?' · return':' · move');
  button.setAttribute('aria-pressed',String(moved));
 }
}
function pressTypewriter(index=null){
 state=plan.next(state,{type:'type'});
 const selected=index===null?pressSerial%typeKeys.length:index;
 pressSerial++;
 activePress={index:selected,at:clock.elapsedTime};
 status.textContent='Key '+(selected+1)+' struck. '+state.typed+' characters typed; paper advances.';
}
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
 }else if(id==='desk'){
  // Click the actual named 3D mesh; equivalent controls remain keyboard accessible.
  const help=document.createElement('p');
  help.textContent='Click a particular paper to slide it out. Click it again to return it.';
  actions.append(help);
  const details=document.createElement('details');
  const summary=document.createElement('summary');
  summary.textContent='Select a sheet using keyboard controls';
  details.append(summary);
  const buttons=document.createElement('div');
  buttons.className='paper-controls';
  for(let i=0;i<PAPER_LIMIT;i++){
   const button=document.createElement('button');
   button.type='button';
   button.dataset.paperIndex=String(i);
   button.addEventListener('click',()=>togglePaper(i));
   buttons.append(button);
  }
  details.append(buttons);
  actions.append(details);
  syncPaperControls();
 }
 else if(id==='bookcase'){
  const help=document.createElement('p');
  help.textContent='Look for the eight bright turquoise spines with gold markings. Click one to pull it out, or click it again to return it.';
  actions.append(help);
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Select a book using keyboard controls';
  details.append(summary);
  const buttons=document.createElement('div');
  buttons.className='paper-controls';
  for(let i=0;i<FEATURED_BOOK_COUNT;i++){
   const button=document.createElement('button');
   button.type='button';
   button.dataset.bookIndex=String(i);
   button.addEventListener('click',()=>toggleBook(i));
   buttons.append(button);
  }
  details.append(buttons);
  actions.append(details);
  syncBookControls();
 }
 else if(id==='typewriter')add('Press a key',()=>pressTypewriter());
 else if(id==='bin'){
  const help=document.createElement('p');
  help.textContent='Click an individual crumpled paper ball to toss it onto the floor; click it again to put it back.';
  actions.append(help);
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Select a crumpled paper using keyboard controls';
  details.append(summary);
  const buttons=document.createElement('div');
  buttons.className='paper-controls';
  for(let i=0;i<BIN_PAPER_COUNT;i++){
   const button=document.createElement('button');
   button.type='button';
   button.dataset.binPaperIndex=String(i);
   button.addEventListener('click',()=>toggleBinPaper(i));
   buttons.append(button);
  }
  details.append(buttons);actions.append(details);
  syncBinPaperControls();
 }
 else if(id==='door'){
  add(state.doorOpen?'Close the door':'Open the door',()=>{state=plan.next(state,{type:'door'});status.textContent=state.doorOpen?'The door swings open on its hinge.':'The door swings shut.';renderControls('door');});
  if(state.doorOpen){const a=document.createElement('a');a.href='/';a.textContent='Return to DaveHub islands ↗';actions.append(a);}
 }else if(id==='window')add('Look at the islands',()=>{status.textContent='These are low-poly floating islands within the same 3D room.';});
}
for(const b of focusButtons)b.addEventListener('click',()=>focus(b.dataset.focus));
homeButton.addEventListener('click',home);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.focus){e.preventDefault();home();}});
function pickFromEvent(event){
 if(!renderer)return null;
 const rect=canvas.getBoundingClientRect();
 if(rect.width===0||rect.height===0)return null;
 pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects(selectable,false);
 // Raycaster returns nearest meshes first. Identify the drawer that owns the
 // actual hit mesh, not the cabinet as a whole or its first child.
 const mesh=hits[0]?.object;
 const id=mesh?.userData?.objectId;
 if(!id)return null;
 return {id,drawerIndex:id==='cabinet'?drawerIndexForMesh(mesh,cabinetDrawers):null,
  paperIndex:id==='desk'?(Number.isInteger(mesh.userData.paperIndex)?mesh.userData.paperIndex:paperIndexForMesh(mesh.name)):null,
  bookIndex:id==='bookcase'?(Number.isInteger(mesh.userData.featuredBookIndex)?mesh.userData.featuredBookIndex:featuredBookIndexForMesh(mesh.name)):null,
  binPaperIndex:id==='bin'?(Number.isInteger(mesh.userData.binPaperIndex)?mesh.userData.binPaperIndex:binPaperIndexForMesh(mesh.name)):null,
  keyIndex:id==='typewriter'?typedKeyIndex(mesh.name):null};
}
canvas.addEventListener('pointermove',event=>{
 const pick=pickFromEvent(event);
 const hovered=pick?.id||null;
 if(hovered!==currentHover){currentHover=hovered;canvas.classList.toggle('interactive',!!hovered);}
 canvas.title=pick?.drawerIndex!==null&&pick?.drawerIndex!==undefined
  ?drawerNames[pick.drawerIndex]+' drawer'
  :pick?.paperIndex!==null&&pick?.paperIndex!==undefined
   ?(state.papers[pick.paperIndex]?'Return':'Move')+' sheet '+(pick.paperIndex+1)
   :pick?.bookIndex!==null&&pick?.bookIndex!==undefined
    ?(state.books[pick.bookIndex]?'Return ':'Pull ')+bookDescription(pick.bookIndex)
    :pick?.binPaperIndex!==null&&pick?.binPaperIndex!==undefined
     ?(state.binPapers[pick.binPaperIndex]?'Return':'Rummage')+' crumpled paper '+(pick.binPaperIndex+1)
     :hovered==='bookcase'?'Only highlighted books can be pulled out'
     :hovered==='bin'?'Click a particular crumpled paper, not the bin itself'
     :hovered?'Explore '+plan.find(hovered).label:'';
});
canvas.addEventListener('pointerleave',()=>{currentHover=null;canvas.classList.remove('interactive');canvas.title='';});
let pointerStart=null;
canvas.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
canvas.addEventListener('pointerup',event=>{
 if(!pointerStart||Math.hypot(pointerStart.x-event.clientX,pointerStart.y-event.clientY)>8){pointerStart=null;return;}
 pointerStart=null;
 const pick=pickFromEvent(event);
 if(!pick)return;
 const {id,drawerIndex,paperIndex,bookIndex,binPaperIndex,keyIndex}=pick;
 if(state.focus===id){
  if(id==='cabinet'){
   // The cabinet case/rails are not drawers. Only a hit inside a named
   // drawer group should toggle its own state.
   if(drawerIndex===null)return;
   state=plan.next(state,{type:'drawer',index:drawerIndex});
   status.textContent=drawerNames[drawerIndex]+
    (state.drawer===drawerIndex?' drawer opened.':' drawer closed.');
  }else{
   if(id==='desk'&&paperIndex!==null)togglePaper(paperIndex);
   else if(id==='bookcase'){
    if(bookIndex!==null)toggleBook(bookIndex);
    else status.textContent='Try one of the eight highlighted book spines.';
   }
   else if(id==='typewriter')pressTypewriter(keyIndex);
   else if(id==='bin'){
    if(binPaperIndex!==null)toggleBinPaper(binPaperIndex);
    else status.textContent='Click an actual crumpled paper to rummage in the bin.';
   }
   else if(id==='door')state=plan.next(state,{type:'door'});
   if(!['desk','bookcase','bin','typewriter'].includes(id))status.textContent=plan.find(id).label+' responds to your interaction.';
  }
  if(!['desk','bookcase','bin'].includes(id))renderControls(id);
 }else{
  focus(id);
  // Clicking a sheet in the overview focuses the desk and moves that sheet.
  if(id==='desk'&&paperIndex!==null)togglePaper(paperIndex);
  if(id==='bookcase'&&bookIndex!==null)toggleBook(bookIndex);
  if(id==='bin'&&binPaperIndex!==null)toggleBinPaper(binPaperIndex);
  // A drawer hit in the overview identifies the drawer as well as the
  // cabinet, so the first click opens that drawer after selecting the view.
  if(id==='cabinet'&&drawerIndex!==null){
   state=plan.next(state,{type:'drawer',index:drawerIndex});
   status.textContent=drawerNames[drawerIndex]+' drawer opened.';
   renderControls('cabinet');
  }
 }
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
   const target=state.drawer===i ? (glbProof?.76*glbExtension:.65) : 0;
   cabinetDrawers[i].position.z=THREE.MathUtils.lerp(cabinetDrawers[i].position.z,drawerHome[i]+target,rate);
  }
  for(let i=0;i<pullBooks.length;i++){
   const target=bookPosition(bookHome[i],state.books[i]);
   pullBooks[i].position.z=THREE.MathUtils.lerp(pullBooks[i].position.z,target,rate);
  }
  typeKeys.forEach((key,i)=>{
   const depth=activePress?pressDepth(clock.elapsedTime-activePress.at,i===activePress.index,reduced.matches):0;
   key.position.y=THREE.MathUtils.lerp(key.position.y,typeKeyHomes[i]-depth,rate);
  });
  const feed=typewriterFeed(state.typed);
  if(typePaper){
   // Stretch the sheet as it is fed through the roller, rather than moving
   // the entire page into mid-air. Derive its centre from the CURRENT scale
   // so the bottom edge stays fixed during every intermediate animation frame.
   typePaper.scale.y=THREE.MathUtils.lerp(typePaper.scale.y,typePaperHomeScaleY*feed.scale,rate);
   const actualFeed=(typePaper.scale.y/typePaperHomeScaleY-1)*TYPE_PAPER_HEIGHT;
   typePaper.position.y=typePaperHome+actualFeed/2;
   // Printed line travels up WITH the fed sheet; no detached decoration.
   if(typePaperRule)typePaperRule.position.y=typePaperRuleHome+actualFeed;
  }
  if(typePlaten){
   // Retain the cylinder's original horizontal orientation; multiply a
   // local-axis spin onto its rest quaternion, never change Euler Y (yaw).
   platenSpin.setFromAxisAngle(platenAxis,feed.rollerAngle);
   platenTarget.copy(typePlatenHome).multiply(platenSpin);
   typePlaten.quaternion.slerp(platenTarget,rate);
  }
  if(doorLeaf)doorLeaf.rotation.y=THREE.MathUtils.lerp(doorLeaf.rotation.y,state.doorOpen?-.96:0,rate);
  loosePapers.forEach((mesh,i)=>{
   const home=paperHomes[i];if(!home)return;
   const p=paperPose(home,i,state.papers[i]);
   mesh.position.x=THREE.MathUtils.lerp(mesh.position.x,p.x,rate);
   mesh.position.y=THREE.MathUtils.lerp(mesh.position.y,p.y,rate);
   mesh.position.z=THREE.MathUtils.lerp(mesh.position.z,p.z,rate);
   mesh.rotation.y=THREE.MathUtils.lerp(mesh.rotation.y,p.yaw,rate);
   mesh.rotation.z=THREE.MathUtils.lerp(mesh.rotation.z,p.tilt,rate);
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

if(glbProof){
 // This isolated preview replaces only the procedural cabinet; no other
 // furniture, room camera, object state or publication route is changed.
 const proof=document.getElementById('glb-proof-status');
 const range=document.getElementById('glb-extension');
 const meter=document.getElementById('glb-extension-value');
 const report=message=>{if(proof)proof.textContent=message;};
 const applyAmount=(value)=>{
  glbExtension=Math.max(0,Math.min(1,Number(value)/100));
  if(range)range.value=String(Math.round(glbExtension*100));
  if(meter)meter.textContent=Math.round(glbExtension*100)+'%';
  if(state.focus!=='cabinet')focus('cabinet');
  if(state.drawer===null)state=plan.next(state,{type:'drawer',index:0});
  renderControls('cabinet');
  report('Loaded GLB. Drawer '+drawerNames[state.drawer]+' at '+Math.round(glbExtension*100)+'% extension; movement follows its local +Z axis.');
 };
 range?.addEventListener('input',()=>applyAmount(range.value));
 document.querySelectorAll('[data-glb-snap]').forEach(b=>b.addEventListener('click',()=>applyAmount(b.dataset.glbSnap)));
 const modelName=blenderCompare?'cabinet-blender-verified.glb':'cabinet-prototype.glb';
 const url=new URL('../room/models/'+modelName,document.baseURI).href;
 function fail(error){
  console.warn('GLB round-trip proof unavailable',error);
  makeCabinet();
  drawerHome.push(...cabinetDrawers.map(x=>x.position.z));
  report('GLB failed to load. The original procedural cabinet is shown as a fallback. See browser console.');
 }
 import('./vendor/GLTFLoader-r159.js').then(({GLTFLoader})=>{
  const loader=new GLTFLoader();
  loader.load(url,gltf=>{
   const content=gltf.scene;
   content.position.set(-4.7,0,-3.25);
   const slugs=['finished','drafts','oddities','fragments','field_notes'];
   const found=[];
   for(let i=0;i<slugs.length;i++){
    const drawer=content.getObjectByName('drawer_'+slugs[i]);
    const front=content.getObjectByName('drawer_front_'+slugs[i]);
    if(!drawer||!front)throw Error('Missing required GLB drawer nodes: '+slugs[i]);
    // Text uses a locally drawn canvas fixed to the GLB drawer front.
    // Labels are decorations, never depth or mechanical geometry.
    const label=makeText(drawerNames[i],.42,.1);
    label.position.set(0,.108,.076);
    front.add(label);
    found.push(drawer);
   }
   scene.add(content);
   capture('cabinet',content);
   cabinetDrawers.push(...found);
   drawerHome.push(...found.map(d=>d.position.z));
   // The cabinet-only proof starts at the cabinet, but the complete
   // furniture preview must open at the whole-room HOME camera instead.
   // Leave its camera and focus state untouched as the GLB finishes loading.
   if(!furnitureModelProof)focus('cabinet');
   if(range)range.disabled=false;
   document.querySelectorAll('[data-glb-snap]').forEach(b=>b.disabled=false);
   report((blenderCompare?'Verified Blender-exported GLB loaded':'GLB loaded')+': five separate drawers, genuine open recesses and cabinet rails. Choose a drawer and scrub its extension.');
  },undefined,fail);
 }).catch(fail);
}


// DH-11C.4F: the normal room keeps its original furniture. Only the isolated
// comparison page opts in to the modelled six-root furniture GLB. Swap all
// six objects atomically, after verifying their animated pivots, and preserve
// the procedural furniture if anything cannot be loaded or validated.
if(furnitureModelProof){
 const output=document.getElementById('furniture-model-status');
 const report=message=>{if(output)output.textContent=message;};
 const required=['desk','typewriter','bookcase','bin','door','window'];
 import('./vendor/GLTFLoader-r159.js').then(({GLTFLoader})=>{
  new GLTFLoader().load('../room/models/furniture-source.glb',gltf=>{
   try{
    const content=gltf.scene;
    const next=new Map();
    for(const id of required){
     const model=content.getObjectByName(id+'_root');
     if(!model)throw Error('Missing furniture GLB root '+id);
     next.set(id,model);
    }
    const get=name=>{
     const node=content.getObjectByName(name);
     if(!node)throw Error('Missing interactive furniture node '+name);
     return node;
    };
    const papers=Array.from({length:PAPER_LIMIT},(_,i)=>get('desk_paper_'+String(i).padStart(2,'0')));
    papers.forEach((mesh,i)=>{mesh.userData.paperIndex=i;});
    const books=[];
    for(let shelf=0;shelf<4;shelf++)for(let b=0;b<20;b++)
     if(featuredBook(shelf,b))books.push(get('book_'+shelf+'_'+String(b).padStart(2,'0')));
    const keys=Array.from({length:TYPE_KEY_COUNT},(_,i)=>get('typewriter_key_'+Math.floor(i/8)+'_'+i%8));
    const key=keys[12],typeSheet=get('typewriter_paper'),typeRule=get('typewriter_paper_rule'),platen=get('typewriter_platen'),hinge=get('door_leaf_hinge');
    const islands=Array.from({length:3},(_,i)=>get('window_island_'+i));
    // Attach the bright bindings and gold bands BEFORE capture() traverses
    // the scene. Otherwise their meshes are absent from the raycast targets.
    // This also means a failed decoration leaves the fallback untouched.
    books.forEach((mesh,i)=>markFeaturedBook(mesh,i));
    // No procedural object is removed until the complete model contract is
    // satisfied. New raycast targets are registered together.
    scene.add(content);
    for(const id of required){
     const previous=objects.get(id);
     if(previous){
      const old=new Set(previous.targets);
      for(let i=selectable.length-1;i>=0;i--)if(old.has(selectable[i]))selectable.splice(i,1);
      if(previous.group.parent)previous.group.parent.remove(previous.group);
     }
     capture(id,next.get(id));
    }
    loosePapers.splice(0,loosePapers.length,...papers);
    paperHomes=papers.map(m=>({x:m.position.x,y:m.position.y,z:m.position.z,yaw:m.rotation.y,tilt:m.rotation.z}));
    paperStacks.splice(0,paperStacks.length,...papers);
    pullBooks.splice(0,pullBooks.length,...books);
    bookHome=books.map(book=>book.position.z);
    typeKeys.splice(0,typeKeys.length,...keys);
    typeKeyHomes=keys.map(k=>k.position.y);
    typePaper=typeSheet;typePaperHome=typeSheet.position.y;typePaperHomeScaleY=typeSheet.scale.y;
    typePaperRule=typeRule;typePaperRuleHome=typeRule.position.y;
    typePlaten=platen;typePlatenHome=platen.quaternion.clone();
    typeKey=key;doorLeaf=hinge;
    islandGroups.splice(0,islandGroups.length,...islands);
    report('Furniture GLB loaded: desk, separate papers, bookcase, books, typewriter keys, bin, hinged door and floating islands. Existing click and animation controls remain active.');
   }catch(error){
    console.error('Furniture GLB validation failed; retaining original furniture',error);
    report('Furniture GLB did not pass structural checks. Original interactive room furniture remains visible.');
   }
  },undefined,error=>{
   console.warn('Furniture GLB loading failed',error);
   report('Furniture GLB could not load. Original room furniture remains available.');
  });
 }).catch(error=>{console.warn('Furniture model loader failed',error);report('GLB loader unavailable; original furniture remains active.');});
}

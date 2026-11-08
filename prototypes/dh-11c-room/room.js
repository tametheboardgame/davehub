import * as THREE from './vendor/three-r159.module.min.js';
import {drawerIndexForMesh} from './drawer-picking.mjs';
import {revealReady,REVEAL_HOLD_SECONDS,keyIndexForCharacter} from './reveal-after-motion.mjs?v=dh11c6c2-motion-first-v1';
import {mountCabinetFolders,folderSettled,DRAWER_SLUGS} from './cabinet-folders.mjs?v=dh11c6d3-archive-v1';
import {paperPose,paperIndexForMesh,PAPER_LIMIT,pressDepth,typewriterFeed,TYPE_PAPER_HEIGHT,featuredBook,featuredBookIndexForMesh,FEATURED_BOOK_COUNT,bookPosition,binPaperIndexForMesh,binPaperPose,BIN_PAPER_COUNT,lampPartForMesh,typedKeyIndex,TYPE_KEY_COUNT} from './furniture-motion.mjs?v=dh11c4l-lamp-switch-v1';

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
// DH-11C.6A: visitor interface only, opt-in on the canonical Writing world.
// Previews retain their existing inspector and all model/interaction machinery.
const minimalUI=document.body.dataset.minimalUi==='true';
// Canonical Writing room starts dark outside its window until the full scene texture is ready.
const darkWindowPreload=minimalUI&&document.body.dataset.darkWindowPreload==='true';
const finishedBooksEnabled=minimalUI&&document.body.dataset.finishedBooks==='true';
const finishedBooks=finishedBooksEnabled?window.DH11FinishedBooks:null;
const bookExperience=finishedBooksEnabled?window.DH11BookExperience?.mount({
 catalog:finishedBooks,document
}):null;
if(finishedBooksEnabled&&(!finishedBooks||!bookExperience))
 throw Error('DH-11C.6B requires the published-book catalogue and accessible detail view');
const manuscriptExperienceEnabled=minimalUI&&document.body.dataset.manuscriptExperience==='true';
const motionFirst=manuscriptExperienceEnabled&&document.body.dataset.motionFirst==='true';
const manuscriptExperience=manuscriptExperienceEnabled?window.DH11ManuscriptExperience?.mount({
 document,onType:()=>pressTypewriter()
}):null;
if(manuscriptExperienceEnabled&&!manuscriptExperience)
 throw Error('DH-11C.6C.1 needs the manuscript reader and typewriter workshop');
const cabinetArchiveEnabled=motionFirst&&document.body.dataset.cabinetArchive==='true';
const cabinetCatalogue=cabinetArchiveEnabled?window.DH11CabinetCatalogue?.create({
 books:finishedBooks,manuscripts:window.DH11ManuscriptExperience?.MANUSCRIPTS
}):null;
const cabinetExperience=cabinetArchiveEnabled?window.DH11CabinetExperience?.mount({
 document,catalogue:cabinetCatalogue,onRelated:item=>navigateFromCabinetFolder(item)
}):null;
if(cabinetArchiveEnabled&&(!cabinetCatalogue||!cabinetExperience))
 throw Error('DH-11C.6D requires the safe catalogue and the folder reader');
const cabinetFolders=cabinetArchiveEnabled?mountCabinetFolders({
 THREE,document,catalogue:cabinetCatalogue
}):null;
let pendingFolderReveal=null;
const objectPrompt=document.getElementById('object-prompt');
const promptTitle=document.getElementById('object-prompt-title');
const promptCopy=document.getElementById('object-prompt-copy');
const promptOpen=document.getElementById('object-prompt-open');
const promptClose=document.getElementById('object-prompt-close');
const fullClose=document.getElementById('object-full-close');
if(minimalUI&&![objectPrompt,promptTitle,promptCopy,promptOpen,promptClose,fullClose].every(Boolean))
 throw Error('DH-11C.6A compact object UI requires all accessible controls');
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
const illustratedProof=furnitureModelProof&&document.body.dataset.illustratedProof==='true';
const authoredDetailProof=illustratedProof&&document.body.dataset.authoredDetailProof==='true';
const personalityProof=authoredDetailProof&&document.body.dataset.personalityProof==='true';
const handwrittenLabelProof=personalityProof&&document.body.dataset.handwrittenLabelProof==='true';
const mysticalRoomProof=handwrittenLabelProof&&document.body.dataset.mysticalRoomProof==='true';
const exitDoorProof=mysticalRoomProof&&document.body.dataset.exitDoorProof==='true';
let illustratedRuntime=null,scenicWindow=null,manuscriptPersonality=null;
let mysticalRug=null,mysticalFurniture=null,doorExitTarget=null;
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
 lampShade:new THREE.MeshStandardMaterial({color:'#95805c',metalness:.22,roughness:.72,side:THREE.DoubleSide}),
 lampBulb:new THREE.MeshStandardMaterial({color:'#ffddb0',emissive:'#e1b05b',emissiveIntensity:.65,roughness:.55}),
 island:matte('#7e856e'),leaf:matte('#728b7b'),bin:matte('#677b81')
};
// The approved GLB and procedural scene share the exact same UV pixel maps.
// Other proof pages keep their original flat materials until their own stages.
for(const [name,old] of Object.entries({
 deskWalnut:'desk',deskFrame:'darkwood',
 deskParchment0:'paper',deskParchment1:'paper',deskParchment2:'paper',
 deskLeather:'darkwood',deskBrass:'brass',typewriterEnamel:'ink'
}))mats[name]=mats[old];
const deskKit=window.DH11DeskMaterials;
if(furnitureModelProof){
 if(!deskKit)throw Error('Missing DH-11C.5A shared desk material maps');
 for(const [material,map] of Object.entries({
  deskWalnut:'deskWalnut',deskFrame:'deskFrame',
  deskParchment0:'deskParchment0',deskParchment1:'deskParchment1',
  deskParchment2:'deskParchment2',deskLeather:'deskLeather',
  deskBrass:'deskBrass',typewriterEnamel:'typewriterEnamel',
  lampShade:'lampLinen'
 })){
  const source=deskKit.generate(map);
  const texture=new THREE.DataTexture(source.pixels,source.width,source.height,THREE.RGBAFormat);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;
  texture.anisotropy=Math.min(4,renderer?.capabilities.getMaxAnisotropy()||1);
  texture.needsUpdate=true;
  mats[material]=new THREE.MeshStandardMaterial({
   color:'#ffffff',map:texture,
   roughness:source.roughness,metalness:source.metalness,
   ...(material==='lampShade'?{side:THREE.DoubleSide}:{})
  });
 }
}
// C5B has its own material family so approved desk and older preview routes
// keep their existing finish. The same UV pixels are used by Blender GLB and
// the WebGL procedural fallback.
const archiveKit=window.DH11ArchiveMaterials;
const archiveFinishes=[
 'shelfWalnut','shelfEdge','shelfLining','shelfGilt',
 ...Array.from({length:7},(_,i)=>'bookBinding'+i),
 'cabinetCase','cabinetDrawer','cabinetTrim','cabinetTray',
 'cabinetBrass','cabinetFolder0','cabinetFolder1','cabinetLabel'
];
if(furnitureModelProof){
 if(!archiveKit)throw Error('Missing DH-11C.5B archive material maps');
 for(const name of archiveFinishes){
  const spec=archiveKit.generate(name);
  const tx=new THREE.DataTexture(spec.pixels,spec.width,spec.height,THREE.RGBAFormat);
  tx.colorSpace=THREE.SRGBColorSpace;tx.magFilter=THREE.LinearFilter;
  tx.minFilter=THREE.LinearMipmapLinearFilter;tx.generateMipmaps=true;
  tx.anisotropy=Math.min(4,renderer?.capabilities.getMaxAnisotropy()||1);tx.needsUpdate=true;
  mats[name]=new THREE.MeshStandardMaterial({color:'#ffffff',map:tx,roughness:spec.roughness,metalness:spec.metalness});
 }
}
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
 g.traverse(o=>{if(o.isMesh&&!o.userData?.decorativeOnly){o.userData.objectId=id;selectable.push(o);targets.push(o);}});
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
 // Centre the light at the actual desk lamp, not elsewhere over the desk.
 lamp.position.set(-1.97,2.31,.17);if(mysticalRoomProof)lamp.position.y+=.07;
 sceneLights.lamp=lamp;lamp.userData.litIntensity=26;scene.add(lamp);
 const glow=new THREE.PointLight('#92b8d9',15,9,2);
 glow.position.set(.25,3.7,-3.5);sceneLights.window=glow;scene.add(glow);
}
wallScene();
if(mysticalRoomProof){
 if(!window.DH11RoomProps)throw Error('Missing DH-11C.5D.3H real prop detail module');
 mysticalRug=window.DH11RoomProps.makeRug({THREE,scene});
}
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
   if(illustratedRuntime)illustratedRuntime.register(model);
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
 // Existing geometry and five drawer travel paths remain untouched.
 const finish=name=>furnitureModelProof?mats[name]:null;
 box(g,1.92,3.66,1.16,finish('cabinetCase')||mats.cabinet,0,1.83,-.17);
 box(g,1.79,3.43,.075,finish('cabinetTrim')||mats.ink,0,1.83,.441);
 for(const x of [-.92,.92]){
  box(g,.1,3.66,1.2,finish('cabinetTrim')||mats.brass,x,1.83,-.16);
 }
 for(const y of [.12,3.58])box(g,1.99,.13,1.18,finish('cabinetTrim')||mats.brass,0,y,-.16);
 const names=['Finished','Drafts','Oddities','Fragments','Field Notes'];
 for(let i=0;i<5;i++){
  const yy=3.18-i*.615;
  box(g,1.67,.53,.06,finish('cabinetCase')||mats.darkwood,0,yy,.493);
  const tray=group(g,0,yy,.52);
  box(tray,1.61,.48,.08,finish('cabinetDrawer')||mats.drawer,0,0,0);
  box(tray,1.6,.075,.83,finish('cabinetTray')||mats.timber,0,-.207,-.39);
  for(const x of [-.78,.78])box(tray,.07,.41,.83,finish('cabinetTray')||mats.timber,x,-.015,-.39);
  box(tray,1.6,.35,.08,finish('cabinetTray')||mats.timber,0,-.055,-.81);
  box(tray,handwrittenLabelProof?1.08:personalityProof?1.35:authoredDetailProof?1.02:.65,handwrittenLabelProof?.23:personalityProof?.30:authoredDetailProof?.24:.16,.025,finish('cabinetLabel')||mats.paper,0,.095,.056);
  box(tray,.58,.055,.09,finish('cabinetBrass')||mats.brass,0,-.085,.123);
  for(let f=0;f<4;f++){
   const folder=box(tray,.23,.24,.018,finish('cabinetFolder'+f%2)||mats.paper,-.48+f*.32,.06,-.3-f*.03);
   folder.rotation.y=(f%2?.12:-.1);
   folder.name='folder_'+DRAWER_SLUGS[i]+'_'+f;
  }
  const tag=makeText(names[i],handwrittenLabelProof?1.04:personalityProof?1.31:authoredDetailProof?.98:.38,handwrittenLabelProof?.21:personalityProof?.28:authoredDetailProof?.21:.11,'#33434b','#efe0c2');
  tag.position.set(0,.095,authoredDetailProof?.084:.074);tray.add(tag);
  cabinetDrawers.push(tray);
 }
 if(cabinetFolders)cabinetFolders.attach(cabinetDrawers);
 const mesh=capture('cabinet',g);
 return mesh;
}

function makeQuillTag(text,w,h){
 const c=document.createElement('canvas');c.width=768;c.height=224;
 const ctx=c.getContext('2d');const W=c.width,H=c.height;
 // The label itself is the parchment plate, not a printout stuck on top.
 ctx.fillStyle='#f1ddaa';ctx.fillRect(0,0,W,H);
 for(let i=0;i<110;i++){
  const x=(i*149)%W,y=(i*67)%H;
  ctx.fillStyle=i%3?'rgba(122,76,58,.09)':'rgba(255,250,222,.18)';
  ctx.fillRect(x,y,3+i%5,1+i%3);
 }
 ctx.strokeStyle='#986748';ctx.lineWidth=8;ctx.strokeRect(8,8,W-16,H-16);
 ctx.lineWidth=2.6;ctx.strokeStyle='#b59468';ctx.strokeRect(23,21,W-46,H-42);
 for(const mirror of [false,true]){
  ctx.save();if(mirror){ctx.translate(W,0);ctx.scale(-1,1);}
  ctx.strokeStyle='#71505b';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(36,H/2);ctx.bezierCurveTo(59,48,99,54,110,76);
  ctx.bezierCurveTo(83,87,66,74,63,64);ctx.stroke();
  ctx.restore();
 }
 ctx.fillStyle=personalityProof?'#221c31':'#3f2b44';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font=personalityProof?'bold 146px Georgia,serif':"italic 110px 'Palatino Linotype','Book Antiqua','URW Chancery L',cursive";
 if(personalityProof){
  ctx.strokeStyle='#221c31';ctx.lineWidth=8;ctx.lineJoin='round';
  ctx.strokeText(text,W/2,H*.53,W*.82);
 }
 ctx.fillText(text,W/2,H*.53,personalityProof?W*.82:W*.75);
 ctx.strokeStyle='rgba(74,45,64,.65)';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(W*.28,H*.75);ctx.bezierCurveTo(W*.41,H*.82,W*.53,H*.69,W*.72,H*.75);ctx.stroke();
 const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({
  map:tx,transparent:false,side:THREE.DoubleSide,depthWrite:true
 }));
 mesh.name='dh11c5d3e_handwritten_'+text.toLowerCase().replace(/\s+/g,'_');
 mesh.userData.decorativeOnly=true;
 mesh.raycast=()=>{};
 return mesh;
}

function makeArchiveHandwrittenTag(text,w,h){
 // Each label is rendered as a separate image texture: genuine irregular
 // ink letterforms, exact text, readable from the room, without giant bold print.
 const c=document.createElement('canvas');c.width=960;c.height=256;
 const ctx=c.getContext('2d'),W=c.width,H=c.height;
 const seed=[...text].reduce((n,ch)=>n+ch.charCodeAt(0),19);
 ctx.fillStyle='#e9d4a8';ctx.fillRect(0,0,W,H);
 const tint=ctx.createLinearGradient(0,0,0,H);
 tint.addColorStop(0,'rgba(255,245,218,.42)');
 tint.addColorStop(1,'rgba(104,67,52,.12)');
 ctx.fillStyle=tint;ctx.fillRect(0,0,W,H);
 for(let k=0;k<220;k++){
  const x=(k*113+seed*31)%W,y=(k*59+seed*23)%H;
  ctx.fillStyle=k%4?'rgba(96,70,48,.035)':'rgba(255,255,233,.12)';
  ctx.fillRect(x,y,2+k%7,1+k%3);
 }
 ctx.strokeStyle='rgba(129,92,66,.66)';ctx.lineWidth=5;
 ctx.strokeRect(13,12,W-26,H-24);
 ctx.strokeStyle='rgba(174,131,87,.34)';ctx.lineWidth=2;
 ctx.strokeRect(23,23,W-46,H-46);
 ctx.save();
 ctx.textAlign='left';ctx.textBaseline='middle';
 ctx.fillStyle='#392d39';
 ctx.strokeStyle='rgba(56,38,53,.37)';ctx.lineWidth=1.2;ctx.lineJoin='round';
 const font="normal 112px 'Segoe Print','Bradley Hand','Comic Sans MS',cursive";
 ctx.font=font;
 const measured=[...text].map(ch=>ctx.measureText(ch).width);
 const whole=measured.reduce((a,b)=>a+b,0);
 const scale=Math.min(1,(W*.74)/whole);
 ctx.translate(W/2-whole*scale/2,H*.53);ctx.scale(scale,1);
 let x=0;
 for(let i=0;i<text.length;i++){
  const ch=text[i],rise=Math.sin(seed*.07+i*1.81)*3;
  ctx.save();ctx.translate(x,rise);
  ctx.rotate(Math.sin(seed+i*2.39)*.026);
  ctx.strokeText(ch,0,0);
  ctx.fillText(ch,0,0);
  ctx.restore();x+=measured[i];
 }
 ctx.restore();
 // Subtle fountain-pen exit strokes, never a second printed-looking underline.
 ctx.strokeStyle='rgba(74,46,64,.45)';ctx.lineWidth=2.5;
 const y=H*.77;
 ctx.beginPath();ctx.moveTo(W*.32,y);
 ctx.bezierCurveTo(W*.42,y+5,W*.56,y-3,W*.69,y+3);
 ctx.stroke();
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),
  new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:false}));
 mesh.name='dh11c5d3g_handwritten_archive_'+text.toLowerCase().replace(/\s+/g,'_');
 mesh.userData.decorativeOnly=true;mesh.raycast=()=>{};
 return mesh;
}
function makeText(text,w,h,colour='#30252d',fill='#e8d4b2'){
 if(handwrittenLabelProof)return makeArchiveHandwrittenTag(text,w,h);
 if(authoredDetailProof)return makeQuillTag(text,w,h);
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
let lampBulbMesh=null;
const lampLitColour=new THREE.Color('#ffddb0'),lampUnlitColour=new THREE.Color('#594538');
let paperHomes=[];
function makeDesk(){
 const g=group(scene,-.3,0,.6);
 const lampLift=mysticalRoomProof?.07:0;
 box(g,4.5,.2,2.15,mats.deskWalnut,0,1.29,0);
 for(const x of [-1.98,1.98])for(const z of [-.85,.85])box(g,.21,1.15,.23,mats.deskFrame,x,.61,z);
 box(g,4.04,.4,.12,mats.deskFrame,0,1.0,.94);
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
  const mesh=box(g,.49,.012,.32,mats['deskParchment'+i%3],x,1.397+i*.00035,z);
  mesh.name='desk_paper_'+String(i).padStart(2,'0');
  mesh.rotation.y=(i%3-1)*.22;
  mesh.userData.paperIndex=i;
  if(i<PAPER_LIMIT)loosePapers.push(mesh);
  paperStacks.push(mesh);
 }
 // DH-11C.4K: smooth, level, open-bottomed shade and recessed bulb.
 const shade=new THREE.Mesh(new THREE.CylinderGeometry(.245,.405,.30,24,1,true),mats.lampShade);
 shade.name='desk_lamp_shade';shade.position.set(-1.67,2.38,-.43);if(lampLift)shade.position.y+=lampLift;g.add(shade);
 const cap=cylinder(g,.245,.245,.018,mats.deskBrass,-1.67,2.522,-.43,24);
 if(lampLift)cap.position.y+=lampLift;
 cap.name='desk_lamp_cap';
 const stem=cylinder(g,.035,.035,.96,mats.deskBrass,-1.67,1.86,-.43);
 if(lampLift)stem.position.y+=lampLift;
 stem.name='desk_lamp_stem';
 const bulb=sphere(g,.065,mats.lampBulb,-1.67,2.345,-.43);
 if(lampLift)bulb.position.y+=lampLift;
 bulb.name='desk_lamp_bulb';lampBulbMesh=bulb;
 const base=cylinder(g,.28,.28,.12,mats.timber,-1.67,1.4,-.43);
 if(lampLift)base.position.y+=lampLift;
 base.name='desk_lamp_base';
 if(!authoredDetailProof){
  const cup=cylinder(g,.13,.105,.26,mats.ink,-.88,1.53,.57);
  cup.rotation.z=.08;
 }
 const file=group(g,-.55,1.42,-.7);
 box(file,.86,.14,.64,mats.deskLeather);
 box(file,.66,.025,.44,mats.deskParchment0,0,.09,0);
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
 box(g,.95,.21,.55,mats.typewriterEnamel,0,.07,0);
 box(g,.79,.2,.3,mats.typewriterEnamel,0,.2,-.08);
 for(let row=0;row<3;row++)for(let i=0;i<8;i++){
  const k=box(g,.067,.025,.059,mats.deskBrass,-.34+i*.099,.194,.11+row*.092);
  k.name='typewriter_key_'+row+'_'+i;
  typeKeys.push(k);
  if(row===1&&i===4)typeKey=k;
 }
 const roller=cylinder(g,.056,.056,.91,mats.ink,0,.38,-.22,12);
 roller.rotation.z=Math.PI/2;typePlaten=roller;
 typePaper=box(g,.64,.58,.02,mats.deskParchment1,0,.68,-.24);
 typePaperRule=box(g,.57,.02,.015,mats.edge,0,.65,-.224);
 capture('typewriter',g);
 return g;
}
makeTypewriter();
typeKeyHomes=typeKeys.map(key=>key.position.y);
typePaperHome=typePaper.position.y;typePaperHomeScaleY=typePaper.scale.y;
typePaperRuleHome=typePaperRule.position.y;typePlatenHome=typePlaten.quaternion.clone();

const pullBooks=[];
// Earlier comparison previews retain eight luminous turquoise books; the
// visitor's three published editions have their own cover-inspired colour
// with a distinct gilded selection frame on the true GLB mesh.
const FEATURE_BOOK_COLOUR='#24f5da';
const featureBookGilt=new THREE.MeshBasicMaterial({color:'#ffe681',toneMapped:false});
function featuredBookColour(mesh){
 if(finishedBooksEnabled){
  const edition=finishedBooks.byIndex(mesh.userData.featuredBookIndex);
  if(edition){
   // A book should look like its edition, not like a turquoise UI button.
   mesh.material.color.set(edition.binding);
   if(mesh.material.emissive){
    mesh.material.emissive.set(edition.glow);
    mesh.material.emissiveIntensity=.12;
   }
   return;
  }
 }
 // Retain the strong turquoise authored-art proof in older 3D previews.
 mesh.material.color.set(FEATURE_BOOK_COLOUR);
 if(mesh.material.emissive){
  mesh.material.emissive.set('#0f9f9e');
  mesh.material.emissiveIntensity=.85;
 }
}
function markFeaturedBook(mesh,index){
 // 6B: only three finished publications have active pull-out bindings.
 // Five previous creative-work spines remain ordinary decorative books.
 if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;
 mesh.userData.featuredBookIndex=index;
 mesh.material=mesh.material.clone();
 // The published binding's colour must be visible, so do not multiply it
 // by the GLB's existing muted material map. Historical previews still glow.
 if(mesh.material.map){mesh.material.map=null;mesh.material.needsUpdate=true;}
 featuredBookColour(mesh);
 if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
 const bounds=mesh.geometry.boundingBox;
 // glTF uses a unit box plus mesh.scale, while the procedural fallback has
 // real-sized BoxGeometry. Compensate for that scale in all three dimensions.
 const dx=bounds.max.x-bounds.min.x,dy=bounds.max.y-bounds.min.y;
 const sy=Math.max(Math.abs(mesh.scale.y),.0001);
 const sz=Math.max(Math.abs(mesh.scale.z),.0001);
 const x=(bounds.min.x+bounds.max.x)/2,z=bounds.max.z+.004/sz;
 if(finishedBooksEnabled){
  // Thin, continuous gold foil around the actual front spine: an unmistakable
  // clickable cue independent of the book's own colour. The cue is attached
  // to the GLB mesh and moves with the genuine book pull-out animation.
  const sx=Math.max(Math.abs(mesh.scale.x),.0001);
  const left=bounds.min.x+dx*.075,right=bounds.max.x-dx*.075;
  const bottom=bounds.min.y+dy*.055,top=bounds.max.y-dy*.055;
  const edgeY=.009/sy,edgeX=.008/sx;
  const faceZ=bounds.max.z+.025/sz;
  const foil=new THREE.MeshBasicMaterial({
   color:'#ffe3a0',transparent:true,opacity:.95,toneMapped:false,
   depthWrite:false
  });
  const edges=[
   [0,(left+right)/2,bottom,right-left,edgeY],
   [1,(left+right)/2,top,right-left,edgeY],
   [2,left,(bottom+top)/2,edgeX,top-bottom],
   [3,right,(bottom+top)/2,edgeX,top-bottom]
  ];
  for(const [n,px,py,width,height] of edges){
   const accent=new THREE.Mesh(
    new THREE.BoxGeometry(width,height,.008/sz),foil);
   accent.position.set(px,py,faceZ);
   accent.name='published_book_foil_'+index+'_'+n;
   accent.userData.featuredBookIndex=index;
   mesh.add(accent);
  }
  // A tiny gilded seal at the head reinforces affordance without recolouring
  // the book and does not replace any real book geometry.
  const seal=new THREE.Mesh(
   new THREE.OctahedronGeometry(.021/sx,0),foil);
  seal.position.set(x,bounds.max.y-dy*.12,faceZ+.004/sz);
  seal.scale.y=sx/sy;
  seal.name='published_book_seal_'+index;
  seal.userData.featuredBookIndex=index;
  mesh.add(seal);
 }else{
  // Older illustration comparison previews keep their original gold bands.
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
 if(authoredDetailProof&&!handwrittenLabelProof){
  // Earlier V5 only: the extra central emblems obstruct new real book titles.
  const points=[],r=.11,cy=bounds.min.y+dy*.56,cx=x;
  const z=bounds.max.z+.010/sz,petals=3+(index%8);
  for(let n=0;n<petals;n++){
   const a=Math.PI*2*n/petals+(index*.13),b=Math.PI*2*(n+1)/petals+(index*.13);
   const p=[cx+dx*r*Math.cos(a),cy+dy*r*Math.sin(a),z];
   const q=[cx+dx*r*Math.cos(b),cy+dy*r*Math.sin(b),z];
   points.push(...p,...q);
   points.push(cx,cy,z,...p);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  const ink=new THREE.LineBasicMaterial({color:'#ffe9b4',transparent:true,opacity:.94,toneMapped:false});
  const motif=new THREE.LineSegments(geo,ink);
  motif.name='dh11c5d3e_featured_emblem_'+index;
  motif.userData.decorativeOnly=true;motif.raycast=()=>{};
  mesh.add(motif);
 }
}
function makeBookcase(){
 const g=group(scene,4.7,0,-3.85);
 box(g,3.1,4.47,.77,furnitureModelProof?mats.shelfWalnut:mats.darkwood,0,2.23,0);
 box(g,2.9,4.17,.12,furnitureModelProof?mats.shelfLining:mats.ink,0,2.22,.35);
 for(const x of [-1.5,1.5])box(g,.13,4.55,.81,furnitureModelProof?mats.shelfWalnut:mats.timber,x,2.23,.04);
 for(let y=.47;y<=4.08;y+=.91)box(g,3.04,.095,.84,furnitureModelProof?mats.shelfEdge:mats.edge,0,y,.11);
 const colours=['#a59482','#6e737f','#9b8878','#b1a391','#5a7181','#7b6559','#a7a5a1'];
 for(let shelf=0;shelf<4;shelf++){
  for(let b=0;b<20;b++){
   const height=.43+((b*7+shelf*13)%7)*.044;
   const x=-1.32+b*.139,y=.54+shelf*.91+height/2;
   const materialIndex=(shelf*4+b)%colours.length;
   const bookMat=furnitureModelProof?mats['bookBinding'+materialIndex]:matte(colours[materialIndex]);
   const bk=box(g,.111,height,.43,bookMat,x,y,.44);
   bk.name='book_'+shelf+'_'+String(b).padStart(2,'0');
   const publishedIndex=finishedBooksEnabled
    ?finishedBooks.indexForMesh(shelf,b)
    :(featuredBook(shelf,b)?pullBooks.length:null);
   if(publishedIndex!==null){
    markFeaturedBook(bk,publishedIndex);
    pullBooks.push(bk);
   }
   // Art lab recolours the actual mesh material, including selected books.
   bookMaterials.push(bk.material);
  }
 }
 box(g,3.3,.16,.97,furnitureModelProof?mats.shelfGilt:mats.brass,0,4.51,.07);
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
 if(exitDoorProof){
  if(!window.DH11DoorExit)throw Error('Missing physical exit-door interaction contract');
  doorExitTarget=window.DH11DoorExit.makeTarget(THREE,g);
 }
 capture('door',g);return g;
}
makeDoor();
const islandGroups=[];
function makeWindow(){
 const g=group(scene,.17,3.65,-5.31);
 if(!shellProof)box(g,3.4,2.75,.06,mats.edge,0,0,-.08);
 const initialSky=darkWindowPreload
  ?new THREE.MeshBasicMaterial({color:'#111827',side:THREE.DoubleSide})
  :mats.sky;
 box(g,3.13,2.47,.04,initialSky,0,0,shellProof?-.54:-.032);
 // Suppress the temporary low-poly islands in the canonical Writing room.
 // They must not appear during GLB loading or while the image is downloading.
 if(!darkWindowPreload)for(let i=0;i<3;i++){
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
 sceneLights.lamp.userData.litIntensity=palette.lampIntensity;
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

// DH-11C.5C.1-C.2: variant A lives on a separate staging route. All
// moving meshes and camera stops are unchanged; materials, drawn contour
// children and lighting are the only calibrated properties.
if(illustratedProof){
 const system=document.body.dataset.illustratedV5==='true'?window.DH11HighIllustration3D:
  document.body.dataset.illustratedV4==='true'?window.DH11ComicStorybookStyle:
  document.body.dataset.illustratedV3==='true'?window.DH11IllustratedStyleV3:
  document.body.dataset.illustratedV2==='true'?window.DH11IllustratedStyleV2:window.DH11IllustratedStyle;
 const options=[...document.querySelectorAll('[data-illustration-mode]')];
 if(!system||options.length!==2)throw Error('Missing DH-11C.5C Painterly Storybook calibration system');
 illustratedRuntime=system.createRuntime({THREE,scene,renderer,lights:sceneLights});
 illustratedRuntime.register(scene);
 // V4 installs static painted 3D dressing outside the object capture() rigs.
 // Nothing enters the interactive raycast target array.
 const comicDressing=document.body.dataset.illustratedV4==='true'
  ?window.DH11ComicDressing?.create(THREE,scene):null;
 if(document.body.dataset.illustratedV4==='true'&&!comicDressing)
  throw Error('Missing DH-11C.5C.3 comic storybook dressing contract');
 const description=document.getElementById('illustration-description');
 function chooseIllustration(mode){
  const selected=illustratedRuntime.set(mode);
  if(comicDressing)comicDressing.setVisible(mode==='painterly');
  if(scenicWindow)scenicWindow.setVisible(mode==='painterly');
  if(manuscriptPersonality)manuscriptPersonality.setVisible(mode==='painterly');
  if(mysticalRug)mysticalRug.setVisible(mode==='painterly');
  if(mysticalFurniture)mysticalFurniture.setVisible(mode==='painterly');
  for(const option of options){
   option.setAttribute('aria-pressed',String(option.dataset.illustrationMode===mode));
  }
  if(description)description.textContent=selected.description;
  document.body.dataset.illustrationMode=mode;
 }
 options.forEach(button=>button.addEventListener('click',()=>chooseIllustration(button.dataset.illustrationMode)));
 chooseIllustration('painterly');
}
const copyById={
 desk:'Each sheet has two places on the desktop. Click it to slide out or return it. Click the lamp to switch its light on or off.',
 cabinet:'The five drawers belong to one physical cabinet. Each drawer is a collection of 3D surfaces that move together, never a pasted illustration.',
 bookcase:'Find the eight turquoise books with gold spine markings. Click one to pull it forward, then click it again to return it. The other 72 books stay on their shelves.',
 typewriter:'The typewriter has separate keys, a roller and a paper sheet. Tap to press a key and advance the paper.',
 bin:'Nine crumpled manuscripts are piled in this bin. Click a particular paper ball to toss it onto the floor; click the same one to return it. Each piece moves independently.',
 door:'The door opens on a real vertical hinge. It provides a way back towards the floating DaveHub islands.',
 window:'The distant islands are simple geometry behind the window frame. Their tiny movement is a first pass at bringing the world to life.'
};
let state=plan.next(null,{type:'init'});
// DH-11C.5D.2: screenshot/JSON references come from the actual Three.js
// renderer and its locked room-plan cameras, not independent fake scene art.
if(document.body.dataset.illustratedViewProof==='true'){
 const contract=window.DH11IllustratedViews;
 const capture=document.getElementById('capture-view-guide');
 const exportGuide=document.getElementById('export-view-guide');
 const indicator=document.getElementById('view-guide-status');
 if(!contract||!capture||!exportGuide||!indicator)
  throw Error('Missing DH-11C.5D camera contract or export controls');
 const cameras=contract.contract(plan);
 const download=(blob,name)=>{
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
 };
 const current=()=>{
  const focus=state.focus||'home',view=cameras.views.find(v=>v.id===focus);
  if(!view)throw Error('Unknown canonical camera '+focus);
  return {focus,view};
 };
 const modelReady=()=>Boolean(scene.getObjectByName('desk_root')&&scene.getObjectByName('drawer_finished'));
 const guide=()=>{
  const {focus,view}=current(),width=renderer?.domElement.width||0,height=renderer?.domElement.height||0;
  return {milestone:'DH-11C.5D.2',kind:'same-source geometry reference',
   warning:'Not a finished illustration or a replacement for the real 3D rig.',
   contractVersion:contract.VERSION,view,camera:{position:[...camera.position],target:[...focusPoint],
   fov:camera.fov,near:camera.near,far:camera.far,aspect:camera.aspect},
   pixels:{width,height},actualGLBsLoaded:modelReady(),
   state:contract.stateSummary(state)};
 };
 capture.addEventListener('click',()=>{
  if(!renderer||!modelReady()){
   indicator.textContent='The furniture and cabinet GLBs must finish loading before capture.';
   return;
  }
  // Lock the *actual* runtime camera to the approved stop before recording.
  camera.position.copy(desiredPosition);
  focusPoint.copy(desiredTarget);
  camera.lookAt(focusPoint);
  camera.updateMatrixWorld();
  renderer.render(scene,camera);
  const {focus}=current();
  try{
   const data=canvas.toDataURL('image/png');
   if(!data.startsWith('data:image/png;base64,'))throw Error('PNG framebuffer unavailable');
   const a=document.createElement('a');
   a.href=data;a.download=contract.fileName(focus,'png');a.click();
   indicator.textContent='Captured '+focus+' from the live GLB room. Geometry guide only.';
  }catch(error){
   indicator.textContent='PNG export failed. Try a browser with canvas capture enabled.';
   console.warn('Illustrated reference capture failed',error);
  }
 });
 exportGuide.addEventListener('click',()=>{
  const {focus}=current();
  const bytes=JSON.stringify(guide(),null,2)+'\\n';
  download(new Blob([bytes],{type:'application/json'}),contract.fileName(focus,'json'));
  indicator.textContent='Exported the '+focus+' camera, projection and current interactive-state guide.';
 });
}
const drawerHome=cabinetDrawers.map(x=>x.position.z);
let bookHome=pullBooks.map(x=>x.position.z);
// All 24 keys, the platen and the paper have separate animation references.
let currentHover=null;
// One outstanding visual-to-content transition at a time. Moving back,
// changing furniture or selecting a different object cancels the old reveal.
let pendingObjectReveal=null;
function queueObjectReveal(kind,index){
 pendingObjectReveal={kind,index,settledAt:null};
}
const minimalCopy={
 desk:manuscriptExperienceEnabled?'Loose manuscripts to browse, with notes in the margins. Tap a sheet to read it.':'Scrawled drafts, loose pages and a temperamental lamp.',
 cabinet:cabinetArchiveEnabled?'Five real drawers, with physical coloured folders inside. Open a drawer, then pull out a file.':'Five drawers of questionable organisation.',
 bookcase:finishedBooksEnabled?'Three finished books. Pull one out to explore its edition and where to buy it.':'Eighty unlikely books, eight with stories of their own.',
 typewriter:motionFirst?'Click the little keys or type on your keyboard to move the mechanism. Explore further opens a blank writing page.':manuscriptExperienceEnabled?'A blank page and a few questionable writing prompts. Try the creative workshop.':'A machine still waiting for the next sentence.',
 bin:'An overflowing collection of abandoned ideas.',
 window:'A glimpse of other worlds beyond the glass.'
};
function showObjectPrompt(id){
 if(!minimalUI)return;
 const obj=plan.find(id);
 if(!obj||id==='door'){
  objectPrompt.hidden=true;delete document.body.dataset.roomPrompt;return;
 }
 promptTitle.textContent=obj.label;
 promptCopy.textContent=minimalCopy[id]||'Discover what is hidden here.';
 objectPrompt.hidden=false;
 document.body.dataset.roomPrompt='visible';
 tray.hidden=true;
}
if(minimalUI){
 promptOpen.addEventListener('click',()=>{
  if(!state.focus||state.focus==='door')return;
  if(manuscriptExperienceEnabled&&state.focus==='typewriter'){
   manuscriptExperience.openWorkshop();return;
  }
  objectPrompt.hidden=true;
  delete document.body.dataset.roomPrompt;
  tray.hidden=false;
  fullClose.focus({preventScroll:true});
 });
 promptClose.addEventListener('click',()=>{
  objectPrompt.hidden=true;
  delete document.body.dataset.roomPrompt;
  homeButton.focus({preventScroll:true});
 });
 fullClose.addEventListener('click',()=>{
  tray.hidden=true;
  if(state.focus&&state.focus!=='door')showObjectPrompt(state.focus);
  (objectPrompt.hidden?homeButton:promptOpen).focus({preventScroll:true});
 });
}
function focus(id){
 if(!plan.find(id))return;
 pendingObjectReveal=null;
 pendingFolderReveal=null;
 if(cabinetFolders)cabinetFolders.clear();
 state=plan.next(state,{type:'focus',id});
 const obj=plan.find(id);
 // Side-dock the visitor's prompt and expanded object controls away from
 // the selected furniture, rather than obstructing pull-out books/drawers.
 if(minimalUI){
  if(id==='door')delete document.body.dataset.roomFocus;
  else document.body.dataset.roomFocus=id;
 }
 desiredPosition.set(...obj.camera);
 desiredTarget.set(...obj.lookAt);
 homeButton.disabled=false;
 cameraLabel.textContent=obj.label.toUpperCase()+' CAMERA';
 placeName.textContent=obj.label;
 placeDescription.textContent=obj.action;
 for(const b of focusButtons)b.setAttribute('aria-pressed',String(b.dataset.focus===id));
 tray.hidden=!!minimalUI;title.textContent=obj.label;copy.textContent=copyById[id];
 renderControls(id);
 if(minimalUI)showObjectPrompt(id);
 status.textContent=obj.label+' selected. The camera is approaching.';
 if(reduced.matches){camera.position.copy(desiredPosition);focusPoint.copy(desiredTarget);camera.lookAt(focusPoint);}
}
function home(){
 pendingObjectReveal=null;
 pendingFolderReveal=null;
 if(cabinetFolders)cabinetFolders.clear();
 state=plan.next(state,{type:'home'});
 if(minimalUI){
  delete document.body.dataset.roomFocus;
  delete document.body.dataset.roomPrompt;
 }
 desiredPosition.set(...plan.HOME.position);desiredTarget.set(...plan.HOME.target);
 cameraLabel.textContent='OVERVIEW CAMERA';homeButton.disabled=true;
 placeName.textContent='The Manuscript Hoard';placeDescription.textContent='An actual 3D study. Explore its objects.';
 for(const b of focusButtons)b.setAttribute('aria-pressed','false');
 tray.hidden=true;
 if(minimalUI)objectPrompt.hidden=true;
 if(reduced.matches){camera.position.copy(desiredPosition);focusPoint.copy(desiredTarget);camera.lookAt(focusPoint);}
}
const drawerNames=['Finished','Drafts','Oddities','Fragments','Field Notes'];
function toggleCabinetDrawer(index){
 if(!Number.isInteger(index)||index<0||index>=drawerNames.length)return;
 pendingFolderReveal=null;
 if(cabinetFolders)cabinetFolders.clear();
 state=plan.next(state,{type:'drawer',index});
 status.textContent=drawerNames[index]+
  (state.drawer===index?' drawer sliding towards you. Pick a physical folder after it opens.':' drawer returning to the cabinet.');
 renderControls('cabinet');
}
function selectCabinetFolder(drawer,index){
 if(!cabinetArchiveEnabled||state.focus!=='cabinet'||state.drawer!==drawer)return;
 const item=cabinetCatalogue.at(drawer,index);
 if(!item){status.textContent='An unlabelled spare folder. Nothing is filed in this sample slot.';return;}
 const current=cabinetFolders.selected;
 if(current?.drawer===drawer&&current?.index===index){
  pendingFolderReveal=null;cabinetFolders.clear();
  status.textContent='The folder slips back between the others.';
 }else{
  cabinetFolders.select(drawer,index);
  pendingFolderReveal={drawer,index,settledAt:null};
  status.textContent='“'+item.title+'” lifts from the real drawer. Wait for it to settle before opening.';
 }
 renderControls('cabinet');
}
function navigateFromCabinetFolder(item){
 pendingFolderReveal=null;if(cabinetFolders)cabinetFolders.clear();
 const relation=item?.related;
 if(!relation)return;
 if(relation.type==='book'){
  const book=finishedBooks?.byId(relation.id);if(!book)return;
  focus('bookcase');
  if(!state.books[book.featuredIndex])toggleBook(book.featuredIndex);
  else bookExperience.show(book.featuredIndex);
 }else if(relation.type==='manuscript'){
  const index=window.DH11ManuscriptExperience?.MANUSCRIPTS.findIndex(x=>x.id===relation.id);
  if(index===undefined||index<0)return;
  focus('desk');
  if(!state.papers[index])togglePaper(index);
  else manuscriptExperience.openManuscript(index);
 }else if(relation.type==='workshop'){
  focus('typewriter');manuscriptExperience.openWorkshop();
 }
}
function bookDescription(index){
 const shelf=Math.floor(index/2),slot=(10-shelf)%10+(index%2)*10;
 const names=personalityProof?(window.DH11ManuscriptPersonality?.AUTHORED_BOOK_TITLES||window.DH11ManuscriptPersonality?.BOOK_TITLES):null;
 const published=finishedBooksEnabled?finishedBooks.byIndex(index):null;
 const physicalSlot=published?finishedBooks.TOP_SHELF_SLOTS[index]:slot;
 const title=published?.title||names?.[shelf*20+slot];
 if(published)return '“'+title+'” (top shelf, book '+(physicalSlot+1)+')';
 return title?'“'+title+'” (shelf '+(shelf+1)+', book '+(slot+1)+')':
  'Shelf '+(shelf+1)+', book '+(slot+1);
}
function toggleBook(index){
 if(!Number.isInteger(index)||index<0||index>=FEATURED_BOOK_COUNT)return;
 if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;
 const wasPulled=state.books[index];
 state=plan.next(state,{type:'book',index});
 if(wasPulled===state.books[index])return;
 status.textContent=bookDescription(index)+(state.books[index]?
  ' slides forward. Click it again to return it.':' slides back into its original slot.');
 syncBookControls();
 if(motionFirst&&finishedBooksEnabled){
  if(state.books[index])queueObjectReveal('book',index);
  else pendingObjectReveal=null;
 }else if(finishedBooksEnabled&&state.books[index])bookExperience.show(index);
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
function syncLampControl(){
 for(const button of actions.querySelectorAll('[data-lamp-toggle]')){
  button.textContent=state.lampOn?'Turn lamp off':'Turn lamp on';
  button.setAttribute('aria-pressed',String(state.lampOn));
 }
}
function toggleLamp(){
 const wasOn=state.lampOn;
 state=plan.next(state,{type:'lamp'});
 if(state.lampOn===wasOn)return;
 status.textContent=state.lampOn?'The desk lamp clicks on, casting a warm glow.':'The desk lamp clicks off; its bulb goes dark.';
 syncLampControl();
}
function togglePaper(index){
 if(!Number.isInteger(index)||index<0||index>=PAPER_LIMIT)return;
 const wasMoved=state.papers[index];
 state=plan.next(state,{type:'paper',index});
 if(state.papers[index]===wasMoved)return;
 status.textContent='Sheet '+(index+1)+(state.papers[index]?
  ' slides to its second place on the desk.':' slides back to its original place.');
 syncPaperControls();
 if(motionFirst&&manuscriptExperienceEnabled){
  if(state.papers[index])queueObjectReveal('paper',index);
  else pendingObjectReveal=null;
 }else if(manuscriptExperienceEnabled&&state.papers[index])manuscriptExperience.openManuscript(index);
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
function activateExitDoor(){
 if(!exitDoorProof)return;
 // A direct click from the overview opens the real door on the FIRST click.
 if(state.focus!=='door')focus('door');
 const result=window.DH11DoorExit.advance(plan,state);
 if(result.action==='exit'){
  status.textContent='Leaving the Manuscript Hoard for DaveHub.';
  // Same origin. A staging preview returns to staging, never to production.
  window.location.assign(window.DH11DoorExit.HOME_PATH);
  return;
 }
 state=result.state;
 if(doorExitTarget)doorExitTarget.visible=true;
 status.textContent='The door opens. Click the door or doorway again to return to DaveHub.';
 renderControls('door');
}
function renderControls(id){
 actions.replaceChildren();
 const add=(label,action)=>{
  const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);
  actions.append(b);
 };
 if(id==='cabinet'){
  drawerNames.forEach((n,i)=>add((state.drawer===i?'Close ':'Open ')+n,()=>toggleCabinetDrawer(i)));
  if(cabinetArchiveEnabled){
   const instruction=document.createElement('p');
   instruction.textContent='Open a drawer, watch it slide, then click a coloured file inside. A folder lifts out before its contents appear. Samples are clearly marked.';
   actions.append(instruction);
   if(state.drawer!==null){
    const detail=document.createElement('details'),summary=document.createElement('summary');
    summary.textContent='Select a file using keyboard controls';
    detail.append(summary);
    const group=document.createElement('div');group.className='paper-controls';
    for(const record of cabinetCatalogue.inDrawer(state.drawer)){
     const button=document.createElement('button');button.type='button';
     const selected=cabinetFolders.selected;
     button.textContent=record.title+(selected?.drawer===state.drawer&&selected.index===record.slot?' · return folder':' · pull out');
     button.setAttribute('aria-pressed',String(selected?.drawer===state.drawer&&selected.index===record.slot));
     button.addEventListener('click',()=>selectCabinetFolder(record.drawer,record.slot));
     group.append(button);
    }
    detail.append(group);actions.append(detail);
   }
  }
 }else if(id==='desk'){
  if(manuscriptExperienceEnabled)add('Read a manuscript',()=>manuscriptExperience.openManuscript(0));
  const lampButton=document.createElement('button');
  lampButton.type='button';
  lampButton.dataset.lampToggle='true';
  lampButton.addEventListener('click',toggleLamp);
  actions.append(lampButton);
  syncLampControl();
  // Click the actual named 3D mesh; equivalent controls remain keyboard accessible.
  const help=document.createElement('p');
  help.textContent=motionFirst?'Click a real sheet; watch it slide out, then read its sample. Click again to slide it back.':manuscriptExperienceEnabled?'Click an actual paper sheet to slide it out and read a sample; click again to return the sheet.':'Click a particular paper to slide it out. Click it again to return it.';
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
  help.textContent=finishedBooksEnabled
   ?'The three gold-framed bindings on the top shelf are published books. Pull one out to view its cover, details and purchase links.'
   :'Look for the eight bright turquoise spines with gold markings. Click one to pull it out, or click it again to return it.';
  actions.append(help);
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Select a book using keyboard controls';
  details.append(summary);
  const buttons=document.createElement('div');
  buttons.className='paper-controls';
  for(let i=0;i<(finishedBooksEnabled?finishedBooks.BOOKS.length:FEATURED_BOOK_COUNT);i++){
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
 else if(id==='typewriter'){
  if(manuscriptExperienceEnabled){
   add('Open the creative workshop',()=>manuscriptExperience.openWorkshop());
   if(motionFirst){
    const help=document.createElement('p');
    help.textContent='Try clicking the individual 3D keys, or type on your keyboard while focused on this machine. The keys and paper will move.';
    actions.append(help);
   }
  }
  else add('Press a key',()=>pressTypewriter());
 }
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
  if(exitDoorProof){
   // Accessible keyboard/touch counterpart to the same physical door clicks.
   add(window.DH11DoorExit.label(state),activateExitDoor);
  }else{
   add(state.doorOpen?'Close the door':'Open the door',()=>{state=plan.next(state,{type:'door'});status.textContent=state.doorOpen?'The door swings open on its hinge.':'The door swings shut.';renderControls('door');});
   if(state.doorOpen){const a=document.createElement('a');a.href='/';a.textContent='Return to DaveHub islands ↗';actions.append(a);}
  }
 }else if(id==='window')add('Look at the islands',()=>{status.textContent='These are low-poly floating islands within the same 3D room.';});
}
for(const b of focusButtons)b.addEventListener('click',()=>focus(b.dataset.focus));
homeButton.addEventListener('click',home);
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]'))return;
 // Workshop typing and scene typing are distinct: the actual machine stays
 // playable. Don't intercept shortcuts or focused interactive HTML controls.
 if(motionFirst&&state.focus==='typewriter'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&
    e.key.length===1&&!e.target?.closest?.('input,textarea,select,button,a,summary,[contenteditable]')){
  e.preventDefault();
  pressTypewriter(keyIndexForCharacter(e.key));
  return;
 }
 if(e.key!=='Escape'||!state.focus)return;
 e.preventDefault();
 if(minimalUI&&!tray.hidden){
  tray.hidden=true;
  showObjectPrompt(state.focus);
  (objectPrompt.hidden?homeButton:promptOpen).focus({preventScroll:true});
  return;
 }
 home();
});
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
  folderIndex:id==='cabinet'&&cabinetArchiveEnabled&&Number.isInteger(mesh.userData.cabinetFolderIndex)?mesh.userData.cabinetFolderIndex:null,
  paperIndex:id==='desk'?(Number.isInteger(mesh.userData.paperIndex)?mesh.userData.paperIndex:paperIndexForMesh(mesh.name)):null,
  lampPart:id==='desk'?lampPartForMesh(mesh.name):null,
  bookIndex:id==='bookcase'?(Number.isInteger(mesh.userData.featuredBookIndex)
   ?mesh.userData.featuredBookIndex
   :(finishedBooksEnabled?null:featuredBookIndexForMesh(mesh.name))):null,
  spineTitle:personalityProof&&id==='bookcase'?mesh.userData.manuscriptJokeTitle||null:null,
  binPaperIndex:id==='bin'?(Number.isInteger(mesh.userData.binPaperIndex)?mesh.userData.binPaperIndex:binPaperIndexForMesh(mesh.name)):null,
  keyIndex:id==='typewriter'?typedKeyIndex(mesh.name):null};
}
canvas.addEventListener('pointermove',event=>{
 const pick=pickFromEvent(event);
 const hovered=pick?.id||null;
 if(hovered!==currentHover){currentHover=hovered;canvas.classList.toggle('interactive',!!hovered);}
 canvas.title=pick?.folderIndex!==null&&pick?.folderIndex!==undefined&&pick?.drawerIndex!==null&&pick?.drawerIndex!==undefined
  ?(cabinetCatalogue.at(pick.drawerIndex,pick.folderIndex)?.title||'Unlabelled spare folder')+
    (state.drawer===pick.drawerIndex?' · click to lift':' · open this drawer first')
  :pick?.drawerIndex!==null&&pick?.drawerIndex!==undefined
  ?drawerNames[pick.drawerIndex]+' drawer'
  :pick?.paperIndex!==null&&pick?.paperIndex!==undefined
   ?(state.papers[pick.paperIndex]?'Return':'Move')+' sheet '+(pick.paperIndex+1)
   :pick?.bookIndex!==null&&pick?.bookIndex!==undefined
    ?(state.books[pick.bookIndex]?'Return ':'Pull ')+bookDescription(pick.bookIndex)
    :pick?.binPaperIndex!==null&&pick?.binPaperIndex!==undefined
     ?(state.binPapers[pick.binPaperIndex]?'Return':'Rummage')+' crumpled paper '+(pick.binPaperIndex+1)
     :pick?.lampPart!==null&&pick?.lampPart!==undefined
     ?(state.lampOn?'Switch off':'Switch on')+' desk lamp'
     :pick?.spineTitle?'“'+pick.spineTitle+'” (fictional archive title)'
     :hovered==='door'&&exitDoorProof?window.DH11DoorExit.label(state)
     :hovered==='bookcase'?'Only highlighted books can be pulled out'
     :hovered==='typewriter'&&motionFirst?'Press the actual 3D keys or type on your keyboard'
     :hovered==='typewriter'&&manuscriptExperienceEnabled?'Open the creative writing workshop'
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
 if(!pick){
  // DH-11C.6A.1: tapping empty scenery (walls, floor or sky) while zoomed
  // into an object returns to the whole room. A drag is ignored above.
  // Gate to the minimal Writing UI so earlier 3D previews stay unchanged.
  if(minimalUI&&state.focus)home();
  return;
 }
 const {id,drawerIndex,folderIndex,paperIndex,bookIndex,binPaperIndex,lampPart,keyIndex}=pick;
 if(state.focus===id){
  if(id==='cabinet'){
   // The case and rails are not drawer toggles. A named folder in the
   // currently extended drawer instead drives its own 3D lift motion.
   if(drawerIndex===null)return;
   if(cabinetArchiveEnabled&&folderIndex!==null&&state.drawer===drawerIndex)
    selectCabinetFolder(drawerIndex,folderIndex);
   else toggleCabinetDrawer(drawerIndex);
  }else{
   if(id==='desk'&&lampPart!==null)toggleLamp();
   else if(id==='desk'&&paperIndex!==null)togglePaper(paperIndex);
   else if(id==='bookcase'){
    if(bookIndex!==null)toggleBook(bookIndex);
    else status.textContent=finishedBooksEnabled
     ?'Pull one of the three gold-outlined books on the top shelf.'
     :'Try one of the eight highlighted book spines.';
   }
   else if(id==='typewriter')pressTypewriter(keyIndex);
   else if(id==='bin'){
    if(binPaperIndex!==null)toggleBinPaper(binPaperIndex);
    else status.textContent='Click an actual crumpled paper to rummage in the bin.';
   }
   else if(id==='door'&&exitDoorProof)activateExitDoor();
   else if(id==='door')state=plan.next(state,{type:'door'});
   if(id==='typewriter'&&manuscriptExperienceEnabled&&!motionFirst){
    manuscriptExperience.openWorkshop();
   }
   if(!['desk','bookcase','bin','typewriter'].includes(id)&&!(id==='door'&&exitDoorProof))status.textContent=plan.find(id).label+' responds to your interaction.';
  }
  if(!['desk','bookcase','bin'].includes(id))renderControls(id);
 }else{
  focus(id);
  // The door opens with the first scene click, even from the overview.
  if(id==='door'&&exitDoorProof)activateExitDoor();
  // Clicking a sheet in the overview focuses the desk and moves that sheet.
  if(id==='desk'&&lampPart!==null)toggleLamp();
  else if(id==='desk'&&paperIndex!==null)togglePaper(paperIndex);
  if(id==='bookcase'&&bookIndex!==null)toggleBook(bookIndex);
  if(id==='bin'&&binPaperIndex!==null)toggleBinPaper(binPaperIndex);
  // A drawer hit in the overview identifies the drawer as well as the
  // cabinet, so the first click opens that drawer after selecting the view.
  if(id==='cabinet'&&drawerIndex!==null)toggleCabinetDrawer(drawerIndex);
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
// Each overlay waits for BOTH the clicked physical object and the shared
// camera to reach their real transforms. A short final hold shows the
// extended sheet or book before the reader covers the scene.
function revealAfterPhysicalMotion(){
 const pending=pendingObjectReveal;
 if(!motionFirst||!pending||!renderer)return;
 const isBook=pending.kind==='book',index=pending.index;
 const focusId=isBook?'bookcase':'desk';
 const active=isBook?state.books[index]:state.papers[index];
 if(state.focus!==focusId||active!==true){pendingObjectReveal=null;return;}
 const mesh=isBook?pullBooks[index]:loosePapers[index];
 const homePosition=isBook?bookHome[index]:paperHomes[index];
 if(!mesh||homePosition===undefined)return;
 let itemDistance;
 if(isBook){
  itemDistance=Math.abs(mesh.position.z-bookPosition(homePosition,true));
 }else{
  const end=paperPose(homePosition,index,true);
  itemDistance=Math.max(Math.abs(mesh.position.x-end.x),
   Math.abs(mesh.position.y-end.y),Math.abs(mesh.position.z-end.z));
 }
 const ready=revealReady({
  focus:state.focus,expectedFocus:focusId,active,
  itemDistance,cameraDistance:camera.position.distanceTo(desiredPosition),
  aimDistance:focusPoint.distanceTo(desiredTarget)
 });
 if(!ready){pending.settledAt=null;return;}
 if(pending.settledAt===null)pending.settledAt=clock.elapsedTime;
 if(!reduced.matches&&clock.elapsedTime-pending.settledAt<REVEAL_HOLD_SECONDS)return;
 pendingObjectReveal=null;
 if(isBook)bookExperience.show(index);
 else manuscriptExperience.openManuscript(index);
}
// The folder opens only after the real drawer, real lifted file and
// the actual camera are at rest. No fixed delay from the click.
function revealCabinetFolderAfterMotion(){
 const pending=pendingFolderReveal;
 if(!cabinetArchiveEnabled||!pending||!renderer)return;
 const selected=cabinetFolders.selected;
 if(state.focus!=='cabinet'||state.drawer!==pending.drawer||
    !selected||selected.drawer!==pending.drawer||selected.index!==pending.index){
  pendingFolderReveal=null;return;
 }
 const drawer=cabinetDrawers[pending.drawer],homePosition=drawerHome[pending.drawer];
 if(!drawer||homePosition===undefined||!cabinetFolders.attached)return;
 const distance=Math.abs(drawer.position.z-homePosition-
  (glbProof?.76*glbExtension:.65));
 const ready=distance<=.009&&cabinetFolders.settled(pending.drawer,pending.index)&&
  camera.position.distanceTo(desiredPosition)<=.10&&
  focusPoint.distanceTo(desiredTarget)<=.10;
 if(!ready){pending.settledAt=null;return;}
 if(pending.settledAt===null)pending.settledAt=clock.elapsedTime;
 if(!reduced.matches&&clock.elapsedTime-pending.settledAt<REVEAL_HOLD_SECONDS)return;
 pendingFolderReveal=null;
 cabinetExperience.show(pending.drawer,pending.index);
}
function render(){
 const delta=Math.min(clock.getDelta(),.08);
 if(renderer){
  const rate=reduced.matches?1:1-Math.exp(-5.5*delta);
  // The bulb and actual point light share one state. Fade both so switching
  // it off genuinely darkens the desk, rather than just changing button text.
  sceneLights.lamp.intensity=THREE.MathUtils.lerp(sceneLights.lamp.intensity,state.lampOn?sceneLights.lamp.userData.litIntensity:0,rate);
  if(lampBulbMesh){
   const bulbMaterial=lampBulbMesh.material;
   bulbMaterial.color.lerp(state.lampOn?lampLitColour:lampUnlitColour,rate);
   bulbMaterial.emissiveIntensity=THREE.MathUtils.lerp(bulbMaterial.emissiveIntensity,state.lampOn?.85:0,rate);
  }
  camera.position.lerp(desiredPosition,rate);
  focusPoint.lerp(desiredTarget,rate);
  camera.lookAt(focusPoint);
  for(let i=0;i<cabinetDrawers.length;i++){
   const target=state.drawer===i ? (glbProof?.76*glbExtension:.65) : 0;
   cabinetDrawers[i].position.z=THREE.MathUtils.lerp(cabinetDrawers[i].position.z,drawerHome[i]+target,rate);
  }
  if(cabinetFolders)cabinetFolders.update(rate);
  for(let i=0;i<pullBooks.length;i++){
   const target=bookPosition(bookHome[i],state.books[i]);
   pullBooks[i].position.z=THREE.MathUtils.lerp(pullBooks[i].position.z,target,rate);
  }
  // Reversible lift-and-tumble arcs. Reverse mid-flight without snapping.
  for(let i=0;i<binPapers.length;i++){
   const target=state.binPapers[i]?1:0;
   const step=reduced.matches?1:delta*1.3;
   binPaperProgress[i]=target>binPaperProgress[i]?
    Math.min(target,binPaperProgress[i]+step):Math.max(target,binPaperProgress[i]-step);
   const pose=binPaperPose(binPaperHomes[i],i,binPaperProgress[i]);
   binPapers[i].position.set(pose.x,pose.y,pose.z);
   binPapers[i].rotation.set(pose.rx,pose.ry,pose.rz);
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
  revealAfterPhysicalMotion();
  revealCabinetFolderAfterMotion();
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
    const label=makeText(drawerNames[i],handwrittenLabelProof?1.04:personalityProof?1.31:authoredDetailProof?.96:.42,handwrittenLabelProof?.21:personalityProof?.28:authoredDetailProof?.20:.1);
    label.position.set(0,handwrittenLabelProof?.085:personalityProof?.06:.108,authoredDetailProof?.095:.076);
    front.add(label);
    found.push(drawer);
   }
   if(furnitureModelProof){
    content.traverse(node=>{
     if(!node.isMesh)return;
     const finish=archiveKit.cabinetFinishForNode(node.name);
     if(finish)node.material=mats[finish];
    });
   }
   if(cabinetFolders)cabinetFolders.attach(found);
   scene.add(content);
   if(illustratedRuntime)illustratedRuntime.register(content);
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
  new GLTFLoader().load('../room/models/furniture-source.glb?v=dh11c5b-archive-v1',gltf=>{
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
    const crumples=Array.from({length:BIN_PAPER_COUNT},(_,i)=>get('bin_paper_'+i));
    crumples.forEach((mesh,i)=>{mesh.userData.binPaperIndex=i;});
    const books=[];
    for(let shelf=0;shelf<4;shelf++)for(let b=0;b<20;b++){
     const isPublished=finishedBooksEnabled&&finishedBooks.indexForMesh(shelf,b)!==null;
     if(isPublished||(!finishedBooksEnabled&&featuredBook(shelf,b)))
      books.push(get('book_'+shelf+'_'+String(b).padStart(2,'0')));
    }
    // GLB lamp must preserve the same five named click targets as fallback.
    for(const part of ['shade','cap','stem','bulb','base'])get('desk_lamp_'+part);
    const glbBulb=get('desk_lamp_bulb');
    const keys=Array.from({length:TYPE_KEY_COUNT},(_,i)=>get('typewriter_key_'+Math.floor(i/8)+'_'+i%8));
    const key=keys[12],typeSheet=get('typewriter_paper'),typeRule=get('typewriter_paper_rule'),platen=get('typewriter_platen'),hinge=get('door_leaf_hinge');
    const islands=Array.from({length:3},(_,i)=>get('window_island_'+i));
    if(darkWindowPreload){
     // The GLB is still off-scene: make it safe BEFORE it can be rendered.
     // A dark, unlit sky fills the opening without the obsolete island shapes.
     get('window_sky').material=new THREE.MeshBasicMaterial({
      color:'#111827',side:THREE.DoubleSide
     });
     islands.forEach(island=>{island.visible=false;});
    }
    if(authoredDetailProof){
     // Keep the canonical GLB for reversibility, but hide the distracting cup.
     const cup=content.getObjectByName('desk_cup');
     if(cup){cup.visible=false;cup.userData.decorativeOnly=true;}
     const windowRig=next.get('window');
     try{
      if(!window.DH11WindowIllustration)throw Error('Missing layered window artwork system');
      scenicWindow=window.DH11WindowIllustration.mount({
       THREE,root:windowRig,url:new URL('../../../assets/homepage/floating-islands-background.png',document.baseURI).href,
       hideLegacyWhileLoading:darkWindowPreload
      });
      scenicWindow.setVisible(illustratedRuntime?.mode==='painterly');
     }catch(error){
      console.warn(darkWindowPreload
       ?'Illustrated window unavailable; dark window retained'
       :'Illustrated window unavailable; original islands retained',error);
     }
    }
    // Attach the bright bindings and gold bands BEFORE capture() traverses
    // the scene. Otherwise their meshes are absent from the raycast targets.
    // This also means a failed decoration leaves the fallback untouched.
    if(mysticalRoomProof){
     mysticalFurniture=window.DH11RoomProps.decorateFurniture({THREE,root:content});
     mysticalFurniture.setVisible(illustratedRuntime?.mode==='painterly');
    }
    if(exitDoorProof){
     // Capture this genuine, doorway-sized 3D trigger with the GLB door rig.
     // Its initial hidden state preserves all original closed-door hit targets.
     doorExitTarget=window.DH11DoorExit.makeTarget(THREE,next.get('door'));
     doorExitTarget.visible=!!state.doorOpen;
    }
    books.forEach((mesh,i)=>markFeaturedBook(mesh,i));
    if(personalityProof){
     if(!window.DH11ManuscriptPersonality)throw Error('Missing title and chaotic manuscript artwork');
     manuscriptPersonality=window.DH11ManuscriptPersonality.create({THREE,root:content,
      finishedBooks:finishedBooksEnabled?finishedBooks:null});
     manuscriptPersonality.setVisible(illustratedRuntime?.mode==='painterly');
    }
    if(illustratedRuntime)illustratedRuntime.register(content);
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
    lampBulbMesh=glbBulb;
    lampBulbMesh.material=lampBulbMesh.material.clone();
    lampBulbMesh.material.emissive.set('#e1b05b');
    lampBulbMesh.material.emissiveIntensity=state.lampOn?.85:0;
    lampBulbMesh.material.color.set(state.lampOn?lampLitColour:lampUnlitColour);
    loosePapers.splice(0,loosePapers.length,...papers);
    paperHomes=papers.map(m=>({x:m.position.x,y:m.position.y,z:m.position.z,yaw:m.rotation.y,tilt:m.rotation.z}));
    paperStacks.splice(0,paperStacks.length,...papers);
    pullBooks.splice(0,pullBooks.length,...books);
    bookHome=books.map(book=>book.position.z);
    binPapers.splice(0,binPapers.length,...crumples);
    binPaperHomes=crumples.map(binPaperHome);
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

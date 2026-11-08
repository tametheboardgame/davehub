// DH-11C.6D.1: real 3D manila folders attached to the EXISTING drawer rigs.
// All movement is inside the same Three.js world and shares the drawer pivot.
// No flat animation frames, overlays or replacement cabinet meshes.
export const DRAWER_SLUGS=Object.freeze(['finished','drafts','oddities','fragments','field_notes']);
export const FOLDERS_PER_DRAWER=4;
export const FOLDER_LIFT=.25;
export const FOLDER_PULL=.39;
export const FOLDER_TOLERANCE=.009;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function folderTarget(home,selected){
 return {x:home.x,y:home.y+(selected?FOLDER_LIFT:0),z:home.z+(selected?FOLDER_PULL:0)};
}
export function folderSettled(position,home,selected,tolerance=FOLDER_TOLERANCE){
 const target=folderTarget(home,selected);
 return Math.max(Math.abs(position.x-target.x),Math.abs(position.y-target.y),Math.abs(position.z-target.z))<=tolerance;
}
export function mountCabinetFolders({THREE,document,catalogue}){
 if(!THREE?.Group||!document?.createElement||!catalogue?.at)
  throw Error('Real folder rig needs Three.js, a document and the public-safe archive catalogue');
 const rigs=Array.from({length:DRAWER_SLUGS.length},()=>Array(FOLDERS_PER_DRAWER).fill(null));
 const tabs=new Map();
 function inkTexture(label){
  if(tabs.has(label))return tabs.get(label);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#efddb5';ctx.fillRect(0,0,512,192);
  ctx.strokeStyle='#8d684d';ctx.lineWidth=9;ctx.strokeRect(6,6,500,180);
  for(let k=0;k<72;k++){
   const x=(k*79+label.length*31)%512,y=(k*43+19)%192;
   ctx.fillStyle=k%2?'#74534215':'#fff7de45';ctx.fillRect(x,y,k%4+2,k%3+1);
  }
  ctx.fillStyle='#352f36';ctx.font='bold 78px Georgia,serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,256,97,450);
  const tx=new THREE.CanvasTexture(canvas);
  tx.colorSpace=THREE.SRGBColorSpace;
  tx.magFilter=THREE.LinearFilter;
  tx.minFilter=THREE.LinearMipmapLinearFilter;
  tx.anisotropy=4;
  tabs.set(label,tx);return tx;
 }
 function decorate(drawer,index,mesh,record,drawerIndex){
  const originalParent=mesh.parent;
  if(!originalParent)throw Error('Unparented physical folder '+index);
  const holder=new THREE.Group();
  holder.name='cabinet_folder_rig_'+drawerIndex+'_'+index;
  holder.position.copy(mesh.position);
  // folders_<slug> and tray_<slug> have identity transforms in the
  // validated model. The parent folder group is a direct drawer child;
  // reparent only its EXISTING folder mesh, preserving its actual geometry.
  const home={x:holder.position.x,y:holder.position.y,z:holder.position.z};
  originalParent.remove(mesh);
  mesh.position.set(0,0,0);drawer.add(holder);holder.add(mesh);
  const colour=record?catalogue.DRAWERS[drawerIndex].colour:'#887f79';
  mesh.material=mesh.material.clone();
  if(mesh.material.map){mesh.material.map=null;mesh.material.needsUpdate=true;}
  mesh.material.color.set(colour);
  const coverMaterial=new THREE.MeshStandardMaterial({color:colour,roughness:.92,side:THREE.DoubleSide});
  const insertMaterial=new THREE.MeshStandardMaterial({color:'#e6d8b9',roughness:1});
  const brass=new THREE.MeshBasicMaterial({color:'#d9ad71'});
  const add=(name,size,at,material)=>{
   const object=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
   object.name=name;object.position.set(...at);
   holder.add(object);return object;
  };
  // Existing GLB folder is the structural back leaf. Thin front leaf,
  // cream insert and one physical tab are separate surfaces in 3D.
  const prefix='archive_folder_'+drawerIndex+'_'+index;
  add(prefix+'_pages',[.199,.208,.010],[0,.003,.022],insertMaterial);
  const cover=add(prefix+'_cover',[.222,.225,.010],[0,-.003,.030],coverMaterial);
  cover.rotation.y=index%2?.055:-.044;
  add(prefix+'_fold',[.225,.012,.035],[0,-.112,.017],coverMaterial);
  const tab=add(prefix+'_tab',[.113,.060,.025],[-.052+index*.032,.149,.019],
   new THREE.MeshStandardMaterial({color:record?'#eed9aa':'#b6ac99',roughness:.94}));
  const label=record?.tab||'—';
  const face=new THREE.Mesh(new THREE.PlaneGeometry(.105,.047),
   new THREE.MeshBasicMaterial({map:inkTexture(label),side:THREE.DoubleSide}));
  face.name=prefix+'_tab_ink';face.position.set(0,0,.014);tab.add(face);
  // Small distinct visible frame on each selectable folder, not a generic
  // turquoise interactive colour overriding its natural binding.
  if(record){
   const line=add(prefix+'_file_edge',[.188,.007,.005],[0,-.090,.038],brass);
   line.userData.cabinetFolderIndex=index;
  }
  holder.traverse(node=>{
   if(!node.isMesh)return;
   node.userData.cabinetFolderIndex=index;
   node.userData.cabinetDrawerIndex=drawerIndex;
  });
  rigs[drawerIndex][index]={holder,home,record};
 }
 function attach(drawers){
  if(!Array.isArray(drawers)||drawers.length!==DRAWER_SLUGS.length)
   throw Error('All five actual drawer pivots must exist before attaching folders');
  drawers.forEach((drawer,drawerIndex)=>{
   if(rigs[drawerIndex].some(Boolean))throw Error('Cannot attach a second copy of archive folders');
   for(let index=0;index<FOLDERS_PER_DRAWER;index++){
    const slug=DRAWER_SLUGS[drawerIndex];
    const mesh=drawer.getObjectByName('folder_'+slug+'_'+index);
    if(!mesh)throw Error('Missing original cabinet folder geometry '+slug+' '+index);
    decorate(drawer,index,mesh,catalogue.at(drawerIndex,index),drawerIndex);
   }
  });
 }
 let selected=null;
 function select(drawer,index){
  if(!rigs[drawer]?.[index]?.record)return false;
  selected={drawer,index};return true;
 }
 function clear(){selected=null;}
 function update(rate){
  for(const row of rigs)for(const entry of row){
   if(!entry)continue;
   const wanted=Boolean(selected&&selected.drawer===rigs.indexOf(row)&&
     selected.index===row.indexOf(entry));
   const p=folderTarget(entry.home,wanted);
   entry.holder.position.x=THREE.MathUtils.lerp(entry.holder.position.x,p.x,rate);
   entry.holder.position.y=THREE.MathUtils.lerp(entry.holder.position.y,p.y,rate);
   entry.holder.position.z=THREE.MathUtils.lerp(entry.holder.position.z,p.z,rate);
  }
 }
 function settled(drawer,index){
  const entry=rigs[drawer]?.[index];
  return !!entry&&folderSettled(entry.holder.position,entry.home,
   Boolean(selected&&selected.drawer===drawer&&selected.index===index));
 }
 return Object.freeze({attach,select,clear,update,settled,
  get selected(){return selected;},
  get attached(){return rigs.every(row=>row.every(Boolean));}});
}

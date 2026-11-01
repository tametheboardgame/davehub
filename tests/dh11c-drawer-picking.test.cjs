'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {build}=require('../scripts/build-dh11c4-cabinet-glb.cjs');
const source=fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/room.js'),'utf8');
const slugs=['finished','drafts','oddities','fragments','field_notes'];

function makeHierarchy(model) {
 const nodes=model.nodes.map(n=>({name:n.name,parent:null}));
 model.nodes.forEach((n,i)=>(n.children||[]).forEach(j=>{nodes[j].parent=nodes[i];}));
 const byName=new Map(nodes.map(n=>[n.name,n]));
 return {nodes,byName};
}
test('raycast resolves all five actual GLB drawer fronts, trays, handles and folders',async()=>{
 const {drawerIndexForMesh}=await import('../prototypes/dh-11c-room/drawer-picking.mjs');
 const {byName}=makeHierarchy(build().json);
 const drawers=slugs.map(s=>byName.get('drawer_'+s));
 for(let i=0;i<5;i++){
  const slug=slugs[i];
  for(const part of ['front_face_','brass_handle_','label_plate_','tray_floor_','tray_left_','tray_right_','folder_']){
   const name=part==='folder_'?part+slug+'_0':part+slug;
   assert.equal(drawerIndexForMesh(byName.get(name),drawers),i,name+' should target drawer '+i);
  }
  assert.equal(drawerIndexForMesh(drawers[i],drawers),i,'the drawer group itself is clickable');
 }
});
test('fixed case, rails, unrelated props and unloaded drawers never silently select Finished',async()=>{
 const {drawerIndexForMesh}=await import('../prototypes/dh-11c-room/drawer-picking.mjs');
 const {byName}=makeHierarchy(build().json);
 const drawers=slugs.map(s=>byName.get('drawer_'+s));
 for(const name of ['case_back','case_left','cabinet_case','cabinet_rails','track_left_finished','front_divider_trim_0']){
  assert.equal(drawerIndexForMesh(byName.get(name),drawers),null,name+' is not a drawer');
 }
 assert.equal(drawerIndexForMesh(null,drawers),null);
 assert.equal(drawerIndexForMesh({name:'other'},drawers),null);
 assert.equal(drawerIndexForMesh(byName.get('front_face_finished'),[]),null);
 assert.equal(drawerIndexForMesh(byName.get('front_face_finished'),[null,null,null,null,null]),null);
});
test('procedural cabinet with five tray groups uses the same drawer ancestry selection',async()=>{
 const {drawerIndexForMesh}=await import('../prototypes/dh-11c-room/drawer-picking.mjs');
 const cabinet={name:'case'},drawers=Array.from({length:5},(_,i)=>({name:'tray'+i,parent:cabinet}));
 drawers.forEach((d,i)=>{
  const face={parent:d},handle={parent:face},folder={parent:d};
  assert.equal(drawerIndexForMesh(face,drawers),i);
  assert.equal(drawerIndexForMesh(handle,drawers),i);
  assert.equal(drawerIndexForMesh(folder,drawers),i);
 });
 assert.equal(drawerIndexForMesh(cabinet,drawers),null);
});
test('canvas pointer picks named drawer, never uses hard-coded index 0',()=>{
 assert.match(source,/import \{drawerIndexForMesh\} from '\.\/drawer-picking\.mjs'/);
 assert.match(source,/const mesh=hits\[0\]\?\.object/);
 assert.match(source,/drawerIndexForMesh\(mesh,cabinetDrawers\)/);
 assert.match(source,/if\(drawerIndex===null\)return;/);
 assert.match(source,/state=plan\.next\(state,\{type:'drawer',index:drawerIndex\}\)/);
 assert.doesNotMatch(source,/if\(id==='cabinet'\)state=plan\.next\(state,\{type:'drawer',index:0\}\)/);
 assert.match(source,/if\(id==='cabinet'&&drawerIndex!==null\)/);
});

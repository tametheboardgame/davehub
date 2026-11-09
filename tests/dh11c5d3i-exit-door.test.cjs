'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const door=require('../prototypes/dh-11c-room/door-exit.js');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
const furniture=require('../prototypes/dh-11c-room/furniture-asset.js');
const preview=require('../scripts/render-dh11c5d3i-exit-door.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

test('two physical activations from whole-room view open then navigate',()=>{
 const start=plan.next(null,{type:'init'});
 assert.equal(start.focus,null);assert.equal(start.doorOpen,false);
 assert.equal(door.decision(start),'open');
 let result=door.advance(plan,start);
 assert.equal(result.action,'open');
 assert.equal(result.state.focus,'door');
 assert.equal(result.state.doorOpen,true);
 assert.equal(door.label(result.state),'Exit to DaveHub home');
 const second=door.advance(plan,result.state);
 assert.equal(second.action,'exit');
 assert.equal(second.state,result.state,'second click does not close or animate the hinge');
 assert.equal(second.state.doorOpen,true);
 assert.equal(door.HOME_PATH,'/','same-origin root, not production domain or external URL');
});
test('accessible keyboard focus uses the same open then exit contract',()=>{
 const start=plan.next(plan.next(null,{type:'init'}),{type:'focus',id:'door'});
 assert.equal(door.label(start),'Open the door');
 const opened=door.advance(plan,start);
 assert.equal(opened.action,'open');
 const exited=door.advance(plan,opened.state);
 assert.equal(exited.action,'exit');
 assert.equal(door.label(opened.state),'Exit to DaveHub home');
});
test('after returning to overview with the door open, one more door click exits',()=>{
 const opened=door.advance(plan,plan.next(null,{type:'init'})).state;
 const overview=plan.next(opened,{type:'home'});
 assert.equal(overview.focus,null);
 assert.equal(overview.doorOpen,true,'overview does not secretly close the real hinge');
 const second=door.advance(plan,overview);
 assert.equal(second.action,'exit');
 assert.equal(second.state,overview);
});
test('physical 3D doorway area only picks after opening; original door hinge stays in model',()=>{
 assert.deepEqual(door.APERTURE.centre,[0,2.21,.015]);
 assert.ok(door.APERTURE.width>1.9&&door.APERTURE.width<2.19);
 assert.ok(door.APERTURE.height>3.8&&door.APERTURE.height<4.28);
 const root={children:[],add(obj){this.children.push(obj);}};
 class PlaneGeometry{constructor(w,h){this.width=w;this.height=h;}}
 class MeshBasicMaterial{constructor(props){Object.assign(this,props);}}
 class Mesh{constructor(geo,mat){
  this.geometry=geo;this.material=mat;this.userData={};
  this.position={set(...coords){this.coords=coords;}};this.visible=true;
 }}
 const THREE={PlaneGeometry,MeshBasicMaterial,Mesh,DoubleSide:2};
 const target=door.makeTarget(THREE,root);
 assert.equal(root.children.length,1);
 assert.equal(target.visible,false);
 assert.equal(target.userData.objectId,'door');
 assert.equal(target.userData.doorExitTrigger,true);
 assert.deepEqual(target.position.coords,[0,2.21,.015]);
 assert.equal(target.material.opacity,0);
 assert.equal(target.material.depthWrite,false);
 assert.equal(target.material.side,THREE.DoubleSide);
 assert.ok(!target.userData.decorativeOnly,'the real exit aperture must be raycast-selectable');
 const leaf=furniture.nodes.find(n=>n.name==='door_leaf_hinge');
 assert.ok(leaf&&leaf.kind==='group');
 assert.ok(furniture.nodes.some(n=>n.name==='door_root'));
});
test('only opt-in V8 changes canvas and control activation; original V7 is untouched',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 const required=[
  "document.body.dataset.exitDoorProof==='true'",
  "window.DH11DoorExit.makeTarget(THREE,g)",
  "window.DH11DoorExit.makeTarget(THREE,next.get('door'))",
  "doorExitTarget.visible=!!state.doorOpen",
  "if(doorExitTarget)doorExitTarget.visible=true",
  "const result=window.DH11DoorExit.advance(plan,state)",
  "window.location.assign(window.DH11DoorExit.HOME_PATH)",
  "add(window.DH11DoorExit.label(state),activateExitDoor)",
  "else if(id==='door'&&exitDoorProof)activateExitDoor()",
  "if(id==='door'&&exitDoorProof)activateExitDoor()",
  "else if(id==='door')state=plan.next(state,{type:'door'})",
  "renderControls('door')"
 ];
 for(const marker of required)assert.ok(room.includes(marker),marker);
 assert.ok(room.includes("add(state.doorOpen?'Close the door':'Open the door'"),
  'V7 and earlier still use their unchanged door toggle');
 const old=read('scripts/render-dh11c5d3h-mystical-room.cjs');
 assert.ok(!old.includes('exit-door-proof')&&!old.includes('door-exit.js'));
});
test('V8 route retains genuine room interactions, with no public catalogue changes',()=>{
 const html=preview.render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5D.3I','data-exit-door-proof="true"',
   'door-exit.js?v=dh11c5d3i-door-home-exit-v1',
   'room.js?v=dh11c5d3i-door-home-exit-v1',
   'room-props-v7.js?v=dh11c5d3i-door-home-exit-v1',
   'data-mystical-room-proof="true"'])
  assert.ok(html.includes(marker),marker);
 for(const forbidden of ['The Last Lightkeeper','The Clock of Tomorrow'])
  assert.ok(!html.includes(forbidden));
 const state=JSON.parse(read('PROJECT_STATE.json'));
 const item=state.dh11_3d_production.illustratedViewPipeline.exitDoorCandidate;
 assert.equal(item.productionChanged,false);
 assert.equal(item.publishedWritingChanged,false);
 assert.equal(item.destination,'/');
});

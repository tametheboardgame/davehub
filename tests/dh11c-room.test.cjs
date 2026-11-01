'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const folder=path.resolve(__dirname,'../prototypes/dh-11c-room');
const read=file=>fs.readFileSync(path.join(folder,file),'utf8');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
test('one scene uses physically consistent world coordinates and seven unique locations',()=>{
 assert.equal(plan.validate(),true);
 assert.equal(plan.OBJECTS.length,7);
 assert.equal(new Set(plan.OBJECTS.map(x=>x.id)).size,7);
 assert.deepEqual(plan.OBJECTS.map(x=>x.id),['desk','cabinet','bookcase','typewriter','bin','door','window']);
 for(const item of plan.OBJECTS){
  assert.equal(item.position.length,3);
  assert.equal(item.camera.length,3);
  assert.ok(plan.find(item.id));
 }
 assert.equal(plan.find('outside'),null);
});
test('cabinet camera on a 14-inch laptop keeps the top visible and crops the base instead',()=>{
 const cabinet=plan.find('cabinet');
 assert.deepEqual(cabinet.camera,[-3.6,2.65,1.25]);
 const camera=cabinet.camera,target=cabinet.lookAt;
 const sub=(a,b)=>a.map((v,i)=>v-b[i]);
 const normal=a=>a.map(v=>v/Math.hypot(...a));
 const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const forward=normal(sub(target,camera));
 const right=normal(cross(forward,[0,1,0]));
 const up=cross(right,forward);
 const projectY=(point,height)=> {
  const delta=sub(point,camera);
  const depth=dot(delta,forward);
  assert.ok(depth>0);
  return height/2-height/(2*Math.tan(51*Math.PI/360))*dot(delta,up)/depth;
 };
 // Cabinet height 3.66m, width 1.92m and depth approximately 1.2m,
 // using the actual GLB/greybox cabinet placement (-4.7,0,-3.25).
 const corners=(y)=>[-5.7,-3.7].flatMap(x=>[-3.95,-2.65].map(z=>[x,y,z]));
 for(const height of [768,824]){
  const highest=Math.min(...corners(3.66).map(p=>projectY(p,height)));
  const lowest=Math.max(...corners(0).map(p=>projectY(p,height)));
  // Fullscreen 14-inch browser header occupies roughly the top 80px.
  assert.ok(highest>height*0.10, 'cabinet top must remain below header on '+height+'px screen: '+highest);
  assert.ok(lowest>height+20, 'prefer slight base crop rather than chopping the top: '+lowest);
  assert.ok(lowest<height+height*.18, 'avoid cropping excessive cabinet height: '+lowest);
 }
 assert.equal(plan.find('cabinet').lookAt[1],2.30);
});
test('room interactions update only approved mechanical state, no publication data',()=>{
 let state=plan.next(null,{type:'init'});
 assert.equal(state.focus,null);
 assert.equal(plan.next(state,{type:'drawer',index:0}).drawer,null);
 state=plan.next(state,{type:'focus',id:'cabinet'});
 state=plan.next(state,{type:'drawer',index:2});
 assert.equal(state.drawer,2);
 state=plan.next(state,{type:'drawer',index:2});
 assert.equal(state.drawer,null);
 assert.equal(plan.next(state,{type:'drawer',index:10}).drawer,null);
 const before=plan.next(state,{type:'focus',id:'unapproved'});
 assert.equal(before.focus,'cabinet');
 state=plan.next(state,{type:'focus',id:'desk'});
 assert.equal(plan.next(state,{type:'paper',index:0}).papers[0],true);
 assert.deepEqual(plan.next(state,{type:'paper'}),state,'unnamed desk clicks must not move papers');
 assert.equal(plan.next(state,{type:'drawer',index:0}).drawer,null);
 assert.equal(plan.next(state,{type:'home'}).focus,null);
});
test('book/typewriter/door actions remain bounded and tied to focus state',()=>{
 let state=plan.next(null,{type:'init'});
 state=plan.next(state,{type:'focus',id:'bookcase'});
 for(let i=0;i<10;i++)state=plan.next(state,{type:'book'});
 assert.equal(state.book,2);
 state=plan.next(state,{type:'focus',id:'typewriter'});
 for(let i=0;i<100;i++)state=plan.next(state,{type:'type'});
 assert.equal(state.typed,60);
 state=plan.next(state,{type:'focus',id:'door'});
 assert.equal(plan.next(state,{type:'door'}).doorOpen,true);
});
test('3D prototype uses pinned self-hosted Three.js with licence and no unapproved catalogue',()=>{
 const html=read('index.html'),script=read('room.js'),css=read('room.css'),vendor=read('vendor/three-r159.module.min.js');
 const license=read('vendor/THREE-LICENSE.txt');
 for(const marker of ['id="room-canvas"','id="object-list"','id="interaction-tray"','data-focus="desk"','data-focus="cabinet"','data-focus="window"','/worlds/writing/','noindex,nofollow'])assert.ok(html.includes(marker),marker);
 for(const marker of ["from './vendor/three-r159.module.min.js'","new THREE.WebGLRenderer","new THREE.Raycaster","new THREE.PerspectiveCamera","new THREE.Scene","const cabinetDrawers=[]","doorLeaf.rotation.y","state=plan.next","requestAnimationFrame","prefers-reduced-motion"])assert.ok(script.includes(marker),marker);
 assert.ok(vendor.includes('THREE')||vendor.includes('WebGLRenderer'));
 assert.ok(license.includes('MIT License'));
 assert.match(css,/@media\(max-width:760px\)/);
 assert.doesNotMatch(html+script+css,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour|private_source|source_repo_data/);
 assert.doesNotMatch(html+script+css,/https?:\/\/(?:unpkg|cdn|esm\.sh|jsdelivr)/);
});
test('Three.js room module syntax is valid in Node 22, and no canvas source is generated by AI',()=>{
 const result=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:read('room.js'),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const vendor=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:read('vendor/three-r159.module.min.js'),encoding:'utf8'});
 assert.equal(vendor.status,0,vendor.stderr.slice(0,400));
});

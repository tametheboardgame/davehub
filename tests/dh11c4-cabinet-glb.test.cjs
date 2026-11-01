'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const {build,decode,SLUGS,SLOT_Y}=require('../scripts/build-dh11c4-cabinet-glb.cjs');
const {render}=require('../scripts/render-dh11c4-glb-proof.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../'+p),'utf8');
const {output,json}=build();
const map=new Map(json.nodes.map((n,i)=>[n.name,{...n,id:i}]));
test('deterministic parseable glTF 2.0 binary with physically consistent topology',()=>{
 assert.ok(output.length>2000&&output.length<120000);
 assert.deepEqual(build().output,output,'same geometry source must produce byte-identical GLB');
 assert.deepEqual(decode(output),json);
 assert.equal(json.asset.version,'2.0');
 assert.equal(json.scene,0);
 assert.equal(json.buffers[0].byteLength,840);
 assert.equal(json.accessors[0].count,24);
 assert.equal(json.accessors[3].count,36);
 assert.equal(json.extras.movementAxis,'+Z');
 assert.equal(json.extras.units,'metres');
 assert.equal(json.extras.drawerTravelMetres,.76);
 assert.equal(json.nodes[0].name,'cabinet_root');
 assert.equal(json.nodes[0].mesh,undefined);
 assert.equal(json.meshes.length,json.materials.length);
});
test('hollow case uses a back, real sidewalls, top and bottom but NO filled cabinet volume',()=>{
 assert.ok(map.has('cabinet_case')&&map.has('cabinet_rails'));
 for(const part of ['case_back','case_left','case_right','case_top','case_bottom'])assert.ok(map.has(part));
 assert.ok(!map.has('case_solid')&&!map.has('cabinet_solid'));
 const caseRoot=map.get('cabinet_case');
 const solids=caseRoot.children.map(i=>json.nodes[i]);
 // A full solid .>1m deep, >3m tall and >1m wide would block the drawers.
 assert.ok(solids.every(n=>!n.scale||!(n.scale[0]>1&&n.scale[1]>3&&n.scale[2]>1)));
 assert.equal(SLUGS.length,5);
 assert.deepEqual(SLOT_Y,[3.18,2.565,1.95,1.335,.72]);
});
test('five separately named drawer rigs share one local travel axis and have tray walls, floor, handles and folders',()=>{
 for(const [i,slug] of SLUGS.entries()){
  const slot=map.get('cabinet_slot_'+slug);
  const drawer=map.get('drawer_'+slug);
  assert.ok(slot&&drawer,'missing slot/drawer for '+slug);
  assert.deepEqual(drawer.translation,[0,SLOT_Y[i],.51]);
  assert.ok(map.has('drawer_front_'+slug)&&map.has('tray_'+slug)&&map.has('folders_'+slug));
  assert.ok(map.has('tray_floor_'+slug)&&map.has('tray_left_'+slug)&&map.has('tray_right_'+slug)&&map.has('tray_rear_'+slug));
  assert.ok(map.has('track_left_'+slug)&&map.has('track_right_'+slug));
  assert.ok(map.has('label_plate_'+slug)&&map.has('brass_handle_'+slug));
  for(let n=0;n<4;n++)assert.ok(map.has('folder_'+slug+'_'+n));
  const end=drawer.translation[2]+json.extras.drawerTravelMetres;
  assert.ok(end>drawer.translation[2]&&end<2);
  // An actual separate transform node, not just a static front facade.
  assert.ok(drawer.children?.length>=3);
 }
});
test('reuses original room page and vendor-pinned Three.js loader with zero generated image states',()=>{
 const original=read('prototypes/dh-11c-room/index.html'),html=render(original);
 assert.match(html,/DH-11C\.4A/);
 assert.match(html,/data-glb-proof="true"/);
 assert.match(html,/\.\.\/room\/room\.js/);
 assert.match(html,/id="glb-extension"/);
 assert.match(html,/data-glb-snap="50"/);
 assert.doesNotMatch(original,/data-glb-proof="true"/);
 assert.match(read('prototypes/dh-11c-room/room.js'),/import\('\.\/vendor\/GLTFLoader-r159\.js'\)/);
 assert.match(read('prototypes/dh-11c-room/room.js'),/getObjectByName\('drawer_'/);
 const loader=read('prototypes/dh-11c-room/vendor/GLTFLoader-r159.js');
 const util=read('prototypes/dh-11c-room/vendor/BufferGeometryUtils-r159.js');
 assert.match(loader,/from '\.\/three-r159\.module\.min\.js'/);
 assert.match(loader,/from '\.\/BufferGeometryUtils-r159\.js'/);
 assert.match(util,/from '\.\/three-r159\.module\.min\.js'/);
 assert.doesNotMatch(html,/The Last Lightkeeper|The Clock of Tomorrow/);
});
test('generator, renderer, runtime module and pinned loader pass JS syntax checks',()=>{
 for(const p of ['scripts/build-dh11c4-cabinet-glb.cjs','scripts/render-dh11c4-glb-proof.cjs']){
  const r=cp.spawnSync(process.execPath,['--check',path.resolve(__dirname,'../'+p)],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
 }
 for(const p of ['prototypes/dh-11c-room/room.js','prototypes/dh-11c-room/vendor/GLTFLoader-r159.js','prototypes/dh-11c-room/vendor/BufferGeometryUtils-r159.js']){
  const r=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:read(p),encoding:'utf8'});
  assert.equal(r.status,0,p+': '+r.stderr.slice(0,600));
 }
});

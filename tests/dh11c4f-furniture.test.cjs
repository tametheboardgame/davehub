'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const manifest=require('../prototypes/dh-11c-room/furniture-asset.js');
const {build}=require('../scripts/build-dh11c4f-furniture-glb.cjs');
const {check}=require('../scripts/validate-dh11c4f-furniture.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../'+p),'utf8');
test('six interactive roots and unique moving pivots match original room structure',()=>{
 assert.equal(manifest.interactiveRoots.length,6);
 assert.ok(manifest.nodes.length>170);
 assert.equal(new Set(manifest.nodes.map(n=>n.name)).size,manifest.nodes.length);
 for(const name of ['desk_root','bookcase_root','typewriter_root','bin_root','door_root','window_root',
  'door_leaf_hinge','typewriter_key_1_4','window_island_0','window_island_1','window_island_2',
  'desk_paper_00','book_0_00','bin_paper_0'])assert.ok(manifest.nodes.some(n=>n.name===name),name);
 const door=manifest.nodes.find(n=>n.name==='door_leaf_hinge');
 assert.equal(door.parent,'door_root');
 assert.deepEqual(door.position,[-1.12,0,0]);
 assert.deepEqual(manifest.nodes.find(n=>n.name==='desk_root').position,[-.3,0,.6]);
 assert.deepEqual(manifest.nodes.find(n=>n.name==='bookcase_root').position,[4.7,0,-3.85]);
});
test('real deterministic glTF triangles, UVs, separate meshes and strict transform validation',()=>{
 const a=build(),b=build();
 assert.deepEqual(a.glb,b.glb);
 assert.equal(a.glb.readUInt32LE(0),0x46546c67);
 assert.equal(a.glb.readUInt32LE(4),2);
 assert.equal(a.glb.readUInt32LE(8),a.glb.length);
 assert.equal(a.json.nodes.length,manifest.nodes.length);
 assert.ok(a.json.meshes.length>20);
 assert.ok(a.json.meshes.some(m=>m.name.startsWith('geo_cylinder')));
 assert.ok(a.json.meshes.some(m=>m.name.startsWith('geo_icosa')));
 assert.ok(a.json.meshes.some(m=>m.name.startsWith('geo_sphere')));
 assert.equal(check(a.glb,b.glb).maxDrift,0);
 const corrupt=Buffer.from(a.glb);corrupt[0]=0;
 assert.throws(()=>check(corrupt,a.glb),/Invalid glTF/);
});
test('independent Blender pipeline imports, exports and preserves native scene master',()=>{
 const py=read('scripts/blender/dh11c_furniture.py');
 for(const term of ['bpy.ops.import_scene.gltf','bpy.ops.wm.save_as_mainfile','bpy.ops.export_scene.gltf',
  'door_leaf_hinge','typewriter_key_1_4','window_island_0','export_yup=True'])assert.ok(py.includes(term),term);
 const wf=read('.github/workflows/dh11c4f-blender-furniture.yml');
 for(const term of ['blender --background','python3-numpy','furniture-source.glb','furniture-blender.glb',
  'manuscript-furniture.blend','validate-dh11c4f-furniture.cjs','actions/upload-artifact@v4'])
  assert.ok(wf.includes(term),term);
 assert.match(wf,/contents: read/);
});
test('all furniture scripts are valid JavaScript and no generated image assets are used',()=>{
 for(const file of ['prototypes/dh-11c-room/furniture-asset.js','scripts/build-dh11c4f-furniture-glb.cjs',
 'scripts/validate-dh11c4f-furniture.cjs']){
  const run=cp.spawnSync(process.execPath,['--check',path.resolve(__dirname,'../'+file)],{encoding:'utf8'});
  assert.equal(run.status,0,file+': '+run.stderr);
 }
 const source=read('prototypes/dh-11c-room/furniture-asset.js');
 assert.doesNotMatch(source,/\.png|\.jpg|\.jpeg|image\/|billboard|sprite/i);
});


test('full furniture preview opens on whole-room camera while cabinet-only proof retains its close-up',()=>{
 const {render}=require('../scripts/render-dh11c4f-furniture.cjs');
 const source=read('prototypes/dh-11c-room/index.html');
 const html=render(source);
 const room=read('prototypes/dh-11c-room/room.js');
 const plan=require('../prototypes/dh-11c-room/room-plan.js');
 assert.match(html,/data-furniture-model-proof="true"/,'complete furniture preview must opt into full-scene mode');
 assert.ok(html.includes('../room/room.js?v=dh11c4j-bin-v1'),'fresh bookcase module URL must defeat old browser caches');
 assert.match(html,/name="davehub-furniture-release" content="dh11c4j-bin-v1"/,'preview includes visible-build identity in markup');
 assert.match(html,/data-glb-proof="true"/,'cabinet GLB remains part of the scene');
 assert.match(room,/camera\.position\.set\(\.\.\.plan\.HOME\.position\)/);
 assert.match(room,/const desiredTarget=focusPoint\.clone\(\)/);
 assert.deepEqual(plan.next(null,{type:'init'}).focus,null);
 const cabinetLoad=room.slice(room.indexOf('const slugs=[\'finished\''),room.indexOf('// DH-11C.4F: the normal room'));
 assert.ok(cabinetLoad.includes("if(!furnitureModelProof)focus('cabinet');"),
  'loading the cabinet must not autofocus it in full furniture mode');
 assert.doesNotMatch(cabinetLoad,/^\s*focus\('cabinet'\);/m,
  'cabinet model load may not directly override the whole-room camera');
 const fullFurnitureLoad=room.slice(room.indexOf('if(furnitureModelProof){'));
 assert.doesNotMatch(fullFurnitureLoad,/focus\('cabinet'\)/,
  'six-furniture GLB swap cannot force a cabinet close-up');
});

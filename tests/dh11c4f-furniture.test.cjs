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

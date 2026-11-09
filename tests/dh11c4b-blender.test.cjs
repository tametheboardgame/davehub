'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {build}=require('../scripts/build-dh11c4-cabinet-glb.cjs');
const {check,glbJson,hierarchy}=require('../scripts/validate-dh11c4b-blender.cjs');
const text=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const model=build().output;

test('the input geometry validates against itself before Blender export',()=>{
 const r=check(model,model);
 assert.equal(r.drawers,5);
 assert.equal(r.axis,'local +Z');
 assert.ok(r.nodes>100&&r.meshes>5);
 assert.equal(r.maxDriftMetres,0);
});
test('genuine binary parsing and world-axis checks detect corruption',()=>{
 const invalid=Buffer.from(model);invalid[0]=0;
 assert.throws(()=>glbJson(invalid),/Invalid glTF/);
 const json=glbJson(model),h=hierarchy(json);
 assert.equal(h.ancestor('drawer_finished','cabinet_root'),true);
 assert.equal(h.ancestor('folders_finished','drawer_finished'),true);
 assert.equal(h.ancestor('case_back','drawer_finished'),false);
 const damaged=Buffer.from(model),name='drawer_finished',offset=damaged.indexOf(name);
 assert.ok(offset>20);
 damaged.write('drawer_brokenxx',offset,'utf8');
 assert.throws(()=>check(model,damaged),/lost node|missing|Missing|node/i);
});
test('editable Blender source imports the authoritative model and writes a source master plus re-export',()=>{
 const source=text('scripts/blender/dh11c_cabinet_roundtrip.py');
 const flow=text('.github/workflows/dh11c4b-blender-asset.yml');
 for(const term of ['bpy.ops.import_scene.gltf','bpy.ops.wm.save_as_mainfile','bpy.ops.export_scene.gltf',
   'validate_import()','"METRIC"','"GLB"','--input','--blend','--output','--report'])
  assert.ok(source.includes(term),term);
 for(const term of ['ubuntu-24.04','apt-get install -y -qq blender','source-cabinet.glb',
  'manuscript-cabinet.blend','cabinet-blender.glb','model-report.json',
  'validate-dh11c4b-blender.cjs','actions/upload-artifact@v4','retention-days: 30'])
  assert.ok(flow.includes(term),term);
 assert.match(flow,/contents: read/);
 assert.doesNotMatch(flow,/contents: write/);
 assert.doesNotMatch(source,/bpy\.ops\.mesh\.primitive_cube_add/);
});
test('editable pipeline does not claim owner style approval or alter public Writing world',()=>{
 const source=text('scripts/blender/dh11c_cabinet_roundtrip.py');
 assert.match(source,/ADR-0012/);
 assert.match(source,/visual approval pending/);
 assert.doesNotMatch(source,/davehub\.co\.uk|content\/public\/catalogue/);
});

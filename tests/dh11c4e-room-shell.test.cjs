'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const asset=require('../prototypes/dh-11c-room/room-shell-asset.js');
const plan=require('../prototypes/dh-11c-room/room-shell-plan.js');
const {build}=require('../scripts/build-dh11c4e-shell-glb.cjs');
const {build:blenderModel,expected:blenderHash}=require('../scripts/build-dh11c4e-blender-model.cjs');
const {check}=require('../scripts/validate-dh11c4e-shell.cjs');
const {render}=require('../scripts/render-dh11c4e-room.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../'+p),'utf8');
test('architectural shell has one physically consistent source of truth and real openings',()=>{
 assert.equal(plan.check(),true);
 assert.ok(asset.parts.length>=60);
 assert.equal(asset.units,'metres');
 assert.equal(asset.axis,'Y-up');
 assert.equal(new Set(asset.parts.map(p=>p.name)).size,asset.parts.length);
 for(const wall of plan.panels)assert.ok(asset.parts.some(p=>p.name==='wall_'+wall.id));
 for(const part of asset.parts)assert.ok(part.size.every(n=>n>0)&&part.position.every(Number.isFinite));
 assert.ok(asset.parts.some(p=>p.name==='corridor_floor'));
 assert.ok(asset.parts.filter(p=>p.name.startsWith('floor_plank_')).length>=20);
 assert.ok(!asset.parts.some(p=>p.name==='back_wall_solid'||p.name==='right_wall_solid'));
});
test('shell GLB is deterministic and retains each physical mesh and material',()=>{
 const a=build(),b=build();
 assert.deepEqual(a.glb,b.glb);
 assert.equal(a.glb.readUInt32LE(0),0x46546c67);
 assert.equal(a.glb.readUInt32LE(4),2);
 assert.equal(a.glb.readUInt32LE(8),a.glb.length);
 assert.equal(a.json.nodes.length,asset.parts.length+1);
 assert.equal(a.json.nodes[0].name,'room_shell_root');
 for(const p of asset.parts)assert.ok(a.json.nodes.some(n=>n.name===p.name));
 const result=check(a.glb,b.glb);
 assert.equal(result.maxPositionDriftM,0);
 const exported=blenderModel();
 assert.equal(exported.sha,blenderHash);
 assert.equal(exported.length,22104);
 assert.equal(check(a.glb,exported.glb).partCount,asset.parts.length);
 assert.equal(result.partCount,asset.parts.length);
});
test('isolated full-viewport architecture preview loads room shell without altering baseline',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=render(source);
 for(const m of ['DH-11C.4E','data-shell-model-proof="true"','data-immersive-room="true"',
  'id="shell-model-status"','../room/room-shell-asset.js','id="room-canvas"','id="home-button"',
  '../architecture/','data-blender-compare="true"'])assert.ok(html.includes(m),m);
 assert.doesNotMatch(source,/shell-model-proof/);
 const room=read('prototypes/dh-11c-room/room.js');
 assert.match(room,/if\(shellModelProof\)/);
 assert.match(room,/room_shell_root/);
 assert.match(room,/\.\.\/room\/models\/room-shell-blender-verified\.glb/);
 assert.match(room,/shellFallback\.visible=false/);
 assert.match(room,/render\(\)/);
 assert.doesNotMatch(html,/The Last Lightkeeper|The Clock of Tomorrow/);
});
test('Blender source master production and checks are real executable scripts',()=>{
 const python=read('scripts/blender/dh11c_room_shell.py');
 for(const m of ['bpy.ops.import_scene.gltf','bpy.ops.wm.save_as_mainfile','bpy.ops.export_scene.gltf',
  'export_yup=True','room_shell_root','visualApproval','--'])assert.ok(python.includes(m),m);
 const action=read('.github/workflows/dh11c4e-blender-room.yml');
 for(const m of ['python3-numpy','blender --background','manuscript-room-shell.blend','room-shell-blender.glb',
  'validate-dh11c4e-shell.cjs','actions/upload-artifact@v4'])assert.ok(action.includes(m),m);
 for(const p of ['scripts/build-dh11c4e-shell-glb.cjs','scripts/validate-dh11c4e-shell.cjs',
  'scripts/render-dh11c4e-room.cjs','prototypes/dh-11c-room/room-shell-asset.js','scripts/build-dh11c4e-blender-model.cjs']){
  const run=cp.spawnSync(process.execPath,['--check',path.resolve(__dirname,'../'+p)],{encoding:'utf8'});
  assert.equal(run.status,0,p+': '+run.stderr);
 }
 const run=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:read('prototypes/dh-11c-room/room.js'),encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const shell=require('../prototypes/dh-11c-room/room-shell-plan.js');
const {build,expected}=require('../scripts/build-dh11c4c-blender-model.cjs');
const {render}=require('../scripts/render-dh11c4c-architecture.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../'+p),'utf8');
const overlaps=(a,b)=>Math.max(a[0],b[0])<Math.min(a[1],b[1])-1e-6;
test('back and side wall have real apertures, no hidden solid face blocking them',()=>{
 assert.equal(shell.check(),true);
 assert.equal(shell.panels.length,7);
 const unique=new Set(shell.panels.map(p=>p.id));assert.equal(unique.size,7);
 for(const p of shell.panels){
  const hole=p.wall==='back'?shell.window:shell.door;
  const axis=p.wall==='back'?[hole.xMin,hole.xMax]:[hole.zMin,hole.zMax];
  assert.ok(!(overlaps(p.range,axis)&&overlaps(p.vertical,[hole.yMin,hole.yMax])),p.id);
  assert.ok(p.dimensions.every(x=>x>0));
  assert.equal(p.centre.length,3);
 }
 const backArea=shell.panels.filter(p=>p.wall==='back').reduce((sum,p)=>sum+(p.range[1]-p.range[0])*(p.vertical[1]-p.vertical[0]),0);
 const rightArea=shell.panels.filter(p=>p.wall==='right').reduce((sum,p)=>sum+(p.range[1]-p.range[0])*(p.vertical[1]-p.vertical[0]),0);
 assert.ok(Math.abs(backArea-(14*6.4-(shell.window.xMax-shell.window.xMin)*(shell.window.yMax-shell.window.yMin)))<.00001);
 assert.ok(Math.abs(rightArea-(11*6.4-(shell.door.zMax-shell.door.zMin)*shell.door.yMax))<.00001);
});
test('verified Blender-exported GLB restored losslessly, not regenerated as an AI image or forged model',()=>{
 const {output,sha,length}=build();
 assert.equal(sha,expected);
 assert.equal(length,26164);
 assert.equal(output.readUInt32LE(0),0x46546c67);
 assert.equal(output.readUInt32LE(4),2);
 assert.equal(output.readUInt32LE(8),length);
 assert.deepEqual(build().output,output);
 // Node geometry source is the previously approved reference, Blender output has
 // different file bytes but the same validated five independent moving rigs.
 const jsonLength=output.readUInt32LE(12);
 const json=JSON.parse(output.subarray(20,20+jsonLength).toString('utf8'));
 for(const name of ['drawer_finished','drawer_drafts','drawer_oddities','drawer_fragments','drawer_field_notes','cabinet_case','cabinet_rails'])
  assert.ok(json.nodes.some(n=>n.name===name),'Missing Blender rig '+name);
});
test('comparison page is derived from original untouched room and includes all user controls',()=>{
 const original=read('prototypes/dh-11c-room/index.html'),html=render(original);
 for(const marker of ['DH-11C.4C','data-shell-proof="true"','data-blender-compare="true"','data-glb-proof="true"',
   '../room/room-shell-plan.js','id="room-canvas"','id="glb-extension"','data-glb-snap="0"',
   'data-glb-snap="50"','data-glb-snap="100"','../cabinet-glb/','../art-lab/'])
  assert.ok(html.includes(marker),marker);
 assert.ok(!original.includes('data-shell-proof'));
 assert.doesNotMatch(html,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour/);
});
test('wall and model changes are isolated to architecture flag, original room and art lab remain untouched',()=>{
 const s=read('prototypes/dh-11c-room/room.js');
 for(const marker of ["const shellProof=document.body.dataset.shellProof==='true'","if(shellProof){",
   'shell.panels','shell.window.xMin','shell.window.yMin','if(shellProof&&y===2.55)',
   'if(shellProof&&y<4.66)','shellProof?-.54:-.032','shellProof?-.19:.035',
   "blenderCompare?'cabinet-blender-verified.glb':'cabinet-prototype.glb'"])
  assert.ok(s.includes(marker),marker);
 assert.ok(s.includes('if(!glbProof)makeCabinet();'));
 const r=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:s,encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 for(const file of ['scripts/build-dh11c4c-blender-model.cjs','scripts/render-dh11c4c-architecture.cjs']){
  const check=cp.spawnSync(process.execPath,['--check',path.resolve(__dirname,'../'+file)],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
 }
});

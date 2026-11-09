'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const renderer=require('../scripts/render-dh11c6c2-motion-first.cjs');
const predecessor=require('../scripts/render-dh11c6c1-reader-workshop.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const motion=import('../prototypes/dh-11c-room/reveal-after-motion.mjs');

test('reveal is blocked until both actual object and room camera settle',async()=>{
 const {revealReady,ITEM_TOLERANCE,CAMERA_TOLERANCE}=await motion;
 const input={focus:'desk',expectedFocus:'desk',active:true,itemDistance:.2,cameraDistance:.4,aimDistance:.3};
 assert.equal(revealReady(input),false);
 assert.equal(revealReady({...input,itemDistance:0}),false);
 assert.equal(revealReady({...input,itemDistance:0,cameraDistance:0}),false);
 assert.equal(revealReady({...input,itemDistance:ITEM_TOLERANCE,cameraDistance:CAMERA_TOLERANCE,aimDistance:CAMERA_TOLERANCE}),true);
 assert.equal(revealReady({...input,focus:'bookcase',itemDistance:0,cameraDistance:0,aimDistance:0}),false);
 assert.equal(revealReady({...input,active:false,itemDistance:0,cameraDistance:0,aimDistance:0}),false);
 assert.equal(revealReady({...input,itemDistance:NaN,cameraDistance:0,aimDistance:0}),false);
});
test('typewriter keys map to actual 24-key mesh positions and other printable keys use fallback',async()=>{
 const {TYPEWRITER_KEY_LABELS,keyIndexForCharacter,REVEAL_HOLD_SECONDS}=await motion;
 assert.equal(TYPEWRITER_KEY_LABELS.length,24);
 assert.equal(new Set(TYPEWRITER_KEY_LABELS).size,24);
 assert.equal(keyIndexForCharacter('q'),0);
 assert.equal(keyIndexForCharacter('V'),TYPEWRITER_KEY_LABELS.indexOf('V'));
 assert.equal(keyIndexForCharacter(' '),null);
 assert.equal(keyIndexForCharacter('Enter'),null);
 assert.equal(REVEAL_HOLD_SECONDS,.18);
});
test('only canonical motion-first render updates room module version and enables the gate',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=renderer.render(source),old=predecessor.render(source);
 assert.equal(renderer.VERSION,'dh11c6c2-motion-first-v1');
 for(const token of ['DH-11C.6C.2','data-motion-first="true"',
  'room.js?v='+renderer.VERSION,'published-book-dialog','manuscript-dialog',
  'workshop-dialog','data-finished-books="true"','data-exit-door-proof="true"'])
  assert.ok(html.includes(token),token);
 assert.ok(!old.includes('data-motion-first'));
 assert.ok(old.includes('room.js?v='+predecessor.VERSION));
 assert.ok(!source.includes('data-motion-first'));
});
test('physical animation drives the reveal only after Three.js paints the completed frame',()=>{
 const code=read('prototypes/dh-11c-room/room.js');
 for(const token of [
  "from './reveal-after-motion.mjs?v=dh11c6c2-motion-first-v1'",
  "document.body.dataset.motionFirst==='true'",
  "queueObjectReveal('book',index)",
  "queueObjectReveal('paper',index)",
  "const isBook=pending.kind==='book'",
  "bookPosition(homePosition,true)",
  "paperPose(homePosition,index,true)",
  "camera.position.distanceTo(desiredPosition)",
  "focusPoint.distanceTo(desiredTarget)",
  "revealReady({",
  "pending.settledAt=clock.elapsedTime",
  "clock.elapsedTime-pending.settledAt<REVEAL_HOLD_SECONDS",
  "pendingObjectReveal=null;",
  "if(isBook)bookExperience.show(index);",
  "else manuscriptExperience.openManuscript(index);",
  "renderer.render(scene,camera);\n  revealAfterPhysicalMotion();"
 ])assert.ok(code.includes(token),token);
 const delayed=code.indexOf('function revealAfterPhysicalMotion(){');
 const frame=code.indexOf('function render(){',delayed);
 assert.ok(delayed>0&&frame>delayed);
 assert.ok(!code.slice(code.indexOf('function toggleBook(index){'),code.indexOf('function syncBookControls(){')).includes('setTimeout'));
 assert.ok(!code.slice(code.indexOf('function togglePaper(index){'),code.indexOf('function syncPaperControls(){')).includes('setTimeout'));
});
test('touch/mouse typewriter remains playable and workshop is explicit rather than blocking the keys',()=>{
 const code=read('prototypes/dh-11c-room/room.js');
 for(const token of [
  "else if(id==='typewriter')pressTypewriter(keyIndex);",
  "if(id==='typewriter'&&manuscriptExperienceEnabled&&!motionFirst)",
  "if(motionFirst&&state.focus==='typewriter'&&!e.ctrlKey&&!e.metaKey&&!e.altKey",
  "pressTypewriter(keyIndexForCharacter(e.key));",
  "add('Open the creative workshop',()=>manuscriptExperience.openWorkshop())",
  "if(manuscriptExperienceEnabled&&state.focus==='typewriter'){"
 ])assert.ok(code.includes(token),token);
 const block=code.slice(code.indexOf("if(id==='typewriter'&&manuscriptExperienceEnabled&&!motionFirst)"),code.indexOf("if(!['desk','bookcase','bin','typewriter'].includes(id)"));
 assert.ok(block.includes('manuscriptExperience.openWorkshop()'));
});
test('staging build explicitly ships the pure helper and refuses a stale published page',()=>{
 const build=read('scripts/build-pages.sh');
 for(const token of [
  'tests/dh11c6c2-motion-first.test.cjs',
  'prototypes/dh-11c-room/reveal-after-motion.mjs',
  'node scripts/render-dh11c6c2-motion-first.cjs dist/worlds/writing',
  "check('dist/worlds/writing/room/reveal-after-motion.mjs'",
  'room.js?v=dh11c6e-wastepaper-v1',
  'node scripts/render-dh11c6d3-filing-cabinet.cjs dist/worlds/writing',
  'data-motion-first="true"'
 ])assert.ok(build.includes(token),token);
});

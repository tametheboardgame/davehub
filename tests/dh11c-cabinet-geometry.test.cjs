'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'../prototypes/dh-11c-cabinet');
const math=require('../prototypes/dh-11c-cabinet/cabinet-math.js');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
test('five fixed drawer positions fit the same cabinet coordinate system',()=>{
  assert.equal(math.validateGeometry(),true);
  assert.equal(math.drawers.length,5);
  assert.deepEqual(math.drawers.map(x=>x.name),['Finished','Drafts','Oddities','Fragments','Field Notes']);
  assert.equal(math.geometry.width,400);
  assert.equal(math.geometry.depth,180);
  assert.ok(math.geometry.drawerDepth<=math.geometry.depth);
  const tops=math.drawers.map(x=>x.top);
  assert.deepEqual(tops,[53,166,279,392,505]);
  for(let i=1;i<tops.length;i++)assert.ok(tops[i]>=tops[i-1]+math.geometry.drawerHeight);
});
test('drawer motion is one clamped local Z translation, never per-drawer image perspective',()=>{
  const a=math.initial();
  const open=math.reduce(a,{type:'toggle',id:'drafts'});
  assert.equal(open.selected,'drafts');
  assert.equal(open.amount,1);
  assert.equal(math.travelFor(open,'drafts'),148);
  assert.equal(math.travelFor(open,'finished'),0);
  const scrub=math.reduce(open,{type:'scrub',id:'drafts',amount:.5});
  assert.equal(math.travelFor(scrub,'drafts'),74);
  assert.equal(math.reduce(scrub,{type:'scrub',id:'drafts',amount:9}).amount,1);
  assert.equal(math.reduce(scrub,{type:'scrub',id:'drafts',amount:-9}).amount,0);
});
test('selecting another drawer closes the previous one and Escape can close the selection',()=>{
  const first=math.reduce(math.initial(),{type:'toggle',id:'finished'});
  const second=math.reduce(first,{type:'toggle',id:'oddities'});
  assert.equal(math.travelFor(second,'finished'),0);
  assert.equal(math.travelFor(second,'oddities'),148);
  assert.equal(math.reduce(second,{type:'close'}).selected,null);
  assert.equal(math.reduce(first,{type:'toggle',id:'finished'}).amount,0);
  assert.deepEqual(math.reduce(second,{type:'reset'}),math.initial());
  assert.deepEqual(math.reduce(first,{type:'toggle',id:'nonexistent'}),first);
});
test('single camera yaw and pitch are bounded regardless of which drawer moves',()=>{
  const original=math.initial();
  assert.equal(original.yaw,-18);
  const changed=math.reduce(original,{type:'camera',yaw:100,pitch:-100});
  assert.deepEqual([changed.yaw,changed.pitch],[32,-20]);
  assert.equal(changed.selected,null);
  const opened=math.reduce(changed,{type:'toggle',id:'finished'});
  assert.equal(opened.yaw,changed.yaw);
  assert.equal(opened.pitch,changed.pitch);
});
test('prototype ships static CSS 3D geometry and no fictional/public catalogue content',()=>{
 const html=read('index.html'),css=read('cabinet.css'),js=read('cabinet.js');
 for(const marker of ['DH-11C.1','id="cabinet-model"','id="cabinet-slots"','id="travel-slider"','id="yaw-slider"','id="pitch-slider"','id="status"','<noscript>'])assert.ok(html.includes(marker),marker);
 for(const marker of ['transform-style:preserve-3d','perspective:1200px','.drawer-left','.drawer-right','.drawer-bottom','.drawer-back','translateZ(calc(18px + var(--travel,0px)))','prefers-reduced-motion'])assert.ok(css.includes(marker),marker);
 for(const marker of ['data-drawer','aria-expanded','aria-pressed','data-scrubbing','state=model.reduce','Escape'])assert.ok(js.includes(marker),marker);
 assert.doesNotMatch(html+css+js,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour|ownerApproved|private_source/);
 assert.doesNotMatch(html+css+js,/https?:\/\/(?:cdn|unpkg|jsdelivr)/);
});

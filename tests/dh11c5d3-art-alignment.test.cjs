'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const {render}=require('../scripts/render-dh11c5d3-overview.cjs');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
const views=require('../prototypes/dh-11c-room/view-pipeline.js');

test('5D.3A preview compares approved high-illustration target with actual locked 3D scene',()=>{
 const html=render();
 for(const marker of [
  'DH-11C.5D.3A','data-overview-studio="true"',
  '../illustrated-views/?v=dh11c5d-geometry-guides-v1',
  '/assets/worlds/writing/manuscript-room-v1.avif',
  'id="projection-map"','id="new-art-file"','id="restore-art"',
  'id="art-status"','aria-pressed="true"','data-overview-studio',
  'view-pipeline.js?v=dh11c5d-geometry-guides-v1',
  'room-plan.js?v=dh11c5d-geometry-guides-v1',
  'Art direction review, not a replacement for the 3D room.',
  'no artwork is saved or uploaded','geometry-registered'
 ])assert.ok(html.toLowerCase().includes(marker.toLowerCase()),'Missing alignment marker: '+marker);
 assert.ok(!html.includes('data-illustration-mode'),'must not substitute the shader experiment for a plate');
 assert.ok(!html.includes('data-room-target='),'no fake static image hotspots');
 assert.ok(!html.includes('The Last Lightkeeper'));
});
test('5D.3A projected anchors derive strictly from canonical HOME 3D plan',()=>{
 const data=views.contract(plan),home=data.views.find(x=>x.id==='home');
 assert.equal(data.views.length,8);assert.equal(home.targets.desktop.anchors.length,7);
 const expected=['desk','cabinet','bookcase','typewriter','bin','door','window'];
 assert.deepEqual(home.targets.desktop.anchors.map(a=>a.id),expected);
 assert.deepEqual(home.position,plan.HOME.position);
 const js=read('prototypes/dh-11c-room/overview-studio.js');
 for(const marker of ['projection.contract(plan)','home.targets.desktop.anchors',
  'plan.find(anchor.id)','marker.style.left=anchor.x',
  'marker.style.top=anchor.y','marker.setAttribute(\'aria-hidden\',\'true\')',
  'map.dataset.guides=String(show)'])assert.ok(js.includes(marker),'Missing anchored projection '+marker);
});
test('5D.3A any trial artwork is local-only; real 3D geometry stays authoritative',()=>{
 const js=read('prototypes/dh-11c-room/overview-studio.js');
 for(const marker of ['URL.createObjectURL(candidate)','URL.revokeObjectURL(objectUrl)',
  'candidate.size>20*1024*1024','no upload, no 3D interaction changes','image.src=original',
  "file.addEventListener('change'"])assert.ok(js.includes(marker),'Missing local-only protection: '+marker);
 for(const forbidden of ['fetch(','XMLHttpRequest','localStorage','sessionStorage','new THREE.Mesh','raycaster','postMessage(']){
  assert.ok(!js.includes(forbidden),'No candidate image must alter/submit real 3D geometry: '+forbidden);
 }
 const css=read('prototypes/dh-11c-room/overview-studio.css');
 assert.ok(css.includes('@media(max-width:1050px)'));
 assert.ok(css.includes('focus-visible'));
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source='prototypes/dh-12a-listening-room/';
const mechanics=import(pathToFileURL(path.join(root,source,'theatre-mechanics.mjs')).href);
test('three physical theatre mechanisms are deterministic and reversible',async()=>{
 const m=await mechanics;
 assert.equal(m.CURTAIN_CLOSED_X,1.64);
 assert.equal(m.curtainX('left',false),-1.64);
 assert.equal(m.curtainX('right',false),1.64);
 assert.equal(m.curtainX('left',true),-m.CURTAIN_OPEN_X);
 assert.equal(m.curtainX('right',true),m.CURTAIN_OPEN_X);
 assert.throws(()=>m.curtainX('up',true),/Unknown curtain/);
 const initial=m.theatreState();
 assert.deepEqual(initial,{curtainsOpen:false,stageSteps:0,recordPlaying:false});
 const open=m.theatreState(initial,{type:'curtains'});
 assert.equal(open.curtainsOpen,true);
 assert.equal(m.theatreState(open,{type:'curtains'}).curtainsOpen,false);
 const playing=m.theatreState(open,{type:'record'});
 assert.equal(playing.recordPlaying,true);
 assert.equal(m.theatreState(playing,{type:'record'}).recordPlaying,false);
 assert.deepEqual(m.theatreState(playing,{type:'reset'}),initial);
});
test('three doors of the revolving stage face visitors one by one in one actual coordinate system',async()=>{
 const m=await mechanics;
 assert.deepEqual(m.STAGE_ACTS,['Songs','Shows','Characters']);
 assert.equal(m.actIndex(0),0);
 assert.equal(m.actIndex(1),1);
 assert.equal(m.actIndex(2),2);
 assert.equal(m.actIndex(3),0);
 assert.equal(m.actIndex(-1),2);
 assert.equal(m.stageAngle(0),0);
 assert.equal(m.stageAngle(1),-m.STAGE_STEP);
 assert.equal(m.stageAngle(3),-2*Math.PI);
 for(let index=0;index<3;index++){
  const angle=index*m.STAGE_STEP;
  assert.ok(Math.abs(Math.sin(angle+m.stageAngle(index)))<1e-10);
  assert.ok(Math.abs(Math.cos(angle+m.stageAngle(index))-1)<1e-10);
 }
});
test('record and tonearm are mechanically separate and no music is synthesized',async()=>{
 const m=await mechanics;
 assert.equal(m.recordAdvance(1,false,5),1);
 assert.ok(m.recordAdvance(1,true,.03)>1);
 assert.equal(m.tonearmAngle(true),m.TONEARM_PLAY);
 assert.equal(m.tonearmAngle(false),m.TONEARM_REST);
 assert.ok(m.smoothTowards(0,4,.03)>0);
 assert.ok(m.smoothTowards(0,4,.03)<4);
 assert.equal(m.smoothTowards(8,4,0),8);
 assert.throws(()=>m.smoothTowards(Infinity,0,.1),/Non-finite/);
});
test('3D theatre uses a shared camera, actual curtain mesh and physical pivots',()=>{
 const js=read(source+'theatre.mjs');
 for(const marker of [
  "import * as THREE from './vendor/three-r159.module.min.js'",
  'new THREE.WebGLRenderer({canvas,antialias:true,alpha:false})',
  'new THREE.PerspectiveCamera(43,1,.1,140)',
  'new THREE.BufferGeometry()','geo.computeVertexNormals()',
  'makeCurtain(\'left\')','makeCurtain(\'right\')',
  "const revolve=new THREE.Group()",
  'revolve.rotation.y=smoothTowards(',
  "const record=new THREE.Group()",
  "const tonearm=new THREE.Group()",
  'record.rotation.y=recordAngle',
  'tonearm.rotation.y=smoothTowards(',
  'raycaster.intersectObjects(hitTargets,false)',
  'canvas.addEventListener(\'pointerup\'',
  "window.addEventListener('resize',resize)"
 ])assert.ok(js.includes(marker),marker);
 assert.ok(!/new Audio\s*\(|\.play\s*\(|<audio/i.test(js),'no unapproved audio playback');
 assert.ok(!/\.png|\.jpg|\.webp|data:image\/|image\/svg/i.test(js),'not replacing physical stage with image frames');
});
test('concept-only preview stays public-safe, discoverable and keyboard accessible',()=>{
 const html=read(source+'index.html');
 for(const token of [
  'data-dh12a-theatre="true"','noindex,nofollow',
  'DH-12A.3','The Impossible Theatre',
  'id="theatre-curtains"','id="theatre-stage"','id="theatre-record"',
  'id="theatre-reset"','id="theatre-status"','id="theatre-overview"','role="status"',
  'A musicals-only stage prototype. These miniature sets are fictional studies, not published productions.',
  'theatre.mjs?v=dh12a3-living-sets-v1',
  'href="/previews/dh-12b/music-foyer/"'
 ])assert.ok(html.includes(token),token);
 assert.ok(!/<audio|<iframe|autoplay|https?:\/\//i.test(html),'no external audio or embedded third-party material');
 const css=read(source+'theatre.css');
 for(const marker of ['.theatre-shell','.theatre-controls',
  'max-height:min(65vh,565px)',
  '@media(max-width:700px)',
  '@media(prefers-reduced-motion:reduce)',
  ':focus-visible'])
  assert.ok(css.includes(marker),marker);
});
test('canonical Music route remains unchanged; prototype deploys only under previews',()=>{
 const build=read('scripts/build-pages.sh');
 for(const token of [
  'tests/dh12a-theatre.test.cjs',
  'dist/previews/dh-12a/listening-room',
  'prototypes/dh-12a-listening-room/',
  'node --check prototypes/dh-12a-listening-room/theatre.mjs',
  'node --check prototypes/dh-12a-listening-room/theatre-camera.mjs',
  'dist/previews/dh-12a/listening-room/vendor/'
 ])assert.ok(build.includes(token),token);
 assert.ok(!build.includes('node scripts/render-dh12a-music-live'),'must not replace Music without approval');
 const smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const token of ['/previews/dh-12a/listening-room/',
  '/previews/dh-12a/listening-room/theatre.mjs',
  '/previews/dh-12a/listening-room/theatre.css',
  '/previews/dh-12a/listening-room/vendor/three-r159.module.min.js'])
  assert.ok(smoke.includes(token),token);
});

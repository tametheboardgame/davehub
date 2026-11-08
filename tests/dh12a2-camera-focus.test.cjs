'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source='prototypes/dh-12a-listening-room/';
const camera=import(pathToFileURL(path.join(root,source,'theatre-camera.mjs')).href);
const distance=pose=>Math.hypot(...pose.position.map((v,i)=>v-pose.target[i]));
const gap=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
test('every physical mechanism has a distinct, closer camera pose and one unchanged overview',async()=>{
 const m=await camera;
 assert.deepEqual(m.CAMERA_MODES,['overview','curtains','act','record']);
 assert.deepEqual(m.cameraPose(null,16/9,800),{
  mode:'overview',position:[8,6,12.5],target:[0,2.06,-.15]
 });
 const home=m.cameraPose('overview');
 assert.deepEqual(m.cameraPose('unknown'),home,'invalid scene selection cannot leave camera in arbitrary state');
 assert.equal(m.normalizeFocus('curtains'),'curtains');
 assert.equal(m.normalizeFocus('act'),'act');
 assert.equal(m.normalizeFocus('record'),'record');
 assert.equal(m.normalizeFocus(''),null);
 const poses=['curtains','act','record'].map(mode=>m.cameraPose(mode,16/9,850));
 for(const pose of poses){
  assert.equal(pose.position.length,3);
  assert.equal(pose.target.length,3);
  assert.ok(distance(pose)<distance(home),'selecting '+pose.mode+' actually zooms in');
  assert.ok(gap(pose.position,home.position)>2,'selecting '+pose.mode+' travels, not just relabels');
  assert.ok(pose.position.every(Number.isFinite));
  assert.ok(pose.target.every(Number.isFinite));
 }
 assert.ok(gap(poses[0].position,poses[1].position)>2);
 assert.ok(gap(poses[1].position,poses[2].position)>2);
 assert.equal(m.focusStatus('record'),'Record player · close-up view');
 assert.equal(m.focusStatus(null),'Whole theatre · overview');
});
test('narrow phone screens back camera away enough to frame each whole physical mechanism',async()=>{
 const m=await camera;
 const aspect=.44;
 const width={overview:10.5,curtains:7.4,act:5.9,record:1.85};
 for(const name of m.CAMERA_MODES){
  const desktop=m.cameraPose(name,16/9,900);
  const mobile=m.cameraPose(name,aspect,900);
  assert.ok(distance(mobile)>distance(desktop),'mobile '+name+' should not crop object');
  const visibleWidth=distance(mobile)*2*Math.tan(43*Math.PI/360)*aspect;
  assert.ok(visibleWidth>=width[name],name+' must fit in horizontal view');
  assert.ok(mobile.target[1]<desktop.target[1],name+' floats above mobile bottom control tray');
  assert.equal(mobile.mode,name);
 }
 const shorter=m.cameraPose('act',1.3,500);
 const standard=m.cameraPose('act',1.3,800);
 assert.ok(distance(shorter)>distance(standard),'short laptop viewport retains framing');
 assert.ok(m.cameraPose('act',0,0).position.every(Number.isFinite));
});
test('single smooth moving camera follows selected actual 3D object while retaining its physical animation',()=>{
 const js=read(source+'theatre.mjs');
 for(const marker of [
  "import {cameraPose,focusStatus,normalizeFocus} from './theatre-camera.mjs?v=dh12a2-camera-focus-v1'",
  'const desiredPosition=camera.position.clone()',
  'const desiredAim=aim.clone()',
  'function updateCameraDestination()',
  'function inspectObject(id)',
  'function viewWholeTheatre()',
  'function selectMechanism(id)',
  'cameraFocus=focus',
  'cameraFocus=null',
  'camera.position[axis]=smoothTowards(',
  'aim[axis]=smoothTowards(',
  'camera.lookAt(aim)',
  'const cameraSpeed=reducedMotion?.matches?1000:2.75',
  "openCurtains.addEventListener('click',()=>selectMechanism('curtains'))",
  "turnStage.addEventListener('click',()=>selectMechanism('act'))",
  "playRecord.addEventListener('click',()=>selectMechanism('record'))",
  "overviewButton.addEventListener('click',viewWholeTheatre)",
  "if(picked)selectMechanism(picked)",
  "else if(cameraFocus)viewWholeTheatre()",
  "if(event.key!=='Escape'||!cameraFocus)return",
  "updateCameraDestination();"
 ])assert.ok(js.includes(marker),marker);
 for(const preserved of [
  'curtains.left.position.x=smoothTowards(',
  'curtains.right.position.x=smoothTowards(',
  'revolve.rotation.y=smoothTowards(',
  'tonearm.rotation.y=smoothTowards(',
  'record.rotation.y=recordAngle',
  "raycaster.intersectObjects(hitTargets,false)",
  "registerClick(curtains.left,'curtains')",
  "registerClick(curtains.right,'curtains')",
  "registerClick(revolve,'act')",
  "registerClick(deck,'record')"
 ])assert.ok(js.includes(preserved),preserved);
 assert.ok(!js.includes('window.location.assign'),'close-up should never navigate away');
 assert.ok(!/new Audio\s*\(|\.play\s*\(|<audio/i.test(js),'no copyright-sensitive playback');
});
test('close-up view controls are keyboard accessible and do not cover mobile scene',()=>{
 const html=read(source+'index.html'),css=read(source+'theatre.css');
 for(const marker of [
  'data-theatre-camera="motion-first"',
  'id="theatre-view" hidden',
  'id="theatre-overview" type="button"',
  'aria-label="Return to the whole theatre view"',
  'id="theatre-focus-name"',
  'Escape or Whole theatre returns to the overview',
  'theatre.mjs?v=dh12a3-living-sets-v1',
  'theatre.css?v=dh12a3-living-sets-v1',
  '<meta name="davehub-theatre-stage" content="DH-12A.3">'
 ])assert.ok(html.includes(marker),marker);
 for(const marker of [
  'body[data-theatre-camera="motion-first"] .theatre-view',
  'body[data-theatre-camera="motion-first"] .theatre-view[hidden]{display:none}',
  'body[data-theatre-focus] .theatre-hint',
  'bottom:calc(min(46svh,400px) + 16px)',
  '@media(max-width:700px)',
  '@media(prefers-reduced-motion:reduce)'
 ])assert.ok(css.includes(marker),marker);
 assert.ok(!html.includes('autoplay'));
});
test('staging build and Cloudflare smoke version and verify the separate camera module',()=>{
 const build=read('scripts/build-pages.sh');
 const smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const marker of [
  'tests/dh12a2-camera-focus.test.cjs',
  'prototypes/dh-12a-listening-room/theatre-camera.mjs',
  'node --check prototypes/dh-12a-listening-room/theatre-camera.mjs',
  "check('dist/previews/dh-12a/listening-room/theatre-camera.mjs'",
  'DH-12A.2'
 ])assert.ok(build.includes(marker),marker);
 for(const marker of [
  'DH-12A.2',
  'dh12a2-camera-focus-v1',
  '/previews/dh-12a/listening-room/theatre-camera.mjs',
  '/previews/dh-12a/listening-room/theatre.mjs',
  '/previews/dh-12a/listening-room/'
 ])assert.ok(smoke.includes(marker),marker);
 const old=read('scripts/render-dh11c6e1-visible-uncrumple.cjs');
 assert.ok(old.includes('dh11c6e1-uncrumple-v1'),'Writing Room remains independent');
});

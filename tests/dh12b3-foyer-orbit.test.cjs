'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const dir='prototypes/dh-12b-music-world/';
const math=import(pathToFileURL(path.join(root,dir,'foyer-orbit.mjs')).href);
const distance=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
test('real spherical orbit is 360-degree rotatable around the same physical island',async()=>{
 const m=await math;
 const home=m.initialOrbit();
 assert.deepEqual(home,{yaw:0,pitch:0,zoom:1});
 const base=[0,7.3,15.7],target=[0,2.22,-2.15];
 const zero=m.orbitPose(base,target,home);
 assert.ok(distance(zero.position,base)<1e-10);
 assert.deepEqual(zero.target,target);
 const radius=distance(base,target);
 const quarter=m.orbitPose(base,target,{yaw:Math.PI/2,pitch:0,zoom:1});
 assert.ok(Math.abs(distance(quarter.position,target)-radius)<1e-10);
 assert.ok(quarter.position[0]>17,'orbit rotates camera around the island, not the island mesh');
 assert.ok(Math.abs(quarter.position[2]-target[2])<1e-10);
 const full=m.orbitPose(base,target,{yaw:Math.PI*2,pitch:0,zoom:1});
 assert.ok(distance(full.position,base)<1e-10,'full circle returns to original view');
 const dragged=m.dragOrbit(home,-100,30);
 assert.ok(dragged.yaw>0&&dragged.pitch>0);
 assert.deepEqual(home,m.initialOrbit(),'source state remains immutable');
});
test('wheel zoom, two-finger pinch and pitch remain bounded in very narrow displays',async()=>{
 const m=await math;
 let state=m.initialOrbit();
 for(let i=0;i<100;i++)state=m.zoomOrbit(state,-200);
 assert.equal(state.zoom,m.ORBIT_LIMITS.zoomMin,'zoom never crosses near bound');
 for(let i=0;i<100;i++)state=m.zoomOrbit(state,200);
 assert.equal(state.zoom,m.ORBIT_LIMITS.zoomMax,'zoom never crosses far bound');
 const enlarged=m.zoomPinch(m.initialOrbit(),200,400);
 assert.ok(enlarged.zoom<1,'fingers moving apart zoom in');
 const smaller=m.zoomPinch(m.initialOrbit(),400,200);
 assert.ok(smaller.zoom>1,'pinching inward zooms out');
 assert.deepEqual(m.zoomPinch(m.initialOrbit(),0,10),m.initialOrbit());
 const [base,target]=[[0,10,23],[0,1.6,-2.75]];
 const upper=m.orbitPose(base,target,{yaw:0,pitch:100,zoom:.01},
  {minRadius:10,maxRadius:32});
 const lower=m.orbitPose(base,target,{yaw:0,pitch:-100,zoom:100},
  {minRadius:10,maxRadius:32});
 assert.ok(upper.pitch<=m.ORBIT_LIMITS.pitchMax);
 assert.ok(lower.pitch>=m.ORBIT_LIMITS.pitchMin);
 assert.equal(upper.radius,10);
 assert.equal(lower.radius,32);
 assert.throws(()=>m.orbitPose([0,0,0],[0,0,0]),/target/);
 assert.throws(()=>m.orbitPose([NaN,1,1],[0,0,0]),/valid physical/);
});
test('pointer maths distinguishes a click from mouse dragging and two-finger movement',async()=>{
 const m=await math;
 assert.equal(m.dragDistance({x:0,y:0},{x:3,y:4}),5);
 assert.equal(m.dragDistance(null,{x:0,y:0}),Infinity);
 assert.equal(m.pointerSeparation({x:10,y:0},{x:10,y:20}),20);
 assert.equal(m.pointerSeparation(null,{x:0,y:0}),0);
 assert.deepEqual(m.dragOrbit(m.initialOrbit(),Infinity,0),m.initialOrbit());
 assert.deepEqual(m.zoomOrbit(m.initialOrbit(),NaN),m.initialOrbit());
});
test('the Music foyer retains its familiar topbar but has minimal overlay chrome',()=>{
 const html=read(dir+'foyer.html');
 for(const marker of [
  'DH-12B.5','data-foyer-orbit="true"','data-foyer-minimal="true"',
  'music-foyer__topbar','music-foyer__brand',
  '/assets/branding/davehub-logo-faithful.svg',
  '<h1>The World Between Notes</h1>',
  'href="/"','music-foyer__world-id',
  'id="music-orbit-hint"','id="music-orbit-reset"',
  'tabindex="0" aria-describedby="music-orbit-hint"',
  'id="portal-theatre"','id="portal-records"',
  'id="music-portal-overview"',
  'music-foyer__portal-nav',
  'foyer.mjs?v=dh12b5-clean-journey-v1',
  'music-world.css?v=dh12b5-clean-journey-v1','noindex,nofollow'
 ])assert.ok(html.includes(marker),marker);
 for(const removed of [
  'music-sign-theatre','music-sign-records',
  'music-foyer__floating-signs','music-foyer__choices',
  'music-choice__heading','music-foyer__invitation',
  'music-foyer__footnote'
 ])assert.ok(!html.includes(removed),'removed duplicated scene UI: '+removed);
 const css=read(dir+'music-world.css');
 for(const marker of [
  'body[data-foyer-orbit="true"] .music-foyer__topbar',
  'body[data-foyer-minimal="true"] .music-foyer__portal-nav',
  'body[data-foyer-minimal="true"] .music-foyer__portal-link',
  'body[data-foyer-minimal="true"] .music-foyer__help',
  'body[data-foyer-minimal="true"] .music-foyer__sr-only',
  '@media(max-width:690px)'
 ])assert.ok(css.includes(marker),marker);
});
test('mouse, touch, pinch, keyboard and wheel continue orbiting the actual 3D camera',()=>{
 const code=read(dir+'foyer.mjs');
 for(const marker of [
  "from './foyer-orbit.mjs?v=dh12b3-orbit-portals-v1'",
  'orbitPose(xyz,point,orbit,',
  'camera.position[axis]=approach(',
  'aim[axis]=approach(',
  'const pointers=new Map()',
  "canvas.addEventListener('pointerdown'",
  "canvas.addEventListener('pointermove'",
  "canvas.addEventListener('pointerup'",
  "canvas.addEventListener('pointercancel'",
  "canvas.addEventListener('wheel'",
  '{passive:false}',
  'pointerSeparation(',
  'zoomPinch(orbit,lastPinch,separation)',
  'dragDistance(',
  'gestureDragged',
  'const shouldActivate=!gestureDragged&&!multiTouch',
  "if(keys[e.key])",
  "['+','=','Add'].includes(e.key)",
  "if(e.key==='Home')",
  "orbitReset.addEventListener('click',resetOrbit)",
  'if(selected)return;'
 ])assert.ok(code.includes(marker),marker);
 assert.ok(code.includes("if(id)choose(id)"),'model clicks still select actual 3D portals');
 assert.ok(code.includes('shouldAutoEnter({selected,entering,doorsDone,cameraDone})'),
  'fully settled doors and camera automatically trigger navigation');
 assert.ok(!code.includes('positionPortalSigns()'),'no camera-projected HTML sign cards');
});
test('theatre and record shop keep different physical doorway details and one legible sign each',()=>{
 const code=read(dir+'foyer.mjs');
 for(const marker of [
  'makeFoyerMaterials(THREE)',
  'makePortalSignTexture(THREE,kind)',
  'sign(def.id,2.66)',
  'portal-carved-marquee-','marquee-gilt-underline-',
  'stage-velvet-fluted-panel-','stage-footlight-',
  'mini-comedy-tragedy-face-','carved-mask-eye-',
  'real-shop-door-vinyl-','shop-door-record-groove-',
  'mini-hanging-sleeve-',
  "def.id+'-'+side+'-hinge'",
  "def.id+'-'+side+'-door-leaf'",
  'mark(hinge,def.id)','mark(display,def.id)',
  'doorAngle(opened,side)'
 ])assert.ok(code.includes(marker),marker);
 const art=read(dir+'dimensional-art.mjs');
 assert.ok(art.includes('living-theatre-velvet-banner-'));
 assert.ok(art.includes('interdimensional-vinyl-crown'));
 assert.ok(art.includes('living-portal-veil-'));
});
test('build and Cloudflare checks preserve the orbit source and add detailed portal texture assets',()=>{
 const build=read('scripts/build-pages.sh');
 const smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const marker of [
  'tests/dh12b3-foyer-orbit.test.cjs',
  'tests/dh12b5-foyer-journey.test.cjs',
  'prototypes/dh-12b-music-world/foyer-orbit.mjs',
  'prototypes/dh-12b-music-world/foyer-surfaces.mjs',
  'node --check prototypes/dh-12b-music-world/foyer-orbit.mjs',
  'node --check prototypes/dh-12b-music-world/foyer-surfaces.mjs',
  "check('dist/previews/dh-12b/music-foyer/foyer-orbit.mjs'",
  "check('dist/previews/dh-12b/music-foyer/foyer-surfaces.mjs'",
  'DH-12B.5'
 ])assert.ok(build.includes(marker),marker);
 for(const marker of [
  'DH-12B.5','dh12b5-clean-journey-v1',
  '/previews/dh-12b/music-foyer/foyer-orbit.mjs',
  '/previews/dh-12b/music-foyer/foyer-surfaces.mjs',
  '/previews/dh-12b/record-shop/'
 ])assert.ok(smoke.includes(marker),marker);
 const shop=read(dir+'record-shop.html');
 assert.ok(shop.includes('DH-12B.2'),'Record Shop remains its own space');
 const theatre=read('prototypes/dh-12a-listening-room/index.html');
 assert.ok(theatre.includes('DH-12A.3'),'theatre scene is unchanged');
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const base=path.resolve(__dirname,'..'),dir='prototypes/dh-12b-music-world/';
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const portal=import(pathToFileURL(path.join(base,dir,'music-portals.mjs')).href);
const surfaces=import(pathToFileURL(path.join(base,dir,'foyer-surfaces.mjs')).href);

test('one selection enters the correct destination only after real door and camera movement',async()=>{
 const m=await portal;
 const state={selected:'theatre',entering:false};
 assert.equal(m.shouldAutoEnter({...state,doorsDone:true,cameraDone:true}),true);
 assert.equal(m.shouldAutoEnter({...state,doorsDone:false,cameraDone:true}),false);
 assert.equal(m.shouldAutoEnter({...state,doorsDone:true,cameraDone:false}),false);
 assert.equal(m.shouldAutoEnter({...state,doorsDone:false,cameraDone:false}),false);
 assert.equal(m.shouldAutoEnter({...state,entering:true,doorsDone:true,cameraDone:true}),false);
 assert.equal(m.shouldAutoEnter({...state,selected:null,doorsDone:true,cameraDone:true}),false);
 assert.equal(m.shouldAutoEnter({...state,selected:'unknown',doorsDone:true,cameraDone:true}),false);
 assert.equal(m.shouldAutoEnter({...state,doorsDone:1,cameraDone:true}),false);
 assert.equal(m.shouldAutoEnter({...state,doorsDone:true,cameraDone:1}),false);
 for(const id of ['theatre','records']){
  assert.equal(m.shouldAutoEnter({selected:id,entering:false,doorsDone:true,cameraDone:true}),true);
  assert.equal(m.isLocalMusicRoute(m.doorFor(id).route),true);
 }
});
test('the real frame loop navigates once automatically, without a second Enter click',()=>{
 const src=read(dir+'foyer.mjs');
 assert.ok(src.includes('function choose(id)'));
 assert.ok(src.includes('selected=id;orbit=initialOrbit();targetCamera();updateUI();'));
 assert.ok(src.includes('function enterSelectedWorld()'));
 assert.ok(src.includes('if(entering||!selected)return;'));
 assert.ok(src.includes('entering=true;updateUI();'));
 assert.ok(src.includes('window.location.assign(door.route)'));
 assert.ok(src.includes('if(shouldAutoEnter({selected,entering,doorsDone,cameraDone}))enterSelectedWorld();'));
 assert.ok(src.indexOf('if(shouldAutoEnter({selected,entering,doorsDone,cameraDone}))enterSelectedWorld();')>
  src.indexOf('const doorsDone='));
 assert.ok(src.includes('if(!renderer)enterSelectedWorld()'),
  'accessible fallback does not strand visitors when WebGL is unavailable');
 assert.ok(src.includes("if(e.key==='Escape'&&selected)"));
 assert.ok(src.includes("overview.addEventListener('click',returnToCrossroads)"));
 assert.ok(src.includes('if(entering)return;'),'cancel cannot interfere after navigation has started');
 assert.ok(src.includes("window.addEventListener('pageshow',event=>"));
 assert.ok(!src.includes("if(selected===id&&ready)"),'do not require second click');
 assert.ok(!src.includes("ready?'Enter"),'do not advertise a separate Enter stage');
 assert.ok(!src.includes('positionPortalSigns()'),'no floating HTML sign layer');
});
test('foyer has no large fixed cards, repeated signs, introduction or footnote over the scene',()=>{
 const html=read(dir+'foyer.html');
 for(const required of [
  'data-foyer-minimal="true"','DH-12B.5','music-foyer__topbar',
  '<details class="music-foyer__help">','<summary','id="music-orbit-reset"',
  '<nav class="music-foyer__portal-nav"',
  'id="portal-theatre"','id="portal-records"',
  'aria-label="Open The Impossible Theatre and enter automatically"',
  'aria-label="Open The Record Shop and enter automatically"',
  'id="music-portal-overview"','← Cancel journey',
  'class="music-foyer__sr-only" role="status"',
  'noindex,nofollow'
 ])assert.ok(html.includes(required),required);
 for(const gone of [
  'music-foyer__floating-signs','id="music-sign-theatre"',
  'id="music-sign-records"','music-foyer__choices',
  'music-choice__heading','music-foyer__invitation','music-foyer__footnote',
  'Productions, stories, characters and worlds waiting beyond the curtain.',
  'A peculiar shop for singles, records, bands and other musical projects.'
 ])assert.ok(!html.includes(gone),'unnecessary text removed: '+gone);
 const css=read(dir+'music-world.css');
 assert.ok(css.includes('body[data-foyer-minimal="true"] .music-foyer__portal-nav'));
 assert.ok(css.includes('body[data-foyer-minimal="true"] .music-foyer__sr-only'));
 assert.ok(css.includes('body[data-foyer-minimal="true"] .music-foyer__help'));
 assert.ok(css.includes('body[data-foyer-minimal="true"] .music-foyer__portal-link'));
});
test('rich textures vary with location, material and hand-drawn relief',async()=>{
 const m=await surfaces;
 assert.deepEqual(m.SURFACE_TYPES,[
  'stone','gold','dark','velvet','wood','enamel','cream','patina'
 ]);
 for(const kind of m.SURFACE_TYPES){
  assert.ok(Number.isFinite(m.grainValue(kind,71,38)));
  assert.notEqual(m.grainValue(kind,71,38),m.grainValue(kind,172,67));
 }
 assert.notEqual(m.grainValue('stone',64,42),m.grainValue('wood',64,42));
 // Test the actual baked material data without depending on WebGL or browsers.
 let sample=null;
 const mockCtx={
  createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
  putImageData:img=>{sample=img;},
  beginPath(){},moveTo(){},lineTo(){},stroke(){},bezierCurveTo(){},
  set lineCap(value){},set lineWidth(value){},set strokeStyle(value){}
 };
 const documentMock={createElement:tag=>{
  assert.equal(tag,'canvas');
  return {width:0,height:0,getContext:()=>mockCtx};
 }};
 const c=m.makeSurfaceCanvas('stone',documentMock);
 assert.equal(c.width,512);assert.equal(c.height,512);
 assert.equal(sample.data.length,512*512*4);
 const luminance=new Set();
 for(let i=0;i<sample.data.length;i+=4*113)luminance.add(sample.data[i]);
 assert.ok(luminance.size>15,'stone must have real pigment and bump variation');
 assert.throws(()=>m.makeSurfaceCanvas('fake',documentMock),/Unknown Music foyer surface/);
});
test('both in-world marquees remain readable and distinct, with no floating duplicate',async()=>{
 const m=await surfaces;
 function mockCanvas(){
  const logs=[];
  const ctx={
   createLinearGradient:()=>({addColorStop(){}}),
   fillRect(){},strokeRect(){},fillText:(text)=>logs.push(text),
   beginPath(){},arc(){},fill(){},stroke(){},
   set fillStyle(_){},set strokeStyle(_){},set lineWidth(_){},
   set textBaseline(_){},set textAlign(_){},set shadowColor(_){},
   set shadowBlur(_){},set shadowOffsetY(_){},set font(_){}
  };
  return {canvas:{width:0,height:0,getContext:()=>ctx},logs};
 }
 const canvases=[];
 const documentMock={createElement:tag=>{
  assert.equal(tag,'canvas');
  const {canvas,logs}=mockCanvas();canvases.push(logs);return canvas;
 }};
 const ThreeMock={
  CanvasTexture:class {constructor(canvas){this.image=canvas;}repeat={set(){}};},
  SRGBColorSpace:'srgb',
  RepeatWrapping:'repeat'
 };
 const theatre=m.makePortalSignTexture(ThreeMock,'theatre',documentMock);
 const records=m.makePortalSignTexture(ThreeMock,'records',documentMock);
 assert.equal(theatre.image.width,1536);
 assert.equal(records.image.height,350);
 assert.deepEqual(canvases.map(c=>c[0]),['THEATRE','RECORD SHOP']);
 assert.throws(()=>m.makePortalSignTexture(ThreeMock,'bad',documentMock),/physical portal sign/);
 const js=read(dir+'foyer.mjs');
 assert.ok(js.includes('makePortalSignTexture(THREE,kind)'));
 assert.ok(js.includes('const display=sign(def.id,2.66);'));
 assert.ok(js.includes('mark(display,def.id)'));
 assert.ok(!js.includes('music-sign-theatre'));
 assert.ok(!js.includes('signs.theatre.addEventListener'));
});
test('staging build packages the real textured foyer and keeps Record Shop and Theatre separate',()=>{
 const build=read('scripts/build-pages.sh');
 const smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const marker of [
  'tests/dh12b5-foyer-journey.test.cjs',
  'prototypes/dh-12b-music-world/foyer-surfaces.mjs',
  'node --check prototypes/dh-12b-music-world/foyer-surfaces.mjs',
  "check('dist/previews/dh-12b/music-foyer/foyer-surfaces.mjs'",
  'DH-12B.5'
 ])assert.ok(build.includes(marker),marker);
 for(const marker of [
  '/previews/dh-12b/music-foyer/foyer-surfaces.mjs',
  'dh12b5-clean-journey-v1','data-foyer-minimal="true"',
  'shouldAutoEnter({selected,entering,doorsDone,cameraDone})'
 ])assert.ok(smoke.includes(marker),marker);
 assert.ok(read(dir+'record-shop.html').includes('DH-12B.2'));
 assert.ok(read('prototypes/dh-12a-listening-room/index.html').includes('DH-12A.3'));
 assert.ok(read(dir+'foyer.html').includes('href="/"'));
});

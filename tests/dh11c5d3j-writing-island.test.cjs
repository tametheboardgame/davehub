'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {render,ROUTE,BASE,VERSION,MARKER}=require('../scripts/render-dh11c5d3j-writing-world.cjs');
const {render:renderV8}=require('../scripts/render-dh11c5d3i-exit-door.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const source=read('prototypes/dh-11c-room/index.html');

test('Writing island points straight to canonical 3D room route without a landing page',()=>{
 const home=read('index.html'),main=read('main.js');
 assert.match(home,/class="island island--writing" href="\/worlds\/writing\/"/);
 assert.ok(main.includes("'writing'"));
 const html=render(source);
 assert.equal(ROUTE,'/worlds/writing/');
 assert.equal(BASE,'/worlds/writing/scene/');
 assert.equal(MARKER,'DH-11C.5D.3J');
 assert.ok(html.includes('data-writing-world="true"'));
 assert.ok(html.includes('<base href="/worlds/writing/scene/">'));
 assert.ok(html.includes('<meta name="davehub-writing-world" content="DH-11C.5D.3J">'));
 assert.ok(html.includes('<title>The Manuscript Hoard | DaveHub</title>'));
 assert.ok(!html.includes('data-scene="manuscript-hoard"'), 'legacy static scene is retired from the actual Writing URL');
 assert.ok(!html.includes('room-stage-image'));
 assert.ok(!html.includes('Existing Writing world'));
});
test('Writing world retains V8 real furniture, scripts, door and model loading',()=>{
 const html=render(source);
 for(const marker of [
   'data-furniture-model-proof="true"',
   'data-immersive-room="true"',
   'data-exit-door-proof="true"',
   'door-exit.js?v='+VERSION,
   'room.js?v='+VERSION,
   'room-plan.js?v='+VERSION,
   'room-props-v7.js?v='+VERSION,
   'data-illustration-mode="painterly"',
   '<canvas id="room-canvas"',
   'id="scene-nav"',
   'data-focus="door"'
 ]) assert.ok(html.includes(marker),marker);
 const room=read('prototypes/dh-11c-room/room.js');
 assert.ok(room.includes("window.location.assign(window.DH11DoorExit.HOME_PATH)"));
 assert.ok(room.includes("new GLTFLoader().load('../room/models/furniture-source.glb"));
 assert.ok(room.includes("new GLTFLoader().load('../room/models/room-shell-blender-verified.glb"));
 const exit=read('prototypes/dh-11c-room/door-exit.js');
 assert.ok(exit.includes("const HOME_PATH='/'"));
 assert.ok(exit.includes("if(decision(state)==='exit')"));
});
test('all browser assets resolve inside Writing world, not preview-path dependencies',()=>{
 const html=render(source);
 assert.match(html,/<base href="\/worlds\/writing\/scene\/">/);
 assert.ok(html.includes('src="../room/room.js?v='+VERSION+'"'));
 assert.ok(html.includes('src="../room/door-exit.js?v='+VERSION+'"'));
 assert.ok(html.includes('src="./immersive-ui.js"'));
 assert.ok(html.includes('href="./immersive.css"'));
 // Ensure canonical module imports resolve to /worlds/writing/room/, and
 // model loads using document.baseURI resolve to /worlds/writing/room/models/.
 const resolution=(ref)=>new URL(ref,'https://staging.example'+BASE).pathname;
 assert.equal(resolution('../room/room.js'),'/worlds/writing/room/room.js');
 assert.equal(resolution('../room/models/furniture-source.glb'),'/worlds/writing/room/models/furniture-source.glb');
 assert.equal(resolution('../room/models/room-shell-blender-verified.glb'),'/worlds/writing/room/models/room-shell-blender-verified.glb');
 assert.equal(resolution('./immersive.css'),'/worlds/writing/scene/immersive.css');
 assert.equal(resolution('../cabinet-glb/glb-proof.css'),'/worlds/writing/cabinet-glb/glb-proof.css');
 assert.equal(resolution('../../../assets/homepage/floating-islands-background.png'),'/assets/homepage/floating-islands-background.png');
});
test('preview panels are removed from the visitor-facing page without breaking the 3D calibration runtime',()=>{
 const html=render(source);
 assert.ok(html.includes('body[data-writing-world="true"] .illustration-calibrator,'));
 assert.ok(html.includes('body[data-writing-world="true"] .prototype-tools,'));
 assert.ok(html.includes('display:none!important'));
 assert.ok(html.includes('<span class="tag">WRITING ISLAND</span>'));
 assert.ok(html.includes('← DaveHub home'));
 assert.ok(html.includes('href="/worlds/writing/#scene-nav"'));
 assert.ok(html.includes('href="/"'));
 assert.ok(!html.includes('href="/worlds/writing/"'));
 assert.ok(html.includes('data-illustration-mode="reference"'));
 assert.ok(html.includes('data-illustration-mode="painterly"'));
 // DOM requirements of the original handpainted runtime must not be deleted.
 assert.ok(read('prototypes/dh-11c-room/room.js').includes("options.length!==2"));
});
test('no manuscripts or unapproved project catalogue are published through the Writing page',()=>{
 const html=render(source);
 for(const string of ['The Last Lightkeeper','The Clock of Tomorrow','Fictional design demonstration','room-stage-image','room-dialog']){
  assert.ok(!html.includes(string),string);
 }
 assert.ok(html.includes('The Manuscript Hoard'));
 assert.ok(html.includes('requires JavaScript and WebGL'));
 assert.ok(html.includes('<a href="/">Return to DaveHub home</a>'));
 const preview=renderV8(source);
 assert.ok(!preview.includes('data-writing-world="true"'), 'prior V8 isolated review page is still separate');
});
test('staging build makes canonical route after public content generator; source and main stay unaffected',()=>{
 const script=read('scripts/build-pages.sh');
 const generator=script.indexOf('node scripts/render-content.cjs content/public/catalogue.json dist');
 const promotion=script.indexOf('node scripts/render-dh11c5d3j-writing-world.cjs dist/worlds/writing');
 assert.ok(generator>=0&&promotion>generator,'new Writing scene replaces the earlier generated landing page');
 assert.ok(script.includes('cp -R dist/previews/dh-11c/room dist/worlds/writing/'));
 assert.ok(script.includes('dist/worlds/writing/scene'));
 assert.ok(script.includes('dist/worlds/writing/cabinet-glb'));
 const state=JSON.parse(read('PROJECT_STATE.json'));
 const cand=state.dh11_3d_production.illustratedViewPipeline.writingIslandDirectRoom;
 assert.equal(cand.stagingRoute,'/worlds/writing/');
 assert.equal(cand.productionChanged,false);
 assert.equal(cand.publicCatalogueChanged,false);
});

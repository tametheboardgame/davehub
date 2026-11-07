'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {render,MARKER,ROUTE}=require('../scripts/render-dh11c6a-minimal-room.cjs');
const previous=require('../scripts/render-dh11c5d3j-writing-world.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const original=read('prototypes/dh-11c-room/index.html');

test('DH-11C.6A uses precisely the existing DaveHub homepage logo and compact Back link',()=>{
 const home=read('index.html');
 const pathToLogo='assets/branding/davehub-logo-faithful.svg';
 assert.ok(home.includes('src="'+pathToLogo+'"'),'ground truth: actual homepage approved logo');
 const html=render(original);
 assert.equal(MARKER,'DH-11C.6A');
 assert.equal(ROUTE,'/worlds/writing/');
 assert.ok(html.includes('<img src="/'+pathToLogo+'" width="160" height="50" alt="DaveHub">'));
 assert.ok(html.includes('class="brand" href="/" aria-label="DaveHub home"'));
 assert.ok(html.includes('<a class="back-to-islands" href="/">← Back</a>'));
 assert.ok(!html.includes('Dave<span>Hub</span>'));
 assert.ok(!html.includes('← DaveHub home'));
 assert.ok(html.includes('<meta name="davehub-ui-stage" content="DH-11C.6A">'));
});
test('no inspector is permanently visible; a focus-triggered contextual prompt can expand old controls',()=>{
 const html=render(original);
 for(const marker of [
  'data-minimal-ui="true"',
  '<section class="object-prompt" id="object-prompt" aria-label="Selected room object" hidden>',
  'id="object-prompt-title"',
  'id="object-prompt-copy"',
  'id="object-prompt-open" class="object-prompt__open">Explore further',
  'id="object-prompt-close"',
  'id="object-full-close"',
  '<section class="interaction-tray" id="interaction-tray" aria-labelledby="interaction-title" hidden>',
  '<link rel="stylesheet" href="./minimal-immersive.css">',
  'id="scene-nav"',
  '<button type="button" data-focus="desk">',
  'id="home-button"'
 ])assert.ok(html.includes(marker),marker);
 assert.ok(html.includes('id="interaction-actions"'),'original keyboard object interaction controls remain');
 const css=read('prototypes/dh-11c-room/minimal-immersive.css');
 for(const rule of [
  'body[data-minimal-ui="true"] .object-prompt[hidden]{display:none}',
  'body[data-minimal-ui="true"] .interaction-tray[hidden]{display:none}',
  'body[data-minimal-ui="true"] .home-button:disabled{display:none}',
  'body[data-minimal-ui="true"] .frame-topline,',
  'body[data-minimal-ui="true"] .object-menu[open]',
  '.object-full-close',
  ':focus-visible',
  '@media(max-width:680px)'
 ])assert.ok(css.includes(rule),rule);
 assert.ok(css.includes('width:min(420px,calc(100vw - 32px))'),'prompt cannot obscure most of scene');
});
test('UI state transitions preserve all real 3D object mechanics and keyboard navigation',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 const ui=read('prototypes/dh-11c-room/immersive-ui.js');
 for(const marker of [
  "const minimalUI=document.body.dataset.minimalUi==='true'",
  'function showObjectPrompt(id){',
  'if(!obj||id===\'door\'){',
  'objectPrompt.hidden=true;delete document.body.dataset.roomPrompt;return;',
  'objectPrompt.hidden=false;',
  'tray.hidden=true;',
  'promptOpen.addEventListener(\'click\'',
  'fullClose.addEventListener(\'click\'',
  'promptClose.addEventListener(\'click\'',
  'tray.hidden=!!minimalUI;title.textContent=obj.label;',
  'if(minimalUI)showObjectPrompt(id);',
  'if(minimalUI)objectPrompt.hidden=true;',
  'if(minimalUI&&!tray.hidden){',
  "window.location.assign(window.DH11DoorExit.HOME_PATH)",
  "state=plan.next(state,{type:'drawer'",
  'togglePaper(paperIndex)',
  'toggleBook(bookIndex)',
  'pressTypewriter(keyIndex)',
  'toggleBinPaper(binPaperIndex)',
  'toggleLamp()'
 ])assert.ok(room.includes(marker),marker);
 for(const marker of [
  "document.body.dataset.minimalUi==='true'",
  "document.getElementById('object-prompt-open')",
  "(minimal&&!prompt?.hidden?open:(first||home)).focus"
 ])assert.ok(ui.includes(marker),marker);
});
test('V8 preview still uses original inspector interface without the new data flag',()=>{
 const old=previous.render(original);
 const now=render(original);
 assert.ok(old.includes('data-writing-world="true"'));
 assert.ok(!old.includes('data-minimal-ui="true"'));
 assert.ok(!old.includes('object-prompt-open'));
 assert.ok(!old.includes('minimal-immersive.css'));
 assert.ok(now.includes('door-exit.js?v=dh11c5d3i-door-home-exit-v1'));
 assert.ok(now.includes('data-mystical-room-proof="true"'));
 assert.ok(now.includes('<base href="/worlds/writing/scene/">'));
 assert.ok(!now.includes('room-stage-image'));
});
test('Writing island still resolves the same scripts/GLBs and its own style asset',()=>{
 const html=render(original);
 const resolve=(p)=>new URL(p,'https://staging.example/worlds/writing/scene/').pathname;
 assert.equal(resolve('./minimal-immersive.css'),'/worlds/writing/scene/minimal-immersive.css');
 assert.equal(resolve('../room/room.js'),'/worlds/writing/room/room.js');
 assert.equal(resolve('../room/models/furniture-source.glb'),'/worlds/writing/room/models/furniture-source.glb');
 assert.ok(html.includes('href="/worlds/writing/#scene-nav"'));
 assert.ok(html.includes('href="/"'));
 const script=read('scripts/build-pages.sh');
 assert.ok(script.includes('node scripts/render-dh11c5d3j-writing-world.cjs dist/worlds/writing'));
 assert.ok(script.includes('node scripts/render-dh11c6a-minimal-room.cjs dist/worlds/writing'));
 assert.ok(script.includes('minimal-immersive.css dist/worlds/writing/scene/'));
 const oldIndex=script.indexOf('node scripts/render-dh11c5d3j-writing-world.cjs dist/worlds/writing');
 const newIndex=script.indexOf('node scripts/render-dh11c6a-minimal-room.cjs dist/worlds/writing');
 assert.ok(newIndex>oldIndex,'new visitor UX is the final staged canonical route');
});
test('staging-only integration does not change production or public creative catalogue',()=>{
 const state=JSON.parse(read('PROJECT_STATE.json'));
 const v=state.dh11_3d_production.illustratedViewPipeline.minimalImmersiveUI;
 assert.equal(v.stage,'DH-11C.6A');
 assert.equal(v.stagingRoute,'/worlds/writing/');
 assert.equal(v.productionChanged,false);
 assert.equal(v.publishedCatalogueChanged,false);
 assert.equal(v.expandFunction,'existing object controls until bespoke 6B work');
});

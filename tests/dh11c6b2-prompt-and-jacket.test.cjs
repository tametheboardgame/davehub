'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const get=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const renderer=require('../scripts/render-dh11c6b-finished-books.cjs');

test('contextual prompt floats alongside the selected object without shrinking the 3D canvas',()=>{
 const css=get('prototypes/dh-11c-room/minimal-immersive.css');
 assert.ok(css.includes('@media(min-width:640px){'),'side docking must not depend on viewport height');
 assert.ok(css.includes('@media(max-width:639px){'),'narrow viewport must use a corner overlay');
 assert.ok(css.includes('[data-room-focus="bookcase"] .object-prompt'),'bookcase has a left-side prompt');
 assert.ok(css.includes('width:min(220px,49vw)'),'corner prompt must remain small');
 assert.ok(css.includes('top:calc(86px + env(safe-area-inset-top));bottom:auto;'));
 assert.ok(css.includes('left:max(14px,env(safe-area-inset-left));right:auto;'));
 assert.ok(!css.includes('[data-room-prompt="visible"] #scene-frame'));
 assert.ok(!/\n\s*height:calc\(100dvh - 116px\);/.test(css),'no black strip / canvas cropping');
 assert.ok(!css.includes('bottom:calc(116px + max('),'no shifting controls into banner space');
 const core=get('prototypes/dh-11c-room/immersive.css');
 assert.ok(core.includes('position:fixed;inset:0;z-index:1;width:100%;height:100%;height:100dvh;'),
  'the original immersive scene is still full viewport');
});
test('Eleanor text-only cover has a compact fixed limit and cannot stretch the product dialog',()=>{
 const css=get('prototypes/dh-11c-room/book-experience.css');
 assert.ok(css.includes('width:min(100%,260px);max-height:min(390px,48dvh)'));
 assert.ok(css.includes('flex:0 0 auto;align-self:flex-start;overflow:hidden'));
 assert.ok(css.includes('font:700 clamp(17px,2.2vw,25px)'));
 assert.ok(css.includes('width:min(50vw,200px);max-height:min(270px,44dvh);align-self:center'));
 assert.ok(css.includes('max-width:1190px;max-height:calc(100dvh - 30px)'));
 assert.ok(css.includes('overflow-y:auto;overflow-x:hidden'));
 const catalog=require('../prototypes/dh-11c-room/finished-books.js');
 assert.equal(catalog.BOOKS.length,3);
 assert.equal(catalog.byId('eleanor-missing-stones').cover,null,
  'fallback is intentional until verified original artwork is supplied');
 assert.ok(catalog.byId('duck-bread-baker').cover);
});
test('new CSS and JS versions are included only in staged Writing room route',()=>{
 const html=renderer.render(get('prototypes/dh-11c-room/index.html'));
 assert.equal(renderer.VERSION,'dh11c6b2-floating-prompt-v1');
 for(const snippet of [
  'DH-11C.6B.1','DH-11C.6B.2',
  'room.js?v=dh11c6b2-floating-prompt-v1',
  'finished-books.js?v=dh11c6b2-floating-prompt-v1',
  'book-experience.js?v=dh11c6b2-floating-prompt-v1',
  'minimal-immersive.css?v=dh11c6b2-floating-prompt-v1',
  'book-experience.css?v=dh11c6b2-floating-prompt-v1',
  'id="published-book-cover-fallback"',
  'id="object-prompt"',
  'data-exit-door-proof="true"'
 ])assert.ok(html.includes(snippet),snippet);
 const main=require('../scripts/render-dh11c6a-minimal-room.cjs').render(get('prototypes/dh-11c-room/index.html'));
 assert.ok(!main.includes('DH-11C.6B.2'),'comparison and released core must remain unaffected');
 const state=JSON.parse(get('PROJECT_STATE.json'));
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.floatingPromptAndCompactJacket.stagingRoute,'/worlds/writing/');
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.floatingPromptAndCompactJacket.productionChanged,false);
});

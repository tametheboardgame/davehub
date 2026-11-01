'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const {render}=require('../scripts/render-dh11c4c-architecture.cjs');
const base=path.resolve(__dirname,'../prototypes/dh-11c-room');
const source=fs.readFileSync(path.join(base,'index.html'),'utf8');
const html=render(source),css=fs.readFileSync(path.join(base,'immersive.css'),'utf8');
const ui=fs.readFileSync(path.join(base,'immersive-ui.js'),'utf8');
test('architectural scene is one actual viewport, not a vertically scrolling page',()=>{
 for(const marker of ['data-immersive-room="true"','viewport-fit=cover','./immersive.css','./immersive-ui.js',
  'id="scene-frame"','id="room-canvas"','id="home-button"','id="scene-nav"','id="prototype-tools"'])
  assert.ok(html.includes(marker),'Missing '+marker);
 assert.equal(html.match(/id="room-canvas"/g)?.length,1);
 assert.equal(html.match(/id="home-button"/g)?.length,1);
 assert.equal(html.match(/id="scene-nav"/g)?.length,1);
 assert.ok(css.includes('overflow:hidden'));
 assert.match(css,/height:100dvh/);
 assert.match(css,/\.canvas-frame\s*\{\s*position:fixed;inset:0/);
 assert.match(css,/\.topbar\s*\{\s*position:fixed/);
 assert.match(css,/\.control-strip\s*\{\s*position:fixed/);
 assert.match(css,/\.object-menu\s*\{\s*position:fixed/);
 assert.match(css,/\.interaction-tray\s*\{\s*position:fixed/);
 assert.match(css,/\.prototype-tools\s*\{\s*position:fixed/);
 assert.match(css,/overflow-y:auto;overscroll-behavior:contain/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-height:560px\)/);
});
test('native expandable object and prototype control panels are properly nested',()=>{
 assert.match(html,/<details class="prototype-tools" id="prototype-tools"><summary>Test controls<\/summary>/);
 assert.match(html,/<details class="object-menu" id="scene-nav"><summary>Explore objects<\/summary>/);
 const toolsStart=html.indexOf('<details class="prototype-tools"');
 const toolsEnd=html.indexOf('</details>',toolsStart);
 const strip=html.indexOf('<div class="control-strip">');
 assert.ok(toolsStart>0&&toolsEnd>toolsStart&&strip>toolsEnd);
 assert.ok(html.slice(toolsStart,toolsEnd).includes('id="glb-extension"'));
 assert.ok(html.slice(toolsStart,toolsEnd).includes('class="comparison-links"'));
 const objectsStart=html.indexOf('<details class="object-menu"');
 const objectsEnd=html.indexOf('</details>',objectsStart);
 const tray=html.indexOf('<section class="interaction-tray"');
 assert.ok(objectsStart>strip&&objectsEnd>objectsStart&&tray>objectsEnd);
 for(const id of ['desk','cabinet','bookcase','typewriter','bin','window','door'])
  assert.ok(html.slice(objectsStart,objectsEnd).includes('data-focus="'+id+'"'));
 assert.match(html,/data-shell-proof="true"/);
 assert.match(html,/data-blender-compare="true"/);
 assert.match(html,/data-glb-proof="true"/);
});
test('working normal room remains independently navigable and unmodified',()=>{
 assert.doesNotMatch(source,/data-immersive-room|prototype-tools|immersive\.css/);
 assert.match(source,/<nav class="scene-nav" id="scene-nav"/);
 assert.match(source,/class="canvas-frame" id="scene-frame"/);
 assert.match(html,/noindex,nofollow/);
 assert.doesNotMatch(html,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour/);
});
test('keyboard and accessible controls do not depend on scrolling or mouse only',()=>{
 for(const marker of ['skip?.addEventListener','objects.open=true','objects.open=false','tools.open=false',
  'focus({preventScroll:true})','event.key','stopImmediatePropagation','scene.addEventListener'])
  assert.ok(ui.includes(marker),marker);
 assert.match(css,/\.home-button/);
 assert.match(css,/\.object-menu>summary:focus-visible/);
 for(const file of ['prototypes/dh-11c-room/immersive-ui.js','scripts/render-dh11c4c-architecture.cjs']){
  const out=cp.spawnSync(process.execPath,['--check',path.resolve(__dirname,'../'+file)],{encoding:'utf8'});
  assert.equal(out.status,0,file+': '+out.stderr);
 }
});

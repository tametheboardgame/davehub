'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'main.js'),'utf8');
const {filesFor}=require('../scripts/render-content.cjs');
const publicManifest=JSON.parse(fs.readFileSync(path.join(root,'content/public/catalogue.json'),'utf8'));
const fictionalManifest=JSON.parse(fs.readFileSync(path.join(root,'content/examples/fictional.json'),'utf8'));
test('homepage Explore enters the actual new world directory',()=>{
 assert.match(html,/<a class="explore-button" href="\/worlds\/">/);
 assert.match(html,/Skip to Explore DaveHub<\/a>/);
 assert.doesNotMatch(html,/<dialog\b/i);
});
test('all four islands navigate directly to their shared content worlds',()=>{
 for(const name of ['projects','writing','games','experiments'])
  assert.match(html,new RegExp('class="island island--'+name+'" href="/worlds/'+name+'/\"'));
});
test('old modal hashes are redirected to the appropriate deep links',()=>{
 for(const name of ['projects','writing','games','experiments','music','unfinished','memory-lane'])
  assert.ok(js.includes(name),name);
 assert.match(js,/location\.replace\('\/worlds\/'\)/);
});
test('approved empty worlds offer a clearly-labelled route to the fictional preview',()=>{
 const pages=filesFor(publicManifest,'',false);
 const index=pages.get('worlds/index.html');
 const writing=pages.get('worlds/writing/index.html');
 assert.match(index,/href="\/previews\/dh-08b\/worlds\/"/);
 assert.match(index,/fictional example/);
 assert.match(writing,/href="\/previews\/dh-08b\/worlds\/writing\/"/);
 assert.match(writing,/Nothing has landed here yet/);
 assert.doesNotMatch(index,/The Last Lightkeeper/);
});
test('fictional content and back links remain within preview paths',()=>{
 const pages=filesFor(fictionalManifest,'/previews/dh-08b',true);
 const index=pages.get('worlds/index.html');
 const musical=pages.get('creations/last-lightkeeper/index.html');
 assert.match(index,/Fictional design demonstration/);
 assert.match(index,/href="\/previews\/dh-08b\/worlds\/music\/"/);
 assert.match(musical,/href="\/previews\/dh-08b\/worlds\/"/);
 assert.match(musical,/class="home" href="\/"/);
 assert.doesNotMatch(index,/href="\/#explore"/);
});

test('DH-06D transparent Dave motion remains decorative with an accessible static fallback',()=>{
 assert.match(html,/id="dave-stage-motion"/);
 assert.ok(html.includes('assets/characters/dave/dave-animation-v1.webm'));
 assert.match(html,/dave-stage__still/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(js,/saveData/);
 assert.match(js,/staticFallback/);
 const asset=path.join(root,'assets/characters/dave/dave-animation-v1.webm');
 assert.ok(fs.existsSync(asset),'transparent animation exists');
 assert.ok(fs.statSync(asset).size > 10000,'animation is not empty');
});

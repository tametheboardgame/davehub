'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const home=read('index.html');
const css=read('styles.css');
const foyer=read('prototypes/dh-12b-music-world/foyer.html');
const world=read('prototypes/dh-12b-music-world/music-portals.mjs');

test('DaveHub homepage has five individually named, keyboard accessible island links',()=>{
 const islands=[...home.matchAll(/<a class="island island--([a-z-]+)" href="([^"]+)"[^>]*>/g)]
  .map(match=>({name:match[1],href:match[2],markup:match[0]}));
 assert.deepEqual(islands.map(i=>i.name),['writing','games','music','experiments','projects']);
 assert.equal(islands.length,5);
 assert.equal(new Set(islands.map(i=>i.name)).size,5);
 for(const island of islands){
  assert.ok(island.markup.includes('aria-label="Explore '));
  assert.ok(island.href.startsWith('/'));
 }
 assert.equal(islands.find(i=>i.name==='music').href,
  '/previews/dh-12b/music-foyer/');
 assert.match(home,/<svg class="glyph" aria-hidden="true"><use href="#icon-music"\/><\/svg><span>Music<\/span>/);
 assert.ok(home.includes('data-dh12b4-music-island="true"'));
});
test('Music takes visitors into the real two-door foyer, not a historical placeholder',()=>{
 assert.match(foyer,/DH-12B\.3/);
 assert.match(foyer,/data-music-foyer="true"/);
 assert.match(foyer,/id="portal-theatre"/);
 assert.match(foyer,/id="portal-records"/);
 assert.ok(world.includes("route:'/previews/dh-12a/listening-room/'"));
 assert.ok(world.includes("route:'/previews/dh-12b/record-shop/'"));
 assert.match(foyer,/class="music-foyer__back" href="\/"[^>]*>← Home islands<\/a>/);
 assert.doesNotMatch(foyer,/href="\/worlds\/music\/"[^>]*>← Music island/);
});
test('Music island sits between upper and lower hotspots, with mobile and short-screen layouts',()=>{
 const token='.island--music';
 assert.ok(css.includes('--island-color: #f9d29b'));
 assert.ok(css.includes('left: 69%')&&css.includes('top: 32%'));
 assert.ok(css.includes('.island--music:hover,.island--music:focus-visible'));
 const tablet=css.match(/@media \(max-width: 900px\) \{[\s\S]*?(?=\n\}\n@media \(max-width: 640px\))/);
 assert.ok(tablet&&tablet[0].includes('.island--music { left: 66%; top: 31%; }'));
 const mobile=css.match(/@media \(max-width: 640px\) \{[\s\S]*?(?=\n\}\n@media \(max-width: 380px\))/);
 assert.ok(mobile&&mobile[0].includes('.island--music { left: 41%; top: 32%; }'));
 assert.ok(css.includes('.island--music { left: 40%; top: 30%; }'),'very narrow phones');
 assert.ok(css.includes('.island--music { left: 63%; top: 32%; }'),'short landscape');
 assert.ok(css.includes('.island-nav { position: absolute; inset: 0; z-index: 2; pointer-events: none; }'));
 assert.ok(css.includes('.island { --island-color: #fff; position: absolute; pointer-events: auto;'));
});
test('Music island must not change Writing, game, experiment or project routes',()=>{
 for(const route of ['writing','games','experiments','projects'])
  assert.ok(home.includes('class="island island--'+route+'" href="/worlds/'+route+'/"'));
 assert.match(home,/class="explore-button" href="\/worlds\/"/);
 assert.match(home,/id="dave-stage-motion"/);
 assert.ok(!home.includes('autoplay'));
});
test('staging build and Cloudflare verification include actual homepage and Music foyer',()=>{
 const build=read('scripts/build-pages.sh'),smoke=read('scripts/check-cloudflare-staging.cjs');
 assert.ok(build.includes('tests/dh12b4-home-music.test.cjs'));
 assert.ok(build.includes("check('dist/index.html'"));
 assert.ok(build.includes('data-dh12b4-music-island="true"'));
 assert.ok(smoke.includes("path:'/'"));
 assert.ok(smoke.includes('data-dh12b4-music-island="true"'));
 assert.ok(smoke.includes('/previews/dh-12b/music-foyer/'));
 assert.ok(smoke.includes("path:'/styles.css'"));
 assert.ok(!build.includes('node scripts/render-music-foyer-live'),
  'Music foyer is still a staging-only preview, not the canonical Music page');
});

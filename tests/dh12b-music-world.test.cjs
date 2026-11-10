'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base='prototypes/dh-12b-music-world/';
const portals=import(pathToFileURL(path.join(root,base,'music-portals.mjs')).href);
const racks=import(pathToFileURL(path.join(root,base,'record-shop-mechanics.mjs')).href);

test('music separates musicals from songs/bands with exactly two local stage destinations',async()=>{
 const m=await portals;
 assert.equal(m.DOORS.length,2);
 assert.deepEqual(m.DOORS.map(d=>d.id),['theatre','records']);
 assert.deepEqual(m.DOORS.map(d=>d.category),['Musicals','Songs & bands']);
 assert.deepEqual(m.DOORS.map(d=>d.route),[
  '/previews/dh-12a/listening-room/','/previews/dh-12b/record-shop/'
 ]);
 assert.equal(m.FOYER_ROUTE,'/previews/dh-12b/music-foyer/');
 assert.equal(m.doorFor('theatre').label,'The Impossible Theatre');
 assert.equal(m.doorFor('records').label,'The Record Shop');
 assert.equal(m.doorFor('unknown'),null);
 for(const d of m.DOORS){
  assert.ok(m.isLocalMusicRoute(d.route));
  assert.ok(d.route.startsWith('/previews/'));
  assert.ok(d.description.length>20);
  assert.ok(/^#[0-9a-f]{6}$/i.test(d.colour));
 }
 assert.ok(m.isLocalMusicRoute(m.FOYER_ROUTE));
 assert.equal(m.isLocalMusicRoute('https://example.org/music'),false);
 assert.equal(m.isLocalMusicRoute('/worlds/writing/'),false);
 assert.equal(m.isLocalMusicRoute('/worlds/music/'),false,'unapproved public route must not be auto-published');
});
test('each real leaf opens from its own hinge, the same selection can be cancelled or changed',async()=>{
 const m=await portals;
 assert.equal(m.nextDoorState(null,'theatre'),'theatre');
 assert.equal(m.nextDoorState('theatre','records'),'records');
 assert.equal(m.nextDoorState('records','records'),null);
 assert.throws(()=>m.nextDoorState(null,'nothing'),/Unknown music-world doorway/);
 assert.equal(m.doorAngle(false,'left'),0);
 assert.equal(m.doorAngle(false,'right'),0);
 assert.equal(m.doorAngle(true,'left'),-1.02);
 assert.equal(m.doorAngle(true,'right'),1.02);
 assert.throws(()=>m.doorAngle(true,'middle'),/Unknown door side/);
 const approaching=m.approach(0,10,.04);
 assert.ok(approaching>0&&approaching<10);
 assert.ok(m.approach(approaching,0,.04)<approaching);
 assert.ok(m.settled([0,1,2],[.01,1.02,2.01]));
 assert.ok(!m.settled([0,1,2],[.01,1.4,2.01]));
});
test('real Music-world foyer has hinged door leaf geometry, real focus movement and delayed navigation',()=>{
 const html=read(base+'foyer.html'),js=read(base+'foyer.mjs');
 for(const marker of [
  'data-music-foyer="true"','data-dimensional-art="true"','data-foyer-orbit="true"','data-foyer-minimal="true"','DH-12B.5A',
  'The World Between Notes','id="portal-theatre"','id="portal-records"',
  'id="music-portal-overview"','role="status"',
  'noindex,nofollow','foyer.mjs?v=dh12b5a-marquee-front-v1'
 ])assert.ok(html.includes(marker),marker);
 for(const marker of [
  'new THREE.WebGLRenderer','THREE.PerspectiveCamera',
  "def.id+'-'+side+'-hinge'",
  "def.id+'-'+side+'-door-leaf'",
  "name='gateway-inscription-'",
  "registerClick", // this line is checked separately since foyer uses mark()
  'doorAngle(opened,side)',
  'function targetCamera()',
  'function choose(id)',
  'if(!door||entering||selected===id)return;',
  'window.location.assign(door.route)',
  'const doorsDone=',
  'const cameraDone=',
  'shouldAutoEnter({selected,entering,doorsDone,cameraDone})',
  'function returnToCrossroads()',
  "if(e.key==='Escape'&&selected)",
  "canvas.addEventListener('pointerup'"
 ].filter(x=>x!=='registerClick'&&x!=="name='gateway-inscription-'"))
  assert.ok(js.includes(marker),marker);
 assert.ok(js.includes('mark(hinge,def.id)')&&js.includes('mark(display,def.id)'));
 const navigate=js.indexOf('window.location.assign(door.route)');
 assert.ok(navigate>js.indexOf('function enterSelectedWorld()'));
 assert.ok(js.indexOf('shouldAutoEnter({selected,entering,doorsDone,cameraDone})')>navigate,
  'real motion must trigger the journey without a second selection');
 const htmlFoyer=html.indexOf('The Impossible Theatre');
 const htmlRecords=html.indexOf('The Record Shop');
 assert.ok(htmlFoyer>=0&&htmlRecords>htmlFoyer);
 assert.ok(!/<audio|autoplay|<iframe|https?:\/\//i.test(html));
 assert.ok(!/\.png|\.jpg|\.webp|data:image\//i.test(js),'physical doors must not be fake state images');
});
test('record shop has separate categories, three real crates, and safe silent physical listening',async()=>{
 const m=await racks;
 assert.deepEqual(m.RACKS.map(r=>r.id),['singles','bands','albums']);
 assert.deepEqual(m.RACKS.map(r=>r.name),[
  'Songs & singles','Bands & music projects','Albums & EPs'
 ]);
 for(const r of m.RACKS){
  assert.equal(m.rackFor(r.id),r);
  assert.ok(r.subtitle.length>30);
  assert.equal(m.pullPosition(r.id,r.id),1);
  assert.equal(m.pullPosition(null,r.id),0);
 }
 assert.equal(m.rackFor('not-real'),null);
 assert.equal(m.focusAction(null,'singles'),'singles');
 assert.equal(m.focusAction('singles','singles'),null);
 assert.equal(m.focusAction('bands','albums'),'albums');
 assert.equal(m.focusAction(null,'listening'),'listening');
 assert.equal(m.focusAction(null,'nothing'),null);
 assert.equal(m.spinDisc(7,false,3),7);
 assert.ok(m.spinDisc(0,true,.04)>0);
 assert.ok(m.motion(0,1,.04)>0&&m.motion(0,1,.04)<1);
 const home=m.shopDestination(null,16/9);
 for(const id of ['singles','bands','albums','listening']){
  const focus=m.shopDestination(id,16/9);
  assert.ok(focus.position.length===3&&focus.target.length===3);
  assert.notDeepEqual(focus,home,'physically approach '+id);
  const phone=m.shopDestination(id,.42);
  assert.ok(phone.position[2]>focus.position[2],'phone backs away to retain framing');
 }
});
test('record shop is genuinely separate geometry, not the theatre re-skinned or populated with unapproved data',()=>{
 const html=read(base+'record-shop.html'),js=read(base+'record-shop.mjs');
 for(const marker of [
  'data-music-record-shop="true"','The Record Shop',
  'href="/previews/dh-12b/music-foyer/"',
  'id="record-shop-singles"','id="record-shop-bands"',
  'id="record-shop-albums"','id="record-shop-disc"',
  'id="record-shop-overview"','record-shop.mjs?v=dh12c2-approved-catalogue-v1',
  'noindex,nofollow','A dreamlike listening dimension. No private songs, audio or unapproved links are loaded.'
 ])assert.ok(html.includes(marker),marker);
 for(const marker of [
  'new THREE.WebGLRenderer',
  'real-record-pull-out-',
  "r.id+'-crate-front'",
  "r.id+'-unfiled-sleeve-'",
  'register(rack,r.id)',
  "register(listening,'listening')",
  'discAngle=spinDisc',
  'c.drawer.position.z=motion',
  'arm.rotation.y=motion',
  "if(e.key==='Escape'&&focused)",
  'shopDestination(focused,ratio)',
  'function wholeShop()'
 ])assert.ok(js.includes(marker),marker);
 assert.ok(!/new Audio\s*\(|\.play\s*\(|<audio/i.test(js),
  'no unapproved audio playback');
 assert.ok(js.includes("fetch('./approved-catalogue.json'")&&js.includes("redirect:'error'"),
  'browser may only retrieve the approved same-origin catalogue');
 assert.ok(!/\.png|\.jpg|\.webp|data:image\//i.test(js));
});
test('Music world has both-way connections, but the canonical Music page is untouched',()=>{
 const theatre=read('prototypes/dh-12a-listening-room/index.html');
 const foyer=read(base+'foyer.html'),records=read(base+'record-shop.html');
 assert.ok(theatre.includes('href="/previews/dh-12b/music-foyer/"'));
 assert.ok(theatre.includes('DH-12A · THE MUSICALS WORLD'));
 assert.ok(records.includes('href="/previews/dh-12b/music-foyer/"'));
 assert.ok(foyer.includes('href="/"'),'Music foyer returns to the actual homepage Music island');
 const script=read('scripts/build-pages.sh');
 assert.ok(script.includes('node scripts/render-content.cjs content/public/catalogue.json'));
 assert.ok(!script.includes('node scripts/render-music-foyer-live'),'unapproved canonical route unchanged');
});
test('both previews bundle the same redistributable Three.js runtime and stage-only smoke verification',()=>{
 const build=read('scripts/build-pages.sh'),smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const marker of [
  'tests/dh12b-music-world.test.cjs',
  'prototypes/dh-12b-music-world/music-portals.mjs',
  'prototypes/dh-12b-music-world/record-shop-mechanics.mjs',
  'node --check prototypes/dh-12b-music-world/foyer.mjs',
  'node --check prototypes/dh-12b-music-world/record-shop.mjs',
  'dist/previews/dh-12b/music-foyer/index.html',
  'dist/previews/dh-12b/record-shop/index.html',
  "check('dist/previews/dh-12b/music-foyer/index.html'",
  "check('dist/previews/dh-12b/record-shop/index.html'"
 ])assert.ok(build.includes(marker),marker);
 for(const marker of [
  '/previews/dh-12b/music-foyer/',
  '/previews/dh-12b/record-shop/',
  '/previews/dh-12b/music-foyer/foyer.mjs',
  '/previews/dh-12b/record-shop/record-shop.mjs',
  'dh12b2-dimensional-world-v1',
  'href="/previews/dh-12b/music-foyer/"'
 ])assert.ok(smoke.includes(marker),marker);
 for(const html of [read(base+'foyer.html'),read(base+'record-shop.html')])
  assert.ok(html.includes('noindex,nofollow'));
});

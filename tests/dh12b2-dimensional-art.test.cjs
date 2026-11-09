'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const files='prototypes/dh-12b-music-world/';
const read=p=>fs.readFileSync(path.resolve(root,p),'utf8');
const art=import(pathToFileURL(path.join(root,files,'dimensional-art.mjs')).href);

test('the dimensional environment has authored distinct palettes and deterministic painterly nebulae',async()=>{
 const m=await art;
 assert.match(m.DIMENSION_STYLE.foyer,/moonstone/);
 assert.match(m.DIMENSION_STYLE.shop,/celestial vinyl/);
 assert.notEqual(m.DIMENSION_STYLE.foyer,m.DIMENSION_STYLE.shop);
 assert.equal(m.DIMENSION_STYLE.palettes.void.length,5);
 const first=m.nebulaLayers(29),repeat=m.nebulaLayers(29),different=m.nebulaLayers(38);
 assert.equal(first.length,38);
 assert.deepEqual(first,repeat);
 assert.notDeepEqual(first,different);
 for(const blob of first){
  assert.ok(blob.x>=0&&blob.x<1);
  assert.ok(blob.y>=0&&blob.y<1);
  assert.ok(blob.width>.06&&blob.width<.37);
  assert.ok(blob.height>.02&&blob.height<.15);
  assert.ok(blob.opacity>0&&blob.opacity<=.16);
 }
});
test('each of 36 real detached moonstone fragments has a unique orbital location',async()=>{
 const m=await art;
 const poses=Array.from({length:36},(_,i)=>m.floatingShardPose(i,36,0));
 assert.equal(new Set(poses.map(x=>x.x.toFixed(3)+','+x.z.toFixed(3))).size,36);
 for(const pose of poses){
  assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.y)&&Number.isFinite(pose.z));
  const radius=Math.hypot(pose.x,pose.z+2.15);
  assert.ok(radius>7.2&&radius<10,'floating shard beyond actual physical island edge');
 }
 const moved=m.floatingShardPose(0,36,4);
 assert.notEqual(moved.y,poses[0].y,'shards float independently when motion is enabled');
 for(const n of [-1,36,1.5])assert.throws(()=>m.floatingShardPose(n,36),/fragment/);
 assert.ok(m.portalPulse(0,0)>=.85&&m.portalPulse(0,0)<=1.16);
 assert.ok(m.portalPulse(2,1)>=.85&&m.portalPulse(2,1)<=1.16);
});
test('foyer is a magical alternative dimension built around the ORIGINAL genuine door rigs',()=>{
 const artSource=read(files+'dimensional-art.mjs');
 const foyer=read(files+'foyer.mjs');
 const shared=[
  "new THREE.SphereGeometry(86,64,40)",
  "new THREE.CanvasTexture(cv)",
  "new THREE.Points(geometry",
  "new THREE.DodecahedronGeometry(1,0)",
  "new THREE.CatmullRomCurve3(",
  "new THREE.TubeGeometry(curve",
  "new THREE.ShaderMaterial({",
  "uTime:{value:0}",
  "gl_FragColor",
  "floatingShardPose(i,36)",
  "levitating-stair-tread-",
  "orphaned-levitating-arch-",
  "enchanted-hanging-lantern-",
  "real-arcane-music-ring-",
  "twisted-gilt-portal-rib-",
  "living-portal-veil-",
  "living-theatre-velvet-banner-",
  "interdimensional-vinyl-crown"
 ];
 for(const marker of shared)assert.ok(artSource.includes(marker),marker);
 for(const marker of [
  "from './dimensional-art.mjs?v=dh12b2-dimensional-world-v1'",
  "const dimension=buildFoyerDimension({",
  "THREE,scene,thresholds,reducedMotion:!!reduced?.matches",
  "dimension.update(dt,selected)",
  "if(selected===id&&ready)",
  "window.location.assign(door.route)",
  "doorAngle(opened,side)",
  "doorsDone&&cameraDone",
  "const thresholds={};",
  "DOORS.forEach((d,i)=>{thresholds[d.id]=makePortal(d,i);});"
 ])assert.ok(foyer.includes(marker),marker);
 assert.ok(!artSource.includes('window.location.assign('),'background scenery cannot control navigation');
 assert.ok(!/new Audio\s*\(|\.play\s*\(/.test(artSource),'no hidden audio');
 assert.ok(!/\.png|\.webp|\.jpg|data:image\/png/i.test(artSource),'no fake moving image frames');
});
test('Record Shop is an impossible open structure, with real turntable and original pull-out crates',()=>{
 const shop=read(files+'record-shop.mjs');
 const artSource=read(files+'dimensional-art.mjs');
 for(const marker of [
  "from './dimensional-art.mjs?v=dh12b2-dimensional-world-v1'",
  "const dimension=buildRecordDimension({",
  "THREE,scene,crates,listening,disc,reducedMotion:!!reduced?.matches",
  "dimension.update(dt,playing)",
  "rear-shop-moonstone-parapet",
  "open-side-gallery-parapet-",
  "r.id+'-unfiled-sleeve-'",
  "real-record-pull-out-",
  "c.drawer.position.z=motion",
  "arm.rotation.y=motion",
  "register(listening,'listening')"
 ])assert.ok(shop.includes(marker),marker);
 for(const marker of [
  "moonlit-listening-ritual-sigil",
  "real-celestial-vinyl-mandala-",
  "open-celestial-window-vault-",
  "impossible-window-vines-",
  "levitating-blank-vinyl-",
  "physical-hovering-vinyl-disc-",
  "impossible-shop-back-stair-",
  "suspended-record-shop-lantern-",
  "orbiting-moon-and-record-mobile",
  "copper-rack-root-",
  "rack-levitating-lettermark-"
 ])assert.ok(artSource.includes(marker),marker);
 assert.ok(!shop.includes("box('rear-wooden-shop-wall',[11.9,5.5"),'solid rear box should no longer block the cosmic sky');
 assert.ok(!shop.includes("box('left-wall',[.34,5.5"),'side walls must now open into the impossible dimension');
 assert.ok(!shop.includes("box('right-wall',[.34,5.5"));
});
test('the two illustrated realms retain clear navigation, publication gates, and accessible controls',()=>{
 const foyer=read(files+'foyer.html');
 const shop=read(files+'record-shop.html');
 for(const page of [foyer,shop]){
  assert.ok(page.includes('DH-12B.2'));
  assert.ok(page.includes('data-dimensional-art="true"'));
  assert.ok(page.includes('music-world.css?v=dh12b2-dimensional-world-v1'));
  assert.ok(page.includes('noindex,nofollow'));
  assert.ok(!/<audio|<iframe|autoplay|https?:\/\//i.test(page));
 }
 assert.ok(foyer.includes('foyer.mjs?v=dh12b2-dimensional-world-v1'));
 assert.ok(shop.includes('record-shop.mjs?v=dh12b2-dimensional-world-v1'));
 for(const marker of ['id="portal-theatre"','id="portal-records"','id="music-portal-overview"','role="status"'])
  assert.ok(foyer.includes(marker),marker);
 for(const marker of ['id="record-shop-singles"','id="record-shop-bands"','id="record-shop-albums"',
  'id="record-shop-disc"','id="record-shop-overview"'])
  assert.ok(shop.includes(marker),marker);
 const style=read(files+'music-world.css');
 for(const marker of [
  'body[data-dimensional-art="true"] .music-foyer',
  'body[data-dimensional-art="true"] .music-choice',
  'body[data-dimensional-art="true"] .record-shop__actions',
  'body[data-dimensional-art="true"] .music-foyer__mist',
  '@keyframes dimensional-haze',
  '@media(max-width:690px)',
  '@media(prefers-reduced-motion:reduce)'
 ])assert.ok(style.includes(marker),marker);
});
test('the new art module is packed into BOTH existing preview routes and enforced by Cloudflare smoke',()=>{
 const build=read('scripts/build-pages.sh'),smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const marker of [
  'tests/dh12b2-dimensional-art.test.cjs',
  'prototypes/dh-12b-music-world/dimensional-art.mjs',
  'node --check prototypes/dh-12b-music-world/dimensional-art.mjs',
  'dist/previews/dh-12b/music-foyer/',
  'dist/previews/dh-12b/record-shop/',
  "check('dist/previews/dh-12b/'+world+'/dimensional-art.mjs'",
  'buildFoyerDimension',
  'buildRecordDimension',
  'DH-12B.2'
 ])assert.ok(build.includes(marker),marker);
 for(const marker of [
  'dh12b2-dimensional-world-v1',
  '/previews/dh-12b/music-foyer/dimensional-art.mjs',
  '/previews/dh-12b/record-shop/dimensional-art.mjs',
  'DH-12B.2',
  "window.location.assign(door.route)"
 ])assert.ok(smoke.includes(marker),marker);
 assert.ok(!build.includes('node scripts/render-music-foyer-live'));
 const theatre=read('prototypes/dh-12a-listening-room/index.html');
 assert.ok(theatre.includes('href="/previews/dh-12b/music-foyer/"'),'theatre return remains intact');
});

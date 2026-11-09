'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalog=require('../prototypes/dh-11c-room/finished-books.js');
const art=require('../prototypes/dh-11c-room/manuscript-personality-v2.js');
const current=require('../scripts/render-dh11c6b-finished-books.cjs');
const earlier=require('../scripts/render-dh11c6a-minimal-room.cjs');

function previewColour(index,canonical=true){
 const source=read('prototypes/dh-11c-room/room.js');
 const from=source.indexOf('function featuredBookColour(mesh){');
 const to=source.indexOf('function markFeaturedBook(mesh,index){',from);
 assert.ok(from>=0&&to>from,'extract actual production material recolouring function');
 const code=source.slice(from,to)+'\nfeaturedBookColour(mesh);';
 const changed={};
 const color={set(value){changed.colour=value;}};
 const emissive={set(value){changed.glow=value;}};
 const mesh={userData:{featuredBookIndex:index},
  material:{color,emissive,emissiveIntensity:0}};
 vm.runInNewContext(code,{
  finishedBooksEnabled:canonical,finishedBooks:catalog,
  FEATURE_BOOK_COLOUR:'#24f5da',mesh
 },{timeout:1000});
 changed.intensity=mesh.material.emissiveIntensity;
 return changed;
}

test('the three real publications have distinct, edition-inspired leather palettes',()=>{
 assert.deepEqual(catalog.BOOKS.map(b=>b.id),[
  'stormrider','duck-bread-baker','eleanor-missing-stones'
 ]);
 const hues=catalog.BOOKS.map(b=>b.binding);
 assert.equal(new Set(hues).size,3,'one colour for every real edition');
 for(const book of catalog.BOOKS){
  assert.match(book.binding,/^#[0-9a-f]{6}$/i);
  assert.match(book.glow,/^#[0-9a-f]{6}$/i);
  assert.ok(book.cover||book.id==='eleanor-missing-stones');
 }
 assert.equal(catalog.byId('stormrider').binding,'#36577a');
 assert.equal(catalog.byId('duck-bread-baker').binding,'#ba672c');
 assert.equal(catalog.byId('eleanor-missing-stones').binding,'#404864');
});

test('actual book colour function uses edition palette, not vivid turquoise, in visitor mode',()=>{
 for(let i=0;i<3;i++){
  const out=previewColour(i);
  assert.equal(out.colour,catalog.byIndex(i).binding);
  assert.equal(out.glow,catalog.byIndex(i).glow);
  assert.equal(out.intensity,.12);
  assert.notEqual(out.colour,'#24f5da');
 }
 const legacy=previewColour(0,false);
 assert.equal(legacy.colour,'#24f5da');
 assert.equal(legacy.glow,'#0f9f9e');
 assert.equal(legacy.intensity,.85);
});

test('a separate fine gold physical outline marks interactive books without changing cover colour',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of [
  'if(finishedBooksEnabled){',
  "const foil=new THREE.MeshBasicMaterial({",
  "color:'#ffe3a0',transparent:true,opacity:.95",
  "accent.name='published_book_foil_'+index+'_'+n;",
  "seal.name='published_book_seal_'+index;",
  "accent.userData.featuredBookIndex=index;",
  "seal.userData.featuredBookIndex=index;",
  "mesh.add(accent);",
  "mesh.add(seal);",
  "const faceZ=bounds.max.z+.025/sz;",
  "if(mesh.material.map){mesh.material.map=null;mesh.material.needsUpdate=true;}",
  "pullBooks.forEach(featuredBookColour)",
  "mesh.userData.featuredBookIndex=index"
 ])assert.ok(room.includes(marker),marker);
 assert.ok(room.includes("if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;"));
 assert.ok(room.includes(':(featuredBook(shelf,b)?pullBooks.length:null)'),
  'legacy eight-featured-book review remains independent');
 assert.ok(room.includes('The three gold-framed bindings on the top shelf'));
 assert.ok(room.includes('Pull one of the three gold-outlined books on the top shelf.'));
});

function paintSpine(book,canonical){
 const calls=[],ctx={fillStyle:null,strokeStyle:null,lineWidth:1,
  clearRect(){},fillRect(x,y,w,h){calls.push({fill:this.fillStyle,x,y,w,h});},
  beginPath(){},moveTo(){},lineTo(){},stroke(){},strokeRect(){},
  quadraticCurveTo(){},fillText(){},strokeText(){},save(){},translate(){},rotate(){},restore(){}
 };
 art.paintSpine(ctx,192,768,63,true,book.spine,canonical?book.binding:null);
 return calls[0].fill;
}
test('hand-painted spine front matches each published binding; original art preview stays turquoise',()=>{
 for(const book of catalog.BOOKS)assert.equal(paintSpine(book,true),book.binding);
 assert.equal(paintSpine(catalog.BOOKS[0],false),'#107b88');
 const source=read('prototypes/dh-11c-room/manuscript-personality-v2.js');
 assert.ok(source.includes('titleLabel,published?.binding||null'));
 assert.ok(source.includes('const palette=overridePalette||'));
});

test('published-only highlight and book indexes still point to top shelf, not generic books',()=>{
 assert.deepEqual(catalog.TOP_SHELF_SLOTS,[3,10,17]);
 assert.equal(catalog.TOP_SHELF,3);
 for(const slot of catalog.TOP_SHELF_SLOTS)
  assert.ok(Number.isInteger(catalog.indexForMesh(3,slot)));
 assert.equal(catalog.indexForMesh(0,3),null);
 assert.equal(catalog.indexForMesh(3,4),null);
});

test('staging version is isolated and never invents the Eleanor cover',()=>{
 const base=read('prototypes/dh-11c-room/index.html');
 const html=current.render(base),old=earlier.render(base);
 assert.equal(current.VERSION,'dh11c6b3-real-edition-spines-v1');
 for(const marker of [
  'DH-11C.6B.3','data-finished-books="true"',
  'room.js?v=dh11c6b3-real-edition-spines-v1',
  'manuscript-personality-v2.js?v=dh11c6b3-real-edition-spines-v1',
  'finished-books.js?v=dh11c6b3-real-edition-spines-v1',
  'book-experience.js?v=dh11c6b3-real-edition-spines-v1'
 ])assert.ok(html.includes(marker),marker);
 assert.ok(!old.includes('DH-11C.6B.3'));
 assert.equal(catalog.byId('eleanor-missing-stones').cover,null,
  'never substitute unverified art for the real book cover');
 const state=JSON.parse(read('PROJECT_STATE.json'));
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.authenticPublishedSpines.stagingRoute,'/worlds/writing/');
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.authenticPublishedSpines.productionChanged,false);
});

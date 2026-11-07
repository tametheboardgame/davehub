'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const catalog=require('../prototypes/dh-11c-room/finished-books.js');
const furniture=require('../prototypes/dh-11c-room/furniture-asset.js');
const artist=require('../prototypes/dh-11c-room/manuscript-personality-v2.js');
const current=require('../scripts/render-dh11c6b-finished-books.cjs');
const previous=require('../scripts/render-dh11c6a-minimal-room.cjs');
const get=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

test('exactly three published books live on the highest of four existing GLB shelves',()=>{
 assert.equal(catalog.TOP_SHELF,3);
 assert.deepEqual(catalog.TOP_SHELF_SLOTS,[3,10,17]);
 assert.deepEqual(catalog.BOOKS.map(b=>b.featuredIndex),[0,1,2]);
 const all=[];
 for(let shelf=0;shelf<4;shelf++)for(let slot=0;slot<20;slot++){
  const i=catalog.indexForMesh(shelf,slot);
  if(i!==null)all.push({shelf,slot,i});
 }
 assert.deepEqual(all,[
  {shelf:3,slot:3,i:0},
  {shelf:3,slot:10,i:1},
  {shelf:3,slot:17,i:2}
 ]);
 assert.ok(furniture.nodes.every(n=>!n.name?.startsWith('book_3_')||n.position?.[1]>=0));
 const names=furniture.nodes.map(n=>n.name);
 for(const {shelf,slot} of all){
  const name='book_'+shelf+'_'+String(slot).padStart(2,'0');
  assert.ok(names.includes(name),'existing physical GLB mesh '+name);
 }
 const bottom=furniture.nodes.find(n=>n.name==='book_0_03');
 const top=furniture.nodes.find(n=>n.name==='book_3_03');
 assert.ok(top.position[1]>bottom.position[1]+2.5,'top shelf really is physically higher');
});
test('publication order and active book identity are identical in GLB and procedural fallback',()=>{
 const s=get('prototypes/dh-11c-room/room.js');
 for(const marker of [
  "finishedBooks.indexForMesh(shelf,b)",
  "markFeaturedBook(bk,publishedIndex);",
  "pullBooks.push(bk);",
  "const isPublished=finishedBooksEnabled&&finishedBooks.indexForMesh(shelf,b)!==null;",
  "if(isPublished||(!finishedBooksEnabled&&featuredBook(shelf,b)))",
  "books.forEach((mesh,i)=>markFeaturedBook(mesh,i));",
  "(finishedBooksEnabled?null:featuredBookIndexForMesh(mesh.name))",
  "const physicalSlot=published?finishedBooks.TOP_SHELF_SLOTS[index]:slot;",
  "if(published)return '“'+title+'” (top shelf, book '+(physicalSlot+1)+')';",
  "if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;",
  "bookExperience.show(index)"
 ])assert.ok(s.includes(marker),marker);
 // A click on one of the eight *old* highlighted meshes must no longer
 // fall back to the old name-based picker when the visitor mode is enabled.
 assert.ok(s.includes("finishedBooksEnabled?null:featuredBookIndexForMesh(mesh.name)"));
});
test('painterly titles follow top shelf publication indexes, not the eight prior art-study positions',()=>{
 const art=get('prototypes/dh-11c-room/manuscript-personality-v2.js');
 assert.ok(art.includes('finishedBooks.indexForMesh(Math.floor(id/20),id%20)'));
 assert.ok(art.includes('published?.spine||BOOK_TITLES[id]'));
 assert.ok(art.includes('published?.title||BOOK_TITLES[id]'));
 assert.equal(artist.FEATURED_TITLES.length,8,'older authored-works comparison preserved');
 assert.equal(catalog.byIndex(catalog.indexForMesh(3,3)).title,'The Legend of the Stormrider');
 assert.equal(catalog.byIndex(catalog.indexForMesh(3,10)).title,'The Duck Bread Baker');
 assert.equal(catalog.byIndex(catalog.indexForMesh(3,17)).title,'Eleanor and the Mystery of the Missing Stones');
});
test('wide book-detail pages reduce vertical stacking and scroll only when needed',()=>{
 const css=get('prototypes/dh-11c-room/book-experience.css');
 assert.ok(css.includes('width:min(1190px,calc(100vw - 42px))'));
 assert.ok(css.includes('grid-template-columns:minmax(230px,31%) minmax(0,1fr)'));
 assert.ok(css.includes('max-height:calc(100dvh - 30px)'));
 assert.ok(css.includes('overflow-y:auto;overflow-x:hidden'));
 assert.ok(css.includes('@media(max-height:670px)'));
 assert.ok(css.includes('@media(max-width:650px)'));
 assert.ok(css.includes('.published-book-facts'));
 assert.ok(css.includes('.book-buy-link--primary'));
});
test('compact prompts side-dock beside the inspected object at all desktop heights',()=>{
 const css=get('prototypes/dh-11c-room/minimal-immersive.css');
 const room=get('prototypes/dh-11c-room/room.js');
 assert.ok(css.includes('@media(min-width:640px){'));
 assert.ok(css.includes('[data-room-focus="bookcase"] .object-prompt'));
 assert.ok(css.includes('left:max(14px,env(safe-area-inset-left));right:auto;'));
 assert.ok(css.includes('body[data-minimal-ui="true"][data-room-focus] .interaction-tray'));
 assert.ok(css.includes('[data-room-focus="bookcase"] .interaction-tray'));
 assert.ok(css.includes('transform:translateY(-50%)'));
 assert.ok(room.includes('else document.body.dataset.roomFocus=id;'));
 assert.ok(room.includes("if(id==='door')delete document.body.dataset.roomFocus;"));
 assert.ok(room.includes('delete document.body.dataset.roomFocus;'));
});
test('small screens keep the 3D viewport whole, using a floating corner prompt',()=>{
 const css=get('prototypes/dh-11c-room/minimal-immersive.css');
 const room=get('prototypes/dh-11c-room/room.js');
 assert.ok(css.includes('@media(max-width:639px){'));
 assert.ok(css.includes('top:calc(86px + env(safe-area-inset-top));bottom:auto;'));
 assert.ok(css.includes('width:min(220px,49vw)'));
 assert.ok(!css.includes('[data-room-prompt="visible"] #scene-frame'));
 assert.ok(!css.includes('height:calc(100dvh - 116px)'));
 assert.ok(!css.includes('bottom:calc(116px + max('));
 assert.ok(room.includes("document.body.dataset.roomPrompt='visible';"));
 assert.ok(room.includes('delete document.body.dataset.roomPrompt;'));
});
test('canonical-only cache bust does not change earlier 3D reviews or the released main branch',()=>{
 const source=get('prototypes/dh-11c-room/index.html');
 const html=current.render(source),legacy=previous.render(source);
 assert.equal(current.VERSION,'dh11c6b2-floating-prompt-v1');
 for(const marker of [
  'DH-11C.6B.1',
  'data-finished-books="true"',
  'room.js?v=dh11c6b2-floating-prompt-v1',
  'manuscript-personality-v2.js?v=dh11c6b2-floating-prompt-v1',
  'finished-books.js?v=dh11c6b2-floating-prompt-v1',
  'book-experience.css?v=dh11c6b2-floating-prompt-v1',
  'minimal-immersive.css?v=dh11c6b2-floating-prompt-v1',
  'id="published-book-dialog"',
  'data-exit-door-proof="true"'
 ])assert.ok(html.includes(marker),marker);
 assert.ok(!legacy.includes('DH-11C.6B.1'));
 assert.ok(!legacy.includes('data-finished-books'));
 const state=JSON.parse(get('PROJECT_STATE.json'));
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.bookcaseLayoutPolish.stage,'DH-11C.6B.1');
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.bookcaseLayoutPolish.productionChanged,false);
});

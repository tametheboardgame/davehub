'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const catalogue=require('../prototypes/dh-11c-room/finished-books.js');
const artist=require('../prototypes/dh-11c-room/manuscript-personality-v2.js');
const view=require('../prototypes/dh-11c-room/book-experience.js');
const published=require('../scripts/render-dh11c6b-finished-books.cjs');
const previous=require('../scripts/render-dh11c6a-minimal-room.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('finished bookcase contains exactly three real authored publications, not manuscripts',()=>{
 assert.equal(catalogue.BOOKS.length,3);
 assert.deepEqual(catalogue.BOOKS.map(x=>x.featuredIndex),[0,1,2]);
 assert.deepEqual(catalogue.BOOKS.map(x=>x.title),[
  'The Legend of the Stormrider',
  'The Duck Bread Baker',
  'Eleanor and the Mystery of the Missing Stones'
 ]);
 assert.deepEqual(catalogue.BOOKS.map(x=>x.isbn),[
  '9781739314552','9781739314514','9781739314576'
 ]);
 assert.deepEqual(catalogue.BOOKS.map(x=>x.year),[2023,2023,2026]);
 assert.ok(catalogue.BOOKS.every(x=>x.publisher==='Cricetus Cricetus Publishing'));
 assert.ok(catalogue.BOOKS.every(x=>x.author==='David Fairbairn'));
 assert.equal(catalogue.byIndex(1).id,'duck-bread-baker');
 assert.equal(catalogue.canOpen(2),true);
 assert.equal(catalogue.canOpen(3),false);
 assert.equal(catalogue.canOpen(7),false);
 assert.equal(catalogue.byId('unknown'),null);
});
test('all external purchase and publisher links are HTTPS and every publication has a retailer option',()=>{
 for(const book of catalogue.BOOKS){
  assert.ok(book.links.some(x=>x.type==='buy'));
  assert.ok(book.links.every(x=>x.label.length>4));
  for(const link of book.links)assert.match(link.url,/^https:\/\//);
 }
 assert.ok(catalogue.byIndex(0).cover.includes('static.wixstatic.com'));
 assert.ok(catalogue.byIndex(1).cover.includes('static.wixstatic.com'));
 assert.equal(catalogue.byIndex(2).cover,null,'do not fabricate the Eleanor edition cover');
 assert.equal(view.secureUrl('javascript:alert(1)'),null);
 assert.equal(view.secureUrl('http://example.org'),null);
 assert.equal(view.secureUrl('https://www.cricetuscricetus.co.uk/'),'https://www.cricetuscricetus.co.uk/');
});
test('canonically rendered book detail is a real accessible modal, not a fake screenshot',()=>{
 const html=published.render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of [
  'DH-11C.6B','data-finished-books="true"',
  '<dialog id="published-book-dialog"','aria-labelledby="published-book-title"',
  'aria-describedby="published-book-description"',
  'id="published-book-cover"','id="published-book-cover-fallback"',
  'id="published-book-close"','id="published-book-title"',
  'id="published-book-subtitle"','id="published-book-author"',
  'id="published-book-publisher"','id="published-book-year"',
  'id="published-book-isbn"','id="published-book-links"',
  'book-experience.css','book-experience.js?v=dh11c6b1-top-shelf-ui-v1',
  'finished-books.js?v=dh11c6b1-top-shelf-ui-v1',
  'room.js?v=dh11c6b1-top-shelf-ui-v1',
  'manuscript-personality-v2.js?v=dh11c6b1-top-shelf-ui-v1',
  'data-exit-door-proof="true"','data-dark-window-preload="true"'
 ])assert.ok(html.includes(marker),marker);
 assert.ok(!html.includes('The Blood Laws'),'do not publish unpublished books as products');
 assert.ok(!html.includes('The Iron Road'),'unpublished work belongs elsewhere');
});
test('book opening uses real 3D book pulls while only the three publications remain highlighted',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of [
  "const finishedBooksEnabled=minimalUI&&document.body.dataset.finishedBooks==='true'",
  "window.DH11BookExperience?.mount({",
  "if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;",
  "if(finishedBooksEnabled&&state.books[index])bookExperience.show(index);",
  "if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;",
  "finishedBooks:finishedBooksEnabled?finishedBooks:null",
  "for(let i=0;i<(finishedBooksEnabled?finishedBooks.BOOKS.length:FEATURED_BOOK_COUNT);i++)",
  "if(id==='bookcase'&&bookIndex!==null)toggleBook(bookIndex);"
 ])assert.ok(room.includes(marker),marker);
 // Eight physical book meshes are preserved in the same GLB, but only
 // the first three carry an active published-work highlight on the canonical page.
 assert.ok(room.includes('if(finishedBooksEnabled&&!finishedBooks.canOpen(index))return;'));
 assert.ok(room.includes('pullBooks.push(bk)'));
 assert.ok(room.includes('bookHome=pullBooks.map(x=>x.position.z)'));
 const catalog=read('prototypes/dh-11c-room/manuscript-personality-v2.js');
 assert.ok(catalog.includes('const featuredIndex=FEATURED_POSITIONS.indexOf(id);'));
 assert.ok(catalog.includes('published?.spine||BOOK_TITLES[id]'));
 assert.ok(catalog.includes('published?.title||BOOK_TITLES[id]'));
 assert.equal(artist.FEATURED_TITLES.length,8,'historical V8 review contract retained');
});
test('published pages appear only on staging canonical Writing room, old preview stays unchanged',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const old=previous.render(source),now=published.render(source);
 assert.ok(!old.includes('data-finished-books'));
 assert.ok(!old.includes('published-book-dialog'));
 assert.ok(!old.includes('book-experience.js'));
 assert.ok(now.includes('data-finished-books="true"'));
 assert.equal(published.VERSION,'dh11c6b1-top-shelf-ui-v1');
 const state=JSON.parse(read('PROJECT_STATE.json'));
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.finishedBookExperience.mainChanged,false);
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.finishedBookExperience.stagingRoute,'/worlds/writing/');
});
test('the book detail view uses native dialog closing, lazy remote imagery and external link protections',()=>{
 const js=read('prototypes/dh-11c-room/book-experience.js');
 const css=read('prototypes/dh-11c-room/book-experience.css');
 for(const marker of ['dialog.showModal()','dialog.close()','dialog.addEventListener(\'close\'',
  "cover.addEventListener('error',showFallback)","a.rel='noopener noreferrer'",
  "a.target='_blank'","document.activeElement","close.focus({preventScroll:true})"])
  assert.ok(js.includes(marker),marker);
 assert.ok(css.includes('.published-book-dialog::backdrop'));
 assert.ok(css.includes('.published-book-cover-fallback'));
 assert.ok(css.includes('@media(max-width:650px)'));
});

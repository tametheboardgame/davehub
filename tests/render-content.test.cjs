'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {filesFor,renderToDisk,escapeHtml,dateLabel,VIEWS}=require('../scripts/render-content.cjs');
const root=path.join(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const fixture=read('content/examples/fictional.json');
const publicCatalogue=read('content/public/catalogue.json');
test('seven landing worlds, an index and one unique page per canonical creation',()=>{
 const files=filesFor(fixture,'/previews/dh-08b',true);
 assert.equal(files.size,8+fixture.items.length);
 for(const v of VIEWS)assert.ok(files.has('worlds/'+v.id+'/index.html'),v.id);
 for(const item of fixture.items)assert.ok(files.has('creations/'+item.slug+'/index.html'),item.slug);
});
test('approved catalogue builds three real project pages, with truly empty Music remaining empty',()=>{
 const pages=filesFor(publicCatalogue,'',false);
 assert.equal(pages.size,11);
 const games=pages.get('worlds/games/index.html');
 assert.match(games,/3 creations in this world/);
 assert.match(games,/Unicorn Valley/);
 assert.match(games,/Tame The Board Game/);
 assert.match(pages.get('worlds/music/index.html'),/Nothing has landed here yet/);
 assert.doesNotMatch(games,/Fictional design demonstration/);
});
test('fictional previews are visibly labelled and use isolated links',()=>{
 const pages=filesFor(fixture,'/previews/dh-08b',true);
 const music=pages.get('worlds/music/index.html');
 assert.match(music,/Fictional design demonstration/);
 assert.match(music,/\/previews\/dh-08b\/creations\/last-lightkeeper\//);
 assert.doesNotMatch(music,/href="\/creations\/last-lightkeeper\//);
});
test('musical page exposes story, songs, script, development notes and releases',()=>{
 const pages=filesFor(fixture,'/previews/dh-08b',true);
 const musical=pages.get('creations/last-lightkeeper/index.html');
 for(const title of ['Story, setting &amp; concepts','Listen &amp; explore the songs','Read the script &amp; scenes','The making of','Albums &amp; releases'])assert.ok(musical.includes(title),title);
 for(const slug of ['glass-harbour','lighting-the-lamp','the-harbour-myth','the-first-sketch','last-lightkeeper-concept-album'])assert.ok(musical.includes('/creations/'+slug+'/'),slug);
});
test('song and script scene lead to one another rather than duplicating content',()=>{
 const pages=filesFor(fixture,'/previews/dh-08b',true);
 assert.match(pages.get('creations/glass-harbour/index.html'),/lighting-the-lamp/);
 assert.match(pages.get('creations/lighting-the-lamp/index.html'),/glass-harbour/);
});
test('Memory Lane sorts known approximate dates and allows unknown dates',()=>{
 const pages=filesFor(fixture,'',true);
 const lane=pages.get('worlds/memory-lane/index.html');
 assert.match(lane,/c\. 2011/);
 assert.equal(dateLabel({}), 'Date unknown');
 assert.equal(dateLabel({period:{fromYear:2001,approximate:true}}),'c. 2001');
});
test('escaped source strings never become executable HTML',()=>{
 assert.equal(escapeHtml('<img src=x onerror="evil()">'),'&lt;img src=x onerror=&quot;evil()&quot;&gt;');
 const malicious=structuredClone(fixture);
 malicious.items[0].title='<script>alert(1)</script>';
 const pages=filesFor(malicious,'/previews/dh-08b',true);
 const content=pages.get('worlds/music/index.html');
 assert.ok(content.includes('&lt;script&gt;'));
 assert.doesNotMatch(content,/<script>alert/);
});
test('disk renderer isolates real and fictional outputs',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'davehub-pages-'));
 try{
  const live=path.join(temp,'live');
  const demo=path.join(temp,'preview');
  const one=renderToDisk(path.join(root,'content/public/catalogue.json'),live,'',false);
  const two=renderToDisk(path.join(root,'content/examples/fictional.json'),demo,'/previews/dh-08b',true);
  assert.equal(one.creations,0);
  assert.equal(two.creations,fixture.items.length);
  assert.ok(fs.existsSync(path.join(live,'worlds/music/index.html')));
  assert.ok(!fs.existsSync(path.join(live,'creations/last-lightkeeper/index.html')));
  assert.ok(fs.existsSync(path.join(demo,'creations/last-lightkeeper/index.html')));
 } finally{fs.rmSync(temp,{recursive:true,force:true})}
});

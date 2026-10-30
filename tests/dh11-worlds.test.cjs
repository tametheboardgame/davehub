'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {filesFor}=require('../scripts/render-content.cjs');
const fixture=require('../content/examples/fictional.json');
const approved=require('../content/public/catalogue.json');
const css=fs.readFileSync(path.join(__dirname,'../assets/content/dh11-worlds.css'),'utf8');
const view=(name,data=fixture,root='/previews/dh-08b',preview=true)=>
 filesFor(data,root,preview).get('worlds/'+name+'/index.html');

test('all five creative destinations get distinct, accessible theme landmarks',()=>{
 for(const name of ['writing','music','experiments','unfinished','memory-lane']){
  const page=view(name);
  assert.match(page,new RegExp('class="dh11-theme dh11-theme--'+name+'"'),name);
  assert.match(page,new RegExp('class="dh11-world dh11-world--'+name+'"'),name);
  assert.match(page,new RegExp('href="/previews/dh-08b/worlds/'+name+'/" aria-current="page"'),name);
  assert.match(page,/Fictional design demonstration/);
  assert.match(page,/data-davehub-inline="worlds"/);
  assert.match(page,/<main id="main">/);
 }
 assert.equal(new Set(['dh11-writing-layout','dh11-stage','dh11-laboratory','dh11-shelf-room','dh11-timeline']).size,5);
});
test('Writing is a manuscript hoard with piles rather than a tidy reading desk',()=>{
 const html=view('writing');
 for(const marker of ['THE MANUSCRIPT HOARD','The paper has won.','dh11-hoard-room',
  'dh11-hoard-illustration','Start rummaging','id="dh11-writing-piles"',
  'On top of the pile','Loose fragments','Notes from stranger worlds',
  'Characters &amp; scenes','Things nearly lost','dh11-manuscript--bundle',
  'dh11-manuscript--scrap','dh11-manuscript--notebook','dh11-manuscript--script',
  'Rummage beneath this pile','<details','<summary']){
   assert.ok(html.includes(marker),marker);
 }
 assert.doesNotMatch(html,/dh11-writing-index|On the reading desk|THE READING ROOM/);
 assert.match(html,/href="\/previews\/dh-08b\/creations\/last-lightkeeper\/"/);
 assert.match(html,/href="\/previews\/dh-08b\/creations\/the-clock-of-tomorrow\/"/);
 assert.doesNotMatch(html,/href="\/creations\/the-clock-of-tomorrow\/"/);
});
test('Writing preserves every approved creation once, regardless of how deeply it is buried',()=>{
 const html=view('writing');
 const writingItems=fixture.items.filter(x=>x.views.includes('writing'));
 const links=[...html.matchAll(/href="\/previews\/dh-08b\/creations\/([^/]+)\/"/g)]
   .map(m=>m[1]);
 assert.equal(links.length,writingItems.length);
 assert.equal(new Set(links).size,writingItems.length);
 assert.deepEqual(new Set(links),new Set(writingItems.map(x=>x.slug)));
 assert.ok((html.match(/<details class="dh11-hoard-rummage">/g)||[]).length>=2);
 assert.ok((html.match(/<summary>/g)||[]).length>=2);
 assert.match(html,/aria-labelledby="dh11-pile-fragments"/);
 assert.match(html,/aria-labelledby="dh11-pile-worlds"/);
});
test('Writing handles a truly empty catalogue and one existing approved work without fake links',()=>{
 const empty=view('writing',{schemaVersion:1,items:[]},'',false);
 assert.match(empty,/0 approved pieces/);
 assert.match(empty,/No approved writing in this pile/);
 assert.match(empty,/dh11-hoard-blank/);
 assert.doesNotMatch(empty,/href="\/creations\//);
 const live=view('writing',approved,'',false);
 assert.match(live,/Tame The Board Game/);
 assert.match(live,/1 approved piece/);
 assert.match(live,/href="\/creations\/tame-the-board-game\/"/);
 assert.doesNotMatch(live,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour/);
 assert.doesNotMatch(live,/<details class="dh11-hoard-rummage">/);
});
test('Writing resists malicious source content even inside buried pages',()=>{
 const altered=structuredClone(fixture);
 altered.items.find(x=>x.id==='lightkeeper-making-notes').title='<script>alert(1)</script>';
 const html=view('writing',altered);
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
});
test('Music provides a musical-first listening room with no unapproved audio',()=>{
 const html=view('music');
 for(const marker of ['THE LISTENING ROOM','dh11-stage','dh11-vinyl','dh11-music-cards','The Last Lightkeeper','Glass Harbour'])
  assert.ok(html.includes(marker),marker);
 assert.match(html,/href="\/previews\/dh-08b\/creations\/last-lightkeeper\/"/);
 assert.doesNotMatch(html,/<audio\b|autoplay\s*=|<iframe\b/i);
});
test('Experiments renders a genuine distinct laboratory even when the catalogue is empty',()=>{
 const html=view('experiments');
 assert.match(html,/THE INVENTION CHAMBER/);
 assert.match(html,/dh11-lab-machine/);
 assert.match(html,/workbench is deliberately empty/);
 assert.match(html,/The illustrated instrument is decorative/);
 assert.doesNotMatch(html,/href="\/creations\/[^"]+"/);
});
test('Unfinished Shelf is a permanent archive, not a completion or roadmap promise',()=>{
 const html=view('unfinished');
 assert.match(html,/THE ARCHIVE SHELF/);
 assert.match(html,/ARCHIVED, NOT A TO-DO LIST/);
 assert.match(html,/dh11-spine/);
 assert.match(html,/The Clock of Tomorrow/);
 assert.match(html,/c\. 2011/);
 assert.doesNotMatch(html,/Coming soon|completion percentage|launch date/i);
});
test('Memory Lane uses dated chronology and explicitly allows undated approved entries',()=>{
 const c=structuredClone(fixture);
 c.items.find(x=>x.slug==='glass-harbour').views.push('memory-lane');
 const html=view('memory-lane',c);
 assert.match(html,/THE TIME CORRIDOR/);
 assert.match(html,/dh11-timeline/);
 assert.ok(html.indexOf('c. 2011')<html.indexOf('Date unknown'));
 assert.match(html,/href="\/previews\/dh-08b\/creations\/glass-harbour\/"/);
});
test('approved worlds have thematic empty states and do not inherit fictional works',()=>{
 for(const name of ['writing','music','experiments','unfinished','memory-lane']){
  const html=view(name,approved,'',false);
  assert.match(html,/dh11-world/);
  assert.doesNotMatch(html,/Fictional design demonstration/);
  assert.doesNotMatch(html,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour/);
 }
 const music=view('music',approved,'',false);
 assert.match(music,/The stage is ready/);
 assert.doesNotMatch(music,/<audio\b|autoplay\s*=/i);
 const experiments=view('experiments',approved,'',false);
 assert.match(experiments,/No approved experiments yet/);
});
test('world-specific user text remains escaped, never executable HTML',()=>{
 const altered=structuredClone(fixture);
 altered.items[0].title='<img src=x onerror=alert(1)>';
 const html=view('music',altered);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/<img src=x/);
});
test('themes support small screens, keyboard focus and reduced-motion preferences',()=>{
 for(const marker of [
  '@media(max-width:900px)','@media(max-width:680px)','@media(prefers-reduced-motion:reduce)',
  '.dh11-writing-layout','.dh11-stage','.dh11-laboratory','.dh11-shelf-room','.dh11-timeline',
  ':focus-visible'
 ])assert.ok(css.includes(marker),marker);
 for(const marker of ['.dh11-hoard-room','.dh11-hoard-piles','.dh11-manuscript',
  '.dh11-hoard-rummage[open]','summary:focus-visible','.dh11-hoard-pile:focus-within',
  '.dh11-hoard-blank','.dh11-manuscript:hover'])
  assert.ok(css.includes(marker),marker);
 assert.doesNotMatch(css,/@import|url\(\s*['"]?https?:/);
});

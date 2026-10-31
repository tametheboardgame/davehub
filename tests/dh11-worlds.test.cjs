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
test('Writing is an explorable scene with five object interactions and an exit',()=>{
 const html=view('writing');
 for(const marker of ['data-scene="manuscript-hoard"','The Manuscript Hoard',
  'room-stage-image','manuscript-room-v1.avif','room-navigation','room-pan',
  'room-dialog','<dialog','<script data-davehub-inline="room">',
  'data-room-target="desk"','data-room-target="cabinet"','data-room-target="bin"',
  'data-room-target="bookcase"','data-room-target="typewriter"',
  'data-room-panel="desk"','data-room-panel="cabinet"','data-room-panel="bin"',
  'data-room-panel="bookcase"','data-room-panel="typewriter"','class="room-hotspot room-hotspot--exit"']){
  assert.ok(html.includes(marker),marker);
 }
 assert.doesNotMatch(html,/<div class="dh11-hoard-room"|<div class="intro"/);
 assert.match(html,/href="\/"/);
 assert.match(html,/role="region" aria-label="Illustrated Writing island/);
});
test('Writing binds every approved work to exactly one close-up; no duplicate cards or fake titles',()=>{
 const html=view('writing');
 const writing=fixture.items.filter(i=>i.views.includes('writing'));
 const links=[...html.matchAll(/href="\/previews\/dh-08b\/creations\/([^/]+)\/"/g)].map(m=>m[1]);
 assert.deepEqual(new Set(links),new Set(writing.map(x=>x.slug)));
 assert.equal(links.length,writing.length);
 assert.match(html,/data-room-panel="desk"/);
 assert.match(html,/data-room-panel="bin"/);
 assert.match(html,/data-room-panel="bookcase"/);
 assert.match(html,/data-room-panel="typewriter"/);
 assert.match(html,/Fictional design demonstration/);
 assert.doesNotMatch(html,/href="\/creations\/last-lightkeeper\/"/);
});
test('Writing with one real approved item does not leak unpublished books',()=>{
 const live=view('writing',approved,'',false);
 assert.match(live,/Tame The Board Game/);
 assert.match(live,/1 approved piece hidden here/);
 assert.match(live,/href="\/creations\/tame-the-board-game\/"/);
 assert.doesNotMatch(live,/The Last Lightkeeper|The Clock of Tomorrow|Glass Harbour/);
 const empty=view('writing',{schemaVersion:1,items:[]},'',false);
 assert.match(empty,/0 approved pieces hidden here/);
 assert.match(empty,/The desk is buried beneath paper/);
 assert.doesNotMatch(empty,/href="\/creations\//);
});
test('Writing scene keeps source names escaped, preserving a real keyboard-accessible route',()=>{
 const data=structuredClone(fixture);
 data.items.find(w=>w.id==='lightkeeper-making-notes').title='<script>alert(1)</script>';
 const html=view('writing',data);
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
 assert.match(html,/<button type="button" class="room-dialog-close"/);
 assert.match(html,/aria-label="Return to DaveHub islands"/);
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

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {render}=require('../scripts/render-dh11c6e1-visible-uncrumple.cjs');
const finished=require('../prototypes/dh-11c-room/finished-books.js');
const scraps=require('../prototypes/dh-11c-room/discarded-ideas.js');
const cabinet=require('../prototypes/dh-11c-room/cabinet-catalogue.js');
const manuscripts=require('../prototypes/dh-11c-room/manuscript-experience.js');
const source=read('prototypes/dh-11c-room/index.html');
const html=render(source);
test('complete owner-approved Writing Room is assembled from the original 3D scene',()=>{
 for(const marker of [
  'data-writing-world="true"','data-minimal-ui="true"','data-dark-window-preload="true"',
  'data-exit-door-proof="true"','data-finished-books="true"',
  'data-manuscript-experience="true"','data-motion-first="true"',
  'data-cabinet-archive="true"','data-cabinet-tray="true"',
  'data-discarded-ideas="true"','data-uncrumple-direct="true"',
  'published-book-dialog','manuscript-dialog','workshop-dialog',
  'archive-folder-dialog','archive-tray-dialog','discarded-dialog',
  'DH-11C.6E.1','room.js?v=dh11c6e-wastepaper-v1'
 ])assert.ok(html.includes(marker),marker);
 assert.ok(!html.includes('data-scene="manuscript-hoard"'));
 assert.ok(!html.includes('room-stage-image'));
 assert.ok(!html.includes('data-scene="fake-3d"'));
});
test('actual 3D room, reversible furniture physics, and 180ms motion-first gating survive promotion',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of [
  'cabinetFolders.attach(found)','cabinetFolders.update(rate)',
  'revealCabinetDrawerAfterMotion();','revealCabinetFolderAfterMotion();',
  'revealDiscardedIdeaAfterMotion();','revealAfterPhysicalMotion();',
  'binPaperProgress[i]=target>binPaperProgress[i]',
  'const pose=binPaperPose(binPaperHomes[i],i,binPaperProgress[i])',
  'manuscriptExperience.openManuscript(index)',
  'manuscriptExperience.openWorkshop()',
  'pendingBinReveal=null','pendingDrawerReveal=null'
 ])assert.ok(room.includes(marker),marker);
 assert.ok(read('prototypes/dh-11c-room/reveal-after-motion.mjs').includes('REVEAL_HOLD_SECONDS'));
 const requiredModels=['cabinet-blender-verified.glb.deflate.b64','room-shell-blender-verified.glb.deflate.b64'];
 for(const name of requiredModels)assert.ok(fs.statSync(path.join(root,'assets/worlds/writing/3d/models',name)).size>2000);
});
test('no new or private work enters the visitor experience via promotion',()=>{
 assert.equal(finished.BOOKS.length,3);
 const archive=cabinet.create({books:finished,manuscripts:manuscripts.MANUSCRIPTS});
 assert.equal(archive.inDrawer(0).length,3);
 assert.equal(archive.items.length,12);
 assert.ok(archive.items.filter(x=>x.kind!=='Published book').every(x=>
  x.kind==='Fictional demonstration'&&x.id.startsWith('demo-')));
 assert.equal(scraps.ITEMS.length,9);
 assert.ok(scraps.ITEMS.every(x=>x.kind==='Fictional demonstration'&&x.id.startsWith('demo-')));
 assert.equal(manuscripts.MANUSCRIPTS.length,3);
 assert.ok(manuscripts.MANUSCRIPTS.every(x=>x.kind==='Fictional demonstration'));
});
test('uncrumple call to action is directly visible and pointer/keyboard accessible',()=>{
 const start=html.indexOf('<section class="discarded-stage"');
 const end=html.indexOf('</section>',start);
 const stage=html.slice(start,end);
 assert.ok(stage.includes('<button id="discarded-folded" class="discarded-crumple"'));
 assert.ok(stage.includes('aria-label="Uncrumple paper and read the recovered idea"'));
 assert.ok(stage.includes('<button id="discarded-unfold" class="discarded-unfold" type="button">Uncrumple paper</button>'));
 assert.ok(stage.indexOf('id="discarded-unfold"')<stage.indexOf('id="discarded-sheet"'));
 assert.equal(html.match(/id="discarded-unfold"/g)?.length,1);
 assert.ok(read('prototypes/dh-11c-room/discarded-ideas.js').includes("folded.addEventListener('click',smooth)"));
});
test('release builder contains only the approved room plus its required reader assets',()=>{
 const builder=read('scripts/build-writing-room-release.cjs');
 assert.ok(builder.includes("require('./render-dh11c6e1-visible-uncrumple.cjs')"));
 assert.ok(builder.includes("'book-experience.css'"));
 assert.ok(builder.includes("'manuscript-experience.css'"));
 assert.ok(builder.includes("'cabinet-experience.css'"));
 assert.ok(builder.includes("'cabinet-tray.css'"));
 assert.ok(builder.includes("'discarded-ideas.css'"));
 for(const pathpart of ['scripts/render-dh11c6b-finished-books.cjs',
  'scripts/render-dh11c6c1-reader-workshop.cjs',
  'scripts/render-dh11c6c2-motion-first.cjs',
  'scripts/render-dh11c6d3-filing-cabinet.cjs',
  'scripts/render-dh11c6d4-cabinet-tray.cjs',
  'scripts/render-dh11c6e-wastepaper-bin.cjs',
  'scripts/render-dh11c6e1-visible-uncrumple.cjs'])
  assert.ok(fs.statSync(path.join(root,pathpart)).size>200);
});
test('DH-09D main branch release and game auto-sync safety controls are untouched',()=>{
 const topology=JSON.parse(read('config/deployment-topology.json'));
 const sync=JSON.parse(read('config/game-auto-sync-policy.json'));
 assert.equal(topology.phase,'staging_cutover');
 assert.equal(topology.staging.branch,'staging');
 assert.equal(topology.production.branch,'main');
 assert.equal(topology.production.configured,false);
 assert.equal(topology.automaticGameUpdates.branch,'staging');
 assert.equal(topology.automaticGameUpdates.livePromotion,false);
 assert.equal(sync.stagingBranch,'staging');
 assert.equal(sync.liveDomainConfigured,false);
 assert.equal(sync.autoLivePromotion,false);
});

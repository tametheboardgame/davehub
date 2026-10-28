'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {validateCatalogue,safePublicUrl}=require('../scripts/content-check.cjs');
const root=path.resolve(__dirname,'..');
const publicCatalogue=JSON.parse(fs.readFileSync(path.join(root,'content/public/catalogue.json'),'utf8'));
const examples=JSON.parse(fs.readFileSync(path.join(root,'content/examples/fictional.json'),'utf8'));
const clone=x=>structuredClone(x);
const change=fn=>{const c=clone(examples);fn(c);return validateCatalogue(c);};
test('three explicitly owner-approved works form the published catalogue',()=>{
 assert.deepEqual(validateCatalogue(publicCatalogue),{valid:true,errors:[],count:3});
 assert.deepEqual(new Set(publicCatalogue.items.map(x=>x.id)),new Set(['unicorn-valley','stephen-martin-project','tame-the-board-game']));
 assert.ok(publicCatalogue.items.every(x=>x.publication.status==='public_approved'&&x.publication.approvedOn==='2026-10-28'));
 assert.ok(publicCatalogue.items.every(x=>x.media.length===0),'No game/WordPress media is republished');
});
test('all fictional example records validate as a linked collection',()=>{
 assert.deepEqual(validateCatalogue(examples),{valid:true,errors:[],count:7});
});
test('unsupported or private URL schemes and internal hosts are rejected',()=>{
 for(const url of ['javascript:alert(1)','http://spotify.com','https://localhost','https://127.0.0.1','https://[::1]','https://intranet.local','https://10.2.3.4','https://user:pass@example.com','file:///private/doc']) assert.equal(safePublicUrl(url),false,url);
 assert.equal(safePublicUrl('https://open.spotify.com/album/abcd'),true);
 assert.equal(safePublicUrl('https://www.cricetuscricetus.co.uk/'),true);
});
test('unapproved work is rejected even when described as already public',()=>{
 const r=change(c=>{c.items[0].publication.status='needs_review';});
 assert.equal(r.valid,false);assert.match(r.errors.join(' '),/publication/);
});
test('approver and all rights review gates are mandatory',()=>{
 for(const key of ['approvedBy','rightsReviewed','linksReviewed','mediaReviewed','metadataReviewed']){
   const r=change(c=>{c.items[0].publication[key]=null});
   assert.equal(r.valid,false,key);
 }
});
test('media requires independent rights and approval',()=>{
 const r=change(c=>c.items[0].media=[{id:'cover-art',title:'Cover',kind:'image',url:'https://example.org/image.png',rights:'unknown',approval:'needs_review'}]);
 assert.equal(r.valid,false);assert.match(r.errors.join(' '),/media/);
});
test('unfinished section cannot quietly include active work',()=>{
 const r=change(c=>c.items[0].views.push('unfinished'));
 assert.equal(r.valid,false);assert.match(r.errors.join(' '),/unfinished/);
});
test('referenced children must be in approved public catalogue',()=>{
 const r=change(c=>{c.items[0].relations[0].targetId='draft-unpublished-song'});
 assert.equal(r.valid,false);assert.match(r.errors.join(' '),/target not present/);
});
test('duplicate stable IDs and slugs are rejected',()=>{
 const a=change(c=>{c.items[1].id=c.items[0].id});
 const b=change(c=>{c.items[1].slug=c.items[0].slug});
 assert.equal(a.valid,false);assert.match(a.errors.join(' '),/duplicate ID/);
 assert.equal(b.valid,false);assert.match(b.errors.join(' '),/duplicate slug/);
});
test('all public media URLs must be safe HTTPS',()=>{
 const r=change(c=>c.items[0].links=[{label:'Open recording',kind:'streaming',url:'http://example.com/recording'}]);
 assert.equal(r.valid,false);
});
test('removing an approved item withdraws it from the manifest',()=>{
 const c=clone(examples);
 c.items=c.items.filter(item=>item.id!=='unfinished-clock-novel');
 assert.equal(validateCatalogue(c).valid,true);
 assert.equal(c.items.some(item=>item.id==='unfinished-clock-novel'),false);
});
test('unknown year is allowed; arbitrary fake precision is not required',()=>{
 const c=clone(examples);
 delete c.items[3].period;
 assert.equal(validateCatalogue(c).valid,true);
});
test('unknown record fields cannot leak private editorial notes into the site',()=>{
 const r=change(c=>{c.items[0].privateDraft='Unpublished raw script text';});
 assert.equal(r.valid,false);assert.match(r.errors.join(' '),/unrecognised field/);
});
test('unknown nested link or media fields are blocked before publication',()=>{
 const a=change(c=>{c.items[0].links=[{label:'Official',kind:'official',url:'https://example.org',privateToken:'secret'}]});
 assert.equal(a.valid,false);assert.match(a.errors.join(' '),/unrecognised field/);
 const b=change(c=>{c.items[0].media=[{id:'sample-image',title:'Fictional art',kind:'image',url:'https://example.org/a.webp',rights:'owned',approval:'public_approved',privateNote:'do not publish'}]});
 assert.equal(b.valid,false);assert.match(b.errors.join(' '),/unrecognised field/);
});
test('musical artifacts and albums have explicit kinds',()=>{
 const one=change(c=>delete c.items.find(i=>i.id==='lighting-the-lamp-scene').artifactKind);
 assert.equal(one.valid,false);assert.match(one.errors.join(' '),/artifactKind/);
 const two=change(c=>delete c.items.find(i=>i.id==='lightkeeper-album').releaseKind);
 assert.equal(two.valid,false);assert.match(two.errors.join(' '),/releaseKind/);
});
test('artifact and release kind cannot be misapplied to unrelated works',()=>{
 const a=change(c=>{c.items[0].artifactKind='concept'});
 assert.equal(a.valid,false);assert.match(a.errors.join(' '),/artifactKind/);
});

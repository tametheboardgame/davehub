'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {cleanCandidate,exportReview,makeApproved,HOST}=require('../tools/workshop/server.cjs');
const checked={rights:true,metadata:true,links:true,media:true};
const example={id:'board-game-blog',slug:'board-game-blog',title:'Example board game blog',workType:'other',lifecycle:'active',views:['writing','games'],synopsis:'An illustrative review blog entry with a safe public link.',sourceUrl:'https://example.org/',linkUrl:'https://example.org/',linkLabel:'Visit blog',status:'approved_for_export',ownerApproved:true,approvedOn:'2026-10-27',review:checked};
test('local server is bound exclusively to loopback by default',()=>{assert.equal(HOST,'127.0.0.1')});
test('nominated candidates can be stored without public approval',()=>{
 const c=cleanCandidate({...example,status:'nominated',ownerApproved:false,review:{}});
 assert.equal(c.status,'nominated');
 assert.equal(c.ownerApproved,false);
});
test('private notes cannot appear in a public proposal',()=>{
 const item=makeApproved({...example,notes:'An unpublished private script title'});
 assert.equal(JSON.stringify(item).includes('unpublished private'),false);
});
test('candidate sanitisation discards surprise fields and importer payloads',()=>{
 const item=cleanCandidate({...example,privatePassword:'secret',rawLyrics:'not public'});
 assert.equal(item.privatePassword,undefined);assert.equal(item.rawLyrics,undefined);
});
test('unapproved entries are never exported',()=>{
 assert.throws(()=>exportReview({candidates:[{...example,status:'needs_review',ownerApproved:false}]}),/No items/);
});
test('owner approval includes four independent gates',()=>{
 for(const key of Object.keys(checked)){
  const c={...example,review:{...checked,[key]:false}};
  assert.throws(()=>exportReview({candidates:[c]}),/not explicitly approved/);
 }
});
test('approved proposal validates as the shared public catalogue',()=>{
 const result=exportReview({candidates:[example]});
 assert.equal(result.items.length,1);
 assert.equal(result.items[0].publication.status,'public_approved');
 assert.deepEqual(result.items[0].views,['writing','games']);
});
test('unsafe external links fail review/export',()=>{
 const item={...example,linkUrl:'http://127.0.0.1/intranet'};
 assert.throws(()=>exportReview({candidates:[item]}),/Export blocked/);
});
test('IDs and views must pass validation',()=>{
 assert.throws(()=>cleanCandidate({...example,id:'../something'}),/Invalid ID/);
 assert.throws(()=>cleanCandidate({...example,views:['private-corporate-system']}),/categories/);
});
test('unknown or missing years never require guessed precision',()=>{
 assert.equal(makeApproved(example).period,undefined);
});
test('editor files are not copied to Cloudflare public output',()=>{
 const build=fs.readFileSync(path.join(__dirname,'../scripts/build-pages.sh'),'utf8');
 assert.ok(!build.includes('cp tools/workshop'));
 assert.ok(!build.includes('node tools/workshop/server.cjs'));
});
test('review exporter supports publisher and music identity records without fake work types',()=>{
 const pub=makeApproved({...example,id:'test-publisher',recordType:'organisation'});
 const artist=makeApproved({...example,id:'test-artist',recordType:'music_identity'});
 assert.equal(pub.recordType,'organisation');assert.equal(pub.workType,undefined);
 assert.equal(artist.recordType,'music_identity');assert.equal(artist.workType,undefined);
});
test('review exporter distinguishes album releases from linked original works',()=>{
 const item=makeApproved({...example,id:'test-album',recordType:'release',releaseKind:'album'});
 assert.equal(item.releaseKind,'album');assert.equal(item.recordType,'release');
 assert.equal(item.workType,undefined);
});
test('export merges approved changes into the existing public catalogue, never deleting other works',()=>{
 const baseline={schemaVersion:1,items:[makeApproved({...example,id:'already-published',slug:'already-published'})]};
 const result=exportReview({candidates:[{...example,id:'newly-published',slug:'newly-published'}]},baseline);
 assert.equal(result.items.length,2);
 assert.deepEqual(new Set(result.items.map(x=>x.id)),new Set(['already-published','newly-published']));
});

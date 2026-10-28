'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {cleanCandidate,importCandidates,previewCatalogue,exportReview,makeApproved,publicLinks,HOST}=require('../tools/workshop/server.cjs');
const {firstWave}=require('../tools/workshop/first-wave.cjs');
const {readiness}=require('../tools/workshop/review-readiness.cjs');
const {validateCatalogue}=require('../scripts/content-check.cjs');
const {filesFor}=require('../scripts/render-content.cjs');
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
 assert.throws(()=>exportReview({candidates:[item]}),/Unsafe primary link URL/);
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

test('the agreed first-wave works are nominations, NEVER public approvals',()=>{
 assert.deepEqual(firstWave.map(x=>x.id).sort(),['stephen-martin-project','tame-the-board-game','unicorn-valley']);
 for(const item of firstWave){
  assert.equal(item.status,'needs_review');
  assert.equal(item.ownerApproved,false);
  assert.ok(Object.values(item.review).every(x=>x===false));
  assert.equal(item.approvedOn,'');
  assert.ok(item.sourceUrl.startsWith('https://'));
 }
 assert.match(firstWave.find(x=>x.id==='tame-the-board-game').synopsis,/Miriam/);
});
test('first-wave seed is idempotent and does not mutate existing editorial work',()=>{
 const initial={schemaVersion:1,candidates:[]};
 const once=importCandidates(initial,firstWave);
 assert.equal(once.added,3);assert.equal(once.skipped,0);
 const edited=once.candidates.map(x=>x.id==='unicorn-valley'?{...x,notes:'I edited this locally'}:x);
 const twice=importCandidates({schemaVersion:1,candidates:edited},firstWave);
 assert.equal(twice.added,0);assert.equal(twice.skipped,3);
 assert.equal(twice.candidates.find(x=>x.id==='unicorn-valley').notes,'I edited this locally');
 assert.equal(initial.candidates.length,0);
});
test('an imported approved flag is always stripped before persistence',()=>{
 const nominated={...firstWave[0],status:'approved_for_export',ownerApproved:true,approvedOn:'2026-10-28',
  review:{rights:true,metadata:true,links:true,media:true}};
 const result=importCandidates({candidates:[]},[nominated]).candidates[0];
 assert.equal(result.status,'needs_review');assert.equal(result.ownerApproved,false);
 assert.equal(result.approvedOn,'');assert.ok(Object.values(result.review).every(x=>!x));
});
test('source ownership collisions and duplicate public slugs are rejected',()=>{
 const existing=importCandidates({candidates:[]},firstWave);
 assert.throws(()=>importCandidates(existing,[{...firstWave[0],id:'other-id',slug:'other-id'}]),/Source URL already belongs/);
 assert.throws(()=>importCandidates(existing,[{...firstWave[0],id:'new-id',sourceUrl:'https://example.org/new-source'}]),/Duplicate public slug/);
 assert.throws(()=>importCandidates(existing,[{...firstWave[0],sourceUrl:'https://github.com/someoneelse/unicorn-valley'}]),/Conflicting source/);
});
test('failed import batches are atomic and the source store is unchanged',()=>{
 const store={schemaVersion:1,candidates:[]};
 const entries=[firstWave[0],{...firstWave[1],sourceUrl:'javascript:alert(1)'}];
 assert.throws(()=>importCandidates(store,entries),/Unsafe source/);
 assert.equal(store.candidates.length,0);
});
test('preview renders three real pages without granting publication',()=>{
 const store=importCandidates({candidates:[]},firstWave);
 const manifest=previewCatalogue(store);
 assert.equal(manifest.items.length,3);
 for(const item of manifest.items)assert.equal('publication' in item,false);
 assert.equal(validateCatalogue(manifest).valid,false);
 const pages=filesFor(manifest,'',false);
 for(const id of ['unicorn-valley','stephen-martin-project','tame-the-board-game']){
  const html=pages.get('creations/'+id+'/index.html');
  assert.ok(html&&html.includes('<!doctype html>'));
  assert.ok(html.includes('DaveHub'));
 }
 assert.ok(pages.get('worlds/games/index.html').includes('Unicorn Valley'));
});
test('preview cannot render unsafe external URLs or injected markup',()=>{
 const record={...firstWave[0],synopsis:'<script>alert("unsafe")</script>'};
 const manifest=previewCatalogue(importCandidates({candidates:[]},[record]));
 const html=filesFor(manifest,'',false).get('creations/unicorn-valley/index.html');
 assert.equal(html.includes('<script>alert'),false);
 assert.ok(html.includes('&lt;script&gt;'));
 assert.throws(()=>importCandidates({candidates:[]},[{...firstWave[0],linkUrl:'javascript:alert(1)'}]),/Unsafe primary link URL/);
});
test('public content stays empty while the first wave awaits explicit final approval',()=>{
 const root=path.resolve(__dirname,'..');
 const publicData=JSON.parse(fs.readFileSync(path.join(root,'content/public/catalogue.json'),'utf8'));
 assert.equal(publicData.items.length,0,'Owner has not approved publication of the three projects');
 const build=fs.readFileSync(path.join(root,'scripts/build-pages.sh'),'utf8');
 assert.ok(!build.includes('cp tools/workshop'));
 assert.ok(!build.includes('first-wave.cjs dist'));
});

test('first-wave readiness reports all outstanding owner checks without conferring approvals',()=>{
 const notPrepared=readiness({schemaVersion:1,candidates:[]});
 assert.equal(notPrepared.total,3);assert.equal(notPrepared.prepared,0);assert.equal(notPrepared.readyForProposal,0);
 const seeded=importCandidates({schemaVersion:1,candidates:[]},firstWave);
 const state=readiness(seeded);
 assert.equal(state.total,3);
 assert.equal(state.prepared,3);
 assert.equal(state.readyForProposal,0);
 for(const item of state.items){
  assert.equal(item.checked,0);
  assert.equal(item.readyForProposal,false);
  assert.ok(item.openChecks.some(x=>/owner sign-off/.test(x)));
  assert.ok(item.openChecks.some(x=>/Destination links/.test(x)));
 }
});
test('readiness is read-only and flags partially reviewed candidates accurately',()=>{
 const baseline=importCandidates({schemaVersion:1,candidates:[]},firstWave);
 const snapshot=JSON.stringify(baseline);
 const partly={...baseline.candidates[0],review:{rights:true,metadata:true,links:false,media:false}};
 const state=readiness({candidates:[partly,...baseline.candidates.slice(1)]});
 assert.equal(state.items[0].checked,2);
 assert.equal(state.items[0].readyForProposal,false);
 assert.equal(JSON.stringify(baseline),snapshot,'Readiness must not mutate any candidate');
 assert.throws(()=>readiness({candidates:'not-an-array'}),/Invalid local candidate store/);
});
test('readiness cannot mistake incomplete approvals for a publication proposal',()=>{
 const original={...firstWave[0],
  review:{rights:true,metadata:true,links:true,media:true},
  ownerApproved:false,status:'approved_for_export',approvedOn:''};
 const state=readiness({candidates:[original]});
 assert.equal(state.readyForProposal,0);
 assert.ok(state.items[0].openChecks.some(x=>/owner sign-off/.test(x)));
});
test('review dashboard and unsaved-edits handling are included in the local interface',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'tools/workshop/index.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'tools/workshop/app.js'),'utf8');
 assert.match(html,/id="review-cards"/);
 assert.match(html,/id="draft-state"/);
 assert.match(js,/Discard unsaved edits/);
 assert.match(js,/if\(dirty\)throw Error/);
});

test('all three first-wave previews have two distinct and attributed destination links',()=>{
 const preview=previewCatalogue(importCandidates({candidates:[]},firstWave));
 const mapping=new Map(preview.items.map(i=>[i.id,i]));
 for(const id of ['unicorn-valley','stephen-martin-project']){
  const links=mapping.get(id).links;
  assert.equal(links.length,2);
  assert.equal(links[0].kind,'play');
  assert.equal(links[1].kind,'repository');
  assert.match(links[1].url,/github\.com\/tametheboardgame\//);
 }
 const blog=mapping.get('tame-the-board-game');
 assert.equal(blog.links.length,2);
 assert.equal(blog.links[1].url,'https://tametheboardgame.com/about/');
 assert.equal(blog.links[1].label,"Meet the blog's co-creators");
 assert.equal(blog.links[1].kind,'read');
 assert.ok(preview.items.every(i=>!('publication' in i)));
});
test('additional links are validated on draft save and cannot contain unsafe URLs',()=>{
 const source=firstWave[0];
 assert.throws(()=>cleanCandidate({...source,extraLinkUrl:'javascript:alert(1)',extraLinkLabel:'Danger'}),/Unsafe additional link URL/);
 assert.throws(()=>cleanCandidate({...source,extraLinkUrl:'https://example.org/',extraLinkLabel:''}),/Additional link needs a label/);
 assert.throws(()=>cleanCandidate({...source,extraLinkLabel:'Orphan link'}),/needs a URL/);
 assert.throws(()=>cleanCandidate({...source,extraLinkUrl:'https://example.org/',extraLinkLabel:'Valid',extraLinkKind:'javascript'}),/Invalid public link kind/);
});
test('duplicate source links do not render twice and no source permissions are inferred',()=>{
 const item=cleanCandidate({...firstWave[0],extraLinkUrl:firstWave[0].sourceUrl,extraLinkLabel:'Same repository',extraLinkKind:'repository'});
 const links=publicLinks(item);
 assert.equal(links.length,2);
 assert.equal(links.filter(l=>l.url===firstWave[0].sourceUrl).length,1);
 assert.equal(item.ownerApproved,false);
});
test('owner-approved exporter preserves manually reviewed additional links without deploying them',()=>{
 const example=firstWave.find(x=>x.id==='tame-the-board-game');
 const approved=makeApproved({...example,status:'approved_for_export',ownerApproved:true,approvedOn:'2026-10-28',review:{rights:true,metadata:true,links:true,media:true}});
 assert.equal(approved.links.length,2);
 assert.equal(approved.links[1].kind,'read');
 assert.equal(approved.links[1].url,'https://tametheboardgame.com/about/');
});

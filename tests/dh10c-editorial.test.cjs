'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {requireOwner,viewsFrom,validateSourceManifest,updateCatalogue,
 fetchSource,proposalSummary}=require('../scripts/dh10c-editorial-proposal.cjs');
const {makeReviewPage}=require('../scripts/render-editorial-review.cjs');
const source='tametheboardgame/ordinary-universe';
const manifest={
 schemaVersion:1,enabled:true,id:'ordinary-universe',title:'The Ordinary Universe',
 description:'A collection of public comic stories.',type:'script',lifecycle:'active',
 categories:['writing','projects','experiments'],
 links:{repository:'https://github.com/'+source,homepage:'https://ordinary-universe.pages.dev/'}
};
const today='2026-10-30';
const attestation={actor:'tametheboardgame',repository:'tametheboardgame/davehub',
 ref:'refs/heads/staging',mode:'publish',sourceRepository:source,id:'ordinary-universe',
 synopsis:'A strange and humorous anthology of short comic stories.',
 categories:'writing, projects',date:today,rights:true,metadata:true,links:true,media:true,
 confirmation:'I APPROVE THIS PUBLICATION PROPOSAL'};
const empty={schemaVersion:1,items:[]};
const clone=o=>structuredClone(o);
test('owner-only publication requires four separate reviews, confirmation and staging branch',()=>{
 assert.doesNotThrow(()=>requireOwner(attestation));
 for(const field of ['rights','metadata','links','media']){
  assert.throws(()=>requireOwner({...attestation,[field]:false}),/editorial sign-off/);
 }
 for(const change of [
  {actor:'stranger'},{ref:'refs/heads/main'},{repository:'tametheboardgame/other'},
  {confirmation:'yes'},{mode:'delete'}
 ])assert.throws(()=>requireOwner({...attestation,...change}),/Only the DaveHub owner|confirmation|Unsupported/);
});
test('public manifest is opt-in only; no source author can self-approve publication',()=>{
 const m=clone(manifest);
 assert.doesNotThrow(()=>validateSourceManifest(m,source));
 m.approvedForPublication=true;
 assert.throws(()=>validateSourceManifest(m,source),/not enabled and valid/);
 assert.throws(()=>validateSourceManifest({...manifest,enabled:false},source),/not enabled and valid/);
 assert.throws(()=>validateSourceManifest({...manifest,id:'another-project'},source+'-wrong'),/not enabled and valid/);
});
test('a reviewed new proposal creates exactly one valid catalogue entry and no media',()=>{
 const result=updateCatalogue(empty,manifest,attestation);
 assert.equal(result.items.length,1);
 const p=result.items[0];
 assert.equal(p.id,'ordinary-universe');
 assert.deepEqual(p.views,['writing','projects']);
 assert.equal(p.publication.approvedBy,'owner');
 assert.equal(p.publication.approvedOn,today);
 assert.deepEqual([p.publication.rightsReviewed,p.publication.linksReviewed,p.publication.mediaReviewed],[true,true,true]);
 assert.equal(p.media.length,0);
 assert.equal(p.sources[0].url,'https://github.com/'+source);
 assert.equal(p.links.find(l=>l.kind==='official').url,'https://ordinary-universe.pages.dev/');
 assert.equal(p.synopsis,attestation.synopsis);
 assert.equal(empty.items.length,0);
 assert.equal(proposalSummary(empty,result,attestation).mergeRequired,true);
 assert.equal(proposalSummary(empty,result,attestation).publication,'PR review required; never auto-merged');
});
test('revisions change only owner-reviewed description, categories and approval date',()=>{
 const first=updateCatalogue(empty,manifest,attestation);
 const item=first.items[0];item.period={fromYear:2025};item.media=[];
 const review={...attestation,mode:'revise',synopsis:'A revised, reviewed public synopsis.',categories:'writing, memory-lane'};
 const next=updateCatalogue(first,manifest,review).items[0];
 assert.equal(next.synopsis,review.synopsis);
 assert.deepEqual(next.views,['writing','memory-lane']);
 assert.equal(next.title,item.title);
 assert.deepEqual(next.links,item.links);
 assert.deepEqual(next.sources,item.sources);
 assert.deepEqual(next.period,item.period);
 assert.equal(first.items[0].synopsis,attestation.synopsis);
});
test('revisions and withdrawals require matching existing source and deliberate operation',()=>{
 assert.throws(()=>updateCatalogue(empty,manifest,{...attestation,mode:'revise'}),/unpublished/);
 const first=updateCatalogue(empty,manifest,attestation);
 assert.throws(()=>updateCatalogue(first,manifest,attestation),/already published/);
 assert.throws(()=>updateCatalogue(first,manifest,{...attestation,mode:'revise',sourceRepository:'tametheboardgame/other'}),/source/);
 const withdrawn=updateCatalogue(first,null,{...attestation,mode:'withdraw',synopsis:''});
 assert.equal(withdrawn.items.length,0);
 assert.equal(first.items.length,1);
 assert.throws(()=>updateCatalogue(empty,null,{...attestation,mode:'withdraw'}),/absent/);
});
test('withdrawal fails when related published works still reference the item',()=>{
 const first=updateCatalogue(empty,manifest,attestation);
 const related={
  id:'second-project',slug:'second-project',title:'Second project',recordType:'work',workType:'other',
  lifecycle:'completed',synopsis:'Another approved creation',views:['projects'],
  sources:[{kind:'owner_attestation'}],links:[],media:[],relations:[{kind:'related_to',targetId:'ordinary-universe'}],
  publication:first.items[0].publication
 };
 const catalogue={schemaVersion:1,items:[...first.items,related]};
 assert.throws(()=>updateCatalogue(catalogue,null,{...attestation,mode:'withdraw'}),/still referenced/);
});
test('category input fails closed on duplicates, unknown names and unfinished-active mismatch',()=>{
 for(const value of ['writing, writing','writing, internal','',',projects','games, ']){
  if(value==='')continue;
  assert.throws(()=>viewsFrom(value,manifest.categories),/categories/);
 }
 assert.throws(()=>updateCatalogue(empty,manifest,{...attestation,categories:'writing,unfinished'}),/Unfinished Shelf/);
 assert.deepEqual(viewsFrom('',manifest.categories),manifest.categories);
});
test('unsafe or overlong proposals cannot be written to public catalogue',()=>{
 assert.throws(()=>updateCatalogue(empty,manifest,{...attestation,synopsis:'x'.repeat(1401)}),/synopsis/);
 assert.throws(()=>updateCatalogue(empty,manifest,{...attestation,synopsis:'    '}),/synopsis/);
 assert.throws(()=>updateCatalogue(empty,manifest,{...attestation,date:'2026-99-99'}),/Invalid owner review date/);
 assert.throws(()=>updateCatalogue(empty,{...manifest,links:{repository:'https://private.internal/test'}},attestation),/not enabled and valid/);
});
test('fetches public source from exact owner GitHub API, never arbitrary links',async()=>{
 const seen=[];
 const fake=async(url,options)=>{
  seen.push({url,options});
  const v=url.endsWith('/davehub.json?ref=main')?
   {type:'file',encoding:'base64',content:Buffer.from(JSON.stringify(manifest)).toString('base64')}:
   {full_name:source,owner:{login:'tametheboardgame'},private:false,archived:false,fork:false,default_branch:'main'};
  return {ok:true,status:200,json:async()=>v};
 };
 const got=await fetchSource(source,fake);
 assert.equal(got.id,manifest.id);
 assert.equal(seen.length,2);
 assert.equal(seen[0].url,'https://api.github.com/repos/'+source);
 assert.equal(seen[1].options.redirect,'error');
 assert.throws(()=>fetchSource('other/ordinary-universe',fake),/Expected one public creative repository/);
 const bad=async()=>({ok:true,status:200,json:async()=>({full_name:source,owner:{login:'tametheboardgame'},private:true,default_branch:'main'})});
 await assert.rejects(()=>fetchSource(source,bad),/verified public/);
});
test('hosted review page has useful workflow links without unapproved editorial text',()=>{
 const html=makeReviewPage();
 assert.match(html,/The project review desk/);
 assert.match(html,/github.com\/tametheboardgame\/davehub\/actions\/workflows\/dh10c-editorial-proposal.yml/);
 assert.match(html,/data-dh10c="review"/);
 assert.match(html,/Public staging review area, not a private workspace/);
 assert.match(html,/noindex,nofollow/);
 assert.doesNotMatch(html,/privateNotes|approvedOn|ownerApproved|Bearer /);
 const js=fs.readFileSync(path.join(__dirname,'../assets/editorial/review.js'),'utf8');
 assert.match(js,/textContent/);
 assert.doesNotMatch(js,/innerHTML|eval\(|document\.write/);
});
test('GitHub dispatch requires owner login, full editor attestation and manual staging PR merge',()=>{
 const file=fs.readFileSync(path.join(__dirname,'../.github/workflows/dh10c-editorial-proposal.yml'),'utf8');
 assert.match(file,/github\.actor == 'tametheboardgame'/);
 assert.match(file,/github\.ref == 'refs\/heads\/staging'/);
 assert.match(file,/pull-requests: write/);
 assert.match(file,/rights_reviewed:/);
 assert.match(file,/media_reviewed:/);
 assert.match(file,/gh pr create/);
 assert.match(file,/--base staging/);
 assert.doesNotMatch(file,/gh pr merge|git push origin HEAD:staging/);
});

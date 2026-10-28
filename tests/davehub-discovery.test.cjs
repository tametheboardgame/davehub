'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateManifest,toReviewCandidate}=require('../scripts/davehub-manifest.cjs');
const {discover}=require('../scripts/davehub-discover.cjs');
const {toWorkshopImport}=require('../scripts/davehub-workshop-import.cjs');
const source='tametheboardgame/unicorn-valley';
const good={
 schemaVersion:1,enabled:true,id:'unicorn-valley',title:'Unicorn Valley',
 description:'A magical browser-based unicorn adventure.',type:'game',lifecycle:'active',
 categories:['games','projects'],tags:['cosy game'],
 links:{repository:'https://github.com/tametheboardgame/unicorn-valley',play:'https://unicorn-valley.pages.dev/'},
 updates:{proposeMilestones:false}
};
const clone=x=>structuredClone(x);
test('enabled manifesto requires exactly known public fields and an exact repo link',()=>{
 assert.deepEqual(validateManifest(good,source),{valid:true,enabled:true,errors:[]});
 for(const key of ['privateNotes','script','approvedForPublication']){
  const m=clone(good);m[key]='anything';
  assert.equal(validateManifest(m,source).valid,false);
 }
 const m=clone(good);m.links.repository='https://github.com/another-person/unicorn-valley';
 assert.equal(validateManifest(m,source).valid,false);
});
test('minimal disabled marker is valid; absent marker is disabled by scanner',()=>{
 assert.deepEqual(validateManifest({schemaVersion:1,enabled:false},source),{valid:true,enabled:false,errors:[]});
 assert.equal(validateManifest({schemaVersion:1,enabled:false,title:'accidental public data'},source).valid,false);
});
test('unknown categories, unsafe URL schemes and duplicate tags fail',()=>{
 const a=clone(good);a.categories=['games','internal-tickets'];
 const b=clone(good);b.links.play='http://localhost/app';
 const c=clone(good);c.tags=['a','a'];
 assert.equal(validateManifest(a,source).valid,false);
 assert.equal(validateManifest(b,source).valid,false);
 assert.equal(validateManifest(c,source).valid,false);
});
test('unfinished world does not imply actively developing abandoned works',()=>{
 const a=clone(good);a.categories.push('unfinished');assert.equal(validateManifest(a,source).valid,false);
 a.lifecycle='permanently_shelved';assert.equal(validateManifest(a,source).valid,true);
});
test('DaveHub candidate remains unapproved regardless of manifest intent',()=>{
 const m=clone(good);m.ownerApproved=true;m.publication={status:'public_approved'};
 assert.equal(validateManifest(m,source).valid,false);
 const c=toReviewCandidate(good,source);
 assert.equal(c.published,false);
 assert.equal(c.reviewStatus,'needs_owner_review');
 assert.equal(c.views[0],'games');
 assert.equal('publication' in c,false);
});
function fakeApi(repos,contents={}){
 return async url=>{
  let body,status=200;
  if(url.includes('/users/'))body=repos.map(name=>({name,private:false,archived:false,fork:false,default_branch:'main',owner:{login:'tametheboardgame'}}));
  else{
   const name=url.match(/\/repos\/tametheboardgame\/([^/]+)\/contents\//)?.[1];
   if(!(name in contents)){status=404;body={message:'Not Found'}}
   else body={type:'file',encoding:'base64',content:Buffer.from(JSON.stringify(contents[name])).toString('base64')};
  }
  return{status,ok:status===200,json:async()=>body};
 };
}
test('discovery automatically picks only true manifests, leaves others out',async()=>{
 const results=await discover({fetchFn:fakeApi(['unicorn-valley','fitness-coach','davehub'],{'unicorn-valley':good,'davehub':{schemaVersion:1,enabled:false}})});
 assert.deepEqual(results.counts,{scanned:3,enabled:1,disabled:2,errors:0});
 assert.equal(results.candidates.length,1);
 assert.equal(results.candidates[0].id,'unicorn-valley');
 assert.equal(results.candidates[0].reviewStatus,'needs_owner_review');
 assert.equal(results.mode,'candidate_review_only');
});
test('invalid manifest is quarantined instead of silently publishing',async()=>{
 const m=clone(good);m.links.play='javascript:alert(1)';
 const results=await discover({fetchFn:fakeApi(['unicorn-valley'],{'unicorn-valley':m})});
 assert.equal(results.counts.errors,1);
 assert.equal(results.candidates.length,0);
});
test('other repositories cannot claim someone else source name',async()=>{
 const results=await discover({fetchFn:fakeApi(['my-repo'],{'my-repo':good})});
 assert.equal(results.counts.errors,1);
 assert.equal(results.candidates.length,0);
});
test('scanner ignores archived, forked and private repos even if API returns them',async()=>{
 const list=[
  {name:'unicorn-valley',private:false,archived:false,fork:false,default_branch:'main',owner:{login:'tametheboardgame'}},
  {name:'secret',private:true,archived:false,fork:false,default_branch:'main',owner:{login:'tametheboardgame'}},
  {name:'fork',private:false,archived:false,fork:true,default_branch:'main',owner:{login:'tametheboardgame'}}
 ];
 const r=await discover({fetchFn:async url=>url.includes('/users/')?{status:200,ok:true,json:async()=>list}:{status:404,ok:false,json:async()=>({})}});
 assert.equal(r.counts.scanned,1);
});

test('scanner output imports to private Workshop without publication approval',async()=>{
 const report=await discover({fetchFn:fakeApi(['unicorn-valley'],{'unicorn-valley':good})});
 const imported=toWorkshopImport(report);
 assert.equal(imported.candidates.length,1);
 const c=imported.candidates[0];
 assert.equal(c.status,'needs_review');
 assert.equal(c.ownerApproved,false);
 assert.equal(c.review.rights,false);
 assert.equal(c.review.metadata,false);
 assert.equal(c.linkUrl,'https://unicorn-valley.pages.dev/');
 assert.equal(c.sourceKind,'repository');
});
test('Workshop importer rejects report not marked review-only',()=>{
 const report={schemaVersion:1,mode:'approved',candidates:[]};
 assert.throws(()=>toWorkshopImport(report),/Invalid read-only/);
});

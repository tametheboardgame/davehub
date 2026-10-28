'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {safeLayoutData,renderReview,PLACEHOLDER,BANNER}=require('../scripts/render-review-layout.cjs');
const {firstWave}=require('../tools/workshop/first-wave.cjs');
test('hosted review contains exactly three titles but no draft synopsis, links or approvals',()=>{
 const data=safeLayoutData();
 assert.equal(data.items.length,3);
 assert.deepEqual(new Set(data.items.map(x=>x.id)),new Set(['unicorn-valley','stephen-martin-project','tame-the-board-game']));
 for(const item of data.items){
  assert.equal(item.synopsis,PLACEHOLDER);
  assert.deepEqual(item.links,[]);
  assert.deepEqual(item.sources,[]);
  assert.equal(Object.hasOwn(item,'publication'),false);
  assert.equal(Object.hasOwn(item,'notes'),false);
 }
});
test('every hosted page has a review notice and none contains unapproved first-wave copy or URLs',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dh08c-cloud-review-'));
 try{
  const result=renderReview(dir);
  assert.equal(result.works,3);
  assert.equal(result.pages,12);
  const paths=[];
  function visit(d){
   for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const full=path.join(d,e.name);
    if(e.isDirectory())visit(full);
    else paths.push(full);
   }
  }
  visit(dir);
  assert.equal(paths.length,result.pages);
  for(const name of paths){
   const html=fs.readFileSync(name,'utf8');
   assert.ok(html.includes('DESIGN REVIEW ONLY')||html.includes('DESIGN REVIEW'));
   assert.equal(html.includes('public_approved'),false);
   assert.equal(html.includes('ownerApproved'),false);
   assert.equal(html.includes('href="https://'),false);
   for(const item of firstWave){
    assert.ok(!html.includes(item.synopsis),'Must never render source editorial synopsis');
    if(item.linkUrl)assert.ok(!html.includes(item.linkUrl),'Must never emit live link');
    if(item.notes)assert.ok(!html.includes(item.notes),'Must never emit private editorial notes');
   }
  }
  assert.ok(fs.existsSync(path.join(dir,'creations','unicorn-valley','index.html')));
  assert.ok(fs.existsSync(path.join(dir,'creations','stephen-martin-project','index.html')));
  assert.ok(fs.existsSync(path.join(dir,'creations','tame-the-board-game','index.html')));
  const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  assert.match(index,/Games layout/);
  assert.match(index,/Memory Lane layout/);
  assert.match(index,/NOT PUBLISHED CONTENT/);
  assert.match(BANNER,/nothing approved/i); // Notice content must be explicit.
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('public catalogue remains empty regardless of the hosted review generation',()=>{
 const catalogue=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/public/catalogue.json'),'utf8'));
 assert.deepEqual(catalogue,{schemaVersion:1,items:[]});
 const build=fs.readFileSync(path.join(__dirname,'../scripts/build-pages.sh'),'utf8');
 assert.match(build,/dist\/previews\/dh-08c/);
 assert.match(build,/node scripts\/render-review-layout.cjs/);
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const vm=require('node:vm');
const {filesFor}=require('../scripts/render-content.cjs');
const {renderReview}=require('../scripts/render-review-layout.cjs');
const source=fs.readFileSync(path.join(__dirname,'../assets/content/staging-review.js'),'utf8');
function navigate(host,pathname){
 const called=[];
 const location={hostname:host,pathname,replace:target=>called.push(target)};
 vm.runInNewContext(source,{window:{location}}, {timeout:1500});
 return called;
}
test('main DaveHub destinations route to populated mock-ups on the exact staging host',()=>{
 for(const pathValue of ['/worlds/','/worlds','/worlds/games/','/worlds/projects/','/worlds/writing/','/worlds/memory-lane/','/worlds/experiments/']){
  const expected='/previews/dh-08c'+(pathValue.endsWith('/')?pathValue:pathValue+'/');
  assert.deepEqual(navigate('davehub.pages.dev',pathValue),[expected],pathValue);
 }
});
test('live and other hosts never route to unapproved design previews',()=>{
 for(const host of ['davehub.co.uk','www.davehub.co.uk','davehub-live.pages.dev','localhost','example.org']){
  assert.deepEqual(navigate(host,'/worlds/games/'),[],host);
 }
 for(const pathValue of ['/', '/games/unicorn-valley/','/creations/unicorn-valley/','/previews/dh-08c/worlds/games/','/previews/dh-08c/','/worlds/private/']){
  assert.deepEqual(navigate('davehub.pages.dev',pathValue),[],pathValue);
 }
});
test('empty canonical catalogue pages include staging bridge but approved and fictional pages do not',()=>{
 const canonical=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/public/catalogue.json'),'utf8'));
 assert.equal(canonical.items.length,0);
 const empty=filesFor(canonical,'',false);
 for(const name of ['worlds/index.html','worlds/games/index.html','worlds/projects/index.html','worlds/writing/index.html']){
  assert.match(empty.get(name),/data-davehub-inline="staging"/,name);
 }
 const fictional=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/examples/fictional.json'),'utf8'));
 assert.ok(fictional.items.length>0);
 assert.doesNotMatch(filesFor(fictional,'',false).get('worlds/games/index.html'),/data-davehub-inline="staging"/);
 assert.doesNotMatch(filesFor(fictional,'/previews/dh-08b',true).get('worlds/index.html'),/data-davehub-inline="staging"/);
});
test('hosted review shows populated areas, explains genuinely empty categories and never leaks live links',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dh08c-navigation-'));
 try{
  renderReview(dir);
  const pages=['games','projects','writing','memory-lane'];
  const seen=Object.fromEntries(pages.map(k=>[k,fs.readFileSync(path.join(dir,'worlds',k,'index.html'),'utf8')]));
  for(const k of pages)assert.match(seen[k],/work-card/,k);
  for(const k of ['games','projects']) {
    assert.match(seen[k],/Unicorn Valley/);
    assert.match(seen[k],/The Stephen Martin Project/);
  }
  for(const k of ['writing','memory-lane'])assert.match(seen[k],/Tame The Board Game/);
  const empty=fs.readFileSync(path.join(dir,'worlds','experiments','index.html'),'utf8');
  assert.match(empty,/No first-wave candidate in this area/);
  assert.doesNotMatch(empty,/Explore the fictional example/);
  assert.match(empty,/Explore the populated review areas/);
  const all=Object.values(seen).join('')+empty;
  assert.doesNotMatch(all,/public_approved|unicorn-valley\.pages\.dev|stephen-martin-project\.pages\.dev|tametheboardgame\.com/);
  assert.match(all,/DESIGN REVIEW ONLY/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('the Cloudflare build ships the actual staging bridge script',()=>{
 const build=fs.readFileSync(path.join(__dirname,'../scripts/build-pages.sh'),'utf8');
 assert.match(build,/cp assets\/content\/staging-review\.js dist\/assets\/content\//);
 assert.match(build,/tests\/staging-review\.test\.cjs/);
});

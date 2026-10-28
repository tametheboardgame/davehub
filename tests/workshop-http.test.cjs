'use strict';
/* Local-only HTTP regression. Uses a disposable HOME, never the owner's data. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const {spawn}=require('node:child_process');
const script=path.resolve(__dirname,'../tools/workshop/server.cjs');
async function freePort(){
 const s=net.createServer();
 await new Promise((resolve,reject)=>s.once('error',reject).listen(0,'127.0.0.1',resolve));
 const p=s.address().port;
 await new Promise(resolve=>s.close(resolve));
 return p;
}
async function startDisposableWorkshop(){
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'dh08c-e2e-'));
 const port=await freePort();
 const child=spawn(process.execPath,[script],{
  env:{...process.env,HOME:home,USERPROFILE:home,DAVEHUB_WORKSHOP_PORT:String(port)},
  stdio:['ignore','pipe','pipe']
 });
 let output='';
 try{
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Local workshop startup timed out: '+output)),10000);
   const done=error=>{clearTimeout(timer);error?reject(error):resolve()};
   child.once('exit',code=>done(Error('Workshop exited '+code+': '+output)));
   child.stdout.on('data',chunk=>{
    output+=String(chunk);
    if(output.includes('Local DaveHub Content Workshop:'))done();
   });
   child.stderr.on('data',chunk=>output+=String(chunk));
  });
  return{base:'http://127.0.0.1:'+port,home,child};
 }catch(err){child.kill();fs.rmSync(home,{recursive:true,force:true});throw err}
}
test('local preview, seeded proposals, duplicate imports and export gate work end to end',{timeout:20000},async()=>{
 const {base,home,child}=await startDisposableWorkshop();
 try{
  const forbidden=await fetch(base+'/creations/unicorn-valley/');
  assert.equal(forbidden.status,403,'Preview must require local editor session');
  const root=await fetch(base+'/');
  assert.equal(root.status,200);
  const html=await root.text();
  const token=html.match(/data-token="([a-f0-9]{64})"/)?.[1];
  const cookie=root.headers.get('set-cookie')?.split(';')[0];
  assert.ok(token&&cookie,'Private editor must issue a session');
  const headers={'X-Workshop-Token':token,'Content-Type':'application/json'};
  const before=await fetch(base+'/api/readiness',{headers});
  assert.equal(before.status,200);
  const emptyReview=await before.json();
  assert.equal(emptyReview.prepared,0);assert.equal(emptyReview.readyForProposal,0);
  const seed=await fetch(base+'/api/seed',{method:'POST',headers,body:'{}'});
  assert.equal(seed.status,200);
  assert.deepEqual((({added,skipped,count})=>({added,skipped,count}))(await seed.json()),{added:3,skipped:0,count:3});
  const again=await fetch(base+'/api/seed',{method:'POST',headers,body:'{}'});
  assert.deepEqual((({added,skipped})=>({added,skipped}))(await again.json()),{added:0,skipped:3});
  const drafts=await fetch(base+'/api/drafts',{headers});
  const data=await drafts.json();
  assert.equal(data.candidates.length,3);
  assert.ok(data.candidates.every(c=>!c.ownerApproved&&c.status==='needs_review'));
  const review=await fetch(base+'/api/readiness',{headers});
  assert.equal(review.status,200);
  const readiness=await review.json();
  assert.equal(readiness.prepared,3);
  assert.equal(readiness.readyForProposal,0);
  assert.ok(readiness.items.every(item=>item.checked===0&&item.openChecks.length>=4));
  const bypass=await fetch(base+'/api/save',{
    method:'POST',headers,
    body:JSON.stringify({...data.candidates[0],sourceUrl:'javascript:alert(1)',status:'needs_review'})
  });
  assert.equal(bypass.status,400,'Saving an unapproved draft must also reject unsafe links');
  const after=await (await fetch(base+'/api/drafts',{headers})).json();
  assert.equal(after.candidates[0].sourceUrl,data.candidates[0].sourceUrl,'Rejected edit must not persist');
  const preview=await fetch(base+'/creations/unicorn-valley/',{headers:{Cookie:cookie}});
  assert.equal(preview.status,200);
  const page=await preview.text();
  assert.match(page,/PRIVATE OWNER REVIEW/);
  assert.match(page,/unicorn-valley\.pages\.dev/);
  assert.equal(page.includes('Fictional design demonstration.'),false);
  assert.equal(page.includes('public_approved'),false);
  const world=await fetch(base+'/worlds/games/',{headers:{Cookie:cookie}});
  assert.equal(world.status,200);
  assert.match(await world.text(),/The Stephen Martin Project/);
  const css=await fetch(base+'/assets/content/worlds.css');
  assert.equal(css.status,200);
  const exportAttempt=await fetch(base+'/api/export',{method:'POST',headers,body:'{}'});
  assert.equal(exportAttempt.status,400,'No public proposal should be exportable before sign-off');
  const local=JSON.parse(fs.readFileSync(path.join(home,'.davehub/workshop/drafts.json'),'utf8'));
  assert.equal(local.candidates.length,3);
 }finally{
  child.kill();
  fs.rmSync(home,{recursive:true,force:true});
 }
});

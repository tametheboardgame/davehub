'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseArgs,execute,MARKER}=require('../scripts/davehub-new-repo.cjs');
const {audit}=require('../scripts/davehub-audit.cjs');
const {discover}=require('../scripts/davehub-discover.cjs');

test('new repos default to private and disabled, with no publishing metadata',()=>{
 assert.deepEqual(JSON.parse(MARKER),{schemaVersion:1,enabled:false});
 assert.deepEqual(parseArgs(['my-new-repo']),{repair:false,name:'my-new-repo',visibility:'private',description:''});
 assert.equal(parseArgs(['public-project','--public','--description','Example']).visibility,'public');
});
test('unsupported names and conflicting options are rejected',()=>{
 for(const name of ['../hack','a/b','--evil','.','..','abc.git','a b']){
  assert.throws(()=>parseArgs([name]),/valid repository name/);
 }
 assert.throws(()=>parseArgs(['my-repo','--public','--private']),/one visibility/);
 assert.throws(()=>parseArgs(['--repair','my-repo','--public']),/accepts only/);
 assert.throws(()=>parseArgs(['my-repo','--description']),/Description/);
});
test('bootstrap creates disabled marker in the FIRST commit and defaults private',()=>{
 const calls=[];
 const runner=(command,args,opts={})=>{
  calls.push({command,args});
  if(command==='gh'&&args[0]==='api'&&args[1]==='user')return 'tametheboardgame\n';
  if(command==='gh'&&args[0]==='repo'){
   const pos=args.indexOf('--source'),dir=args[pos+1];
   assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'davehub.json'),'utf8')),{schemaVersion:1,enabled:false});
   assert.ok(args.includes('--private'));
   assert.ok(args.includes('--push'));
   assert.ok(args.includes('tametheboardgame/example-repo'));
  }
  return '';
 };
 execute(parseArgs(['example-repo']),runner);
 assert.deepEqual(calls.map(c=>c.command),['gh','git','git','git','gh']);
 assert.ok(calls[3].args.includes('commit'));
});
test('bootstrap refuses a GitHub CLI session under another user',()=>{
 assert.throws(()=>execute(parseArgs(['test-repo']),()=> 'someoneelse\n'),/authenticated as tametheboardgame/);
});
test('repair only creates a missing marker and supplies NO overwrite SHA',()=>{
 const calls=[];
 execute(parseArgs(['--repair','existing-repo']),(command,args)=>{
  calls.push({command,args});
  if(args[0]==='api'&&args[1]==='user')return 'tametheboardgame\n';
  return '';
 });
 const write=calls[1].args;
 assert.ok(write.includes('--method')&&write.includes('PUT'));
 assert.ok(write.includes('repos/tametheboardgame/existing-repo/contents/davehub.json'));
 assert.ok(!write.includes('-F')&&!write.some(s=>s.startsWith('sha=')));
 const encoded=write.find(x=>x.startsWith('content=')).slice(8);
 assert.deepEqual(JSON.parse(Buffer.from(encoded,'base64').toString('utf8')),{schemaVersion:1,enabled:false});
});
test('new-repo audit flags only post-cutoff absent markers',()=>{
 const report={schemaVersion:1,mode:'candidate_review_only',repositories:[
  {repository:'tametheboardgame/legacy',status:'absent',createdAt:'2026-10-01T00:00:00Z'},
  {repository:'tametheboardgame/new',status:'absent',createdAt:'2026-10-29T00:00:00Z'},
  {repository:'tametheboardgame/disabled',status:'disabled',createdAt:'2026-10-29T00:00:00Z'},
  {repository:'tametheboardgame/opted-in',status:'enabled',createdAt:'2026-10-29T00:00:00Z'},
  {repository:'tametheboardgame/no-date',status:'absent'}
 ]};
 const result=audit(report);
 assert.equal(result.missing.length,1);
 assert.equal(result.missing[0].repository,'tametheboardgame/new');
 assert.throws(()=>audit({mode:'approved',schemaVersion:1,repositories:[]}),/Invalid/);
});
test('discovery retains GitHub creation timestamp for missing-marker audit',async()=>{
 const fetchFn=async url=>url.includes('/users/')?
  {ok:true,status:200,json:async()=>[{name:'new-repo',private:false,archived:false,fork:false,default_branch:'main',created_at:'2026-10-30T10:00:00Z',owner:{login:'tametheboardgame'}}]}:
  {ok:false,status:404,json:async()=>({})};
 const report=await discover({fetchFn});
 assert.equal(report.repositories[0].createdAt,'2026-10-30T10:00:00Z');
 assert.equal(audit(report).missing.length,1);
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {candidateFromRuns,decide,updateLock,validLock,validateStagingPolicy}=require('../scripts/auto-sync-unicorn.cjs');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/game-releases.json'),'utf8'));
const older=config.games.find(x=>x.id==='unicorn-valley').commit;
const newer='c'.repeat(40);
const github=path=>new URL(path).pathname;
function makeRun(overrides={}){
 return {id:101,name:'CI',event:'push',head_branch:'main',
  head_sha:newer,status:'completed',conclusion:'success',
  run_started_at:'2026-10-28T12:00:00Z',html_url:'https://github.com/tametheboardgame/unicorn-valley/actions/runs/101',
  ...overrides};
}
function fetcher(head=newer,runs=[makeRun()],status=200){
 return async(url)=>{
  if(!url.startsWith('https://api.github.com/repos/tametheboardgame/unicorn-valley/'))throw Error('Unexpected URL '+url);
  return {ok:status>=200&&status<300,status,
    json:async()=>url.includes('/branches/main')?{commit:{sha:head}}:{workflow_runs:runs}};
 };
}
test('an exact-head successful upstream main push CI permits staged promotion',async()=>{
 const decision=await decide(config,fetcher());
 assert.deepEqual({action:decision.action,sha:decision.sha,runId:decision.runId},
  {action:'update',sha:newer,runId:101});
 const updated=updateLock(config,decision);
 assert.equal(updated.games.find(x=>x.id==='unicorn-valley').commit,newer);
 assert.equal(updated.games.find(x=>x.id==='unicorn-valley').version,'main-ci-101');
 assert.deepEqual(updated.games.find(x=>x.id==='stephen-martin'),config.games.find(x=>x.id==='stephen-martin'));
 assert.equal(config.games.find(x=>x.id==='unicorn-valley').commit,older);
});
test('already qualified unchanged upstream main is a true no-op without extra CI queries',async()=>{
 const qualified=structuredClone(config);
 qualified.games.find(x=>x.id==='unicorn-valley').version='main-ci-123';
 const decision=await decide(qualified,fetcher(older,[]));
 assert.equal(decision.action,'unchanged');
 assert.throws(()=>updateLock(qualified,decision),/No approved upstream update/);
});
test('initial legacy release pin triggers one-time exact-head CI qualification canary',async()=>{
 const candidate=await decide(config,fetcher(older,[makeRun({head_sha:older,id:123})]));
 assert.equal(candidate.action,'update');
 assert.equal(updateLock(config,candidate).games.find(x=>x.id==='unicorn-valley').version,'main-ci-123');
 const blocked=await decide(config,fetcher(older,[makeRun({head_sha:older,conclusion:'failure'})]));
 assert.equal(blocked.action,'blocked');
});
test('CI pending, failure, cancelled, PR-only and wrong branch cannot automatically deploy',async()=>{
 const bad=[
  [makeRun({conclusion:'failure'})],
  [makeRun({status:'in_progress',conclusion:null})],
  [makeRun({conclusion:'cancelled'})],
  [makeRun({event:'pull_request'})],
  [makeRun({head_branch:'other'})],
  [makeRun({name:'Fake CI'})],
  [makeRun({head_sha:'a'.repeat(40)})],
  []
 ];
 for(const runs of bad){
  const decision=await decide(config,fetcher(newer,runs));
  assert.equal(decision.action,'blocked',JSON.stringify(runs));
  assert.throws(()=>updateLock(config,decision),/No approved upstream update/);
 }
});
test('newest exact-head push CI attempt must be green, not an old passing attempt',()=>{
 const success=makeRun({id:101,run_started_at:'2026-10-28T12:00:00Z'});
 const failed=makeRun({id:102,conclusion:'failure',run_started_at:'2026-10-28T13:00:00Z'});
 assert.equal(candidateFromRuns(newer,[success,failed]),null);
 assert.equal(candidateFromRuns(newer,[failed,success]),null);
 assert.equal(candidateFromRuns(newer,[failed,{...success,id:103,run_started_at:'2026-10-28T14:00:00Z'}]).runId,103);
});
test('an upstream API/network failure never silently qualifies a release',async()=>{
 await assert.rejects(decide(config,fetcher(newer,[],403)),/GitHub API error 403/);
 await assert.rejects(decide(config,async()=>{throw Error('Network failure')}),/Network failure/);
});
test('unknown repos, private-source substitutions and malformed SHAs fail closed',()=>{
 assert.throws(()=>candidateFromRuns('main',[makeRun()]),/Invalid public upstream/);
 const bad=structuredClone(config);
 bad.games.find(x=>x.id==='unicorn-valley').repository='tametheboardgame/fitness-coach';
 assert.throws(()=>validLock(bad),/Refusing unknown Unicorn Valley/);
 assert.throws(()=>updateLock(config,{action:'update',sha:newer,previous:'a'.repeat(40),runId:2}),/Pinned source changed/);
});
test('published-game build emits a SHA-bound release-marker contract',()=>{
 const bundler=fs.readFileSync(path.join(__dirname,'../scripts/bundle-games.cjs'),'utf8');
 assert.match(bundler,/davehub-release\.json/);
 assert.match(bundler,/release\.sourceCommit!==game\.commit/);
});

test('staging-only policy blocks accidental later live-domain promotion',()=>{
 const policy=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/game-auto-sync-policy.json'),'utf8'));
 assert.equal(validateStagingPolicy(policy),policy);
 for(const change of [{liveDomainConfigured:true},{autoLivePromotion:true},{stagingBranch:'staging'},{enabled:false}]){
  assert.throws(()=>validateStagingPolicy({...policy,...change}),/Staging-only auto-sync/);
 }
});

test('explicit same-SHA refresh requires successful CI and avoids repeated commits',async()=>{
 const release=await decide(config,fetcher(older,[makeRun({head_sha:older,id:123})]),'',true);
 assert.equal(release.action,'update');
 const updated=updateLock(config,release);
 assert.equal(updated.games.find(x=>x.id==='unicorn-valley').version,'main-ci-123');
 const after=await decide(updated,fetcher(older,[makeRun({head_sha:older,id:123})]),'',true);
 assert.equal(after.action,'unchanged');
 const blocked=await decide(config,fetcher(older,[makeRun({head_sha:older,conclusion:'failure'})]),'',true);
 assert.equal(blocked.action,'blocked');
});

'use strict';
/*
 * DH-09E: automatically advance ONLY the public Unicorn Valley staging
 * source lock. All new commits require a successful "CI" push workflow at
 * the exact upstream main SHA, followed by the full DaveHub game build.
 *
 * No code, assets or metadata from any private repo is read or published.
 */
const fs=require('node:fs');
const path=require('node:path');
const {validateConfig}=require('./bundle-games.cjs');
const root=path.resolve(__dirname,'..');
const lockPath=path.join(root,'config/game-releases.json');
const policyPath=path.join(root,'config/game-auto-sync-policy.json');
const GH='https://api.github.com';
const UPSTREAM='tametheboardgame/unicorn-valley';
const CI_NAME='CI';
const SHA=/^[a-f0-9]{40}$/;

function validateStagingPolicy(policy){
 if(policy.schemaVersion!==1||policy.enabled!==true||
    policy.stagingBranch!=='main'||policy.stagingHost!=='davehub.pages.dev'||
    policy.liveDomainConfigured!==false||policy.autoLivePromotion!==false||
    policy.upstream?.['unicorn-valley']?.repository!==UPSTREAM||
    policy.upstream?.['unicorn-valley']?.branch!=='main'||
    policy.upstream?.['unicorn-valley']?.requiredPushWorkflow!==CI_NAME)
  throw Error('Staging-only auto-sync is disabled or main is no longer exclusively staging; no automatic production promotion is permitted');
 return policy;
}
function candidateFromRuns(sha,runs){
 if(!SHA.test(sha))throw Error('Invalid public upstream main SHA');
 if(!Array.isArray(runs))throw Error('Missing GitHub CI runs');
 const matching=runs.filter(run=>
  run.name===CI_NAME &&
  run.event==='push' &&
  run.head_branch==='main' &&
  run.head_sha===sha &&
  run.status==='completed'
 );
 // The latest exact-SHA push attempt must be green; a stale pass after
 // an exact-SHA failure is never enough to promote automatically.
 matching.sort((a,b)=>(b.run_started_at||b.created_at||'').localeCompare(a.run_started_at||a.created_at||'')||b.id-a.id);
 const latest=matching[0];
 return latest?.conclusion==='success'?{
  sha,runId:latest.id,url:latest.html_url,conclusion:'success'
 }:null;
}
function validLock(value){
 const games=validateConfig(value);
 const unicorn=games.find(g=>g.id==='unicorn-valley');
 if(unicorn?.repository!==UPSTREAM||unicorn.build!=='vite-subpath')throw Error('Refusing unknown Unicorn Valley release source');
 return unicorn;
}
async function api(url,token,fetcher=fetch){
 const response=await fetcher(url,{headers:{
  accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28',
  'User-Agent':'DaveHub-game-auto-sync/1.0',
  ...(token?{authorization:'Bearer '+token}:{})
 },signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('GitHub API error '+response.status+' for '+new URL(url).pathname);
 return response.json();
}
async function decide(current,fetcher=fetch,token='',forceRedeploy=false){
 const unicorn=validLock(current);
 const repo=await api(GH+'/repos/'+UPSTREAM+'/branches/main',token,fetcher);
 const sha=repo?.commit?.sha;
 if(!SHA.test(sha||''))throw Error('Invalid upstream branch head');
 if(sha===unicorn.commit&&!forceRedeploy)return {action:'unchanged',sha,previous:unicorn.commit};
 const runs=await api(GH+'/repos/'+UPSTREAM+'/actions/runs?branch=main&event=push&per_page=50',token,fetcher);
 const candidate=candidateFromRuns(sha,runs.workflow_runs);
 if(!candidate)return{action:'blocked',sha,previous:unicorn.commit,reason:'No successful exact-head upstream CI push run'};
 if(sha===unicorn.commit&&unicorn.version==='main-ci-'+candidate.runId)return{action:'unchanged',sha,previous:unicorn.commit};
 return{action:'update',sha,previous:unicorn.commit,runId:candidate.runId,runUrl:candidate.url};
}
function updateLock(current,decision){
 if(decision.action!=='update'||!SHA.test(decision.sha))throw Error('No approved upstream update to apply');
 const source=validLock(current);
 if(source.commit!==decision.previous)throw Error('Pinned source changed during review');
 const updated=structuredClone(current);
 const game=updated.games.find(g=>g.id==='unicorn-valley');
 game.commit=decision.sha;
 game.version='main-ci-'+decision.runId;
 return updated;
}
function emit(name,value){
 const dest=process.env.GITHUB_OUTPUT;
 if(dest)fs.appendFileSync(dest,name+'='+String(value).replace(/[\r\n]/g,'')+'\n');
}
async function main(){
 validateStagingPolicy(JSON.parse(fs.readFileSync(policyPath,'utf8')));
 const cmd=process.argv[2]||'check';
 if(!['check','verify'].includes(cmd))throw Error('Usage: node scripts/auto-sync-unicorn.cjs check|verify');
 const current=JSON.parse(fs.readFileSync(lockPath,'utf8'));
 const token=process.env.GITHUB_TOKEN||'';
 const expected=process.env.EXPECTED_UPSTREAM_SHA||'';
 if(cmd==='verify'){
  if(!SHA.test(expected)||current.games.find(g=>g.id==='unicorn-valley').commit!==expected)
   throw Error('The exact candidate SHA differs from the reviewed release lock');
  const upstream=await api(GH+'/repos/'+UPSTREAM+'/branches/main',token);
  if(upstream?.commit?.sha!==expected)throw Error('Upstream main moved during qualification');
  const runs=await api(GH+'/repos/'+UPSTREAM+'/actions/runs?branch=main&event=push&per_page=50',token);
  const candidate=candidateFromRuns(expected,runs.workflow_runs);
  if(!candidate||String(candidate.runId)!==process.env.EXPECTED_UPSTREAM_CI_RUN)
   throw Error('Upstream exact-head CI qualification changed during the DaveHub build');
  console.log('Qualified upstream release rechecked: '+expected+' CI #'+candidate.runId);
  return;
 }
 const decision=await decide(current,fetch,token,process.env.FORCE_REDEPLOY==='true');
 console.log('Unicorn Valley upstream: '+decision.sha+'; pinned: '+decision.previous+'; decision: '+decision.action);
 emit('action',decision.action);emit('upstream_sha',decision.sha);
 emit('previous_sha',decision.previous);
 if(decision.action!=='update'){
  if(decision.reason)console.log('SAFE HOLD: '+decision.reason);
  return;
 }
 const updated=updateLock(current,decision);
 fs.writeFileSync(lockPath,JSON.stringify(updated,null,2)+'\n');
 emit('upstream_ci_run',decision.runId);
 console.log('Candidate pinned to successful exact-head upstream CI run '+decision.runUrl);
}
if(require.main===module)main().catch(e=>{console.error('FAIL staging game auto-sync: '+e.message);process.exitCode=1});
module.exports={candidateFromRuns,validLock,decide,updateLock,validateStagingPolicy};

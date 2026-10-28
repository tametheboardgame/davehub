'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {validateTopology,readTopology,buildRole,headersFor,deploymentMarker}=require('../scripts/dh09d-topology.cjs');
const {validateStagingPolicy}=require('../scripts/auto-sync-unicorn.cjs');
const root=path.resolve(__dirname,'..');
const top=JSON.parse(fs.readFileSync(path.join(root,'config/deployment-topology.json'),'utf8'));
const policy=JSON.parse(fs.readFileSync(path.join(root,'config/game-auto-sync-policy.json'),'utf8'));
const setup=phase=>{
 const x=structuredClone(top),p=structuredClone(policy);
 x.phase=phase;
 x.staging.branch=phase==='pre_cutover'?'main':'staging';
 x.production.configured=phase==='live';
 x.automaticGameUpdates.branch=x.staging.branch;
 x.automaticGameUpdates.paused=false;
 p.stagingBranch=x.staging.branch;
 p.liveDomainConfigured=x.production.configured;
 return {x,p};
};
test('existing main-as-staging Pages project remains valid until verified cutover',()=>{
 assert.deepEqual(readTopology(),{stagingBranch:'main',phase:'pre_cutover',liveConfigured:false,paused:true});
 assert.equal(validateStagingPolicy(policy,top),policy);
 assert.equal(buildRole(readTopology(),{CF_PAGES:'1',CF_PAGES_BRANCH:'main'}),'staging');
});
test('two independently deployed Pages projects require staging-only auto updates',()=>{
 for(const phase of ['staging_cutover','live']){
  const {x,p}=setup(phase);
  assert.equal(validateTopology(x,p).stagingBranch,'staging');
  assert.equal(validateStagingPolicy(p,x),p);
  assert.equal(buildRole(validateTopology(x,p),{CF_PAGES:'1',CF_PAGES_BRANCH:'staging',DAVEHUB_DEPLOY_ROLE:'staging'}),'staging');
 }
});
test('wrong branch, domain, project or policy halts release before it is built',()=>{
 const {x,p}=setup('live');
 for(const wrong of [
  {...x,automaticGameUpdates:{...x.automaticGameUpdates,branch:'main'}},
  {...x,staging:{...x.staging,branch:'main'}},
  {...x,production:{...x.production,configured:false}},
  {...x,production:{...x.production,project:'davehub'}},
  {...x,automaticGameUpdates:{...x.automaticGameUpdates,livePromotion:true}}
 ])assert.throws(()=>validateTopology(wrong,p),/Unsafe|Unexpected/);
 for(const wrong of [
  {...p,stagingBranch:'main'},
  {...p,autoLivePromotion:true},
  {...p,liveDomainConfigured:false},
  {...p,enabled:false}
 ])assert.throws(()=>validateTopology(x,wrong),/Auto-sync policy differs/);
});
test('production build requires live phase, main branch, and explicitly configured role',()=>{
 const {x,p}=setup('live');
 const ready=validateTopology(x,p);
 assert.equal(buildRole(ready,{CF_PAGES:'1',CF_PAGES_BRANCH:'main',DAVEHUB_DEPLOY_ROLE:'production'}),'production');
 assert.throws(()=>buildRole(ready,{CF_PAGES:'1',CF_PAGES_BRANCH:'staging',DAVEHUB_DEPLOY_ROLE:'production'}),/Production build refused/);
 assert.throws(()=>buildRole(ready,{CF_PAGES:'1',CF_PAGES_BRANCH:'main'}),/lacks DAVEHUB_DEPLOY_ROLE/);
 assert.throws(()=>buildRole(ready,{CF_PAGES:'1',CF_PAGES_BRANCH:'main',DAVEHUB_DEPLOY_ROLE:'staging'}),/Staging build refused/);
 assert.throws(()=>buildRole(ready,{CF_PAGES:'1',CF_PAGES_BRANCH:'staging'}),/lacks DAVEHUB_DEPLOY_ROLE/);
 assert.equal(buildRole(ready,{CF_PAGES:'1',CF_PAGES_BRANCH:'feature/test'}),'preview');
 assert.throws(()=>buildRole(readTopology(),{CF_PAGES:'1',CF_PAGES_BRANCH:'main',DAVEHUB_DEPLOY_ROLE:'production'}),/Production build refused/);
});
test('staging remains noindex; live may be indexable but never its design previews',()=>{
 const staging=headersFor('staging'),production=headersFor('production');
 assert.match(staging,/\/\*\n  X-Robots-Tag: noindex, nofollow/);
 assert.doesNotMatch(production,/^\/\*\n  X-Robots-Tag: noindex/);
 assert.match(production,/\/previews\/\*\n  X-Robots-Tag: noindex, nofollow/);
 assert.match(staging,/\/games\/unicorn-valley\/davehub-release.json\n  Cache-Control: no-store/);
 assert.match(production,/\/games\/stephen-martin\/\*/);
});
test('deployed release marker binds the Cloudflare project role and exact commit SHA',()=>{
 const sha='a'.repeat(40);
 const current=readTopology();
 const mark=deploymentMarker(current,{CF_PAGES:'1',CF_PAGES_BRANCH:'main',CF_PAGES_COMMIT_SHA:sha});
 assert.equal(mark.environment,'staging');
 assert.equal(mark.branch,'main');
 assert.equal(mark.commit,sha);
 const {x,p}=setup('live');
 const role=validateTopology(x,p);
 const prod=deploymentMarker(role,{CF_PAGES:'1',CF_PAGES_BRANCH:'main',
  DAVEHUB_DEPLOY_ROLE:'production',CF_PAGES_COMMIT_SHA:sha});
 assert.equal(prod.environment,'production');
 assert.equal(prod.commit,sha);
 assert.throws(()=>deploymentMarker(current,{CF_PAGES:'1',CF_PAGES_BRANCH:'main'}),/exact commit SHA/);
 assert.throws(()=>deploymentMarker(current,{CF_PAGES_COMMIT_SHA:'main'}),/Invalid Cloudflare deployment/);
 assert.match(headersFor('production'),/\/deployment.json\n  Cache-Control: no-store/);
});
test('scheduled updater can target staging but never hard-code a bot write to live main',()=>{
 const yaml=fs.readFileSync(path.join(root,'.github/workflows/davehub-game-auto-sync.yml'),'utf8');
 assert.match(yaml,/node scripts\/dh09d-topology.cjs select/);
 assert.match(yaml,/ref: \$\{\{ steps.target.outputs.branch \}\}/);
 assert.match(yaml,/TARGET_BRANCH: \$\{\{ steps.target.outputs.branch \}\}/);
 assert.match(yaml,/git push origin "HEAD:refs\/heads\/\$TARGET_BRANCH"/);
 assert.doesNotMatch(yaml,/git push origin HEAD:refs\/heads\/main/);
 assert.match(yaml,/if: steps.target.outputs.paused != 'true'/);
});

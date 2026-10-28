'use strict';
/*
 * DH-09D deployment topology guard.
 * A site branch switch must never silently turn game auto-sync into
 * a live deployment. No Cloudflare credentials are stored or read.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const TOP=path.join(root,'config/deployment-topology.json');
const POLICY=path.join(root,'config/game-auto-sync-policy.json');
const PHASES=['pre_cutover','staging_cutover','live'];
function validateTopology(topology,gamePolicy){
 if(!topology||topology.schemaVersion!==1||!PHASES.includes(topology.phase))
  throw Error('Invalid DH-09D deployment phase');
 const st=topology.staging,prod=topology.production;
 if(st?.project!=='davehub'||st.hostname!=='davehub.pages.dev'||
    prod?.project!=='davehub-live'||prod.hostname!=='davehub.co.uk'||
    prod.branch!=='main'||prod.project===st.project)
  throw Error('Unexpected Pages project or host; staging and live must remain separate');
 const expected=topology.phase==='pre_cutover'?'main':'staging';
 const live=topology.phase==='live';
 if(st.branch!==expected||prod.configured!==live||
    topology.automaticGameUpdates?.branch!==expected||
    topology.automaticGameUpdates.livePromotion!==false||
    typeof topology.automaticGameUpdates.paused!=='boolean')
  throw Error('Unsafe deployment branch or automatic live promotion configuration');
 if(!gamePolicy||gamePolicy.schemaVersion!==1||gamePolicy.enabled!==true||
    gamePolicy.stagingHost!=='davehub.pages.dev'||
    gamePolicy.stagingBranch!==expected||
    gamePolicy.autoLivePromotion!==false||
    gamePolicy.liveDomainConfigured!==live)
  throw Error('Auto-sync policy differs from deployment topology; refusing split');
 return {stagingBranch:expected,phase:topology.phase,liveConfigured:live,paused:topology.automaticGameUpdates.paused};
}
function readTopology(){
 return validateTopology(JSON.parse(fs.readFileSync(TOP,'utf8')),
  JSON.parse(fs.readFileSync(POLICY,'utf8')));
}
function buildRole(topology,env={}){
 const branch=env.CF_PAGES_BRANCH||'';
 const role=env.DAVEHUB_DEPLOY_ROLE||'';
 if(role&&!['staging','production'].includes(role))
  throw Error('Unknown DAVEHUB_DEPLOY_ROLE');
 if(role==='production'){
  if(topology.phase!=='live'||!topology.liveConfigured||branch!=='main')
   throw Error('Production build refused: custom-domain release requires live phase on main');
  return 'production';
 }
 if(role==='staging'){
  if(branch!==topology.stagingBranch)
   throw Error('Staging build refused: unexpected Cloudflare production branch');
  return 'staging';
 }
 if(env.CF_PAGES){
  if((topology.phase==='live'||topology.phase==='staging_cutover')&&
     (branch==='main'||branch===topology.stagingBranch))
   throw Error('Pages production-branch build lacks DAVEHUB_DEPLOY_ROLE');
  if(topology.phase==='pre_cutover'&&branch==='main')return 'staging';
 }
 return 'preview';
}
function headersFor(role){
 if(!['production','staging','preview'].includes(role))throw Error('Invalid headers role');
 const common='  X-Content-Type-Options: nosniff\n';
 const noindex='  X-Robots-Tag: noindex, nofollow\n';
 const initial='/*\n'+(role==='production'?'':noindex)+common;
 // The live website may be indexed; no preview design lab should be.
 const restricted=role==='production'?'\n/previews/*\n'+noindex+common:'';
 const game='\n/deployment.json\n  Cache-Control: no-store\n\n/games/unicorn-valley/index.html\n  Cache-Control: no-cache\n\n'+
 '/games/unicorn-valley/davehub-release.json\n  Cache-Control: no-store\n\n'+
 '/games/unicorn-valley/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n'+
 '/games/unicorn-valley/audio/*\n  Cache-Control: public, max-age=86400\n\n'+
 '/games/stephen-martin/*\n  Cache-Control: no-cache\n';
 return initial+restricted+game;
}
function deploymentMarker(topology,env={}){
 const role=buildRole(topology,env);
 const sha=env.CF_PAGES_COMMIT_SHA||null;
 if(sha!==null&&!/^[a-f0-9]{40}$/.test(sha))throw Error('Invalid Cloudflare deployment commit SHA');
 if(env.CF_PAGES&&['staging','production'].includes(role)&&!sha)
  throw Error('Cloudflare production deployment must expose its exact commit SHA');
 return {
  schemaVersion:1,
  environment:role,
  branch:env.CF_PAGES_BRANCH||null,
  commit:sha,
  stagingHost:'davehub.pages.dev',
  productionHost:'davehub.co.uk',
  phase:topology.phase
 };
}
function publishOutputs(value){
 const output=process.env.GITHUB_OUTPUT;
 if(output)fs.appendFileSync(output,'branch='+value.stagingBranch+'\nphase='+value.phase+'\npaused='+value.paused+'\n');
}
if(require.main===module){
 try{
  const mode=process.argv[2]||'check';
  const topology=readTopology();
  if(mode==='select'){publishOutputs(topology);console.log('DaveHub auto-sync destination: '+topology.stagingBranch)}
  else if(mode==='check'){console.log('DaveHub topology: '+topology.phase+', staging branch '+topology.stagingBranch)}
  else if(mode==='headers'){
   const role=buildRole(topology,process.env);
   fs.writeFileSync(process.argv[3]||path.join(root,'dist/_headers'),headersFor(role));
   console.log('Generated '+role+' security/cache/indexing headers');
  }
  else if(mode==='marker'){
   const output=process.argv[3]||path.join(root,'dist/deployment.json');
   const result=deploymentMarker(topology,process.env);
   fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
   console.log('Generated '+result.environment+' release marker for '+(result.branch||'non-Cloudflare-build'));
  }
  else throw Error('Usage: node scripts/dh09d-topology.cjs check|select|headers|marker [output]');
 }catch(err){console.error('DH-09D topology guard failed: '+err.message);process.exitCode=1}
}
module.exports={validateTopology,readTopology,buildRole,headersFor,deploymentMarker};

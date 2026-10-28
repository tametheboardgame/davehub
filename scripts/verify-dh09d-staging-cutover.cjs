'use strict';
/*
 * On-demand DH-09D cutover gate. Invoked by a GitHub Actions push of a
 * CF-Pages-Skip verification request AFTER Cloudflare's production branch
 * has been set to staging. No Cloudflare API key or local command required.
 */
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const HOST='https://davehub.pages.dev';
const SHA=/^[a-f0-9]{40}$/;
const {checks,inspect:checkPage}=require('./check-cloudflare-staging.cjs');
const {once:checkGameRoutes}=require('./check-game-routes.cjs');
const {checkPinned}=require('./check-pinned-game-deployment.cjs');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function validateDeployment(record,expected){
 if(!SHA.test(expected))throw Error('Expected verified staging SHA must be a 40-digit Git commit');
 if(record?.schemaVersion!==1||record.environment!=='staging'||record.branch!=='staging'||
    record.phase!=='staging_cutover'||record.commit!==expected||
    record.stagingHost!=='davehub.pages.dev'||record.productionHost!=='davehub.co.uk')
  throw Error('Cloudflare staging release identity mismatch');
 return record;
}
async function inspectDeployment(expected,fetcher=fetch){
 const response=await fetcher(HOST+'/deployment.json?cutover='+expected,{
  headers:{'Cache-Control':'no-cache','User-Agent':'DH09D-Branch-Cutover-Verifier/1.0'},
  redirect:'follow',signal:AbortSignal.timeout(15000)
 });
 if(!response.ok)throw Error('Staging deployment marker HTTP '+response.status);
 const mime=response.headers.get('content-type')||'';
 if(!mime.includes('application/json'))throw Error('Staging deployment marker is not JSON');
 return validateDeployment(await response.json(),expected);
}
async function verifyGameAndWorldRoutes(){
 for(const c of checks)await checkPage(HOST+c.path+'?dh09d=1',c.required,c.forbidden);
 await checkGameRoutes();
 await checkPinned();
}
async function main(){
 const candidate=JSON.parse(fs.readFileSync(path.join(ROOT,'config/dh09d-staging-verification.json'),'utf8'));
 const sha=candidate?.expectedStagingCommit;
 if(!SHA.test(sha||''))throw Error('No verified staging commit in cutover request');
 let last;
 for(let attempt=1;attempt<=32;attempt++){
  try{
   const identity=await inspectDeployment(sha);
   console.log('PASS staging branch and exact SHA deployed: '+identity.commit);
   await verifyGameAndWorldRoutes();
   console.log('PASS DH-09D: existing Pages project serves staging and both games; ready to unfreeze GitHub staging auto-sync');
   return;
  }catch(err){last=err;console.error('Cutover check '+attempt+'/32: '+err.message);}
  if(attempt<32)await wait(15000);
 }
 throw Error('Cloudflare staging cutover did not verify: '+last.message);
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1});
module.exports={inspectDeployment,validateDeployment};

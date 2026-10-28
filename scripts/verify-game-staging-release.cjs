'use strict';
/* After the GitHub Actions bot advances the staging SHA, wait for the real
 * Cloudflare endpoint to serve that exact build, not an old 200/HTML shell.
 * A successful GitHub build or git push is NOT deployment verification.
 */
const {once}=require('./check-game-routes.cjs');
const URL='https://davehub.pages.dev/games/unicorn-valley/davehub-release.json';
const SHA=/^[a-f0-9]{40}$/;
function pause(ms){return new Promise(done=>setTimeout(done,ms))}
async function inspect(expected,fetcher=fetch){
 if(!SHA.test(expected))throw Error('Invalid expected release SHA');
 const response=await fetcher(URL+'?sha='+expected,{redirect:'follow',
  headers:{'cache-control':'no-cache','user-agent':'DaveHub-upstream-sync-verifier/1.0'},
  signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('Release marker HTTP '+response.status);
 if(!(response.headers.get('content-type')||'').includes('application/json'))
  throw Error('Release marker is not JSON');
 const body=await response.json();
 if(body.schemaVersion!==1||body.game!=='unicorn-valley'||body.sourceRepository!=='tametheboardgame/unicorn-valley')
  throw Error('Unexpected/untrusted release marker');
 if(!SHA.test(body.sourceCommit||''))throw Error('Unverifiable release SHA');
 return {actual:body.sourceCommit,matched:body.sourceCommit===expected,version:body.version};
}
async function main(){
 const expected=process.env.EXPECTED_UPSTREAM_SHA||'';
 if(!SHA.test(expected))throw Error('EXACT upstream SHA is required');
 let lastError='';
 for(let i=1;i<=24;i++){
  try{
   const result=await inspect(expected);
   if(result.matched){
    console.log('Cloudflare is serving Unicorn Valley '+expected+' ('+result.version+')');
    await once();
    console.log('PASS: same-origin browser game HTML, JS, CSS, audio/image resources and pinned SHA checked on real Cloudflare staging');
    return;
   }
   lastError='stale SHA '+result.actual;
  }catch(err){lastError=err.message}
  console.log('Cloudflare staging attempt '+i+'/24: '+lastError);
  if(i<24)await pause(15000);
 }
 throw Error('Cloudflare did not publish the qualified game '+expected+' within the verification window; last state: '+lastError);
}
if(require.main===module)main().catch(err=>{console.error('FAIL post-update staging verification: '+err.message);process.exitCode=1});
module.exports={inspect};

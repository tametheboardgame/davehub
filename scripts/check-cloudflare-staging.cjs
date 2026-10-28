'use strict';
/* Read-only staging website smoke check. Runs in GitHub Actions from an
 * internet-connected runner. No Cloudflare credentials or changes required.
 */
const BASE='https://davehub.pages.dev';
const checks=[
 {path:'/worlds/games/',required:['<style data-davehub-inline="worlds">','data-davehub-inline="staging"','Nothing has landed here yet']},
 {path:'/previews/dh-08c/',required:['<style data-davehub-inline="worlds">','Three creations. One new home.','Unicorn Valley','The Stephen Martin Project','Tame The Board Game']},
 {path:'/previews/dh-08c/worlds/games/',required:['<style data-davehub-inline="worlds">','DESIGN REVIEW ONLY','Unicorn Valley','The Stephen Martin Project','Tame The Board Game']},
 {path:'/previews/dh-08c/creations/unicorn-valley/',required:['<style data-davehub-inline="worlds">','DESIGN REVIEW ONLY','Unicorn Valley']}
];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function inspect(url,required){
 const response=await fetch(url,{redirect:'follow',headers:{'User-Agent':'DaveHub-Staging-Smoke/1.0','Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('HTTP '+response.status+' '+response.statusText);
 const type=response.headers.get('content-type')||'';
 if(!type.includes('text/html'))throw Error('Expected text/html, received '+type);
 const html=await response.text();
 for(const marker of required)if(!html.includes(marker))throw Error('Missing deployed marker: '+marker);
 // Detect accidental raw source code or copy of private material in the page.
 if(/ownerApproved|approved_for_export|public_approved/.test(html))throw Error('Internal approval field leaked in staged HTML');
 return html.length;
}
async function main(){
 const attempts=9,wait=15000;
 for(let n=1;n<=attempts;n++){
  try{
   const results=[];
   for(const c of checks)results.push({path:c.path,bytes:await inspect(BASE+c.path+'?dh08c6=1',c.required)});
   console.log('PASS: public Cloudflare staging pages contain self-contained CSS, reviewed mock-up cards and navigation markers.');
   for(const r of results)console.log('PASS '+r.path+' ('+r.bytes+' HTML bytes)');
   return;
  }catch(err){
   console.error('Attempt '+n+'/'+attempts+': '+err.message);
   if(n<attempts)await pause(wait);
   else throw Error('Cloudflare staging did not serve the expected merged build; inspect Pages deployment/retry status.');
  }
 }
}
if(require.main===module)main().catch(err=>{console.error(err);process.exitCode=1});
module.exports={checks,inspect};

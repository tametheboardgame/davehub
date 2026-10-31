'use strict';
/* Read-only staging website smoke check. Runs in GitHub Actions from an
 * internet-connected runner. No Cloudflare credentials or changes required.
 */
const BASE='https://davehub.pages.dev';
const checks=[
 {path:'/worlds/',required:['<style data-davehub-inline="worlds">','3 creations','2 creations'],forbidden:['data-davehub-inline="staging"']},
 {path:'/worlds/games/',required:['<style data-davehub-inline="worlds">','Unicorn Valley','The Stephen Martin Project','Tame The Board Game','3 creations in this world'],forbidden:['data-davehub-inline="staging"','DESIGN REVIEW ONLY']},
 {path:'/worlds/projects/',required:['<style data-davehub-inline="worlds">','Unicorn Valley','The Stephen Martin Project']},
 {path:'/worlds/writing/',required:['<style data-davehub-inline="worlds">','data-scene="manuscript-hoard"','manuscript-room-v1.avif','<dialog class="room-dialog"','Tame The Board Game','href="/creations/tame-the-board-game/"'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-08b/worlds/writing/',required:['Fictional design demonstration','data-scene="manuscript-hoard"','data-room-panel="bookcase"','The Last Lightkeeper'],forbidden:['href="/creations/last-lightkeeper/"']},
 {path:'/creations/unicorn-valley/',required:['<style data-davehub-inline="worlds">','Unicorn Valley','Play on DaveHub','href="/games/unicorn-valley/"','unicorn-valley.pages.dev','View development repository'],forbidden:['DESIGN REVIEW ONLY']},
 {path:'/creations/stephen-martin-project/',required:['<style data-davehub-inline="worlds">','The Stephen Martin Project','Play on DaveHub','href="/games/stephen-martin/"','stephen-martin-project.pages.dev'],forbidden:['DESIGN REVIEW ONLY']},
 {path:'/creations/tame-the-board-game/',required:['<style data-davehub-inline="worlds">','Tame The Board Game','Miriam','tametheboardgame.com/about/'],forbidden:['DESIGN REVIEW ONLY']},
 {path:'/previews/dh-11c/room/',required:['DH-11C.2','id="room-canvas"','room-plan.js','room.js','Writing desk','Floating-islands window','No catalogue or production changes'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/cabinet/',required:['DH-11C.1','id="cabinet-model"','id="cabinet-slots"','cabinet-math.js','cabinet.js','cabinet.css','Five real 3D drawer bodies'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-08c/',required:['<style data-davehub-inline="worlds">','DESIGN REVIEW ONLY','Three creations. One new home.']}
];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function inspect(url,required,forbidden=[]){
 const response=await fetch(url,{redirect:'follow',headers:{'User-Agent':'DaveHub-Staging-Smoke/1.0','Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('HTTP '+response.status+' '+response.statusText);
 const type=response.headers.get('content-type')||'';
 if(!type.includes('text/html'))throw Error('Expected text/html, received '+type);
 const html=await response.text();
 for(const marker of required)if(!html.includes(marker))throw Error('Missing deployed marker: '+marker);
 for(const marker of forbidden)if(html.includes(marker))throw Error('Stale/invalid deployed marker present: '+marker);
 // Detect accidental raw source code or copy of private material in the page.
 if(/ownerApproved|approved_for_export|public_approved/.test(html))throw Error('Internal approval field leaked in staged HTML');
 return html.length;
}
async function main(){
 const attempts=4,wait=10000;
 for(let n=1;n<=attempts;n++){
  try{
   const results=[];
   for(const c of checks)results.push({path:c.path,bytes:await inspect(BASE+c.path+'?dh08d=1',c.required,c.forbidden)});
   console.log('PASS: Cloudflare serves three approved creation pages, accessible live worlds and separate layout-only previews.');
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

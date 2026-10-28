'use strict';
/* Live Pages HTTP gate for first-party game routes and their real resources.
 * Run only after a main-branch deployment, not against an unmerged preview.
 * This does not substitute for browser gameplay/continue-save testing.
 */
const ORIGIN='https://davehub.pages.dev';
async function get(path,type){
 const response=await fetch(ORIGIN+path,{redirect:'follow',signal:AbortSignal.timeout(20000),
  headers:{'User-Agent':'DaveHub-Game-Routes-Smoke/1.0','Cache-Control':'no-cache'}});
 if(!response.ok)throw Error(path+' returned '+response.status);
 const mime=response.headers.get('content-type')||'';
 if(!mime.includes(type))throw Error(path+' returned wrong content-type: '+mime);
 const buffer=await response.arrayBuffer();
 if(buffer.byteLength===0)throw Error(path+' empty response');
 console.log('PASS '+path+' HTTP '+response.status+' '+mime+' ('+buffer.byteLength+' bytes)');
 return type==='text/html'?new TextDecoder().decode(buffer):null;
}
async function once(){
 const unicorn=await get('/games/unicorn-valley/','text/html');
 if(!unicorn.includes('Unicorn Valley')||!unicorn.includes('/games/unicorn-valley/assets/'))
  throw Error('Unicorn Valley did not render its subpath Vite entry');
 const chunks=[...unicorn.matchAll(/(?:src|href)="(\/games\/unicorn-valley\/assets\/[^"]+)"/g)].map(x=>x[1]);
 const js=chunks.find(x=>/\.js$/.test(x)),css=chunks.find(x=>/\.css$/.test(x));
 if(!js||!css)throw Error('Vite JS/CSS references missing');
 await get(js,'javascript');
 await get(css,'text/css');
 await get('/games/unicorn-valley/audio/sfx/ui-soft-chime.mp3','audio/');
 const stephen=await get('/games/stephen-martin/','text/html');
 if(!stephen.includes('Rescue Stephen Martin')||!stephen.includes('./src/game.js'))
  throw Error('Stephen Martin was not correctly proxied under DaveHub');
 await get('/games/stephen-martin/src/game.js','javascript');
 await get('/games/stephen-martin/src/styles.css','text/css');
 await get('/games/stephen-martin/public/assets/generated/characters/stephen-office-seated-neutral-v01.webp','image/webp');
 const project=await get('/creations/stephen-martin-project/','text/html');
 if(!project.includes('href="/games/stephen-martin/"'))throw Error('Stephen CTA does not use same-origin route');
 const other=await get('/creations/unicorn-valley/','text/html');
 if(!other.includes('href="/games/unicorn-valley/"'))throw Error('Unicorn CTA does not use same-origin route');
 console.log('PASS both games served from DaveHub paths with real JS/CSS/image/audio resources and first-party links');
}
const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
async function main(){
 for(let n=1;n<=8;n++){
  try{await once();return;}
  catch(err){
   console.error('Attempt '+n+'/8: '+err.message);
   if(n===8)throw err;
   await pause(12000);
  }
 }
}
if(require.main===module)main().catch(err=>{console.error('FAIL game route smoke:',err.message);process.exitCode=1});
module.exports={once};

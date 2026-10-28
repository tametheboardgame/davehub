'use strict';
/* Read-only verification of the explicitly approved external links.
 * Runs on a GitHub-hosted runner: no Cloudflare account credentials.
 */
const fs=require('node:fs');
const path=require('node:path');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/public/catalogue.json'),'utf8'));
const approvedIds=['unicorn-valley','stephen-martin-project','tame-the-board-game'];
async function main(){
 const failures=[];
 for(const id of approvedIds){
  const item=source.items.find(x=>x.id===id);
  if(!item){failures.push(id+': missing approved project');continue}
  const primary=item.links.find(x=>x.kind==='play'||x.kind==='official');
  if(!primary){failures.push(id+': missing primary destination');continue}
  try {
   const resp=await fetch(primary.url,{
    redirect:'follow',signal:AbortSignal.timeout(16000),
    headers:{'User-Agent':'DaveHub-External-Destination-Check/1.0'}
   });
   const type=resp.headers.get('content-type')||'';
   if(resp.status<200||resp.status>=400||!type.includes('text/html'))throw Error('HTTP '+resp.status+', type '+type);
   const body=(await resp.text()).slice(0,30000);
   if(!/<html[\s>]/i.test(body)&&!/<body[\s>]/i.test(body))throw Error('Did not receive a website HTML page');
   console.log('PASS '+id+' '+primary.url+' HTTP '+resp.status+' (resolved '+resp.url+')');
  }catch(err){failures.push(id+' '+primary.url+': '+err.message);}
 }
 if(failures.length){for(const failure of failures)console.error('FAIL '+failure);process.exitCode=1;}
}
main().catch(err=>{console.error(err);process.exitCode=1});

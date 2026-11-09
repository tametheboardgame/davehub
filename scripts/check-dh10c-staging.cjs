'use strict';
/* DH-10C: verify REAL deployed hosted review desk, not just a green build.
 * No account token and no editorial write permissions are needed.
 */
const URL='https://davehub.pages.dev/review/';
const required=[
 '<title>Project review · DaveHub</title>',
 'The project review desk',
 'Public staging review area, not a private workspace',
 'data-dh10c="review"',
 'dh10c-editorial-proposal.yml',
 'Review open staging proposals',
 'Opted-in projects',
 'noindex,nofollow'
];
async function inspect(fetcher=fetch){
 const response=await fetcher(URL+'?verify=dh10c',{redirect:'follow',
  headers:{'User-Agent':'DaveHub-DH10C-Smoke/1.0','Cache-Control':'no-cache'},
  signal:AbortSignal.timeout(16000)});
 if(!response.ok)throw Error('Review page HTTP '+response.status);
 if(!(response.headers.get('content-type')||'').includes('text/html'))throw Error('Review page is not HTML');
 const html=await response.text();
 for(const part of required)if(!html.includes(part))throw Error('Review page missing required marker: '+part);
 if(html.includes('<script src="https://')||html.includes('Unpublished manuscript'))throw Error('Review page has unexpected external script or draft text');
 return html.length;
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 let last;
 for(let attempt=1;attempt<=5;attempt++){
  try{
   const bytes=await inspect();
   console.log('PASS DH-10C hosted review route HTTP 200 and approved non-publication markup ('+bytes+' bytes)');
   return;
  }catch(e){last=e;console.error('DH-10C hosted review attempt '+attempt+'/5: '+e.message);}
  if(attempt<5)await wait(12000);
 }
 throw last;
}
if(require.main===module)main().catch(err=>{console.error('FAIL DH-10C live review desk:',err.message);process.exitCode=1});
module.exports={inspect,required};

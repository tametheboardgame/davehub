'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspectDeployment,validateDeployment}=require('../scripts/verify-dh09d-staging-cutover.cjs');
const sha='b'.repeat(40);
const payload={schemaVersion:1,environment:'staging',branch:'staging',commit:sha,
 phase:'staging_cutover',stagingHost:'davehub.pages.dev',productionHost:'davehub.co.uk'};
function responder(data=payload,mime='application/json',status=200){
 return async(url,options)=>{
  assert.equal(url,'https://davehub.pages.dev/deployment.json?cutover='+sha);
  assert.equal(options.redirect,'follow');
  return {ok:status===200,status,headers:{get:()=>mime},json:async()=>data};
 };
}
test('exact staging branch/phase/source SHA verifies existing Pages project',async()=>{
 assert.deepEqual(validateDeployment(payload,sha),payload);
 assert.equal((await inspectDeployment(sha,responder())).commit,sha);
});
test('failed cutover identity, stale main deployment or non-JSON responses are rejected',async()=>{
 for(const change of [{environment:'production'},{branch:'main'},{commit:'a'.repeat(40)},
  {phase:'pre_cutover'},{productionHost:'example.com'},{schemaVersion:2}]){
  await assert.rejects(inspectDeployment(sha,responder({...payload,...change})),/identity mismatch/);
 }
 await assert.rejects(inspectDeployment(sha,responder(payload,'text/html')),/not JSON/);
 await assert.rejects(inspectDeployment(sha,responder(payload,'application/json',404)),/HTTP 404/);
 await assert.rejects(inspectDeployment('main',responder()),/40-digit Git commit/);
});
test('Cloudflare verification is initiated by a separate no-build staging GitHub event',()=>{
 const file=fs.readFileSync(path.join(__dirname,'../.github/workflows/dh09d-staging-cutover-verification.yml'),'utf8');
 assert.match(file,/branches: \[staging\]/);
 assert.match(file,/config\/dh09d-staging-verification\.json/);
 assert.match(file,/node scripts\/verify-dh09d-staging-cutover\.cjs/);
 assert.match(file,/contents: read/);
 assert.doesNotMatch(file,/git push|wrangler pages deploy|CLOUDFLARE_API_TOKEN/i);
});

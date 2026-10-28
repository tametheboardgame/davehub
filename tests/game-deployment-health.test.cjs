'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pinnedRelease,checkPinned}=require('../scripts/check-pinned-game-deployment.cjs');
const {inspect}=require('../scripts/verify-game-staging-release.cjs');
const pin=pinnedRelease();
function fake(version,sha=pin.sha,status=200){
 return async (url,opts)=>{
  assert.match(url,/^https:\/\/davehub\.pages\.dev\/games\/unicorn-valley\/davehub-release\.json\?sha=/);
  assert.ok(opts.headers['cache-control']==='no-cache');
  return {ok:status===200,status,
   headers:{get:k=>k==='content-type'?'application/json':'no-store'},
   json:async()=>({schemaVersion:1,game:'unicorn-valley',sourceRepository:'tametheboardgame/unicorn-valley',sourceCommit:sha,version})};
 };
}
test('no-op hourly monitor reports exact release healthy only with matching SHA and version',async()=>{
 assert.match(pin.sha,/^[a-f0-9]{40}$/);
 assert.match(pin.version,/^main-ci-\d+$/);
 const result=await checkPinned(fake(pin.version));
 assert.equal(result.matched,true);
});
test('no-op hourly monitor fails visibly if Cloudflare still serves old version',async()=>{
 await assert.rejects(()=>checkPinned(fake('main-snapshot-2026-10-28')),/STAGING OUT OF SYNC/);
 await assert.rejects(()=>checkPinned(fake(pin.version,'a'.repeat(40))),/STAGING OUT OF SYNC/);
 await assert.rejects(()=>checkPinned(fake(pin.version,pin.sha,404)),/Release marker HTTP 404/);
});
test('hourly scheduled checks run even when latest upstream CI is blocked or unchanged',()=>{
 const yaml=fs.readFileSync(path.join(__dirname,'../.github/workflows/davehub-game-auto-sync.yml'),'utf8');
 assert.match(yaml,/github\.event_name == 'schedule' && steps\.upstream\.outputs\.action != 'update'/);
 assert.match(yaml,/node scripts\/check-pinned-game-deployment\.cjs/);
 assert.match(yaml,/cancel-in-progress: false/);
 const build=fs.readFileSync(path.join(__dirname,'../scripts/build-pages.sh'),'utf8');
 assert.match(build,/\/games\/unicorn-valley\/davehub-release\.json/);
 assert.match(build,/Cache-Control: no-store/);
});

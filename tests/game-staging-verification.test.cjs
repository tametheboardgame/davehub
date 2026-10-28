'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspect}=require('../scripts/verify-game-staging-release.cjs');
const sha='a'.repeat(40);
function json(body,mime='application/json',status=200){
 return async()=>({ok:status===200,status,headers:{get:()=>mime},json:async()=>body});
}
test('Cloudflare same-origin release marker confirms the exact pinned SHA',async()=>{
 const release={schemaVersion:1,game:'unicorn-valley',sourceRepository:'tametheboardgame/unicorn-valley',sourceCommit:sha,version:'main-ci-123'};
 const result=await inspect(sha,json(release));
 assert.equal(result.matched,true);
 assert.equal(result.version,'main-ci-123');
 assert.equal((await inspect('b'.repeat(40),json(release))).matched,false);
});
test('release verification fails on HTML fallback, wrong project or invalid marker',async()=>{
 const release={schemaVersion:1,game:'unicorn-valley',sourceRepository:'tametheboardgame/unicorn-valley',sourceCommit:sha};
 await assert.rejects(inspect(sha,json(release,'text/html')),/not JSON/);
 await assert.rejects(inspect(sha,json({...release,game:'other'})),/Unexpected\/untrusted/);
 await assert.rejects(inspect(sha,json({...release,sourceCommit:'main'})),/Unverifiable/);
 await assert.rejects(inspect('main',json(release)),/Invalid expected/);
 await assert.rejects(inspect(sha,json(release,'application/json',404)),/HTTP 404/);
});
test('bot-driven hourly staging workflow is gated, builds before committing and checks actual deployment',()=>{
 const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/davehub-game-auto-sync.yml'),'utf8');
 assert.match(workflow,/cron: '37 \* \* \* \*'/);
 assert.match(workflow,/contents: write/);
 assert.match(workflow,/node scripts\/auto-sync-unicorn\.cjs check/);
 assert.match(workflow,/sh scripts\/build-pages\.sh/);
 assert.match(workflow,/node scripts\/auto-sync-unicorn\.cjs verify/);
 assert.match(workflow,/git push origin HEAD:refs\/heads\/main/);
 assert.match(workflow,/node scripts\/verify-game-staging-release\.cjs/);
 assert.match(workflow,/git rev-parse origin\/main/);
 assert.doesNotMatch(workflow,/github\.com\/tametheboardgame\/stephen-martin-project\.git/);
});

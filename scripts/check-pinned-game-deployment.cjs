'use strict';
/* Scheduled health check for an unchanged/blocked source release.
 * Detects the gap where GitHub's pin was updated, but Cloudflare never
 * deployed the matching version. Read-only: no new commits or auto-rollback.
 */
const fs=require('node:fs');
const path=require('node:path');
const {inspect}=require('./verify-game-staging-release.cjs');
function pinnedRelease(root=path.resolve(__dirname,'..')){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'config/game-releases.json'),'utf8'));
 const game=lock.games.find(g=>g.id==='unicorn-valley');
 if(!/^[a-f0-9]{40}$/.test(game?.commit||'')||!/^(main-ci-\d+|main-snapshot-[\d-]+)$/.test(game?.version||''))
  throw Error('Pinned Unicorn Valley SHA/version is invalid');
 return{sha:game.commit,version:game.version};
}
async function checkPinned(fetcher=fetch){
 const pinned=pinnedRelease();
 const result=await inspect(pinned.sha,fetcher,pinned.version);
 if(!result.matched)
  throw Error('STAGING OUT OF SYNC: GitHub expects '+pinned.sha+' ('+pinned.version+
    ') but Cloudflare serves '+result.actual+' ('+result.version+
    '). See the Cloudflare Pages deployment and game-auto-sync runs. No game source was updated.');
 console.log('PASS: deployed staging Unicorn Valley SHA and release version match the pinned GitHub release: '+pinned.sha+' ('+pinned.version+')');
 return result;
}
if(require.main===module)checkPinned().catch(error=>{
 console.error('FAIL Unicorn Valley staging health check:',error.message);
 process.exitCode=1;
});
module.exports={pinnedRelease,checkPinned};

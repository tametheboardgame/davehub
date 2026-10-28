'use strict';
/* DH-09: builds two pinned, independent game releases into DaveHub /games/.
 * Network access is only needed while building, never at runtime. Fail closed
 * on missing assets, changed source, unsafe paths, or incomplete outputs.
 *
 * The two source games remain independently hosted. This script never deletes
 * the original game sites or touches any visitor's localStorage.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'config/game-releases.json'),'utf8'));
const SHA=/^[a-f0-9]{40}$/;
const REPO=/^tametheboardgame\/[a-z0-9-]+$/;
const GAME=/^[a-z][a-z0-9-]{2,79}$/;
const ROOT_ASSET=/(['"\x60])\/(audio|stories|assets)\//g;
function validateConfig(lock=config){
 if(lock.schemaVersion!==1||!Array.isArray(lock.games)||lock.games.length!==2)throw Error('Expected exactly two pinned games');
 const ids=new Set(),outputPaths=new Set();
 for(const g of lock.games){
  if(!GAME.test(g.id)||!GAME.test(g.catalogueId)||ids.has(g.id)||g.output!=='games/'+g.id||
    outputPaths.has(g.output)||!REPO.test(g.repository)||
    (g.build==='vite-subpath'&&!SHA.test(g.commit))||
    (g.build==='upstream-proxy'&&(g.upstream!=='https://stephen-martin-project.pages.dev/'))||
    !['vite-subpath','upstream-proxy'].includes(g.build))throw Error('Invalid or duplicate game lock entry');
  ids.add(g.id);outputPaths.add(g.output);
 }
 if(!ids.has('stephen-martin')||!ids.has('unicorn-valley'))throw Error('Both agreed games are required');
 return lock.games;
}
function run(cmd,args,cwd){
 const result=spawnSync(cmd,args,{
  cwd,env:{...process.env,CI:'true',npm_config_audit:'false',npm_config_fund:'false'},
  stdio:'inherit',maxBuffer:16*1024*1024,
  timeout:12*60*1000
 });
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(cmd+' '+args.join(' ')+' failed ('+result.status+')');
}
function output(cmd,args,cwd){
 const p=spawnSync(cmd,args,{cwd,encoding:'utf8',timeout:30000});
 if(p.error||p.status!==0)throw Error(cmd+' failed: '+(p.stderr||p.error));
 return p.stdout.trim();
}
function visit(dir,fn){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const abs=path.join(dir,entry.name);
  if(entry.isDirectory())visit(abs,fn);
  else if(entry.isFile())fn(abs);
  else throw Error('Symlink or special file not allowed in game bundle: '+abs);
 }
}
/* Vite BASE_URL handles all emitted code chunks and hashed CSS, but generated
 * catalogue URLs for assets in public/ are static "/audio/..." etc. Apply
 * the SAME staging prefix to quoted source literals before bundling.
 * Never patch the source repo, only the disposable pinned checkout.
 */
function makeVitePublicPathsSubpathSafe(sourceDir,prefix){
 let files=0,changes=0;
 for(const dir of ['src']){
  visit(path.join(sourceDir,dir),name=>{
   if(!/\.(?:ts|tsx|js|json|css)$/.test(name))return;
   const original=fs.readFileSync(name,'utf8');
   const rewritten=original.replace(ROOT_ASSET,(_m,q,kind)=>q+prefix+kind+'/');
   if(rewritten!==original){fs.writeFileSync(name,rewritten);changes++;}files++;
  });
 }
 if(changes===0)throw Error('Expected at least one public runtime asset path to rebase for Unicorn Valley');
 console.log('Rebased '+changes+'/'+files+' Unicorn Valley source files for '+prefix);
 return changes;
}
/* Story Library JSON copied verbatim by Vite's public/ handling is not
 * transformed by Vite BASE_URL. Rebase those text catalogues in the built
 * output, without touching hashed JavaScript/CSS bundles.
 */
function rebasePublishedTextFiles(dist,prefix){
 let changed=0;
 visit(dist,name=>{
  if(!/\.(?:json|md|html)$/.test(name))return;
  const original=fs.readFileSync(name,'utf8');
  const next=original.replace(ROOT_ASSET,(_m,q,kind)=>q+prefix+kind+'/');
  if(next!==original){fs.writeFileSync(name,next);changed++;}
 });
 console.log('Rebased '+changed+' published Unicorn Valley Story Library/catalogue text files');
 return changed;
}
function verifyIndex(dir,id){
 const index=path.join(dir,'index.html');
 if(!fs.existsSync(index))throw Error('Missing game index.html: '+id);
 const html=fs.readFileSync(index,'utf8');
 if(!html.toLowerCase().includes('<!doctype html>'))throw Error('Invalid game HTML: '+id);
 if(id==='unicorn-valley'){
  if(!html.includes('Unicorn Valley')||!html.includes('/games/unicorn-valley/assets/'))throw Error('Vite base path was not applied');
  if(/(?:src|href)="\/assets\//.test(html))throw Error('Unicorn Valley game assets escape to DaveHub root');
 }else{
  if(!html.includes('Rescue Stephen Martin')||!html.includes('./src/game.js')||!html.includes('./src/styles.css'))throw Error('Stephen Martin relative entry assets missing');
 }
 let count=0,bytes=0;
 visit(dir,name=>{
  const stat=fs.statSync(name);
  if(!stat.size)throw Error('Zero-byte game asset: '+name);
  if(stat.size>25*1024*1024)throw Error('Cloudflare Pages file size limit exceeded: '+name);
  count++;bytes+=stat.size;
  if(id==='unicorn-valley'&&/\.(?:js|css|json)$/.test(name)){
   const text=fs.readFileSync(name,'utf8');
   // Fail on leftover quoted literal root public asset URLs in generated output.
   // Fingerprinted Vite chunks already start with /games/unicorn-valley/.
   if(/['"\x60]\/(?:audio|stories|assets)\//.test(text))throw Error('Unrebased public URL in '+name);
  }
 });
 if(count<20||bytes<100000)throw Error('Suspiciously incomplete built game: '+id+' ('+count+' files)');
 console.log('PASS '+id+': '+count+' files / '+Math.round(bytes/1024/1024)+' MB, index and asset prefixes verified');
 return {count,bytes};
}
function getPinnedSource(game,temp){
 const dir=path.join(temp,game.id);
 fs.mkdirSync(dir,{recursive:true});
 run('git',['init','--quiet'],dir);
 run('git',['remote','add','origin','https://github.com/'+game.repository+'.git'],dir);
 run('git',['fetch','--depth=1','--quiet','origin',game.commit],dir);
 run('git',['checkout','--quiet','--detach','FETCH_HEAD'],dir);
 const actual=output('git',['rev-parse','HEAD'],dir);
 if(actual!==game.commit)throw Error('Git source SHA mismatch for '+game.id+': '+actual);
 console.log('PINNED '+game.repository+' @ '+actual);
 return dir;
}
function buildGame(game,sourceDir,outputDir){
 if(game.build!=='vite-subpath')throw Error('Only pinned Vite distributions are built locally');
 {
  run('npm',['ci','--no-audit','--no-fund'],sourceDir);
  run('npm',['run','audio:catalogue'],sourceDir);
  run('npm',['run','story:catalogue'],sourceDir);
  makeVitePublicPathsSubpathSafe(sourceDir,'/games/'+game.id+'/');
  run('npm',['run','typecheck'],sourceDir);
  // Running "npm run build" would regenerate the source catalogues and
  // discard their path rebasing; invoke the same bundler directly instead.
  run('npm',['exec','--','vite','build','--base=/games/'+game.id+'/','--manifest'],sourceDir);
 }
 const source=path.join(sourceDir,'dist');
 if(game.build==='vite-subpath')rebasePublishedTextFiles(source,'/games/'+game.id+'/');
 verifyIndex(source,game.id);
 const target=path.join(outputDir,game.output);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.cpSync(source,target,{recursive:true,force:false,errorOnExist:true});
 verifyIndex(target,game.id);
 return target;
}
function checkOnly(directory){
 for(const game of validateConfig()){
  if(game.build==='upstream-proxy'){
   const proxy=path.join(root,'functions/games',game.id,'[[path]].js');
   if(!fs.existsSync(proxy))throw Error('Public-origin game proxy missing: '+game.id);
   const routes=JSON.parse(fs.readFileSync(path.join(directory,'_routes.json'),'utf8'));
   if(routes.version!==1||routes.include.length!==1||routes.include[0]!=='/games/stephen-martin/*')
    throw Error('Cloudflare Pages Functions routes must be confined to Stephen Martin only');
   continue;
  }
  const where=path.join(directory,game.output);
  if(!fs.existsSync(where))throw Error('Game output missing: '+game.output);
  verifyIndex(where,game.id);
 }
 console.log('PASS pinned Unicorn Valley bundle and scoped Stephen Martin same-origin proxy');
}
function bundle(out){
 const games=validateConfig();
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'davehub-pinned-games-'));
 try{
  for(const game of games){
   if(game.build==='upstream-proxy')continue;
   const dir=getPinnedSource(game,temp);
   buildGame(game,dir,out);
  }
  checkOnly(out);
 }finally{fs.rmSync(temp,{recursive:true,force:true,maxRetries:3})}
}
if(require.main===module){
 try{
  const [mode,directory]=process.argv.slice(2);
  if(!directory||!['build','verify'].includes(mode))throw Error('Usage: node scripts/bundle-games.cjs build|verify dist');
  const out=path.resolve(directory);
  if(mode==='build')bundle(out);else checkOnly(out);
 }catch(err){console.error('FAIL DH-09 game bundling:',err.stack||err.message);process.exitCode=1}
}
module.exports={validateConfig,makeVitePublicPathsSubpathSafe,rebasePublishedTextFiles,verifyIndex,checkOnly};

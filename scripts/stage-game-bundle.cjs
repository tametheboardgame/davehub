'use strict';
/* DH-09A: package *already-built* static game output into DaveHub's Pages dist.
 *
 * Does not fetch floating game main, build games, or imply public-release
 * authorization. The caller must separately verify immutable release source.
 * CLI:
 *   node scripts/stage-game-bundle.cjs stephen-martin /path/to/verified/dist ./dist
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROUTES=new Set(['stephen-martin','unicorn-valley']);
const MAX_SINGLE_FILE_BYTES=25*1024*1024;
const MAX_FILES=20000;

function stageGame(slug,source,davehubDist){
 if(!ROUTES.has(slug))throw Error('Unapproved game route '+String(slug));
 const sourceAbs=path.resolve(source),destRoot=path.resolve(davehubDist);
 if(!fs.existsSync(sourceAbs)||!fs.statSync(sourceAbs).isDirectory())throw Error('Game output directory missing: '+sourceAbs);
 if(!fs.existsSync(path.join(sourceAbs,'index.html'))||!fs.statSync(path.join(sourceAbs,'index.html')).isFile())throw Error('Missing game index.html');
 if(!fs.existsSync(destRoot)||!fs.statSync(destRoot).isDirectory())throw Error('DaveHub dist directory must exist');
 const target=path.join(destRoot,'games',slug);
 if(fs.existsSync(target))throw Error('Game target already exists; refusing stale or mixed release: '+target);
 if(target.startsWith(sourceAbs+path.sep)||sourceAbs.startsWith(target+path.sep))throw Error('Source/destination overlap is unsafe');
 const entries=[];
 const visit=(directory,rel='')=>{
  for(const dirent of fs.readdirSync(directory,{withFileTypes:true})){
   if(dirent.isSymbolicLink())throw Error('Symlink rejected: '+path.join(rel,dirent.name));
   const abs=path.join(directory,dirent.name);
   const destRelative=path.join(rel,dirent.name);
   if(dirent.isDirectory()){visit(abs,destRelative);continue;}
   if(!dirent.isFile())throw Error('Unusual filesystem entry rejected: '+destRelative);
   const size=fs.statSync(abs).size;
   if(size>MAX_SINGLE_FILE_BYTES)throw Error('Asset larger than Pages 25MiB limit: '+destRelative);
   entries.push({abs,rel:destRelative.replaceAll(path.sep,'/'),size});
   if(entries.length>MAX_FILES)throw Error('Game asset count exceeds Pages Free limit');
  }
 };
 visit(sourceAbs);
 if(!entries.length)throw Error('Empty game bundle');
 entries.sort((a,b)=>a.rel.localeCompare(b.rel,'en'));
 // Avoid a broad filesystem move or a half-prepared artifact.
 const staging=path.join(destRoot,'games','.staging-'+slug+'-'+crypto.randomBytes(6).toString('hex'));
 fs.mkdirSync(staging,{recursive:true});
 try{
  for(const item of entries){
   const dest=path.join(staging,item.rel);
   fs.mkdirSync(path.dirname(dest),{recursive:true});
   fs.copyFileSync(item.abs,dest,fs.constants.COPYFILE_EXCL);
  }
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.renameSync(staging,target);
 }catch(e){fs.rmSync(staging,{recursive:true,force:true});throw e}
 const digest=crypto.createHash('sha256');
 for(const item of entries){
  digest.update(item.rel+'\0'+item.size+'\0');
  digest.update(fs.readFileSync(item.abs));
 }
 return {slug,path:'/games/'+slug+'/',files:entries.length,bytes:entries.reduce((a,b)=>a+b.size,0),contentSha256:digest.digest('hex')};
}
module.exports={stageGame,ROUTES,MAX_SINGLE_FILE_BYTES,MAX_FILES};
if(require.main===module){
 const [slug,source,target]=process.argv.slice(2);
 if(!slug||!source||!target)throw Error('Usage: node scripts/stage-game-bundle.cjs <slug> <verified-game-dist> <davehub-dist>');
 const receipt=stageGame(slug,source,target);
 process.stdout.write(JSON.stringify(receipt,null,2)+'\n');
}

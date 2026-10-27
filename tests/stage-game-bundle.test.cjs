'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {stageGame,ROUTES}=require('../scripts/stage-game-bundle.cjs');
const each=fn=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'davehub-game-stage-'));
 const source=path.join(tmp,'source');
 const dest=path.join(tmp,'dist');
 fs.mkdirSync(source);fs.mkdirSync(dest);
 try{return fn({tmp,source,dest})}finally{fs.rmSync(tmp,{recursive:true,force:true})}
};
test('supported paths are stable, host-independent and independent of a custom domain',()=>{
 assert.deepEqual([...ROUTES].sort(),['stephen-martin','unicorn-valley']);
});
test('nested static files are packaged beneath the correct DaveHub route',()=>each(({source,dest})=>{
 fs.writeFileSync(path.join(source,'index.html'),'<script src="./src/game.js"></script>');
 fs.mkdirSync(path.join(source,'src'));
 fs.writeFileSync(path.join(source,'src','game.js'),'window.gameStarted=true;');
 const r=stageGame('stephen-martin',source,dest);
 assert.equal(r.path,'/games/stephen-martin/');
 assert.equal(r.files,2);
 assert.match(r.contentSha256,/^[a-f0-9]{64}$/);
 assert.equal(fs.readFileSync(path.join(dest,'games','stephen-martin','index.html'),'utf8'),'<script src="./src/game.js"></script>');
 assert.equal(fs.readFileSync(path.join(dest,'games','stephen-martin','src','game.js'),'utf8'),'window.gameStarted=true;');
}));
test('second release cannot silently overwrite or mix a preexisting game',()=>each(({source,dest})=>{
 fs.writeFileSync(path.join(source,'index.html'),'ok');
 stageGame('unicorn-valley',source,dest);
 assert.throws(()=>stageGame('unicorn-valley',source,dest),/already exists/);
}));
test('unknown destinations and missing game entrypoints fail safely',()=>each(({source,dest})=>{
 assert.throws(()=>stageGame('other-game',source,dest),/Unapproved game route/);
 assert.throws(()=>stageGame('unicorn-valley',source,dest),/Missing game index/);
}));
test('large assets above 25 MiB are rejected',()=>each(({source,dest})=>{
 fs.writeFileSync(path.join(source,'index.html'),'ok');
 fs.writeFileSync(path.join(source,'oversized.bin'),Buffer.alloc(25*1024*1024+1));
 assert.throws(()=>stageGame('stephen-martin',source,dest),/25MiB limit/);
 assert.equal(fs.existsSync(path.join(dest,'games','stephen-martin')),false);
}));
test('symbolic links cannot escape the source archive',()=>each(({tmp,source,dest})=>{
 fs.writeFileSync(path.join(source,'index.html'),'ok');
 const outside=path.join(tmp,'private.txt');fs.writeFileSync(outside,'secret');
 try{fs.symlinkSync(outside,path.join(source,'private-link.txt'))}catch(e){
  if(['EPERM','EACCES','ENOTSUP'].includes(e.code))return;
  throw e;
 }
 assert.throws(()=>stageGame('stephen-martin',source,dest),/Symlink rejected/);
 assert.equal(fs.existsSync(path.join(dest,'games','stephen-martin')),false);
}));
test('preexisting DaveHub homepage output is never overwritten by staging',()=>each(({source,dest})=>{
 fs.writeFileSync(path.join(source,'index.html'),'the game');
 fs.writeFileSync(path.join(dest,'index.html'),'the hub');
 stageGame('stephen-martin',source,dest);
 assert.equal(fs.readFileSync(path.join(dest,'index.html'),'utf8'),'the hub');
}));

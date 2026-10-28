'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {validateConfig,makeVitePublicPathsSubpathSafe,checkOnly}=require('../scripts/bundle-games.cjs');
const {filesFor}=require('../scripts/render-content.cjs');
const releases=validateConfig();
const root=path.join(__dirname,'..');

test('two unique immutable source commits and matching canonical content records',()=>{
 const catalogue=JSON.parse(fs.readFileSync(path.join(root,'content/public/catalogue.json'),'utf8'));
 assert.equal(releases.length,2);
 assert.deepEqual(releases.map(g=>g.id).sort(),['stephen-martin','unicorn-valley']);
 for(const g of releases){
  assert.match(g.repository,/^tametheboardgame\//);
  assert.match(g.commit,/^[0-9a-f]{40}$/);
  assert.ok(catalogue.items.some(i=>i.id===g.catalogueId&&i.publication.status==='public_approved'));
  assert.equal(g.output,'games/'+g.id);
 }
 assert.throws(()=>validateConfig({schemaVersion:1,games:[releases[0],releases[0]]}),/Invalid or duplicate/);
 assert.throws(()=>validateConfig({schemaVersion:1,games:[{...releases[0],commit:'main'},releases[1]]}),/Invalid or duplicate/);
});

test('Vite audio and public assets are rebased only in the disposable source checkout',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'davehub-asset-test-'));
 try{
  const src=path.join(dir,'src');
  fs.mkdirSync(src);
  const file=path.join(src,'paths.ts');
  fs.writeFileSync(file,"const a=\"/audio/title.mp3\";const b='/stories/book.json';const c=\"/assets/item.webp\";const d=\"/games/unicorn-valley/assets/built.js\";const e=\"./relative\";");
  const count=makeVitePublicPathsSubpathSafe(dir,'/games/unicorn-valley/');
  assert.equal(count,1);
  const result=fs.readFileSync(file,'utf8');
  assert.match(result,/\/games\/unicorn-valley\/audio\/title.mp3/);
  assert.match(result,/\/games\/unicorn-valley\/stories\/book.json/);
  assert.match(result,/\/games\/unicorn-valley\/assets\/item.webp/);
  assert.doesNotMatch(result,/\/games\/unicorn-valley\/games\//);
  assert.match(result,/const e="\.\/relative"/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

test('approved DaveHub creation pages launch games within the same site',()=>{
 const c=JSON.parse(fs.readFileSync(path.join(root,'content/public/catalogue.json'),'utf8'));
 const pages=filesFor(c,'',false);
 const unicorn=pages.get('creations/unicorn-valley/index.html');
 const stephen=pages.get('creations/stephen-martin-project/index.html');
 const blog=pages.get('creations/tame-the-board-game/index.html');
 assert.match(unicorn,/class="primary-launch" href="\/games\/unicorn-valley\/"/);
 assert.match(stephen,/class="primary-launch" href="\/games\/stephen-martin\/"/);
 assert.match(unicorn,/Play on DaveHub/);
 assert.match(unicorn,/saves from the old standalone game website do not automatically transfer/);
 assert.doesNotMatch(unicorn,/<a class="primary-launch"[^>]+target="_blank"/);
 assert.doesNotMatch(stephen,/<a class="primary-launch"[^>]+target="_blank"/);
 assert.match(blog,/Visit original website/);
 assert.match(blog,/<a class="primary-launch"[^>]+target="_blank"/);
 assert.match(unicorn,/https:\/\/unicorn-valley\.pages\.dev\//,'standalone fallbacks must remain');
});

test('packaged game pages and required runtime resources are self-contained',()=>{
 const dist=path.join(root,'dist');
 checkOnly(dist);
 for(const id of ['unicorn-valley','stephen-martin']){
  const folder=path.join(dist,'games',id);
  const html=fs.readFileSync(path.join(folder,'index.html'),'utf8');
  assert.doesNotMatch(html,/iframe/i,'must be a genuine same-origin game, not remote iframe');
  assert.doesNotMatch(html,/https:\/\/(?:unicorn-valley|stephen-martin-project)\.pages\.dev\//);
  if(id==='unicorn-valley'){
   assert.ok(fs.existsSync(path.join(folder,'audio','music')));
   assert.ok(fs.existsSync(path.join(folder,'stories')));
   const assetRefs=[...html.matchAll(/(?:href|src)="(\/games\/unicorn-valley\/[^"]+)"/g)].map(x=>x[1]);
   assert.ok(assetRefs.some(x=>/\/assets\/.+\.js$/.test(x)));
   for(const ref of assetRefs){
    const local=path.join(dist,decodeURI(ref).replace(/^\//,''));
    assert.ok(fs.existsSync(local),'missing subpath game asset '+ref);
   }
  }else{
   assert.ok(fs.existsSync(path.join(folder,'src','game.js')));
   assert.ok(fs.existsSync(path.join(folder,'src','styles.css')));
   assert.ok(fs.existsSync(path.join(folder,'public','assets','audio','dialogue')));
  }
 }
});

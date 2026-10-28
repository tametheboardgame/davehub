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
  if(g.build==='vite-subpath')assert.match(g.commit,/^[0-9a-f]{40}$/);
  else { assert.equal(g.build,'upstream-proxy');assert.match(g.sourceCommitAtReview,/^[0-9a-f]{40}$/); }
  assert.ok(catalogue.items.some(i=>i.id===g.catalogueId&&i.publication.status==='public_approved'));
  assert.equal(g.output,'games/'+g.id);
 }
 assert.throws(()=>validateConfig({schemaVersion:1,games:[releases[0],releases[0]]}),/Invalid or duplicate/);
 assert.throws(()=>validateConfig({schemaVersion:1,games:releases.map(g=>g.build==='vite-subpath'?{...g,commit:'main'}:g)}),/Invalid or duplicate/);
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

test('pinned Unicorn Valley source emits complete subpath game assets',()=>{
 const dist=path.join(root,'dist');
 checkOnly(dist);
 const folder=path.join(dist,'games','unicorn-valley');
 const html=fs.readFileSync(path.join(folder,'index.html'),'utf8');
 assert.doesNotMatch(html,/iframe/i,'must be same-origin, not a remote iframe');
 assert.ok(fs.existsSync(path.join(folder,'audio','music')));
 assert.ok(fs.existsSync(path.join(folder,'stories')));
 const assetRefs=[...html.matchAll(/(?:href|src)="(\/games\/unicorn-valley\/[^"]+)"/g)].map(x=>x[1]);
 assert.ok(assetRefs.some(x=>/\/assets\/.+\.js$/.test(x)));
 for(const ref of assetRefs){
  const local=path.join(dist,decodeURI(ref).replace(/^\//,''));
  assert.ok(fs.existsSync(local),'missing subpath asset '+ref);
 }
});

test('Stephen Martin public game is proxied only within an explicit function route',()=>{
 const routes=JSON.parse(fs.readFileSync(path.join(root,'dist','_routes.json'),'utf8'));
 assert.deepEqual(routes,{version:1,include:['/games/stephen-martin/*'],exclude:[]});
 const filename=path.join(root,'functions/games/stephen-martin/[[path]].js');
 const handler=fs.readFileSync(filename,'utf8');
 assert.match(handler,/const ORIGIN='https:\/\/stephen-martin-project\.pages\.dev'/);
 assert.match(handler,/new URL\(ORIGIN\+suffix\+incoming\.search\)/);
 assert.match(handler,/ALLOWED_METHODS/);
 assert.match(handler,/X-Content-Type-Options/);
 assert.match(handler,/redirect:'follow'/);
 assert.doesNotMatch(handler,/github\.com|GITHUB_TOKEN|Authorization/i);
});

test('Stephen proxy forwards only GET to fixed public origin and strips cookies',async()=>{
 const src=fs.readFileSync(path.join(root,'functions/games/stephen-martin/[[path]].js'),'utf8');
 const module=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
 const originalFetch=globalThis.fetch;
 const captured=[];
 globalThis.fetch=async(url,options)=>{
  captured.push({url,options});
  return new Response('<!doctype html><title>Rescue Stephen Martin</title>',{
    headers:{'Content-Type':'text/html','Set-Cookie':'unsafe=1'}
  });
 };
 try{
  const context={request:new Request('https://davehub.pages.dev/games/stephen-martin/src/game.js?test=1')};
  const reply=await module.onRequest(context);
  assert.equal(reply.status,200);
  assert.equal(captured.length,1);
  assert.equal(captured[0].url,'https://stephen-martin-project.pages.dev/src/game.js?test=1');
  assert.equal(reply.headers.get('set-cookie'),null);
  assert.equal(reply.headers.get('x-content-type-options'),'nosniff');
  const invalid=await module.onRequest({request:new Request('https://davehub.pages.dev/games/stephen-martin/src/%2fetc')});
  assert.equal(invalid.status,400);
  assert.equal(captured.length,1);
  const post=await module.onRequest({request:new Request('https://davehub.pages.dev/games/stephen-martin/',{method:'POST'})});
  assert.equal(post.status,405);
 }finally{globalThis.fetch=originalFetch}
});

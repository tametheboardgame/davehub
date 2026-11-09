'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const personality=require('../prototypes/dh-11c-room/manuscript-personality.js');
const windowArt=require('../prototypes/dh-11c-room/window-illustration-v2.js');
const furniture=require('../prototypes/dh-11c-room/furniture-asset.js');
const renderer=require('../scripts/render-dh11c5d3f-personality.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function recording(){
 const calls=[],ctx=new Proxy({},{
  get(_,key){return (...args)=>{calls.push([key,...args]);};},
  set(_,key,value){calls.push(['set',key,value]);return true;}
 });
 return {ctx,calls};
}
test('80 physical books each have their own explicit readable joke title, not shared insignias',()=>{
 assert.equal(personality.BOOK_TITLES.length,80);
 assert.equal(new Set(personality.BOOK_TITLES).size,80);
 for(let shelf=0;shelf<4;shelf++)for(let slot=0;slot<20;slot++)
  assert.equal(personality.bookIndex('book_'+shelf+'_'+String(slot).padStart(2,'0')),shelf*20+slot);
 assert.equal(personality.bookIndex('book_2_20'),-1);
 assert.equal(personality.bookIndex('book_4_00'),-1);
 const distinct=personality.BOOK_TITLES.map((title,i)=>{
  assert.ok(title.length>=7&&title.length<=30);
  const {ctx,calls}=recording();
  personality.paintSpine(ctx,160,768,i,i%10===0);
  assert.ok(calls.some(c=>c[0]==='fillText'&&c[1]===title),'paint actual book title '+title);
  assert.ok(calls.some(c=>c[0]==='strokeText'&&c[1]===title));
  return JSON.stringify(calls);
 });
 assert.equal(new Set(distinct).size,80);
});
test('every visible manuscript has irreverent scrawling, crossed-out marks and different paths',()=>{
 assert.equal(personality.SCRAWLS.length,15);
 const pages=Array.from({length:13},(_,i)=>'desk_paper_'+String(i).padStart(2,'0')).concat(['desk_file_sheet','typewriter_paper']);
 const signatures=pages.map((p,i)=>{
  assert.equal(personality.inkIndex(p),i);
  const {ctx,calls}=recording();personality.paintScrawl(ctx,512,352,i);
  assert.ok(calls.some(c=>c[0]==='fillText'&&c[1]===personality.SCRAWLS[i]));
  assert.ok(calls.some(c=>c[0]==='ellipse'),'circled revisions');
  assert.ok(calls.some(c=>c[0]==='bezierCurveTo'),'hand-drawn strokes');
  assert.ok(calls.filter(c=>c[0]==='lineTo').length>=5,'cross-outs and arrows');
  return JSON.stringify(calls);
 });
 assert.equal(new Set(signatures).size,15);
 assert.equal(personality.inkIndex('desk_paper_13'),-1);
});
test('ink/title panels attach to the actual GLB meshes and never steal clicks',()=>{
 const original=global.document;
 const objects=furniture.nodes.filter(x=>personality.bookIndex(x.name)>=0||personality.inkIndex(x.name)>=0);
 assert.equal(objects.length,95,'80 real books and 15 real sheets');
 const model=objects.map(o=>{
  const geometry={boundingBox:{min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}}};
  return {name:o.name,isMesh:true,geometry,scale:{x:o.size[0],y:o.size[1],z:o.size[2]},children:[],userData:{},
   add(node){this.children.push(node);}};
 });
 try{
  global.document={createElement(){return {width:0,height:0,getContext(){return recording().ctx;}};}};
  class Texture{constructor(canvas){this.canvas=canvas;}}
  class BasicMat{constructor(options){Object.assign(this,options);}}
  class Plane{constructor(w,h){this.width=w;this.height=h;}}
  class Mesh{constructor(geometry,material){
   this.geometry=geometry;this.material=material;this.rotation={x:0};
   this.position={set(...p){this.value=p;}};
   this.userData={};this.children=[];
  }}
  const THREE={CanvasTexture:Texture,PlaneGeometry:Plane,MeshBasicMaterial:BasicMat,Mesh,
   DoubleSide:2,SRGBColorSpace:'srgb'};
  const root={traverse(fn){for(const node of model)fn(node);}};
  const art=personality.create({THREE,root});
  assert.equal(art.count,95);
  assert.ok(model.every(node=>node.children.length===1));
  assert.ok(model.every(node=>node.children[0].userData.decorativeOnly&&node.children[0].raycast));
  assert.ok(model.every(node=>node.children[0].visible===false));
  art.setVisible(true);assert.ok(model.every(node=>node.children[0].visible));
  art.setVisible(false);assert.ok(model.every(node=>!node.children[0].visible));
  const book=model.find(n=>n.name==='book_0_00');
  assert.equal(book.userData.manuscriptJokeTitle,personality.BOOK_TITLES[0]);
 }finally{global.document=original;}
});
test('the background is clipped into four physical window openings, independent of zoom',()=>{
 const panes=windowArt.paneVertices(0);
 assert.equal(windowArt.LAYERS.length,3);
 assert.deepEqual(windowArt.LAYERS.map(x=>x.z),[0,.018,.037]);
 assert.equal(panes.position.length,4*4*3);
 assert.equal(panes.indices.length,4*6);
 assert.equal(panes.uv.length,4*4*2);
 const xs=[],ys=[];for(let i=0;i<panes.position.length;i+=3){xs.push(panes.position[i]);ys.push(panes.position[i+1]);}
 assert.ok(xs.every(x=>Math.abs(x)<=1.565+1e-6));
 assert.ok(ys.every(y=>Math.abs(y)<=1.235+1e-6));
 assert.ok(panes.uv.every(x=>x>=0&&x<=1));
 const c=windowArt.cover(1920,1080);
 assert.ok(c.u<1&&c.v===1,'wide source crops horizontally into the 4:3 window');
 const mapped=windowArt.paneVertices(0,c);
 assert.ok(mapped.uv.every(x=>x>=0&&x<=1));
 const source=read('prototypes/dh-11c-room/window-illustration-v2.js');
 assert.ok(source.includes('for(const node of original)node.visible=!active'));
 assert.ok(!source.includes('const islands=near?'),'no duplicate hand-drawn floating-island disks');
 assert.ok(source.includes('new THREE.BufferGeometry()'));
});
test('window art hides all original island groups when enabled, restores them in reference mode',()=>{
 const original=global.document;
 try{
  global.document={createElement(){return {width:0,height:0,getContext(){return recording().ctx;}};}};
  class Group{constructor(){this.userData={};this.children=[];}add(x){this.children.push(x);}}
  class Buf{setAttribute(){return this;}setIndex(){return this;}}
  class Attr{constructor(data,n){this.data=data;this.n=n;}}
  class Mesh{constructor(){this.userData={};this.position={set(){}};}}
  class Tx{constructor(){this.image={width:1920,height:1080};}}
  class Loader{load(_,done){done(new Tx());}}
  const sceneNames=['window_sky','window_island_0','window_island_1','window_island_2'];
  const objects=Object.fromEntries(sceneNames.map(name=>[name,{visible:true}]));
  const root=new Group();root.getObjectByName=name=>objects[name];
  const THREE={Group,BufferGeometry:Buf,Float32BufferAttribute:Attr,MeshBasicMaterial:class{},
   Mesh,CanvasTexture:Tx,TextureLoader:Loader,DoubleSide:2,SRGBColorSpace:'srgb'};
  const art=windowArt.mount({THREE,root,url:'/assets/homepage/floating-islands-background.png'});
  assert.equal(art.ready,true);
  assert.equal(root.children.length,1);
  assert.equal(root.children[0].children.length,3);
  assert.ok(sceneNames.every(n=>objects[n].visible===false));
  art.setVisible(false);assert.ok(sceneNames.every(n=>objects[n].visible===true));
  art.setVisible(true);assert.ok(sceneNames.every(n=>objects[n].visible===false));
 }finally{global.document=original;}
});
test('cabinet label readability and named-book interaction are V5-gated',()=>{
 const source=read('prototypes/dh-11c-room/room.js');
 for(const marker of ["document.body.dataset.personalityProof==='true'",
  "ctx.font=personalityProof?'bold 146px Georgia,serif'",
  'ctx.strokeText(text,W/2,H*.53,W*.82)',
  'personalityProof?1.31:authoredDetailProof?.96:.42',
  'personalityProof?.28:authoredDetailProof?.20:.1',
  'manuscriptPersonality.setVisible',
  'DH11ManuscriptPersonality.create',
  'names?.[shelf*20+slot]',
  "capture(id,next.get(id));"])assert.ok(source.includes(marker),marker);
});
test('render is V5-only and both earlier studies remain on separate URLs',()=>{
 const page=renderer.render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5D.3F','data-personality-proof="true"',
  'manuscript-personality.js?v=dh11c5d3f-readable-hoard-v1',
  'window-illustration-v2.js?v=dh11c5d3f-readable-hoard-v1',
  'room.js?v=dh11c5d3f-readable-hoard-v1',
  'high-illustration-3d-v4.js?v=dh11c5d3f-readable-hoard-v1'])
  assert.ok(page.includes(marker),marker);
 for(const forbidden of ['The Last Lightkeeper','The Clock of Tomorrow'])
  assert.ok(!page.includes(forbidden));
 assert.ok(!read('scripts/render-dh11c5d3e-details.cjs').includes('manuscript-personality.js'));
});

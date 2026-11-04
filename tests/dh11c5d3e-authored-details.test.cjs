'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const art=require('../prototypes/dh-11c-room/high-illustration-3d-v4.js');
const windowArt=require('../prototypes/dh-11c-room/window-illustration.js');
const oldArt=require('../prototypes/dh-11c-room/high-illustration-3d-v3.js');
const preview=require('../scripts/render-dh11c5d3e-details.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

function recordingCtx(){
 const calls=[];
 const ctx=new Proxy({},{
  set(_,prop,value){calls.push(['set',prop,value]);return true;},
  get(_,prop){return (...args)=>{calls.push([prop,...args]);return undefined;};}
 });
 return {ctx,calls};
}
test('all eighty book spines use stable individually distinct 3D surface artwork',()=>{
 const names=Array.from({length:4},(_,s)=>Array.from({length:20},(_,n)=>
  'book_'+s+'_'+String(n).padStart(2,'0'))).flat();
 const variants=names.map(n=>art.artVariant(n,art.kindFor(n,{color:{getHexString:()=>'000000'}})));
 assert.deepEqual(variants,Array.from({length:80},(_,i)=>i+1));
 assert.equal(new Set(variants).size,80);
 const signatures=variants.map(v=>{
  const {ctx,calls}=recordingCtx();
  assert.equal(art.paintCanvas(ctx,256,'binding',false,v),true);
  return JSON.stringify(calls);
 });
 assert.equal(new Set(signatures).size,80);
 assert.equal(art.artVariant('book_4_00','binding'),0);
 assert.equal(art.artVariant('book_2_20','binding'),0);
 for(const n of names)assert.equal(art.artVariant(n,'binding'),art.artVariant(n,'binding'));
});
test('all desk sheets, file leaf, typewriter page and nine bin papers get individual markings',()=>{
 const pages=Array.from({length:13},(_,i)=>'desk_paper_'+String(i).padStart(2,'0'));
 pages.push('desk_file_sheet','typewriter_paper');
 pages.push(...Array.from({length:9},(_,i)=>'bin_paper_'+i));
 const variants=pages.map(name=>art.artVariant(name,'parchment'));
 assert.equal(variants.length,24);
 assert.equal(new Set(variants).size,24);
 const signatures=variants.map(v=>{
  const {ctx,calls}=recordingCtx();art.paintCanvas(ctx,256,'parchment',false,v);
  return JSON.stringify(calls);
 });
 assert.equal(new Set(signatures).size,24);
 assert.equal(art.artVariant('desk_cup','parchment'),0);
});
test('new detail does not alter old sculpted geometry or camera source',()=>{
 const b={min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}};
 for(const n of ['bookcase_crown','bookcase_side_0','bookcase_shelf_2','book_2_09','desk_surface'])
  assert.deepEqual(art.sculpturePlan(n,b),oldArt.sculpturePlan(n,b));
 assert.deepEqual(art.reliefPaths('desk_surface',b),oldArt.reliefPaths('desk_surface',b));
 const newSource=read('prototypes/dh-11c-room/high-illustration-3d-v4.js');
 assert.ok(newSource.includes("const size=(kind==='binding'||kind==='parchment')?256:384"));
 assert.ok(!newSource.includes('camera.position.set('));
});
test('window layers use separated real 3D planes behind existing frame with safe fallback',()=>{
 assert.equal(windowArt.LAYERS.length,3);
 assert.deepEqual(windowArt.LAYERS.map(x=>x.z),[-.49,-.38,-.27]);
 assert.ok(windowArt.LAYERS.every(x=>x.z<.1));
 const source=read('prototypes/dh-11c-room/window-illustration.js');
 for(const marker of ['new THREE.PlaneGeometry','new THREE.TextureLoader().load',
   'texture.repeat.set(rx,ry)','mesh.userData.decorativeOnly=true',
   'mesh.raycast=()=>{}','sky,...islands','for(const mesh of original)mesh.visible=!active',
   'ready&&requested'])assert.ok(source.includes(marker),marker);
 assert.ok(!source.includes('camera.position.set('));
});
test('cabinet quill labels and desk cup only change in opt-in staging variant',()=>{
 const source=read('prototypes/dh-11c-room/room.js');
 for(const marker of ["document.body.dataset.authoredDetailProof==='true'",
  'function makeQuillTag','italic 110px','authoredDetailProof?.96:.42',
  "const cup=content.getObjectByName('desk_cup')",
  'cup.visible=false','cup.userData.decorativeOnly=true',
  'if(!authoredDetailProof){','scenicWindow.setVisible',
  'DH11WindowIllustration.mount','mesh.userData.featuredBookIndex=index',
  "capture(id,next.get(id));"])assert.ok(source.includes(marker),marker);
 assert.ok(source.includes("g.traverse(o=>{if(o.isMesh&&!o.userData?.decorativeOnly)"));
 assert.ok(source.includes("motif.name='dh11c5d3e_featured_emblem_'+index"));
});
test('V4 staging route is independent and retains real GLB mechanics',()=>{
 const html=preview.render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5D.3E','data-authored-detail-proof="true"',
  'data-illustrated-v5="true"','room.js?v=dh11c5d3e-authored-details-v1',
  'high-illustration-3d-v4.js?v=dh11c5d3e-authored-details-v1',
  'window-illustration.js?v=dh11c5d3e-authored-details-v1',
  'data-illustration-mode="painterly"'])assert.ok(html.includes(marker),marker);
 for(const disallowed of ['The Last Lightkeeper','The Clock of Tomorrow','<iframe'])
  assert.ok(!html.includes(disallowed),disallowed);
 const original=read('scripts/render-dh11c5d3d-sculpted-bookcase.cjs');
 assert.ok(original.includes('high-illustration-3d-v3.js'));
 assert.ok(!original.includes('data-authored-detail-proof'));
 assert.ok(read('prototypes/dh-11c-room/furniture-asset.js').includes("group('window_root'"));
 assert.ok(read('prototypes/dh-11c-room/furniture-asset.js').includes("cyl('desk_cup'"));
});

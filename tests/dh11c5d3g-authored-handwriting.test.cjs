'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const persona=require('../prototypes/dh-11c-room/manuscript-personality-v2.js');
const oldPersona=require('../prototypes/dh-11c-room/manuscript-personality.js');
const art=require('../prototypes/dh-11c-room/high-illustration-3d-v5.js');
const oldArt=require('../prototypes/dh-11c-room/high-illustration-3d-v4.js');
const asset=require('../prototypes/dh-11c-room/furniture-asset.js');
const render=require('../scripts/render-dh11c5d3g-authored-handwriting.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function recording(){
 const calls=[],ctx=new Proxy({},{
  get(_,key){return (...args)=>{calls.push([key,...args]);return undefined;};},
  set(_,key,val){calls.push(['set',key,val]);return true;}
 });return {ctx,calls};
}
test('the eight real authored works occupy exactly the eight physical pull-out book slots',()=>{
 assert.equal(persona.FEATURED_TITLES.length,8);
 assert.equal(persona.FEATURED_SPINE_TITLES.length,8);
 assert.deepEqual(persona.FEATURED_POSITIONS,[0,10,29,39,48,58,67,77]);
 assert.equal(new Set(persona.FEATURED_TITLES).size,8);
 assert.ok(persona.FEATURED_TITLES.includes('The Legend of the Stormrider'));
 assert.ok(persona.FEATURED_TITLES.includes('The Blood Laws'));
 assert.ok(persona.FEATURED_TITLES.includes('Metal... the Musical'));
 for(let i=0;i<80;i++){
  const n=persona.FEATURED_POSITIONS.indexOf(i);
  const full=persona.AUTHORED_BOOK_TITLES[i];
  assert.equal(full,n>=0?persona.FEATURED_TITLES[n]:oldPersona.BOOK_TITLES[i]);
  assert.equal(persona.BOOK_DISPLAY_TITLES[i],n>=0?persona.FEATURED_SPINE_TITLES[n]:oldPersona.BOOK_TITLES[i]);
  const {ctx,calls}=recording();persona.paintSpine(ctx,192,768,i,n>=0);
  const title=persona.BOOK_DISPLAY_TITLES[i];
  assert.ok(calls.some(c=>c[0]==='fillText'&&c[1]===title));
  assert.ok(calls.some(c=>c[0]==='strokeText'&&c[1]===title));
 }
 assert.equal(new Set(persona.AUTHORED_BOOK_TITLES).size,80);
 assert.deepEqual(oldPersona.BOOK_TITLES,persona.BOOK_TITLES,'prior joke art is unchanged');
});
test('fine binding filigree and 3D relief is disabled on all 80 actual title surfaces',()=>{
 const code=read('prototypes/dh-11c-room/high-illustration-3d-v5.js');
 for(const marker of ["const bareSpine=/^book_[0-3]_\\d{2}$/.test(mesh.name||'')",
  "const art=bareSpine?null:paintMap(original.map,kind,artVariant(mesh.name,kind))",
  "const points=cleanInkSurface?[]:reliefPaths(mesh.name,mesh.geometry.boundingBox)",
  "for(const part of (cleanInkSurface?[]:sculpturePlan(mesh.name,mesh.geometry.boundingBox)))"])
  assert.ok(code.includes(marker),marker);
 assert.ok(!read('prototypes/dh-11c-room/high-illustration-3d-v4.js').includes('const bareSpine='));
 assert.equal(art.artVariant('book_2_09','binding'),oldArt.artVariant('book_2_09','binding'));
});
test('the typewriter paper has no hand-scrawl panel; all 14 desk/file leaves do',()=>{
 const original=global.document;
 const objects=asset.nodes.filter(x=>persona.bookIndex(x.name)>=0||persona.inkIndex(x.name)>=0);
 assert.equal(objects.length,95);
 const models=objects.map(o=>({name:o.name,isMesh:true,
  geometry:{boundingBox:{min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}}},
  scale:{x:o.size[0],y:o.size[1],z:o.size[2]},userData:{},children:[],
  add(child){this.children.push(child);}}));
 try{
  global.document={createElement(){return {getContext(){return recording().ctx;}};}};
  class CanvasTexture{constructor(canvas){this.canvas=canvas;}}
  class PlaneGeometry{constructor(w,h){this.width=w;this.height=h;}}
  class MeshBasicMaterial{constructor(arg){Object.assign(this,arg);}}
  class Mesh{constructor(geometry,material){
   this.geometry=geometry;this.material=material;this.userData={};this.rotation={x:0};
   this.position={set(){}};this.children=[];
  }}
  const THREE={CanvasTexture,PlaneGeometry,MeshBasicMaterial,Mesh,DoubleSide:2,SRGBColorSpace:'srgb'};
  const a=persona.create({THREE,root:{traverse(fn){for(const node of models)fn(node);}}});
  assert.equal(a.count,94);
  const typed=models.find(x=>x.name==='typewriter_paper');
  assert.equal(typed.children.length,0,'typewriter sheet keeps its original mechanical typed texture');
  for(const leaf of models.filter(x=>x.name.startsWith('desk_paper_')||x.name==='desk_file_sheet'))
   assert.equal(leaf.children.length,1,'loose desk/file leaf has handwritten art');
  const selected=models.filter(x=>x.userData.manuscriptJokeTitle);
  assert.equal(selected.length,80);
  assert.equal(models.find(x=>x.name==='book_0_00').userData.manuscriptJokeTitle,persona.FEATURED_TITLES[0]);
  a.setVisible(true);
  assert.equal(models.filter(x=>x.children.some(y=>y.visible)).length,94);
  a.setVisible(false);
  assert.equal(models.filter(x=>x.children.some(y=>y.visible)).length,0);
  assert.ok(models.every(x=>x.children.every(y=>y.userData.decorativeOnly&&typeof y.raycast==='function')));
 }finally{global.document=original;}
});
test('new handwritten cabinet labels are restrained images, not overlarge bold printed labels',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const anchor of ["document.body.dataset.handwrittenLabelProof==='true'",
   'function makeArchiveHandwrittenTag(text,w,h)',
   "ctx.font=font;", // may change: see source
   "'Segoe Print','Bradley Hand','Comic Sans MS',cursive",
   'ctx.measureText(ch).width',
   'ctx.rotate(Math.sin(seed+i*2.39)*.026)',
   'ctx.strokeText(ch,0,0)',
   'handwrittenLabelProof?1.04:personalityProof?1.31',
   'handwrittenLabelProof?.21:personalityProof?.28',
   'if(handwrittenLabelProof)return makeArchiveHandwrittenTag(text,w,h)',
   'if(authoredDetailProof&&!handwrittenLabelProof)'])
  assert.ok(room.includes(anchor),anchor);
 assert.ok(room.includes('const names=personalityProof?(window.DH11ManuscriptPersonality?.AUTHORED_BOOK_TITLES||'));
 assert.ok(room.includes('manuscriptPersonality.setVisible'));
 assert.ok(room.includes("capture(id,next.get(id));"),'still captures original GLB roots');
});
test('V6 is isolated from approved older review versions, uses real GLBs and does not publish unfinished work',()=>{
 const page=render.render(read('prototypes/dh-11c-room/index.html'));
 for(const anchor of ['DH-11C.5D.3G','data-handwritten-label-proof="true"',
   'manuscript-personality-v2.js?v=dh11c5d3g-authored-handwriting-v1',
   'high-illustration-3d-v5.js?v=dh11c5d3g-authored-handwriting-v1',
   'room.js?v=dh11c5d3g-authored-handwriting-v1',
   'window-illustration-v2.js?v=dh11c5d3g-authored-handwriting-v1'])
  assert.ok(page.includes(anchor),anchor);
 assert.ok(!page.includes('The Last Lightkeeper'));
 const v5=read('scripts/render-dh11c5d3f-personality.cjs');
 assert.ok(v5.includes('manuscript-personality.js'));
 assert.ok(!v5.includes('data-handwritten-label-proof'));
 const state=JSON.parse(read('PROJECT_STATE.json'));
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.handwrittenLabelCandidate?.publishedWritingChanged,false);
 assert.equal(state.dh11_3d_production.illustratedViewPipeline.handwrittenLabelCandidate?.productionChanged,false);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const v2=require('../prototypes/dh-11c-room/illustrated-style-v2.js');
const render=require('../scripts/render-dh11c5c2a-painted.cjs').render;
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('2A creates actual repainted UV pixels rather than merely altering lighting',()=>{
 const width=64,height=64;
 const source=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const p=(y*width+x)*4;
  source[p]=93+x%23;source[p+1]=62+y%21;source[p+2]=44+(x+y)%17;source[p+3]=255;
 }
 for(const kind of ['wood','paper','binding','enamel','leather','brass','paint']){
  const first=v2.paintPixels(source,width,height,kind),second=v2.paintPixels(source,width,height,kind);
  assert.deepEqual(first,second,'painting must be deterministic');
  assert.equal(first.length,source.length);
  let pixelsChanged=0;
  for(let p=0;p<source.length;p+=4){
   if(first[p]!==source[p]||first[p+1]!==source[p+1]||first[p+2]!==source[p+2])pixelsChanged++;
   assert.equal(first[p+3],255,'must preserve original alpha');
  }
  assert.ok(pixelsChanged>width*height*.65,kind+' needs visibly different surface colours');
 }
 assert.notDeepEqual(v2.paintPixels(source,width,height,'wood'),v2.paintPixels(source,width,height,'paper'));
 assert.equal(v2.surfaceFor('desk_surface'),'wood');
 assert.equal(v2.surfaceFor('desk_paper_04'),'paper');
 assert.equal(v2.surfaceFor('book_0_11'),'binding');
 assert.equal(v2.surfaceFor('front_face_finished'),'enamel');
 assert.equal(v2.surfaceFor('brass_handle_finished'),'brass');
 assert.ok(v2.outlinedName('desk_paper_04'));
 assert.ok(v2.outlinedName('book_0_11'));
 assert.ok(!v2.outlinedName('desk_lamp_bulb'));
 assert.throws(()=>v2.paintPixels(source,64,63,'wood'),/Invalid source texture/);
});
test('2A repainting keeps live UV coordinates and exact original mesh/materials on reversal',()=>{
 class Color{constructor(x){this.x=x;}clone(){return new Color(this.x);}set(x){this.x=x;return this;}copy(x){this.x=x.x;return this;}}
 class DataTexture{
  constructor(data,w,h){this.image={data,width:w,height:h};this.repeat={copy(x){this.value=x;}};
   this.offset={copy(x){this.value=x;}};this.center={copy(x){this.value=x;}};}
 }
 class MeshToonMaterial{constructor(x){Object.assign(this,x);this.isMeshToonMaterial=true;}}
 class EdgesGeometry{constructor(g){this.geometry=g;}}
 class LineBasicMaterial{constructor(x){Object.assign(this,x);}}
 class LineSegments{
  constructor(){this.userData={};this.scale={setScalar(x){this.value=x;}};}
 }
 const THREE={Color,DataTexture,MeshToonMaterial,EdgesGeometry,LineBasicMaterial,LineSegments,
  RGBAFormat:1,NearestFilter:2,ClampToEdgeWrapping:3,LinearFilter:4,LinearMipmapLinearFilter:5,SRGBColorSpace:6};
 const pixels=new Uint8Array(64*64*4);
 for(let i=0;i<pixels.length;i+=4){pixels[i]=116+(i%29);pixels[i+1]=82;pixels[i+2]=55;pixels[i+3]=255;}
 const source=new DataTexture(pixels,64,64);
 source.colorSpace=THREE.SRGBColorSpace;source.flipY=false;source.wrapS=11;source.wrapT=13;source.rotation=.1;
 const originalMat={isMeshStandardMaterial:true,name:'deskWalnut',color:new Color('#ffffff'),map:source,
  emissive:new Color('#000'),opacity:1,side:0,depthWrite:true};
 const hero={isMesh:true,name:'desk_surface',material:originalMat,geometry:{},userData:{},children:[],
  add(x){this.children.push(x);},traverse(fn){fn(this);}};
 const feature={isMesh:true,name:'book_2_11',material:originalMat,userData:{featuredBookIndex:2},traverse(fn){fn(this);}};
 const bulb={isMesh:true,name:'desk_lamp_bulb',material:originalMat,userData:{},traverse(fn){fn(this);}};
 const scene={background:new Color('original'),fog:{color:new Color('original'),near:9,far:24},
  traverse(fn){[hero,feature,bulb].forEach(fn);}};
 const light=(hex,intensity)=>({color:new Color(hex),intensity,userData:{}});
 const lights={ambient:{...light('ambient',2),groundColor:new Color('ground')},
  sun:light('sun',2.6),window:light('window',16),lamp:light('lamp',26)};
 lights.lamp.userData.litIntensity=26;
 const renderer={toneMappingExposure:1.1};
 const r=v2.createRuntime({THREE,scene,renderer,lights});
 assert.equal(r.register(scene),1);
 r.set('painterly');
 assert.notEqual(hero.material,originalMat);
 assert.notEqual(hero.material.map,source,'must contain a truly repainted material map');
 assert.equal(hero.material.map.flipY,source.flipY);
 assert.equal(hero.material.map.wrapS,source.wrapS);
 assert.equal(hero.material.map.wrapT,source.wrapT);
 assert.equal(hero.material.map.rotation,source.rotation);
 assert.equal(hero.material.map.repeat.value,source.repeat);
 assert.equal(hero.material.map.offset.value,source.offset);
 assert.equal(hero.material.map.center.value,source.center);
 assert.notDeepEqual(hero.material.map.image.data,pixels);
 assert.equal(feature.material,originalMat);
 assert.equal(bulb.material,originalMat);
 assert.equal(hero.children.length,1);
 assert.equal(hero.children[0].visible,true);
 const late={...hero,name:'bookcase_body',material:originalMat,children:[],add(x){this.children.push(x);}};
 r.register(late);
 assert.notEqual(late.material,originalMat,'late GLB must receive repainted UV texture');
 r.set('reference');
 assert.equal(hero.material,originalMat);
 assert.equal(late.material,originalMat);
 assert.equal(hero.children[0].visible,false);
 assert.equal(lights.lamp.userData.litIntensity,26,'approved lamp strength restored');
 assert.equal(renderer.toneMappingExposure,1.1);
 assert.equal(r.mode,'reference');
});
test('2A is a separate staging route; V1 renderer and original C5B route remain unchanged',()=>{
 const html=render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['data-illustrated-proof="true" data-illustrated-v2="true"',
  'illustrated-style-v2.js?v=dh11c5c-painted-surfaces-v2',
  'room.js?v=dh11c5c-painted-surfaces-v2',
  'room-plan.js?v=dh11c5c-painted-surfaces-v2',
  'davehub-illustrated-stage" content="DH-11C.5C.2A"',
  'data-illustration-mode="reference"','data-illustration-mode="painterly"',
  'Earlier lighting-led Variant A','Original C5B textured reference',
  'PAINTED SURFACES V2'])assert.ok(html.includes(marker),'Missing painted variant: '+marker);
 const original=require('../scripts/render-dh11c5c-illustrated.cjs').render(read('prototypes/dh-11c-room/index.html'));
 assert.ok(original.includes('illustrated-style.js?v=dh11c5c-painterly-v1'));
 assert.ok(!original.includes('data-illustrated-v2="true"'));
 const room=read('prototypes/dh-11c-room/room.js');
 assert.ok(room.includes("document.body.dataset.illustratedV2==='true'?window.DH11IllustratedStyleV2:window.DH11IllustratedStyle"));
 assert.ok(room.includes('illustratedRuntime.register(content)'));
 assert.ok(room.includes("lampButton.addEventListener('click',toggleLamp)"));
 assert.ok(room.includes('toggleBinPaper(binPaperIndex)'));
 assert.ok(room.includes('toggleBook(bookIndex)'));
 assert.ok(room.includes('togglePaper(paperIndex)'));
 assert.ok(room.includes('drawerIndexForMesh(mesh,cabinetDrawers)'));
 const source=read('prototypes/dh-11c-room/illustrated-style-v2.js');
 assert.ok(source.includes("ctx.drawImage(image,0,0,width,height)"),'GLB material PNG must be source of repainted texture');
 assert.ok(!source.includes('new THREE.Mesh('),'no replacement fake 3D objects');
});

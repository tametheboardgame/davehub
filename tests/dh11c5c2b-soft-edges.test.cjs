'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const art=require('../prototypes/dh-11c-room/illustrated-style-v3.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const render=require('../scripts/render-dh11c5c2b-handdrawn.cjs').render;
test('V3 linework produces deterministic broken and visibly imperfect strokes',()=>{
 const vertices=new Float32Array([0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,2]);
 const a=art.sketchEdgeSegments(vertices,77),b=art.sketchEdgeSegments(vertices,77);
 assert.deepEqual(a.positions,b.positions);
 assert.deepEqual(a.colours,b.colours);
 assert.equal(a.positions.length%6,0);
 assert.equal(a.colours.length,a.positions.length);
 assert.ok(a.positions.length>vertices.length*4,'each clean line must be split into drawn fragments');
 const cleanCount=3*22;
 assert.ok(a.positions.length/6<cleanCount,'some fragments must have deliberately broken gaps');
 const deviations=[];
 for(let i=0;i<a.positions.length;i+=6){
  const [x,y,z]=a.positions.slice(i,i+3);
  if(Math.abs(x)<.0001)deviations.push(Math.abs(y)); // horizontal line should not be perfectly straight
  if(Math.abs(z)<.001&&x>0&&x<2)deviations.push(Math.abs(y));
 }
 assert.ok(deviations.some(v=>v>.001),'strokes need visible irregularity rather than uniform segments');
 const shades=new Set();
 for(let i=0;i<a.colours.length;i+=3)shades.add(a.colours[i].toFixed(3));
 assert.ok(shades.size>6,'ink strength must differ along a stroke');
 assert.throws(()=>art.sketchEdgeSegments([0,1,2,3]),/paired XYZ/);
});
test('V3 nicks UV edges on papers and bindings but leaves wood alpha intact',()=>{
 const width=64,height=64,source=new Uint8Array(width*height*4);
 for(let i=0;i<source.length;i+=4){source[i]=141;source[i+1]=107;source[i+2]=74;source[i+3]=255;}
 for(const kind of ['paper','binding']){
  const result=art.paintPixels(source,width,height,kind);
  assert.deepEqual(result,art.paintPixels(source,width,height,kind));
  assert.equal(result[(32*width+32)*4+3],255,'inner UV area stays opaque');
  const clipped=Array.from({length:width},(_,y)=>result[(y*width)*4+3]).filter(v=>v===0).length;
  assert.ok(clipped>width*.8,'edge should be visibly irregular');
  assert.ok(result.some((v,i)=>i%4===3&&v===0),'edges should be cut');
 }
 const wood=art.paintPixels(source,width,height,'wood');
 for(let i=3;i<wood.length;i+=4)assert.equal(wood[i],255);
 assert.equal(art.surfaceFor('desk_paper_02'),'paper');
 assert.equal(art.surfaceFor('book_1_03'),'binding');
 assert.ok(art.outlinedName('desk_paper_02'));
 assert.ok(art.outlinedName('book_1_03'));
 assert.equal(art.protectedMesh({isMesh:true,name:'desk_lamp_bulb',userData:{}}),true);
 assert.equal(art.protectedMesh({isMesh:true,name:'book_1_03',userData:{featuredBookIndex:2}}),true);
});
test('V3 registers only non-picking line segments, reverses the original materials and lights',()=>{
 class Colour{constructor(v){this.v=v;}clone(){return new Colour(this.v);}copy(v){this.v=v.v;return this;}set(v){this.v=v;return this;}}
 class DataTexture{
  constructor(data,w,h){this.image={data,width:w,height:h};
   this.repeat={copy(x){this.value=x;}};this.offset={copy(x){this.value=x;}};this.center={copy(x){this.value=x;}};}
 }
 class MeshToonMaterial{constructor(x){Object.assign(this,x);this.isMeshToonMaterial=true;}}
 class EdgesGeometry{constructor(){this.vertices=new Float32Array([0,0,0,1,0,0,1,0,0,1,1,0]);}
  getAttribute(k){assert.equal(k,'position');return {array:this.vertices};}dispose(){this.disposed=true;}}
 class BufferGeometry{constructor(){this.attributes={};}setAttribute(k,v){this.attributes[k]=v;}}
 class Float32BufferAttribute{constructor(a,n){this.array=a;this.itemSize=n;}}
 class LineBasicMaterial{constructor(x){Object.assign(this,x);}}
 class LineSegments{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.scale={setScalar(v){this.value=v;}};}}
 const THREE={Colour,Color:Colour,DataTexture,MeshToonMaterial,EdgesGeometry,BufferGeometry,Float32BufferAttribute,LineBasicMaterial,LineSegments,
  RGBAFormat:1,NearestFilter:2,ClampToEdgeWrapping:3,LinearFilter:4,LinearMipmapLinearFilter:5,SRGBColorSpace:6};
 const pixels=new Uint8Array(64*64*4);for(let i=0;i<pixels.length;i+=4){pixels[i]=105;pixels[i+1]=79;pixels[i+2]=50;pixels[i+3]=255;}
 const map=new DataTexture(pixels,64,64);map.center={copy(){}};
 const original={isMeshStandardMaterial:true,color:new Colour('white'),map,emissive:new Colour('black'),opacity:1,side:0,depthWrite:true};
 const make=(name,featured=false)=>({name,isMesh:true,material:original,geometry:{},userData:featured?{featuredBookIndex:5}:{},children:[],
  add(c){this.children.push(c);},traverse(fn){fn(this);}});
 const book=make('book_0_01'),desk=make('desk_surface'),teal=make('book_0_02',true),bulb=make('desk_lamp_bulb');
 const scene={background:new Colour('old'),fog:{color:new Colour('old'),near:16,far:32},
  traverse(fn){[book,desk,teal,bulb].forEach(fn);}};
 const light=(color,intensity)=>({color:new Colour(color),intensity,userData:{}});
 const lights={ambient:{...light('ambient',2),groundColor:new Colour('ground')},
  sun:light('sun',3),window:light('window',12),lamp:light('lamp',26)};
 lights.lamp.userData.litIntensity=26;
 const renderer={toneMappingExposure:1.1};
 const rt=art.createRuntime({THREE,scene,renderer,lights});
 assert.equal(rt.register(scene),2);assert.equal(rt.register(scene),2);
 rt.set('painterly');
 assert.notEqual(book.material,original);assert.notEqual(book.material.map,map);
 assert.equal(book.material.alphaTest,.45);
 assert.equal(teal.material,original);assert.equal(bulb.material,original);
 assert.equal(book.children.length,1);
 const line=book.children[0];
 assert.ok(line.geometry.attributes.position.array.length>12);
 assert.ok(line.geometry.attributes.color.array.length>12);
 assert.equal(line.userData.decorativeOnly,true);
 assert.equal(line.isMesh,undefined);
 const late=make('front_face_drafts');rt.register(late);
 assert.notEqual(late.material,original);
 rt.set('reference');
 assert.equal(book.material,original);assert.equal(desk.material,original);
 assert.equal(late.material,original);assert.equal(line.visible,false);
 assert.equal(lights.lamp.userData.litIntensity,26);
 assert.equal(renderer.toneMappingExposure,1.1);
});
test('V3 is an independently versioned preview, with V1 V2 and C5B preserved',()=>{
 const html=render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5C.2B','data-illustrated-v3="true"',
  'illustrated-style-v3.js?v=dh11c5c-soft-edges-v3',
  'room.js?v=dh11c5c-soft-edges-v3','room-plan.js?v=dh11c5c-soft-edges-v3',
  'data-illustration-mode="reference"','data-illustration-mode="painterly"',
  'Earlier painted-surfaces V2','Earlier lighting-led Variant A',
  'Original C5B textured reference'])assert.ok(html.includes(marker),'V3 missing '+marker);
 const v2=require('../scripts/render-dh11c5c2a-painted.cjs').render(read('prototypes/dh-11c-room/index.html'));
 assert.ok(v2.includes('illustrated-style-v2.js?v=dh11c5c-painted-surfaces-v2'));
 assert.ok(!v2.includes('data-illustrated-v3="true"'));
 const room=read('prototypes/dh-11c-room/room.js');
 for(const text of ["document.body.dataset.illustratedV3==='true'?window.DH11IllustratedStyleV3",
  "lampButton.addEventListener('click',toggleLamp)",
  'toggleBook(bookIndex)','togglePaper(paperIndex)','toggleBinPaper(binPaperIndex)',
  'drawerIndexForMesh(mesh,cabinetDrawers)'])assert.ok(room.includes(text));
 const src=read('prototypes/dh-11c-room/illustrated-style-v3.js');
 assert.ok(!src.includes('new THREE.Mesh('),'do not create selectable geometry');
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const prop=require('../prototypes/dh-11c-room/room-props-v7.js');
const furniture=require('../prototypes/dh-11c-room/furniture-asset.js');
const paperMotion=require('../prototypes/dh-11c-room/room-plan.js');
const renderer=require('../scripts/render-dh11c5d3h-mystical-room.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

function recorder(){
 const calls=[];
 const ctx=new Proxy({},{
  get(_,name){
   if(name==='createLinearGradient')return (...args)=>{
    calls.push(['gradient',...args]);
    return {addColorStop:(...p)=>calls.push(['colourStop',...p])};
   };
   return (...args)=>{calls.push([name,...args]);};
  },
  set(_,name,value){calls.push(['set',name,value]);return true;}
 });
 return {ctx,calls};
}
test('V7 art is a real rug-sized floor surface with celestial embroidery, not looping noodles',()=>{
 const p=prop.createRugPlan();
 assert.deepEqual(p.position,[.05,.061,1.12]);
 assert.deepEqual(p.size,[5.17,3.53]);
 assert.ok(p.position[1]>p.top&&p.position[1]<.075,'above rug top and below edge trim');
 assert.equal(p.design,'celestial manuscript astrolabe');
 const {ctx,calls}=recorder();
 assert.equal(prop.inkRug(ctx,1024,704),true);
 assert.ok(calls.filter(c=>c[0]==='strokeRect').length>=4,'handmade stitched border');
 assert.ok(calls.filter(c=>c[0]==='lineTo').length>40,'star maps and embroidery');
 assert.ok(calls.filter(c=>c[0]==='arc').length===1,'no repeated carpet circle noodles');
 assert.ok(calls.filter(c=>c[0]==='colourStop').length>=3);
 assert.throws(()=>prop.inkRug(ctx,240,190));
 const source=read('prototypes/dh-11c-room/room-props-v7.js');
 assert.ok(source.includes("mesh.rotation.x=-Math.PI/2"));
 assert.ok(source.includes("mesh.userData.decorativeOnly=true;mesh.raycast=()=>{}"));
});
test('rug overlay lies exactly on room floor and follows reversible illustrated mode',()=>{
 const original=global.document;
 try{
  const {ctx}=recorder();
  global.document={createElement(){return {getContext(){return ctx;}};}};
  class Group{constructor(){this.children=[];}add(x){this.children.push(x);}}
  class Texture{constructor(canvas){this.canvas=canvas;}}
  class Plane{constructor(...size){this.size=size;}}
  class Material{constructor(options){Object.assign(this,options);}}
  class Mesh{constructor(g,m){
   this.geometry=g;this.material=m;this.rotation={x:0};this.position={set:(...v)=>{this.pos=v;}};this.userData={};
  }}
  const scene=new Group(),THREE={CanvasTexture:Texture,PlaneGeometry:Plane,MeshStandardMaterial:Material,Mesh,DoubleSide:2,SRGBColorSpace:'srgb'};
  const art=prop.makeRug({THREE,scene});
  assert.equal(scene.children.length,1);
  assert.equal(art.mesh.visible,false);
  assert.deepEqual(art.mesh.pos,[.05,.061,1.12]);
  art.setVisible(true);assert.equal(art.mesh.visible,true);
  art.setVisible(false);assert.equal(art.mesh.visible,false);
 }finally{global.document=original;}
});
test('lamp base bottom was below the desktop and is lifted by 70mm in V7 only',()=>{
 assert.ok(Math.abs(prop.DESK_TOP-1.39)<1e-9);
 assert.equal(prop.LAMP_LIFT,.07);
 const before=1.4-.12/2,after=before+prop.LAMP_LIFT;
 assert.ok(before<prop.DESK_TOP);
 assert.ok(after>prop.DESK_TOP);
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of ["document.body.dataset.mysticalRoomProof==='true'",
   'const lampLift=mysticalRoomProof?.07:0;',
   "shade.position.set(-1.67,2.38,-.43);if(lampLift)shade.position.y+=lampLift",
   "mats.timber,-1.67,1.4,-.43",
   "lamp.position.set(-1.97,2.31,.17);if(mysticalRoomProof)lamp.position.y+=.07",
   'window.DH11RoomProps.decorateFurniture({THREE,root:content})'])
  assert.ok(room.includes(marker),marker);
});
test('basket includes 12 actual interior paper balls below the original 9 moveable ones',()=>{
 assert.equal(prop.INNER_BALLS.length,12);
 assert.equal(new Set(prop.INNER_BALLS.map(x=>x.name)).size,12);
 for(const b of prop.INNER_BALLS){
  const [x,y,z]=b.position;
  assert.ok(Math.hypot(x,z)+b.size<.39);
  assert.ok(y-b.size>.06);
  assert.ok(y+b.size<.86,'paper remains beneath bin rim');
 }
 assert.equal(prop.BIN.moveablePapers,9);
 const names=furniture.nodes.filter(n=>/^bin_paper_[0-8]$/.test(n.name));
 assert.equal(names.length,9,'canonical nine real animated crumples unchanged');
 assert.equal(paperMotion.BIN_PAPER_COUNT,9);
});
test('GLB prop decorator uses the actual desk lamp pivots and reversibly replaces capped bin',()=>{
 const objects=new Map();
 const root={getObjectByName(name){return objects.get(name);}};
 function makeNode(name,y=0){return {name,position:{x:0,y,z:0,set(...coords){this.x=coords[0];this.y=coords[1];this.z=coords[2];}},
  userData:{},visible:true,children:[],add(v){this.children.push(v);}};}
 const desk=makeNode('desk_root'),bin=makeNode('bin_root');
 objects.set('desk_root',desk);objects.set('bin_root',bin);
 objects.set('desk_surface',makeNode('desk_surface',1.29));
 for(const [name,y] of [['shade',2.38],['cap',2.522],['stem',1.86],['bulb',2.345],['base',1.4]]){
  objects.set('desk_lamp_'+name,makeNode('desk_lamp_'+name,y));
 }
 const body=makeNode('bin_body'),rim=makeNode('bin_rim');
 objects.set('bin_body',body);objects.set('bin_rim',rim);
 class Material{constructor(props){Object.assign(this,props);}}
 class Geometry{constructor(...p){this.params=p;}}
 class Mesh{constructor(geometry,material){
  this.geometry=geometry;this.material=material;this.name='';this.userData={};this.visible=true;
  this.position={set(...p){this.coords=p;}};
  this.rotation={x:0,set(...p){this.coords=p;}};
  this.children=[];
 }add(ch){this.children.push(ch);}}
 class Group{constructor(){this.name='';this.userData={};this.children=[];this.visible=true;}
  add(ch){this.children.push(ch);}}
 class Attr{constructor(p,n){this.coords=p;this.itemSize=n;}}
 class Buf{setAttribute(name,attr){this[name]=attr;}}
 class Lines{constructor(){this.userData={};}}
 const THREE={CylinderGeometry:Geometry,TorusGeometry:Geometry,IcosahedronGeometry:Geometry,
  MeshStandardMaterial:Material,LineBasicMaterial:Material,LineSegments:Lines,Mesh,Group,
  BufferGeometry:Buf,Float32BufferAttribute:Attr,DoubleSide:2,BackSide:1};
 const decorated=prop.decorateFurniture({THREE,root});
 assert.equal(decorated.innerBalls,12);
 assert.equal(decorated.interactiveBallsUntouched,9);
 assert.ok(decorated.lampBaseBottom>decorated.plinthBottom);
 for(const [name,y] of [['shade',2.38],['cap',2.522],['stem',1.86],['bulb',2.345],['base',1.4]])
  assert.ok(Math.abs(objects.get('desk_lamp_'+name).position.y-y-.07)<1e-9);
 assert.equal(desk.children.length,1,'new anchored lamp foot on original desk root');
 assert.equal(bin.children.length,1,'one open-ended basket with inner balls');
 const propGroup=bin.children[0];
 const inner=propGroup.children.filter(x=>x.name.startsWith('dh11c5d3h_inner_paper_'));
 assert.equal(inner.length,12);
 assert.ok(propGroup.children.every(x=>x.userData.decorativeOnly&&typeof x.raycast==='function'));
 assert.ok(!body.visible&&!rim.visible);
 decorated.setVisible(false);
 assert.equal(propGroup.visible,false);assert.ok(body.visible&&rim.visible);
 decorated.setVisible(true);
 assert.equal(propGroup.visible,true);assert.ok(!body.visible&&!rim.visible);
});
test('V7 is an isolated preview, with legacy V6 retained and no production/public catalogue change',()=>{
 const html=renderer.render(read('prototypes/dh-11c-room/index.html'));
 for(const term of ['DH-11C.5D.3H','data-mystical-room-proof="true"',
  'room-props-v7.js?v=dh11c5d3h-mystical-room-props-v1',
  'room.js?v=dh11c5d3h-mystical-room-props-v1',
  'manuscript-personality-v2.js?v=dh11c5d3h-mystical-room-props-v1',
  'high-illustration-3d-v5.js?v=dh11c5d3h-mystical-room-props-v1'])
  assert.ok(html.includes(term),term);
 const prev=read('scripts/render-dh11c5d3g-authored-handwriting.cjs');
 assert.ok(!prev.includes('mysticalRoomProof')&&!prev.includes('room-props-v7'));
 const pipe=JSON.parse(read('PROJECT_STATE.json')).dh11_3d_production.illustratedViewPipeline;
 assert.equal(pipe.mysticalRoomCandidate.productionChanged,false);
 assert.equal(pipe.mysticalRoomCandidate.publishedWritingChanged,false);
});

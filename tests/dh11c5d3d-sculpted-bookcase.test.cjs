'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const art=require('../prototypes/dh-11c-room/high-illustration-3d-v3.js');
const older=require('../prototypes/dh-11c-room/high-illustration-3d-v2.js');
const render=require('../scripts/render-dh11c5d3d-sculpted-bookcase.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const b=(x,y,z)=>({min:{x:-x/2,y:-y/2,z:-z/2},max:{x:x/2,y:y/2,z:z/2}});
test('5D.3D physical bookcase moulding derives from actual GLB local dimensions',()=>{
 for(const [name,bounds,count] of [
  ['bookcase_crown',b(3.3,.16,.97),7],
  ['bookcase_side_0',b(.13,4.55,.81),4],
  ['bookcase_side_1',b(.13,4.55,.81),4],
  ['bookcase_shelf_2',b(3.04,.095,.84),3],
  ['book_2_09',b(.111,.55,.43),3]
 ]){
  const parts=art.sculpturePlan(name,bounds);
  assert.equal(parts.length,count,name);
  for(const part of parts){
   assert.ok(part.id&&['box','boss'].includes(part.shape)&&['gilt','shadow'].includes(part.finish));
   assert.ok(part.position.every(Number.isFinite));
   assert.ok(part.position[0]>=bounds.min.x-.1&&part.position[0]<=bounds.max.x+.1);
   assert.ok(part.position[1]>=bounds.min.y-.1&&part.position[1]<=bounds.max.y+.1);
   assert.ok(part.position[2]>bounds.max.z&&part.position[2]<bounds.max.z+.2);
   if(part.shape==='box')assert.ok(part.size.every(x=>x>0));
   else assert.ok(part.radius>0&&part.depth>0);
  }
  assert.deepEqual(parts,art.sculpturePlan(name,bounds),'no frame-to-frame random geometry');
 }
 assert.deepEqual(art.sculpturePlan('book_2_08',b(.111,.6,.43)),[]);
 assert.deepEqual(art.sculpturePlan('desk_surface',b(4.5,.2,2.15)),[]);
 assert.deepEqual(art.sculpturePlan('bookcase_crown',b(0,1,1)),[]);
 assert.equal(art.protectedMesh({isMesh:true,userData:{decorativeOnly:true},name:'test',material:{isMeshStandardMaterial:true}}),true);
});
test('5D.3D painterly and reference modes switch attached physical details, not pivots',()=>{
 class C{constructor(v){this.v=v;}clone(){return new C(this.v);}copy(o){this.v=o.v;return this;}set(v){this.v=v;return this;}getHexString(){return '756354';}}
 class Mat{constructor(){this.isMeshStandardMaterial=true;this.color=new C('wood');this.map=null;this.roughness=.7;this.metalness=.1;}clone(){const m=new Mat();m.color=this.color.clone();return m;}}
 class BoxGeometry{constructor(...size){this.size=size;}}
 class CylinderGeometry{constructor(...size){this.size=size;}}
 class Float32BufferAttribute{constructor(arr,n){this.array=arr;this.itemSize=n;}}
 class BufferGeometry{setAttribute(){return this;}}
 class LineBasicMaterial{constructor(props){Object.assign(this,props);}}
 class MeshStandardMaterial{constructor(props){Object.assign(this,props);this.isMeshStandardMaterial=true;}}
 class Mesh{constructor(geometry,material){this.geometry=geometry;this.material=material;this.isMesh=true;this.userData={};this.children=[];this.position={set:(...p)=>{this.lastPosition=p;}};this.rotation={x:0};}
  add(c){this.children.push(c);}
 }
 class LineSegments{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.isMesh=false;}}
 const THREE={BoxGeometry,CylinderGeometry,Float32BufferAttribute,BufferGeometry,LineBasicMaterial,MeshStandardMaterial,Mesh,LineSegments};
 const original=new Mat(),crown=new Mesh({boundingBox:b(3.3,.16,.97)},original);
 crown.name='bookcase_crown';
 const root={traverse(fn){const visit=node=>{fn(node);for(const ch of node.children)visit(ch);};visit(crown);}};
 const light=(v,n)=>({color:new C(v),intensity:n});
 const scene={background:new C('old'),fog:{color:new C('fog'),near:17,far:32}};
 const lights={ambient:{...light('ambient',2),groundColor:new C('ground')},sun:light('sun',3),window:light('window',12),lamp:{...light('lamp',25),userData:{litIntensity:25}}};
 const renderer={toneMappingExposure:1};
 const runtime=art.createRuntime({THREE,scene,renderer,lights});
 runtime.register(root);
 const ornaments=crown.children.filter(x=>x.isMesh&&x.userData.decorativeOnly);
 assert.equal(ornaments.length,7);
 assert.ok(ornaments.every(x=>x.visible===false&&typeof x.raycast==='function'));
 assert.ok(ornaments.every(x=>{let hits=[];x.raycast({},hits);return hits.length===0;}));
 runtime.set('painterly');
 assert.ok(ornaments.every(x=>x.visible));
 runtime.register(root);
 assert.equal(crown.children.filter(x=>x.isMesh).length,7,'no repeated sculpture on re-registration');
 runtime.set('reference');
 assert.ok(ornaments.every(x=>x.visible===false));
 assert.equal(crown.material,original);
 assert.equal(renderer.toneMappingExposure,1);
});
test('5D.3D preview remains an isolated live 3D scene and keeps selectable meshes safe',()=>{
 const page=render.render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5D.3D','high-illustration-3d-v3.js?v=dh11c5d3d-sculpted-bookcase-v1',
   'room.js?v=dh11c5d3d-sculpted-bookcase-v1','data-illustrated-v5="true"',
   'data-illustration-mode="painterly"'])assert.ok(page.includes(marker),marker);
 const room=read('prototypes/dh-11c-room/room.js');
 assert.ok(room.includes('if(o.isMesh&&!o.userData?.decorativeOnly)'));
 for(const old of ['toggleBook(bookIndex)','togglePaper(paperIndex)','toggleBinPaper(binPaperIndex)','drawerIndexForMesh(mesh,cabinetDrawers)',
  "lampButton.addEventListener('click',toggleLamp)"])assert.ok(room.includes(old),old);
 assert.ok(read('scripts/render-dh11c5d3c-spine-art.cjs').includes('high-illustration-3d-v2.js'));
 assert.ok(!read('scripts/render-dh11c5d3c-spine-art.cjs').includes('high-illustration-3d-v3.js'));
 assert.deepEqual(older.reliefPaths('book_2_09',b(.111,.5,.43)),art.reliefPaths('book_2_09',b(.111,.5,.43)));
 for(const forbidden of ['canvas.toDataURL(','camera.position.set(','The Last Lightkeeper'])assert.ok(!read('prototypes/dh-11c-room/high-illustration-3d-v3.js').includes(forbidden));
});

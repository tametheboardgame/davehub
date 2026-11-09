'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const art=require('../prototypes/dh-11c-room/high-illustration-3d-v2.js');
const original=require('../prototypes/dh-11c-room/high-illustration-3d.js');
const render=require('../scripts/render-dh11c5d3c-spine-art.cjs');
const source=()=>fs.readFileSync(path.join(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8');
test('5D.3C uses four repeatable, non-content spine variants for real book objects',()=>{
 const values=new Set();
 for(let shelf=0;shelf<4;shelf++)for(let i=0;i<20;i++){
  const name='book_'+shelf+'_'+String(i).padStart(2,'0');
  const v=art.spineVariant(name);
  assert.ok(Number.isInteger(v)&&v>=0&&v<4,name);
  assert.equal(v,art.spineVariant(name));
  values.add(v);
 }
 assert.deepEqual([...values].sort(),[0,1,2,3]);
 assert.equal(art.spineVariant('desk_paper_00'),0);
 assert.equal(art.kindFor('book_1_09',{}),'binding');
 assert.equal(art.protectedMesh({isMesh:true,name:'book_0_00',userData:{featuredBookIndex:0},material:{isMeshStandardMaterial:true}}),true);
});
test('5D.3C physically authored binding marks vary without adding manufactured titles',()=>{
 const ctx=()=>{let curves=0;return {get curves(){return curves;},
  save(){},restore(){},fillRect(){},strokeRect(){},setLineDash(){},beginPath(){},
  moveTo(){},bezierCurveTo(){curves++;},quadraticCurveTo(){},ellipse(){},stroke(){},fill(){}};};
 const a=ctx(),b=ctx();
 art.paintCanvas(a,384,'binding',true,0);
 art.paintCanvas(b,384,'binding',true,3);
 assert.ok(b.curves>a.curves,'different artwork variants must produce different curves');
 const bounds={min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}};
 assert.deepEqual(art.reliefPaths('book_2_06',bounds),original.reliefPaths('book_2_06',bounds),'same physical mesh geometry');
});
test('5D.3C is a separate 3D preview with unchanged mechanics and prior V5 intact',()=>{
 const html=render.render(source());
 for(const mark of ['DH-11C.5D.3C','high-illustration-3d-v2.js?v=dh11c5d3c-unique-spines-v1',
  'room.js?v=dh11c5d3c-unique-spines-v1','data-illustrated-v5="true"',
  'data-illustration-mode="painterly"','data-illustration-mode="reference"'])assert.ok(html.includes(mark),mark);
 const engine=fs.readFileSync(path.join(__dirname,'../prototypes/dh-11c-room/high-illustration-3d-v2.js'),'utf8');
 for(const forbidden of ['new THREE.Mesh(','camera.position.set(','canvas.toDataURL(','The Last Lightkeeper'])assert.ok(!engine.includes(forbidden));
 for(const required of ['kind===\'binding\'?spineVariant(mesh.name):0','mapCache=new WeakMap()','fallbackCache=new Map()',
  'original.clone()','registered=new WeakSet()','decorativeOnly=true'])assert.ok(engine.includes(required),required);
 const old=fs.readFileSync(path.join(__dirname,'../scripts/render-dh11c5d3b-authored3d.cjs'),'utf8');
 assert.ok(old.includes('high-illustration-3d.js?v='));
 assert.ok(!old.includes('high-illustration-3d-v2.js?v='));
});

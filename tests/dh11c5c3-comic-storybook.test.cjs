'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const style=require('../prototypes/dh-11c-room/comic-storybook-style.js');
const dressing=require('../prototypes/dh-11c-room/comic-storybook-dressing.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('DH-11C.5C.3 pigments are substantive hand-painted changes, deterministic and source-safe',()=>{
 const width=192,height=192,original=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;original[i]=104+x%24;original[i+1]=67+y%19;original[i+2]=43+(x+y)%14;original[i+3]=255;
 }
 for(const kind of ['wood','paper','binding','enamel','leather','brass','paint']){
  const first=style.paintPixels(original,width,height,kind),second=style.paintPixels(original,width,height,kind);
  assert.deepEqual(first,second,'paint cannot change across renders: '+kind);
  let changed=0;for(let i=0;i<first.length;i+=4){
   if(first[i]!==original[i]||first[i+1]!==original[i+1]||first[i+2]!==original[i+2])changed++;
  }
  assert.ok(changed>width*height*.7,kind+' must visibly repaint the original UV rather than only changing light');
  assert.equal(first[(95*width+95)*4+3],255,'interactive model interior remains opaque');
 }
 const originalPaper=require('../prototypes/dh-11c-room/illustrated-style-v3.js').paintPixels(original,width,height,'paper');
 assert.notDeepEqual(style.paintPixels(original,width,height,'paper'),originalPaper);
 assert.ok(style.outlinedName('book_1_03'));
 assert.ok(style.outlinedName('desk_paper_04'));
 assert.equal(style.protectedMesh({isMesh:true,name:'desk_lamp_bulb',userData:{}}),true);
 assert.equal(style.protectedMesh({isMesh:true,name:'book_0_00',userData:{featuredBookIndex:2}}),true);
 assert.ok(style.sketchEdgeSegments(new Float32Array([0,0,0,2,0,0])).positions.length>6);
});
test('decorative scene is real 3D geometry, never registered as a raycast target',()=>{
 class Vector3{constructor(...xyz){this.xyz=xyz;}}
 class Shape{
  moveTo(){} lineTo(){}closePath(){}
 }
 class Geometry{constructor(...args){this.args=args;}}
 class Material{constructor(opts){this.opts=opts;}}
 class Object3D{
  constructor(){this.children=[];this.userData={};this.position={set(...xyz){this.xyz=xyz;}};
   this.rotation={};this.scale={set(...xyz){this.xyz=xyz;}};}
  add(o){this.children.push(o);o.parent=this;}
  traverse(fn){fn(this);this.children.forEach(x=>x.traverse(fn));}
 }
 class Group extends Object3D{}
 class Mesh extends Object3D{constructor(geometry,material){super();this.geometry=geometry;this.material=material;this.isMesh=true;}}
 class Light extends Object3D{constructor(color,intensity){super();this.color=color;this.intensity=intensity;}}
 class Curve{constructor(points){this.points=points;}}
 const THREE={Group,Mesh,MeshToonMaterial:Material,BoxGeometry:Geometry,ShapeGeometry:Geometry,
  Shape,SphereGeometry:Geometry,TubeGeometry:Geometry,CatmullRomCurve3:Curve,
  PointLight:Light,Vector3,DoubleSide:2};
 const scene=new Group(),selected=new Set();
 const before=selected.size;
 const result=dressing.create(THREE,scene);
 assert.equal(scene.children.length,1);
 assert.equal(result.root.name,'dh11c5c3_comic_storybook_dressing');
 assert.equal(result.root.visible,false,'reference must start with no ornaments');
 assert.equal(selected.size,before);
 const meshes=[];
 result.root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 assert.ok(meshes.length>85,'scene should have recognisable material detail, not just another colour grade');
 assert.ok(meshes.every(o=>o.userData.decorativeOnly===true));
 assert.ok(meshes.every(o=>!selected.has(o)));
 assert.ok(meshes.some(o=>o.name?.startsWith('loose_sheet_')));
 assert.ok(meshes.some(o=>o.name?.startsWith('ivy_leaf_')));
 assert.ok(meshes.some(o=>o.name?.startsWith('torn_note_paper_')));
 assert.ok(meshes.some(o=>o.name?.startsWith('abandoned_book_')));
 assert.deepEqual(result.placements.floorManuscripts.length,3);
 assert.deepEqual(result.placements.ivy.length,2);
 result.setVisible(true);assert.equal(result.visible,true);assert.equal(result.root.visible,true);
 result.setVisible(false);assert.equal(result.visible,false);assert.equal(result.root.visible,false);
});
test('comic pass is isolated to a fourth staging preview, earlier treatments are intact',()=>{
 const render=require('../scripts/render-dh11c5c3-comic.cjs').render;
 const html=render(read('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5C.3','data-illustrated-v4="true"',
  'comic-storybook-style.js?v=dh11c5c-comic-storybook-v4',
  'comic-storybook-dressing.js?v=dh11c5c-comic-storybook-v4',
  'room.js?v=dh11c5c-comic-storybook-v4',
  'room-plan.js?v=dh11c5c-comic-storybook-v4',
  'data-illustration-mode="reference"','data-illustration-mode="painterly"',
  'Earlier softened-edge V3','Earlier painted-surfaces V2','Original C5B textured reference'])
  assert.ok(html.includes(marker),'Missing staged comic marker: '+marker);
 assert.ok(html.indexOf('comic-storybook-style.js')<html.indexOf('room.js?v=dh11c5c-comic-storybook'));
 assert.ok(html.indexOf('comic-storybook-dressing.js')<html.indexOf('room.js?v=dh11c5c-comic-storybook'));
 const v3=require('../scripts/render-dh11c5c2b-handdrawn.cjs').render(read('prototypes/dh-11c-room/index.html'));
 assert.ok(v3.includes('illustrated-style-v3.js?v=dh11c5c-soft-edges-v3'));
 assert.ok(!v3.includes('data-illustrated-v4'));
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of ["document.body.dataset.illustratedV4==='true'?window.DH11ComicStorybookStyle",
  "window.DH11ComicDressing?.create(THREE,scene)",
  "comicDressing.setVisible(mode==='painterly')",
  "lampButton.addEventListener('click',toggleLamp)",
  'drawerIndexForMesh(mesh,cabinetDrawers)','toggleBook(bookIndex)',
  'toggleBinPaper(binPaperIndex)','togglePaper(paperIndex)',
  'if(illustratedRuntime)illustratedRuntime.register(content)']){
  assert.ok(room.includes(marker),'Missing preserved behaviour: '+marker);
 }
});

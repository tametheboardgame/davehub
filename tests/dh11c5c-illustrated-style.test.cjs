'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const style=require('../prototypes/dh-11c-room/illustrated-style.js');
const render=require('../scripts/render-dh11c5c-illustrated.cjs').render;
const source=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('DH-11C.5C.1 only offers the approved material reference and working variant A',()=>{
 assert.deepEqual(Object.keys(style.MODES),['reference','painterly']);
 assert.equal(style.MODES.painterly.name,'Painterly Storybook');
 assert.equal(style.MODES.reference.id,'reference');
 assert.throws(()=>style.createRuntime({THREE:{}}),TypeError);
 for(const name of ['desk_surface','desk_file_cover','bookcase_body','bookcase_shelf_3',
 'front_face_finished','case_left','typewriter_body'])assert.equal(style.outlinedName(name),true);
 for(const name of ['bin_paper_1','book_0_00','desk_paper_04','cabinet_slot_finished',null])
  assert.equal(style.outlinedName(name),false);
 assert.equal(style.protectedMesh({isMesh:true,name:'desk_lamp_bulb',userData:{}}),true);
 assert.equal(style.protectedMesh({isMesh:true,name:'desk_lamp_shade',userData:{}}),true);
 assert.equal(style.protectedMesh({isMesh:true,name:'book_2_03',userData:{featuredBookIndex:4}}),true);
 assert.equal(style.protectedMesh({isMesh:true,name:'featured_book_gilt_4_1',userData:{}}),true);
 assert.equal(style.protectedMesh({isMesh:true,name:'label_plate_finished',userData:{}}),true);
 assert.equal(style.protectedMesh({isMesh:true,name:'desk_paper_04',userData:{}}),false);
});
test('DH-11C.5C.2 reversible shading restores all original material identities, light settings and keeps selectable parts',()=>{
 class Color {
  constructor(x){this.x=x;}
  clone(){return new Color(this.x);}
  set(v){this.x=v;return this;}
  copy(v){this.x=v.x;return this;}
 }
 class DataTexture{constructor(){this.needsUpdate=false;}}
 class MeshToonMaterial{constructor(opts){Object.assign(this,opts);this.isMeshToonMaterial=true;}}
 class EdgesGeometry{constructor(g){this.input=g;}}
 class LineBasicMaterial{constructor(opts){Object.assign(this,opts);}}
 class LineSegments{
  constructor(g,m){this.geometry=g;this.material=m;this.scale={setScalar(s){this.value=s;}};this.userData={};this.visible=true;}
 }
 const THREE={DataTexture,MeshToonMaterial,EdgesGeometry,LineBasicMaterial,LineSegments,Color,
  RGBAFormat:1,NearestFilter:2,ClampToEdgeWrapping:3};
 const material=()=>({isMeshStandardMaterial:true,color:new Color('#825842'),
  map:{id:'approved-original-UV'},emissive:new Color('#000000'),side:0,
  transparent:false,opacity:1,alphaTest:0,depthWrite:true});
 const mesh=name=>({isMesh:true,name,material:material(),geometry:{name},userData:{},children:[],
  add(child){this.children.push(child);},traverse(fn){fn(this);}});
 const hero=mesh('desk_surface'),paper=mesh('desk_paper_04'),lamp=mesh('desk_lamp_bulb');
 const feature=mesh('book_0_00');feature.userData.featuredBookIndex=4;
 const original=[hero.material,paper.material,lamp.material,feature.material];
 const scene={background:new Color('#1b1b2a'),fog:{color:new Color('#1b1b2a'),near:17,far:32},
  traverse(fn){[hero,paper,lamp,feature].forEach(fn);}};
 const light=(color,intensity)=>({color:new Color(color),intensity,userData:{}});
 const lights={ambient:{...light('#c3d4ea',2.25),groundColor:new Color('#4d3842')},
  sun:light('#ffe0ad',2.8),window:light('#92b8d9',15),lamp:light('#f1b982',26)};
 lights.lamp.userData.litIntensity=26;
 const renderer={toneMappingExposure:1.18};
 const r=style.createRuntime({THREE,scene,renderer,lights});
 assert.equal(r.register(scene),2);
 assert.equal(r.register(scene),2,'idempotent registration must not duplicate lines');
 assert.equal(r.set('painterly').id,'painterly');
 assert.equal(hero.material.isMeshToonMaterial,true);
 assert.equal(paper.material.isMeshToonMaterial,true);
 assert.equal(hero.material.map,original[0].map,'the same approved UV texture remains on the real geometry');
 assert.equal(hero.children.length,1);
 assert.equal(hero.children[0].visible,true);
 assert.equal(hero.children[0].userData.decorativeOnly,true);
 assert.notEqual(lights.sun.intensity,2.8);
 assert.equal(lights.lamp.userData.litIntensity,28);
 assert.equal(lamp.material,original[2],'bulb retains its physical on/off material');
 assert.equal(feature.material,original[3],'interactive turquoise book cannot be recoloured');
 const late=mesh('front_face_drafts');
 r.register(late);
 assert.equal(late.material.isMeshToonMaterial,true,'late-arriving cabinet GLB follows active style');
 assert.equal(late.children.length,1);
 assert.equal(r.set('reference').id,'reference');
 assert.equal(hero.material,original[0]);
 assert.equal(paper.material,original[1]);
 assert.equal(lamp.material,original[2]);
 assert.equal(feature.material,original[3]);
 assert.equal(late.material.isMeshStandardMaterial,true);
 assert.equal(hero.children[0].visible,false);
 assert.equal(lights.sun.intensity,2.8);
 assert.equal(lights.ambient.intensity,2.25);
 assert.equal(lights.lamp.userData.litIntensity,26);
 assert.equal(renderer.toneMappingExposure,1.18);
 assert.equal(scene.background.x,'#1b1b2a');
 assert.throws(()=>r.set('unbuilt-variant-b'),/Unknown illustration mode/);
 assert.equal(r.mode,'reference');
});
test('illustrated variant A preview is isolated, cache versioned and contains real accessible controls',()=>{
 const html=render(source('prototypes/dh-11c-room/index.html'));
 for(const marker of ['data-illustrated-proof="true"','data-furniture-model-proof="true"',
  'data-immersive-room="true"','illustrated.css',
  'illustrated-style.js?v=dh11c5c-painterly-v1',
  'room.js?v=dh11c5c-painterly-v1','room-plan.js?v=dh11c5c-painterly-v1',
  'desk-materials.js?v=dh11c5a-desk-v1','archive-materials.js?v=dh11c5b-archive-v1',
  'data-illustration-mode="reference"','data-illustration-mode="painterly"',
  'aria-pressed="false"','aria-pressed="true"',
  'id="illustration-description" role="status" aria-live="polite"',
  'davehub-illustrated-stage" content="DH-11C.5C.2"',
  'Original C5B textured reference'])assert.ok(html.includes(marker),'Illustration preview missing: '+marker);
 assert.ok(html.indexOf('illustrated-style.js?v=')<html.indexOf('room.js?v='),
  'style module must initialise before WebGL scene');
 const existing=require('../scripts/render-dh11c4f-furniture.cjs').render(source('prototypes/dh-11c-room/index.html'));
 assert.ok(!existing.includes('data-illustrated-proof="true"'),'C5B route must remain unchanged');
 assert.ok(existing.includes('room.js?v=dh11c5b-archive-v1'));
});
test('illustration is applied after GLB imports, without rewriting geometry or interaction logic',()=>{
 const room=source('prototypes/dh-11c-room/room.js');
 for(const marker of [
  "const illustratedProof=furnitureModelProof&&document.body.dataset.illustratedProof==='true'",
  'illustratedRuntime=system.createRuntime({THREE,scene,renderer,lights:sceneLights})',
  'illustratedRuntime.register(scene)',
  "chooseIllustration('painterly')",
  'if(illustratedRuntime)illustratedRuntime.register(model)',
  'if(illustratedRuntime)illustratedRuntime.register(content)',
  'sceneLights.lamp.intensity=THREE.MathUtils.lerp',
  "lampButton.addEventListener('click',toggleLamp)",
  'drawerIndexForMesh(mesh,cabinetDrawers)',
  'toggleBook(bookIndex)','togglePaper(paperIndex)','toggleBinPaper(binPaperIndex)',
  'binPaperPose(binPaperHomes[i],i,binPaperProgress[i])',
  'books.forEach((mesh,i)=>markFeaturedBook(mesh,i));',
  'scene.add(content)',
  'furniture-source.glb?v=dh11c5b-archive-v1'
 ])assert.ok(room.includes(marker),'Missing geometry/interaction preservation marker '+marker);
 // The renderer adds only lines, never a second Mesh that could intercept a
 // raycast; the existing source-manifest and its distinct moving parts remain.
 assert.doesNotMatch(source('prototypes/dh-11c-room/illustrated-style.js'),
  /new THREE\.Mesh\(/);
});

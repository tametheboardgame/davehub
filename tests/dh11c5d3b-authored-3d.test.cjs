'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const art=require('../prototypes/dh-11c-room/high-illustration-3d.js');
const base=require('../prototypes/dh-11c-room/archive-materials.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('5D.3B identifies distinct, physically painted furniture surfaces without replacing featured books',()=>{
 const standard={color:{getHexString:()=> '636775'}};
 for(const [name,kind] of [
  ['desk_surface','wood'],['desk_paper_04','parchment'],
  ['book_1_09','binding'],['front_face_finished','enamel'],
  ['door_leaf','wood'],['typewriter_paper','parchment'],
  ['typewriter_body','ink'],['bookcase_crown','wood'],
  ['cabinet-any','plaster']].slice(0,-1)){
  assert.equal(art.kindFor(name,standard),kind,name);
 }
 assert.equal(art.kindFor('unlabelled',standard),'plaster');
 assert.ok(art.protectedMesh({isMesh:true,name:'book_1_03',userData:{featuredBookIndex:2},material:{isMeshStandardMaterial:true}}));
 assert.ok(art.protectedMesh({isMesh:true,name:'desk_lamp_bulb',userData:{},material:{isMeshStandardMaterial:true}}));
 assert.equal(art.protectedMesh({isMesh:true,name:'front_face_drafts',userData:{},material:{isMeshStandardMaterial:true}}),false);
 assert.deepEqual(art.kindFor('folder_finished_2',standard),'parchment');
 assert.ok(base.cabinetFinishForNode('front_face_drafts'));
});
test('5D.3B authored artwork uses actual painterly pathwork on every original UV family',()=>{
 const actions=[];const ctx={fillStyle:'',strokeStyle:'',lineWidth:0,lineCap:'',lineJoin:'',
  save(){actions.push('save');},restore(){actions.push('restore');},
  fillRect(){actions.push('fillRect');},strokeRect(){actions.push('strokeRect');},
  beginPath(){actions.push('beginPath');},moveTo(){actions.push('moveTo');},
  bezierCurveTo(){actions.push('bezierCurveTo');},quadraticCurveTo(){actions.push('quadraticCurveTo');},
  ellipse(){actions.push('ellipse');},stroke(){actions.push('stroke');},fill(){actions.push('fill');},
  setLineDash(){actions.push('setLineDash');}};
 for(const kind of ['wood','parchment','binding','enamel','brass','leather','plaster','stone','fabric','leaf','ink']){
  actions.length=0;
  assert.equal(art.paintCanvas(ctx,384,kind,true),true);
  assert.ok(actions.length>10,'every material has deliberate illustrated strokes '+kind);
  assert.ok(actions.includes('beginPath')||actions.includes('strokeRect'));
 }
 actions.length=0;art.paintCanvas(ctx,384,'wood',false);
 assert.ok(actions.filter(x=>x==='bezierCurveTo').length>=25,'authored wood must be more than a colour grade');
 assert.throws(()=>art.paintCanvas(ctx,384,'fake',true),/Unknown illustrated/);
 assert.throws(()=>art.paintCanvas(ctx,12,'wood',true),/Invalid hand-painted/);
});
test('5D.3B fine relief follows original real book/paper/drawer/desk/door geometry',()=>{
 const bounds={min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}};
 const original=JSON.stringify(bounds);
 for(const [name,minSegments] of [
  ['book_0_01',35],['desk_paper_00',24],['typewriter_paper',12],
  ['desk_surface',15],['front_face_finished',14],['door_leaf',15],
  ['bookcase_crown',24],['typewriter_body',14],['bookcase_shelf_2',1]]){
  const positions=art.reliefPaths(name,bounds);
  assert.equal(positions.length%6,0,name);
  assert.ok(positions.length/6>=minSegments, name+' needs actual surface detail, not an outline shader');
  assert.deepEqual(positions,art.reliefPaths(name,bounds),name+' must not vary by frame');
 }
 assert.deepEqual(art.reliefPaths('desk_lamp_bulb',bounds),[]);
 assert.equal(JSON.stringify(bounds),original,'original geometry may not be changed');
});
test('5D.3B renderer restores the original materials and lights, including late GLB components',()=>{
 class C{constructor(v){this.value=v;}clone(){return new C(this.value);}copy(x){this.value=x.value;return this;}set(x){this.value=x;return this;}}
 class Mat{constructor(){this.isMeshStandardMaterial=true;this.color=new C('white');this.roughness=.6;this.metalness=.21;this.map=null;}
  clone(){const m=new Mat();m.color=this.color.clone();m.roughness=this.roughness;m.metalness=this.metalness;return m;}}
 class Float32BufferAttribute{constructor(a,n){this.array=a;this.itemSize=n;}}
 class BufferGeometry{constructor(){this.attributes={};}setAttribute(name,a){this.attributes[name]=a;}}
 class LineBasicMaterial{constructor(a){Object.assign(this,a);}}
 class LineSegments{constructor(geometry,material){this.geometry=geometry;this.material=material;this.userData={};}}
 const THREE={Float32BufferAttribute,BufferGeometry,LineBasicMaterial,LineSegments};
 const geo=()=>({boundingBox:{min:{x:-.5,y:-.5,z:-.5},max:{x:.5,y:.5,z:.5}}});
 const original=new Mat(),mesh=name=>({isMesh:true,name,geometry:geo(),userData:{},material:original,
  children:[],add(x){this.children.push(x);}});
 const book=mesh('book_1_09'),paper=mesh('desk_paper_00'),featured=mesh('book_0_00'),bulb=mesh('desk_lamp_bulb');
 featured.userData.featuredBookIndex=3;
 const scene={background:new C('old'),fog:{color:new C('old'),near:17,far:32}};
 const light=(v,n)=>({color:new C(v),intensity:n});
 const lights={ambient:{...light('ambient',2),groundColor:new C('ground')},
  sun:light('sun',3),window:light('window',12),lamp:{...light('lamp',25),userData:{litIntensity:25}}};
 const renderer={toneMappingExposure:1.18};
 const runtime=art.createRuntime({THREE,scene,renderer,lights});
 const root={traverse(fn){[book,paper,featured,bulb].forEach(fn);}};
 assert.equal(runtime.register(root),2);
 assert.equal(runtime.register(root),2);
 runtime.set('painterly');
 assert.notEqual(book.material,original);
 assert.notEqual(paper.material,original);
 assert.equal(featured.material,original);
 assert.equal(bulb.material,original);
 assert.ok(book.children.some(c=>c.userData.decorativeOnly));
 assert.ok(!book.children.some(c=>c.isMesh),'decorative art should never enter mesh picking');
 const late=mesh('front_face_finished');
 runtime.register({traverse(fn){fn(late);}});
 assert.notEqual(late.material,original);
 runtime.set('reference');
 for(const obj of [book,paper,late,featured,bulb])assert.equal(obj.material,original);
 assert.ok(book.children.every(c=>c.visible===false));
 assert.equal(renderer.toneMappingExposure,1.18);
 assert.equal(lights.lamp.userData.litIntensity,25);
 assert.equal(scene.background.value,'old');
});
test('5D.3B preview keeps same GLB geometry, controls and previous variants',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=require('../scripts/render-dh11c5d3b-authored3d.cjs').render(source);
 for(const marker of ['DH-11C.5D.3B','data-illustrated-v5="true"',
  'high-illustration-3d.js?v=dh11c5d3b-authored-3d-v1',
  'room.js?v=dh11c5d3b-authored-3d-v1',
  'room-plan.js?v=dh11c5d3b-authored-3d-v1',
  'Original materials','Illustrated 3D art','Previous comic shader experiment']){
  assert.ok(html.includes(marker),'Missing dedicated 3D style version '+marker);
 }
 assert.ok(!html.includes('comic-storybook-dressing.js'));
 assert.ok(!html.includes('data-overview-studio="true"'));
 const rt=read('prototypes/dh-11c-room/room.js');
 for(const marker of ["document.body.dataset.illustratedV5==='true'?window.DH11HighIllustration3D",
  'if(illustratedRuntime)illustratedRuntime.register(content)',
  'toggleBook(bookIndex)','togglePaper(paperIndex)','toggleBinPaper(binPaperIndex)',
  "lampButton.addEventListener('click',toggleLamp)",'drawerIndexForMesh(mesh,cabinetDrawers)']){
  assert.ok(rt.includes(marker),'Existing mechanics intact '+marker);
 }
 const artSource=read('prototypes/dh-11c-room/high-illustration-3d.js');
 for(const forbidden of ['new THREE.Mesh(','canvas.toDataURL(','window.location.href','camera.position.set(']){
  assert.ok(!artSource.includes(forbidden),'This stage cannot substitute moving states or cameras: '+forbidden);
 }
});

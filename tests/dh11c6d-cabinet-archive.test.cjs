'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const catalogueModule=require('../prototypes/dh-11c-room/cabinet-catalogue.js');
const bookModule=require('../prototypes/dh-11c-room/finished-books.js');
const manuscripts=require('../prototypes/dh-11c-room/manuscript-experience.js');
const experienceModule=require('../prototypes/dh-11c-room/cabinet-experience.js');
const renderer=require('../scripts/render-dh11c6d3-filing-cabinet.cjs');
const previous=require('../scripts/render-dh11c6c2-motion-first.cjs');
const catalogue=catalogueModule.create({books:bookModule,manuscripts:manuscripts.MANUSCRIPTS});
const folders=import('../prototypes/dh-11c-room/cabinet-folders.mjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

test('only exactly three established public books and clearly disclosed invented samples are filed',()=>{
 assert.equal(catalogue.DRAWERS.length,5);
 assert.equal(catalogue.items.length,12);
 assert.deepEqual(catalogue.items.filter(x=>x.kind==='Published book').map(x=>x.title),
  bookModule.BOOKS.map(x=>x.title));
 assert.ok(catalogue.items.filter(x=>x.kind==='Fictional demonstration').every(x=>
  x.id.startsWith('demo-')&&x.status.includes('Invented sample')));
 for(const d of [0,1,2,3,4]){
  const slots=catalogue.inDrawer(d);
  assert.ok(slots.length>=2&&slots.length<=4);
  assert.ok(slots.every(x=>catalogue.at(d,x.slot)===x));
 }
 assert.equal(catalogue.at(0,3),null);
 assert.equal(catalogue.byId('a-private-draft'),null);
 const broken={BOOKS:[{id:'private',title:'should never appear'}]};
 assert.throws(()=>catalogueModule.create({books:broken,manuscripts:[]}),/three public books/);
});
test('published folders use real bookcase identifiers and draft links use existing public-safe sample IDs',()=>{
 const published=catalogue.inDrawer(0);
 assert.deepEqual(published.map(x=>x.related.id),bookModule.BOOKS.map(x=>x.id));
 for(const entry of catalogue.inDrawer(1))
  assert.ok(manuscripts.MANUSCRIPTS.some(x=>x.id===entry.related.id&&x.kind==='Fictional demonstration'));
 assert.equal(catalogue.inDrawer(2)[0].related.type,'workshop');
});
test('folder maths preserves actual closed position, physical lift and complete reversibility',async()=>{
 const motion=await folders;
 assert.equal(motion.FOLDERS_PER_DRAWER,4);
 assert.deepEqual(motion.DRAWER_SLUGS,['finished','drafts','oddities','fragments','field_notes']);
 const home={x:.31,y:.07,z:-.3};
 assert.deepEqual(motion.folderTarget(home,false),home);
 assert.deepEqual(motion.folderTarget(home,true),{
  x:.31,y:.07+motion.FOLDER_LIFT,z:-.3+motion.FOLDER_PULL
 });
 assert.equal(motion.folderSettled(home,home,false),true);
 assert.equal(motion.folderSettled(home,home,true),false);
 assert.equal(motion.folderSettled(motion.folderTarget(home,true),home,true),true);
});
function fakeThree(){
 const position=()=>({x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});},
  copy(p){Object.assign(this,{x:p.x,y:p.y,z:p.z});}});
 const mat=()=>({color:{set(){}},clone(){return mat();}});
 class Group{
  constructor(){this.position=position();this.children=[];this.name='';this.userData={};}
  add(child){this.children.push(child);child.parent=this;}
  remove(child){this.children=this.children.filter(x=>x!==child);child.parent=null;}
  getObjectByName(name){if(this.name===name)return this;for(const child of this.children){const found=child.getObjectByName(name);if(found)return found;}return null;}
  traverse(callback){callback(this);for(const child of this.children)child.traverse(callback);}
 }
 class Mesh extends Group{
  constructor(geo,material){super();this.isMesh=true;this.geometry=geo;this.material=material;this.rotation={y:0};}
 }
 class Material{constructor(props){this.props=props;this.color={set(){}};}}
 class Texture{constructor(canvas){this.canvas=canvas;}}
 const three={Group,Mesh,BoxGeometry:class{constructor(...dims){this.dims=dims;}},
  PlaneGeometry:class{constructor(...dims){this.dims=dims;}},MeshBasicMaterial:Material,
  MeshStandardMaterial:Material,CanvasTexture:Texture,SRGBColorSpace:'srgb',
  LinearFilter:'linear',LinearMipmapLinearFilter:'mipmap',
  MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}};
 return {three,mat};
}
test('all 20 actual mesh folders remain parented under their five original moving drawer rigs',async()=>{
 const {three,mat}=fakeThree();
 const canvasDoc={createElement(tag){
  assert.equal(tag,'canvas');
  return {getContext(){return {fillRect(){},strokeRect(){},fillText(){}};}};
 }};
 const rig=(await folders).mountCabinetFolders({THREE:three,document:canvasDoc,catalogue});
 const drawers=(await folders).DRAWER_SLUGS.map(slug=>{
  const drawer=new three.Group();
  const group=new three.Group();drawer.add(group);
  for(let i=0;i<4;i++){
   const folder=new three.Mesh(null,mat());
   folder.name='folder_'+slug+'_'+i;
   folder.position.set(-.48+i*.32,.07,-.33);
   group.add(folder);
  }
  return drawer;
 });
 rig.attach(drawers);
 assert.equal(rig.attached,true);
 assert.equal(rig.select(0,0),true);
 assert.equal(rig.select(0,3),false);
 // Failed selection must not reset an already selected file.
 assert.deepEqual(rig.selected,{drawer:0,index:0});
 for(let i=0;i<15;i++)rig.update(.5);
 assert.equal(rig.settled(0,0),true);
 const folder=drawers[0].getObjectByName('folder_finished_0');
 assert.ok(folder.parent.name==='cabinet_folder_rig_0_0');
 assert.equal(folder.parent.parent,drawers[0]);
 const tab=drawers[0].getObjectByName('archive_folder_0_0_tab');
 assert.equal(tab.userData.cabinetFolderIndex,0);
 assert.equal(folder.userData.cabinetFolderIndex,0);
 assert.equal(drawers[4].getObjectByName('folder_field_notes_3').userData.cabinetDrawerIndex,4);
 rig.clear();
 for(let i=0;i<15;i++)rig.update(.5);
 assert.equal(rig.settled(0,0),true);
});
function fakeReader(){
 const nodes=new Map();
 const document={activeElement:null,getElementById:id=>nodes.get(id)};
 const make=()=>{
  const handlers={},node={textContent:'',open:false,hidden:false,
   isConnected:true,style:{setProperty(){}},
   addEventListener:(type,fn)=>{handlers[type]=fn;},
   dispatch:(type,arg={})=>handlers[type]?.({target:node,...arg}),
   showModal(){this.open=true;},
   close(){this.open=false;this.dispatch('close');},
   focus(){document.activeElement=this;}};
  return node;
 };
 const ids=['archive-folder-dialog','archive-folder-close','archive-folder-category',
  'archive-folder-label','archive-folder-title','archive-folder-status','archive-folder-summary',
  'archive-folder-notice','archive-folder-related','archive-folder-back'];
 for(const id of ids)nodes.set(id,make());
 return {document,nodes};
}
test('archive dialog distinguishes genuine publication from fiction and closes back to real drawer',()=>{
 const {document,nodes}=fakeReader();let closed=0,related=[];
 const invoker=nodes.get('archive-folder-back');invoker.focus();
 const experience=experienceModule.mount({document,catalogue,onClose:()=>closed++,
  onRelated:x=>related.push(x)});
 assert.equal(experience.show(0,0),true);
 assert.equal(experience.opened,true);
 assert.equal(nodes.get('archive-folder-title').textContent,bookModule.BOOKS[0].title);
 assert.ok(nodes.get('archive-folder-notice').textContent.includes('existing public edition'));
 assert.equal(nodes.get('archive-folder-related').hidden,false);
 nodes.get('archive-folder-close').dispatch('click');
 assert.equal(closed,1);assert.equal(experience.opened,false);
 assert.equal(document.activeElement,invoker);
 assert.equal(experience.show(3,0),true);
 assert.ok(nodes.get('archive-folder-notice').textContent.includes('Fictional demonstration only'));
 assert.equal(nodes.get('archive-folder-related').hidden,true);
 nodes.get('archive-folder-back').dispatch('click');
 assert.equal(closed,2);
 assert.equal(experience.show(1,0),true);
 nodes.get('archive-folder-related').dispatch('click');
 assert.equal(related.length,1);
 assert.equal(related[0].related.type,'manuscript');
 assert.equal(experience.show(4,3),false);
});
test('only the canonical writing renderer opts into real cabinet assets, older previews unchanged',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=renderer.render(source),old=previous.render(source);
 assert.equal(renderer.VERSION,'dh11c6d3-cabinet-archive-v1');
 for(const token of ['DH-11C.6D.3','data-cabinet-archive="true"',
  'room.js?v='+renderer.VERSION,'cabinet-folders','archive-folder-dialog',
  'archive-folder-title','archive-folder-related','cabinet-catalogue.js?v='+renderer.VERSION,
  'cabinet-experience.js?v='+renderer.VERSION,'cabinet-experience.css?v='+renderer.VERSION,
  'published-book-dialog','manuscript-dialog','workshop-dialog','data-motion-first="true"'])
  // The module import lives in room.js; scripts for the visitor interface live in the HTML.
  if(token!=='cabinet-folders')assert.ok(html.includes(token),token);
 assert.ok(!old.includes('data-cabinet-archive'));
 assert.ok(!source.includes('archive-folder-dialog'));
});
test('the cabinet uses existing GLB drawer pivots and one frame-driven physical reveal, never a popup timer',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const token of [
  "from './cabinet-folders.mjs?v=dh11c6d3-archive-v1'",
  "const cabinetArchiveEnabled=motionFirst&&document.body.dataset.cabinetArchive==='true'",
  "cabinetFolders.attach(found)",
  "cabinetFolders.attach(cabinetDrawers)",
  "selectCabinetFolder(drawerIndex,folderIndex)",
  "drawerIndexForMesh(mesh,cabinetDrawers)",
  "if(cabinetFolders)cabinetFolders.update(rate)",
  "function revealCabinetFolderAfterMotion(){",
  "cabinetFolders.settled(pending.drawer,pending.index)",
  "camera.position.distanceTo(desiredPosition)",
  "pendingFolderReveal=null;",
  "cabinetExperience.show(pending.drawer,pending.index)",
  "renderer.render(scene,camera);\n  revealAfterPhysicalMotion();\n  revealCabinetFolderAfterMotion();",
  "onRelated:item=>navigateFromCabinetFolder(item)"
 ])assert.ok(room.includes(token),token);
 const block=room.slice(room.indexOf('function selectCabinetFolder('),room.indexOf('function navigateFromCabinetFolder('));
 assert.ok(!block.includes('setTimeout'));
 assert.ok(!block.includes('cabinetExperience.show('));
});
test('real published and fictional sample references navigate within the same room',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const token of [
  "const book=finishedBooks?.byId(relation.id)",
  "focus('bookcase')",
  "if(!state.books[book.featuredIndex])toggleBook(book.featuredIndex)",
  "focus('desk')",
  "if(!state.papers[index])togglePaper(index)",
  "focus('typewriter');manuscriptExperience.openWorkshop()"
 ])assert.ok(room.includes(token),token);
});

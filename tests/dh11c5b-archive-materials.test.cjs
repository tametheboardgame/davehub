'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const archive=require('../prototypes/dh-11c-room/archive-materials.js');
const furniture=require('../prototypes/dh-11c-room/furniture-asset.js');
const {build:buildFurniture}=require('../scripts/build-dh11c4f-furniture-glb.cjs');
const {build:buildCabinet}=require('../scripts/build-dh11c4-cabinet-glb.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const bookNames=Array.from({length:7},(_,i)=>'bookBinding'+i);
const shelfNames=['shelfWalnut','shelfEdge','shelfLining','shelfGilt'];
const cabinetNames=['cabinetCase','cabinetDrawer','cabinetTrim','cabinetTray','cabinetBrass',
 'cabinetFolder0','cabinetFolder1','cabinetLabel'];
test('DH-11C.5B archive materials are rich, deterministic and materially distinct',()=>{
 const names=[...shelfNames,...bookNames,...cabinetNames];
 assert.deepEqual(Object.keys(archive.profiles),names);
 assert.equal(names.length,19);
 for(const name of names){
  const a=archive.generate(name),b=archive.generate(name);
  assert.equal(a.width,192);
  assert.equal(a.height,192);
  assert.equal(a.pixels.length,192*192*4);
  assert.deepEqual(a.pixels,b.pixels,'random or unstable material: '+name);
  const vals=new Set();
  for(let i=0;i<a.pixels.length;i+=4)vals.add(a.pixels[i]);
  assert.ok(vals.size>18,'flat material '+name+' '+vals.size);
 }
 for(let i=0;i<6;i++)
  assert.notDeepEqual(archive.generate(bookNames[i]).pixels,archive.generate(bookNames[i+1]).pixels);
 assert.throws(()=>archive.generate('destructive'),/Unknown archive finish/);
});
test('the furniture GLB includes eleven bookcase maps and retains all book pivots',()=>{
 const {json}=buildFurniture(),byName=name=>furniture.nodes.find(n=>n.name===name);
 assert.equal(json.images.length,20);
 assert.equal(json.textures.length,20);
 const nodeNames=json.nodes.map(n=>n.name);
 assert.equal(nodeNames.length,furniture.nodes.length);
 assert.equal(new Set(nodeNames).size,nodeNames.length);
 for(const name of shelfNames){
  const m=json.materials.find(x=>x.name===name);
  assert.ok(m?.pbrMetallicRoughness?.baseColorTexture,'missing shelf PBR texture '+name);
 }
 for(let i=0;i<7;i++){
  const mat=json.materials.find(x=>x.name==='book'+i);
  assert.ok(mat?.pbrMetallicRoughness?.baseColorTexture,'missing binding material '+i);
 }
 assert.equal(byName('bookcase_body').material,'shelfWalnut');
 assert.equal(byName('bookcase_recess').material,'shelfLining');
 assert.equal(byName('bookcase_crown').material,'shelfGilt');
 const books=furniture.nodes.filter(x=>/^book_[0-3]_[0-9]{2}$/.test(x.name));
 assert.equal(books.length,80);
 assert.ok(books.every(x=>x.parent==='bookcase_root'));
 for(const b of books){
  assert.deepEqual(json.nodes.find(x=>x.name===b.name).translation,b.position);
 }
});
test('verified five-drawer cabinet gets maps on all named meshes without reauthoring its GLB',()=>{
 const result=buildCabinet(),json=result.json;
 const meshNames=json.nodes.filter(n=>Number.isInteger(n.mesh)).map(n=>n.name);
 assert.ok(meshNames.length>75,'cabinet GLB has substantial independently textured geometry');
 for(const name of meshNames){
  const finish=archive.cabinetFinishForNode(name);
  assert.ok(cabinetNames.includes(finish),'unmapped cabinet mesh '+name);
 }
 for(const n of ['case_back','case_left','case_right','case_top','case_bottom'])
  assert.equal(archive.cabinetFinishForNode(n),'cabinetCase');
 for(const n of ['front_face_finished','front_face_drafts'])
  assert.equal(archive.cabinetFinishForNode(n),'cabinetDrawer');
 for(const n of ['tray_floor_finished','tray_right_field_notes'])
  assert.equal(archive.cabinetFinishForNode(n),'cabinetTray');
 assert.equal(archive.cabinetFinishForNode('brass_handle_finished'),'cabinetBrass');
 assert.equal(archive.cabinetFinishForNode('label_plate_field_notes'),'cabinetLabel');
 assert.equal(archive.cabinetFinishForNode('folder_drafts_3'),'cabinetFolder1');
 assert.equal(archive.cabinetFinishForNode('folder_drafts_2'),'cabinetFolder0');
 for(const n of ['drawer_finished','desk_paper_00','typewriter_key_1_4',null])
  assert.equal(archive.cabinetFinishForNode(n),null,'only existing named cabinet meshes are classified');
 assert.equal(json.extras.drawerTravelMetres,.76);
});
test('runtime bookcase and cabinet maps preserve GLB selection and teal-gold targets',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const token of [
  'const archiveKit=window.DH11ArchiveMaterials',
  'const spec=archiveKit.generate(name)',
  "mats['bookBinding'+materialIndex]",
  'mesh.material.map=null;mesh.material.needsUpdate=true',
  'archiveKit.cabinetFinishForNode(node.name)',
  'if(finish)node.material=mats[finish]',
  "furniture-source.glb?v=dh11c5b-archive-v1",
  'books.forEach((mesh,i)=>markFeaturedBook(mesh,i));',
  "lampButton.addEventListener('click',toggleLamp)",
  'toggleBook(bookIndex)','toggleBinPaper(binPaperIndex)',
  'drawerIndexForMesh(mesh,cabinetDrawers)',
  'capture(\'cabinet\',content);'
 ])assert.ok(room.includes(token),'missing required C5B wiring: '+token);
 const render=require('../scripts/render-dh11c4f-furniture.cjs').render;
 const html=render(read('prototypes/dh-11c-room/index.html'));
 assert.ok(html.includes('archive-materials.js?v=dh11c5b-archive-v1'));
 assert.ok(html.includes('room.js?v=dh11c5b-archive-v1'));
 assert.ok(html.indexOf('archive-materials.js?v=')<html.indexOf('room.js?v='));
 assert.ok(html.includes('davehub-furniture-release" content="dh11c5b-archive-v1"'));
 const check=cp.spawnSync(process.execPath,['--check',path.join(__dirname,'..','prototypes/dh-11c-room/archive-materials.js')],{encoding:'utf8'});
 assert.equal(check.status,0,check.stderr);
});

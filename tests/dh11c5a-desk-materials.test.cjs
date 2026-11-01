'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const maps=require('../prototypes/dh-11c-room/desk-materials.js');
const manifest=require('../prototypes/dh-11c-room/furniture-asset.js');
const {build}=require('../scripts/build-dh11c4f-furniture-glb.cjs');
const read=pathName=>fs.readFileSync(path.join(__dirname,'..',pathName),'utf8');
const finishes=['deskWalnut','deskFrame','deskParchment0','deskParchment1','deskParchment2',
 'deskLeather','deskBrass','typewriterEnamel','lampLinen'];
test('nine genuinely detailed, varied and deterministic writing-desk materials',()=>{
 assert.deepEqual(Object.keys(maps.profiles),finishes);
 assert.equal(maps.SIZE,192);
 for(const name of finishes){
  const a=maps.generate(name),b=maps.generate(name);
  assert.equal(a.width,192);
  assert.equal(a.pixels.length,192*192*4);
  assert.deepEqual(a.pixels,b.pixels,'texture must be byte-for-byte stable: '+name);
  const distinct=new Set();
  for(let i=0;i<a.pixels.length;i+=4)distinct.add(a.pixels[i]);
  assert.ok(distinct.size>=20,'material is flat rather than textured: '+name+' ('+distinct.size+')');
  assert.ok(a.roughness>=.3&&a.roughness<=1,'physically plausible roughness: '+name);
 }
 assert.notDeepEqual(maps.generate('deskParchment0').pixels,maps.generate('deskParchment1').pixels,
  'the paper sheets must not all look the same');
 assert.throws(()=>maps.generate('unapproved'),/Unknown desk finish/);
 assert.throws(()=>maps.generate('deskWalnut',12),/Invalid desk texture/);
});
test('furniture GLB embeds usable lossless PNG material maps with unchanged mesh identities',()=>{
 const {json,glb}=build(),materialNames=Object.keys(manifest.materials);
 assert.equal(json.images.length,9);
 assert.equal(json.textures.length,9);
 assert.equal(json.samplers.length,1);
 assert.equal(json.nodes.length,manifest.nodes.length);
 assert.equal(json.extras.milestone,'DH-11C.5A');
 const chunkSize=glb.readUInt32LE(12),binaryStart=20+chunkSize+8;
 for(let i=0;i<9;i++){
  const image=json.images[i],texture=json.textures[i];
  assert.equal(image.mimeType,'image/png');
  assert.equal(texture.source,i);
  const view=json.bufferViews[image.bufferView];
  assert.equal(view.target,undefined,'images cannot be vertex-buffer views');
  const png=glb.subarray(binaryStart+view.byteOffset,binaryStart+view.byteOffset+view.byteLength);
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(png.readUInt32BE(16),192);
  assert.equal(png.readUInt32BE(20),192);
 }
 for(const name of ['deskWalnut','deskFrame','deskParchment0','deskParchment1','deskParchment2',
  'deskLeather','deskBrass','typewriterEnamel','lampShade']){
  const mat=json.materials.find(m=>m.name===name);
  assert.ok(mat?.pbrMetallicRoughness?.baseColorTexture,'missing real UV map: '+name);
  assert.deepEqual(mat.pbrMetallicRoughness.baseColorFactor,[1,1,1,1]);
  assert.ok(mat.pbrMetallicRoughness.roughnessFactor>.3);
 }
 assert.ok(materialNames.includes('deskWalnut'));
 const desk=manifest.nodes.find(n=>n.name==='desk_surface');
 assert.equal(desk.material,'deskWalnut');
 assert.deepEqual(desk.position,[0,1.29,0]);
 assert.equal(manifest.nodes.filter(n=>/^desk_paper_\d{2}$/.test(n.name)).length,13);
 assert.equal(manifest.nodes.filter(n=>/^typewriter_key_/.test(n.name)).length,24);
 assert.equal(manifest.nodes.filter(n=>/^bin_paper_/.test(n.name)).length,9);
 assert.equal(manifest.nodes.filter(n=>/^book_[0-3]_[0-9]{2}$/.test(n.name)).length,80);
});
test('procedural fallback shares exact UV recipes and staging preview ships map script first',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 const render=require('../scripts/render-dh11c4f-furniture.cjs').render;
 const html=render(read('prototypes/dh-11c-room/index.html'));
 for(const term of [
  'const deskKit=window.DH11DeskMaterials',
  'if(furnitureModelProof)',
  'const source=deskKit.generate(map)',
  'new THREE.DataTexture(source.pixels,source.width,source.height,THREE.RGBAFormat)',
  'texture.colorSpace=THREE.SRGBColorSpace',
  'mats.deskWalnut,0,1.29,0',
  "mats['deskParchment'+i%3]",
  'mats.typewriterEnamel',
  'mats.deskBrass',
  "furniture-source.glb?v=dh11c5a-desk-v1"
 ])assert.ok(room.includes(term),'procedural texture parity missing '+term);
 assert.ok(html.includes('desk-materials.js?v=dh11c5a-desk-v1'));
 assert.ok(html.includes('room.js?v=dh11c5a-desk-v1'));
 assert.ok(html.indexOf('desk-materials.js?v=')<html.indexOf('room.js?v='),
  'shared map generator must load before module begins');
 assert.ok(html.includes('davehub-furniture-release" content="dh11c5a-desk-v1"'));
 const result=cp.spawnSync(process.execPath,['--check',path.join(__dirname,'..','prototypes/dh-11c-room/desk-materials.js')],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});

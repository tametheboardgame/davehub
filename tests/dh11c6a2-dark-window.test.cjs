'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const artist=require('../prototypes/dh-11c-room/window-illustration-v2.js');
const canonical=require('../scripts/render-dh11c6a-minimal-room.cjs');
const old=require('../scripts/render-dh11c5d3i-exit-door.cjs');
const source=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

function setup(dark){
 const prior=global.document;
 global.document={createElement(){return {width:0,height:0,getContext(){return {
  clearRect(){},save(){},restore(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}
 };}};}};
 let done,fail;
 class Group{constructor(){this.children=[];this.userData={};this.visible=true;}add(x){this.children.push(x);}}
 class Geometry{setAttribute(){return this;}setIndex(){return this;}}
 class Attribute{}
 class CanvasTexture{}
 class Mat{constructor(options){Object.assign(this,options);}}
 class Mesh{constructor(g,m){this.userData={};this.visible=true;this.geometry=g;this.material=m;}}
 class TextureLoader{load(url,onLoad,onProgress,onError){done=onLoad;fail=onError;}}
 const sky={name:'window_sky',visible:true};
 const islands=Array.from({length:3},(_,i)=>({name:'window_island_'+i,visible:true}));
 const lookup=Object.fromEntries([sky,...islands].map(n=>[n.name,n]));
 const root=new Group();root.getObjectByName=name=>lookup[name];
 const THREE={Group,BufferGeometry:Geometry,Float32BufferAttribute:Attribute,
  CanvasTexture,MeshBasicMaterial:Mat,Mesh,TextureLoader,DoubleSide:2,SRGBColorSpace:'srgb'};
 const handle=artist.mount({THREE,root,url:'/assets/homepage/floating-islands-background.png',
  hideLegacyWhileLoading:dark});
 return {sky,islands,root,handle,
  complete(){done({image:{width:1920,height:1080}});},
  fail(){fail(new Error('Network not available'));},
  restore(){global.document=prior;}};
}
test('canonical room starts with dark window, no legacy islands even before image arrives',()=>{
 const v=setup(true);
 try{
  assert.equal(v.handle.ready,false);
  assert.equal(v.sky.visible,true,'dark sky fills the opening while pending');
  assert.ok(v.islands.every(n=>n.visible===false),'old islands never flash');
  assert.equal(v.root.children.length,1);
  assert.equal(v.root.children[0].visible,false,'no half-loaded art');
  v.handle.setVisible(true);
  assert.ok(v.islands.every(n=>n.visible===false));
 }finally{v.restore();}
});
test('illustration appears atomically after the full image texture loads',()=>{
 const v=setup(true);
 try{
  v.complete();
  assert.equal(v.handle.ready,true);
  assert.equal(v.root.children[0].visible,true);
  assert.equal(v.sky.visible,false);
  assert.ok(v.islands.every(n=>!n.visible));
  v.handle.setVisible(false);
  assert.equal(v.sky.visible,true,'dark sky returns if illustrated mode is disabled');
  assert.ok(v.islands.every(n=>!n.visible),'never reveal obsolete islands');
  v.handle.setVisible(true);
  assert.equal(v.sky.visible,false);
 }finally{v.restore();}
});
test('missing or failed scene image leaves window dark, never reveals obsolete islands',()=>{
 const v=setup(true);
 try{
  v.fail();
  assert.equal(v.handle.failed,true);
  assert.equal(v.handle.ready,false);
  assert.equal(v.root.children[0].visible,false);
  assert.equal(v.sky.visible,true);
  assert.ok(v.islands.every(n=>!n.visible));
 }finally{v.restore();}
});
test('previous review versions retain their original mode comparison and island fallback',()=>{
 const v=setup(false);
 try{
  assert.equal(v.root.children[0].visible,false);
  assert.ok(v.islands.every(n=>n.visible));
  v.complete();
  assert.ok(v.islands.every(n=>!n.visible));
  v.handle.setVisible(false);
  assert.ok(v.islands.every(n=>n.visible),'comparison controls restore original scene');
 }finally{v.restore();}
});
test('canonical scene pre-hides BOTH procedural fallback and furniture GLB before insertion',()=>{
 const room=source('prototypes/dh-11c-room/room.js');
 for(const required of [
  "const darkWindowPreload=minimalUI&&document.body.dataset.darkWindowPreload==='true'",
  "if(!darkWindowPreload)for(let i=0;i<3;i++){",
  "color:'#111827',side:THREE.DoubleSide",
  "get('window_sky').material=new THREE.MeshBasicMaterial({",
  "islands.forEach(island=>{island.visible=false;});",
  "hideLegacyWhileLoading:darkWindowPreload",
  "console.warn(darkWindowPreload",
  "scene.add(content);"
 ])assert.ok(room.includes(required),required);
 assert.ok(room.indexOf("islands.forEach(island=>{island.visible=false;});")<
  room.indexOf("scene.add(content);",room.indexOf("const islands=Array.from({length:3}")),
  'GLB islands must be suppressed before scene.add makes the new model visible');
});
test('only canonical Writing route enables dark preload with fresh module URLs',()=>{
 const html=canonical.render(source('prototypes/dh-11c-room/index.html'));
 for(const required of [
  'data-writing-world="true"',
  'data-minimal-ui="true"',
  'data-dark-window-preload="true"',
  'DH-11C.6A.2',
  'room.js?v=dh11c6a2-dark-window-v1',
  'window-illustration-v2.js?v=dh11c6a2-dark-window-v1'
 ])assert.ok(html.includes(required),required);
 const comparison=old.render(source('prototypes/dh-11c-room/index.html'));
 assert.ok(!comparison.includes('data-dark-window-preload'));
 assert.ok(!comparison.includes('dh11c6a2-dark-window-v1'));
 const state=JSON.parse(source('PROJECT_STATE.json'));
 const d=state.dh11_3d_production.illustratedViewPipeline.darkWindowPreload;
 assert.equal(d.stagingRoute,'/worlds/writing/');
 assert.equal(d.productionChanged,false);
});

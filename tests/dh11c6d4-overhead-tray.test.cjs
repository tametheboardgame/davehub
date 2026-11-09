'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const catalogueModule=require('../prototypes/dh-11c-room/cabinet-catalogue.js');
const books=require('../prototypes/dh-11c-room/finished-books.js');
const samples=require('../prototypes/dh-11c-room/manuscript-experience.js');
const trayModule=require('../prototypes/dh-11c-room/cabinet-tray.js');
const stage=require('../scripts/render-dh11c6d4-cabinet-tray.cjs');
const prior=require('../scripts/render-dh11c6d3-filing-cabinet.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalogue=catalogueModule.create({books,manuscripts:samples.MANUSCRIPTS});
function fakeDOM(){
 const ids=['archive-tray-dialog','archive-tray-close','archive-tray-peek','archive-tray-shut',
  'archive-tray-heading','archive-tray-count','archive-tray-well','archive-tray-lip-label','archive-tray-slots'];
 const nodes=new Map();
 const document={activeElement:null,createElement:tag=>make(tag),getElementById:id=>nodes.get(id)};
 function make(tag='div'){
  const listeners={},node={
   tagName:tag.toUpperCase(),children:[],dataset:{},style:{setProperty(k,v){this[k]=v;}},
   attributes:{},open:false,isConnected:true,disabled:false,hidden:false,
   textContent:'',className:'',
   setAttribute(k,v){this.attributes[k]=v;},
   append(...children){this.children.push(...children);},
   replaceChildren(...children){this.children=[...children];},
   addEventListener(k,fn){(listeners[k]??=[]).push(fn);},
   dispatch(k,event={}){for(const fn of listeners[k]||[])fn({target:this,...event});},
   querySelector(selector){
    const match=n=>selector==='button[data-folder-slot]'&&n.tagName==='BUTTON'&&
     n.dataset.folderSlot!==undefined;
    const search=n=>{
     for(const child of n.children){if(match(child))return child;const result=search(child);if(result)return result;}
     return null;
    };return search(this);
   },
   showModal(){this.open=true;},
   close(){this.open=false;this.dispatch('close');},
   focus(){document.activeElement=this;}
  };
  return node;
 }
 for(const id of ids)nodes.set(id,make(id.includes('dialog')?'dialog':'div'));
 return {document,nodes};
}
test('staging-only renderer adds the overhead inspection without changing older previews or replacing real room',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=stage.render(source),old=prior.render(source);
 assert.equal(stage.VERSION,'dh11c6d4-overhead-tray-v1');
 for(const text of ['DH-11C.6D.4','data-cabinet-tray="true"',
  'room.js?v='+stage.VERSION,'cabinet-tray.js?v='+stage.VERSION,
  'cabinet-tray.css?v='+stage.VERSION,'archive-tray-dialog',
  'archive-tray-well','archive-tray-slots','archive-tray-peek','archive-tray-shut',
  'archive-folder-dialog','published-book-dialog','workshop-dialog','data-motion-first="true"'])
  assert.ok(html.includes(text),text);
 assert.equal(old.includes('data-cabinet-tray'),false);
 assert.equal(source.includes('archive-tray-dialog'),false);
});
test('all five drawers show their own big selectable folders, independent of the 3D camera angle',()=>{
 const {document,nodes}=fakeDOM();
 const original=document.createElement('button');original.focus();
 const selected=[],shut=[];
 const tray=trayModule.mount({document,catalogue,
  onSelect:(d,i)=>selected.push([d,i]),onCloseDrawer:d=>shut.push(d)});
 assert.equal(trayModule.COUNT,4);
 for(let drawer=0;drawer<5;drawer++){
  assert.equal(tray.show(drawer),true);
  assert.equal(tray.opened,true);
  assert.equal(tray.drawer,drawer);
  assert.equal(nodes.get('archive-tray-heading').textContent,catalogue.DRAWERS[drawer].label);
  assert.equal(nodes.get('archive-tray-well').style['--drawer-file-colour'],catalogue.DRAWERS[drawer].colour);
  const slots=nodes.get('archive-tray-slots').children;
  assert.equal(slots.length,4);
  const filled=slots.filter(slot=>slot.children[0].tagName==='BUTTON');
  assert.equal(filled.length,catalogue.inDrawer(drawer).length);
  for(const slot of filled){
   const button=slot.children[0],data=catalogue.at(drawer,Number(button.dataset.folderSlot));
   assert.ok(button.attributes['aria-label'].includes(data.title));
   assert.ok(button.children.some(node=>node.textContent===data.title));
   assert.ok(button.children.some(node=>node.textContent===data.tab));
  }
  const empty=slots.filter(slot=>slot.children[0].tagName!=='BUTTON');
  assert.equal(empty.length,4-filled.length);
  assert.ok(empty.every(slot=>slot.children[0].children[1].textContent.includes('Nothing approved')));
  assert.equal(document.activeElement,filled[0].children[0]);
  // Selection is from the overhead tray, NOT a tiny physical folder hit.
  filled.at(-1).children[0].dispatch('click');
  assert.equal(tray.opened,false);
  assert.deepEqual(selected.at(-1),[drawer,Number(filled.at(-1).children[0].dataset.folderSlot)]);
 }
 assert.equal(shut.length,0);
});
test('top-down drawer supports separate look-at-3D and physically-close actions plus Escape/backdrop',()=>{
 const {document,nodes}=fakeDOM(),calls=[];
 const tray=trayModule.mount({document,catalogue,
  onSelect:()=>calls.push('select'),onCloseDrawer:d=>calls.push(d)});
 assert.equal(tray.show(0),true);
 nodes.get('archive-tray-peek').dispatch('click');
 assert.equal(tray.opened,false);
 assert.deepEqual(calls,[]);
 assert.equal(tray.show(4),true);
 nodes.get('archive-tray-shut').dispatch('click');
 assert.equal(tray.opened,false);
 assert.deepEqual(calls,[4]);
 assert.equal(tray.show(2),true);
 nodes.get('archive-tray-dialog').dispatch('click');
 assert.equal(tray.opened,false);
 assert.equal(tray.show(1),true);
 nodes.get('archive-tray-dialog').close(); // browser's native Escape close event
 assert.equal(tray.opened,false);
 assert.equal(tray.drawer,null);
 assert.equal(tray.show(8),false);
});
test('drawer inspection is gated on the REAL drawer, CAMERA position, aim, return motion and settled hold',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 const start=room.indexOf('function revealCabinetDrawerAfterMotion(){');
 const end=room.indexOf('// The folder opens only after the real drawer',start);
 assert.ok(start>=0&&end>start);
 const code=room.slice(start,end);
 const run=overrides=>{
  const opened=[];
  const drawer=overrides?.drawer??0;
  const data={
   pendingDrawerReveal:{drawer,returnFolder:null,settledAt:null},
   cabinetTrayEnabled:true,renderer:true,
   state:{focus:'cabinet',drawer},
   cabinetDrawers:Array.from({length:5},()=>({position:{z:.65}})),
   drawerHome:Array(5).fill(0),
   cabinetFolders:{attached:true,settled:()=>true},
   camera:{position:{distanceTo:()=>0}},
   focusPoint:{distanceTo:()=>0},
   desiredPosition:{},desiredTarget:{},
   glbProof:false,glbExtension:1,
   cabinetExperience:{opened:false},
   clock:{elapsedTime:0},
   reduced:{matches:false},
   REVEAL_HOLD_SECONDS:.18,
   cabinetTray:{show:at=>opened.push(at)}
  };
  Object.assign(data,overrides||{});
  const fn=vm.runInNewContext(code+'\nrevealCabinetDrawerAfterMotion',data,{timeout:500});
  fn();
  return {fn,data,opened};
 };
 for(let i=0;i<5;i++){
  const {fn,data,opened}=run({drawer:i});
  assert.deepEqual(opened,[]);
  assert.equal(data.pendingDrawerReveal.settledAt,0);
  data.clock.elapsedTime=.20;fn();
  assert.deepEqual(opened,[i]);assert.equal(data.pendingDrawerReveal,null);
 }
 const blocked=run({drawer:0,
  cabinetDrawers:Array.from({length:5},()=>({position:{z:.3}}))});
 assert.equal(blocked.data.pendingDrawerReveal.settledAt,null);
 assert.deepEqual(blocked.opened,[]);
 const camera=run({camera:{position:{distanceTo:()=>.6}}});
 assert.deepEqual(camera.opened,[]);
 const returning=run({pendingDrawerReveal:{drawer:0,returnFolder:2,settledAt:null},
  cabinetFolders:{attached:true,settled:()=>false}});
 assert.deepEqual(returning.opened,[]);
 const cancelled=run({state:{focus:'bookcase',drawer:0}});
 assert.equal(cancelled.data.pendingDrawerReveal,null);
});
test('scene always chooses drawer first; individual 3D folder raycasting is optional in the older mode only',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const token of [
  "const cabinetTrayEnabled=cabinetArchiveEnabled&&document.body.dataset.cabinetTray==='true'",
  "if(cabinetTrayEnabled&&state.drawer===index)queueCabinetDrawerReveal(index)",
  "if(cabinetTrayEnabled)queueCabinetDrawerReveal(drawerIndex)",
  "else selectCabinetFolder(drawerIndex,folderIndex)",
  "onSelect:(drawer,index)=>selectCabinetFolder(drawer,index)",
  "onCloseDrawer:drawer=>{",
  "pendingDrawerReveal={drawer,returnFolder,settledAt:null}",
  "queueCabinetDrawerReveal(previous.drawer,previous.index)",
  "cabinetFolders.settled(pending.drawer,pending.returnFolder)",
  "cabinetTray.show(pending.drawer)",
  "revealCabinetDrawerAfterMotion();",
  "if(cabinetTray?.opened)cabinetTray.hide()"
 ])assert.ok(room.includes(token),token);
 assert.ok(room.includes("if(cabinetTrayEnabled&&!cabinetTray)"));
 assert.ok(!room.slice(room.indexOf('function revealCabinetDrawerAfterMotion(){'),
  room.indexOf('// The folder opens only after')).includes('setTimeout'));
});
test('old folder detail suppresses focus on a hidden tray button when restoring overhead view',()=>{
 const code=read('prototypes/dh-11c-room/cabinet-experience.js');
 assert.ok(code.includes('const shouldRestore=onClose();'));
 assert.ok(code.includes('shouldRestore!==false'));
});
test('build and hosted smoke require correct version, real JS and CSS instead of HTML fallbacks',()=>{
 const build=read('scripts/build-pages.sh'),smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const token of [
  'tests/dh11c6d4-overhead-tray.test.cjs',
  'node scripts/render-dh11c6d4-cabinet-tray.cjs dist/worlds/writing',
  'prototypes/dh-11c-room/cabinet-tray.js',
  'prototypes/dh-11c-room/cabinet-tray.css',
  "check('dist/worlds/writing/room/cabinet-tray.js'",
  'room.js?v=dh11c6e-wastepaper-v1'
 ])assert.ok(build.includes(token),token);
 for(const token of [
  'data-cabinet-tray="true"',
  'room.js?v=dh11c6e-wastepaper-v1',
  '/worlds/writing/room/cabinet-tray.js',
  '/worlds/writing/scene/cabinet-tray.css'
 ])assert.ok(smoke.includes(token),token);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const discarded=require('../prototypes/dh-11c-room/discarded-ideas.js');
const renderer=require('../scripts/render-dh11c6e-wastepaper-bin.cjs');
const prior=require('../scripts/render-dh11c6d4-cabinet-tray.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function fakeDOM(){
 const ids=['discarded-dialog','discarded-close','discarded-title','discarded-number',
  'discarded-stamp','discarded-text','discarded-reverse','discarded-reverse-label',
  'discarded-folded','discarded-sheet','discarded-unfold','discarded-flip',
  'discarded-feedback','discarded-leave','discarded-return'];
 const nodes=new Map();
 const document={activeElement:null,getElementById:id=>nodes.get(id),
  createElement:tag=>make(tag)};
 function make(tag='div'){
  const listeners={};
  return {
   tagName:tag.toUpperCase(),textContent:'',children:[],isConnected:true,
   dataset:{},style:{setProperty(k,v){this[k]=v;}},attributes:{},open:false,hidden:false,
   addEventListener(name,fn){(listeners[name]??=[]).push(fn);},
   dispatch(name,event={}){for(const callback of listeners[name]||[])callback({target:this,...event});},
   replaceChildren(...children){this.children=children;},
   setAttribute(key,value){this.attributes[key]=value;},
   focus(){document.activeElement=this;},
   showModal(){this.open=true;},
   close(){this.open=false;this.dispatch('close');}
  };
 }
 for(const id of ids)nodes.set(id,make(id==='discarded-dialog'?'dialog':'div'));
 return {document,nodes};
}
test('nine distinct fictional scraps are public-safe, index-specific and reversible',()=>{
 assert.equal(discarded.ITEMS.length,9);
 assert.equal(new Set(discarded.ITEMS.map(x=>x.id)).size,9);
 assert.equal(new Set(discarded.ITEMS.map(x=>x.title)).size,9);
 for(let i=0;i<9;i++){
  const item=discarded.get(i);
  assert.equal(item.kind,'Fictional demonstration');
  assert.ok(item.id.startsWith('demo-'));
  assert.equal(item.lines.length,2);
  assert.ok(item.lines.every(line=>line.length>30));
  assert.ok(item.reverse.length>25);
  assert.ok(/^#[0-9a-f]{6}$/i.test(item.ink));
 }
 for(const invalid of [null,-1,9,9.1,NaN,'1'])
  assert.equal(discarded.get(invalid),null);
 assert.ok(Object.isFrozen(discarded.ITEMS));
 assert.ok(Object.isFrozen(discarded.ITEMS[0].lines));
});
test('an actual recovered paper opens crumpled, unfolds, turns both ways and leaves its 3D ball out',()=>{
 const {document,nodes}=fakeDOM(),returned=[];
 const invoker=document.createElement('button');invoker.focus();
 const ui=discarded.mount({document,onReturnToBin:index=>returned.push(index)});
 for(let i=0;i<9;i++){
  assert.equal(ui.show(i),true);
  assert.equal(ui.current,i);
  assert.equal(ui.opened,true);
  assert.equal(nodes.get('discarded-title').textContent,discarded.get(i).title);
  assert.equal(nodes.get('discarded-number').textContent,'RECOVERED SCRAP '+String(i+1).padStart(2,'0')+' / 09');
  assert.ok(nodes.get('discarded-feedback').textContent.includes('fictional'));
  assert.equal(nodes.get('discarded-folded').hidden,false);
  assert.equal(nodes.get('discarded-sheet').hidden,true);
  assert.equal(nodes.get('discarded-unfold').hidden,false);
  assert.equal(nodes.get('discarded-flip').hidden,true);
  assert.equal(document.activeElement,nodes.get('discarded-unfold'));
  nodes.get('discarded-unfold').dispatch('click');
  assert.equal(nodes.get('discarded-sheet').hidden,false);
  assert.equal(nodes.get('discarded-flip').hidden,false);
  assert.equal(nodes.get('discarded-reverse').hidden,true);
  assert.equal(nodes.get('discarded-text').children.length,2);
  nodes.get('discarded-flip').dispatch('click');
  assert.equal(ui.side,'back');
  assert.equal(nodes.get('discarded-reverse').hidden,false);
  assert.equal(nodes.get('discarded-reverse-label').hidden,false);
  assert.equal(nodes.get('discarded-text').hidden,true);
  assert.equal(nodes.get('discarded-reverse').textContent,discarded.get(i).reverse);
  nodes.get('discarded-flip').dispatch('click');
  assert.equal(ui.side,'front');
  assert.equal(nodes.get('discarded-text').hidden,false);
  nodes.get('discarded-leave').dispatch('click');
  assert.equal(ui.opened,false);
  assert.equal(ui.current,null);
  assert.equal(document.activeElement,invoker);
 }
 assert.deepEqual(returned,[],'dismissing/escaping never reverses the physical paper without instruction');
});
test('the explicit crumple action returns only its actual 3D scrap, while Escape merely closes',()=>{
 const {document,nodes}=fakeDOM(),returned=[];
 const ui=discarded.mount({document,onReturnToBin:index=>returned.push(index)});
 assert.equal(ui.show(-1),false);
 assert.equal(ui.show(8),true);
 nodes.get('discarded-return').dispatch('click');
 assert.deepEqual(returned,[8]);assert.equal(ui.opened,false);
 assert.equal(ui.show(7),true);
 nodes.get('discarded-dialog').close(); // native Escape/cancel resolution
 assert.equal(ui.opened,false);
 assert.deepEqual(returned,[8]);
 assert.equal(ui.show(4),true);
 nodes.get('discarded-dialog').dispatch('click'); // outside-paper backdrop
 assert.equal(ui.opened,false);
 assert.deepEqual(returned,[8]);
});
test('reader supports keyboard page turning and resets to front each time',()=>{
 const {document,nodes}=fakeDOM();
 const ui=discarded.mount({document});
 ui.show(3);
 nodes.get('discarded-unfold').dispatch('click');
 const dialog=nodes.get('discarded-dialog');
 dialog.dispatch('keydown',{key:'ArrowRight',preventDefault(){}});
 assert.equal(ui.side,'back');
 dialog.dispatch('keydown',{key:'ArrowLeft',preventDefault(){}});
 assert.equal(ui.side,'front');
 ui.dismiss();ui.show(2);
 assert.equal(ui.side,'front');
 assert.equal(nodes.get('discarded-sheet').hidden,true);
});
test('bin reader waits for the REAL tossed mesh to land plus camera settle and completed-pose hold',()=>{
 const source=read('prototypes/dh-11c-room/room.js');
 const start=source.indexOf('function revealDiscardedIdeaAfterMotion(){');
 const end=source.indexOf('function revealCabinetDrawerAfterMotion(){',start);
 assert.ok(start>=0&&end>start);
 const code=source.slice(start,end);
 const run=overrides=>{
  const opened=[];
  const ix=overrides?.index??0;
  const data={
   pendingBinReveal:{index:ix,settledAt:null},
   discardedIdeasEnabled:true,renderer:true,
   state:{focus:'bin',binPapers:Array(9).fill(true)},
   binPaperHomes:Array.from({length:9},()=>({x:0,y:1,z:0})),
   binPaperProgress:Array(9).fill(1),
   binPapers:Array.from({length:9},()=>({position:{x:.4,y:.15,z:.5}})),
   binPaperPose:()=>({x:.4,y:.15,z:.5}),
   camera:{position:{distanceTo:()=>0}},
   focusPoint:{distanceTo:()=>0},
   desiredPosition:{},desiredTarget:{},
   clock:{elapsedTime:0},
   reduced:{matches:false},
   REVEAL_HOLD_SECONDS:.18,
   discardedIdeas:{show:index=>opened.push(index)}
  };
  Object.assign(data,overrides);
  const fn=vm.runInNewContext(code+'\nrevealDiscardedIdeaAfterMotion',data,{timeout:500});
  fn();return {fn,data,opened};
 };
 for(let ix=0;ix<9;ix++){
  const {fn,data,opened}=run({index:ix});
  assert.deepEqual(opened,[]);
  assert.equal(data.pendingBinReveal.settledAt,0);
  data.clock.elapsedTime=.19;fn();
  assert.deepEqual(opened,[ix]);
  assert.equal(data.pendingBinReveal,null);
 }
 const flying=run({binPaperProgress:Array(9).fill(.75)});
 assert.deepEqual(flying.opened,[]);
 const notAtGoal=run({binPapers:Array.from({length:9},()=>({position:{x:8,y:8,z:8}}))});
 assert.deepEqual(notAtGoal.opened,[]);
 const camera=run({camera:{position:{distanceTo:()=>.8}}});
 assert.deepEqual(camera.opened,[]);
 const aim=run({focusPoint:{distanceTo:()=>.8}});
 assert.deepEqual(aim.opened,[]);
 const reversed=run({state:{focus:'bin',binPapers:Array(9).fill(false)}});
 assert.equal(reversed.data.pendingBinReveal,null);
 const away=run({state:{focus:'desk',binPapers:Array(9).fill(true)}});
 assert.equal(away.data.pendingBinReveal,null);
 const reduced=run({reduced:{matches:true}});
 assert.deepEqual(reduced.opened,[0]);
});
test('the existing nine GLB tosses remain authoritative, cancellable and independently indexed',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 const motion=read('prototypes/dh-11c-room/furniture-motion.mjs');
 for(const part of [
  "const discardedIdeasEnabled=motionFirst&&document.body.dataset.discardedIdeas==='true'",
  "onReturnToBin:index=>{",
  "if(state.focus==='bin'&&state.binPapers[index])toggleBinPaper(index)",
  "binPaperProgress[i]=target>binPaperProgress[i]",
  "const pose=binPaperPose(binPaperHomes[i],i,binPaperProgress[i])",
  "binPapers[i].position.set(pose.x,pose.y,pose.z)",
  "binPapers[i].rotation.set(pose.rx,pose.ry,pose.rz)",
  "if(state.binPapers[index])queueBinReveal(index)",
  "else if(pendingBinReveal?.index===index)pendingBinReveal=null",
  "if(discardedIdeas?.opened)discardedIdeas.dismiss()",
  "if(discardedIdeasEnabled)rummageNextScrap()",
  "reread.dataset.binReadIndex=String(i)",
  "pendingBinReveal=null",
  "revealDiscardedIdeaAfterMotion();"
 ])assert.ok(room.includes(part),part);
 assert.ok(motion.includes('export const BIN_PAPER_FLOOR=Object.freeze(['));
 assert.ok(motion.includes('export function binPaperPose(home,index,progress)'));
 const portion=room.slice(room.indexOf('function revealDiscardedIdeaAfterMotion(){'),
  room.indexOf('function revealCabinetDrawerAfterMotion(){'));
 assert.ok(!portion.includes('setTimeout'));
 assert.ok(!portion.includes('setInterval'));
});
test('staging-only writer composes all previous experiences without changing older previews',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=renderer.render(source),old=prior.render(source);
 assert.equal(renderer.VERSION,'dh11c6e-wastepaper-v1');
 for(const part of ['DH-11C.6E','data-discarded-ideas="true"',
  'room.js?v='+renderer.VERSION,
  'discarded-ideas.js?v='+renderer.VERSION,
  'discarded-ideas.css?v='+renderer.VERSION,
  'discarded-dialog','discarded-unfold','discarded-flip','discarded-reverse',
  'archive-tray-dialog','archive-folder-dialog','workshop-dialog','manuscript-dialog',
  'published-book-dialog','data-motion-first="true"'])
  assert.ok(html.includes(part),part);
 assert.ok(!old.includes('data-discarded-ideas'));
 assert.ok(!source.includes('discarded-dialog'));
});
test('build and hosted smoke reject absent discarded-idea assets and stale HTML',()=>{
 const build=read('scripts/build-pages.sh'),smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const part of [
  'tests/dh11c6e-wastepaper.test.cjs',
  'node scripts/render-dh11c6e-wastepaper-bin.cjs dist/worlds/writing',
  "check('dist/worlds/writing/room/discarded-ideas.js'",
  "check('dist/worlds/writing/scene/discarded-ideas.css'",
  'room.js?v=dh11c6e-wastepaper-v1'
 ])assert.ok(build.includes(part),part);
 for(const part of [
  'DH-11C.6E',
  'data-discarded-ideas="true"',
  '/worlds/writing/room/discarded-ideas.js',
  '/worlds/writing/scene/discarded-ideas.css'
 ])assert.ok(smoke.includes(part),part);
 const css=read('prototypes/dh-11c-room/discarded-ideas.css');
 for(const part of ['.discarded-crumple','.discarded-sheet','@keyframes discarded-unfold',
  '@media(max-width:650px)','@media(prefers-reduced-motion:reduce)',
  '[hidden]{display:none!important}'])
  assert.ok(css.includes(part),part);
});

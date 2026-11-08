'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const room=fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/room.js'),'utf8');
const start=room.indexOf("canvas.addEventListener('pointerup',event=>{");
const end=room.indexOf("\n});\nfunction resize()",start);
assert.ok(start>=0&&end>start,'the actual Three.js canvas pointer handler must be tested');
const handler=room.slice(start,end+4);
function exercise({focus='cabinet',minimal=true,pick=null,drag=0}={}){
 const calls={home:0,focus:[],pick:0},state={focus};
 let callback;
 const sandbox={
  canvas:{addEventListener(type,fn){assert.equal(type,'pointerup');callback=fn;}},
  pointerStart:{x:100,y:100},
  pickFromEvent(){calls.pick++;return pick;},
  minimalUI:minimal,
  state,
  home(){calls.home++;state.focus=null;},
  focus(id){calls.focus.push(id);state.focus=id;},
  Math
 };
 vm.runInNewContext(handler,sandbox,{timeout:500});
 callback({clientX:100+drag,clientY:100});
 return {calls,state,pointerStart:sandbox.pointerStart};
}
test('clicking an empty wall or floor after focusing a cabinet returns to the whole room',()=>{
 const result=exercise();
 assert.equal(result.calls.home,1);
 assert.equal(result.state.focus,null);
 assert.equal(result.calls.pick,1);
 assert.equal(result.pointerStart,null);
});
test('empty scenery never resets the already-wide whole-room view',()=>{
 const result=exercise({focus:null});
 assert.equal(result.calls.home,0);
 assert.equal(result.calls.pick,1);
});
test('earlier 3D comparison pages preserve their original empty-scene behaviour',()=>{
 const result=exercise({minimal:false});
 assert.equal(result.calls.home,0);
 assert.equal(result.state.focus,'cabinet');
});
test('a deliberate drag, swipe or touch move is not interpreted as an empty-scene click',()=>{
 const result=exercise({drag:21});
 assert.equal(result.calls.home,0);
 assert.equal(result.calls.pick,0);
 assert.equal(result.state.focus,'cabinet');
});
test('tapping an interactive object never resets the camera',()=>{
 const same=exercise({pick:{id:'cabinet',drawerIndex:null}});
 assert.equal(same.calls.home,0);
 assert.equal(same.state.focus,'cabinet');
 const next=exercise({pick:{id:'window'}});
 assert.equal(next.calls.home,0);
 assert.deepEqual(next.calls.focus,['window']);
 assert.equal(next.state.focus,'window');
});
test('real door, paper, book, bin and typing pointer interactions are still present',()=>{
 for(const anchor of [
  "else if(id==='door'&&exitDoorProof)activateExitDoor()",
  "else if(id==='desk'&&paperIndex!==null)togglePaper(paperIndex)",
  "if(id==='bookcase'&&bookIndex!==null)toggleBook(bookIndex)",
  "if(id==='bin'&&binPaperIndex!==null)toggleBinPaper(binPaperIndex)",
  "else if(id==='typewriter')pressTypewriter(keyIndex)",
  "if(id==='cabinet'&&drawerIndex!==null)toggleCabinetDrawer(drawerIndex)",
  "if(!pointerStart||Math.hypot(pointerStart.x-event.clientX,pointerStart.y-event.clientY)>8)"
 ])assert.ok(handler.includes(anchor),anchor);
});
test('only the canonical Writing UI uses click-outside zoom, not previews or production',()=>{
 const pipeline=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../PROJECT_STATE.json'),'utf8'))
  .dh11_3d_production.illustratedViewPipeline;
 assert.equal(pipeline.emptySceneryReturn.stagingRoute,'/worlds/writing/');
 assert.equal(pipeline.emptySceneryReturn.productionChanged,false);
 assert.equal(pipeline.emptySceneryReturn.olderPreviewsChanged,false);
 assert.ok(room.includes('if(minimalUI&&state.focus)home();'));
});

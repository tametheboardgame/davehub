'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
const manifest=require('../prototypes/dh-11c-room/furniture-asset.js');
const {build}=require('../scripts/build-dh11c4f-furniture-glb.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../'+p),'utf8');

test('first paper action makes an obvious physical move and all ten presses affect ten sheets',async()=>{
 const {paperPose,PAPER_LIMIT}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 assert.equal(PAPER_LIMIT,10);
 const start={x:-1.76,y:1.41,z:-.66,yaw:-.22,tilt:0};
 assert.deepEqual(paperPose(start,0,0),start);
 const moved=paperPose(start,0,1);
 assert.ok(Math.abs(moved.x-start.x)>=.25,'first sheet must slide visibly');
 assert.ok(moved.y-start.y>=.07,'first sheet must lift visibly');
 assert.ok(Math.abs(moved.yaw-start.yaw)>=.25,'first sheet must rotate visibly');
 assert.deepEqual(paperPose(start,1,1),start,'next sheet must remain in original place');
 for(let count=1;count<=10;count++){
  assert.notDeepEqual(paperPose(start,count-1,count),start,'press '+count+' moves a new sheet');
 }
 let state=plan.next(null,{type:'focus',id:'desk'});
 for(let i=0;i<10;i++)state=plan.next(state,{type:'paper'});
 assert.equal(state.paper,10);
 state=plan.next(state,{type:'paper'});
 assert.equal(state.paper,0,'eleventh press resets the paper arrangement instead of doing nothing');
 assert.deepEqual(paperPose(start,0,state.paper),start);
});
test('typewriter every press creates a new visible timed key movement and paper advance',async()=>{
 const {pressDepth,paperAdvance,typedKeyIndex,TYPE_KEY_COUNT}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 assert.equal(TYPE_KEY_COUNT,24);
 assert.equal(pressDepth(0,true),0);
 assert.ok(pressDepth(.22,true)>.06,'key must visibly travel');
 assert.equal(pressDepth(.56,true),0,'key must return for next strike');
 assert.equal(pressDepth(.22,false),0,'unselected keys remain still');
 assert.ok(pressDepth(.22,true,true)>.04,'reduced motion users retain a pressed key state');
 assert.equal(paperAdvance(0),0);
 assert.equal(paperAdvance(1),.006);
 assert.ok(paperAdvance(10)>.05,'paper advances clearly after several key presses');
 assert.equal(typedKeyIndex('typewriter_key_1_4'),12);
 assert.equal(typedKeyIndex('typewriter_key_2_7'),23);
 assert.equal(typedKeyIndex('typewriter_body'),null);
 assert.equal(typedKeyIndex('typewriter_key_3_2'),null);
 const nodes=new Set(build().json.nodes.map(n=>n.name));
 for(let row=0;row<3;row++)for(let key=0;key<8;key++)
  assert.ok(nodes.has('typewriter_key_'+row+'_'+key),'missing actual GLB key '+row+'/'+key);
 assert.ok(nodes.has('typewriter_paper'));
 assert.ok(nodes.has('typewriter_platen'));
});
test('exactly eight deliberate featured books exist physically in the GLB, matching the button cycle',async()=>{
 const {featuredBook,FEATURED_BOOK_COUNT}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 const selected=[];
 for(let shelf=0;shelf<4;shelf++)for(let b=0;b<20;b++)
  if(featuredBook(shelf,b))selected.push('book_'+shelf+'_'+String(b).padStart(2,'0'));
 assert.equal(selected.length,FEATURED_BOOK_COUNT);
 const nodes=new Set(build().json.nodes.map(n=>n.name));
 selected.forEach(name=>assert.ok(nodes.has(name)));
 let s=plan.next(null,{type:'focus',id:'bookcase'});
 for(let n=0;n<8;n++)s=plan.next(s,{type:'book'});
 assert.equal(s.book,0);
 const room=read('prototypes/dh-11c-room/room.js');
 assert.match(room,/featuredBook\(shelf,b\)/);
 assert.match(room,/Pull a featured book/);
 assert.doesNotMatch(room,/%11===0/);
});
test('source and Blender-mapped runtime each wire paper sheets, every key and platen',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of [
  "from './furniture-motion.mjs'","if(i<10)loosePapers.push(mesh)",
  "const papers=Array.from({length:10}","paperHomes=papers.map",
  "paperPose(home,i,state.paper)","const keys=Array.from({length:TYPE_KEY_COUNT}",
  "typeKeys.splice(0,typeKeys.length,...keys)","typeKeyHomes=keys.map",
  "typePaper=typeSheet","typePlaten=platen",
  "pressDepth(clock.elapsedTime-activePress.at","paperAdvance(state.typed)",
  "typedKeyIndex(mesh.name)","activePress={index:selected,at:clock.elapsedTime}",
  "movePaperStack()","pressTypewriter(keyIndex)"
 ])assert.ok(room.includes(marker),'missing animation wiring '+marker);
 assert.doesNotMatch(room,/\.1\*Math\.sin\(i\*1\.9\)/);
 assert.doesNotMatch(room,/state\.typed>0\?-.025:0/);
 const furnitureKeys=manifest.nodes.filter(n=>n.name.startsWith('typewriter_key_'));
 assert.equal(furnitureKeys.length,24);
 const p=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:room,encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
});

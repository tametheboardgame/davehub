'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
const manifest=require('../prototypes/dh-11c-room/furniture-asset.js');
const {build}=require('../scripts/build-dh11c4f-furniture-glb.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../'+p),'utf8');

test('all thirteen sheets are separately reversible, without a global paper cycle',async()=>{
 const {paperPose,paperIndexForMesh,PAPER_LIMIT,PAPER_END_POSITIONS}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 assert.equal(PAPER_LIMIT,13);
 assert.equal(plan.PAPER_COUNT,PAPER_LIMIT);
 assert.equal(PAPER_END_POSITIONS.length,PAPER_LIMIT);
 assert.equal(new Set(PAPER_END_POSITIONS.map(pos=>pos.join(','))).size,PAPER_LIMIT);
 for(let i=0;i<13;i++)assert.equal(paperIndexForMesh('desk_paper_'+String(i).padStart(2,'0')),i);
 for(const name of ['desk_surface','desk_paper_13','desk_paper_99','desk_paper_0','desk_paper_01_extra'])
  assert.equal(paperIndexForMesh(name),null);
 const home={x:.20,y:1.397,z:-.72,yaw:-.22,tilt:0};
 assert.deepEqual(paperPose(home,0,false),home);
 const moved=paperPose(home,0,true);
 assert.deepEqual([moved.x,moved.z],PAPER_END_POSITIONS[0]);
 assert.equal(moved.y,home.y);
 assert.equal(moved.yaw,home.yaw);
 assert.equal(moved.tilt,home.tilt);
 assert.deepEqual(paperPose(home,0,false),home);
 let state=plan.next(null,{type:'focus',id:'desk'});
 assert.equal(state.papers.length,13);
 assert.ok(state.papers.every(v=>v===false));
 state=plan.next(state,{type:'paper',index:8});
 assert.equal(state.papers[8],true);
 assert.equal(state.papers.filter(Boolean).length,1,'only clicked sheet changes state');
 state=plan.next(state,{type:'paper',index:1});
 assert.equal(state.papers.filter(Boolean).length,2);
 assert.equal(state.papers[8],true,'other papers remain in position');
 state=plan.next(state,{type:'paper',index:8});
 assert.equal(state.papers.filter(Boolean).length,1);
 assert.equal(state.papers[8],false,'second click returns exactly the clicked sheet');
 for(const index of [-1,13,1.5,null,undefined])
  assert.deepEqual(plan.next(state,{type:'paper',index}),state,'invalid index is ignored');
 const away=plan.next(state,{type:'focus',id:'door'});
 assert.deepEqual(plan.next(away,{type:'paper',index:1}),away);
});
test('all thirteen slide paths remain flat and clear of desk furniture, not just their endpoints',async()=>{
 const {paperPose,PAPER_END_POSITIONS}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 const desk=manifest.nodes.find(n=>n.name==='desk_surface');
 const top=desk.position[1]+desk.size[1]/2;
 const sheets=manifest.nodes.filter(n=>/^desk_paper_\d{2}$/.test(n.name)).sort((a,b)=>a.name.localeCompare(b.name));
 assert.equal(sheets.length,13);
 const obstacles=[
  {name:'document folder',xmin:-.98,xmax:-.12,zmin:-1.02,zmax:-.38},
  {name:'lamp foot',xmin:-1.95,xmax:-1.39,zmin:-.71,zmax:-.15},
  {name:'cup',xmin:-1.01,xmax:-.75,zmin:.44,zmax:.70},
  {name:'typewriter',xmin:.905,xmax:1.855,zmin:-.215,zmax:.335}
 ];
 const bounds=pose=>{
  const ex=(Math.abs(Math.cos(pose.yaw))*.49+Math.abs(Math.sin(pose.yaw))*.32)/2;
  const ez=(Math.abs(Math.sin(pose.yaw))*.49+Math.abs(Math.cos(pose.yaw))*.32)/2;
  return {xmin:pose.x-ex,xmax:pose.x+ex,zmin:pose.z-ez,zmax:pose.z+ez};
 };
 const intersects=(a,b)=>a.xmin<b.xmax&&a.xmax>b.xmin&&a.zmin<b.zmax&&a.zmax>b.zmin;
 for(let i=0;i<sheets.length;i++){
  const sheet=sheets[i],home={
   x:sheet.position[0],y:sheet.position[1],z:sheet.position[2],
   yaw:sheet.rotation[1],tilt:sheet.rotation[2]
  };
  const end=paperPose(home,i,true);
  assert.deepEqual([end.x,end.z],PAPER_END_POSITIONS[i]);
  assert.ok(Math.hypot(end.x-home.x,end.z-home.z)>=.45,'sheet '+i+' requires a visible slide');
  assert.deepEqual(paperPose(home,i,false),home,'sheet must return home');
  for(let step=0;step<=20;step++){
   const t=step/20;
   const pose={x:home.x+(end.x-home.x)*t,y:home.y,z:home.z+(end.z-home.z)*t,
    yaw:home.yaw,tilt:home.tilt};
   const clearance=pose.y-sheet.size[1]/2-top;
   assert.ok(clearance>=-.00001&&clearance<.006,'sheet '+i+' floats/clips: '+clearance);
   const rect=bounds(pose);
   assert.ok(rect.xmin>=-2.25&&rect.xmax<=2.25,'sheet '+i+' overhangs desk X');
   assert.ok(rect.zmin>=-1.075&&rect.zmax<=1.075,'sheet '+i+' overhangs desk Z: '+JSON.stringify({sheet:sheet.name,pose,rect,home,end,step}));
   for(const obstacle of obstacles)
    assert.ok(!intersects(rect,obstacle),'sheet '+i+' intersects '+obstacle.name+' on frame '+step);
  }
 }
 const room=read('prototypes/dh-11c-room/room.js');
 const source=read('prototypes/dh-11c-room/furniture-asset.js');
 for(const fragment of ['[.20,-.72],[.78,-.72],[1.36,-.72]','1.397+i*.00035']){
  assert.ok(room.includes(fragment),'procedural geometry mismatch '+fragment);
  assert.ok(source.includes(fragment),'GLB geometry mismatch '+fragment);
 }
});
test('typewriter every press creates a new visible timed key movement and paper advance',async()=>{
 const {pressDepth,paperAdvance,typewriterFeed,TYPE_PAPER_HEIGHT,TYPE_PLATEN_RADIUS,typedKeyIndex,TYPE_KEY_COUNT}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 assert.equal(TYPE_KEY_COUNT,24);
 assert.equal(pressDepth(0,true),0);
 assert.ok(pressDepth(.22,true)>.06,'key must visibly travel');
 assert.equal(pressDepth(.56,true),0,'key must return for next strike');
 assert.equal(pressDepth(.22,false),0,'unselected keys remain still');
 assert.ok(pressDepth(.22,true,true)>.04,'reduced motion users retain a pressed key state');
 assert.equal(paperAdvance(0),0);
 assert.equal(paperAdvance(1),.006);
 assert.ok(paperAdvance(10)>.05,'paper advances clearly after several key presses');
 // No visible gap at any intermediate frame: the physical bottom stays
 // at 0.68 - 0.58/2 = 0.39, even when the page gets longer.
 assert.equal(TYPE_PAPER_HEIGHT,.58);
 assert.equal(TYPE_PLATEN_RADIUS,.056);
 const paperBottom=.68-TYPE_PAPER_HEIGHT/2;
 for(const typed of [0,1,5,10,25,60]){
  const feed=typewriterFeed(typed);
  const travel=paperAdvance(typed);
  assert.ok(Math.abs(feed.scale-(1+travel/.58))<1e-12);
  assert.ok(Math.abs(feed.centreLift-travel/2)<1e-12);
  assert.ok(Math.abs(feed.rollerAngle-travel/.056)<1e-12);
  const top=.68+feed.centreLift+TYPE_PAPER_HEIGHT*feed.scale/2;
  const bottom=.68+feed.centreLift-TYPE_PAPER_HEIGHT*feed.scale/2;
  assert.ok(Math.abs(bottom-paperBottom)<1e-10,'paper bottom floats away at '+typed+' keys');
  assert.ok(Math.abs(top-(.68+TYPE_PAPER_HEIGHT/2+travel))<1e-10,'top must emerge from roller');
  for(const fraction of [.1,.4,.7]){
   const liveScale=1+(feed.scale-1)*fraction;
   const liveY=.68+(liveScale-1)*TYPE_PAPER_HEIGHT/2;
   assert.ok(Math.abs(liveY-liveScale*TYPE_PAPER_HEIGHT/2-paperBottom)<1e-10,
    'contact with platen must hold during easing, not just endpoints');
  }
 }
 assert.equal(typedKeyIndex('typewriter_key_1_4'),12);
 assert.equal(typedKeyIndex('typewriter_key_2_7'),23);
 assert.equal(typedKeyIndex('typewriter_body'),null);
 assert.equal(typedKeyIndex('typewriter_key_3_2'),null);
 const nodes=new Set(build().json.nodes.map(n=>n.name));
 for(let row=0;row<3;row++)for(let key=0;key<8;key++)
  assert.ok(nodes.has('typewriter_key_'+row+'_'+key),'missing actual GLB key '+row+'/'+key);
 assert.ok(nodes.has('typewriter_paper'));
 assert.ok(nodes.has('typewriter_platen'));
 assert.ok(nodes.has('typewriter_paper_rule'));
 const cylinder=manifest.nodes.find(n=>n.name==='typewriter_platen');
 const sheet=manifest.nodes.find(n=>n.name==='typewriter_paper');
 assert.deepEqual(cylinder.rotation,[0,0,Math.PI/2],'platen starts along X, not Y');
 assert.deepEqual(sheet.size,[.64,.58,.02],'sheet feeds upwards from a 58cm original height');
 // A 90° Z rotation maps the cylinder's local Y axis onto negative X.
 const axisAfterRestRotation=[-Math.sin(cylinder.rotation[2]),Math.cos(cylinder.rotation[2]),0];
 assert.ok(Math.abs(axisAfterRestRotation[0]+1)<1e-10);
 assert.ok(Math.abs(axisAfterRestRotation[1])<1e-10);
});
test('eight actual featured books each toggle independently, while the other seventy-two remain fixed',async()=>{
 const {featuredBook,featuredBookIndexForMesh,bookPosition,BOOK_PULL_DISTANCE,FEATURED_BOOK_COUNT}=await import('../prototypes/dh-11c-room/furniture-motion.mjs');
 assert.equal(FEATURED_BOOK_COUNT,8);
 assert.equal(plan.FEATURED_BOOK_COUNT,8);
 const selected=[];
 const nodes=new Map(build().json.nodes.map(n=>[n.name,n]));
 for(let shelf=0;shelf<4;shelf++)for(let b=0;b<20;b++){
  const name='book_'+shelf+'_'+String(b).padStart(2,'0');
  const index=featuredBookIndexForMesh(name);
  assert.ok(nodes.has(name),'all 80 books remain present in the GLB: '+name);
  if(featuredBook(shelf,b)){
   assert.equal(index,selected.length,'book ordering must match physical mesh order');
   selected.push(name);
  }else assert.equal(index,null,'ordinary book must not be interactive: '+name);
 }
 assert.deepEqual(selected,[
  'book_0_00','book_0_10','book_1_09','book_1_19',
  'book_2_08','book_2_18','book_3_07','book_3_17'
 ]);
 for(const malformed of ['book_4_09','book_0_20','book_0_0','book_0_10_spine','bookcase_body','typewriter_body','book_1_08'])
  assert.equal(featuredBookIndexForMesh(malformed),null,'invalid or ordinary mesh ignored: '+malformed);
 assert.equal(BOOK_PULL_DISTANCE,.37);
 assert.equal(bookPosition(.44,false),.44);
 assert.equal(bookPosition(.44,true),.81);
 let state=plan.next(null,{type:'focus',id:'bookcase'});
 assert.equal(state.books.length,8);
 assert.ok(state.books.every(pulled=>!pulled));
 state=plan.next(state,{type:'book',index:3});
 assert.deepEqual(state.books,[false,false,false,true,false,false,false,false]);
 state=plan.next(state,{type:'book',index:7});
 assert.deepEqual(state.books,[false,false,false,true,false,false,false,true],'two books stay out together');
 state=plan.next(state,{type:'book',index:3});
 assert.deepEqual(state.books,[false,false,false,false,false,false,false,true],'clicking the same book returns only it');
 for(const index of [-1,8,1.5,null,undefined])
  assert.deepEqual(plan.next(state,{type:'book',index}),state,'invalid book selection ignored');
 assert.deepEqual(plan.next(state,{type:'book'}),state,'bare bookcase click must not cycle a book');
 const elsewhere=plan.next(state,{type:'focus',id:'desk'});
 assert.deepEqual(plan.next(elsewhere,{type:'book',index:7}),elsewhere,'other furniture cannot pull books');
 const room=read('prototypes/dh-11c-room/room.js');
 assert.match(room,/featuredBook\(shelf,b\)/);
 assert.match(room,/bookIndex:id==='bookcase'/);
 assert.match(room,/toggleBook\(bookIndex\)/);
 assert.match(room,/bookPosition\(bookHome\[i\],state.books\[i\]\)/);
 assert.doesNotMatch(room,/i===state\.book/,'no global book cycle remains');
});
test('source and Blender-mapped runtime each wire paper sheets, every key and platen',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of [
  "from './furniture-motion.mjs'","if(i<PAPER_LIMIT)loosePapers.push(mesh)",
  "const papers=Array.from({length:PAPER_LIMIT}","paperHomes=papers.map",
  "paperPose(home,i,state.papers[i])","const keys=Array.from({length:TYPE_KEY_COUNT}",
  "typeKeys.splice(0,typeKeys.length,...keys)","typeKeyHomes=keys.map",
  "typePaper=typeSheet","typePlaten=platen",
  "pressDepth(clock.elapsedTime-activePress.at","typewriterFeed(state.typed)",
  "platenSpin.setFromAxisAngle(platenAxis,feed.rollerAngle)",
  "platenTarget.copy(typePlatenHome).multiply(platenSpin)",
  "typePlaten.quaternion.slerp(platenTarget,rate)",
  "typePaper.scale.y=THREE.MathUtils.lerp", "typePaper.position.y=typePaperHome+actualFeed/2",
  "typePaperRule.position.y=typePaperRuleHome+actualFeed",
  "typedKeyIndex(mesh.name)","paperIndexForMesh(mesh.name)","mesh.userData.paperIndex=i",
  "featuredBookIndexForMesh(mesh.name)","markFeaturedBook(mesh,i)","bookPosition(bookHome[i],state.books[i])",
  "activePress={index:selected,at:clock.elapsedTime}",
  "togglePaper(paperIndex)","toggleBook(bookIndex)","pressTypewriter(keyIndex)"
 ])assert.ok(room.includes(marker),'missing animation wiring '+marker);
 assert.doesNotMatch(room,/\.1\*Math\.sin\(i\*1\.9\)/);
 assert.doesNotMatch(room,/state\.typed>0\?-.025:0/);
 assert.doesNotMatch(room,/typePlaten\.rotation\.y=/,'platen must never yaw around the room Y axis');
 assert.doesNotMatch(room,/typePaperHome\+paperAdvance\(state\.typed\)/,'paper may not lift wholesale off the roller');
 for(const fragment of [
  "typePaperHomeScaleY=typePaper.scale.y", "typePaperRuleHome=typePaperRule.position.y",
  "typePaperHomeScaleY=typeSheet.scale.y", "typePaperRuleHome=typeRule.position.y",
  "typePlatenHome=typePlaten.quaternion.clone()","typePlatenHome=platen.quaternion.clone()"
 ])assert.ok(room.includes(fragment),'GLB and procedural rest transforms required: '+fragment);
 const furnitureKeys=manifest.nodes.filter(n=>n.name.startsWith('typewriter_key_'));
 assert.equal(furnitureKeys.length,24);
 const p=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:room,encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
});

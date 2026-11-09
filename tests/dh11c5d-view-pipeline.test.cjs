'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
const views=require('../prototypes/dh-11c-room/view-pipeline.js');
const {render}=require('../scripts/render-dh11c5d-views.cjs');
const source=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('5D.1 uses the exact existing room plan, with eight canonical cameras and two stable viewport projections',()=>{
 const c=views.contract(plan);
 assert.equal(c.version,'dh11c5d-geometry-guides-v1');
 assert.equal(c.views.length,8);
 assert.deepEqual(c.views.map(v=>v.id),['home',...plan.OBJECTS.map(v=>v.id)]);
 assert.deepEqual(c.views[0].position,plan.HOME.position);
 assert.deepEqual(c.views[0].target,plan.HOME.target);
 assert.equal(c.camera.desktopFov,51);assert.equal(c.camera.mobileFov,62);
 for(const view of c.views){
  const expected=view.id==='home'?plan.HOME:plan.find(view.id);
  assert.deepEqual(view.position,view.id==='home'?expected.position:expected.camera);
  assert.deepEqual(view.target,view.id==='home'?expected.target:expected.lookAt);
  for(const vp of ['desktop','mobile']){
   const projected=view.targets[vp];
   assert.equal(projected.anchors.length,7);
   assert.ok(projected.anchors.every(a=>typeof a.depth==='number'));
  }
 }
 const copy=views.contract(plan);
 assert.deepEqual(c,copy);
});
test('5D projection is camera-relative, depth-aware and does not invent hitboxes',()=>{
 const camera=[0,2,6],target=[0,2,0],vp={width:1600,height:900,fov:51};
 const centre=views.project(camera,target,[0,2,0],vp);
 assert.equal(centre.visible,true);assert.equal(centre.x,50);assert.equal(centre.y,50);
 const right=views.project(camera,target,[1,2,0],vp);
 const left=views.project(camera,target,[-1,2,0],vp);
 assert.ok(right.x>50);assert.ok(left.x<50);
 assert.ok(Math.abs(left.x+right.x-100)<.05);
 assert.equal(views.project(camera,target,[0,2,8],vp).visible,false);
 assert.equal(views.project(camera,target,[0,2,8],vp).x,null);
 assert.throws(()=>views.project(camera,camera,[0,2,1],vp),/identical camera/);
 assert.equal(views.fileName('desk','png'),'dh11c5d-desk-structural-guide.png');
 assert.throws(()=>views.fileName('unknown','png'),/Unknown canonical/);
});
test('5D state metadata and original room models remain independent of any illustrated plates',()=>{
 let s=plan.next(null,{type:'init'});s=plan.next(s,{type:'focus',id:'desk'});
 s=plan.next(s,{type:'lamp'});s=plan.next(s,{type:'paper',index:0});
 const summary=views.stateSummary(s);
 assert.equal(summary.focus,'desk');assert.equal(summary.lampOn,false);
 assert.deepEqual(summary.movedPapers,[0]);
 assert.deepEqual(summary.pulledBooks,[]);
 assert.equal(summary.typed,0);
 const text=source('prototypes/dh-11c-room/room.js');
 for(const token of ["document.body.dataset.illustratedViewProof==='true'",
  "window.DH11IllustratedViews",'camera.position.copy(desiredPosition)',
  'renderer.render(scene,camera)','canvas.toDataURL(\'image/png\')',
  "scene.getObjectByName('desk_root')","scene.getObjectByName('drawer_finished')",
  "lampButton.addEventListener('click',toggleLamp)",'toggleBook(bookIndex)',
  'toggleBinPaper(binPaperIndex)','togglePaper(paperIndex)',
  'drawerIndexForMesh(mesh,cabinetDrawers)'])assert.ok(text.includes(token),'Missing existing geometry/capture contract: '+token);
});
test('5D.2 isolated reference preview loads all existing real GLBs and explicitly labels references',()=>{
 const html=render(source('prototypes/dh-11c-room/index.html'));
 for(const marker of ['DH-11C.5D','data-illustrated-view-proof="true"',
  'room.js?v=dh11c5d-geometry-guides-v1','room-plan.js?v=dh11c5d-geometry-guides-v1',
  'view-pipeline.js?v=dh11c5d-geometry-guides-v1',
  'id="capture-view-guide"','id="export-view-guide"','id="view-guide-status"',
  'view-guides.css','NOT yet show a final painted illustration'])assert.ok(html.includes(marker),'Missing view reference marker: '+marker);
 assert.ok(html.indexOf('view-pipeline.js?v=')<html.indexOf('room.js?v='));
 const previous=require('../scripts/render-dh11c5c3-comic.cjs').render(source('prototypes/dh-11c-room/index.html'));
 assert.ok(!previous.includes('data-illustrated-view-proof="true"'));
 assert.ok(previous.includes('comic-storybook-style.js'));
 assert.ok(!source('prototypes/dh-11c-room/view-pipeline.js').includes('last-lightkeeper'));
});

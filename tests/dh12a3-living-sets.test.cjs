'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source='prototypes/dh-12a-listening-room/';
const scenery=import(pathToFileURL(path.join(root,source,'theatre-scenery.mjs')).href);
function fakeTheatre(){
 class Group{
  constructor(name=''){this.name=name;this.children=[];this.parent=null;this.position={
   x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z})}
  };this.rotation={x:0,y:0,z:0};this.isMesh=false;}
  add(o){this.children.push(o);o.parent=this;}
  traverse(fn){fn(this);for(const child of this.children)child.traverse(fn);}
  getObjectByName(name){if(this.name===name)return this;for(const child of this.children){
   const found=child.getObjectByName(name);if(found)return found;
  }return null;}
 }
 const THREE={Group};
 const mesh=(name,pos,parent)=>{const item=new Group(name);item.isMesh=true;
  item.position.set(...pos);parent.add(item);return item;};
 const material=colour=>({colour});
 const box=(name,sizes,pos,mat,parent)=>mesh(name,pos,parent);
 const cylinder=(name,rt,rb,h,pos,mat,parent)=>mesh(name,pos,parent);
 const torus=(name,r,t,pos,mat,parent)=>mesh(name,pos,parent);
 const sphere=(name,r,pos,mat,parent)=>mesh(name,pos,parent);
 const addLabel=(name)=>{const result=new Group('inscribed-'+name);result.isMesh=true;return result;};
 const revolve=new Group('stage-revolve'),scene=new Group('scene');
 for(const name of ['Songs','Shows','Characters'])revolve.add(new Group('physical-act-'+name));
 scene.add(revolve);
 return {THREE,revolve,scene,box,cylinder,torus,sphere,material,addLabel};
}
test('three distinct themed physical sets with original invented names, no real works',async()=>{
 const m=await scenery;
 assert.deepEqual(m.SET_SCENES.map(x=>x.name),['Songs','Shows','Characters']);
 assert.deepEqual(m.SET_SCENES.map(x=>x.title),[
  'The Clockwork Chorus','The Theatre Within','The Marionette Assembly'
 ]);
 assert.deepEqual(m.SET_SCENES.map(x=>x.id),['songs','shows','characters']);
 assert.ok(m.SET_SCENES.every(x=>x.description.length>45));
 for(const steps of [-1,0,1,2,3,4]){
  assert.equal(m.sceneForSteps(steps).name,m.SET_SCENES[((steps%3)+3)%3].name);
 }
});
test('set actions are reversible, exclusive and return without changing the revolving stage',async()=>{
 const m=await scenery;
 const empty=m.resetScenes();
 assert.deepEqual(empty,[false,false,false]);
 const song=m.toggleScene(empty,0);
 assert.deepEqual(song,[true,false,false]);
 assert.deepEqual(m.toggleScene(song,0),empty);
 assert.deepEqual(m.toggleScene(song,1),[false,true,false]);
 assert.deepEqual(m.toggleScene([false,true,false],2),[false,false,true]);
 assert.deepEqual(empty,[false,false,false],'immutable state transitions');
 for(const invalid of [-1,3,1.5])assert.throws(()=>m.toggleScene(empty,invalid),/Unknown physical/);
 assert.throws(()=>m.toggleScene([true],0),/three act/);
 const t=m.approachMotion(0,true,.04);
 assert.ok(t>0&&t<1);
 assert.ok(m.approachMotion(t,false,.04)<t);
});
test('all three stages gain actual 3D child mechanisms, with physical hinged pieces and central clickables',async()=>{
 const m=await scenery;
 const opts=fakeTheatre();
 const rig=m.mountLivingSets(opts);
 const songs=opts.revolve.getObjectByName('physical-act-Songs');
 const shows=opts.revolve.getObjectByName('physical-act-Shows');
 const characters=opts.revolve.getObjectByName('physical-act-Characters');
 const check=(parent,props)=>{for(const item of props){
  const found=parent.getObjectByName(item);
  assert.ok(found,'Missing authored 3D element '+item);
  assert.ok(found.parent,'Unparented real mesh '+item);
 }};
 check(songs,['clockwork-chorus','chorus-winding-wheel','real-chorus-gear',
  'clockwork-bird--1','clockwork-bird-1','articulated-wing','chorus-pipe-0']);
 check(shows,['nested-playhouse','painted-flat-hinge--1','painted-flat-hinge-1',
  'swinging-painted-flat','little-rising-skyline','tiny-theatre-building-0']);
 check(characters,['character-marionette-workshop','wooden-marionette--1',
  'wooden-marionette-1','articulated-puppet-arm','puppet-pivot-head',
  'head-string','marionette-crossbar'].filter(x=>x!=='articulated-puppet-arm'));
 check(opts.scene,['stage-fly-system','real-curtain-rope--1','theatre-footlight-0',
  'theatre-footlight-11','balcony-bracket-1','EVERY STAGE HIDES ANOTHER'].filter(x=>x!=='EVERY STAGE HIDES ANOTHER'));
 assert.ok(opts.scene.getObjectByName('inscribed-EVERY STAGE HIDES ANOTHER'));
 assert.ok(rig.selectables.length>=5);
 assert.ok(rig.selectables.every(x=>x.parent),'all clickable sets are real mesh descendants');
 assert.equal(songs.parent,opts.revolve);
 assert.equal(shows.parent,opts.revolve);
 assert.equal(characters.parent,opts.revolve);
 assert.equal(opts.scene.getObjectByName('stage-fly-system').parent,opts.scene,
  'static theatre fly system does not rotate with its miniature sets');
});
test('mechanical toggles animate real nodes and independently return to their resting positions',async()=>{
 const m=await scenery,opts=fakeTheatre(),rig=m.mountLivingSets(opts);
 const wheel=opts.revolve.getObjectByName('chorus-winding-wheel');
 const wing=opts.revolve.getObjectByName('articulated-wing');
 const flat=opts.revolve.getObjectByName('painted-flat-hinge-1');
 const skyline=opts.revolve.getObjectByName('little-rising-skyline');
 const puppet=opts.revolve.getObjectByName('wooden-marionette-1');
 const arm=puppet.getObjectByName('jointed-puppet-arm-1');
 const initialWheel=wheel.rotation.z;
 for(let i=0;i<40;i++)rig.update(.05,[true,false,false]);
 assert.ok(rig.progress[0]>.9);
 assert.ok(wheel.rotation.z>initialWheel+.5,'actual clockwork wheel turns');
 assert.ok(Math.abs(wing.rotation.z)>.2,'articulated wing moves, not an image');
 for(let i=0;i<40;i++)rig.update(.05,[false,true,false]);
 assert.ok(rig.progress[0]<.05);
 assert.ok(rig.progress[1]>.9);
 assert.ok(flat.rotation.y>.7,'real scenery hinges open');
 assert.ok(skyline.position.y>.95,'real skyline rises behind them');
 for(let i=0;i<40;i++)rig.update(.05,[false,false,true]);
 assert.ok(rig.progress[1]<.05);
 assert.ok(rig.progress[2]>.9);
 assert.ok(Math.abs(puppet.rotation.z)>.01);
 assert.ok(Math.abs(arm.rotation.z)>.06);
 for(let i=0;i<80;i++)rig.update(.05,[false,false,false]);
 assert.ok(rig.progress.every(x=>x<.01));
 assert.ok(Math.abs(flat.rotation.y)<.012,'flats settle shut');
 assert.ok(Math.abs(arm.rotation.z)<.025,'puppet returns to rest');
 assert.ok(Math.abs(skyline.position.y-.66)<.01,'skyline lowers to original physical position');
});
test('theatre keeps its original shared camera and adds a distinct mesh-click set interaction',()=>{
 const js=read(source+'theatre.mjs');
 for(const marker of [
  "from './theatre-scenery.mjs?v=dh12a3-living-sets-v1'",
  'const livingSets=mountLivingSets({',
  'const lightCues=SET_SCENES.map(entry=>new THREE.Color(entry.colour))',
  'for(const select of livingSets.selectables)',
  "if(node.isMesh)node.userData.theatreClick='set'",
  'function toggleCurrentSet()',
  "if(id==='set'){toggleCurrentSet();return;}",
  "if(id==='act'&&!state.curtainsOpen)apply('curtains')",
  "setButton.addEventListener('click',toggleCurrentSet)",
  "activeSets=toggleScene(activeSets,current)",
  "if(action==='act'||action==='reset')activeSets=resetScenes()",
  'livingSets.update(dt,activeSets)',
  'spotlight.color.lerp(lightCues[actIndex(state.stageSteps)]',
  "registerClick(revolve,'act')",
  "registerClick(deck,'record')",
  "if(picked)selectMechanism(picked)",
  "camera.position[axis]=smoothTowards(",
  "tonearm.rotation.y=smoothTowards("
 ])assert.ok(js.includes(marker),marker);
 assert.ok(!/new Audio\s*\(|\.play\s*\(|<audio/i.test(js));
});
test('theatre labels each miniature without publishing actual scripts, songs or recordings',()=>{
 const html=read(source+'index.html');
 for(const token of [
  'DH-12A.3',
  'data-living-sets="true"',
  'id="theatre-set"',
  'id="theatre-set-caption"',
  'id="theatre-set-description"',
  'Bring Songs to life',
  'aria-pressed="false"',
  'theatre.mjs?v=dh12a3-living-sets-v1',
  'theatre.css?v=dh12a3-living-sets-v1',
  'A musicals-only stage prototype. These miniature sets are fictional studies, not published productions.'
 ])assert.ok(html.includes(token),token);
 assert.ok(!/<audio|<iframe|autoplay|https?:\/\//i.test(html));
 const art=read(source+'theatre-scenery.mjs');
 for(const token of [
  'clockwork-chorus','nested-playhouse','character-marionette-workshop',
  'stage-fly-system','theatre-footlight','real-curtain-rope',
  'chime','hinge','puppet','revolve.getObjectByName'
 ].filter(x=>x!=='chime'))assert.ok(art.includes(token),token);
 assert.ok(!/\.png|\.jpg|\.webp|data:image\//i.test(art),'all stage details are genuine physical geometry');
 const css=read(source+'theatre.css');
 for(const token of ['.theatre-set-caption','.theatre-set-description','.theatre-set-action',
  '@media(max-width:700px)','@media(max-height:620px)','@media(prefers-reduced-motion:reduce)'])
  assert.ok(css.includes(token),token);
});
test('complete build and hosted checks require the real three-set geometry module',()=>{
 const build=read('scripts/build-pages.sh'),smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const token of [
  'tests/dh12a3-living-sets.test.cjs','theatre-scenery.mjs',
  'node --check prototypes/dh-12a-listening-room/theatre-scenery.mjs',
  "check('dist/previews/dh-12a/listening-room/theatre-scenery.mjs'",
  'DH-12A.3'
 ])assert.ok(build.includes(token),token);
 for(const token of [
  'DH-12A.3','dh12a3-living-sets-v1',
  '/previews/dh-12a/listening-room/theatre-scenery.mjs',
  '/previews/dh-12a/listening-room/theatre.mjs'
 ])assert.ok(smoke.includes(token),token);
 assert.ok(!build.includes('node scripts/render-dh12a-music-live'),'staging prototype only');
});

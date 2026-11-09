// DH-12A.3: three genuinely different miniature sets inside one revolving
// physical stage. All ornaments and kinetic parts are Three.js meshes.
// No recordings, scores, copyrighted symbols or unpublished project content.
import {STAGE_ACTS,actIndex,smoothTowards} from './theatre-mechanics.mjs?v=dh12a-blockout-v1';

export const SET_SCENES=Object.freeze([
 Object.freeze({
  id:'songs',name:'Songs',title:'The Clockwork Chorus',
  description:'Wind the tiny music-box birds. Their brass wheels and wings move, but no music plays.',
  colour:'#eab578'
 }),
 Object.freeze({
  id:'shows',name:'Shows',title:'The Theatre Within',
  description:'The miniature scenery flats swing apart and reveal a second stage tucked inside the first.',
  colour:'#9bb8ca'
 }),
 Object.freeze({
  id:'characters',name:'Characters',title:'The Marionette Assembly',
  description:'Pull the imaginary strings and the two jointed puppets take their bows.',
  colour:'#c9b899'
 })
]);
export function sceneForSteps(steps){return SET_SCENES[actIndex(steps)];}
export function toggleScene(previous,index){
 if(!Array.isArray(previous)||previous.length!==SET_SCENES.length)
  throw Error('The living stage requires three act states');
 if(!Number.isInteger(index)||index<0||index>=SET_SCENES.length)
  throw Error('Unknown physical set index');
 return previous.map((value,i)=>i===index?!value:false);
}
export function resetScenes(){return [false,false,false];}
export function approachMotion(from,target,dt,speed=4.2){
 return smoothTowards(from,target?1:0,dt,speed);
}
export function mountLivingSets({THREE,revolve,scene,box,cylinder,torus,sphere,material,addLabel}){
 if(!THREE||!revolve?.getObjectByName||!scene||!box||!cylinder||!torus||!sphere||!material||!addLabel)
  throw Error('Real revolving stage and mesh makers are required');
 const selectables=[];
 const rigs=[];
 const brass=material('#e8b76c',.34,.53);
 const warm=material('#e2c899',.64,.1);
 const midnight=material('#30324c',.72,.13);
 const mulberry=material('#743d63',.73,.12);
 const teal=material('#4b8185',.64,.12);
 const parchment=material('#eedab1',.82,.03);
 const pale=material('#c3a1be',.74,.05);
 const blue=material('#8cacc1',.67,.12);
 const dark=material('#443540',.74,.04);
 function group(name,parent,x=0,y=0,z=0){
  const node=new THREE.Group();
  node.name=name;node.position.set(x,y,z);parent.add(node);
  return node;
 }
 function mark(node){selectables.push(node);return node;}
 function rail(name,length,y,z,parent,mat=brass){
  return box(name,[length,.035,.035],[0,y,z],mat,parent);
 }
 function littleLabel(text,parent,x,y,z,w=.66){
  const plaque=addLabel(text,w);plaque.position.set(x,y,z);parent.add(plaque);return plaque;
 }
 // Each miniature replaces the generic feeling of an empty framed panel.
 // The legacy frame stays in the revolving platform, physically behind it.
 const songs=revolve.getObjectByName('physical-act-Songs');
 const shows=revolve.getObjectByName('physical-act-Shows');
 const characters=revolve.getObjectByName('physical-act-Characters');
 if(!songs||!shows||!characters)throw Error('Original three revolving set mounts missing');

 // 1. Songs: a working clockwork music box with three organ pipes, two
 // articulated songbirds, physical cogs and rotating star-ring. Silent.
 const chorus=group('clockwork-chorus',songs,0,0,.10);
 for(let i=0;i<5;i++){
  const height=.47+i%3*.23;
  cylinder('chorus-pipe-'+i,.057,.067,height,[(i-2)*.17,.55+height/2,-.10],i%2?brass:warm,chorus,10);
  torus('pipe-lip-'+i,.055,.013,[(i-2)*.17,.55+height,-.10],brass,chorus);
 }
 const orrery=mark(group('chorus-winding-wheel',chorus,0,1.16,.12));
 torus('real-chorus-gear',.39,.042,[0,0,.015],brass,orrery);
 torus('real-chorus-inner-ring',.26,.023,[0,0,.045],warm,orrery);
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9;
  box('chorus-gear-tooth-'+i,[.08,.13,.08],
   [Math.sin(a)*.43,Math.cos(a)*.43,0],brass,orrery).rotation.z=-a;
 }
 sphere('chorus-hub',.13,[0,0,.10],teal,orrery);
 const birdWings=[];
 for(const side of [-1,1]){
  const bird=group('clockwork-bird-'+side,orrery,side*.24,-.09,.15);
  sphere('bird-body',.12,[0,0,0],side<0?parchment:blue,bird);
  sphere('bird-head',.077,[side*.035,.15,.005],warm,bird);
  const beak=box('bird-beak',[.1,.034,.055],[side*.13,.14,.028],brass,bird);
  beak.rotation.z=side*.25;
  const wing=group('articulated-wing',bird,-side*.065,.025,.07);
  const feather=box('wing-feather',[.20,.07,.028],[-side*.085,0,0],side<0?mulberry:teal,wing);
  feather.rotation.z=side*.2;
  birdWings.push({wing,side});
 }
 littleLabel('SILENT SONGS',chorus,0,.31,.16,.80);
 for(let i=0;i<6;i++){
  const a=i*Math.PI*2/6;
  sphere('hanging-star-'+i,.035,
   [Math.sin(a)*.48,1.20+Math.cos(a)*.43,.14],brass,chorus);
 }

 // 2. Shows: an actual stage-within-a-stage. Two folding painted flats
 // pivot on distinct hinges, while a second skyline rises behind them.
 const playhouse=group('nested-playhouse',shows,0,0,.12);
 const showFlats=[];
 for(const side of [-1,1]){
  const hinge=mark(group('painted-flat-hinge-'+side,playhouse,side*.38,.92,.09));
  const flat=box('swinging-painted-flat',[.26,.91,.055],[-side*.13,0,.025],side<0?mulberry:blue,hinge);
  box('painted-flat-batten',[.031,.95,.09],[-side*.25,0,.042],brass,hinge);
  for(let i=0;i<3;i++){
   sphere('flat-painted-star-'+i,.025,
    [-side*(.07+.065*i),-.25+i*.24,.064],brass,hinge);
  }
  showFlats.push({hinge,side});
 }
 box('second-theatre-top',[.71,.09,.11],[0,1.55,-.08],brass,playhouse);
 box('second-theatre-left',[.085,1.10,.11],[-.38,1.01,-.08],brass,playhouse);
 box('second-theatre-right',[.085,1.10,.11],[.38,1.01,-.08],brass,playhouse);
 const skyline=group('little-rising-skyline',playhouse,0,.66,-.075);
 for(let i=0;i<5;i++){
  const h=.33+(i%3)*.115;
  box('tiny-theatre-building-'+i,[.12,h,.07],
   [(i-2)*.14,h/2,0],i%2?teal:midnight,skyline);
  sphere('little-window-'+i,.021,[(i-2)*.14,.22,.047],warm,skyline);
 }
 const mask=mark(group('masked-mini-proscenium',playhouse,0,1.66,.12));
 torus('mask-stage-crest',.30,.043,[0,0,0],brass,mask,Math.PI);
 sphere('comedy-mask',.10,[-.11,.04,.09],parchment,mask);
 sphere('tragedy-mask',.10,[.11,.04,.09],pale,mask);
 littleLabel('SHOWTIME',playhouse,0,.31,.20,.75);

 // 3. Characters: two real articulated marionettes. Two heads and four
 // independent arm joints bow and wave on strings attached to the rig.
 const workshop=group('character-marionette-workshop',characters,0,0,.14);
 const puppets=[];
 for(const side of [-1,1]){
  const puppet=mark(group('wooden-marionette-'+side,workshop,side*.25,.55,.11));
  const torso=box('puppet-torso',[.18,.37,.12],[0,.35,0],side<0?teal:mulberry,puppet);
  cylinder('puppet-neck',.032,.032,.10,[0,.60,0],brass,puppet,10);
  const head=group('puppet-pivot-head',puppet,0,.69,.02);
  sphere('puppet-wooden-face',.125,[0,0,0],side<0?parchment:pale,head);
  sphere('puppet-eye-one',.016,[-.048,.015,.119],dark,head);
  sphere('puppet-eye-two',.016,[.048,.015,.119],dark,head);
  const arms=[];
  for(const hand of [-1,1]){
   const arm=group('jointed-puppet-arm-'+hand,puppet,hand*.11,.49,0);
   const upper=box('articulated-forearm',[.065,.28,.075],[hand*.065,-.12,.025],brass,arm);
   upper.rotation.z=hand*.22;
   sphere('puppet-hand',.065,[hand*.12,-.29,.04],side<0?warm:blue,arm);
   // Each string belongs to the moving arm, not an unrelated 2D overlay.
   cylinder('hand-puppet-string',.007,.007,.40,[hand*.10,.15,-.012],warm,arm,6);
   arms.push({arm,hand});
  }
  for(const leg of [-1,1]){
   const limb=box('separate-puppet-leg',[.064,.28,.09],
    [leg*.062,.035,.015],brass,puppet);
   limb.rotation.z=leg*.20;
  }
  cylinder('head-string',.008,.008,.40,[0,.99,.01],warm,puppet,6);
  box('marionette-crossbar',[.40,.035,.035],[0,1.17,0],brass,puppet);
  puppets.push({puppet,head,arms,side});
 }
 littleLabel('THE CAST',workshop,0,.31,.22,.72);

 // The theatre itself gains a fly-gallery, physical pulley loops and foot
 // lights. These are world children, not rotating scenery or flat pictures.
 const gallery=group('stage-fly-system',scene);
 for(const side of [-1,1]){
  const x=side*4.5;
  cylinder('brass-fly-pulley-'+side,.19,.19,.075,[x,4.12,1.66],brass,gallery,20);
  torus('fly-pulley-rim-'+side,.18,.03,[x,4.12,1.72],warm,gallery);
  cylinder('real-curtain-rope-'+side,.013,.013,2.8,[x,2.67,1.72],warm,gallery,6);
  sphere('rope-weight-'+side,.095,[x,1.20,1.72],brass,gallery);
  box('balcony-bracket-'+side,[.40,.14,.78],[side*4.40,2.10,.0],warm,gallery);
  box('balcony-wall-'+side,[.36,1.02,.63],[side*4.5,2.65,-.09],midnight,gallery);
  for(let i=0;i<3;i++)box('balcony-gold-rail-'+side+'-'+i,
   [.035,.76,.025],[side*(4.28+i*.14),2.7,.26],brass,gallery);
 }
 for(let i=0;i<12;i++){
  const x=-3.50+i*.64;
  const bulb= sphere('theatre-footlight-'+i,.085,[x,.89,3.25],i%3===0?parchment:warm,gallery);
  const rim=torus('footlight-brass-bezel-'+i,.11,.023,[x,.89,3.23],brass,gallery);
  rim.rotation.x=Math.PI/2;
 }
 const phrase=addLabel('EVERY STAGE HIDES ANOTHER',2.0);
 phrase.position.set(0,.88,3.60);gallery.add(phrase);

 const progress=[0,0,0];
 let elapsed=0;
 function update(delta,active){
  const dt=Math.max(0,Math.min(.08,Number(delta)||0));
  elapsed+=dt;
  for(let i=0;i<3;i++)progress[i]=approachMotion(progress[i],!!active?.[i],dt);
  const [song,show,cast]=progress;
  orrery.rotation.z+=dt*(.07+song*1.15);
  for(const {wing,side} of birdWings){
   wing.rotation.z=side*(.08+song*(.50+.27*Math.sin(elapsed*8)));
  }
  for(const {hinge,side} of showFlats){
   hinge.rotation.y=smoothTowards(hinge.rotation.y,side*show*1.10,dt,4);
  }
  skyline.position.y=smoothTowards(skyline.position.y,.66+show*.34,dt,4);
  mask.position.y=smoothTowards(mask.position.y,1.66+show*.13,dt,4);
  mask.rotation.z=smoothTowards(mask.rotation.z,show*.10,dt,4);
  for(const {puppet,head,arms,side} of puppets){
   puppet.rotation.z=side*cast*(.10+.08*Math.sin(elapsed*2.9));
   head.rotation.z=side*cast*(.18+.09*Math.sin(elapsed*3.2));
   for(const {arm,hand} of arms){
    arm.rotation.z=hand*cast*(.28+.27*Math.sin(elapsed*4+(side+hand)));
   }
  }
 }
 return Object.freeze({selectables,rigs:Object.freeze({chorus,playhouse,workshop,gallery}),update,
  get progress(){return [...progress];}});
}

(function(root,factory){
 'use strict';
 const model=factory(typeof module==='object'&&module.exports?require('./room-shell-plan.js'):root.DH11RoomShell);
 if(typeof module==='object'&&module.exports)module.exports=model;
 if(root)root.DH11ShellAsset=model;
})(typeof window!=='undefined'?window:null,function(plan){
 'use strict';
 if(!plan||!plan.check())throw Error('DH-11C.4E needs the canonical aperture plan');
 const parts=[],round=n=>Number(n.toFixed(5));
 const add=(name,mat,size,pos)=>{
  if(parts.some(p=>p.name===name))throw Error('Duplicate shell asset node '+name);
  if(size.some(v=>v<=0)||pos.some(v=>!Number.isFinite(v)))throw Error('Invalid shell model '+name);
  parts.push(Object.freeze({name,material:mat,size:size.map(round),position:pos.map(round)}));
 };
 add('floor_substrate','darkwood',[14,.22,11],[0,-.12,0]);
 for(let x=-6.75,i=0;x<7;x+=.56,i++)
  add('floor_plank_'+String(i).padStart(2,'0'),i%2?'timber':'desk',[.51,.016,10.7],[x,.008,0]);
 for(const p of plan.panels)add('wall_'+p.id,p.material,p.dimensions,p.centre);
 add('wall_left','stone',[.25,6.4,11],[-6.97,3.2,0]);
 for(let i=0;i<2;i++){
  const x=[plan.window.xMin,plan.window.xMax][i];
  add('window_reveal_vertical_'+i,'edge',[.09,plan.window.yMax-plan.window.yMin,.34],[x,(plan.window.yMin+plan.window.yMax)/2,plan.window.wallZ]);
 }
 for(let i=0;i<2;i++){
  const y=[plan.window.yMin,plan.window.yMax][i];
  add('window_reveal_horizontal_'+i,'edge',[plan.window.xMax-plan.window.xMin,.09,.34],[(plan.window.xMin+plan.window.xMax)/2,y,plan.window.wallZ]);
 }
 add('corridor_floor','darkwood',[2.85,.11,2.45],[8.2,-.11,-.2]);
 for(const [i,z] of [-1.47,1.07].entries())add('corridor_side_'+i,'plaster',[2.8,4.7,.12],[8.25,2.35,z]);
 add('corridor_back','stone',[.12,4.7,2.55],[9.65,2.35,-.2]);
 add('corridor_ceiling','timber',[2.8,.12,2.55],[8.25,4.65,-.2]);
 for(const y of [.4,2.55,5.75]){
  const tag=String(y).replace('.','_');
  if(y===2.55){
   add('back_rail_left_'+tag,'timber',[5.39,.11,.19],[(-7-1.61)/2,y,-5.3]);
   add('back_rail_right_'+tag,'timber',[5.05,.11,.19],[(1.95+7)/2,y,-5.3]);
  }else add('back_rail_'+tag,'timber',[14,.11,.19],[0,y,-5.3]);
  add('left_rail_'+tag,'timber',[.13,.12,11],[-6.8,y,0]);
  if(y<4.66){
   add('right_rail_back_'+tag,'timber',[.13,.12,4.02],[6.8,y,(-5.5-1.48)/2]);
   add('right_rail_front_'+tag,'timber',[.13,.12,4.42],[6.8,y,(1.08+5.5)/2]);
  }else add('right_rail_'+tag,'timber',[.13,.12,11],[6.8,y,0]);
 }
 for(const [i,x] of [-6.6,-3.4,3.1,6.6].entries())
  add('back_beam_'+i,'darkwood',[.2,6.25,.34],[x,3.15,-5.15]);
 for(let z=-5,i=0;z<=5;z+=3.3,i++)
  add('ceiling_beam_'+i,'timber',[14,.23,.3],[0,6,z]);
 add('rug','rug',[5.3,.025,3.65],[.05,.045,1.12]);
 for(const [i,x] of [-2.45,2.45].entries())add('rug_edge_side_'+i,'edge',[.07,.028,3.45],[x,.065,1.12]);
 for(const [i,z] of [-.52,2.76].entries())add('rug_edge_end_'+i,'edge',[5.1,.028,.06],[.05,.065,z]);
 const materials=Object.freeze({darkwood:'#4b3f42',timber:'#756354',desk:'#766455',plaster:'#636775',stone:'#555d66',edge:'#ad9478',rug:'#66505f'});
 const ids=new Set(parts.map(p=>p.name));
 for(const p of plan.panels)if(!ids.has('wall_'+p.id))throw Error('Missing physical wall '+p.id);
 if(!ids.has('corridor_back')||!ids.has('window_reveal_vertical_0'))throw Error('Incomplete scene');
 return Object.freeze({version:1,units:'metres',axis:'Y-up',source:'DH-11C.4C segmented walls, DH-11C.4D viewport',parts:Object.freeze(parts),materials});
});
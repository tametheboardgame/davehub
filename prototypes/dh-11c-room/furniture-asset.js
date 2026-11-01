(function(root,factory){
 'use strict';
 const manifest=factory();
 if(typeof module==='object'&&module.exports)module.exports=manifest;
 if(root)root.DH11FurnitureAsset=manifest;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.4F source of truth. All transforms are in metres, glTF Y-up;
 // the same named pivots are used for procedural proof and Blender editing.
 const nodes=[],materials={
  desk:'#766455',darkwood:'#4b3f42',timber:'#756354',ink:'#494b57',
  brass:'#c2a26d',paper:'#dbc9ab',stone:'#555d66',edge:'#ad9478',
  bin:'#677b81',island:'#7e856e',leaf:'#728b7b',
  book0:'#a59482',book1:'#6e737f',book2:'#9b8878',book3:'#b1a391',
  book4:'#5a7181',book5:'#7b6559',book6:'#a7a5a1',sky:'#6b8ca9'
 };
 const names=new Set();
 const add=(name,parent,kind,position=[0,0,0],size=null,material=null,rotation=null,shape=null)=>{
  if(names.has(name))throw Error('Duplicate furniture node '+name);
  if(parent!==null&&!names.has(parent))throw Error('Missing parent '+parent+' for '+name);
  const validSize=!size||(kind==='cylinder'?(size[0]>=0&&size[1]>=0&&(size[0]+size[1])>0&&size[2]>0):size.every(x=>x>0));
  if(position.some(x=>!Number.isFinite(x))||size&&size.some(x=>!Number.isFinite(x))||!validSize)throw Error('Bad dimensions '+name);
  names.add(name);
  nodes.push(Object.freeze({name,parent,kind,position,size,material,rotation,shape}));
 };
 const rootName='furniture_root';add(rootName,null,'group');
 const group=(name,parent,position=[0,0,0],rotation=null)=>add(name,parent,'group',position,null,null,rotation);
 const box=(name,parent,m,size,position=[0,0,0],rotation=null)=>add(name,parent,'box',position,size,m,rotation);
 const cyl=(name,parent,m,top,bottom,height,position,sides=12,rotation=null)=>add(name,parent,'cylinder',position,[top,bottom,height],m,rotation,{sides});
 const orb=(name,parent,m,r,position)=>add(name,parent,'sphere',position,[r,r,r],m);
 const crumple=(name,parent,m,r,position,rotation)=>add(name,parent,'icosa',position,[r,r,r],m,rotation);
 const base='desk_root';group(base,rootName,[-.3,0,.6]);
 box('desk_surface',base,'desk',[4.5,.2,2.15],[0,1.29,0]);
 for(const x of [-1.98,1.98])for(const z of [-.85,.85])
  box('desk_leg_'+(x<0?'l':'r')+'_'+(z<0?'rear':'front'),base,'darkwood',[.21,1.15,.23],[x,.61,z]);
 box('desk_apron',base,'darkwood',[4.04,.4,.12],[0,1,.94]);
 // Paper locations avoid the lamp, open folder, typewriter and cup;
 // no sheet begins intersecting a prop or overhanging the tabletop.
 const paperLayout=[
  [.20,-.72],[.78,-.72],[1.36,-.72],[1.91,-.72],
  [-1.75,.18],[-1.05,0],[-.42,0],[.20,0],
  [-1.70,.65],[-.06,.68],[.34,.68],[1.02,.68],[1.72,.68]
 ];
 for(let i=0;i<13;i++){
  const [x,z]=paperLayout[i];
  // Desk surface top is 1.29 + .20/2 = 1.39m. Paper half-thickness is .006m.
  // Keep the first sheet 1mm above the surface, with sub-millimetre layer gaps.
  box('desk_paper_'+String(i).padStart(2,'0'),base,'paper',[.49,.012,.32],[x,1.397+i*.00035,z],[0,(i%3-1)*.22,0]);
 }
 cyl('desk_lamp_shade',base,'brass',.28,.47,.31,[-1.67,2.32,-.43],10);
 cyl('desk_lamp_stem',base,'brass',.035,.035,.96,[-1.67,1.86,-.43]);
 orb('desk_lamp_bulb',base,'paper',.095,[-1.67,2.22,-.43]);
 cyl('desk_lamp_base',base,'timber',.28,.28,.12,[-1.67,1.4,-.43]);
 cyl('desk_cup',base,'ink',.13,.105,.26,[-.88,1.53,.57],12,[0,0,.08]);
 group('desk_file',base,[-.55,1.42,-.7]);
 box('desk_file_cover','desk_file','darkwood',[.86,.14,.64]);
 box('desk_file_sheet','desk_file','paper',[.66,.025,.44],[0,.09,0]);

 group('typewriter_root',rootName,[1.08,1.42,.66]);
 box('typewriter_body','typewriter_root','ink',[.95,.21,.55],[0,.07,0]);
 box('typewriter_back','typewriter_root','stone',[.79,.2,.3],[0,.2,-.08]);
 for(let row=0;row<3;row++)for(let i=0;i<8;i++)
  box('typewriter_key_'+row+'_'+i,'typewriter_root','brass',[.067,.025,.059],[-.34+i*.099,.194,.11+row*.092]);
 cyl('typewriter_platen','typewriter_root','ink',.056,.056,.91,[0,.38,-.22],12,[0,0,Math.PI/2]);
 box('typewriter_paper','typewriter_root','paper',[.64,.58,.02],[0,.68,-.24]);
 box('typewriter_paper_rule','typewriter_root','edge',[.57,.02,.015],[0,.65,-.224]);

 group('bookcase_root',rootName,[4.7,0,-3.85]);
 box('bookcase_body','bookcase_root','darkwood',[3.1,4.47,.77],[0,2.23,0]);
 box('bookcase_recess','bookcase_root','ink',[2.9,4.17,.12],[0,2.22,.35]);
 for(const [i,x] of [-1.5,1.5].entries())box('bookcase_side_'+i,'bookcase_root','timber',[.13,4.55,.81],[x,2.23,.04]);
 for(let shelf=0;shelf<5;shelf++)box('bookcase_shelf_'+shelf,'bookcase_root','edge',[3.04,.095,.84],[0,.47+shelf*.91,.11]);
 for(let shelf=0;shelf<4;shelf++)for(let i=0;i<20;i++){
  const height=.43+((i*7+shelf*13)%7)*.044;
  box('book_'+shelf+'_'+String(i).padStart(2,'0'),'bookcase_root','book'+((shelf*4+i)%7),[.111,height,.43],[-1.32+i*.139,.54+shelf*.91+height/2,.44]);
 }
 box('bookcase_crown','bookcase_root','brass',[3.3,.16,.97],[0,4.51,.07]);

 group('bin_root',rootName,[-3.2,0,2.45]);
 cyl('bin_body','bin_root','bin',.43,.36,.84,[0,.44,0],13);
 cyl('bin_rim','bin_root','brass',.43,.43,.055,[0,.84,0],13);
 for(let i=0;i<9;i++){
  const t=i*2.39,r=.22+(i%3)*.04;
  crumple('bin_paper_'+i,'bin_root','paper',.15+(i%3)*.028,[Math.cos(t)*r,.82+(i%4)*.075,Math.sin(t)*r],[.31*i,.72*i,.21*i]);
 }

 group('door_root',rootName,[6.78,0,-.2],[0,-Math.PI/2,0]);
 group('door_frame','door_root');
 for(const [i,x] of [-1.2,1.2].entries())box('door_jamb_'+i,'door_frame','edge',[.12,4.6,.23],[x,2.3,0]);
 box('door_lintel','door_frame','edge',[2.56,.17,.25],[0,4.55,0]);
 group('door_leaf_hinge','door_root',[-1.12,0,0]);
 box('door_leaf','door_leaf_hinge','timber',[2.19,4.28,.12],[1.095,2.21,0]);
 for(const [i,y] of [.55,2,3.55].entries())box('door_strap_'+i,'door_leaf_hinge','brass',[1.8,.045,.14],[1.08,y,.075]);
 orb('door_handle','door_leaf_hinge','brass',.095,[1.85,2.1,.15]);

 group('window_root',rootName,[.17,3.65,-5.31]);
 box('window_sky','window_root','sky',[3.13,2.47,.04],[0,0,-.54]);
 for(let i=0;i<3;i++){
  const x=[-.9,.36,1.04][i],y=[.1,.55,-.27][i],radius=[.46,.56,.33][i];
  const node='window_island_'+i;group(node,'window_root',[x,y,-.19]);
  cyl('window_island_top_'+i,node,'leaf',radius*.75,radius*.64,radius*.22,[0,0,0],7);
  cyl('window_island_tip_'+i,node,'island',0,radius*.8,radius*.63,[0,-radius*.32,0],7,[0,0,Math.PI]);
  box('window_island_tower_'+i,node,'paper',[radius*.13,radius*.52,radius*.12],[0,radius*.25,0]);
  box('window_island_cap_'+i,node,'paper',[radius*.35,.09,.2],[0,radius*.5,0]);
 }
 box('window_mullion_v','window_root','edge',[.09,2.7,.13],[0,0,.12]);
 box('window_mullion_h','window_root','edge',[3.3,.09,.13],[0,0,.12]);
 for(const [i,x] of [-1.58,1.58].entries())box('window_jamb_'+i,'window_root','timber',[.13,2.85,.16],[x,0,.1]);
 for(const [i,y] of [-1.33,1.33].entries())box('window_rail_'+i,'window_root','timber',[3.42,.13,.16],[0,y,.1]);
 const required=['desk_root','typewriter_root','bookcase_root','bin_root','door_root','door_leaf_hinge','window_root','typewriter_key_1_4','desk_paper_00','book_0_00','window_island_0'];
 for(const n of required)if(!names.has(n))throw Error('Missing moving asset '+n);
 return Object.freeze({version:1,units:'metres',axes:'glTF Y-up',nodes:Object.freeze(nodes),materials:Object.freeze(materials),interactiveRoots:Object.freeze(['desk_root','typewriter_root','bookcase_root','bin_root','door_root','window_root'])});
});
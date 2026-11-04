(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11RoomProps=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // Review-only 3D art. Every measurement is in the established Y-up scene
 // coordinates, not screenshot pixels or alternate camera-dependent plates.
 const LAMP_LIFT=.07;
 const DESK_TOP=1.29+.20/2;
 const RUG=Object.freeze({position:[.05,.061,1.12],size:[5.17,3.53],top:.045+.025/2});
 const BIN=Object.freeze({radius:.43,height:.84,centre:.44,radialSegments:13,moveablePapers:9});
 const INNER_BALLS=Object.freeze(Array.from({length:12},(_,i)=>{
  const tier=Math.floor(i/4),sector=i%4,angle=(sector+.17*tier)*Math.PI/2;
  const radius=(tier===0?.16:tier===1?.205:.175)+((i%3)-1)*.018;
  return Object.freeze({
   name:'dh11c5d3h_inner_paper_'+String(i).padStart(2,'0'),
   position:[Math.cos(angle)*radius,.27+tier*.17+(i%3)*.023,Math.sin(angle)*radius],
   size:.103+(i%4)*.013,
   rotation:[i*.57,i*.83,i*.32],
   paper:i%4
  });
 }));
 function createRugPlan(){
  return Object.freeze({position:RUG.position,size:RUG.size,top:RUG.top,
   textureWidth:1024,textureHeight:704,design:'celestial manuscript astrolabe'});
 }
 function inkRug(ctx,w,h){
  if(!ctx||!Number.isInteger(w)||!Number.isInteger(h)||w<400||h<300)throw Error('Rug canvas size');
  const ink='#cfac7c',subtle='rgba(228,194,145,.36)',dark='#39273d';
  const base=ctx.createLinearGradient(0,0,w,h);
  base.addColorStop(0,'#68435c');base.addColorStop(.48,'#77516a');base.addColorStop(1,'#553c56');
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  // Fine woven fibres with bounded deterministic variation, not large loops.
  for(let i=0;i<1250;i++){
   const x=((i*101+31)%1259)/1259*w,y=((i*211+17)%1277)/1277*h;
   ctx.strokeStyle=i%5?'rgba(229,194,166,.055)':'rgba(39,28,50,.085)';
   ctx.lineWidth=.7+(i%3)*.28;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+i%5,y+(i%2?1:-1));ctx.stroke();
  }
  const rect=(margin,style,width)=>{
   ctx.strokeStyle=style;ctx.lineWidth=width;ctx.strokeRect(margin,margin,w-2*margin,h-2*margin);
  };
  rect(19,'rgba(54,35,59,.8)',11);
  rect(32,ink,4);rect(45,subtle,1.9);rect(58,'rgba(215,174,128,.53)',1.7);
  // Occasional stitched dashes around the edge instead of an endless knot.
  ctx.strokeStyle='rgba(250,222,171,.48)';ctx.lineWidth=2;
  for(let i=0;i<34;i++){
   const x=71+i*(w-142)/33;
   for(const y of [66,h-66]){
    ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x+4,y+2);ctx.stroke();
   }
  }
  for(let i=0;i<16;i++){
   const y=80+i*(h-160)/15;
   for(const x of [65,w-65]){
    ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x+2,y+4);ctx.stroke();
   }
  }
  function line(x1,y1,x2,y2,stroke=ink,width=2.2){
   ctx.strokeStyle=stroke;ctx.lineWidth=width;
   ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function star(cx,cy,scale=1,opacity=.84){
   ctx.save();ctx.globalAlpha=opacity;
   const s=17*scale;
   const pts=[[0,-s],[s*.2,-s*.2],[s,0],[s*.2,s*.2],[0,s],[-s*.2,s*.2],[-s,0],[-s*.2,-s*.2]];
   ctx.beginPath();
   pts.forEach(([x,y],i)=>{if(i===0)ctx.moveTo(cx+x,cy+y);else ctx.lineTo(cx+x,cy+y);});
   ctx.closePath();ctx.fillStyle='#deb988';ctx.fill();ctx.strokeStyle=dark;ctx.lineWidth=2;ctx.stroke();
   ctx.restore();
  }
  // A single constellation chart/astrolabe medallion, no tiled squiggles.
  const cx=w*.51,cy=h*.55,R=Math.min(w,h)*.285;
  ctx.save();
  ctx.translate(cx,cy);ctx.rotate(-Math.PI/4);
  ctx.strokeStyle=ink;ctx.lineWidth=4;ctx.strokeRect(-R*.76,-R*.76,R*1.52,R*1.52);
  ctx.strokeStyle=subtle;ctx.lineWidth=2;ctx.strokeRect(-R*.61,-R*.61,R*1.22,R*1.22);
  ctx.restore();
  // Eight cardinal compass rays cross a fine crescent, like stitched starlight.
  for(let i=0;i<8;i++){
   const a=Math.PI*i/4-.22,sx=cx+Math.cos(a)*R*.29,sy=cy+Math.sin(a)*R*.29;
   const ex=cx+Math.cos(a)*R*.73,ey=cy+Math.sin(a)*R*.73;
   line(sx,sy,ex,ey,subtle,2.8);
   star(ex,ey,.28,.76);
  }
  star(cx,cy,1.65,.85);
  ctx.strokeStyle='rgba(241,215,170,.54)';ctx.lineWidth=2.3;
  ctx.beginPath();ctx.arc(cx,cy,R*.37,.38*Math.PI,1.65*Math.PI);ctx.stroke();
  // Four asymmetric miniature constellations and manuscript alchemical marks.
  const corner=[[.17,.23],[.84,.21],[.16,.78],[.83,.79]];
  corner.forEach(([ux,uy],k)=>{
   const x=ux*w,y=uy*h;
   const nodes=Array.from({length:4},(_,j)=>{
    const a=(j*1.75+k*.89),scale=(12+j*11);
    return [x+Math.cos(a)*scale,y+Math.sin(a)*scale];
   });
   for(let j=0;j<nodes.length-1;j++)
    line(...nodes[j],...nodes[j+1],'rgba(241,215,166,.56)',2);
   for(let j=0;j<nodes.length;j++)star(...nodes[j],.18+(j%2)*.1,.7);
  });
  // Sewn corner diamonds are irregular, calm and legible from the room view.
  for(const x of [92,w-92])for(const y of [94,h-94]){
   const r=21;ctx.strokeStyle=ink;ctx.lineWidth=2.8;
   ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r);
   ctx.lineTo(x-r,y);ctx.closePath();ctx.stroke();star(x,y,.3,.72);
  }
  return true;
 }
 function makeRug({THREE,scene}){
  if(!THREE?.CanvasTexture||!THREE?.PlaneGeometry||typeof document==='undefined')
   throw Error('Mystical rug requires real scene geometry and canvas');
  const plan=createRugPlan(),canvas=document.createElement('canvas');
  canvas.width=plan.textureWidth;canvas.height=plan.textureHeight;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('No 2D rug canvas');
  inkRug(ctx,canvas.width,canvas.height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,map:texture,roughness:.93,metalness:0,
   side:THREE.DoubleSide,depthWrite:true});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(...plan.size),mat);
  mesh.name='dh11c5d3h_mystical_rug_top_on_real_floor';
  mesh.rotation.x=-Math.PI/2;mesh.position.set(...plan.position);
  mesh.renderOrder=2;mesh.userData.decorativeOnly=true;mesh.raycast=()=>{};
  mesh.visible=false;scene.add(mesh);
  return Object.freeze({mesh,setVisible(on){mesh.visible=!!on;}});
 }
 function decorateFurniture({THREE,root}){
  if(!root?.getObjectByName||!THREE?.CylinderGeometry||!THREE?.Group)
   throw Error('Mystical furniture details require loaded original GLB');
  const get=name=>{
   const x=root.getObjectByName(name);if(!x)throw Error('Missing canonical 3D prop '+name);return x;
  };
  const desk=get('desk_root'),bin=get('bin_root');
  const deskTop=get('desk_surface');
  // Source desk surface centre 1.29, full height .20, top 1.39.
  if(Math.abs(deskTop.position.y+(.20/2)-DESK_TOP)>.0001)
   throw Error('Unexpected desk height; do not blindly reposition the lamp');
  const lamp=['shade','cap','stem','bulb','base'].map(p=>get('desk_lamp_'+p));
  for(const part of lamp)part.position.y+=LAMP_LIFT;
  const base=get('desk_lamp_base');
  const baseRadius=.28;
  const foot=new THREE.Group();
  foot.name='dh11c5d3h_lamp_foot_sits_above_desk';
  foot.userData.decorativeOnly=true;
  const finish=new THREE.MeshStandardMaterial({color:'#48333a',roughness:.59,metalness:.1});
  const metal=new THREE.MeshStandardMaterial({color:'#c59d69',roughness:.44,metalness:.56});
  function detail(parent,geometry,material,name,position){
   const mesh=new THREE.Mesh(geometry,material);mesh.name=name;
   mesh.userData.decorativeOnly=true;mesh.raycast=()=>{};
   mesh.position.set(...position);
   mesh.castShadow=false;mesh.receiveShadow=true;
   parent.add(mesh);return mesh;
  }
  // Bottom of raised existing base = 1.4 + .07 - .06 = 1.41m.
  // Plinth contacts 1.39m desk surface and overlaps the original base.
  detail(foot,new THREE.CylinderGeometry(.30,.325,.038,24),finish,
   'dh11c5d3h_lamp_walnut_plinth',[-1.67,DESK_TOP+.019,-.43]);
  const rim=detail(foot,new THREE.TorusGeometry(.303,.009,6,36),metal,
   'dh11c5d3h_lamp_gilt_foot_trim',[-1.67,DESK_TOP+.039,-.43]);
  rim.rotation.x=Math.PI/2;
  desk.add(foot);

  const binBody=get('bin_body'),binRim=get('bin_rim');
  const initial={bodyVisible:binBody.visible,rimVisible:binRim.visible};
  const binProps=new THREE.Group();binProps.name='dh11c5d3h_hollow_waste_basket';
  binProps.userData.decorativeOnly=true;binProps.visible=false;
  const exterior=new THREE.MeshStandardMaterial({color:'#446e72',roughness:.83,metalness:.06,
   side:THREE.DoubleSide});
  const inner=new THREE.MeshStandardMaterial({color:'#273b45',roughness:.95,metalness:0,
   side:THREE.BackSide});
  const brass=new THREE.MeshStandardMaterial({color:'#c7a36e',roughness:.49,metalness:.44});
  detail(binProps,new THREE.CylinderGeometry(.43,.36,.84,13,1,true),exterior,
   'dh11c5d3h_bin_open_sides',[0,.44,0]);
  detail(binProps,new THREE.CylinderGeometry(.414,.345,.808,13,1,true),inner,
   'dh11c5d3h_bin_interior',[0,.44,0]);
  detail(binProps,new THREE.CylinderGeometry(.345,.345,.035,13),inner,
   'dh11c5d3h_bin_open_bottom',[0,.045,0]);
  const ring=detail(binProps,new THREE.TorusGeometry(.429,.027,7,39),brass,
   'dh11c5d3h_brass_open_rim',[0,.84,0]);
  ring.rotation.x=Math.PI/2;
  const paperTones=['#dfc99c','#e9d2ab','#d8bc90','#ecdab8'];
  const ink=new THREE.LineBasicMaterial({color:'#795a51',transparent:true,opacity:.36});
  for(const p of INNER_BALLS){
   const finish=new THREE.MeshStandardMaterial({color:paperTones[p.paper],roughness:.93,flatShading:true});
   const ball=detail(binProps,new THREE.IcosahedronGeometry(p.size,1),finish,
    p.name,p.position);
   ball.rotation.set(...p.rotation);
   // Sparse physical creases on the paper itself, not 2D sprite outlines.
   const v=p.size;
   const points=[-.6*v,.35*v,.8*v,.25*v,.65*v,.65*v,
    -.3*v,-.5*v,.9*v,.45*v,-.25*v,.75*v,
    -.85*v,.05*v,-.15*v,.7*v,.45*v,-.35*v];
   const crease=new THREE.BufferGeometry();
   crease.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
   const marks=new THREE.LineSegments(crease,ink);marks.userData.decorativeOnly=true;
   marks.raycast=()=>{};ball.add(marks);
  }
  bin.add(binProps);
  let enabled=false;
  function setVisible(on){
   enabled=!!on;binProps.visible=enabled;
   binBody.visible=enabled?false:initial.bodyVisible;
   binRim.visible=enabled?false:initial.rimVisible;
  }
  setVisible(true);
  return Object.freeze({setVisible,
   get innerBalls(){return INNER_BALLS.length;},
   get interactiveBallsUntouched(){return BIN.moveablePapers;},
   get lampBaseBottom(){return base.position.y-.12/2;},
   get plinthBottom(){return DESK_TOP;},
   get enabled(){return enabled;}});
 }
 return Object.freeze({LAMP_LIFT,DESK_TOP,RUG,BIN,INNER_BALLS,createRugPlan,inkRug,makeRug,decorateFurniture});
});

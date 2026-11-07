(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11IllustratedViews=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const VERSION='dh11c5d-geometry-guides-v1';
 const VIEWPORTS=Object.freeze({desktop:Object.freeze({width:1600,height:900,fov:51}),
  mobile:Object.freeze({width:390,height:844,fov:62})});
 const sub=(a,b)=>a.map((v,i)=>v-b[i]);
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const norm=a=>{const length=Math.hypot(...a);if(length<1e-9)throw Error('Invalid identical camera/target');return a.map(v=>v/length);};
 function project(position,target,anchor,viewport){
  const forward=norm(sub(target,position)),right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward));
  const delta=sub(anchor,position),depth=dot(delta,forward);
  if(depth<=.08)return Object.freeze({depth:Math.round(depth*1000)/1000,visible:false,x:null,y:null});
  const h=Math.tan(viewport.fov*Math.PI/360),w=h*(viewport.width/viewport.height);
  const nx=dot(delta,right)/(depth*w),ny=dot(delta,up)/(depth*h);
  return Object.freeze({depth:+depth.toFixed(3),visible:Math.abs(nx)<=1&&Math.abs(ny)<=1,
   x:+((nx+1)*50).toFixed(2),y:+((1-ny)*50).toFixed(2)});
 }
 function contract(plan){
  if(!plan?.validate?.()||plan.OBJECTS.length!==7)throw Error('Missing canonical DH11 room plan');
  const cameras=[{id:'home',label:'Whole room',position:plan.HOME.position,target:plan.HOME.target},
   ...plan.OBJECTS.map(a=>({id:a.id,label:a.label,position:a.camera,target:a.lookAt}))];
  return Object.freeze({milestone:'DH-11C.5D.1',version:VERSION,authority:'prototypes/dh-11c-room/room-plan.js',
   imageStatus:'structural reference only, no illustrated final artwork',
   camera:{near:.08,far:80,desktopFov:51,mobileFov:62},
   objects:plan.OBJECTS.map(o=>({id:o.id,label:o.label,anchor:o.position})),
   views:cameras.map(c=>Object.freeze({...c,
    targets:Object.fromEntries(Object.entries(VIEWPORTS).map(([name,v])=>[name,{
     width:v.width,height:v.height,fov:v.fov,
     anchors:plan.OBJECTS.map(o=>({id:o.id,...project(c.position,c.target,o.position,v)}))
    }]))}))});
 }
 function fileName(view,kind){
  if(!/^(home|desk|cabinet|bookcase|typewriter|bin|door|window)$/.test(view))throw Error('Unknown canonical room view');
  if(!['png','json'].includes(kind))throw Error('Invalid export type');
  return 'dh11c5d-'+view+'-structural-guide.'+kind;
 }
 function stateSummary(state){
  return Object.freeze({focus:state.focus||'home',drawer:state.drawer,
   movedPapers:state.papers.map((v,i)=>v?i:null).filter(v=>v!==null),
   pulledBooks:state.books.map((v,i)=>v?i:null).filter(v=>v!==null),
   binPapers:state.binPapers.map((v,i)=>v?i:null).filter(v=>v!==null),
   lampOn:state.lampOn,typed:state.typed,doorOpen:state.doorOpen});
 }
 return Object.freeze({VERSION,VIEWPORTS,project,contract,fileName,stateSummary});
});

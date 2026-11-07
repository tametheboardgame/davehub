(function(root,factory){
 'use strict';
 const plan=factory();
 if(typeof module==='object'&&module.exports)module.exports=plan;
 if(root)root.DH11RoomShell=plan;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // One physically continuous room. Real openings are holes in segmented walls,
 // not alpha masks, pictures or camera-specific tricks. Units: metres, Y-up.
 const outer=Object.freeze({xMin:-7,xMax:7,zMin:-5.5,zMax:5.5,height:6.4});
 const window=Object.freeze({axis:'z',xMin:-1.61,xMax:1.95,yMin:2.25,yMax:5.05,wallZ:-5.48,wallDepth:.26});
 const door=Object.freeze({axis:'x',zMin:-1.48,zMax:1.08,yMin:0,yMax:4.66,wallX:6.97,wallDepth:.25});
 const panels=[];
 function panel(id,wall,lo,hi,yMin,yMax){
  if(hi<=lo||yMax<=yMin)throw Error('Invalid wall segment '+id);
  const thickness=wall==='back'?.26:.25;
  const dimensions=wall==='back'?[hi-lo,yMax-yMin,thickness]:[thickness,yMax-yMin,hi-lo];
  const centre=wall==='back'?[(lo+hi)/2,(yMin+yMax)/2,window.wallZ]:[door.wallX,(yMin+yMax)/2,(lo+hi)/2];
  panels.push(Object.freeze({id,wall,range:[lo,hi],vertical:[yMin,yMax],dimensions,centre,material:wall==='back'?'plaster':'stone'}));
 }
 // Back wall comprises four non-overlapping rectangles around the window hole.
 panel('back-left','back',outer.xMin,window.xMin,0,outer.height);
 panel('back-right','back',window.xMax,outer.xMax,0,outer.height);
 panel('back-sill','back',window.xMin,window.xMax,0,window.yMin);
 panel('back-header','back',window.xMin,window.xMax,window.yMax,outer.height);
 // Right wall comprises two columns and one high lintel around the doorway.
 panel('right-rear','right',outer.zMin,door.zMin,0,outer.height);
 panel('right-front','right',door.zMax,outer.zMax,0,outer.height);
 panel('right-lintel','right',door.zMin,door.zMax,door.yMax,outer.height);
 function within(a,b,overlapTolerance=1e-6){return a[0]<b[1]-overlapTolerance&&b[0]<a[1]-overlapTolerance;}
 function check(){
  for(const p of panels){
   const ap=p.wall==='back'?window:door;
   const width=p.wall==='back'?[ap.xMin,ap.xMax]:[ap.zMin,ap.zMax];
   if(within(p.range,width)&&within(p.vertical,[ap.yMin,ap.yMax]))throw Error('Wall blocks opening: '+p.id);
   if(p.dimensions.some(d=>d<=0)||p.centre.some(v=>!Number.isFinite(v)))throw Error('Invalid segment '+p.id);
  }
  for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++){
   const a=panels[i],b=panels[j];
   if(a.wall===b.wall&&within(a.range,b.range)&&within(a.vertical,b.vertical))throw Error('Overlapping wall segments '+a.id+' / '+b.id);
  }
  return true;
 }
 check();
 return Object.freeze({outer,window,door,panels:Object.freeze(panels),check});
});
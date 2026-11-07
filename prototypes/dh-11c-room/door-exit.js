(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11DoorExit=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const HOME_PATH='/';
 const APERTURE=Object.freeze({width:2.05,height:4.04,centre:[0,2.21,.015]});
 function decision(state){
  return state?.doorOpen?'exit':'open';
 }
 function label(state){
  return decision(state)==='open'?'Open the door':'Exit to DaveHub home';
 }
 function advance(plan,state){
  if(!plan||typeof plan.next!=='function'||!state)throw Error('Exit needs the shared room plan');
  if(decision(state)==='exit')return Object.freeze({action:'exit',state});
  const focused=state.focus==='door'?state:plan.next(state,{type:'focus',id:'door'});
  const opened=plan.next(focused,{type:'door'});
  if(!opened.doorOpen||opened.focus!=='door')throw Error('Door did not open using physical hinge plan');
  return Object.freeze({action:'open',state:opened});
 }
 // A genuinely anchored doorway hit surface in the same GLB coordinates.
 // Hidden until the physical leaf opens; no fake moving-state picture.
 function makeTarget(THREE,doorRoot){
  if(!THREE?.PlaneGeometry||!THREE?.Mesh||!THREE?.MeshBasicMaterial||
   !doorRoot?.add)throw Error('Exit requires a working 3D doorway');
  const mesh=new THREE.Mesh(
   new THREE.PlaneGeometry(APERTURE.width,APERTURE.height),
   new THREE.MeshBasicMaterial({
    color:'#ffffff',transparent:true,opacity:0,depthWrite:false,
    side:THREE.DoubleSide,toneMapped:false
   })
  );
  mesh.name='dh11c5d3i_physical_open_doorway_exit';
  mesh.position.set(...APERTURE.centre);
  mesh.userData.doorExitTrigger=true;
  mesh.userData.objectId='door';
  mesh.visible=false;mesh.renderOrder=0;
  doorRoot.add(mesh);
  return mesh;
 }
 return Object.freeze({HOME_PATH,APERTURE,decision,label,advance,makeTarget});
});

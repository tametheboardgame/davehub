(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11IllustratedStyle=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.5C.1-C.2. Apply an illustrated rendering language to the *same*
 // working 3D meshes; never use independent image states or alter pivots.
 const MODES=Object.freeze({
  reference:Object.freeze({id:'reference',name:'Original material reference',
   description:'The approved C5A desk and first-pass C5B archive, with standard 3D shading.'}),
  painterly:Object.freeze({id:'painterly',name:'Painterly Storybook',
   description:'Ink-coloured contours, softly stepped painted shading, amber pools of light and indigo shadows.'})
 });
 const KEY_OUTLINE=/^(desk_surface|desk_file_cover|typewriter_body|bookcase_body|bookcase_side_[01]|bookcase_shelf_[0-3]|bookcase_crown|front_face_(finished|drafts|oddities|fragments|field_notes)|case_(left|right|top|bottom))$/;
 function outlinedName(name){return KEY_OUTLINE.test(name||'');}
 function protectedMesh(mesh){
  if(!mesh||!mesh.isMesh)return true;
  if(/^desk_lamp_/.test(mesh.name||''))return true;
  if(/^featured_book_gilt_/.test(mesh.name||''))return true;
  if(Number.isInteger(mesh.userData.featuredBookIndex))return true;
  // Leave stamped and canvas-based labels crisp, not colour-graded twice.
  if(/^label_plate_/.test(mesh.name||''))return true;
  return false;
 }
 function createRuntime({THREE,scene,renderer,lights}){
  const registered=new WeakSet(),entries=[];
  const ramp=new THREE.DataTexture(new Uint8Array([
    57,50,76,255, 119,105,126,255, 198,174,158,255, 255,236,210,255
  ]),4,1,THREE.RGBAFormat);
  ramp.magFilter=THREE.NearestFilter;ramp.minFilter=THREE.NearestFilter;
  ramp.wrapS=THREE.ClampToEdgeWrapping;ramp.wrapT=THREE.ClampToEdgeWrapping;
  ramp.generateMipmaps=false;ramp.needsUpdate=true;
  const snapshot={
   background:scene.background?.clone(),
   fog:scene.fog?.color?.clone(),fogNear:scene.fog?.near,fogFar:scene.fog?.far,
   exposure:renderer?.toneMappingExposure,
   ambient:lights.ambient.color.clone(),ground:lights.ambient.groundColor.clone(),
   ambientIntensity:lights.ambient.intensity,
   sun:lights.sun.color.clone(),sunIntensity:lights.sun.intensity,
   window:lights.window.color.clone(),windowIntensity:lights.window.intensity,
   lamp:lights.lamp.color.clone(),lampIntensity:lights.lamp.userData.litIntensity
  };
  const palette=Object.freeze({
   background:'#242039',fog:'#242039',
   ambient:'#dbcfdf',ground:'#504369',ambientIntensity:1.65,
   sun:'#ffd29b',sunIntensity:3.15,
   window:'#839bd5',windowIntensity:12,
   lamp:'#ffe1a3',lampIntensity:28,exposure:1.16
  });
  let mode='reference';
  const cache=new WeakMap();
  function paint(original){
   if(cache.has(original))return cache.get(original);
   const styled=new THREE.MeshToonMaterial({
    name:'DH-11C.5C painterly | '+(original.name||'surface'),
    color:original.color?.clone()||new THREE.Color('#ffffff'),
    map:original.map||null,
    gradientMap:ramp,side:original.side,
    transparent:original.transparent,opacity:original.opacity,
    alphaTest:original.alphaTest||0,
    emissive:original.emissive?.clone()||new THREE.Color('#000000'),
    emissiveIntensity:original.emissiveIntensity||0,
    depthWrite:original.depthWrite,
    fog:original.fog!==false
   });
   cache.set(original,styled);return styled;
  }
  function decorate(mesh){
   if(registered.has(mesh)||protectedMesh(mesh))return;
   if(!mesh.material||Array.isArray(mesh.material))return;
   if(!mesh.material.isMeshStandardMaterial)return;
   registered.add(mesh);
   const original=mesh.material;
   const painted=paint(original);
   let outline=null;
   if(outlinedName(mesh.name)){
    outline=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),
     new THREE.LineBasicMaterial({color:'#2b2038',transparent:true,opacity:.46,
      depthWrite:false,toneMapped:false}));
    outline.name='dh11c5c_painterly_contour';
    outline.userData.decorativeOnly=true;
    outline.scale.setScalar(1.009);
    outline.visible=mode==='painterly';
    outline.renderOrder=3;
    mesh.add(outline); // LineSegments is NOT a raycast-selectable Mesh.
   }
   entries.push({mesh,original,painted,outline});
   if(mode==='painterly')mesh.material=painted;
  }
  function register(root){
   root.traverse(o=>{if(o.isMesh)decorate(o);});
   return entries.length;
  }
  function set(next){
   if(!Object.prototype.hasOwnProperty.call(MODES,next))throw Error('Unknown illustration mode '+next);
   mode=next;
   const enabled=mode==='painterly';
   for(const e of entries){
    e.mesh.material=enabled?e.painted:e.original;
    if(e.outline)e.outline.visible=enabled;
   }
   if(enabled){
    scene.background.set(palette.background);
    if(scene.fog){scene.fog.color.set(palette.fog);scene.fog.near=16;scene.fog.far=32;}
    lights.ambient.color.set(palette.ambient);
    lights.ambient.groundColor.set(palette.ground);
    lights.ambient.intensity=palette.ambientIntensity;
    lights.sun.color.set(palette.sun);lights.sun.intensity=palette.sunIntensity;
    lights.window.color.set(palette.window);
    lights.window.intensity=palette.windowIntensity;
    lights.lamp.color.set(palette.lamp);
    lights.lamp.userData.litIntensity=palette.lampIntensity;
    if(renderer)renderer.toneMappingExposure=palette.exposure;
   }else{
    if(snapshot.background)scene.background.copy(snapshot.background);
    if(scene.fog&&snapshot.fog){scene.fog.color.copy(snapshot.fog);scene.fog.near=snapshot.fogNear;scene.fog.far=snapshot.fogFar;}
    lights.ambient.color.copy(snapshot.ambient);
    lights.ambient.groundColor.copy(snapshot.ground);
    lights.ambient.intensity=snapshot.ambientIntensity;
    lights.sun.color.copy(snapshot.sun);lights.sun.intensity=snapshot.sunIntensity;
    lights.window.color.copy(snapshot.window);lights.window.intensity=snapshot.windowIntensity;
    lights.lamp.color.copy(snapshot.lamp);
    lights.lamp.userData.litIntensity=snapshot.lampIntensity;
    if(renderer)renderer.toneMappingExposure=snapshot.exposure;
   }
   // The existing animation loop continues to control the lamp's on/off
   // state and brightness using this current litIntensity target.
   return MODES[mode];
  }
  return Object.freeze({register,set,get mode(){return mode;},get styledCount(){return entries.length;}});
 }
 return Object.freeze({MODES,outlinedName,protectedMesh,createRuntime});
});

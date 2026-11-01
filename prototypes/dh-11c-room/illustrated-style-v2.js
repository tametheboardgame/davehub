(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11IllustratedStyleV2=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.5C.1-C.2. Apply an illustrated rendering language to the *same*
 // working 3D meshes; never use independent image states or alter pivots.
 const MODES=Object.freeze({
  reference:Object.freeze({id:'reference',name:'Original material reference',
   description:'The approved C5A desk and first-pass C5B archive, with standard 3D shading.'}),
  painterly:Object.freeze({id:'painterly',name:'Painterly Storybook',
   description:'Actual painted wood, illustrated paper and bindings, inked silhouettes, and a restrained amber/indigo stage.'})
 });
 const KEY_OUTLINE=/^(desk_surface|desk_file_cover|desk_paper_\\d{2}|typewriter_body|typewriter_paper|bookcase_body|bookcase_side_[01]|bookcase_shelf_[0-3]|bookcase_crown|book_[0-3]_\\d{2}|front_face_(finished|drafts|oddities|fragments|field_notes)|case_(left|right|top|bottom))$/;
 function outlinedName(name){return KEY_OUTLINE.test(name||'');}
 // This material classification is deliberately tied to surfaces, NOT
 // lighting or camera position. It also applies to late-loaded Blender GLBs.
 function surfaceFor(name){
  if(/^(desk_paper_|typewriter_paper|folder_|label_plate_)/.test(name||''))return 'paper';
  if(/^(book_|bookcase_)/.test(name||''))return name?.startsWith('book_')?'binding':'wood';
  if(/^(front_face_|case_|front_divider_|track_)/.test(name||''))return 'enamel';
  if(/^(brass_handle_|desk_lamp_cap|desk_lamp_stem|typewriter_key_)/.test(name||''))return 'brass';
  if(/^(desk_file_|typewriter_body)/.test(name||''))return 'leather';
  if(/^(desk_|tray_)/.test(name||''))return 'wood';
  return 'paint';
 }
 const clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
 function seed(x,y,s){
  let n=Math.imul(x+19,374761393)^Math.imul(y+53,668265263)^Math.imul(s+7,2246822519);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967295;
 }
 // The original UV is the source of truth: repaint its pixels in broad,
 // irregular translucent gouache strokes, with deliberate ink/edge marks.
 // Output remains 100% deterministic and contains no generated state image.
 function paintPixels(input,width,height,kind='wood'){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>262144||
      !input||input.length!==width*height*4)throw Error('Invalid source texture');
  const out=new Uint8Array(input.length),paper=kind==='paper',binding=kind==='binding';
  const tileX=kind==='wood'?19:paper?13:binding?11:16;
  const tileY=kind==='wood'?7:paper?16:binding?10:13;
  const hue=kind==='wood'?[17,-1,-8]:paper?[10,7,2]:binding?[5,-2,8]:
   kind==='enamel'?[-6,5,12]:[7,1,6];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const p=(y*width+x)*4;
   const twist=Math.sin((y/height)*18+(x/width)*2.7)*.35;
   const cellX=Math.floor((x+twist*tileX)/tileX),cellY=Math.floor(y/tileY);
   const cloud=seed(cellX,cellY,kind.length)-.5;
   const tooth=seed(Math.floor(x/3),Math.floor(y/3),kind.length+9)-.5;
   const ribbon=kind==='wood'?Math.sin(y*.31+Math.sin(x*.041)*2.9)*8:
    binding?Math.sin(x*.36+y*.06)*6:0;
   const brush=cloud*34+tooth*10+ribbon;
   const highlights=seed(cellX+1,cellY-3,kind.length+3)>.78?14:0;
   // Reduce noisy photoreal detail to broad painted value groups.
   for(let c=0;c<3;c++){
    const v=input[p+c]*.84+22+hue[c]+brush+highlights;
    const quantised=Math.round(v/(paper?20:26))*(paper?20:26);
    out[p+c]=clamp(quantised);
   }
   // Uneven hand-inked fibres, edge scratches and spine hatching.
   const grain=seed(Math.floor(x/12),Math.floor(y/9),kind.length+21);
   const scratch=(!paper&&grain>.79&&(x+Math.floor(y*.34))%27<2);
   const stipple=(paper&&grain>.85&&x%17===0&&y%11<3);
   if(scratch||stipple){
    for(let c=0;c<3;c++)out[p+c]=clamp(out[p+c]*(paper?.78:.69));
   }
   out[p+3]=input[p+3];
  }
  return out;
 }
 function sourcePixels(map){
  if(!map?.image)return null;
  const image=map.image;
  // The procedural model uses existing RGBA DataTextures.
  if(image.data?.length===image.width*image.height*4)
   return {pixels:image.data,width:image.width,height:image.height};
  // GLTFLoader supplies an ImageBitmap or HTMLImageElement. Read its actual
  // UV image rather than painting a separate picture or drawing over meshes.
  if(typeof document!=='undefined'&&image.width>0&&image.height>0){
   const canvas=document.createElement('canvas'),width=192,height=192;
   canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   if(!ctx)return null;
   try{
    ctx.drawImage(image,0,0,width,height);
    return {pixels:ctx.getImageData(0,0,width,height).data,width,height};
   }catch{return null;}
  }
  return null;
 }
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
  const cache=new WeakMap(),textureCache=new WeakMap();
  function paintMap(originalMap,kind){
   if(!originalMap)return null;
   let versions=textureCache.get(originalMap);
   if(!versions){versions=new Map();textureCache.set(originalMap,versions);}
   if(versions.has(kind))return versions.get(kind);
   const source=sourcePixels(originalMap);
   if(!source){versions.set(kind,originalMap);return originalMap;}
   const pixels=paintPixels(source.pixels,source.width,source.height,kind);
   const texture=new THREE.DataTexture(pixels,source.width,source.height,THREE.RGBAFormat);
   texture.colorSpace=originalMap.colorSpace||THREE.SRGBColorSpace;
   texture.flipY=originalMap.flipY;
   texture.wrapS=originalMap.wrapS;texture.wrapT=originalMap.wrapT;
   if(originalMap.repeat?.copy)texture.repeat.copy(originalMap.repeat);
   if(originalMap.offset?.copy)texture.offset.copy(originalMap.offset);
   texture.rotation=originalMap.rotation||0;texture.center.copy(originalMap.center);
   texture.magFilter=THREE.LinearFilter;
   texture.minFilter=THREE.LinearMipmapLinearFilter;
   texture.generateMipmaps=true;texture.needsUpdate=true;
   textureCache.get(originalMap).set(kind,texture);return texture;
  }
  function paint(original,name){
   const kind=surfaceFor(name);
   let versions=cache.get(original);
   if(!versions){versions=new Map();cache.set(original,versions);}
   if(versions.has(kind))return versions.get(kind);
   const styled=new THREE.MeshToonMaterial({
    name:'DH-11C.5C.2A painted surface | '+(original.name||name||'surface'),
    color:original.color?.clone()||new THREE.Color('#ffffff'),
    map:paintMap(original.map,kind),
    gradientMap:ramp,side:original.side,
    transparent:original.transparent,opacity:original.opacity,
    alphaTest:original.alphaTest||0,
    emissive:original.emissive?.clone()||new THREE.Color('#000000'),
    emissiveIntensity:original.emissiveIntensity||0,
    depthWrite:original.depthWrite,
    fog:original.fog!==false
   });
   versions.set(kind,styled);return styled;
  }
  function decorate(mesh){
   if(registered.has(mesh)||protectedMesh(mesh))return;
   if(!mesh.material||Array.isArray(mesh.material))return;
   if(!mesh.material.isMeshStandardMaterial)return;
   registered.add(mesh);
   const original=mesh.material;
   const painted=paint(original,mesh.name);
   let outline=null;
   if(outlinedName(mesh.name)){
    outline=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),
     new THREE.LineBasicMaterial({color:'#261b38',transparent:true,opacity:.86,
      depthWrite:false,toneMapped:false}));
    outline.name='dh11c5c_painterly_contour';
    outline.userData.decorativeOnly=true;
    outline.scale.setScalar(1.012);
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
 return Object.freeze({MODES,outlinedName,protectedMesh,surfaceFor,paintPixels,createRuntime});
});

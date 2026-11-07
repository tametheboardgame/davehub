(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11ComicStorybookStyle=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.5C.1-C.2. Apply an illustrated rendering language to the *same*
 // working 3D meshes; never use independent image states or alter pivots.
 const MODES=Object.freeze({
  reference:Object.freeze({id:'reference',name:'Original material reference',
   description:'The approved C5A desk and first-pass C5B archive, with standard 3D shading.'}),
  painterly:Object.freeze({id:'painterly',name:'Painterly Storybook',
   description:'Rich painted colour, expressive graphic shadows, uneven ink strokes and magical storybook materials.'})
 });
 const KEY_OUTLINE=/^(desk_surface|desk_file_cover|desk_paper_\d{2}|typewriter_body|typewriter_paper|bookcase_body|bookcase_side_[01]|bookcase_shelf_[0-3]|bookcase_crown|book_[0-3]_\d{2}|front_face_(finished|drafts|oddities|fragments|field_notes)|case_(left|right|top|bottom))$/;
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
 // A deterministic, visual-only polyline. The real selectable BufferGeometry
 // and 3D raycast surfaces are never mutated. Line width is intentionally not
 // used, as WebGL implementations commonly clamp it to one pixel.
 function sketchEdgeSegments(data,seedValue=7){
  if(!data||data.length%6!==0)throw Error('Expected paired XYZ edge vertices');
  const positions=[],colours=[];
  const add=(p,q,intensity)=>{
   positions.push(...p,...q);
   for(let k=0;k<2;k++)colours.push(intensity,intensity*.92,intensity);
  };
  for(let edge=0;edge<data.length/6;edge++){
   const i=edge*6;
   const a=[data[i],data[i+1],data[i+2]],b=[data[i+3],data[i+4],data[i+5]];
   const delta=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
   const len=Math.hypot(...delta);
   if(len<.0001)continue;
   const axis=Math.abs(delta[0])+Math.abs(delta[1])>.001?
     [-delta[1],delta[0],0]:[0,-delta[2],delta[1]];
   let mag=Math.hypot(...axis);
   if(mag<.0001){axis[0]=0;axis[1]=0;axis[2]=1;mag=1;}
   for(let q=0;q<3;q++)axis[q]/=mag;
   const fragments=Math.max(4,Math.min(22,Math.ceil(len/.085)));
   const strength=Math.min(.032,len*.035);
   const sample=k=>{
    const t=k/fragments;
    const edgeFade=Math.sin(Math.PI*t);
    const wave=Math.sin(t*17.2+edge*2.31+seedValue*.17)*.63+
     Math.sin(t*40.1+edge*.82+seedValue*.39)*.3+
     (seed(edge,k,seedValue)-.5)*.45;
    return a.map((v,c)=>v+delta[c]*t+axis[c]*strength*edgeFade*wave);
   };
   for(let k=0;k<fragments;k++){
    // Short intentional dry-brush gaps, not one perfect vector line.
    if((k+edge*3+seedValue)%11===5)continue;
    const ink=.58+.37*(seed(edge,k,seedValue+4));
    add(sample(k),sample(k+1),ink);
   }
  }
  return {positions:new Float32Array(positions),colours:new Float32Array(colours)};
 }
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
    const v=input[p+c]*.72+36+hue[c]*1.6+brush*1.45+highlights*1.2;
    const quantised=Math.round(v/(paper?17:22))*(paper?17:22);
    out[p+c]=clamp(quantised);
   }
   // Uneven hand-inked fibres, edge scratches and spine hatching.
   const grain=seed(Math.floor(x/12),Math.floor(y/9),kind.length+21);
   const scratch=(!paper&&grain>.79&&(x+Math.floor(y*.34))%27<2);
   const stipple=(paper&&grain>.85&&x%17===0&&y%11<3);
   if(scratch||stipple){
    for(let c=0;c<3;c++)out[p+c]=clamp(out[p+c]*(paper?.78:.69));
   }
   // Larger layered gouache marks follow the form, with broken ink
   // hatch strokes and warm/cool pigment separation. This operates in
   // the original UV space, not in a screen-aligned overlay.
   const u=x/width,v=y/height;
   const curved=(Math.sin(v*31.5+Math.sin(u*13)*1.6)+Math.sin(u*23-v*17)*.65);
   const contour=kind==='wood'||kind==='binding'?Math.abs(curved)>.94:false;
   const inkHatch=(kind==='enamel'||kind==='leather'||kind==='wood')&&
    (x+2*y+Math.floor(Math.sin(y*.13)*4))%43<2&&
    seed(Math.floor(x/13),Math.floor(y/8),23)>.53;
   const parchmentInk=paper&&((x+3*y)%61<2)&&
    seed(Math.floor(x/9),Math.floor(y/14),31)>.62;
   if(contour||inkHatch||parchmentInk){
    for(let c=0;c<3;c++)out[p+c]=clamp(out[p+c]*(parchmentInk?.76:.78));
   }
   if(kind==='binding'&&((y>height*.12&&y<height*.145)||(y>height*.83&&y<height*.85))&&x>width*.12&&x<width*.88){
    out[p]=clamp(out[p]*.45+205*.55);
    out[p+1]=clamp(out[p+1]*.45+155*.55);
    out[p+2]=clamp(out[p+2]*.48+78*.52);
   }
   // Edge wear only on paper and unselected book bindings. An irregular
   // alpha-test clip removes a few UV-edge pixels, not real triangle geometry.
   // The hitbox is unchanged and highlighted books are explicitly protected.
   if(paper||binding){
    const left=1.5+Math.sin(y*.117+kind.length)*1.35+(seed(0,Math.floor(y/7),kind.length)%7)/14;
    const top=1.2+Math.cos(x*.092+kind.length)*1.1+(seed(Math.floor(x/6),0,kind.length)%5)/12;
    const edgeX=Math.min(x,width-1-x),edgeY=Math.min(y,height-1-y);
    out[p+3]=(edgeX<left||edgeY<top)?0:input[p+3];
   }else out[p+3]=input[p+3];
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
    44,34,63,255, 106,78,109,255, 204,157,119,255, 255,231,174,255
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
   background:'#1c2037',fog:'#29243b',
   ambient:'#f2d4be',ground:'#435076',ambientIntensity:1.8,
   sun:'#ffc077',sunIntensity:3.7,
   window:'#80b8e9',windowIntensity:20,
   lamp:'#ffdc87',lampIntensity:32,exposure:1.13
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
    name:'DH-11C.5C.3 comic-storybook | '+(original.name||name||'surface'),
    color:original.color?.clone()||new THREE.Color('#ffffff'),
    map:paintMap(original.map,kind),
    gradientMap:ramp,side:original.side,
    transparent:original.transparent,opacity:original.opacity,
    alphaTest:(kind==='paper'||kind==='binding')?.45:(original.alphaTest||0),
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
    const sourceEdges=new THREE.EdgesGeometry(mesh.geometry,34);
    const fragments=sketchEdgeSegments(sourceEdges.getAttribute('position').array,
     mesh.name.split('').reduce((v,ch)=>v+ch.charCodeAt(0),17));
    sourceEdges.dispose();
    const stroke=new THREE.BufferGeometry();
    stroke.setAttribute('position',new THREE.Float32BufferAttribute(fragments.positions,3));
    stroke.setAttribute('color',new THREE.Float32BufferAttribute(fragments.colours,3));
    outline=new THREE.LineSegments(stroke,
     new THREE.LineBasicMaterial({color:'#332339',vertexColors:true,
      transparent:true,opacity:.91,depthWrite:false,toneMapped:false}));
    outline.name='dh11c5c_hand_ink_contour';
    outline.userData.decorativeOnly=true;
    outline.scale.setScalar(1.014);
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
 return Object.freeze({MODES,outlinedName,protectedMesh,surfaceFor,paintPixels,sketchEdgeSegments,createRuntime});
});

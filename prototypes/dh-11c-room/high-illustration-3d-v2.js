(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11HighIllustration3D=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.5D.3C: artwork is PAINTED ON REAL 3D SURFACES and low-relief
 // embellishment is bound to the original GLB meshes and their pivots.
 // There are no camera plates, generated moving-state images or fake hotspots.
 const MODES=Object.freeze({
  reference:{name:'Original textured 3D',description:'The untouched verified material and lighting reference.'},
  painterly:{name:'Illustrated 3D artwork',description:'Painted wood, ornamental book tooling, manuscript ink and sculpted-looking material depth on the same working objects.'}
 });
 const COLOURS=Object.freeze({
  wood:'#80573c',parchment:'#ebd4a3',binding:'#895b75',
  enamel:'#6d8c94',brass:'#c8a166',leather:'#67464b',
  plaster:'#77798c',stone:'#687184',fabric:'#784d66',
  leaf:'#789778',ink:'#4c4e59',paint:'#a28c78'
 });
 function kindFor(name,mat){
  const n=name||'';
  if(/^(?:desk_paper_|typewriter_paper$|desk_file_sheet$|folder_|label_plate_)/.test(n))return 'parchment';
  if(/^book_[0-3]_\d{2}$/.test(n))return 'binding';
  if(/^(?:bookcase_|desk_surface$|desk_leg_|desk_apron$|desk_lamp_base$|tray_|door_leaf$|door_jamb_|door_lintel$|window_jamb_|window_rail_)/.test(n))return 'wood';
  if(/^(?:front_face_|case_|front_divider_|track_)/.test(n))return 'enamel';
  if(/^(?:desk_file_|desk_cup$)/.test(n))return 'leather';
  if(/^(?:typewriter_body|typewriter_back)/.test(n))return 'ink';
  if(/^(?:brass_handle_|typewriter_key_|bookcase_crown$|door_strap_|door_handle$)/.test(n))return 'brass';
  if(/^bin_paper_/.test(n))return 'parchment';
  if(/^bin_body/.test(n))return 'enamel';
  if(/^window_island_top_/.test(n))return 'leaf';
  const hex=mat?.color?.getHexString?.()?.toLowerCase();
  const fallback={
   '636775':'plaster','555d66':'stone','756354':'wood',
   '4b3f42':'wood','ad9478':'wood','66505f':'fabric',
   'dbc9ab':'parchment','728b7b':'leaf','7e856e':'stone',
   'c2a26d':'brass','494b57':'ink','57737b':'enamel',
   '80989a':'enamel','677b81':'enamel','95805c':'fabric'
  };
  return fallback[hex]||'paint';
 }
 function protectedMesh(mesh){
  return !mesh?.isMesh||Number.isInteger(mesh.userData?.featuredBookIndex)||
   /^featured_book_gilt_|^label_plate_|^desk_lamp_bulb$/.test(mesh.name||'')||
   !mesh.material?.isMeshStandardMaterial;
 }
 function base(ctx,kind,size,hasSource){
  if(hasSource){
   // Coloured glaze that allows the underlying, genuine 3D UV reference
   // to retain its wood direction and previous validated material identity.
   ctx.fillStyle=kind==='wood'?'rgba(208,144,86,.13)':
    kind==='enamel'?'rgba(85,145,153,.18)':
    kind==='parchment'?'rgba(255,221,161,.16)':
    kind==='binding'?'rgba(188,110,98,.17)':
    'rgba(217,177,131,.12)';
  }else ctx.fillStyle=COLOURS[kind]||COLOURS.paint;
  ctx.fillRect(0,0,size,size);
 }
 const line=(ctx,x0,y0,x1,y1,x2,y2,x3,y3)=>{
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x1,y1,x2,y2,x3,y3);ctx.stroke();
 };
 function ornament(ctx,size,kind,variant=0){
  const S=size;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(kind==='wood'||kind==='leather'){
   // Directional gouache, not a post-processing flat colour filter. These
   // broad tapered grain marks and hand-drawn joinery appear ON every face.
   for(let i=0;i<27;i++){
    const y=S*(i+.48)/27,warp=Math.sin(i*1.57)*S*.055;
    ctx.lineWidth=S*(.0025+(i%4)*.002);
    ctx.strokeStyle=i%3===0?'rgba(251,208,135,.39)':'rgba(43,25,43,.36)';
    line(ctx,-S*.12,y,S*.19,y+warp,S*.69,y-warp,S*1.13,y+S*.018);
   }
   for(const x of [.05,.95]){
    ctx.strokeStyle='rgba(231,183,103,.68)';ctx.lineWidth=S*.007;
    line(ctx,S*x,S*.03,S*(x+.025),S*.32,S*(x-.022),S*.68,S*x,S*.97);
   }
   if(kind==='leather'){
    ctx.setLineDash([S*.009,S*.012]);ctx.strokeStyle='rgba(244,199,128,.69)';
    ctx.lineWidth=S*.006;ctx.strokeRect(S*.06,S*.06,S*.88,S*.88);
    ctx.setLineDash([]);
   }
  }else if(kind==='binding'){
   ctx.fillStyle='rgba(22,23,43,.18)';ctx.fillRect(0,0,S*.12,S);
   ctx.fillStyle='rgba(255,211,141,.13)';ctx.fillRect(S*.86,0,S*.08,S);
   for(const y of [.16,.195,.79,.83]){
    ctx.lineWidth=S*.012;ctx.strokeStyle='rgba(244,197,104,.85)';
    line(ctx,S*.1,S*y,S*.37,S*(y-.018),S*.7,S*(y+.018),S*.91,S*y);
   }
   ctx.strokeStyle='rgba(249,214,145,.85)';ctx.lineWidth=S*.01;
   for(let j=0;j<2;j++){
    const cy=S*(.43+j*.12);
    ctx.beginPath();ctx.moveTo(S*.34,cy);ctx.bezierCurveTo(S*.64,cy-S*.1,S*.76,cy+S*.1,S*.5,cy+S*.035);ctx.stroke();
   }
   // Distinct hand-authored spine insignia variants, painted into real UVs.
   // These are decorative marks, not fabricated book titles.
   ctx.strokeStyle='rgba(252,215,142,.8)';ctx.lineWidth=S*.009;
   const lobes=3+variant;
   for(let k=0;k<lobes;k++){
    const a=k*Math.PI*2/lobes;
    const x=S*(.5+Math.cos(a)*(.09+variant*.006));
    const y=S*(.56+Math.sin(a)*(.09+variant*.006));
    line(ctx,S*.5,S*.56,x,y,x+Math.cos(a+0.7)*S*.065,y+Math.sin(a+0.7)*S*.065,S*.5,S*.56);
   }
   ctx.strokeStyle='rgba(27,25,45,.55)';
   for(let i=0;i<18;i++){
    const x=S*(i+.5)/18;ctx.lineWidth=S*.003;
    line(ctx,x,0,x+S*.018,S*.2,x-S*.018,S*.7,x,S);
   }
  }else if(kind==='parchment'){
   ctx.fillStyle='rgba(255,248,203,.21)';
   for(let i=0;i<10;i++){
    const y=S*(i+.35)/10;ctx.fillRect(0,y,S,S*.023);
   }
   ctx.strokeStyle='rgba(85,56,77,.57)';ctx.lineWidth=S*.006;
   for(let i=0;i<14;i++){
    const y=S*(i+.95)/16,len=S*(.46+(i%4)*.105);
    line(ctx,S*.13,y,S*.24,y-S*.026,S*.34+len*.35,y+S*.026,S*.11+len,y);
    if(i%3===0){
     ctx.beginPath();ctx.moveTo(S*.17,y+S*.015);
     ctx.quadraticCurveTo(S*.34,y+S*.06,S*.41,y+S*.008);ctx.stroke();
    }
   }
   ctx.strokeStyle='rgba(145,87,67,.27)';ctx.lineWidth=S*.016;
   ctx.strokeRect(S*.028,S*.028,S*.944,S*.944);
  }else if(kind==='enamel'||kind==='ink'){
   ctx.fillStyle='rgba(255,213,152,.14)';
   for(let i=0;i<14;i++){
    const x=S*((i*17)%91)/100,y=S*((i*29)%97)/100;
    ctx.beginPath();ctx.ellipse(x,y,S*(.019+(i%3)*.006),S*.008,i*.27,0,Math.PI*2);ctx.fill();
   }
   ctx.strokeStyle='rgba(36,36,55,.49)';ctx.lineWidth=S*.01;
   ctx.strokeRect(S*.065,S*.065,S*.87,S*.87);
   ctx.strokeStyle='rgba(224,178,104,.73)';ctx.lineWidth=S*.008;
   ctx.strokeRect(S*.105,S*.1,S*.79,S*.8);
  }else if(kind==='plaster'||kind==='stone'||kind==='fabric'){
   for(let i=0;i<22;i++){
    const x=S*(i*.618%1),y=S*(i*.327%1);
    ctx.lineWidth=S*(.006+(i%4)*.003);
    ctx.strokeStyle=i%3===0?'rgba(249,209,161,.28)':'rgba(31,38,66,.25)';
    line(ctx,x-S*.22,y-S*.07,x-S*.05,y-S*.02,x+S*.08,y+S*.04,x+S*.21,y+S*.01);
   }
   if(kind==='fabric'){
    ctx.strokeStyle='rgba(231,171,108,.37)';ctx.lineWidth=S*.006;
    for(let i=0;i<9;i++){
     ctx.beginPath();ctx.ellipse(S*(i+.5)/9,S*.5,S*.043,S*.21,i*.1,0,Math.PI*2);ctx.stroke();
    }
   }
  }else if(kind==='brass'){
   for(let i=0;i<31;i++){
    ctx.strokeStyle=i%3===0?'rgba(255,236,160,.48)':'rgba(81,52,44,.36)';
    ctx.lineWidth=S*.004;
    line(ctx,S*i/31,-S*.1,S*(i+.8)/31,S*.22,S*(i-.7)/31,S*.72,S*i/31,S*1.1);
   }
  }else if(kind==='leaf'){
   for(let i=0;i<26;i++){
    const x=S*(i*.382%1),y=S*(i*.619%1);
    ctx.fillStyle=i%2?'rgba(231,224,129,.22)':'rgba(28,64,70,.25)';
    ctx.beginPath();ctx.ellipse(x,y,S*.075,S*.018,i*.81,0,Math.PI*2);ctx.fill();
   }
  }
  ctx.restore();
 }
 function spineVariant(name){
  const match=/^book_([0-3])_(\d{2})$/.exec(name||'');
  return match?(Number(match[1])*3+Number(match[2]))%4:0;
 }
 function paintCanvas(ctx,size,kind,hasSource,variant=0){
  if(!COLOURS[kind])throw Error('Unknown illustrated material '+kind);
  if(!ctx||!Number.isInteger(size)||size<64||size>1024)throw Error('Invalid hand-painted canvas');
  base(ctx,kind,size,hasSource);
  ornament(ctx,size,kind,variant);
  return true;
 }
 function reliefPaths(name,bounds){
  const n=name||'',b=bounds;
  if(!b?.min||!b?.max)return [];
  const min=b.min,max=b.max,dx=max.x-min.x,dy=max.y-min.y,dz=max.z-min.z;
  const P=[];const at=(x,y,z)=>[min.x+dx*x,min.y+dy*y,min.z+dz*z];
  const seg=(a,c)=>{P.push(...a,...c);};
  const chain=points=>{for(let i=0;i<points.length-1;i++)seg(points[i],points[i+1]);};
  const rectFront=(x0,y0,x1,y1,z=1.025)=>chain([at(x0,y0,z),at(x1,y0,z),at(x1,y1,z),at(x0,y1,z),at(x0,y0,z)]);
  const rectTop=(x0,z0,x1,z1,y=1.04)=>chain([at(x0,y,z0),at(x1,y,z0),at(x1,y,z1),at(x0,y,z1),at(x0,y,z0)]);
  const arc=(x,y,r,z=1.025)=>{
   const curve=[];for(let i=0;i<=14;i++){const t=i/14*Math.PI*2;curve.push(at(x+r*Math.cos(t),y+r*Math.sin(t),z));}chain(curve);
  };
  const filigree=(left,cy,right,z=1.03)=>{
   const curve=[];for(let i=0;i<=20;i++){
    const t=i/20,x=left+(right-left)*t;
    curve.push(at(x,cy+Math.sin(t*Math.PI*4)*.045*(1-Math.abs(.5-t)),z));
   }chain(curve);
  };
  if(/^book_[0-3]_\d{2}$/.test(n)){
   for(const h of [.14,.20,.79,.85])seg(at(.14,h,1.035),at(.86,h,1.035));
   arc(.5,.5,.18);filigree(.28,.5,.72);
  }else if(/^desk_paper_\d{2}$/.test(n)||n==='desk_file_sheet'){
   rectTop(.06,.06,.94,.94);
   for(let i=0;i<7;i++){
    const z=.19+i*.09,len=.61+(i%3)*.09;
    chain([at(.15,1.055,z),at(.22,1.055,z+.012),at(len*.58,1.055,z-.01),at(len,1.055,z+.006)]);
   }
  }else if(n==='typewriter_paper'){
   rectFront(.07,.07,.93,.93);
   for(let i=0;i<9;i++){
    const y=.2+i*.068;seg(at(.15,y,1.04),at(.78-(i%3)*.07,y+.01,1.04));
   }
  }else if(n==='desk_surface'){
   rectTop(.018,.026,.982,.974,1.035);
   rectTop(.048,.074,.952,.926,1.037);
   for(let i=0;i<8;i++){
    const x=.11+i*.11;seg(at(x,1.045,.065),at(x+.035,1.045,.09));
   }
  }else if(n==='desk_apron'||/^front_face_/.test(n)){
   rectFront(.04,.12,.96,.87);rectFront(.08,.18,.92,.82,1.03);
   arc(.17,.24,.045);arc(.83,.24,.045);
  }else if(n==='bookcase_crown'){
   rectFront(.04,.18,.96,.82);filigree(.18,.5,.82);arc(.5,.5,.11);
  }else if(/^bookcase_side_/.test(n)||n==='bookcase_body'){
   rectFront(.04,.035,.96,.965);filigree(.22,.5,.78);
  }else if(n==='door_leaf'){
   for(const [y0,y1] of [[.06,.3],[.4,.64],[.72,.94]]){
    rectFront(.09,y0,.91,y1);rectFront(.13,y0+.018,.87,y1-.018,1.03);
   }
  }else if(n==='typewriter_body'||n==='typewriter_back'){
   rectFront(.09,.17,.91,.83);filigree(.22,.5,.78);
  }else if(/^bookcase_shelf_/.test(n)){
   seg(at(.03,.52,1.032),at(.97,.52,1.032));
  }
  return P;
 }
 function createRuntime({THREE,scene,renderer,lights}){
  const registered=new WeakSet(),entries=[],mapCache=new WeakMap(),fallbackCache=new Map();
  const strokes=new THREE.LineBasicMaterial({color:'#f0c782',transparent:true,opacity:.88,
   depthTest:true,depthWrite:false,toneMapped:false});
  const inkStroke=new THREE.LineBasicMaterial({color:'#4b3149',transparent:true,opacity:.84,
   depthTest:true,depthWrite:false,toneMapped:false});
  const screenshot={
   background:scene.background?.clone(),fog:scene.fog?.color?.clone(),
   fogNear:scene.fog?.near,fogFar:scene.fog?.far,
   exposure:renderer?.toneMappingExposure,
   ambient:lights.ambient.color.clone(),ground:lights.ambient.groundColor.clone(),
   ambientIntensity:lights.ambient.intensity,
   sun:lights.sun.color.clone(),sunIntensity:lights.sun.intensity,
   window:lights.window.color.clone(),windowIntensity:lights.window.intensity,
   lamp:lights.lamp.color.clone(),lampIntensity:lights.lamp.userData.litIntensity
  };
  let mode='reference';
  function paintMap(source,kind,variant=0){
   const cacheKey=kind+':'+variant;
   if(!source&&typeof document==='undefined')return null;
   if(!source&&fallbackCache.has(cacheKey))return fallbackCache.get(cacheKey);
   if(source){
    let versions=mapCache.get(source);
    if(versions?.has(cacheKey))return versions.get(cacheKey);
   }
   if(typeof document==='undefined')return source;
   const size=384,canvas=document.createElement('canvas');
   canvas.width=size;canvas.height=size;
   const ctx=canvas.getContext('2d');
   if(!ctx)return source;
   let hasSource=false;
   const img=source?.image;
   try{
    if(img?.data?.length===img.width*img.height*4){
     const tmp=document.createElement('canvas');
     tmp.width=img.width;tmp.height=img.height;
     const cx=tmp.getContext('2d'),pixels=cx.createImageData(img.width,img.height);
     pixels.data.set(img.data);
     cx.putImageData(pixels,0,0);
     ctx.drawImage(tmp,0,0,size,size);hasSource=true;
    }else if(img?.width>0&&img?.height>0){
     ctx.drawImage(img,0,0,size,size);hasSource=true;
    }
   }catch{hasSource=false;}
   paintCanvas(ctx,size,kind,hasSource,variant);
   const texture=new THREE.CanvasTexture(canvas);
   texture.colorSpace=source?.colorSpace||THREE.SRGBColorSpace;
   if(source){
    texture.flipY=source.flipY;
    texture.wrapS=source.wrapS;texture.wrapT=source.wrapT;
    if(source.repeat?.copy)texture.repeat.copy(source.repeat);
    if(source.offset?.copy)texture.offset.copy(source.offset);
    texture.rotation=source.rotation||0;
    if(source.center?.clone)texture.center.copy(source.center);
   }
   texture.anisotropy=Math.min(4,renderer?.capabilities?.getMaxAnisotropy?.()||1);
   texture.needsUpdate=true;
   if(source){
    let versions=mapCache.get(source);
    if(!versions){versions=new Map();mapCache.set(source,versions);}
    versions.set(cacheKey,texture);
   }else fallbackCache.set(cacheKey,texture);
   return texture;
  }
  function register(root){
   root.traverse(mesh=>{
    if(registered.has(mesh)||protectedMesh(mesh))return;
    const kind=kindFor(mesh.name,mesh.material),original=mesh.material;
    registered.add(mesh);
    const styled=original.clone();
    styled.name='DH-11C.5D.3B authored 3D paint '+(mesh.name||'surface');
    const art=paintMap(original.map,kind,kind==='binding'?spineVariant(mesh.name):0);
    if(art){
     styled.map=art;
     if(!original.map)styled.color.set('#ffffff');
    }
    styled.roughness=Math.max(.56,styled.roughness||.8);
    styled.metalness=(kind==='brass'?Math.min(.26,styled.metalness||0):Math.min(.11,styled.metalness||0));
    styled.needsUpdate=true;
    let relief=null;
    if(mesh.geometry){
     if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
     const points=reliefPaths(mesh.name,mesh.geometry.boundingBox);
     if(points.length){
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
      relief=new THREE.LineSegments(geometry,(kind==='parchment'||kind==='enamel'||kind==='ink')?inkStroke:strokes);
      relief.name='dh11c5d3b_onmesh_relief';
      relief.userData.decorativeOnly=true;
      relief.visible=mode==='painterly';
      relief.renderOrder=3;
      mesh.add(relief);
     }
    }
    entries.push({mesh,original,styled,relief});
    if(mode==='painterly')mesh.material=styled;
   });
   return entries.length;
  }
  function set(next){
   if(!Object.prototype.hasOwnProperty.call(MODES,next))throw Error('Unknown illustration mode '+next);
   mode=next;const on=mode==='painterly';
   for(const item of entries){
    item.mesh.material=on?item.styled:item.original;
    if(item.relief)item.relief.visible=on;
   }
   if(on){
    scene.background.set('#252039');
    if(scene.fog){scene.fog.color.set('#30243c');scene.fog.near=18;scene.fog.far=37;}
    lights.ambient.color.set('#f1d9c5');lights.ambient.groundColor.set('#52517f');
    lights.ambient.intensity=1.65;
    lights.sun.color.set('#ffc782');lights.sun.intensity=3.35;
    lights.window.color.set('#8dbde1');lights.window.intensity=17;
    lights.lamp.color.set('#ffe09c');lights.lamp.userData.litIntensity=30;
    if(renderer)renderer.toneMappingExposure=1.14;
   }else{
    if(screenshot.background)scene.background.copy(screenshot.background);
    if(screenshot.fog&&scene.fog){
     scene.fog.color.copy(screenshot.fog);scene.fog.near=screenshot.fogNear;scene.fog.far=screenshot.fogFar;
    }
    lights.ambient.color.copy(screenshot.ambient);
    lights.ambient.groundColor.copy(screenshot.ground);
    lights.ambient.intensity=screenshot.ambientIntensity;
    lights.sun.color.copy(screenshot.sun);lights.sun.intensity=screenshot.sunIntensity;
    lights.window.color.copy(screenshot.window);lights.window.intensity=screenshot.windowIntensity;
    lights.lamp.color.copy(screenshot.lamp);lights.lamp.userData.litIntensity=screenshot.lampIntensity;
    if(renderer)renderer.toneMappingExposure=screenshot.exposure;
   }
   return MODES[mode];
  }
  return Object.freeze({register,set,get mode(){return mode;},get count(){return entries.length;}});
 }
 return Object.freeze({MODES,kindFor,protectedMesh,spineVariant,paintCanvas,reliefPaths,createRuntime});
});

(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11WindowIllustration=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // Four real windowpane apertures, not one oversize wall-mounted image.
 // The backing artwork and mist share the exact aperture coordinate system.
 const PANE=Object.freeze({width:1.52,height:1.19,halfX:.805,halfY:.64});
 const LAYERS=Object.freeze([
  Object.freeze({name:'homepage-sky',z:0}),
  Object.freeze({name:'far-mist',z:.018}),
  Object.freeze({name:'near-mist',z:.037})
 ]);
 function cover(imageWidth,imageHeight){
  if(!(imageWidth>0&&imageHeight>0))throw Error('Invalid scenic image dimensions');
  const target=3.13/2.47,source=imageWidth/imageHeight;
  const u=Math.min(1,target/source),v=Math.min(1,source/target);
  return Object.freeze({u,v,offsetU:(1-u)/2,offsetV:(1-v)/2});
 }
 function paneVertices(depth,uvCover={u:1,v:1,offsetU:0,offsetV:0}){
  const position=[],uv=[],indices=[];
  for(const y of [-PANE.halfY,PANE.halfY])for(const x of [-PANE.halfX,PANE.halfX]){
   const x0=x-PANE.width/2,x1=x+PANE.width/2;
   const y0=y-PANE.height/2,y1=y+PANE.height/2;
   const points=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
   const start=position.length/3;
   for(const [px,py] of points){
    position.push(px,py,depth);
    uv.push(uvCover.offsetU+((px+1.565)/3.13)*uvCover.u,
     uvCover.offsetV+((py+1.235)/2.47)*uvCover.v);
   }
   indices.push(start,start+1,start+2,start,start+2,start+3);
  }
  return {position,uv,indices};
 }
 function drawAtmosphere(ctx,w,h,near){
  // Transparent brush clouds only. The green geometric legacy islands and
  // duplicated faux islands from the previous layer artist are both gone.
  ctx.clearRect(0,0,w,h);
  ctx.save();ctx.lineCap='round';
  for(let i=0;i<32;i++){
   const x=w*((i*41%97)/97),y=h*((i*29%89)/89);
   const span=w*(.025+(i%4)*.012);
   ctx.strokeStyle=near?'rgba(255,223,186,.15)':'rgba(203,194,237,.11)';
   ctx.lineWidth=near?2.2:3.2;
   ctx.beginPath();ctx.moveTo(x-span,y);
   ctx.bezierCurveTo(x-span*.25,y-span*.18,x+span*.25,y+span*.16,x+span,y);
   ctx.stroke();
  }
  ctx.restore();
 }
 function mount({THREE,root,url}){
  if(!THREE?.BufferGeometry||!THREE?.TextureLoader||!root?.getObjectByName||typeof document==='undefined')
   throw Error('Window illustration requires the original 3D aperture and WebGL textures');
  const sky=root.getObjectByName('window_sky');
  const legacyIslands=Array.from({length:3},(_,i)=>root.getObjectByName('window_island_'+i));
  if(!sky||legacyIslands.some(x=>!x))throw Error('Canonical window geometry is missing');
  const original=[sky,...legacyIslands];
  const group=new THREE.Group();
  group.name='dh11c5d3f_clipped_four_pane_scenery';
  group.userData.decorativeOnly=true;group.visible=false;root.add(group);
  const addLayer=(layer,texture,transparent,coverage)=>{
   const data=paneVertices(layer.z,coverage);
   const geometry=new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.position,3));
   geometry.setAttribute('uv',new THREE.Float32BufferAttribute(data.uv,2));
   geometry.setIndex(data.indices);
   const material=new THREE.MeshBasicMaterial({
    map:texture,side:THREE.DoubleSide,transparent,opacity:1,depthWrite:!transparent,toneMapped:false
   });
   const mesh=new THREE.Mesh(geometry,material);
   mesh.name='dh11c5d3f_'+layer.name;
   mesh.userData.decorativeOnly=true;
   mesh.raycast=()=>{};
   mesh.renderOrder=transparent?2:1;group.add(mesh);
  };
  for(let i=1;i<LAYERS.length;i++){
   const canvas=document.createElement('canvas');
   canvas.width=640;canvas.height=480;
   const ctx=canvas.getContext('2d');
   if(!ctx)throw Error('No canvas to paint window mist');
   drawAtmosphere(ctx,canvas.width,canvas.height,i===2);
   const tx=new THREE.CanvasTexture(canvas);
   tx.colorSpace=THREE.SRGBColorSpace;
   addLayer(LAYERS[i],tx,true);
  }
  let requested=true,ready=false,failed=false;
  function sync(){
   const active=requested&&ready;
   group.visible=active;
   // Hide the entire original rig, not only its decorative mesh surfaces.
   for(const node of original)node.visible=!active;
   return active;
  }
  new THREE.TextureLoader().load(url,texture=>{
   const img=texture.image;
   const uv=cover(img?.width||0,img?.height||0);
   texture.colorSpace=THREE.SRGBColorSpace;
   addLayer(LAYERS[0],texture,false,uv);
   ready=true;sync();
  },undefined,()=>{failed=true;sync();});
  sync();
  return Object.freeze({
   setVisible(value){requested=!!value;return sync();},
   get ready(){return ready;},get failed(){return failed;},get layers(){return LAYERS.length;}
  });
 }
 return Object.freeze({PANE,LAYERS,cover,paneVertices,drawAtmosphere,mount});
});

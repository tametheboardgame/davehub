(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11WindowIllustration=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // Window-only scenic artwork: genuine, separated 3D planes, never room plates.
 const LAYERS=Object.freeze([
  Object.freeze({name:'homepage-sky',size:[3.1,2.44],z:-.49}),
  Object.freeze({name:'far-mist',size:[3.08,2.39],z:-.38}),
  Object.freeze({name:'near-island',size:[3.05,2.37],z:-.27})
 ]);
 function drawAtmosphere(ctx,w,h,near){
  // Transparent layers: curved ink, painted clouds and island silhouettes.
  // Nothing covers the 3D window frame or responds to pointer picking.
  ctx.clearRect(0,0,w,h);ctx.save();
  const cloud=(x,y,s)=>{
   ctx.beginPath();ctx.moveTo(x-s*.62,y);
   ctx.bezierCurveTo(x-s*.5,y-s*.14,x-s*.19,y-s*.16,x,y-s*.09);
   ctx.bezierCurveTo(x+s*.19,y-s*.2,x+s*.45,y-s*.12,x+s*.62,y);
   ctx.bezierCurveTo(x+s*.36,y+s*.08,x-s*.35,y+s*.1,x-s*.62,y);
   ctx.closePath();ctx.fill();ctx.stroke();
  };
  ctx.lineWidth=near?1.25:.8;
  ctx.fillStyle=near?'rgba(238,197,169,.13)':'rgba(201,204,236,.17)';
  ctx.strokeStyle=near?'rgba(255,226,172,.25)':'rgba(218,209,242,.23)';
  for(let i=0;i<10;i++)cloud(w*((i*41%97)/97),h*(.2+(i*29%71)/100),w*(.10+(i%4)*.035));
  // Hand-rendered accent islands are independent at two real physical depths.
  const islands=near?[[.81,.69,.115],[.12,.32,.075]]:[[.24,.53,.095],[.73,.20,.07]];
  for(let j=0;j<islands.length;j++){
   const [nx,ny,scale]=islands[j],x=w*nx,y=h*ny,s=w*scale;
   const rock=ctx.createLinearGradient(x,y,x,y+s*.75);
   rock.addColorStop(0,near?'rgba(96,88,119,.86)':'rgba(95,103,142,.65)');
   rock.addColorStop(1,near?'rgba(36,34,73,.06)':'rgba(59,63,112,.05)');
   ctx.fillStyle=rock;ctx.strokeStyle='rgba(35,36,74,.39)';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(x-s,y);ctx.bezierCurveTo(x-s*.62,y+s*.13,x-s*.17,y+s*.10,x,y+s*.06);
   ctx.bezierCurveTo(x+s*.6,y+s*.13,x+s,y+s*.04,x+s,y);
   ctx.lineTo(x+s*.32,y+s*.48);ctx.lineTo(x,y+s*.89);
   ctx.lineTo(x-s*.26,y+s*.48);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle=near?'rgba(151,188,135,.85)':'rgba(154,195,163,.55)';
   ctx.beginPath();ctx.ellipse(x,y-s*.05,s*1.04,s*.18,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='rgba(247,216,161,.41)';ctx.lineWidth=1;
   for(let n=0;n<8;n++){
    const cx=x+s*(-.7+n*.2);
    ctx.beginPath();ctx.moveTo(cx,y+s*.1);ctx.lineTo(cx-s*.09,y+s*(.20+n%3*.07));ctx.stroke();
   }
   ctx.fillStyle='rgba(249,219,169,.59)';
   for(let n=0;n<3;n++){
    const xx=x+s*(-.4+n*.32);
    ctx.fillRect(xx,y-s*(.24+n%2*.15),s*.09,s*.18);
   }
  }
  ctx.restore();
 }
 function mount({THREE,root,url}){
  if(!THREE?.PlaneGeometry||!THREE?.TextureLoader||!root?.getObjectByName||typeof document==='undefined')
   throw Error('Window illustration requires the loaded real 3D window and browser textures');
  const sky=root.getObjectByName('window_sky');
  const islands=Array.from({length:3},(_,i)=>root.getObjectByName('window_island_'+i));
  if(!sky||islands.some(x=>!x))throw Error('Missing canonical 3D window rig for illustrated scenery');
  const original=[sky,...islands],rootArt=new THREE.Group();
  rootArt.name='dh11c5d3e_window_depth_layers';
  rootArt.userData.decorativeOnly=true;rootArt.visible=false;root.add(rootArt);
  const makePlane=(layer,texture,transparent)=>{
   const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,
    transparent,depthWrite:!transparent,opacity:1,toneMapped:false});
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(...layer.size),material);
   mesh.name='dh11c5d3e_'+layer.name;
   mesh.position.set(0,0,layer.z);
   mesh.userData.decorativeOnly=true;mesh.raycast=()=>{};
   mesh.renderOrder=transparent?2:1;
   rootArt.add(mesh);return mesh;
  };
  const canvasLayer=(layer,near)=>{
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas context missing');
   drawAtmosphere(ctx,canvas.width,canvas.height,near);
   const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;
   return makePlane(layer,tx,true);
  };
  canvasLayer(LAYERS[1],false);
  canvasLayer(LAYERS[2],true);
  let requested=true,ready=false,failed=false;
  function sync(){
   const active=ready&&requested;
   rootArt.visible=active;
   for(const mesh of original)mesh.visible=!active;
   return active;
  }
  // The existing background stays visible if artwork cannot be loaded.
  new THREE.TextureLoader().load(url,texture=>{
   const img=texture.image,aspect=(img?.width||1)/(img?.height||1),desired=LAYERS[0].size[0]/LAYERS[0].size[1];
   const rx=Math.min(1,desired/aspect),ry=Math.min(1,aspect/desired);
   texture.repeat.set(rx,ry);texture.offset.set((1-rx)/2,(1-ry)/2);
   texture.colorSpace=THREE.SRGBColorSpace;
   makePlane(LAYERS[0],texture,false);ready=true;sync();
  },undefined,()=>{failed=true;sync();});
  sync();
  return Object.freeze({
   setVisible(on){requested=!!on;return sync();},
   get ready(){return ready;},get failed(){return failed;},
   get layers(){return LAYERS.length;}
  });
 }
 return Object.freeze({LAYERS,drawAtmosphere,mount});
});

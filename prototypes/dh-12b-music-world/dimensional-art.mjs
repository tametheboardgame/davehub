// DH-12B.2: the Music world's authored, geometry-first dimensional art.
// Procedural painted nebulae are ENVIRONMENT textures, never replacement
// frames for the real hinged portals, pull-out record crates or camera.
// No external media, network requests, recordings, branding or real projects.
const PI=Math.PI;
const TAU=PI*2;

export const DIMENSION_STYLE=Object.freeze({
 foyer:'The World Between Notes: shattered moonstone, impossible stairs, enchanted gateways',
 shop:'The Record Shop: celestial vinyl, open cosmic arches, ritual listening altar',
 palettes:Object.freeze({
  void:['#090b23','#24204a','#552e69','#247b83','#e8b46e'],
  theatre:['#6b284f','#b46b87','#efd5a1'],
  records:['#145665','#56ada6','#e5b66e']
 })
});

function seeded(seed){
 let value=seed>>>0;
 return ()=>{
  value=(Math.imul(value,1664525)+1013904223)>>>0;
  return value/4294967296;
 };
}

export function nebulaLayers(seed=17){
 const random=seeded(seed);
 const layers=[];
 for(let i=0;i<38;i++){
  layers.push({
   x:random(),y:random(),width:.07+random()*.29,
   height:.025+random()*.12,opacity:.025+random()*.13,
   rotation:(random()-.5)*2
  });
 }
 return layers;
}

export function floatingShardPose(index,total,elapsed=0){
 if(!Number.isInteger(index)||index<0||index>=total||total<1)
  throw Error('Invalid dimensional fragment index');
 const angle=TAU*index/total+.20*Math.sin(index*2.3);
 const radius=7.45+(index%5)*.39+(index%3)*.12;
 return {
  x:Math.cos(angle)*radius,
  y:-.52+Math.sin(index*2.13)*.39+Math.sin(elapsed*.31+index*.89)*.13,
  z:-2.15+Math.sin(angle)*radius,
  tilt:Math.sin(index*.83)*.26
 };
}

export function portalPulse(time,index){
 return 1+.15*Math.sin(time*.72+index*1.8);
}

function makeMaterial(THREE,colour,options={}){
 return new THREE.MeshStandardMaterial({
  color:colour,roughness:options.roughness??.63,
  metalness:options.metalness??.13,
  emissive:options.emissive??'#000000',
  emissiveIntensity:options.glow??0,
  transparent:!!options.transparent,
  opacity:options.opacity??1,
  side:options.doubleSided?THREE.DoubleSide:THREE.FrontSide
 });
}

function mesh(THREE,name,geometry,material,parent,xyz){
 const obj=new THREE.Mesh(geometry,material);
 obj.name=name;
 obj.position.set(...xyz);
 obj.castShadow=!!material.isMeshStandardMaterial;
 obj.receiveShadow=!!material.isMeshStandardMaterial;
 parent.add(obj);
 return obj;
}

function box(THREE,name,dimensions,position,material,parent){
 return mesh(THREE,name,new THREE.BoxGeometry(...dimensions),material,parent,position);
}

function stone(THREE,name,dimensions,position,material,parent,seed=0){
 const g=new THREE.DodecahedronGeometry(1,0);
 const node=mesh(THREE,name,g,material,parent,position);
 node.scale.set(...dimensions);
 node.rotation.set(seed*.17,seed*.47,seed*.14);
 return node;
}

function orb(THREE,name,r,position,material,parent){
 return mesh(THREE,name,new THREE.IcosahedronGeometry(r,1),material,parent,position);
}

function ring(THREE,name,r,tube,position,material,parent,tilt=0,arc=TAU){
 const node=mesh(THREE,name,new THREE.TorusGeometry(r,tube,9,96,arc),material,parent,position);
 node.rotation.x=tilt;
 return node;
}

function rod(THREE,name,from,to,diameter,material,parent){
 const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to);
 const vector=new THREE.Vector3().subVectors(b,a);
 const node=mesh(THREE,name,new THREE.CylinderGeometry(diameter,diameter,vector.length(),7),
  material,parent,a.clone().add(b).multiplyScalar(.5).toArray());
 node.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector.normalize());
 return node;
}

function ribbon(THREE,name,coords,radius,material,parent){
 const curve=new THREE.CatmullRomCurve3(coords.map(p=>new THREE.Vector3(...p)));
 return mesh(THREE,name,new THREE.TubeGeometry(curve,42,radius,7,false),
  material,parent,[0,0,0]);
}

function makeGlowTexture(THREE){
 const canvas=document.createElement('canvas');
 canvas.width=128;canvas.height=128;
 const ctx=canvas.getContext('2d');
 const g=ctx.createRadialGradient(64,64,0,64,64,64);
 g.addColorStop(0,'rgba(255,250,218,1)');
 g.addColorStop(.15,'rgba(254,226,173,.65)');
 g.addColorStop(.37,'rgba(176,188,255,.23)');
 g.addColorStop(1,'rgba(104,126,240,0)');
 ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}

function glowSprite(THREE,name,texture,position,size,colour,parent){
 const material=new THREE.SpriteMaterial({
  map:texture,color:colour,transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,opacity:.72
 });
 const obj=new THREE.Sprite(material);
 obj.name=name;obj.position.set(...position);obj.scale.set(size,size,1);parent.add(obj);
 return obj;
}

function nebulaSky(THREE,scene,variant){
 const cv=document.createElement('canvas');
 cv.width=1536;cv.height=768;
 const ctx=cv.getContext('2d');
 const ground=ctx.createLinearGradient(0,0,0,768);
 const stops=variant==='shop'?
  ['#070f20','#292145','#143d4b','#0b1b32']:
  ['#070a24','#281b4d','#432a61','#101b38'];
 stops.forEach((s,i)=>ground.addColorStop(i/(stops.length-1),s));
 ctx.fillStyle=ground;ctx.fillRect(0,0,cv.width,cv.height);
 // Layered soft pigment strokes make a static, painterly nebula environment.
 const random=seeded(variant==='shop'?704:341);
 ctx.globalCompositeOperation='screen';
 const colours=variant==='shop'?
  ['#426c9a','#298e91','#784678','#b87f58','#5cbd99']:
  ['#694b9f','#4e8caa','#bd729c','#4269a4','#d69c6c'];
 for(const blob of nebulaLayers(variant==='shop'?16:28)){
  const cx=blob.x*1536,cy=blob.y*768;
  const radius=blob.width*1536;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(blob.rotation);ctx.scale(1,blob.height/blob.width);
  const grad=ctx.createRadialGradient(0,0,2,0,0,radius);
  const c=colours[Math.floor(random()*colours.length)];
  grad.addColorStop(0,c+'bd');grad.addColorStop(.35,c+'65');grad.addColorStop(1,c+'00');
  ctx.globalAlpha=blob.opacity*2.7;
  ctx.fillStyle=grad;ctx.fillRect(-radius,-radius,radius*2,radius*2);
  ctx.restore();
 }
 ctx.globalAlpha=1;
 for(let i=0;i<900;i++){
  const x=random()*1536,y=random()*768;
  const r=.30+Math.pow(random(),6)*2;
  ctx.fillStyle=i%8===0?'#f3cbab':i%5===0?'#c9bcff':'#daeafa';
  ctx.globalAlpha=.18+random()*.78;
  ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  if(i%41===0){
   ctx.strokeStyle='#d4c5e7';ctx.globalAlpha=.28;
   ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);
   ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();
  }
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 const texture=new THREE.CanvasTexture(cv);
 texture.colorSpace=THREE.SRGBColorSpace;
 const sky=mesh(THREE,'impossible-painterly-cosmic-vault',
  new THREE.SphereGeometry(86,64,40),
  new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,depthWrite:false,fog:false}),
  scene,[0,0,0]);
 sky.castShadow=false;sky.receiveShadow=false;sky.renderOrder=-20;
 return sky;
}

function makeParticles(THREE,scene,variant){
 const count=variant==='shop'?230:360;
 const coords=[],colours=[];
 const random=seeded(variant==='shop'?271:281);
 const palette=variant==='shop'?['#a9f1dc','#edb8a2','#f6dfac']:['#ffd5bc','#aad0f4','#e2c6fa'];
 for(let i=0;i<count;i++){
  const a=random()*TAU,r=2.4+random()*16;
  coords.push(Math.cos(a)*r,1+random()*10,-5+Math.sin(a)*r);
  const colour=new THREE.Color(palette[i%palette.length]);
  colours.push(colour.r,colour.g,colour.b);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
 const points=new THREE.Points(geometry,new THREE.PointsMaterial({
  color:0xffffff,vertexColors:true,size:.065,transparent:true,opacity:.84,
  depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true
 }));
 points.name='slow-drifting-dimension-dust';
 scene.add(points);
 return points;
}

function lantern(THREE,name,parent,xyz,materials,glowTexture){
 const rig=new THREE.Group();
 rig.name=name;rig.position.set(...xyz);parent.add(rig);
 rod(THREE,name+'-suspension',[0,.25,0],[0,.83,0],.016,materials.gold,rig);
 ring(THREE,name+'-coronet',.17,.028,[0,.18,0],materials.gold,rig);
 stone(THREE,name+'-glass',[.20,.33,.20],[0,0,0],materials.glass,rig);
 ring(THREE,name+'-underframe',.16,.024,[0,-.19,0],materials.gold,rig);
 glowSprite(THREE,name+'-luminous-halo',glowTexture,[0,0,.08],1.38,'#fff0c7',rig);
 return rig;
}

function portalShader(THREE,name,parent,colourA,colourB){
 const material=new THREE.ShaderMaterial({
  uniforms:{
   uTime:{value:0},
   uA:{value:new THREE.Color(colourA)},
   uB:{value:new THREE.Color(colourB)}
  },
  vertexShader:`varying vec2 vUv;
    void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform float uTime;uniform vec3 uA;uniform vec3 uB;
    varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
      vec2 p=vUv*2.0-1.0;
      float r=length(vec2(p.x,p.y*.72));
      float ang=atan(p.y,p.x);
      float swirl=.5+.5*sin(ang*4.0+14.0*r-uTime*.65+sin(p.y*3.0)*.9);
      float a=.5+.5*sin(p.y*7.0+sin(p.x*6.0+uTime*.30)*1.4);
      float veil=1.0-smoothstep(.60,1.34,r);
      vec3 col=mix(uA,uB,clamp(.26+.48*swirl+.20*a,0.0,1.0));
      col+=vec3(.18,.16,.24)*pow(max(0.0,1.0-r),2.0);
      float stars=step(.996,hash(floor((p+1.0)*vec2(27.0,34.0)+floor(uTime*.08))));
      col+=stars*.65;
      float arc=pow(max(0.0,sin(17.0*r-4.0*ang-uTime*.44)),12.0)*.18;
      col+=arc;
      gl_FragColor=vec4(col,clamp(veil*.96+.06,.0,1.0));
    }`,
  transparent:true,depthWrite:false,side:THREE.DoubleSide
 });
 const plane=mesh(THREE,name,new THREE.PlaneGeometry(2.35,3.40,1,1),
  material,parent,[0,1.94,-.47]);
 plane.castShadow=false;plane.receiveShadow=false;
 return material;
}

function drawRunes(THREE,root,radius,center,materials,count=32){
 const [cx,cy,cz]=center;
 ring(THREE,'real-arcane-music-ring-'+radius,radius,.028,center,materials.line,root,-PI/2);
 for(let i=0;i<count;i++){
  const a=TAU*i/count;
  const r1=radius-.09,r2=radius+(i%4===0?.19:.055);
  rod(THREE,'engraved-rune-tick-'+radius+'-'+i,
   [cx+Math.cos(a)*r1,cy,cz+Math.sin(a)*r1],
   [cx+Math.cos(a)*r2,cy,cz+Math.sin(a)*r2],
   i%4===0?.019:.009,materials.line,root);
 }
}

export function buildFoyerDimension({THREE,scene,thresholds,reducedMotion=false}){
 if(!THREE||!scene||!thresholds?.theatre||!thresholds?.records)
  throw Error('Dimensional foyer requires the two original actual door rigs');
 const sky=nebulaSky(THREE,scene,'foyer');
 const particles=makeParticles(THREE,scene,'foyer');
 const glowTexture=makeGlowTexture(THREE);
 const architecture=new THREE.Group();
 architecture.name='broken-world-moonstone-architecture';
 scene.add(architecture);
 const materials={
  obsidian:makeMaterial(THREE,'#252038',{roughness:.86}),
  stone:makeMaterial(THREE,'#65577a'),
  litStone:makeMaterial(THREE,'#937e92',{emissive:'#534363',glow:.10}),
  rose:makeMaterial(THREE,'#a85a80',{emissive:'#7e3357',glow:.19}),
  teal:makeMaterial(THREE,'#4e9b9e',{emissive:'#26757d',glow:.24}),
  gold:makeMaterial(THREE,'#d5ad76',{roughness:.38,metalness:.64}),
  line:makeMaterial(THREE,'#e7c17f',{emissive:'#aa7239',glow:.40}),
  glass:makeMaterial(THREE,'#f6dfaa',{emissive:'#eab96b',glow:.78})
 };
 // The original raised circular platform remains a real solid mesh.
 // The broken moonstone halo surrounds it with physically separated shards.
 const shardNodes=[];
 for(let i=0;i<36;i++){
  const pose=floatingShardPose(i,36);
  const shard=stone(THREE,'suspended-moonstone-fragment-'+i,
   [.36+(i%3)*.13,.18+(i%4)*.07,.48+(i%5)*.08],
   [pose.x,pose.y,pose.z],i%3===0?materials.litStone:materials.obsidian,architecture,i);
  shard.rotation.z=pose.tilt;
  shardNodes.push({node:shard,index:i});
  if(i%3===0){
   orb(THREE,'detached-gold-spark-'+i,.038,[pose.x,pose.y+.20,pose.z],
    materials.line,architecture);
  }
 }
 for(const radius of [2.1,3.0,4.7,6.0]){
  drawRunes(THREE,architecture,radius,[0,.071,-2.10],materials,
   radius>4?44:24);
 }
 // Constellation paths are real luminous lines suspended above the floor.
 for(let i=0;i<7;i++){
  const a=i*TAU/7;
  const points=[];
  for(let j=0;j<=7;j++){
   const t=j/7;
   const r=1.2+t*3.7;
   points.push([Math.sin(a+t*.31)*r,.10+Math.sin(t*PI)*.12,-2.1+Math.cos(a+t*.31)*r]);
  }
  ribbon(THREE,'seven-routes-between-realms-'+i,points,.012,materials.line,architecture);
 }
 // Two staircases refuse to meet any ordinary landing. Every step is a
 // separate real stone, hanging above the cosmic void beyond the island.
 const stairs=[];
 for(const side of [-1,1]){
  const stairway=new THREE.Group();
  stairway.name=side<0?'stairs-that-lead-into-the-void-left':'stairs-that-lead-into-the-void-right';
  architecture.add(stairway);
  for(let i=0;i<13;i++){
   const t=i/12;
   const x=side*(6.65+t*4.4);
   const y=.32+t*5.2;
   const z=-4.45-t*3.8;
   const tread=stone(THREE,'levitating-stair-tread-'+side+'-'+i,
    [.55,.16,.24],[x,y,z],i%3===0?materials.litStone:materials.stone,stairway,i*1.5);
   tread.rotation.y=side*(.2+t*.85);
   if(i===5||i===9)stairs.push(tread);
  }
 }
 // Incomplete far arches and moon rings frame the deliberately impossible
 // silhouette without enclosing the scene in a box.
 const brokenArches=[];
 for(const [index,x,y,z,scale] of [
  [0,-9.0,5.1,-10.4,1.4],[1,8.9,5.5,-10.9,1.8],
  [2,0,9.8,-15.2,2.1]
 ]){
  const arch=ring(THREE,'orphaned-levitating-arch-'+index,2.0*scale,.085,
   [x,y,z],index%2?materials.teal:materials.rose,architecture,0,PI*.88);
  arch.rotation.z=.25+index*.42;
  brokenArches.push(arch);
  stone(THREE,'fallen-keystone-'+index,[.24,.35,.29],
   [x+scale*.75,y+scale*1.2,z],materials.litStone,architecture,index);
 }
 const lamps=[];
 for(const [i,x,y,z] of [
  [0,-5.3,4.3,.9],[1,5.3,4.2,.9],[2,-8.8,6.5,-6.6],
  [3,8.5,7.0,-7.2],[4,-.65,7.1,-9.4]
 ]){
  const l=lantern(THREE,'enchanted-hanging-lantern-'+i,architecture,
   [x,y,z],materials,glowTexture);
  lamps.push({node:l,y,phase:i*1.1});
 }
 const shaders=[];
 const ornaments=[];
 for(const [index,id] of ['theatre','records'].entries()){
  const portal=thresholds[id].root;
  // Genuine glowing threshold plane behind, not a substitute for real doors.
  shaders.push(portalShader(THREE,'living-portal-veil-'+id,portal,
   index===0?'#4f2369':'#104f61',index===0?'#e49d91':'#75d5a7'));
  for(const side of [-1,1]){
   // Two sculpted arched ribs physically rise around the existing doorway.
   ribbon(THREE,'twisted-gilt-portal-rib-'+id+'-'+side,[
    [side*1.54,.28,.20],[side*1.74,1.38,.21],
    [side*1.70,2.73,.17],[side*1.29,4.09,.16],
    [side*.54,4.48,.12]
   ],.082,materials.gold,portal);
   for(let i=0;i<4;i++){
    const y=1.07+i*.72;
    orb(THREE,'magical-portal-finial-'+id+'-'+side+'-'+i,
     .075,[side*1.48,y,.35],index===0?materials.rose:materials.teal,portal);
   }
  }
  ring(THREE,'gilded-living-vault-'+id,1.35,.062,
   [0,3.55,.32],materials.line,portal,0,PI);
  // Actual magic detaches from the door rig and slowly orbits it.
  const orbit=new THREE.Group();
  orbit.name='orbiting-music-portal-ornaments-'+id;
  orbit.position.set(0,2.2,.36);portal.add(orbit);
  for(let k=0;k<9;k++){
   const a=k*TAU/9;
   stone(THREE,'orbiting-gem-'+id+'-'+k,
    [.09,.14,.08],[Math.cos(a)*1.34,Math.sin(a)*1.63,0],
    k%2?materials.line:index===0?materials.rose:materials.teal,orbit,k+3);
  }
  ornaments.push({node:orbit,index});
  if(index===0){
   // Velvety sculpted theatre banners, masks and gilded ribbon swags.
   for(const side of [-1,1]){
    const curtain=mesh(THREE,'living-theatre-velvet-banner-'+side,
     new THREE.PlaneGeometry(.48,2.35,13,10),
     makeMaterial(THREE,'#792849',{roughness:.93,doubleSided:true}),
     portal,[side*1.58,2.30,.37]);
    const positions=curtain.geometry.attributes.position;
    for(let k=0;k<positions.count;k++){
     const x=positions.getX(k),y=positions.getY(k);
     positions.setZ(k,.06*Math.sin(x*21)+.035*Math.sin(y*9));
    }
    curtain.geometry.computeVertexNormals();
    curtain.rotation.z=side*.09;
   }
   for(const side of [-1,1]){
    orb(THREE,'theatrical-gilded-mask-'+side,.19,
     [side*.47,4.78,.18],materials.glass,portal);
    ring(THREE,'theatre-mask-halo-'+side,.23,.026,
     [side*.47,4.78,.12],materials.gold,portal);
   }
   ribbon(THREE,'golden-theatre-swag',[
    [-1.20,4.62,.34],[-.65,4.43,.46],[0,4.35,.50],
    [.66,4.43,.46],[1.20,4.62,.34]
   ],.037,materials.line,portal);
  }else{
   // A giant physical vinyl crown and hovering blank sleeve silhouettes
   // distinguish this doorway from the theatre before crossing it.
   const vinyl=mesh(THREE,'interdimensional-vinyl-crown',
    new THREE.CylinderGeometry(.55,.55,.035,64),
    makeMaterial(THREE,'#1b1b35',{roughness:.32,metalness:.23}),
    portal,[0,5.22,.31]);
   vinyl.rotation.x=PI/2;
   ring(THREE,'vinyl-crown-groove-one',.39,.017,[0,5.22,.337],
    materials.line,portal);
   ring(THREE,'vinyl-crown-groove-two',.27,.012,[0,5.22,.343],
    materials.teal,portal);
   orb(THREE,'vinyl-crown-label',.12,[0,5.22,.36],materials.glass,portal);
   for(const side of [-1,1]){
    for(let k=0;k<3;k++){
     const sleeve=box(THREE,'floating-record-sleeve-sigil-'+side+'-'+k,
      [.28,.38,.024],[side*(1.45+k*.21),3.75-k*.36,.30],
      k%2?materials.line:materials.teal,portal);
     sleeve.rotation.z=side*(.12+k*.14);
    }
   }
  }
 }
 const start=performance.now?.()||0;
 let elapsed=0;
 function update(dt,focus){
  const step=Math.min(.08,Math.max(0,Number(dt)||0));
  if(!reducedMotion)elapsed+=step;
  sky.rotation.y=elapsed*.0018;
  particles.rotation.y=Math.sin(elapsed*.075)*.055;
  for(const x of shardNodes){
   const pose=floatingShardPose(x.index,36,elapsed);
   x.node.position.y=pose.y;
   x.node.rotation.y+=step*.012;
  }
  for(const x of lamps){
   x.node.position.y=x.y+(reducedMotion?0:Math.sin(elapsed*.42+x.phase)*.17);
   x.node.rotation.z=(reducedMotion?0:Math.sin(elapsed*.37+x.phase)*.055);
  }
  for(const x of ornaments){
   x.node.rotation.z=(reducedMotion?0:elapsed*(x.index?-.052:.061));
  }
  for(const shader of shaders)shader.uniforms.uTime.value=elapsed;
  for(const [index,id] of ['theatre','records'].entries()){
   const light=thresholds[id].light;
   // Preserve interaction-owned intensity. Only colour is gently magical.
   light.color.lerp(new THREE.Color(index?'#86d9c5':'#ef9dbf'),.045);
  }
 }
 return Object.freeze({update,sky,particles,kind:'foyer'});
}

export function buildRecordDimension({THREE,scene,crates,listening,disc,reducedMotion=false}){
 if(!THREE||!scene||!crates?.singles||!crates?.bands||!crates?.albums||
  !listening||!disc)throw Error('Real shop crates and turntable are required');
 const sky=nebulaSky(THREE,scene,'shop');
 const particles=makeParticles(THREE,scene,'shop');
 const glowTexture=makeGlowTexture(THREE);
 const root=new THREE.Group();root.name='enchanted-shop-architecture';
 scene.add(root);
 const m={
  oak:makeMaterial(THREE,'#5b3f48'),
  copper:makeMaterial(THREE,'#c3905c',{metalness:.56,roughness:.43}),
  teal:makeMaterial(THREE,'#5eb6ab',{emissive:'#2b8e8d',glow:.36}),
  indigo:makeMaterial(THREE,'#353251'),
  velvet:makeMaterial(THREE,'#845077'),
  gold:makeMaterial(THREE,'#f2c68c',{emissive:'#ab7a40',glow:.38}),
  pale:makeMaterial(THREE,'#eadcb9',{emissive:'#a77b4c',glow:.13}),
  crystal:makeMaterial(THREE,'#78cfc6',{roughness:.24,metalness:.24,
   emissive:'#398c91',glow:.77})
 };
 // The shop is no longer a closed box: the old rear walls are replaced
 // by stone archways opening directly onto the cosmic dimension.
 for(let i=0;i<5;i++){
  const x=-5.18+i*2.59;
  stone(THREE,'crooked-wooden-support-'+i,[.18,2.7,.22],
   [x,2.44,-5.57],i%2?m.oak:m.copper,root,i+3);
  const capital=box(THREE,'impossible-support-capital-'+i,[.62,.16,.45],
   [x,4.86,-5.48],m.copper,root);
  capital.rotation.z=Math.sin(i*2.4)*.07;
 }
 for(let i=0;i<4;i++){
  const x=-3.85+i*2.57;
  const arch=ring(THREE,'open-celestial-window-vault-'+i,1.1,.075,
   [x,3.18,-5.47],i%2?m.teal:m.gold,root,0,PI);
  arch.scale.y=1.20;
  ribbon(THREE,'impossible-window-vines-'+i,[
   [x-1.03,4.5,-5.43],[x-.72,3.93,-5.39],
   [x-.86,3.14,-5.32],[x-.62,2.18,-5.37]
  ],.045,i%2?m.teal:m.velvet,root);
  orb(THREE,'window-dimension-star-'+i,.105,
   [x,3.02,-5.46],m.crystal,root);
 }
 // A spectral gold-and-moonstone mandala built into the physical floor at
 // the actual listening deck. It does not create a fake floor surface.
 const sigil=new THREE.Group();
 sigil.name='moonlit-listening-ritual-sigil';
 sigil.position.set(3.55,-.060,2.18);
 root.add(sigil);
 for(const r of [1.08,1.32,1.75,2.04]){
  ring(THREE,'real-celestial-vinyl-mandala-'+r,r,.021,
   [0,0,0],r===1.32?m.teal:m.gold,sigil,-PI/2);
 }
 for(let i=0;i<24;i++){
  const angle=i*TAU/24;
  rod(THREE,'floor-alchemy-spoke-'+i,
   [Math.cos(angle)*1.82,0,Math.sin(angle)*1.82],
   [Math.cos(angle)*(i%3?1.90:2.13),0,Math.sin(angle)*(i%3?1.90:2.13)],
   .015,m.gold,sigil);
  if(i%3===0)stone(THREE,'floor-orbit-crystal-'+i,[.08,.09,.08],
   [Math.cos(angle)*2.06,.055,Math.sin(angle)*2.06],m.crystal,sigil,i);
 }
 const orbit=ring(THREE,'levitating-ritual-halo',.93,.035,
  [3.55,2.15,2.19],m.teal,root,0);
 orbit.rotation.x=PI/2;
 // Three independent record-rack alcoves. The shelves retain their original
 // mechanical slides and safe blank sleeves but gain physically layered rims,
 // copper arches, tangled fixtures and suspended listening curiosities.
 const ambientRecords=[];
 for(const [i,id] of ['singles','bands','albums'].entries()){
  const rack=crates[id].rack;
  for(const side of [-1,1]){
   ribbon(THREE,'copper-rack-root-'+id+'-'+side,[
    [side*1.23,.31,.65],[side*1.38,1.36,.70],
    [side*1.41,2.62,.68],[side*1.11,3.57,.65],
    [side*.64,3.75,.64]
   ],.044,m.copper,rack);
  }
  const signOrb=orb(THREE,'floating-record-rack-orb-'+id,.13,
   [0,3.61,.73],i%2?m.gold:m.crystal,rack);
  glowSprite(THREE,'record-rack-glimmer-'+id,glowTexture,
   [0,3.61,.76],.87,'#ffdbb4',rack);
  for(let k=0;k<8;k++){
   const a=k*TAU/8;
   stone(THREE,'rack-levitating-lettermark-'+id+'-'+k,
    [.055,.07,.045],[Math.cos(a)*.53,3.66+Math.sin(a)*.24,.73],
    k%2?m.teal:m.gold,rack,k+1);
  }
  for(let j=0;j<4;j++){
   const upright=box(THREE,'off-centre-crystal-jar-'+id+'-'+j,
    [.11,.16,.09],[(-1.5+j)*.50,2.17,.56],
    j%2?m.crystal:m.velvet,rack);
   upright.rotation.z=(j-1.5)*.12;
  }
 }
 // Records actually float inside the shop. A wall of eight ordinary albums
 // would not read as an alternative dimension, so some vinyl defies gravity.
 for(let i=0;i<11;i++){
  const x=-5.0+(i%6)*1.82;
  const y=3.12+(i%4)*.50;
  const z=i%2?-.65:1.08;
  const assembly=new THREE.Group();
  assembly.name='levitating-blank-vinyl-'+i;
  assembly.position.set(x,y,z);
  root.add(assembly);
  const darkVinyl=makeMaterial(THREE,'#191c32',{metalness:.38,roughness:.34});
  const disk=mesh(THREE,'physical-hovering-vinyl-disc-'+i,
   new THREE.CylinderGeometry(.28,.28,.025,48),darkVinyl,assembly,[0,0,0]);
  disk.rotation.x=PI/2;
  ring(THREE,'floating-record-grooves-'+i,.19,.009,
   [0,0,.019],i%3?m.copper:m.teal,assembly);
  ring(THREE,'floating-record-grooves-inner-'+i,.12,.009,
   [0,0,.022],m.gold,assembly);
  orb(THREE,'unlabelled-record-centre-'+i,.051,
   [0,0,.035],m.crystal,assembly);
  ambientRecords.push({node:assembly,x,y,phase:i*.96,spin:(i%2?1:-1)*.09});
 }
 // A spiral stair to nowhere peels away from the rear-right corner. It has
 // no flat image backplate and gives the shop a second impossible depth.
 const stairs=[];
 for(let i=0;i<12;i++){
  const a=i*.27;
  const x=4.42+Math.sin(a)*.65;
  const y=.72+i*.33;
  const z=-3.66-i*.35;
  const tread=stone(THREE,'impossible-shop-back-stair-'+i,
   [.48,.14,.29],[x,y,z],i%2?m.oak:m.copper,root,i*.41);
  tread.rotation.y=a*.6;
  stairs.push(tread);
 }
 // Copper/teal lanterns hang at different heights, while one record mobile
 // turns lazily above the silent altar.
 const lanterns=[];
 for(const [i,x,y,z] of [
  [0,-4.8,3.70,2.25],[1,4.7,4.30,1.65],
  [2,-2.2,4.05,-1.10],[3,2.25,4.42,-1.30]
 ]){
  const l=lantern(THREE,'suspended-record-shop-lantern-'+i,root,
   [x,y,z],m,glowTexture);
  lanterns.push({node:l,y,phase:i*1.45});
 }
 const mobile=new THREE.Group();
 mobile.name='orbiting-moon-and-record-mobile';
 mobile.position.set(-.10,4.50,.75);root.add(mobile);
 ring(THREE,'copper-orbit-one',.95,.042,[0,0,0],m.copper,mobile,0);
 ring(THREE,'copper-orbit-two',.72,.028,[0,0,.13],m.teal,mobile,0);
 for(let i=0;i<9;i++){
  const a=i*TAU/9;
  stone(THREE,'revolving-hanging-notemark-'+i,[.08,.14,.06],
   [Math.sin(a)*.95,Math.cos(a)*.95,.04],i%2?m.gold:m.crystal,mobile,i);
 }
 let elapsed=0;
 function update(dt,playing){
  const step=Math.min(.08,Math.max(0,Number(dt)||0));
  if(!reducedMotion)elapsed+=step;
  sky.rotation.y=elapsed*.0015;
  particles.rotation.y=Math.sin(elapsed*.07)*.045;
  sigil.rotation.y=0; // the floor sigil remains attached to the actual floor
  orbit.rotation.z=reducedMotion?0:elapsed*.12;
  mobile.rotation.z=reducedMotion?0:elapsed*.055;
  for(const record of ambientRecords){
   record.node.position.y=record.y+(reducedMotion?0:Math.sin(elapsed*.64+record.phase)*.20);
   record.node.rotation.y=reducedMotion?0:elapsed*record.spin;
   record.node.rotation.z=.10*Math.sin(elapsed*.31+record.phase);
  }
  for(const entry of lanterns){
   entry.node.position.y=entry.y+(reducedMotion?0:Math.sin(elapsed*.45+entry.phase)*.10);
  }
 }
 return Object.freeze({update,kind:'shop',sky,particles});
}

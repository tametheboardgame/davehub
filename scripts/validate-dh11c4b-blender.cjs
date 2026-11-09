'use strict';
// Validate a Blender-exported cabinet against the original geometry contract.
// No third-party npm dependencies; checks actual GLB scenes and node transforms.
const fs=require('node:fs');
const crypto=require('node:crypto');
const {build,SLUGS,SLOT_Y}=require('./build-dh11c4-cabinet-glb.cjs');

function glbJson(buffer){
 if(buffer.length<28||buffer.readUInt32LE(0)!==0x46546c67||buffer.readUInt32LE(4)!==2||buffer.readUInt32LE(8)!==buffer.length)
  throw Error('Invalid glTF 2.0 binary header');
 if(buffer.readUInt32LE(16)!==0x4e4f534a)throw Error('Missing JSON chunk');
 const size=buffer.readUInt32LE(12);
 if(size<10||20+size>buffer.length)throw Error('GLB JSON chunk length invalid');
 const json=JSON.parse(buffer.subarray(20,20+size).toString('utf8'));
 if(json.asset?.version!=='2.0'||!Array.isArray(json.nodes)||!Array.isArray(json.meshes))throw Error('Invalid GLB scene');
 return json;
}
const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function multiply(a,b){
 const o=Array(16).fill(0);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];
 return o;
}
function localMatrix(n){
 if(n.matrix)return n.matrix;
 const [x,y,z]=n.translation||[0,0,0], [qx,qy,qz,qw]=n.rotation||[0,0,0,1], [sx,sy,sz]=n.scale||[1,1,1];
 const xx=qx*qx, yy=qy*qy, zz=qz*qz,xy=qx*qy,xz=qx*qz,yz=qy*qz,wx=qw*qx,wy=qw*qy,wz=qw*qz;
 return [
  (1-2*(yy+zz))*sx,(2*(xy+wz))*sx,(2*(xz-wy))*sx,0,
  (2*(xy-wz))*sy,(1-2*(xx+zz))*sy,(2*(yz+wx))*sy,0,
  (2*(xz+wy))*sz,(2*(yz-wx))*sz,(1-2*(xx+yy))*sz,0,
  x,y,z,1
 ];
}
function hierarchy(json){
 const names=new Map();
 json.nodes.forEach((n,i)=>{
  if(names.has(n.name))throw Error('Duplicate named node '+n.name);
  names.set(n.name,i);
 });
 const parent=new Map();
 json.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>{
  if(parent.has(c))throw Error('Node has multiple parents');
  parent.set(c,i);
 }));
 function world(i){
  const visited=new Set();
  let m=localMatrix(json.nodes[i]),at=i;
  while(parent.has(at)){
   at=parent.get(at);
   if(visited.has(at))throw Error('Cycle in GLB nodes');
   visited.add(at);
   m=multiply(localMatrix(json.nodes[at]),m);
  }
  return m;
 }
 function ancestor(child,root){
  let i=names.get(child);const id=names.get(root);
  if(i===undefined||id===undefined)return false;
  for(let k=0;k<json.nodes.length;k++){if(i===id)return true;if(!parent.has(i))return false;i=parent.get(i);}
  return false;
 }
 return {names,world,ancestor};
}
function check(source,exported){
 const a=glbJson(source),b=glbJson(exported),ha=hierarchy(a),hb=hierarchy(b);
 if(!b.scenes?.length||b.meshes.length<6)throw Error('Export lost mesh primitives');
 const required=['cabinet_root','cabinet_case','cabinet_rails','case_back','case_left','case_right','case_top','case_bottom'];
 for(const slug of SLUGS){
  required.push('cabinet_slot_'+slug,'drawer_'+slug,'drawer_front_'+slug,'tray_'+slug,'tray_floor_'+slug,
   'tray_left_'+slug,'tray_right_'+slug,'tray_rear_'+slug,'folders_'+slug,
   'track_left_'+slug,'track_right_'+slug,'label_plate_'+slug,'brass_handle_'+slug);
  for(let i=0;i<4;i++)required.push('folder_'+slug+'_'+i);
 }
 for(const name of required)if(!hb.names.has(name))throw Error('Blender GLB lost node: '+name);
 if(hb.names.has('cabinet_solid')||hb.names.has('case_solid'))throw Error('Solid-case regression');
 if(!hb.ancestor('cabinet_case','cabinet_root')||!hb.ancestor('cabinet_rails','cabinet_root'))throw Error('Cabinet parts detached');
 let maxDrift=0;
 for(const name of required){
  if(!ha.names.has(name))throw Error('Reference model missing '+name);
  const aw=ha.world(ha.names.get(name));
  const bw=hb.world(hb.names.get(name));
  const distance=Math.hypot(aw[12]-bw[12],aw[13]-bw[13],aw[14]-bw[14]);
  maxDrift=Math.max(distance,maxDrift);
  if(distance>.025)throw Error(name+' moved by '+distance.toFixed(4)+'m during Blender export');
 }
 for(let i=0;i<SLUGS.length;i++){
  const slug=SLUGS[i],name='drawer_'+slug;
  if(!hb.ancestor(name,'cabinet_root'))throw Error(name+' detached from cabinet root');
  for(const child of ['drawer_front_','tray_','folders_'])
   if(!hb.ancestor(child+slug,name))throw Error(child+slug+' lost shared moving pivot');
  const w=hb.world(hb.names.get(name));
  if(Math.abs(w[13]-SLOT_Y[i])>.025||Math.abs(w[14]-.51)>.025)throw Error(name+' lost drawer slot position');
  // glTF drawer local +Z should resolve to global +Z, regardless of Blender's Z-up UI.
  const axis=[w[8],w[9],w[10]];
  if(Math.hypot(axis[0],axis[1],axis[2]-1)>.025)throw Error(name+' drawer travel axis no longer points outwards');
 }
 for(const item of b.meshes)for(const primitive of item.primitives||[]){
  if(primitive.attributes?.POSITION===undefined||primitive.attributes?.NORMAL===undefined)
   throw Error('Blender export lost position or normal attributes');
 }
 return {nodes:b.nodes.length,meshes:b.meshes.length,maxDriftMetres:maxDrift,drawers:SLUGS.length,axis:'local +Z'};
}
if(require.main===module){
 const [sourcePath,exportPath,reportPath]=process.argv.slice(2);
 if(!sourcePath||!exportPath||!reportPath)throw Error('Expected input.glb output.glb report.json');
 const source=fs.readFileSync(sourcePath),exported=fs.readFileSync(exportPath),report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
 const actual=check(source,exported);
 if(!report.importAndReexport||report.drawerNames.length!==5)throw Error('Blender report is incomplete');
 const hash=crypto.createHash('sha256').update(exported).digest('hex');
 if(report.exportSha256!==hash)throw Error('Export SHA-256 mismatch');
 if(report.meshCount<40||report.objectCount<100)throw Error('Incomplete editable Blender geometry');
 console.log('PASS DH-11C.4B Blender glTF round-trip:',JSON.stringify(actual));
 console.log('PASS Blender version:',report.blenderVersion);
}
module.exports={glbJson,localMatrix,hierarchy,check};

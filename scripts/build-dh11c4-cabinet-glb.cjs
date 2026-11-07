'use strict';
// DH-11C.4A: deterministic, editable geometry-source proof for an actual GLB.
// This is the FIRST model round-trip, not a claim that Blender work or textures
// have been completed. One metre = one world unit. Three.js and glTF are Y-up.
// Cabinet parent in room remains at [-4.7,0,-3.25]. Drawers extend in local +Z.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const SLUGS=['finished','drafts','oddities','fragments','field_notes'];
const names=['Finished','Drafts','Oddities','Fragments','Field Notes'];
const SLOT_Y=names.map((_,i)=>Number((3.18-i*.615).toFixed(3)));
const MATERIALS=[
 ['case','#59727A'],['trim','#8897A2'],['recess','#2F414A'],
 ['drawer','#769097'],['tray','#947E6C'],['brass','#B9A178'],
 ['folder','#DBCBB0'],['label','#E8DCC0']
];
function toLinear(x){const n=parseInt(x,16)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}
function colour(hex){return [1,3,5].map(i=>toLinear(hex.slice(i,i+2)));}
function makeCubeBinary(){
 const faces=[
  {n:[0,0,1],v:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},
  {n:[0,0,-1],v:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},
  {n:[1,0,0],v:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},
  {n:[-1,0,0],v:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]},
  {n:[0,1,0],v:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},
  {n:[0,-1,0],v:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]}
 ];
 const positions=[],normals=[],uvs=[],indices=[];
 for(let f=0;f<faces.length;f++){
  const face=faces[f];
  for(let j=0;j<4;j++){
   positions.push(...face.v[j]);
   normals.push(...face.n);
   uvs.push(...[[0,0],[1,0],[1,1],[0,1]][j]);
  }
  indices.push(...[0,1,2,0,2,3].map(x=>x+f*4));
 }
 const pos=Buffer.alloc(positions.length*4),norm=Buffer.alloc(normals.length*4),uv=Buffer.alloc(uvs.length*4),idx=Buffer.alloc(indices.length*2);
 positions.forEach((v,i)=>pos.writeFloatLE(v,i*4));
 normals.forEach((v,i)=>norm.writeFloatLE(v,i*4));
 uvs.forEach((v,i)=>uv.writeFloatLE(v,i*4));
 indices.forEach((v,i)=>idx.writeUInt16LE(v,i*2));
 return {binary:Buffer.concat([pos,norm,uv,idx]),byteLengths:[pos.length,norm.length,uv.length,idx.length]};
}
function build(){
 const {binary,byteLengths}=makeCubeBinary();
 const [positionsBytes,normalsBytes,uvBytes,indicesBytes]=byteLengths;
 const bufferViews=[
  {buffer:0,byteOffset:0,byteLength:positionsBytes,target:34962},
  {buffer:0,byteOffset:positionsBytes,byteLength:normalsBytes,target:34962},
  {buffer:0,byteOffset:positionsBytes+normalsBytes,byteLength:uvBytes,target:34962},
  {buffer:0,byteOffset:positionsBytes+normalsBytes+uvBytes,byteLength:indicesBytes,target:34963}
 ];
 const accessors=[
  {bufferView:0,componentType:5126,count:24,type:'VEC3',min:[-.5,-.5,-.5],max:[.5,.5,.5]},
  {bufferView:1,componentType:5126,count:24,type:'VEC3'},
  {bufferView:2,componentType:5126,count:24,type:'VEC2'},
  {bufferView:3,componentType:5123,count:36,type:'SCALAR',min:[0],max:[23]}
 ];
 const materials=MATERIALS.map(([name,hex])=>({
  name,pbrMetallicRoughness:{baseColorFactor:[...colour(hex),1],
  metallicFactor:name==='brass'?.55:.02,roughnessFactor:name==='brass'?.46:.83},
  doubleSided:false
 }));
 const meshes=MATERIALS.map(([name],index)=>({
  name:'box_'+name,primitives:[{attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},indices:3,material:index,mode:4}]
 }));
 const nodes=[];
 function group(name,parent,translation){
  const id=nodes.length;
  nodes.push({name,children:[],...(translation?{translation}: {})});
  if(parent!==null)nodes[parent].children.push(id);
  return id;
 }
 function box(name,parent,material,size,translation){
  if(size.some(x=>x<=0))throw Error('Invalid solid '+name);
  const id=nodes.length;
  nodes.push({name,mesh:MATERIALS.findIndex(([n])=>n===material),scale:size,translation});
  if(nodes[id].mesh<0)throw Error('Invalid material '+material);
  nodes[parent].children.push(id);
  return id;
 }
 const root=group('cabinet_root',null);
 const caseRoot=group('cabinet_case',root);
 // True hollow shell: independent back, floor, top and side walls. NO full solid case box.
 box('case_back',caseRoot,'case',[1.9,3.64,.09],[0,1.83,-.72]);
 box('case_left',caseRoot,'case',[.12,3.66,1.2],[-.9,1.83,-.17]);
 box('case_right',caseRoot,'case',[.12,3.66,1.2],[.9,1.83,-.17]);
 box('case_top',caseRoot,'case',[1.9,.14,1.2],[0,3.59,-.17]);
 box('case_bottom',caseRoot,'case',[1.9,.14,1.2],[0,.07,-.17]);
 for(let i=0;i<4;i++){
  const y=Number(((SLOT_Y[i]+SLOT_Y[i+1])/2).toFixed(4));
  box('case_divider_'+i,caseRoot,'case',[1.79,.08,1.1],[0,y,-.19]);
  box('front_divider_trim_'+i,caseRoot,'trim',[1.79,.045,.075],[0,y,.426]);
 }
 const railsRoot=group('cabinet_rails',root);
 const allDrawers=[];
 for(let i=0;i<5;i++){
  const slug=SLUGS[i],y=SLOT_Y[i];
  const slot=group('cabinet_slot_'+slug,railsRoot,[0,y,0]);
  // Actual rail geometry on case inner side, spanning the drawer's depth.
  box('track_left_'+slug,slot,'trim',[.06,.07,.93],[-.79,-.19,-.13]);
  box('track_right_'+slug,slot,'trim',[.06,.07,.93],[.79,-.19,-.13]);
  const drawer=group('drawer_'+slug,root,[0,y,.51]);
  allDrawers.push(drawer);
  const front=group('drawer_front_'+slug,drawer);
  box('front_face_'+slug,front,'drawer',[1.62,.48,.09],[0,0,0]);
  box('brass_handle_'+slug,front,'brass',[.57,.057,.085],[0,-.085,.102]);
  box('label_plate_'+slug,front,'label',[.55,.17,.022],[0,.107,.058]);
  const tray=group('tray_'+slug,drawer);
  box('tray_floor_'+slug,tray,'tray',[1.50,.065,.82],[0,-.198,-.415]);
  box('tray_left_'+slug,tray,'tray',[.06,.41,.82],[-.72,-.015,-.415]);
  box('tray_right_'+slug,tray,'tray',[.06,.41,.82],[.72,-.015,-.415]);
  box('tray_rear_'+slug,tray,'tray',[1.50,.41,.06],[0,-.015,-.82]);
  const folders=group('folders_'+slug,drawer);
  for(let j=0;j<4;j++){
   box('folder_'+slug+'_'+j,folders,'folder',[.225,.235,.024],[-.48+j*.32,.07,-.33-(j%2)*.045]);
  }
 }
 const json={
  asset:{version:'2.0',generator:'DaveHub DH-11C.4A deterministic geometry authoring, no image composites',copyright:'DaveHub original procedural geometry'},
  scene:0,scenes:[{nodes:[root]}],nodes,meshes,materials,accessors,bufferViews,
  buffers:[{byteLength:binary.length}],
  extras:{workPackage:'DH-11C.4A',units:'metres',coordinateSystem:'Y-up',origin:'cabinet local',movementAxis:'+Z',
   drawerTravelMetres:.76,geometryState:'owner review, untextured',nodeSlugs:SLUGS}
 };
 const raw=Buffer.from(JSON.stringify(json),'utf8');
 const pad=(n)=>(4-n%4)%4;
 const jchunk=Buffer.concat([raw,Buffer.alloc(pad(raw.length),32)]);
 const bchunk=Buffer.concat([binary,Buffer.alloc(pad(binary.length))]);
 const output=Buffer.alloc(12+8+jchunk.length+8+bchunk.length);
 output.writeUInt32LE(0x46546c67,0);output.writeUInt32LE(2,4);
 output.writeUInt32LE(output.length,8);
 output.writeUInt32LE(jchunk.length,12);output.writeUInt32LE(0x4E4F534A,16);jchunk.copy(output,20);
 const bStart=20+jchunk.length;
 output.writeUInt32LE(bchunk.length,bStart);output.writeUInt32LE(0x004E4942,bStart+4);bchunk.copy(output,bStart+8);
 return {output,json};
}
function decode(buffer){
 if(buffer.readUInt32LE(0)!==0x46546c67||buffer.readUInt32LE(4)!==2)throw Error('Not a GLB 2.0 file');
 if(buffer.readUInt32LE(8)!==buffer.length)throw Error('GLB length mismatch');
 const l=buffer.readUInt32LE(12);
 if(buffer.readUInt32LE(16)!==0x4e4f534a||buffer.readUInt32LE(20+l+4)!==0x004e4942)throw Error('Invalid GLB chunks');
 return JSON.parse(buffer.subarray(20,20+l).toString('utf8'));
}
if(require.main===module){
 const out=process.argv[2];if(!out)throw Error('Expected output GLB path');
 const {output,json}=build();
 const decoded=decode(output);
 if(decoded.nodes.length!==json.nodes.length)throw Error('GLB round-trip mismatch');
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,output);
 const hash=crypto.createHash('sha256').update(output).digest('hex');
 console.log('DH-11C.4A cabinet GLB generated: '+out+', '+output.length+' bytes, '+json.nodes.length+' nodes, sha256 '+hash);
}
module.exports={build,decode,SLUGS,SLOT_Y};

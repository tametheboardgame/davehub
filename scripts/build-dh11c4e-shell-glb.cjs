'use strict';
// DH-11C.4E: deterministic glTF source model from the exact same authored
// geometry manifest used for the optional browser fallback.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const asset=require('../prototypes/dh-11c-room/room-shell-asset.js');
function cube(){
 const faces=[
 [[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],
 [[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]],
 [[1,0,0],[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]],
 [[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],
 [[0,1,0],[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]],
 [[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]]
 ];
 const position=[],normal=[],uv=[],index=[];
 faces.forEach(([n,vertices],i)=>{
  vertices.forEach((v,j)=>{position.push(...v);normal.push(...n);uv.push(...[[0,0],[1,0],[1,1],[0,1]][j]);});
  index.push(...[0,1,2,0,2,3].map(k=>k+i*4));
 });
 const f32=x=>{const b=Buffer.alloc(x.length*4);x.forEach((v,i)=>b.writeFloatLE(v,i*4));return b;};
 const u16=x=>{const b=Buffer.alloc(x.length*2);x.forEach((v,i)=>b.writeUInt16LE(v,i*2));return b;};
 const chunks=[f32(position),f32(normal),f32(uv),u16(index)];
 return {buffer:Buffer.concat(chunks),lengths:chunks.map(b=>b.length)};
}
const lin=n=>{const c=parseInt(n,16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
function build(){
 const {buffer,lengths}=cube();
 const materialNames=Object.keys(asset.materials);
 const materials=materialNames.map(name=>({
  name,pbrMetallicRoughness:{baseColorFactor:[...([1,3,5].map(i=>lin(asset.materials[name].slice(i,i+2)))),1],metallicFactor:0.02,roughnessFactor:.86}
 }));
 const meshes=materialNames.map((name,i)=>({name:'box_'+name,primitives:[{attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},indices:3,material:i,mode:4}]}));
 const root={name:'room_shell_root',children:[]};
 const nodes=[root];
 for(const p of asset.parts){
  root.children.push(nodes.length);
  nodes.push({name:p.name,mesh:materialNames.indexOf(p.material),translation:p.position,scale:p.size});
 }
 const json={
  asset:{version:'2.0',generator:'DaveHub DH-11C.4E source architecture, ADR-0012'},
  scene:0,scenes:[{nodes:[0]}],nodes,meshes,materials,
  accessors:[
   {bufferView:0,componentType:5126,count:24,type:'VEC3',min:[-.5,-.5,-.5],max:[.5,.5,.5]},
   {bufferView:1,componentType:5126,count:24,type:'VEC3'},
   {bufferView:2,componentType:5126,count:24,type:'VEC2'},
   {bufferView:3,componentType:5123,count:36,type:'SCALAR',min:[0],max:[23]}
  ],
  bufferViews:[
   {buffer:0,byteOffset:0,byteLength:lengths[0],target:34962},
   {buffer:0,byteOffset:lengths[0],byteLength:lengths[1],target:34962},
   {buffer:0,byteOffset:lengths[0]+lengths[1],byteLength:lengths[2],target:34962},
   {buffer:0,byteOffset:lengths[0]+lengths[1]+lengths[2],byteLength:lengths[3],target:34963}
  ],buffers:[{byteLength:buffer.length}],
  extras:{milestone:'DH-11C.4E',units:asset.units,axis:asset.axis,partCount:asset.parts.length,holes:'real rectangular openings'}
 };
 const padded=(buf,byte)=>Buffer.concat([buf,Buffer.alloc((4-buf.length%4)%4,byte)]);
 const text=padded(Buffer.from(JSON.stringify(json),'utf8'),32),data=padded(buffer,0);
 const glb=Buffer.alloc(12+8+text.length+8+data.length);glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);
 glb.writeUInt32LE(text.length,12);glb.writeUInt32LE(0x4e4f534a,16);text.copy(glb,20);
 const off=20+text.length;glb.writeUInt32LE(data.length,off);glb.writeUInt32LE(0x004e4942,off+4);data.copy(glb,off+8);
 return {glb,json,sha256:crypto.createHash('sha256').update(glb).digest('hex')};
}
if(require.main===module){
 const out=process.argv[2];if(!out)throw Error('Output GLB path required');
 const b=build();fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,b.glb);
 console.log('PASS DH-11C.4E source shell model:',asset.parts.length,'meshes,',b.glb.length,'bytes, sha256:',b.sha256);
}
module.exports={build};

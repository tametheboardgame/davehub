'use strict';
// Deterministic glTF 2.0 asset generator for the six interactive 4F furniture
// rigs. Real triangles/UVs/normals, never flattened screenshots.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const asset=require('../prototypes/dh-11c-room/furniture-asset.js');
function geometry(kind,p){
 const pos=[],norm=[],uv=[],idx=[];
 const face=(verts,normal)=>{
  const start=pos.length/3;
  verts.forEach((v,i)=>{pos.push(...v);norm.push(...normal);uv.push(...[[0,0],[1,0],[1,1],[0,1]][i]);});
  idx.push(...[0,1,2,0,2,3].map(i=>i+start));
 };
 if(kind==='box'){
  const f=[
   [[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],
   [[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]],
   [[1,0,0],[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]],
   [[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],
   [[0,1,0],[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]],
   [[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]]
  ];f.forEach(([n,v])=>face(v,n));
 }else if(kind==='cylinder'){
  const [top,bottom,height]=p.size,N=p.shape.sides,half=height/2;
  for(let i=0;i<N;i++){
   const a=2*Math.PI*i/N,b=2*Math.PI*(i+1)/N;
   const x1=Math.cos(a),z1=Math.sin(a),x2=Math.cos(b),z2=Math.sin(b);
   const n1=[x1,(bottom-top)/height,z1],n2=[x2,(bottom-top)/height,z2];
   const length=v=>Math.hypot(...v),na=n1.map(v=>v/length(n1)),nb=n2.map(v=>v/length(n2));
   const start=pos.length/3;
   [[bottom*x1,-half,bottom*z1],[bottom*x2,-half,bottom*z2],[top*x2,half,top*z2],[top*x1,half,top*z1]]
    .forEach((v,j)=>{pos.push(...v);norm.push(...(j===0||j===3?na:nb));uv.push(...[[i/N,0],[(i+1)/N,0],[(i+1)/N,1],[i/N,1]][j]);});
   idx.push(start,start+1,start+2,start,start+2,start+3);
   if(top>0)face([[0,half,0],[top*x1,half,top*z1],[top*x2,half,top*z2],[0,half,0]],[0,1,0]);
   if(bottom>0)face([[0,-half,0],[bottom*x2,-half,bottom*z2],[bottom*x1,-half,bottom*z1],[0,-half,0]],[0,-1,0]);
  }
 }else if(kind==='sphere'||kind==='icosa'){
  const vertices=kind==='icosa'?(()=>{const g=(1+Math.sqrt(5))/2;return [[-1,g,0],[1,g,0],[-1,-g,0],[1,-g,0],[0,-1,g],[0,1,g],[0,-1,-g],[0,1,-g],[g,0,-1],[g,0,1],[-g,0,-1],[-g,0,1]].map(v=>{const n=Math.hypot(...v);return v.map(x=>x/n)})})():null;
  const triangles=kind==='icosa'?[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]:null;
  if(vertices){
   triangles.forEach(t=>{
    const a=vertices[t[0]],b=vertices[t[1]],c=vertices[t[2]];
    const n=a.map((v,i)=>(v+b[i]+c[i])/3),len=Math.hypot(...n),start=pos.length/3;
    [a,b,c].forEach(v=>{pos.push(...v);norm.push(...n.map(x=>x/len));uv.push((Math.atan2(v[2],v[0])+Math.PI)/(2*Math.PI),Math.acos(v[1])/Math.PI);});
    idx.push(start,start+1,start+2);
   });
  }else{
   const N=12,M=8;
   for(let j=0;j<M;j++)for(let i=0;i<N;i++){
    const coords=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]];
    const start=pos.length/3;
    coords.forEach(([x,y])=>{const phi=x/N*2*Math.PI,theta=y/M*Math.PI,xyz=[Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi)];pos.push(...xyz);norm.push(...xyz);uv.push(x/N,y/M);});
    idx.push(start,start+1,start+2,start,start+2,start+3);
   }
  }
 }else throw Error('Unknown primitive '+kind);
 const bounds=[0,1,2].map(k=>{const col=pos.filter((_,i)=>i%3===k);return[Math.min(...col),Math.max(...col)];});
 return {pos,norm,uv,idx,min:bounds.map(x=>x[0]),max:bounds.map(x=>x[1])};
}
function quat(euler){
 const [x,y,z]=euler.map(v=>v/2),a=Math.cos(x),b=Math.cos(y),c=Math.cos(z),d=Math.sin(x),e=Math.sin(y),f=Math.sin(z);
 return [d*b*c+a*e*f,a*e*c-d*b*f,a*b*f+d*e*c,a*b*c-d*e*f];
}
const linear=h=>[1,3,5].map(i=>{const x=parseInt(h.slice(i,i+2),16)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});
function build(){
 const mats=Object.keys(asset.materials);
 const materials=mats.map(name=>({name,pbrMetallicRoughness:{baseColorFactor:[...linear(asset.materials[name]),1],metallicFactor:name==='brass'?.55:0.02,roughnessFactor:name==='brass'?.46:.85},doubleSided:name==='sky'}));
 const nodes=[],ids=new Map(),geometryCache=new Map(),meshes=[],accessors=[],bufferViews=[],buffers=[];
 function append(numbers,kind){
  const component=kind==='uint16'?2:4,buf=Buffer.alloc(numbers.length*component);
  numbers.forEach((v,i)=>kind==='uint16'?buf.writeUInt16LE(v,i*2):buf.writeFloatLE(v,i*4));
  const off=buffers.reduce((n,b)=>n+b.length,0);
  const padded=Buffer.concat([buf,Buffer.alloc((4-buf.length%4)%4)]);
  buffers.push(padded);
  const index=bufferViews.length;bufferViews.push({buffer:0,byteOffset:off,byteLength:buf.length,target:kind==='uint16'?34963:34962});
  return index;
 }
 function getMesh(spec){
  const key=spec.kind+'|'+(spec.kind==='cylinder'?JSON.stringify([spec.size,spec.shape]):'standard')+'|'+spec.material;
  if(geometryCache.has(key))return geometryCache.get(key);
  const g=geometry(spec.kind,spec);
  const attrs={};
  for(const [attribute,vals,type] of [['POSITION',g.pos,'VEC3'],['NORMAL',g.norm,'VEC3'],['TEXCOORD_0',g.uv,'VEC2']]){
   const buf=append(vals,'float');const i=accessors.length;accessors.push({bufferView:buf,componentType:5126,count:vals.length/(type==='VEC3'?3:2),type,
    ...(attribute==='POSITION'?{min:g.min,max:g.max}:{})});attrs[attribute]=i;
  }
  const vi=append(g.idx,'uint16'),ii=accessors.length;accessors.push({bufferView:vi,componentType:5123,count:g.idx.length,type:'SCALAR',min:[0],max:[g.pos.length/3-1]});
  const meshId=meshes.length;meshes.push({name:'geo_'+key.replace(/[^\w]/g,'_').slice(0,80),primitives:[{attributes:attrs,indices:ii,material:mats.indexOf(spec.material),mode:4}]});geometryCache.set(key,meshId);return meshId;
 }
 for(const entry of asset.nodes){
  const n={name:entry.name,translation:entry.position};
  if(entry.rotation)n.rotation=quat(entry.rotation);
  if(entry.kind!=='group'){
   n.mesh=getMesh(entry);
   if(entry.kind==='box'||entry.kind==='sphere'||entry.kind==='icosa')n.scale=entry.size;
  }
  ids.set(entry.name,nodes.length);nodes.push(n);
 }
 asset.nodes.forEach(entry=>{
  if(entry.parent===null)return;
  const i=ids.get(entry.parent);nodes[i].children??=[];nodes[i].children.push(ids.get(entry.name));
 });
 const binary=Buffer.concat(buffers);
 const json={asset:{version:'2.0',generator:'DaveHub DH-11C.4F physical furniture rigs; ADR-0012'},scene:0,scenes:[{nodes:[ids.get('furniture_root')]}],
  nodes,materials,meshes,accessors,bufferViews,buffers:[{byteLength:binary.length}],
  extras:{milestone:'DH-11C.4F',units:'metres',interactiveRoots:asset.interactiveRoots,sourceNodeCount:asset.nodes.length}};
 const pad=(b,v)=>Buffer.concat([b,Buffer.alloc((4-b.length%4)%4,v)]);
 const j=pad(Buffer.from(JSON.stringify(json)),32),b=pad(binary,0),glb=Buffer.alloc(12+8+j.length+8+b.length);
 glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);
 glb.writeUInt32LE(j.length,12);glb.writeUInt32LE(0x4e4f534a,16);j.copy(glb,20);
 const off=20+j.length;glb.writeUInt32LE(b.length,off);glb.writeUInt32LE(0x004e4942,off+4);b.copy(glb,off+8);
 const sha256=crypto.createHash('sha256').update(glb).digest('hex');
 return {glb,json,sha256};
}
if(require.main===module){
 const output=process.argv[2];if(!output)throw Error('Output GLB path required');
 const result=build();fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,result.glb);
 console.log('PASS 4F furniture GLB: '+asset.nodes.length+' named parts, '+result.glb.length+' bytes, SHA256 '+result.sha256);
}
module.exports={build};

'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const manifest=require('../prototypes/dh-11c-room/furniture-asset.js');
const {glbJson,hierarchy}=require('./validate-dh11c4b-blender.cjs');
function check(source,exported){
 const a=glbJson(source),b=glbJson(exported);
 const old=hierarchy(a),now=hierarchy(b);
 if(b.meshes.length<10||b.nodes.length<manifest.nodes.length)throw Error('Blender furniture export incomplete');
 let worst=0;
 for(const part of manifest.nodes){
  const i=old.names.get(part.name),j=now.names.get(part.name);
  if(i===undefined||j===undefined)throw Error('Export lost furniture node '+part.name);
  if(part.parent&&!now.ancestor(part.name,part.parent))throw Error('Export lost parent rig for '+part.name);
  const x=old.world(i),y=now.world(j);
  for(const k of [12,13,14])worst=Math.max(worst,Math.abs(x[k]-y[k]));
  for(const k of [0,1,2,4,5,6,8,9,10,12,13,14]){
   if(Math.abs(x[k]-y[k])>.028)throw Error('Furniture transform drift '+part.name+' matrix['+k+'] '+Math.abs(x[k]-y[k]));
  }
 }
 for(const root of manifest.interactiveRoots)if(!now.ancestor(root,'furniture_root'))throw Error('Detached interactive root '+root);
 const movers=['door_leaf_hinge','typewriter_key_1_4','desk_paper_00','book_0_00','window_island_0','bin_paper_0'];
 for(const n of movers)if(!now.names.has(n))throw Error('Lost dynamic asset '+n);
 return {nodes:b.nodes.length,meshes:b.meshes.length,checkedTransforms:manifest.nodes.length,maxDrift:worst,movers};
}
if(require.main===module){
 const [source,exported,report]=process.argv.slice(2);
 if(!source||!exported||!report)throw Error('source.glb export.glb report.json required');
 const bytes=fs.readFileSync(exported),j=JSON.parse(fs.readFileSync(report,'utf8'));
 const result=check(fs.readFileSync(source),bytes);
 const sha=crypto.createHash('sha256').update(bytes).digest('hex');
 if(sha!==j.exportSha256||j.meshCount<170)throw Error('Invalid Blender furniture export report');
 console.log('PASS DH-11C.4F Blender furniture GLB:',JSON.stringify({...result,sha256:sha}));
}
module.exports={check};

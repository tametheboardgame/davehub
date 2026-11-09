'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const asset=require('../prototypes/dh-11c-room/room-shell-asset.js');
const {glbJson,hierarchy}=require('./validate-dh11c4b-blender.cjs');
function check(sourceBytes,exportBytes){
 const initial=glbJson(sourceBytes),exported=glbJson(exportBytes);
 const a=hierarchy(initial),b=hierarchy(exported);
 if(exported.meshes.length<5)throw Error('Room shell lost meshes');
 const identity=['room_shell_root',...asset.parts.map(p=>p.name)];
 let worst=0;
 for(const name of identity){
  const x=a.names.get(name),y=b.names.get(name);
  if(x===undefined||y===undefined)throw Error('Missing architectural GLB node: '+name);
  if(name!=='room_shell_root'&&!b.ancestor(name,'room_shell_root'))throw Error('Detached architectural mesh '+name);
  const old=a.world(x),now=b.world(y);
  const translationDrift=Math.hypot(old[12]-now[12],old[13]-now[13],old[14]-now[14]);
  worst=Math.max(worst,translationDrift);
  if(translationDrift>.025)throw Error(name+' moved '+translationDrift+'m');
  for(const i of [0,1,2,4,5,6,8,9,10]){
   if(Math.abs(old[i]-now[i])>.035)throw Error(name+' orientation or scale changed at transform '+i);
  }
 }
 const meshes=asset.parts.length;
 if(exported.nodes.length<meshes)throw Error('Blender model has lost room components');
 return {partCount:meshes,blenderNodeCount:exported.nodes.length,maxPositionDriftM:worst};
}
if(require.main===module){
 const [infile,outfile,reportfile]=process.argv.slice(2);
 if(!infile||!outfile||!reportfile)throw Error('Expected source.glb blender.glb report.json');
 const i=fs.readFileSync(infile),o=fs.readFileSync(outfile);
 const report=JSON.parse(fs.readFileSync(reportfile,'utf8'));
 const result=check(i,o);
 const sha=crypto.createHash('sha256').update(o).digest('hex');
 if(sha!==report.exportSha256||report.meshCount!==result.partCount)throw Error('Blender report and model disagree');
 console.log('PASS room architecture Blender round-trip:',JSON.stringify({...result,sha256:sha}));
}
module.exports={check};

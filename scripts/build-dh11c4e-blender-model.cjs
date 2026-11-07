'use strict';
// Exact Blender 4.0.2 exported file from verified GitHub Actions run 41299772477.
// The .b64 only transports this binary through text-only repository tools.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const source=path.resolve(__dirname,'../assets/worlds/writing/3d/models/room-shell-blender-verified.glb.deflate.b64');
const expected='2bb5d20bdcd742fa6e2e88bbbd4176be0f0c7f2b4cc8c35bf038859f1c6e28fc';
function build(target){
 const data=fs.readFileSync(source,'utf8').trim();
 if(!/^[a-z0-9+/]+={0,2}$/i.test(data))throw Error('Invalid Blender asset encoding');
 const glb=zlib.inflateSync(Buffer.from(data,'base64'));
 const sha=crypto.createHash('sha256').update(glb).digest('hex');
 if(sha!==expected)throw Error('Verified Blender GLB hash mismatch: '+sha);
 if(glb.length!==22104||glb.readUInt32LE(0)!==0x46546c67||glb.readUInt32LE(4)!==2||glb.readUInt32LE(8)!==glb.length)throw Error('Bad Blender GLB header');
 if(target){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,glb);}
 return {glb,sha,length:glb.length};
}
if(require.main===module){
 const out=process.argv[2];if(!out)throw Error('Output required');
 const {sha,length}=build(out);console.log('PASS DH-11C.4E verified Blender room model '+sha+' ('+length+' bytes)');
}
module.exports={build,expected};

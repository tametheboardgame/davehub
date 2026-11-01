'use strict';
// Restore the exact Blender 4.0.2 asset that passed DH-11C.4B checks.
// The checked-in file is only a lossless deflated representation to support
// text-only GitHub commits. Final Cloudflare output is a normal binary .glb.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const expected='051e4abdb015799282234ea50b14cd179cb335ee496dbfdf965a4f1081abbf8a';
const source=path.resolve(__dirname,'../assets/worlds/writing/3d/models/cabinet-blender-verified.glb.deflate.b64');
function build(out){
 const encoded=fs.readFileSync(source,'utf8').trim();
 if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw Error('Invalid verified model archive encoding');
 const output=zlib.inflateSync(Buffer.from(encoded,'base64'));
 const sha=crypto.createHash('sha256').update(output).digest('hex');
 if(sha!==expected)throw Error('Blender model hash mismatch: '+sha);
 if(output.length!==26164||output.readUInt32LE(0)!==0x46546c67||output.readUInt32LE(4)!==2||output.readUInt32LE(8)!==output.length)throw Error('Invalid glTF 2.0 asset');
 if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,output);}
 return {output,sha,length:output.length};
}
if(require.main===module){
 const out=process.argv[2];if(!out)throw Error('Output path required');
 const r=build(out);console.log('PASS verified Blender GLB '+r.sha+' ('+r.length+' bytes)');
}
module.exports={build,expected};

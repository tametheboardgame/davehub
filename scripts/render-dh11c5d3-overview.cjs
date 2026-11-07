'use strict';
const fs=require('node:fs'),path=require('node:path');
const VERSION='dh11c5d3a-align-v1';
function render(){
 const file=path.resolve(__dirname,'../prototypes/dh-11c-room/overview-studio.html');
 const html=fs.readFileSync(file,'utf8');
 for(const marker of ['DH-11C.5D.3A','data-overview-studio="true"','../illustrated-views/?v=dh11c5d-geometry-guides-v1',
  'room-plan.js?v=dh11c5d-geometry-guides-v1','view-pipeline.js?v=dh11c5d-geometry-guides-v1',
  '/assets/worlds/writing/manuscript-room-v1.avif']){
  if(!html.includes(marker))throw Error('Missing staging art alignment marker '+marker);
 }
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Output directory is required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render());
 console.log('PASS DH-11C.5D.3A art quality/real 3D alignment review staging page');
}
module.exports={render,VERSION};

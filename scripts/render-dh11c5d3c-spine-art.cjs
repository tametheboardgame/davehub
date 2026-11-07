'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3b-authored3d.cjs');
const VERSION='dh11c5d3c-unique-spines-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3B','DH-11C.5D.3C');
 const from='../room/high-illustration-3d.js?v=',to='../room/high-illustration-3d-v2.js?v=';
 if(html.split(from).length!==2)throw Error('Missing independent illustrated 3D art entrypoint');
 html=html.replace(from,to);
 html=html.replace('Every object, painted into the world.','A library of books with individual histories.');
 html=html.replace('AUTHORED ART / REAL INTERACTIVE 3D','INDIVIDUAL BOOK-SPINE ART / REAL 3D');
 html=html.replace('Object-specific painted UVs and physical filigree attached to the moving models. Not a picture overlay.',
  'Four distinct illustrated binding stamps, distributed across the real 80-book case, painted into the real model UVs. The eight pull-out books remain interactive.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3C unique book-spine art 3D preview');
}
module.exports={render,VERSION};

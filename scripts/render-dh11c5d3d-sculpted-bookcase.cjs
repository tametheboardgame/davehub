'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3c-spine-art.cjs');
const VERSION='dh11c5d3d-sculpted-bookcase-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3C','DH-11C.5D.3D');
 const from='../room/high-illustration-3d-v2.js?v=';
 if(html.split(from).length!==2)throw Error('Sculpted bookcase requires its own independent 3D runtime');
 html=html.replace(from,'../room/high-illustration-3d-v3.js?v=');
 html=html.replace('A library of books with individual histories.','A bookcase whose details are carved in the wood.');
 html=html.replace('INDIVIDUAL BOOK-SPINE ART / REAL 3D','SCULPTED BOOKCASE / HAND-ILLUSTRATED 3D');
 html=html.replace('Four distinct illustrated binding stamps, distributed across the real 80-book case, painted into the real model UVs. The eight pull-out books remain interactive.',
  'The existing painted book-spine variants now sit alongside raised sculpted crown moulding, fluted uprights, shelf lips, roundels and raised binding tooling. All details belong to the real movable 3D models.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3D geometry-bound sculptural bookcase staging preview');
}
module.exports={render,VERSION};

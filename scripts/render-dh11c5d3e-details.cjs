'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3d-sculpted-bookcase.cjs');
const VERSION='dh11c5d3e-authored-details-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3D','DH-11C.5D.3E');
 function put(from,to){
  if(html.split(from).length!==2)throw Error('Detail pass preview anchor changed: '+from.slice(0,90));
  html=html.replace(from,to);
 }
 put('../room/high-illustration-3d-v3.js?v=','../room/high-illustration-3d-v4.js?v=');
 put('data-illustrated-v5="true">','data-illustrated-v5="true" data-authored-detail-proof="true">');
 put('<script type="module" src="../room/room.js?v='+VERSION+'"></script>',
  '<script defer src="../room/window-illustration.js?v='+VERSION+'"></script>\n'+
  '<script type="module" src="../room/room.js?v='+VERSION+'"></script>');
 put('A bookcase whose details are carved in the wood.','A hoard of individual books and ink-stained manuscripts.');
 put('SCULPTED BOOKCASE / HAND-ILLUSTRATED 3D','FINER DETAIL / UNIQUE MANUSCRIPTS / LAYERED VIEW');
 put('The existing painted book-spine variants now sit alongside raised sculpted crown moulding, fluted uprights, shelf lips, roundels and raised binding tooling. All details belong to the real movable 3D models.',
  'Each book and paper has individual UV-painted marks. The window now contains 3D-separated islands and homepage art, the desk is clearer and the drawers have larger quill-style labels. Fine-grain marks replace sweeping strokes.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3E authored room details and window art preview');
}
module.exports={render,VERSION};

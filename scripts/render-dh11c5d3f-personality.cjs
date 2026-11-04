'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3e-details.cjs');
const VERSION='dh11c5d3f-readable-hoard-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3E','DH-11C.5D.3F');
 function put(a,b){
  if(html.split(a).length!==2)throw Error('3F review route anchor mismatch: '+a);
  html=html.replace(a,b);
 }
 put('data-authored-detail-proof="true">','data-authored-detail-proof="true" data-personality-proof="true">');
 put('../room/window-illustration.js?v=','../room/window-illustration-v2.js?v=');
 put('<script type="module" src="../room/room.js?v='+VERSION+'"></script>',
  '<script defer src="../room/manuscript-personality.js?v='+VERSION+'"></script>\n'+
  '<script type="module" src="../room/room.js?v='+VERSION+'"></script>');
 put('A hoard of individual books and ink-stained manuscripts.',
  'Eighty dreadful book titles. Fifteen frantic drafts. One overworked filing cabinet.');
 put('FINER DETAIL / UNIQUE MANUSCRIPTS / LAYERED VIEW',
  'FOUR FITTED PANES / READABLE BOOK TITLES / MAD INK');
 put('Each book and paper has individual UV-painted marks. The window now contains 3D-separated islands and homepage art, the desk is clearer and the drawers have larger quill-style labels. Fine-grain marks replace sweeping strokes.',
  'Four frame-fitted scenic panes remove the old green islands. Every book has its own readable fictional joke title on the real spine. Desk papers are scrawled, crossed-out and circled in frantic fountain-pen ink; cabinet labels are bigger, darker and bolder.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3F scene-bound art character review');
}
module.exports={render,VERSION};

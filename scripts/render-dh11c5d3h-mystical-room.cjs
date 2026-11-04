'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3g-authored-handwriting.cjs');
const VERSION='dh11c5d3h-mystical-room-props-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3G','DH-11C.5D.3H');
 function put(from,to){
  const n=html.split(from).length-1;
  if(n!==1)throw Error('DH-11C.5D.3H preview changed anchor ('+n+'): '+from);
  html=html.replace(from,to);
 }
 put('data-handwritten-label-proof="true">','data-handwritten-label-proof="true" data-mystical-room-proof="true">');
 put('<script type="module" src="../room/room.js?v='+VERSION+'"></script>',
  '<script defer src="../room/room-props-v7.js?v='+VERSION+'"></script>\n'+
  '<script type="module" src="../room/room.js?v='+VERSION+'"></script>');
 put('Seventy-two joke books, eight real creative works, a mad desk and five handwritten drawers.',
  'An arcane writing-room rug, a grounded lamp and a bin stuffed with real crumpled paper.');
 put('PERSONAL WORKS / CLEAN SPINES / HANDWRITTEN ARCHIVE',
  'CELESTIAL EMBROIDERY / REAL OPEN BASKET / LAMP FOOT');
 put('The eight pull-out books bear genuine authored creative-work titles. The other 72 keep their joke titles, without the obstructing centre ornaments. Desk papers are wild fountain-pen scrawls; the typewriter sheet remains typed. Five restrained handwritten parchment labels sit on the moving filing drawers.',
  'The desk lamp sits properly on its base. The waste-paper basket is genuinely open, with twelve different paper balls down inside and all nine existing interactive crumples still spilling over the rim. A dusty-plum rug has fine celestial navigation embroidery instead of repeated loops.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3H real lamp / hollow bin / mystical rug preview');
}
module.exports={render,VERSION};

'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3h-mystical-room.cjs');
const VERSION='dh11c5d3i-door-home-exit-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3H','DH-11C.5D.3I');
 const put=(from,to)=>{
  const n=html.split(from).length-1;
  if(n!==1)throw Error('DH-11C.5D.3I preview anchor changed ('+n+'): '+from);
  html=html.replace(from,to);
 };
 put('data-mystical-room-proof="true">','data-mystical-room-proof="true" data-exit-door-proof="true">');
 put('<script type="module" src="../room/room.js?v='+VERSION+'"></script>',
  '<script defer src="../room/door-exit.js?v='+VERSION+'"></script>\n'+
  '<script type="module" src="../room/room.js?v='+VERSION+'"></script>');
 put('An arcane writing-room rug, a grounded lamp and a bin stuffed with real crumpled paper.',
  'A working exit: click the door to open it, then click the doorway to go home.');
 put('CELESTIAL EMBROIDERY / REAL OPEN BASKET / LAMP FOOT',
  'PHYSICAL DOOR / CLICK TO OPEN / CLICK AGAIN TO EXIT');
 put('The desk lamp sits properly on its base. The waste-paper basket is genuinely open, with twelve different paper balls down inside and all nine existing interactive crumples still spilling over the rim. A dusty-plum rug has fine celestial navigation embroidery instead of repeated loops.',
  'The door opens on its real hinge with the first click. Click the open doorway again to return to this site’s homepage. The corresponding accessible control changes from Open the door to Exit to DaveHub home. All approved V7 room artwork and interactions remain intact.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3I physical door-to-home exit preview');
}
module.exports={render,VERSION};

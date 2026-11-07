'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderBase,VERSION:BASE}=require('./render-dh11c5d3f-personality.cjs');
const VERSION='dh11c5d3g-authored-handwriting-v1';
function render(source){
 let html=renderBase(source).replaceAll(BASE,VERSION).replaceAll('DH-11C.5D.3F','DH-11C.5D.3G');
 const put=(from,to)=>{
  const n=html.split(from).length-1;
  if(n!==1)throw Error('DH-11C.5D.3G preview anchor mismatch '+n+': '+from);
  html=html.replace(from,to);
 };
 put('data-personality-proof="true">','data-personality-proof="true" data-handwritten-label-proof="true">');
 put('../room/high-illustration-3d-v4.js?v=','../room/high-illustration-3d-v5.js?v=');
 put('../room/manuscript-personality.js?v=','../room/manuscript-personality-v2.js?v=');
 put('Eighty dreadful book titles. Fifteen frantic drafts. One overworked filing cabinet.',
  'Seventy-two joke books, eight real creative works, a mad desk and five handwritten drawers.');
 put('FOUR FITTED PANES / READABLE BOOK TITLES / MAD INK',
  'PERSONAL WORKS / CLEAN SPINES / HANDWRITTEN ARCHIVE');
 put('Four frame-fitted scenic panes remove the old green islands. Every book has its own readable fictional joke title on the real spine. Desk papers are scrawled, crossed-out and circled in frantic fountain-pen ink; cabinet labels are bigger, darker and bolder.',
  'The eight pull-out books bear genuine authored creative-work titles. The other 72 keep their joke titles, without the obstructing centre ornaments. Desk papers are wild fountain-pen scrawls; the typewriter sheet remains typed. Five restrained handwritten parchment labels sit on the moving filing drawers.');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5D.3G readable authored hoard staging preview');
}
module.exports={render,VERSION};

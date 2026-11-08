'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6e-wastepaper-bin.cjs');
const VERSION='dh11c6e1-uncrumple-v1';
const MARKER='DH-11C.6E.1';
function render(source){
 let html=prior.render(source);
 function put(from,to){
  const n=html.split(from).length-1;
  if(n!==1)throw Error('DH-11C.6E.1 HTML anchor changed ('+n+'): '+from.slice(0,95));
  html=html.replace(from,to);
 }
 put('data-discarded-ideas="true">','data-discarded-ideas="true" data-uncrumple-direct="true">');
 put('</head>','<meta name="davehub-uncrumple-stage" content="'+MARKER+'">\n</head>');
 // The crumpled scrap is a genuine accessible button, not a picture that
 // disguises its interaction or a footer action below the visible fold.
 put('  <div id="discarded-folded" class="discarded-crumple">',
  '  <button id="discarded-folded" class="discarded-crumple" type="button" aria-label="Uncrumple paper and read the recovered idea">');
 put('   <div class="discarded-crumple-art" aria-hidden="true"></div>',\n  '   <span class="discarded-crumple-art" aria-hidden="true"></span>');\n put('   <p class="discarded-crumple-caption">Someone threw this away for a reason.</p>\n  </div>\n  <article id="discarded-sheet"',
  '   <span class="discarded-crumple-caption">Click the paper to uncrumple it</span>\n  </button>\n'+
  '  <button id="discarded-unfold" class="discarded-unfold" type="button">Uncrumple paper</button>\n'+
  '  <article id="discarded-sheet"');
 put('   <button id="discarded-unfold" class="discarded-unfold" type="button">Unfold this scrap</button>\n','');
 // Cache-bust both changed assets. The real Three.js scene is byte-for-byte
 // unchanged; its last validated room script remains on its own URL.
 put('discarded-ideas.js?v='+prior.VERSION,'discarded-ideas.js?v='+VERSION);
 put('discarded-ideas.css?v='+prior.VERSION,'discarded-ideas.css?v='+VERSION);
 const required=['DH-11C.6E',MARKER,'data-uncrumple-direct="true"',
  'archive-tray-dialog','discarded-dialog','discarded-folded','discarded-unfold',
  'data-motion-first="true"','room.js?v='+prior.VERSION];
 for(const token of required)if(!html.includes(token))throw Error('Missing inherited feature '+token);
 for(const id of ['discarded-folded','discarded-unfold']){
  if(html.split('id="'+id+'"').length!==2)throw Error('Duplicate or missing action '+id);
 }
 if(html.indexOf('id="discarded-unfold"')>html.indexOf('id="discarded-sheet"'))
  throw Error('Uncrumple call to action must be ABOVE reading sheet, inside the visible stage');
 return html;
}
if(require.main===module){
 const dest=process.argv[2];if(!dest)throw Error('Writing stage output required');
 fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' accessible crumple and primary Uncrumple paper button in visible stage');
}
module.exports={render,VERSION,MARKER};

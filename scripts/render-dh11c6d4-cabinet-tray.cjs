'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6d3-filing-cabinet.cjs');
const VERSION='dh11c6d4-overhead-tray-v1';
const MARKER='DH-11C.6D.4';
function render(source){
 let html=prior.render(source);
 const put=(from,to)=>{
  const n=html.split(from).length-1;
  if(n!==1)throw Error('Overhead drawer renderer anchor changed ('+n+'): '+from.slice(0,95));
  html=html.replace(from,to);
 };
 put('data-cabinet-archive="true">','data-cabinet-archive="true" data-cabinet-tray="true">');
 put('room.js?v='+prior.VERSION,'room.js?v='+VERSION);
 put('</head>','<link rel="stylesheet" href="./cabinet-tray.css?v='+VERSION+'">\n'+
  '<meta name="davehub-cabinet-tray-stage" content="'+MARKER+'">\n</head>');
 const roomScript='<script type="module" src="../room/room.js?v='+VERSION+'"></script>';
 put(roomScript,'<script defer src="../room/cabinet-tray.js?v='+VERSION+'"></script>\n'+roomScript);
 const dialog=[
 '<dialog id="archive-tray-dialog" class="archive-tray-dialog" aria-labelledby="archive-tray-heading" aria-describedby="archive-tray-instruction">',
 ' <header class="archive-tray-head">',
 '  <div>',
 '   <p class="archive-tray-eyebrow">The Manuscript Hoard · Drawer interior</p>',
 '   <h2 id="archive-tray-heading">Drawer</h2>',
 '   <p id="archive-tray-count" class="archive-tray-count"></p>',
 '  </div>',
 '  <button id="archive-tray-close" class="archive-tray-close" type="button" aria-label="Look at the open 3D drawer">×</button>',
 ' </header>',
 ' <section class="archive-tray-view" aria-label="Looking down inside the open cabinet drawer">',
 '  <div class="archive-tray-perspective">',
 '   <div id="archive-tray-well" class="archive-tray-well">',
 '    <div id="archive-tray-slots" class="archive-tray-slots" role="list" aria-label="Folders in the drawer"></div>',
 '   </div>',
 '   <div class="archive-tray-lip" aria-hidden="true">',
 '    <span class="archive-tray-handle"></span>',
 '    <span id="archive-tray-lip-label" class="archive-tray-lip-label"></span>',
 '    <span class="archive-tray-handle"></span>',
 '   </div>',
 '  </div>',
 '  <p id="archive-tray-instruction" class="archive-tray-instruction">Select a labelled file to lift it from the actual drawer. Unlabelled folders hold no public material.</p>',
 ' </section>',
 ' <footer class="archive-tray-footer">',
 '  <button id="archive-tray-peek" type="button">View open drawer in 3D</button>',
 '  <button id="archive-tray-shut" class="archive-tray-shut" type="button">Close this drawer</button>',
 ' </footer>',
 '</dialog>'
 ].join('\n');
 put('</body>',dialog+'\n</body>');
 for(const token of ['data-cabinet-archive="true"','archive-folder-dialog',
  'data-motion-first="true"','published-book-dialog','workshop-dialog'])
  if(!html.includes(token))throw Error('Missing inherited physical room capability '+token);
 return html;
}
if(require.main===module){
 const dest=process.argv[2];if(!dest)throw Error('Destination Writing room required');
 fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' top-down drawer inspection after real 3D movement');
}
module.exports={render,VERSION,MARKER};

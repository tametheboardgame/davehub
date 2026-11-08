'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6c2-motion-first.cjs');
const VERSION='dh11c6d3-cabinet-archive-v1';
const MARKER='DH-11C.6D.3';
function render(source){
 let html=prior.render(source);
 const put=(from,to)=>{
  const count=html.split(from).length-1;
  if(count!==1)throw Error('Cabinet renderer anchor changed ('+count+'): '+from.slice(0,90));
  html=html.replace(from,to);
 };
 put('data-motion-first="true">','data-motion-first="true" data-cabinet-archive="true">');
 put('room.js?v='+prior.VERSION,'room.js?v='+VERSION);
 put('</head>','<link rel="stylesheet" href="./cabinet-experience.css?v='+VERSION+'">\n'+
  '<meta name="davehub-cabinet-stage" content="'+MARKER+'">\n</head>');
 const moduleScript='<script type="module" src="../room/room.js?v='+VERSION+'"></script>';
 put(moduleScript,'<script defer src="../room/cabinet-catalogue.js?v='+VERSION+'"></script>\n'+
  '<script defer src="../room/cabinet-experience.js?v='+VERSION+'"></script>\n'+moduleScript);
 const dialog=[
 '<dialog id="archive-folder-dialog" class="archive-folder-dialog" aria-labelledby="archive-folder-title" aria-describedby="archive-folder-notice">',
 ' <section class="archive-folder-stage">',
 '  <button id="archive-folder-close" class="archive-folder-close" type="button" aria-label="Close folder and return to the filing cabinet">×</button>',
 '  <div class="archive-folder-cover">',
 '   <div id="archive-folder-label" class="archive-folder-tab" aria-hidden="true"></div>',
 '   <article class="archive-folder-inner">',
 '    <p id="archive-folder-category" class="archive-folder-brow"></p>',
 '    <h2 id="archive-folder-title"></h2>',
 '    <p id="archive-folder-status" class="archive-folder-status"></p>',
 '    <p id="archive-folder-summary" class="archive-folder-summary"></p>',
 '    <p id="archive-folder-notice" class="archive-folder-notice"></p>',
 '    <div class="archive-folder-actions">',
 '     <button id="archive-folder-back" type="button">Close file and return to the drawer</button>',
 '     <button id="archive-folder-related" class="archive-folder-related" type="button" hidden></button>',
 '    </div>',
 '   </article>',
 '  </div>',
 ' </section>',
 '</dialog>'
 ].join('\n');
 put('</body>',dialog+'\n</body>');
 for(const marker of ['data-finished-books="true"','published-book-dialog','manuscript-dialog',
  'workshop-dialog','data-exit-door-proof="true"','data-motion-first="true"'])
  if(!html.includes(marker))throw Error('Missing inherited Writing room capability '+marker);
 return html;
}
if(require.main===module){
 const dest=process.argv[2];if(!dest)throw Error('Destination Writing room required');
 fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' real drawer folders with public-only catalogue and fictional samples');
}
module.exports={render,VERSION,MARKER};

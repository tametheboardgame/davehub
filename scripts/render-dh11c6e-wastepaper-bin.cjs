'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6d4-cabinet-tray.cjs');
const VERSION='dh11c6e-wastepaper-v1';
const MARKER='DH-11C.6E';
function render(source){
 let html=prior.render(source);
 const put=(from,to)=>{
  const n=html.split(from).length-1;
  if(n!==1)throw Error('Wastepaper renderer anchor changed ('+n+'): '+from.slice(0,100));
  html=html.replace(from,to);
 };
 put('data-cabinet-tray="true">','data-cabinet-tray="true" data-discarded-ideas="true">');
 put('room.js?v='+prior.VERSION,'room.js?v='+VERSION);
 put('</head>','<link rel="stylesheet" href="./discarded-ideas.css?v='+VERSION+'">\n'+
  '<meta name="davehub-wastepaper-stage" content="'+MARKER+'">\n</head>');
 const moduleScript='<script type="module" src="../room/room.js?v='+VERSION+'"></script>';
 put(moduleScript,'<script defer src="../room/discarded-ideas.js?v='+VERSION+'"></script>\n'+moduleScript);
 const dialog=[
 '<dialog id="discarded-dialog" class="discarded-dialog" aria-labelledby="discarded-title" aria-describedby="discarded-feedback">',
 ' <header class="discarded-header">',
 '  <div>',
 '   <p id="discarded-number" class="discarded-overline">RECOVERED SCRAP</p>',
 '   <h2 id="discarded-title">A discarded idea</h2>',
 '  </div>',
 '  <button id="discarded-close" class="discarded-close" type="button" aria-label="Leave this scrap on the floor and close">×</button>',
 ' </header>',
 ' <section class="discarded-stage" aria-label="Inspect the scrunched paper">',
 '  <div id="discarded-folded" class="discarded-crumple">',
 '   <div class="discarded-crumple-art" aria-hidden="true"></div>',
 '   <p class="discarded-crumple-caption">Someone threw this away for a reason.</p>',
 '  </div>',
 '  <article id="discarded-sheet" class="discarded-sheet" data-side="front" hidden aria-live="polite">',
 '   <div class="discarded-sheet__meta">',
 '    <span id="discarded-stamp" class="discarded-stamp"></span>',
 '    <span class="discarded-paper-mark">scribbled out / probably important</span>',
 '   </div>',
 '   <div id="discarded-text" class="discarded-words"></div>',
 '   <p id="discarded-reverse-label" class="discarded-reverse-label" aria-hidden="true">REASON DISCARDED</p>',
 '   <p id="discarded-reverse" class="discarded-reverse" hidden></p>',
 '   <p class="discarded-margin-note">Fictional sample. No unpublished writing is on display.</p>',
 '  </article>',
 ' </section>',
 ' <footer class="discarded-footer">',
 '  <div class="discarded-buttons">',
 '   <button id="discarded-unfold" class="discarded-unfold" type="button">Unfold this scrap</button>',
 '   <button id="discarded-flip" type="button" hidden>Turn over</button>',
 '   <button id="discarded-leave" type="button">Leave on the floor</button>',
 '   <button id="discarded-return" class="discarded-return" type="button">Crumple and throw back</button>',
 '  </div>',
 '  <p id="discarded-feedback" class="discarded-feedback" role="status" aria-live="polite"></p>',
 ' </footer>',
 '</dialog>'
 ].join('\n');
 put('</body>',dialog+'\n</body>');
 for(const marker of ['DH-11C.6D.4','archive-tray-dialog','archive-folder-dialog',
  'data-motion-first="true"','manuscript-dialog','published-book-dialog',
  'workshop-dialog','data-exit-door-proof="true"'])
  if(!html.includes(marker))throw Error('Inherited room capability missing '+marker);
 return html;
}
if(require.main===module){
 const dest=process.argv[2];if(!dest)throw Error('Destination Writing room required');
 fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' physical 3D bin toss followed by fictional crumple reader');
}
module.exports={render,VERSION,MARKER};

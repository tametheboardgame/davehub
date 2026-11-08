'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6b-finished-books.cjs');
const VERSION='dh11c6c1-reading-workshop-v1';
const MARKER='DH-11C.6C.1';
function render(source){
 let html=prior.render(source);
 const put=(from,to)=>{
  const count=html.split(from).length-1;
  if(count!==1)throw Error('Manuscript workbench render anchor changed ('+count+'): '+from.slice(0,100));
  html=html.replace(from,to);
 };
 put('data-finished-books="true">','data-finished-books="true" data-manuscript-experience="true">');
 put('room.js?v='+prior.VERSION,'room.js?v='+VERSION);
 put('</head>','<link rel="stylesheet" href="./manuscript-experience.css?v='+VERSION+'">\n'+
  '<meta name="davehub-manuscript-stage" content="'+MARKER+'">\n</head>');
 const roomScript='<script type="module" src="../room/room.js?v='+VERSION+'"></script>';
 put(roomScript,'<script defer src="../room/manuscript-experience.js?v='+VERSION+'"></script>\n'+roomScript);
 const dialogs=[
 '<dialog id="manuscript-dialog" class="manuscript-dialog" aria-labelledby="manuscript-title" aria-describedby="manuscript-kind">',
 ' <section class="manuscript-stage">',
 '  <button id="manuscript-close" class="manuscript-x" type="button" aria-label="Close manuscript and return to desk">×</button>',
 '  <div class="manuscript-topline"><div>',
 '   <p class="manuscript-eyebrow">FROM THE DESK · SAMPLE PAGES</p>',
 '   <h2 id="manuscript-title"></h2>',
 '   <p id="manuscript-kind" class="manuscript-kind"></p>',
 '  </div></div>',
 '  <article class="manuscript-page" aria-label="Manuscript page">',
 '   <h3 id="manuscript-page-heading"></h3>',
 '   <div id="manuscript-page-text" class="manuscript-page-text"></div>',
 '  </article>',
 '  <div class="manuscript-foot">',
 '   <span id="manuscript-position" class="manuscript-folio"></span>',
 '   <nav class="manuscript-pagination" aria-label="Manuscript pages">',
 '    <button id="manuscript-prev" type="button">← Previous</button>',
 '    <span id="manuscript-page-number" aria-live="polite"></span>',
 '    <button id="manuscript-next" type="button">Next →</button>',
 '   </nav>',
 '  </div>',
 ' </section>',
 '</dialog>',
 '<dialog id="workshop-dialog" class="workshop-dialog" aria-labelledby="workshop-title" aria-describedby="workshop-description">',
 ' <section class="workshop-stage">',
 '  <button id="workshop-close" class="workshop-x" type="button" aria-label="Close creative workshop and return to typewriter">×</button>',
 '  <p class="manuscript-eyebrow">THE TYPEWRITER · A BLANK PAGE</p>',
 '  <h2 id="workshop-title">Something might happen if you type.</h2>',
 '  <p id="workshop-description" class="workshop-subtitle">A small, private writing experiment. Nothing is stored or published by DaveHub.</p>',
 '  <div class="workshop-prompt"><p id="workshop-prompt"></p><button id="workshop-next-prompt" type="button">Another idea</button></div>',
 '  <div class="workshop-paper"><label for="workshop-page" class="manuscript-eyebrow">YOUR PAGE</label>',
 '   <textarea id="workshop-page" class="workshop-page" rows="8" spellcheck="true" maxlength="10000" placeholder="Start typing. The paper is yours for this visit."></textarea>',
 '  </div>',
 '  <div class="workshop-toolbar"><button id="workshop-copy" type="button">Copy writing</button>',
 '   <button id="workshop-clear" type="button">New blank page</button>',
 '   <span id="workshop-count" class="workshop-count" aria-live="polite">0 words · 0 characters</span></div>',
 '  <p id="workshop-feedback" class="workshop-feedback" role="status" aria-live="polite"></p>',
 ' </section>',
 '</dialog>'
 ].join('\n');
 put('</body>',dialogs+'\n</body>');
 if(!html.includes('published-book-dialog')||!html.includes('data-exit-door-proof="true"'))
  throw Error('Cannot replace the books or room navigation in the manuscript stage');
 return html;
}
if(require.main===module){
 const dest=process.argv[2];if(!dest)throw Error('Destination Writing room required');
 fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' desk and typewriter with fictional demo content');
}
module.exports={render,VERSION,MARKER};

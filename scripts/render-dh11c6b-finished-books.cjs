'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6a-minimal-room.cjs');
const VERSION='dh11c6b3-real-edition-spines-v1';
const MARKER='DH-11C.6B';
function render(source){
 let html=prior.render(source);
 const put=(from,to)=>{
  const count=html.split(from).length-1;
  if(count!==1)throw Error('Finished books page anchor changed ('+count+'): '+from.slice(0,100));
  html=html.replace(from,to);
 };
 put('data-dark-window-preload="true">','data-dark-window-preload="true" data-finished-books="true">');
 put('room.js?v=dh11c6a2-dark-window-v1','room.js?v='+VERSION);
 put('manuscript-personality-v2.js?v=dh11c5d3i-door-home-exit-v1',
  'manuscript-personality-v2.js?v='+VERSION);
 put('</head>','<link rel="stylesheet" href="./book-experience.css">\n'+
  '<meta name="davehub-book-stage" content="'+MARKER+'">\n</head>');
 const roomScript='<script type="module" src="../room/room.js?v='+VERSION+'"></script>';
 put(roomScript,'<script defer src="../room/finished-books.js?v='+VERSION+'"></script>\n'+
  '<script defer src="../room/book-experience.js?v='+VERSION+'"></script>\n'+roomScript);
 put('href="./minimal-immersive.css"','href="./minimal-immersive.css?v='+VERSION+'"');
 put('href="./book-experience.css"','href="./book-experience.css?v='+VERSION+'"');
 put('<meta name="davehub-book-stage" content="'+MARKER+'">',
  '<meta name="davehub-book-stage" content="'+MARKER+'">'+
  '<meta name="davehub-layout-stage" content="DH-11C.6B.1">'+
  '<meta name="davehub-layout-fix" content="DH-11C.6B.2">'+
  '<meta name="davehub-spine-stage" content="DH-11C.6B.3">');
 const modal=[
  '<dialog id="published-book-dialog" class="published-book-dialog" aria-labelledby="published-book-title" aria-describedby="published-book-description">',
  '<button id="published-book-close" class="published-book-close" type="button" aria-label="Close book details">×</button>',
  '<div class="published-book-dialog__content">',
  ' <div class="published-book-dialog__art">',
  '  <img id="published-book-cover" class="published-book-cover" alt="" hidden>',
  '  <div id="published-book-cover-fallback" class="published-book-cover-fallback" aria-label="Text cover, image unavailable">',
  '   <span id="published-book-cover-fallback-title"></span>',
  '   <small>David Fairbairn</small>',
  '  </div>',
  ' </div>',
  ' <div class="published-book-dialog__detail">',
  '  <p class="published-book-eyebrow">From the finished shelf</p>',
  '  <h2 id="published-book-title"></h2>',
  '  <p class="published-book-subtitle" id="published-book-subtitle"></p>',
  '  <p class="published-book-description" id="published-book-description"></p>',
  '  <dl class="published-book-facts">',
  '   <div><dt>Author</dt><dd id="published-book-author"></dd></div>',
  '   <div><dt>Publisher</dt><dd id="published-book-publisher"></dd></div>',
  '   <div><dt>Published</dt><dd id="published-book-year"></dd></div>',
  '   <div><dt>ISBN</dt><dd id="published-book-isbn"></dd></div>',
  '  </dl>',
  '  <nav id="published-book-links" class="published-book-links" aria-label="Where to find this book"></nav>',
  '  <p class="published-book-disclaimer">External book links open in a new tab. Stock and prices are set by the retailer.</p>',
  ' </div>',
  '</div>',
  '</dialog>',
  ''
 ].join('\n');
 put('</body>',modal+'\n</body>');
 for(const text of ['data-finished-books="true"','published-book-dialog','data-exit-door-proof="true"'])
  if(!html.includes(text))throw Error('Required finished-book visitor feature missing: '+text);
 return html;
}
if(require.main===module){
 const directory=process.argv[2];
 if(!directory)throw Error('Destination Writing world directory required');
 fs.mkdirSync(directory,{recursive:true});
 fs.writeFileSync(path.join(directory,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS DH-11C.6B three published books and accessible detail view');
}
module.exports={render,VERSION,MARKER};

'use strict';
const fs=require('node:fs'),path=require('node:path');
const prior=require('./render-dh11c6c1-reader-workshop.cjs');
const VERSION='dh11c6c2-motion-first-v1';
const MARKER='DH-11C.6C.2';
function render(source){
 let html=prior.render(source);
 const put=(from,to)=>{
  const count=html.split(from).length-1;
  if(count!==1)throw Error('Motion-first renderer anchor changed ('+count+'): '+from.slice(0,80));
  html=html.replace(from,to);
 };
 put('data-manuscript-experience="true">','data-manuscript-experience="true" data-motion-first="true">');
 put('room.js?v='+prior.VERSION,'room.js?v='+VERSION);
 put('</head>','<meta name="davehub-motion-stage" content="'+MARKER+'">\n</head>');
 const moduleScript='<script type="module" src="../room/room.js?v='+VERSION+'"></script>';
 put(moduleScript,
  '<script type="module" src="../room/room.js?v='+VERSION+'"></script>');
 for(const marker of ['data-finished-books="true"','published-book-dialog','manuscript-dialog','workshop-dialog','data-exit-door-proof="true"'])
  if(!html.includes(marker))throw Error('Missing inherited scene experience: '+marker);
 return html;
}
if(require.main===module){
 const directory=process.argv[2];if(!directory)throw Error('Destination Writing room directory required');
 fs.mkdirSync(directory,{recursive:true});
 fs.writeFileSync(path.join(directory,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' real furniture movement before overlays');
}
module.exports={render,VERSION,MARKER};

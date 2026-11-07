'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=require('./render-dh11c5d3j-writing-world.cjs');
const MARKER='DH-11C.6A';
const ROUTE=base.ROUTE;
function render(source){
 let html=base.render(source);
 function put(from,to){
  const n=html.split(from).length-1;
  if(n!==1)throw Error('Minimal Writing interface anchor changed ('+n+'): '+from.slice(0,105));
  html=html.replace(from,to);
 }
 put('data-writing-world="true">','data-writing-world="true" data-minimal-ui="true" data-dark-window-preload="true">');
 // Canonical page only: refresh the room module after adding background-click navigation.
 // Old isolated V8 and art previews keep their own URLs and modes.
 put('room.js?v=dh11c5d3i-door-home-exit-v1','room.js?v=dh11c6a2-dark-window-v1');
 put('window-illustration-v2.js?v=dh11c5d3i-door-home-exit-v1',
  'window-illustration-v2.js?v=dh11c6a2-dark-window-v1');
 put('<a class="brand" href="/">Dave<span>Hub</span></a>',
  '<a class="brand" href="/" aria-label="DaveHub home">'+
  '<img src="/assets/branding/davehub-logo-faithful.svg" width="160" height="50" alt="DaveHub"></a>');
 put('← DaveHub home','← Back');
 put('← Whole room','← Room');
 put('Explore objects','Objects');
 put('</head>','<link rel="stylesheet" href="./minimal-immersive.css">\n'+
  '<meta name="davehub-ui-stage" content="'+MARKER+'">\n'+
  '<meta name="davehub-navigation-stage" content="DH-11C.6A.1">\n'+
  '<meta name="davehub-window-stage" content="DH-11C.6A.2">\n</head>');
 const prompt=[
  '<section class="object-prompt" id="object-prompt" aria-label="Selected room object" hidden>',
  ' <div class="object-prompt__copy">',
  '  <h2 id="object-prompt-title">Explore</h2>',
  '  <p id="object-prompt-copy"></p>',
  ' </div>',
  ' <div class="object-prompt__actions">',
  '  <button type="button" id="object-prompt-open" class="object-prompt__open">Explore further</button>',
  '  <button type="button" id="object-prompt-close" class="object-prompt__dismiss" aria-label="Dismiss object prompt">×</button>',
  ' </div>',
  '</section>',
  ''
 ].join('\n');
 const tray='<section class="interaction-tray" id="interaction-tray" aria-labelledby="interaction-title" hidden>';
 put(tray,prompt+tray+'\n<button type="button" id="object-full-close" class="object-full-close" aria-label="Close object controls">×</button>');
 if(!html.includes('data-exit-door-proof="true"')||!html.includes('data-writing-world="true"'))
  throw Error('Minimal UI must preserve the live 3D door and Writing route');
 return html;
}
if(require.main===module){
 const destination=process.argv[2];
 if(!destination)throw Error('Destination canonical Writing directory is required');
 fs.mkdirSync(destination,{recursive:true});
 fs.writeFileSync(path.join(destination,'index.html'),render(fs.readFileSync(
  path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')),'utf8');
 console.log('PASS '+MARKER+' immersive Writing page: '+ROUTE);
}
module.exports={render,MARKER,ROUTE};

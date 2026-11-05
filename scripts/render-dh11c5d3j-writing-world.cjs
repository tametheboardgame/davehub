'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderRoom,VERSION}=require('./render-dh11c5d3i-exit-door.cjs');
const ROUTE='/worlds/writing/';
const BASE=ROUTE+'scene/';
const MARKER='DH-11C.5D.3J';

function render(source){
 let html=renderRoom(source);
 const put=(from,to)=>{
  const count=html.split(from).length-1;
  if(count!==1)throw Error('Direct Writing world asset/layout anchor changed ('+count+'): '+from.slice(0,100));
  html=html.replace(from,to);
 };
 // The URL remains /worlds/writing/, but this room owns all scripts/models.
 // The existing GLB loader uses document.baseURI for model resolution.
 put('<head>','<head>\n<base href="'+BASE+'">');
 const body=html.match(/<body([^>]*)>/);
 if(!body||html.split(body[0]).length!==2)throw Error('Writing scene body contract changed');
 put(body[0],'<body'+body[1]+' data-writing-world="true">');
 const title=html.match(/<title>[^<]*<\/title>/);
 if(!title)throw Error('Missing page title');
 put(title[0],'<title>The Manuscript Hoard | DaveHub</title>');
 put('← Existing Writing world','← DaveHub home');
 // Replace the old no-script self-link before rewriting the header link.
 const noscript=html.match(/<noscript>[\s\S]*?<\/noscript>/);
 if(!noscript||html.split(noscript[0]).length!==2)throw Error('Writing scene no-script fallback missing');
 put(noscript[0],'<noscript><p class="noscript">The Manuscript Hoard requires JavaScript and WebGL. <a href="/">Return to DaveHub home</a>.</p></noscript>');
 put('href="/worlds/writing/"','href="/"');
 put('href="#scene-nav"','href="/worlds/writing/#scene-nav"');
 put('ONE SHARED 3D WORLD','THE MANUSCRIPT HOARD');
 // Calibration choices remain in DOM for the actual 3D painterly runtime.
 // Hide development-only controls and design comparisons from visitors.
 const style='<meta name="davehub-writing-world" content="'+MARKER+'">\n'+
 '<style data-davehub-writing-world>\n'+
 'body[data-writing-world="true"] .illustration-calibrator,\n'+
 'body[data-writing-world="true"] .prototype-tools,\n'+
 'body[data-writing-world="true"] .comparison-links{display:none!important}\n'+
 '</style>\n';
 put('</head>',style+'</head>');
 const tag=html.match(/<span class="tag">[^<]*<\/span>/);
 if(!tag||html.split(tag[0]).length!==2)throw Error('Public Writing identity tag missing');
 put(tag[0],'<span class="tag">WRITING ISLAND</span>');
 if(/href="\/worlds\/writing\/"(?!#)/.test(html))throw Error('Retired Writing landing page self-link remains');
 if(!html.includes('data-exit-door-proof="true"'))throw Error('Cannot deploy a 3D room without its exit');
 return html;
}
function write(target,source){
 fs.mkdirSync(target,{recursive:true});
 const output=path.join(target,'index.html');
 fs.writeFileSync(output,render(source),'utf8');
 return output;
}
if(require.main===module){
 const out=process.argv[2];
 if(!out)throw Error('Destination Writing world directory required');
 const input=fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8');
 console.log('PASS '+MARKER+' genuine immersive Writing island route: '+write(out,input));
}
module.exports={render,write,ROUTE,BASE,VERSION,MARKER};

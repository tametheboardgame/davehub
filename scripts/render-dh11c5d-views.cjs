'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderFurniture}=require('./render-dh11c4f-furniture.cjs');
const guide=require('../prototypes/dh-11c-room/view-pipeline.js');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
function render(source){
 let html=renderFurniture(source);
 const put=(a,b)=>{if(html.split(a).length!==2)throw Error('DH-11C.5D preview template anchor mismatch: '+a);html=html.replace(a,b);};
 put('<link rel="stylesheet" href="./immersive.css">',
  '<link rel="stylesheet" href="./immersive.css">\n<link rel="stylesheet" href="./view-guides.css">');
 put('<script type="module" src="../room/room.js?v=dh11c5b-archive-v1"></script>',
  '<script defer src="../room/view-pipeline.js?v='+guide.VERSION+'"></script>\n<script type="module" src="../room/room.js?v='+guide.VERSION+'"></script>');
 put('room-plan.js?v=dh11c5b-archive-v1','room-plan.js?v='+guide.VERSION);
 put('data-furniture-model-proof="true">','data-furniture-model-proof="true" data-illustrated-view-proof="true">');
 put('DH-11C.4F Editable Furniture Modelling','DH-11C.5D Geometry-Locked Illustrated View Pipeline');
 put('DH-11C.4F / FURNITURE GEOMETRY','DH-11C.5D / VIEW REFERENCE PIPELINE');
 put('Every object belongs to the same world.','One room. Eight perfectly repeatable views.');
 put('FURNITURE GLB MODELLING PROOF','CANONICAL ILLUSTRATION CAMERA GUIDES');
 put('Interact with the newly modelled objects','Capture a verified view to guide the finished illustration');
 put('DH-11C.5B ARCHIVE MATERIAL REFERENCE: the approved walnut writing desk now sits beside aged walnut shelves, varied gilt-stamped bindings and a weathered metal filing cabinet with textured drawers and folders. Test highlighted books, all five drawers and the lamp. This staging study does not replace the published Writing world.',
  'DH-11C.5D.1–5D.2: this captures structural references from the actual working 3D room for future high-illustration plates. It does NOT yet show a final painted illustration. The same cameras, cabinet drawers, papers, highlighted books, lamp and typewriter remain mechanically authoritative.');
 put('<div class="reticle" aria-hidden="true"></div>',
  '<div class="reticle" aria-hidden="true"></div>\n'+
  '   <section class="view-guide-panel" aria-label="Illustrated view reference exports">\n'+
  '    <p class="view-guide-kicker">ILLUSTRATION PIPELINE / DH-11C.5D</p>\n'+
  '    <p class="view-guide-intro">Structural reference only. Choose a view, then capture the exact model/camera image and its matching projection guide.</p>\n'+
  '    <div class="view-guide-buttons"><button type="button" id="capture-view-guide">Capture camera PNG</button><button type="button" id="export-view-guide">Export view JSON</button></div>\n'+
  '    <p id="view-guide-status" role="status" aria-live="polite">Eight camera positions locked to the approved room.</p>\n'+
  '   </section>');
 put('<a href="../room-shell/" rel="nofollow">Earlier Blender room shell</a>',
  '<a href="../comic-storybook/" rel="nofollow">Previous shader experiment</a><a href="../furniture/" rel="nofollow">Approved geometry reference</a><a href="../room-shell/" rel="nofollow">Earlier Blender room shell</a>');
 put('davehub-furniture-release" content="dh11c5b-archive-v1"',
  'davehub-furniture-release" content="dh11c5b-archive-v1"><meta name="davehub-illustrated-view-release" content="'+guide.VERSION+'"');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Output directory required');
 fs.mkdirSync(target,{recursive:true});
 const input=fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8');
 fs.writeFileSync(path.join(target,'index.html'),render(input));
 fs.writeFileSync(path.join(target,'camera-contract.json'),JSON.stringify(guide.contract(plan),null,2)+'\n');
 console.log('PASS DH-11C.5D eight camera-guide references and dedicated staging geometry-capture preview');
}
module.exports={render};

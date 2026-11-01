'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderFurniture}=require('./render-dh11c4f-furniture.cjs');
const VERSION='dh11c5c-painted-surfaces-v2';
function render(source){
 let html=renderFurniture(source);
 function put(a,b){
  const occurrences=html.split(a).length-1;
  if(occurrences!==1)throw Error('Illustrated preview anchor mismatch ('+occurrences+'): '+a.slice(0,100));
  html=html.replace(a,b);
 }
 put('<link rel="stylesheet" href="./immersive.css">',
 '<link rel="stylesheet" href="./immersive.css">\n<link rel="stylesheet" href="./illustrated.css">');
 put('<script type="module" src="../room/room.js?v=dh11c5b-archive-v1"></script>',
 '<script defer src="../room/illustrated-style-v2.js?v='+VERSION+'"></script>\n<script type="module" src="../room/room.js?v='+VERSION+'"></script>');
 put('room-plan.js?v=dh11c5b-archive-v1','room-plan.js?v='+VERSION);
 put('<meta name="davehub-furniture-release" content="dh11c5b-archive-v1">',
 '<meta name="davehub-furniture-release" content="'+VERSION+'">\n<meta name="davehub-illustrated-stage" content="DH-11C.5C.2A">');
 put('data-furniture-model-proof="true">','data-furniture-model-proof="true" data-illustrated-proof="true" data-illustrated-v2="true">');
 put('DH-11C.4F Editable Furniture Modelling','DH-11C.5C.2A Painterly Storybook Calibration');
 put('DH-11C.4F / FURNITURE GEOMETRY','DH-11C.5C.2A / ILLUSTRATED STYLE');
 put('Every object belongs to the same world.','A world painted, not merely relit.');
 put('FURNITURE GLB MODELLING PROOF','PAINTERLY STORYBOOK / PAINTED SURFACES V2');
 put('Interact with the newly modelled objects','Compare the same working room in two art treatments');
 put('DH-11C.5B ARCHIVE MATERIAL REFERENCE: the approved walnut writing desk now sits beside aged walnut shelves, varied gilt-stamped bindings and a weathered metal filing cabinet with textured drawers and folders. Test highlighted books, all five drawers and the lamp. This staging study does not replace the published Writing world.',
 'DH-11C.5C.2A: switch between the original textured-material reference and the first illustrated storybook treatment. Both use exactly the same working desk, bookcase and cabinet meshes, camera, papers, lamp, books and drawers. The original Writing world remains unchanged.');
 put('<div class="reticle" aria-hidden="true"></div>',
 '<div class="reticle" aria-hidden="true"></div>\n'+
 '   <section class="illustration-calibrator" aria-label="Illustrated style calibration">\n'+
 '    <div class="calibrator-heading"><span>ILLUSTRATION LAB</span><small>DH-11C.5C.2A / VARIANT A</small></div>\n'+
 '    <div class="illustration-choices" role="group" aria-label="Rendering treatment">\n'+
 '     <button type="button" data-illustration-mode="reference" aria-pressed="false">Original materials</button>\n'+
 '     <button type="button" data-illustration-mode="painterly" aria-pressed="true">Painterly Storybook</button>\n'+
 '    </div>\n'+
 '    <p id="illustration-description" role="status" aria-live="polite">Painted wood grain, illustrated parchment, hand-inked edges and warmer character.</p>\n'+
 '   </section>');
 put('<a href="../room-shell/" rel="nofollow">Earlier Blender room shell</a>',
 '<a href="../illustrated/" rel="nofollow">Earlier lighting-led Variant A</a><a href="../furniture/" rel="nofollow">Original C5B textured reference</a><a href="../room-shell/" rel="nofollow">Earlier Blender room shell</a>');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.5C.2A painterly side-by-side material calibration preview');
}
module.exports={render,VERSION};

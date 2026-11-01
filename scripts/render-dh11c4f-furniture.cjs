'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:renderRoom}=require('./render-dh11c4e-room.cjs');
function render(source){
 let html=renderRoom(source);
 const replace=(a,b)=>{if(!html.includes(a))throw Error('DH-11C.4F preview template anchor missing: '+a.slice(0,90));html=html.replace(a,b);};
 // Force a fresh JS fetch for the highlighted bookcase, even in browsers
 // that have cached the earlier six-furniture room module.
 replace('<script type="module" src="../room/room.js"></script>',
  '<script type="module" src="../room/room.js?v=dh11c4l-lamp-switch-v1"></script>');
 replace('<script defer src="../room/room-plan.js"></script>',
  '<script defer src="../room/room-plan.js?v=dh11c4l-lamp-switch-v1"></script>');
 replace('</head>','<meta name="davehub-furniture-release" content="dh11c4l-lamp-switch-v1">\n</head>');
 replace('DH-11C.4E Editable Blender Room Architecture','DH-11C.4F Editable Furniture Modelling');
 replace('DH-11C.4E / BLENDER ROOM SHELL','DH-11C.4F / FURNITURE GEOMETRY');
 replace('The room itself is now a model.','Every object belongs to the same world.');
 replace('data-shell-model-proof="true">','data-shell-model-proof="true" data-furniture-model-proof="true">');
 replace('BLENDER ROOM-SHELL ASSET','FURNITURE GLB MODELLING PROOF');
 replace('Inspect the first exportable room shell','Interact with the newly modelled objects');
 replace('The complete architectural shell is modelled from one coordinate manifest and loaded as a GLB, with real openings, floor planks, beams, rug and corridor. The existing Blender-exported cabinet still has five working drawers. A separate GitHub job generates and validates an editable Blender room master; the preview loads the actual Blender-exported GLB, with a fallback model created from the same geometry manifest.',
 'All six remaining interactive room objects are described by physical named geometry with editable animation pivots. The room shell and filing cabinet remain real Blender exports. This isolated comparison initially loads a deterministic furniture source GLB, while the independent Blender master/export pipeline is checked in GitHub Actions.');
 replace('<p id="shell-model-status" role="status" aria-live="polite">Loading exportable room shell model…</p>',
 '<p id="shell-model-status" role="status" aria-live="polite">Loading Blender room shell…</p><p id="furniture-model-status" role="status" aria-live="polite">Loading six-furniture GLB geometry…</p>');
 replace('Geometry modelling validation only; colours and textures remain placeholders. No model swaps on the existing Writing world. Compare the room and cabinet from their normal camera stops.',
 'Furniture geometry prototype only; textures are not yet approved. Test the desk papers, selectable books, typewriter key, bin, swinging door, floating islands and cabinet drawers. This is not the published Writing world.');
 replace('<a href="../architecture/" rel="nofollow">Previous procedural architecture</a>',
 '<a href="../room-shell/" rel="nofollow">Earlier Blender room shell</a><a href="../architecture/" rel="nofollow">Earlier procedural architecture</a>');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.4F isolated fullscreen furniture model preview');
}
module.exports={render};

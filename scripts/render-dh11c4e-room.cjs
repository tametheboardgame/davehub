'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:old}=require('./render-dh11c4c-architecture.cjs');
function render(source){
 let html=old(source);
 const put=(a,b)=>{if(!html.includes(a))throw Error('Room-shell preview anchor not found: '+a);html=html.replace(a,b);};
 put('DH-11C.4C Real Architectural Openings and Blender Cabinet','DH-11C.4E Editable Blender Room Architecture');
 put('DH-11C.4C / REAL ROOM ARCHITECTURE','DH-11C.4E / BLENDER ROOM SHELL');
 put('A real room beyond the doorway.','The room itself is now a model.');
 put('<body data-glb-proof="true" data-shell-proof="true" data-blender-compare="true" data-immersive-room="true">',
 '<body data-glb-proof="true" data-shell-proof="true" data-blender-compare="true" data-immersive-room="true" data-shell-model-proof="true">');
 put('<script defer src="../room/room-shell-plan.js"></script>',
 '<script defer src="../room/room-shell-plan.js"></script>\n<script defer src="../room/room-shell-asset.js"></script>');
 put('VERIFIED BLENDER MODEL AND OPEN ARCHITECTURE','ROOM-SHELL ASSET PIPELINE');
 put('Look through the room, not through a picture','Inspect the first exportable room shell');
 put('This test loads the cabinet GLB exported by Blender 4.0.2 and independently validated in DH-11C.4B. Seven real wall segments make two structural openings instead of hiding intact walls behind decorative images. Choose Door or Window below to see through them, or inspect the cabinet as before.',
 'The complete architectural shell is modelled from one coordinate manifest and loaded as a GLB, with real openings, floor planks, beams, rug and corridor. The existing Blender-exported cabinet still has five working drawers. A separate GitHub job generates and validates an editable Blender room master; the preview initially loads the deterministic source GLB to protect visual parity.');
 put('  <section class="glb-proof-controls" aria-label="Cabinet GLB geometry proof">',
 '  <section class="glb-proof-controls" aria-label="Cabinet GLB geometry proof">\n   <p id="shell-model-status" role="status" aria-live="polite">Loading exportable room shell model…</p>');
 put('This is a same-geometry architectural and model comparison, not final textured art. The older procedural cabinet and original room remain available, and no manuscripts or production pages are changed.',
 'Geometry modelling validation only; colours and textures remain placeholders. No model swaps on the existing Writing world. Compare the room and cabinet from their normal camera stops.');
 put('<a href="../room/" rel="nofollow">Original greybox room, solid walls</a>',
 '<a href="../architecture/" rel="nofollow">Previous procedural architecture</a>\n    <a href="../room/" rel="nofollow">Original greybox room</a>');
 return html;
}
if(require.main===module){
 const target=process.argv[2];if(!target)throw Error('Preview output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(path.resolve(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8')));
 console.log('PASS DH-11C.4E room shell GLB preview generated');
}
module.exports={render};

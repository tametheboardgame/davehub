'use strict';
const fs=require('node:fs'),path=require('node:path');
const {render:baseRender}=require('./render-dh11c4-glb-proof.cjs');
const source=path.resolve(__dirname,'../prototypes/dh-11c-room/index.html');
function render(original){
 let html=baseRender(original);
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing cabinet proof marker '+a);html=html.replace(a,b)};
 replace('DH-11C.4A Hollow Cabinet GLB Round-Trip','DH-11C.4C Real Architectural Openings and Blender Cabinet');
 replace('<script defer src="../room/room-plan.js"></script>','<script defer src="../room/room-plan.js"></script>\n<script defer src="../room/room-shell-plan.js"></script>');
 replace('<body data-glb-proof="true">','<body data-glb-proof="true" data-shell-proof="true" data-blender-compare="true">');
 replace('DH-11C.4A / GEOMETRY ROUND-TRIP','DH-11C.4C / REAL ROOM ARCHITECTURE');
 replace('One cabinet. Five real sliding drawers.','A real room beyond the doorway.');
 replace('The filing cabinet is now a genuinely hollow GLB model, generated from editable geometry source. Explore the same room and camera, inspect the rails, then open drawers at any extension.',
  'The back wall has an actual window opening and the side wall has an actual doorway. Beyond the hinged door is a physical corridor. The cabinet loads the real Blender-exported GLB, with its five moving drawer rigs.');
 replace('FIRST PRODUCTION-ASSET PIPELINE PROOF','VERIFIED BLENDER MODEL AND OPEN ARCHITECTURE');
 replace('Inspect the hollow geometry','Look through the room, not through a picture');
 replace('UNCOLOURED GEOMETRY','3D GEOMETRY');
 replace('The model is a real glTF 2.0 binary generated from reproducible first-party geometry source. It has five hollow slots, rails, separate drawer floors, sides and folder nodes. All parts share the existing room camera and metres scale.',
  'This test loads the cabinet GLB exported by Blender 4.0.2 and independently validated in DH-11C.4B. Seven real wall segments make two structural openings instead of hiding intact walls behind decorative images. Choose Door or Window below to see through them, or inspect the cabinet as before.');
 replace('This is an untextured model test, not Blender-approved production art. It does not replace the normal room, approve any of the three visual palettes, or publish manuscripts.',
  'This is a same-geometry architectural and model comparison, not final textured art. The older procedural cabinet and original room remain available, and no manuscripts or production pages are changed.');
 const anchor='  <div class="control-strip">';
 const panel=[
 '  <nav class="comparison-links" aria-label="Compare architectural geometry">',
 '    <a href="../room/" rel="nofollow">Original greybox room, solid walls</a>',
 '    <a href="../cabinet-glb/" rel="nofollow">Prior deterministic GLB cabinet</a>',
 '    <a href="../art-lab/" rel="nofollow">Unapproved material palette studies</a>',
 '  </nav>',
 '  <div class="control-strip">'
 ].join('\n');
 replace(anchor,panel);
 return html;
}
if(require.main===module){
 const out=process.argv[2];if(!out)throw Error('Output directory required');
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'index.html'),render(fs.readFileSync(source,'utf8')));
 console.log('PASS DH-11C.4C Blender cabinet and architectural geometry preview generated');
}
module.exports={render};

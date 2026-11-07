'use strict';
const fs=require('node:fs');
const path=require('node:path');
const sourcePath=path.resolve(__dirname,'../prototypes/dh-11c-room/index.html');
function render(source){
 let s=source;
 const replace=(a,b)=>{if(!s.includes(a))throw Error('Missing room source anchor: '+a);s=s.replace(a,b)};
 replace('<title>Enter the 3D Manuscript Hoard | DaveHub DH-11C.2</title>','<title>DH-11C.4A Hollow Cabinet GLB Round-Trip | DaveHub</title>');
 replace('<link rel="stylesheet" href="./room.css">','<link rel="stylesheet" href="../room/room.css">\n<link rel="stylesheet" href="./glb-proof.css">');
 replace('<script defer src="./room-plan.js"></script>','<script defer src="../room/room-plan.js"></script>');
 replace('<script type="module" src="./room.js"></script>','<script type="module" src="../room/room.js"></script>');
 replace('<body>','<body data-glb-proof="true">');
 replace('<span class="tag">DH-11C.2 / PROTOTYPE</span>','<span class="tag">DH-11C.4A / GEOMETRY ROUND-TRIP</span>');
 replace('<p class="overline">ENTER THE WRITING ISLAND</p>','<p class="overline">REAL 3D MODEL, NOT PERSPECTIVE-FAKED IMAGES</p>');
 replace('<h1>A room full of improbable things.</h1>','<h1>One cabinet. Five real sliding drawers.</h1>');
 replace('<p>Everything in this room has its own position, depth and shape. Click the furniture to investigate, or use the object selector beneath the scene.</p>',
 '<p>The filing cabinet is now a genuinely hollow GLB model, generated from editable geometry source. Explore the same room and camera, inspect the rails, then open drawers at any extension.</p>');
 const panel=[
 '  <section class="glb-proof-controls" aria-label="Cabinet GLB geometry proof">',
 '   <div class="proof-title"><div><p class="overline">FIRST PRODUCTION-ASSET PIPELINE PROOF</p><h2>Inspect the hollow geometry</h2></div><span class="proof-chip">UNCOLOURED GEOMETRY</span></div>',
 '   <p>The model is a real glTF 2.0 binary generated from reproducible first-party geometry source. It has five hollow slots, rails, separate drawer floors, sides and folder nodes. All parts share the existing room camera and metres scale.</p>',
 '   <p class="proof-info" id="glb-proof-status" role="status" aria-live="polite">Loading the GLB geometry model…</p>',
 '   <div class="proof-travel">',
 '    <label for="glb-extension">Selected drawer travel <output id="glb-extension-value" for="glb-extension">100%</output></label>',
 '    <input type="range" id="glb-extension" min="0" max="100" step="1" value="100" disabled>',
 '    <div class="proof-snaps" role="group" aria-label="Snap the selected drawer to an extension">',
 '      <button data-glb-snap="0" type="button" disabled>Closed · 0%</button>',
 '      <button data-glb-snap="50" type="button" disabled>Half-open · 50%</button>',
 '      <button data-glb-snap="100" type="button" disabled>Fully open · 100%</button>',
 '    </div>',
 '   </div>',
 '   <p class="proof-boundary">This is an untextured model test, not Blender-approved production art. It does not replace the normal room, approve any of the three visual palettes, or publish manuscripts.</p>',
 '  </section>',
 '  <div class="control-strip">'
 ].join('\n');
 replace('  <div class="control-strip">',panel);
 return s;
}
if(require.main===module){
 const target=process.argv[2];
 if(!target)throw Error('Output directory required');
 fs.mkdirSync(target,{recursive:true});
 fs.writeFileSync(path.join(target,'index.html'),render(fs.readFileSync(sourcePath,'utf8')));
 console.log('PASS: generated DH-11C.4A identical-room GLB proof HTML');
}
module.exports={render};

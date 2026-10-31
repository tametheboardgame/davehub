'use strict';
// DH-11C.3A art laboratory: reuse the exact existing scene DOM/camera/meshes.
// No duplicated generated cabinet/room imagery and no independently defined 3D geometry.
const fs=require('node:fs');
const path=require('node:path');
const SOURCE=path.join(__dirname,'../prototypes/dh-11c-room/index.html');
function createArtLabHtml(source){
 let html=source;
 const replace=(before,after)=>{
  if(!html.includes(before))throw Error('Expected DH-11C.2 source anchor not found: '+before);
  html=html.replace(before,after);
 };
 replace('<title>Enter the 3D Manuscript Hoard | DaveHub DH-11C.2</title>','<title>DH-11C.3A Material Direction Laboratory | DaveHub</title>');
 replace('<link rel="stylesheet" href="./room.css">','<link rel="stylesheet" href="../room/room.css">\n<link rel="stylesheet" href="./art-lab.css">');
 replace('<script defer src="./room-plan.js"></script>','<script defer src="../room/room-plan.js"></script>\n<script defer src="../room/art-palettes.js"></script>');
 replace('<script type="module" src="./room.js"></script>','<script type="module" src="../room/room.js"></script>');
 replace('<body>','<body data-art-lab="true">');
 replace('<span class="tag">DH-11C.2 / PROTOTYPE</span>','<span class="tag">DH-11C.3A / ART DIRECTION LAB</span>');
 replace('<p class="overline">ENTER THE WRITING ISLAND</p>','<p class="overline">TEST THE SAME ROOM, THREE DIFFERENT PALETTES</p>');
 replace('<h1>A room full of improbable things.</h1>','<h1>One room. Three possible moods.</h1>');
 replace('<p>Everything in this room has its own position, depth and shape. Click the furniture to investigate, or use the object selector beneath the scene.</p>',
 '<p>Switch the finish and lighting without changing a single piece of furniture, drawer, camera or interactive mechanism. These are colour and lighting studies, not finished textures.</p>');
 replace('  <div class="control-strip">',`  <section class="art-lab-selector" aria-labelledby="art-lab-heading">
    <div class="art-lab-head"><div><p class="overline">FIRST-PASS MATERIAL DIRECTION</p><h2 id="art-lab-heading">Try the room in three moods</h2></div><div class="art-lab-current">Currently viewing: <strong id="style-current">Amber &amp; Ink</strong></div></div>
    <div class="art-palette-buttons" role="group" aria-label="Select one room material palette">
      <button type="button" data-palette="amber-ink" aria-pressed="true"><span class="palette-stripe palette-stripe--amber" aria-hidden="true"></span><strong>Amber &amp; Ink</strong><small>Warm, mysterious, manuscript-filled</small></button>
      <button type="button" data-palette="moonlit-archive" aria-pressed="false"><span class="palette-stripe palette-stripe--moon" aria-hidden="true"></span><strong>Moonlit Archive</strong><small>Midnight and magical blue light</small></button>
      <button type="button" data-palette="golden-storybook" aria-pressed="false"><span class="palette-stripe palette-stripe--golden" aria-hidden="true"></span><strong>Golden Storybook</strong><small>Cosy and sunlit, with a lighter mood</small></button>
    </div>
    <p id="style-summary" class="style-summary">Rich timber, weathered teal, softly glowing parchment and muted brass. Primary proposal.</p>
    <p class="style-scope">All three modes use the exact DH-11C.2 meshes, camera positions and working mechanisms. They change <em>material colours and lighting only</em>. No photographic textures, invented 3D imagery or published content. The final design and art bible still require approval.</p>
  </section>
  <div class="control-strip">`);
 replace('The Manuscript Hoard:','The Manuscript Hoard:');
 return html;
}
function main(outDir){
 const html=createArtLabHtml(fs.readFileSync(SOURCE,'utf8'));
 fs.mkdirSync(outDir,{recursive:true});
 fs.writeFileSync(path.join(outDir,'index.html'),html);
 console.log('PASS DH-11C.3A generated same-geometry art laboratory: '+outDir);
}
if(require.main===module){
 const dir=process.argv[2];
 if(!dir)throw Error('Output directory required');
 main(path.resolve(dir));
}
module.exports={createArtLabHtml};

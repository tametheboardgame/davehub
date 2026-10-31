'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const plan=require('../prototypes/dh-11c-room/room-plan.js');
const palettes=require('../prototypes/dh-11c-room/art-palettes.js');
const {createArtLabHtml}=require('../scripts/render-dh11c-art-lab.cjs');
const source=fs.readFileSync(path.join(__dirname,'../prototypes/dh-11c-room/index.html'),'utf8');
const roomJs=fs.readFileSync(path.join(__dirname,'../prototypes/dh-11c-room/room.js'),'utf8');
test('three unique, complete first-party style candidates use the exact same scene plan',()=>{
 assert.equal(palettes.all.length,3);
 assert.deepEqual(palettes.all.map(p=>p.id),['amber-ink','moonlit-archive','golden-storybook']);
 assert.equal(palettes.get('unknown'),palettes.all[0]);
 for(const p of palettes.all){
  for(const key of ['backdrop','plaster','stone','timber','darkwood','edge','desk','brass','paper','ink','cabinet','drawer','rug','glass','sky','island','leaf','bin','ambient','ground','sun','lamp','window']){
    assert.match(p[key],/^#[\da-fA-F]{6}$/,'Invalid '+p.id+' / '+key);
  }
  assert.equal(p.bookSpines.length,6);
  for(const k of ['ambientIntensity','sunIntensity','lampIntensity','windowIntensity','exposure'])assert.ok(p[k]>0);
  assert.deepEqual(Object.keys(p).filter(k=>/camera|position|geometry|pivot|mesh/.test(k)),[]);
 }
 assert.equal(plan.validate(),true);
 assert.equal(plan.OBJECTS.length,7);
});
test('lab is generated from unchanged DH-11C.2 HTML and shares exact renderer and camera controls',()=>{
 const html=createArtLabHtml(source);
 assert.match(html,/data-art-lab="true"/);
 assert.match(html,/\.\.\/room\/room\.js/);
 assert.match(html,/\.\.\/room\/room-plan\.js/);
 assert.match(html,/\.\.\/room\/art-palettes\.js/);
 assert.match(html,/\.\/art-lab\.css/);
 for(const id of ['room-canvas','scene-frame','object-list','interaction-tray','home-button','place-name','style-current','style-summary'])
  assert.ok(html.includes('id="'+id+'"'),id);
 for(const value of ['amber-ink','moonlit-archive','golden-storybook'])
  assert.ok(html.includes('data-palette="'+value+'"'));
 assert.match(html,/not finished textures/);
 assert.doesNotMatch(html,/The Last Lightkeeper|The Clock of Tomorrow/);
 // Ensure the baseline HTML remains unmodified by pure template rendering.
 assert.doesNotMatch(source,/data-art-lab="true"/);
 assert.match(source,/DH-11C\.2/);
});
test('material lab code is opt-in and does not change camera geometry or modify the normal room mode',()=>{
 assert.match(roomJs,/document\.body\.dataset\.artLab==='true'/);
 assert.match(roomJs,/if\(artLab\)/);
 assert.match(roomJs,/function setArtPreset\(palette\)/);
 assert.match(roomJs,/material\.color\.set\(palette\[name\]\)/);
 assert.match(roomJs,/sceneLights\.ambient\.groundColor\.set/);
 assert.match(roomJs,/new THREE\.PerspectiveCamera\(51,1,\.08,80\)/);
 assert.match(roomJs,/plan\.HOME\.position/);
 assert.doesNotMatch(roomJs,/geometry\s*=\s*new.*preset/);
 const syntax=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:roomJs,encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
});
test('asset audit and source contract exist without fabricated browser capture or publishing records',()=>{
 const base=path.join(__dirname,'../docs');
 const audit=fs.readFileSync(path.join(base,'DH11C3A_SCENE_AUDIT.md'),'utf8');
 const bible=fs.readFileSync(path.join(base,'DH11C3_ART_BIBLE.md'),'utf8');
 const contract=fs.readFileSync(path.join(base,'DH11C3A_GLTF_NODE_CONTRACT.md'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(base,'DH11C3A_ASSET_INVENTORY.json'),'utf8'));
 assert.equal(manifest.schemaVersion,1);
 assert.equal(manifest.designApproval,'pending');
 assert.equal(manifest.items.length>=20,true);
 assert.equal(new Set(manifest.items.map(x=>x.id)).size,manifest.items.length);
 for(const item of manifest.items){assert.ok(['P0','P1','P2'].includes(item.priority));assert.ok(item.model);assert.ok(item.gate);}
 for(const x of plan.OBJECTS)assert.ok(audit.includes(x.label)||audit.toLowerCase().includes(x.id));
 for(const marker of ['G1','G2','G3','not proof','screenshot'])assert.ok(audit.toLowerCase().includes(marker.toLowerCase()));
 for(const marker of ['ADR-0012','Amber & Ink','Moonlit Archive','Golden Storybook','NOT owner-approved'])assert.ok(bible.includes(marker));
 assert.match(contract,/drawer_finished/);
 assert.match(contract,/door_leaf_hinge/);
});

'use strict';
/*
 * DH-11C owner-approved full Writing Room release: all physical and reader interactions.
 * Deliberately does NOT copy staging's unrelated worlds, previews, workflows
 * or editorial features into the main branch.
 */
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const {render}=require('./render-dh11c6e1-visible-uncrumple.cjs');
function build(root){
 const output=path.resolve(root||'dist');
 const room=path.join(output,'worlds','writing');
 const source=path.resolve(__dirname,'../prototypes/dh-11c-room');
 const models=path.join(room,'room','models');
 fs.mkdirSync(models,{recursive:true});
 fs.cpSync(source,path.join(room,'room'),{recursive:true});
 // Original mesh and UV geometry, generated from tracked reproducible sources.
 const tasks=[
  ['build-dh11c4c-blender-model.cjs','cabinet-blender-verified.glb'],
  ['build-dh11c4e-blender-model.cjs','room-shell-blender-verified.glb'],
  ['build-dh11c4f-furniture-glb.cjs','furniture-source.glb']
 ];
 for(const [builder,file] of tasks){
  cp.execFileSync(process.execPath,[path.join(__dirname,builder),path.join(models,file)],
   {stdio:'inherit',timeout:120000});
  const actual=fs.statSync(path.join(models,file));
  if(!actual.size)throw Error('Required room model is empty: '+file);
 }
 const scene=path.join(room,'scene');
 const cabinet=path.join(room,'cabinet-glb');
 fs.mkdirSync(scene,{recursive:true});fs.mkdirSync(cabinet,{recursive:true});
 for(const file of ['architecture.css','immersive.css','immersive-ui.js','illustrated.css','minimal-immersive.css',
  'book-experience.css','manuscript-experience.css','cabinet-experience.css',
  'cabinet-tray.css','discarded-ideas.css']){
  fs.copyFileSync(path.join(source,file),path.join(scene,file));
 }
 fs.copyFileSync(path.join(source,'glb-proof.css'),path.join(cabinet,'glb-proof.css'));
 const html=render(fs.readFileSync(path.join(source,'index.html'),'utf8'));
 fs.writeFileSync(path.join(room,'index.html'),html,'utf8');
 for(const required of ['data-writing-world="true"','data-exit-door-proof="true"',
  'data-dark-window-preload="true"','data-minimal-ui="true"',
  'DH-11C.6E.1','data-uncrumple-direct="true"','data-discarded-ideas="true"',
  'data-cabinet-tray="true"','data-cabinet-archive="true"',
  'data-manuscript-experience="true"','data-finished-books="true"',
  'data-motion-first="true"','published-book-dialog','manuscript-dialog',
  'workshop-dialog','archive-tray-dialog','archive-folder-dialog','discarded-dialog',
  'id="discarded-unfold"','room.js?v=dh11c6e-wastepaper-v1']){
  if(!html.includes(required))throw Error('Approved Writing Room feature missing: '+required);
 }
 // The one public-safe edition catalogue and all nine explicitly invented
 // bin samples remain immutable, not a gateway to any unpublished work.
 const editions=require(path.join(source,'finished-books.js'));
 const scraps=require(path.join(source,'discarded-ideas.js'));
 if(editions.BOOKS?.length!==3||scraps.ITEMS?.length!==9||
  !scraps.ITEMS.every(x=>x.kind==='Fictional demonstration'))
  throw Error('Public Writing Room catalogue approval gate failed');
 console.log('PASS owner-approved DH-11C.6E.1 Writing Room release, no unrelated staging output');
 return room;
}
if(require.main===module)build(process.argv[2]||'dist');
module.exports={build};

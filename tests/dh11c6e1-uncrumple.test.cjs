'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const stage=require('../scripts/render-dh11c6e1-visible-uncrumple.cjs');
const prior=require('../scripts/render-dh11c6e-wastepaper-bin.cjs');
const discarded=require('../prototypes/dh-11c-room/discarded-ideas.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const source=read('prototypes/dh-11c-room/index.html');
function fakeDOM(){
 const names=['discarded-dialog','discarded-close','discarded-title','discarded-number',
  'discarded-stamp','discarded-text','discarded-reverse','discarded-reverse-label',
  'discarded-folded','discarded-sheet','discarded-unfold','discarded-flip',
  'discarded-feedback','discarded-leave','discarded-return'];
 const nodes=new Map();
 const doc={activeElement:null,getElementById:id=>nodes.get(id),createElement:tag=>make(tag)};
 function make(tag='div'){
  const callbacks={};
  return {tagName:tag.toUpperCase(),textContent:'',children:[],hidden:false,open:false,
   dataset:{},isConnected:true,attributes:{},style:{setProperty(){}},
   addEventListener(k,fn){(callbacks[k]??=[]).push(fn);},
   dispatch(k,e={}){for(const fn of callbacks[k]||[])fn({target:this,...e});},
   replaceChildren(...children){this.children=children;},
   setAttribute(k,v){this.attributes[k]=v;},
   showModal(){this.open=true;},
   close(){this.open=false;this.dispatch('close');},
   focus(){doc.activeElement=this;}
  };
 }
 for(const name of names)nodes.set(name,make(name==='discarded-dialog'?'dialog':'button'));
 return {doc,nodes};
}
test('new renderer puts a semantic clickable crumple and big primary button INSIDE the visible stage',()=>{
 const html=stage.render(source),old=prior.render(source);
 assert.equal(stage.MARKER,'DH-11C.6E.1');
 assert.equal(stage.VERSION,'dh11c6e1-uncrumple-v1');
 assert.ok(html.includes('data-uncrumple-direct="true"'));
 assert.ok(html.includes('<button id="discarded-folded" class="discarded-crumple" type="button"'));
 assert.ok(html.includes('aria-label="Uncrumple paper and read the recovered idea"'));
 assert.ok(html.includes('>Uncrumple paper</button>'));
 assert.equal((html.match(/id="discarded-folded"/g)||[]).length,1);
 assert.equal((html.match(/id="discarded-unfold"/g)||[]).length,1);
 const section=html.slice(html.indexOf('<section class="discarded-stage"'),html.indexOf('</section>',html.indexOf('<section class="discarded-stage"')));
 assert.ok(section.includes('id="discarded-folded"'));
 assert.ok(section.includes('id="discarded-unfold"'));
 assert.ok(section.indexOf('id="discarded-folded"')<section.indexOf('id="discarded-unfold"'));
 assert.ok(section.indexOf('id="discarded-unfold"')<section.indexOf('id="discarded-sheet"'));
 const footer=html.slice(html.indexOf('<footer class="discarded-footer"'),html.indexOf('</footer>',html.indexOf('<footer class="discarded-footer"')));
 assert.ok(!footer.includes('id="discarded-unfold"'),'uncrumple is NOT hidden in a bottom footer');
 assert.ok(footer.includes('id="discarded-leave"')&&footer.includes('id="discarded-return"'));
 assert.ok(!old.includes('data-uncrumple-direct'), 'previous renderer is opt-out');
 assert.ok(!source.includes('discarded-folded'), 'original preview has no extra controls');
});
test('both the physical-looking paper button and Uncrumple paper call the same unfold path on all nine notes',()=>{
 const {doc,nodes}=fakeDOM(),returned=[];
 const ui=discarded.mount({document:doc,onReturnToBin:id=>returned.push(id)});
 for(let i=0;i<9;i++){
  assert.equal(ui.show(i),true);
  assert.equal(nodes.get('discarded-folded').hidden,false);
  assert.equal(nodes.get('discarded-unfold').hidden,false);
  const action=i%2?'discarded-unfold':'discarded-folded';
  nodes.get(action).dispatch('click');
  assert.equal(nodes.get('discarded-folded').hidden,true);
  assert.equal(nodes.get('discarded-unfold').hidden,true);
  assert.equal(nodes.get('discarded-sheet').hidden,false);
  assert.equal(nodes.get('discarded-flip').hidden,false);
  assert.equal(doc.activeElement,nodes.get('discarded-flip'));
  nodes.get('discarded-flip').dispatch('click');
  assert.equal(ui.side,'back');
  assert.equal(nodes.get('discarded-reverse').hidden,false);
  nodes.get('discarded-leave').dispatch('click');
  assert.equal(ui.opened,false);
 }
 assert.deepEqual(returned,[],'unfolding/closing must not alter the physical bin toss');
});
test('opening the crumple with keyboard activation also returns the real object on explicit command',()=>{
 const {doc,nodes}=fakeDOM(),returned=[];
 const ui=discarded.mount({document:doc,onReturnToBin:id=>returned.push(id)});
 ui.show(8);
 nodes.get('discarded-folded').dispatch('click'); // native button activation via Enter/Space
 nodes.get('discarded-return').dispatch('click');
 assert.deepEqual(returned,[8]);
 assert.equal(ui.opened,false);
});
test('CSS constrains dialog to viewport, scrolls the reader rather than burying CTA and honours reduced motion',()=>{
 const css=read('prototypes/dh-11c-room/discarded-ideas.css');
 for(const marker of [
  'body[data-uncrumple-direct="true"] .discarded-dialog[open]',
  'display:flex;', 'flex-direction:column;',
  'height:min(91dvh,740px)', 'overflow:hidden;',
  'body[data-uncrumple-direct="true"] .discarded-stage',
  'min-height:0;', 'overflow:auto;',
  'body[data-uncrumple-direct="true"] .discarded-stage .discarded-unfold',
  'margin-top:auto;', 'margin-bottom:auto;',
  'body[data-uncrumple-direct="true"] .discarded-header h2',
  '@media(max-width:650px)', '@media(max-height:550px)',
  '@media(prefers-reduced-motion:reduce)'
 ])assert.ok(css.includes(marker),marker);
 const section=css.slice(css.indexOf('/* DH-11C.6E.1:'));
 assert.ok(section.includes('flex:0 0 auto;'),'footer remains visible');
 assert.ok(section.includes('width:min(190px,27dvh,56vw)'),'paper scales to viewport height');
});
test('staging build, asset cache-busting and hosted smoke enforce the updated primary action',()=>{
 const build=read('scripts/build-pages.sh');
 const smoke=read('scripts/check-cloudflare-staging.cjs');
 for(const s of [
  'tests/dh11c6e1-uncrumple.test.cjs',
  'node scripts/render-dh11c6e1-visible-uncrumple.cjs dist/worlds/writing',
  'DH-11C.6E.1', 'data-uncrumple-direct="true"',
  'discarded-ideas.js?v=dh11c6e1-uncrumple-v1',
  'discarded-ideas.css?v=dh11c6e1-uncrumple-v1'
 ])assert.ok(build.includes(s),s);
 for(const s of [
  'DH-11C.6E.1','data-uncrumple-direct="true"',
  'discarded-ideas.js?v=dh11c6e1-uncrumple-v1',
  'discarded-ideas.css?v=dh11c6e1-uncrumple-v1',
  'folded.addEventListener(\'click\',smooth)'
 ])assert.ok(smoke.includes(s),s);
 const html=stage.render(source);
 for(const preserved of ['archive-tray-dialog','archive-folder-dialog','manuscript-dialog',
  'published-book-dialog','workshop-dialog','data-motion-first="true"',
  'room.js?v=dh11c6e-wastepaper-v1'])
  assert.ok(html.includes(preserved),preserved);
});

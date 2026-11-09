'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const content=require('../prototypes/dh-11c-room/manuscript-experience.js');
const stage=require('../scripts/render-dh11c6c1-reader-workshop.cjs');
const books=require('../scripts/render-dh11c6b-finished-books.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');

test('13 real desk sheets map only to three explicitly fictional, non-private sample manuscripts',()=>{
 assert.equal(content.MANUSCRIPTS.length,3);
 for(const item of content.MANUSCRIPTS){
  assert.equal(item.kind,'Fictional demonstration');
  assert.ok(item.pages.length>=2);
  assert.ok(item.pages.every(page=>page.heading&&page.paragraphs.length>=2));
  assert.ok(item.id.startsWith('demo-'));
 }
 assert.deepEqual(Array.from({length:13},(_,i)=>content.sheetForIndex(i)),[0,1,2,0,1,2,0,1,2,0,1,2,0]);
 assert.equal(content.sheetForIndex(13),null);
 assert.equal(content.sheetForIndex(-1),null);
 assert.equal(content.sheetForIndex(1.5),null);
 assert.equal(content.PROMPTS.length,4);
});
test('canonical render alone has two styled native dialogs; old book stage and prototype stay unchanged',()=>{
 const source=read('prototypes/dh-11c-room/index.html');
 const html=stage.render(source),bookOnly=books.render(source);
 for(const marker of ['DH-11C.6C.1','data-manuscript-experience="true"',
  '<dialog id="manuscript-dialog"','<dialog id="workshop-dialog"',
  'manuscript-experience.js?v='+stage.VERSION,
  'manuscript-experience.css?v='+stage.VERSION,
  'room.js?v='+stage.VERSION,
  'id="workshop-page"','id="manuscript-page-text"',
  'id="manuscript-prev"','id="manuscript-next"',
  'id="workshop-copy"','id="workshop-clear"',
  'published-book-dialog','data-finished-books="true"',
  'data-dark-window-preload="true"','data-exit-door-proof="true"'])
  assert.ok(html.includes(marker),marker);
 assert.ok(!bookOnly.includes('manuscript-experience.js'));
 assert.ok(!bookOnly.includes('workshop-dialog'));
 assert.ok(!source.includes('workshop-dialog'));
 assert.equal(stage.VERSION,'dh11c6c1-reading-workshop-v1');
});
test('real desk mesh and keyboard controls reach reader; real typewriter reaches workshop',()=>{
 const room=read('prototypes/dh-11c-room/room.js');
 for(const marker of [
  "document.body.dataset.manuscriptExperience==='true'",
  'window.DH11ManuscriptExperience?.mount({',
  'if(manuscriptExperienceEnabled&&state.papers[index])manuscriptExperience.openManuscript(index);',
  "add('Read a manuscript',()=>manuscriptExperience.openManuscript(0))",
  "add('Open the creative workshop',()=>manuscriptExperience.openWorkshop())",
  "if(id==='typewriter'&&manuscriptExperienceEnabled&&!motionFirst)",
  "if(document.querySelector('dialog[open]'))return;",
  "if(id==='desk'&&paperIndex!==null)togglePaper(paperIndex);",
  "if(id==='bookcase'&&bookIndex!==null)toggleBook(bookIndex);",
  "new THREE.WebGLRenderer("
 ])assert.ok(room.includes(marker),marker);
 const build=read('scripts/build-pages.sh');
 for(const marker of ['tests/dh11c6c1-manuscript-workshop.test.cjs',
  'node scripts/render-dh11c6c1-reader-workshop.cjs dist/worlds/writing',
  'prototypes/dh-11c-room/manuscript-experience.js',
  'prototypes/dh-11c-room/manuscript-experience.css'])
  assert.ok(build.includes(marker),marker);
});
function fakeDocument(){
 const nodes=new Map();
 let doc={activeElement:null,createElement(tag){return make(tag);},getElementById(id){return nodes.get(id);}};
 function make(id){
  const handlers={};
  const el={id,isConnected:true,textContent:'',value:'',disabled:false,open:false,children:[],
   addEventListener(type,callback){handlers[type]=callback;},
   dispatch(type,payload={}){if(handlers[type])return handlers[type]({target:this,...payload});},
   showModal(){this.open=true;},close(){this.open=false;this.dispatch('close');},
   focus(){doc.activeElement=this;},
   append(item){this.children.push(item);},replaceChildren(...items){this.children=items;}
  };
  return el;
 }
 const ids=['manuscript-dialog','manuscript-close','manuscript-title','manuscript-kind',
  'manuscript-page-heading','manuscript-page-text','manuscript-page-number','manuscript-prev','manuscript-next','manuscript-position',
  'workshop-dialog','workshop-close','workshop-prompt','workshop-next-prompt','workshop-page',
  'workshop-count','workshop-clear','workshop-copy','workshop-feedback'];
 for(const id of ids)nodes.set(id,make(id));
 return {doc,nodes};
}
test('reader turns real text pages, disables the correct buttons and restores focus',()=>{
 const {doc,nodes}=fakeDocument(),invoker=doc.createElement('button');invoker.focus();
 const experience=content.mount({document:doc});
 assert.equal(experience.openManuscript(1),true);
 assert.equal(experience.reading,true);
 assert.equal(nodes.get('manuscript-title').textContent,content.MANUSCRIPTS[1].title);
 assert.equal(nodes.get('manuscript-prev').disabled,true);
 assert.equal(nodes.get('manuscript-page-text').children.length,2);
 nodes.get('manuscript-next').dispatch('click');
 assert.equal(nodes.get('manuscript-page-number').textContent,'Page 2 of 2');
 assert.equal(nodes.get('manuscript-next').disabled,true);
 nodes.get('manuscript-close').dispatch('click');
 assert.equal(experience.reading,false);
 assert.equal(doc.activeElement,invoker);
 assert.equal(experience.openManuscript(15),false);
});
test('typewriter workshop is a user-controlled, temporary page, with clear and idea cycling',()=>{
 const {doc,nodes}=fakeDocument();let physicalPresses=0;
 const experience=content.mount({document:doc,onType:()=>physicalPresses++});
 assert.equal(experience.openWorkshop(),true);
 assert.equal(doc.activeElement,nodes.get('workshop-page'));
 const prompt=nodes.get('workshop-prompt').textContent;
 nodes.get('workshop-next-prompt').dispatch('click');
 assert.notEqual(prompt,nodes.get('workshop-prompt').textContent);
 const page=nodes.get('workshop-page');page.value='hello';
 page.dispatch('input',{inputType:'insertText',data:'o'});
 assert.equal(physicalPresses,1);
 assert.equal(nodes.get('workshop-count').textContent,'1 word · 5 characters');
 nodes.get('workshop-clear').dispatch('click');
 assert.equal(page.value,'');
 assert.equal(nodes.get('workshop-count').textContent,'0 words · 0 characters');
 nodes.get('workshop-close').dispatch('click');
 assert.equal(experience.writing,false);
});

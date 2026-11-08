(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11CabinetCatalogue=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const DRAWERS=Object.freeze([
  Object.freeze({slug:'finished',label:'Finished',colour:'#5c7184'}),
  Object.freeze({slug:'drafts',label:'Drafts',colour:'#a86b57'}),
  Object.freeze({slug:'oddities',label:'Oddities',colour:'#826c94'}),
  Object.freeze({slug:'fragments',label:'Fragments',colour:'#927c66'}),
  Object.freeze({slug:'field_notes',label:'Field Notes',colour:'#5e806f'})
 ]);
 // Everything outside finished is a clearly INVENTED demonstration record.
 // Never infer, ingest or name any real unpublished manuscript here.
 const EXAMPLES=Object.freeze([
  {id:'demo-museum',drawer:1,slot:0,tab:'LETTERS',source:'demo-unsent-letters',
   title:'The Museum of Unsent Letters',kind:'Fictional demonstration',
   description:'An invented manuscript about a museum which opens only when nobody expects a delivery.',
   related:{type:'manuscript',id:'demo-unsent-letters'},status:'Invented sample, not a real project'},
  {id:'demo-drawer',drawer:1,slot:1,tab:'DRAWER',source:'demo-bottom-drawer',
   title:'Instructions for the Bottom Drawer',kind:'Fictional demonstration',
   description:'An entirely fabricated inventory of peculiar things, including one missing Tuesday.',
   related:{type:'manuscript',id:'demo-bottom-drawer'},status:'Invented sample, not a real project'},
  {id:'demo-notes',drawer:1,slot:2,tab:'MARGINS',source:'demo-margin-notes',
   title:'Marginal Notes from Tomorrow',kind:'Fictional demonstration',
   description:'A made-up collection of corrections to sentences which have yet to be written.',
   related:{type:'manuscript',id:'demo-margin-notes'},status:'Invented sample, not a real project'},
  {id:'demo-lost-tuesdays',drawer:2,slot:0,tab:'TUESDAY',
   title:'Department of Lost Tuesdays',kind:'Fictional demonstration',
   description:'An imaginary department that investigates why certain weekdays fail to arrive on time.',
   related:{type:'workshop'},status:'Invented sample, not a real project'},
  {id:'demo-forecast',drawer:2,slot:1,tab:'WEATHER',
   title:'The Bureau of Impossible Forecasts',kind:'Fictional demonstration',
   description:'A sample concept for a bureau predicting indoor thunderstorms, accidental rainbows and administrative fog.',
   related:{type:'workshop'},status:'Invented sample, not a real project'},
  {id:'demo-half-map',drawer:3,slot:0,tab:'HALF MAP',
   title:'Half a Map to Somewhere',kind:'Fictional demonstration',
   description:'An imagined fragment of a map that ends just before the most interesting part.',
   status:'Invented sample, not a real project'},
  {id:'demo-unfinished-sentence',drawer:3,slot:1,tab:'FRAG 02',
   title:'A Sentence That Refused to Finish',kind:'Fictional demonstration',
   description:'A deliberately incomplete fictional opening, filed without pretending it belongs to an unpublished work.',
   status:'Invented sample, not a real project'},
  {id:'demo-atlas',drawer:4,slot:0,tab:'ATLAS',
   title:'Atlas of Mostly Imaginary Places',kind:'Fictional demonstration',
   description:'A sample notebook describing islands that appear only on maps drawn after midnight.',
   status:'Invented sample, not a real project'},
  {id:'demo-observation',drawer:4,slot:1,tab:'FIELD 02',
   title:'Journal of One Unreliable Observation',kind:'Fictional demonstration',
   description:'An invented entry recording something almost certainly not witnessed by anyone.',
   status:'Invented sample, not a real project'}
 ].map(v=>Object.freeze({...v,related:v.related?Object.freeze(v.related):null})));
 const slotId=(drawer,index)=>drawer+':'+index;
 function create({books,manuscripts}){
  if(!books?.BOOKS||books.BOOKS.length!==3||!Array.isArray(manuscripts))
   throw Error('Archive catalogue requires the three public books and approved fictional reader samples');
  const existing=new Set(manuscripts.filter(x=>x.kind==='Fictional demonstration'&&x.id.startsWith('demo-')).map(x=>x.id));
  const published=books.BOOKS.map((b,slot)=>Object.freeze({
   id:'published-'+b.id,drawer:0,slot,tab:['STORM','DUCK','ELEANOR'][slot],
   title:b.title,kind:'Published book',description:b.description,
   status:'Published edition, already on the bookcase',
   related:Object.freeze({type:'book',id:b.id}),source:b.id
  }));
  const samples=EXAMPLES.map(entry=>{
   if(entry.related?.type==='manuscript'&&!existing.has(entry.related.id))
    throw Error('Fictional sample missing from public demo reader: '+entry.id);
   return entry;
  });
  const items=Object.freeze([...published,...samples]);
  const ids=new Set(),slots=new Map();
  for(const item of items){
   if(!DRAWERS[item.drawer]||item.slot<0||item.slot>=4||ids.has(item.id)||slots.has(slotId(item.drawer,item.slot)))
    throw Error('Invalid or duplicated drawer folder '+item.id);
   ids.add(item.id);slots.set(slotId(item.drawer,item.slot),item);
  }
  const at=(drawer,index)=>slots.get(slotId(drawer,index))||null;
  const byId=id=>items.find(x=>x.id===id)||null;
  const inDrawer=drawer=>items.filter(x=>x.drawer===drawer);
  return Object.freeze({DRAWERS,items,at,byId,inDrawer});
 }
 return Object.freeze({DRAWERS,EXAMPLES,create});
});

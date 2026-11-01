(function(root,factory){
 'use strict';
 const plan=factory();
 if(typeof module==='object'&&module.exports)module.exports=plan;
 if(root)root.DH11RoomPlan=plan;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // Metres in a single right-handed world: X left/right, Y up, Z towards camera.
 // All focus targets use the SAME perspective and never independent painted states.
 const DIMENSIONS=Object.freeze({width:14,height:6.4,depth:11});
 const PAPER_COUNT=13;
 const FEATURED_BOOK_COUNT=8;
 const BIN_PAPER_COUNT=9;
 const HOME=Object.freeze({position:[0,4.2,12.9],target:[0,2.05,-1.5]});
 const OBJECTS=Object.freeze([
  Object.freeze({id:'desk',label:'Writing desk',position:[-.25,1.5,.4],camera:[-1.1,3.15,5.5],lookAt:[-.25,1.45,.3],action:'Inspect the papers'}),
  // A slightly higher aim keeps the top of the filing cabinet visible below
  // the immersive header on a 14-inch laptop; the base may crop instead.
  Object.freeze({id:'cabinet',label:'Filing cabinet',position:[-4.7,1.65,-3.2],camera:[-3.6,2.65,1.25],lookAt:[-4.7,2.30,-3.1],action:'Open a drawer'}),
  Object.freeze({id:'bookcase',label:'Bookcase',position:[4.75,2.15,-3.88],camera:[3.15,2.95,1.3],lookAt:[4.65,2.2,-3.9],action:'Pull out a book'}),
  Object.freeze({id:'typewriter',label:'Typewriter',position:[1.05,1.58,.8],camera:[1.55,2.66,3.35],lookAt:[1.05,1.5,.72],action:'Type something'}),
  Object.freeze({id:'bin',label:'Overflowing bin',position:[-3.2,.48,2.45],camera:[-3.4,2.5,5.5],lookAt:[-3.2,.42,2.45],action:'Rummage in the papers'}),
  Object.freeze({id:'door',label:'Exit door',position:[6.9,2.25,-.45],camera:[3.85,2.8,1.6],lookAt:[6.85,2.3,-.45],action:'Open the doorway'}),
  Object.freeze({id:'window',label:'Floating-islands window',position:[.15,3.65,-5.37],camera:[.8,3.5,1.45],lookAt:[.15,3.6,-5.4],action:'Look towards the islands'})
 ]);
 const idSet=new Set(OBJECTS.map(x=>x.id));
 const find=id=>OBJECTS.find(x=>x.id===id)||null;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function next(current,action){
  const before=current||{focus:null,drawer:null,papers:Array(PAPER_COUNT).fill(false),books:Array(FEATURED_BOOK_COUNT).fill(false),binPapers:Array(BIN_PAPER_COUNT).fill(false),lampOn:true,typed:0,doorOpen:false};
  if(!action||typeof action.type!=='string')return before;
  switch(action.type){
   case 'focus':return idSet.has(action.id)?{...before,focus:action.id}:before;
   case 'home':return {...before,focus:null};
   case 'drawer':return before.focus==='cabinet'&&Number.isInteger(action.index)&&action.index>=0&&action.index<5?
    {...before,drawer:before.drawer===action.index?null:action.index}:before;
   case 'paper':return before.focus==='desk'&&Number.isInteger(action.index)&&action.index>=0&&action.index<PAPER_COUNT?
    {...before,papers:before.papers.map((moved,i)=>i===action.index?!moved:moved)}:before;
   case 'book':return before.focus==='bookcase'&&Number.isInteger(action.index)&&action.index>=0&&action.index<FEATURED_BOOK_COUNT?
    {...before,books:before.books.map((pulled,i)=>i===action.index?!pulled:pulled)}:before;
   case 'lamp':return before.focus==='desk'?{...before,lampOn:!before.lampOn}:before;
   case 'type':return before.focus==='typewriter'?{...before,typed:clamp(before.typed+1,0,60)}:before;
   case 'bin':return before.focus==='bin'&&Number.isInteger(action.index)&&action.index>=0&&action.index<BIN_PAPER_COUNT?
    {...before,binPapers:before.binPapers.map((out,i)=>i===action.index?!out:out)}:before;
   case 'door':return before.focus==='door'?{...before,doorOpen:!before.doorOpen}:before;
   default:return before;
  }
 }
 function validate(){
  if(OBJECTS.length!==7||idSet.size!==7)throw Error('Seven unique room objects required');
  for(const a of OBJECTS){
   for(const arr of [a.position,a.camera,a.lookAt])if(arr.length!==3||!arr.every(Number.isFinite))throw Error('Invalid room coordinate '+a.id);
   if(a.position[0] < -DIMENSIONS.width/2-0.5||a.position[0]>DIMENSIONS.width/2+0.5)throw Error('Room target outside walls');
  }
  return true;
 }
 validate();
 return Object.freeze({DIMENSIONS,HOME,OBJECTS,PAPER_COUNT,FEATURED_BOOK_COUNT,BIN_PAPER_COUNT,find,next,validate});
});
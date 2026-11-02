(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11ComicDressing=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // Real static 3D ornaments, no image cut-outs, no catalogue text, no hitboxes.
 // Positions are world-space metres; all existing furniture stays where it is.
 const placements=Object.freeze({
  floorManuscripts:[[-2.65,.04,-3.73],[2.46,.04,-4.30],[-5.85,.04,.65]],
  shelfBooks:[[-2.95,.06,-4.65],[2.52,.06,-3.78]],
  wallNotes:[[-2.63,4.48,-5.17],[3.05,5.08,-5.13]],
  ivy:[[-6.40,5.55,-5.04],[6.28,5.48,-4.83]]
 });
 function create(THREE,scene){
  const root=new THREE.Group();
  root.name='dh11c5c3_comic_storybook_dressing';
  root.userData.decorativeOnly=true;
  let visible=false;
  const ink=new THREE.MeshToonMaterial({color:'#543750',side:THREE.DoubleSide});
  const paper=[
   new THREE.MeshToonMaterial({color:'#f4daa6',side:THREE.DoubleSide}),
   new THREE.MeshToonMaterial({color:'#d9b58c',side:THREE.DoubleSide}),
   new THREE.MeshToonMaterial({color:'#e9cba5',side:THREE.DoubleSide})
  ];
  const binding=[
   new THREE.MeshToonMaterial({color:'#a75f65'}),
   new THREE.MeshToonMaterial({color:'#547e77'}),
   new THREE.MeshToonMaterial({color:'#936c9b'}),
   new THREE.MeshToonMaterial({color:'#ad8753'})
  ];
  const gilt=new THREE.MeshToonMaterial({color:'#e0b36e'});
  const leaf=[new THREE.MeshToonMaterial({color:'#4d876e',side:THREE.DoubleSide}),
   new THREE.MeshToonMaterial({color:'#88ac76',side:THREE.DoubleSide})];
  const vineMat=new THREE.MeshToonMaterial({color:'#6c7754'});
  const box=(g,w,h,d,mat,x,y,z,name)=>{
   const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
   o.position.set(x,y,z);o.name=name;o.userData.decorativeOnly=true;g.add(o);return o;
  };
  const strokes=(g,width,z,scale,name)=>{
   for(let i=0;i<3;i++){
    const w=width*(.28+.14*(i%3));
    box(g,w,.003,.007,ink,-width*.28+i*.08,.012+i*.002,z+(i-1)*.06,name+'_ink_'+i);
   }
  };
  for(const [pile,loc] of placements.floorManuscripts.entries()){
   const g=new THREE.Group();g.position.set(...loc);g.rotation.y=(pile-1)*.19;
   root.add(g);g.name='manuscript_stack_'+pile;
   for(let i=0;i<11+pile*3;i++){
    const w=.55+.032*((i*3)%4),d=.38+.018*((i*7)%3);
    const m=box(g,w,.012,d,paper[(i+pile)%3],(i%4-1.5)*.016,i*.015,(i%3-1)*.018,'loose_sheet_'+pile+'_'+i);
    m.rotation.y=(i%5-2)*.046;
   }
   strokes(g,.47,.01,.5,'stack_'+pile);
  }
  for(const [pile,loc] of placements.shelfBooks.entries()){
   const g=new THREE.Group();g.position.set(...loc);g.rotation.y=pile?.19:-.24;
   g.name='abandoned_books_'+pile;root.add(g);
   for(let i=0;i<6;i++){
    const book=box(g,.47,.082,.33,binding[(i+pile)%4],
     Math.sin(i*.71)*.026,.06+i*.091,Math.cos(i*.51)*.022,'abandoned_book_'+pile+'_'+i);
    book.rotation.y=(i%3-1)*.13;
    box(book,.35,.008,.007,gilt,0,.04,.167,'book_gilt_rule_'+pile+'_'+i);
   }
  }
  const torn=(index)=>{
   const shape=new THREE.Shape();
   shape.moveTo(-.31,-.38);
   shape.lineTo(.27,-.37);
   shape.lineTo(.31,-.21);
   shape.lineTo(.28,-.03);
   shape.lineTo(.32,.17);
   shape.lineTo(.26,.38);
   shape.lineTo(-.32,.35);
   shape.lineTo(-.29,.18);
   shape.lineTo(-.33,-.09);
   shape.closePath();
   const group=new THREE.Group(),sheet=new THREE.Mesh(new THREE.ShapeGeometry(shape),paper[index%3]);
   sheet.name='torn_note_paper_'+index;sheet.userData.decorativeOnly=true;group.add(sheet);
   for(let i=0;i<5;i++){
    const line=box(group,.19+.055*(i%3),.009,.003,ink,
     -.07+(i%2)*.023,.20-i*.108,.013,'note_marks_'+index+'_'+i);
    line.rotation.z=(i%2?-.07:.04);
   }
   const tack=new THREE.Mesh(new THREE.SphereGeometry(.034,7,6),gilt);
   tack.position.set(0,.32,.04);tack.userData.decorativeOnly=true;group.add(tack);
   return group;
  };
  for(const [i,loc] of placements.wallNotes.entries()){
   const note=torn(i);note.position.set(...loc);note.rotation.z=(i?-.09:.07);
   note.name='wall_note_'+i;root.add(note);
  }
  for(const [i,loc] of placements.ivy.entries()){
   const g=new THREE.Group();g.position.set(...loc);g.name='ivy_trail_'+i;root.add(g);
   const vertices=[];
   for(let j=0;j<=15;j++){
    const t=j/15;
    vertices.push(new THREE.Vector3(Math.sin(t*9.5+i)*.18,-t*1.42,
     Math.cos(t*9+i)*.10));
   }
   const stem=new THREE.Mesh(new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(vertices),26,.014,5,false),vineMat);
   stem.userData.decorativeOnly=true;g.add(stem);
   for(let j=1;j<13;j++){
    const t=j/15,side=j%2?-1:1,leafSize=.08+(j%3)*.014;
    const o=new THREE.Mesh(new THREE.SphereGeometry(leafSize,7,5),leaf[j%2]);
    o.position.set(Math.sin(t*9.5+i)*.18+side*.095,-t*1.42,
     Math.cos(t*9+i)*.10+.035);
    o.scale.set(1.5,.38,.37);o.rotation.z=side*.48;
    o.name='ivy_leaf_'+i+'_'+j;o.userData.decorativeOnly=true;g.add(o);
   }
  }
  // Luminous glazes are small physical scene lights, not a full-screen
  // bloom overlay. They do not autoplay or move.
  const amber=new THREE.PointLight('#ffbc73',6.5,3.5,2);
  amber.position.set(-2.63,3.28,-4.9);
  amber.name='comic_amber_accent';root.add(amber);
  const azure=new THREE.PointLight('#87d8ec',5,3.9,2);
  azure.position.set(2.8,3.9,-4.48);
  azure.name='comic_window_accent';root.add(azure);
  root.visible=false;
  scene.add(root);
  function setVisible(next){visible=Boolean(next);root.visible=visible;}
  return Object.freeze({root,setVisible,get visible(){return visible;},placements});
 }
 return Object.freeze({placements,create});
});

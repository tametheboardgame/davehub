(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11ManuscriptPersonality=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // Fictional decorative titles only, not DaveHub catalogue entries.
 const BOOK_TITLES=Object.freeze(["How to Lose Tuesday","The Wrong Door","Deadlines Are Fiction","Oops! All Dragons","Filing the Moon","The Last Biscuit","Seven Bad Ideas","A Map of Maybe","Panic, Then Tea","The Plot Escaped","Use More Glitter","Unhelpful Wizardry","A Brief Eternity","The Spare Dimension","Don't Touch That","Tax for Wizards","To-Do: Exist","A Very Long Nap","Borrowed Tomorrow","This Book Is Late","A Guide to Nothing","The Third First Draft","Probably a Dragon","Insert Clever Ending","A Storm in a Teacup","Please Stop Clapping","My Other Castle","The Tiny Apocalypse","No Refunds in Hell","Magical Admin 101","Curses for Beginners","An Awkward Prophecy","Plot Holes & Portals","The Quantum Biscuit","Just One More Chapter","When Pens Revolt","The Secret of Socks","Meeting with Destiny","Death by Footnote","The Wizard's Receipt","Pigeons of Doom","A Tale of Two Spoons","The Infinite Queue","Do Not Feed the Plot","The Department of Fog","Why Is It Purple?","Manual of Mild Panic","The Tea Dimension","The Unfinished Spell","Bureaucracy & Beasts","100 Ways to Hide","The Biscuit Codex","Heroes on Annual Leave","An Ode to Cheese","My Dragon's Accountant","Tuesday Strikes Back","The Phantom Stapler","Anatomy of a Yawn","Nothing to See Here","The Great Paper Jam","The Wrong Ending","A Small Loud Universe","One More Rewrite","The Plot Thickens","How to Name Clouds","A Really Bad Plan","The Devil's Filing","The Last Clean Desk","Untitled for a Reason","The Spelling of Chaos","My Imaginary Deadline","The Portable Abyss","Adventures in Waiting","The Longest Shortcut","Trust Me, I'm Lost","This Is Not a Door","Seven Shades of Nope","An Argument with Ink","The Very Final Draft","Who Stole Wednesday?"]);
 // Actual authored literary/script/musical work names, for the eight
 // physical pull-out books. Titles only, never unpublished manuscript copy.
 const FEATURED_TITLES=Object.freeze(["The Legend of the Stormrider","The Blood Laws","3084","How the Better Half Live","How to Stop Trying and Abandon Hope","The Iron Road","Vegan the Musical","Metal... the Musical"]);
 const FEATURED_SPINE_TITLES=Object.freeze(["Stormrider","Blood Laws","3084","Better Half","Abandon Hope","Iron Road","Vegan!","Metal!"]);
 const FEATURED_POSITIONS=Object.freeze([0,10,29,39,48,58,67,77]);
 const displayTitles=BOOK_TITLES.map((title,i)=>{
  const n=FEATURED_POSITIONS.indexOf(i);return n>=0?FEATURED_TITLES[n]:title;
 });
 const BOOK_DISPLAY_TITLES=Object.freeze(displayTitles.map((title,i)=>{
  const n=FEATURED_POSITIONS.indexOf(i);return n>=0?FEATURED_SPINE_TITLES[n]:title;
 }));
 const AUTHORED_BOOK_TITLES=Object.freeze(displayTitles);
 const SCRAWLS=Object.freeze(["THIS MAKES NO SENSE","THE END? NO.","MORE DRAGONS IN ACT II","DID I WRITE THIS?","REWRITE THE MIDDLE","WHY DOES THE MOON TALK?","THE PLOT IS MISSING","I NEED ANOTHER COFFEE","ABSOLUTELY NOT","WHAT IF THE DESK IS ALIVE?","THE BISCUIT KNOWS","THAT'S NOT A PORTAL","TUESDAY AGAIN?!","DO NOT DELETE THIS","WHERE'S MY PEN?"]);
 const COLOURS=Object.freeze(['#582a40','#375e60','#75382c','#5f446c',
  '#725032','#344859','#715b45','#34594b','#69394c','#53475d',
  '#70492f','#4c5967','#6b4638','#526443','#57364b','#30565b']);
 function bookIndex(name){
  const match=/^book_([0-3])_(\d{2})$/.exec(name||'');
  if(!match||Number(match[2])>=20)return -1;
  return Number(match[1])*20+Number(match[2]);
 }
 function inkIndex(name){
  const match=/^desk_paper_(\d{2})$/.exec(name||'');
  if(match&&Number(match[1])<13)return Number(match[1]);
  if(name==='desk_file_sheet')return 13;
  if(name==='typewriter_paper')return 14;
  return -1;
 }
 function random(seed){
  let n=(seed*1664525+1013904223)>>>0;
  return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 }
 function paintSpine(ctx,width,height,index,featured=false,overrideTitle=null){
  const r=random(index+67),W=width,H=height;
  ctx.clearRect(0,0,W,H);
  const palette=featured?'#107b88':COLOURS[(index*7+Math.floor(index/20)*3)%COLOURS.length];
  ctx.fillStyle=palette;ctx.fillRect(0,0,W,H);
  for(let i=0;i<18;i++){
   ctx.strokeStyle=i%3===0?'rgba(250,211,152,.22)':'rgba(14,23,36,.17)';
   ctx.lineWidth=1+r()*2;
   const y=r()*H;ctx.beginPath();ctx.moveTo(3,y);ctx.lineTo(W-3,y+r()*5);ctx.stroke();
  }
  const ink=featured?'#fff3c3':index%5===0?'#c8e7c9':'#f5d5a1';
  ctx.strokeStyle=ink;ctx.lineWidth=2.9+index%3*.7;
  ctx.strokeRect(10,13,W-20,H-26);
  ctx.lineWidth=1.1;ctx.strokeRect(16,21,W-32,H-42);
  for(const y of [45,65,H-65,H-45]){
   ctx.lineWidth=4+(index+y)%4;
   ctx.beginPath();ctx.moveTo(22,y);ctx.lineTo(W-22,y);ctx.stroke();
  }
  const sides=3+index%8,offset=r()*6.28;
  const cy=H*.17,cx=W/2,rad=16+(index%5)*3;
  ctx.lineWidth=2.8;
  for(let i=0;i<sides;i++){
   const a=offset+i*2*Math.PI/sides;
   ctx.beginPath();ctx.moveTo(cx,cy);
   ctx.quadraticCurveTo(cx+rad*Math.cos(a+.3),cy+rad*Math.sin(a+.3),
    cx+rad*Math.cos(a),cy+rad*Math.sin(a));ctx.stroke();
  }
  ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.save();ctx.translate(W/2,H*.51);ctx.rotate(-Math.PI/2);
  const title=overrideTitle||BOOK_DISPLAY_TITLES[index];
  const length=title.length;
  ctx.font=(length<12?86:length<17?75:length<22?65:54)+"px Georgia,serif";
  ctx.lineWidth=1.7;ctx.strokeStyle='rgba(19,19,31,.70)';
  ctx.strokeText(title,0,0,H*.57);
  ctx.fillText(title,0,0,H*.57);
  ctx.restore();
  ctx.font='bold 24px Georgia,serif';
  ctx.fillText(String(index+1).padStart(2,'0'),W/2,H*.92);
 }
 function paintScrawl(ctx,width,height,index){
  const W=width,H=height,r=random(index+207),text=SCRAWLS[index];
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#ead7aa';ctx.fillRect(0,0,W,H);
  for(let n=0;n<65;n++){
   ctx.fillStyle=n%3?'rgba(105,70,57,.035)':'rgba(255,240,200,.11)';
   ctx.fillRect((n*71+index*37)%W,(n*61+index*11)%H,2+n%7,1+n%3);
  }
  ctx.lineCap='round';ctx.lineJoin='round';
  const phrases=['no no NO','see margin','why??','try again','must fix',
    'WRONG','aha!','rewrite','important!','maybe'];
  const colours=['rgba(40,35,68,.88)','rgba(52,38,59,.89)','rgba(44,45,86,.89)'];
  ctx.save();
  ctx.translate(W*.5,H*.48);ctx.rotate((r()-.5)*.28);ctx.translate(-W*.5,-H*.48);
  // Actual ink text at several inconsistent sizes, rotations and positions.
  const rows=5+index%6;
  for(let j=0;j<rows;j++){
   const x=18+r()*54,y=35+j*(H-60)/rows+(r()-.5)*17;
   ctx.save();ctx.translate(x,y);ctx.rotate((r()-.5)*.27);
   ctx.font='italic '+(20+Math.floor(r()*14))+"px 'Segoe Print','Bradley Hand',cursive";
   ctx.fillStyle=colours[(index+j)%3];
   const phrase=j===0?text:phrases[(index*5+j*3)%phrases.length];
   ctx.fillText(phrase,0,0,W-x-10);
   ctx.restore();
  }
  // Frantic fountain-pen loops. Every page has a different seeded gesture.
  for(let j=0;j<9+index%12;j++){
   const x=12+r()*W*.82,y=12+r()*H*.83,reach=20+r()*W*.2;
   ctx.strokeStyle=colours[j%3];ctx.lineWidth=1.2+r()*2.4;
   ctx.beginPath();ctx.moveTo(x,y);
   ctx.bezierCurveTo(x+reach*.1,y-30-r()*18,x+reach*.53,y+34*r(),x+reach,y+(r()-.5)*25);
   ctx.stroke();
  }
  // Several aggressive deletions, arrows and boxed/circled ideas.
  for(let j=0;j<2+index%4;j++){
   const x=20+r()*W*.63,y=30+r()*H*.69;
   ctx.strokeStyle='rgba(75,34,55,.73)';ctx.lineWidth=2.5+r()*3;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+42+r()*110,y+9+r()*16);ctx.stroke();
  }
  const xx=W*(.58+r()*.23),yy=H*(.37+r()*.35);
  ctx.strokeStyle='rgba(75,34,55,.78)';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.ellipse(xx,yy,20+r()*35,11+r()*26,r()*.5,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx-35,yy+44);
  ctx.lineTo(xx-27,yy+30);ctx.moveTo(xx-35,yy+44);ctx.lineTo(xx-18,yy+44);ctx.stroke();
  ctx.restore();
 }
 function create({THREE,root,finishedBooks=null}){
  if(!THREE?.PlaneGeometry||!THREE?.CanvasTexture||!root?.traverse||typeof document==='undefined')
   throw Error('Personality artwork requires the real furniture GLB and canvas');
  const attachments=[];
  const textureFrom=(w,h,paint)=>{
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d');
   if(!ctx)throw Error('Missing manuscript ink canvas');
   paint(ctx,w,h);
   const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;
   tx.anisotropy=2;
   return tx;
  };
  const attach=(mesh,art,position,size,rotationX=0)=>{
   const material=new THREE.MeshBasicMaterial({
    map:art,transparent:false,side:THREE.DoubleSide,depthWrite:true,toneMapped:false
   });
   const panel=new THREE.Mesh(new THREE.PlaneGeometry(...size),material);
   panel.name='dh11c5d3f_'+mesh.name+'_art';
   panel.position.set(...position);panel.rotation.x=rotationX;
   panel.userData.decorativeOnly=true;panel.raycast=()=>{};
   panel.visible=false;
   mesh.add(panel);attachments.push(panel);
  };
  root.traverse(mesh=>{
   if(!mesh?.isMesh||mesh.userData?.decorativeOnly)return;
   const id=bookIndex(mesh.name),paper=inkIndex(mesh.name);
   if(id<0&&paper<0)return;
   // The typewriter's physical sheet retains its real typed-line UV artwork.
   if(mesh.name==='typewriter_paper')return;
   if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
   const b=mesh.geometry.boundingBox;
   const dx=b.max.x-b.min.x,dy=b.max.y-b.min.y,dz=b.max.z-b.min.z;
   const x=(b.max.x+b.min.x)/2,y=(b.max.y+b.min.y)/2,z=(b.max.z+b.min.z)/2;
   const sx=Math.max(Math.abs(mesh.scale.x),.0001),sy=Math.max(Math.abs(mesh.scale.y),.0001),sz=Math.max(Math.abs(mesh.scale.z),.0001);
   if(id>=0){
    // In the visitor's finished-work shelf there are exactly three real
    // publications. The other bindings remain fictional decoration, not
    // suggested products or unreleased works for sale.
    const featuredIndex=FEATURED_POSITIONS.indexOf(id);
    const published=finishedBooks&&featuredIndex>=0
     ?finishedBooks.byIndex(featuredIndex):null;
    const titleLabel=finishedBooks?(published?.spine||BOOK_TITLES[id]):null;
    const panel=textureFrom(192,768,(ctx,w,h)=>paintSpine(ctx,w,h,id,
     finishedBooks?Boolean(published):Number.isInteger(mesh.userData?.featuredBookIndex),titleLabel));
    attach(mesh,panel,[x,y,b.max.z+.009/sz],[dx*.84,dy*.90]);
    mesh.userData.manuscriptJokeTitle=finishedBooks
     ?(published?.title||BOOK_TITLES[id]):AUTHORED_BOOK_TITLES[id];
   }else{
    const panel=textureFrom(512,352,(ctx,w,h)=>paintScrawl(ctx,w,h,paper));
    attach(mesh,panel,[x,b.max.y+.002/sy,z],[dx*.94,dz*.89],-Math.PI/2);
   }
  });
  let enabled=false;
  return Object.freeze({
   setVisible(on){enabled=!!on;for(const part of attachments)part.visible=enabled;},
   get count(){return attachments.length;},
   get enabled(){return enabled;}
  });
 }
 return Object.freeze({BOOK_TITLES,AUTHORED_BOOK_TITLES,BOOK_DISPLAY_TITLES,FEATURED_TITLES,FEATURED_SPINE_TITLES,FEATURED_POSITIONS,SCRAWLS,COLOURS,bookIndex,inkIndex,random,paintSpine,paintScrawl,create});
});

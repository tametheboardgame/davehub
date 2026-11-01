(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11ArchiveMaterials=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.5B. Separate from the owner-approved C5A desk finish recipes.
 // Deterministic, original surface maps, not photographs or manuscript text.
 const SIZE=192;
 const profiles=Object.freeze({
  shelfWalnut:{base:[88,55,39],kind:'wood',roughness:.58},
  shelfEdge:{base:[125,82,49],kind:'wood',roughness:.49},
  shelfLining:{base:[41,37,36],kind:'leather',roughness:.91},
  shelfGilt:{base:[166,118,56],kind:'brass',roughness:.43,metalness:.68},
  bookBinding0:{base:[128,61,52],kind:'book',roughness:.72},
  bookBinding1:{base:[74,86,112],kind:'book',roughness:.83},
  bookBinding2:{base:[133,99,58],kind:'book',roughness:.66},
  bookBinding3:{base:[73,108,96],kind:'book',roughness:.83},
  bookBinding4:{base:[96,71,106],kind:'book',roughness:.77},
  bookBinding5:{base:[118,76,69],kind:'book',roughness:.69},
  bookBinding6:{base:[89,101,91],kind:'book',roughness:.81},
  cabinetCase:{base:[61,89,92],kind:'paint',roughness:.77,metalness:.24},
  cabinetDrawer:{base:[91,118,117],kind:'paint',roughness:.69,metalness:.27},
  cabinetTrim:{base:[78,98,100],kind:'paint',roughness:.62,metalness:.33},
  cabinetTray:{base:[119,91,65],kind:'wood',roughness:.82},
  cabinetBrass:{base:[159,121,68],kind:'brass',roughness:.4,metalness:.73},
  cabinetFolder0:{base:[204,177,128],kind:'parchment',roughness:.95},
  cabinetFolder1:{base:[178,153,129],kind:'parchment',roughness:.94},
  cabinetLabel:{base:[218,198,153],kind:'parchment',roughness:.94}
 });
 const clamp=x=>Math.max(0,Math.min(255,Math.round(x)));
 const seedFor=name=>name.split('').reduce((s,c)=>Math.imul(s,33)+c.charCodeAt(0),9)>>>0;
 const hash=(x,y,seed)=>{
  let n=Math.imul(x+41,374761393)^Math.imul(y+79,668265263)^Math.imul(seed+17,2246822519);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967295;
 };
 const interp=(a,b,t)=>a+(b-a)*t*t*(3-2*t);
 function noise(x,y,s,seed){
  const xx=x/s,yy=y/s,ix=Math.floor(xx),iy=Math.floor(yy),tx=xx-ix,ty=yy-iy;
  return interp(interp(hash(ix,iy,seed),hash(ix+1,iy,seed),tx),
   interp(hash(ix,iy+1,seed),hash(ix+1,iy+1,seed),tx),ty);
 }
 function generate(name,size=SIZE){
  const config=profiles[name];
  if(!config)throw Error('Unknown archive finish '+name);
  if(!Number.isInteger(size)||size<32||size>512)throw Error('Invalid archive map size');
  const pixels=new Uint8Array(size*size*4),seed=seedFor(name);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=x/size,v=y/size;
   const fine=hash(x,y,seed)-.5;
   const cloud=noise(x,y,35,seed+1)-.5;
   let d=cloud*17+fine*7,tint=0;
   if(config.kind==='wood'){
    const knot=Math.hypot((u-.62)*1.1,(v-.41)*3.4);
    const warped=v+(noise(x,y,62,seed+9)-.5)*.065+Math.exp(-knot*knot*13)*.036;
    d=Math.sin(warped*110)*6+Math.sin(warped*30)*12+cloud*11+fine*5;
    tint=-20*Math.exp(-knot*knot*26);
    // Fine streaks of removed lacquer, never flattened picture layers.
    if(hash(Math.floor(u*28),Math.floor(v*90),seed+8)>.983)d+=13;
   }else if(config.kind==='book'){
    const cloth=Number(name.slice(-1))%2===1;
    d=cloud*13+fine*8+(cloth?((x%5===0?6:0)+(y%7===0?6:0)):
     (hash(Math.floor(x*.75),Math.floor(y*.75),seed+4)>.93?-12:0));
    const edge=(Math.pow(Math.abs(u*2-1),9)+Math.pow(Math.abs(v*2-1),9));
    d+=edge*15;
    // Inlaid gilded spine rules, small faux-stamped marks, no invented titles.
    const rule=Math.min(Math.abs(v-.17),Math.abs(v-.81));
    if(rule<.016&&u>.13&&u<.89&&hash(Math.floor(u*120),0,seed+2)>.08){
     tint=1;d=0;
    }else if(v>.35&&v<.65&&u>.31&&u<.71&&
      Math.floor((v-.35)*58)%5===0&&hash(Math.floor(u*45),Math.floor(v*90),seed+7)>.4){
     tint=.65;d=0;
    }
   }else if(config.kind==='paint'){
    // Powder-coated metal with oxidation at the edges and small chips.
    const edge=Math.pow(Math.abs(u*2-1),13)+Math.pow(Math.abs(v*2-1),13);
    d=cloud*15+fine*6-edge*23;
    if(hash(Math.floor(x/4),Math.floor(y/4),seed+5)>.991)d+=26;
    if(noise(x,y,11,seed+7)>.76)d-=18;
   }else if(config.kind==='brass'){
    d=cloud*19+Math.sin(y*1.8)*5+fine*6;
    if(noise(x,y,20,seed+8)>.58)d-=27;
   }else if(config.kind==='parchment'){
    const edge=Math.pow(Math.abs(u*2-1),7)+Math.pow(Math.abs(v*2-1),7);
    d=cloud*14+fine*8-edge*21;
    if(noise(x,y,12,seed+3)>.7)d-=14;
    if(y%8===0&&hash(x,Math.floor(y/3),seed+4)>.84)d-=7;
   }else if(config.kind==='leather'){
    d=cloud*12+fine*9+
      (hash(Math.floor(x*.7),Math.floor(y*.7),seed+3)>.87?-14:0);
   }
   const i=(y*size+x)*4;
   const gilded=tint>0;
   const base=gilded?[183,138,69]:config.base;
   const amount=gilded?(fine*8+cloud*9):d;
   for(let k=0;k<3;k++)pixels[i+k]=clamp(base[k]+amount*[1,.86,.67][k]+(gilded?0:tint));
   pixels[i+3]=255;
  }
  return Object.freeze({name,width:size,height:size,pixels,
   roughness:config.roughness,metalness:config.metalness??.03});
 }
 // Classify existing verified cabinet GLB part names. No added geometry,
 // altered transforms, or material changes to the legacy cabinet proof.
 function cabinetFinishForNode(name){
  if(typeof name!=='string')return null;
  if(/^case_(?:back|left|right|top|bottom|divider_[0-3])$/.test(name))return 'cabinetCase';
  if(/^front_divider_trim_[0-3]$/.test(name)||/^track_(?:left|right)_(?:finished|drafts|oddities|fragments|field_notes)$/.test(name))
   return 'cabinetTrim';
  if(/^front_face_(?:finished|drafts|oddities|fragments|field_notes)$/.test(name))return 'cabinetDrawer';
  if(/^brass_handle_(?:finished|drafts|oddities|fragments|field_notes)$/.test(name))return 'cabinetBrass';
  if(/^label_plate_(?:finished|drafts|oddities|fragments|field_notes)$/.test(name))return 'cabinetLabel';
  if(/^tray_(?:floor|left|right|rear)_(?:finished|drafts|oddities|fragments|field_notes)$/.test(name))return 'cabinetTray';
  const folder=/^folder_(?:finished|drafts|oddities|fragments|field_notes)_([0-3])$/.exec(name);
  if(folder)return 'cabinetFolder'+(Number(folder[1])%2);
  return null;
 }
 return Object.freeze({SIZE,profiles,generate,cabinetFinishForNode});
});

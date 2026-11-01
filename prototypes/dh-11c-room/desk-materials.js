(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11DeskMaterials=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // DH-11C.5A: repeatable, authored material maps. Shared by browser fallback
 // and GLB generator. No external images, fetches or randomness at runtime.
 const SIZE=192;
 const profiles=Object.freeze({
  deskWalnut:{base:[105,66,42],roughness:.44},
  deskFrame:{base:[67,42,36],roughness:.6},
  deskParchment0:{base:[230,207,165],roughness:.94},
  deskParchment1:{base:[225,202,160],roughness:.94},
  deskParchment2:{base:[237,214,173],roughness:.94},
  deskLeather:{base:[75,48,43],roughness:.73},
  deskBrass:{base:[156,121,64],roughness:.39,metalness:.67},
  typewriterEnamel:{base:[52,56,61],roughness:.37,metalness:.36},
  lampLinen:{base:[137,114,80],roughness:.87}
 });
 const clamp=x=>Math.min(255,Math.max(0,Math.round(x)));
 const hash=(x,y,seed)=>{
  let n=Math.imul(x+0x1f34a,374761393)^Math.imul(y+0x1f123,668265263)^Math.imul(seed+13,2246822519);
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
 };
 const smooth=(a,b,t)=>a+(b-a)*t*t*(3-2*t);
 function noise(x,y,scale,seed){
  const sx=x/scale,sy=y/scale,ix=Math.floor(sx),iy=Math.floor(sy);
  const tx=sx-ix,ty=sy-iy;
  return smooth(smooth(hash(ix,iy,seed),hash(ix+1,iy,seed),tx),
   smooth(hash(ix,iy+1,seed),hash(ix+1,iy+1,seed),tx),ty);
 }
 function generate(name,size=SIZE){
  if(!Object.prototype.hasOwnProperty.call(profiles,name))throw Error('Unknown desk finish '+name);
  if(!Number.isInteger(size)||size<32||size>512)throw Error('Invalid desk texture size');
  const {base}=profiles[name],out=new Uint8Array(size*size*4);
  const wood=name==='deskWalnut'||name==='deskFrame';
  const parchment=name.startsWith('deskParchment');
  const brass=name==='deskBrass',leather=name==='deskLeather';
  const metal=name==='typewriterEnamel',linen=name==='lampLinen';
  const seed=name.split('').reduce((v,c)=>v*31+c.charCodeAt(0),7)>>>0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=x/size,v=y/size;
   const grainWarp=noise(x,y,65,seed)-.5;
   const fine=hash(x,y,seed)-.5;
   const cloud=noise(x,y,29,seed+1)-.5;
   let effect=cloud*16+fine*5,accent=0;
   if(wood){
    // Long open-pore walnut, subtle knots and a broken varnish. The grain
    // direction follows U rather than noisy pixels painted at random.
    const ring=Math.hypot((u-.43)*.85,(v-.59)*3.8);
    const grain=Math.sin((v+grainWarp*.055+Math.exp(-ring*ring*12)*.024)*Math.PI*69);
    const wide=Math.sin((v+grainWarp*.07)*Math.PI*23);
    effect=grain*7+wide*11+cloud*14+fine*4;
    accent=Math.exp(-ring*ring*36)*-24;
   }else if(parchment){
    // Fibres, soft foxing, damp edges and faded incomplete manuscript lines.
    const edge=Math.pow(Math.abs(2*u-1),7)+Math.pow(Math.abs(2*v-1),7);
    const fox=noise(x,y,13,seed+3)>.69?-19:0;
    const fib=(hash(x,Math.floor(y/3),seed+7)>.91?-11:0);
    effect=cloud*13+fine*8-edge*19+fox+fib;
    const line=Math.floor(v*15),lineU=(u+.04*noise(line,8,2,seed+5));
    const length=.43+hash(line,0,seed)*.37;
    if(line>1&&line<13&&Math.abs((v*15)%1-.19)<.034&&lineU>.12&&lineU<length
       &&hash(Math.floor(u*65),line,seed+4)>.13)effect-=23;
    if((line===4||line===9)&&u>.25&&u<.41&&Math.abs((v*15)%1-.44)<.03)effect-=14;
   }else if(brass){
    const brushed=Math.sin(v*size*1.65)*6;
    const tarnish=Math.max(0,noise(x,y,20,seed+9)-.52)*-90;
    effect=brushed+cloud*22+fine*7+tarnish;
   }else if(leather){
    const wear=(Math.pow(Math.abs(u*2-1),12)+Math.pow(Math.abs(v*2-1),12))*22;
    const pores=hash(Math.floor(x*.7),Math.floor(y*.7),seed+3)>.87?-14:0;
    effect=cloud*12+fine*8+pores+wear;
    if(y%31===0&&x>6&&x<size-6)effect+=17;
   }else if(metal){
    const brush=Math.sin(y*2.9)*3;
    const scratch=hash(Math.floor(x/21),y,seed+2)>.982?24:0;
    effect=cloud*7+fine*5+brush+scratch;
   }else if(linen){
    const horizontal=(y%5===0?12:0),vertical=(x%5===0?10:0);
    effect=horizontal+vertical+cloud*8+fine*6;
   }
   const o=(y*size+x)*4;
   out[o]=clamp(base[0]+effect+accent);
   out[o+1]=clamp(base[1]+effect*.86+accent*.82);
   out[o+2]=clamp(base[2]+effect*.64+accent*.56);
   out[o+3]=255;
  }
  return Object.freeze({name,width:size,height:size,pixels:out,
   roughness:profiles[name].roughness,metalness:profiles[name].metalness??.04});
 }
 return Object.freeze({SIZE,profiles,generate});
});

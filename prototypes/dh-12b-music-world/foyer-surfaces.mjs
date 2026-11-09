// DH-12B.5: authored painted stone, worn gilding, velvet and aged enamel.
// These are ORIGINAL browser-generated textures bound to real 3D geometry.
const COLOURS=Object.freeze({
 stone:[109,93,128],gold:[210,170,111],dark:[52,39,62],
 velvet:[111,46,73],wood:[102,61,72],enamel:[60,124,131],
 cream:[233,214,183],patina:[73,110,113]
});
export const SURFACE_TYPES=Object.freeze(Object.keys(COLOURS));
const clamp=(n,min=0,max=255)=>Math.max(min,Math.min(max,n));
export function grainValue(kind,x,y){
 const ripples=kind==='wood'||kind==='velvet'
  ?Math.sin(x*.112+Math.sin(y*.047)*3.3)*.72+Math.sin(x*.34+y*.01)*.19
  :Math.sin(x*.043+y*.016)*.32+Math.sin(x*.083-y*.031)*.28;
 const grit=Math.sin(x*21.191+y*7.173)*Math.sin(x*1.219-y*23.115);
 const waves=kind==='stone'?Math.sin(x*.016+y*.029)*.72:
  kind==='gold'?Math.sin(x*.13+y*.06)*.25:
  kind==='enamel'?Math.sin(x*.058+y*.031)*.33:0;
 return ripples*8+grit*9+waves*6;
}
export function makeSurfaceCanvas(kind,doc=document){
 const base=COLOURS[kind];
 if(!base)throw Error('Unknown Music foyer surface '+kind);
 const canvas=doc.createElement('canvas');
 const size=512;canvas.width=size;canvas.height=size;
 const ctx=canvas.getContext('2d');
 const image=ctx.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const idx=(y*size+x)*4;
  const n=grainValue(kind,x,y);
  const crack=kind==='stone'?
   Math.abs(Math.sin(x*.019+y*.027+Math.sin(y*.014)*4.6))>.997?-18:0:0;
  const streak=(kind==='wood'&&x%47===0)?-17:0;
  const patina=kind==='enamel'&&Math.sin(x*.034-y*.021)>.975?-21:0;
  const wear=kind==='gold'&&Math.sin(x*.057)*Math.cos(y*.059)>.92?18:0;
  for(let c=0;c<3;c++){
   image.data[idx+c]=clamp(base[c]+n+crack+streak+patina+wear+
    (c===0?5:c===2?-4:0));
  }
  image.data[idx+3]=255;
 }
 ctx.putImageData(image,0,0);
 // Fine hand-drawn scratches, irregular wood growth and fabric folds
 // are spatial detail on physical objects, not baked scene backdrops.
 ctx.lineCap='round';
 const warm=kind==='gold'||kind==='cream';
 ctx.strokeStyle=warm?'rgba(255,244,213,.17)':'rgba(237,227,229,.12)';
 for(let i=0;i<55;i++){
  const x=(i*137.3)%512,y=(i*73.7)%512;
  ctx.lineWidth=i%5===0?1.65:.65;
  ctx.beginPath();ctx.moveTo(x,y);
  if(kind==='wood'||kind==='velvet')ctx.bezierCurveTo(
   x+Math.sin(i)*7,y+45,x-4+Math.cos(i)*10,y+90,x+Math.sin(i*2)*8,y+125);
  else ctx.lineTo(x+11+Math.sin(i)*19,y+4+Math.cos(i)*20);
  ctx.stroke();
 }
 if(kind==='stone'){
  ctx.strokeStyle='rgba(31,28,52,.20)';
  for(let i=0;i<14;i++){
   const x=(i*131)%512,y=(i*79)%512;
   ctx.lineWidth=.7+i%3*.3;
   ctx.beginPath();ctx.moveTo(x,y);
   ctx.bezierCurveTo(x+18,y+9,x+34,y-14,x+50,y+18);
   ctx.stroke();
  }
 }
 return canvas;
}
function tex(THREE,canvas,repeat=1){
 const t=new THREE.CanvasTexture(canvas);
 t.colorSpace=THREE.SRGBColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;
 t.repeat.set(repeat,repeat);
 t.anisotropy=8;
 return t;
}
export function makeFoyerMaterials(THREE,doc=document){
 const presets={
  golden:['gold',.43,.63,.018],
  dark:['dark',.88,.08,.024],
  stone:['stone',.91,.04,.038],
  cream:['cream',.87,.10,.013],
  amethyst:['velvet',.91,.02,.065],
  mint:['enamel',.47,.38,.018],
  wood:['wood',.79,.04,.035],
  seam:['gold',.43,.59,.012]
 };
 const materials={};
 for(const [name,[kind,roughness,metalness,bumpScale]] of Object.entries(presets)){
  const surface=tex(THREE,makeSurfaceCanvas(kind,doc),name==='stone'?2:1);
  materials[name]=new THREE.MeshStandardMaterial({
   map:surface,bumpMap:surface,bumpScale,
   color:'#ffffff',roughness,metalness
  });
 }
 return materials;
}
export function makePortalSignTexture(THREE,kind,doc=document){
 if(kind!=='theatre'&&kind!=='records')throw Error('Unknown physical portal sign');
 const c=doc.createElement('canvas');c.width=1536;c.height=350;
 const x=c.getContext('2d');
 const theatre=kind==='theatre';
 const base=x.createLinearGradient(0,0,1536,350);
 if(theatre){
  base.addColorStop(0,'#3f203b');base.addColorStop(.48,'#68314d');
  base.addColorStop(1,'#392039');
 }else{
  base.addColorStop(0,'#103b45');base.addColorStop(.48,'#28636a');
  base.addColorStop(1,'#163844');
 }
 x.fillStyle=base;x.fillRect(0,0,1536,350);
 x.strokeStyle=theatre?'#edc697':'#b9e4d2';
 x.lineWidth=17;x.strokeRect(13,13,1510,324);
 x.lineWidth=3;x.strokeRect(34,32,1468,286);
 x.fillStyle='#f6e4c2';x.textBaseline='middle';x.textAlign='center';
 x.shadowColor=theatre?'#140b1b':'#071d25';
 x.shadowBlur=12;x.shadowOffsetY=3;
 const title=theatre?'THEATRE':'RECORD SHOP';
 x.font='bold 160px Georgia,serif';
 x.fillText(title,768,177,1310);
 x.shadowColor='transparent';x.shadowOffsetY=0;
 // Distinct single glyph, kept outside the readable name.
 for(const sign of [-1,1]){
  const cx=sign<0?95:1441;
  if(theatre){
   x.fillStyle='#e8b77b';x.beginPath();x.arc(cx,175,22,0,Math.PI*2);x.fill();
   x.strokeStyle='#41253c';x.lineWidth=5;x.beginPath();
   x.arc(cx,178,11,.15,Math.PI-.15);x.stroke();
  }else{
   x.strokeStyle='#e7d4af';x.lineWidth=7;
   for(const r of [20,35]){x.beginPath();x.arc(cx,175,r,0,Math.PI*2);x.stroke();}
  }
 }
 return tex(THREE,c);
}

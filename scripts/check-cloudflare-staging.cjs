'use strict';
/* Read-only staging website smoke check. Runs in GitHub Actions from an
 * internet-connected runner. No Cloudflare credentials or changes required.
 */
const BASE='https://davehub.pages.dev';
const checks=[
 {path:'/worlds/',required:['<style data-davehub-inline="worlds">','3 creations','2 creations'],forbidden:['data-davehub-inline="staging"']},
 {path:'/worlds/games/',required:['<style data-davehub-inline="worlds">','Unicorn Valley','The Stephen Martin Project','Tame The Board Game','3 creations in this world'],forbidden:['data-davehub-inline="staging"','DESIGN REVIEW ONLY']},
 {path:'/worlds/projects/',required:['<style data-davehub-inline="worlds">','Unicorn Valley','The Stephen Martin Project']},
 {path:'/worlds/writing/',required:['<style data-davehub-inline="worlds">','data-scene="manuscript-hoard"','manuscript-room-v1.avif','<dialog class="room-dialog"','Tame The Board Game','href="/creations/tame-the-board-game/"'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-08b/worlds/writing/',required:['Fictional design demonstration','data-scene="manuscript-hoard"','data-room-panel="bookcase"','The Last Lightkeeper'],forbidden:['href="/creations/last-lightkeeper/"']},
 {path:'/creations/unicorn-valley/',required:['<style data-davehub-inline="worlds">','Unicorn Valley','Play on DaveHub','href="/games/unicorn-valley/"','unicorn-valley.pages.dev','View development repository'],forbidden:['DESIGN REVIEW ONLY']},
 {path:'/creations/stephen-martin-project/',required:['<style data-davehub-inline="worlds">','The Stephen Martin Project','Play on DaveHub','href="/games/stephen-martin/"','stephen-martin-project.pages.dev'],forbidden:['DESIGN REVIEW ONLY']},
 {path:'/creations/tame-the-board-game/',required:['<style data-davehub-inline="worlds">','Tame The Board Game','Miriam','tametheboardgame.com/about/'],forbidden:['DESIGN REVIEW ONLY']},
 {path:'/previews/dh-11c/furniture/',required:['DH-11C.4F','data-furniture-model-proof="true"','data-immersive-room="true"','id="furniture-model-status"','dh11c5a-desk-v1','room.js?v=dh11c5a-desk-v1','room-plan.js?v=dh11c5a-desk-v1','desk-materials.js?v=dh11c5a-desk-v1'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/room-shell/',required:['DH-11C.4E','data-shell-model-proof="true"','../room/room-shell-asset.js','id="shell-model-status"','data-immersive-room="true"'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/architecture/',required:['DH-11C.4C','data-shell-proof="true"','data-blender-compare="true"','data-immersive-room="true"','./immersive.css','./immersive-ui.js','id="prototype-tools"','id="scene-nav"','../room/room-shell-plan.js','../cabinet-glb/'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/cabinet-glb/',required:['DH-11C.4A','data-glb-proof="true"','id="glb-extension"','data-glb-snap="50"','../room/room.js'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/art-lab/',required:['DH-11C.3A','data-art-lab="true"','data-palette="amber-ink"','data-palette="moonlit-archive"','data-palette="golden-storybook"','../room/room.js'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/room/',required:['DH-11C.2','id="room-canvas"','room-plan.js','room.js','Writing desk','Floating-islands window','No catalogue or production changes'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-11c/cabinet/',required:['DH-11C.1','id="cabinet-model"','id="cabinet-slots"','cabinet-math.js','cabinet.js','cabinet.css','Five real 3D drawer bodies'],forbidden:['The Last Lightkeeper','The Clock of Tomorrow']},
 {path:'/previews/dh-08c/',required:['<style data-davehub-inline="worlds">','DESIGN REVIEW ONLY','Three creations. One new home.']}
];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function inspect(url,required,forbidden=[]){
 const response=await fetch(url,{redirect:'follow',headers:{'User-Agent':'DaveHub-Staging-Smoke/1.0','Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('HTTP '+response.status+' '+response.statusText);
 const type=response.headers.get('content-type')||'';
 if(!type.includes('text/html'))throw Error('Expected text/html, received '+type);
 const html=await response.text();
 for(const marker of required)if(!html.includes(marker))throw Error('Missing deployed marker: '+marker);
 for(const marker of forbidden)if(html.includes(marker))throw Error('Stale/invalid deployed marker present: '+marker);
 // Detect accidental raw source code or copy of private material in the page.
 if(/ownerApproved|approved_for_export|public_approved/.test(html))throw Error('Internal approval field leaked in staged HTML');
 return html.length;
}
async function main(){
 const attempts=4,wait=10000;
 for(let n=1;n<=attempts;n++){
  try{
   const results=[];
   for(const c of checks){
    const version=c.path==='/previews/dh-11c/furniture/'?'?dh11c5a-desk-v1=1':'?dh08d=1';
    results.push({path:c.path,bytes:await inspect(BASE+c.path+version,c.required,c.forbidden)});
   }
   // A missing .css or .js may return Pages' HTML fallback with HTTP 200.
   // Require the actual MIME and source bytes, not just the page's script tags.
   for(const dep of [
    {name:'immersive.css',type:'text/css',markers:['height:100dvh','body[data-immersive-room="true"] .canvas-frame']},
    {name:'immersive-ui.js',type:'javascript',markers:['prototype-tools','scene-nav','Escape']},
    {name:'architecture.css',type:'text/css',markers:['comparison-links']}
   ]){
    const url=BASE+'/previews/dh-11c/room-shell/'+dep.name+'?dh11c4e-layout=1';
    const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
    const contentType=response.headers.get('content-type')||'';
    if(!response.ok||!contentType.includes(dep.type))throw Error('Room-shell asset '+dep.name+' missing or wrong type (HTTP '+response.status+', '+contentType+')');
    const source=await response.text();
    for(const marker of dep.markers)if(!source.includes(marker))throw Error('Room-shell asset '+dep.name+' lacks expected code '+marker);
    if(source.includes('<!doctype html>')||source.includes('<html'))throw Error('Room-shell asset '+dep.name+' is a fallback HTML page');
    console.log('PASS hosted room-shell dependency '+dep.name+' ('+source.length+' bytes)');
   }
   // The raycast helper is imported by room.js on every preview route.
   // Pages may return fallback HTML with HTTP 200 when a .mjs file is missing.
   const picking=await fetch(BASE+'/previews/dh-11c/room/drawer-picking.mjs?dh11c-drawer=1',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   const pickType=picking.headers.get('content-type')||'';
   if(!picking.ok||!pickType.includes('javascript'))throw Error('Deployed drawer picking module missing/wrong MIME: '+picking.status+' '+pickType);
   const pickSource=await picking.text();
   if(!pickSource.includes('export function drawerIndexForMesh')||pickSource.includes('<!doctype html>'))throw Error('Invalid deployed drawer picking module');
   console.log('PASS hosted five-drawer raycast resolver ('+pickSource.length+' bytes)');
   const motion=await fetch(BASE+'/previews/dh-11c/room/furniture-motion.mjs?dh11c4f-motion=1',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   const motionType=motion.headers.get('content-type')||'';
   if(!motion.ok||!motionType.includes('javascript'))throw Error('Deployed furniture motion module missing or HTML fallback: '+motion.status+' '+motionType);
   const motionSource=await motion.text();
   for(const marker of ['export function paperPose','export function pressDepth','export function featuredBook','export function typedKeyIndex','export function binPaperPose','export function binPaperIndexForMesh','BIN_PAPER_FLOOR','BIN_PAPER_COUNT=9','export function lampPartForMesh'])
    if(!motionSource.includes(marker))throw Error('Deployed furniture motion module missing '+marker);
   console.log('PASS hosted furniture motion module: papers, bookcase, typewriter and nine bin crumples');
   const binPlanResponse=await fetch(BASE+'/previews/dh-11c/room/room-plan.js?v=dh11c5a-desk-v1',{
    headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)
   });
   if(!binPlanResponse.ok||!(binPlanResponse.headers.get('content-type')||'').includes('javascript'))
    throw Error('Current bin state module not deployed: HTTP '+binPlanResponse.status);
   const binPlan=await binPlanResponse.text();
   for(const marker of ['BIN_PAPER_COUNT=9','binPapers:Array(BIN_PAPER_COUNT).fill(false)','case \'bin\'','lampOn:true','case \'lamp\''])
    if(!binPlan.includes(marker))throw Error('Stale bin room state: missing '+marker);
   console.log('PASS hosted nine-crumple room state module');
   // Explicitly validate the versioned live JavaScript, not just HTML
   // referencing a module. A stale JS response caused invisible highlighted
   // books despite all other smoke checks returning green.
   const bookJs=await fetch(BASE+'/previews/dh-11c/room/room.js?v=dh11c5a-desk-v1',{
    headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)
   });
   const bookType=bookJs.headers.get('content-type')||'';
   if(!bookJs.ok||!bookType.includes('javascript'))
    throw Error('Versioned furniture module not served (HTTP '+bookJs.status+', '+bookType+')');
   const bookSource=await bookJs.text();
   for(const marker of [
    "const FEATURE_BOOK_COLOUR='#24f5da'",
    'featureBookGilt',
    'mesh.add(accent)',
    'books.forEach((mesh,i)=>markFeaturedBook(mesh,i));',
    'accent.userData.featuredBookIndex=index',
    'Find the eight turquoise books with gold spine markings',
    'toggleBinPaper(binPaperIndex)',
    "m.name='bin_paper_'+i",
    'binPaperPose(binPaperHomes[i],i,binPaperProgress[i])',
    'binPapers.splice(0,binPapers.length,...crumples)',
    'crumples.forEach((mesh,i)=>{mesh.userData.binPaperIndex=i;})',
    "from './furniture-motion.mjs?v=dh11c4l-lamp-switch-v1'",
    "if(!deskKit)throw Error('Missing DH-11C.5A shared desk material maps')",
    "new THREE.DataTexture(source.pixels,source.width,source.height,THREE.RGBAFormat)",
    "const mesh=box(g,.49,.012,.32,mats['deskParchment'+i%3]",
    "box(g,4.5,.2,2.15,mats.deskWalnut,0,1.29,0)",
    "lampPart:id==='desk'?lampPartForMesh(mesh.name):null",
    "lampButton.dataset.lampToggle='true'",
    "lampButton.addEventListener('click',toggleLamp)",
    "state=plan.next(state,{type:'lamp'})",
    "lampBulbMesh=glbBulb",
    "sceneLights.lamp.intensity=THREE.MathUtils.lerp(sceneLights.lamp.intensity,state.lampOn?sceneLights.lamp.userData.litIntensity:0,rate)",
    "bulbMaterial.emissiveIntensity=THREE.MathUtils.lerp(bulbMaterial.emissiveIntensity,state.lampOn?.85:0,rate)",
    'new THREE.CylinderGeometry(.245,.405,.30,24,1,true)',
    "shade.name='desk_lamp_shade'",
    "cap.name='desk_lamp_cap'",
    'lamp.position.set(-1.97,2.31,.17)',
    'const bulb=sphere(g,.065,mats.lampBulb,-1.67,2.345,-.43)',
    'furniture-source.glb?v=dh11c5a-desk-v1'
   ]){
    if(!bookSource.includes(marker))throw Error('Stale furniture script on Cloudflare: missing '+marker);
   }
   // The material initialiser also uses "if(furnitureModelProof)". Scope
   // this ordering check to the actual furniture GLB loader, not the first
   // occurrence in the module (which precedes the cabinet loader).
   const loaderMarker="if(furnitureModelProof){\n const output=document.getElementById('furniture-model-status');";
   const loaderIndex=bookSource.indexOf(loaderMarker);
   if(loaderIndex<0)throw Error('Furniture GLB loader missing from deployed runtime');
   const furnitureSource=bookSource.slice(loaderIndex);
   const giltIndex=furnitureSource.indexOf('books.forEach((mesh,i)=>markFeaturedBook(mesh,i));');
   const captureIndex=furnitureSource.indexOf('scene.add(content);');
   if(giltIndex<0||captureIndex<0||giltIndex>captureIndex)
    throw Error('Deployed book inlays are not registered before GLB scene capture');
   console.log('PASS hosted DH-11C.5A textured desk with all previous interactions ('+bookSource.length+' bytes)');
   const deskScript=await fetch(BASE+'/previews/dh-11c/room/desk-materials.js?v=dh11c5a-desk-v1',{
    headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)
   });
   if(!deskScript.ok)throw Error('Staging desk texture generator missing: '+deskScript.status);
   const deskSource=await deskScript.text();
   for(const marker of ['DH11DeskMaterials','deskWalnut','deskParchment0','deskParchment1',
    'deskLeather','typewriterEnamel','lampLinen','function generate(name,size=SIZE)'])
    if(!deskSource.includes(marker))throw Error('Stale desk map generator: '+marker);
   console.log('PASS hosted nine shared UV material recipes ('+deskSource.length+' bytes)');

   const model=await fetch(BASE+'/previews/dh-11c/room/models/cabinet-prototype.glb?dh11c4=1',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   if(!model.ok)throw Error('GLB asset HTTP '+model.status);
   const glb=Buffer.from(await model.arrayBuffer());
   if(glb.length<2000||glb.readUInt32LE(0)!==0x46546c67||glb.readUInt32LE(4)!==2||glb.readUInt32LE(8)!==glb.length)throw Error('Cloudflare served invalid GLB');
   console.log('PASS GLB asset loaded from Cloudflare ('+glb.length+' bytes)');
   const blender=await fetch(BASE+'/previews/dh-11c/room/models/cabinet-blender-verified.glb?dh11c4c=1',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   if(!blender.ok)throw Error('Blender GLB asset HTTP '+blender.status);
   const blenderGlb=Buffer.from(await blender.arrayBuffer());
   const crypto=require('node:crypto');
   const hash=crypto.createHash('sha256').update(blenderGlb).digest('hex');
   if(blenderGlb.length!==26164||hash!=='051e4abdb015799282234ea50b14cd179cb335ee496dbfdf965a4f1081abbf8a')throw Error('Staging Blender export differs from verified source');
   console.log('PASS verified Blender cabinet GLB on Cloudflare, sha256 '+hash);
   const shell=await fetch(BASE+'/previews/dh-11c/room/models/room-shell-source.glb?dh11c4e=1',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   if(!shell.ok)throw Error('Room shell GLB asset HTTP '+shell.status);
   const shellBytes=Buffer.from(await shell.arrayBuffer());
   if(shellBytes.length<2000||shellBytes.readUInt32LE(0)!==0x46546c67||shellBytes.readUInt32LE(4)!==2||shellBytes.readUInt32LE(8)!==shellBytes.length)throw Error('Invalid deployed room shell GLB');
   const expectedShell=require('./build-dh11c4e-shell-glb.cjs').build().sha256;
   const actualShell=crypto.createHash('sha256').update(shellBytes).digest('hex');
   if(expectedShell!==actualShell)throw Error('Deployed room model differs from source manifest');
   console.log('PASS hosted room GLB sha256 '+actualShell);
   const fmodel=await fetch(BASE+'/previews/dh-11c/room/models/furniture-source.glb?v=dh11c5a-desk-v1',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   if(!fmodel.ok)throw Error('Furniture GLB not deployed: '+fmodel.status);
   const furnitureBytes=Buffer.from(await fmodel.arrayBuffer());
   const furnitureHash=crypto.createHash('sha256').update(furnitureBytes).digest('hex');
   const expectedFurniture=require('./build-dh11c4f-furniture-glb.cjs').build().sha256;
   if(furnitureHash!==expectedFurniture||furnitureBytes.readUInt32LE(0)!==0x46546c67)
    throw Error('Furniture GLB on Cloudflare does not match approved source geometry');
   const jsonSize=furnitureBytes.readUInt32LE(12);
   const furnitureJson=JSON.parse(furnitureBytes.subarray(20,20+jsonSize).toString('utf8').trimEnd());
   if(furnitureJson.images?.length!==9||furnitureJson.textures?.length!==9)
    throw Error('Deployed material-reference GLB missing nine embedded UV textures');
   for(const name of ['deskWalnut','deskFrame','deskParchment0','deskParchment1','deskParchment2',
    'deskLeather','deskBrass','typewriterEnamel','lampShade']){
    const mat=furnitureJson.materials.find(m=>m.name===name);
    if(!mat?.pbrMetallicRoughness?.baseColorTexture)
     throw Error('Deployed desk GLB missing PBR map for '+name);
   }
   console.log('PASS hosted texture-embedded GLB SHA256 '+furnitureHash+' (9 PBR images)');
   for(const name of ['immersive.css','immersive-ui.js','architecture.css','glb-proof.css']){
    const response=await fetch(BASE+'/previews/dh-11c/furniture/'+name+'?dh11c4f=1',{signal:AbortSignal.timeout(15000)});
    const type=response.headers.get('content-type')||'';
    if(!response.ok||!type.includes(name.endsWith('.css')?'text/css':'javascript'))
     throw Error('Furniture preview missing stylesheet/script '+name+' (HTTP '+response.status+', '+type+')');
    const code=await response.text();
    if(code.includes('<!doctype html>')||code.length<100)throw Error('Furniture preview dependency was HTML fallback: '+name);
   }
   console.log('PASS furniture viewport CSS and JS deployed as real assets');

   const blenderRoom=await fetch(BASE+'/previews/dh-11c/room/models/room-shell-blender-verified.glb?dh11c4e=2',{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
   if(!blenderRoom.ok)throw Error('Blender room GLB asset HTTP '+blenderRoom.status);
   const bytes=Buffer.from(await blenderRoom.arrayBuffer());
   const verified=require('./build-dh11c4e-blender-model.cjs').expected;
   if(bytes.length!==22104||crypto.createHash('sha256').update(bytes).digest('hex')!==verified)throw Error('Hosted Blender architecture model fails source hash');
   console.log('PASS hosted Blender room shell GLB sha256 '+verified);
   console.log('PASS: Cloudflare serves three approved creation pages, accessible live worlds and separate layout-only previews.');
   for(const r of results)console.log('PASS '+r.path+' ('+r.bytes+' HTML bytes)');
   return;
  }catch(err){
   console.error('Attempt '+n+'/'+attempts+': '+err.message);
   if(n<attempts)await pause(wait);
   else throw Error('Cloudflare staging did not serve the expected merged build; inspect Pages deployment/retry status.');
  }
 }
}
if(require.main===module)main().catch(err=>{console.error(err);process.exitCode=1});
module.exports={checks,inspect};

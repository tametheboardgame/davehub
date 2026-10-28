'use strict';
/* DH-08B: statically render only validated, explicitly approved creative content.
 * The same templates are used for the empty live catalogue and fictional preview.
 */
const fs=require('node:fs');
const path=require('node:path');
const {validateCatalogue}=require('./content-check.cjs');
const VIEWS=[
  {id:'projects',title:'Projects',subtitle:'Things that escaped the idea stage.',mark:'◈'},
  {id:'writing',title:'Writing',subtitle:'Books, stories, scripts and peculiar uses of words.',mark:'✎'},
  {id:'games',title:'Games',subtitle:'Worlds to play, discover and get lost in.',mark:'◇'},
  {id:'experiments',title:'Experiments',subtitle:'Strange things, built and imagined.',mark:'✦'},
  {id:'music',title:'Music',subtitle:'Songs, albums and worlds built from sound.',mark:'♫'},
  {id:'unfinished',title:'The Unfinished Shelf',subtitle:'Ideas and stories deliberately left unfinished.',mark:'⌁'},
  {id:'memory-lane',title:'Trip Down Memory Lane',subtitle:'Everything that came before. Dates optional.',mark:'◌'}
];
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const esc=escapeHtml;
const kindLabel=item=>item.workType||item.artifactKind||item.releaseKind||item.recordType;
const friendlyKind=item=>kindLabel(item).replace(/_/g,' ');
const relName=kind=>({has_song:'Song',contains:'Part of this creation',part_of:'Part of',release_of:'Release of',music_for:'Music for',related_to:'Related to',scene_of:'Scene of',based_on:'Based on',created_by:'Created by'}[kind]||kind.replace(/_/g,' '));
const attr=(name,val)=>' '+name+'="'+esc(val)+'"';
const join=parts=>parts.filter(Boolean).join('\n');
const prefixRoot=root=>root.replace(/\/+$/,'');
const pageUrl=(root,slug)=>prefixRoot(root)+'/creations/'+encodeURIComponent(slug)+'/';
const viewUrl=(root,view)=>prefixRoot(root)+'/worlds/'+encodeURIComponent(view)+'/';
const worldIndex=root=>prefixRoot(root)+'/worlds/';
function dateLabel(item){
 const p=item.period;
 if(!p||(!p.fromYear&&!p.toYear))return 'Date unknown';
 const from=p.fromYear||p.toYear, to=p.toYear;
 return (p.approximate?'c. ':'')+from+(to&&to!==from?'–'+to:'');
}
function sortEntries(arr,view){
 const copy=[...arr];
 if(view==='memory-lane')return copy.sort((a,b)=>(a.period?.fromYear??9999)-(b.period?.fromYear??9999)||a.title.localeCompare(b.title));
 return copy.sort((a,b)=>a.title.localeCompare(b.title));
}
function shell({title,kicker,lead,body,root,preview=false,reviewRedirectEligible=false}){
 const nav=VIEWS.map(v=>'<a'+attr('href',viewUrl(root,v.id))+'>'+esc(v.title)+'</a>').join('');
 return '<!doctype html>\n<html lang="en-GB"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow">'+
 '<meta name="color-scheme" content="dark">'+
 '<title>'+esc(title)+' · DaveHub</title>'+
 '<link rel="stylesheet" href="/assets/content/worlds.css">'+
 (reviewRedirectEligible?'<script defer src="/assets/content/staging-review.js"></script>':'')+
 '</head><body><a class="skip" href="#main">Skip to content</a>'+
 '<div class="sky" aria-hidden="true"></div>'+
 '<div class="shell">'+
 '<header class="top"><a class="brand" href="/"><strong>Dave<span>Hub</span></strong><small>THE CREATIVE UNIVERSE</small></a>'+
 '<a class="home" href="/">← Back to the islands</a></header>'+
 '<nav class="trail" aria-label="Content destinations"><a'+attr('href',worldIndex(root))+'>All worlds</a>'+nav+'</nav>'+
 '<main id="main"><div class="intro"><div class="eyebrow">✦ '+esc(kicker)+'</div><h1>'+esc(title)+'</h1><p class="lead">'+esc(lead)+'</p></div>'+
 (preview===true?'<div class="preview"><strong>Fictional design demonstration.</strong> All names and stories here are invented. No real work has been published by this preview.</div>':'')+
 body+'</main><footer class="footer">Somewhere between an idea and a very bad idea. · <a href="/">DaveHub</a></footer></div></body></html>';
}
function card(item,root,subtitle){
 return '<a class="work-card"'+attr('href',pageUrl(root,item.slug))+'>'+
 '<span class="type">'+esc(friendlyKind(item))+' <span class="dot">✦</span> '+esc(dateLabel(item))+'</span>'+
 '<strong>'+esc(item.title)+'</strong><span class="desc">'+esc(subtitle||item.synopsis)+'</span>'+
 '<span class="open">Step inside <span aria-hidden="true">↗</span></span></a>';
}
function section(title,body,small){
 return '<section class="section"><div class="section-head"><p class="eyebrow">'+esc(small||'EXPLORE')+'</p><h2>'+esc(title)+'</h2></div>'+body+'</section>';
}
function linkList(items,root,empty){
 if(!items.length)return '<p class="quiet">'+esc(empty||'Nothing available here yet.')+'</p>';
 return '<div class="cards">'+items.map(i=>card(i,root)).join('\n')+'</div>';
}
function demoInvitation(view){
 const target='/previews/dh-08b/worlds/'+(view?encodeURIComponent(view)+'/':'');
 return '<aside class="demo-invitation"><p class="eyebrow">DESIGN PREVIEW</p>'+
 '<h2>Step into a fictional example</h2>'+
 '<p>We haven\'t added any approved real works yet, but you can explore the full page designs with clearly labelled, invented creations.</p>'+
 '<a class="ghost"'+attr('href',target)+'>Explore the fictional example ↗</a></aside>';
}
function emptyState(root,view,preview){
 if(preview==='review'){
  return '<div class="empty"><div class="orb">✧</div><h2>No first-wave candidate in this area.</h2>'+
   '<p>This design review only includes three proposed creations. Games, Projects, Writing and Memory Lane have sample cards; nothing is approved for public publication.</p>'+
   '<a class="ghost"'+attr('href',worldIndex(root))+'>Explore the populated review areas →</a></div>';
 }
 return '<div class="empty"><div class="orb">✧</div><h2>Nothing has landed here yet.</h2>'+
 '<p>DaveHub is ready for its first approved creations. This is an empty destination, not a promise that something is coming soon.</p>'+
 '<a class="ghost"'+attr('href',worldIndex(root))+'>Explore the other worlds →</a></div>'+
 (!preview?demoInvitation(view):'');
}
function renderIndex(data,root,preview){
 const blocks='<div class="world-tiles">'+VIEWS.map(v=>{
  const n=data.items.filter(i=>i.views.includes(v.id)).length;
  return '<a class="world-tile"'+attr('href',viewUrl(root,v.id))+'><span class="symbol">'+esc(v.mark)+'</span>'+
   '<strong>'+esc(v.title)+'</strong><span>'+esc(v.subtitle)+'</span><em>'+(n?n+' '+(n===1?'creation':'creations'):'Open this world')+' ↗</em></a>';
 }).join('\n')+'</div>';
 return shell({title:'Every world has a doorway',kicker:'EXPLORE / CREATIVE WORLDS',lead:'Follow an idea into music, writing, games, forgotten experiments and beyond. One creation can belong to several worlds.',body:(!preview && !data.items.length?demoInvitation(): '')+blocks,root,preview,reviewRedirectEligible:!preview&&!data.items.length&&root===''});
}
function renderView(data,root,view,preview){
 const v=VIEWS.find(x=>x.id===view);
 const works=sortEntries(data.items.filter(i=>i.views.includes(view)),view);
 const feature=works.length
   ? '<p class="found">'+works.length+' '+(works.length===1?'creation':'creations')+' in this world</p>'+linkList(works,root)
   : emptyState(root,view,preview);
 const caveat=view==='unfinished'?'<p class="quiet">The Unfinished Shelf is an archive, not a list of things that will be completed.</p>':'';
 return shell({title:v.title,kicker:'WORLD / '+v.id.toUpperCase().replaceAll('-',' '),lead:v.subtitle,body:section('Discover the creations',feature,'EXPLORE THIS WORLD')+caveat,root,preview,reviewRedirectEligible:!preview&&!data.items.length&&root===''});
}
function related(data,item){
 const out=new Map();
 const byId=new Map(data.items.map(i=>[i.id,i]));
 for(const r of item.relations||[]){
  if(byId.has(r.targetId))out.set(r.targetId,{item:byId.get(r.targetId),rel:r.kind});
 }
 for(const other of data.items){
  if(other.id===item.id)continue;
  const back=(other.relations||[]).find(r=>r.targetId===item.id);
  if(back&&!out.has(other.id))out.set(other.id,{item:other,rel:back.kind});
 }
 return [...out.values()];
}
function linkedSection(title,items,root,empty){
 if(!items.length)return '';
 return section(title,linkList(items,root,empty),'INSIDE THE CREATION');
}
function renderMusical(data,item,root){
 const relations=related(data,item).map(x=>x.item);
 const concept=relations.filter(x=>x.artifactKind==='concept');
 const songs=relations.filter(x=>x.workType==='song');
 const scenes=relations.filter(x=>['script_scene','lyrics','excerpt'].includes(x.artifactKind));
 const notes=relations.filter(x=>x.artifactKind==='development_note');
 const releases=relations.filter(x=>x.recordType==='release');
 let sections='';
 if(concept.length)sections+=linkedSection('Story, setting & concepts',concept,root);
 if(songs.length)sections+=linkedSection('Listen & explore the songs',songs,root)+
  '<p class="quiet">Only approved recordings and links appear on each song page. Nothing plays automatically.</p>';
 if(scenes.length)sections+=linkedSection('Read the script & scenes',scenes,root);
 if(notes.length)sections+=linkedSection('The making of',notes,root);
 if(releases.length)sections+=linkedSection('Albums & releases',releases,root);
 return sections||'<div class="empty"><h2>The show starts here.</h2><p>This musical has no additional approved artifacts yet. Its concept can still stand on its own.</p></div>';
}
function renderWork(data,item,root,preview){
 const views='<div class="chips">'+item.views.map(v=>'<a'+attr('href',viewUrl(root,v))+'>'+esc(VIEWS.find(x=>x.id===v)?.title||v)+'</a>').join('')+'</div>';
 const out=[];
 out.push('<div class="work-head"><p class="eyebrow">✦ '+esc(friendlyKind(item).toUpperCase())+' · '+esc(dateLabel(item))+'</p>'+
  '<h2>'+esc(item.title)+'</h2><p class="work-synopsis">'+esc(item.synopsis)+'</p>'+views+'</div>');
 if(item.views.includes('unfinished'))out.push('<div class="shelved">An archived creative fragment — no plans or promises to finish it.</div>');
 if(item.workType==='musical')out.push(renderMusical(data,item,root));
 else{
  const linked=related(data,item);
  if(linked.length)out.push(section('Connected creations',
   '<div class="cards">'+linked.map(x=>card(x.item,root,relName(x.rel)+' · '+x.item.synopsis)).join('')+'</div>',
   'FOLLOW THE THREAD'));
 }
 if(item.links?.length)out.push(section('Official links','<div class="outlinks">'+item.links.map(l=>'<a href="'+esc(l.url)+'" rel="noopener noreferrer" target="_blank">'+esc(l.label)+' <span aria-hidden="true">↗</span></a>').join('')+'</div>','OUTSIDE DAVEHUB'));
 if(item.media?.length)out.push(section('Approved media','<div class="outlinks">'+item.media.map(m=>'<a href="'+esc(m.url)+'" rel="noopener noreferrer" target="_blank">'+esc(m.title)+' <span aria-hidden="true">↗</span></a>').join('')+'</div>','MEDIA & ARTIFACTS'));
 out.push('<a class="ghost"'+attr('href',worldIndex(root))+'>← Explore more creative worlds</a>');
 return shell({title:item.title,kicker:'CREATION / '+friendlyKind(item),lead:'A path through the connected DaveHub universe.',body:join(out),root,preview});
}
function filesFor(data,root,preview){
 const result=new Map();
 result.set('worlds/index.html',renderIndex(data,root,preview));
 for(const view of VIEWS) result.set('worlds/'+view.id+'/index.html',renderView(data,root,view.id,preview));
 for(const item of data.items) result.set('creations/'+item.slug+'/index.html',renderWork(data,item,root,preview));
 return result;
}
function renderToDisk(inputDir,outputDir,root,preview){
 const manifest=JSON.parse(fs.readFileSync(inputDir,'utf8'));
 const result=validateCatalogue(manifest);
 if(!result.valid)throw Error('Refusing unapproved/invalid content: '+result.errors.join('; '));
 const files=filesFor(manifest,root,preview);
 for(const [name,html] of files){
  const target=path.join(outputDir,name);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,html,'utf8');
 }
 return {pages:files.size,creations:manifest.items.length};
}
module.exports={escapeHtml,dateLabel,filesFor,renderToDisk,VIEWS};
if(require.main===module){
 const [input,output,root='',flag='public']=process.argv.slice(2);
 if(!input||!output)throw Error('Usage: node scripts/render-content.cjs input.json output-directory [url-prefix] [public|fictional]');
 if(!['public','fictional'].includes(flag))throw Error('Invalid build mode');
 const result=renderToDisk(input,output,root,flag==='fictional');
 console.log('Rendered '+result.pages+' '+flag+' pages ('+result.creations+' canonical creations)');
}

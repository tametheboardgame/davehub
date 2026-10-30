'use strict';
/* DH-10C public-safe browser review queue. NOT a private admin console:
 * all information shown comes from public repos or the approved catalogue.
 * Never load README content, unpublished draft text or arbitrary source URLs.
 * Authentication and editorial writes happen only in GitHub Actions/PRs.
 */
(function(){
 const API='https://api.github.com',OWNER='tametheboardgame';
 const ACTION='https://github.com/tametheboardgame/davehub/actions/workflows/dh10c-editorial-proposal.yml';
 const out=document.getElementById('candidates');
 const status=document.getElementById('status');
 const refresh=document.getElementById('refresh');
 const COUNTER=document.getElementById('counter');
 const allowedViews=new Set(['projects','writing','games','experiments','music','unfinished','memory-lane']);
 function el(tag,className,text){
  const n=document.createElement(tag);
  if(className)n.className=className;
  if(text!==undefined)n.textContent=String(text);
  return n;
 }
 function link(url,label){
  const a=el('a','',label);
  a.href=url;a.rel='noopener noreferrer';a.target='_blank';
  return a;
 }
 function validPublic(url){
  try{
   const u=new URL(url);
   return u.protocol==='https:'&&!u.username&&!u.password &&
    u.hostname==='github.com'&&u.pathname.startsWith('/'+OWNER+'/');
  }catch{return false}
 }
 async function get(url){
  const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
  if(r.status===404)return null;
  if(!r.ok)throw Error('GitHub returned '+r.status);
  return r.json();
 }
 async function manifest(repo){
  const url=API+'/repos/'+OWNER+'/'+encodeURIComponent(repo.name)+'/contents/davehub.json?ref='+encodeURIComponent(repo.default_branch||'main');
  const response=await get(url);
  if(!response)return null;
  if(response.type!=='file'||response.encoding!=='base64'||typeof response.content!=='string')return null;
  const text=atob(response.content.replace(/\s/g,''));
  if(text.length>8192)return null;
  const m=JSON.parse(text);
  if(m.schemaVersion!==1||m.enabled!==true||typeof m.id!=='string'||!(/^[a-z][a-z0-9-]{2,79}$/).test(m.id)||
     typeof m.title!=='string'||!m.title.trim()||m.title.length>180||!Array.isArray(m.categories)||
     !m.categories.length||!m.categories.every(x=>allowedViews.has(x))||
     m.links?.repository!=='https://github.com/'+OWNER+'/'+repo.name)return null;
  return{repo:repo.name,id:m.id,title:m.title,views:m.categories};
 }
 async function load(){
  refresh.disabled=true;out.replaceChildren();status.textContent='Reading public, opted-in GitHub markers…';
  COUNTER.textContent='';
  try{
   const [list,approvedData]=await Promise.all([
    get(API+'/users/'+OWNER+'/repos?per_page=100&type=owner'),
    fetch('/content/catalogue.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
   ]);
   if(!Array.isArray(list))throw Error('GitHub repository discovery is unavailable');
   const approvedIds=new Set((Array.isArray(approvedData?.items)?approvedData.items:[]).map(x=>x.id));
   const publicRepos=list.filter(r=>r.owner?.login===OWNER&&!r.private&&!r.archived&&!r.fork&&r.name!=='davehub').slice(0,75);
   const collected=[];
   // Concurrency bounded to avoid spikes or exhausting public GitHub API.
   for(let i=0;i<publicRepos.length;i+=4){
    const chunk=await Promise.all(publicRepos.slice(i,i+4).map(r=>manifest(r).catch(()=>null)));
    collected.push(...chunk.filter(Boolean));
   }
   const candidates=collected.sort((a,b)=>Number(approvedIds.has(a.id))-Number(approvedIds.has(b.id))||a.title.localeCompare(b.title));
   for(const c of candidates){
    const article=el('article','project');
    article.append(el('span','eyebrow','DAVEHUB READY'),el('h3','',c.title),el('p','','Source: '+OWNER+'/'+c.repo));
    const meta=el('div','meta');
    meta.append(el('span','tag '+(approvedIds.has(c.id)?'published':'pending'),approvedIds.has(c.id)?'Published in DaveHub':'Awaiting review'));
    for(const view of c.views)meta.append(el('span','tag',view.replaceAll('-',' ')));
    article.append(meta);
    const links=el('div','links');
    const repoUrl='https://github.com/'+OWNER+'/'+c.repo;
    if(validPublic(repoUrl))links.append(link(repoUrl,'Source repository'));
    if(approvedIds.has(c.id))links.append(link('/creations/'+encodeURIComponent(c.id)+'/','Existing listing'));
    else links.append(link(ACTION,'Prepare review proposal'));
    const copy=el('button','action secondary','Copy project details');
    copy.type='button';
    copy.style.padding='.45rem .7rem';
    copy.style.fontSize='.78rem';
    copy.addEventListener('click',()=>{if(navigator.clipboard?.writeText){
     navigator.clipboard.writeText('Repository: '+OWNER+'/'+c.repo+'\nProject ID: '+c.id).then(()=>{copy.textContent='Copied'}).catch(()=>{copy.textContent='Select repository and ID above'});
    }else{copy.textContent='Select repository and ID above'}});
    links.append(copy);article.append(links);out.append(article);
   }
   COUNTER.textContent=candidates.length+' opted-in public projects · '+candidates.filter(c=>approvedIds.has(c.id)).length+' already in the catalogue';
   status.textContent=candidates.length?'Select a project and use the GitHub proposal workflow to review its details.':'No public repositories are currently opted in.';
  }catch(error){
   status.textContent='Live GitHub discovery could not load ('+error.message+'). GitHub may be rate-limiting public requests.';
   const p=el('p','quiet','The existing weekly GitHub Actions discovery report remains available.');
   out.append(p,link('https://github.com/tametheboardgame/davehub/actions/workflows/davehub-discovery.yml','View discovery workflow'));
  }finally{refresh.disabled=false}
 }
 refresh.addEventListener('click',load);
 load();
})();

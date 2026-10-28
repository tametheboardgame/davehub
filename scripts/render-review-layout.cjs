'use strict';
/*
 * DH-08C4: Cloudflare-hosted LAYOUT-ONLY review. No imported private draft data,
 * no unapproved copy, no live links, and no publication status is emitted.
 * Source titles already exist publicly; ALL editorial content is placeholder.
 */
const fs=require('node:fs');
const path=require('node:path');
const {filesFor,escapeHtml}=require('./render-content.cjs');
const {firstWave}=require('../tools/workshop/first-wave.cjs');

const PREFIX='/previews/dh-08c';
const PLACEHOLDER='Editorial description withheld pending owner approval. This placeholder is here to check spacing, typography and mobile layout.';
const EXPLANATION='Layout-only mock-up. Project names are for orientation; the descriptions are placeholders. No project links, images, rights approval or public catalogue records have been deployed.';
const BANNER='<aside class="review-notice" role="note"><strong>DESIGN REVIEW ONLY — NOT PUBLISHED CONTENT</strong><p>'+escapeHtml(EXPLANATION)+'</p></aside>';
const ID=/^[a-z][a-z0-9-]{2,79}$/;
function safeLayoutData(){
 const seen=new Set();
 const items=firstWave.map(item=>{
  if(!ID.test(item.id)||!ID.test(item.slug)||seen.has(item.slug))throw Error('Invalid or duplicate review project ID');
  seen.add(item.slug);
  // Deliberately discard every synopsis, URL, private note and approval field.
  return Object.freeze({
   id:item.id,slug:item.slug,title:item.title,recordType:'work',
   workType:item.workType,lifecycle:item.lifecycle,
   views:Object.freeze([...item.views]),
   synopsis:PLACEHOLDER,
   sources:[],links:[],media:[],relations:[]
  });
 });
 if(items.length!==3)throw Error('Expected exactly three agreed first-wave projects');
 return{schemaVersion:1,items};
}
function decorate(html){
 // These are a publicly visible *design* proof only. Be explicit on every page.
 return html.replace('<div class="shell">','<div class="shell">'+BANNER)
  .replace('<title>','<title>DESIGN REVIEW · ');
}
function landing(data){
 const cards=data.items.map(item=>'<a class="work-card" href="'+PREFIX+'/creations/'+encodeURIComponent(item.slug)+'/">'+
  '<span class="type">LAYOUT MOCK-UP · '+escapeHtml(item.workType)+'</span><strong>'+escapeHtml(item.title)+'</strong>'+
  '<span class="desc">Preview the proposed page design with placeholder text and no live project links.</span>'+
  '<span class="open">Review layout ↗</span></a>').join('');
 return '<!doctype html><html lang="en-GB"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow">'+
 '<title>First-wave page layout review · DaveHub</title>'+
 '<link rel="stylesheet" href="/assets/content/worlds.css"></head><body>'+
 '<div class="sky" aria-hidden="true"></div><div class="shell">'+
 '<header class="top"><a class="brand" href="/"><strong>Dave<span>Hub</span></strong><small>THE CREATIVE UNIVERSE</small></a>'+
 '<a class="home" href="/">← Back to DaveHub</a></header>'+
 BANNER+
 '<main id="main"><div class="intro"><p class="eyebrow">DH-08C / HOSTED DESIGN REVIEW</p>'+
 '<h1>Three creations. One new home.</h1>'+
 '<p class="lead">Inspect the look and navigation of the first three potential DaveHub pages. This test contains no approved descriptions or playable links.</p></div>'+
 '<div class="cards">'+cards+'</div>'+
 '<section class="section"><div class="section-head"><p class="eyebrow">WORLD LAYOUTS</p><h2>See them together</h2></div>'+
 '<p class="quiet">Check how categories group several creations without duplicating their individual pages.</p>'+
 '<div class="outlinks"><a href="'+PREFIX+'/worlds/games/">Games layout</a>'+
 '<a href="'+PREFIX+'/worlds/projects/">Projects layout</a>'+
 '<a href="'+PREFIX+'/worlds/memory-lane/">Memory Lane layout</a></div></section>'+
 '<section class="section"><div class="section-head"><p class="eyebrow">WHAT YOU ARE REVIEWING</p><h2>Layout and navigation only</h2></div>'+
 '<p class="quiet">Typography, spacing, category labels, button placement, scrolling, mobile layout and links between preview pages. The wording, contributor credits, external links and publication rights remain separate sign-offs.</p></section>'+
 '</main><footer class="footer">DaveHub · design review · nothing approved for publication</footer></div></body></html>';
}
function renderReview(out){
 const data=safeLayoutData();
 const entries=filesFor(data,PREFIX,'review');
 const generated=new Map([['index.html',landing(data)]]);
 for(const [name,html]of entries)generated.set(name,decorate(html));
 for(const [name,html]of generated){
  const destination=path.join(out,name);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,html,'utf8');
 }
 return{pages:generated.size,works:data.items.length};
}
module.exports={safeLayoutData,landing,renderReview,PLACEHOLDER,BANNER};
if(require.main===module){
 const target=process.argv[2];
 if(!target||process.argv.length!==3)throw Error('Usage: node scripts/render-review-layout.cjs dist/previews/dh-08c');
 const result=renderReview(target);
 console.log('Rendered DH-08C hosted layout-only review: '+result.pages+' pages; '+result.works+' names, 0 unapproved descriptions or links.');
}

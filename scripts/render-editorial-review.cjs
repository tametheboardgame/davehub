'use strict';
/*
 * Safe hosted DH-10C portal, not an authenticated CMS. Only JavaScript
 * reads public repository names/IDs from public GitHub APIs, and it never
 * renders unapproved descriptions or copies external assets.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function makeReviewPage(){
 const css=fs.readFileSync(path.join(root,'assets/editorial/review.css'),'utf8');
 const js=fs.readFileSync(path.join(root,'assets/editorial/review.js'),'utf8');
 if(css.includes('</style>')||js.includes('</script>'))throw Error('Unsafe inline review asset delimiter');
 return '<!doctype html>\n<html lang="en-GB"><head><meta charset="utf-8">'+
  '<meta name="viewport" content="width=device-width,initial-scale=1">'+
  '<meta name="robots" content="noindex,nofollow">'+
  '<meta name="color-scheme" content="dark"><title>Project review · DaveHub</title>'+
  '<style data-dh10c="review">'+css+'</style></head>'+
  '<body><a class="skip" href="#main">Skip to content</a><div class="shell">'+
  '<header class="top"><a class="brand" href="/">Dave<span>Hub</span></a>'+
  '<a class="return" href="/worlds/">← Explore DaveHub</a></header>'+
  '<main id="main"><p class="eyebrow">DH-10C / EDITORIAL WORKFLOW</p>'+
  '<h1>The project review desk</h1>'+
  '<p class="lead">Discover opted-in public projects, prepare edits and propose new listings. The final decision is made in a reviewed GitHub pull request.</p>'+
  '<aside class="notice" role="note"><strong>Public staging review area, not a private workspace.</strong>'+
  '<p>Anyone can open this page. It displays only public source repository names, project titles, categories and publication status. Unapproved descriptions, private drafts, collaborator material and publication permissions are not published here.</p></aside>'+
  '<div class="actions">'+
  '<a class="action" href="https://github.com/tametheboardgame/davehub/actions/workflows/dh10c-editorial-proposal.yml" target="_blank" rel="noopener noreferrer">Prepare a publication proposal in GitHub ↗</a>'+
  '<a class="action secondary" href="https://github.com/tametheboardgame/davehub/pulls?q=is%3Apr+is%3Aopen+base%3Astaging" target="_blank" rel="noopener noreferrer">Review open staging proposals ↗</a>'+
  '</div>'+
  '<section aria-labelledby="candidate-heading"><p class="eyebrow">PUBLIC SOURCE INVENTORY</p>'+
  '<h2 id="candidate-heading">Opted-in projects</h2>'+
  '<p class="quiet">Projects appear here because their own public repository opts into discovery, not because DaveHub has approved publication. The browser checks GitHub directly; GitHub rate limits may apply.</p>'+
  '<p class="quiet" id="counter"></p><div class="state" id="status" role="status" aria-live="polite">Loading public project markers…</div>'+
  '<button id="refresh" class="action secondary" type="button">Refresh projects</button><div id="candidates" class="results" aria-live="polite"></div></section>'+
  '<section><h2>The publishing process</h2><ol class="steps">'+
  '<li>Choose an opted-in public project and open the authenticated GitHub workflow, using the repository name and project ID shown above.</li>'+
  '<li>Choose publish, revise or withdraw. For a new or revised listing, provide the approved public description and any category changes. Check all four rights and editorial confirmations.</li>'+
  '<li>The workflow checks the source and catalogue, then opens a staging pull request. It never merges or publishes automatically.</li>'+
  '<li>Review the exact changes and preview, then merge the PR to publish. Withdrawing uses the same review and merge gate.</li>'+
  '</ol><p class="quiet">The original local Content Workshop remains available for private drafting, but no local server is needed for this public-metadata workflow. Publications are tracked in GitHub history.</p></section>'+
  '</main><footer>DaveHub · Staging editorial review · Publication requires owner approval.</footer>'+
  '</div><script data-dh10c="review">'+js+'</script></body></html>';
}
function writeReview(out){
 const html=makeReviewPage();
 fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'index.html'),html);
 return{pages:1};
}
if(require.main===module){
 const out=process.argv[2];
 if(!out)throw Error('Usage: node scripts/render-editorial-review.cjs dist/review');
 const result=writeReview(out);
 console.log('Rendered DH-10C public-metadata review portal ('+result.pages+' page, no unapproved draft copy).');
}
module.exports={makeReviewPage,writeReview};

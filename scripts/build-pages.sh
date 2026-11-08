#!/bin/sh
# Build only the public-safe DaveHub site and fictional design previews for Cloudflare Pages.
set -eu

cd "$(dirname "$0")/.."

# Vite 8 and TypeScript 7 in the pinned Unicorn Valley release need modern
# Node. Make Cloudflare failures explicit instead of deploying stale output.
node -e "const v=process.versions.node.split('.').map(Number);if(v[0]<20||(v[0]===20&&v[1]<19)){console.error('DH-09 needs Node >=20.19 (Cloudflare .node-version pins 22.23.2); current '+process.version);process.exit(1)}console.log('DaveHub game build runtime: Node '+process.version)"

for asset in \
  index.html \
  styles.css \
  main.js \
  catalogue.js \
  assets/branding/davehub-logo-faithful.svg \
  assets/homepage/floating-islands-background.png \
  assets/characters/dave/dave-static-v1.webp \
  assets/characters/dave/dave-animation-v1.webm \
  prototypes/dh-07c/index.html \
  prototypes/dh-08/index.html \
  content/public/catalogue.json \
  content/examples/fictional.json \
  assets/content/worlds.css \
  scripts/render-content.cjs \
  tests/render-content.test.cjs \
  tests/navigation.test.cjs
do
  if [ ! -s "$asset" ]; then
    printf 'Missing or empty required file: %s\n' "$asset" >&2
    exit 1
  fi
done

# A private draft must never become a deployed page through a build bypass.
# Validate both the empty/approved production manifest and fictional test fixtures.
node --test tests/content.test.cjs tests/render-content.test.cjs tests/navigation.test.cjs tests/davehub-discovery.test.cjs tests/davehub-new-repo.test.cjs tests/workshop.test.cjs tests/workshop-http.test.cjs tests/review-layout.test.cjs tests/staging-review.test.cjs tests/dh11c-complete-release.test.cjs
node -e "const {validateManifest}=require('./scripts/davehub-manifest.cjs'); const data=require('./davehub.json'); const result=validateManifest(data,'tametheboardgame/davehub');if(!result.valid)throw new Error(result.errors.join('; '));"
# Fail closed: only individually owner-approved records and links enter production.
node scripts/content-check.cjs content/public/catalogue.json
node scripts/content-check.cjs content/examples/fictional.json
# Refuse mismatched live/staging build roles and branch policies before publishing.
node scripts/dh09d-topology.cjs check

rm -rf dist
mkdir -p dist/assets/branding dist/assets/homepage dist/assets/characters/dave dist/previews/dh-07c dist/previews/dh-08 dist/previews/dh-08b dist/previews/dh-08c dist/content dist/assets/content

cp index.html styles.css main.js catalogue.js dist/
cp assets/branding/davehub-logo-faithful.svg dist/assets/branding/
cp assets/homepage/floating-islands-background.png dist/assets/homepage/
cp assets/characters/dave/dave-static-v1.webp dist/assets/characters/dave/
cp assets/characters/dave/dave-animation-v1.webm dist/assets/characters/dave/
cp prototypes/dh-07c/index.html dist/previews/dh-07c/index.html
cp prototypes/dh-08/index.html dist/previews/dh-08/index.html
cp content/examples/fictional.json dist/previews/dh-08/catalogue.json
cp content/public/catalogue.json dist/content/catalogue.json
cp assets/content/worlds.css dist/assets/content/
cp assets/content/staging-review.js dist/assets/content/
# Both live and fictional pages come from the same validated template generator.
# Never copy example items into dist/worlds or dist/creations.
node scripts/render-content.cjs content/public/catalogue.json dist '' public
node scripts/render-content.cjs content/examples/fictional.json dist/previews/dh-08b /previews/dh-08b fictional
# Publicly visible, LAYOUT-ONLY review of three existing public project names.
# It never includes unapproved editorial text, outgoing links or private drafts.
node scripts/render-review-layout.cjs dist/previews/dh-08c
# Owner-approved complete 3D Writing Room, including all later reader interactions. Other staging worlds and editorial work stay out.
node scripts/build-writing-room-release.cjs dist
# Each game is independently built from its pinned upstream commit. Static
# output is deployed under the same DaveHub origin, not embedded via iframe.
# Fail the entire build if either pinned game cannot be built and verified.
# Scope Cloudflare Pages Functions to the Stephen Martin game route ONLY.
# All other DaveHub pages, media and Unicorn Valley remain free static assets.
cat > dist/_routes.json <<'ROUTES'
{
  "version": 1,
  "include": ["/games/stephen-martin/*"],
  "exclude": []
}
ROUTES

node scripts/bundle-games.cjs build dist
node scripts/bundle-games.cjs verify dist
node --test tests/game-bundles.test.cjs tests/game-auto-sync.test.cjs tests/game-staging-verification.test.cjs tests/game-deployment-health.test.cjs tests/dh09d-topology.test.cjs

# Both assets must be copied to their own filename; never overwrite CSS with JS.
# Every generated public page must have styled HTML and explicit owner-approved content.
node - <<'NODE'
const fs=require('node:fs');
const check=(file,markers,excluded=[])=>{
 const html=fs.readFileSync(file,'utf8');
 for(const marker of markers)if(!html.includes(marker))throw Error(file+' lacks '+marker);
 for(const marker of excluded)if(html.includes(marker))throw Error(file+' unexpectedly contains '+marker);
};
check('dist/assets/content/worlds.css',['.world-tile','.work-card','.primary-launch'],['const loc = window.location']);
check('dist/assets/content/staging-review.js',["loc.hostname !== 'davehub.pages.dev'"],['.world-tile{']);
check('dist/worlds/games/index.html',[
 'data-davehub-inline="worlds"','Unicorn Valley','The Stephen Martin Project','Tame The Board Game'
],['data-davehub-inline="staging"','Nothing has landed here yet']);
for(const slug of ['unicorn-valley','stephen-martin-project','tame-the-board-game']){
 check('dist/creations/'+slug+'/index.html',['data-davehub-inline="worlds"','class="primary-launch"'],['DESIGN REVIEW ONLY']);
}
check('dist/worlds/writing/index.html',[
 'data-writing-world="true"','data-minimal-ui="true"',
 'data-dark-window-preload="true"','data-exit-door-proof="true"',
 'DH-11C.6A.2','DH-11C.6B','DH-11C.6C.1','DH-11C.6C.2',
 'DH-11C.6D.3','DH-11C.6D.4','DH-11C.6E','DH-11C.6E.1',
 'data-finished-books="true"','data-manuscript-experience="true"',
 'data-motion-first="true"','data-cabinet-archive="true"',
 'data-cabinet-tray="true"','data-discarded-ideas="true"',
 'data-uncrumple-direct="true"','published-book-dialog','manuscript-dialog',
 'workshop-dialog','archive-tray-dialog','archive-folder-dialog','discarded-dialog',
 'id="discarded-unfold"','<base href="/worlds/writing/scene/">'
],['data-scene="manuscript-hoard"','room-stage-image']);
for(const [file,markers] of [
 ['room/room.js',['revealDiscardedIdeaAfterMotion()','cabinetFolders.attach(found)','revealCabinetDrawerAfterMotion()']],
 ['room/discarded-ideas.js',["folded.addEventListener('click',smooth)",'Fictional demonstration']],
 ['room/cabinet-catalogue.js',['Published book','Fictional demonstration']],
 ['room/cabinet-tray.js',['DH11CabinetTray','onCloseDrawer']],
 ['scene/discarded-ideas.css',['body[data-uncrumple-direct="true"] .discarded-dialog[open]']],
 ['scene/cabinet-tray.css',['.archive-tray-well']],
 ['scene/book-experience.css',['.published-book-dialog']],
 ['scene/manuscript-experience.css',['.manuscript-page']]
 ])check('dist/worlds/writing/'+file,markers);
for(const model of ['furniture-source.glb','cabinet-blender-verified.glb','room-shell-blender-verified.glb']){
 const file='dist/worlds/writing/room/models/'+model;
 if(fs.statSync(file).size<2000)throw Error('Missing approved model '+file);
}
check('dist/previews/dh-08c/index.html',[
 'data-davehub-inline="worlds"','Unicorn Valley','The Stephen Martin Project'
]);
console.log('PASS three approved and styled public works, no stale preview redirect and no swapped CSS/JS assets');
NODE

# Prototype deployments remain noindex; this is not an access control.
# Production headers are indexable, but all staging/preview pages stay noindex.
# Cloudflare's CF_PAGES_BRANCH and explicit role must match a reviewed topology.
node scripts/dh09d-topology.cjs headers dist/_headers
node scripts/dh09d-topology.cjs marker dist/deployment.json

printf 'DaveHub Pages output ready in dist/\n'

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
node --test tests/content.test.cjs tests/render-content.test.cjs tests/navigation.test.cjs tests/davehub-discovery.test.cjs tests/davehub-new-repo.test.cjs tests/workshop.test.cjs tests/workshop-http.test.cjs tests/review-layout.test.cjs tests/staging-review.test.cjs
node -e "const {validateManifest}=require('./scripts/davehub-manifest.cjs'); const data=require('./davehub.json'); const result=validateManifest(data,'tametheboardgame/davehub');if(!result.valid)throw new Error(result.errors.join('; '));"
# Fail closed: only individually owner-approved records and links enter production.
node scripts/content-check.cjs content/public/catalogue.json
node scripts/content-check.cjs content/examples/fictional.json

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
node --test tests/game-bundles.test.cjs tests/game-auto-sync.test.cjs tests/game-staging-verification.test.cjs tests/game-deployment-health.test.cjs

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
check('dist/previews/dh-08c/index.html',[
 'data-davehub-inline="worlds"','Unicorn Valley','The Stephen Martin Project'
]);
console.log('PASS three approved and styled public works, no stale preview redirect and no swapped CSS/JS assets');
NODE

# Prototype deployments remain noindex; this is not an access control.
cat > dist/_headers <<'HEADERS'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff

/games/unicorn-valley/index.html
  Cache-Control: no-cache

/games/unicorn-valley/davehub-release.json
  Cache-Control: no-store

/games/unicorn-valley/assets/*
  Cache-Control: public, max-age=31536000, immutable

/games/unicorn-valley/audio/*
  Cache-Control: public, max-age=86400

/games/stephen-martin/*
  Cache-Control: no-cache
HEADERS

printf 'DaveHub Pages output ready in dist/\n'

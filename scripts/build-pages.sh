#!/bin/sh
# Build only the public-safe DaveHub site and fictional design previews for Cloudflare Pages.
set -eu

cd "$(dirname "$0")/.."

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
# Fail closed: until the owner approves the three proposals, production cannot include them.
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
cp assets/content/staging-review.js dist/assets/content/worlds.css
# Both live and fictional pages come from the same validated template generator.
# Never copy example items into dist/worlds or dist/creations.
node scripts/render-content.cjs content/public/catalogue.json dist '' public
node scripts/render-content.cjs content/examples/fictional.json dist/previews/dh-08b /previews/dh-08b fictional
# Publicly visible, LAYOUT-ONLY review of three existing public project names.
# It never includes unapproved editorial text, outgoing links or private drafts.
node scripts/render-review-layout.cjs dist/previews/dh-08c

# An external asset 404 previously left world pages completely unstyled.
# Verify the deployed HTML itself contains its CSS and the staging redirect.
node - <<'NODE'
const fs=require('node:fs');
const check=(file,markers)=>{
 const html=fs.readFileSync(file,'utf8');
 for(const marker of markers)if(!html.includes(marker))throw Error(file+' lacks '+marker);
};
check('dist/worlds/games/index.html',[
 'data-davehub-inline="worlds"','data-davehub-inline="staging"'
]);
check('dist/previews/dh-08c/index.html',[
 'data-davehub-inline="worlds"','Unicorn Valley','The Stephen Martin Project'
]);
check('dist/previews/dh-08c/worlds/games/index.html',[
 'data-davehub-inline="worlds"','DESIGN REVIEW ONLY','Tame The Board Game'
]);
console.log('PASS self-contained world-page styling and staging review navigation');
NODE

# Prototype deployments remain noindex; this is not an access control.
cat > dist/_headers <<'HEADERS'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
HEADERS

printf 'DaveHub Pages output ready in dist/\n'

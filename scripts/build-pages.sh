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
node --test tests/content.test.cjs tests/render-content.test.cjs tests/navigation.test.cjs tests/stage-game-bundle.test.cjs
node scripts/content-check.cjs content/public/catalogue.json
node scripts/content-check.cjs content/examples/fictional.json

rm -rf dist
mkdir -p dist/assets/branding dist/assets/homepage dist/assets/characters/dave dist/previews/dh-07c dist/previews/dh-08 dist/previews/dh-08b dist/content dist/assets/content

cp index.html styles.css main.js catalogue.js dist/
cp assets/branding/davehub-logo-faithful.svg dist/assets/branding/
cp assets/homepage/floating-islands-background.png dist/assets/homepage/
cp assets/characters/dave/dave-static-v1.webp dist/assets/characters/dave/
cp prototypes/dh-07c/index.html dist/previews/dh-07c/index.html
cp prototypes/dh-08/index.html dist/previews/dh-08/index.html
cp content/examples/fictional.json dist/previews/dh-08/catalogue.json
cp content/public/catalogue.json dist/content/catalogue.json
cp assets/content/worlds.css dist/assets/content/worlds.css
# Both live and fictional pages come from the same validated template generator.
# Never copy example items into dist/worlds or dist/creations.
node scripts/render-content.cjs content/public/catalogue.json dist '' public
node scripts/render-content.cjs content/examples/fictional.json dist/previews/dh-08b /previews/dh-08b fictional

# Prototype deployments remain noindex; this is not an access control.
cat > dist/_headers <<'HEADERS'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
HEADERS

printf 'DaveHub Pages output ready in dist/\n'

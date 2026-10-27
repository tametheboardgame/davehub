#!/bin/sh
# Build the public-safe DaveHub prototype for Cloudflare Pages.
# Only ship the homepage and its approved assets, not project/source documents.
set -eu

cd "$(dirname "$0")/.."

for asset in \
  index.html \
  styles.css \
  main.js \
  catalogue.js \
  assets/branding/davehub-logo-faithful.svg \
  assets/homepage/floating-islands-background.png
do
  if [ ! -s "$asset" ]; then
    printf 'Missing or empty required file: %s\n' "$asset" >&2
    exit 1
  fi
done

rm -rf dist
mkdir -p dist/assets/branding dist/assets/homepage

cp index.html styles.css main.js catalogue.js dist/
cp assets/branding/davehub-logo-faithful.svg dist/assets/branding/
cp assets/homepage/floating-islands-background.png dist/assets/homepage/

# DH-07C design-lab route. Fictional-only content, intentionally isolated from the homepage.\nif [ ! -s prototypes/dh-07c/index.html ]; then\n  printf 'Missing DH-07C prototype\\n' >&2\n  exit 1\nfi\nmkdir -p dist/previews/dh-07c\ncp prototypes/dh-07c/index.html dist/previews/dh-07c/index.html\n\n# This is an early visual prototype and should not be indexed by search engines.
cat > dist/_headers <<'HEADERS'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
HEADERS

printf 'DaveHub Pages output ready in dist/\n'

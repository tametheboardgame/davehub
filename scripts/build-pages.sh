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
  prototypes/dh-11c-cabinet/index.html \
  prototypes/dh-11c-room/index.html \
  prototypes/dh-11c-room/room.css \
  prototypes/dh-11c-room/room-plan.js \
  prototypes/dh-11c-room/room.js \
  prototypes/dh-11c-room/drawer-picking.mjs \
  tests/dh11c-drawer-picking.test.cjs \
  prototypes/dh-11c-room/room-shell-plan.js \
  prototypes/dh-11c-room/room-shell-asset.js \
  scripts/build-dh11c4e-shell-glb.cjs \
  prototypes/dh-11c-room/furniture-asset.js \
  scripts/build-dh11c4f-furniture-glb.cjs \
  scripts/validate-dh11c4f-furniture.cjs \
  scripts/render-dh11c4f-furniture.cjs \
  scripts/blender/dh11c_furniture.py \
  tests/dh11c4f-furniture.test.cjs \
  scripts/build-dh11c4e-blender-model.cjs \
  assets/worlds/writing/3d/models/room-shell-blender-verified.glb.deflate.b64 \
  scripts/validate-dh11c4e-shell.cjs \
  scripts/render-dh11c4e-room.cjs \
  scripts/blender/dh11c_room_shell.py \
  tests/dh11c4e-room-shell.test.cjs \
  prototypes/dh-11c-room/architecture.css \
  prototypes/dh-11c-room/immersive.css \
  prototypes/dh-11c-room/immersive-ui.js \
  tests/dh11c4d-immersive-viewport.test.cjs \
  assets/worlds/writing/3d/models/cabinet-blender-verified.glb.deflate.b64 \
  scripts/build-dh11c4c-blender-model.cjs \
  scripts/render-dh11c4c-architecture.cjs \
  tests/dh11c4c-room-architecture.test.cjs \
  prototypes/dh-11c-room/glb-proof.css \
  prototypes/dh-11c-room/vendor/GLTFLoader-r159.js \
  prototypes/dh-11c-room/vendor/BufferGeometryUtils-r159.js \
  scripts/build-dh11c4-cabinet-glb.cjs \
  scripts/blender/dh11c_cabinet_roundtrip.py \
  scripts/validate-dh11c4b-blender.cjs \
  tests/dh11c4b-blender.test.cjs \
  scripts/render-dh11c4-glb-proof.cjs \
  tests/dh11c4-cabinet-glb.test.cjs \
  prototypes/dh-11c-room/art-palettes.js \
  prototypes/dh-11c-room/art-lab.css \
  scripts/render-dh11c-art-lab.cjs \
  tests/dh11c-art-direction.test.cjs \
  prototypes/dh-11c-room/vendor/three-r159.module.min.js \
  prototypes/dh-11c-room/vendor/THREE-LICENSE.txt \
  tests/dh11c-room.test.cjs \
  prototypes/dh-11c-cabinet/cabinet.css \
  prototypes/dh-11c-cabinet/cabinet-math.js \
  prototypes/dh-11c-cabinet/cabinet.js \
  tests/dh11c-cabinet-geometry.test.cjs \
  content/public/catalogue.json \
  content/examples/fictional.json \
  assets/content/worlds.css \
  assets/content/dh11-worlds.css \
  assets/worlds/writing/manuscript-room-v1.avif \
  assets/worlds/writing/room.css \
  assets/worlds/writing/room.js \
  scripts/render-content.cjs \
  scripts/render-dh11-worlds.cjs \
  scripts/render-writing-scene.cjs \
  tests/render-content.test.cjs \
  tests/navigation.test.cjs \
  tests/dh11-worlds.test.cjs
do
  if [ ! -s "$asset" ]; then
    printf 'Missing or empty required file: %s\n' "$asset" >&2
    exit 1
  fi
done

# A private draft must never become a deployed page through a build bypass.
# Validate both the empty/approved production manifest and fictional test fixtures.
node --test tests/content.test.cjs tests/render-content.test.cjs tests/navigation.test.cjs tests/dh11-worlds.test.cjs tests/dh11c-cabinet-geometry.test.cjs tests/dh11c-room.test.cjs tests/dh11c-drawer-picking.test.cjs tests/dh11c-art-direction.test.cjs tests/dh11c4-cabinet-glb.test.cjs tests/dh11c4b-blender.test.cjs tests/dh11c4c-room-architecture.test.cjs tests/dh11c4d-immersive-viewport.test.cjs tests/dh11c4e-room-shell.test.cjs tests/dh11c4f-furniture.test.cjs tests/davehub-discovery.test.cjs tests/davehub-new-repo.test.cjs tests/workshop.test.cjs tests/workshop-http.test.cjs tests/review-layout.test.cjs tests/staging-review.test.cjs tests/dh10c-editorial.test.cjs tests/dh10c-hosted-http.test.cjs
node -e "const {validateManifest}=require('./scripts/davehub-manifest.cjs'); const data=require('./davehub.json'); const result=validateManifest(data,'tametheboardgame/davehub');if(!result.valid)throw new Error(result.errors.join('; '));"
# Fail closed: only individually owner-approved records and links enter production.
node scripts/content-check.cjs content/public/catalogue.json
node scripts/content-check.cjs content/examples/fictional.json
# Refuse mismatched live/staging build roles and branch policies before publishing.
node scripts/dh09d-topology.cjs check

rm -rf dist
mkdir -p dist/assets/worlds/writing dist/assets/branding dist/assets/homepage dist/assets/characters/dave dist/previews/dh-07c dist/previews/dh-08 dist/previews/dh-08b dist/previews/dh-08c dist/previews/dh-11c/cabinet dist/previews/dh-11c/room/vendor dist/previews/dh-11c/art-lab dist/previews/dh-11c/cabinet-glb dist/previews/dh-11c/architecture dist/previews/dh-11c/room-shell dist/previews/dh-11c/furniture dist/previews/dh-11c/room/models dist/content dist/assets/content

cp index.html styles.css main.js catalogue.js dist/
cp assets/branding/davehub-logo-faithful.svg dist/assets/branding/
cp assets/homepage/floating-islands-background.png dist/assets/homepage/
cp assets/characters/dave/dave-static-v1.webp dist/assets/characters/dave/
cp assets/characters/dave/dave-animation-v1.webm dist/assets/characters/dave/
cp prototypes/dh-07c/index.html dist/previews/dh-07c/index.html
cp prototypes/dh-08/index.html dist/previews/dh-08/index.html
cp prototypes/dh-11c-cabinet/index.html prototypes/dh-11c-cabinet/cabinet.css prototypes/dh-11c-cabinet/cabinet-math.js prototypes/dh-11c-cabinet/cabinet.js dist/previews/dh-11c/cabinet/
cp prototypes/dh-11c-room/index.html prototypes/dh-11c-room/room.css prototypes/dh-11c-room/room-plan.js prototypes/dh-11c-room/room.js prototypes/dh-11c-room/drawer-picking.mjs prototypes/dh-11c-room/art-palettes.js dist/previews/dh-11c/room/
cp prototypes/dh-11c-room/art-lab.css dist/previews/dh-11c/art-lab/
node scripts/render-dh11c-art-lab.cjs dist/previews/dh-11c/art-lab
cp prototypes/dh-11c-room/vendor/three-r159.module.min.js prototypes/dh-11c-room/vendor/THREE-LICENSE.txt prototypes/dh-11c-room/vendor/GLTFLoader-r159.js prototypes/dh-11c-room/vendor/BufferGeometryUtils-r159.js dist/previews/dh-11c/room/vendor/
cp prototypes/dh-11c-room/glb-proof.css dist/previews/dh-11c/cabinet-glb/
node scripts/render-dh11c4-glb-proof.cjs dist/previews/dh-11c/cabinet-glb
node scripts/build-dh11c4-cabinet-glb.cjs dist/previews/dh-11c/room/models/cabinet-prototype.glb
node scripts/build-dh11c4c-blender-model.cjs dist/previews/dh-11c/room/models/cabinet-blender-verified.glb
cp prototypes/dh-11c-room/room-shell-plan.js prototypes/dh-11c-room/room-shell-asset.js dist/previews/dh-11c/room/
node scripts/build-dh11c4e-shell-glb.cjs dist/previews/dh-11c/room/models/room-shell-source.glb
node scripts/build-dh11c4e-blender-model.cjs dist/previews/dh-11c/room/models/room-shell-blender-verified.glb
node scripts/render-dh11c4e-room.cjs dist/previews/dh-11c/room-shell
cp prototypes/dh-11c-room/furniture-asset.js dist/previews/dh-11c/room/
node scripts/build-dh11c4f-furniture-glb.cjs dist/previews/dh-11c/room/models/furniture-source.glb
node scripts/render-dh11c4f-furniture.cjs dist/previews/dh-11c/furniture
cp prototypes/dh-11c-room/architecture.css prototypes/dh-11c-room/immersive.css prototypes/dh-11c-room/immersive-ui.js prototypes/dh-11c-room/glb-proof.css dist/previews/dh-11c/furniture/
cp prototypes/dh-11c-room/architecture.css prototypes/dh-11c-room/immersive.css prototypes/dh-11c-room/immersive-ui.js dist/previews/dh-11c/architecture/
node scripts/render-dh11c4c-architecture.cjs dist/previews/dh-11c/architecture
# DH-11C.4E derives the same immersive page but lives in a sibling folder.
# Every relative stylesheet/script must be shipped in that sibling too.
cp prototypes/dh-11c-room/architecture.css prototypes/dh-11c-room/immersive.css prototypes/dh-11c-room/immersive-ui.js dist/previews/dh-11c/room-shell/
cp content/examples/fictional.json dist/previews/dh-08/catalogue.json
cp content/public/catalogue.json dist/content/catalogue.json
cp assets/content/worlds.css assets/content/dh11-worlds.css dist/assets/content/
cp assets/content/staging-review.js dist/assets/content/
cp assets/worlds/writing/manuscript-room-v1.avif dist/assets/worlds/writing/
# Both live and fictional pages come from the same validated template generator.
# Never copy example items into dist/worlds or dist/creations.
node scripts/render-content.cjs content/public/catalogue.json dist '' public
node scripts/render-content.cjs content/examples/fictional.json dist/previews/dh-08b /previews/dh-08b fictional
# Publicly visible, LAYOUT-ONLY review of three existing public project names.
# It never includes unapproved editorial text, outgoing links or private drafts.
node scripts/render-review-layout.cjs dist/previews/dh-08c
# The review desk reads public GitHub markers in the browser and writes nothing.
# Never bundle the local Content Workshop or unapproved editorial descriptions.
node scripts/render-editorial-review.cjs dist/review
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
node --test tests/game-bundles.test.cjs tests/game-auto-sync.test.cjs tests/game-staging-verification.test.cjs tests/game-deployment-health.test.cjs tests/dh09d-topology.test.cjs tests/dh09d-cutover-verification.test.cjs

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
check('dist/worlds/writing/index.html',['data-scene="manuscript-hoard"','room-stage-image','data-room-target="desk"','data-room-target="cabinet"','data-room-target="bin"','data-room-target="bookcase"','data-room-target="typewriter"','Tame The Board Game'],['The Last Lightkeeper','The Clock of Tomorrow']);
check('dist/previews/dh-08b/worlds/writing/index.html',['data-scene="manuscript-hoard"','Fictional design demonstration','The Last Lightkeeper']);
check('dist/previews/dh-11c/furniture/index.html',['DH-11C.4F','data-furniture-model-proof="true"','data-immersive-room="true"','id="furniture-model-status"']);
check('dist/previews/dh-11c/room/furniture-asset.js',['DH11FurnitureAsset','door_leaf_hinge']);
check('dist/previews/dh-11c/room-shell/index.html',['DH-11C.4E','data-shell-model-proof="true"','../room/room-shell-asset.js','id="shell-model-status"','data-immersive-room="true"']);

const path=require('node:path');
const shellDir='dist/previews/dh-11c/room-shell';
const shellHtml=fs.readFileSync(path.join(shellDir,'index.html'),'utf8');
const refs=[...shellHtml.matchAll(/(?:href|src)="(\.[^"]+\.(?:css|js))"/g)].map(match=>match[1]);
if(!refs.includes('./immersive.css')||!refs.includes('./immersive-ui.js'))throw Error('Immersive shell asset references missing');
for(const ref of refs){
 const file=path.resolve(shellDir,ref);
 if(!fs.existsSync(file))throw Error('Unpublished room-shell dependency '+ref+' ('+file+')');
}
check(path.join(shellDir,'immersive.css'),['body[data-immersive-room="true"] .canvas-frame','position:fixed;inset:0','height:100dvh']);
check(path.join(shellDir,'immersive-ui.js'),['prototype-tools','scene-nav','Escape','preventScroll']);
console.log('PASS: every room-shell CSS/JS reference has a real built asset (no fallback HTML)');
check('dist/previews/dh-11c/architecture/index.html',['DH-11C.4C','data-shell-proof="true"','data-blender-compare="true"','data-immersive-room="true"','./immersive.css','./immersive-ui.js','id="prototype-tools"','id="scene-nav"','../room/room-shell-plan.js','../cabinet-glb/']);
check('dist/previews/dh-11c/cabinet-glb/index.html',['DH-11C.4A','data-glb-proof="true"','id="glb-extension"','data-glb-snap="50"','../room/room.js']);
check('dist/previews/dh-11c/art-lab/index.html',['DH-11C.3A','data-art-lab="true"','data-palette="amber-ink"','data-palette="moonlit-archive"','data-palette="golden-storybook"','../room/room.js']);
check('dist/previews/dh-11c/room/index.html',['DH-11C.2','id="room-canvas"','room.js','room-plan.js','object-list']);
check('dist/previews/dh-11c/room/drawer-picking.mjs',['export function drawerIndexForMesh','indexByGroup','return null']);
check('dist/previews/dh-11c/room/room.js',["from './drawer-picking.mjs'",'drawerIndexForMesh(mesh,cabinetDrawers)']);
check('dist/previews/dh-11c/cabinet/index.html',['id="cabinet-model"','id="cabinet-slots"','cabinet-math.js','cabinet.js','cabinet.css']);
check('dist/previews/dh-08c/index.html',[
 'data-davehub-inline="worlds"','Unicorn Valley','The Stephen Martin Project'
]);
for(const world of ['writing','music','experiments','unfinished','memory-lane']){
 const live='dist/worlds/'+world+'/index.html';
 const demo='dist/previews/dh-08b/worlds/'+world+'/index.html';
 check(live,['dh11-world--'+world,'data-davehub-inline="worlds"'],['The Last Lightkeeper','The Clock of Tomorrow','Glass Harbour','Fictional design demonstration']);
 check(demo,['dh11-world--'+world,'Fictional design demonstration']);
}
console.log('PASS DH-11 five public-safe creative world layouts and separate fictional demos');
console.log('PASS three approved and styled public works, no stale preview redirect and no swapped CSS/JS assets');
NODE

# Prototype deployments remain noindex; this is not an access control.
# Production headers are indexable, but all staging/preview pages stay noindex.
# Cloudflare's CF_PAGES_BRANCH and explicit role must match a reviewed topology.
node scripts/dh09d-topology.cjs headers dist/_headers
node scripts/dh09d-topology.cjs marker dist/deployment.json

printf 'DaveHub Pages output ready in dist/\n'

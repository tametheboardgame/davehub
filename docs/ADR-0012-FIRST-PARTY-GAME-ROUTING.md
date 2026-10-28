# DH-09 / ADR-0012 — One game path contract, separate staging and live deployments

**Date:** 27 October 2026  
**Status:** Proposed, revised for two distinct environments on 28 October 2026. The owner wants the **exact** `davehub.pages.dev` hostname to remain a test/development site after `davehub.co.uk` launches. Design + packaging foundation only; no live game URLs, DNS or Cloudflare project settings have been changed.

## Accepted user-facing URL contract

Two **separate Cloudflare Pages projects** should serve **the same file paths** on different Git branches/builds:

| Permanent staging/testing (existing Pages project) | Public live (new Pages project once custom domain is ready) |
|---|---|
| `https://davehub.pages.dev/` | `https://davehub.co.uk/` |
| `https://davehub.pages.dev/worlds/games/` | `https://davehub.co.uk/worlds/games/` |
| `https://davehub.pages.dev/games/unicorn-valley/` | `https://davehub.co.uk/games/unicorn-valley/` |
| `https://davehub.pages.dev/games/stephen-martin/` | `https://davehub.co.uk/games/stephen-martin/` |

No external redirects, iframe wrappers or host-specific hardcoded play links. **The paths and asset layout stay identical, but the versions may differ**: staging can contain work awaiting review while live is pinned to the approved release. The two Pages projects each build/deploy their own assembled artifact; this is intentional release-environment separation, not two divergent codebases.

The previous path-specific Workers Static Assets routing proposal is **superseded for this project**: custom-domain Worker routes cannot be relied on to also control the Cloudflare-owned `davehub.pages.dev` hostname.

Cloudflare documentation: https://developers.cloudflare.com/pages/configuration/custom-domains/ and https://developers.cloudflare.com/pages/configuration/build-configuration/.

## Cloudflare deployment environments

1. **Staging (reuse existing `davehub` Pages project):** switch its production branch from `main` to a new persistent `staging` branch **at the cutover**, leaving its default hostname `davehub.pages.dev`. Before this change, keep using existing feature-branch previews; do not switch branches prematurely.
2. **Live (create second Pages project, e.g. `davehub-live`):** connect it to the *same* GitHub repository, production branch `main`, using exactly the same DaveHub build command/output directory, with `davehub.co.uk` attached as its custom domain. The live project will also have its own provider-assigned `*.pages.dev` hostname; plan canonical URLs and duplicate-content handling rather than assuming it can be removed.
3. **Release flow:** `feature/*` → isolated Cloudflare preview/CI → reviewed PR into `staging` → staging QA (all games, paths, audio, navigation) → explicit owner approval → reviewed promotion PR into `main` → live deployment verification. Branch protection should require checks and review for `main`; never auto-merge `staging` into `main` merely because the staging build passed.
4. **Partial releases:** if staging contains multiple features and only some are approved, curate a release PR with the specific approved commits/build artifacts. Do not blindly merge all staged changes.
5. **Static game bundles:** both environments use the same `/games/<slug>/` URL-prefix contract but can pin different reviewed release SHAs. A newer stage game version does not automatically replace the live version.
6. **Public preview safety:** `davehub.pages.dev` is publicly reachable by default; `noindex` is not authentication. Do not put private drafts, secrets or unapproved media on staging. Use a proper Cloudflare access-control design if the user later requires private previews; do not assume ordinary Pages preview Access settings protect the production `*.pages.dev` hostname.
7. **Before launch:** verify staging and live have distinct deployment IDs/commits, and that publishing to staging does not update the custom domain. Verify promotion, rollback, game saves, TLS, cache headers and 404 fallbacks on both hosts.

Cloudflare docs confirm that the default `project.pages.dev` address and custom domain of a **single** project track its production branch. Two projects can be connected to one Git repository, each with its own production branch: https://developers.cloudflare.com/pages/configuration/preview-deployments/ , https://developers.cloudflare.com/pages/configuration/monorepos/ , and https://developers.cloudflare.com/pages/configuration/branch-build-controls/ .

**Lower-setup alternative:** retain one Pages project, use `staging.davehub.pages.dev` (a permanent `staging` branch alias) for testing and `davehub.pages.dev` + `davehub.co.uk` for live. This is simpler, but does **not** meet the owner's preference for keeping the exact root `davehub.pages.dev` as testing.

## Publishing architecture

Keep the three source repositories independent:
- `tametheboardgame/davehub`: homepage, categories, editorial catalogue, the final **assembled** Pages static output.
- `tametheboardgame/unicorn-valley`: game code, tests, asset pipeline and its existing standalone Cloudflare Pages deployment.
- `tametheboardgame/stephen-martin-project`: completed V1 game code, 3-ending tests, provenance and its standalone deployment.

Each game generates an approved, immutable **DaveHub path-compatible release bundle** from its own repository, after passing its current CI and rights review. DaveHub's release assembly takes those bundles, verifies their versions and integrity, and lays their static contents under:

```text
dist/
  index.html
  assets/...
  worlds/...
  creations/...
  games/
    unicorn-valley/
      index.html
      assets/...
      audio/...
    stephen-martin/
      index.html
      src/...
      public/assets/...
```

The existing Cloudflare Pages project deploys that **single** `dist/` tree. Paths are domain-relative, so both `davehub.pages.dev` and future `davehub.co.uk` work identically.

A version-pinned release manifest should record each included source repository, exact **main commit SHA**, bundle version/SHA-256, complete inventory count and maximum asset size. **Never download floating `main` during public builds:** game updates should only reach DaveHub after a reviewed game-release promotion. Avoid committing privately sourced content, authentication tokens or giant generated bundles to DaveHub source history. Game build/download automation still needs a subsequent implementation phase and an explicit release-artifact mechanism.

If future games exceed Cloudflare Pages quotas, evaluate packaging/architecture again rather than silently routing different games via their old `pages.dev` URLs. Pages Free currently caps one deployed site at **20,000 files** and a **25 MiB per-file limit**. See https://developers.cloudflare.com/pages/platform/limits/.

## Necessary game changes

### Stephen Martin (first pilot, easier)

Current V1 build uses relative HTML/script/image/audio paths such as `./src/styles.css`, `./public/assets/...`; packaging its tested `dist/` under `games/stephen-martin/` is likely to work without changing core gameplay. Before release:

1. Inspect dynamic URL creation, CSS `url(...)`, the approved asset whitelist, dialogue audio and path handling.
2. Run `npm run verify`, including V1 asset audit.
3. Package `dist/` **without modifying the root build** and exercise all three endings at the nested URL, plus sound/autosave/fullscreen/responsive checks.
4. Preserve game copyright/character likeness/audio/promotional review gates. The existing game repository explicitly says owner acceptance of V1 does not automatically grant new publicity/artwork republication permission.

### Unicorn Valley (Vite subpath work)

Current `vite.config.ts` sets `base: '/'`, and `scripts/generateAudioCatalogue.mjs` produces URLs like `/audio/music/...`. Both require refactoring for deployment beneath `/games/unicorn-valley/`:

1. Add a second *explicit* Vite build with `base: '/games/unicorn-valley/'`; preserve the original `/ ` root build on `unicorn-valley.pages.dev`.
2. Ensure **all runtime public assets** (especially audio, story catalogs, images, favicons and lazy-loaded chunks) respect the selected base. Treat root-relative paths as test failures; do not rewrite minified output at runtime.
3. Run full game CI and subpath browser smoke testing, including mobile, save storage, dynamic imports and music.
4. Package the validated output under `dist/games/unicorn-valley/`. Match URLs against the actual `dist/` inventory rather than guessing.

### DaveHub navigation

The content catalogue retains editorial `/creations/unicorn-valley/` and `/creations/stephen-martin-project/` pages. Once the game routes **actually exist**, update the `Play now` links to domain-relative `/games/unicorn-valley/` and `/games/stephen-martin/`. The homepage URL and other world links remain unchanged. Add a `Back to DaveHub` control appropriate to each game's full-screen layout, without embedding them in an iframe.

## Important browser considerations

- Both games will share the **DaveHub browser origin**; namespace localStorage/IndexedDB keys by game and confirm one game cannot mistakenly read/write the other's progress.
- Progress already saved on `unicorn-valley.pages.dev` or `stephen-martin-project.pages.dev` will **not** automatically appear on `davehub.pages.dev`; provide an opt-in import/export where practical or explain that users are starting fresh.
- Progress at `davehub.pages.dev` will likewise not automatically migrate to `davehub.co.uk` because they are different browser origins, even though both host identical paths. **This is helpful** for preventing staging saves from contaminating live tests, but anyone wishing to transfer progress needs an opt-in export/import flow. Games on one host still need namespaced save keys.
- Do not copy unapproved collaborator material, musical recordings or historical archive sources to the bundled site just because source repositories are public.

## Implementation sequence

**DH-09A — Bundle/prefix contract and automated tests.** A reusable static-asset assembler in DaveHub that safely stages already-built game distributions below `/games/<slug>/`, proves links and nesting and rejects missing/malformed releases. Does not deploy the games without release bundles.

**DH-09B — Stephen Martin main build on `davehub.pages.dev/games/stephen-martin/`.** Produce a verified source-repo release bundle, pin it in DaveHub, serve on a branch preview, test all A/B/C paths, then release to `davehub.pages.dev` with an approved canonical play link. Its existing Pages site remains a fallback.

**DH-09C — Unicorn Valley dual-build compatibility.** Correct Vite/asset base configuration, pin a proven subpath release, package and test under `davehub.pages.dev/games/unicorn-valley/` while its original `unicorn-valley.pages.dev` build keeps working.

**DH-09D — Split staging and live at domain cutover.** Preserve existing `davehub.pages.dev` as the staging Pages project's production hostname; create a second Pages project connected to `main` and attach `davehub.co.uk` with verified DNS and TLS. Point staging project at `staging` after establishing a known-good baseline, then verify independent deployments and rollback. No game URL-path changes.

**DH-09E — Independent release promotion.** Source repos can offer a new verified bundle by PR/dispatch and require approval before changing the DaveHub pinned release manifest. A change in one game does not force rebuilding the other game's source; DaveHub publishes the previously approved assets for the other.

## Release gate

**No Play link may point at a DaveHub games URL until its full build is actually deployed and verified at that route.** Existing third-party play links remain until independently verified first-party paths are available. This document alone does not constitute working game hosting.

The DNS/custom-domain setup can happen much later. Build/test game paths at `davehub.pages.dev` now. When the domain is ready, **split into staging and live projects** so each hostname has the same paths but an independently controlled release. Never attach `davehub.co.uk` to the existing staging project's main/production deployment and expect a test/live separation.

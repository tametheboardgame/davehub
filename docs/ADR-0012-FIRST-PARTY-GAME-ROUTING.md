# DH-09 / ADR-0012 — One DaveHub site, game paths on both domains

**Date:** 27 October 2026  
**Status:** Proposed, revised after owner clarification: `pages.dev` paths must work **before** the custom domain is configured. Design + packaging foundation only; no live game URLs or DNS were changed.

## Accepted user-facing URL contract

One Cloudflare Pages project should serve **the same file paths** on both hostnames:

| Right now | Later, after attaching the custom domain |
|---|---|
| `https://davehub.pages.dev/` | `https://davehub.co.uk/` |
| `https://davehub.pages.dev/worlds/games/` | `https://davehub.co.uk/worlds/games/` |
| `https://davehub.pages.dev/games/unicorn-valley/` | `https://davehub.co.uk/games/unicorn-valley/` |
| `https://davehub.pages.dev/games/stephen-martin/` | `https://davehub.co.uk/games/stephen-martin/` |

No external redirects, iframe wrappers or host-specific hardcoded links. When the custom domain is attached, **no rebuilding, game-path changes or duplicate game deployments** are required. Pages continues to serve the `*.pages.dev` hostname unless the owner explicitly configures a redirect or an access restriction.

The previous path-specific Workers Static Assets routing proposal is **superseded for this project**: custom-domain Worker routes cannot be relied on to also control the Cloudflare-owned `davehub.pages.dev` hostname.

Cloudflare documentation: https://developers.cloudflare.com/pages/configuration/custom-domains/ and https://developers.cloudflare.com/pages/configuration/build-configuration/.

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
- Progress at `davehub.pages.dev` will likewise not automatically migrate to `davehub.co.uk` because custom domains are different browser origins, even though the site paths are identical. This requires a separate opt-in save-transfer plan before switching the advertised host.
- Do not copy unapproved collaborator material, musical recordings or historical archive sources to the bundled site just because source repositories are public.

## Implementation sequence

**DH-09A — Bundle/prefix contract and automated tests.** A reusable static-asset assembler in DaveHub that safely stages already-built game distributions below `/games/<slug>/`, proves links and nesting and rejects missing/malformed releases. Does not deploy the games without release bundles.

**DH-09B — Stephen Martin main build on `davehub.pages.dev/games/stephen-martin/`.** Produce a verified source-repo release bundle, pin it in DaveHub, serve on a branch preview, test all A/B/C paths, then release to `davehub.pages.dev` with an approved canonical play link. Its existing Pages site remains a fallback.

**DH-09C — Unicorn Valley dual-build compatibility.** Correct Vite/asset base configuration, pin a proven subpath release, package and test under `davehub.pages.dev/games/unicorn-valley/` while its original `unicorn-valley.pages.dev` build keeps working.

**DH-09D — Attach `davehub.co.uk`.** Add/verify Cloudflare DNS zone and TLS, connect domain to **the same** Pages project, choose a canonical host and plan save migration. No game-code or game-hosting changes.

**DH-09E — Independent release promotion.** Source repos can offer a new verified bundle by PR/dispatch and require approval before changing the DaveHub pinned release manifest. A change in one game does not force rebuilding the other game's source; DaveHub publishes the previously approved assets for the other.

## Release gate

**No Play link may point at a DaveHub games URL until its full build is actually deployed and verified at that route.** Existing third-party play links remain until independently verified first-party paths are available. This document alone does not constitute working game hosting.

The DNS/custom-domain setup can happen much later. Build and test at `davehub.pages.dev` now, and both hosts get the same paths after the domain is attached.

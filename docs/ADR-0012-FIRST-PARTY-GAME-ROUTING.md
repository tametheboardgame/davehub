# DH-09 / ADR-0012 — First-party game URLs with independently deployed repositories

**Date:** 27 October 2026  
**Status:** Proposed, pending owner agreement and domain routing access. Design only; **no DNS, game deployment, production catalogue or other repository has been changed**.

## Decision requested

All interactive creations that DaveHub can legally and technically host should run under stable **first-party paths** on `davehub.co.uk`, not navigate to separate `*.pages.dev` hostnames or depend on iframes as the final architecture.

Primary examples:

| Visitor URL | App | Development source |
|---|---|---|
| `https://davehub.co.uk/` | Illustrated DaveHub homepage | `tametheboardgame/davehub` |
| `https://davehub.co.uk/worlds/games/` | Games catalogue | `tametheboardgame/davehub` |
| `https://davehub.co.uk/creations/unicorn-valley/` | Unicorn Valley editorial page | DaveHub content manifest |
| `https://davehub.co.uk/games/unicorn-valley/` | Full Unicorn Valley gameplay | `tametheboardgame/unicorn-valley` |
| `https://davehub.co.uk/creations/stephen-martin-project/` | Stephen Martin editorial page | DaveHub content manifest |
| `https://davehub.co.uk/games/stephen-martin/` | Full Stephen Martin gameplay | `tametheboardgame/stephen-martin-project` |

The game and the page *about* the game are intentionally different, but should link to each other. Use genuine first-party static assets, not a URL-changing 301 redirect or an iframe wrapper.

## Chosen technical approach: independently deployed Cloudflare Workers Static Assets at paths

**Keep all three GitHub repositories independent**. Do not merge Phaser, audio, game scenes or test pipelines into the DaveHub homepage repository. Each game publishes a separately built **DaveHub-path-compatible static distribution** to a dedicated Cloudflare Workers Static Assets deployment. Cloudflare path-specific Worker Routes on the `davehub.co.uk` zone send only the following requests to the respective game:

- `davehub.co.uk/games/unicorn-valley/*` → Unicorn Valley static asset Worker.
- `davehub.co.uk/games/stephen-martin/*` → Stephen Martin static asset Worker.
- Everything else → the existing DaveHub Pages site on the same custom domain.

Wrangler's static-assets-on-subdirectory support requires the on-disk asset paths to reflect the URL prefix, e.g. `dist-davehub/games/unicorn-valley/index.html` and `dist-davehub/games/unicorn-valley/assets/...`. A route matches the original URL, so the asset file is served at the same first-party URL without rewriting HTML at runtime.

Reference: https://developers.cloudflare.com/workers/static-assets/routing/advanced/serving-a-subdirectory/ and https://developers.cloudflare.com/workers/configuration/routing/routes/.

**Cloudflare constraints:** Workers Free permits up to 20,000 assets per Worker version and 25 MiB per individual asset (see https://developers.cloudflare.com/workers/platform/limits/). Static asset requests are free and unlimited by platform policy when served as assets rather than invoking a Worker script (https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). Validate deployed asset inventory and largest asset before deciding each route's suitability; do not assert that a game passes by considering total bytes alone.

### What we need on Cloudflare

1. Confirm ownership and Cloudflare zone/nameserver status for `davehub.co.uk`; the existing repository documentation is **stale** and does not establish that the custom domain is configured.
2. Add the custom domain to the existing **DaveHub Pages project**, with working TLS/redirect policy (choose one of apex/www canonical).
3. Create separate Workers Static Assets projects, with appropriately scoped CI credentials, and deploy path-prefixed static distributions from each game repository.
4. Register the game path-specific routes in Cloudflare; do not route the homepage or shared `/assets/` path to either game.
5. Configure exact-path redirects `/games/unicorn-valley` → `/games/unicorn-valley/` and `/games/stephen-martin` → `/games/stephen-martin/` (or test this normalisation inside the route). The trailing slash is important for relative asset URL resolution.
6. Test HTTPS, cache headers, content-type, range/audio delivery, rollback, route priority and hostnames on desktop/mobile before exposing public links.

**Do not assume `*.pages.dev` can host custom-domain Worker Routes directly.** The eventual target is the user's controlled DNS zone; until configured, builds can be smoke-tested locally and deployed to an isolated test domain or Workers staging endpoint.

## Changes per repository

### Unicorn Valley — moderate, bounded path compatibility work

Current observed source facts (main branch, 27 October):
- `vite.config.ts` explicitly uses `base: '/'`, making generated JS, CSS and dynamic chunk URLs assume site root.
- `index.html` uses root-relative `/favicon.svg` and `/src/main.ts` in its Vite input; Vite can transform the latter for a configured base, but static public assets still need checking.
- `scripts/generateAudioCatalogue.mjs` generates paths like `/audio/music/...`; `src/generated/audioCatalogue.ts` contains those root-relative paths. This **will fail** if the game is mounted at `/games/unicorn-valley/` unchanged.
- Production remains at `https://unicorn-valley.pages.dev/` and CI has a substantial pre-existing test suite.

Actions:
1. Add a **separate** DaveHub build command selecting Vite `base: '/games/unicorn-valley/'` while preserving the existing root build for `unicorn-valley.pages.dev`.
2. Route all runtime public asset paths through a tested game-base resolver (including generated audio, image and story catalogues, favicons, lazy imports, CSS, paths that build URLs at runtime). Avoid replacing strings in minified JS at Cloudflare edge.
3. Run existing unit and browser suites, plus a subpath smoke test proving all JS/CSS/audio and progress-save functions work at the prefixed route.
4. Package `dist` beneath `dist-davehub/games/unicorn-valley/` and deploy only that isolated output with Wrangler; leave main/root Pages deployment and its release gate unchanged.

### The Stephen Martin Project — small path/build changes

Observed source facts:
- Plain HTML, CSS and JS. Most HTML script, CSS, image and scene asset paths use `./src/...` and `./public/...`, suitable for serving at the trailing-slash game directory.
- Build is `npm run build` → `dist/`; final V1 is complete with three endings, approved 254 dialogue MP3s and two opening songs. Full distribution was ~44 MB across hundreds of files, not one huge asset.
- Production Pages project follows `main`. The V1 README explicitly distinguishes **playable V1** from wider permission to republish images, recordings or likenesses.

Actions:
1. Preserve the original build and run `npm run verify` before repackaging its `dist/`.
2. Add a second deployment pipeline that nests the unchanged files beneath `dist-davehub/games/stephen-martin/`.
3. Audit for stray root-relative requests, unusual canonical URLs, CSS url(), JavaScript-generated URLs and route/hash handling.
4. Confirm all three endings and voice playback through a true first-party path, on mobile as well as desktop.
5. Keep voice/likeness rights and promotion scope separate from the technical URL migration. Use the original approved build output rather than regenerating art.

### DaveHub — small navigation/catalogue changes

- Keep editorial `/creations/<slug>/` pages as the making-of, description, screenshots/permissions, and project relationships.
- Add a canonical `play` link targeting `/games/<slug>/`, only after the relevant game route passes release QA.
- `/worlds/games/` lists playable works, and the editorial page has a clear `Play now` action and return-navigation to DaveHub.
- Optionally introduce a launch-shell / return-to-DaveHub control **outside** gameplay while preserving full-screen/focus/audio performance. Avoid imposing a global fixed header on Phaser and puzzle layouts.
- Preserve standalone `pages.dev` builds as direct testing/fallback channels; do not make their public URLs the advertised canonical destination once first-party routing is accepted.

## Browser-origin/save-data caution

Moving a game from `<game>.pages.dev` to `davehub.co.uk` **changes browser origin**. Existing localStorage/IndexedDB saves will not automatically move. Decide whether to support a one-time opt-in export/import save transfer or clearly warn of a fresh start. Future games on one origin must use distinct, namespaced storage keys and consider third-party content isolation. Do not promise that changing the address preserves progress.

## What we deliberately avoid

- **Redirect-only:** A 301 to another Pages site loses the requested DaveHub address.
- **Iframe wrapper as final solution:** Keeps the address bar but gives the actual game a separate browser origin, plus possible fullscreen/audio, focus, performance, storage and accessibility complications.
- **Central monorepo:** Forces unrelated game builds and large assets into DaveHub's own build/test/deploy lifecycle, increasing coupling and release risk.
- **HTML/JS content rewriting reverse proxy:** Brittle for hashed Vite chunks, audio catalogs and script-generated URLs; static subpath assets are more reliable.
- **Auto-merging game source to DaveHub:** Not needed. Only approved release artifacts and reviewed catalogue metadata connect them.
- **Unapproved mirrors of third-party content:** Books, music streaming and the collaborative WordPress blog need DaveHub landing pages plus official links; mirroring complete media/articles is a separate rights/export decision.

## Phased acceptance plan

**DH-09A — DNS and first-party routing readiness.** Check zone and SSL; reserve the two routes; prepare a non-production test endpoint and rollout/rollback checklist. No production traffic changes.

**DH-09B — Stephen Martin pilot.** Easiest relative-asset game; deploy nested build on a test hostname/path, verify all routes/audio/saves and only then enable first-party path. Retain original Pages production as rollback.

**DH-09C — Unicorn Valley.** Implement path-base configuration and generated-audio refactor; prove root deployment unchanged and nested build passes smoke/CI; deploy static assets and switch canonical play link.

**DH-09D — Extend the pattern.** A tiny documented template for future DaveHub-ready games, with independent build, static asset inventory, route registration, release decision, monitoring and rollback. No blanket automatic publication.

## Final design contract

**A DaveHub visitor should stay on a DaveHub URL when moving from Games → Game Page → Play.** The game repository should remain independently testable and independently deployable, and its working public root build should never be sacrificed purely to achieve a nicer URL.

Deployment and DNS changes require explicit user approval and Cloudflare account access. This proposal is not a claim that the custom domain is configured or that first-party game links already work.

# DH-09 — Same-origin playable games under DaveHub

**Status:** Implementation in PR #33, qualification required before owner testing. **This is NOT a configured live `davehub.co.uk` deployment.**

## Accepted URLs

- `https://davehub.pages.dev/games/unicorn-valley/`
- `https://davehub.pages.dev/games/stephen-martin/`

Both use DaveHub's **actual origin and URL paths**, not a browser redirect or an iframe. Project listings under `/creations/` remain the editorial introduction and now link directly into these routes. The original external game sites remain usable from the "More links" section and are not changed.

## Two deliberately different deployment mechanisms

### Unicorn Valley — pinned, independent static bundle

This repo is public. Each DaveHub build fetches the **exact SHA** in `config/game-releases.json` using a disposable shallow Git checkout. It runs the source repository's generated audio/story catalogues, rebases root-absolute Vite public asset references for `/games/unicorn-valley/`, type-checks, and builds via Vite with `--base=/games/unicorn-valley/`. The resulting static `dist` files are copied into DaveHub's own `dist/games/unicorn-valley/` directory.

A failed fetch, changed SHA, missing referenced asset, wrong base path, oversized file or broken TypeScript build **fails the DaveHub deployment**. There is no silent fallback to an unverified game release. Pinned promotion is an explicit manifest review/update, never a rolling source-main copy.

### The Stephen Martin Project — narrowly scoped public-site reverse proxy

**The GitHub source repository is private.** It must stay private, and no Git token/source checkout or private content is baked into DaveHub.

The existing game at `https://stephen-martin-project.pages.dev/` is already publicly playable. DaveHub's **Cloudflare Pages Function** for `/games/stephen-martin/*` forwards GET/HEAD requests only to this exact HTTPS host, streaming the already-public static build at paths such as `src/game.js`, `src/styles.css`, `public/assets/generated/...` and `public/assets/audio/...`. No third-party client-side redirect or iframe. Arbitrary origins, URL path traversal, unsupported verbs, cookies and authorization forwarding are blocked.

The Pages `_routes.json` **includes only `/games/stephen-martin/*`**, so the rest of DaveHub and Unicorn Valley remain ordinary static Pages requests without Function invocation costs.

**Trade-off:** This Stephen Martin route depends on the upstream site's availability and may pick up its new public game releases without a DaveHub release PR. It is *not an immutable independently hosted copy*. Later, if wanted, the private repository can create a separately approved, checksummed public distribution package for truly independent bundled hosting. Never change repository visibility or add a Cloudflare token to accomplish that.

## Save-data boundary (critical)

Browser localStorage is **origin-scoped**. The original standalone URLs and `davehub.pages.dev` are different origins, even when running the same gameplay code. The new game URLs therefore start with a **separate save slot**. They **do not delete or overwrite existing standalone saves**, but they also **do not automatically import them**.

Before changing the standalone game links or decommissioning any original Pages project, provide a tested export/import or origin-to-origin migration workflow. Save migration must be opt-in and avoid overwriting newer data or replaying stale checkpoints. A future `davehub.co.uk` live domain will be another separate save origin, not a magical continuation of `davehub.pages.dev`. Game updates must continue to respect each save-schema migration and future-version protection. Do not tell the user that saves transfer until this is explicitly implemented and tested.

## Acceptance and rollback

1. PR source-lock, URL rebase, proxy security, website routing and full static build tests pass.
2. Cloudflare Pages successfully deploys the new build with the Pages Function. The remote smoke checks both URLs, supporting JS/CSS/image/audio assets, and verifies HTTP 200 and expected content-types.
3. Owner uses browser to test **Unicorn Valley**: load, create/continue a new unicorn on the DaveHub origin, explore, enter a minigame, save and reload; confirm existing save on the original standalone game stays untouched. Test mobile viewport and sound.
4. Owner tests **Stephen Martin**: menu art, sound, choices, the three endings and mini-games, reload/continue, and both desktop/mobile viewports; ensure audio/image paths still use DaveHub.
5. No public source code from the private repo is committed, no upstream game repo is modified, and the historic `/creations/` pages stay available.
6. If verification fails, revert the DH-09 PR (and if necessary the Pages Function) while leaving original standalone URLs and game saves intact.

This phase does **not** configure `davehub.co.uk`. The separate Pages staging/live architecture from [ADR-0012](ADR-0012-FIRST-PARTY-GAME-ROUTING.md) remains locked. Until the two-project split is configured, the existing `davehub.pages.dev` is the owner test environment.

## Version update procedure

Only update Unicorn Valley by explicitly replacing the pinned SHA after upstream game CI and QA pass. The Stephen Martin route tracks the already-public origin while its private source remains inaccessible to DaveHub builds; availability and functional tests should continue to monitor the origin. Never clone private repositories with unreviewed personal access tokens or publish their sources.

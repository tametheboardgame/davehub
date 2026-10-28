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

## Automatic staging updates (DH-09E)

The owner explicitly approved automatic game updates to the test environment on 28 October 2026. The new [hourly GitHub Actions workflow](../.github/workflows/davehub-game-auto-sync.yml) reads the latest public Unicorn Valley `main` SHA and the latest **successful `CI` push workflow for that exact SHA**. A PR-only success, a failed or pending main run, an older passing SHA or a GitHub API error cannot promote the candidate.

The workflow also runs once when its own implementation is merged into `main`. The existing legacy Unicorn Valley pin receives a **one-time exact-head qualified redeploy canary**, converting its version marker to the successful upstream CI run number. Subsequent hourly checks for the same qualified version become no-ops. This tests real GitHub-bot → Cloudflare delivery without changing any upstream gameplay source.

If a new commit qualifies, the workflow updates only `config/game-releases.json` in its checkout, independently builds both game routes and the full DaveHub site, checks all tests, then revalidates upstream main and the exact CI run. Only then does its bot commit and push the vetted source SHA to the branch currently used by DaveHub staging (`main`). It confirms the release with `/games/unicorn-valley/davehub-release.json`, containing the **deployed upstream SHA**, and separately validates the game JS/CSS/audio and both site launch links. Failed builds never change the pinned release. Remote deployment failures are visible as failed Actions runs; they are **not** mistaken for successful releases.

**Important:** GitHub Actions-created commits using the built-in `GITHUB_TOKEN` do not normally trigger other GitHub `push` workflows. This updater **does not depend on that happening**: it runs its own full build before committing and its own Cloudflare HTTP verification after committing. Cloudflare Git integration must still actually deploy the bot commit; if that integration does not, the release-verification job fails rather than claiming success. Check deployment settings before investigating code regressions.

**Current staging constraint:** `davehub.pages.dev` is connected to the `main` branch **only until** the two-project staging/live split. `config/game-auto-sync-policy.json` explicitly forbids continuing automation once the production domain is configured. During the DH-09D cutover, change Cloudflare staging to the dedicated `staging` branch, update the updater's branch and policy gate, and leave `main` as the separately owner-promoted live branch. **Never auto-promote a game update onto `davehub.co.uk`.** No Cloudflare account token or new GitHub credential is needed for this hourly poll; the workflow uses GitHub's repository-scoped token.

Stephen Martin **already tracks new publicly deployed game files automatically** through the fixed-origin Cloudflare Pages proxy. It does not need a DaveHub rebuild, and the private source repository stays private. This does *not* guarantee that an unfinished or broken upstream deployment will be rolled back. A future pinned public release artifact can replace the proxy if fully independent staged versions are required.

For diagnosing updates, use GitHub Actions → **DaveHub staging game auto-sync**. An unchanged or blocked run makes no commits and does not rebuild 89 MB of assets, but still verifies that Cloudflare serves the exact pinned SHA and release version. This health check also runs for the initial workflow push activation, not only on an hourly schedule. `workflow_dispatch` includes a one-time `force_redeploy` option for qualifying and testing the **current** upstream SHA, with no gameplay source changes. If the workflow cannot push due to branch protection, it fails visibly; do not bypass branch rules or add personal access tokens.

## Version update procedure

Only update Unicorn Valley by explicitly replacing the pinned SHA after upstream game CI and QA pass. The Stephen Martin route tracks the already-public origin while its private source remains inaccessible to DaveHub builds; availability and functional tests should continue to monitor the origin. Never clone private repositories with unreviewed personal access tokens or publish their sources.

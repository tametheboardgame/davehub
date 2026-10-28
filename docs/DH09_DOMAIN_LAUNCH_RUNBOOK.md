# DH-09D — DaveHub domain launch and permanent staging runbook

**Recorded:** 28 October 2026  
**Decision:** Approved architectural requirement, **not implemented**.  
**Owner's requirement:** Keep **`https://davehub.pages.dev/` as the permanent test/staging website**, even after **`https://davehub.co.uk/` becomes the public website**. Every site/game path works on both domains. Staging changes must **not** go live automatically.

> **Do not configure the custom domain on the existing `davehub` Pages project.** A custom domain attached to that project's production deployment would serve the same version as `davehub.pages.dev` and defeat our staging/live separation.

## Locked target architecture

| | Staging / testing | Production / public |
|---|---|---|
| **Public hostname** | `davehub.pages.dev` | `davehub.co.uk` |
| **Cloudflare Pages project** | Existing `davehub` project | **New**, separately created (suggested name `davehub-live`) |
| **GitHub source repository** | `tametheboardgame/davehub` | **Same** repository |
| **Pages production branch** | Persistent `staging` branch (switch at cutover) | `main` |
| **Build command** | `sh scripts/build-pages.sh` | `sh scripts/build-pages.sh` |
| **Output directory** | `dist` | `dist` |
| **Game paths** | `/games/stephen-martin/`, `/games/unicorn-valley/` | **Exactly the same paths** |
| **Release version** | Candidate version for owner to test | Last explicitly approved version |
| **Approval gate** | PR review, checks and staging testing | Explicit owner approval + reviewed release PR into `main` |

**Why two projects?** A single Cloudflare Pages project's `*.pages.dev` production hostname and its custom domain normally share its production deployment. We need two genuinely different deployed versions, but the same URL paths.

DaveHub's website and each game remain **independent source repositories**. The DaveHub Pages build assembles **approved, version-pinned static game distributions** under `dist/games/<slug>/`; it does **not** merge the game source repositories or serve an iframe. See [ADR-0012](ADR-0012-FIRST-PARTY-GAME-ROUTING.md) (draft on PR #22 until merged).

## Release workflow (every time)

1. Develop a DaveHub feature, content item or game in its own source repository/feature branch.
2. Build and test it in an isolated PR/branch preview; only reviewed public-safe materials may be deployed.
3. Propose the intended DaveHub release and **pin** the exact game artifact versions/checksums. Release assembly must not pull a floating game `main` at deploy time.
4. Merge reviewed work into DaveHub's `staging` branch and inspect **`https://davehub.pages.dev/`** end to end, including games, audio, navigation and mobile.
5. User explicitly approves the release; open/review a promotion PR into **`main`**. Do **not** automatically merge all of staging if other unapproved experiments are present.
6. New `main` commit deploys only to the **live Pages project** at `davehub.co.uk`. Verify exact deployed SHA, homepage, world and game paths, game saves, media, responsive layouts and 404s.
7. Rollback by redeploying the previous approved live build/commit without disturbing the staging site.

**Never treat passing tests alone as permission to publish.** Also keep the existing publication/rights checks for collaborative writing, games, artwork, voices and music.

## At domain-configuration time: operator checklist

### Phase A — prerequisites (no DNS changes yet)

- [ ] Confirm that `davehub.co.uk` is owned/renewed and determine who controls DNS and registrar settings.
- [ ] Confirm the Cloudflare zone and whether its nameservers are already active; don't guess this from the presence of a `pages.dev` deployment.
- [ ] Confirm existing `davehub.pages.dev` serves the approved staging-ready homepage and both tested `/games/*` paths.
- [ ] Check current Cloudflare Pages project name, source repo and build configuration in the Cloudflare dashboard (not just stale repository setup docs).
- [ ] Protect release branch `main` with required checks and review. Prepare the persistent `staging` branch from the correct current known-good commit.
- [ ] Decide whether staging must be access-restricted. **`pages.dev` is publicly accessible unless protected**; `noindex` is not security.

### Phase B — create live deployment

- [ ] In Cloudflare **Workers & Pages**, create a **second Pages application** connected to the same GitHub repo `tametheboardgame/davehub`. Name may differ from `davehub-live`.
- [ ] Configure its production branch as **`main`**, build command `sh scripts/build-pages.sh`, output directory `dist`, and matching approved build/environment settings.
- [ ] Verify the new project's provisional `*.pages.dev` host, that its deployment is successful, and that its generated game bundles and editorial pages match the approved `main` commit.
- [ ] On the **new live Pages project only**, configure **`davehub.co.uk`** as a custom domain. Follow Cloudflare's actual DNS verification instructions and wait for verified TLS. Decide `www` canonical/redirect behaviour.
- [ ] Verify live HTTPS, paths, 404/cache headers, game audio, and browser/mobile playability on `davehub.co.uk`.

### Phase C — preserve exact `davehub.pages.dev` as staging

- [ ] Change the **existing `davehub` Pages project's production branch** from `main` to `staging`; do not attach the public custom domain to it.
- [ ] Trigger/verify a `staging` deployment and confirm the exact `davehub.pages.dev` hostname still resolves.
- [ ] Introduce a **clearly visible staging-only marker** if helpful; don't accidentally deploy that marker on live.
- [ ] Make one harmless staging-only test change; confirm `davehub.pages.dev` changes but **`davehub.co.uk` remains on its approved build**.
- [ ] Promote a tested change through the reviewed release PR, and confirm only then does `davehub.co.uk` change.
- [ ] Record Cloudflare project IDs, deployment commit IDs, rollback instructions and chosen domain canonicalisation here **after verified configuration**. Do not commit Cloudflare credentials, DNS-account details or API tokens.

### Phase D — full regression and release sign-off

- [ ] Both hosts: `/`, `/worlds/`, `/worlds/games/`, `/creations/<slug>/`, `/games/stephen-martin/`, `/games/unicorn-valley/`.
- [ ] Stephen Martin: all three endings, puzzles, dialogue audio, mobile/desktop presentation and return to DaveHub.
- [ ] Unicorn Valley: Phaser startup, dynamic chunks, generated audio paths, save/load, touch controls, mobile/desktop gameplay.
- [ ] Each origin uses namespaced game storage. No game writes another game's saved data.
- [ ] Saved games from standalone `*.pages.dev` hosts **do not transfer automatically** to `davehub.pages.dev`. Saves on `davehub.pages.dev` also **do not transfer automatically** to `davehub.co.uk`. If continuity matters, explicitly implement and test opt-in save export/import.
- [ ] Staging URLs remain available for future previews; staging changes do not alter the live domain; rollback of live does not overwrite staging.
- [ ] Public content rights/attribution gates remain in force on both builds. Do not use staging to expose private drafts.
- [ ] Owner approves go-live only after this checklist passes.

## Current state and do-not-do rules

As at **28 October 2026**, the user has **not configured `davehub.co.uk`**. The existing `davehub.pages.dev` project is still the development site, using the current GitHub integration. **Do not switch its production branch to `staging` yet**, or create/attach the live project as part of a routine feature PR. The game packaging and site routes are being developed separately under DH-09.

No domain, DNS, production branch, Cloudflare project or live URL has been changed by creating this document.

## Pointers for future work

- Design and game bundling: [DH-09 ADR-0012 (draft in PR #22)](https://github.com/tametheboardgame/davehub/blob/design/dh-09-first-party-game-routing/docs/ADR-0012-FIRST-PARTY-GAME-ROUTING.md), [draft PR #22](https://github.com/tametheboardgame/davehub/pull/22).
- Content publication controls: [DH-08 publication contract](DH08_PUBLICATION_CONTRACT.md).
- Current Cloudflare Pages setup: [Cloudflare guide](CLOUDFLARE_PAGES.md) — this older guide describes the single-project *pre-launch* state, and must not override this runbook's **two-project** production decision.
- Cloudflare references: [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Branch build controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/), [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

**The key invariant:** **`davehub.pages.dev` = staging; `davehub.co.uk` = live.** Same paths, independent releases, explicit human promotion.

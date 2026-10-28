# DH-09D — Safe two-project staging/live cutover execution

**Phase A started 28 October 2026.** This file is the operational sequence. The existing website remains on `davehub.pages.dev`; `davehub.co.uk` is **not** connected to a Cloudflare Pages project. Do not use the existing Pages project for the custom domain.

## Verified groundwork

- GitHub repository: `tametheboardgame/davehub`.
- Permanent `staging` branch created from the known-good `main` site; changes to either branch are independently traceable.
- Existing Pages project `davehub` still treats `main` as its production branch until Cloudflare settings are explicitly changed.
- Two game routes stay identical on both domains: `/games/unicorn-valley/` and `/games/stephen-martin/`.
- The immutable Unicorn release lock remains `main-ci-40093204337` at source `473506e...`; the Stephen game still uses the scoped public-origin proxy.
- GitHub automation now obtains its *write* branch from `config/deployment-topology.json` and the matching game policy. It is never allowed to silently update a live `main` branch after the split.
- Cloudflare's documented `CF_PAGES_BRANCH` and `CF_PAGES_COMMIT_SHA` variables plus explicit `DAVEHUB_DEPLOY_ROLE` allow fail-closed build context checks.
- The site exposes `/deployment.json`, with `environment`, `branch`, `commit`, and transition `phase`. It contains no secrets and is no-store.
- Before live launch, the staging site remains `noindex`; after a verified live activation, only the production site's normal pages may be indexed. Design previews on production stay `noindex`.

## Phase A — repository preparation (safe to implement now)

1. Create `staging` from the known-good `main` release. **Done.**
2. Validate the policy-aware updater, deploy-role guard, exact-SHA marker, staging smoke routing and regression tests in a PR.
3. Merge that *pre-cutover* infrastructure to `main` using the `[CF-Pages-Skip]` prefix, so no unneeded 89 MB Pages rebuild is queued.
4. Fast-forward `staging` to the same vetted pre-cutover commit. **Do not change any Pages production branch or domain as part of this step.**
5. Confirm the GitHub-created `staging` ref exists and that current game source pins are identical.

**Exit:** two branches exist; actual Cloudflare configuration and game update behaviour have not changed. This is the current implementation boundary.

### Cutover hold is enabled

The default-branch GitHub updater reads `automaticGameUpdates.paused=true` from the validated deployment topology and **does not check or push a game pin** while Phase B is being prepared. Leave this hold enabled until the existing Pages project successfully builds from `staging`, and the main-branch orchestrator has switched to targeting `staging`. The old game remains playable during this hold. This prevents a scheduled updater from writing to `main` while `main` is being reserved for the future live project.

**Stage-branch activation PR:** The GitHub `staging` branch now has a separately reviewed activation candidate with `phase=staging_cutover`, the active branch `staging`, and a policy-locked `DAVEHUB_DEPLOY_ROLE=staging` build. It must be merged to `staging` **before** the corresponding Cloudflare Pages production-branch switch. The default `main` GitHub updater remains frozen until the staging deployment is verified; no site changes are made by merely preparing or merging this PR while Cloudflare still uses `main`.

## Phase B — move the existing Cloudflare site to staging

This step involves account-level Cloudflare changes, so it is a separate, explicitly checked handoff. It must be completed before creating/activating the live site.

1. Record `main` and `staging` SHAs and verify the known-good `davehub.pages.dev` routes before any switch.
2. Prepare a reviewed staging-branch commit changing **both** policies: `config/deployment-topology.json` to `phase=staging_cutover`, `staging.branch=staging`, `automaticGameUpdates.branch=staging`; and `config/game-auto-sync-policy.json` to `stagingBranch=staging`, `liveDomainConfigured=false`. Do not merge unrelated unpublished work.
3. Prepare the matching main-branch change so its default-branch scheduled GitHub updater *reads* the new target `staging`. After this transition the bot must not write `main`, even before the public site exists.
4. Cloudflare **Workers & Pages → existing `davehub` project → Settings → Builds → Branch control**: switch the **production branch** to `staging`. In **Production environment variables**, set `DAVEHUB_DEPLOY_ROLE=staging`; leave this variable unset on preview deployments. Keep the existing build command `sh scripts/build-pages.sh`, output `dist`, Node `.node-version`.
5. Restrict automatic preview builds to explicitly needed branches (or disable them). No production-domain custom domain on the staging project. Trigger a staging deployment and wait for a clean build.
6. Verify `https://davehub.pages.dev/deployment.json` reports `environment=staging`, `branch=staging`, and the expected SHA. Check `/worlds/games/`, both `/games/` routes, images/audio, source-version marker, title screens, save/reload and mobile.
7. Make a harmless, reviewed staging-only change. Ensure it appears on `davehub.pages.dev` but that no production site has been created/updated.

If the branch is changed before the policy is ready, the build is intentionally blocked. Recover by returning the existing Pages production branch to `main`, removing the new deployment-role variable, and restoring the previous known-good deployment. Do not bypass the role check.

## Phase C — create an independent production Pages project

**Do not do this without explicit owner approval for public go-live.**

1. Confirm `davehub.co.uk` registration, registrar/DNS access and the Cloudflare zone's authoritative nameservers. No guessing or committing DNS credentials.
2. Create a reviewed `main` release PR that changes only the production-side topology to `phase=live`, `production.configured=true`, with its auto-sync policy `liveDomainConfigured=true` and **`stagingBranch=staging`** unchanged. Base the PR on `main`; **never merge the whole staging branch** because that could unintentionally release experimental changes or undo the live role.
3. In Cloudflare **Workers & Pages**, create another Git-connected Pages project from the same repo, e.g. `davehub-live`. Set **production branch `main`**, build command `sh scripts/build-pages.sh`, output directory `dist`, and **production-only** environment variable `DAVEHUB_DEPLOY_ROLE=production`. Preserve Node 22.23.2.
4. Before adding a domain, verify the new Pages project's provisional hostname, `/deployment.json` reports `production` + `main` + exact approved SHA, and all gameplay/asset routes work. Neither site should silently point at a different SHA.
5. Attach `davehub.co.uk` **only to `davehub-live`**, following Cloudflare's custom-domain/DNS/TLS verification. Choose whether `www` redirects to the apex.
6. Verify `https://davehub.co.uk/deployment.json` and compare with staging. Assert different project/environment/branch but identical route structures. Test desktop/mobile, games, audio, saves, noindex rules and HTTPS. Saves are origin-scoped and do not automatically move across hostnames.
7. Enable a GitHub `main` branch ruleset or protection rule requiring approval, appropriate checks, no bot bypass and a reviewed promotion PR. GitHub's existing `staging` bot must have no ability to publish to `main`.

Rollback live via a previous approved live `main` deployment; staging stays unchanged.

## Phase D — ongoing operation

- Game source `main` passes upstream CI → GitHub default-branch scheduler checks → builds/test on a checkout of the policy-selected **`staging`** branch → atomically pushes only `staging` → checks live staging URL and game asset/version.
- DaveHub feature work and creative-content publication proposals are reviewed on staging. Only owner-approved, selectively cherry-picked changes are placed on a release branch based on current production `main`, reviewed via PR and promoted.
- Private project content, drafts, rights/credits and contributor media stay behind explicit editorial gates.
- `davehub.pages.dev` never changes its hostname or purpose; `davehub.co.uk` never tracks unapproved staging commits.
- The Stephen Martin proxy is *not* an independently pinned game bundle, so a change to the upstream public game can still appear without a DaveHub build. Independent private-repo publishing remains a later work package.
- Cloudflare Pages 25 MiB-per-file and build constraints, build minutes, node-version pin, functionality and origin-scoped saves must be retested as part of any release affecting bundled games.

## What still requires external access

The GitHub integration can create branches, PRs and safeguards, but does not grant access to Cloudflare account **Workers & Pages settings**, the registrar or DNS. These Cloudflare operations must be done through an authorised Cloudflare connection or in the Cloudflare dashboard. The owner will be given the exact click path and QA URL when Phase B is ready. Do not ask them to run the application locally.

Cloudflare documentation:
- https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- https://developers.cloudflare.com/pages/configuration/branch-build-controls/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/

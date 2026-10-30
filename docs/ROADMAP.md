# DaveHub development roadmap

**Updated:** 27 October 2026. **Current stage:** DH-07 design locked/merged, DH-08A publication foundation merged into main, DH-08B shared world/creation page renderer complete on a review branch.

## Design baseline

- Three reference images are **locked**, with **Concept 1 as the owner's favourite and lead**.
- Concept 2 informs category portals; Concept 3 informs the observatory and interactive controls.
- The approved DaveHub logo is locked as an unchanged transparent PNG under `assets/branding/`; the exact-appearance SVG wrapper is approved. The distorted vector trace is discarded; no separate vector redraw is currently required.
- The text-free floating-islands homepage background is separately approved in `assets/homepage/` as PNG plus exact-appearance SVG wrapper; it is not genuine vector art.
- The main site is navigated through clickable destinations / scene transitions, **not** a walking avatar.
- A prominent **"I want to view this as a menu coz I'm boring"** link opens a deliberately basic **1990s-style HTML interface**.
- Both views share one approved project catalogue, stable routes and deep links.
- See [reference gallery](LOCKED_CONCEPTS.md), [visual direction](VISUAL_DIRECTION.md) and [retro menu brief](BORING_MENU.md).

| Work package | Deliverable | Exit criteria | Status |
|---|---|---|---|
| DH-00A–C | Original project foundation | Brief, repo, safety constraints and roadmap | Complete |
| DH-01L | Lock initial three design references | Original images in GitHub and Google Drive; decision notes updated | Complete |
| DH-01M | Lock primary DaveHub wordmark | Approved transparent PNG and ADR in GitHub; backup in Google Drive | Complete |
| DH-01N | Lock floating-islands homepage background | Approved original PNG, faithful SVG wrapper, Drive backup and usage rules | Complete |
| DH-01A | Refine Concept 1 homepage | Floating destination world and real HTML/CSS interactions built; illustrated Dave remains next | First-look complete; hosted review next |
| DH-01B | Refine category portals | Concept 2-derived destinations and clear navigation | Planned |
| DH-01C | Refine observatory details | Concept 3-derived interfaces, index integration and discoverable interactions | Planned |
| DH-01D | Basic HTML menu-mode design | Literal 1990s HTML appearance and functional accessible navigation | Planned |
| DH-02A | Click-to-explore homepage prototype | Initial Explore and category interactions work; illustrated Dave and real approved project destinations still pending | Partial; hosting setup next |
| DH-02B | Retro HTML-mode prototype | Basic HTML navigation; switch both ways; shared content | Not started |
| DH-02C | Responsive/navigation test | Full-viewport scene and bottom navigation visible across desktop, laptop, mobile and compact landscape; interaction regression tested | Implemented in review |
| DH-03A | Production shell | Host-flexible build and performant shared content model | Not started |
| DH-03B | Content and editorial system | Project catalogue, devlogs, search, deep links, archive | Not started |
| DH-04A | First public-safe projects | At least three approved projects showcased or linked | **Complete — three approved text/link listings published; Cloudflare verified 28 Oct 2026 15:14 UTC** |
| DH-05A | Human-reviewed content drafts | Safe workflow for proposed updates | Not started |
| DH-05B | Deployment and launch | Cloudflare Pages used for previews; public domain/DNS, TLS and monitoring still pending | Preview reported live; launch pending |
| DH-06A | Giant Dave key poses and motion personality | Four coherent poses approved by owner on 22 October 2026; visual baseline locked | **Complete** |
| DH-06B | Giant Dave motion investigations | Local sprite/optical-flow and joint-versus-magic studies documented in draft PR #9; natural articulation selected over everyday morphing | Studies performed; prototype evidence remains draft |
| DH-06C1 | Giant Dave production layered art + rig | [Exact asset inventory and rig contract](GIANT_DAVE_LAYERED_RIG_SPEC.md) committed: source masters, 29 P0 image layers/variants, pivots, anatomy, animation states and test gates | **Spec complete; painted assets next** |
| DH-06C | Giant Dave homepage integration | Independent character layer; responsive crop, static fallback, reduced-motion, no lost navigation | Planned |
| DH-07 | Content inventory and information architecture | Typed catalogue, cross-category views, stories, timelines, media and source/rights inventory agreed | **In progress** |
| DH-07A | External published works and creative-history inventory | First nine nominated candidates staged privately; safe generic architecture notes committed; more historic work to come | **Discovery started; candidate publication approval pending** |
| DH-07B | Unfinished Shelf and musical pages | Composite musical record/child artifacts and deliberately shelved writing/project archive; templates specified | **Architecture drafted; visual prototype next** |
| DH-07C | Responsive page and navigation prototypes | Working fictional Unfinished Shelf (search/filter/detail) and composite musical (story/song/script links); desktop/mobile browser tests | **Built on review branch; visual approval pending** |
| DH-07D | Cross-world discovery navigation | Keep the four floating-island destination links, **remove duplicate bottom menu**, expand Explore into worlds plus Music, Unfinished and Memory Lane, with functional prototype routes | **Revised on review branch; final browser/visual approval pending** |
| DH-07E | Interim Giant Dave and mystical Explore | Place one transparent static Dave in animation slot; make Explore a luminous portal using approved background art | **Built on preview branch; visual approval pending** |
| DH-08A | Safe public catalogue and approval validation | Plain JSON canonical work model, fail-closed approval/rights checks, tests, fictional preview; zero owner works published | **Implemented on draft branch, testing/sign-off pending** |
| DH-08D | First owner-approved public creations | Publish Unicorn Valley, Stephen Martin and Tame The Board Game in the canonical catalogue and normal worlds; Play/Visit links to existing sites; no media republishing | **Merged PR #32 (`fe8872a`); 88 site tests + 11 scanner checks passed; all three external URLs HTTP 200; eight live Cloudflare routes verified at 15:14 UTC** |
| DH-08C6 | Restore styled staging review pages and verify real Cloudflare HTTP | World/creation HTML embeds first-party CSS; empty staging worlds embed review navigation; GitHub Actions probes the actual Cloudflare endpoint | **Merged PR #31 (`95bd1b2`); 88 site tests pass; real Cloudflare HTTP smoke #40711727210 passed at 15:03 UTC after six stale checks; styled live HTML, staging routing and review cards verified; owner visual check pending** |
| DH-08C5 | Staging review navigation integration | Normal staging `/worlds/` routes link to three design-only project previews when canonical catalogue empty; non-staging and future live are unchanged | **Merged PR #30 (`b0b3040`); 88 site tests and 11 discovery tests pass; owner Cloudflare visual verification pending** |
| DH-08C4 | Cloudflare-first visual review | Twelve static layout-only preview pages under `/previews/dh-08c/`; three public project names only, placeholder copy, no draft links/media; browser QA on staging | **Merged PR #29 (`3c92061`); GitHub CI 83 site tests + 11 scanner tests passed, 12 pages rendered with no unapproved copy; Cloudflare HTTP confirmation and owner visual review pending** |
| DH-08C | Owner-controlled first-wave Content Workshop | Seed three review-only creative records; import DH-10 candidates; preview actual site templates locally; preserve empty deployed catalogue until owner approval | **Review work completed; three entries subsequently explicitly approved and published in DH-08D. Workshop remains optional for future candidates** |
| DH-08B | Render approved catalogue into actual site | Seven themed world pages, shared musical/detail templates and direct homepage/island navigation; first-wave approved catalogue now populated | **Shared page renderer live with owner-approved first-wave creations; verified in DH-08D deployment** |
| DH-08 | DaveHub Ready publication contract | Explicit approved project onboarding, source collection, draft review, provenance, withdrawal and security gates | Planned after DH-07 |
| DH-09 | Single-project ingestion pilot | One approved creative game becomes a project page + reviewed update through preview/merge | Planned |
| DH-09A/B | Same-origin first game routes | Pinned compiled Unicorn Valley build and restricted Stephen Martin public-origin proxy under identical `/games/...` paths; save isolation and Cloudflare HTTP gates | **PR #33 merged (`2f4e795`), Node/CI fix PR #34 merged (`f57be85`); live Cloudflare HTTP smoke #40719683462 passed 15:48 GMT for both games plus JS/CSS/audio/image; gameplay/save QA still pending** |
| DH-09A–C | First-party games | Independently built game releases staged as `/games/<slug>/` under the DaveHub Pages output; real game deployment/QA still required | Design and packaging foundation on draft PR #22 |
| DH-09E | Automatic game updates to staging only | Hourly exact-head Unicorn Valley CI check; full pinned build, SHA marker, Cloudflare HTTP gate; Stephen public-origin proxy follows upstream deploys; never auto-promote custom-domain live | **COMPLETE on staging — PRs #35–#43 merged; GitHub bot rebuilt and advanced release `main-ci-40093204337`; Cloudflare exact SHA/version and both games verified in #40728639308; no-op health check passed #40729189306. Live-domain promotion remains disabled.** |
| DH-09D | Production-domain cutover, permanent staging | Preserve `davehub.pages.dev` for testing; separate live Pages project on `main` serves `davehub.co.uk`, with explicit owner-led promotions | **Phase A complete; Phase B activation staged. Default-main auto-updater frozen by PR #45 while `staging` prepares an independent Pages production-branch candidate. Existing Cloudflare Pages still points to `main`; no custom domain connected.** |
| DH-10A | DaveHub Ready repository manifests | Root `davehub.json`, validated metadata, categories and opt-in/opt-out semantics | **Merged to main; three source opt-ins merged, Unicorn Valley #338 awaiting final CI** |
| DH-10B | Read-only repository discovery | Public-only scanner, weekly/manual GitHub Actions report, candidate review queue | **Merged and verified; 11 scanner tests and 42 site regressions passed; live scan found 3 candidates with 0 errors. Content Workshop integration next** |
| DH-10D | Default-off new repository bootstrap | New repositories created through a safe GitHub CLI helper start with `davehub.json` disabled in the first commit; scheduled discovery flags missing markers on new public repos | **Merged PR #25 (`1a2285a`); validated GitHub CLI helper and default-off marker; public-repo audit, with private external-creation limitation documented** |
| DH-10C | Hosted editorial integration | Public-safe discovery queue at `/review/`; owner-only GitHub Actions publication/revision/withdrawal proposals; staging PR and catalogue validation, no automatic merge | **Foundation deployed on staging: PR #48 hosted `/review/` and validated owner-only proposal workflow; PR #49 registered Run workflow on default GitHub branch; PR #50 added deployed-route smoke. Live Cloudflare HTTP checks #41120428437 passed for `/review/`, both game paths and assets. No newly approved publishing candidate has been nominated; next action is workflow testing against an owner-approved candidate, not automatic publication.** |
| DH-10 | Automated development stories | Significant approved project events become concise draft human-readable stories, not routine posts | Planned |
| DH-11 | Build distinct creative worlds and later extend content types | Theme-specific Writing, Music, Experiments, Unfinished Shelf and Memory Lane rooms from the validated catalogue; public/fictional separation, responsive layouts, no new content approvals | **Layouts implemented for staging review on feature/dh11-creative-world-layouts; browser visual approval and CI required before sign-off.** Later content ingestion remains planned. |

## DH-11 visual worlds (30 October 2026)

The five non-game creative destinations now have dedicated CSS-only responsive layouts driven solely by the existing validated catalogue. Writing is a reading room; Music is a record-stage listening room; Experiments is a specimen workshop; The Unfinished Shelf is an intentional archive; Memory Lane is a chronology allowing approximate/unknown years. Fictional examples remain under /previews/dh-08b/ and never enter the live catalogue. Do not use The Ordinary Universe/Ordinary Verse or Octo-Marathon as candidates. See [DH-11 layouts and acceptance plan](DH11_CREATIVE_WORLD_LAYOUTS.md). Musical detail-page enrichment, approved media and actual new content are later stages. No live-domain work.

## DH-10 DaveHub Ready repository discovery (updated 30 October 2026)

A [versioned root-level `davehub.json` contract](DH10_REPOSITORY_MARKER_INGESTION.md) lets creative repositories opt into DaveHub's read-only discovery process, with categories (multi-view), lifecycle, title, public-safe synopsis, links and optional major-milestone suggestions. Missing or `enabled:false` = disabled. A recurring and on-demand GitHub workflow scans the owner's public repos and prepares **unpublished review candidates**, not automatic site deployments. Earlier creative opt-in PRs merged (Stephen Martin, Ordinary Universe, Octo-Marathon); however, **30 October owner decision:** Ordinary Universe/Ordinary Verse is not ready and Octo-Marathon is not part of DaveHub. Both source markers are now `enabled:false` and must not be proposed for publication. Unicorn Valley PR #338 was historically subject to its final CI gate. DaveHub's disabled self-marker and scanner are merged. In the verified scan, 12 eligible public repositories were checked; three were enabled, nine disabled/absent and none invalid. Non-opted-in repositories are excluded by default. The remaining work is private Content Workshop integration and separately approved publication; nothing reaches the staging/live catalogue automatically.

## DH-09D domain launch and staging decision (28 October 2026)

**Locked owner requirement:** `davehub.pages.dev` must remain the permanent staging/testing domain after `davehub.co.uk` launches. Staging and live must use **two independent Cloudflare Pages projects connected to the same DaveHub Git repository**, deploying the same path layout but independently controlled versions: existing Pages project → persistent `staging` branch; new live Pages project → protected `main` branch plus `davehub.co.uk` custom domain. No automatic staging-to-live promotion. The exact domain/DNS/TLS, branch-switch, game regression and rollback checklist is committed to [the permanent DH-09 domain launch runbook](DH09_DOMAIN_LAUNCH_RUNBOOK.md). **Do not switch current Pages branches or configure the domain yet.**

## DH-08B homepage navigation integration (27 October 2026)

After seeing DH-08B pages, the owner noted the homepage Explore CTA still opened the **old pop-up**, leaving the new page designs inaccessible without pasted direct links. Corrected on the DH-08B branch: Explore links straight to `/worlds/`, islands open their respective world routes, previous hash deep links redirect, and empty public category pages clearly link to a separate fictional demonstration. The pop-up no longer duplicates the new world page. New navigation tests guard the integration.

## DH-08B shared content pages (27 October 2026)

The [DH-08B implementation and verification record](DH08B_SHARED_CONTENT_PAGES.md) covers a single statically generated UI driven by the approved public manifest. Seven Explore world destinations and per-creation deep links are now built from one source; a musical can link concept, songs, script scenes, making-of notes and releases. A separate seven-work fictional dataset produces a 15-page browser demonstration using exactly the same templates. Public world pages are currently empty because **no real owner works are approved**. DH-08B is a draft feature branch, not a production content release.

## DH-08A owner-controlled public content (27 October 2026)

[The publication contract](DH08_PUBLICATION_CONTRACT.md) specifies `DaveHub Ready` as a nomination for read-only drafting, **not** blanket public permission. Implemented an empty `content/public/catalogue.json`, a strict validator, twelve Node tests, and a fictional four-item demonstrator at `/previews/dh-08/` on the review branch. The Cloudflare build blocks unapproved or unsafe records and ships only the approved manifest to `/content/catalogue.json`. Books, albums, historic material and any privately drafted descriptions still require individual rights and editorial approval. This is DH-08A only; actual owner work is not yet ingested.

## DH-07E static Giant Dave + mystical explorer (27 October 2026)

User requested a non-animated **static Giant Dave** in the reserved host slot, while preparing the real animation independently, and a **more mystical Explore directory** matching the illustrated floating islands. A prior original transparent Dave pose was converted to a 177 KB WebP and committed as a separate staged binary; the build script now copies it to the preview. The Explore modal reuses the approved background, a darkened magical/constellation treatment and luminous portal cards, retaining all navigation. See [DH-07E visual implementation and QA](DH07E_GIANT_DAVE_MYSTIC_PORTAL.md). This does not reopen the removed bottom menu. Browser placement and owner approval are still required before production merge.

## DH-07D cross-world navigation (27 October 2026)

The user approves DH-07C **page concept and layout** and prefers a modern sans-serif typographic revision. Build [the two-tier discovery directory](DH07D_DISCOVERY_NAVIGATION.md) on a branch based on DH-07C: retain all four existing floating-world links and **remove the redundant bottom tiles**; group **Music**, **The Unfinished Shelf** and **Trip Down Memory Lane** inside **Explore** rather than adding buttons to the crowded homepage. Contextual onward links open the existing fictional shelf and musical previews. Unapproved real works are not exposed. Visual review, browser validation and main-branch approval are separate gates.

The owner reviewed the homepage and explicitly rejected the third navigation surface: the bottom four-tile row repeated the floating islands and Explore. It has been removed from the branch, and the logo/Explore area is repositioned to suit. This is a targeted refinement, not a new visual design direction. Browser QA remains pending because the available browser runner previously blocked local page loads.

## DH-07C fictional content-world prototypes (27 October 2026)

[Interactive test and QA record](DH07C_CONTENT_PROTOTYPES.md). A responsive HTML/CSS/JS design lab is available from the feature branch at `/previews/dh-07c/` once the actual Cloudflare branch build is confirmed. It contains six fictional deliberately shelved projects and an entirely fictional musical whose songs link to script scenes, plus story, development notes and releases. **No user's real private work has been published.** Browser interaction and zero horizontal-overflow checks passed at 1440×900, 1366×768, 390×844 and 375×667. The old homepage remains unchanged, and the page designs await owner review before merge.

## DH-07B: Unfinished Shelf and musical production architecture (25 October 2026)

The historical hard-drive inventory is **not a prerequisite**. The [DH-07B specification](DH07B_UNFINISHED_AND_MUSICALS.md) defines two visitor experiences: a deliberate home for works the owner **has no intention of finishing** (particularly scripts/writing), and first-class **musical worlds** connecting songs/releases, concepts, plots, characters, script/lyrics and creative-development artifacts. Categories, work lifecycle, historical period and publication status are independent: no unfinished project becomes an implied to-do item, and an album is not mistaken for the whole musical. Implement two responsive templates with fictional data and reviewed rights before introducing real files. Naming and homepage placement remain to be confirmed.

## DH-07A creative catalogue discovery (24 October 2026)

Initial outside-GitHub creative links suggest additional kinds of records: publishers and collaborative organisations, books, music artist identities, specific album releases, musical productions and historical bands. The same creation may be browsed through **Music**, **Writing**, **Projects** and **Trip Down Memory Lane**, without duplication. **Music and Trip Down Memory Lane are candidate views, not yet approved homepage buttons.** The first nine detailed entries are held as a conversation-local draft and are *not* committed to the public repository. Read the [inventory discovery specification](DH07A_EXTERNAL_INVENTORY_DISCOVERY.md) and respect the [publication policy](PUBLICATION_POLICY.md).

## New strategic workstreams (agreed 22 October 2026)

**Principle:** The owner creates games, books, music, software and ideas; DaveHub should organise and present the approved work without imposing regular website upkeep or hand-written blog posts.

- **DH-06: Living Giant Dave.** Four approved poses remain the character-design reference. Owner selected **articulated movement for idle, look, reach, point and present**; reserve morphing exclusively for separately designed magical world transitions, never routine pose changes. Draw hidden shoulder/torso paint and layered face/arm artwork first; don't generate another stack of optical-flow tween frames. Rive is a candidate, not a locked runtime. See [animation brief](GIANT_DAVE_ANIMATION.md), [exact layered asset specification](GIANT_DAVE_LAYERED_RIG_SPEC.md) and [ADR-0010](DECISIONS/ADR-0010.md).
- **DH-07: Content and information architecture.** Four visitor destinations (Projects, Writing, Games, Experiments) are overlapping discovery categories over *shared* canonical content. Inventory projects, ideas, milestones, releases, development stories and authorised media. Design What's Happening, project history and search. Run in parallel with DH-06. See [Living content and ingestion discovery](CONTENT_PIPELINE_DISCOVERY.md).
- **DH-08–DH-11: The publishing system.** Owner nominates public-safe work as **DaveHub Ready**; read-only integrations and AI can create sourced drafts, but public publication still requires deliberate human approval under the existing policy. Pilot a single approved game; generate short human-readable development stories from meaningful milestones rather than blogging every commit; only then expand sources. Do not introduce a CMS or database without a measured need.
- **Visibility rule:** This roadmap authorises discovery and prototypes, **not automatic publishing**, ingestion of private conversations, third-party voices/likenesses or employment-related information.

## DH-06C1 implementation sequence (locked 22 October 2026)

1. **C1a:** coherent master torso/neck/head and underpaint behind the near shoulder; approved static fallback.
2. **C1b:** separately painted near upper sleeve, elbow bridge, forearm, hand variants, shoulder cap and occlusion shadows; test pivots and extremes.
3. **C1c:** isolated eyelid/eyes, face expression and head articulation.
4. **C1d:** natural idle → welcome → hold → return state machine, no ordinary whole-image morph.
5. **C1e:** quality/performance and Rive-versus-Canvas review; binary asset provenance and user approval.
6. **DH-06C:** Cloudflare feature-branch integration once C1 tests pass; preserve fullscreen controls and mobile/reduced-motion fallback.

**Not done:** Painted rig assets, actual Rive/Canvas production animation, image binary repository hand-off and Cloudflare integration. Existing draft PR #9 remains historical experimental evidence; it is not the production character.

## Responsive scene fit (DH-02C)

- Treat the homepage as a single viewport-sized, non-scrolling scene, not a conventional document with a minimum page height.
- Anchor the logo, Explore CTA and navigation to the available viewport height. Keep native destination dialogs independently scrollable.
- Use compact rules for smaller screens, portrait mobiles and landscape phones. For extremely short portrait viewports or heavy zoom, prioritise accessible scrolling over clipping controls.
- The owner's live Cloudflare screenshot showed bottom navigation below the fold. The fullscreen CSS correction was browser-tested locally at 13 viewport sizes from 320×568 through 1920×1080; the live hosted update must still be visually reviewed.

## First-look preview and hosting

- [DH-01A working homepage prototype](HOMEPAGE_FIRST_LOOK.md) built and approved for first hosted visual review; the hero asset and Dave movement remain open for refinement.
- Artwork is layered separately, with an empty `#dave-stage` placeholder for the future illustrated Dave.
- The first review focuses on the visual homepage and actual HTML buttons. The optional retro menu route is deferred from this increment; confirm its future place separately.
- [Cloudflare Pages setup](CLOUDFLARE_PAGES.md) is prepared with a curated `dist/` build; account connection and the `*.pages.dev` domain are not yet established.

## Workflow

- Keep reference images unchanged and version any refinements separately; do not overwrite approved originals.
- Refine within the selected direction. New competing high-level visual concepts require explicit approval.
- Development should use small reviewable work packages, tests and preview links after an actual deployment.
- Update `PROJECT_STATE.json` and this roadmap at each completed work package.
- Publication of another project's source, asset or private content requires separate approval.


## DH-06D — transparent illustrated Dave homepage animation (review)

- Owner supplied a five-second 720×1280 QuickTime animation with a confirmed genuine alpha channel, 121 source frames; the source MOV stays outside the public web build.
- Optimised browser motion asset: VP9 WebM with alpha, 480×854, 24 fps, 289,843 bytes, SHA-256 `1ed2277df5316b5b7f3c2ac2747e69d1492e011d5605ac4af37043bfaf072ead`.
- Integrate into the existing `#dave-stage`, preserving responsive positioning and the approved WebP still as fallback.
- Motion is decorative, silent, noninteractive and does not intercept pointer events. Avoid perpetual 5-second repetition; pause between gestures.
- Disable video for `prefers-reduced-motion`, Save-Data, iOS, Safari and playback failures.
- Acceptance: Cloudflare branch preview; verify transparency and position on Chrome/Edge desktop and mobile, Safari static fallback, all navigation working, no oversized downloads.
- Status: code and asset prepared on feature branch for review. Do not merge until owner confirms appearance.

### DH-06D1 — larger upper-body framing (owner review, 28 October 2026)

- Owner requested a much larger Dave, with the head, shoulders, chest and pointing hand dominant; legs can be cropped below the screen.
- Increased desktop Dave height up to 155svh (width-limited on narrow desktops) and aligned the top around 14svh, keeping his head visible while cropping the legs below the viewport.
- Re-aligned transparent video relative to the static still so the gesture stays near, but does not cover, the desktop Explore CTA.
- Tablet and portrait-mobile rules use upper-body crops; landscape-phone framing remains explicit.
- Still and motion share geometry and remain noninteractive; Safari, reduced-motion, and playback fallback remain unchanged.
- Added CSS layout regression assertions. Review Cloudflare branch preview at desktop, tablet and mobile before merging.

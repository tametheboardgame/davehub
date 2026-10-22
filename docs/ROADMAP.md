# DaveHub development roadmap

**Updated:** 22 October 2026. **Current stage:** DH-06A Giant Dave four-pose study approved; DH-06B rig and movement proof of concept next, with DH-07 information architecture discovery in parallel. The full-screen homepage first-look is on Cloudflare Pages according to owner visual review; no exact preview hostname has been independently verified. **davehub.co.uk** remains a purchased domain, not a confirmed production deployment.

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
| DH-04A | First public-safe projects | At least three approved projects showcased or linked | Not started |
| DH-05A | Human-reviewed content drafts | Safe workflow for proposed updates | Not started |
| DH-05B | Deployment and launch | Cloudflare Pages used for previews; public domain/DNS, TLS and monitoring still pending | Preview reported live; launch pending |
| DH-06A | Giant Dave key poses and motion personality | Four coherent poses approved by owner on 22 October 2026; visual baseline locked | **Complete** |
| DH-06B | Giant Dave rig and movement prototype | Local transparent four-pose motion lab, idle breathing, blink and gesture controls assembled; true bone/mesh rig and binary GitHub upload still pending | **Local motion study built; owner review next** |
| DH-06C | Giant Dave homepage integration | Independent character layer; responsive crop, static fallback, reduced-motion, no lost navigation | Planned |
| DH-07 | Content inventory and information architecture | Typed catalogue, cross-category views, stories, timelines, media and source/rights inventory agreed | **In progress, parallel** |
| DH-08 | DaveHub Ready publication contract | Explicit approved project onboarding, source collection, draft review, provenance, withdrawal and security gates | Planned after DH-07 |
| DH-09 | Single-project ingestion pilot | One approved creative game becomes a project page + reviewed update through preview/merge | Planned |
| DH-10 | Automated development stories | Significant approved project events become concise draft human-readable stories, not routine posts | Planned |
| DH-11 | Extend feeds and content types | Approved books/music/ideas/experiments and other capture channels, no duplicate catalogues | Planned |

## New strategic workstreams (agreed 22 October 2026)

**Principle:** The owner creates games, books, music, software and ideas; DaveHub should organise and present the approved work without imposing regular website upkeep or hand-written blog posts.

- **DH-06: Living Giant Dave.** Maintain the approved bald/ginger-bearded/navy-hoodie illustrated identity, animate restrained idle and a deliberate greeting, explore gesture/focus states. Build a separate character layer without replacing the locked image. Prototype Rive against a simpler alternative if appropriate; runtime not locked. The four-pose character design is approved; preserve its original appearance and move into independent paint-layer preparation and movement testing. See [Giant Dave animation brief](GIANT_DAVE_ANIMATION.md).
- **DH-07: Content and information architecture.** Four visitor destinations (Projects, Writing, Games, Experiments) are overlapping discovery categories over *shared* canonical content. Inventory projects, ideas, milestones, releases, development stories and authorised media. Design What's Happening, project history and search. Run in parallel with DH-06. See [Living content and ingestion discovery](CONTENT_PIPELINE_DISCOVERY.md).
- **DH-08–DH-11: The publishing system.** Owner nominates public-safe work as **DaveHub Ready**; read-only integrations and AI can create sourced drafts, but public publication still requires deliberate human approval under the existing policy. Pilot a single approved game; generate short human-readable development stories from meaningful milestones rather than blogging every commit; only then expand sources. Do not introduce a CMS or database without a measured need.
- **Visibility rule:** This roadmap authorises discovery and prototypes, **not automatic publishing**, ingestion of private conversations, third-party voices/likenesses or employment-related information.

## DH-06B first movement prototype

A first downloadable interactive movement proof of concept and MP4 were generated from all four approved poses. No production asset or rig has been merged. The visual test confirms a practical transparent-sprite approach for staging, but major transitions currently use whole-pose crossfades, **not** articulated arm/neck movement. See [DH-06B motion test](GIANT_DAVE_MOTION_TEST.md). Next, review motion and develop production-quality rig layers if needed. Cloudflare remains unchanged.

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

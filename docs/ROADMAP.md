# DaveHub development roadmap

**Updated:** 21 October 2026. **Current stage:** DH-01A homepage first-look ready for Cloudflare Pages first live preview, without illustrated Dave. The primary domain is **davehub.co.uk** (purchased by owner), but hosting account connection/DNS are unconfigured. Cloudflare Pages is the chosen visual-preview host; no site has been deployed.

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
| DH-02C | Responsive/navigation test | Desktop, mobile, keyboard, reduced-motion and direct links pass | Not started |
| DH-03A | Production shell | Host-flexible build and performant shared content model | Not started |
| DH-03B | Content and editorial system | Project catalogue, devlogs, search, deep links, archive | Not started |
| DH-04A | First public-safe projects | At least three approved projects showcased or linked | Not started |
| DH-05A | Human-reviewed content drafts | Safe workflow for proposed updates | Not started |
| DH-05B | Deployment and launch | Cloudflare Pages chosen for previews; public domain/DNS, TLS and monitoring still pending | Not started |

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

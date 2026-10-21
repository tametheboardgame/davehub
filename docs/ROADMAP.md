# DaveHub development roadmap

**Updated:** 21 October 2026. **Current stage:** DH-01 refinement of **approved visual references**. The primary domain is **davehub.co.uk** (purchased by owner), but hosting/DNS are unconfigured. No site has been deployed.

## Design baseline

- Three reference images are **locked**, with **Concept 1 as the owner's favourite and lead**.
- Concept 2 informs category portals; Concept 3 informs the observatory and interactive controls.
- The approved DaveHub logo is locked as an unchanged transparent PNG under `assets/branding/`; a genuinely vector-based master has not yet been approved.
- The main site is navigated through clickable destinations / scene transitions, **not** a walking avatar.
- A prominent **"I want to view this as a menu coz I'm boring"** link opens a deliberately basic **1990s-style HTML interface**.
- Both views share one approved project catalogue, stable routes and deep links.
- See [reference gallery](LOCKED_CONCEPTS.md), [visual direction](VISUAL_DIRECTION.md) and [retro menu brief](BORING_MENU.md).

| Work package | Deliverable | Exit criteria | Status |
|---|---|---|---|
| DH-00A–C | Original project foundation | Brief, repo, safety constraints and roadmap | Complete |
| DH-01L | Lock initial three design references | Original images in GitHub and Google Drive; decision notes updated | Complete |
| DH-01M | Lock primary DaveHub wordmark | Approved transparent PNG and ADR in GitHub; backup in Google Drive | Complete |
| DH-01A | Refine Concept 1 homepage | Illustrated Dave, floating destination world, exploration interactions and mobile storyboards | Next |
| DH-01B | Refine category portals | Concept 2-derived destinations and clear navigation | Planned |
| DH-01C | Refine observatory details | Concept 3-derived interfaces, index integration and discoverable interactions | Planned |
| DH-01D | Basic HTML menu-mode design | Literal 1990s HTML appearance and functional accessible navigation | Planned |
| DH-02A | Click-to-explore homepage prototype | No roaming avatar; project links and skippable entry are working | Not started |
| DH-02B | Retro HTML-mode prototype | Basic HTML navigation; switch both ways; shared content | Not started |
| DH-02C | Responsive/navigation test | Desktop, mobile, keyboard, reduced-motion and direct links pass | Not started |
| DH-03A | Production shell | Host-flexible build and performant shared content model | Not started |
| DH-03B | Content and editorial system | Project catalogue, devlogs, search, deep links, archive | Not started |
| DH-04A | First public-safe projects | At least three approved projects showcased or linked | Not started |
| DH-05A | Human-reviewed content drafts | Safe workflow for proposed updates | Not started |
| DH-05B | Deployment and launch | Cloudflare or alternative selected, DNS, TLS and monitoring verified | Not started |

## Workflow

- Keep reference images unchanged and version any refinements separately; do not overwrite approved originals.
- Refine within the selected direction. New competing high-level visual concepts require explicit approval.
- Development should use small reviewable work packages, tests and preview links after an actual deployment.
- Update `PROJECT_STATE.json` and this roadmap at each completed work package.
- Publication of another project's source, asset or private content requires separate approval.

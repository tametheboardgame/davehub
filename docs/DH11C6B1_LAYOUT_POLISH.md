# DH-11C.6B.1 — Above-the-fold editions and unobstructed object prompts

**Status:** Staging-only refinement following the owner's screenshots of the published-book detail and bookcase camera. Production / `main` unchanged.

## Owner feedback (7 November 2026)

1. The published book detail currently needs an unnecessary scrollbar at normal desktop resolutions; make the panel wider and fit its cover, text, ISBN and purchase links without scrolling except on genuinely small/short screens.
2. The centred “Explore further” panel hides the bottom of the bookcase and its interactive books. Arrange the three finished books **top down**, on the highest shelf, and never place a contextual panel over the object being inspected.

## Changes

- The existing bookcase geometry remains untouched. Physical meshes on **top shelf index 3**, slots **03, 10 and 17**, become the three active publications, spread evenly across the uppermost row, in this order: *The Legend of the Stormrider*, *The Duck Bread Baker*, *Eleanor and the Mystery of the Missing Stones*.
- A single mapping in `finished-books.js` drives selection for BOTH procedural fallback and the actual furniture GLB, the turquoise/gilt highlights, the painterly spine names, accessible keyboard book list and pull-out-to-edition page transition. The prior eight-book art review remains independent. Clicking an obsolete previously highlighted position in canonical visitor mode can no longer accidentally open a published edition.
- The publication panel widens from 940px to a responsive maximum of 1190px; uses a narrower cover column, reduced margins, compact facts and appropriately sized headings. The retailer action remains within the ordinary desktop viewport. Natural scrolling remains only if content overflows, with explicit short-height/mobile fallbacks; no clipping of content.
- On medium/large screens, compact prompts and optionally expanded object controls are **side-docked opposite the selected furniture**, around mid-height. Bookcase panels dock left, leaving the central and right-side shelf visible; cabinet, desk, typewriter, bin and the left-hand window dock right.
- On narrow screens where side docking isn't feasible, the **visible compact prompt** has its own reserved strip below a resized Three.js canvas. `ResizeObserver` keeps the 3D camera aspect correct. Dismissing/expanding the prompt restores the full canvas; the exit door never triggers a prompt dock. Camera positions, click-empty-scene to zoom out, two-click door exit, GLB interactions and published book pages remain unchanged.
- Stage-specific script/CSS query tokens make the layout update visible without cached previous builds. No changes to the creative catalogue, source manuscripts, live site or `main`.

## Test and acceptance gate

- Automated checks: exact three top shelf GLB mesh names/height and mapping; book title artist follows position; only those three indices active; older comparison preserved; viewport CSS, prompt position and modal above-fold layout; cache tokens; staging build and hosted smoke.
- Visual review: open each of the three turquoise books from the **uppermost shelf**; the detail should show its buy links without desktop scrolling. Focus the bookcase, desk, cabinet, window and typewriter and ensure the compact prompt does not cover the relevant furniture. Check short-height/mobile scroll and panel dismissal.
- Only merge to permanent `staging` when CI and Cloudflare preview are green. Owner approval is still required for promotion to `main`.

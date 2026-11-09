# DH-11C.5C — Illustrated Art Style Calibration

**Status:** Staging-only first visual experiment; owner visual approval pending.
**Date:** 1 November 2026
**Foundation:** DH-11C.4 mechanics owner-approved; DH-11C.5A desk materials owner-approved; DH-11C.5B archive materials accepted as a promising first pass.
**Architecture:** [ADR-0012](DECISIONS/ADR-0012.md), real models and existing animation pivots remain authoritative.

## Why

The physically coherent Manuscript Hoard is readable and interactive, but its surface and lighting are still closer to a conventional 3D game than the illustrated DaveHub homepage. We need a consistent original animated-illustration style before expanding materials to the floor, walls, and theatrical environmental details. This must not revive the discarded 2D compositing approach.

## Four-part experimental sequence

1. **5C.1, shared calibration system:** isolated route, selectable original-material reference versus illustrated treatment; formal colour, light, tonal-band and outline controls; accessible comparison UI; no persisted/global change. A/B/C config contract with independent profiles.
2. **5C.2, Variant A: Painterly Storybook:** the first working full-room comparison using real meshes, painted-looking multi-band shading, selective illustrated contour accents and warm amber versus indigo lighting. Target writing desk, bookcase, filing cabinet, and immediate atmosphere. Owner reviews and requests iterations.
3. **5C.3, Variant B: Stylised Animated:** later stage, cleaner shape separation and animation-film-like colour language; not implemented by 5C.2.
4. **5C.4, Variant C: Madman's Manuscript:** later stage, theatrical expressive design and deliberate spatial eccentricity that does not disrupt approved interactive parts; not implemented by 5C.2.
5. **5C.5, convergence:** compare A/B/C with the homepage and select/blend a single approved original art direction before extending to architecture and environment.

## Visual rules

- A: colour grouped into a few authored tone bands, richer illustrated warmth on the wood/metal, luminous parchment, quieter ink-blue shadows, very subtle outlines on selected hero silhouettes. Do not blanket every edge with black wireframe.
- Keep the eight turquoise book interactions and their gold marks unmistakable. Preserve bulb emission and its on/off state.
- Preserve the source GLB geometry, 197 furniture nodes, five separate working drawers and approved real 3D door, lamp, typewriter, loose papers and bin movement. The decorative outline objects must not enter raycasting.
- Respect reduced-motion; no new looping animation, flash, blur, sound or particle effects.
- Maintain the existing desktop/touch/keyboard interaction controls. The comparison switch is a real labelled button with `aria-pressed`, not a decorative visual.
- Do not bind unpublished manuscript fragments, fabricate real creative work, or alter the approved public catalogue.

## Delivery and acceptance

Implement A using a standalone `/previews/dh-11c/illustrated/` route on `davehub.pages.dev`. The original `/previews/dh-11c/furniture/` remains the unchanged C5B comparison. The new route adds a versioned calibration module and preview layout; the same `room.js` and real GLBs remain the sole source of interactions. Verify the route, JS, CSS, code and generated GLBs with CI and live staging HTTP checks. Require owner visual sign-off before building B, C or promoting anything to production.

**Production:** `main` and `davehub.co.uk` untouched. No new publication approval.

# DH-11C.4C — Real architectural openings and Blender cabinet comparison

**Date:** 1 November 2026  
**Status:** staging prototype in review. **Geometry and Blender export are verified; browser visual acceptance is not yet granted.**  
**Architecture rule:** [ADR-0012](DECISIONS/ADR-0012.md), geometry first.

## Purpose

Correct the two architectural geometry defects identified in DH-11C.3A without changing the approved Writing island: (1) a solid back wall behind the floating-islands window, and (2) a solid side wall behind the hinged exit door. Put the **actual Blender-exported cabinet from DH-11C.4B** into the same room and allow comparison with the original room and DH-11C.4A cabinet.

## Implementation

- **Preview route:** `/previews/dh-11c/architecture/` on staging only. It is generated from the *same* DH-11C.2 room HTML and interactive runtime, with opt-in flags `data-shell-proof`, `data-glb-proof` and `data-blender-compare`. The original room route and material laboratory retain their original flags and layout.
- **Real wall apertures:** `room-shell-plan.js` describes the existing 14 × 6.4 × 11 m room as **four back-wall panels and three right-wall panels**. The back wall excludes a 3.56 m × 2.80 m window void at x -1.61 to 1.95, height 2.25 to 5.05. The right wall excludes a 2.56 m × 4.66 m door opening at z -1.48 to 1.08, height 0 to 4.66. The rest of the room is unchanged.
- **Supporting geometry:** segmented skirting/trim no longer blocks the openings; the window now has physical edge reveals and island geometry behind the wall plane; a short physical corridor beyond the open door gives genuine depth. The door continues to rotate about its original hinge and the island window remains the same single-camera environment.
- **True Blender asset:** `assets/worlds/writing/3d/models/cabinet-blender-verified.glb.deflate.b64` stores a *lossless, compressed* representation of the actual `cabinet-blender.glb` produced by Blender 4.0.2 during verified DH-11C.4B workflow run [41296250123](https://github.com/tametheboardgame/davehub/actions/runs/41296250123). The text encoding is solely a transport/storage convenience for the repository; not a model authoring method or a substitute for physical geometry.
- **Model build:** `build-dh11c4c-blender-model.cjs` decodes the original GLB, rejects corruption or unexpected changes using SHA-256 `051e4abdb015799282234ea50b14cd179cb335ee496dbfdf965a4f1081abbf8a`, checks binary GLB structure and copies it to `/previews/dh-11c/room/models/cabinet-blender-verified.glb`. Cloudflare then serves the **real model**, not a fresh facsimile.
- **Same interaction system:** five physically separate labelled drawer rigs, 0/50/100% extension slider, curated camera stops, pointer/keyboard alternatives, room return and lowered motion remain available without duplicated camera geometry.
- **Comparison:** direct links to the original greybox room, the former deterministic GLB cabinet and three unapproved art-direction palettes. No scene or private manuscript data are introduced.
- **Failure:** model loading fails visibly and falls back to the older procedural cabinet in the isolated preview. No production changes.

## Tests and review

1. Unit tests verify seven wall panels and calculate exact area removed by both apertures; no remaining wall panel may intersect the open rectangular volume.
2. Tests restore the actual Blender binary, verify its SHA-256, GLB 2.0 header/length and all five named drawer nodes.
3. Generated preview must contain opt-in flags, all existing navigation/slider controls, locally hosted library and no fictional/private catalogue content. Old room HTML must remain unchanged.
4. GitHub Actions builds DaveHub, both games and editor, runs all existing regression tests and publishes the isolated route and validated GLB.
5. Cloudflare smoke tests fetch the architecture route and the **exact 26,164-byte Blender GLB** and verify its original SHA-256.
6. **Owner visual review required:** inspect both actual apertures with door open/closed, window frame/island occlusion, camera framing, real Blender drawer fronts and rails at 0/50/100%, mobile and keyboard operation. An HTTP pass does not prove WebGL rendered correctly.
7. Art direction selection is *still pending*. Do not add final textures, move this preview onto `/worlds/writing/` or promote to the custom domain without distinct approval.

## Next

After visual review, fix any collision/trim framing issues, then build the corrected room shell as editable Blender geometry and move the same validated modelling/export pipeline to other hero furniture. Continue cabinet texturing only after a palette is approved.

# DH-11C.5D.3B — High-illustration artwork painted onto working 3D

**Date:** 3 November 2026

## Owner's clarified visual requirement

The existing 3D room **itself** should look like the richly illustrated DaveHub homepage and earlier Writing-room concept art. Those images establish visual quality, **not room geometry**. The interactive scene must never be replaced by or disguised beneath separate generated stills.

The camera-plate idea and earlier 5D.3A art alignment bench remain reference experiments only. The actual direction is **asset-first artistic 3D production**.

## First implementation slice

- Isolated staging preview: `/previews/dh-11c/authored-3d/?v=dh11c5d3b-authored-3d-v1`
- New `high-illustration-3d.js` replaces the previous generic toon/post-processing approach for this **one variant only**.
- Painted source-map artwork: actual CanvasTexture maps are authored per wood, aged parchment, binding, cabinet enamel, brass, leather, plaster, stone, fabric, ink and foliage surface. Motifs are constructed from curving brush strokes, directional wood veins, gilt rules, tooling, manuscript-line marks, wash and patina, **applied in the existing GLB UV coordinate space**.
- Physical detail drawn on the models: filigree is defined in local geometry coordinates against each source mesh bounding box and attached as `THREE.LineSegments` children. Paper scrawls, engraved book spine rules, desk inlay, panel borders and drawer tooling follow the real meshes when animated. They do not enter selectable Mesh raycasting.
- The eight original interactive turquoise-and-gold books, live lamp bulb, typewriter movement, cabinet pivots, 13 loose papers, nine bin papers, door and all eight camera views retain their mechanics.
- Comparison switch restores original material **object identity** and snapshot lighting; later GLB arrivals register automatically. Decorative relief is hidden in original mode.
- Source model and exported GLB are unchanged. No new catalogue content; earlier experimental previews preserved; production untouched.

## Acceptance and next artist work

This is an **initial production-art pass**, not a claim of finished homepage-level concept-art fidelity. Review the live model from HOME, desk, bookcase and cabinet cameras. The quality gate is whether the actual 3D meshes convincingly carry the art style (especially silhouette richness, book bindings, cabinet/desk character and lighting), not whether a separate concept picture looks attractive.

If the visual comparison remains too simple, the next step must involve materially richer Blender geometry and higher-fidelity custom UV texture artwork **for the same approved meshes and moving pivots**, not another global colour/filter pass. Owner visual acceptance is required before any integration into the Writing world. Recheck full original materials restoration and all mechanics after every surface update.

## Architecture constraints

ADR-0012 stays mandatory: one real room, one coordinate system, the existing camera plan, independently moving GLB sub-parts. All illustrated detail attaches to the underlying source mesh; no arbitrary still-image interactive mechanism. Accessible object selectors and reduced-motion remain unchanged.

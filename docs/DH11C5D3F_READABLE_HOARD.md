# DH-11C.5D.3F — Readability and personality pass

**Status:** isolated 3D staging visual candidate, pending owner approval. Follows the 4 November 2026 owner screenshots and feedback on V4.

## Owner feedback and implementation

1. **Window artwork fails to fit close-up; duplicate islands.** The V5 window uses four independently clipped physical aperture quads, mapped to one consistent image from the approved DaveHub homepage. Artwork sits just behind the wooden mullions, not half a metre behind, removing the unwanted parallax/edge gap at camera close-up. Two additional shallow, physically separated *cloud-only* atmosphere layers remain behind the same panes. All three original GLB island groups and the old GLB sky are hidden as whole nodes while artwork is visible. If the artwork fails to load, original window geometry is retained. Switch to reference materials to restore it.
2. **Cabinet labels illegible from overview.** Five real drawer-attached plates grow to approximately 1.31m wide x 0.28m high in the V5 proof (within 1.6m drawer faces), with high-contrast black, heavy 146px serif lettering, ink outline, parchment finish and restrained quill details. The labels move with their original drawer pivots and do not intercept clicks.
3. **Books not truly individual.** All 80 real GLB books now have 80 different fictional joke titles authored in `manuscript-personality.js`. Each spine has its own coloured, bordered and ornamented **physical front-face panel** fixed to the original book's geometry bounds and scale, with its actual title rendered as legible high-contrast text rotated along the spine. The eight featured books keep their turquoise identity and physical pull animation, while the interaction text identifies their actual joke titles. Fictional review titles are not published catalogue items.
4. **Papers too neat/repetitive.** The 13 desk papers, desk file leaf and typewriter sheet now each have a different dense, noisy fountain-pen scrawl, with handwritten snippets, crossing-out, circled notes, looping ink and arrows drawn into opaque parchment overlays. Their original unique paper meshes move below these attached illustration surfaces. Crumpled bin-paper originals retain their separate three-dimensional forms.
5. **Other safeguards.** Previously approved wood surface refinement, desk-cup removal and bookcase sculptural geometry carry forward unchanged. The room, camera plan, all animation/picking paths and existing catalogue isolation remain intact.

## Architecture

- Pure canvas art on planes physically attached to each verified GLB mesh. No image-based moving-state compositing and no fake hotspots (ADR-0012).
- Paper and spine decals are explicitly non-interactive (`userData.decorativeOnly=true`, empty raycast) and the existing capture routine filters them.
- Original material/illustrated modes are reversible, including the window and added art.
- Old V4 remains available at `/previews/dh-11c/authored-3d-v4/`; new visual candidate at `/previews/dh-11c/authored-3d-v5/?v=dh11c5d3f-readable-hoard-v1`.
- No changes to production, published Writing, main, real games or independent source repositories.
- A distinct artwork texture per book and visible manuscript adds draw calls and GPU memory. Verify mobile/tablet performance, actual text legibility, close-focus view, all drawers and eight featured book pulls before approving the style.

## Acceptance gate

Review opening room, window close-up and oblique view (zero art leakage beyond the four panes; no duplicate green shapes), cabinet labels from the whole room, 80 title differentiation at bookcase camera, desk-paper scrawl in desk view, reference-mode restoration, mouse/keyboard/touch interaction, mobile contrast and frame rate. **Do not promote to the published world without owner visual approval.**

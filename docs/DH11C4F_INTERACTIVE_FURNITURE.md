# DH-11C.4F — Editable interactive furniture models

**Date:** 1 November 2026. **Status:** model source and Blender export pipeline implemented on feature branch, checks and visual review pending.

## Objective

Complete the *other six* physical, editable interactive assemblies in the existing full-screen Manuscript Hoard while keeping the approved room architecture, cabinet geometry, camera framing, and interaction rules.

### Source and model contracts

- `prototypes/dh-11c-room/furniture-asset.js` holds the exact world/local coordinates and named component hierarchy of the existing desk/papers, bookcase/books, typewriter/key/platen/paper, bin/crumpled pages, door/hinge and window/floating islands. All distances in metres and Three.js/glTF Y-up.
- `scripts/build-dh11c4f-furniture-glb.cjs` deterministically creates a *genuine binary* glTF 2.0 model with real box, cylinder, spherical and faceted icosahedron triangles, normals and UVs, using source geometry. No image compositing or fabricated perspective.
- Every interactive assembly owns a separate transform root: `desk_root`, `bookcase_root`, `typewriter_root`, `bin_root`, `door_root`, `window_root`. Movable children retain separate nodes including `desk_paper_00`, `book_0_00`, `typewriter_key_1_4`, `door_leaf_hinge` and `window_island_0`.
- `scripts/blender/dh11c_furniture.py` imports the source GLB in real Blender, checks required hierarchies, saves an editable `manuscript-furniture.blend` master and exports `furniture-blender.glb`. This is a model authoring pipeline, not an AI image workflow.
- `scripts/validate-dh11c4f-furniture.cjs` independently compares every node's world position, orientation, scale and parent chain, and rejects drift over 2.8 cm and missing interactive rigs.
- The separate GitHub workflow `.github/workflows/dh11c4f-blender-furniture.yml` runs headless Blender with read-only repository permissions and uploads the source GLB, editable master, exported GLB and verification report.

## In-world comparison

- Staging-only preview: `/previews/dh-11c/furniture/`.
- It inherits the approved immersive single-window page and loads the same validated Blender cabinet and room shell. A new **opt-in only** `data-furniture-model-proof` flag loads the deterministic furniture source GLB.
- Until the furniture GLB is fully loaded and all six interactive roots / moving node names validated, the original working furniture remains visible and clickable. On success the six parts swap together; the existing original animation refs are rebound to the physical GLB nodes. The rest of the scene is untouched.
- **Current browser source explicitly uses the deterministic source GLB**. The Blender re-export must pass CI and comparative visual approval before it becomes the browser runtime model. This prevents accidental unverified changes.
- The original `/previews/dh-11c/room-shell/`, `/worlds/writing/`, games and live `davehub.co.uk` are unchanged.

## Acceptance criteria and remaining gates

1. Validate all six source roots, 180+ named parts, real geometry primitives and deterministic GLB bytes.
2. Run the actual Blender import/editable master/re-export job and validate node names, parent transforms and global coordinates.
3. Build full DaveHub output, both games and editorial tooling, and test the new isolated preview and same-origin asset SHA on Cloudflare. Ensure all immersive CSS/scripts actually deploy (not 200 HTML fallback).
4. **Owner visual review** of the desk papers, bookcase/book movements, typewriter key, bin, window-island movement, door-hinge opening and their camera framing on a laptop. The cabinet must remain clickable with five correct drawers.
5. Only after owner visual acceptance decide whether to replace the staging runtime source model with the validated Blender re-export. UV/material art work remains gated on DH-11C.3B approval.

**Next:** refine any model/animation discrepancies, approve the whole working geometry, then lock the materials/lighting bible and begin DH-11C.5A texturing.

# DH-11C.4B: Editable Blender master and GLB round-trip

**Date:** 1 November 2026  
**Status:** First actual headless Blender round-trip **verified** in GitHub Actions run [41296250123](https://github.com/tametheboardgame/davehub/actions/runs/41296250123), merged into staging via PR #61. Art-direction selection, production textures, browser visual acceptance and runtime model replacement remain unapproved.

## Why this is the next step

DH-11C.4A successfully created a hollow five-drawer cabinet as a deterministic GLB with real interior geometry and one shared camera. The user approved the current *mechanical direction* and asked to continue. DH-11C.4B establishes that the same cabinet can be edited and exported using a genuine 3D modelling application, without compromising the geometry.

**ADR-0012 remains mandatory:** build and preserve coherent geometry, then apply textures. Never assemble individually generated closed/open state images into moving 3D structures.

## Authoritative geometry and outputs

- **Existing source of geometry:** `scripts/build-dh11c4-cabinet-glb.cjs`. It produces `source-cabinet.glb`, retaining the cabinet's measured proportions, five drawer slots and verified local +Z outward travel axis.
- **Actual Blender conversion:** `scripts/blender/dh11c_cabinet_roundtrip.py` imports the complete GLB using Blender's native glTF importer, verifies named objects and their parenting, saves a fully editable `manuscript-cabinet.blend` master and exports `cabinet-blender.glb` through Blender's native exporter.
- **Validation:** `scripts/validate-dh11c4b-blender.cjs` checks real GLB binary headers and scene graphs, all named root/slot/rail/tray/folder nodes, consistent cabinet scale/pivot ancestry, locations within 2.5 cm of the original source and five drawer local +Z movement axes.
- **Report:** `model-report.json` records the Blender version, SHA-256 hashes of input and output, mesh/object counts and node checklist.
- **GitHub Action:** `.github/workflows/dh11c4b-blender-asset.yml` installs headless Blender on an Ubuntu runner, performs the import/export, validates geometry and uploads a downloadable archive of all four files. The workflow has **read-only** repository permissions and cannot silently commit a model or publish it.
- **Independent safe tests:** `tests/dh11c4b-blender.test.cjs` validates the tooling and source model even in the ordinary Node-only Cloudflare build. Blender itself is run in the dedicated model job, *not* in the website build or on the owner's computer.

## What this does and does not prove

This is a true **Blender-authored editable master generated from a validated geometry source**. It does not yet introduce visual refinements, UV layout artistry or the finishing materials. The input already contains basic mesh UVs and coloured primitive materials; preserving them across export is part of the underlying technical test.

The current `/previews/dh-11c/cabinet-glb/` continues using the DH-11C.4A deterministic Node-generated GLB and remains the stable reference. No code here swaps it for a new model, since that requires a successful Blender export and owner approval of any changes to the scene. The current DH-11C.3A three-palette material laboratory and `/worlds/writing/` are untouched.

## Approval gates

1. **Passed:** Blender 4.0.2 imported the source cabinet, saved an editable `.blend` and exported the new GLB. Artifact #13079755791 contains both, source GLB and report. SHA-256 hashes were checked independently.
2. **Source/export structure passed:** five drawer groups, parent pivots, positions and +Z axes validated. **Browser visual review still required** to confirm closed/half-open/full-open motion and exact camera framing from the actual exported model.
3. Review the actual model visually in browser before adopting the new Blender GLB as the staging runtime model.
4. Select an art direction in the existing DH-11C.3A art lab before applying the first production-quality textures.
5. Begin a separate DH-11C.4C pass to refine cabinet modelling and scale the verified Blender export pipeline to the room shell and remaining furniture.

**No production changes and no new manuscript content are authorised by this work.**

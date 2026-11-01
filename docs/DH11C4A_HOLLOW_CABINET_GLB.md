# DH-11C.4A — Hollow cabinet GLB round-trip (style-independent geometry proof)

**Date:** 1 November 2026  
**Status:** Implementation on a staging feature branch; browser visual approval pending. This is *not* a completed Blender master or textured production asset.  
**Mandatory decision:** [ADR-0012](DECISIONS/ADR-0012.md).

## Purpose

The DH-11C.3A scene audit discovered that the preliminary cabinet was a solid block behind sliding drawer parts. It could look plausible in a greybox but did not contain real hollow storage spaces. Before producing any attractive materials or committing to one of the unapproved palette directions, prove that a proper **glTF 2.0 binary cabinet** can be generated, loaded and animated within the existing shared room coordinates.

## Technical implementation

- **Editable source:** `scripts/build-dh11c4-cabinet-glb.cjs`. This first round-trip is authored with reproducible, first-party procedural modelling instructions, not an external downloaded cabinet or generated perspective image.
- **Build output:** `dist/previews/dh-11c/room/models/cabinet-prototype.glb`, generated deterministically by the Cloudflare Pages build. The binary is not hand-edited or stored as an unmaintainable static download.
- **Loader:** official MIT-licensed Three.js r159 `GLTFLoader` and its matching `BufferGeometryUtils` utility, imported from the existing self-hosted r159 module. No runtime CDN; the upstream copyright/licence is already retained in the vendor folder.
- **World placement:** GLB imported into the unchanged Manuscript Hoard scene at `[-4.7, 0, -3.25]` metres, consistent with the procedural cabinet. All scene cameras, other furniture and interaction controller logic are unchanged.
- **Model topology:** a solid *back panel* but a genuinely hollow front, separate left/right side walls, top and bottom panels, four shelf partitions, five open drawer slots, two side tracks per drawer, five drawer groups with fronts, hardware, floors, side walls, rear walls and neutral folders. There is no solid cabinet volume occupying the full interior.
- **Rig:** five named child transforms `drawer_finished`, `drawer_drafts`, `drawer_oddities`, `drawer_fragments`, `drawer_field_notes`. Each starts at a measured rest position and extends along its parent's local +Z axis. Travel in this trial is 0.76 metres, not a generated-pixel translation.
- **Labels:** locally drawn canvas text is attached to each drawer front in the 3D scene. It is not a moving mechanical image or a synthetic page labelled as approved work.
- **Preview:** isolated `/previews/dh-11c/cabinet-glb/`, generated from the existing DH-11C.2 room HTML, with an explicit `data-glb-proof` flag. A drawer-depth range control and three snap positions (closed, halfway and fully open) allow visual testing from the existing camera.
- **Failure handling:** if the GLB or loader fails to load, report the failure and present the previous procedural cabinet. The old Writing world, DH-11C.2 normal room and DH-11C.3A colour lab are not replaced.
- **No textures or art approval:** neutral, physically plausible primitive materials only. The style choice remains open.

## Acceptance and test evidence

1. Node unit tests generate the same GLB twice and demand byte-identical binary data.
2. Validate GLB 2.0 header, length/chunks, parseable JSON scene, mesh accessors and all named rig nodes.
3. Verify no all-volume solid cabinet mesh, five independent drawer transforms, valid track/void geometry and proper front/side/floor/rear components.
4. Check the model and renderer scripts for valid syntax, correct local loader dependencies, and unchanged normal room source.
5. GitHub full-site build must produce the actual `.glb` file. Cloudflare staging smoke must retrieve it and verify the binary header/declared length after deployment.
6. **Still required before marking the model approved:** real browser screenshots/visual inspection of 0%, 50% and 100% travel, switching drawers, cabinet from alternative camera angles, occlusion/rail depth, mobile composition, pointer and keyboard input.
7. **Before declaring a *production* pipeline:** implement/test a proper Blender source master and export/GLB import contract with UVs, pivots and orientation. A Node-generated first GLB is a meaningful proof, but does not establish that Blender has been configured or used.

## Scope and next gates

This work is an intentionally **reversible, separate modelling experiment**. It does not select Amber & Ink, Moonlit Archive or Golden Storybook as final; no user creative work is published; the canonical `/worlds/writing/` and both games are unchanged. After owner inspection, the next step is a Blender-authored cabinet and repeatable GLB export, retaining these validated axes and named rigs.

The art direction selection and actual room-wide modelling remain independently gated under DH-11C.3 and DH-11C.4.

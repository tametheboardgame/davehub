# DH-11C.4E — Proper 3D room architecture as a Blender-editable model

**Status:** Real Blender export validated by GitHub Actions, staging preview under review, 1 November 2026.  
**Decision:** [ADR-0012](DECISIONS/ADR-0012.md). Real geometry is authoritative; images do not substitute for moving parts or spatial depth.  
**Style:** not chosen; no final textures, effects, manuscript publication or production-domain work authorised.

## Implementation

The accepted DH-11C.4D immersive room remains the interface reference. DH-11C.4E separates the *static architectural structure* from `room.js` into a named, reusable glTF/Blender asset. The desk, bookcase, typewriter, waste bin, moving door, floating islands, existing Blender cabinet and curated camera controls remain in the existing Three.js scene.

- **Source of geometric truth:** `prototypes/dh-11c-room/room-shell-asset.js`, derived from the same seven wall panels and two genuine rectangular openings in `room-shell-plan.js`. All dimensions are in metres and Y-up, with explicit names, centres, extents and material slots.
- **Scope of export:** continuous substrate and individual floor planks, four back-wall segments around the window, three right-wall segments around the door, left wall, corridor walls/floor/ceiling, window reveals, divided dado rails, wall posts, overhead beams and rug/borders.
- **Real source GLB:** `scripts/build-dh11c4e-shell-glb.cjs` produces a deterministic glTF 2.0 binary, preserving a `room_shell_root`, named child meshes, their world positions, dimensions, normals and UV0. Pages build outputs `/previews/dh-11c/room/models/room-shell-source.glb`.
- **Blender editable master:** `scripts/blender/dh11c_room_shell.py` imports that first-party binary in headless Blender, verifies that required architectural meshes are all there and parented to the same root, saves `manuscript-room-shell.blend`, and exports `room-shell-blender.glb` using Blender's native exporter.
- **Independent model validator:** `scripts/validate-dh11c4e-shell.cjs` compares every architectural mesh node's world position and orientation/scale between source and Blender-exported GLB. No shifted windows, rotated floor planks or rescaled walls accepted.
- **GitHub Actions:** `dh11c4e-blender-room.yml` installs headless Blender with NumPy, runs the geometry tests, generates the editable master and re-export, then uploads `.blend`, source GLB, Blender GLB and SHA report as retained review artefacts. It has read-only repository permissions.
- **Staging-only visual comparison:** `/previews/dh-11c/room-shell/`, generated from the existing full-screen architecture preview and retaining exactly the same camera positions, object controls and modelled cabinet. The runtime loads the genuine Blender 4.0.2 re-export `room-shell-blender-verified.glb`, reconstructed from the archived export using its SHA-256, with locally pinned Three.js GLTFLoader. The identical manifest-generated mesh is held as a fallback if the model fails to load. The editable .blend master is retained as a GitHub Actions artefact.
- **Source integrity:** Hosted smoke requires that the exact generated GLB is available with a correct signature and SHA-256. Existing cabinet GLB integrity, both games and the published Writing world remain covered by existing checks.

## Acceptance gates

1. Source plan and GLB pass tests, with actual door and window holes, correctly aligned reveal panels, no walls occluding the openings.
2. Blender job successfully imports the source, saves an editable `.blend`, exports real glTF and validates each node's Y-up world transform and model extent.
3. Hosted Pages build and staging smoke pass for the new preview **and** the unmodified games/editor/older scenes.
4. **Owner/browser visual review:** inspect the whole room, door (open and shut), window islands, ceiling beams and floor, and test camera transitions at laptop and mobile sizes. No document scrolling.
5. The preview now uses the validated Blender export. Compare it visually with the previous architecture route; passing a structural validator alone is not visual approval.
6. Approve or refine the material direction in the DH-11C.3A art lab before creating the first proper textured room.

## Deliberately unchanged

No changes to `/worlds/writing/`, `davehub.co.uk`, catalogue records, the existing DH-11C.4D immersive preview, cabinet mechanics, object placement or animation state machine. No local workstation steps are required.

**Next:** once this room master is verified and the user approves its shape, expand the Blender workflow to furniture that needs editable modelling, then begin the first deliberately textured cabinet/desk vertical slice against the chosen art bible.

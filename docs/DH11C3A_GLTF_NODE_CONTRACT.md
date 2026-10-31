# DH-11C.3A — Proposed GLB modelling and node/pivot contract

**Status:** Draft for the DH-11C.4 export proof; not yet a delivered Blender model, import script or texture package.  
**Source:** `prototypes/dh-11c-room/room-plan.js`, `prototypes/dh-11c-room/room.js`, [ADR-0012](DECISIONS/ADR-0012.md).

## 1. Coordinate and unit rules

- Unit length is **one metre**. The existing room is 14 m wide, 6.4 m tall and 11 m deep.
- Three.js world uses Y-up, positive X right, positive Z towards the viewer. Preserve `room-plan.js` object positions and camera vectors in the first round-trip.
- Blender is Z-up. The exporter must apply/document the precise Y-up conversion. A source test mesh with visible X/Y/Z arrows must import in the intended orientation.
- Root GLB meshes must not include hidden corrective transforms that change camera framing. Apply scale and rotation in Blender before export, and record a non-destructive source master.
- World origin is fixed; asset origins are at the intended placement anchor. Moving parts use child nodes with meaningful pivots and **local axes**.

## 2. Required object/node naming, first iteration

`room-shell.glb` should expose `room_root`, `floor`, `back_wall`, `left_wall`, `right_wall`, `beams`, `window_opening` and `door_opening`. Walls must be genuinely segmented for openings, never solid surfaces behind an image.

`cabinet.glb` should expose the following hierarchy, with each movable tray as a separate transform:

```text
cabinet_root
  cabinet_case
  cabinet_rails
  cabinet_slot_finished
  cabinet_slot_drafts
  cabinet_slot_oddities
  cabinet_slot_fragments
  cabinet_slot_field_notes
  drawer_finished
    drawer_front_finished
    tray_finished
    folders_finished
  drawer_drafts
    drawer_front_drafts
    tray_drafts
    folders_drafts
  drawer_oddities
    drawer_front_oddities
    tray_oddities
    folders_oddities
  drawer_fragments
    drawer_front_fragments
    tray_fragments
    folders_fragments
  drawer_field_notes
    drawer_front_field_notes
    tray_field_notes
    folders_field_notes
```

- Each `drawer_*` pivot is positioned at its fully closed/rest origin; local translation runs along the one verified drawer extension direction. The current procedural prototype uses positive Z as draw-out movement in its local cabinet frame, but the Blender export proof must confirm orientation after coordinate conversion. No independent movement of drawer fronts versus trays.
- Drawer case must have real empty volume and correctly spaced openings. Drawers must not intersect hidden solid cabinet geometry.
- Folder nodes may have multiple child meshes; moving any folder must be a transform on the shared folder parent.
- Labels are geometry-attached texture/decals or mesh text on the proper drawer, not a camera-facing pseudo-sprite that separates under movement.

Other proposed nodes: `desk_root`, `desk_surface`, `desk_paper_*`; `bookcase_root`, `book_*`; `typewriter_root`, `typewriter_key_*`, `typewriter_platen`, `typewriter_paper`; `bin_root`, `bin_paper_*`; `door_root`, `door_leaf_hinge`, `door_handle`; `window_root`, `window_frame`, `island_*`.

## 3. Contract and quality checks for C4

- Exported GLBs must be parseable by the pinned loader, with all required node IDs present.
- The source file and exported binary must have identifiable provenance, fixed path, version and hash. External dependencies/textures must be bundled or referenced through validated same-origin URLs only.
- Bounding-box checks reject unexpectedly huge, zero-size or negative-scale meshes. Child objects should not drift after re-export.
- Verify closed, 50% extended and fully extended drawer geometry at the cabinet camera with screenshots/recorded evidence. Then open/close different drawers to verify state switching.
- Verify door hinge orientation, wall openings and the window's exterior visibility.
- Test a camera viewpoint different from the hero composition, to expose cheated 2D projections.
- Check UVs, roughness/colour-space mapping, normals, mesh/material budget, licence manifest, mobile memory impact and release size.
- A full-art master must remain editable. Do not substitute a generated concept picture for a Blender source scene or signed-off GLB.

## 4. First round-trip deliverable

**The cabinet is the first model.** Create a physically hollow but undecorated five-drawer cabinet with functioning `drawer_*` transform nodes, export a GLB through a reproducible pipeline, load it in the existing room in place of only the cabinet, and demonstrate three travel states and camera perspective. The appearance should remain intentionally untextured until the owner approves geometry and the art bible.

## 5. Scope

This file documents the **contract for future implementation**. No GLB or modelling toolchain is claimed to have been exported, installed or verified in C3A.

# DH-11C.3A — Existing scene geometry and camera audit

**Status:** source-level audit complete; browser screenshot and owner visual audit still required.  
**Audited source:** `prototypes/dh-11c-room/room-plan.js` and `room.js` on DaveHub staging at the start of C3A.  
**World contract:** 14 × 6.4 × 11 metres; right-handed Three.js Y-up; positive Z towards the overview camera.  
**Rule:** [ADR-0012](DECISIONS/ADR-0012.md). This source audit is not proof of a completed game-art model or WebGL screenshot.

## Baseline camera and interaction inventory

All values below are the existing **actual room-plan source values**, not estimates from generated imagery. Each target is a point in the one shared world. The final camera position/target may be refined only in a separately reviewed geometry/layout change.

| Stop | Target/object centre [x,y,z] | Camera [x,y,z] | Look at [x,y,z] | Existing click response |
|---|---|---|---|---|
| Overview | n/a | [0,4.2,12.9] | [0,2.05,-1.5] | Point-and-click room, seven focus controls |
| Desk | [-0.25,1.5,0.4] | [-1.1,3.15,5.5] | [-0.25,1.45,0.3] | Move paper stack |
| Cabinet | [-4.7,1.65,-3.2] | [-3.6,2.65,1.25] | [-4.7,1.72,-3.1] | Toggle five drawers independently |
| Bookcase | [4.75,2.15,-3.88] | [3.15,2.95,1.3] | [4.65,2.2,-3.9] | Slide a selected book forward |
| Typewriter | [1.05,1.58,0.8] | [1.55,2.66,3.35] | [1.05,1.5,0.72] | Press a model key; typed count |
| Bin | [-3.2,0.48,2.45] | [-3.4,2.5,5.5] | [-3.2,0.42,2.45] | Rummage and update paper state |
| Door | [6.9,2.25,-0.45] | [3.85,2.8,1.6] | [6.85,2.3,-0.45] | Rotate door leaf around group hinge |
| Window | [0.15,3.65,-5.37] | [0.8,3.5,1.45] | [0.15,3.6,-5.4] | View simple floating islands |

### Additional camera constraints

- The room uses a single PerspectiveCamera, FOV 51° desktop and 62° under 600 px; near/far 0.08/80.
- The renderer clamps device pixel ratio to 1.6. Camera focus interpolates with frame delta; reduced-motion snaps to target.
- No free-walking avatar; raycast object selection has native button equivalents.
- The camera is not independently generated for each object; stylistic comparisons must preserve these stops.
- A screenshot/visual-collision audit on desktop and mobile remains a manual/automated browser gate. Exact screenshot evidence has **not** been captured in this task.

## Existing room-object audit: what can be kept

- Room shell uses genuine world-positioned floor planks, walls, beams and a rug.
- Desk geometry has a top, legs, manuscript sheets, ink pot and lamp. Paper transforms change by interaction.
- Five cabinet trays use their own groups; their Z coordinates interpolate independently, and each front has a generated text label.
- Bookcase shelf geometry and individual spine meshes are in world space; selected books move in Z.
- Typewriter has individually positioned key meshes, platen and paper.
- Bin and several crumpled paper objects occupy distinct 3D positions.
- Door leaf rotates as a group; window contains a framed scene with actual 3D islands.
- Seven keyboard/touch object controls and Escape return already exist; this is the correct architectural foundation.

## Geometry defects to fix before expensive textured art

**G1, P0 — Cabinet is not hollow.** The cabinet body is created as one full solid `BoxGeometry(1.92,3.66,1.16)` with another full face behind the drawer groups. It is a credible blockout, but the current drawer meshes will intersect an unbroken body in a production model. **Required:** remodel the body as an actual open shell with five independent cavities and rails, then validate closed, 50%, 100% and reverse travel; do not use decorative black images as fake recesses.

**G2, P0 — Door and window openings are not cut into the walls.** The entire side wall is drawn as a solid full-height box, with an animated door superimposed. The back wall likewise remains solid behind the island-sky plane. **Required:** create architectural openings using segmented wall mesh geometry with correct framing; make the door lead to a meaningful exit space and the window look through the wall.

**G3, P0 — Object selection is too broad.** `capture()` registers every mesh in an object group for raycasting. Decorative meshes, internal walls and small props can compete with intentional handles/hotspots. **Required:** explicit selectable proxy meshes or named interaction nodes per object, and tests for picking priority.

**G4, P0 — Physical collision and camera clearance not yet validated.** The geometry works as a prototype, but floor/furniture occlusion, wall/door clearance and draw-out depth require real browser checks from all camera positions. **Required:** camera shot evidence and a geometry collision review, including mobile aspect ratios.

**G5, P1 — Some motion is a placeholder rather than a physical action.** The typewriter key stays depressed after typing, desk sheets rotate rather than lift, paper bin state updates may not produce visibly sufficient geometry change, and book selection can be subtle. **Required:** purposeful, independently reversible animation states and clear user feedback.

**G6, P1 — No actual asset/texture pipeline.** Surface colours are code-defined; there are no UV masters or GLB source files. **Required:** cabinet-first Blender/GLB model and validation pipeline with correct metres, local axes, pivots, UVs, texture map roles, source provenance and licensing metadata.

**G7, P1 — No browser-level perceptual evidence.** Successful unit/CI/HTTP checks do not prove frame rate, lighting, visual overlap, contrast or keyboard and screen-reader ergonomics under actual WebGL. **Required:** structured desktop/mobile screenshot and interaction QA before design sign-off.

## Proposed camera/reference capture checklist (uncompleted)

- Capture overview, desk, cabinet, bookcase, typewriter, bin, door and window with the **same prototype commit**.
- Repeat overview plus cabinet/desk/window at approximately 1920×1080, 390×844, 844×390.
- Cabinet: capture all drawers shut, one 50% extended, one fully extended and a drawer switch; look for physically exposed sidewalls, correct label readability and no clipped face.
- Door: capture shut/open and verify no intact-wall obstruction.
- Window: check real exterior visible through the opening when built.
- Compare Amber & Ink, Moonlit Archive and Golden Storybook at the exact same camera targets; capture changes to light/material, not to geometry.
- Record only actual measured screenshot/interaction results as **PASS**, not source inspection.

## Gate to DH-11C.4

The art bible and colour comparison are review candidates, not locked production assets. The owner must accept (or revise) the visual direction and priority. Before production modelling starts, C4 must prove a single GLB round-trip with correct metres, axes and named moving pivots, beginning with the cabinet and actual cavity geometry.

Related: [art bible](DH11C3_ART_BIBLE.md), [asset inventory](DH11C3A_ASSET_INVENTORY.json), [GLB node contract](DH11C3A_GLTF_NODE_CONTRACT.md).

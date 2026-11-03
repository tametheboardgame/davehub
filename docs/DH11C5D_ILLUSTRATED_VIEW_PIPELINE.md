# DH-11C.5D — Geometry-locked illustrated-view pipeline

**Owner direction:** Replace shader-only experiments with high-illustration camera-based presentation matching the *art quality* of the DaveHub homepage and earlier Writing-room concepts. Do **not** copy an unrelated room layout. Retain the approved interactive room, positions, pivots and true moving parts.

**Status:** DH-11C.5D.1–5D.2 technical reference/camera foundation implemented on staging. **High-illustration scene plates are not yet authored or approved.** Published Writing and production stay unchanged.

## ADR-0012 interpretation

Canonical sources are the existing `room-plan.js`, the validated furniture GLB, the Blender-authored cabinet model and the working `room.js` controller. Captured pixel guides must be rendered from these same components at the same fixed camera positions. Never create arbitrary independent open/closed pictures and put hotspots over them. Never use the illustrated plate to conceal or substitute inconsistent moving geometry.

## Delivery gates

1. **5D.1 — Lock camera contract:** derive the existing HOME plus seven `OBJECTS` views directly from room-plan.js. Do not change camera coordinates, FOV or target points. Publish a machine-readable 16:9 and tall-mobile projection contract, including raycast target anchor hints. Structural anchors are guides, not the interactive hitboxes.
2. **5D.2 — Same-source camera/depth reference:** provide a dedicated staging preview that loads the existing working 3D GLBs and supports exporting a PNG at the exact current canonical camera and a JSON guide with camera, projection, screen-space object anchors, state signature and dimensions. The screenshot is a **geometry reference only**, not the desired high-illustration final.
3. **5D.3 — Painted room overview plate:** author a detailed illustrated hero still based on the locked HOME camera, 3D geometry/depth/occlusion and existing DaveHub art. Review before further plates. Ensure highlights and prop silhouettes retain accurate spatial correspondence.
4. **5D.4 — Painted desk close-up:** derive from the existing desk camera. Demonstrate that the lamp, papers and typewriter preserve their physical states and coherent depth.
5. **5D.5 — Projection-aligned interaction surfaces:** retain actual 3D raycasting / state as source of truth; animated moving-object layers must be generated from the **same model and camera**, not from separately fabricated image frames. DOM markers can be a development overlay only.
6. **5D.6 — State and animation feasibility gate:** prove one drawer closed/half/open, one paper moving and lamp on/off using consistent rig/camera-derived rendering. Compare plate and motion layers at all intermediate states. Reject any technique with obvious perspective or edge discontinuities.
7. **5D.7 — Final staging experience and QA:** content approval isolation, camera transitions, mobile/desktop composition, keyboard/touch, reduced-motion alternative, asset sizes, cross-browser QA and owner sign-off before any real Writing page or production migration.

## DH-11C.5D.3A — Illustration/geometry alignment review

The first high-illustration candidate was generated separately for art-direction exploration. It is **not** a valid finished hero plate: it was not painted against an actual exported HOME screenshot and includes baked-in interface elements and furniture placement that has not passed geometry alignment. Do not publish it over the interactive scene.

The staging-only `/previews/dh-11c/illustrated-overview/?v=dh11c5d3a-align-v1` is a comparison bench, not an interactive replacement. It presents the **existing Writing-room illustrated key art as style reference** alongside the actual canonical 3D reference. It also projects the seven object centres from the HOME contract without inventing hotspots and allows an on-device comparison image to be displayed locally without upload or persistence. This makes it clear where illustration quality and geometry registration diverge.

**Acceptance still outstanding:** a new high-resolution hero image generated or painted using the actual exported HOME camera screenshot and geometry/depth constraints, with no text, numbered badges, navigation chrome, extra doors/windows or non-modelled interactive objects baked into pixels. Then review landmark alignment across desktop/mobile crops, plus support for 3D moving objects that can remain coherent as states change. No promotion until owner accepts both artwork and projection.

## Reference workflow

- Keep the existing C5B/5C previews for direct comparison.
- Review each exported reference image against the *same fixed perspective* before commissioning illustrated artwork. The new route deliberately offers no fake high-illustration placeholders.
- All exported JSON and captured previews must identify the scene, aspect, camera target, projection and current interactive state. Files are downloaded explicitly by the reviewer; no personal content or telemetry is uploaded.
- A plate is not considered valid until it can be overlaid onto the canonical 3D capture with walls, desks, bookcase, cabinet and door/window frames aligning without contradictory vanishing points.
- The camera contract uses no user position or identification and contains no unpublished manuscript text.

**Canonical QA:** seven focus positions plus HOME, 51-degree desktop and 62-degree narrow mobile vertical FOV, 0.08 near plane, and 80 far plane. These reflect the **current** runtime and must be updated together if the camera model changes. All art production remains behind visual owner approval.

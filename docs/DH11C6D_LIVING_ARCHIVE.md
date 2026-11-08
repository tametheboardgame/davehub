# DH-11C.6D.1–3: Living filing cabinet, staged owner review

**World:** DaveHub Writing / The Manuscript Hoard  
**Scope:** Canonical Cloudflare staging at `/worlds/writing/` only. **No changes to production/main.**  
**Architecture:** ADR-0012, geometry before illustration.

## User experience

1. Focus the existing filing cabinet or click a real drawer front. Five labelled 3D drawers still slide along their original +Z pivots. Only one opens at once; switching drawers returns the previous one.
2. Each drawer contains four **real meshes**, now given distinctive coloured covers, layered paper faces, individual raised tabs and handwritten-style tab textures. They remain children of their original drawer group, not visual overlays.
3. With a drawer open, click a labelled folder. It lifts 0.25 m and advances 0.39 m within the same Three.js scene. The shared camera and drawer must settle, then a 180 ms completed-pose hold is shown before an illustrated archive-folder `dialog` opens.
4. The large folder looks like a physical file, with tab, insert, handwritten-paper treatment, title, publication or fictional-sample status and synopsis. The responsive modal has accessible close/Escape/backdrop behaviour; closing returns the real folder to its original drawer position.
5. A related-project action, when present, leads to the **existing** 3D bookcase/paper/typewriter interaction. Published books pull out under the previously approved motion-first policy. Fictional manuscript samples slide out on the desk. Invented Oddities can open the typewriter workshop.
6. Keyboard fallback: select Filing cabinet, **Explore further**, open a specific drawer with a real button and choose an approved or clearly fictional folder using keyboard-operable buttons. Touch uses the same raycaster.
7. Returning to the whole room, switching focus, reversing a folder or changing drawers clears pending reveals. No arbitrary click-to-popup delay, fake 2D cabinet states or loss of original drawer mechanics.

## Content approval boundary

- **Finished:** The three previously public and verified editions, with their exact public catalogue titles, descriptions and stable book IDs; the shelf remains the source of purchase/cover details.
- **Drafts:** Only three previously exposed, explicitly **fictional demonstration** snippets from the existing manuscript reader. No actual drafts were inferred or disclosed.
- **Oddities, Fragments, Field Notes:** Entirely invented sample folders, all explicitly labelled as inventions. No names or information from private projects or Drive.
- **Unfilled physical slots:** Visible unlabelled spare folders. Clicking one never opens unapproved content.
- The cabinet catalogue is a deterministic composition of the existing public books and the explicitly labelled sample reader, plus locally declared fictional props. It is not an ingestion pipeline and has no write APIs.
- Related links navigate inside the existing room and never create new public projects or publish material.

## Real geometry and safety

`cabinet-folders.mjs` reparents each of the 20 original physical folder meshes beneath a new animation holder that is itself a child of the same existing named drawer. It adds only attached child geometry and original CanvasTexture title tabs. The existing Blender-validated hollow cabinet GLB, five drawer pivots, movement maths, room camera, painterly art, door, 3D book pull-out, paper movement and typewriter remain untouched. The procedural fallback uses the same naming contract.

One pending folder reveal at a time, with a frame-driven check for actual selected folder movement, actual drawer extension, camera position and camera aim. A selection change or drawer close cancels the old pending reader. Folder motion reverses smoothly rather than snapping.

## Release and QA

- Stage renderer `scripts/render-dh11c6d3-filing-cabinet.cjs`, opt-in `data-cabinet-archive="true"`.
- Tests: `tests/dh11c6d-cabinet-archive.test.cjs`, together with all earlier core regressions, packaged-assets checks, game smoke and read-only HTTP smoke on Cloudflare.
- Acceptance: owner visually checks top and bottom drawers, folder visibility/labels, physical pickup and return, overlay position, narrow screen, touch, keyboard and reduced motion.
- Production `davehub.co.uk` and the `main` branch stay unchanged until separate explicit approval.

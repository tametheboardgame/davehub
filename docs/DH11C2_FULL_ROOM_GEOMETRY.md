# DH-11C.2 — Geometry-first complete Manuscript Hoard room

Status: implementation committed on a staging feature branch; visual/owner approval pending. **This does not replace /worlds/writing/.**

## Decision

After perspective inconsistencies in independently AI-generated cabinet states, the owner approved extending the shared-geometry approach from the successful DH-11C.1 cabinet proof to the *entire Writing room*. No walking avatar. The scene is an explorable place, not a conventional grid of content cards.

## The vertical slice

Prototype URL after staging deployment: `/previews/dh-11c/room/`.

The camera enters a single three-dimensional room, containing:

- real floor planks, walls, wooden beams, rug, lighting and atmospheric depth;
- **writing desk** with lamp, papers and surface geometry; inspect and move sheets;
- **filing cabinet** with five physical 3D drawers; choose a drawer to extend it in the fixed room coordinate system;
- **bookcase** with individually modelled books; pull one forward;
- **typewriter** with separately modelled keys, roller and paper; press a key;
- **overflowing bin** with loose low-poly papers; rummage;
- **exit doorway** with an independently hinged door; open it and return to the DaveHub islands;
- **floating-islands window** built from simple geometric island shapes and frames.

Clicking a world object or activating its corresponding accessible HTML control changes the camera's position and look-at target. There is one actual camera and one three-dimensional coordinate system. The visitor can return to the whole room with the dedicated control or Escape. A contextual action tray provides an accessible counterpart to every prototype interaction. No content gating or additional publication is introduced.

## Implementation choices

- Three.js r159, **pinned and vendored** under `prototypes/dh-11c-room/vendor`, with its original MIT licence. No runtime CDN.
- Procedural Mesh/Geometry construction from first-party JavaScript. No fabricated image states or external textures. Material colours and physical shapes are placeholders to test the composition.
- Pure state plan `room-plan.js`: immutable room objects, focus coordinates, legal mechanics and bounded state changes. Separate from the renderer, so Node tests do not require a browser.
- Client `room.js`: WebGLRenderer, scene/camera, lighting, furniture models, native raycasting, camera interpolation, object transitions and native HTML controls.
- Responsive `room.css`: canvas fills the allocated frame; navigation remains accessible on touch/mobile; motion-reduction preference bypasses camera tween.
- If WebGL is unavailable, the labelled object navigation remains available and explains the limitation. The existing published Writing room is not modified.
- No object text or catalogue fetched from repositories or connected data. This is a **mechanics prototype**, not a published creative gallery.

## Acceptance gates

1. Run `tests/dh11c-room.test.cjs` alongside all earlier DaveHub tests in GitHub Actions. Assert coordinates, seven object identities, bounded state transitions, valid ES module syntax, pinned same-origin runtime, and absence of fictional/private catalogue contents.
2. Cloudflare Pages feature preview builds and serves JS, CSS, HTML and vendor assets.
3. Merge only after green tests. Then inspect staging `/previews/dh-11c/room/` and re-run hosted HTTP smoke, full game verifications and published editing checks.
4. Owner reviews the camera, navigation, room layout and interaction response on desktop and mobile. **Visual approval is a separate step; passing source/HTTP checks alone does not prove WebGL presentation quality.**

## Future follow-up

After owner approval, apply the weathered teal/brass, illustrated interior as surface materials/textures on the **same geometry**. Improve real folder extraction and paper movement, add readable approved catalogue entries, and integrate the scene into the Writing world only after an explicit owner staging approval. Expansion to other DaveHub islands should reuse the coordinate/camera/input model but allow distinctive room mechanics, not force one generic template.

Production domain `davehub.co.uk` remains unconfigured. No public catalogue source markers, games, or current Writing scene were changed in DH-11C.2.

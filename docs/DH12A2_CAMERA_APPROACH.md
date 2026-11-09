# DH-12A.2: Move into the actual theatre objects

**Status:** Staging-only close-up camera interaction, pending owner visual review.  
**Baseline:** DH-12A.1 Impossible Theatre preview deployed and approved as a promising start. The DH-11C Writing Room’s smooth shared-camera focus is the interaction reference.

## Reported requirement

From the opening theatre overview, selecting a mechanism should move the visitor **in towards that object**, exactly as furniture inspection does in the Writing Room. The original theatre was a static wide camera while its curtains, revolving platform and record moved at a distance. The physical stage and objects are already correct; change the view, not the geometry.

## Interaction contract

- **Selecting the curtains:** the same single Three.js camera approaches the proscenium and its two genuine folded-mesh sliding rails. The physical curtains also open or close in response to the click.
- **Selecting the revolving stage:** camera glides closer to the physical shared rotating platform and its three sets. The stage rotates its existing 120° step. Subsequent clicks rotate again without moving the camera elsewhere.
- **Selecting the record player:** camera glides in much closer to the physical wooden deck, real grooved record and independent tonearm. The existing start/stop motion remains in place.
- The buttons in the existing control panel use exactly the same combined focus + mechanical behaviour as touching an actual mesh in the scene.
- The small **Whole theatre** button remains visible in close-up, and **Escape** returns to the overview. Clicking empty scenery also returns to the overview, without changing any curtain, stage or record state. **Put everything back** continues to reset all mechanical objects *and* now returns to the wide camera.
- Camera position **and** aim are interpolated continuously each animation frame, never teleported or modelled as a series of images. All mechanisms stay in one coherent Three.js coordinate system. Reduced-motion users snap the camera to the intended view.
- On narrow screens, the actual objects must still fit the camera’s horizontal field of view, not be zoomed so far that most of the curtains/stage are clipped. The camera aims slightly below the physical centre on phones, raising the object away from bottom controls.
- The initial full-room view is unchanged for ordinary desktop aspect ratios. A small floating label indicates what is being inspected. The original panel and stage still operate without a pointer.

## Safety, compatibility, release

This remains the separate `/previews/dh-12a/listening-room/` study; **do not** replace the Music landing page or copy into `main` yet. No music, lyrics, scores, audio, public identities or other unpublished content are introduced. Geometry, colour/materials and record mechanism remain those of DH-12A.1. The Writing Room, game routes and publication catalogue are unchanged.

Technical components: `prototypes/dh-12a-listening-room/theatre-camera.mjs` (pure camera poses and responsive framing); changes to existing `theatre.mjs`, `index.html`, `theatre.css`. `tests/dh12a2-camera-focus.test.cjs` covers distinct approach poses, narrow aspect ratios, keyboard and pointer return, preserved mechanical interactions, and required Cloudflare source assets.

**Owner test:** Click each physical object or its accessible button from the overview. Verify that the scene moves in, stays in when interacting again, returns smoothly via Whole theatre/Escape/empty background, and that the Music page itself remains unchanged.

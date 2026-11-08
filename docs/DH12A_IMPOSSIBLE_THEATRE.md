# DH-12A.1: The Impossible Theatre, initial geometry-first Music world

**Checkpoint:** Writing Room fully approved through DH-11C.6E.1 and selectively committed to main via PR #114. No further Writing development until connecting publication-approved content.  
**New world:** Music, originally titled *The Listening Room* in the DaveHub world catalogue.  
**Preview scope:** `/previews/dh-12a/listening-room/` on Cloudflare staging, not the public `/worlds/music/` route.  
**Phase:** First physical layout and interaction demonstration, no music assets/content yet.

## Creative direction

Not a flat albums page, a conventional streaming player, or a copy of the Writing Room. Imagine a miniature theatre that should not quite fit inside its own room: an enormous semicircular proscenium, improbable physical scenery, two curtains which can slide into the walls, three different little stages on one rotating floor, and an ornate record mechanism perched near the audience.

The visitor should feel they are pulling strings on an impossible mechanism, not selecting HTML tabs. Future approved musical works can inhabit **Songs**, **Shows**, and **Characters** as physical theatre sets. Nothing is published by the concept.

## Physical mechanisms, all in one Three.js space

1. **Velvet curtains:** Two actual wavy, double-sided cloth meshes generated from indexed geometry and attached to independent physical rail groups. One click causes both to translate from the centre to the sides, revealing the actual stage behind them; click again reverses the translation.
2. **Revolving stage:** A single circular 3D floor holds three framed physical miniature set pieces. Clicking the actual stage rotates the entire stage group by a deterministic 120° step to bring the next set face to the audience; clicking the next act continues from the current orientation without teleportation or swapping images.
3. **Silent gramophone:** A 3D wooden plinth, genuine grooved record mesh and separate tonearm pivot. Clicking the player starts or stops *mechanical motion only*. There is **no sound playback or copyrighted content** in this release.
4. **Shared geometry:** One perspective camera, coloured spotlights, real arch, stage boards and physically modelled detail. No image-backed moving states. Design follows ADR-0012 before any illustration/art pipeline.
5. **Accessible alternative:** Native button controls perform exactly the same state transitions; pointer/touch raycasting detects actual geometry. Native status text provides an accessible description of what changed.
6. **Responsive stage:** Full-viewport physical scene, compact non-obscuring control surface, mobile and short-height support, reduced-motion CSS.

## Publication and release boundary

- The preview remains **`noindex,nofollow`** and does not replace `/worlds/music/` or link to any music records.
- No real songs, lyrics, audio, covers, scores, characters, unpublished musical scripts or portfolio/project identities are copied, implied or linked.
- The eventual Music world catalogue is a separate publication decision with explicit rights and attribution review. No autoplay in any case.
- Do not copy assets out of the Writing Room source except the already redistributable Three.js module and its existing licence text; future world art is separate.
- `main` and `davehub.co.uk` are unchanged. Staging preview gets owner review before any replacement of the existing Music page.

## QA and next pass

New pure tests validate curtain endpoints, stage rotation semantics, tonearm/record independence, reversible state transitions, 3D source markers, content safety and staging-only routing. The entire DaveHub build and hosted Cloudflare HTML/JS/CSS source verification must pass.

**Owner visual review:** Decide whether the unusual little theatre has the right atmosphere and scale before replacing any Music world page. In the next refinement, choose how the sets change and how real approved musical projects would appear; do not add audio now.

# DH-12B.5: One-click Music journeys and a cleaner, richer interdimensional foyer

**Owner feedback (9 November 2026):** The World Between Notes is visually strong but needs refinement. Selecting a physical door must open it, allow the real camera to approach and then **automatically enter** the next world without a second click. The foyer's textures should be richer, and overlapping signs/cards/text should no longer crowd the scene.

## Navigation: one deliberate selection

- A **single click/tap** on either actual 3D doorway or the compact accessible destination controls selects a fixed local route.
- Both existing physical leaves hinge open; the shared Three.js camera travels to the selected threshold. The real camera position/aim and both door angles are checked each animation frame.
- When both leaves **and** the camera finish their movement, the route opens automatically. The visitor is never asked to click Enter a second time. Motion is not replaced with an artificial timer, and no scene image substitutes for real door geometry.
- The transition has a one-shot `entering` guard. A repeated click on the same door does nothing; tapping the other doorway before entry changes the selected destination. Escape or **Cancel journey** returns to the full room until navigation actually starts. Browser Back/Forward Cache restores the foyer correctly.
- With WebGL unavailable, native accessible buttons still navigate without requiring a broken animation. Routes are restricted to the two local published *staging previews* and never assembled from arbitrary inputs.
- Real 360° drag orbit, vertical pitch, wheel/pinch zoom and keyboard controls still work **before** selecting a destination. Orbit is locked during the short automatic doorway journey so a gesture cannot prevent the arrival threshold from completing.

## More material detail without external assets

`foyer-surfaces.mjs` procedurally creates original 512×512 painted material maps for worn gilding, veined moonstone, aged dark stone, burgundy velvet, grained timber, painted teal enamel and creamstone. The maps are attached to **physical** Three.js meshes as colour and subtle relief/bump, retaining the sculpted platform, door leaves, frames and decorative details.

A dedicated 1536×350 physical marquee sign is generated for each entrance. It uses a restrained framed plate, big clean **THEATRE** or **RECORD SHOP** lettering, and a distinctive simple theatre mask or vinyl symbol, with contrasting plum or teal material. The text is intentionally short and readable. The previous animated cosmic art, sculpted theatrical masks, footlights, hovering vinyl decorations and ornate arches remain.

No network image downloads, copyrighted album covers, unapproved songs or private content are added.

## Remove duplicate overlay clutter

Previous foyer accumulated a full-width two-card information panel, floating projected destination cards above the actual physical signs, a scenic invitation paragraph, orbit instruction bar and a verbose footnote. Together these obscured the scene, especially on tablets.

The revised foyer keeps only:
- The existing compact DaveHub world **top banner**.
- The single physical sign on each actual doorway.
- Two small, accessible destination controls near the bottom, important on touch and keyboard or without WebGL.
- One closed-by-default **View controls** disclosure with Reset view.
- A small **Cancel journey** action visible only during the approach; the status announcements are screen-reader accessible but not visibly over the scene.

The copy is intentionally short. Visitors should read the 3D scene first, not a layer of web cards.

## Release and acceptance

- Implement directly in `prototypes/dh-12b-music-world/`, then deploy **only to `staging` and `davehub.pages.dev`** for owner testing. Preserve `main`, `davehub.co.uk` and the approved GitHub WIP checkpoint.
- The Impossible Theatre and Record Shop retain their existing independent scenes and content boundaries.
- New tests verify all combinations of physical door and camera settle state, one-shot navigation, WebGL fallback, cancellation, accessible controls, absence of duplicate sign panels, deterministic pigment variations, real textured sign generation and source-asset packaging.
- Acceptance: click Theatre once, watch both hinged doors open and the camera approach, arrive automatically inside the Theatre. Return and click Record Shop once, verify automatic entry there. Orbit beforehand; try Escape mid-journey. Confirm no text clutter masks the floating island and new textured surfaces have visibly more variation. Test on mouse, touchscreen and keyboard.

**Current state:** Awaiting owner visual approval of the staged iteration. This release does not automatically connect real audio, musical content or the final production domain.

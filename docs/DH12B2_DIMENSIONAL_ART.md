# DH-12B.2: Make the actual Music world feel like an impossible dimension

**Owner correction:** Concept illustrations were not the requested deliverable. Change the **actual DaveHub scene source and hosted 3D experience** so the existing mystical foyer and Record Shop move substantially closer to the earlier fantasy concept artwork. No more standalone mock-ups as a substitute for the site.

**Branch and release:** feature -> `staging` -> `https://davehub.pages.dev` for visual review; do not update `main`, `davehub.co.uk` or canonical `/worlds/music/` without a further release decision.

## Art direction translated into working geometry

The main visual principle is that the Music foyer and the Record Shop should look like places **outside normal physical space**. The camera, actual hinged door movement, crate extraction, shop interactions and deliberate enter sequence from DH-12B.1 are preserved.

### Foyer, The World Between Notes

- **A painted cosmic void**, not a solid-colour background. A locally created 1536×768 canvas texture uses layered soft nebula pigments, approximately 900 individual stars and varied teal, indigo, violet, rose and moon-gold clouds, mapped to a giant spherical sky around the actual Three.js scene. No downloaded external media.
- **A physically fractured floating crossroads:** 36 individual hovering moonstone shards surround the unchanged solid circular island, with engraved concentric runes, radial crossing paths and small gold sparks. Shards move slowly rather than appearing as decorative CSS.
- **Architecture with impossible depth:** two separate hanging staircases of genuine stone treads climb away into the cosmic void and fail to reach a landing; three orphaned gilded arches float beyond the island. Dimensional dust and hanging luminous lanterns occupy actual 3D space.
- **Musicals portal:** the existing two door hinges and actionable inscriptions remain. Add sculpted gilded ribs, physically folded burgundy theatre velvet, small gold ornaments, masks, theatrical drapery and a subtly animated pink/violet portal veil **behind** the real door leaves.
- **Record Shop portal:** the second pair of real door leaves remain actionable. Add teal/copper architectural ribs, a large floating vinyl crown with record grooves, luminous sleeve silhouettes, orbiting jewels and a moving emerald-teal portal veil.
- Both veils use a lightweight local GLSL shader with animated ribbons and stars, **not image frames representing door opening**. Their materials animate but the door itself must still physically move and settle before the user can enter.

### Record Shop, an occult music den

- **Replace the boxed-in room feeling** with short physical side parapets and a low rear wall, exposing a cosmic vault through tall open architectural gaps. Copper/wood pilasters, crooked capitals, arch-shaped window frames and curling vines surround the real shelves.
- Preserve all three actual pull-out record crates and their blank unpublished sleeves. Sculpt around their existing physical mounts with curved copper braces, glowing celestial beads and uneven shelf curiosities.
- **Ritual listening altar:** retain the existing physically rotating, grooved disc and independent tonearm. Add a real engraved multi-ring moon-and-record floor sigil with twenty-four radial rays, floating crystal embellishments and an airborne spinning halo.
- **Impossible vertical space:** eleven individually moving unlabelled floating vinyl discs, a winding back staircase, hanging lanterns, hovering copper record-mobile, and atmospheric colour separation create impossible, layered shop depth without adding real music or fake releases.
- A subtly stylised CSS treatment makes the controls resemble translucent illustrated plaques, leaving the actual scene dominant instead of hiding the environment behind modern generic panels.

### Motion, access and rendering

- The shared `dimensional-art.mjs` module exports `buildFoyerDimension` and `buildRecordDimension`; both environments retain their existing movement/selection controllers and simply add `dimension.update(delta)` to the original animation loop.
- The nebula, shards, lanterns, particles, floating records, portal veils and mobile have deliberately restrained, slow motion. Reduced-motion clients retain the physical geometry and a static equivalent visual without environmental drift.
- Existing WebGL renderer now uses ACES tone mapping and tuned exposure, with gentler fog so background worlds remain visible. All 3D decoration is non-interactive and excluded from existing raycast arrays so it cannot steal clicks intended for the actual doors, crates or turntable.
- The same original semantic buttons, status announcements, Escape and back links remain. Doors retain the two-step motion-first entry gate.
- The sky and scene textures are generated locally in the browser and never fetched, avoiding missing media and creative copyright concerns. The planet/record forms are original geometric design, not copies of real cover artwork.

## QA and acceptance

- Tests check deterministic sky layer and floating-shard positions; genuine 3D portals and their unmodified physics; the 3D shop with real pull-out crates, arm and disc; route integrity; CSS, stage markers and reduced motion; and that both previews publish the new shared visual module with correct MIME types.
- The full DaveHub build, two game regression suites and staged Cloudflare hosted smoke must pass.
- From the **foyer**: check cosmic sky, floating island edge, crooked stairs, musical runes and distinctive glowing portal interiors. Select either doorway and verify both real hinged leaves, camera approach and Enter still function.
- From the **Record Shop**: check that it feels open to impossible space, floating vinyl/runes and lanterns are visible, rack pull-outs work, the silent disc and tonearm behave as before and returns go to the foyer.

This pass raises the actual 3D site visually towards the concept, but does **not** purport to be a one-for-one photorealistic reconstruction of a 2D painted illustration. A later authored sculpting/texture pass can refine the geometry after owner visual review.

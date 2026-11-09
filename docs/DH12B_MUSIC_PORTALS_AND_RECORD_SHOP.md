# DH-12B.1: The World Between Notes

**Status:** Staging-only connected world concept, pending owner visual review.  
**Owner direction (8 November 2026):** The Impossible Theatre should hold musicals and stage productions. Standalone songs, albums, bands and other music projects require a different place. A physically navigable Music staging world with doors or portals must sit *before* either destination.

## Three independent destinations

- **The World Between Notes**, a surreal 3D musical crossroads at `/previews/dh-12b/music-foyer/`. This is the actual entry hub for the two worlds, not a plain navigation list.
- **The Impossible Theatre**, established geometry at `/previews/dh-12a/listening-room/`. Its existing cloth curtains, moving stage, miniature sets and camera remain, but this room is now exclusively for **musicals, stage productions, dramatic characters and their songs**. The current Songs / Shows / Characters miniature sets are fictional **mechanical studies**, not a permanent genre taxonomy or published works.
- **The Record Shop**, a distinct new 3D environment at `/previews/dh-12b/record-shop/`. This will ultimately hold individual songs and singles, bands and musical-project links, albums and EPs. None of these categories is automatically filled from unpublished sources.

## Music-world foyer interaction

The lobby is a real single Three.js scene: a floating circular wooden-and-moonstone crossroads, gilt inlays, floating music-note meshes and two free-standing vaulted entrances. One door is deep pink and theatrical; the other is green-blue and records-oriented. Both have genuine ornate arch geometry, independent hinged door leaves, physical handles and selectable inscriptions.

1. Choose a door by clicking the actual modelled leaf/inscription or using its accessible native button.
2. Both leaves physically hinge open as the shared camera glides towards the selected doorway.
3. When **both real leaves and the camera have settled**, the same button changes to **Enter [destination]**. A second deliberate click navigates to its fixed same-origin preview route.
4. Choose another doorway to reverse the first door, open the next and move the camera to its new position. **Both doors**, Escape or clicking the empty scene returns to the crossroads without navigating.
5. Narrow screens move the camera back to retain both doorways; reduced-motion users get an immediate equivalent view.
6. With WebGL unavailable, the accessible controls can still open then enter the declared destinations. The portal never constructs a destination from user-controlled text.

The foyer offers a back link to the currently published Music world but does **not** replace that canonical page until explicit owner approval.

## Record Shop interaction

It is a separate walk-in shop, not a resized theatre or another generic catalogue card. The physical geometry contains wooden floorboards, shelving, a decorative ceiling, a central rug and pendant, counter, three independent timber racks, and a grooved record player with actual tonearm pivot.

- **Songs & singles:** a real rack with an individually animated pull-out crate, reserved unprinted sleeves and colour variations.
- **Bands & music projects:** a different rack and pull-out crate where approved bands and project identities can later be attached to their own records.
- **Albums & EPs:** a third rack with the same physical movement but its own colour and intended catalogue type.
- **Listening station:** a real disc and tonearm which can spin silently; there is no music or stored visitor data.
- Clicking a physical rack or its native control slides that actual crate out and smoothly approaches it with the shared shop camera. Repeating closes it; selecting another moves the view and returns the previous drawer. **Whole shop**, Escape or clicking empty background returns the overview.
- A clear back link leads to The World Between Notes; this is bidirectional navigation, not a dead-end.
- Blank physical record sleeves are explicitly unassigned placeholders, **not fictional songs being passed off as the user's real work**. Future authorised links to streaming services and band sites will be an editorial content job.

## Boundaries and acceptance

This stage exists only under `/previews/` on **`davehub.pages.dev`** and advertises `noindex,nofollow`. The canonical `/worlds/music/` route, `main`, `davehub.co.uk`, the completed Writing Room, game builds and all existing approved publication data remain untouched. There are no real recordings, lyrics, album covers, private scripts, personal artist names or external embedded music assets.

**Visual review:** From the foyer, open each door and inspect the movement before entering. Enter each world and return. In the Record Shop pull all three categories out, inspect the listening deck, and test overview/keyboard/narrow-screen behaviour. In the Theatre confirm the Music-world return leads to the foyer. Decide whether the crossroads and record-store environment should replace the canonical Music landing later.

**Implementation:** `prototypes/dh-12b-music-world/` contains the two HTML entrypoints, shared CSS and separate ES modules for the 3D foyer and record shop. `tests/dh12b-music-world.test.cjs` covers routes, motion, separation, safe data and build integration. Cloudflare staging smoke checks the hosted HTML/CSS/JS and real WebGL library files, not just a branch build.

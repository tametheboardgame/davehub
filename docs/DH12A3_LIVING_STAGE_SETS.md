# DH-12A.3: Three living stages inside the Impossible Theatre

**Target:** DaveHub staging preview at `/previews/dh-12a/listening-room/`.  
**Decision:** Develop the approved close-up camera and physical theatre into something more distinctive before attempting the illustrated final art pipeline or connecting any actual music.

## Why this stage

The DH-12A.1 mechanical blockout and DH-12A.2 Writing Room-style camera approach work, but the original three revolving stage mounts still share near-identical framed generic panels. This stage differentiates them with handcrafted **actual 3D scenery**, rather than HTML content cards, flat image swaps or any unapproved music.

## Three real scenes

1. **Songs, The Clockwork Chorus.** A tiny silent organ with five physical chime pipes, turning brass gear, nine teeth, two songbirds with actual articulated wings and a miniature star-ring. Winding the set starts the gear and bird movements; a second click lets them settle back to rest. *No audio and no excerpts of songs.*
2. **Shows, The Theatre Within.** A smaller ornate stage hidden inside the big one. Two differently painted physical flats swing away on separate pivots; a skyline rises from behind the arch and the comedy-and-tragedy medallion tilts. A second click brings the flats shut and lowers the scenery.
3. **Characters, The Marionette Assembly.** Two puppets modelled from individual bodies, faces, jointed arms, legs, moving heads, control crossbars and attached strings. Activating the set makes them bow and wave, and deactivating returns all joints to their resting poses.

The main stage's *real* 120° revolution still carries the three set groups. The new movable scenery is directly parented under each stage's existing named mount, so it follows the platform naturally. A physical stage fly-gallery surrounds it, with pulley wheels, hanging ropes, theatre balcony brackets, an illuminated footlight row and an engraved front-stage inscription. These are static world geometry, not attached to the revolving disk.

## Interaction, camera and safe content

- The existing curtain, revolve and record player controls still work. Their mechanisms and camera paths are unchanged.
- **Bring Songs/Shows/Characters to life** acts on whichever real miniature is currently facing the audience, automatically opening the velvet curtains if needed and approaching the stage via the established shared camera. The button becomes **Let ... rest** when active.
- Clicking a **real physical central prop** inside the active scene toggles that same mechanism; clicking the original revolving platform still turns the stage. No invisible overlay pick targets.
- Changing acts ends the previous scene's animation. A global reset restores all original mechanical states, and **Whole theatre** or Escape returns only the camera.
- The theatre spotlights smoothly change colour to suit each physical scene. No image swaps, sound output, performance recording, scores, real characters or commercial project details are loaded.
- The three fictional prop titles are **design metaphors**, not actual named works in the user's catalogue.

## Review and release boundary

The preview remains no-indexed at `/previews/dh-12a/listening-room/`. Do not touch `/worlds/music/`, `main`, `davehub.co.uk`, or any Writing Room or game routes. Staging CI checks the full DaveHub build; explicit source tests validate all three real mounted set groups and reversible articulation; Cloudflare smoke verifies the actual hosted JavaScript, Three.js, HTML and CSS.

**Owner review:** Test all three sets from the theatre overview and from close-up, activate and deactivate each, turn the shared stage several times, return home, and judge whether the different scenery is visually distinct and worth taking to the full illustrated style pass. Art direction, layout and real content remain later decisions.

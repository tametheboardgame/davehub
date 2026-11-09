# DH-12B.3: Writing Room banner, orbital foyer and distinctive portals

**Owner feedback (9 November 2026):** The new mystical Music foyer and Record Shop are working and visually successful. The foyer needs (1) the compact branded top banner used in the Writing Room, (2) free user-controlled rotation, like Google Earth, and (3) clearer physical signs and more immediately recognisable theatre and record-shop doorways.

## Release boundaries

- Implement this directly in the existing **Three.js foyer**, staged under `/previews/dh-12b/music-foyer/` on `davehub.pages.dev`.
- Preserve the established record-shop preview, musicals theatre, working two-step portal entry, content publication gates, game builds and Writing Room.
- Do not update the canonical `/worlds/music/`, `main`, `davehub.co.uk`, unpublished project data or audio.
- The current approach remains geometry first, with illustrative colour and effects layered over the genuine meshes.

## Familiar top banner

Move the foyer's main page identity into a compact top strip matching the approved Writing Room's proportions: genuine DaveHub SVG logo on the left, small "THE MUSIC WORLD" label and "The World Between Notes" title centred, **Music island** navigation on the right. Dark translucent surface, subtle gold line and modest height protect scene visibility. A brief exploration invitation sits below; it is hidden on narrow screens. The stage remains full viewport behind the overlay.

## Orbit and zoom, not fake scene rotation

A new pure `foyer-orbit.mjs` handles spherical camera positions around an actual world-space point:

- **Mouse drag:** physically orbit the camera horizontally through 360° and vertically between safely bounded elevations. Preserve independent world position and geometry; do not rotate the island model or re-render an illustration.
- **Mouse wheel:** zoom between capped near and far distances without scrolling the page.
- **Touch:** one-finger drag orbits; two-finger pinch zooms. Distinguish drag/pinch from tap so the user never accidentally opens or enters a portal while navigating the camera.
- **Keyboard:** arrow keys rotate, plus/minus zoom, Home and **Reset view** restore angle and distance. Native buttons and canvas keyboard focus remain accessible.
- **Door focus:** choosing a portal resets the orbit offset then moves to its original doorway camera pose, opening the actual hinged door. Orbit and zoom remain available while examining that doorway. **Both doors** and Escape return to the full crossroads. The original requirement that both hinged leaves **and the camera** finish moving before Enter becomes available remains enforced.
- A lightweight hint tells visitors how to rotate and zoom. On touch/mobile, upper/lower pitch and zoom bounds protect scene visibility.

## Portals with visual purpose

Make a clear distinction between the two **3D** thresholds, not simply different coloured arches:

- **The Impossible Theatre:** clearly legible physical marquee labelled THEATRE, gilded trim, individually attached fluted burgundy stage panels, a row of real footlights along each hinged door, small mask faces with carved eyes and mouths, plus the previous theatre ribbons and velvet.
- **The Record Shop:** distinct physical marquee labelled RECORD SHOP, copper/teal framing, large modelled vinyl plates with concentric grooves attached to the hinged doors, coloured record centres, small hanging blank record sleeves, plus the existing interdimensional vinyl crown and shimmering gateway.
- **Readable from an orbital view:** an unobtrusive, high-contrast HTML sign is projected each animation frame from a point above each physical arch into the current camera view. The sign remains aligned to the world object through orbit and zoom, disappears when behind camera or over UI obstructions and is itself a working, accessible portal trigger.
- None of the new scenery steals raycasting from the physical doors; real 3D leaflet clicks and existing action buttons still operate the original two-stage entrance.

## Acceptance checks

1. **Visual:** Logo/centred title/return link visible in a slim top banner, without giant overlay panels. Both theatre and record-shop entrances look distinct at first glance. Legible physical and camera-attached signs remain understandable while orbiting.
2. **Camera:** Full turn by dragging, vertical rotation, wheel zoom, touch pinch, drag does not trigger a click, Reset view returns the current camera target to its original pose. Arrows and zoom keys work when the canvas is focused.
3. **Mechanics:** Opening either real portal still turns both actual hinged door leaves, moves the camera in, and only offers Enter when the door and camera have physically settled. Returning to both doors does not navigate.
4. **Safety:** The current Record Shop and musicals Theatre remain unchanged. No audio, album covers, unreleased songs or automatic content ingestion.
5. **Delivery:** Core tests and game regressions pass; Cloudflare staging hosts the latest foyer HTML/CSS/JS, new orbit module and original licensed Three.js with correct MIME types. Owner visual review remains required before any live-route promotion.

This is the **real website code**. No further concept rendering is required for DH-12B.3.

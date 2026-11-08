# DH-11C.6C.2 — Physical movement first, reader second

**Status:** Staging review only. **Owner concern:** the very 3D motions that made the room interesting were obscured by dialogs opening immediately on click.

## Interaction contract

### Desk

- Click a sheet from overview or desk focus. The physical sheet slides across its actual GLB desk and the real camera approaches.
- Wait for its x/y/z position to settle, then for the camera's position **and aim** to settle, and display the finished moved sheet briefly before showing the manuscript reader.
- Closing the reader preserves the selected desk and moved sheet. Click the sheet again to slide it home without reopening the reader.
- A second click or focus change during motion cancels the pending reader; no stale dialog may appear.
- Keyboard-control paper clicks also use this sequence. The separate explicit **Read a manuscript** button remains available as an accessibility shortcut.

### Bookcase

- Click an edition-coloured gold-framed book. Its real 3D book slides physically out to its target depth; only after that movement and camera transition settle does the published edition dialog open.
- Closing reveals the pulled-out book. Click it to return it home without another popup.
- Switching books, home or leaving the bookcase cancels the prior pending dialog; the latest selection wins.
- Cover details, URLs, gold markers, all book colours and the remaining 77 decorative books are unchanged.

### Typewriter

- Clicking a physical 3D key strikes it and feeds the real paper. **Never** pop the workshop over the keyboard merely because a physical key was clicked.
- When typewriter focus is active, printable keyboard characters also strike the real model's keys. Recognised keys map to their matching mesh where present; the 24-key rig has fewer than a full keyboard, so unsupported printable characters use the existing successive-key fallback.
- **Explore further** opens the separate creative workshop explicitly. Typing in that native dialog still drives the 3D mechanism without trapping keyboard input.
- Click and touch raycasts, camera focus, keyboard-accessible object menu and door exit stay intact.

## Synchronisation

The coordinator uses distances from the real moving mesh and camera, rather than a hardcoded delay from click. Tolerance: 9 mm for the physical part, 10 cm for the camera and aim, plus a 180 ms settled-pose hold (skipped when reduced-motion is active). The pending reveal is discarded on object switch, overview return and reversal. A single animation frame shows the updated WebGL scene before a dialog can open.

## Scope and release

This change is guarded by `data-motion-first="true"` and rendered only on the canonical staging route `/worlds/writing/`. The pre-existing live production site, main branch, preview flags, published works and content approval gates remain unchanged. Verification requires source and behaviour tests, complete build, live Cloudflare smoke, then user visual testing.

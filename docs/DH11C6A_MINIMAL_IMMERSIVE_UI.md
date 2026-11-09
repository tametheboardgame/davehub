# DH-11C.6A — Minimal immersive Writing room interface

**Status:** staging-only UI candidate, pending owner visual and mobile review. **DH-11C.6B** (bespoke full object experiences) is separate future work.

## Owner's direction (7 November 2026)

The 3D room and mechanics are accepted as the core experience. Reduce interface chrome so the room itself dominates. Reuse the **exact homepage DaveHub logo** at upper left, change the upper-right link to **Back**, remove permanently visible large Object Inspection and Explore Objects boxes, and show an understated contextual prompt only when a room object is selected. Deeper individual object designs will be worked out later.

## Implemented behaviour

- The canonical staged Writing route remains `/worlds/writing/`. Homepage Writing island continues to lead here. Only this page receives `data-minimal-ui="true"`, so legacy preview comparisons retain their original controls.
- The header now embeds the *same* `/assets/branding/davehub-logo-faithful.svg` referenced by the homepage. The logo links back to DaveHub home. The second header link reads simply **← Back** and links to `/`.
- Both the top-of-scene camera/status ribbon and decorative reticle are hidden. The camera, raycasting, hover labels, lighting and all real GLB objects remain unchanged.
- The old inspection tray no longer appears automatically upon focusing a desk, cabinet, bookcase, typewriter, bin or window. Focusing an object by mouse, touch or the accessible Objects menu instead shows a small title, one short characterful description and the functional **Explore further** button. The button opens the existing keyboard-accessible object controls *on demand* and the clear close button returns to the same object and camera with the small prompt. The dismissal button hides the prompt without resetting camera. **← Room** returns to the overview and hides both interfaces.
- The original object controls are **not deleted**: papers, lamp, books, drawers, bin crumples, typewriter and door keep their own controls, animations, two-click exit and physical click targets. Only a new UI state opt-in manages visibility. A new full-object bespoke layer will be designed during 6B, not faked here.
- The old broad **Explore Objects** bar becomes a small **Objects** menu at bottom left. It expands for keyboard/touch alternative selection, is never permanently expanded, and correctly places focus onto the visible prompt rather than hidden controls. The Whole Room button is hidden on overview; when focused it becomes an unobtrusive **← Room** at bottom right.
- The door is deliberately different: physical click opens it on the first activation, the second exits to same-origin `/`. No contextual prompt blocks the open doorway. Accessible controls remain available through the Objects menu.
- Escape closes the expanded detail controls back to a small prompt, then returns home from prompt/selected camera. Browser focus visibility, labels, touch sizes and narrow-screen layouts are preserved.
- If WebGL fails, the original fallback and object selection menu remain available.

## Deployment and boundaries

- New canonical renderer: `scripts/render-dh11c6a-minimal-room.cjs`, wrapping the established 3J renderer. The build first emits the existing tested 3J room, then overlays only the new staged presentation.
- New opt-in stylesheet: `prototypes/dh-11c-room/minimal-immersive.css`, served as `/worlds/writing/scene/minimal-immersive.css`. No changes to the production `main` branch, `davehub.co.uk`, approved project catalogue or other 3D comparison URLs.
- Source `room.js` and `immersive-ui.js` are shared, with all additional code gated by the new body data attribute and explicit DOM tests. Underlying geometry, image textures, camera positions, body materials and 3D mechanics are not altered.
- Keep **6B** separate: bespoke expanded views (bookcase/library, desk/manuscripts, filing cabinet/archive) require their own design and visual approval.

## Acceptance tests

1. Enter the room from the homepage and confirm the correct, approved logo, compact Back header, unobstructed camera and no permanent inspector.
2. Click each object and confirm only a small prompt appears; **Explore further** reveals real keyboard object controls, close returns to prompt, dismissal hides it, **← Room** returns to overview.
3. Use **Objects** menu with keyboard and touch. All focus targets and existing user interactions continue to work. On mobile, neither prompt nor menu should swamp the room.
4. Confirm the physical door still opens on first click and exits to staging home on second, with no contextual prompt obscuring the exit.
5. Compare the old V8 preview: it should retain its former full inspector. Check Cloudflare staging build, source and route smoke tests. No changes to production until further explicit approval.

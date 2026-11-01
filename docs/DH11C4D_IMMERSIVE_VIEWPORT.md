# DH-11C.4D — One-screen immersive room presentation

**Date:** 1 November 2026  
**Scope:** The existing DH-11C.4C architecture preview only; the old 3D room, material laboratory, the published Writing page and both games remain untouched.  
**Status:** Code implementation under staging review, real browser visual validation pending.  
**Architecture constraint:** [ADR-0012](DECISIONS/ADR-0012.md).

## Problem and desired behaviour

The current architecture preview uses a conventional webpage layout: branding, a large heading, introduction, scene, testing controls, object selector, interaction panel and footer stacked vertically. On an ordinary laptop this makes the room itself partly off-screen and requires scrolling to find the "Whole room" button. Moving the 3D camera closer to an object should never scroll the page.

**Target interaction:** one viewport = one complete room. The 3D canvas fills the available browser window. DaveHub branding and return-to-Writing navigation overlay the upper edge; the "Whole room" button is always available over the bottom-right of the scene, and camera transitions occur **only in Three.js world space**. Selecting objects presents a compact, independently scrollable contextual panel rather than adding document height.

## Implementation

- **Isolated opt-in:** architecture generator now sets `data-immersive-room="true"`. Other prototype routes do not carry this flag.
- **Viewport CSS:** `immersive.css` locks document scrolling for this preview, uses dynamic viewport height (`100dvh`) and positions the existing canvas edge to edge. It preserves the same `scene-frame` element read by the renderer's ResizeObserver.
- **Overlay header:** the existing small top bar becomes a translucent fixed overlay, retaining brand, room name and route back to the illustrated Writing page.
- **"Whole room" button:** the existing functional `home-button` and camera state handler are unchanged, but it is now fixed to the bottom-right with safe-area positioning. It remains disabled when already at overview.
- **Object controls:** native `<details>` wrapper around the existing seven accessible focus buttons. Closed by default; expandable bottom-left with internal scrolling when needed. Keyboard skip link expands it.
- **Contextual actions:** existing inspect controls become a fixed bottom-left panel above object navigation, with internal scrolling at short heights. Its focus handler still drives the same room state and 3D camera.
- **Test-only controls:** the sizeable cabinet scrubber, buttons, descriptive prose and comparison links are still available inside a `Test controls` expandable panel, but do not consume page height or crowd the entire room. This does **not** remove any testing functionality.
- **Keyboard/touch:** Escape first closes an expanded overlay, then behaves as before and returns the 3D camera to the room. Choosing an object from the menu focuses the relevant contextual action for keyboard use. The 3D canvas uses `touch-action:none` in immersive mode to avoid scrolling during tapping.
- **No asset/model changes:** cabinet geometry, Blender GLB hashes, door/window openings, room-plan coordinates, cameras, textures, published catalogue and links remain unchanged. The renderer already resizes the camera's aspect to the canvas, and this viewport change does not require rerigging.
- **Viewport variations:** desktop/laptop, narrow mobile, short landscape windows, reduced motion, display safe-area padding, scroll containment and keyboard-focused overlays are explicitly covered by CSS or JS.

## Verification plan

1. Run all site and game regression tests and `tests/dh11c4d-immersive-viewport.test.cjs`. Assert exactly one canvas and "Whole room" control, fixed scene/header/overlays, control-panel nesting, keyboard navigation and source isolation.
2. Build Cloudflare feature preview. Check that `/previews/dh-11c/architecture/` loads the new CSS and controller while `/previews/dh-11c/room/`, `/previews/dh-11c/art-lab/` and the current Writing page remain unaffected.
3. Verify merged staging smoke, both same-origin games, release versions, editorial workflow and the exact Blender GLB.
4. **Owner/browser acceptance:** at a normal laptop viewport (e.g. 1366×768), verify **no document vertical or horizontal scrollbar**, whole scene always visible, header overlay at top, "Whole room" always bottom-right, and camera navigation stays inside canvas. Repeat at a larger desktop viewport, narrow portrait phone and short landscape phone.
5. Confirm in-browser that the object menu, inspection actions and test controls can scroll *within their own panels*, remain keyboard/touch operable, and don't obstruct the essential focused 3D object more than necessary.
6. Visual acceptance remains pending until the user has tested the Cloudflare staging page. Passing static, CI and HTTP checks alone does not prove viewport behaviour in an actual browser.

## Scope decision

The prototype text is deliberately **not deleted**. It is moved to a collapsible development panel so it can be removed from the final world without sacrificing present test coverage. Future production builds should retain the permanent route back to DaveHub and accessible object navigation, but may streamline the temporary explanatory prose and cabinet scrubber.

Do not adopt this presentation on the real `/worlds/writing/` until the whole 3D room, styling and functionality have separately passed owner approval.

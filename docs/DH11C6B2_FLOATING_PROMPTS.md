# DH-11C.6B.2 — Floating prompts and compact Eleanor jacket

**Status:** Staging-only correction following the owner's 7 November 2026 visual review. `main` and `davehub.co.uk` must remain unchanged.

## Reported problems

1. The previous 6B.1 narrow/short viewport layout reduced the WebGL room canvas height by 116px and placed a wide **Bookcase** banner in a black strip at the bottom of the screen. The owner wants the small contextual prompt positioned **next to the inspected item within the scene**, not a separate banner or a compressed scene.
2. Eleanor's edition detail uses a text-only fallback cover which is not an actual cover file. Its stretched 2:3 panel was very tall, resulting in a huge product modal and scrolling despite the otherwise successful book-detail layout.

## Implemented correction

- Remove the **entire** `[data-room-prompt="visible"] #scene-frame` height/bottom override. The immersive WebGL canvas remains fixed at full viewport dimensions at every responsive breakpoint.
- On viewports 640 CSS pixels or wider, place the contextual prompt as a compact, semi-transparent floating card **beside** the selected object, regardless of viewport height. Bookcase card and extended controls dock on the left, other selected furniture on the right. This fixes the zoomed-browser/short-viewport condition that triggered the black strip in a physically wide desktop screenshot.
- On narrower viewports, use an even smaller **floating corner card**, inside the original full-size scene with no reserved black footer. Text, action and close remain accessible, with max-height scrolling only for exceptionally cramped screens.
- The separate full object-inspection controls also dock to the side within the scene. Keep existing focus/exit/room navigation, pointer picking, book pull-out, drawer controls and keyboard accessibility.
- Cap the text-only **Eleanor** jacket independently to 260px width and 390px maximum height (and 48dvh), reduce fallback title size and padding, and avoid stretching it with the book-detail grid. For narrow screens reduce to 200px and 270px. The two editions that have actual artwork retain their existing cover image layout.
- Retain existing natural modal overflow for genuinely short screens. A fallback jacket is explicitly a typographic stand-in until authentic Eleanor artwork is available, not a fabricated book cover.
- Versioned canonical Writing-room JS and CSS URLs force browsers to reload the fix without changing older 3D preview routes.

## Acceptance tests

1. On a normal desktop and a browser zoomed so the CSS viewport becomes short, focus the bookcase. The **entire 3D scene remains full-height**; the Bookcase card floats beside it (left), not in a black bottom band.
2. Focus the cabinet, desk and typewriter to confirm contextual cards float on the opposite side and do not cover the selected furniture.
3. Check mobile/small window: room stays full-screen; prompt is a small overlay, with accessible Explore further, dismissal and room return.
4. Pull all three top-shelf books. Stormrider and Duck retain their actual image covers. Eleanor's fallback jacket is small and the detail panel fits normally without the giant interior height.
5. Run repository regression tests, Cloudflare staging deployment and HTTP smoke before merge. No production changes.

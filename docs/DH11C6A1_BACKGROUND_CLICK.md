# DH-11C.6A.1 — Click empty scenery to return to the whole room

**Status:** staging-only navigation refinement, pending CI, Cloudflare and owner click-through confirmation.

## Owner request (7 November 2026)

When zoomed into a focused object, such as the filing cabinet, clicking empty scenery beside it (for example the wall) should pull the camera back to the whole-room overview without requiring the bottom-right button.

## Interaction contract

- On the canonical `/worlds/writing/` route using `data-minimal-ui="true"`, a deliberate click/tap on non-interactive scenery while an object is focused executes the **same `home()` transition** as the existing Room button. This resets the camera target to the whole room and hides the contextual prompt and any expanded controls.
- Empty scenery includes walls, floor, ceiling and background where the existing raycast finds **no** selectable object. No new wall mesh, invisible 2D overlay, screen-position test, fake perspective or changed camera geometry is introduced.
- An empty-scene click in the whole-room overview is a no-op. A drag/swipe greater than the existing 8px movement threshold remains ignored, avoiding unwanted camera resets on touch.
- Clicking actual interactive objects continues to select/focus/manipulate them, including cabinet drawers, books, paper, bin, typewriter, lamp and **the two-click exit door**. Clicking another object while focused can still switch directly to that object.
- The expanded object panel and prompt are DOM controls outside the canvas. Clicking them does not trigger the canvas handler. Keyboard controls and the Room button remain available.
- Earlier isolated 3D comparison previews do not carry `data-minimal-ui` and preserve their existing background-click behaviour.

## Implementation / testing

- The change is confined to the existing canonical scene `pointerup` handler in `prototypes/dh-11c-room/room.js` after the established movement threshold check and `pickFromEvent`, with the guard `if(minimalUI&&state.focus)home();`.
- The canonical renderer updates the JavaScript cache token to `dh11c6a1-background-return-v1` and emits marker `DH-11C.6A.1`; older isolated preview routes retain their own existing script URLs and opt-in flags.
- A test harness executes the real extracted canvas pointer handler. It checks an empty wall from a focused camera, empty overview, old preview, drag/swipe, selectable cabinet and changing to a different object. It asserts all existing physical interaction branches remain intact.
- Verify Cloudflare staging route `/worlds/writing/`, specifically filing-cabinet wall and bookcase wall close-ups, with no accidental return when operating drawers, books or the exit door. No `main`, `davehub.co.uk` or public catalogue changes.

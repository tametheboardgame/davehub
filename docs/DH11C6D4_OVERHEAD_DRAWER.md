# DH-11C.6D.4: Overhead drawer inspection, real mechanics retained

**Status:** Staging-only; owner visual review pending.  
**Feedback:** From the cabinet's existing camera angle, only the lowest two drawers expose enough of their 3D folders for reliable pointer selection. The upper folders are physically there, but are hidden by their drawer fronts and case.

## Decision

Do not alter any cabinet pivots, drawer extension distances or room cameras to force upper folders to become clickable. Keep the owner-approved 3D movement as the physical introduction, then provide **one coherent, top-down illustrated inspection surface** for the drawer contents. This 2D HTML interface is a reading/selection overlay, not a replacement mechanical representation or a fake 3D drawer-opening animation. Geometry remains authoritative in the actual Three.js room (ADR-0012).

## Owner-approved flow

1. Click a real drawer in the room, or select it using the keyboard-friendly cabinet inspector.
2. The selected physical drawer travels along its genuine +Z pivot; the shared camera approaches the cabinet.
3. After the **actual drawer position**, camera position and camera aim are all settled, hold the completed pose briefly (180 ms unless reduced-motion is enabled), then open a native modal, visually looking slightly down inside a wooden drawer.
4. The overlay contains exactly four large, legible paper folders, with raised coloured tabs and titles. It uses the same catalogue and drawer colours as the real physical folders. There are no tiny raycast hit targets.
5. Unassigned slots are clearly presented as decorative unlabelled spare folders, with no clickable/private material.
6. Select a folder via mouse, touch or keyboard. The overhead view closes; the selected **real 3D folder** lifts and moves forward in the open drawer, then the existing illustrated file reader opens after that real movement settles.
7. **Close the file** to return the real folder to its place and reopen the **same** overhead drawer inspection after the return motion completes. This enables browsing multiple files without closing the drawer every time.
8. **View open drawer in 3D** dismisses the overlay but leaves the physical drawer open; the keyboard inspector provides a direct **Look inside** action to reopen it.
9. **Close this drawer** dismisses the overlay and returns the real drawer to its slot.
10. Escape/backdrop dismisses only the current modal layer. Switching furniture, closing a drawer, changing to whole-room mode or selecting another drawer cancels any pending reveal. No stale overlay may appear.

## Presentation and accessibility

- The native `dialog` is themed with wood side rails, a visible front lip/handle, a top-down perspective, file-page texture, coloured tabs and large high-contrast titles, not a generic list or plain popup.
- Four fixed positions use a two-by-two file arrangement so each title stays readable. On a very narrow viewport a single-column layout appears; on shorter screens, the dialog itself may scroll.
- Every active folder is a minimum-sized semantic `button`, with descriptive accessible name; the four slots are a semantic list. Empty positions are not buttons.
- Keyboard focus enters the first active folder, returns from both native modals correctly, and never jumps back to an invisible closed-dialog button.
- Reduced-motion clients get the same functions without unnecessary transition delay.
- WebGL-unavailable clients still receive the keyboard-accessible overhead drawer fallback.

## Content boundary and release

Only three existing published books and nine explicitly fictional demonstration items are present, unchanged from DH-11C.6D.3. No Drive imports, private drafts, new publication decisions, external image assets or game changes.

Implementation: `prototypes/dh-11c-room/cabinet-tray.js`, `cabinet-tray.css`, `scripts/render-dh11c6d4-cabinet-tray.cjs`; opt-in `data-cabinet-tray="true"` in the canonical staging Writing route, never older comparison previews. Existing cabinet art and GLBs are unchanged.

Review checklist: test opening all five drawers; view and click all eligible folders in the top, middle and bottom drawers; close/reopen the overhead tray; open a file and return to the same drawer; follow a published work to the real bookcase; visit with keyboard, touch, narrow screen and reduced motion. Publish to `main` / `davehub.co.uk` only after separate explicit approval.

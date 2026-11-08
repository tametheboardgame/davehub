# DH-11C.6E: Discarded ideas in the wastepaper bin

**Target:** `https://davehub.pages.dev/worlds/writing/` (staging only)  
**Status:** Implementation and automated QA; owner visual approval pending.  
**Baseline:** DH-11C.6D.4 cabinet drawer overlay owner-approved. All room, bookcase, desk, typewriter and cabinet behaviours stay unchanged.

## Intent

The overflowing bin should be a little absurd and surprising. It is **not** another archive of manuscripts, a second filing-cabinet overlay or a repository of actual discarded drafts. Nine **physical crumples** are already individual named 3D objects with rigorously validated reversible toss paths in the original Blender/GLB room. Keep those exact mechanics and use them as the entrance to a distinctive reading surface.

## Interaction

1. Approach the bin and click any of its nine individually pickable 3D paper balls, or use **Explore further → Rummage for the next discarded idea** to pick the next ball without pixel-perfect clicking. The original keyboard-accessible list still allows targeting a specific ball.
2. The selected real mesh lifts over the bin rim, tumbles along its own curved path and lands at its original unique location outside the bin. Other balls remain independent. The shared room camera still approaches the bin.
3. Only when the actual ball has **landed** and camera position/aim have settled, hold the final scene briefly (reduced-motion users skip the hold). Then the *paper content reader* opens.
4. The paper reader starts with a scrunched note. Click **Unfold this scrap** to open a distorted, folded-ink sheet with a fictional miniature premise. Click **Turn over** to see the eccentric handwritten rejection reason; turn it back to reread.
5. **Leave on the floor**, close or Escape dismisses the reader and leaves the **real physical crumple** on the 3D floor. Clicking that crumple again returns it through the exact reverse physical arc. Keyboard users can also choose **Read recovered paper N** to reopen a note without throwing again.
6. **Crumple and throw back** closes the content surface and reverses only that scrap's actual 3D toss. The reader never invents an independently rendered 3D opening/closing state: the sheet artwork is explicitly an **inspection representation** of recovered text. Existing 3D source remains mechanically authoritative.
7. Repeated clicks, reversals, switching objects, returning home and starting a different toss cancel stale pending content reveals. No dialog opens while the ball is still in motion.
8. All nine balls can be out simultaneously. If the visitor has recovered them all, the accessible rummage action offers the first recovered specimen; the user can choose which scraps to return.

## Content and safety

Exactly **nine authored, fictional demonstration** records, each with a unique ID, title, two short comic paragraphs, faux office stamp and rejection reason. They are invented samples, not quotations from real works. Explicit disclosure remains in the reader both before and after unfolding. No Drive fetching, unpublished manuscripts, personal project inference, persistent storage, comments, publishing controls or hidden external links.

## Presentation

- A single native `dialog` is attached to the physical motion gate. The initial wrinkled ball, irregular unfolded paper, fold creases, stamp and marginal note are an inspection view and not replacement room geometry.
- The unfolding and turning are user-initiated, not passive auto-play; room animation remains visible **before** the dialog appears.
- The reader uses semantic buttons and a visible close/leave/return choice, keyboard arrow keys on an opened sheet, a focus-return policy, a smaller layout for narrow screens, and a reduced-motion variant.
- Earlier preview pages opt out. A single `data-discarded-ideas="true"` flag on the canonical Writing route activates the experience.

## Verification

- Strict index→record binding for all nine named 3D crumples.
- Arc endpoints and constraints remain validated by `tests/dh11c4f-animation-fixes.test.cjs`; no changes to `binPaperPose`, destination arrays or Blender geometry.
- New automated tests cover index validity, nine fictional records, fold/turn/back controls, Escape/leave/return differences, landing and camera gating, cancellation, the staged renderer, and asset delivery.
- Full DaveHub build, game regression suite and read-only Cloudflare HTTP smoke must succeed before owner visual review.
- Production / `main` remain unchanged without explicit release approval.

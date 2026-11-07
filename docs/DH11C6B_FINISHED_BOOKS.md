# DH-11C.6B — Finished Bookcase / published-book detail view

**Status:** Staging-only owner review candidate. Not part of DH-11C base release to main.

## Design boundary

The owner has approved the Writing Room look and core functionality and wants published books displayed through the physical bookcase. Exactly three authored, published titles receive book-like product pages with covers, description, metadata and external buying options:

- **The Legend of the Stormrider** (2023), ISBN 9781739314552.
- **The Duck Bread Baker** (2023), ISBN 9781739314514.
- **Eleanor and the Mystery of the Missing Stones** (2026), ISBN 9781739314576.

Publisher: Cricetus Cricetus Publishing. Author: David Fairbairn.

This is **not a generic e-commerce storefront**. Physically pulling one of the three actual highlighted 3D book meshes opens an accessible, immersive edition page with the verified publication details. Clicking the close control returns to the same selected shelf. The existing GLB, separate paper/drawer animations and room camera are not replaced with a 2D mock scene.

## Published book data and rights

- Catalogue source: `prototypes/dh-11c-room/finished-books.js` contains exactly the three published editions and literal retailer links. The Duck and Stormrider cover URLs originate on the publisher website; the Eleanor retailer shows an edition thumbnail but no independently verified direct image source, so it has an attractive *text jacket fallback*, not an invented illustration.
- External links use HTTPS and open in a separate tab; the user is told retailer prices/availability vary. No shopping or fulfilment functionality is hosted on DaveHub. No third-party review text or unapproved manuscript passages are bundled.
- Three physical featured indexes, mapped to the existing first three of eight animated book slots, are active in the canonical Writing world. The remaining five previously featured unpublished creative works revert to ordinary fictional decorative shelf books on that route. The old V8 preview continues to demonstrate the eight previous pull-out spines, with no changes to its route.
- The painterly spine texture overlays also use the exact three authored published spine titles; the 77 remaining spines keep existing joke titles. The books remain in the same shelf geometry and move as real GLB objects; no title overlay is a separate fake camera view.

## Visitor interface

- Accessible native `<dialog>` shows a real published title's cover or graceful image-unavailable fallback, title, description, genre, publication year, author, publisher, ISBN, buying link and publisher/retailer detail.
- Close, Escape and backdrop click work. Responsive layout makes a narrow-screen one-column reading presentation. Keyboard control from Explore further offers the same three real book slots.
- Same-origin staging path `/worlds/writing/` is preserved. New `data-finished-books="true"` opt-in and versioned scripts mean no 6B behavior appears in previous reviews or the already approved main release.
- Cover images come from publisher-hosted URLs; no speculative digital book interior is displayed.
- **Next scope (6C):** desk, typewriter, filing cabinet and other surfaces need a proper text/work viewer. This will be a separate approved-content interface, with document paragraphs, chapter navigation and original work in progress once the owner selects what may be published. Do not put unfinished manuscript text, private Drive files or documents in public site assets without an explicit content decision.

## Acceptance gate

1. Clicking the Writing island enters the same room. Exactly three published spines are interactive.
2. Pull Stormrider, Duck and Eleanor; confirm modal details, cover handling, metadata, external links and return to real shelf.
3. Verify tab/escape/touch/scroll usability, camera and item state, background click to whole room, and two-click exit door.
4. Check earlier V8 remains unaffected, no old speculative creative works become purchasable products, and public global catalogue remains unchanged.
5. Confirm repository, Pages and hosted smoke checks before merging to staging. **No merge to main or production without separate owner approval of 6B.**

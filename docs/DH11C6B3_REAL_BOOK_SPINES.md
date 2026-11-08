# DH-11C.6B.3 — Published binding colours and gilded selection cue

**Status:** Staging-only, pending CI and owner visual review.

## Owner feedback

The three selectable books should look like their actual published editions rather than being recoloured bright turquoise. Show their interactivity using a clear *separate affordance*, such as a gold outline around the spine. The Eleanor publication detail should eventually use its genuine cover, preferably from the owner's Google Drive or a verified retailer page.

## Binding design

- The canonical Writing-room bookcase continues to use three physically movable books from the highest shelf: `book_3_03` (Stormrider), `book_3_10` (Duck Bread Baker) and `book_3_17` (Eleanor).
- New title-specific binding colours in the published-book catalogue approximate the actual cover palettes: storm-sky blue for Stormrider, bread-crust amber/orange for Duck, and a provisional midnight/slate tone for Eleanor. Eleanor's binding is **not verified to match the final cover**.
- The real Three.js/GLB spines and painted title overlays share this colour. The *independent* selectable cue comprises four slim gold-foil lines forming a rectangle on the front and a small gold seal near the head of the spine, attached directly to each selectable book mesh. Both move as part of the original book pull-out animation.
- All other books retain their regular varied illustrative bindings. Old authored-art comparison previews still use the legacy turquoise bindings and three gold marks. The retail modal, buy links, click-outside return, 3D camera, door and controls are unchanged.

## Eleanor's cover search

- Searched connected Google Drive for `Eleanor`, `Missing Stones`, `book cover` and `Cricetus`, including image-only metadata and the earlier Eleanor project folders. Found the manuscript documents and older illustration assets, but **not a verifiable front-cover asset for the February 2026 published edition**.
- The retail listing for ISBN **9781739314576** at Browns Books confirms that the edition exists and displays a cover image in the search result, but its full-size image URL was not retrievable and verifiable from the available tools. A separate Amazon image was also not confirmed.
- Preserve the honest text-jacket fallback until the final artwork or a verifiable direct image URL is provided. Never use 2023 artwork from the older draft as if it were the published cover.
- This is a visual proof candidate only. An exact colour match, especially for Eleanor, can be refined when the full-resolution cover file is available.

## Release boundary

- New staging HTML marker `DH-11C.6B.3` and versioned visitor scripts. Earlier preview scripts and `main` remain unchanged.
- New regression tests check published-only palettes, physical gold selection geometry, painted spine parity, old eight-book preview isolation, genuine top-shelf mapping and unchanged Eleanor fallback.
- Before staging merge, require repository CI, Cloudflare preview and hosted HTTP checks. Owner to review the bookcase and opened editions before any subsequent live promotion.

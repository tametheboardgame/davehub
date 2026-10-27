# DH-07C — Interactive content-world prototypes

**Built:** 27 October 2026  
**Status:** Branch prototype ready for owner visual review. Neither real project content nor the homepage navigation has changed.

## Deliverable

`prototypes/dh-07c/index.html` is a self-contained, asset-free HTML/CSS/JavaScript review build. The Cloudflare Pages branch build copies it to:

`/previews/dh-07c/`

Review URLs (relative to any **confirmed** branch preview hostname):

- `/previews/dh-07c/?view=shelf` — The Unfinished Shelf
- `/previews/dh-07c/?view=shelf&item=library-of-tuesday` — Example unfinished work
- `/previews/dh-07c/?view=musical` — Fictional musical world

The actual `*.pages.dev` branch URL must be confirmed from Cloudflare/GitHub build output before sharing as a working hosted URL. A local stand-alone HTML download is supplied in the corresponding ChatGPT conversation.

## Unfinished Shelf behaviour

- Search titles, descriptions and content types.
- Filter by script, book, musical or idea without reloading.
- Six **entirely fictional** sample entries; no owner history or unpublished scripts have been inserted.
- Direct-link detail views show premise, fragments, optional margin note and approximate date.
- Clearly mark works as permanently shelved or abandoned, **not** in progress or coming soon.
- Shelf and detail use one in-memory dataset, not duplicated records.

## Musical world behaviour

- One fictional example named *The Last Lightkeeper*.
- Responsive presentation, with CSS-only moonlight/lighthouse scenery; no third-party illustration.
- Tabs for The Show, Listen, The Script, The Making Of, and Releases & Credits.
- Four fictional song concepts related to four fictional script scenes.
- From a selected song, choose its script scene; from that scene, return to its song.
- No fake audio playback: the sample deliberately states no actual recording exists. Real media would require approved streaming links or licensed uploads.
- Empty and unapproved assets are not publicly rendered by the prototype.

## Engineering and QA

- Single-file build uses only HTML/CSS/vanilla JS, no framework, images, fonts or network requests.
- Tested in headless Chromium at **1440×900, 1366×768, 390×844 and 375×667**.
- Passed: six shelf cards, scripts filter, text search, detail navigation and back, musical navigation, song selection, song→script→song linkage, making-of and release tabs, no horizontal overflow, no uncaught JavaScript exceptions.
- Keyboard focus styles and tab left/right/home/end behaviour are implemented.
- No new external services and no secret-bearing backend.
- `prefers-reduced-motion` disables transitions.

## Typography revision (27 October 2026)

Owner liked the concept and page layout but disliked the original font choice. Revised the **same** standalone prototype to favour a modern all-sans type hierarchy: system-first Aptos / Segoe UI text with Bahnschrift / Aptos Display display headings and platform fallbacks. Removed the prominent Georgia serif title/card treatment; no external font files, requests or dependencies. Colours, interactive flows, layout grids, fictional source records and navigation are unchanged. Retested shelf filter/search interactions and horizontal overflow at 1440×900, 1366×768, 390×844 and 375×667 with no browser script errors. The typography direction still needs owner review, and the old GitHub commit can be compared if preferred.

## Next review decisions

1. Is the **Unfinished Shelf** the right name and tone, or should the archive be weirder/funnier?
2. Are browse filters, detail depth and fragment display sufficient for the historical scripts?
3. Does the musical need a concept-first, music-first or script-first variant, perhaps selectable per production?
4. Where should Music, Memory Lane and Unfinished work appear in the site's wider navigation without overcrowding the locked homepage?

## Safety and scope

The first nine outside-GitHub link candidates remain unpublished in DaveHub, pending per-item approval. This build includes **fictional content only** and is a design prototype, not an ingestion pipeline or editorial approval workflow. Do not merge into `main` or claim the owner approved the proposed layouts until visual review is complete.

See [DH-07B requirements](DH07B_UNFINISHED_AND_MUSICALS.md) and [publication policy](PUBLICATION_POLICY.md).

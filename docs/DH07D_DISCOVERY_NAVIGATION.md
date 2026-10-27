# DH-07D — Navigation that keeps the world uncluttered

**Date:** 27 October 2026  
**Status:** Interactive branch proposal, pending owner visual review. Stacked on DH-07C prototype branch; no production change yet.

## Decision proposed

Preserve the approved **four floating island / bottom bar destinations** — Projects, Writing, Games, Experiments — rather than adding three more controls to the fixed full-screen scene. The **Explore DaveHub** button opens one accessible, scrollable directory with two distinct groups:

- **The four worlds:** Projects, Writing, Games, Experiments.
- **Elsewhere in DaveHub:** Music, The Unfinished Shelf, Trip Down Memory Lane.

The second group contains **cross-world discovery routes**, not duplicated content or a different content database. Those collections can all expose the same canonical creative work, without copying its data.

## Visitors' journeys

1. Homepage → Explore → Writing → The Unfinished Shelf → interactive fictional shelf → details.
2. Homepage → Explore → Music → Explore a musical → fictional musical production → Listen → Script → Listen.
3. Homepage → Explore → Trip Down Memory Lane → section explanation / Unfinished Shelf preview. The historical archive is not yet populated; no fake real history.
4. Homepage → click a floating island or bottom category → relevant section → other destinations or back to Explore.
5. Links to `previews/dh-07c/?view=shelf` or `?view=musical` are strictly fictional-design demonstrations, not approved public user content.

The user can enter the Explore directory without passing through project content or loading a separate application. The four island and four bottom tiles remain untouched in number and placement.

## Code layout

- `catalogue.js`: canonical source of **navigation metadata**. Each section includes a stable id, title, icon, group (`worlds`/`collections`), description, optional note and contextual links. It is **not** a new source of unpublished project content.
- `main.js`: renders grouped directory cards and section-specific onward links from this metadata; uses DOM text nodes to avoid injecting external HTML.
- `index.html`: three small SVG UI symbols and updated descriptive copy.
- `styles.css`: responsive grouped directory and section-link cards, restrained modern font system aligned to DH-07C.
- `scripts/build-pages.sh`: inherited from DH-07C; includes isolated fictional content-world prototypes at `/previews/dh-07c/`.

No framework, external fonts, API calls, database or new illustrated assets.

## Scope and quality gates

- **Visual review**: the two-group directory reads as part of the existing floating-worlds site, with no crowded home controls.
- **Navigation**: direct URL hashes `#explore`, `#music`, `#unfinished`, `#memory-lane`, existing `#writing` etc. remain functional.
- **Return paths**: Escape/backdrop close, back to Explore link, and mock musical/shelf pages returning to the homepage.
- **Accessible**: focus management, keyboard navigation, readable descriptions, modal independently scrollable at mobile and landscape sizes.
- **No false availability**: Memory Lane remains a placeholder; no real user names, personal historical data or archived files exposed.
- **No publication without approval**: feature branches and draft PRs are public source review artefacts; do not commit private unpublished works. Do not merge into main solely based on this implementation.

## Subsequent design work

When the owner accepts DH-07D, land navigation and content-world pages together, then use one shared canonical *creative work* record shape (from DH-07B) for approved works, with record-to-category relationships. Memory Lane will become a chronological *view* over those records when the owner supplies historical media. Its collections should not require every entry to have an exact date.

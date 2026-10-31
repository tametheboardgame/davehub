# DH-11 — Distinct creative world layouts

Status: staging-only implementation; no new source project or public catalogue record approved.

## Scope

The approved DaveHub homepage, Games world, project listing pages, same-origin games and Cloudflare staging/live separation remain unchanged. Each of the other five existing routes now has a separate visual language, backed exclusively by the same validated catalogue:

- **Writing**, /worlds/writing/: **The Manuscript Hoard**, an immersive disorderly den of layered approved manuscripts, loose fragments, notebooks, scripts and concealed pages. The five piles organise the approved catalogue without turning it into a neat card grid. Native expandable controls let the visitor rummage beneath the uppermost manuscript; only approved titles, links and synopses appear. Fictional examples remain preview-only.
- **Music**, /worlds/music/: illustrated vinyl and equaliser, a musical-first featured record, and linked song, script/scene and release cards. No audio autoplay, embeds or unapproved files.
- **Experiments**, /worlds/experiments/: a CSS apparatus over a grid, specimen-workbench introductions and approved experiment cards when available. The machine is labelled as decorative, not a claim of an actual project.
- **The Unfinished Shelf**, /worlds/unfinished/: an archive shelf with book spines and fragment captions. Explicitly no tasks, completion metrics or promises to resume the work.
- **Trip Down Memory Lane**, /worlds/memory-lane/: a chronological timeline from the canonical period fields. Approximate and unknown dates are preserved accurately.

The responsive presentation is CSS-only, so there are no new images, external font/script dependencies or media rights to approve. All links use the existing /creations/<slug>/ routes. The established content validator continues to control records, ownership attestations, public links, relations and publication status. World-specific layout code does not fetch repositories or write any catalogue.

## Demonstration versus public content

- **Actual public staging worlds:** https://davehub.pages.dev/worlds/<name>/ use **only** the existing three owner-approved publications. Where none qualifies, the designed room is intentionally empty.
- **Fictional demonstration:** /previews/dh-08b/worlds/<name>/ uses the pre-existing content/examples/fictional.json with its clear fictional disclaimer and preview-only URLs. The experimental workshop is visually staged but intentionally has no fictitious named project record.
- The two user-excluded repositories, **The Ordinary Universe / The Ordinary Verse** and **Octo-Marathon**, are not part of the catalogue or preview additions. Their source markers were disabled separately on 30 October 2026.
- No private drafts, third-party media, songs, source repo contents, or new real-world information are published through this work.

## Architecture and checks

scripts/render-content.cjs retains the canonical renderer and delegates five view bodies to scripts/render-dh11-worlds.cjs. The new assets/content/dh11-worlds.css is inlined alongside the existing world styles at build time (and copied to the built static assets). Games and Projects remain on the proven old path. Page-specific theme class and aria-current="page" aid navigation and accessibility.

The Cloudflare Pages build runs tests/dh11-worlds.test.cjs alongside all earlier content and navigation regressions. Its post-render acceptance checks assert all five real and fictional worlds exist and that no fictional project names leak into the five public pages. The CSS has small-screen and reduced-motion rules. No production deployment, DNS or live-domain work is part of this phase.

## Editorial review before sign-off

1. Check the five routes in the Cloudflare preview, and compare their fictional counterparts, particularly the writing paper treatment, music stage, specimen machine, shelf spines and timeline.
2. Review phone portrait and laptop layouts, focus navigation, reading order and responsive text.
3. Confirm the real worlds contain no new creations and Games retains both launch routes.
4. Iterate on any visual issues on staging. Promotion to davehub.co.uk remains a separate future owner-approved event.

## Follow-up design phase

After this visual baseline, build first-class musical **creation-detail** pages with explicit narrative, tracks, characters, scripts, credits and releases from approved linked records. Do not confuse concept-only musicals with albums, or assume song recordings can be embedded. Later, add approved book/music/older-project intake without duplicating the catalogue.

## DH-11A: The Manuscript Hoard (30 October 2026)

The Writing room now appears as a chaotic manuscript den rather than a library or a standard project grid. Five piles provide a predictable source order: On top of the pile, Loose fragments, Notes from stranger worlds, Characters & scenes, and Things nearly lost. Items are grouped deterministically by record kind and lifecycle; this changes presentation only, not approval status, ownership, source data or category assignment.

The uppermost approved item in a pile is an individually linked, accessible manuscript object. Where a pile contains more than one approved entry, a native HTML details/summary control labelled 'Rummage beneath this pile' reveals the rest. The HTML remains accessible with JavaScript disabled and keyboard-only navigation. Every approved Writing item appears once. Decorative paper stacks, coffee rings, scraps and stationery are CSS-only, hidden from assistive technology and never masquerade as real publications.

The visual composition uses deliberate variation in rotation, layering, paper edges and object type. Desktop shows a staggered five-zone paper field; narrow screens switch to full-width ordered piles with minimal rotation, readable text, a visible focus outline and no horizontal scrolling. Reduced-motion preferences disable movement. All links continue using the existing canonical /creations/ routes; fictional data stays below /previews/dh-08b/.

**Acceptance:** GitHub Actions must pass the full site build, the expanded writing render tests and same-origin game regressions. Staging Cloudflare HTTP smoke must pass before requesting owner visual review. Do not update or launch the production domain. The currently approved writing listing is Tame The Board Game; the interface must show no unrelated private or unapproved manuscripts.


## DH-11B — enter the Writing island (31 October 2026)

The owner approved a full scene-first, point-and-click direction to replace the manuscript card layout. The entry route /worlds/writing/ now opens the illustrated Manuscript Hoard room, without a generic catalogue header or a tiled article layout. Scene art is held locally in the DaveHub repository and deployed at /assets/worlds/writing/manuscript-room-v1.avif (cropped and optimised from the owner-approved concept blueprint; no external image dependency).

Six spatial hotspots align with objects visible in the artwork: desk (featured work), cabinet (other manuscripts), bin (shelved fragments), bookcase (world notes), typewriter (scripts and scenes), and exit (returns to DaveHub). Each content hotspot opens a native modal close-up displaying approved catalogue titles as discoverable paper manuscripts. Modal closes by button, Escape or backdrop and restores keyboard focus. There is no content generation or independent repository feed.

On narrow screens the scene is horizontally pannable to preserve the actual illustration, with a labelled set of object controls as a direct accessible alternative. Production and fictional builds share the same code. Approved catalogue data is used in /worlds/writing/; invented samples only appear under /previews/dh-08b/worlds/writing/ with a visible disclaimer. The historic DH-08C comparison preview remains unchanged.

This is a vertical slice for the Writing island, not a content publication approval. No changes to davehub.co.uk, live production, game routes or source repository markers.

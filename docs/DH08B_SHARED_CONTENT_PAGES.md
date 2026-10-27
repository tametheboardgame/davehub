# DH-08B — Shared creative-world and creation-page renderer

**Date:** 27 October 2026  
**Status:** Built and internally verified on a review branch. Owner visual review and promotion to `main` pending. **No real creative works have been published.**

## What has been implemented

- A single, dependency-free static renderer (`scripts/render-content.cjs`) turns the validated DH-08 public JSON catalogue into **seven category worlds** and one canonical page per approved creative record.
- Approved genre/navigation **views** are Projects, Writing, Games, Experiments, Music, The Unfinished Shelf and Trip Down Memory Lane. A work can appear in multiple worlds without duplication.
- A new entry point is generated at `/worlds/` with coherent mystical world cards.
- Each approved work receives a stable URL derived from its reviewed slug: `/creations/<slug>/`. Related works link to the same canonical page.
- The content-page stylesheet (`assets/content/worlds.css`) reuses the previously approved floating-islands illustration with dark gradients and glowing gold/blue portal accents, matching the improved sans-serif look of the existing homepage.
- **Navigation correction after owner review:** the central Explore DaveHub button now links directly to `/worlds/`, and the four island hotspots link directly to their respective `/worlds/<view>/` pages. The old intermediate pop-up directory has been removed, so visitors no longer face two menus before reaching the content. Giant Dave, the main CTA artwork and island composition are unchanged. Legacy `/#explore`, `/#writing` and related hashes redirect to the new permanent routes.
- When a category has **zero approved works**, the generated page shows a truthful empty-state invitation to explore other worlds. No fictional works appear in production data.

## One musical, interconnected artifacts

A musical has one canonical record. The renderer automatically detects its other **public-approved** records through outgoing or incoming relationships. It can present these sections when content exists:

1. Story, setting and concepts (linked concept artifacts).
2. Listen and explore the songs (linked song records, which in turn may have official streaming links).
3. Read the script and scenes (linked script-scene, lyrics or excerpt artifacts).
4. The making of (linked development-note artifacts).
5. Albums and releases (linked release records).

Sections without any approved artifacts are omitted rather than displaying fabricated source material. Song and script-scene detail pages cross-link using the same canonical IDs. Every external link/media URL is validated and opens as a link; no unauthorised playback or copied lyrics are generated.

Musicals can be concept-only, music-first or script-first. No finished album, script or recording is required for a legitimate musical page.

## The Unfinished Shelf and Memory Lane

- Unfinished is an explicit category for `abandoned` and `permanently_shelved` records only. It is **not** a workflow backlog and never promises completion.
- Memory Lane sorts by optional approximate years; records with no known date remain valid and appear last. Historical, finished and unfinished are separate axes.
- An old instrument build can eventually appear under Projects, Music and Memory Lane using the same ID and detail page.

## Strict distinction: production versus examples

**Public website output** (built from `content/public/catalogue.json` only):
- `/worlds/`
- `/worlds/projects/`, `/worlds/writing/`, `/worlds/games/`, `/worlds/experiments/`, `/worlds/music/`, `/worlds/unfinished/`, `/worlds/memory-lane/`
- `/creations/<approved-slug>/` for reviewed and validated public works.

**Fictional preview output** (built from `content/examples/fictional.json` and never copied into public creations):
- `/previews/dh-08b/worlds/` and the seven preview world routes.
- `/previews/dh-08b/creations/last-lightkeeper/` and six other fictional creation pages.
- Sample musical: *The Last Lightkeeper*, including a fictional song, script scene, concept, making-of note and concept album.
- Every preview page includes an explicit fictional-content notice.

The live empty world index and category pages include a prominent, explicitly labelled gateway into the separate fictional preview. This preserves the real/fictional separation while making the newly built page layouts reachable from the homepage without copied direct links.

The previously built standalone DH-08A JSON-browser prototype remains accessible at `/previews/dh-08/`. DH-08B adds fully rendered, responsive site pages produced by the **same generator** that builds the future real pages.

## Safety and validation

- A strict validator runs before any public or fictional page renders; it rejects unapproved entries, uncleared media, unexpected private fields, missing provenance, unsafe URLs, unknown relation targets, and incorrect lifecycle/category combinations.
- `artifactKind` now distinguishes script scenes, concepts, development notes, lyrics, demos, artwork, excerpts and other artifacts; `releaseKind` distinguishes albums, singles, editions, playable builds and other releases.
- All catalogue-controlled HTML and attribute text is escaped at render time. Incoming and outgoing relations resolve against reviewed IDs.
- Generated pages are static HTML: no third-party scripts, tracking, database or paid API. Browser scripting is not needed to navigate, including under reduced-motion settings.
- Links to external official media use HTTPS and `rel="noopener noreferrer"`. No private notes or source text are committed.
- Existing Cloudflare build executes all Node tests and the manifest validator before generating `dist/`. The build must fail rather than exposing unreviewed records.
- All environments currently return `X-Robots-Tag: noindex, nofollow`; noindex is not access control.

## How to test

```sh
node --test tests/content.test.cjs tests/render-content.test.cjs tests/navigation.test.cjs
node scripts/content-check.cjs content/public/catalogue.json
node scripts/content-check.cjs content/examples/fictional.json
sh scripts/build-pages.sh
```

The static renderer generates **eight public pages** (world index + seven empty categories) and **15 fictional demo pages** (world index + seven categories + seven creations).

## Next: DH-08C

DH-08B is the *rendering* phase, not automatic ingestion. Next, design a private draft/review queue and human approval ledger for nominated content, with source provenance, change detection, withdrawal and publisher/artist attribution. Importing any previously supplied real book, album, musical or historical material requires an explicit **item-level public-content sign-off**. The user's historical hard-drive discovery remains optional and non-blocking.

## Approval gates

The owner should check responsive world tiles, typography, readable category sections, musical scene-to-song navigation and the **direct homepage Explore → world index → fictional demonstration** flow. The old Explore modal is intentionally retired in favour of the new world index. No real content is published or PR merged without those checks and the explicit publication policy.

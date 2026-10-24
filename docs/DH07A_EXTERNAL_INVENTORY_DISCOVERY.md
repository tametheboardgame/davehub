# DH-07A — External works and creative-history inventory

**Updated:** 24 October 2026  
**Status:** Discovery in progress; information architecture proposals are **not yet an approved public site taxonomy**.

## First discovery batch

The owner has supplied **nine external candidate records**, covering:
- A collaborative publishing organisation
- Three published books with linked ISBN listings
- Several music identities and an individual music album URL
- A rap musical that belongs to both music and writing
- A historical band with a public SoundCloud profile

**Important publication gate:** The actual candidate records and specific external URLs are held as a **conversation-local draft**, not in this public repository. This document describes only the architecture lessons. A user providing a public URL for discovery is **not** explicit approval to add it to DaveHub's public catalogue or copy copyrighted source assets. Do not create a PR containing candidate-only details without item-level authorisation.

## Proposed record types

- `organisation`: Publisher, collaborative creative organisation or other entity that can have works associated with it.
- `creative_work`: Canonical project identity for books, musical productions, playable games, software, physical builds, experiments and more.
- `music_identity`: Music artist/project name spanning multiple albums or tracks; distinguish this from an `album` or `track`.
- `historical_creative_project`: A previous band, guitar build, archive project or past experiment, independent of whether it is still active.
- `release`: An edition, album, single or playable version **of** a canonical creative work; include links and date/status only when verifiable.
- `collection`: Related groups of projects, series and timeline chapters.

Do not infer that a Spotify album link is an artist page, or that similarly named artists elsewhere are the same entity. Use identifiers from the original provider URLs; store uncertainty rather than fabricating details.

## Proposed discovery views (not mutually exclusive)

1. Existing homepage destinations: **Projects**, **Writing**, **Games** and **Experiments**.
2. **Music:** a candidate new top-level or second-level destination. The external inventory provides ample music-specific material; actual placement still needs UX review.
3. **Trip Down Memory Lane:** an archive/timeline experience spanning past music, handmade guitars, old websites, experiments and unfinished projects. The same project can appear here and in any relevant topical view.
4. **What's Happening:** current milestones and releases; do not mix current releases and historic memories without signalling dates and status.

One canonical record can appear in multiple discovery views without duplicate ownership or content.

## Provenance and relationships

Suggested shared fields:
- Stable record ID and type
- Display title, short approved synopsis, status and format(s)
- Original source URL(s) and source kind (official site, ISBN listing, streaming artist, streaming album, historical archive)
- Claimed identity versus independently confirmed metadata
- Dates and confidence / conflicting source values
- Series/collection, relationships to parent organisation and related games or musicals
- Contributor/rights clearance flags for collaborators, recordings, artwork and names
- Explicit `editorial_status` / `public_site_included` flags and who approved publication
- Historical period/time-span separate from release date

## Content presentation implications

- **Publishing organisation** profile can connect published books and shared creative ventures.
- **Book** page can show approved blurb, cover with appropriate rights, retailer links and related series.
- **Music** page should distinguish artist identities from albums/singles; support external listening rather than duplicating audio.
- **Musical** can occupy Writing, Music and Projects; it may merit a production/lyrics/story section after approval.
- **Memory Lane** should accept partial recollections (unknown dates, missing photos) and later additions from old drives, not require a perfect archive before entry.

## Next steps

1. Continue receiving loosely ordered links, images, names and archival files. Store them in a draft inventory pending review.
2. Verify ambiguous album/artist identities and dates without copying promotional material.
3. Sketch project and archive templates using fictional placeholder records first.
4. Agree taxonomy and item-by-item publication scope.
5. Only then migrate approved entries into the public catalogue and introduce the DaveHub Ready ingestion workflow.

See [content pipeline discovery](CONTENT_PIPELINE_DISCOVERY.md) and [publication policy](PUBLICATION_POLICY.md). No automated publishing has been authorised.

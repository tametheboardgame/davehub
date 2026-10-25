# DH-07B — Unfinished Works and Musicals: content & page architecture

**Date:** 25 October 2026
**Status:** Agreed high-level requirements, proposed detailed architecture; page layout and names remain reviewable. This design does **not** authorise publication of any particular work, unfinished script, lyrics or recording.

## Product decisions

1. **We do not need the old hard drive before designing the website.** Create the structures and visitor-facing prototypes using fictional placeholders; ingest existing and historical materials incrementally whenever supplied.
2. **Unfinished projects are intentional exhibits, not a work queue.** A project whose creator has *no intention of finishing it* should be welcome on DaveHub without "coming soon", completion percentage, overdue tasks or reminders to resurrect it. Partial scripts, ideas and fragments are legitimate finished *archive entries*, even if the creative work itself was never completed.
3. **A musical is a first-class composite creative work.** Music, songs, story/concept, characters, world-building, script, lyrics, artworks, demos and release links belong to one canonical musical record with linked, independently permissioned child artifacts. Do not represent the album and script as disconnected projects unless they really are.
4. **Categories, lifecycle, history and publication are independent.** The same musical can appear under Music, Writing and Projects; an unfinished script can appear under Writing, a deliberately shelved-work view and (if old enough/relevant) Trip Down Memory Lane. A "historical" tag does not imply "unfinished"; a finished old guitar is historical but finished.
5. **Editorial approval is per content item, not implied by a public project URL.** The GitHub repo is public; neither unapproved titles nor private files, lyrics, drafts, personal anecdotes or third-party audio should be committed simply for discovery.

## User-facing discovery concepts

### The Unfinished Shelf (working title)

A dedicated destination for abandoned, permanently shelved or never-developed creative works, especially scripts and writing. The word *unfinished* describes the work, not an outstanding task.

**Suggested card structure:** title; format (script / book / musical / game / idea / other); approximate date or "date unknown"; a short, deliberately optional note such as "What it was meant to be"; what survives (outline / pages / recording / concept art); lifecycle label **Permanently shelved** or **Abandoned**; a clear "Explore the fragments" action if content is published.

Do not automatically call these failures. Some are creative dead ends; some are wonderfully strange, viable ideas the creator simply doesn't want to revisit. Tone can be wry, never judgemental.

- A stub consisting of a name and optional single-sentence memory is valid.
- Unknown years and uncertain authorship are explicitly supported.
- Partial work is presented as a snapshot, not silently completed or rewritten by AI.
- Visitors can read approved excerpts, look at documents, hear approved demos and understand the premise without reading a large "blog post".
- No "progress", "on hold", "coming soon", update scheduling, notifications or automated requests to finish archived work.
- If a project genuinely resumes someday, keep its history and update the lifecycle state intentionally; nothing auto-reactivates.

**Routing (provisional):** a dedicated `/unfinished` or `/writing/unfinished` view, backed by shared catalogue records. Trip Down Memory Lane can reference the same entry, but should *not* own all abandoned material.

### Musical production pages

**One musical, one canonical page.** Recommended dynamic sections, hidden if there is no approved content:

1. **The Show**: human-readable premise, tone, setting, story/world and characters, with approved artwork and relevant context.
2. **Listen**: embedded or external player(s), grouped by act/scene if known; individual songs, demos, versions and released albums where available.
3. **The Script**: synopsis, act/scene structure, approved reading excerpt or complete view/download if the rights permit; versions are labelled.
4. **The Making Of**: inspiration, original concept, discarded directions, writing/recording/design journey, approved notes and media. AI can draft a narrative **only from approved sources**, then send to review.
5. **Releases & Credits**: albums, track listings, editions, collaborators and external platforms, linked to exact source records with verified rights.

A visitor should be able to start from a song and discover the associated scene or story, or start with the script and listen to a song from that moment. Songs need not be final, released or attached to a completed script for the page to work.

**Potential interaction:** a script scene may contain a "Listen to this song" link; the track detail may contain "Read the scene / concept". Avoid autoplay, auto-fetching copyrighted audio or assuming that streaming platforms allow embedding. Use official external links and approved embeds where supported.

### Music versus musicals

- A `music_identity` can represent a stage/recording artist with many albums.
- A `musical` is the creative theatrical/story work, potentially associated with an artist/performer.
- An `album` is a release or collection with an ordered list of `track` records. It may be linked to a musical.
- A `song` is a creative work; a demo, instrumental version or recorded track is a **version/release** of that work. Don't duplicate each version as an unrelated song.
- `script` and `scene` artifacts have revisions and permissions distinct from song/album visibility.

## Normalised data model: requirements before implementation

### Canonical `creative_work`

```ts
type CreativeWork = {
  id: string;                              // stable slug-independent ID
  title: string;
  workKind: 'book'|'script'|'musical'|'song'|'game'|'physical_build'|'software'|'idea'|'other';
  lifecycle: 'idea'|'active'|'completed'|'permanently_shelved'|'abandoned';
  discoveryViews: Array<'writing'|'music'|'projects'|'games'|'experiments'|'unfinished'|'memory_lane'>;
  period?: { startYear?: number; endYear?: number; approximate?: boolean };
  synopsis?: string;                       // reviewed, non-invented text
  childIds?: string[];                     // ordered linked records
  relatedIds?: string[];                   // other works / people / organisations
  sourceRefs?: string[];                   // provenance; internal drafts must not leak
  editorialStatus: 'private'|'needs_review'|'public_approved';
  publishedOnDaveHub: boolean;             // false unless specifically approved
};
```

**Do not conflate these axes:** `lifecycle` tracks the underlying creative work; `editorialStatus` tracks permission to publish; `period` supports history; `discoveryViews` determines how people find the work. A permanently-shelved work can have a completed and approved archive page.

### Musical child record kinds

```text
Musical (canonical creative_work)
├── Concept / world / setting / characters (documents or structured notes)
├── Script → revision → act → scene → approved excerpt
├── Song (canonical music work)
│   ├── lyric sheet / notation / arrangement (optional)
│   ├── related act or scene (optional)
│   └── demo/recording/master versions (0..n)
├── Album / release (0..n) → ordered track links (0..n)
├── Media / artwork / performance material (0..n)
└── Process stories / milestones / credits / external platforms
```

Relationships must not require an album, a finished script, an act number, or a public recording. A concept-only musical is valid; a music-first musical with no script is valid; a permanently shelved musical with fragments is valid.

### Archived and unfinished artifacts

Each `artifact` should record `kind` (fragment, script page, outline, concept, lyric, demo, photo, sketch, other), `provenance`, `revision/date` (approximate/unknown allowed), `parentWorkId`, `visibility`, `permission/rightsholder`, `publicMediaUrl` or storage reference, and a compact optional editor-approved context note.

No raw source file is public merely because it was indexed. Public snippets must be explicit excerpts rather than wholesale AI transcription of drafts.

## Ingestion and editorial workflow implications

1. A project can be nominated as `permanently_shelved` **without creating a task, deadline or update monitor**.
2. The ingestion system may propose a one-paragraph **"What was this?"** summary, but it must never extrapolate endings, complete scenes, invent collaborators or imply a revival plan.
3. A musical importer can propose structure from approved notes and song links; it must show exactly which documents/media support each synopsis, track pairing and script relation.
4. Song/album links, lyrics, scripts, cover art and collaborator details each have separate rights/permission checks. An already public album does not automatically authorise publishing private lyrics or a script.
5. Accept sparse submissions; editorial workflow can enrich optional fields later. Owner approval remains mandatory to publish.

## Practical view prototypes: next design gate

Build **two content templates with entirely fictional placeholder records**, before private archive or music assets are collected:

- **Unfinished Shelf gallery + one detail page**: premise; why it stopped (optional); surviving fragments; dates; related ideas. Show no "Coming Soon".
- **Musical detail page**: overview, story/concept, track list/player links, script excerpts, development history and release credits, with empty sections omitted.

Make these design prototypes use one shared JSON schema, real deep-link patterns and responsive behaviour, while keeping every example fictional until specific creative material is approved. The current floating-islands homepage controls remain unchanged until layout/navigation is reviewed.

## Questions deferred without blocking design

- Whether **The Unfinished Shelf** is the final public title; alternatives include "Unfinished Projects" or a deliberately more eccentric label.
- Music's position in the main navigation versus a separate destination.
- Whether old scripts should be readable in full or only as approved samples.
- Whether musical works prefer script-first, music-first or concept-first landing layouts (likely per-work selectable).

**Acceptance:** A reviewer can see an unfinished project that is deliberately not being finished, and a musical with music/story/script linked in one place, all without another manually written blog post, leaking private drafts or creating duplicate catalogue entries.

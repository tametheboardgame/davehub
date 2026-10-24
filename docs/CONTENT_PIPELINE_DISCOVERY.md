# DH-07 to DH-11 — Living DaveHub: content architecture and assisted publishing

**Agreed direction:** 22 October 2026. **Status:** Requirements discovery approved, technical implementation not yet designed or authorised.

## Product principle

**Make the thing, not the website about the thing.** DaveHub should turn approved creative work, progress, decisions and releases into coherent experiences for human visitors with minimal maintenance. Do not require routine hand-written blog posts or turn it into a professional portfolio.

## Scope: what visitors discover

Four homepage destinations are **views**, not mutually exclusive data types: **Projects, Writing, Games and Experiments**. The same creation may appear in several places without duplicate records.

Explore these underlying record types before locking a schema:

| Record | Visitor-facing purpose | Examples |
|---|---|---|
| Creation / project | Canonical landing page with synopsis, state, media, links, people where authorised | Games, scripts, music, novels, software, interactive art |
| Idea / experiment | Interesting work before or without release; may become a project | Prototypes, failed approaches, unusual experiments |
| Milestone / release | What changed and why it matters | Playable build, finished scene, completed artwork |
| Development story | Human-readable narrative distilled from approved notes, discussions and milestones | A challenge, a design decision, a behind-the-scenes account |
| Media / playable entry | Preview asset or authorised externally hosted experience | Screenshots, approved audio, demos and videos |
| Relationship / collection | Link together ideas and projects without duplicating data | Shared characters, related writing, project timelines |

Additional surfaces to design: **What's Happening**, project history/timeline, search and direct links, the existing optional 1990s plain HTML mode, and a way to browse work at different maturity levels.

## DH-07 — Inventory and information architecture (parallel with DH-06)\n\n**24 October 2026 discovery addition:** First batch of public-facing external candidate links exposed the need for a separate *publisher/organisation* record, *music identity* distinct from a specific *album*, and an archive view named **Trip Down Memory Lane**. Nine items are staged privately pending explicit publication approval. [External inventory architecture](DH07A_EXTERNAL_INVENTORY_DISCOVERY.md) defines the proposed model; do not put unapproved candidate metadata into the public GitHub repo.

1. List *candidate* sources and what they can contribute: approved GitHub repository events, issues and PRs, project state, release metadata, art/media, deliberately selected design and development notes, and manually nominated ideas.
2. Distinguish private/unsafe internal material from public-ready work. No connector access implies permission.
3. Design one canonical project identity, multi-category taxonomy, project states, series/relationships, media provenance, stories and safe deep links.
4. Specify UX templates for a creation page, idea card, release, short development story and a chronological activity feed.
5. Design enough examples from **one existing creative game** to verify the visitor experience without publishing unapproved information. Unicorn Valley or Stephen Martin may be candidates; actual project/character/voice/media permissions remain separate.
6. Establish what *not* to show: mundane commits, repetitive changelogs, unreviewed conversations, AI-generated assertions without sources, internal company information.

**Exit:** Approved inventory and taxonomy, page/content templates, example information architecture and rights matrix. Do not begin connector write-back before this.

## DH-08 — DaveHub Ready and publishing contract

Define a deliberate entry point: **DaveHub Ready**, marked only after the owner decides a project is suitable for the public site.

Proposed conceptual workflow:

```text
CREATIVE SOURCE(S) -> nominated -> permission/rights checks
    -> "DaveHub Ready" project approval
    -> read-only event/content collection
    -> normalisation + source references + classification
    -> AI draft (synopsis, tags, story, media suggestions, links)
    -> owner review (approve / edit / reject / withdraw)
    -> validated catalogue/content change
    -> GitHub commit/PR + Cloudflare preview
    -> published on approval/merge
```

**Approval policy:** The current [publication policy](PUBLICATION_POLICY.md) remains binding: AI can generate drafts, but **cannot publish automatically**. Approval of a *project* is not approval of every future update. Later investigate scoped, explicitly authorised automatic updates only after a separate risk/rights decision and change to the policy. No silent publishing.

**Required controls:** provenance to original approved sources, duplicate/change detection, source-permission classification, preview, version history, correction and removal, ability to stop ingestion, ability to unpublish, auditable owner sign-off, secret isolation, failure reporting and protection against prompt-injection from source text.

**Exit:** Written end-to-end contract, threat/privacy review, event thresholds, provenance/approval state model, idempotency/retraction rules and owner sign-off.

## DH-09 — One end-to-end ingestion pilot

- Start with a *single* publicly approved game/project.
- Ingest project metadata plus one meaningful, reviewable milestone.
- Produce one polished project page and one proposed human-readable development update, with source links.
- Send generated content to a reviewable GitHub PR or private draft store (not a public automatically published page).
- On deliberate approval, merge and deploy to Cloudflare Pages; test edits, retries and revocation.
- Measure noise, editorial corrections and actual owner effort.

## DH-10 — Automatically drafted development stories

The point is **story extraction**, not a prose paraphrase of every commit.

Possible event signals: release tagged, milestone complete, issue group closed, significant interface/artwork approved, narrative design decision recorded.

Draft logic: identify a significant story -> gather *approved* context -> explain problem / decision / change / outcome in accessible British English -> offer supporting public media -> cite sources internally -> make a short story or activity item, as appropriate -> queue for one-tap owner review.

Preserve the creator's style. Do not invent private conversations, outcomes, screenshots, people, dialogue or facts. An update can remain a compact timeline event rather than a blog article.

## DH-11 — Extend carefully

After the pilot proves useful, add approved books, music, experiments, ideas, independent projects and other capture sources; maintain one shared catalogue and publication gate. Consider an optional owner-facing dashboard or natural-language nomination ("make this DaveHub Ready") only if it materially reduces effort.

## Provisional implementation approach

- Keep **Cloudflare Pages + GitHub** for preview/website delivery.
- Start with **portable typed project metadata and Markdown/MDX** for approved public content, not an immediate mandatory CMS or database.
- Separate the ingestion service, editorial/draft area, published catalogue and visual site.
- Prefer narrow read-only source integrations to a system with blanket repository/conversation access.
- Decide whether persistent workflow needs Supabase (or similar) only after DH-07/08 design; no automatic public publication or speculative infrastructure.

## Open design questions

- Which creations, media, timelines and levels of detail are genuinely interesting to a visitor?
- How do we capture *why* a decision happened, when GitHub only knows *what* changed?
- Which chat/discussion decisions may be nominated and extracted safely, and with what explicit approval?
- Should activity be a central feed, project-specific timeline, narrative story, or all three fed by one model?
- What triggers a meaningful update versus a minor source event?
- How much editing is acceptable before the system has failed its 'no upkeep' goal?
- How are approvals, ownership, public visibility and withdrawal recorded?
- Where should unpublished draft data live, given the main GitHub repository is public?
- Which project and third-party/voice/likeness rights require additional clearance?

## Non-negotiable constraints

Do not copy private code or private project names into public DaveHub metadata. No employer or railway data. Do not ingest raw ChatGPT discussions without an explicit supported export/capture mechanism and item-specific publication review. No silent publishing. The public repo and deployed pages are public even if marked `noindex`.

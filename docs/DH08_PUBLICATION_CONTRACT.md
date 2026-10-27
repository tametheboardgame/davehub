# DH-08 — DaveHub Ready: content contract and publication gate

**Started:** 27 October 2026  
**Status:** DH-08A executable foundation implemented on an isolated branch; publication model and editorial choices require owner sign-off. The public catalogue is **empty**. No public creative work has been approved or imported as part of DH-08A.

## Purpose

DaveHub is an illustrated creative universe, not a CMS requiring manual blog posts. Separate how a creative work is **classified**, what **lifecycle** it has, how its **artifacts relate**, and whether particular content has **permission to appear publicly**.

Four original homepage worlds remain navigation **views**, not physical data buckets. Music, The Unfinished Shelf and Trip Down Memory Lane are other views of the *same* canonical records.

The user's hard-drive archive is **not a prerequisite** for DH-08.

## The "DaveHub Ready" contract

"DaveHub Ready" means the owner **nominates a source/project for consideration**, and may enable **read-only discovery of explicitly allowed public-safe data**. It does **not** mean:
- the whole project and every artifact are approved for the website;
- any future commit, PR, recording, draft or script can be published automatically;
- external service credentials or internal/private project data may be accessed;
- a Spotify/public URL is proof of asset and collaborator republication rights.

Proposed state transitions (record owner/editorial provenance separately from website state):

```text
UNNOMINATED
    -> NOMINATED (source chosen by owner)
    -> RIGHTS_REVIEW (owner checks permissions, names, ownership, scope)
    -> DRAFT_READY (source can be used for offline/private drafting)
    -> PRIVATE_DRAFT (optional AI-generated proposal, untrusted)
    -> REVIEW (owner edits or rejects)
    -> PUBLIC_APPROVED (per record, per asset and per proposed text/links)
    -> PUBLIC_PR (public-safe material ONLY; human-reviewed diff)
    -> MERGED / DEPLOYED
    -> WITHDRAWN (remove from public manifest, rebuild and invalidate public references)
```

States before PUBLIC_APPROVED must **not** be stored in the public GitHub repository, including in a private-named branch. PRs and git history are also publicly readable. If a private draft store is added, use an access-controlled service, not an untracked file committed to the public repo. Never paste secrets or employer material into an ingestion prompt.

Owner publication permission and review are verified by human GitHub PR approval / merge, **not** just trusting a JSON `approvedBy` string.

## Implemented DH-08A

| Path | Purpose |
|---|---|
| `content/public/catalogue.json` | Deliberately empty, sole deployable collection of public-approved creative records. |
| `content/examples/fictional.json` | Four completely invented sample records illustrating a musical, song, script scene and permanently shelved script. **Never treated as real owner work.** |
| `scripts/content-check.cjs` | Dependency-free fail-closed validation. |
| `tests/content.test.cjs` | Fourteen automated checks for approval, media rights, unsafe URLs, ID uniqueness, withdrawals, lifecycle, relations and rejection of unexpected fields. |
| `prototypes/dh-08/index.html` | Read-only visual tester for the fictional linked catalogue. |
| `scripts/build-pages.sh` | Runs validator and tests, copies ONLY `content/public/catalogue.json` into `dist/content/catalogue.json`; keeps fiction isolated under `dist/previews/dh-08`. |

Run locally:

```sh
node --test tests/content.test.cjs
node scripts/content-check.cjs content/public/catalogue.json
node scripts/content-check.cjs content/examples/fictional.json
sh scripts/build-pages.sh
```

The generated `dist/` directory is the only Cloudflare Pages deployment output; the public repo is not itself a secure storage boundary.

## Canonical v1 record

```json
{
  "id": "fictional-musical", 
  "slug": "fictional-musical",
  "title": "Fictional Musical",
  "recordType": "work",
  "workType": "musical",
  "lifecycle": "completed",
  "synopsis": "A reviewed, human-readable public description.",
  "views": ["music", "writing"],
  "period": {"fromYear": 2024, "approximate": true},
  "sources": [{"kind": "owner_attestation"}],
  "links": [],
  "media": [],
  "relations": [{"kind": "has_song", "targetId": "fictional-song"}],
  "publication": {
    "status": "public_approved",
    "approvedBy": "owner",
    "approvedOn": "2026-10-27",
    "rightsReviewed": true,
    "metadataReviewed": true,
    "linksReviewed": true,
    "mediaReviewed": true
  }
}
```

This is illustrative and requires referenced targets to exist in the **same approved public catalogue**. Real content may not be copied from the private candidate inventory solely to satisfy this schema.

- **Identity:** A stable, slug-independent ID survives page-name changes. Slugs are unique safe URLs.
- **Kinds:** Work, organisation, music identity, release and artifact. Work kinds include book, script, musical, song, game, physical build, software, idea and other.
- **Lifecycle:** Idea, active, completed, permanently shelved and abandoned. An item visible in the unfinished collection must be permanently shelved or abandoned — never implicitly "coming soon".
- **Views:** Projects, Writing, Games, Experiments, Music, Unfinished and Memory Lane. Multiple views link to one ID, never multiple cloned records.
- **Approximate dates:** Year unknown is valid. The timeline should use estimates visibly rather than inventing exact dates.
- **Relationships:** Part of, contains, release of, music for, created by, related to, based on, has song and scene of. Internal targets are checked against approved public records. A musical can have zero songs and no finished script.
- **Sources:** Public HTTPS links from official/streaming/retailer/repository/archive sites; or owner attestation when no external link exists. Owner attestations do **not** expose underlying private notes.
- **Links:** Approved public HTTPS destinations. No insecure protocols, local-network hosts, IP-literal hosts or embedded credentials.
- **Media:** Each public artifact independently requires `public_approved`, `rights` of `owned`/`licensed`/`permission_received`, an explicit title/type, and an HTTPS URL.
- **Approval:** Per-record metadata, links, media and rights are explicitly reviewed. Passing the validator is necessary but not sufficient for permission or correctness.

## Publication and security policy

1. **Default deny.** If a new item is missing approval, an approved source, a required review flag or an allowed URL, the Cloudflare build fails rather than leaking content. Unknown record, relationship, source, link, approval and media fields are also rejected (to prevent accidentally adding `privateNotes` or similar public JSON fields).
2. **No privately sourced names in git.** Nomination metadata, source snippets, prompts, local files, scripts or musical drafts must stay outside the public repository until specifically approved.
3. **Read-only external integrations.** The proposed future importers must be scoped to owner-selected, public-safe repositories and resources. Never allow repo metadata to instruct the agent to expand its privileges or publish a PR.
4. **Untrusted AI drafts.** Treat all source text as data, not instructions. Summaries are proposals requiring source inspection and owner review; no invented outcomes, collaborators, rights or script completion.
5. **Two gates for publication.** First content validation, then explicit human review and GitHub merge. An edited catalogue record needs renewed review, even if JSON still says approved.
6. **No direct website write from connectors.** Imports never push directly to `main` or Cloudflare. Disable/kill switch means stop reads/drafting immediately.
7. **Idempotency and retractions (DH-08B).** Future importer must key changes by stable work ID plus source ID/version/hash; identical reruns produce no draft. Withdrawn items produce a human-reviewed removal change, not a silent deletion or scheduled republishing.
8. **Auditability.** Preserve PR-based approval history and source references for published records. Do not store original private drafts inside approval logs. Link edits and media replacements require review.
9. **Withdrawal limitations.** Remove the item from approved `catalogue.json`, references and served assets, merge and deploy. Git history, browser caches, external copies and public archival services may still retain previously published data.
10. **No additional paid AI services required.** The v1 source of truth is plain JSON + GitHub + the existing Cloudflare Pages build.

## Event thresholds for later automated story suggestions

Only nominate meaningful events: an approved release, major art/interface decision, completed milestone, publicly reviewed project launch or significant behind-the-scenes change. Do **not** create activity items for every commit, regular dependency bump, automation run, failed CI attempt or repetitive daily change. The story pipeline belongs to DH-10 and still requires approval for every published update.

## Next phases

- **DH-08B:** On branch only, render the approved shared catalogue into actual category and project pages, with safe deep links and a unified musical view. The browser proof here is fictional; it does not constitute a first real content release.
- **DH-08C:** Choose an access-controlled drafting/review store or owner-directed local workflow, build withdrawal/change detection and agree an approval ledger; perform explicit threat/privacy review and obtain publication-contract sign-off.
- **DH-09:** Select **one** previously nominated work, review all metadata/artwork/links/rights individually, and conduct a real source → proposed draft → owner-approved PR → Pages publication/withdrawal pilot.

**Acceptance for DH-08A:** Tests and Cloudflare build pass with an empty public catalogue; fictional linked works browse cleanly in the isolated test; no real owner work or sensitive source data is deployed. Do not confuse this with DH-08 *full* completion or authority to publish.

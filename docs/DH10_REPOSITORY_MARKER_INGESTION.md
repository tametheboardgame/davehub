# DH-10 — DaveHub Ready repository markers and read-only ingestion

**Started:** 28 October 2026  
**Status:** v1 manifest validator, discovery scanner and recurring review report implemented in draft; not yet merged or independently tested against all remote repositories.

## The rule

Each GitHub repository **may** contain a root-level `davehub.json`. The `enabled` property is the explicit opt-in:

- **Missing file = disabled.** Repositories without a manifest are ignored.
- `{"schemaVersion":1,"enabled":false}` = explicitly disabled.
- `enabled:true` plus validated fields = **eligible for read-only metadata discovery**, not public release.
- The marker is not a command to copy files, republish media, read private data, or commit to DaveHub.
- The file itself must contain **public-safe metadata only**. Never put credentials, internal network addresses, private names, customer information, private draft excerpts, unpublished lyrics, collaborator material or hidden source details into it.

This is a **candidate-nomination contract**, never a self-issued publication approval. For actual publication, enforce the existing [DH-08 editorial policy](DH08_PUBLICATION_CONTRACT.md), item-level permissions and the owner-approved PR/merge gate. Unapproved candidates must never be copied into `content/public/catalogue.json`.

## Enabled example: a game

```json
{
  "schemaVersion": 1,
  "enabled": true,
  "id": "unicorn-valley",
  "title": "Unicorn Valley",
  "description": "A cosy browser-based unicorn adventure in a magical valley.",
  "type": "game",
  "lifecycle": "active",
  "categories": ["games", "projects"],
  "tags": ["cosy game"],
  "links": {
    "repository": "https://github.com/tametheboardgame/unicorn-valley",
    "play": "https://unicorn-valley.pages.dev/"
  },
  "updates": {
    "proposeMilestones": false
  }
}
```

### What each field means

| Field | Meaning |
|---|---|
| `schemaVersion` | Required integer schema version (currently 1). |
| `enabled` | **Required** boolean. Missing is treated as disabled; false is a minimal manifest with no further fields. |
| `id` | Stable canonical DaveHub identity, not the project’s current git branch or a generated URL. Lowercase hyphenated slug. |
| `title` | Human-readable project name, max 180 chars. |
| `description` | Public-safe *proposed* description, max 500 chars; editor may rewrite before publication. |
| `type` | One of `book`, `script`, `musical`, `song`, `game`, `physical_build`, `software`, `idea`, `other`. |
| `lifecycle` | `idea`, `active`, `completed`, `permanently_shelved`, `abandoned`. This is separate from publication status. |
| `categories` | One or more of `projects`, `writing`, `games`, `experiments`, `music`, `unfinished`, `memory-lane`. Multiple categories share one canonical page. An unfinished item must actually be shelved/abandoned. |
| `links.repository` | **Mandatory and exact** GitHub URL for this repository, to prevent impersonation/mismatched sources. |
| `links.play` / `links.homepage` | Optional safe HTTPS links; source URLs only, not an automatic instruction to mirror game assets. |
| `tags` | Up to eight short public-safe descriptive tags. |
| `updates.proposeMilestones` | Whether a later feature may propose major milestone snippets for editorial review; **does not post**, and default is off. |

Unknown fields fail validation (including any misleading `approvedForPublication`, `instructions`, `assetsToCopy`, `apiKey` or `scripts`). Every URL must be public HTTPS with no credentials, local/private hostname or IP literal. The schema rejects arbitrary JSON instructions and permits no source-provided command execution.

## Initial source-repository opt-in PRs

The following **four** manifest proposals were created on 28 October 2026. All remain **draft** until owner review and the central scanner goes live:

| Repo | PR | Proposed category views |
|---|---|---|
| `unicorn-valley` | [#338](https://github.com/tametheboardgame/unicorn-valley/pull/338) | Games, Projects |
| `stephen-martin-project` | [#92](https://github.com/tametheboardgame/stephen-martin-project/pull/92) | Games, Projects |
| `ordinary-universe` | [#11](https://github.com/tametheboardgame/ordinary-universe/pull/11) | Writing, Projects, Experiments |
| `octo-maraton-ideas` | [#5](https://github.com/tametheboardgame/octo-maraton-ideas/pull/5) | Projects, Memory Lane |

These PRs change only the root `davehub.json` metadata and **do not add** publishing automation to those repositories.

### Fleet inventory

The GitHub account exposes **19** repositories (at the initial 28 October scan). Four opt-in proposals are above; `davehub` itself opts out; the remaining **14** repositories currently have no marker and are therefore treated as disabled. Later, create two-field `enabled:false` markers via individual reviewed PRs for uniformity if desirable. Do not silently modify sensitive, operational, employer-related, fitness or financial data repositories.

## v1 discovery engine

- `scripts/davehub-manifest.cjs`: validates marker structure, recognised taxonomy, explicit source repository identity and safe links.
- `scripts/davehub-discover.cjs`: enumerates **public, non-forked, non-archived** repositories under a known GitHub owner, reads `davehub.json` on each default branch, validates enabled manifests, then emits a **review-only** report.
- `tests/davehub-discovery.test.cjs`: tests valid/disabled/invalid manifests, missing files, invalid URLs, categories, editorial review state and source identity.
- `.github/workflows/davehub-discovery.yml`: on-demand and Monday morning discovery. **Read-only** permissions, emits an Actions artifact `davehub-ready-discovery` with a 7-day retention period. No commits, PRs, merge, publishing or Cloudflare deploy.
- `davehub.json` on DaveHub itself is **disabled**; infrastructure should not create a self-referential portfolio entry.
- `scripts/build-pages.sh` runs manifest validation and tests to prevent a schema regression.

Run on a machine with Node 22 and outbound public GitHub access:

```sh
node --test tests/davehub-discovery.test.cjs
node scripts/davehub-discover.cjs --owner tametheboardgame --out reports/davehub-discovery.json
```

It may use `GITHUB_TOKEN` for API rate limits and is restricted to the source owner’s publicly visible repos. It does **not** need write credentials, access to private repositories or secrets. Don't include private repos in a public discovery report. The GitHub Actions artifact in a public repository may be publicly discoverable: **manifest contents must be public-safe**.

The report's candidates are marked `reviewStatus: needs_owner_review` and `published:false` regardless of source content. Scanner errors (including malformed or duplicate IDs) are reported and fail the workflow rather than silently promoting bad content.

## Rollout approach

1. Start with repositories explicitly intended for DaveHub. Seed `enabled:true` markers on **Unicorn Valley** and **The Stephen Martin Project** for owner review, plus other clearly public creative repos if approved. Do not bypass specific character/audio/likeness rights or first-party game release QA.
2. Missing marker already behaves exactly like `enabled:false`. For a uniform repo fleet, add a **two-field disabled manifest** to remaining repos via reviewed PRs, but do not reconfigure sensitive/operational repos automatically.
3. Once the published catalogue/editorial workflow has been reconciled, connect the review report into the Content Workshop’s candidate queue. Match by immutable `sourceRepository` plus `id`; do not copy raw README text or script files and don't overwrite manual editorial notes.
4. Implement change detection: compare a canonical hash of validated public marker fields and the source default-branch commit. Identical run = no-op; changed marker = fresh editor review, not silent auto-publish.
5. Implement milestone suggestions only when `updates.proposeMilestones:true` **and** a trusted release source is supplied. Propose meaningful game releases/features, not every commit, CI run or daily chore.
6. Preserve the future [DH-09 staging/live split](DH09_DOMAIN_LAUNCH_RUNBOOK.md). Auto-discovery **never** pushes straight to either staging or live. Approved site changes still follow feature PR → staging preview → owner promotion → live.

## Source authority and safety

The manifest controls **classification and discoverability**, not permissions. Real content only appears in the public DaveHub manifest after validation, item-level owner rights approval and reviewed promotion. No automation may accept a source README, issue, PR, commit text or a `davehub.json` property as executable operational instructions. Remote text is untrusted.

This contract works for future games, comic anthologies, software projects, bands, writing collections and historical material; repositories are merely one origin. Published books, external music catalogues and the collaborative board-game blog can still be added through the manual/approved Content Workshop without requiring a GitHub repository.

**No custom domain configuration is needed.** The marker can be tested through the current `davehub.pages.dev` build and later through its staging equivalent.

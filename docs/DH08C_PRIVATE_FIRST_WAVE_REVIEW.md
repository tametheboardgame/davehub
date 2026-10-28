# DH-08C: first three creation pages, private owner review (historical)

**Superseded after explicit owner approval on 28 October 2026.** The original review-only state described below is retained as history; the current three-entry public catalogue and approval scope are documented in [DH-08D](DH08D_FIRST_THREE_PUBLISHED_PROJECTS.md).

**Status:** Built for review; **publication is NOT approved**. This phase deliberately replaces the unsafe direct-public-catalogue proposal in older PR #21. The canonical `content/public/catalogue.json` remains `{"schemaVersion":1,"items":[]}`.

## First wave, pending final owner sign-off

| Project | Intended category | Intended link | Editorial notes |
|---|---|---|---|
| Unicorn Valley | Games and Projects | [Playable main version](https://unicorn-valley.pages.dev/) | Confirm main URL and description; game source/assets are not copied |
| The Stephen Martin Project | Games and Projects | [Existing game](https://stephen-martin-project.pages.dev/) | Adult comedy; check playable URL and individual rights around artwork, voice and likeness; no media copied |
| Tame The Board Game | Games, Writing, Memory Lane | [Collaborative website](https://tametheboardgame.com/) | Credits must recognise Miriam's co-creation and contributions; no articles/media copied |

All first-wave review pages now display **two explicit links**: the original game Play destination plus its public source repository for each game, and the blog homepage plus the [About/contributor-credit page](https://tametheboardgame.com/about/) for Tame The Board Game. The Workshop exposes an editable additional-link URL/label/type field and validates it even in private drafts. No additional media has been copied.

These descriptions, credits and links are **proposals**. They live in `tools/workshop/first-wave.cjs`, not the deployed catalogue. They carry `status:"needs_review"`, `ownerApproved:false`, four false review gates, and no approval date. The old PR #21 contains publication-shaped records and must **not** be merged without removing that implicit approval.

## How to review the real DaveHub page designs safely

Use a checkout of this feature branch on your own computer with Node.js 22:

```sh
node tools/workshop/server.cjs
```

Open <http://127.0.0.1:8765/> on that **same computer**.

1. Press **Prepare the agreed three**. This inserts the three nominations into private local storage and never overwrites your existing edits if pressed again.
   The **Three projects, one review queue** dashboard then shows the three proposals, the number of completed self-attested review checks and the unresolved actions for each. It does not itself verify rights or links and does not grant publication approval.
2. Select a project in the editorial queue, then press **Preview selected page** to open its page using the **same `render-content.cjs` templates** and `worlds.css` as DaveHub. Press **Preview local worlds** for the Games/Projects/Memory Lane discovery pages. A prominent banner identifies all pages as **PRIVATE OWNER REVIEW · NOT PUBLISHED**.
   Save your edits before previewing; unsaved changes are clearly flagged and previewing the selected draft is disabled until they are saved. Switching projects prompts before discarding unsaved changes.
3. Verify the source, title, synopsis, collaborative attribution, outbound links, development lifecycle and rights. No thumbnail or asset is bundled.
4. To import DH-10 repository discovery, download the GitHub Actions report and upload either `davehub-discovery.json` or its prepared `davehub-workshop-import.json` with **Import a discovery report or candidate list**. Incoming approvals are stripped. Identical records are skipped; duplicate slug/source conflicts fail without writing a partial batch.
5. Save changes locally. Publication remains blocked until **all four review checks and explicit owner sign-off**; even an approved export is only a **proposal JSON**, never a commit or deployment. Separate owner confirmation and a reviewed GitHub PR to the public catalogue remain required.

## Isolation guarantees

- Local host is `127.0.0.1`; draft JSON stays in `~/.davehub/workshop/drafts.json`, outside the Git checkout. Not encrypted. Never store passwords, sensitive employment data or confidential documents.
- Review pages require a random per-launch local session cookie after opening the Workshop. Data APIs require a separate random CSRF/session header; both are scoped to the loopback host. Local previews and imports are not copied to Cloudflare's `dist` directory.
- Preview rendering **omits the `publication` field entirely**, so the validated public catalogue contract rejects those candidate records. HTML content is escaped and external links are HTTPS-validated; source media is not mirrored.
- Unsafe outgoing URL schemes are rejected even for unapproved local drafts at first save. The readiness dashboard is derived from saved private drafts and makes no network calls or approval changes.
- No database, remote workshop service, GitHub token or new subscription is needed to use the local editor. Downloaded GitHub discovery reports are imported **only when the owner selects a file**.
- CI runs the Content Workshop, discovery, navigation, rendering and public-catalogue regressions on every relevant PR. It also checks the shipped public catalogue remains empty until explicit final approval.
- `noindex` is not access control. **Never deploy local draft pages or Workshop data to a public branch preview**. Code and publicly sourced summaries inside this public GitHub feature branch can be read by anyone.

## Exit criteria before any first publication

Owner visually reviews the three actual page layouts and approves each project's words, classifications, credits, destination links and media scope. Then produce a **separate three-record publication PR** with explicit `public_approved` status and review audit dates; do not silently change `content/public/catalogue.json` or merge the old PR #21. First-party game hosting at `/games/.../` remains the independent DH-09 stream.

## Independent link and attribution evidence (28 October 2026)

- **Unicorn Valley:** Its production README explicitly identifies `https://unicorn-valley.pages.dev/` as the main deployed browser game. This is repository documentation evidence, not an independently completed browser playthrough.
- **The Stephen Martin Project:** Its README confirms the three playable endings and owner-accepted V1, but explicitly forbids treating V1 acceptance as permission for new outward promotion. The proposed `https://stephen-martin-project.pages.dev/` URL still needs owner browser verification and a separate publication/rights decision.
- **Tame The Board Game:** The site's [About page](https://tametheboardgame.com/about/) identifies David and Miriam and describes their jointly founded blog in 2013. Its [homepage](https://tametheboardgame.com/) includes January 2026 posts by Miriam. The proposed review description credits them without copying posts or media. The owner still decides what may appear on DaveHub.

**Do not equate a GitHub README, online source, checked review box, or successful test with permission to publish.** Only the owner's final approval clears the separate publication review gate.

# DH-08C1 — Owner-controlled Content Workshop and first real-world showcase

**27 October 2026**  
**Status:** Implemented in `feature/dh-08c-content-workshop-first-real-worlds`; Cloudflare preview and owner review before public merge.

## Owner directions incorporated

- Showcase the **main playable versions** of Unicorn Valley and The Stephen Martin Project inside DaveHub's Games/Projects catalogue.
- Add [Tame The Board Game](https://tametheboardgame.com/) as a **collaborative board-games blog** in Games, Writing and Trip Down Memory Lane. It began in 2013 and had new posts in January 2026; do not label the whole site abandoned.
- Continue with prior candidate inventory: publisher Cricetus Cricetus, three ISBN-listed published books, musical and music identities, earlier albums, When Victory Falls, the comic anthology and old builds. Their details **remain in a separately supplied local import file**, not GitHub, until reviewed individually.
- No paid GPT API or new subscriptions.

## Current public-catalogue proposal (review branch only)

The following THREE records are included in `content/public/catalogue.json` on this review branch; `main` is unchanged until merge.

| Work | Main destination | Safe links only |
|---|---|---|
| Unicorn Valley | Games, Projects | `https://unicorn-valley.pages.dev/` and source GitHub repo |
| The Stephen Martin Project | Games, Projects | `https://stephen-martin-project.pages.dev/` and source GitHub repo |
| Tame The Board Game | Games, Writing, Memory Lane | `https://tametheboardgame.com/` and collaborative About page |

These are **text-and-link-only** records. No third-party game assets, photos, collaborators' work, game dialogue/voice or WordPress posts have been copied to DaveHub.

Unicorn Valley's README documents the main Cloudflare build as playable and actively developed. The Stephen Martin repository documents the three-ending V1 and contains explicit restrictions on unapproved new marketing/asset republication. The owner's latest instruction explicitly supports **linking/showcasing the existing main playable game**, not copying characters/voice/assets, launching a new version, or changing its source repository. The exact production URL should be browser-checked before approving this PR, since automated public website fetching may reject Cloudflare addresses.

The old board-games blog was co-created with **Miriam**, who also authored later posts. Treat it as a joint publication; an editorial snapshot must not imply its article copyright or authorship is exclusively the DaveHub creator's.

## Local Content Workshop

**DO NOT upload any editorial drafts into this public repository or Cloudflare.** The app source code is public, but the editor runs **only on your own computer**.

1. Clone or update `tametheboardgame/davehub` to this review branch.
2. Install Node.js (already necessary for other DaveHub build work).
3. Run `node tools/workshop/server.cjs` from the repository folder.
4. Open `http://127.0.0.1:8765/` in a browser on that computer.
5. Import your privately downloaded `DaveHub_DH08C_private_candidate_inventory.json` (provided in the chat, **not** committed to Git).
6. Review the imported candidates individually. Imported items always reset to **Needs review**, regardless of any claimed approval fields.
7. Verify title, public description, sources, links, rights and collaborators. Set **Approved for export** only after all four checkboxes and an explicit owner sign-off.
8. Select **Export approved proposal** to download `davehub-approved-proposal.json`. It includes all already-approved public catalogue records plus only newly approved draft records. A GitHub PR review and merge are **still required**; the editor does not publish anything.

Draft data lives at `~/.davehub/workshop/drafts.json` (your user profile on Windows), not under the Git checkout. No registration, Supabase, API key, remote account, automation schedule or subscription is required.

### Technical safeguards and limitations

- HTTP server binds to loopback `127.0.0.1`, default port 8765.
- Host and Origin requests are checked; every data operation requires a new random in-memory token delivered only to the local page. No permissive CORS; restrictive CSP, no third-party JS/fonts/network calls.
- Private store folder and new file use owner-only modes where the OS supports them. It is **not encrypted** and should not be used for secrets or confidential employment material. A malicious local user with access to your machine/profile can still reach it.
- Draft API permits JSON only, at most 1MB/request. Unknown input fields are removed. Editorial `notes` never enter public exports.
- Imports cannot confer publication approval. Approval requires checkboxes, owner sign-off, an approval date and passing the exact shared public catalogue validator.
- Export starts with the checked-in approved `content/public/catalogue.json`, preserving works not being edited, then overlays new individually approved records. It cannot silently wipe unrelated works.
- No public media republishing, mass source scraping, remote importer or automated publication is attempted.
- GitHub's public repo and every PR/branch can be read publicly; a private-sounding branch name is **not** private storage. Cloudflare `noindex` is not access control.
- Browser test needs owner verification; tests and Cloudflare builds check renderer and publication gates, not every actual external game's live URL.

## Next stages

- **DH-08C2:** Review the first three linked listings in Cloudflare. Once accepted, merge their text-only pages.
- **DH-08C3:** Use the private import file and Workshop to approve first published book, music identity and musical, handling rights/cover/recordings on an item-by-item basis.
- **DH-09:** Build read-only DaveHub Ready ingest from explicitly approved public repository sources, with idempotency, source/version fingerprints and a human-reviewed PR for meaningful releases. Ingestion does not automatically add future updates to live DaveHub.
- **Game hosting:** Prefer linking the existing verified main Cloudflare builds first. A future `davehub.co.uk` branded subdomain, same-origin proxy or copying builds into DaveHub requires a separate architecture and rights/asset review.

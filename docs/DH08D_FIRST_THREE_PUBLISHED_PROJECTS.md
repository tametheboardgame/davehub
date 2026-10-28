# DH-08D — First three owner-approved public projects

**Approval:** Owner explicitly requested approval of the three first-wave projects on 28 October 2026 so they could be accessed from the main DaveHub destinations.

## Exact publication scope

The following **text and destination links**, which had already been prepared for owner editorial review, are approved for the first-wave DaveHub catalogue:

| Creation | DaveHub creation URL | Discovery views | External destination |
|---|---|---|---|
| Unicorn Valley | `/creations/unicorn-valley/` | Games; Projects | Existing playable Cloudflare Pages site and GitHub source |
| The Stephen Martin Project | `/creations/stephen-martin-project/` | Games; Projects | Existing playable Cloudflare Pages site and GitHub source |
| Tame The Board Game | `/creations/tame-the-board-game/` | Games; Writing; Memory Lane | Existing blog and its contributor About page, crediting both David and Miriam |

**This authorises the three public directory listings, their approved descriptions and links. It does not authorise copying game source, artwork, music, voices, images, blog posts, collaborator material or user data into DaveHub.** Every approved public item has `media:[]`.

The creation pages are genuine `/creations/<slug>/` paths within DaveHub. Each game has a prominent **Play now** link to its existing Pages project. This still opens the game on the original external website; first-party game bundling under `/games/<slug>/` is an independent **DH-09** deliverable requiring pinned builds, rights and save-data continuity tests. **Do not claim those standalone games are hosted at DaveHub yet.**

## Acceptance gates

- Shared `content/public/catalogue.json` passes the fail-closed owner/publication validator for exactly three items, all approved on 28 October 2026.
- Games contains all three entries (including the board-games blog); Projects contains the two games; Writing and Memory Lane contain the blog. Cards link to actual `/creations/` pages.
- External Play/Visit buttons and secondary source/About links are visible and clearly marked as opening in a separate tab.
- All three public work pages include valid descriptive text and no review-only placeholder, private notes, unreleased media or internal approvals.
- Unapproved repo-discovery candidates still cannot enter the public catalogue automatically. The existing local Workshop remains an optional editorial tool but is no longer needed for basic user site review.
- Existing DH-08C design-only previews remain isolated under `/previews/dh-08c/`; normal homepage categories must **not redirect** to them after the public catalogue becomes non-empty.
- GitHub Actions verify the build and published routes. The remote Cloudflare staging smoke probes live `davehub.pages.dev` after merging the approved PR, with a separately running external-URL smoke on PRs.
- `davehub.pages.dev` remains the test/development host; `davehub.co.uk` is still unconfigured. Separate future live project/promotions remain subject to DH-09 architecture.

## Source and rights boundaries

- Unicorn Valley: main repository's README documents the production browser-game address.
- Stephen Martin: existing repo documents an owner-accepted three-ending playable V1 but also restricts additional promotional materials; this narrow approval covers *a text/link listing only*, not republication of its image or voice assets.
- Tame The Board Game: official About page identifies the blog's joint origin and both contributors. Miriam receives explicit credit; no text or media from either contributor's posts is copied.

No automated future GitHub discovery item receives approval from this one-time decision.

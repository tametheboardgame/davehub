# DaveHub

**An unreasonable number of projects. One very unreasonable place to explore.**

DaveHub is an eccentric, publicly accessible home for games, writing, music, interactive stories, software, experiments and whatever else seemed like a good idea at the time.

It is emphatically **not** a CV, developer portfolio, professional marketing site or generic blog template. The website itself should be an original, playful project.

## Staging and production domain policy (locked)

The future launch will use **two separate Cloudflare Pages projects connected to the same GitHub repository**. The existing `davehub.pages.dev` hostname remains the permanent **staging/test** environment (persistent `staging` branch once the cutover is ready), and the future `davehub.co.uk` website will use a **new live Pages project** deploying the reviewed `main` branch. Routes such as `/games/stephen-martin/` and `/games/unicorn-valley/` will work on both hosts, but each environment can run a different approved version. A live release requires explicit owner approval; staging changes never automatically deploy to production.

**When setting up the custom domain, start with [the DH-09 domain launch runbook](docs/DH09_DOMAIN_LAUNCH_RUNBOOK.md).** It includes the two-project Cloudflare configuration, the branch promotion process, DNS/TLS steps, QA and rollback checks, and save-data warnings. Do not attach `davehub.co.uk` to the existing Pages staging project or switch its production branch prematurely. The domain is not configured yet.

## Cloudflare-first owner reviews (DH-08C4)

DaveHub owner review uses hosted staging previews by default, **not local server commands**. The public-safe, layout-only first-wave demonstration is built at `/previews/dh-08c/`, containing three project names, placeholder descriptions and no unapproved game/blog links or private editorial drafts. The real catalogue remains empty. See [hosted review workflow](docs/DH08C4_HOSTED_REVIEW_WORKFLOW.md) for the URL, QA checklist and Cloudflare Access constraints.

## DH-08C: three first-wave creations awaiting owner approval

The **private local Content Workshop** can prepare Unicorn Valley, The Stephen Martin Project and Tame The Board Game, review their descriptions/credits/links and preview their real DaveHub pages on `127.0.0.1:8765`. The three entries are **unapproved nominations only** and are absent from the deployed catalogue. Discovery reports can be imported with safe duplicate handling. Publication is forbidden until a new explicit owner-approved catalogue PR. [First-wave review guide](docs/DH08C_PRIVATE_FIRST_WAVE_REVIEW.md).

## DH-10D: Default-off marker in every managed new repository

Create new repositories through `node scripts/davehub-new-repo.cjs NAME` (defaults private). Its first Git commit includes a root `davehub.json` with `{"schemaVersion":1,"enabled":false}`. For an existing repository missing the file, use `node scripts/davehub-new-repo.cjs --repair NAME`; an existing manifest is never overwritten. The Monday discovery audit reports newly created **public** repos missing the marker. Private repositories created outside the helper cannot be checked by that read-only GitHub Action. See [DH-10D repository bootstrap](docs/DH10D_REPOSITORY_BOOTSTRAP.md).

## DH-10: DaveHub Ready repository discovery (v1 merged)

Creative repositories can opt in by adding a public-safe, root-level `davehub.json` with `enabled: true`, project title, description, type, lifecycle, categories and approved external links. A missing or disabled manifest excludes that repository. A weekly/on-demand **read-only** scanner prepares a review report, never publishes or copies source assets automatically.

- [Repository marker schema, initial PR rollout and review policy](docs/DH10_REPOSITORY_MARKER_INGESTION.md)
- Source metadata is **not** an editorial permission grant. This is opt-in *discovery* only. Public catalogue changes still need a reviewed proposal and owner approval.
- The Stephen Martin Project, The Ordinary Universe and Octo-Marathon have merged opt-in manifests. Unicorn Valley PR #338 has a corrected marker and is undergoing final CI. Sensitive and operational repos remain excluded by default. The first live scan discovered three approved-to-discover repositories, but published none.

## Status

**DH-07 illustrated homepage and discovery navigation locked, merged and deployed to Cloudflare Pages on 27 October 2026. DH-08 publishing controls are in development.** The owner has purchased **davehub.co.uk** as the primary domain; DNS and hosting are not configured. The owner has selected Concept 1 as the primary visual reference; final foreground art and character motion remain open. The approved static homepage, mystical Explore directory and fictional content-world test pages are deployed. The real published-work catalogue remains empty pending explicit item approvals.

## North star

> A visitor should arrive, think “what on earth is this?”, then discover something unexpectedly interesting within seconds.

The experience should reward exploration without making it difficult to find a specific project.

## The plan

1. Refine the **locked Concept 1** landing direction, supported by Concept 2's portal architecture and Concept 3's observatory/interface elements.
2. Design the illustrated Dave host and skippable entry into a creative mindscape.
3. Build a click-to-explore prototype **without a walking avatar**, plus a deliberately basic 1990s-style HTML menu mode.
4. Test the same project catalogue in both interfaces, including mobile and accessibility.
5. Integrate approved real projects and optional human-reviewed publication drafts.

## Prototype

The static homepage is at repository root (`index.html`, `styles.css`, `main.js`, `catalogue.js`). Use `sh scripts/build-pages.sh` to create the curated `dist/` output for Cloudflare Pages. Cloudflare GitHub integration is active; the project is deployed at the existing `davehub.pages.dev` hostname, with branch previews on PRs. Details: [Cloudflare Pages setup](docs/CLOUDFLARE_PAGES.md).

The approved logo and background are repository assets. DH-06D adds an owner-supplied transparent Giant Dave animation, with the approved still retained for reduced-motion, data-saver and unsupported browsers. This motion experiment requires visual review before merging.

## DH-08B: Shared creative-world pages (review branch)

- [Shared content-page architecture](docs/DH08B_SHARED_CONTENT_PAGES.md): single renderer generating seven catalogue views plus unique deep-linked creation pages.
- Real approved entries are rendered from the validated `content/public/catalogue.json`; currently **empty**. The fictional musical/script/song example renders separately at `/previews/dh-08b/worlds/` on the branch.
- Explore DaveHub now opens the new `/worlds/` experience directly, and each floating island leads to its own content world; the redundant intermediate pop-up has been removed. Empty public worlds link to an explicitly fictional walkthrough.

## DH-08: Safe creative catalogue (in development)

- [DaveHub Ready publication contract](docs/DH08_PUBLICATION_CONTRACT.md): owner-nominated sources, rights reviews and human-approved publication only.
- `content/public/catalogue.json` contains **zero real works** until explicitly approved. `content/examples/fictional.json` is a separate test fixture.
- `node --test tests/content.test.cjs` and `node scripts/content-check.cjs content/public/catalogue.json` verify content safety, including rejection of unexpected private/draft fields. The Cloudflare build runs both automatically.
- `/previews/dh-08/` is a read-only fictional-content demonstration on the branch, not an importer or publishing UI.

## Current design and automation workstreams

- [DH-06: Giant Dave motion concept](docs/GIANT_DAVE_ANIMATION.md), with the [exact production layered rig blueprint](docs/GIANT_DAVE_LAYERED_RIG_SPEC.md) and [articulation-first decision](docs/DECISIONS/ADR-0010.md). The layered artwork and production animation still need to be made.
- [DH-07–DH-11: Living content and publishing system](docs/CONTENT_PIPELINE_DISCOVERY.md), now including [DH-07B unfinished creative work and musical production pages](docs/DH07B_UNFINISHED_AND_MUSICALS.md). The archive can be populated incrementally and will never label deliberately abandoned work as an active to-do item.

## Planning documents

- [Creative brief](docs/CREATIVE_BRIEF.md)
- [Experience principles](docs/EXPERIENCE_PRINCIPLES.md)
- [Locked concept-art gallery](docs/LOCKED_CONCEPTS.md)
- [Consolidated visual concepts](docs/CONCEPTS.md)
- [Visual direction and exclusions](docs/VISUAL_DIRECTION.md)
- [Prototype comparison and test plan](docs/PROTOTYPE_TEST_PLAN.md)
- [Retro menu mode design](docs/BORING_MENU.md)
- [Roadmap](docs/ROADMAP.md)
- [Technical direction](docs/TECHNICAL_DIRECTION.md)
- [Publication and permissions policy](docs/PUBLICATION_POLICY.md)
- [Architecture decisions](docs/DECISIONS/)
- [Development and setup guidance](SETUP.md)
- [Cloudflare Pages preview deployment guide](docs/CLOUDFLARE_PAGES.md)

## Working rules

- A project stays in its own repository and deployment. DaveHub links out to it or embeds an approved public experience.
- New work should use scoped branches and be reviewed before merging.
- Keep `docs/ROADMAP.md`, `AGENTS.md` and `PROJECT_STATE.json` in sync.
- The repository is **public**. Do not commit private information, employer material, unapproved personal details, secrets or unlicensed assets.
- Integrations must not automatically publish content; human review is required.
- British English throughout.

**DaveHub** is the working name and **davehub.co.uk** is the selected primary domain (owner reports purchased). The core visual references are approved, while the exact artwork for production, hosting and deployment remain open.

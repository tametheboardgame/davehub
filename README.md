# DaveHub

**An unreasonable number of projects. One very unreasonable place to explore.**

DaveHub is an eccentric, publicly accessible home for games, writing, music, interactive stories, software, experiments and whatever else seemed like a good idea at the time.

It is emphatically **not** a CV, developer portfolio, professional marketing site or generic blog template. The website itself should be an original, playful project.

## Status

**DH-01A homepage first-look implemented, 22 October 2026 (awaiting first hosted visual review).** The owner has purchased **davehub.co.uk** as the primary domain; DNS and hosting are not configured. The owner has selected Concept 1 as the primary visual reference; final foreground art and character motion remain open. The static interactive first-look homepage is built; no site is deployed.

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

The static homepage is at repository root (`index.html`, `styles.css`, `main.js`, `catalogue.js`). Use `sh scripts/build-pages.sh` to create the curated `dist/` output for Cloudflare Pages. Cloudflare account connection and first live `*.pages.dev` deployment are pending. Details: [Cloudflare Pages setup](docs/CLOUDFLARE_PAGES.md).

The approved logo and background are repository assets; illustrated Dave remains intentionally absent pending a separate design review.

## Current design and automation workstreams

- [DH-06: Giant Dave motion concept](docs/GIANT_DAVE_ANIMATION.md), with the [exact production layered rig blueprint](docs/GIANT_DAVE_LAYERED_RIG_SPEC.md) and [articulation-first decision](docs/DECISIONS/ADR-0010.md). The layered artwork and production animation still need to be made.
- [DH-07–DH-11: Living content and publishing system](docs/CONTENT_PIPELINE_DISCOVERY.md), designing canonical project pages and AI-assisted, human-approved development stories from deliberately nominated public-safe sources.

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

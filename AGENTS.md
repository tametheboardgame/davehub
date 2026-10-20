# Instructions for DaveHub development agents

Before editing, read `README.md`, `docs/ROADMAP.md`, `PROJECT_STATE.json` and the relevant concept/test documentation.

## Intent

Create an eccentric, explorable place for the things David has made. It is not a generic developer portfolio or sales site. Avoid template-like project grids, skill bars, client testimonials, CV funnels and pointless technical flourishes.

## Delivery process

1. Name the roadmap work package and scope before implementation.
2. Work in small, independently reviewable increments.
3. Keep DH-01A, DH-01B and DH-01C genuinely distinct until prototype comparison.
4. Use feature branches, test what was built, and seek review before merging.
5. Never claim a deployment succeeded or provide an invented test URL.
6. Update `docs/ROADMAP.md` and `PROJECT_STATE.json` for each completed work package; log important design/architecture decisions under `docs/DECISIONS/`.
7. Protect independent source projects: DaveHub must not absorb or alter them to generate showcase content.
8. Use British English for public copy.

## Public repository safeguards

This repository is PUBLIC. Never commit tokens, secrets, private source files, employer/railway technical details, customer information, personal data, or third-party artwork/music without permission. All external project integrations are read-only by default. All generated public-content updates are drafts pending deliberate human approval.

## Experience requirements

- Curious visitors should find something interactive immediately.
- Offer a quick index/search and direct deep links, even when the main interface is unusual.
- Mobile, keyboard access, reduced-motion alternatives, usable contrast and performance are required.
- No forced tutorials, mandatory cinematic intros or surprise autoplay sound.
- Use real interactive prototypes to choose the visual technology. Do not commit to 3D, a CMS or a database without evidence that it helps.

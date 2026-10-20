# DaveHub development setup

## Repository

- GitHub: https://github.com/tametheboardgame/davehub
- Visibility: **Public**, as selected when the remote repository was created
- Default branch: `main`
- State: planning foundation only; there is not yet a buildable website
- Production and preview deployments: not configured

Clone with:

`git clone https://github.com/tametheboardgame/davehub.git`

Read `README.md`, `AGENTS.md`, `docs/ROADMAP.md` and `PROJECT_STATE.json` before starting development.

## Workflow

1. Identify a work package, starting with DH-01A–C.
2. Create a descriptive feature branch.
3. Update the relevant concept/design documentation or prototype.
4. Verify behaviour against the prototype test plan.
5. Raise a PR for review, then merge after approval.
6. Update `docs/ROADMAP.md` and `PROJECT_STATE.json`.

## Deployment

No framework, hosting service, domain or GitHub Actions workflow has been committed to yet. Select the minimum tooling needed to produce working DH-02 concept prototypes. Do not invent preview URLs.

## Security and publication

This is a public repository. Use fixtures or approved public material for experiments; never store credentials or private material in Git. Public-facing content from other repositories needs deliberate approval. See `docs/PUBLICATION_POLICY.md`.

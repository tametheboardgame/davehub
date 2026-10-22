# DaveHub development setup

## Repository

- GitHub: https://github.com/tametheboardgame/davehub
- Visibility: **Public**, as selected when the remote repository was created
- Default branch: `main`
- State: DH-01A first-look static homepage implemented; not yet hosted
- Production and preview deployments: Cloudflare Pages integration pending

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

Cloudflare Pages selected for Git-based visual previews, with a lightweight static build. Cloudflare account authorisation and the first deployment remain pending. See [Cloudflare Pages setup](docs/CLOUDFLARE_PAGES.md).

- Build command: `sh scripts/build-pages.sh`
- Build output directory: `dist`
- Production branch: `main`
- Every feature branch or PR can be deployed as a separate Cloudflare preview after setup.
- The build only copies the homepage plus approved image assets. The site remains intentionally unindexed until public launch. Do not invent preview URLs.

## Security and publication

This is a public repository. Use fixtures or approved public material for experiments; never store credentials or private material in Git. Public-facing content from other repositories needs deliberate approval. See `docs/PUBLICATION_POLICY.md`.

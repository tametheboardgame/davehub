# DH-09D: staging branch cutover deployment activation

This is an intentional, non-skipped Cloudflare Pages deployment trigger for the existing `davehub` project after its production branch has been changed from `main` to `staging`.

## Deployment identity

- Expected Cloudflare Pages project: `davehub`
- Expected public hostname: `davehub.pages.dev`
- Expected production Git branch: `staging`
- Expected build environment variable: `DAVEHUB_DEPLOY_ROLE=staging`
- Expected topology phase: `staging_cutover`
- Expected deployment proof: `/deployment.json` with `environment=staging`, `branch=staging` and the exact commit SHA of this activation commit.

The existing GitHub default-branch automatic game updater remains paused until the deployment and both playable games have been remotely verified. Do not attach `davehub.co.uk` to this project.

This file changes no gameplay, catalogue entries, application data, browser saves, domain settings or build assets.

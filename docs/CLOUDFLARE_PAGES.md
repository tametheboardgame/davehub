# Cloudflare Pages: DaveHub visual preview

**Stage:** GitHub repo prepared; Cloudflare account connection and first live deployment require owner action.
**Scope:** Public prototype at a Cloudflare `*.pages.dev` hostname only. **Do not add `davehub.co.uk` or change DNS yet.**

## One-time setup in Cloudflare

1. Sign into [Cloudflare dashboard](https://dash.cloudflare.com/).
2. Open **Workers & Pages**, choose **Create application**, select **Pages**, then **Connect to Git / Import an existing Git repository**.
3. Link the GitHub account `tametheboardgame` when prompted; authorise the Cloudflare GitHub app for **Only select repositories**, choosing `tametheboardgame/davehub`.
4. Select the `davehub` repository and start setup.
5. Choose an available project name, e.g. `davehub-world` (the final hostname will be displayed by Cloudflare).
6. Configure **Production branch:** `main`.
7. Configure **Framework preset:** `None` / no framework.
8. Configure **Build command:** `sh scripts/build-pages.sh`.
9. Configure **Build output directory:** `dist`.
10. Leave **Root directory** at the repository root (blank or `/` depending on UI), and leave environment variables empty.
11. Save and deploy. Once the dashboard confirms a successful build, open its actual `https://<project-name>.pages.dev/` URL and check that both hero graphics load.

**Critical:** The `main` branch needs the first-look homepage before production is created. Do not point a Pages production deployment at planning-only `main`.

## Ongoing visual review workflow

- Push changes to `feature/*` branches and open a GitHub PR. Cloudflare can deploy them to branch/PR-specific preview URLs automatically.
- Review desktop and mobile previews before merging.
- Merge approved work to `main`. Cloudflare automatically updates the stable `*.pages.dev` homepage.
- The approved PNG background and logo's faithful SVG are checked into `assets/`. The build copies them to `dist/`; no external GitHub raw-image fetch or manually maintained ZIP is needed.
- The future illustrated Dave is a separate frontend layer and asset, not part of the locked background.

## Smoke tests on first deployment

- Browser network requests for `/assets/branding/davehub-logo-faithful.svg` and `/assets/homepage/floating-islands-background.png` succeed (HTTP 200).
- The Explore button opens the destination directory and each category can be selected.
- Four floating-island labels and Explore directory lead to their corresponding categories; there is **no bottom duplicated menu**.
- The dialog closes with Escape and on clicking close.
- No horizontal overflow on 390px and 375px mobile widths, and no important visual content is hidden at 1366×768.
- The separate static Giant Dave WebP exists at `/assets/characters/dave/dave-static-v1.webp` and neither blocks island hotspots nor overlaps the CTA unexpectedly.
- The Explore dialog reuses the background illustration and remains legible, focusable and scrollable on mobile.
- The response header `X-Robots-Tag: noindex, nofollow` is present until deliberate public launch.
- `/docs/ROADMAP.md`, `/PROJECT_STATE.json` and unapproved concept assets are **not** included in the deployment.

## Troubleshooting

- Blank/404 site: check that the Pages output directory is exactly `dist` and the build command completed.
- Missing images: check both network paths listed above and `scripts/build-pages.sh` output.
- Repo unavailable in Cloudflare: update the Cloudflare GitHub app's repository access to include `tametheboardgame/davehub`.
- New changes not appearing: check Cloudflare deployment status and confirm a push occurred on the expected branch.

## Security and publication notes

The GitHub repository remains public, but the Pages build deliberately excludes documentation and unrelated concept assets. The preview is publicly reachable to anyone with the URL; the noindex header discourages search indexing but does **not** provide access control. No secrets, internal company data or unpublished external project material belong in the site.

Cloudflare Pages Git integration automatically deploys production and preview branches. Exact UI labels may vary by account. References:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/

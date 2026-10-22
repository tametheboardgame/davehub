# DH-01A — Homepage first-look interactive prototype

**Status:** First-look source approved for hosted visual review. The Cloudflare Pages build is prepared; first deploy requires Cloudflare account connection.

## What has been built
- Static HTML/CSS/JavaScript homepage using the approved unchanged background and faithful logo assets already committed to the repository.
- Four illustrated-world navigation hotspots: Projects, Writing, Games and Experiments.
- Golden Explore DaveHub button with a working accessible destination directory.
- Four translucent bottom navigation tiles and category detail panels.
- Direct URL fragments (`#projects`, `#writing`, `#games`, `#experiments`, `#explore`) for prototype deep links.
- Mobile responsive layout, hover/focus effects and reduced-motion support.
- Reserved independent `#dave-stage` for the future illustrated character.

## Explicitly not in this build
- The giant illustrated Dave host and his arrival/movement, to be planned with the owner after this visual test.
- Individual public project pages, publication of other repositories, live project data, games or working category portals.
- The alternative retro/boring HTML page, deferred from this first visual review. Bottom tiles currently provide direct menu navigation. Do not infer retro mode is permanently cancelled.
- Production hosting or DNS. The primary domain is not yet pointed anywhere.

## Tech and visual boundaries
- No framework, bundler, external script, tracker or database.
- Uses local pre-approved `assets/homepage/floating-islands-background.png` and `assets/branding/davehub-logo-faithful.svg`.
- SVG UI icons are inline paths. The approved background and logo SVGs are raster-embedded wrappers; this build uses the background PNG for page rendering.
- Accessible native `<dialog>` panels, ordinary semantic anchors, visible keyboard focus, Escape handling, focus restoration, deep-link fragments.
- No real project links are fabricated. All destinations show clearly marked temporary holding content.

## Manual review
1. Open `index.html` from a local static server (e.g. `python -m http.server 8000` in the repository folder).
2. Review the approved background and logo at laptop, wide desktop and mobile sizes.
3. Select each floating hotspot and its matching bottom tile; confirm both reach the same destination.
4. Select Explore DaveHub, choose a category, return to world directory, then close.
5. Test Escape, Tab and visible keyboard focus.
6. Test `#games` and other direct fragments, narrow mobile widths, reduced motion and non-clipped interactions.

The first round of isolated browser interaction tests passed at 1440×900, 1366×768, 390×844 and 375×667. The browser test environment could not load repository image assets, so visual judgement of the composed artwork requires a network-enabled browser. To publish the curated site see [Cloudflare Pages instructions](CLOUDFLARE_PAGES.md).

## Next design conversation
Decide how illustrated Dave arrives, moves and sits over the existing world, then refine foreground/brand positioning and responsive crop with the real foreground asset. Do not bake Dave into the background.

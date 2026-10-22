# DH-06B prototype source

This experiment is under visual review, not deployed to Cloudflare. Its original interactive package (HTML and 5 WebP sprites) and six-second MP4 were generated as downloadable artefacts in the DaveHub ChatGPT conversation on 22 October 2026.

**Assets:** The source approved four-pose image and transparent state sprites have NOT been committed, because the connected GitHub action does not accept local binary file uploads. Do not attempt to render missing asset paths on the production homepage.

The working local package contains:
- `index.html` with interactive controls and pose state logic
- `assets/dave-pose-{1..4}.webp` (transparent RGBA; approx. 40–51 KB each)
- `assets/dave-blink.webp` (blink-only alpha overlay; ~3 KB)
- `source/approved-four-pose-study.png` (unaltered original generated PNG)
- `README.txt` with run instructions

Use the current conversation's ZIP for visual review. Before implementation, bring approved art in with a verified binary pathway, and consider proper Rive/mesh deformation if the crossfades are not sufficiently natural.

See [motion test and measured limitations](../../docs/GIANT_DAVE_MOTION_TEST.md).

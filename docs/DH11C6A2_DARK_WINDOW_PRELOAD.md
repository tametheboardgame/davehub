# DH-11C.6A.2 — Dark window preload (no legacy island flash)

**Status:** staging-only visual refinement, pending CI, Cloudflare and owner review.

## Owner requirement (7 November 2026)

The Writing room is otherwise working correctly, but while the scenic homepage-island image downloads, the old low-poly islands briefly appear through the window. Replace that loading state with an unlit, near-black window. When the artwork is completely ready, reveal the existing four-pane scene. Do not allow the old islands to reappear, including if the image fails to download.

## Implementation

- Canonical Writing room `/worlds/writing/` opts in through `data-dark-window-preload="true"` alongside the existing `data-minimal-ui="true"`. Every earlier preview without that flag preserves its original reference/fallback comparison.
- During initial procedural furniture creation, the window opening gets a dedicated dark, unlit `MeshBasicMaterial` (`#111827`); the procedural low-poly islands are not created on this canonical route. The wooden frame and click targets remain.
- The actual furniture GLB is not added to the scene until the script has recoloured its existing sky mesh to the same unlit dark and hidden all three named original island groups. No camera/geometry changes or independent 2D state frames.
- The image-layer artist's `mount` supports the opt-in `hideLegacyWhileLoading` flag, default `false`. For the canonical Writing route its state machine keeps the dark sky visible and legacy islands hidden until texture load succeeds. On complete image load it reveals the existing illustrated four-pane geometry and hides the dark sky in a single update. If loading fails it leaves the dark sky visible and never restores the obsolete island geometry. Changing back to reference mode likewise uses the dark sky, not the old islands.
- Older art comparisons omit the option and continue their previous reversible original-material behaviour. All drawers, paper, books, cabinet, lamp, bin, two-click door, outside-click return and keyboard controls remain unchanged.
- Versioned `room.js` and `window-illustration-v2.js` references on the canonical route ensure browsers do not reuse cached scripts from the previous iteration.

## Verification gate

Regression tests exercise *pending, success, failure and reference mode* in the real artwork module, the default preview behaviour, the procedural fallback contract and GLB pre-scene concealment. The hosted staging smoke checks the new route marker and script URLs. Owner should refresh the Writing room on a cold/slow connection and confirm a dark window precedes the image without flashes. Production `main` and `davehub.co.uk` remain untouched.

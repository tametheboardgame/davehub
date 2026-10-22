# DH-06C1a/b — Articulated Canvas Motion Test v3

**Date:** 22 October 2026  
**Status:** Working local interactive test and video; **not a production-ready rig**. Source image binaries remain in downloadable conversation files, **not GitHub**.

## Objective

Assess whether the recently generated transparent illustrated Dave arm/hand/body sheets can produce genuinely articulated movement without optical-flow morphing the whole character. Specifically, solve the joint mismatch in the original two-arm asset experiment and check if a stable torso plus hierarchical shoulder/elbow/wrist can create an understandable welcome movement.

## Source and method

- Built from the **approved-looking** illustrated sheet artwork generated on 22 October 2026: navy hoodie, bald ginger-bearded Dave, olive shirt, blue jeans. Unrelated off-model character assets were rejected.
- Source components are extracted as real RGBA transparent PNGs. Main connected artwork is separated from extraneous neighbours on the generated sheets.
- Crucially, the near **upper sleeve and forearm use different alpha regions of the SAME continuous painted arm source**, with a narrow feathered hand-off over an existing fold instead of joining two independently drawn sleeves.
- A hierarchical Canvas transform sets a named shoulder origin; elbow rotates relative to the shoulder; wrist rotates relative to elbow. No whole-character warping or optical-flow frame stack.
- The hand switches between separately illustrated neutral, half-open and open-palm variants. Those changes are still abrupt and need controlled artwork/masking.
- HTML includes timed welcome → hold → return, idle breathing, 3 joint sliders, checkerboard and joint-marker inspection, pause, reset, reduced-motion static check.
- Current animation targets in this test: shoulder +33°, elbow +30°, wrist −12°, with a ~2.65-second loop.

## Local deliverables (conversation, NOT repository)

- `Giant-Dave-Articulated-Motion-Test-v3.html`: self-contained single-file interactive browser preview, including all required art as embedded PNG data.
- `Giant-Dave-Articulated-Welcome-v3.mp4`: 3.46-second visual preview rendered from the actual Canvas hierarchy in Chromium.
- `Giant-Dave-Articulated-Rig-Test-v3.zip`: original HTML, cropped component PNG assets, extraction/build scripts, screenshots, local tests and MP4.

Do not refer to those as GitHub-deployed files. There is no Cloudflare preview for this rig yet.

## Verified browser checks

| Viewport | Joint hold / sliders | Play and pause | Checker | JS exceptions | Horizontal overflow |
|---|---|---|---|---|---|
| 1440×900 | Pass | Pass | Pass | 0 | No |
| 1366×768 | Pass | Pass | Pass | 0 | No |
| 390×844 | Pass | Pass | Pass | 0 | No |
| 375×667 | Pass | Pass | Pass | 0 | No |

The test uses Chromium's available executable and loads a self-contained HTML document directly into the test page. No external network or deployed Cloudflare URL was used.

## Visual review

**Improved:** the original elbow seam and mismatched sleeve textures are substantially reduced at neutral position by splitting a continuous painted sleeve. Face and torso pixels stay stable while upper/forearm/wrist parts move on real pivots.

**Still not acceptable as production artwork:**
1. A visible hollow black wrist/skin opening remains in the articulated full reach, requiring actual painted underlay and a proper anatomical wrist joint.
2. Hand artwork switches instantly between neutral/partly open/open instead of a connected finger/hand animation; a hand rig or explicitly drawn overlap is still needed.
3. The forearm pieces come from one flattened illustration and are feathered at the elbow. They are useful feasibility components, **not separately authored, complete underpainted geometry** for wide unrestricted angles.
4. The neck and some jacket joins remain provisional and the head is not yet independently rigged for blinking or facial movement.
5. The jeans/legs are cropped from a concept component, not the final full-height Giant Dave.
6. This is Canvas prototype art, not an exported Rive file or selected runtime.

## Next implementation gate

1. Produce full elbow and wrist hidden paint and anatomically correct neutral/mid/open hand attachment with appropriate overlap. Do not generate dozens of optical-flow tweens.
2. Re-run shoulder/elbow/wrist joint extremes and inspect without the dark wrist aperture or paper-puppet edges.
3. Add independently matched eyelids and a restrained head pivot, then test idle breathing, blink and full welcome.
4. Compare Rive mesh/bone authoring to this direct Canvas prototype with the exact same corrected illustrations.
5. Choose a binary-safe source-control hand-off before adding the final rig to a Cloudflare PR preview. Owner review required for production artwork and animation.

This experiment extends [C1 Workbench QA](GIANT_DAVE_C1_ART_WORKBENCH.md), follows [DH-06C1 rig specification](GIANT_DAVE_LAYERED_RIG_SPEC.md) and [ADR-0010](DECISIONS/ADR-0010.md), and keeps Cloudflare production untouched.

# DH-06B Motion Study 02: seven transparent key poses

**22 October 2026 — assembled, locally browser-tested, awaiting owner review. Not merged into `main` or deployed to Cloudflare.**

## Inputs and provenance

Seven newly generated **transparent RGBA** illustrated Dave poses were accepted for use as a working sequence, rather than extracting silhouettes from an opaque four-panel artwork. They cover idle, blink/idle variation, early reach, medium reach and near-final/final reach. The original character design remains the approved four-pose visual baseline.

The exact original source PNGs are retained in this conversation. The current GitHub connector accepts text but cannot upload arbitrary local binary images, so **the full production asset set is not committed**. The local source bundle is the download `Giant-Dave-Welcome-Study-v2.zip`, with one-click standalone `Giant-Dave-Interactive-Welcome-v2.html` and video `Giant-Dave-Welcome-Motion-v2.mp4`. These are generated conversation artefacts, not published URLs.

## Prototype method

1. Facial landmark regions detected and character illustrations scaled/translated into a shared pose coordinate frame, avoiding distracting head-size and position jumps.
2. Render seven aligned portrait WebPs and one independent eye-only blink overlay from their genuine alpha-channel source images.
3. Use DIS optical flow to create **36 incremental WebP tween frames** covering early-reach → medium-reach → further-reach → final-reach. This tests image-interpolation quality, not actual bone movement.
4. The resting pose to the first early-reach pose is **still missing a believable elbow/shoulder bridge**. Shorten that transition to about 95 ms to minimise visible double-arm ghosting. Do not pretend this solves the anatomy.
5. Timed forward motion ≈1.4 seconds, brief welcome hold, then reversed motion and return to idle.
6. Add independent quiet idle breathing and blinking; native Play, Pause/Resume, Reset, timeline slider and transparency checker; respect reduced-motion by disabling ambient movement.

## Local validation

- `motion.js` JavaScript syntax check passed.
- 36 generated tween images and all referenced local image files exist.
- Single-file self-contained browser version (embedded WebPs) successfully loaded and ran under Chromium at **1440×900, 1366×768, 390×844 and 375×667**.
- At each size, Play, Pause, scrub to Return, Reset and transparency toggle passed; no JavaScript exceptions or horizontal overflow.
- Exported a short visual MP4 for motion review.
- Video and screenshots show the major reach motion is visibly smoother after alignment but the first arm lift is **not anatomically continuous**.

## Review gate / next step

Have the owner watch the MP4 and try the interactive HTML. The expected next refinement is **one genuine earlier arm-lift bridging pose** (elbow leaving resting position but the hand not yet thrust towards the camera) OR a separately painted shoulder/elbow/forearm rig. Subsequent reach interpolation can remain if approved. Do not generate dozens of random extra frames, merge to `main`, or integrate into Cloudflare until the first-lift issue is resolved and all art has been committed in a verified binary-safe way.

See [first movement study](GIANT_DAVE_MOTION_TEST.md) and [animation design spec](GIANT_DAVE_ANIMATION.md).

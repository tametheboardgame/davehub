# DH-06C2B — Fixed-proportion articulated rig test

**Date:** 22 October 2026  
**Status:** Interactive feasibility test locally built and Chromium-verified. **Not production-ready or Cloudflare-deployed.**

## Why this test replaces the mixed-parts approach

The earlier C1 tests connected separately generated head, torso, upper arm and hand art, producing a disconnected neck, oversized arm and undersized hand. The approved **single standalone neutral Dave** is now the only source of moving anatomy. The later character rig sheet is a *visual reference only*, not a grab bag of separately scaled body parts.

Source: `confident_ginger_bearded_hoodie_character.png`, 1086 × 1448 RGBA. All rest and moving layers are pixel partitions of this same complete drawing, created at **native source dimensions** with no per-part scale operation.

## What has been built

- Alpha-separated `body.png`, `upper.png`, `forearm.png`, `hand.png`, all sharing 1086 × 1448 source coordinates.
- Fixed joint pivots (source pixels): shoulder `(355,331)`, elbow `(350,515)`, wrist `(359,669)`. These are *illustration-based prototype anchors*, subject to production-art review.
- Browser Canvas parent-child transforms: shoulder → elbow → wrist. The joint angles actually rotate the body parts; no frame interpolation or whole-body morph and **no runtime scale transforms**.
- Rest pose check: assembled original RGBA and source match on **every visible pixel**. PNG optimisation changes RGB values for 798 fully transparent pixels at alpha 0, which is visually irrelevant; alpha agrees exactly.
- Manual shoulder (±12°), elbow (±19°), wrist (±13°) controls, natural easing loop, reset, neutral hold, unmodified-original toggle, joint markers and checkerboard inspector.
- Reduced-motion avoids automatic playback, but permits deliberate manual inspection.
- Portable review deliverables in the current ChatGPT conversation: `Giant-Dave-Fixed-Proportions-Interactive.html`, `Giant-Dave-Fixed-Proportions-Rig.zip`, `Giant-Dave-Fixed-Proportions-Motion-Preview.mp4`.

## Browser tests

Chromium checked at 1440×900, 1366×768, 390×844 and 375×667. Source images loaded from self-contained embedded art; shoulder/elbow/wrist sliders, playback, neutral/reset, checkerboard and original toggle passed. No uncaught JavaScript errors and no horizontal overflow. An approximately 3.5-second video was recorded from actual browser-rendered frames.

## Visual acceptance and limitations

**Pass:** At rest the character looks precisely like the approved canonical figure and head/torso/arm/hand are at one consistent scale. An arm moves via real hierarchical rotation.

**Not yet pass:** Arm separation lines are visible around the elbow and wrist during rotation; there is insufficient concealed torso, shoulder, cuff, elbow and wrist paint for a large forward reach. The current modest motion is a feasibility demonstration, **not a genuine full welcome/reach**. Reusing a whole-pose morph or separately generated hand would defeat the scale contract.

## Next steps

1. Owner reviews the *actual* HTML and short video, specifically anatomical joins under movement.
2. Paint continuous concealed shoulder, elbow sleeve folds, wrist and skin *against this exact approved canonical scale*, not independently generated illustrations.
3. Re-run the visible-pixel zero-degree reconstruction test and isolated joint-angle extremes.
4. Only then add a meaningful forward reach, blinking, head motion and Rive-versus-Canvas runtime comparison.
5. Obtain verified binary-safe artwork upload before integrating any character on a Cloudflare feature preview; the GitHub connector writes text but does **not** upload the PNGs. This documentation-only branch must not be merged as a live character integration.

The website remains unchanged and the earlier draft experiment PRs remain reference-only.

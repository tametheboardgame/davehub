# DH-06B — Motion Study 03: articulated movement versus intentional magic

**Date:** 22 October 2026  
**Status:** Working side-by-side interactive prototype, **owner review pending**. Not merged or deployed to Cloudflare.

## Question being tested

Does Dave read better as a **living illustrated character**, with anatomical movement driven by real joint transforms, or as an explicitly **magical changing illustration**? Study 02's smooth optical flow still made his body morph unnaturally; the owner and assistant agreed to compare real articulation versus a stylised transformation, not generate further brute-force tween frames.

## Working A/B comparison built

### A. Articulated motion

- Uses the existing approved transparent illustrated character and creates separately composited **torso, upper-sleeve and forearm/hand painted layers**.
- A real JavaScript Canvas joint hierarchy independently rotates the upper arm about the **shoulder** and forearm/hand about the **elbow**.
- The face and central torso pixels remain fixed. There are **no whole-image morph frames** in Version A.
- Motion returns smoothly and can be paused, reset, looped or scrubbed through.
- Importantly, the movement range is deliberately limited to an **already partially extended arm**. The approved source illustrations are not a fully paint-layered rig; there are missing underarm and shoulder details. A fully anatomical hands-in-pockets-to-full-reach gesture is **not yet possible without new underlying painted layers**.
- Visible artefacts remain around the sleeve join and replacement torso patch. These require re-painting, not ever more intermediate generations.

### B. Intentional magical morphing

- Uses existing generated transparent whole-body poses and a sparse sample of optical-flow interpolation frames from Study 02.
- Adds glowing/particle overlays during transitions so changes in geometry read as a deliberate creative effect.
- Unlike A, **Version B is not natural body articulation**, and must not replace Dave's everyday idle/attention interactions by default.

## Local evidence and packaging

Current conversation outputs (not GitHub-hosted, and **not repository binaries**):

- `Giant-Dave-Rig-vs-Magic-Interactive.html` — fully self-contained portable HTML with embedded approved image assets; browser runnable without a build tool.
- `Giant-Dave-Rig-vs-Magic-Comparison.mp4` — side-by-side capture for visual review.
- `Giant-Dave-Rig-vs-Magic-Source.zip` — HTML, JavaScript data assets, separated WebP rig images and notes.

The new painted rig layers are derived from approved source imagery, not fresh author-approved production drawings. Their current quality and motion still require approval.

## Tests

- Chromium/Playwright tested at **1440×900**, **1366×768**, **390×844** and **375×667** (early and final prototype iterations).
- Play, Pause, Reset, timeline scrubbing and static reduced-motion override tested; **no uncaught browser JavaScript errors or horizontal overflow** in final regression passes.
- Single-file mode built and verified. The side-by-side capture was generated through the actual browser canvas over a 65-frame timeline.

## Recommendation / next design gate

1. Have owner review **natural versus magical**, and decide whether B is reserved for special scene transitions.
2. Continue Version A as the everyday character system, but commission/paint clean hidden shoulder/upper-arm/forearm/jacket layers before trying a larger gesture.
3. Prototype true deformable layers in a selected rigging environment (Rive is still only a candidate; small Canvas proof is not a Rive rig).
4. Preserve a static approved fallback and ensure homepage destinations do not get obscured.
5. Only after owner approval and a verified **binary-safe** asset hand-off should we add animated artwork to the production Cloudflare Pages route.

**Repository limitations:** The active GitHub connector can write UTF-8 text, not arbitrary local WebP/PNG/MP4 bytes. Hence the art/video files are available only as conversation artefacts. This draft PR records the approach and results without referencing nonexistent hosted files. **Do not merge a broken character integration into `main`.**

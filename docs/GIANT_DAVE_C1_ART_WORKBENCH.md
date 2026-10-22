# DH-06C1a/b — First layered artwork workbench and joint QA

**Started:** 22 October 2026  
**Status:** Source-separated transparent artwork and editable workbench **assembled, tested locally, not production-approved**. No live site changes or binary source files committed.

## What was produced

A local downloadable source pack named `Giant-Dave-C1-Layer-Workbench.zip` contains:

- 13 separate **1536×2048 RGBA PNG** artwork/reference layers from the accepted bald, bearded, navy-hoodie Dave generations. These preserve the correct character, unlike one rejected unrelated image-generation output that showed a grey-haired teal-hoodie person.
- An **OpenRaster `.ora` editable layered source**, `dave-c1-workbench-v001.ora`.
- `rig-manifest.workbench.json` with provisional shoulder, elbow, wrist, head, torso and root anchors. These are **working guesses**, requiring manual adjustment on approved painted layers.
- `demo/index.html` and three transparent WebP components demonstrating **actual hierarchical shoulder/elbow rotations** with interactive joint sliders and transparency checker.
- Checkerboard stress-test comparison across shoulder angles -14°, -7°, 0°, +8°, +16° and corresponding elbow bends on light/dark backgrounds.
- Layer inspection sheet and source README.

The workbench is supplied in the corresponding ChatGPT conversation as a downloadable ZIP. It is **not** stored in this public repository, because the connected GitHub write action is limited to UTF-8 text. Downloadable files are ephemeral; use a verified binary-safe upload path before treating the package as source controlled.

## Verified checks

- 13 PNG layers are exactly 1536×2048, contain genuine straight RGBA transparency and are not flattened with a dark backdrop.
- `.ora` ZIP container includes proper OpenRaster mimetype, `stack.xml`, merged image and artwork layers; archive integrity passes.
- Workbench ZIP passed archive integrity check and contains the interactive test.
- The JavaScript passes syntax validation.
- Chromium headless tests using embedded assets passed at **1440×900**, **1366×768**, **390×844**, **375×667**: shoulder and elbow sliders updated, checker toggled, no JavaScript exceptions or horizontal overflow. Direct local file navigation is sandbox-blocked, so images were embedded into the browser test; this does not assert external hosting.
- Art was examined on both light/dark checkerboard. The independent pivot transformation can be demonstrated, but **seamless anatomy is NOT achieved**.

## Exact outstanding artwork defects (P0 blockers)

1. **Underpaint / ghost arm:** Blending approved idle and reaching images to repair the hidden chest/shoulder still leaves an old resting forearm visible under the newly raised arm. There is no photograph or generation of the real underlying hoodie/torso in the source images. **New clean painting required; cannot fix with another optical-flow tween or a CSS easing curve.**
2. **Sleeve joint edges:** The extracted upper sleeve, elbow bridge and forearm carry outlines/shading intended for a single flat pose; extreme rotations reveal joins and dark fragments.
3. **Wrist articulation:** The source reach forearm/hand remains partially consolidated. The separate reaching palm is a candidate mask, not a fully drawn wrist-connected hand variant.
4. **Neutral-to-reach geometry:** We have not yet drawn an anatomically coherent elbow/hand path from pocket-rest to near-camera extension.
5. **Master rig quality:** The OpenRaster file is a workbench with extracted layers. It is not the finished 29-layer PSD/ORA master, an approved production Rive rig or a chosen runtime.

## Next required artwork, ordered

1. **C1a paint gate:** Start from the approved *transparent* Dave, redraw an uninterrupted navy-hoodie near-shoulder/chest surface underneath the raised arm, with no resting forearm/hand in the base, and extend the neck and front jacket under any moving pieces. Preserve warm/cool light, shoulder shape and garment detail. Export at the canonical 1536×2048 artboard.
2. **C1b paint gate:** Independently author near upper sleeve, fabric-filled elbow bridge, forearm sleeve, wrist, resting hand, mid-reach hand and open reaching palm. Paint intentional underlaps/overlaps. No disconnected paper-puppet joints.
3. Run joint stress-test **-20° to +20° shoulder and -30° to +30° elbow**, plus wrist variation; inspect 100%/200% pixel views and both light/dark backgrounds. Limit motion beyond angles proven visually safe.
4. When shoulder/elbow gap tests pass, proceed to **C1c** head/eyes/lids and **C1d** natural idle/welcome rig. Rive remains a candidate, compare it against a simple Canvas rig.
5. Source-control approved binaries using a verified binary-safe route, then obtain owner approval on a real Cloudflare PR preview before `main`.

## Decision and safety

This work follows [the production layer spec](GIANT_DAVE_LAYERED_RIG_SPEC.md) and [ADR-0010](DECISIONS/ADR-0010.md): **articulation for normal acting; magical morphs only for exceptional intentional scene changes**. The earlier morph/rig A/B draft PR #9 remains a separate experiment. The approved homepage and Cloudflare build were not modified by this workbench.

**Do not mark C1a/b complete** until genuinely painted hidden-body art removes the duplicate/resting arm and stress-test joints look anatomically correct.

# DH-06C2A — Visible-hand single-figure candidate v002

**Date:** 22 October 2026  
**Status:** Static proportion test **assembled and browser-tested**, **not approved** as the production art master or source rig.

## Objective

After the disproportionate independently generated head/arm/torso experiment, establish one *intact, self-consistent* standing Dave with the near arm resting naturally at his side and the hand visible. **Do not animate or separate limbs until the neutral figure is approved at suitable original resolution and the alpha/artwork is clean.**

## What is available now

Candidate v001 was one original complete RGBA source figure with good internal proportions, but both hands inside his jeans pockets. Candidate v002 uses an **entire single neutral human illustration** extracted from a larger newly generated character-sheet image, with the nearer arm hanging beside his body and the far hand in his pocket.

All body segments are part of **the same underlying drawing**. No separately generated head, toddler-sized hand, torso or legs were spliced together. The candidate is scaled *uniformly* from its 286×523 source crop to the provisional 1536×2048 common artboard. This does **not** restore missing source detail.

Conversation deliverables:
- `Giant-Dave-DH-06C2A-Neutral-Candidate-v002.zip` containing source-provenance details, the candidate PNG, artboard PNG, independent transparent joint overlay, joint manifest, comparison JPEG and one-file browser review.
- `DaveHub-DH-06C2A-neutral-v2/canonical-pose-comparison-v002.jpg` comparing v001 to v002.
- `DaveHub-DH-06C2A-neutral-v2/static-neutral-review-v002.html` with toggleable joints and background checks.

The current GitHub connector **cannot upload image binaries**. This PR documents the candidate but does not contain the actual PNG or HTML binary review images.

## Honest art QA

**Pass, as a proportion/layout concept:**
- One figure supplies all body parts; full head-to-shoes silhouette, near hand visible, realistic elbow/wrist/neck/body proportions.
- Canonical authoring canvas and estimated joint map have matching coordinates from the **same source**.
- Single-page offline HTML loaded in Chromium using a self-contained in-memory browser document at 1440×900 and 390×844; PNGs loaded, joint overlay toggled and background checker toggled; no horizontal overflow.

**Fails production-master requirements:**
- The source illustration is only **286×523 pixels** inside a bigger sheet, materially below the required production detail for Giant Dave.
- The original composite sheet has a navy background. Extracted alpha is **computer-vision-derived**, not generated as a truly transparent standalone original.
- The extracted matte retains dark blue contamination around feet, legs and the gap between thighs; it requires a clean original or significant repaint.
- Existing joints in `joint-map-visible-hand-candidate.json` are approximate visual markers; they are **not** rig-certified or locked.
- No hidden shoulder/neck/elbow paint, consistent production layer authoring master or rest-pose reassembly exists.
- Subsequent image-generation calls in this iteration again yielded **multi-panel rig sheets rather than the requested single transparent figure**; those sheets must not be used as interchangeable layers.

## Next objective (DH-06C2A remains open)

Obtain/draw **one full-resolution, single-person, genuinely transparent source illustration**, aligned to this agreed visible-hand neutral pose, preserving original approved bald/red-bearded face, navy hoodie, olive shirt, jeans and trainers. Critically, the character must be one continuous picture at production scale, not a collage or grid. Approve that actual image first, then remeasure the skeleton against its own pixels. Only then do DH-06C2B independently editable anatomical layers and exact static reassembly.

This document **does not claim** the final master, animated rig, or Cloudflare deployment is finished. Draft PR #12 is still a visual-review work item.

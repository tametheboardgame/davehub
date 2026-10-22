# DH-06C2A — Canonical Dave and single-skeleton baseline

**Date:** 22 October 2026  
**Status:** Baseline candidate assembled and visually inspected. **DO NOT MARK THIS PACKAGE COMPLETE:** the final canonical pose, compatible independent paint layers and final joint measurements remain pending owner/art approval.

## Why DH-06C2 supersedes the previous cut-up rig approach

DH-06C1 verified that Canvas can rotate shoulder, elbow and wrist pivots. A browser screenshot exposed severe character sizing errors: separate generated head, neck, sleeve, torso and child-sized wrist pieces did not share an anatomical scale. The owner approved restarting the production character from **one intact full-body drawing and one consistent skeleton**, rather than repairing the incompatible mixed drawings.

Design rule: **if the assembled static character does not look right, animation does not begin**. Keep old DH-06B / C1 experiments for technique evidence only, never as production part references.

## Produced in this turn

A downloadable package `Giant-Dave-DH-06C2A-Canonical-Baseline.zip` has:
- `01-canonical-dave-candidate.png`: one *unaltered-as-anatomy* complete transparent original illustration, uniformly scaled onto the proposed `1536 × 2048` authoring canvas, **not separated or composited from other figures**.
- `02-joint-map-candidate.json`: anatomical landmarks in source, authoring pixels and normalised coordinates. Pivots are **visually estimated and need artist validation**, not automatically verified exact landmarks.
- `03-joint-overlay.png`: the identical original intact body with labelled/coloured skeletal anchors.
- `04-review-sheet.jpg`: side-by-side static canonical / skeleton proportions inspection.
- `05-static-skeleton-review.html`: offline interactive static comparison with joint overlay toggle and checkerboard/dark/light backgrounds; intentionally **no limb animation**.
- `README.md`: explicit limitations and the revised quality gate.

**Chosen intact candidate:** the original generated `confident_bald_man_in_hoodie.png` (1024×1536 RGBA, source SHA-256 `877a337c33e24e117a4b8ed3c5cc55ff9aa2c3e1f1da44a21c09d3f6694a6523`). On the canonical authoring canvas the original is scaled uniformly by 1.255208333 and offset (+125,+60) pixels. The character silhouette, facial features, garment and shoes are all from **the same original generation**.

**Known gap:** Both hands are inside jeans pockets in this candidate. The planned neutral rig needs the near/welcoming hand relaxed **and visible beside the body**, so this candidate validates anatomical proportions and drawing style only. It **is not the final canonical pose**. Do not assemble an arm from a different independently drawn sheet. The next art output must be **one coherent re-authored complete full-body neutral** derived from the same character identity, with one relaxed hand visible. Measure final pivots only on the approved definitive pose.

**Image generation QA:** Three attempts in this increment returned multi-panel rig/infographic sheets rather than one independent transparent full-body neutral figure. These were rejected as canonical masters. The old single-body transparent candidate was used for a credible static baseline instead of pretending the generated panel parts were rig-compatible.

## Fixed proportional coordinate contract

- Shared authoring frame: `1536 × 2048` RGBA, transparent sRGB.
- Uniform scaling only; no head/arm/torso independent resizes after canonical pose is locked.
- One named root, anatomical head/neck, bilateral shoulder/elbow/wrist, hip, knee and ankle points.
- Coordinate units: pixels from top-left, plus normalised fractions; actual values stored in a manifest version tied to the specific source SHA.
- No mesh/joint deformation until the undivided canonical image is approved.
- The skeleton overlay is a **calibration guide**, not evidence that painted arm pieces reassemble correctly.

## Mandatory gates before moving to rigging

1. **Canonical neutral approval:** one continuous full-body transparent illustration with correctly sized head, both shoulders, elbows, wrists, hips and feet; near hand naturally relaxed **outside its pocket**. Correct colours, facial identity, style and perspective. Approve the full-body reference.
2. **Joint certification:** overlay skeleton points on that exact approved pose and manually validate shoulder, elbow, wrist, head/neck/hip. Give the manifest a real source hash and exact pivots. No placing source-independent parts by eyesight.
3. **Layer source production:** create editable layers **from that exact canonical master**, deliberately repainting hidden torso/underarm/neck and elbow/wrist overlap. Do not use a separate image-generation sheet as interchangeable body parts.
4. **Static reassembly QA:** with rig at all 0°/rest positions, reassembled layers must be visually indistinguishable from approved canonical, checked against transparent/light/dark backgrounds. **Stop here if seams or mismatched sizes remain.**
5. **Joint extremes:** only after 0° pass, rotate one joint at a time within approved realistic limits. Verify no hollow elbow, toddler hand, detached neck, exposed old arm or change of style.
6. **Real natural animation:** idle/eyelids/welcome/return only after every static/motion-gate test passes. Magical transitions remain independent later.

## Update: one-figure visible-hand candidate v002

A neutral near-hand-visible **single complete figure** was isolated from one new generated sheet, without Frankenstein compositing. The resulting source crop has an effective resolution of only **286×523 pixels**, and its extracted transparency still carries navy background remnants. A matched provisional skeleton overlay and browser checker test are complete, but the image **fails the clean original/high-resolution production gate**. See [DH-06C2A visible-hand review](GIANT_DAVE_NEUTRAL_CANDIDATE_V2.md). Do not assume it supersedes the approved original or promote it to production.

## Owner review and repository boundaries

- Prototype assets are available as a ChatGPT conversation ZIP / offline HTML. The current GitHub action can write text but **cannot import arbitrary local PNG files**. Therefore this branch commits only the specification, source provenance and candidate joint coordinate JSON. **It does not pretend to contain the art binaries.**
- `main` and the live Cloudflare Pages site remain unchanged by DH-06C2A.
- Keep this PR in draft until the neutral visible-hand source and static layer reassembly meet approval.
- DH-07 content architecture remains an independent parallel workstream.

## Immediate next art brief: single neutral figure, not a sheet

An original non-photographic illustrated bald blue-eyed Dave with a short ginger-brown beard, navy zip hoodie/white drawstrings, olive T-shirt, blue jeans and consistent trainers. Warm amber rim light and cool blue shadows match the locked DaveHub art. Full body head-to-shoes with healthy anatomical scale, 3/4 view towards visitor, near arm relaxed alongside hip with complete visible forearm and hand, far hand may remain in pocket. Genuine transparent background, one person, no text, panels, guides, spare pieces or decorative setting. The entire upper arm, forearm, hand, neck and torso belong to **one continuous drawing**. Once this is generated and approved, it replaces the pocket-hands baseline candidate and becomes the true source for layer drawing.

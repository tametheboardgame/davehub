# DH-06B — Giant Dave moving character: first browser motion study

**Date:** 22 October 2026  
**Status:** Local interactive proof of concept produced; owner review pending; **not deployed or merged**.

## What's demonstrably working locally

An interactive HTML/CSS/JavaScript prototype has been packaged with:

- Four individually transparent character sprites derived from the exact approved four-pose concept sheet (idle, welcome/reach, point/attention, open-armed presentation).
- Subtle continuous idle breathing via CSS keyframes.
- A separately composited idle blinking-eyelid overlay at irregular intervals.
- Four explicit state controls for user-triggered gestures, plus a gesture-cycling switch and a static-motion switch.
- Motion easing and short crossfades between the *approved whole-body key poses*.
- Mobile/desktop responsive composition, keyboard buttons, and `prefers-reduced-motion` support.
- Source image preserved unchanged inside the local ZIP for provenance.
- Optional reference background loaded from the public DaveHub repository and a navy fallback when offline.

**Important distinction:** This is moving, but it is **not yet a skeletal/mesh rig**. In particular, the arm movement between different illustrated poses is a crossfade with eased position, not continuous anatomical articulation. Calling it a finished Rive animation would be misleading. A visual review should decide whether these transitions feel sufficiently natural to pursue this style, or whether we must build true multi-layer arm/head deformation.

The prototype is packaged as `Giant-Dave-Moving-Prototype.zip` and an accompanying six-second MP4. These are current-conversation download artifacts, not committed GitHub binaries. Their transient sandbox URLs should not be treated as permanent repository assets.

## Art extraction method

- Input: generated 1774×887 RGB approved four-pose sheet (same subject, four separated panels).
- Extract each panel; use OpenCV GrabCut with conservative background seeds to matte the character to transparent RGBA.
- Export each state as WebP with alpha. The five WebP assets are small, together about 190 KB (not counting the preserved original sheet).
- The matte/eyelid overlay is a prototype only. Manual quality checks found some edges to refine in pointing and presenting states before production.
- Transparency is a convenience for staged motion, not proof that the image is a properly authored puppet mesh or transparent layered source.

## Technical gate before Cloudflare integration

The current GitHub connection accepts text files, but a verified binary upload pathway for the new user-approved sprites is not available in this session. **Do not merge a homepage integration with missing artwork** or provide an invented Pages preview URL. Preserve the local ZIP and artwork until the exact approved files can be added to `assets/characters/dave/` through a binary-safe upload. The original reference is already approved as a concept, but any extracted production matte is subject to quality review.

Recommended next steps:

1. Review the actual local interactive prototype. Check whether the four gestures and idle personality feel right.
2. Resolve matte/edge artefacts and establish a binary-safe GitHub artwork upload.
3. Produce *true* rig-ready paint layers for head/neck, facial lids/mouth, shoulders and near/far arms.
4. Compare an authored Rive mesh/bone rig with simplified composited sprite states for natural anatomy, maintainability and load size.
5. Stage the winning animated character over the approved homepage on a branch, test across responsive scenes, then consider merging.

## Acceptance already met versus pending

- **Met (local proof):** approved four acting directions are distinct; state-changing buttons operate; painted transparent sprites exist; CSS motion controls, blink overlay and reduced-motion fallback are implemented.
- **Not yet verified by browser automation:** this session's Chromium is blocked by environment policy from loading both `file://` and local HTTP, so interactive browser acceptance is **not asserted**. JavaScript source syntax and the referenced WebP files were checked; video preview rendered successfully.
- **Pending:** authentic head/arm skeletal deformation, eye detail polish, live Cloudflare preview, proper mobile positioning under actual homepage UI, final performance measurement and owner visual approval.

No new copyright, person/voice, or external project content has been published.

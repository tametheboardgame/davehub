# DH-06 — Giant Dave: movement and character proof of concept

**Started:** 22 October 2026. **Status:** Four-pose character appearance and acting direction APPROVED 22 October 2026. Rigging, transparent production layers and movement quality remain unapproved.

## Purpose

Give the large illustrated Dave host from the original floating-islands reference convincing, restrained, interactive movement. Preserve the approved character design and the one-screen, non-scrolling homepage. Dave is a host, **not** a visitor-controlled walking avatar.

Reference: `assets/concepts/2026-10-21/01-floating-islands-home.png`. The background plate has intentionally no Dave. The homepage already reserves an independent `#dave-stage`.

## First concept: a living illustrated host

- **Identity:** Bald head, ginger/brown short beard, blue eyes, navy hoodie over olive-green shirt, welcoming extended hand, confident amused expression. Match the original illustration's graphic-painterly style, lighting and proportions. Not photorealistic.
- **Composition:** Large near-camera three-quarter view emerging from the left, similar to the selected original. Leave the central logo, CTA, island hotspots and lower navigation fully operable and legible.
- **Personality:** Curious, welcoming, a little knowing; subtle character acting rather than mechanical flailing.
- **No Gilliam/collage treatment:** no paper cut-outs, disjointed photo faces, visible hinged joints, uncanny segmented hands, steampunk or grotesque motion.

## Approved four-pose character study (DH-06A)

**Owner approval:** 22 October 2026. All four poses and the consistent character depiction were explicitly approved as the correct look and personality.

The approved **four-panel image is a key-pose study**, not a transparent production sprite, rig, frame-by-frame sequence or actual animation.

- **Pose 1: Idle/confident.** Front three-quarter, one or both hands near jeans pockets, small knowing smile. Default resting state.
- **Pose 2: Welcome/reach.** Hand extended towards the camera, open palm, inviting expression. Strongest homepage reference.
- **Pose 3: Notice/point.** Eyes and head angled towards a destination, pointing index finger and engaged expression.
- **Pose 4: Present.** Open arm and hand presenting the wider creative world, warmer broad smile.

**Identity locked for subsequent art:** bald scalp, warm ginger-brown beard, blue eyes, navy zip hoodie with white drawstrings, olive T-shirt and blue jeans; comic-painterly rendering with confident proportions, warm orange edge light and cooler dark-blue shadows.

**Image provenance and preservation:** Approved original conversation-generated PNG, 1774 × 887, RGB, SHA-256 `18397610f45669b8bfbb0d5c64e33ff395c7fdf8b565c1598dc03bb635a84930`. The original generated PNG remains in the conversation attachment; the binary has **not** yet been uploaded to GitHub. Store that exact original under `assets/characters/dave/approved-four-pose-study.png` once a binary-safe repository upload is available. Never claim the image itself was committed merely because this approval metadata exists. Avoid an unreviewed redraw.

**Approval scope:** silhouette, face, clothing, proportions, graphic style and four acting directions. Approval does not yet cover layer topology, deformations, interpolation between poses, exported runtime or responsive layout.

## Motion design v0.1

| State / trigger | Visible behaviour | Priority |
|---|---|---|
| Static | Author-approved matching transparent pose; always available | Required |
| Idle | Gentle breathing/weight transfer, occasional natural blink, tiny head/shoulder movement | First test |
| Welcome | Small shoulder and arm extension with open hand, eyes towards viewer, expression lift; settle into idle | First test |
| Attention | Head/eyes follow an island the visitor deliberately hovers or focuses | Second test |
| Present destination | Gesture towards Games/Writing/Experiments/Projects, then return to idle | Second test |
| Enter world | Brief reaction/turn as scene transitions, never blocks navigation | Later |
| Reduced motion | Static illustrated pose with no persistent ambient movement | Required |

Avoid a compulsory intro, surprise sound, eye tracking outside the Dave stage, motion on every mouse movement or an animation that makes the homepage feel like a looping advertisement.

## Asset and runtime experiments

1. **Complete:** approved four-pose key-sheet. Preserve it and use it as the appearance benchmark for each movement frame.
2. Prepare independently editable painted components as needed for believable shoulder, hand, face, eyelid and head movement, without visible seams.
3. Build **a small Rive proof of concept** for idle + welcome and inspect expression quality, maintainability, asset size and browser performance. Rive supports raster/vector bones and meshes and JavaScript-driven state machines. Do not assume the drawing becomes a rig automatically.
4. Compare against an alternative (e.g. pre-rendered transparent animation clip or simpler layered animation) **only if** the rig quality or authoring overhead does not justify Rive.
5. Prototype direct interaction, responsive crop and reduced-motion static fallback inside a **separate test route or feature branch**, without replacing the approved homepage prematurely.
6. Seek owner visual approval before locking character assets, animation states or merging the live site change.

No 3D or game engine is required for this first test. Do not commit an animation library or asset export until the experiment actually warrants it.

## First moving proof of concept produced

A local interactive HTML/CSS prototype now demonstrates the four approved transparent character poses, idle breathing, independently composited blink and selected gesture states. **It is a sprite-based motion study, not a true Rive/mesh rig**, and has not been uploaded to Cloudflare. See [DH-06B motion test](GIANT_DAVE_MOTION_TEST.md) for limitations, original artefact preservation and next steps. Artwork binary upload and owner review are pending.

## Animation and placement acceptance

- Dave matches the approved illustrated original closely enough that the first-frame look feels continuous.
- Idle looks alive and doesn't loop obviously; welcome feels natural, with sensible elbow/wrist/hand anatomy and no joint clipping.
- Hands, head and hoodie stay visually coherent throughout, including at the screen crop.
- Desktop and 1366×768 laptop remain one-screen; no logo/CTA/category links become obscured.
- Mobile intentionally re-composes (potentially a smaller portrait or face/shoulder framing) rather than shrinking the desktop figure into an unusable overlay.
- Decorative animation does not intercept pointer events or keyboard focus.
- Works on the `*.pages.dev` review deployment before main merge; no autoplay audio; respects `prefers-reduced-motion`.
- Performance, load failure and static fallback are measured, not guessed.

## Next: DH-06B production rig experiment

### Layer/mesh preparation

Create a transparent, riggable equivalent of the approved Dave rather than cutting the four flat panels into jerky collage fragments. Illustrate areas hidden in the poses (shoulder behind forward arm, torso under sleeve, back of hand at the wrist, neck under chin) so interpolation never reveals holes.

Suggested logical controls/layers:

1. Torso/hoodie and neck with independently deformable chest/shoulder areas.
2. Head as a coherent painted plane, with limited rotation/tilt meshes, brows, individual lids, eyeballs and subtle mouth variants.
3. Near arm as a carefully painted deformation chain, including hidden elbow and wrist fill; forward reaching hand should have appropriate perspective and its own hand poses.
4. Far arm as a separate chain for the broad presenting gesture.
5. Hair/beard-edge details and clothing folds remain visually attached, with no visible mechanical joints.

### First interactive motion test

- **Static → idle** on homepage load: character reads as the approved idle pose, then very gentle breathing and irregular blinking.
- **Welcome** on an intentional user action (e.g. selecting Explore): small anticipatory shoulder motion, hand reach, natural settle and return to idle. No compulsory splash.
- **Second pass:** user focuses/hovers Games/Writing/Projects/Experiments; Dave looks or points towards the selected island, avoiding constant pointer chasing.
- **Fallback:** static PNG in reduced-motion, unsupported runtime or low-performance modes.

Evaluate actual Rive rig quality versus any simpler authored clip approach. The winning technology depends on artistic coherence and responsiveness, not framework fashion.

### Review gate

Provide a short interactive desktop/mobile test on a feature branch. Capture both idle and welcome in the same prototype, including keyboard and reduced-motion behaviour. Do **not** merge a static whole-body wiggle labelled as 'rigged animation'.

**Next approval needed:** the *movement test itself*, not another unrelated character concept.

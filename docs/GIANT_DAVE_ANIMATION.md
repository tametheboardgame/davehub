# DH-06 — Giant Dave: movement and character proof of concept

**Started:** 22 October 2026. **Status:** Concept/design investigation, not approved production art.

## Purpose

Give the large illustrated Dave host from the original floating-islands reference convincing, restrained, interactive movement. Preserve the approved character design and the one-screen, non-scrolling homepage. Dave is a host, **not** a visitor-controlled walking avatar.

Reference: `assets/concepts/2026-10-21/01-floating-islands-home.png`. The background plate has intentionally no Dave. The homepage already reserves an independent `#dave-stage`.

## First concept: a living illustrated host

- **Identity:** Bald head, ginger/brown short beard, blue eyes, navy hoodie over olive-green shirt, welcoming extended hand, confident amused expression. Match the original illustration's graphic-painterly style, lighting and proportions. Not photorealistic.
- **Composition:** Large near-camera three-quarter view emerging from the left, similar to the selected original. Leave the central logo, CTA, island hotspots and lower navigation fully operable and legible.
- **Personality:** Curious, welcoming, a little knowing; subtle character acting rather than mechanical flailing.
- **No Gilliam/collage treatment:** no paper cut-outs, disjointed photo faces, visible hinged joints, uncanny segmented hands, steampunk or grotesque motion.

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

1. Produce a **visual key-pose sheet** (neutral, greeting/hand extension, glance towards a destination, relaxed idle) to validate likeness, gesture and overlap. This is reference artwork, **not** an animated rig.
2. Prepare independently editable painted components as needed for believable shoulder, hand, face, eyelid and head movement, without visible seams.
3. Build **a small Rive proof of concept** for idle + welcome and inspect expression quality, maintainability, asset size and browser performance. Rive supports raster/vector bones and meshes and JavaScript-driven state machines. Do not assume the drawing becomes a rig automatically.
4. Compare against an alternative (e.g. pre-rendered transparent animation clip or simpler layered animation) **only if** the rig quality or authoring overhead does not justify Rive.
5. Prototype direct interaction, responsive crop and reduced-motion static fallback inside a **separate test route or feature branch**, without replacing the approved homepage prematurely.
6. Seek owner visual approval before locking character assets, animation states or merging the live site change.

No 3D or game engine is required for this first test. Do not commit an animation library or asset export until the experiment actually warrants it.

## Animation and placement acceptance

- Dave matches the approved illustrated original closely enough that the first-frame look feels continuous.
- Idle looks alive and doesn't loop obviously; welcome feels natural, with sensible elbow/wrist/hand anatomy and no joint clipping.
- Hands, head and hoodie stay visually coherent throughout, including at the screen crop.
- Desktop and 1366×768 laptop remain one-screen; no logo/CTA/category links become obscured.
- Mobile intentionally re-composes (potentially a smaller portrait or face/shoulder framing) rather than shrinking the desktop figure into an unusable overlay.
- Decorative animation does not intercept pointer events or keyboard focus.
- Works on the `*.pages.dev` review deployment before main merge; no autoplay audio; respects `prefers-reduced-motion`.
- Performance, load failure and static fallback are measured, not guessed.

## First review

Begin with key poses and the question **what does Dave actually do when a visitor arrives?** Approve the motion personality, then rig. Avoid investing in complex rigging before selecting the character expression and silhouette.

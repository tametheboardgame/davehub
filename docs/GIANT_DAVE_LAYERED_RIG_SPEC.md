# DH-06C1 — Giant Dave: production layered-art and rig specification

**Decision date:** 22 October 2026  
**Status:** **Approved implementation direction; asset drawings, runtime choice and animation quality NOT yet approved.**  
**Scope:** Production-quality idle, blink, welcome reach and return. Point/present and magical transitions are later increments.  
**References:** [Approved character](DECISIONS/ADR-0009.md), [original animation brief](GIANT_DAVE_ANIMATION.md), [motion grammar decision](DECISIONS/ADR-0010.md), [existing A/B comparison on draft PR #9](https://github.com/tametheboardgame/davehub/pull/9).

## 1. Locked design decisions

1. Giant Dave is an original, non-photographic, bald, blue-eyed, ginger-brown-bearded illustrated host: navy zip hoodie with white drawstrings, olive-green T-shirt, blue jeans, painterly comic rendering, warm orange rim light and cool dark-blue fill.
2. **Ordinary poses and movements use articulated joints/mesh deformation, not whole-body optical-flow morphs or a giant frame stack.**
3. **Magic/morphing is allowed only for explicitly signalled major world/scene transitions** (arrival, departure, crossing worlds, large composition shift). It is not how Dave switches from idle to reach, point, blink or present.
4. The large figure appears in the reserved independent `#dave-stage` of the existing non-scrolling, full-viewport homepage. Dave is never the user's controllable avatar.
5. Retain static art and `prefers-reduced-motion` fallback; no compulsory intro, audio, pointer tracking or hijacking HTML navigation.
6. Do **not** implement this by slicing an opaque pose at visible joints and trying to hide the seams. Produce complete, transparent, intentionally **overpainted** moving components with artwork behind the arm and around the shoulder/elbow.
7. The original four-pose reference and the approved separately generated transparent key poses remain references. Regeneration does not confer approval automatically. Treat prior extracted sprite mattes and motion studies as experiments, not production assets.

## 2. Source master, space, technical contracts

- **Source format:** One layered editable master per character revision (prefer a layered PSD or OpenRaster/ORA equivalent) plus lossless RGBA PNG layer exports. Preserve original source separately.
- **Initial authoring artboard:** `1536 × 2048 px`, transparent RGBA, sRGB, top-left pixel origin, positive Y down. This is a **proposed common layout contract**, not a claim that existing art already uses it. Resize/recompose approved visuals once consistently, **not per frame**.
- **Character scale:** head, shoulder line, hip line and ground/crop reference are consistent between files. Each exported layer must retain the *same untrimmed artboard* in the source pack; production runtime exports may be cropped with recorded offsets.
- **Root coordinate system:** local reference coordinate `(0,0)` at top left; a named `root` anchor at the lower centre of the visible character. Joint pivot positions are to be **measured from approved master art**, expressed in pixels and normalised coordinates in `rig-manifest.json`. Never invent pivots from an unrelated AI generation.
- **Alpha:** genuine transparency, straight RGBA; no black/white matte baked into transparent edge pixels. Check against both bright and dark checkerboard backgrounds, especially beard, hand and warm rim-light boundaries.
- **Hidden paint rule:** Every deformation region must contain enough *genuine painted* material underneath to remain seamless at the allowed extremes, with an initial **32–64 px overlap margin** at authoring resolution as a guide. The artist must expand overlap where motion tests expose gaps.
- **Export versions:** lossless RGBA masters plus compressed transparent WebP where browser-compatible; a single approved static transparent still for fallback. The source layered file is the editable truth, not a set of optical-flow in-betweens.
- **Preserve source:** Never overwrite the approved four-pose reference. Create independently versioned assets and record original image provenance, approvals and checksums.

## 3. Exact asset inventory (welcome rig)

**Tier P0 = mandatory to build and approve idle → welcome → return. Tier P1 = next pointing/presenting pass, not a dependency for P0.** This is a drawing/rig assembly inventory: *one file per line or a named layer in the editable master*, not 30 full-resolution network fetches.

| ID | Proposed layer filename | Tier | Content and reason |
|---|---|---|---|
| B01 | `body/hips-jeans.png` | P0 | Stable waist/hips/pockets; home for resting hand; extend beneath hoodie |
| B02 | `body/torso-shirt.png` | P0 | Complete olive-shirt chest/abdomen, painted underneath the open hoodie and either arm |
| B03 | `body/hoodie-back-hood.png` | P0 | Hood and back silhouette with concealed fabric under both shoulders |
| B04 | `body/hoodie-front-left.png` | P0 | Near/front jacket panel including zip side, drawn separately from arms |
| B05 | `body/hoodie-front-right.png` | P0 | Far jacket panel, zip and folds; enough underpaint for reach |
| B06 | `body/hoodie-neck-collar.png` | P0 | Collar/neckline paint and overlap, hides torso-to-head join |
| B07 | `body/neck-underpaint.png` | P0 | Full neck extending under jaw/hoodie at head tilt limits |
| B08 | `body/near-shoulder-underpaint.png` | P0 | Finished chest/hoodie fabric **behind** near arm so raising it reveals no hole |
| B09 | `body/far-shoulder-underpaint.png` | P0 | Equivalent behind far arm for later expansion; draw now |
| H01 | `head/head-base.png` | P0 | Entire bald head, ears, jaw and beard painted coherently, extended under neck/collar |
| H02 | `head/eye-left-open.png` | P0 | Independent left eye; gaze offset kept tiny |
| H03 | `head/eye-right-open.png` | P0 | Independent right eye |
| H04 | `head/eyelids-left.png` | P0 | Blink lids matching exact open-eye illustration, no replacement of whole body |
| H05 | `head/eyelids-right.png` | P0 | Right matching eyelid for natural blink |
| H06 | `head/brow-expression.png` | P0 | Minimal independent brow change for welcome, no facial reshaping |
| H07 | `head/mouth-smile.png` | P0 | Mild smile variant, optionally hidden if head-base smile already sufficient |
| AN01 | `arms/near-upper-sleeve.png` | P0 | Entire upper arm from under shoulder cap past elbow with substantial sleeve overlap |
| AN02 | `arms/near-elbow-bridge.png` | P0 | Painted elbow/sleeve-fold connector concealing upper/forearm seam throughout rotation |
| AN03 | `arms/near-forearm-sleeve.png` | P0 | Forearm from within elbow bridge to wrist, with correct sleeve texture/shadow |
| AN04 | `arms/near-wrist-hand-neutral.png` | P0 | Wrist + hand in idle/near-pocket position, separately deformable |
| AN05 | `arms/near-hand-reaching.png` | P0 | Correctly foreshortened open palm/fingers for forward-facing welcome |
| AN06 | `arms/near-hand-mid-reach.png` | P0 | *One* specially drawn mid-gesture hand shape; avoids abruptly turning pocket-hand into oversized palm |
| AN07 | `arms/near-shoulder-cap.png` | P0 | Jacket overlap/top cap above upper sleeve with a clean deformable edge |
| AF01 | `arms/far-upper-sleeve.png` | P0 | Independently riggable far upper arm, primarily idle for first pass |
| AF02 | `arms/far-elbow-bridge.png` | P0 | Far elbow overlap, prevent cut-out gap |
| AF03 | `arms/far-forearm-hand-rest.png` | P0 | Far forearm/wrist/idle hand consolidated for initial motion |
| OL01 | `overlays/hoodie-front-folds.png` | P0 | Localised folds/occlusion shadows for raising near arm |
| OL02 | `overlays/hand-contact-shadow.png` | P0 | Forearm/hand/torso contact shadow; separate intensity animation if appropriate |
| S01 | `fallback/dave-static.png` | P0 | Approved entire transparent neutral pose when animation unavailable or reduced motion |
| AF04 | `arms/far-forearm.png` + `arms/far-hand-open.png` | P1 | Split far arm and open hand for presenting |
| AN08 | `arms/near-hand-point.png` | P1 | Pointing hand, no whole-body redraw |
| H08 | `head/mouth-expression-alt.png` | P1 | Optional alternate expression for attention/present |
| FX01 | `effects/magic-transition-mask.png` | Later | Transition-only mask/effect, **never** part of ordinary pose animation |

**Hand design:** The neutral, mid-reach and open-palm hands are discrete **hand shape variants attached to the same wrist joint**, selected during movement. A small controlled hand swap/mesh deformation is fine; neither the head nor torso should dissolve during an ordinary reach. Correct knuckle count, thumb and finger orientation in all variants.

**Do not over-segment:** Beard remains on head-base unless its motion needs an independent piece; don't cut every finger or every hoodie fold into separate images by default. The exact number of runtime atlased textures may be much smaller than the logical layer count.

## 4. Rig hierarchy, pivot and stacking specification

```text
dave_root  (anchor: waist / stage base)
└─ pelvis/root_motion
   ├─ hips-jeans [B01]
   └─ torso [B02,B03,B04,B05,B08,B09]
      ├─ far_shoulder → far_upper_arm [AF01]
      │   └─ far_elbow [AF02] → far_forearm_hand [AF03]
      ├─ neck [B07,B06]
      │   └─ head [H01]
      │       ├─ eye_left [H02] + eyelid_left [H04]
      │       ├─ eye_right [H03] + eyelid_right [H05]
      │       ├─ brow [H06]
      │       └─ mouth [H07]
      └─ near_shoulder → near_upper_arm [AN01]
          └─ near_elbow [AN02] → near_forearm [AN03]
              └─ near_wrist → one of [AN04, AN06, AN05]
overlays [AN07, OL01, OL02] parented as appropriate
```

**Pivot naming contract** (capture measured coordinates in final manifest):
- `root`: lower centre of Dave's body for page placement, **not** centre of the canvas.
- `torso`: around lower chest/waist for subtle breathing (scale/mesh), without swinging hips.
- `neck`: under chin at upper neck, head yaw/tilt limited by hidden paint.
- `near_shoulder`, `far_shoulder`: anatomical glenohumeral joints, beneath the upper sleeve/shoulder cap.
- `near_elbow`, `far_elbow`: at actual elbow within the sleeve bridge; rotate forearm **relative to upper arm**.
- `near_wrist`: wrist aligned across all three hand variants.
- `eye_left`, `eye_right`: centred in iris/pupil masks; blink does not translate entire face.

**Draw order/occlusion:** Render torso and underpaint before the raised near sleeve; far arm can sit behind the torso when idle; shoulder cap and front folds overlap moving components to conceal joins; palm moves in front of torso as the reaching hand comes towards camera. Where rotation crosses the silhouette, use artist-authored masks/z-order state instead of always-on fixed stacking.

**Test each joint in isolation**, then the composite rig. Inspect minimum, middle and maximum extension frames at 100% and 200% scale. No missing chest, wrist gaps, misaligned sleeve stitching, clipped hands or visible paper-puppet joints.

## 5. Motion and state contract

**First-pass runtime states:**

| State | Trigger | Proposed timing / movement | Exit |
|---|---|---|---|
| `STATIC` | Reduced motion / failed load / user preference | Single approved still | Remain until settings change |
| `IDLE` | Start, no active gesture | Low-amplitude upper-torso breathing; irregular blink approx. every 3–8 s; small occasional head settle | Welcome request |
| `ANTICIPATE` | Intentional welcome action | ~0.12 s shoulder set and slight upper-body lean | Reach |
| `WELCOME_REACH` | After anticipation | ~0.75–1.10 s easing through shoulder, elbow and wrist; hand switches neutral → middle → open | Hold |
| `WELCOME_HOLD` | Reached pose | ~0.35–0.65 s steady open palm, minimal breathing | Return |
| `RETURN` | After hold / cancel | ~0.7–1.0 s smooth arm/elbow settling; no body morph | Idle |
| `ATTENTION` | P1: keyboard focus/hover on destination | Head/eyes rotate modestly after ~150–250 ms dwell | Idle/focus changed |
| `PRESENT` | P1: deliberate category activation | Later independently articulated far-arm presentation | Idle/scene change |
| `WORLD_TRANSITION` | Later: explicit page navigation | May use a separately designed magical dissolve/morph with luminous path | Page route |

These are **starting animation targets**, not calibrated performance results. Don't lock exact easing until reviewed on real artwork. Prefer easing and slight controlled anticipation to linear interpolation; never autoplay a long non-skippable welcome. No idle to welcome pose `crossfade` that ghosts two arms.

**Events/contract for website integration:** `setMood('idle'|'attention')`, `gesture('welcome'|'point'|'present')`, `setReducedMotion(bool)`, `dispose()`, and optional `onGestureComplete`. Adapter is independent from UI library; it must not intercept `<a>` clicks, hash navigation or focus.

## 6. Export structure and source-of-truth rules

```text
assets/characters/dave/
  references/approved-four-pose-study.png    # upload approved original via verified binary path
  source/dave-rig-v001.psd                     # or .ora editable layered equivalent
  source/layer-export/                        # untrimmed master transparent RGBA PNG layers
  export/dave-rig-v001.riv                     # only if rig is actually built/selected in Rive
  export/dave-static-v001.webp
  export/dave-atlas-v001.webp                  # optional packed browser texture
  metadata/rig-manifest-v001.json              # pivots, hierarchy, atlas crop offsets, versions
  metadata/art-qa-v001.md                      # layer QA, provenance, hash, approvals
experiments/dh-06c1/
  index.html                                   # comparison/animation test; not production route
  README.md                                    # how to test; known limitations
```

- `source/` assets are production **authoring artefacts**. `export/` assets are *derived* and regenerated reproducibly.
- A rig manifest maps layer ID → actual source filename, source extent, atlas crop rect, pivot anchor, parent and z-order. One canonical revision; no runtime guessing about file offsets.
- Use filename/version identifiers rather than mutating already-approved key poses.
- Before public GitHub commit, verify rights to any human likeness, sound, image and third-party element (see [publication policy](PUBLICATION_POLICY.md)). Dave is original illustrated art and should not become a photo-real owner likeness.
- The active GitHub integration in the previous experiments supported UTF-8 file commits but **not arbitrary binary upload**. Asset images/PSD/riv cannot be truthfully recorded as committed until a binary-safe workflow is verified.

## 7. Runtime proof and selection

**Preferred experiment:** Rive raster image layers, bones/meshes, state machine and web runtime. Rive currently advertises raster import (including PSD layers), bones/meshes and interactive state machines; review its editor/export restrictions before adoption: https://rive.app/features and https://rive.app/pricing . **This is a candidate, not a locked implementation.**

**Comparator:** A small bespoke Canvas 2D rig using the same approved layers, pivot manifest and state contract. Do not build a custom general-purpose skeletal engine without evidence it would outperform the authoring workflow.

**Selection gate:** Compare articulated quality, hidden-layer gap control, expressiveness, maintainability, editing workflow, accessibility integration, load size and FPS on an ordinary laptop/phone. Choose based on demonstrable results, not a library preference.

**Initial engineering budgets (targets, to measure):** Prefer a compressed rig+core artwork payload ≤ 3 MB, lazy-load optional expressions and magic, avoid a sustained redraw loop when hidden, aim for smooth 60 fps desktop and ≥ 30 fps ordinary mobile during the short gesture, and fallback to static if the rig fails. These numbers are proposed budgets, not measured current performance.

## 8. Homepage and responsive composition

- Desktop: Dave occupies the left foreground within the existing `#dave-stage` overlay. Keep his large face and outstretched arm visible without covering **DaveHub logo**, Explore CTA, Games/Writing/Experiments/Projects hotspots or bottom menu.
- Laptop `1366×768`: same single-screen requirement, no vertical scrolling or clipped CTA. Check hand extent at full reach, not only idle.
- Mobile portrait: use a separate framing preset (small upper-body bust/shoulder or partial entrance) rather than simply scaling the desktop character; never obscure both the title and primary CTA. It is acceptable to use the approved static illustration until mobile articulation is designed.
- Short landscape/zoom: reduce or hide the character before hiding essential navigation. Accessibility may permit page scrolling in extreme zoom cases.
- Layer is decorative: `pointer-events: none`, `aria-hidden="true"`; site HTML owns all focus and clickable destinations. No audio.
- Observe `prefers-reduced-motion` on first load and respond to changes; don't briefly autoplay before detecting user preference.

## 9. Work packages and hand-off gates

| Package | Work | Acceptance gate |
|---|---|---|
| **DH-06C1a** | Author body/neck/head and concealed near-shoulder base; generate accurate neutral transparent still | Full checkerboard inspection, recognisable Dave, no seams with arm hidden/raised |
| **DH-06C1b** | Paint near-arm upper, elbow, forearm, 3 hand variants and shoulder/hoodie overlaps | Shoulder/elbow/wrist rotation extremes seamless; fingers anatomically correct |
| **DH-06C1c** | Add eyelids, eye pieces, simple brow/mouth expression; rig head | Real isolated blink/head movements with stable skull/beard |
| **DH-06C1d** | Assemble articulated idle/anticipate/reach/hold/return in a test runtime | No optical-flow body morph; genuinely jointed arm; static fallback |
| **DH-06C1e** | Evaluate runtime against Canvas comparator, measure performance, prepare safe binary hand-off | Document decision and actual metrics; owner reviews working motion |
| **DH-06C (integration)** | Add approved exported rig to `#dave-stage` in a **Cloudflare branch preview**, mobile composition and controls | Full-screen responsive checks, keyboard, reduced motion, no blocked hotspots; owner approves before main |
| **Later** | Extend far arm for present, pointing hand, attention gestures; design one separately approved world-transition magic effect | Each motion reviewed, no new whole-body morphs disguised as natural motion |

**Exit from C1:** A reviewable naturally moving Giant Dave welcome (including blink and breathing), editable layered source master, joint/pivot manifest, approved transparent static fallback, measured browser results, and **no** missing art/rig binaries. If any one of these is absent, do not mark the production layered rig complete.

## 10. Immediate next action

Begin with **DH-06C1a and C1b only**. Produce transparent, deliberately overpainted underlying torso/shoulder and independent near-arm pieces from the *approved* character; review their overlap during real shoulder and elbow rotation before expanding facial/far-arm art. Do not order a new full-frame sprite sequence. The current draft movement-study PR #9 remains experimental evidence and should not be merged as the production rig.

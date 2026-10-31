# Instructions for DaveHub development agents

Before editing, read `README.md`, `docs/ROADMAP.md`, `PROJECT_STATE.json` and the relevant concept/test documentation.

## Intent

Create an eccentric, explorable place for the things David has made. It is not a generic developer portfolio or sales site. Avoid template-like project grids, skill bars, client testimonials, CV funnels and pointless technical flourishes.

## Delivery process

1. Name the roadmap work package and scope before implementation.
2. Work in small, independently reviewable increments.
3. **DH-01 concept baseline is approved.** Concept 1 is the lead, Concepts 2 and 3 support it; do not restart an open competition between unrelated visual styles. Exact layout and implementation still require review.
4. Use feature branches, test what was built, and seek review before merging.
5. Never claim a deployment succeeded or provide an invented test URL.
6. Update `docs/ROADMAP.md` and `PROJECT_STATE.json` for each completed work package; log important design/architecture decisions under `docs/DECISIONS/`.
7. Protect independent source projects: DaveHub must not absorb or alter them to generate showcase content.
8. Use British English for public copy.

## Mandatory creative direction

- Primary domain: **davehub.co.uk** (owner reports it purchased; do not claim DNS is live until verified).
- The Dave Machine is a metaphor for the **inside of a stylised, invented Dave-like character's mind**, not a literal mechanical room full of random gears.
- The illustrated Dave-host / creative-mindscape direction is approved as a **design concept**. Its exact character asset and entry transition still require production review.
- **Hard style veto:** no Terry Gilliam / Monty Python-style cut-out animation or collage; no grotesque caricatures, mismatched photo clippings, Victorian scrapbook surrealism, jerky paper puppets or ramshackle steampunk for the central visual language.
- Explore an original, coherent, designed, striking and surreal visual language with expressive motion, clear interaction and intentional humour.
- Do not use the real user's photograph or identifiable realistic likeness as an entrance asset. Create original, non-photographic character concepts subject to approval.
- No small player-controlled avatars walking around the site. Interactive exploration is by clicking/tapping destinations, portals, panels and camera/view transitions.
- Provide a clearly visible **"I want to view this as a menu coz I'm boring"** option, opening an intentionally plain, 1990s HTML-style menu with identical public content and direct links.
- The retro mode should be a real accessible, functional alternative, not a modern theme disguised as retro styling.
- **Concept 1 is the primary reference**. See `docs/LOCKED_CONCEPTS.md`, `docs/VISUAL_DIRECTION.md` and `docs/BORING_MENU.md` for the reference images and locked decisions.

## Non-negotiable 3D world construction rule (ADR-0012)

> **Do not go back to “generate a bunch of pictures and try to fake a 3D world.”**
> **Build the world properly, then make it beautiful.**

- **MANDATORY:** Read [ADR-0012](docs/DECISIONS/ADR-0012.md) before changing any interactive 3D world, perspective-dependent furniture, moving scene object, or related asset pipeline.
- Establish real geometry, shared scale/coordinate system, consistent camera, correct pivots, object separation and working animation **before** creating final textures or artwork.
- No independently AI-generated open/closed frames, drawer fronts, cabinet interiors, or other moving-state images may be assembled to simulate physical 3D mechanics. Do not try to correct mismatched vanishing points with more image generation or image warping.
- Use geometry-based Three.js / CSS 3D prototypes as appropriate; detailed production assets may be modelled in Blender and exported in GLB/glTF. All movable components must remain tied to one rig/model/coordinate space.
- AI-generated images may be used for concepts, references, textures and genuinely static decoration only. Pre-rendered animated sprites must be captured from **one consistent 3D model and camera**.
- Before adding visual polish, verify movement at closed, half-open and open states plus camera changes, test on Cloudflare staging, and obtain owner review.
- Any exception requires explicit owner approval and a new superseding ADR. Do not reinterpret this rule into a shortcut.

## Giant Dave motion implementation decision (ADR-0010)

- Use the approved four-pose identity and [DH-06C1 exact layered rig spec](docs/GIANT_DAVE_LAYERED_RIG_SPEC.md).
- Articulate ordinary idle/blink/look/welcome/point/present via painted independent body/arm/face layers and real joints/mesh. Do not use optical-flow whole-body morphing to change normal poses.
- Morph or dissolve only for separately approved major magical/world transitions.
- Draw concealed shoulder/chest/elbow/neck artwork and overlap patches; a transparent image cut out of an already composite pose is not a production rig.
- Keep rigging experiments off `main` until an approved static fallback, real binary assets, tested gestures, mobile composition, accessibility and owner visual approval exist.
- Rive is a possible runtime to evaluate against simpler alternatives, not a selected mandatory dependency.

## Public repository safeguards

This repository is PUBLIC. Never commit tokens, secrets, private source files, employer/railway technical details, customer information, personal data, or third-party artwork/music without permission. All external project integrations are read-only by default. All generated public-content updates are drafts pending deliberate human approval.

## Experience requirements

- Curious visitors should find something interactive immediately.
- Offer an obvious 1990s-style plain HTML menu, accessible project index/search and direct deep links; both modes must navigate the same content.
- Mobile, keyboard access, reduced-motion alternatives, usable contrast and performance are required.
- No forced tutorials, mandatory cinematic intros or surprise autoplay sound.
- Use real interactive prototypes to choose the visual technology. Do not commit to 3D, a CMS or a database without evidence that it helps.

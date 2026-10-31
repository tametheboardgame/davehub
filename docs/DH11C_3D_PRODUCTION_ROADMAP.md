# DH-11C — The Manuscript Hoard: textured 3D production roadmap

**Status:** Proposed implementation plan, prepared 31 October 2026. **Approval:** the owner selected the detailed planning option, **not** yet approval of particular textures, models, camera changes, public publishing or promotion.  
**Current reference:** Working, owner-liked [DH-11C.2 geometry prototype](/previews/dh-11c/room/) in Cloudflare staging; cabinet mechanics [DH-11C.1](/previews/dh-11c/cabinet/).  
**Architecture rule:** [ADR-0012](DECISIONS/ADR-0012.md) is mandatory. *Build the world properly, then make it beautiful.*  
**Target:** Rich, coherent, stylised 3D adventure-style Writing world; first production-quality world in DaveHub, later a reusable foundation for distinct worlds.

## 1. Objective, boundaries and definition of finished

Turn the geometry-first Manuscript Hoard prototype into an atmospheric, illustrated-looking but physically coherent point-and-click 3D world. Preserve its essential appeal: one room, one coordinate system, purposeful camera moves, objects that are real rather than flattened images, immediate exploration and accessible alternative navigation.

**A finished v1 must have:**

- A consistent, visually directed room with a distinctive warm, eccentric fantasy writing-den identity and relationship to the approved DaveHub floating-islands aesthetic.
- Purpose-built or verified models for the room, desk, five-drawer cabinet, bookcase, typewriter, waste bin, door, window, furnishings and selected readable decorative props.
- Materials/UVs, properly hinged/sliding mechanics, curated cameras, lighting, restrained atmosphere and deliberate interaction feedback.
- The five cabinet drawers and at least one meaningful second-level interaction (e.g. select/examine an approved folder) physically integrated with the same rig.
- An approved-content-only route from the room to canonical creation pages, without leaking draft, private or fictional demonstration records.
- Usable desktop/mobile/keyboard access, reduced-motion behaviour, WebGL fallback, scene-loading/error handling and a conventional menu/index path.
- Real Cloudflare-staging build/regression/browser evidence, a visual owner approval gate and an explicit rollback route. No change to the future production domain.

**Explicitly out of scope for the first version:** an avatar or free-roaming first-person game, real-time physics simulation, a universal 3D editor/CMS, all other DaveHub worlds, arbitrary AI-generated content, automatic approval of new works, reworking game deployments, or mandatory sound. Additional worlds can reuse infrastructure after this one is approved.

## 2. Locked constraints and existing source of truth

- **ADR-0012:** Independently generated art of opened/closed states is forbidden as a substitute for geometry. Do not repeat the drawer-perspective failure. AI image outputs may be concepts, static decoration, decals and thoughtfully prepared textures; pre-rendered animations must originate from a single consistent rig/camera.
- **Reuse rather than discard:** use `prototypes/dh-11c-room/room-plan.js` as the initial world coordinate/camera contract and `room.js` as proof of object interactions. Refactor deliberately; do not silently change metres, pivots, axes, IDs or object positions. Current nominal world dimensions are 14 × 6.4 × 11 metres, Three.js Y-up.
- **Site boundaries:** current `/worlds/writing/` remains accessible and unchanged until separately approved; use `/previews/dh-11c/room/` for iterations. `davehub.pages.dev` is staging; `davehub.co.uk` is not part of this plan.
- **Content:** canonical `content/public/catalogue.json` and existing validation/rendering remain the only public content source. The first textured world must work perfectly well with sparse or empty approved Writing material. No private repo access or fictional records are permitted on the standard Writing route.
- **Art direction:** original stylised, witty, readable fantasy interior, not photorealism, a generic template, a Terry Gilliam cut-out collage or ramshackle retro-steampunk as a global visual language. Keep form/colour readability at camera stops. Approval of the geometry prototype does not imply approval of any proposed decorative design.
- **Dependency and deployment discipline:** pinned dependencies and licences, same-origin/static-first assets, GitHub feature branches and checks, accessible UX, Cloudflare-hosted reviews; never require the owner to run a local workstation server.

## 3. Asset and runtime architecture

### 3.1 Source asset organisation (proposed; create as work proceeds)

- `assets/worlds/writing/3d/source/`: editable Blender `.blend` files **or** deterministic Blender Python modelling/export scripts, plus modelling notes. If source master binaries become large, keep a documented storage and versioning strategy; do not quietly drop the editable source.
- `assets/worlds/writing/3d/models/`: build-verified GLB models with stable object IDs and pivots; initial partitioning: `room-shell.glb`, `furniture-static.glb`, `cabinet.glb`, `desk-props.glb`, `typewriter.glb`, `bookcase.glb`, `door.glb`, `window-props.glb`. Repartition based on measured load and reuse, not arbitrary file count.
- `assets/worlds/writing/3d/textures/`: optimised albedo, ORM/roughness, normal, emissive and decal textures; manifests specify ownership/licensing/colour space/material usage.
- `assets/worlds/writing/3d/manifests/`: validated scene/object/pivot/material manifests, source-to-export mappings and size/performance reports.
- `prototypes/dh-11c-room/`: current review shell, with future `scene-loader`, `interaction-controller`, `camera-controller`, `content-adapter`, `fallback` modules; modularise incrementally, retaining a working preview after every PR.
- `tests/`: exporter/asset contracts, scene-state unit tests, content isolation, DOM/navigation tests, hosted smoke and visual/browser regression evidence.
- `docs/`: this roadmap, approved visual bible, asset list, model/export contract, optimisation record, interaction map and release checklist.

### 3.2 Geometry/export contract

- One room-wide world origin and metres scale. Record exact parent transforms for each object so re-export does not move it. Blender is Z-up; Three.js is Y-up; **export/import conversion must be verified** using labelled test axes, not assumed.
- Every movable component needs its own identifiable node: `cabinet/drawer_finished`, `cabinet/drawer_drafts`, `cabinet/drawer_oddities`, `cabinet/drawer_fragments`, `cabinet/drawer_field_notes`, `door/leaf`, `typewriter/key_*`, `desk/paper_*`, etc. Avoid making the geometry tree depend on display copy.
- Pivot/origin placement is a validation requirement: drawer local forward-axis motion, door hinge at vertical frame edge, individual book extraction, typewriter action and examined folder translation/rotation must move physically plausibly.
- Create a separate, simple selectable proxy for each interactable or name the selectable mesh group deliberately. Raycast against explicitly approved object IDs; do not make every decorative mesh interactive.
- GLB/glTF holds meshes, UVs, material slots and optionally animation clips. All textures and licences are reproducible; no runtime loading from unapproved external hosts.
- Keep names, geometry scale and camera targets stable between exports. Each asset release includes a manifest with `id`, version/hash, upstream source, bounding box, triangle count, texture count, compressed file size, child node names and intended interactions.
- Blender/headless export may run in a pinned GitHub Actions workflow **after** validating a supported setup; the owner should never be expected to perform local build steps. Generated binaries must be compared with approved source and checked for unexpectedly large/unsafe output.

### 3.3 Runtime boundaries

- A single Three.js scene and camera orchestrate the environment. Use GLTFLoader or an equivalent pinned supported loader, not a second competing render engine.
- Separate **model loading**, **camera transitions**, **object state machine**, **input/raycasting**, **approved content adapter** and **accessible DOM controls**. One state transition must update both the 3D object and the accessible button state.
- Continue to expose fallback direct routes and an accessible HTML object/menu control list. WebGL failure, a missing GLB or a failed texture should never break the entire Writing catalogue.
- Avoid long uninterruptible loading sequences. Load core room geometry and visible materials first; stream/lazy-load detail when useful, with visible progress/error and a fallback.
- Keep node identities independent from language and visual style, enabling future rooms to reuse generic camera/input code without becoming visually identical.

## 4. Milestones, deliverables and exit criteria

### DH-11C.3 — Art direction and room asset bible

**Goal:** decide what to build, not how to disguise unfinished geometry.

**Tasks**

1. Inventory the existing 3D prototype from all seven camera stops. Capture what is visually successful and what is not: perspective, composition, proportions, sight lines, furniture placement, reachability and obscured hotspots.
2. Produce a reference art bible tied to the approved DaveHub islands: environmental story, shape language, palette, material hierarchy, lighting temperature, background treatment, ornamental restraint, signage/typeface, humour and examples of *do/do not*.
3. Specify hero-object designs for filing cabinet, desk, typewriter, bookcase, window and door, **against the actual current model proportions**. Use AI concept art only for creative exploration, never as independent mechanical-state images.
4. Create a complete asset inventory with object ID, model priority (hero/secondary/ambient), interactions, owner, texture needs, estimated load complexity, reuse potential and publication rights.
5. Freeze a first-pass camera composition and focus framing reference for desktop, mobile portrait and mobile landscape. Mark all visible and clickable objects at each stop.
6. Review competing material treatments against one unchanged neutral model. Agree a coherent finish rather than generating unrelated attractive prop images.

**Deliverables:** `docs/DH11C3_ART_BIBLE.md`, visual references, model inventory/priority manifest, camera/contact sheets and owner feedback record.

**Exit gate:** owner explicitly approves the style, colour/material families, hero-object silhouettes and camera composition. No production textures until that visual direction is approved.

### DH-11C.4 — Modelling, clean geometry and production asset pipeline

**Goal:** replace improvisational procedural hero-objects with editable, correct and repeatable assets **without changing the underlying interaction behaviour**.

**Tasks**

1. Write an export contract, pin the Blender/GLB toolchain where feasible and prove one simple model round-trip: correct metres, Y-up orientation after import, named nodes, UVs, pivot and bounds.
2. Modularise the existing prototype so procedural primitives can be replaced one object at a time by GLB while the old geometry remains an optional fallback.
3. Rebuild/clean the room shell (floor/walls/beams/door/window openings), then main furniture. Keep the agreed layout and perspective; correct any clashes with deliberate plan edits and tests.
4. Build the cabinet as a **master functional asset** with five individual drawers, interiors, rails, handles and a reusable folder holder. Prove closed, 50% extended, fully extended, close and cross-drawer switching from every relevant camera.
5. Build the desk, typewriter, bookcase, bin, hinged door and window, with the real movable components identified. Low-detail ambient clutter stays economical.
6. Add explicit collision/raycast proxy groups. Verify no unexpected object-selection overlap and no invisible clickable geometry.
7. Automate GLB validation in CI: file present, parsable, named nodes, bounded transforms, acceptable scale, triangulation/size warnings, texture references and production licence metadata.
8. Stage each model behind a small PR. Never replace the whole room at once without a reproducible side-by-side comparison.

**Deliverables:** model source masters, export scripts/settings, GLBs, scene/asset manifests, loader integration and movement tests.

**Exit gate:** every object is consistently placed, no geometric intersections in normal camera stops, all five drawers and door remain mechanically correct, all existing interactions work with the replacement model, and owner approves the untextured 3D room before material application.

### DH-11C.5 — Materials, texture atlases and a first cohesive art pass

**Goal:** apply finished-looking visual surfaces to the approved geometry.

**Tasks**

1. Establish a reusable material library: warm aged wood, subtly distressed teal/painted metal, brushed brass, paper/parchment, book covers, plaster, fabric/rug, glass, ink and stone.
2. UV unwrap the relevant models; assign stable material slots. Share tiled/atlas textures where appropriate and avoid hundreds of nearly identical materials.
3. Produce controlled albedo/base-colour images, roughness/metallic maps, selectively normal/ambient-occlusion maps, decals and emissive details. Respect sRGB base-colour versus linear data-map handling.
4. Use AI-assisted texture concepts only where rights, repeatability and fit are clear; any generated texture must be cleaned, made consistent, properly mapped and reviewed on the actual 3D model.
5. Apply silhouette/readability checks at all camera positions and mobile layouts. Drawer labels must stay legible; visually important controls and hotspots cannot disappear into the decoration.
6. Optimise texture sizes and packaging using measured assets. Consider compressed GPU textures/KTX2 and mesh compression **only after loaders, static build and target browsers are tested**; optimise art rather than breaking appearance for a nominal byte target.
7. Maintain a side-by-side greybox toggle or fixed screenshots for geometry regression comparisons, so pretty materials never conceal a broken pivot.

**Deliverables:** approved material boards, UV/material masters, texture atlas/optimisation records and a fully textured Cloudflare feature preview.

**Exit gate:** consistent materials, no visibly stretched seams, correct colour space, no perspective/interaction regressions, legible labels and owner approval of the first textured scene.

### DH-11C.6 — Lighting, atmosphere, animation and sound policy

**Goal:** create a living writer's den without harming responsiveness or access.

**Tasks**

1. Implement deliberate warm/cool contrast: readable room ambient illumination, warmer desk lamp, gentle coloured window lighting, restrained focal highlights on usable objects.
2. Use controlled shadows, AO/baked detail where appropriate, and tone mapping. Establish exposure/contrast baselines for accessible UI and dark/light scenes.
3. Introduce light ambient life: slight island drift visible through the window, gentle paper motion, subtle lamp flicker, restrained dust particles and occasional object-specific animations.
4. Avoid gratuitous post-processing. Bloom, depth of field, fog and god-rays are **optional** and must be evaluated against measured GPU/CPU cost and readability.
5. Pause or scale animation when not visible; support `prefers-reduced-motion`. No surprise autoplay sound. If sound is later introduced, it requires clear user initiation, mute state and asset rights.
6. Review camera movement durations, easing, focus return, collision/clipping, occlusion and window treatment across seven stops.

**Deliverables:** lighting/animation design notes, performance comparisons, accessibility alternatives and hosted polished environmental preview.

**Exit gate:** owner agrees the room looks and feels coherent; no distracting light/flicker, no broken interaction layering and acceptable measured device performance.

### DH-11C.7 — Deep object interactions and approved content binding

**Goal:** transform a visually impressive room into an actual writing archive and miniature adventure.

**Tasks**

1. Refactor object interaction into explicit states (room overview, object focus, sub-object open, item lifted, examination, return). Support Escape unwinding and returning focus to the initiating interactive element.
2. **Cabinet:** each drawer opens physically; extract a folder, move it to a reading surface, reveal a title/synopsis only when the approved catalogue supplies it, return it, close drawer. Empty drawers retain physical behaviour without inventing works.
3. **Desk:** move a stack, select a real approved manuscript, examine/read via accessible DOM panel or canonical page; keep paper object movement separate from content classification.
4. **Bookcase:** select/retract books and examine approved worldbuilding/notebook materials if available; no labels for unapproved work.
5. **Typewriter:** key press, carriage/paper response and small self-contained creative reaction; any generated output must remain local unless an explicit future publication workflow is approved.
6. **Bin:** rummage and reveal only genuinely approved fragments or neutral flavour interactions; do not infer private or abandoned contents from repository metadata.
7. **Window/door:** optional atmospheric interaction and a deliberate return-to-islands flow. Keep visitor navigation obvious even when the room is zoomed in.
8. Use a deterministic, tested mapping from approved catalogue metadata to exactly one destination/drawer. No raw candidate data, remote GitHub discovery payloads, fictional fixtures or bypass of publication approval.
9. Add versioned, isolated localStorage for optional exploration history with schema migration and safe reset. Do not store personal information, unapproved content or anything required to access existing public works.
10. Test keyboard, touch, assistive announcements, WCAG contrast/focus handling, reduced motion, JS-disabled and WebGL-fallback paths. An accessible list of published works must remain discoverable without solving an interaction.

**Deliverables:** model-driven animations, documented state graphs, approved-content adapter, interaction tests, exploratory state schema and safe fallback routes.

**Exit gate:** each object works in both 3D and accessible controls; no duplicate or unapproved publication; empty and partially populated content scenarios tested; owner signs off the actual point-and-click experience.

### DH-11C.8 — Production hardening, staging integration and controlled release

**Goal:** adopt the new 3D Writing world without disrupting DaveHub's site, games or existing content.

**Tasks**

1. Define and test a feature-flag/fallback design. The current illustrated Writing route remains available for rollback or users without WebGL.
2. Publish the complete 3D experience as a review-only, noindex Cloudflare staging route. Do not alter the production custom domain.
3. Run full repository CI plus asset export/validation, unit, integration, security/content approval and browser-interaction checks. Verify exact deployed commit/asset hash and image/GLB MIME types rather than treating HTTP 200 on an HTML shell as proof that WebGL works.
4. Run real browser tests on desktop Chromium/Firefox/WebKit and representative mobile form factors; check texture display, camera stops, object hitboxes, drawer motion, keyboard, reduced-motion, lost-WebGL handling, direct links, game routes and existing Writing content.
5. Measure cold-start transfer and parse, first meaningful render, frame rate, texture memory and impact on other DaveHub routes. Optimise to evidence-based targets before integration.
6. Obtain owner visual and behaviour approval on the hosted preview. Integrate behind a reversible route/feature switch only after sign-off; keep the old illustrated room and its content reachable for fallback.
7. Run post-deployment Cloudflare checks, preserve previous staging SHA and verify a documented one-commit rollback path.
8. Leave `davehub.co.uk` and the future production Pages project untouched until a distinct, explicit launch approval and established domain/cutover runbook.

**Deliverables:** tested staging world, rollback-ready route integration, release manifest, QA evidence, reviewed production guide and revised roadmap.

**Exit gate:** exact staging deployment confirmed; complete cross-device interaction QA; measurable loading quality; no regressions in both games/catalogue; owner explicitly authorises changing `/worlds/writing/`.

### DH-11C.9 — Optional reusable world-engine extraction (after Writing v1)

Extract only demonstrably reusable pieces: scene loader, common camera focus controller, accessible input mapping, manifests and asset contracts. Music, Experiments, Unfinished Shelf and Memory Lane retain **different** story, atmosphere and unique mechanics. Do not build a generic configurable 3D-platform framework before the first world is proven.

## 5. Prioritised production order and dependency gates

- **Gate 0 (current):** DH-11C.2 mechanics and point-and-click approach liked by owner. Save hosted prototype as the visual/mechanical comparison baseline.
- **Gate 1:** DH-11C.3 art direction **and** a short technical camera/geometry review approved. Resolve silhouette, furniture size, light and object priority before costly modelling.
- **Gate 2:** DH-11C.4 model pipeline working on one representative hero asset: **cabinet first** because it exercises depth, rails, movable parts, labels, folder storage and camera.
- **Gate 3:** Finish core room and remaining hero model mechanics without textures; compare against the original prototype and approve geometry.
- **Gate 4:** DH-11C.5 texture cabinet and adjacent desk corner as one vertical slice; seek visual approval before propagating materials across the room.
- **Gate 5:** Apply approved materials to whole room, then DH-11C.6 lighting/atmosphere. Reject low-value expensive effects.
- **Gate 6:** DH-11C.7 content-safe deep interaction and discovery; avoid coupling publishing permissions to 3D navigation.
- **Gate 7:** DH-11C.8 evidence-backed owner acceptance, reversible staging integration and then a separately controlled public launch.
- **No cross-world expansion** before the Writing room satisfies Gate 7.

Each gate should produce a separate short feature PR, a stable hosted preview, tests and a clear owner approve/revise/reject decision. Progress is not measured by number of pretty images.

## 6. Prioritisation: hero assets and minimum useful quality

**P0, must be good before room approval**

- Cabinet case, five correctly tracked drawers, handle/label, folder lift/return and readable item presentation.
- Desk with papers, one manipulable stack, visual lamp and camera close-up.
- Coherent room shell, bookcase, main door, window geometry, material system, camera movement and keyboard/touch navigation.
- Approved-content adapter, safe fallback, asset loading and responsive performance.

**P1, add after P0 is visually and mechanically sound**

- Typewriter carriage/key/paper polish, book pulling variations, paper bin rummage, richer books/props, glow and slow atmospheric island movement.
- Decorative stories in shelf objects, rug/wall materials, tasteful particles and reflection details.

**P2, only when measured value justifies work**

- Substantial physics, deep inventory puzzles, complex cinematic camera paths, extra particle systems, optional soundscapes, heavier post-processing and additional fantasy effects.

A small polished room that responds reliably is preferable to a large room full of unconvincing assets.

## 7. Proposed performance and asset budgets (targets, not promises)

**Start with these limits as design targets, then profile and revise openly using actual supported devices.**

- **First visible frame:** provide an immediate HTML shell with status/fallback before 3D assets load. Aim for first usable interaction in under roughly 5 seconds on a representative midrange desktop connection, with a slower-network/mobile result explicitly recorded. Do not block fallback links while loading.
- **Total compressed 3D payload:** initially target around 12–20 MB or less for first-room access including models, textures and runtime, preferably lower. Measure per-file and network transfer, not source asset size; reject unnecessary 4K textures.
- **Texture policy:** common materials begin at 512–1024 px; 2048 px only for visible hero detail; larger sizes require visual evidence. Combine compatible maps, reuse atlases, and ship mipmaps/appropriate compression after browser validation.
- **Frame rate:** aim for a smooth 60 fps on representative desktop and at least a stable, usable 30 fps on a midrange mobile reference device; establish actual devices and baseline before turning these into hard gates.
- **Motion:** clamp device pixel ratio, adapt quality to capability, pause offscreen animation and honour reduced motion.
- **Accessibility:** operate every meaningful interaction by keyboard and touch, with visible focus/selection, suitable names, non-colour-only status and direct route fallback.
- **Asset QA:** zero missing materials/textures, broken UVs, unexpected 404s, cross-origin dependencies or unapproved content; measured size/triangle/texture report included with each hero model PR.

These are **candidate engineering budgets**; the owner should approve any material increase that affects waiting time, readability or mobile performance.

## 8. Testing matrix and release evidence

**Static/CI checks:** scene plan invariants, object ID/pivot presence, model hierarchy, GLB parse/export, scene camera bounds, texture path/colour space, source/licence manifest, approved-catalogue filtering, asset size budgets and project-wide game regression tests.

**Browser interaction checks:** whole room → all seven focus stops → one level of interaction → return; five drawers at 0/50/100%, switching drawers, same-perspective inspection, door hinge, book slide, paper/typing, zoom and Escape/focus return.

**Accessibility:** keyboard-only object traversal, button parity with raycasting, screen-reader labels/status, reduced-motion, high-zoom layouts, no pointer-only trap, WebGL-off/JS-off fallback, mobile taps without hitbox ambiguity.

**Content and security:** no unapproved or fictional Writing material on public route; no exposed internal fields, remote private feeds or third-party unlicensed assets. Sparse catalogue remains intelligible.

**Hosting:** verify feature branch deployment and exact SHA; after staging merge rerun smoke against `davehub.pages.dev`, confirm GLB/texture download and type, JS module loads without console errors, game/audio routes and release versions unchanged. Allow for Cloudflare deployment race; do not mark a failed smoke as green.

**Evidence for owner:** hosted URLs, before/after images from identical cameras, short movement capture when practical, browser regression summary, mobile screenshot, performance report, approved asset list and rollback SHA.

## 9. Risks and responses

- **Perspective regression:** freeze shared room coordinate/pivots, validate geometry in GLB round-trip, compare closed/mid/open and all camera stops before textured approval.
- **Visual inconsistency:** approve one art bible and shared materials, not independent AI-prop images. Hero assets come from coherent geometry first.
- **Assets too heavy:** stage loader, optimise texture/mesh budgets, profile realistic devices; retain a 2D/accessibility fallback rather than forcing WebGL.
- **Modelling/export friction:** use deterministic first-party Blender scripts/headless CI where possible; validate toolchain on one cabinet before expanding. Do not force local owner commands.
- **Broken browser interactions:** keep pure state logic, one input/action model with DOM parity, object selection proxies and camera bounds, then run hosted browser checks.
- **Private publication leakage:** only validated approved records reach the 3D content adapter; no manual metadata injection, prototype examples or raw repo scanning at runtime.
- **Overbuilding:** prioritise cabinet/desk and essential seven stops; move other worlds and sophisticated physics to later milestones.
- **Accidental release:** staging feature previews and reversible route flag only; production launch separately approved.

## 10. Immediate next executable work package

**DH-11C.3A: art direction and asset-audit kickoff**, without making or merging visual changes to the current Writing world.

- Snapshot the existing DH-11C.2 scene from all focus stops, record geometry and camera coordinates, and inventory visible/interactable meshes.
- Specify two or three coherent material/lighting directions **on the same model/camera** for review, including a restrained variant aligning with the approved floating-islands art. Concept references must not dictate incompatible geometry.
- Draft `DH11C3_ART_BIBLE.md`, a P0/P1/P2 asset inventory and initial GLB node/pivot contract.
- Choose the cabinet as the representative production model for the first geometry/export proof.
- Present the fixed-camera visual reference and material board for explicit owner approval **before** extensive Blender modelling/texturing.

**No changes to `/worlds/writing/`, public catalogue, the games or `davehub.co.uk` are authorised by this planning document.**

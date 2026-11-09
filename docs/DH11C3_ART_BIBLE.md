# DH-11C.3 Art Bible, draft A: The Manuscript Hoard

**Work package:** DH-11C.3A, opened 31 October 2026  
**Status:** Candidate art direction, NOT owner-approved production design.  
**Scene reference:** [The live DH-11C.2 geometry prototype](https://davehub.pages.dev/previews/dh-11c/room/) and [the same-geometry art-direction laboratory](https://davehub.pages.dev/previews/dh-11c/art-lab/) once staged.  
**Governing rule:** [ADR-0012](DECISIONS/ADR-0012.md): build real geometry before artwork. The three variants alter only the colours of existing materials and lights.

## 1. Creative premise

The Manuscript Hoard is a physical embodiment of an unusually busy writing imagination: a comfortable, slightly impossible study where finished pieces, draft manuscripts, fragments and strange notes exist as discoverable objects. It should feel **occupied by a writer**, not organised for customers. The decor suggests accumulated stories, playful curiosity, warm light, rich paper and an unexpected view into the greater DaveHub universe.

**Desired emotional sequence:** arriving feels intriguing and welcoming; approaching the desk feels intimate; opening a drawer creates physical anticipation; examining a manuscript is calm and readable; looking through the window reconnects the room to the floating islands.

**Shape language:** readable, substantial silhouettes; slightly exaggerated but believable furniture proportions; soft corners and old-used edges; nonphotoreal surfaces; original ornamentation applied to models, not separate inconsistent scene images. Cabinet labels and handles should be identifiable before the viewer clicks.

**Avoid:** photorealism, low-contrast dark mush, random gears, unrelated ornate Victorian assets, Monty Python/Gilliam photo collage, patchwork AI screenshots, painted perspective geometry, HUD-like card grids as the primary room interface.

## 2. Three art directions, compared on exactly one model

The prototype art lab changes **only** existing Three.js material colours, scene background/fog, light tint/intensity and exposure. No geometry, object state, camera position, interaction or image changes are permitted between modes. These are preliminary **flat colour/light studies**, not proof of finished texture quality.

### Candidate A: Amber & Ink (recommended starting point)

- **Narrative:** an eccentric writing den at dusk, amber desk illumination against teal metal and cool hints from the islands.
- **Hero colours:** weathered teal cabinet `#4F7374`; warm timber `#84664B`; dark wood `#453642`; aged brass `#D5AB70`; parchment `#EAD6AE`; muted aubergine/rug `#684854`.
- **Background:** `#211A28`; plaster `#716772`; island/window sky `#728DAB`.
- **Materials:** wood with painted broad-grain variation, worn edges rather than heavy damage; gently distressed enamel; brushed golden hardware; subtly fibrous paper; textile rug.
- **Lighting:** warm focused desk lamp, readable ambient fill, restrained cooler window spill.
- **Pros:** links to earlier manuscript-room mood, readable cabinet as focal object, distinctive warmth and mystery.
- **Risks:** overly dark edges, accidental default steampunk look if brass ornament is overused. Keep ornament intentional and original.

### Candidate B: Moonlit Archive (alternative)

- **Narrative:** midnight, slightly magical, secret library.
- **Colours:** indigo backdrop `#111D30`, blue-metal cabinet `#456D7E`, muted timber `#5B5966`, pale brass `#B5AE91`, cool paper `#D4D6C1`, rug `#404963`.
- **Lighting:** cooler scene/water-coloured window emphasis, smaller warm pool near desk.
- **Pros:** magic and window look dramatic.
- **Risks:** manuscript legibility and room warmth; requires measured high-contrast interactive accents.

### Candidate C: Golden Storybook (alternative)

- **Narrative:** sunlit impossible study, friendly and more playful.
- **Colours:** brown dusk backdrop `#44312C`, sage cabinet `#718F86`, honeywood `#AB8059`, golden hardware `#DAB476`, cream pages `#FFF0C9`, rug `#966E70`.
- **Lighting:** diffuse gold daylight with lower relative lamp contrast.
- **Pros:** welcoming, responsive to small-screen viewing.
- **Risks:** can become generic cosy cottage; preserve strange details and stagecraft.

**Decision needed:** select one as baseline, reject/revise colours, and confirm desired brightness. This document does **not** grant implicit approval to move into full texturing or public launch.

## 3. Material families and minimum visual requirements

| Surface | Base direction | Detail to model/texture | What not to do |
|---|---|---|---|
| Cabinet | Patinated painted teal metal | Real seams, brass handles, brushed wear at contacted edges | Photo of a cabinet glued onto a model |
| Drawer interiors | Warm lined wood + muted metal | Real bottom/sidewall geometry, folder rails, shadows | Independently generated open drawer |
| Brass | Warm, subdued golden metal | Edge glints from material properties | Uniform saturated yellow over every surface |
| Desk/bookshelves | Mixed warm walnut, oak and worn paint | Coherent grain directions and joints | Texture stretching across UV islands |
| Manuscripts | Warm parchment | Paper-edge thickness, slight imperfections, readable printed labels | Repeated AI-generated pseudo-writing |
| Book covers | Fabric/leather/paper | Reusable spines, varying heights within one palette | Real copyrighted jacket art without rights |
| Wall/plaster | Warm/cool textured base | Gentle large-scale mottling, limited wear | Busy wallpaper fighting focal objects |
| Rug | Muted worn textile | Simplified original pattern with consistent UV scale | A photoreal carpet photograph |
| Window/sky | Cool floating-island atmosphere | Real frame opening and true exterior geometry/light | Image plane pasted on a solid wall |
| Typewriter | Coloured enamel, iron, worn keys | Key caps, carriage, platen, paper as independent parts | Decorative fake keys that cannot move |
| Lamp | Brushed metal + shade | Plausible light emission/pool alignment | Light source visibly disconnected from model |

**Material workflow:** use GLB-ready UVs and stable slots; begin with base colour/roughness; add normal and AO only where they improve readability at actual camera distances. Keep sRGB base-colour and linear data maps correct. Limit materials and texture sets by real performance measurements. Add decorative decals as flat surfaces attached to their own model, not as perspective stand-ins for moving geometry.

## 4. Room composition and camera language

The existing seven focus targets in `prototypes/dh-11c-room/room-plan.js` are the canonical baseline. **Do not relocate the furniture or change camera vectors in an art-only PR.** A camera change needs a separate scene-layout review and tests.

- **Overview:** reveal desk centrally, cabinet on left, shelves on right, mysterious window in back wall; ensure the door is discoverable.
- **Desk:** papers, lamp and typewriter must be distinguishable; the table surface is the reading stage, not an overlay of generic cards.
- **Cabinet:** drawer labels and sliding depth clearly visible; maximise reliable selection, avoid any fake interior; focus view should expose sidewalls of extended drawers.
- **Bookcase:** shelves and individually pullable books readable, avoid inaccessible top shelf or focus camera clipping.
- **Typewriter:** keys/roller/paper visible within the desk context; clear visual response to a press.
- **Bin:** reveal that rummaging changes paper in the bin, not merely updates a panel.
- **Window:** show islands physically behind a proper window opening.
- **Door:** show actual free doorway area and hinge clearance, never rotate a door into an intact solid wall.

**Camera approval required at three aspect categories:** desktop 16:9, mobile portrait approx 9:16, and mobile landscape. Maintain one controlled camera and sensible mobile adjustment of FOV/frame, not independent object-perspective drawings. See [C3A source audit](DH11C3A_SCENE_AUDIT.md).

## 5. Hero-object forms

**Cabinet (P0, first production GLB):** tall weathered painted body, five clear labelled drawers, brass label holders and handles, actual dark voids behind the fronts, sliding trays and rails. Consider subtle asymmetry in ornament/wear without changing five aligned apertures. Folder tabs remain neutral until an approved work exists.

**Desk (P0):** deep tabletop, substantial legs, real surface space for manuscript examination. Arrange one central paper pile, sparse ink and writing props, and a lamp whose light agrees with the scene. Typewriter sits adjacent, visibly operable.

**Bookcase (P0):** sturdy old shelves and books of varying heights, muted cover hues, at least one convincingly extractable book.

**Typewriter (P1 polish):** compact mechanical shape, readable keyboard, moving keys/roller, real paper.

**Window/door (P0):** convincingly cut openings in the room shell. The doorway has a real hinged leaf; the window looks towards the actual floating DaveHub world, not a second unrelated scenic camera.

## 6. Lighting and atmosphere, to approve after materials

Use strong directional storytelling rather than lots of expensive dynamic sources. Primary draft: soft ambient from the room, warm practical desk-lamp pool, cooler diffuse window glow. Focal shadows should help show drawer depth and cabinet shelves. Dust and island drift should be low-volume, pausable and disabled or simplified for reduced motion. High contrast readability takes priority over cinema effects.

The art lab shows **no textured materials, shadows or final atmosphere**. It is only a controlled palette exercise. Approval of its palette does not equate to acceptance of the future textured models.

## 7. Explicit review checkpoints

1. Review the same geometry in all three palette treatments, from room overview and at least the cabinet, desk and window focus stops.
2. Decide A/B/C or describe a merged direction; record preferred brightness, cabinet patina, wood warmth and window contrast.
3. Confirm the cabinet remains the first production GLB vertical slice.
4. Approve (or revise) this art bible, scene audit, asset inventory and modelling/export contract.
5. Only then proceed to DH-11C.4 modelling. Never silently treat these proposed styles as a locked art asset.

## 8. Provenance and status

All listed palette hex values and material intents are **first-party design proposals** authored for DaveHub. They are not copied textures, licensed third-party models or artist references. The 3D comparison operates on existing first-party code and the pinned, MIT-licensed Three.js runtime. No model textures have yet been created or approved.

**Next action after this PR:** owner visually assesses the Cloudflare material lab and gives the preferred direction. Source audit acceptance and visual style approval remain separate gates.

# DaveHub development roadmap

**DH-11C Writing Room, complete and owner-approved:** All physical interactions through DH-11C.6E.1 were selectively promoted to GitHub `main` via PR #114 on 8 November 2026. The Writing Room is now frozen for new functionality until approved real content can replace fictional demonstrations. No production custom-domain launch has occurred.

## DH-12A.3 — Three living miniature stage sets

Develop the first prototype into a characterful miniature theatre without changing the approved close-up camera or main mechanical movements. Each original physical set becomes a distinct sculpted world: **The Clockwork Chorus** with moving birds and gears; **The Theatre Within** with hinged flats and a rising skyline; and **The Marionette Assembly** with jointed wooden performers. A visitor can click a real physical prop or use **Bring the set to life**, then let it settle before revolving to another scene. Add actual ropes, pulleys, footlights and balconies, and change real stage lighting for each act. [Geometry and interaction contract](DH12A3_LIVING_STAGE_SETS.md). Staging-only review, no real audio or unpublished work.

## DH-12A.2 — Move into each theatre mechanism

Owner review: the first mechanical theatre is a promising start, but the camera should move **into** selected objects as it does in the Writing Room. Keep real curtain, revolving-stage and record-player movement. Add one interpolated, responsive camera with separate focus poses; clicking any actual mechanism or matching native control approaches it and operates it. A small Whole theatre action, Escape and clicking empty scenery return to the overview without resetting objects. The existing Music page is unchanged; this remains an isolated staging preview. [Design and acceptance](DH12A2_CAMERA_APPROACH.md).

## DH-12A.1 — The Impossible Theatre, Music world geometry-first concept

The next distinct DaveHub space is **Music / The Listening Room**. Start with an isolated **`/previews/dh-12a/listening-room/`** prototype: an eccentric miniature theatre with actual sliding cloth curtains, a single rotating stage showing three physical sets, and a rotating grooved record with its own moving tonearm. No audio or unpublished content. Native buttons and 3D click/touch affordances must operate the same mechanical state. Do not replace `/worlds/music/` until owner review. [Architecture, mechanics and review gate](DH12A_IMPOSSIBLE_THEATRE.md).


**Updated:** 8 November 2026. **Current stage:** DH-11C.6B.2 floating contextual prompts and compact Eleanor jacket (staging-only). Prior stage: DH-11C.6B finished-book product pages, after approved DH-11C.6A.2 dark window preload., after approved click-to-overview navigation. Previous stage: DH-11C.6A.1 click-empty-scene to leave an object view, building on the accepted minimal Writing interface, after accepting the 3D Manuscript Hoard core and the direct Writing island route. A separate review version preserves the original room and earlier art passes. C5A desk materials and C4 mechanics owner-approved; C5B accepted as a promising first pass. Published Writing and production remain unchanged.

## DH-11C.6E.1 — Immediate uncrumple action in the scrap view

Fix owner-observed problem: the crumpled paper reading dialog conceals its Unfold control below the visible viewport. Make the illustrated paper itself a semantic clickable button, place a prominent **Uncrumple paper** button right beneath it in the initial viewport, and use a viewport-fitted dialog with a scrollable reading area and retained footer controls. Both triggers use the identical existing unfold method. No content, geometry, drawer, other room or production changes. [Defect and test contract](DH11C6E1_VISIBLE_UNCRUMPLE.md). Staging-only, owner visual approval pending.

## DH-11C.6E — Wastepaper bin of ridiculous rejected ideas

Turn the existing nine individually animated 3D crumples into an eccentric, public-safe experience without changing their reversible paths. Click a physical paper or rummage by an accessible control; it visibly tumbles over the bin rim and lands, and only after the real movement and camera settle can the visitor unfold the recovered scrap. Nine unique **explicitly fictional** absurd premises have hidden rejection reasons on the back. Leave the crumple on the floor, reread it, or throw it back via the real reversed arc. Responsive native dialog and reduced-motion support preserve the room-first design. No actual unpublished scraps are revealed. [Behaviour and staging review](DH11C6E_WASTEPAPER_BIN.md). Owner visual review pending.

## DH-11C.6D.4 — Look down into an opened filing drawer

User review found that the original front-facing cabinet camera hides 3D folders in the top drawers, making only the lower two practical to click. Keep real opening animations for all five drawers; after the actual drawer and camera finish moving, show a top-down illustrated wooden tray with four large, accessible file selections. Choosing a file animates that same physical folder before its reader opens; closing a file returns the folder and restores the overhead tray. Escape, return to the 3D scene, drawer close and changing focus remain distinct actions. Public-safe content and the approved real model are unchanged. [Interaction and acceptance criteria](DH11C6D4_OVERHEAD_DRAWER.md). Staging only, owner visual approval pending.

## DH-11C.6D.1–3 — Living filing cabinet: real folders, animated extraction, shared archive

The existing Blender-validated 3D five-drawer cabinet remains untouched. Each drawer's four original folder meshes gains a physical raised tab and binding colours. A selected folder lifts out within the same moving drawer and only then opens an illustrated native folder reader; closing returns the folder. The Finished drawer links three existing published books to their real shelf. The Drafts drawer links only explicitly fictional manuscript samples back to the desk, while other drawers contain clearly labelled invented archive demonstrations. Keyboard, touch, reduced-motion, cancellation and original scene animations remain functional. [Interaction, geometry and content contract](DH11C6D_LIVING_ARCHIVE.md). Staging-only pending owner visual approval.

## DH-11C.6C.2 — Let the furniture finish moving before opening a reader

Preserve the click-to-explore experience while restoring the real 3D interactions. A selected paper or published book completes its physical movement, the shared camera settles, and a short completed-pose hold appears before opening its reader/detail dialog. In-flight interactions are cancellable; focus changes never open stale overlays. Typewriter keys remain directly clickable and now support keyboard input without interrupting the mechanism; the creative workshop remains under **Explore further**. Staging only. [Design and test contract](DH11C6C2_MOTION_FIRST.md).

## DH-11C.6C.1 — Manuscript reader and typewriter workshop

Create two distinct experiences attached to genuine room furniture. The desk's individually moving 3D paper sheets open a folio-style, multi-page reader with clearly marked fictional samples; the typewriter opens a temporary creative writing workshop with prompts, typing, copy and clear controls. These work alongside the finished-books overlay without publishing unfinished manuscripts or saving visitor text. [Scope, safety and acceptance](DH11C6C1_MANUSCRIPT_READER_TYPEWRITER.md). Staging-only feature awaiting hosted tests and owner review.

## DH-11C.6B.3 — Published-colour spines with separate gold selection outline

Replace the three turquoise visitor books with edition-inspired binding colours, using a fine gold frame and seal on the *actual* pull-out meshes to identify clickable publications. The finished-book detail panels and the eight-book art preview remain unchanged. Search connected Drive and retailers for Eleanor's original published cover; retain the existing fallback until a verified cover is available. [Scope and verification](DH11C6B3_REAL_BOOK_SPINES.md). Staging only.

## DH-11C.6B.2 — Floating prompts, unchanged scene size and compact Eleanor jacket

Fix 6B.1 user feedback: return to a **full-height interactive 3D viewport** at every screen size and float small contextual prompts alongside the selected furniture, never in a black footer band. Make the text-only Eleanor fallback small enough not to stretch its book detail overlay. Earlier artistic previews and production unchanged. [Behaviour and acceptance](DH11C6B2_FLOATING_PROMPTS.md).

## DH-11C.6B.1 — Accessible book details and prompts that don't cover the furniture

After the first three-book edition overlay review, expand/compact the product page to keep covers, metadata and buying links above the fold on ordinary screens. Move the three highlighted 3D books to the **top shelf**, evenly spaced, and side-dock contextual prompts away from all selected objects. 6B.1 briefly reserved a strip below the 3D canvas on narrow/short viewports; 6B.2 removes that experiment and replaces it with a small floating in-scene prompt. This remains staging-only and requires visual approval. [Scope and tests](DH11C6B1_LAYOUT_POLISH.md).

## DH-11C.6B — Finished bookcase: pull a book, explore its published edition

The Writing Room's visual and interaction core is merged separately into main. The next staged experience connects three actual published books to the real 3D pull-out shelf: **The Legend of the Stormrider**, **The Duck Bread Baker**, and **Eleanor and the Mystery of the Missing Stones**. A pulled volume opens an accessible edition page with genuine cover where verified, description, year, ISBN, publisher and retailer/purchase links. Other manuscript/book titles remain decorative; no unpublished texts are accidentally sold. Follow-up **DH-11C.6C** will design a distinct text/work viewer for desk, typewriter and filing cabinet content, once sharing is approved. [Scope and review gate](DH11C6B_FINISHED_BOOKS.md).

## DH-11C.6A.2 — Dark window until the illustrated islands are ready

Fix a cold-loading visual flash: the canonical Writing room now opens with a dark, unlit window until its homepage-inspired illustrated scenery texture has completely downloaded. Suppress the old low-poly islands in both initial procedural furniture and actual GLB loading, and keep the window dark if the image fails. Earlier comparison previews retain their reversible original view. No published catalogue, interaction or production changes. [Implementation and review gate](DH11C6A2_DARK_WINDOW_PRELOAD.md).

## DH-11C.6A.1 — Click scenery to return to the whole room

In the canonical staging Writing room, a click on empty wall, floor or background while inspecting an object immediately returns to the overview camera and closes the object UI. Existing click/touch interactions, drag rejection, accessible Room button, two-click door exit and old comparison previews remain unchanged. [Behaviour contract and testing](DH11C6A1_BACKGROUND_CLICK.md). No production or catalogue changes.

## DH-11C.6A — Minimal, room-first immersive interface

Replace the large permanently visible Writing room inspector with a small per-object prompt which only appears after focus. Reuse the exact approved homepage DaveHub logo, label the home link “Back”, hide prominent scene ribbons and permanent menu boxes, and offer “Explore further” to reveal the existing controls only when requested. Retain the real 3D interaction and accessible keyboard/touch object menu, with the two-click exit unaffected. Canonical staging route remains `/worlds/writing/`, production remains unchanged. [Full scope and acceptance criteria](DH11C6A_MINIMAL_IMMERSIVE_UI.md).

**DH-11C.6B (next):** Design the richer, bespoke full-object experiences one at a time, beginning with the bookcase. Do not imply the 6A temporary control panel is the final full experience.

## DH-11C.5D.3J — Writing island opens the real 3D Manuscript Hoard

Replace the old staging Writing landing page at the existing `/worlds/writing/` route with the approved V8 physical room. The homepage island already links there, so no navigation detour or preview URL is needed. Serve the WebGL room and its dependent assets from independent Writing-world paths, hide development-only controls, retain accessible exploration, and keep the functioning two-click door exit back to DaveHub. The retired 2D page remains only as source/archived prototype code, not navigable staging content. [Implementation and acceptance gate](DH11C5D3J_DIRECT_WRITING_WORLD.md). No production or `main` change.

## DH-11C.5D.3I — Click open, click again to leave the Manuscript Hoard

A separate V8 staging candidate adds a real, usable exit to the approved Writing room study: the first scene click opens the hinged door immediately, and the second click on the open doorway returns to the same-origin DaveHub homepage. A 3D opening-sized raycast target remains behind the moving leaf, while accessible button controls use the same two-action flow. The existing GLB, V7 artwork and earlier previews are preserved. [Implementation details and review gate](DH11C5D3I_EXIT_DOOR.md). Pending hosted/owner review; no published Writing or production changes.

## DH-11C.5D.3H — Grounded lamp, filled basket and celestial rug

The owner accepted V6 and requested a further focused 3D polish slice. This isolated V7 view corrects the lamp's physically sunken base against the actual desk height, adds a 3D hollow basket with twelve interior crumples while keeping all nine independently interactive overflowing pieces, and replaces the rug's large repeating loops with a restrained plum/gold celestial-chart textile on the real rug surface. The previous room, camera, window, writing and project identity remain unchanged. [Work package and review gate](DH11C5D3H_MYSTICAL_ROOM_PROPS.md). Pending visual/mobile approval.

## DH-11C.5D.3G — Authored interactive books, clean spine lettering and handwriting

Separate V6 review candidate removes the old central ornament relief obscuring book titles and suppresses duplicate typed-looking lines over the 14 loose desk/file papers. The eight pull-out books show candidate actual authored writing/creative work names; the typewriter page remains typed. Five smaller, hand-drawn parchment label textures replace the overbold cabinet labels. The approved V5 window and all working geometry are unchanged. [Scope, candidate titles and approval gate](DH11C5D3G_AUTHORED_HANDWRITING.md). No publication or production changes.

## DH-11C.5D.3F — Window fit, readable book titles and chaotic fountain pen

A new separate, real-3D V5 study corrects the floating-island window by fitting artwork into four actual panes with cloud-only depth layers and fully suppressing the old GLB islands. The five filing-cabinet labels are larger, darker and bold enough for overview readability; all 80 actual books get distinctive fictional joke titles on their individual moving spines; and the 15 visible manuscript surfaces get messy crossed-out ink. Full scope and acceptance gate: [DH11C5D3F_READABLE_HOARD](DH11C5D3F_READABLE_HOARD.md). Original GLB pivots and published Writing remain unchanged. Pending visual approval.

## DH-11C.5D.3E — Authored room detail pass

Isolated V4 staging preview with a layered homepage-inspired floating-island window scene, much finer material marks, individual art for 80 real book meshes and 24 manuscript objects, a cleaner desk without its cup, and larger quill-style filing-cabinet labels. Furniture pivots, click targets, earlier previews, published Writing and production remain unchanged. [Work package and review gate](DH11C5D3E_AUTHORED_DETAILS.md). Awaiting visual and mobile performance review.

## DH-11C.5D.3D — Sculpted bookcase geometry and surface detail

Created a separate working 3D artwork variant with actual crown, upright, shelf and book ornaments positioned from canonical GLB mesh bounds. The pieces inherit the original model coordinate system and are expressly excluded from click selection. The source room, furniture motion, camera plan, previous V2 art and published Writing page are unchanged. [Technical scope and approval gate](DH11C5D3D_SCULPTED_BOOKCASE.md). Awaiting visual owner review.

## DH-11C.5D.3C — Individual book-spine art refinement

The second real-3D artwork preview adds four deterministic UV-painted spine emblems distributed across the existing 80 physical book meshes, with four reusable texture variants per binding-map family. This is a separate candidate at `/previews/dh-11c/authored-3d-v2/`; the initial 5D.3B preview, camera guides, approved geometry, interactions and published Writing remain unchanged. [Scope and review gate](DH11C5D3C_BOOK_SPINE_ART.md). Visual acceptance remains pending.

## Design baseline

- Three reference images are **locked**, with **Concept 1 as the owner's favourite and lead**.
- Concept 2 informs category portals; Concept 3 informs the observatory and interactive controls.
- The approved DaveHub logo is locked as an unchanged transparent PNG under `assets/branding/`; the exact-appearance SVG wrapper is approved. The distorted vector trace is discarded; no separate vector redraw is currently required.
- The text-free floating-islands homepage background is separately approved in `assets/homepage/` as PNG plus exact-appearance SVG wrapper; it is not genuine vector art.
- The main site is navigated through clickable destinations / scene transitions, **not** a walking avatar.
- A prominent **"I want to view this as a menu coz I'm boring"** link opens a deliberately basic **1990s-style HTML interface**.
- Both views share one approved project catalogue, stable routes and deep links.
- See [reference gallery](LOCKED_CONCEPTS.md), [visual direction](VISUAL_DIRECTION.md) and [retro menu brief](BORING_MENU.md).

| Work package | Deliverable | Exit criteria | Status |
|---|---|---|---|
| DH-00A–C | Original project foundation | Brief, repo, safety constraints and roadmap | Complete |
| DH-01L | Lock initial three design references | Original images in GitHub and Google Drive; decision notes updated | Complete |
| DH-01M | Lock primary DaveHub wordmark | Approved transparent PNG and ADR in GitHub; backup in Google Drive | Complete |
| DH-01N | Lock floating-islands homepage background | Approved original PNG, faithful SVG wrapper, Drive backup and usage rules | Complete |
| DH-01A | Refine Concept 1 homepage | Floating destination world and real HTML/CSS interactions built; illustrated Dave remains next | First-look complete; hosted review next |
| DH-01B | Refine category portals | Concept 2-derived destinations and clear navigation | Planned |
| DH-01C | Refine observatory details | Concept 3-derived interfaces, index integration and discoverable interactions | Planned |
| DH-01D | Basic HTML menu-mode design | Literal 1990s HTML appearance and functional accessible navigation | Planned |
| DH-02A | Click-to-explore homepage prototype | Initial Explore and category interactions work; illustrated Dave and real approved project destinations still pending | Partial; hosting setup next |
| DH-02B | Retro HTML-mode prototype | Basic HTML navigation; switch both ways; shared content | Not started |
| DH-02C | Responsive/navigation test | Full-viewport scene and bottom navigation visible across desktop, laptop, mobile and compact landscape; interaction regression tested | Implemented in review |
| DH-03A | Production shell | Host-flexible build and performant shared content model | Not started |
| DH-03B | Content and editorial system | Project catalogue, devlogs, search, deep links, archive | Not started |
| DH-04A | First public-safe projects | At least three approved projects showcased or linked | **Complete — three approved text/link listings published; Cloudflare verified 28 Oct 2026 15:14 UTC** |
| DH-05A | Human-reviewed content drafts | Safe workflow for proposed updates | Not started |
| DH-05B | Deployment and launch | Cloudflare Pages used for previews; public domain/DNS, TLS and monitoring still pending | Preview reported live; launch pending |
| DH-06A | Giant Dave key poses and motion personality | Four coherent poses approved by owner on 22 October 2026; visual baseline locked | **Complete** |
| DH-06B | Giant Dave motion investigations | Local sprite/optical-flow and joint-versus-magic studies documented in draft PR #9; natural articulation selected over everyday morphing | Studies performed; prototype evidence remains draft |
| DH-06C1 | Giant Dave production layered art + rig | [Exact asset inventory and rig contract](GIANT_DAVE_LAYERED_RIG_SPEC.md) committed: source masters, 29 P0 image layers/variants, pivots, anatomy, animation states and test gates | **Spec complete; painted assets next** |
| DH-06C | Giant Dave homepage integration | Independent character layer; responsive crop, static fallback, reduced-motion, no lost navigation | Planned |
| DH-07 | Content inventory and information architecture | Typed catalogue, cross-category views, stories, timelines, media and source/rights inventory agreed | **In progress** |
| DH-07A | External published works and creative-history inventory | First nine nominated candidates staged privately; safe generic architecture notes committed; more historic work to come | **Discovery started; candidate publication approval pending** |
| DH-07B | Unfinished Shelf and musical pages | Composite musical record/child artifacts and deliberately shelved writing/project archive; templates specified | **Architecture drafted; visual prototype next** |
| DH-07C | Responsive page and navigation prototypes | Working fictional Unfinished Shelf (search/filter/detail) and composite musical (story/song/script links); desktop/mobile browser tests | **Built on review branch; visual approval pending** |
| DH-07D | Cross-world discovery navigation | Keep the four floating-island destination links, **remove duplicate bottom menu**, expand Explore into worlds plus Music, Unfinished and Memory Lane, with functional prototype routes | **Revised on review branch; final browser/visual approval pending** |
| DH-07E | Interim Giant Dave and mystical Explore | Place one transparent static Dave in animation slot; make Explore a luminous portal using approved background art | **Built on preview branch; visual approval pending** |
| DH-08A | Safe public catalogue and approval validation | Plain JSON canonical work model, fail-closed approval/rights checks, tests, fictional preview; zero owner works published | **Implemented on draft branch, testing/sign-off pending** |
| DH-08D | First owner-approved public creations | Publish Unicorn Valley, Stephen Martin and Tame The Board Game in the canonical catalogue and normal worlds; Play/Visit links to existing sites; no media republishing | **Merged PR #32 (`fe8872a`); 88 site tests + 11 scanner checks passed; all three external URLs HTTP 200; eight live Cloudflare routes verified at 15:14 UTC** |
| DH-08C6 | Restore styled staging review pages and verify real Cloudflare HTTP | World/creation HTML embeds first-party CSS; empty staging worlds embed review navigation; GitHub Actions probes the actual Cloudflare endpoint | **Merged PR #31 (`95bd1b2`); 88 site tests pass; real Cloudflare HTTP smoke #40711727210 passed at 15:03 UTC after six stale checks; styled live HTML, staging routing and review cards verified; owner visual check pending** |
| DH-08C5 | Staging review navigation integration | Normal staging `/worlds/` routes link to three design-only project previews when canonical catalogue empty; non-staging and future live are unchanged | **Merged PR #30 (`b0b3040`); 88 site tests and 11 discovery tests pass; owner Cloudflare visual verification pending** |
| DH-08C4 | Cloudflare-first visual review | Twelve static layout-only preview pages under `/previews/dh-08c/`; three public project names only, placeholder copy, no draft links/media; browser QA on staging | **Merged PR #29 (`3c92061`); GitHub CI 83 site tests + 11 scanner tests passed, 12 pages rendered with no unapproved copy; Cloudflare HTTP confirmation and owner visual review pending** |
| DH-08C | Owner-controlled first-wave Content Workshop | Seed three review-only creative records; import DH-10 candidates; preview actual site templates locally; preserve empty deployed catalogue until owner approval | **Review work completed; three entries subsequently explicitly approved and published in DH-08D. Workshop remains optional for future candidates** |
| DH-08B | Render approved catalogue into actual site | Seven themed world pages, shared musical/detail templates and direct homepage/island navigation; first-wave approved catalogue now populated | **Shared page renderer live with owner-approved first-wave creations; verified in DH-08D deployment** |
| DH-08 | DaveHub Ready publication contract | Explicit approved project onboarding, source collection, draft review, provenance, withdrawal and security gates | Planned after DH-07 |
| DH-09 | Single-project ingestion pilot | One approved creative game becomes a project page + reviewed update through preview/merge | Planned |
| DH-09A/B | Same-origin first game routes | Pinned compiled Unicorn Valley build and restricted Stephen Martin public-origin proxy under identical `/games/...` paths; save isolation and Cloudflare HTTP gates | **PR #33 merged (`2f4e795`), Node/CI fix PR #34 merged (`f57be85`); live Cloudflare HTTP smoke #40719683462 passed 15:48 GMT for both games plus JS/CSS/audio/image; gameplay/save QA still pending** |
| DH-09A–C | First-party games | Independently built game releases staged as `/games/<slug>/` under the DaveHub Pages output; real game deployment/QA still required | Design and packaging foundation on draft PR #22 |
| DH-09E | Automatic game updates to staging only | Hourly exact-head Unicorn Valley CI check; full pinned build, SHA marker, Cloudflare HTTP gate; Stephen public-origin proxy follows upstream deploys; never auto-promote custom-domain live | **COMPLETE on staging — PRs #35–#43 merged; GitHub bot rebuilt and advanced release `main-ci-40093204337`; Cloudflare exact SHA/version and both games verified in #40728639308; no-op health check passed #40729189306. Live-domain promotion remains disabled.** |
| DH-09D | Production-domain cutover, permanent staging | Preserve `davehub.pages.dev` for testing; separate live Pages project on `main` serves `davehub.co.uk`, with explicit owner-led promotions | **Phase A complete; Phase B activation staged. Default-main auto-updater frozen by PR #45 while `staging` prepares an independent Pages production-branch candidate. Existing Cloudflare Pages still points to `main`; no custom domain connected.** |
| DH-10A | DaveHub Ready repository manifests | Root `davehub.json`, validated metadata, categories and opt-in/opt-out semantics | **Merged to main; three source opt-ins merged, Unicorn Valley #338 awaiting final CI** |
| DH-10B | Read-only repository discovery | Public-only scanner, weekly/manual GitHub Actions report, candidate review queue | **Merged and verified; 11 scanner tests and 42 site regressions passed; live scan found 3 candidates with 0 errors. Content Workshop integration next** |
| DH-10D | Default-off new repository bootstrap | New repositories created through a safe GitHub CLI helper start with `davehub.json` disabled in the first commit; scheduled discovery flags missing markers on new public repos | **Merged PR #25 (`1a2285a`); validated GitHub CLI helper and default-off marker; public-repo audit, with private external-creation limitation documented** |
| DH-10C | Hosted editorial integration | Public-safe discovery queue at `/review/`; owner-only GitHub Actions publication/revision/withdrawal proposals; staging PR and catalogue validation, no automatic merge | **Foundation deployed on staging: PR #48 hosted `/review/` and validated owner-only proposal workflow; PR #49 registered Run workflow on default GitHub branch; PR #50 added deployed-route smoke. Live Cloudflare HTTP checks #41120428437 passed for `/review/`, both game paths and assets. No newly approved publishing candidate has been nominated; next action is workflow testing against an owner-approved candidate, not automatic publication.** |
| DH-10 | Automated development stories | Significant approved project events become concise draft human-readable stories, not routine posts | Planned |
| DH-11 | Build distinct creative worlds and later extend content types | Theme-specific Writing, Music, Experiments, Unfinished Shelf and Memory Lane rooms from the validated catalogue; public/fictional separation, responsive layouts, no new content approvals | **Layouts implemented for staging review on feature/dh11-creative-world-layouts; browser visual approval and CI required before sign-off.** Later content ingestion remains planned. |
| DH-11C.1 | The Living Filing Cabinet | First fully explorable object inside the Writing island: original layered cabinet art, zoom to cabinet, five physical drawers, folder examination, persisted discoveries, accessible mobile interactions, approved-catalogue isolation | **Geometry-first reset adopted. A separate five-drawer CSS 3D mechanics laboratory is implemented for /previews/dh-11c/cabinet/ with fixed case/drawer depth, camera yaw/pitch controls and scrubbable movement. Full art integration remains blocked until geometry prototype is reviewed and approved; the current Writing room stays unchanged. See [DH11C1_LIVING_FILING_CABINET.md](DH11C1_LIVING_FILING_CABINET.md).** |
| DH-11C.2 | Explore the complete Manuscript Hoard in 3D | One shared WebGL camera/coordinate system, actual 3D room and seven furniture/scene interactions, keyboard/mobile focus navigation, no new publications | **Mechanics prototype implemented, owner liked, staging/Cloudflare checks passed; visual production design and real Writing-world integration still pending.** See [DH11C2_FULL_ROOM_GEOMETRY.md](DH11C2_FULL_ROOM_GEOMETRY.md). |
| DH-11C.3 | Art direction and asset bible | Owner-approved style/material/lighting reference, eight camera views, P0/P1/P2 model inventory and geometry-based concept review | **DH-11C.3A implementation in review: draft art bible, camera/geometry source audit, 21-asset inventory, GLB contract and interactive same-geometry palette lab. Owner visual design approval and screenshot/browser QA still pending.** |
| DH-11C.4 | Production model/export pipeline | Blender/source-master and reproducible GLB export contract, shared metres/pivots, cabinet-first physical rig and complete room geometry validation | **Interactive furniture approved by owner on 1 November 2026:** papers, individual highlighted books, rummaging bin, typewriter platen/feed, level lamp and working on/off switch. Real editable model/GLB and Blender verification pass. Geometry and mechanics frozen as visual baseline; no production promotion. |
| DH-11C.5 | Cohesive textured 3D room | Approved UV/material library, stylised textures/atlases, measured texture budget and correct camera/object readability | **C5A desk materials approved; C5B bookcase/cabinet first pass positively reviewed. DH-11C.5C started:** isolated same-geometry Painterly Storybook treatment (5C.1 system + 5C.2 Variant A) with original-material toggle and selective illustrated shading/contours/lighting. Owner visual acceptance pending; B/C variants not yet built. |
| DH-11C.6 | Lighting, effects and motion polish | Warm/cool cinematic lighting, restrained atmosphere, camera-motion and accessibility/performance evidence | Planned, gated on first textured scene |
| DH-11C.7 | Deep physical interactions and approved manuscript content | Five drawers and folder lift/inspect/return, other object mechanics, deterministic approved-only content adapter and full accessible fallbacks | Planned; no new content approval granted |
| DH-11C.8 | Staging integration and release QA | Cross-browser/mobile QA, cold-load/fps checks, content and game regressions, reversible staging integration and owner approval | Planned; **no production-domain changes** |
| DH-11C.9 | Optional reusable 3D world primitives | Extract proven shared camera/input/loader contracts after Writing v1, without enforcing one generic world style | Later, conditional on C8 approval |

## DH-11C.5D.3B — High-Illustration 3D Art Production (3 November 2026)

Owner clarified the goal: **make the genuine moving 3D Manuscript Hoard itself appear like a polished, richly illustrated environment**; no camera-matched stills, unrelated compositions or flat scene plates should substitute for physical furniture. [DH-11C.5D.3B art contract](DH11C5D3B_AUTHORED_3D_ART.md). First staging slice at `/previews/dh-11c/authored-3d/?v=dh11c5d3b-authored-3d-v1`: purpose-authored CanvasTexture UV artwork for wood, parchment, old bindings, metal, leather and architectural finishes, plus local-geometry ornament strokes on the same animated desk, papers, books, cabinet fronts and door. This approach builds actual 3D surface character, not another post-process shader. Original material identity and light settings are reversible; featured books and lamp mechanism are protected, late-loaded GLBs supported. **Artistic quality not yet owner-approved**; deeper Blender model detail and highly authored texture assets may be required. Earlier plate/painting approaches remain comparison references, production and published Writing unchanged.

## DH-11C.5D.3A — High-Illustration Overview Alignment Bench (3 November 2026)

A new comic-fantasy illustration candidate was generated for art-direction review, but it copied UI and unsupported spatial detail from an earlier reference. **It has not passed the geometry-first acceptance gate and is not embedded over the moving 3D room.** To support an actual review rather than claim a false visual milestone, the staging `/previews/dh-11c/illustrated-overview/?v=dh11c5d3a-align-v1` now compares the existing finished Writing-room key art with the real geometry-locked home camera side-by-side. A separate on-page projected guide locates all seven physical targets from the canonical camera contract. A locally supplied candidate image can be inspected without uploading, storing or adding fake click targets. The substantial final task is still to author a new image against the actual HOME PNG and scene depth, omitting baked-in menu controls and preserving movable furniture. Owner visual approval pending; production unchanged.

## DH-11C.5D — Geometry-locked illustrated-view pipeline (3 November 2026)

The owner rejected further shader tuning as insufficient to reach the high-illustration quality of the DaveHub homepage and prior Writing-room key art, and approved a **fixed-camera illustrated-view pipeline**, preserving the approved 3D room and mechanisms. [Implementation contract](DH11C5D_ILLUSTRATED_VIEW_PIPELINE.md). **DH-11C.5D.1–5D.2 foundation on staging:** machine-readable eight-camera contract derived directly from room-plan.js, desktop/mobile projections for each object anchor and a dedicated real-WebGL structural-reference screenshot + JSON export route `/previews/dh-11c/illustrated-views/?v=dh11c5d-geometry-guides-v1`. Screenshot output is intentionally labelled **structural reference**, not finished illustrated art. Next stages are authoring a high-quality painted overview and desk close-up, then proving geometry-aligned animation without fake 2D state compositing. Published Writing and production remain unchanged; final art and visual acceptance pending.

## DH-11C.5C.3 — Comic Storybook Style Calibration (2 November 2026)

Following the owner-supplied illustrated fantasy-study reference, the next step targets the **art style**, not that image's composition or room layout. This staging-only route uses stronger hand-painted colour blocks, gouache-style hatching, warm gold and cool magical light; it also installs modest **real 3D** environmental dressing (manuscript stacks, abandoned books, ink-marked pinned papers, climbing ivy) around the *unchanged* interactive room. All new props are excluded from selectable targets. It keeps the approved 197 furniture parts and independent Blender cabinet source intact. Toggle **Original materials** to revert all illustration-only dressing and lighting. Compare `/previews/dh-11c/comic-storybook/?v=dh11c5c-comic-storybook-v4` with earlier V3. **This is an art-direction study awaiting visual approval, not a claim that the reference's highly detailed production illustration has already been matched.** No real manuscript content, public-world replacement or production deployment.

## DH-11C.5C.2B — Softened Hand-Drawn Edges (2 November 2026)

The owner confirmed V2 was an improvement but still looked too clean-cut. C5C.2B responds with visual-only, deterministically wobbling ink contour polylines, dry-brush gaps and varied ink strength, replacing rigid vector-like EdgeGeometry lines in an opt-in V3 renderer. Regular paper and book UV textures also gain slightly irregular clipped edges, while original GLB geometry, transforms, raycasting surfaces and interactive meshes are **never mutated**. Featured turquoise books, labels and the working lamp are protected. This extends the prior painted surfaces rather than reworking the approved C5A desk textures or C5B furniture model. V1 and V2 previews remain accessible. The new preview is `/previews/dh-11c/illustrated-v3/?v=dh11c5c-soft-edges-v3`, compared with an Original Materials toggle. **Owner visual approval pending** before pursuing more drastic illustrated silhouette alterations or variants B/C. Production untouched.

## DH-11C.5C — Illustrated Art Style Calibration (1 November 2026)

After positively reviewing the C5B first pass, the owner requested stronger continuity with the animated-illustrated DaveHub homepage and approved a calibration stage **before** further room-wide texturing. [The C5C implementation plan](DH11C5C_ILLUSTRATED_STYLE_CALIBRATION.md) defines 5C.1 shared controls, 5C.2 Painterly Storybook (Variant A), then separate future animated and eccentric variants (5C.3/5C.4) and later convergence (5C.5). Stage A uses the *identical working 3D source geometry, camera and pivots*, plus reversible painted-tone shading, selective ink-coloured geometry outlines and theatrical amber/indigo lighting. The reference switch restores original materials and lights. The first lighting-led experiment remains at `/previews/dh-11c/illustrated/?v=dh11c5c-painterly-v1`; the stronger surface-painting revision is at `/previews/dh-11c/illustrated-v2/?v=dh11c5c-painted-surfaces-v2`, with original/painted comparison. `/previews/dh-11c/furniture/` remains the untouched C5B control. The lamp switch, eight selected books, five drawers, paper mechanics and all click targets remain functional. **The first Variant A review found it looked primarily like a lighting change. DH-11C.5C.2A responds by actually repainting the UV texture pixels into broad, irregular illustrated patches and adding book/page contour work without changing any moving geometry. Owner visual approval still pending. No B/C variants, no published creative text and no live-domain promotion.**

## DH-11C.5B — Textured bookcase and filing-cabinet reference (1 November 2026)

The approved C5A writing desk establishes the visual/material baseline. C5B adds four wood/lining/gilt maps and seven differentiated bookbinding maps to the same authoritative furniture GLB without moving any of its 80 books. The eight interactive turquoise volumes retain their approved bright colour and separate gold bands. The five-drawer filing cabinet remains the **same verified Blender-exported GLB**; its existing named meshes receive eight weathered-enamel, brass, tray, folder and label maps at runtime. The procedural fallback uses the same deterministic texture recipes, retaining all clickable parts, camera stops and drawer/book movements. The standalone staging preview is versioned as `/previews/dh-11c/furniture/?v=dh11c5b-archive-v1`. **Cabinet/bookcase appearance pending owner visual review**; no source manuscript publication or production-domain changes.

## DH-11C.5A — Textured writing-desk reference (1 November 2026)

The owner approved the complete DH-11C.4 mechanical furniture prototype. C5A applies the first **real surface materials to the existing meshes**, not independent pictures or fake moving-state frames. Nine deterministic 192×192 RGBA UV finishes cover the walnut desk, dark timber legs and apron, three parchment variations with faded marks, leather manuscript folder, warm brushed brass, typewriter enamel and a woven shade. The same material generator produces embedded PNGs in the self-contained furniture GLB and Three.js DataTextures in the procedural fallback. The authoring pipeline retains 197 named geometry parts, mesh pivots, lamp switching, paper toggles and all other furniture controls. The staging preview is versioned at `/previews/dh-11c/furniture/?v=dh11c5a-desk-v1`; **desk appearance was approved by the owner on 1 November 2026** and is the visual reference for DH-11C.5B. No publication approval, live Writing-world replacement or production-domain change.

## DH-11C.4F — Editable furniture and moving rigs (1 November 2026)

The six remaining active furniture/object assemblies (desk, bookcase, typewriter, bin, hinged exit door and floating-islands window) now have a **single geometry manifest**, a deterministic glTF export with real triangles, UVs and named interactive pivots, and an isolated fullscreen comparison preview at `/previews/dh-11c/furniture/`. A dedicated headless Blender job imports the full model, saves `manuscript-furniture.blend`, exports GLB and independently validates all parts and moving transforms. The runtime retains the original interactive furniture as a fallback until six validated model roots are ready, then switches the existing animation references to the GLB parts. **No final materials, published-content changes or production promotion.** See [C4F furniture contract](DH11C4F_INTERACTIVE_FURNITURE.md).

## DH-11C.4E — Editable Blender architecture and full-room GLB (1 November 2026)

Extract the room shell from procedural-only JS into a single named architectural asset source. Export a deterministic glTF/GLB with real segmented wall openings, planks, beams, rug and corridor; use headless Blender to save an editable room-shell master and re-export a validated GLB. A separate **full-screen preview** at `/previews/dh-11c/room-shell/` loads the source GLB and keeps the cabinet, object controls and camera interactions unchanged. Geometry and Blender export require GitHub Actions validation; final runtime adoption of the Blender re-export and visual style still require separate owner approval. See [DH11C4E_BLENDER_ROOM_ARCHITECTURE.md](DH11C4E_BLENDER_ROOM_ARCHITECTURE.md).

## DH-11C.4D — One-screen immersive room layout (1 November 2026)

The architectural model now has a **full-viewport staging presentation** under `/previews/dh-11c/architecture/`, addressing owner feedback from laptop screenshots. Canvas and camera fill the browser window, branding overlays the top, `Whole room` stays in the bottom-right, and object actions are on-screen instead of causing document scroll. Seven object controls and temporary prototype scrubbers remain inside native, independently scrollable disclosure panels. All coordinates, models, camera animation and Blender hashes remain unchanged; original room and Writing page unaffected. Browser visual sign-off remains pending. See [DH11C4D_IMMERSIVE_VIEWPORT.md](DH11C4D_IMMERSIVE_VIEWPORT.md).

## DH-11C.4C — Real door/window openings and Blender cabinet in-room comparison (1 November 2026)

Style-independent architecture proof: replace the intact back/right walls of the prototype only in a new isolated staged scene, with seven non-overlapping physical wall panels and real rectangular voids for the floating-islands window and hinged exit door. Add physical corridor and opening-edge geometry. The comparison preview loads the **verified original Blender 4.0.2 exported cabinet GLB**, checked by SHA-256, rather than recreating it procedurally. Keep all seven interactive room stops, real cabinet drawers and accessible controls. Route: `/previews/dh-11c/architecture/`. Existing `/worlds/writing/`, original 3D room and art palette options remain unchanged. **Owner WebGL visual review remains required before accepting architecture geometry.** See [C4C specification](DH11C4C_ARCHITECTURE_AND_BLENDER_COMPARE.md).

## DH-11C.4B — Editable Blender cabinet master and cloud round-trip (1 November 2026)

Progress the previously owner-liked GLB cabinet without selecting an unapproved art palette. A dedicated headless **Blender import/editable .blend master/re-export** workflow imports the authoritative DH-11C.4A source, verifies case/drawer/rail/tray/folder nodes, exports a fresh genuine GLB and records hashes and model counts. A separate Node validator rejects missing nodes, drifted transforms and altered drawer axes. GitHub Actions uploads the editable `.blend`, model GLB and report as review artefacts, with read-only permissions and no automatic website replacement. CI acceptance and actual modelling export success are required; art style and visual QA remain pending. See [DH11C4B_BLENDER_PIPELINE.md](DH11C4B_BLENDER_PIPELINE.md).

## DH-11C.4A — Hollow cabinet GLB geometry proof (1 November 2026)

Proceed with a **style-independent** model/export proof while the three DH-11C.3A material treatments remain open for owner approval. Build a *genuinely hollow* cabinet shell with real rails and five separate drawer fronts, trays and neutral folders, generate a deterministic GLB and load it through the pinned official Three.js GLTFLoader in a new isolated staging route: `/previews/dh-11c/cabinet-glb/`. Tests verify GLB binary semantics, geometry and native subcomponent rigs. This is **not** a Blender model or final textured cabinet. The current Writing route and original room/colour lab are unchanged. See [DH11C4A_HOLLOW_CABINET_GLB.md](DH11C4A_HOLLOW_CABINET_GLB.md).

## DH-11C.3A — Scene audit, first material bible and palette comparison (31 October 2026)

The first art-direction package is under review. Its [draft visual bible](DH11C3_ART_BIBLE.md) proposes Amber & Ink (preferred starting point), Moonlit Archive and Golden Storybook. The [source audit](DH11C3A_SCENE_AUDIT.md) records current camera coordinates and identifies blockers requiring geometry fixes, notably a solid cabinet case and uncut door/window walls. The [21-item P0/P1/P2 model inventory](DH11C3A_ASSET_INVENTORY.json) and [GLB node/pivot contract](DH11C3A_GLTF_NODE_CONTRACT.md) define cabinet-first C4 production entry. An isolated [material comparison lab](https://davehub.pages.dev/previews/dh-11c/art-lab/) swaps light/material colours on the *same* Three.js scene, never independently generated image parts. **No textures or models approved yet; browser screenshots and owner review are required before proceeding to DH-11C.4.** The published Writing page and existing games are unchanged.

## DH-11C.3–C.9 — Production-quality 3D Writing world roadmap (31 October 2026)

**Option A, detailed production plan selected.** See [DH-11C: Full 3D Production Roadmap](DH11C_3D_PRODUCTION_ROADMAP.md), covering locked geometry-first architecture, source/GLB asset contracts, colour/material strategy, hero-model priority, staging-only delivery, milestones C3–C9, explicit owner approval gates, performance targets, content safeguards, regressions and rollback. **Start with C3A art bible and camera/object inventory; then prototype the cabinet production GLB pipeline before modelling the whole room.** This document plans work but does not approve individual designs, publish new works, replace the existing Writing island or alter the future production domain.

## Locked 3D architecture decision — ADR-0012 (31 October 2026)

**Permanent rule:** “Do not go back to ‘generate a bunch of pictures and try to fake a 3D world.’ Build the world properly, then make it beautiful.” All future interactive DaveHub world and object work must start with coherent geometry, one shared perspective, real pivots and working movement; texturing, lighting and original illustration follow a tested prototype. Independently generated images of open/closed moving 3D parts are prohibited. Images remain welcome for concepts, textures and static decoration. See [ADR-0012 — Geometry first, artwork second](DECISIONS/ADR-0012.md) and the mandatory [AGENTS.md](../AGENTS.md) rules. Any exception requires explicit owner approval and a superseding ADR.

## DH-11C.2 — Full explorable Writing room (31 October 2026)

Build the complete Manuscript Hoard as a genuine 3D room using the approved geometry-first approach. Seven interactive objects are in one shared scene, camera and dimension system: desk, cabinet, bookcase, typewriter, paper bin, door and floating-islands window. Pin a local Three.js runtime, keep all object interactions operable using accessible buttons, preserve original public catalogue and Games unchanged, and deploy only to an isolated Cloudflare staging prototype. Details and acceptance checklist: [DH-11C.2](DH11C2_FULL_ROOM_GEOMETRY.md).

## DH-11C.1 geometry-first reset (31 October 2026)

The owner rejected the AI-composited open-drawer art because the cabinet and drawer vanishing points did not align. **Do not reuse those inconsistent renders as production moving components.** The new approach proves mechanically correct geometry first in a standalone, untextured CSS 3D prototype with one shared perspective and five independently modelled drawer bodies. The stable prototype is accessible at `/previews/dh-11c/cabinet/` on staging; it does not replace the existing scene or publish additional works. Camera orbit and drawer travel sliders specifically make inconsistent perspectives visible. No generated art, game route, production domain or content catalogue changes are included. Only after visual acceptance should we add materials and decide between live lightweight 3D and fixed-camera rendered sprite sequences.

## DH-11C.1 — The Living Filing Cabinet (31 October 2026)

The owner approved the next stage as an adventure-game interaction rather than a content modal. Start with the Writing room's filing cabinet. Build a detailed illustration with a physically separable cabinet body, drawers, interiors, folders, examination surface, shadows and lighting. Five labelled drawers (Finished, Drafts, Oddities, Fragments, Field Notes) open and close physically; folder extraction links only to approved creations. Add a versioned isolated localStorage exploration state, deliberate state transitions, keyboard/touch/reduced-motion support, and full hosted Cloudflare QA. **Generate and gain approval for the C1.1 art before implementing the mechanics.** Full plan: [DH-11C.1 Living Filing Cabinet](DH11C1_LIVING_FILING_CABINET.md). Do not alter catalogue publication, games, staging/live topology or the future production domain.

## DH-11A Writing: The Manuscript Hoard (30 October 2026)

The owner rejected the tidy reading-desk concept. The new Writing world is a warm, chaotic manuscript den with paper piles, notebooks, fragments, CSS-only clutter and native 'rummage beneath' controls. Approved works remain linked through their existing creation pages; a single approved item appears just once, deeper items are keyboard-discoverable, and fictional demonstrations remain isolated. Responsive and reduced-motion tests are included. See [DH-11 visual layouts](DH11_CREATIVE_WORLD_LAYOUTS.md). Cloudflare staging and owner visual approval are the next gates.

## DH-11 visual worlds (30 October 2026)

The five non-game creative destinations now have dedicated CSS-only responsive layouts driven solely by the existing validated catalogue. Writing is a reading room; Music is a record-stage listening room; Experiments is a specimen workshop; The Unfinished Shelf is an intentional archive; Memory Lane is a chronology allowing approximate/unknown years. Fictional examples remain under /previews/dh-08b/ and never enter the live catalogue. Do not use The Ordinary Universe/Ordinary Verse or Octo-Marathon as candidates. See [DH-11 layouts and acceptance plan](DH11_CREATIVE_WORLD_LAYOUTS.md). Musical detail-page enrichment, approved media and actual new content are later stages. No live-domain work.

## DH-10 DaveHub Ready repository discovery (updated 30 October 2026)

A [versioned root-level `davehub.json` contract](DH10_REPOSITORY_MARKER_INGESTION.md) lets creative repositories opt into DaveHub's read-only discovery process, with categories (multi-view), lifecycle, title, public-safe synopsis, links and optional major-milestone suggestions. Missing or `enabled:false` = disabled. A recurring and on-demand GitHub workflow scans the owner's public repos and prepares **unpublished review candidates**, not automatic site deployments. Earlier creative opt-in PRs merged (Stephen Martin, Ordinary Universe, Octo-Marathon); however, **30 October owner decision:** Ordinary Universe/Ordinary Verse is not ready and Octo-Marathon is not part of DaveHub. Both source markers are now `enabled:false` and must not be proposed for publication. Unicorn Valley PR #338 was historically subject to its final CI gate. DaveHub's disabled self-marker and scanner are merged. In the verified scan, 12 eligible public repositories were checked; three were enabled, nine disabled/absent and none invalid. Non-opted-in repositories are excluded by default. The remaining work is private Content Workshop integration and separately approved publication; nothing reaches the staging/live catalogue automatically.

## DH-09D domain launch and staging decision (28 October 2026)

**Locked owner requirement:** `davehub.pages.dev` must remain the permanent staging/testing domain after `davehub.co.uk` launches. Staging and live must use **two independent Cloudflare Pages projects connected to the same DaveHub Git repository**, deploying the same path layout but independently controlled versions: existing Pages project → persistent `staging` branch; new live Pages project → protected `main` branch plus `davehub.co.uk` custom domain. No automatic staging-to-live promotion. The exact domain/DNS/TLS, branch-switch, game regression and rollback checklist is committed to [the permanent DH-09 domain launch runbook](DH09_DOMAIN_LAUNCH_RUNBOOK.md). **Do not switch current Pages branches or configure the domain yet.**

## DH-08B homepage navigation integration (27 October 2026)

After seeing DH-08B pages, the owner noted the homepage Explore CTA still opened the **old pop-up**, leaving the new page designs inaccessible without pasted direct links. Corrected on the DH-08B branch: Explore links straight to `/worlds/`, islands open their respective world routes, previous hash deep links redirect, and empty public category pages clearly link to a separate fictional demonstration. The pop-up no longer duplicates the new world page. New navigation tests guard the integration.

## DH-08B shared content pages (27 October 2026)

The [DH-08B implementation and verification record](DH08B_SHARED_CONTENT_PAGES.md) covers a single statically generated UI driven by the approved public manifest. Seven Explore world destinations and per-creation deep links are now built from one source; a musical can link concept, songs, script scenes, making-of notes and releases. A separate seven-work fictional dataset produces a 15-page browser demonstration using exactly the same templates. Public world pages are currently empty because **no real owner works are approved**. DH-08B is a draft feature branch, not a production content release.

## DH-08A owner-controlled public content (27 October 2026)

[The publication contract](DH08_PUBLICATION_CONTRACT.md) specifies `DaveHub Ready` as a nomination for read-only drafting, **not** blanket public permission. Implemented an empty `content/public/catalogue.json`, a strict validator, twelve Node tests, and a fictional four-item demonstrator at `/previews/dh-08/` on the review branch. The Cloudflare build blocks unapproved or unsafe records and ships only the approved manifest to `/content/catalogue.json`. Books, albums, historic material and any privately drafted descriptions still require individual rights and editorial approval. This is DH-08A only; actual owner work is not yet ingested.

## DH-07E static Giant Dave + mystical explorer (27 October 2026)

User requested a non-animated **static Giant Dave** in the reserved host slot, while preparing the real animation independently, and a **more mystical Explore directory** matching the illustrated floating islands. A prior original transparent Dave pose was converted to a 177 KB WebP and committed as a separate staged binary; the build script now copies it to the preview. The Explore modal reuses the approved background, a darkened magical/constellation treatment and luminous portal cards, retaining all navigation. See [DH-07E visual implementation and QA](DH07E_GIANT_DAVE_MYSTIC_PORTAL.md). This does not reopen the removed bottom menu. Browser placement and owner approval are still required before production merge.

## DH-07D cross-world navigation (27 October 2026)

The user approves DH-07C **page concept and layout** and prefers a modern sans-serif typographic revision. Build [the two-tier discovery directory](DH07D_DISCOVERY_NAVIGATION.md) on a branch based on DH-07C: retain all four existing floating-world links and **remove the redundant bottom tiles**; group **Music**, **The Unfinished Shelf** and **Trip Down Memory Lane** inside **Explore** rather than adding buttons to the crowded homepage. Contextual onward links open the existing fictional shelf and musical previews. Unapproved real works are not exposed. Visual review, browser validation and main-branch approval are separate gates.

The owner reviewed the homepage and explicitly rejected the third navigation surface: the bottom four-tile row repeated the floating islands and Explore. It has been removed from the branch, and the logo/Explore area is repositioned to suit. This is a targeted refinement, not a new visual design direction. Browser QA remains pending because the available browser runner previously blocked local page loads.

## DH-07C fictional content-world prototypes (27 October 2026)

[Interactive test and QA record](DH07C_CONTENT_PROTOTYPES.md). A responsive HTML/CSS/JS design lab is available from the feature branch at `/previews/dh-07c/` once the actual Cloudflare branch build is confirmed. It contains six fictional deliberately shelved projects and an entirely fictional musical whose songs link to script scenes, plus story, development notes and releases. **No user's real private work has been published.** Browser interaction and zero horizontal-overflow checks passed at 1440×900, 1366×768, 390×844 and 375×667. The old homepage remains unchanged, and the page designs await owner review before merge.

## DH-07B: Unfinished Shelf and musical production architecture (25 October 2026)

The historical hard-drive inventory is **not a prerequisite**. The [DH-07B specification](DH07B_UNFINISHED_AND_MUSICALS.md) defines two visitor experiences: a deliberate home for works the owner **has no intention of finishing** (particularly scripts/writing), and first-class **musical worlds** connecting songs/releases, concepts, plots, characters, script/lyrics and creative-development artifacts. Categories, work lifecycle, historical period and publication status are independent: no unfinished project becomes an implied to-do item, and an album is not mistaken for the whole musical. Implement two responsive templates with fictional data and reviewed rights before introducing real files. Naming and homepage placement remain to be confirmed.

## DH-07A creative catalogue discovery (24 October 2026)

Initial outside-GitHub creative links suggest additional kinds of records: publishers and collaborative organisations, books, music artist identities, specific album releases, musical productions and historical bands. The same creation may be browsed through **Music**, **Writing**, **Projects** and **Trip Down Memory Lane**, without duplication. **Music and Trip Down Memory Lane are candidate views, not yet approved homepage buttons.** The first nine detailed entries are held as a conversation-local draft and are *not* committed to the public repository. Read the [inventory discovery specification](DH07A_EXTERNAL_INVENTORY_DISCOVERY.md) and respect the [publication policy](PUBLICATION_POLICY.md).

## New strategic workstreams (agreed 22 October 2026)

**Principle:** The owner creates games, books, music, software and ideas; DaveHub should organise and present the approved work without imposing regular website upkeep or hand-written blog posts.

- **DH-06: Living Giant Dave.** Four approved poses remain the character-design reference. Owner selected **articulated movement for idle, look, reach, point and present**; reserve morphing exclusively for separately designed magical world transitions, never routine pose changes. Draw hidden shoulder/torso paint and layered face/arm artwork first; don't generate another stack of optical-flow tween frames. Rive is a candidate, not a locked runtime. See [animation brief](GIANT_DAVE_ANIMATION.md), [exact layered asset specification](GIANT_DAVE_LAYERED_RIG_SPEC.md) and [ADR-0010](DECISIONS/ADR-0010.md).
- **DH-07: Content and information architecture.** Four visitor destinations (Projects, Writing, Games, Experiments) are overlapping discovery categories over *shared* canonical content. Inventory projects, ideas, milestones, releases, development stories and authorised media. Design What's Happening, project history and search. Run in parallel with DH-06. See [Living content and ingestion discovery](CONTENT_PIPELINE_DISCOVERY.md).
- **DH-08–DH-11: The publishing system.** Owner nominates public-safe work as **DaveHub Ready**; read-only integrations and AI can create sourced drafts, but public publication still requires deliberate human approval under the existing policy. Pilot a single approved game; generate short human-readable development stories from meaningful milestones rather than blogging every commit; only then expand sources. Do not introduce a CMS or database without a measured need.
- **Visibility rule:** This roadmap authorises discovery and prototypes, **not automatic publishing**, ingestion of private conversations, third-party voices/likenesses or employment-related information.

## DH-06C1 implementation sequence (locked 22 October 2026)

1. **C1a:** coherent master torso/neck/head and underpaint behind the near shoulder; approved static fallback.
2. **C1b:** separately painted near upper sleeve, elbow bridge, forearm, hand variants, shoulder cap and occlusion shadows; test pivots and extremes.
3. **C1c:** isolated eyelid/eyes, face expression and head articulation.
4. **C1d:** natural idle → welcome → hold → return state machine, no ordinary whole-image morph.
5. **C1e:** quality/performance and Rive-versus-Canvas review; binary asset provenance and user approval.
6. **DH-06C:** Cloudflare feature-branch integration once C1 tests pass; preserve fullscreen controls and mobile/reduced-motion fallback.

**Not done:** Painted rig assets, actual Rive/Canvas production animation, image binary repository hand-off and Cloudflare integration. Existing draft PR #9 remains historical experimental evidence; it is not the production character.

## Responsive scene fit (DH-02C)

- Treat the homepage as a single viewport-sized, non-scrolling scene, not a conventional document with a minimum page height.
- Anchor the logo, Explore CTA and navigation to the available viewport height. Keep native destination dialogs independently scrollable.
- Use compact rules for smaller screens, portrait mobiles and landscape phones. For extremely short portrait viewports or heavy zoom, prioritise accessible scrolling over clipping controls.
- The owner's live Cloudflare screenshot showed bottom navigation below the fold. The fullscreen CSS correction was browser-tested locally at 13 viewport sizes from 320×568 through 1920×1080; the live hosted update must still be visually reviewed.

## First-look preview and hosting

- [DH-01A working homepage prototype](HOMEPAGE_FIRST_LOOK.md) built and approved for first hosted visual review; the hero asset and Dave movement remain open for refinement.
- Artwork is layered separately, with an empty `#dave-stage` placeholder for the future illustrated Dave.
- The first review focuses on the visual homepage and actual HTML buttons. The optional retro menu route is deferred from this increment; confirm its future place separately.
- [Cloudflare Pages setup](CLOUDFLARE_PAGES.md) is prepared with a curated `dist/` build; account connection and the `*.pages.dev` domain are not yet established.

## Workflow

- Keep reference images unchanged and version any refinements separately; do not overwrite approved originals.
- Refine within the selected direction. New competing high-level visual concepts require explicit approval.
- Development should use small reviewable work packages, tests and preview links after an actual deployment.
- Update `PROJECT_STATE.json` and this roadmap at each completed work package.
- Publication of another project's source, asset or private content requires separate approval.


## DH-06D — transparent illustrated Dave homepage animation (review)

- Owner supplied a five-second 720×1280 QuickTime animation with a confirmed genuine alpha channel, 121 source frames; the source MOV stays outside the public web build.
- Optimised browser motion asset: VP9 WebM with alpha, 480×854, 24 fps, 289,843 bytes, SHA-256 `1ed2277df5316b5b7f3c2ac2747e69d1492e011d5605ac4af37043bfaf072ead`.
- Integrate into the existing `#dave-stage`, preserving responsive positioning and the approved WebP still as fallback.
- Motion is decorative, silent, noninteractive and does not intercept pointer events. Avoid perpetual 5-second repetition; pause between gestures.
- Disable video for `prefers-reduced-motion`, Save-Data, iOS, Safari and playback failures.
- Acceptance: Cloudflare branch preview; verify transparency and position on Chrome/Edge desktop and mobile, Safari static fallback, all navigation working, no oversized downloads.
- Status: code and asset prepared on feature branch for review. Do not merge until owner confirms appearance.

### DH-06D1 — larger upper-body framing (owner review, 28 October 2026)

- Owner requested a much larger Dave, with the head, shoulders, chest and pointing hand dominant; legs can be cropped below the screen.
- Increased desktop Dave height up to 155svh (width-limited on narrow desktops) and aligned the top around 14svh, keeping his head visible while cropping the legs below the viewport.
- Re-aligned transparent video relative to the static still so the gesture stays near, but does not cover, the desktop Explore CTA.
- Tablet and portrait-mobile rules use upper-body crops; landscape-phone framing remains explicit.
- Still and motion share geometry and remain noninteractive; Safari, reduced-motion, and playback fallback remain unchanged.
- Added CSS layout regression assertions. Review Cloudflare branch preview at desktop, tablet and mobile before merging.

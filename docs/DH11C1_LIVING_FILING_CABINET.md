# DH-11C.1 — The Living Filing Cabinet

**Project:** DaveHub  
**World:** Writing / The Manuscript Hoard  
**Deployment target:** Existing Cloudflare Pages staging at `davehub.pages.dev`  
**Status:** Owner-approved implementation specification. C1.1 artwork pending review; implementation not yet complete.  
**Approval:** 31 October 2026

## 1. Objective and non-negotiable principles

Transform the Writing scene's filing-cabinet hotspot from a flat clickable region that reveals a conventional content panel into a genuinely explorable, animated, point-and-click *place*.

The visitor should feel as though they approach a real cabinet, slide open its drawers, pull out folders and examine manuscripts. **Object interaction, not panels styled like objects, must drive the experience.**

- Preserve the existing published catalogue, explicit owner approval, canonical creation routes and source-repository exclusions.
- Never surface unapproved manuscripts, private repository content or fictional preview material on the public staging Writing route.
- No new cloud services, accounts, generative text, or production-domain work.
- All mechanics accessible by keyboard and touch; exploration must never gate access to an otherwise published creation.
- A real, multi-layer illustrated cabinet is required. Do not pass off the flattened room art with CSS translation as a complete physical drawer animation.

## 2. End-to-end visitor experience

### Step A: Approach

The user lands in the existing illustrated Manuscript Hoard room at `/worlds/writing/`. The filing cabinet is already a discoverable hotspot. On hover or keyboard focus, a handle glints and a restrained highlight suggests the cabinet is interactive. The accessible name is “Examine the filing cabinet”.

Activating the cabinet begins a short camera movement towards it. The surrounding room falls gently into shadow before a correctly illustrated cabinet close-up replaces the distant room view.

### Step B: Cabinet close-up

The new close-up occupies most of the viewport. Five labelled drawers are visible, arranged as part of a physical cabinet:

1. **Finished** — completed approved writing works.
2. **Drafts** — approved draft manuscripts.
3. **Oddities** — other unusual approved writing items.
4. **Fragments** — approved permanently shelved, abandoned or fragmentary works.
5. **Field Notes** — approved lore, concept notes, development materials and research.

The handles, labels, sides, paper stacks and cast shadows visibly belong to the illustrated cabinet. The visitor can open or close any drawer by clicking its handle or pressing Enter/Space when focused.

### Step C: Open a drawer

The selected drawer front physically advances towards the visitor; its interior appears, paper folders rise into view and its shadow changes. Opening another drawer closes the previous one first. Empty drawers open just as convincingly; they reveal an illustrative empty-folder state, not unapproved titles.

Suggested flavour copy for a genuinely empty drawer:

> Nothing in this drawer has been cleared for visitors. There's definitely something rattling around at the back, though.

This copy does not imply that unpublished source records were discovered.

### Step D: Extract a folder

Selecting a labelled folder lifts it from the drawer and places it on an illustrated examination surface. The visitor sees only already-approved catalogue metadata: title, work kind, short synopsis and optionally approved cover art, with an explicit link to the existing canonical creation page.

The visitor can return the folder to the drawer without leaving the cabinet. A second layer of interaction must be visible and tactile, not just a generic web popup.

### Step E: Return to the room

A persistent “Back to the room” control returns through a short reverse scene transition. Escape unwinds folder inspection first, then drawer inspection, then cabinet mode. Focus returns to the original cabinet hotspot. The cabinet may subtly signal that it has been visited before.

## 3. Artwork and asset strategy

**C1.1 must be approved before C1.2 implementation begins.** Use the owner-approved Manuscript Hoard scene for palette, perspective and rendering quality. The cabinet artwork should have an unmistakable physical mechanism.

Artwork deliverables, each in the same consistent perspective and illustrated style:

- **Cabinet body / clean plate:** Full cabinet with drawer apertures, no front pieces baked into the background.
- **Five drawer fronts:** Separate transparent assets or reusable layers aligned exactly with their apertures.
- **Open-drawer interiors:** Physical drawer sidewalls, underside, depth, folder rails and cast shadows.
- **Folder assets:** Reusable tabs, closed and lifted states, blank enough for programmatic *approved* titles.
- **Examination surface:** An illustrated tabletop/paper mat to receive a selected folder.
- **Lighting and depth:** Shadow/handle glints and optional particle overlays compatible with separate animation.

Generate and review the **master close-up concept** first, then produce or derive consistent asset plates. A finished concept image does **not** prove that those separate movable layers exist. Save source and outputs in a dedicated `assets/worlds/writing/cabinet/` directory only when the owner approves.

Prefer optimised WebP/AVIF for opaque imagery and transparent PNG/WebP as technically appropriate for sprites. No links to temporary image hosts, fonts or third-party image libraries.

## 4. Content mapping

The existing validated, owner-approved DaveHub catalogue remains the single source of truth. A deterministic classifier maps each eligible Writing record to **one** cabinet drawer. Its output must be unit-tested and must never produce new metadata or summaries.

- Finished: approved complete manuscripts and works.
- Drafts: explicitly approved items whose existing lifecycle/type identifies them as draft manuscripts.
- Oddities: approved writing-adjacent works not matching a more specific drawer.
- Fragments: approved shelved/abandoned or identified fragmentary works.
- Field Notes: approved lore, concepts, worldbuilding and development notes.

Where metadata is insufficient, use a documented conservative fallback to Oddities. Never infer that real private source material exists by looking at repository names.

The currently approved staging Writing route has a very small approved inventory. The Cabinet must remain visually interesting with empty drawers. Fictional demonstrations live only under `/previews/dh-08b/worlds/writing/`, use separately namespaced storage and retain conspicuous disclosure.

## 5. HTML/component responsibilities

Extend the existing `assets/worlds/writing/room.js` and `scripts/render-writing-scene.cjs` only through a clearly separated cabinet feature; do not scatter drawer controls across the generic scene renderer.

Suggested structure:

- `writing-cabinet-scene`: one native full-screen `dialog`, visually styled as an actual zoomed scene; no nested dialogs.
- `cabinet-closeup`: cabinet art, depth layers and five interactive, focusable drawer handles.
- `cabinet-drawer--finished|drafts|oddities|fragments|field-notes`: independent control with `aria-expanded` and a corresponding labelled interior.
- `cabinet-folders`: buttons associated with approved records.
- `cabinet-examination`: folder extraction and manuscript synopsis, including a normal canonical `<a>` to open the real creation page.
- `cabinet-status`: concise live-region announcements for drawer and folder changes.
- A visible and keyboard-accessible “Back to the room” button.

Native buttons and links are mandatory. Avoid click-only SVG elements or inaccessible coordinate-map interactions. The old generic cabinet panel should be retired when the new scene passes acceptance; other room objects are unaffected.

## 6. Explicit state machine and interactions

Use the following states:

- `ROOM`: user sees the Writing island.
- `CABINET_ENTERING`: camera moves towards the cabinet.
- `CABINET_IDLE`: close-up active, no drawer extended.
- `DRAWER_OPEN(drawerId)`: one specified drawer extended.
- `FOLDER_INSPECT(drawerId,recordId)`: approved folder extracted and examined.
- `CABINET_EXITING`: reverse transition.

Allowed transitions:

- `ROOM → CABINET_ENTERING → CABINET_IDLE`
- `CABINET_IDLE → DRAWER_OPEN`
- `DRAWER_OPEN → CABINET_IDLE` (close same drawer)
- `DRAWER_OPEN(A) → CABINET_IDLE → DRAWER_OPEN(B)` (change drawer)
- `DRAWER_OPEN → FOLDER_INSPECT → DRAWER_OPEN`
- Any cabinet state may return via controlled exit to `ROOM`, with Escape unwinding the deepest state first.

Lock or queue conflicting actions during transitions. Double clicking, interrupting animations, or backing out quickly must not result in a drawer visually open while the state machine claims it is closed. When reduced motion is active, apply the same states without animation latency.

## 7. Event handling and persistence

Create a dedicated, testable cabinet controller for scene transitions, drawer selection, folder extraction, focus and accessible attributes. The room controller only initiates and closes the cabinet scene.

Use **localStorage**, with versioning and defensive reads:

- Public key: `davehub.writing.cabinet.v1`
- Fictional preview key: `davehub.writing.cabinet.preview.v1`
- Schema: `version: 1`, `visited: boolean`, `openedDrawerIds: string[]`, `lastDrawerId: string|null`, `discoveredRecordIds: string[]`.

Only approved record IDs and interaction state may be stored. No source text, personal information, credentials or private draft content.

Malformed/stale storage must be discarded safely. Disabled storage must degrade to session-only operation without an error screen. Visited drawers may gain a subdued mark; if restoration is enabled, reopen their last drawer only from a stable idle state, never mid-animation.

## 8. Visual animation guidance

- Camera approach: approximately 300–450 ms, with depth-aware transition from the room hotspot to the cabinet close-up.
- Drawer travel: approximately 250–400 ms, physically advancing the illustrated drawer front with its interior, rails and updated shadows.
- Folder extraction: folder lifts and shifts to a nearby examination area, revealing *approved* content.
- Return: reverse movement and focus restoration.
- Gentle hover/handle lighting and subtle sound may be added separately; **sound must be opt-in** and never required.

Animations should be satisfying but not slow or obstructive. Provide a complete `prefers-reduced-motion` implementation with zero or minimal transition. Camera effects must not cause motion sickness or sudden unwanted scroll.

## 9. Responsive and accessible interaction

Design the mobile close-up specifically, rather than merely scaling the desktop view:

- Cabinet fills available width with five vertically stacked large drawer controls.
- Touch targets generally at least 44×44 CSS pixels.
- Folder inspection may occupy a full mobile screen, with an always-accessible Back control.
- Drawer navigation never relies on dragging or precise hotspot tapping.
- No clipped drawers or accidental horizontal page scrolling.
- Keyboard Enter/Space open drawers/folders; Escape returns folder → drawer → room.
- Correct `aria-expanded`, labels, status announcements, focus containment and restoration.
- No hidden focusable elements and no inaccessible interaction-only content.
- Aim for WCAG 2.2 AA.
- Provide a simple link-based approved catalogue fallback when JavaScript is unavailable.

## 10. Test plan and regression gates

**Unit tests**

- Deterministic categorisation, correct drawer contents and no duplicate work.
- Zero, one and many approved items.
- Missing metadata falls back safely to Oddities.
- Corrupted/obsolete localStorage state ignored.
- Preview/public persistence namespaces cannot mix.
- Invalid IDs cannot be used to render or navigate unapproved records.
- Escaping protects approved titles/synopses from injection.

**Interaction tests**

- Click cabinet to enter close-up; reverse exit returns to the same room.
- Open drawer, close drawer, switch drawer while another is open.
- Rapid clicks or interrupted animation do not corrupt state.
- Extract a folder and return it.
- Correct canonical link for an approved work.
- Drawer explored-state remembered after reload.
- Empty drawers still open and are never populated with invented real content.

**Accessibility / responsive tests**

- Full keyboard journey, including Escape depth and focus restoration.
- Screen-reader names, expanded states, live status messages.
- Reduced-motion mode retains correct results.
- Touch and narrow-screen layouts with no clipped interactive controls.

**Existing project regression**

- Main homepage/giant Dave unchanged.
- Other five creative world routes unchanged.
- `/games/unicorn-valley/` and `/games/stephen-martin/` continue working with exact pinned versions and media.
- Validated catalogue unchanged; real and fictional pages strictly isolated.
- Cloudflare staging site build, HTTP smoke, gaming and editorial checks green.

## 11. Implementation order and sign-off

1. **C1.1: Illustrated cabinet asset pack.** Master close-up concept generated and reviewed, followed by clean background and individually aligned animated layers. Requires owner approval.
2. **C1.2: Cabinet scene entry/exit.** Camera approach, close-up, room restoration.
3. **C1.3: Physical drawers.** Five individually openable drawers with visual depth, exclusive selection, proper empty states.
4. **C1.4: Folder inspection.** Extract folder, approved content metadata and canonical links.
5. **C1.5: Persistent exploration.** Versioned browser memory and discovered-state display.
6. **C1.6: Staging QA.** Full tests, Cloudflare deployment, browser/phone verification and explicit owner visual approval.

Use feature branches and PRs targeting `staging`. Use cloud CI and deployed URLs for testing, never require the site owner to build locally. The custom domain `davehub.co.uk` and the independent future live Pages project remain out of scope.

## 12. Explicit out of scope

- Animating desk, typewriter, waste bin or bookcase in this first vertical slice.
- Generative AI writing or invented manuscript data.
- User accounts, database synchronisation, user analytics or background processing.
- Mandatory puzzles that prevent access to publicly approved work.
- Automatic content publication, source-manifest changes or live-domain activation.

## 13. Definition of done

C1.1–C1.6 are complete only when the cabinet genuinely feels like an adventure-game interaction: room-to-cabinet entry, physically opening drawers, extracted folders, accurate approved metadata, remembered discovery, accessible desktop/mobile operation, green hosted regression checks and **explicit owner visual sign-off**.

**Acceptance question:** Does opening a cabinet and retrieving a folder feel like manipulating a physical object in the illustrated world? If it is merely a list or overlay dressed as a drawer, the implementation is not finished.

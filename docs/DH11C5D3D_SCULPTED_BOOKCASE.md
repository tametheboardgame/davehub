# DH-11C.5D.3D — Sculpted bookcase detail

**Status:** 3D artwork experiment for visual review, not an approved release.

## Purpose

The owner approved continuing the successful DH-11C.5D.3C book-spine direction. The next increment must make a real increase in dimensional detail and silhouette quality, not just add another global shader, surface noise pass or unsupported still image.

## Implementation

- Isolated review URL: `/previews/dh-11c/authored-3d-v3/?v=dh11c5d3d-sculpted-bookcase-v1`.
- New `high-illustration-3d-v3.js` based on the independent V2 artwork renderer; the original artwork and V2 previews remain untouched.
- Sculpted local-mesh geometry includes a stepped two-course cornice with five shallow seals, fluted vertical bookcase edges with capitals, raised shelf-lip mouldings with pins and selected bindings with raised bands and a central ridge.
- Every added piece is located from the existing GLB mesh's own local bounding box. Attachments inherit the original physical coordinates, fixed camera and furniture state.
- Material finishes are confined to two shared, inexpensive dark-ink and gilt standard materials. Sculptural pieces are decorative, non-interactive, have `raycast=()=>{}` and are excluded from the scene's selectable-mesh registry.
- Both illustrated and original-material modes remain reversible: every sculpted element is hidden in original mode and shown in illustrated mode.
- The model geometry, 80 book positions, featured eight book-pull pivots, desk lamp, five cabinet drawers, papers, typewriter, door, focus cameras and public content remain unchanged.

## Review checks

Review both the room overview and bookcase close-up on desktop and mobile. Look at carving proportions, gold visibility, motif repetition, book readability, draw calls and occlusion. Pull and return all eight turquoise-and-gold books and confirm no decorative detail steals clicks. Inspect the previous V2 to judge whether the extra geometry is an improvement.

**Not yet approved:** visual style, mobile frame rate and expansion to the desk, filing cabinet, typewriter and surrounding architecture. Do not release to `/worlds/writing/` or production before explicit approval.

## Next slices after this review

1. Model-specific filing-cabinet handles, shaped metal corners and engraved drawer faces without restricting the five drawers.
2. Desk joinery, leather inlays, lamp metalwork, paper edges and typewriter sculpting while retaining all movable components.
3. Architectural relief, fabric, room light treatment and measured mobile performance.

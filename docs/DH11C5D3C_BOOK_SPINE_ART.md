# DH-11C.5D.3C — Book-spine art variation on the real 3D shelves

**Status:** Feature-branch experiment for review. The DH-11C.5D.3B artwork remains intact, as does published Writing and production.

## Reason for the change

The previous authored 3D pass paints all ordinary book bindings using a shared source UV map and a single motif per source. This produces a repeated stamp across 80 volumes despite the existing seven binding finishes. The user's stated goal is a richly illustrated, personally drawn room rather than a generic shader or a flat camera plate.

## Implementation

- Separate preview route: `/previews/dh-11c/authored-3d-v2/?v=dh11c5d3c-unique-spines-v1`.
- A separate artwork runtime `high-illustration-3d-v2.js`, leaving the accepted comparison `high-illustration-3d.js` and its previous preview unchanged.
- Four decorative binding insignia variations, selected deterministically from existing `book_<shelf>_<number>` names; the distinct seven underlying material maps remain available.
- UV painting remains on existing 3D geometry. Variant cache keys are `kind:variant`, so the 80 volumes reuse a bounded number of GPU textures rather than allocating unique full-resolution canvases for every book.
- No book titles, catalogue entries, fake click targets, new camera plates, new moving-state images or new pivots.
- Same original GLB models, rays, source geometry, camera targets and eight pull-out highlighted book controls.
- Source material, original 3D view and older art variations retain their own URLs.

## Review and acceptance

Review the HOME and bookcase views with the `Illustrated 3D art` switch active; compare against the V5 original art route and the unstyled materials. Confirm the increased variation reads as hand-illustrated without visual clutter. Check that all eight pull-out books remain selectable and the other controls still work. Visual approval is pending, do not promote into published Writing or production.

**Scope limit:** This is an incremental binding-art review, not finished homepage-quality sculpture or a claim of visual parity.

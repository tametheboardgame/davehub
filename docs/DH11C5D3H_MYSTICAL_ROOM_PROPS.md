# DH-11C.5D.3H — Lamp, basket and mystical rug

**Status:** staging-only visual candidate, not yet owner-approved. All V6 elements are approved and deliberately retained.

## Owner notes, 4 November 2026

The owner accepted the V6 window, books, papers and labels. This slice focuses solely on (a) a lamp base visibly sunk in the desk, (b) more actual paper balls *inside* the basket while preserving the nine movable overflowing crumples, and (c) replacing the arbitrary rug loops with a mystical, cohesive material language.

## Real 3D implementation

1. **Lamp contact.** The canonical source desk top is Y=1.29+0.20/2=1.39m. The original lamp base is centred at Y=1.4 with height .12, so its bottom was Y=1.34, 5cm *inside* the desk. V7 shifts all five original GLB lamp parts (base, stem, cap, shade and bulb) up by 7cm. The base bottom becomes Y=1.41, 2cm above the tabletop. A dark-walnut 0.038m plinth and a thin gold rim anchor its visible lower edge directly at Y=1.39, providing proper contact. The actual lamp light is repositioned by the same 7cm and its old click-to-toggle hardware is preserved. V7 opt-in fallback geometry uses the same lamp lift. No change to canonical GLB.
2. **Waste-paper basket.** The original GLB bin is visibly capped at Y≈.86, giving the basket the appearance of a solid bucket. V7 hides only this rigid body/rim in illustrated mode, replaces them with open-ended tapered 13-sided 3D walls, an inner dark lining, real interior base and an open toroidal brass rim. Twelve *additional decorative* crumpled paper forms occupy three levels down inside, each with individual radius/orientation/paper finish and slight 3D crease marks. The nine original, named and independently animated `bin_paper_0..8` meshes are **not touched**, so rummaging/returning remains functional. On original-material mode, the GLB body/rim return and new bin artwork disappears.
3. **Mystical rug.** The rug remains the existing real 5.3 × 3.65m floor mesh (and its four trim strips) in the original GLB. V7 attaches a physically flat canvas-textured artwork plane over *only the rug top* at Y=.061, immediately above the rug top Y=.0575 and below the trim top. No image projection or camera plate. Art is muted plum/rose, double aged-gold border, fine woven fibres, geometric central astrolabe diamond, directional stars, invented constellation paths and edge stitches. The previous series of large fabric ellipse loops is fully covered in illustrated mode. Changing back to original materials hides the overlay and reveals the GLB rug again. This is an intentionally nonreligious, original fantasy chart design.

## Constraints

- New independent route: `/previews/dh-11c/authored-3d-v7/?v=dh11c5d3h-mystical-room-props-v1`.
- New opt-in browser source: `prototypes/dh-11c-room/room-props-v7.js`.
- The approved V6 preview is unchanged. No changes to `main`, published `/worlds/writing/`, production `davehub.co.uk`, or creative game repositories.
- New 3D decorations have `userData.decorativeOnly=true`, and their `raycast` is disabled. Existing bin/rug/desk physical coordinates and cabinet/books/paper mechanisms are unchanged.
- One 1024×704 RGBA rug texture and twelve detailed inner paper meshes are added. Verify WebGL performance and tablet appearance before approving.
- The original lamp/base, bin caps and rug remain as a reversible reference, preventing destructive mesh edits.

## Visual review gate

Check lamp close-up from desk camera for a connected round foot and no gaps; verify toggle from shade/base. Look down inside the bin and confirm 12 further balls visibly sit *below* the nine interactive overflow balls; move, return and reverse all nine. Inspect rug from both room overview and elevated camera, including medallion legibility around desk legs and absence of the old noodle loops. Switch to original-material mode and back. Test mobile/tablet frame rate and maintain the previous window/books/page/label improvements. **Do not promote to published Writing before owner visual approval.**

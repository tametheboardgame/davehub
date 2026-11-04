# DH-11C.5D.3E — Authored detail pass

**Status:** isolated staging candidate, pending visual approval. This work follows feedback on the DH-11C.5D.3D screenshot. Do not promote to the published Writing world or production without explicit approval.

## Design intent

Keep the one, genuinely interactive Three.js/GLB room. Improve density and character, not another global toon filter or stand-alone illustration of the room.

## Five specific changes

1. **Window view:** mount three independent planes behind the real frame at local z -0.49, -0.38 and -0.27. The far layer uses the actual approved homepage floating-islands background PNG; the other two are low-opacity, transparent manuscript-style island/mist canvases. No artwork across the room, cameras or moving objects. When switching back to original materials, restore the original window sky and island meshes. If artwork cannot load, keep the originals.
2. **Fine detail:** the new V4 illustration code replaces the heaviest, long wood and plaster strokes with shorter, lighter distributed gouache marks. Previous V3 and original UV art stay available for side-by-side comparison.
3. **Individual volumes and sheets:** 80 deterministic individual book paint signatures, with unique gilt borders, diagrams, wear and motifs on their genuine GLB UV surfaces. The eight turquoise pull-out books retain their approved highlight material and interaction but receive individual fine ornamental geometry. Distinct manuscript layouts on all 13 desk papers, plus the desk file, typewriter page and nine crumpled papers. No fabricated project titles or unpublished content.
4. **Desk composition:** hide the `desk_cup` only in this isolated prototype. Do not remove its canonical geometry from the GLB or alter other previews.
5. **Filing cabinet:** replace small printed overlays with parchment-toned, larger handwritten/quill-style labels on all five real drawer fronts. The labels move with the drawers and are excluded from object picking.

## Safety, optimisation and review

- The original desk, 13 paper pivots, typewriter, 80 book meshes, eight pull-out books, five cabinet drawers, bin papers, hinged door, window frame and curated cameras remain unchanged.
- The room remains selectable via the existing capture, with non-interactive art explicitly marked `decorativeOnly` and excluded from hit targets.
- Individual binding/paper UV artwork uses 256px textures, while larger shared materials retain 384px. This deliberately bounds, but does not eliminate, extra GPU texture memory. Test on a mobile tablet before approving.
- The additional window backdrop fetches an existing approved `/assets/homepage/floating-islands-background.png` file already included in the Pages build. The artwork only covers the real window opening.
- Check overall scene and all five cabinet labels, mouse/touch on drawers and featured books, both material modes, animated items, mobile frame rate, image-load failure and contrast at mobile width.
- No changes to `main`, `/worlds/writing/` or `davehub.co.uk`.

## Review URL

`/previews/dh-11c/authored-3d-v4/?v=dh11c5d3e-authored-details-v1`

## Next steps

After review, assess remaining visual repetition, hand-authored texture polish on cabinet metalwork, richer book silhouettes and mobile texture budgets before final integration.

# DH-11C.5D.3G — Clean titles, authored pull-outs and handwritten labels

**Status:** staging-only visual candidate. User visual/content approval pending.

## Owner feedback (4 November 2026)

The 3F window is approved and is deliberately unchanged. The remaining issues are (1) older central relief ornaments competing with book titles; (2) the eight pull-out books should represent the user's actual creative work; (3) loose papers should be frantic fountain-pen writing while the typewriter sheet must remain typed; and (4) the filing labels are too dominant/printed and should be visibly handwritten.

## Implementation

- **Clean 3D spines:** V6 selects `high-illustration-3d-v5.js`, preserving every room mechanism/UV/light treatment but suppressing old line-relief, raised ornamental bosses and underlying illustrated centre glyphs on all 80 book faces. The separate legible title texture is still fixed to the genuine GLB binding surface. The eight feature-specific central relief symbols are disabled only in V6. Existing gilt bands remain.
- **Eight personal works:** V6's manuscript art module maps the eight existing pull-out positions (0, 10, 29, 39, 48, 58, 67, 77) to these *real, individually known project/manuscript titles*, not invented fictional books: `The Legend of the Stormrider`, `The Blood Laws`, `3084`, `How the Better Half Live`, `How to Stop Trying and Abandon Hope`, `The Iron Road`, `Vegan the Musical`, `Metal... the Musical`. Short spine display names are rendered physically while hovering/pulling shows the full work title. **These are candidate identity labels only, not proof of publication, rights clearance, or catalogue approval.** Do not link or publish manuscript contents. The other 72 spines retain their unique fictional joke titles.
- **Desk papers:** 13 individual desk sheets plus the separate file leaf keep unique untidy, crossed-out, circled, hand-scrawled ink textures. The old repeated mechanical line-relief is suppressed over these papers so it cannot visually overwrite the new artwork.
- **Typewriter sheet:** deliberately has **no V6 scrawl decal**. Its actual GLB page and original typed-line material and the physical typewriter's paper-feed animation remain unchanged.
- **Handwritten drawer labels:** the old thick black, oversized printed 146px serif is V5-only. V6 supplies five independent 960×256 CanvasTexture parchment images with an aged border, subtle pigment marks, irregular handwriting using the visitor's hand-font stack, inked character edges and individually tilted glyphs. The plates shrink to 1.08 × 0.23m, with 1.04 × 0.21m written fields, all attached to the existing five drawer fronts.
- **Architecture:** real GLB geometry, cameras, book pull/paper motions and cabinet movement are unchanged. Decorative art is excluded from raycasts. Both illustrated and original-material modes remain reversible. The window component is reused without edits.

## Review and publication gates

- Route: `/previews/dh-11c/authored-3d-v6/?v=dh11c5d3g-authored-handwriting-v1`.
- Compare previous V5 `/previews/dh-11c/authored-3d-v5/`.
- Confirm no glyph interference on ordinary or interactive books at the close-up bookcase camera; check every featured title for spelling and that it is genuinely appropriate for this writing room (the last eight are *not* automatically approved for live release).
- Check distinct handwritten pages on desktop, typewriter paper's original typed look, label proportions at whole-room camera, all five drawers, eight book movements, window art and reference-mode restoration.
- Keep `main`, `/worlds/writing/`, live catalogue and `davehub.co.uk` untouched. No source repository or private writing document is changed.

# DH-11C.5D.3I — Physical exit door returns to DaveHub

**Status:** isolated V8 staging review candidate, pending owner confirmation. The owner described the previous V7 room as looking good and requested a usable room exit.

## Required interaction

- From the overview camera, **first click/tap of the real exit door** selects it, moves to its curated door camera and opens the actual hinged 3D door. There is no extra focus-only click.
- **Second click/tap** of the physical door/open doorway navigates to the **homepage of the same deployment origin**, `/`. On `davehub.pages.dev` this means the *staging homepage*, not `davehub.co.uk`.
- The open portal contains a transparent, physically aligned and raycast-selectable Three.js mesh bounded by the real doorway. This provides a second click target even when the animated leaf has swung out of the way, without using a fake 2D frame or changing the original GLB.
- The accessible door controls use the identical action sequence: `Open the door`, then `Exit to DaveHub home`. The second activation directly navigates. There is no further close-door action on the V8 door, but the original real hinge remains operational.
- The destination action is only executed from an actual user activation (pointer up or button click). No automatic navigation on focusing, loading, opening or camera animation.
- If the visitor changes to the whole-room camera while the door stays open, a click on the doorway exits; view changes do not silently reset the physical door.
- The existing Escape/Whole-room camera and all other room interactions are unchanged. Original material comparison still works.

## Implementation

- Opt-in flag: `data-exit-door-proof="true"` on the isolated V8 route.
- Physical transition contract: `prototypes/dh-11c-room/door-exit.js`; delegates door state changes to the original `DH11RoomPlan.next` and provides a doorway-size mesh bound into the exact GLB or procedural rig.
- The original `room.js` activates the contract only on V8. Existing V7 and earlier previews retain their previous door-close and return-link behaviour. No changes to the geometry, actual hinge pivot, seven object focus targets, accessibility shell, source catalogues or room artwork.
- Preview route: `/previews/dh-11c/authored-3d-v8/?v=dh11c5d3i-door-home-exit-v1`.

## Tests / review gate

- Pure state-machine tests for two clicks from overview, keyboard/button parity, and return-to-overview with an open door.
- Physical target checks: transparent non-occluding planar mesh inside existing door aperture, initially invisible, raycast-selectable when open.
- Build and Cloudflare staging verification; legacy preview isolation. Verify physical open and halfway state, inspect from oblique camera, click the open gap, use mobile tap, activate the keyboard control, and confirm navigation to the staging homepage. The user should not have to click the door three times.
- Do not promote V8 into the published Writing world, `main` or `davehub.co.uk` without explicit owner approval.

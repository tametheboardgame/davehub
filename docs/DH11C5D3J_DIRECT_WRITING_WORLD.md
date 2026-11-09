# DH-11C.5D.3J — Writing island enters the real Manuscript Hoard directly

**Status:** staging integration candidate, pending CI and owner click-through verification. Production remains unchanged.

## Owner decision

On 5 November 2026 the owner accepted the functional Manuscript Hoard exit and requested the inverse navigation: clicking the **Writing island** must go straight into the new illustrated, interactive Three.js/GLB room. The old static Writing world landing experience can be retired.

## Staging navigation

- The homepage Writing island already links to `/worlds/writing/`. Retain that canonical URL, the `/worlds/` directory entry and old `#writing` deep-link routing.
- Replace only the **deployed staging output** for `/worlds/writing/index.html` with the accepted V8 room, as built by `render-dh11c5d3i-exit-door.cjs`. Do not redirect visitors to a technical preview URL or show the old static 2D Writing landing page.
- The existing door behaves as approved: click the real exit to open it; click the open doorway a second time to navigate to `/` (the same-origin DaveHub homepage).
- Remove the obsolete “Existing Writing world” link, “Illustration Lab”, test controls and comparison links from the **visible** visitor experience. Retain hidden calibration buttons required by the original 3D renderer; preserve the accessible Explore Objects menu, buttons, status updates, camera and movement controls. The heading reads “WRITING ISLAND”.
- Provide an actual no-script fallback back to DaveHub; no recursive link to the retired Writing landing page.

## Asset architecture

The canonical URL is `/worlds/writing/` with self-contained asset directories:
- `/worlds/writing/scene/`: immersive, architecture and illustration CSS plus the existing UI controller.
- `/worlds/writing/room/`: exact compiled Three.js room module, models, material scripts, motion code, GLTF/Three.js vendor files and the V8 door source copied from the validated staging preview output.
- `/worlds/writing/cabinet-glb/`: existing cabinet-proof stylesheet, which is a dependency of the inherited room template.

The document base points at `/worlds/writing/scene/`, ensuring that relative `../room/models/` GLB requests, `../room/` scripts and `./` styles resolve into the canonical Writing world rather than relying on continued hosting of `/previews/`. The skip link explicitly targets `/worlds/writing/#scene-nav` to remain accessible.

## Retiring the old content

- The existing public-content generator continues to build the same metadata and approved catalogue pages, and its fictional examples still go exclusively to `/previews/dh-08b/`.
- Only after that public generator finishes do we replace the staging `/worlds/writing/` result with the actual 3D room. The legacy 2D Writing page is no longer served at the canonical staging URL.
- Older source assets and comparison previews remain in the repo for regression/rollback. Do **not** delete the original project metadata or remove approved writing from the general catalogue. No personal unpublished manuscripts are added.
- Live `davehub.co.uk`, the `main` branch and upstream game/creative repositories remain untouched.

## Verification

1. Homepage Writing island, Explore all worlds Writing card and bookmarked `/#writing` must all lead to the real `/worlds/writing/` room, **not** to the old 2D scene or a preview link.
2. Confirm self-hosted room JS, local GLB files, furniture animation, material textures and window artwork load without using `/previews/` resources.
3. Validate page title and visitor navigation; ensure Illustration Lab/Test Controls are hidden but accessible objects work using keyboard and touch.
4. Click exit door once to open, then click/tap open doorway a second time to return to the same-origin homepage.
5. Confirm old static Writing scene is absent on staging, but fictional previews, general worlds, games, other creations and production are unchanged.
6. Pass repository discovery/build/regression tests and hosted Cloudflare HTTP checks before owner review. Only then consider future promotion to live with separate explicit approval.

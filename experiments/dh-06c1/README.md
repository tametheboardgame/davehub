# DH-06C1a/b — Workbench reference hand-off

**Status:** Art and pivot feasibility experiment, not an approved/deployed rig.

The 22 October 2026 ChatGPT conversation provides the following review files:

- `Giant-Dave-C1-Articulated-QA-Interactive.html`: single-file, embedded image interactive pivot QA, works offline in Chrome/Edge.
- `Giant-Dave-C1-Layer-Workbench.zip`: 13 reference/source RGBA layers (1536 × 2048), editable `.ora` with component images, generated pivot manifest and all QA contacts/interactive tester.
- `DH-06C1_joint-extremes_contact.jpg` and `DH-06C1_layer-inspection.jpg` inside ZIP.

No binary art is stored in GitHub yet. The ZIP is the transient visual review hand-off and cannot be used as a permanent Git revision. When a binary-safe path is established, preserve layer masters and record their hashes, then update the manifest to point at actual available asset files.

**Documented blockers:** The candidate base still contains the original idle forearm under the reached arm; extracted sleeve/forearm polygons reveal seams at some rotations and do not provide a complete wrist articulation. These are asset-painting defects; fix the underlying painted hoodie/shoulder and independent hand variants rather than adding interpolation frames.

Full QA and acceptance conditions: [C1 art workbench](../../docs/GIANT_DAVE_C1_ART_WORKBENCH.md) and [layered rig spec](../../docs/GIANT_DAVE_LAYERED_RIG_SPEC.md).

This experiment should remain on a draft PR until the artwork is genuinely coherent. Do not reference nonexistent image binaries from the Cloudflare homepage.

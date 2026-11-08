# DH-11C: Approved Writing Room checkpoint, promoted to main

**Owner decision:** 8 November 2026.  
**Scope:** The complete approved Writing Room implementation through DH-11C.6E.1, ready to revisit when connecting actual publication-approved content.  
**Release target:** `main` Git branch only. The actual live Cloudflare Pages project / `davehub.co.uk` remain unconfigured.

## Locked interaction baseline

- **Room:** Single actual Three.js scene, illustrated 3D geometry, real Blender-derived GLBs, shared camera and functional lamp, floating-islands window and hinged exit.
- **Bookcase:** Three original published editions on the top shelf, with distinctive spine colours and gold selection frames, physical pull-out movement and an edition detail view.
- **Desk:** Thirteen actual moving papers and a two-page fictional manuscript demonstration reader; original motion and native reader remain separate.
- **Typewriter:** Twenty-four actual key meshes, mechanical key actuation with keyboard/pointer input, and an explicitly opt-in temporary writing workshop.
- **Filing cabinet:** Five physical sliding drawers, twenty original 3D folder meshes, top-down overhead drawer selection after motion settles, separate illustrated file reader and links to the approved public bookcase and fictional desk samples.
- **Wastepaper bin:** Nine independent physical crumple/toss trajectories, user-driven unfolding/turning, visually prominent **Uncrumple paper** action and clicking the paper itself, separate actions to leave on the floor or reverse the actual 3D toss.

The final approved interactive build is `DH-11C.6E.1`. It is already hosted and owner-reviewed on `https://davehub.pages.dev/worlds/writing/`.

## Content freeze and next content-connection pass

- Preserve the three approved public books as bookcase records.
- The manuscript samples, archive folders outside the published shelf and wastepaper scraps are **explicitly invented examples**, not unpublished user projects. They may appear on the main branch because no private content has been imported.
- No real manuscripts, album audio, images/cover art, notes, unreleased scripts, Drive content or automatically ingested `davehub.json` records are to be substituted without a fresh owner review of rights, consent and publication status.
- **Do not expand Writing Room functionality for now**. Reopen this checkpoint when publication-approved content can be connected to the stable objects through a shared catalogue.

## Selective branch promotion

Because `staging` and `main` intentionally diverged during the permanent staging/live cutover, do not merge the entire staging branch. Only the approved Writing Room source files, renderer chain and applicable implementation docs are copied into a **main-based** release PR.

The original `main` deployment topology remains at `phase=staging_cutover`, staging app `davehub.pages.dev` follows the `staging` branch, the default-branch game-sync bot targets `staging`, and `production.configured=false`. Public game release pins and catalogue entries are unchanged. No DNS or Cloudflare project settings are altered.

The main-specific release builder assembles the entire room and explicitly checks the safe count of three public books plus nine invented scraps. Its independent regression tests also verify the original physical mechanics, native interactive controls and strict deployment segregation. The approved stage's full suite passed 325 core tests and 33 game tests before promotion.

## Next development target: DH-12A Listening Room

Move from the Writing Room to the Music world. Do not reuse the Filing Cabinet or generic article-list metaphor. Propose a distinctive, authored performance/listening space with real 3D geometry and in-scene interactive elements before adding approved recordings, album covers, songs, characters or musical scripts. The existing Music world remains a public-safe placeholder until a new stage is explicitly reviewed. Develop on `staging` and release to `main` only with separate owner approval.

# DH-08C4: Cloudflare-hosted first-wave design review

**Decision (28 October 2026):** Cloudflare links, not local Node/PowerShell setup, are the normal owner-facing review experience. The owner should be told **the URL and precisely what to look for**.

## Hosted design-only preview

Intended path in the existing Git-integrated **DaveHub staging Pages project**:

`https://davehub.pages.dev/previews/dh-08c/`

The Pages build now constructs this static preview under `dist/previews/dh-08c/` using `scripts/render-review-layout.cjs` and the **same shared content templates** as the real site.

- Landing page with the names **Unicorn Valley**, **The Stephen Martin Project**, **Tame The Board Game** and links to three layout-only creation pages.
- Category views for Games, Projects and Memory Lane.
- All twelve generated pages carry a prominent **DESIGN REVIEW ONLY — NOT PUBLISHED CONTENT** notice.
- Their descriptions are the **same inert placeholder**, not unapproved copy. All outgoing game/blog links, contributor notes, media, source repository metadata, and approval fields are omitted.
- The canonical live/public catalogue remains `{"schemaVersion":1,"items":[]}`. No new real-world project record is published through this preview. No localhost server, workshop import or private files are included in Pages output.

## Checklist to send with the link

1. On a desktop browser, open the review landing page and the three mock-up creations. Evaluate page layout, visual style, title sizing, empty-space balance and whether project pages feel integrated with DaveHub.
2. Inspect **Games**, **Projects** and **Memory Lane** category grouping. Confirm games share the Games destination and the blog belongs in its intended destinations. The reviews are provisional: none of the category choices authorises public publication.
3. Repeat on mobile: cards stack, text is readable, links are touch-friendly, the banner is visible and there is no sideways scroll.
4. Give actionable changes to layout and placement. Do **not** treat a layout approval as approval of descriptions, collaborators' rights, external links, or game asset publication.

## Deployment verification (must not overclaim)

GitHub Actions tests the build output, not Cloudflare's remote deployment. A Pages project connected via GitHub should deploy `main` to its configured `davehub.pages.dev` hostname, but confirm in the Cloudflare dashboard/checks or by opening the real URL before saying the review page is live. If the auto-deploy is disabled or failed, report that instead. A `pages.dev` URL or `noindex` header is **not** access control.

Cloudflare branch previews are public unless **Cloudflare Access** protects them. Therefore **the first-wave editable Content Workshop drafts and actual unapproved descriptions remain outside any Cloudflare deployment**. Private review of actual copy requires an authenticated Access-protected workflow and its access policy to be verified first. Do not try to fake access control with a JavaScript password or obscure path.

## DH-08C5: Staging homepage and world navigation correction

The first hosted review was generated correctly but **not reachable through the normal homepage islands and Explore destinations**: the canonical public catalogue was intentionally empty and those links rendered empty areas. This was an integration error, not missing editorial approval.

With the DH-08C5 staging bridge, when and only when the browser hostname is exactly `davehub.pages.dev` and the approved canonical catalogue is still empty, visits to `/worlds/` and the seven `/worlds/<category>/` paths are redirected to their matching **design-only** paths under `/previews/dh-08c/`. The root homepage and the destination paths themselves remain unchanged. The future `davehub.co.uk` live domain never redirects. Once approved content exists, the build omits the staging redirect.

Design-review destinations now show three named cards across the relevant categories: Games (three including the board-game blog), Projects (two games), Writing and Memory Lane (the blog). Categories without a first-wave nominee show a clear explanation and navigation back to populated review areas instead of a misleading blank live-catalogue message.

This does **not** add or approve any actual work. The public catalogue remains empty. The review cards display title-only project references, generic placeholder text, no live play/blog links, no media, no private notes, and no publication approval flags. A public `pages.dev` hostname is **not** access-controlled. An authenticated system is still required before showing the owner's full unpublished editorial text on the web.

**Owner QA:** On `https://davehub.pages.dev/`, click the Games and Projects islands (or Explore). They should navigate to the first-wave design-only views with named project cards, not empty public categories. Writing and Memory Lane should show the board-game blog. Experiments/Music/Unfinished should explain the first wave has no nominations and link to other views. Review visual presentation on desktop/mobile. If the links still point to blank areas, confirm the latest Cloudflare Pages deployment contains the merged commit; GitHub Actions build success is not a Cloudflare HTTP deployment confirmation.

## Future workflow

- Changes to staging -> CI -> Cloudflare preview URL -> owner gets URL and precise QA checklist.
- No local-run instructions unless the owner explicitly requests a development setup.
- The final three real project descriptions, outgoing links, contributor permissions and publication status require separate owner approval and a distinct checked catalogue PR.
- Future `davehub.co.uk` live deployment retains the already-decided independent Cloudflare Pages staging/live promotion workflow. `davehub.pages.dev` remains staging.


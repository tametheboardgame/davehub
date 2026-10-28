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

## Future workflow

- Changes to staging -> CI -> Cloudflare preview URL -> owner gets URL and precise QA checklist.
- No local-run instructions unless the owner explicitly requests a development setup.
- The final three real project descriptions, outgoing links, contributor permissions and publication status require separate owner approval and a distinct checked catalogue PR.
- Future `davehub.co.uk` live deployment retains the already-decided independent Cloudflare Pages staging/live promotion workflow. `davehub.pages.dev` remains staging.


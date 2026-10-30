# DH-10C — Hosted editorial discovery and owner-controlled publication

**Status:** initial implementation on `staging` feature PR. The owner decided to finish `davehub.pages.dev` first; `davehub.co.uk` is intentionally untouched.

## What this delivers

- **Hosted read-only review desk:** `https://davehub.pages.dev/review/`. It reads the owner's **public** GitHub repository markers directly, displays only a project title, ID, source name, category labels and whether an item is already in the approved DaveHub catalogue. It does **not** display draft text or any non-public material.
- **Owner-authenticated proposal workflow:** GitHub Actions → **DH-10C owner-reviewed catalogue proposal**. Requires a GitHub account with write access, the `staging` branch selection, four individually checked editorial/rights attestations and a precise confirmation phrase.
- **Three operations:** `publish` (new public work), `revise` (owner-reviewed public description and categories), `withdraw` (remove a published listing). This does not remove games or source code from their independent upstream sites; withdrawn catalogue pages disappear at the next staging build.
- **Publish only by review:** bot generates a fresh short-lived review branch and opens a pull request **against staging**. The site does not change until the owner reviews and merges that PR. Source `davehub.json` never grants automatic publication permission.
- **Source validation:** public owner-owned GitHub repo only, exact public marker, strict URL validation, duplicate prevention, no unapproved media copied, no overwriting unrelated published works, no dangling relations on withdrawal and strict post-change catalogue validation.
- **History:** GitHub PR history becomes the visible audit trail for all changes. There is no unattended editor login endpoint or reusable approval token on Cloudflare.

## User workflow (browser only, no local commands)

1. Open `https://davehub.pages.dev/review/` and look at currently opted-in public projects. A GitHub API rate-limit warning has a link to the weekly discovery report.
2. Open the **Prepare a publication proposal** link. Sign in to GitHub if required, and select **Run workflow** on the `staging` branch.
3. Select **publish**, **revise** or **withdraw**. Copy the source repository name (for example `tametheboardgame/ordinary-universe`) and ID from the review page.
4. For publish/revise, supply a **fully public and explicitly approved synopsis**. Optional `categories` accepts recognised comma-separated world IDs (for example `writing,projects,experiments`). Omit to use the source marker's categories.
5. The form must include confirmation `I APPROVE THIS PUBLICATION PROPOSAL` and four true attestations for contributor/rights, title/synopsis/category metadata, working destination/source links and media review. **No images or recordings are copied by this version.**
6. The workflow fetches the public marker at the current source default branch, validates the candidate and prepares a diff to `content/public/catalogue.json`. It writes to **a PR branch**, never directly to `staging`.
7. Review the PR diff and CI checks. If approved, merge into `staging`. Cloudflare then builds the current approved site and pages. Verify the resulting `/creations/<slug>/` page and category views.
8. A review can be cancelled by closing the proposal PR and optionally deleting the unused PR branch. An item is withdrawn only after a reviewed withdrawal PR is merged.

**Note:** GitHub may require **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**. If disabled, the workflow will push the safe review branch and report the GitHub compare URL in its failed job. Do not enable arbitrary external contributor write access.

## Security and deliberate limitations

This is a **public staging website**, not an authenticated private workspace. Never enter private drafts, account details, unapproved photos, scripts, full lyrics, unreleased work or collaborator details into the public source marker. The `/review/` page displays only already-public metadata and never displays unapproved synopsis copy.

The Github Actions form is authenticated by GitHub and only permits `tametheboardgame` to propose catalogue changes from `staging`. Published records still require a human PR merge. The workflow does not itself check real-world copyright/likeness permissions: the owner attests those and performs the substantive review. A published source marker may be changed later without automatically rewriting the already approved DaveHub listing. Editing source links, adding approved media or changing all child relationships requires a subsequent reviewed extension.

Browser discovery uses unauthenticated GitHub public API endpoints. GitHub rate limits, network requests or third-party extension blocking can make the list temporarily unavailable. The weekly GitHub Actions report is the fallback. GitHub PR proposals and the catalogue remain independent of the browser discovery response.

**GitHub Actions workflow discovery:** a workflow must exist on the repository's **default `main` branch** to appear reliably in the GitHub Actions **Run workflow** menu. The staging implementation is therefore paired with a separate workflow-only main-branch PR. That does not launch the production website and is marked `[CF-Pages-Skip]`. Workflow dispatch is constrained to the `staging` ref and checks out staging code.

**No production-domain action:** `davehub.co.uk` is not configured or deployed. The `staging` project remains the sole public preview for newly approved work.

## Next slices of DH-10C

- Review and (after explicit owner approval) publish **The Ordinary Universe** and **October Film Marathon** as the first new content proposals.
- Create convenient GitHub issue-form/editor front-end if owner feedback shows the workflow dispatch form is cumbersome.
- Build safe, reviewed media upload and external creative-work intake for books/music/other work without a GitHub repo.
- Track source manifest changes as *suggestions* only; never silently overwrite approved content.
- Evaluate optional password-protected private workshop storage separately from the public Pages build.

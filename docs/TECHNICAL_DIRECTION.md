# Technical direction (provisional)

The interaction is still undecided, so choosing a giant technology stack now would be premature.

## Candidates

- **Content-oriented shell:** Astro, with bespoke interactive islands where useful.
- **2D / 2.5D runtime:** Canvas and PixiJS as possibilities for the mechanical or spatial concepts.
- **3D runtime:** Three.js only if a tested concept earns the complexity.
- **Hosting:** Cloudflare is a good candidate; no account, deployment or environment is yet configured.
- **Editorial content:** GitHub-managed Markdown/MDX and typed metadata first.
- **Database:** No database needed for concept prototypes. Consider Supabase only for real stateful features.
- **Testing:** Browser interaction, unit tests, responsive screenshots, keyboard and accessibility smoke tests when implementation begins.

## Suggested separation

1. A fast shell handling content, search, direct URLs and navigation.
2. A replaceable interactive layer for whichever prototype proves worthwhile.
3. A portable project/update content schema.
4. Narrow-scope integrations providing only reviewable publication drafts.

## Guardrails

- Preserve game/app repositories and their own deployments.
- Never use employer/private data as production showcase content.
- Keep secrets off the client and out of Git.
- No content auto-publication, even if it comes from an already accessible repository.
- Use British English.

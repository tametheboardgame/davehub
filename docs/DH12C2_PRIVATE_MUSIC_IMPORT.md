# DH-12C.2: private music integration

## Scope
This iteration connects seven verified private repositories to a **read-only, explicitly allowlisted** importer. It preserves the existing public DH-10 discovery, unaltered public catalogue and production branch.

- berserk-llama-syndrome
- residualreflection
- when-victory-falls
- form-and-focus
- music-archive
- the-iron-road
- vegan-the-musical

Each source is read from `main` using the two existing files `davehub.json` and `catalogue/project.json`. The importer validates the schema, source identity, release types and input bounds. It does not retrieve audio, images, lyrics, Drive documents or arbitrary URLs.

## Authentication
Create a fine-grained GitHub token with **Contents: read-only** access to the above private repositories only, and store it as `DAVEHUB_MUSIC_READ_TOKEN` in the **DaveHub repository Actions secrets**.

Run the manually triggered GitHub workflow `.github/workflows/dh12c-private-music-check.yml` to verify connectivity. The normal DaveHub workflow token cannot read other private repositories. The verifier neither uploads source data nor publishes any output artifact because DaveHub's own GitHub repository is public.

## Publication gates
The private importer creates only a bounded in-memory *review* snapshot. `publicProjection` returns release names only when:
1. The source repository has explicitly enabled its `davehub.json` marker.
2. The source catalogue has `publication.status="public_approved"` and `davehubReady=true`.
3. A distinct DaveHub owner approval record for the exact release has an approval date plus positive rights, metadata, links and media reviews.
4. The release status is an existing or scheduled release.

The first public projection contains **only** an artist name, release title, type, status and optional planned date. No audio, lyrics, tracklists, URLs, cover images or raw private metadata pass through.

`content/music-publication-approvals.json` starts with zero approvals. The browser-visible `prototypes/dh-12b-music-world/approved-catalogue.json` starts with zero releases. Neither is automatically replaced with a private repository snapshot.

## Record Shop and deployment
The Record Shop can load the same-origin public projection and display approved entries in the appropriate rack without changing the 3D crate mechanics. An empty projection shows no unapproved catalogue. The production branch remains untouched.

A future, explicitly reviewed approval-and-export operation is needed to populate the public projection. Do not add the private token to Cloudflare client-side variables, commit it to Git, or bypass these gates through the build script.

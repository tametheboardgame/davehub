# DH-12B.4: The missing Music island on the DaveHub homepage

**Owner observation:** The approved illustrated DaveHub homepage has Writing, Games, Experiments and Projects hotspots but no Music island. This leaves the otherwise operational Music-world foyer and its musicals/record-shop portals effectively undiscoverable.

## Change

Add a fifth **Music** floating-island navigation hotspot to the **actual homepage** at the natural illustrated central-right floating sky / castle region. Reuse the existing icon-music SVG symbol and the same semantic link, keyboard focus, hover and pointer behaviour as the other four worlds.

- Position on desktop around **64.5% from the left and 32% from the top**, between Games and the right-hand Experiments/Projects areas, not over the Dave character or central logo/Explore call-to-action.
- Use subtle golden musical glow to distinguish Music visually without creating a mismatched flat content card.
- Responsive positions: tablet x62%, y31%; normal phones x37%, y32%; very narrow phones x36%, y30%; short landscape x60%, y32%.
- The link goes **directly to the existing interactive dimensional Music foyer**, `/previews/dh-12b/music-foyer/`, which then provides actual hinged doors into the musicals theatre and record shop.
- Return from the foyer header goes **home** (`/`) to the same Music island, not to the old static `/worlds/music/` placeholder.
- Existing Writing, Games, Projects and Experiments links are entirely unchanged. The Explore DaveHub button and giant transparent animated Dave are unchanged.
- Add automated checks for five visible anchors, responsive placement, direct navigation, return path, and actual hosted home HTML and CSS.

## Publication boundary

This goes into **`staging` and `davehub.pages.dev` only** for owner review. Do not merge the homepage addition into `main` / `davehub.co.uk` or replace `/worlds/music/` until the user approves the full music entrance for production. The destination remains explicitly a noindex interactive preview, with unpublished music intentionally absent.

## Owner test

Open **https://davehub.pages.dev/** and look for the Music island in the central-right illustrated floating islands. Click it and verify the full **World Between Notes** foyer loads. Open either door and return via its header; confirm **Home islands** reaches the new Music link again. Check the homepage at normal desktop, tablet, phone and short landscape sizes to ensure all five hotspots are clickable without covering Dave or the central logo.

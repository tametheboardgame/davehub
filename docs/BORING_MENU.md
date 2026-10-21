# DaveHub — "I want to view this as a menu coz I'm boring"

**Decision:** Approved, 21 October 2026.

## The joke

Visitors can admire the ambitious creative mindscape or decline it and receive an **actual, wonderfully basic, late-1990s HTML website**. The contrast is deliberately ridiculous and is part of DaveHub's character.

**Exact visible link label in immersive mode:**

> I want to view this as a menu coz I'm boring

## Appearance

- A plain white, pale-grey or browser-default background with little visual ornament.
- Plain document flow; ordinary heading, paragraphs, separators and nested lists where appropriate.
- A Times New Roman / default serif feel and conspicuously blue underlined links.
- Minimal styling, or browser-default HTML styling; simple horizontal rules.
- A tiny strip reading something like "DaveHub - the boring version" and an easy way to return to the interesting version.
- Optional tongue-in-cheek old-web detail can be prototyped, but avoid intrusive blinking, forced audio, unreadable animation or inaccessibility.

## Function

- No immersive WebGL/Canvas environment needed; load quickly even on a low-power device.
- A working navigation list for games, writing, experiments, projects, archive and updates, subject to catalogue design.
- Every listed item opens a real project page or approved external deployment.
- Both visual and boring modes use the **same source of truth** for names, descriptions, URLs and updates. No duplicate manual editorial systems.
- Preserve stable URLs and direct-link access. Switching mode should not erase the selected project.
- Responsive by default through simple document flow and link targets.
- Semantically correct headings, navigation and focus states; usable with keyboard and assistive technology.
- Suggested route `/boring/` (working proposal, not implemented). A "Make it interesting again" link goes back to immersive mode.

## What NOT to do

- Do not turn the boring mode into a slick card grid, a Bootstrap theme or a simplified copy of the main UI.
- Do not keep the massive illustrated world as the background.
- Do not recreate an inaccessible authentic 1990s mess. It should look primitive **by design** while remaining genuinely accessible and useful.
- Do not build a separate content system. Same project catalogue, very different rendering.

## Acceptance

1. Boring-menu link is visible on the landing page and during relevant exploration.
2. It opens a deliberately basic HTML page in one action.
3. A visitor can reach every approved project without the rich graphics loading.
4. Returning to immersive mode is obvious.
5. No special movement, audio, modern glossy controls or large scene assets are required.

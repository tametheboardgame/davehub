# DH-07E — Static Giant Dave and mystical Explore portal

**Date:** 27 October 2026
**Status:** Branch preview candidate; owner visual approval pending.

## Changes

### Static Giant Dave
- Reused an earlier DaveHub illustrated **transparent single-pose** character asset (bald, short ginger/brown beard, navy hoodie, olive shirt and inviting near hand) as a temporary **static** illustration, not a new character identity.
- Converted original PNG to lossier, visually faithful, transparent WebP for the browser: **989 × 1448 px, 177,526 bytes**.
- Source for the generated WebP was the existing conversation-backed creative file `image(5).png`; output SHA-256: `82a82b44de83f19782c05e79a907394f7693455d6b80ee9564ac41933f3b2962`. Git blob SHA: `7fe69ab6441f4a53285f4a64ce65ef8965557911`.
- Final branch asset: `assets/characters/dave/dave-static-v1.webp`.
- Dave now sits in `#dave-stage`, independent of the background. The frame and icon hot spots remain structurally unchanged. The character never accepts pointer events.
- Positioned/scaled via responsive CSS; the user will review overlaps at real screen sizes. The asset is a *temporary site-placement still*, **not** a statement that this is the animation's locked final frame.
- Future animation integration can replace or overlay `.dave-stage__still` while retaining this still as reduced-motion/no-video fallback.

### Mystical Explore portal
- Reuses the exact existing approved floating-islands background as a dimmed illustration layer **inside the modal**, not a newly generated or unrelated image.
- Warm golden-rim doorway, constellation / orbit decorations, cool cyan-blue glow and softly arched category cards inspired by the original scene.
- Same four island links and Explore CTA. The previously removed bottom duplicate menu stays absent.
- Same catalogue categories, links, keyboard behaviour and DOM-based text insertion. Cosmetic changes only; existing modal links remain actual anchors.
- Respects reduced-motion preference and independently scrollable mobile modal.

## Cloudflare output

Build script now copies `assets/characters/dave/dave-static-v1.webp` to the Pages output in addition to original logo, background, and fictional DH-07C test worlds. Preview should contain:
- `/` — homepage with static Dave
- `/#explore` — mystical world directory
- `/previews/dh-07c/?view=shelf` — the fictional unfinished-work prototype
- `/previews/dh-07c/?view=musical` — the fictional musical prototype

## Validation

- GitHub tree confirms `dave-static-v1.webp` as a **binary image blob of 177,526 bytes**; Python-calculated Git blob SHA matches the committed Git object.
- Static branch checks PASS: four island hotspots, single Explore CTA, no redundant bottom navigation, static asset referenced and copied in build, mystical stylesheet reference, no pointer interception, balanced CSS braces, JS source compilation.
- Cloudflare deployment must be confirmed from successful GitHub/Cloudflare check and preview URL; browser visual QA for layer overlap, responsive character scale, modal readability and close/keyboard behaviour remains for owner review.

**Publication safety:** All creative catalogue examples remain fictional. No unfinished private writing, real historic archive, third-party audio or employment material is exposed.

## Owner screenshot review and placement correction (27 October 2026)

The owner approved the **mystical Explore menu** but rejected Dave's initial alignment: the temporary still was clipped against the left edge and interfered with the Writing hotspot. This targeted correction reduces the image's height (desktop **82–84svh** instead of **95–102svh**), brings it horizontally into view (about **-2.6vw** instead of **-10 to -12vw**), and lowers the figure so his head is beneath the Writing label. Mobile uses a smaller **60–61svh** version and modest negative offset; tablet and landscape overrides are adjusted independently. The near hand should remain visible.

A composite position study against the owner's original no-Dave screenshot was inspected before applying this change. It is a **visual approximation, not a deployed browser render**. The actual new Cloudflare preview still requires desktop/mobile visual confirmation. The Explore modal styling and destination data have not changed.

## Second placement refinement (27 October 2026)

Owner likes the lower-left composition but wants Dave **a little bigger and further right**. The static still has been enlarged by approximately 7% (large desktop `84svh` → `90svh`, ordinary desktop `82svh` → `88svh`) and shifted horizontally to `left: 0` on desktop. Bottom offsets increase proportionally so his head remains beneath Writing rather than rising back over the hotspot. Tablet and mobile variants have correspondingly smaller adjustments; all other homepage and mystical Explore portal CSS is untouched. Owner browser visual confirmation is still the release gate.

## Acceptance to complete

Owner verifies:
1. Dave looks coherent and placed correctly on the homepage, including desktop and mobile; hotspots/logo/CTA not compromised.
2. Explore looks like entering the floating-islands universe rather than a generic rectangular menu; categories and links remain readable.
3. No visible layout regression or unexpected scrolling.
4. Accepts static Dave's interim pose pending owner's finished animation.

No automatic production merge without owner approval.

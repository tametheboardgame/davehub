# DH-11C.6C.1 — The desk reader and typewriter workshop

**Status:** Staging review candidate on a feature branch. **Public content:** fictional demonstration passages only.

## Owner request

After approving the three edition-coloured top-shelf books, give the desk and typewriter their own experiences. Do not turn them into the same generic information popup or sacrifice the physical 3D room, which remains the main interface.

## Desk: The Manuscript Archive

- First click focuses the genuine desk; click one of its actual 13 separate 3D papers to slide the sheet out and open a paper-style reader. A keyboard alternative is under **Explore further → Read a manuscript**.
- The reader uses a native accessible dialog, hand-paper treatment, title/chapter/page labels, previous/next navigation, and left/right arrow keys. Close, Escape and backdrop click return to the same selected desk. The sheet stays moved until clicked again.
- Thirteen sheets currently rotate through **three clearly labelled fictional demonstrations**, each with two pages. None contains real work, private Drive manuscripts, or unpublished writing.
- The UI and content shape are separate: `MANUSCRIPTS` consists of an ID, title, kind and ordered pages with heading and paragraphs. The same renderer can later accept deliberately approved extracts and illustrations, with no change to room navigation.
- The lamp continues to toggle by clicking its genuine 3D parts; keyboard lamp controls remain available in Explore further.

## Typewriter: Creative Workshop

- First click focuses the genuine typewriter. Click a physical key again to open the workshop; the **Explore further** prompt opens it directly.
- A distinct dark typewriter-themed surface contains a lined blank page, cycling writing prompts, live word/character counts, copy control and new-page control.
- Text stays only in the current page's memory; **no storage, network submission, or publishing**. Visitors must deliberately copy their writing to retain it.
- Typing single characters in the workshop still triggers the 3D model's real key/paper animation.
- Close, Escape, or backdrop returns to the same selected typewriter. Earlier V8 creative previews are unaffected.

## Boundaries and acceptance

1. Only `/worlds/writing/` staging uses `data-manuscript-experience="true"`. The old art previews, production domain and global public catalogue are unaffected.
2. Finished books continue to use their existing complete product dialogs, exact colours, click targets and gold frames.
3. Do not expose real unpublished manuscript excerpts until the owner has explicitly approved their contents.
4. Validate mouse, touch, keyboard, focus restoration, short/tall/mobile viewports, Escape behaviour, and real geometry interaction.
5. Cloudflare staging needs a successful build, CI and owner visual review before any promotion to `main` or `davehub.co.uk`.

The filing cabinet and approved real manuscript ingestion are separate follow-on work packages.

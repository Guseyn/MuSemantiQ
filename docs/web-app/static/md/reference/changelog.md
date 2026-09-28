# Changelog

What changed, newest first. There are no releases yet: the version in `package.json` has been **1.0.0** since the file was added, there are no git tags, and `msq --version` prints that same **1.0.0**. So this list is grouped by date, and it is taken from the commit history of the repository.

Anything that breaks existing documents or existing pages is marked **Breaking**.

## 1. How this list is kept

> **TO WRITE**
> - how a version will be decided once there are releases
> - how this list is kept up to date from then on

## 2. The changes

### 2026-09-24

- The documentation site and the landing page, as a third app beside the browser example and the dev tools: `npm run docs` at **https://127.0.0.1:8890**.
- `npm run docs:check`, which parses every example in the documentation and fails if one is not wrapped, does not parse, or uses something its page has not introduced yet.
- `npm run docs:art`, which engraves the two pieces of artwork on the landing page from MSQ.

### 2026-09-19

- The parse-only half of the API moves to `src/language/api.js`. It is re-exported from `src/api.js`, so nothing that imports from there changes.
- `src/language` is served to the page as a tree of its own, `js/msq/language/`, beside `js/msq/web-components/` and `js/msq/worker/`, so the editor can parse on the main thread without loading the drawer, the fonts and the MIDI engine.
- **Breaking** for pages with their own import map: the `#msq/` specifier is now `#msq/web-components/`, `#msq/language/` is new, and `#msq-worker/` is gone.
- The worker answers a new `glyph.trace` message, which the font viewer uses instead of loading the font a second time.
- The editor cuts, copies and pastes a whole line with Cmd/Ctrl+X, C and V when nothing is selected.

### 2026-09-18

- **Breaking:** the **Petaluma** and **MuseJazz** music-js tables are removed, so a document that says `music font is petaluma` now gets an error saying `petaluma` is not recognizable. The `.otf` files stay, and the font generator is how a table would come back.
- The repository is restructured: `tools/` (it was `src/tools`), `test/` for the three suites, and `web-components/` for the `msq-*` elements, which are copied into each app.
- New dev tools: the MusicXML tool, the music font generator and the sound font generator. The font viewer covers all three font families, and the test viewer can write, edit and delete tests.
- The `msq-editor` gets a settings view: autocomplete, highlighting, the colour of the played note, the colour of the reference box, and the sound font.
- Twenty-six new visual tests for chords, for Bravura and Leland alike, and the coverage thresholds raised to match.
- Fixes: a `.DS_Store` in a test folder was read as a test, and a failure in the first font's visual tests stopped the second font's from running.

### 2026-09-13

- The serializer: `serialize` writes a parsed page back as MSQ text, with one spelling for each command, and the serializer test suite round-trips it.

### 2026-09-09 to 2026-09-12

- The CLI, `npm run examples:cli`.
- The SMuFL to music-js font generator and the Magenta sound font builder, ported to Node.
- The editor's font autocomplete comes from the fonts that are actually registered.
- The font viewer.

### 2026-08-22 to 2026-09-08

- The web components as native customized built-in elements: `msq-font-loader`, `msq-svg`, `msq-midi`, `msq-svg-midi` and `msq-editor`, all talking to the engine in a worker.
- The MIDI player, ported from html-midi-player.
- The browser example loses its EHTML and e-ui dependencies.
- **2026-08-25:** the project is renamed from **Repertoire** to **MuSemantiQ**, the license and its credit lines with it.

### 2026-07-04

- A server for the browser example, on nodes.

### 2025-11-01 to 2025-12-21

- The high-level API: `src/api.js` for one page, then for multiple pages.
- The audio tests.
- All fonts are loaded from a config before anything is parsed or drawn.
- Native import maps, `@tonejs/midi` vendored, and the `jsonschema` dependency removed.

### 2025-10-26 to 2025-10-31

- The first commit.
- The GPL replaced with the Credited Source License (CSL) v1.0.
- The visual tests.

Read next: [What MuSemantiQ is](/docs/getting-started/what-it-is)

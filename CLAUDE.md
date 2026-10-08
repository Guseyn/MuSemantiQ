# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

MuSemantiQ ("MSQ") is a semantic music engine: a text language for music, parsed into a page schema, engraved to SVG and performed as MIDI. Plain Node ≥22 ESM, no bundler, no runtime npm dependencies — third-party code (opentype.js, svgpath, @tonejs/midi, midi-file) is vendored under `src/drawer/lib` and `src/midi/lib`.

## Commands

```bash
npm run test:all                           # visual + audio + serializer suites
npm run test:visual:all                    # also: audio, serializer
node scripts/visual-tests.js --only=chord  # run only tests whose name contains "chord" (all three runners accept --only)
npm run coverage && npm run coverage:check # c8; thresholds: statements 87, branches 86, functions 82, lines 87

npm run dev-tools:setup  # download nodes, EHTML and e-ui from GitHub (asks first), copy src, web-components and fonts in
npm run dev-tools        # https://127.0.0.1:8889, the server only — test viewer, font generator/viewer, MusicXML, sound-font tools
npm run browser-app:setup # copy src, web-components and fonts into the app (once, and after changing them)
npm run browser-app      # https://127.0.0.1:8888, the server only
npm run docs             # https://127.0.0.1:8890 — landing page + documentation (runs docs:check first)
npm run docs:check       # validate every example in docs/web-app/static/md
npm run docs:pipeline    # re-engrave the landing page's "How it works" artefacts (committed)
npm run cli-app -- --input score.txt --svg --midi
npm run create:msq:worker -- -o static/js/msq/worker  # only the worker, relative imports, any mount point
```

`dev-tools:setup` downloads nodes, EHTML and e-ui as zips from GitHub (`scripts/download-dev-tools-libraries.js`, `--yes` skips the question); `dev-tools:vendor` copies them from sibling checkouts instead (see [Sibling libraries](#sibling-libraries-nodes-ehtml-e-ui)), which picks up unpushed changes. `docs` expects them already copied: run `npm run docs:vendor` first (it also copies e-dev).

## Tests are golden-file comparisons

Each suite is a corpus of `.txt` MSQ inputs (pages split by `====next page====`) with committed `expected/` artifacts per output kind:

- `test/visual-tests/<font>/` (bravura, leland) — svg, page-schema, html-highlights, errors, custom-styles, comments, char-progressions
- `test/audio-tests/` — the same plus midi and midi-settings
- `test/serializer-tests/` — round trip: stored parser output → `serialize` → MSQ text (compared to `msq/expected`) → parsed again and compared to the inputs

Every run writes `actual/` for every test, pass or fail, and merges verdicts into `list-of-{passed,failed}-tests.json` (an `--only` run keeps other tests' verdicts). To accept a new baseline, copy `actual` over `expected` — per test/artifact via the dev-tools test viewer (`/html/test-viewer.html`), or by hand. Never update `expected/` without confirming the diff is intended. Output must be byte-for-byte deterministic; that is why `setupFonts` loads fonts in a fixed order.

## Architecture

**Pipeline (`src/api.js`)** — `setupFonts` → `generateIntermediateStructuresFor{Single,Multiple}Page(s)` → `generateStylesFor…` → `generateSvgFor…` / `generateMidiFor…`. Multi-page SVG stacks pages vertically; multi-page MIDI concatenates every page's `measuresParams` into one timeline.

**Language (`src/language/`)** — `api.js` is the parse-only half of the API (re-exported by `src/api.js`) so pages can parse without loading the drawer, fonts or MIDI. **Nothing in `src/language` may import outside it**: it is served to browsers unmodified.
- `parser/parsedLanguage.js` tokenizes line by line and runs *scenarios*. Each `parser/scenarios/add*Scenarios.js` registers named scenarios (`condition`, `action`, `actionOnlyForHighlightingWithoutRefIds`, `startsOnNewLine`, `itIsNewCommandProgressionFromLevel`, `prohibitedCommandProgressions`, …) into `parserScenarios.js`. The stack of active scenario names ("progression of commands") decides which scenarios can fire next (`mapWithScenariosAndScenariosWhereItIsRequired.js`).
- One pass builds `pageSchema`, `customStyles`, `midiSettings`, comments, errors (non-fatal), and the editor's highlight HTML. `ref-id` attributes in that HTML link editor text to SVG elements and MIDI timestamps.
- `schema/` validates page schemas; `serializer/` turns parser output back into MSQ text.

**Drawer (`src/drawer/`)** — `elements/<concept>/` are curried builders, `element(params)(styles, left, top)`, returning positioned SVG element trees; `page/page.js` is the root and `basic/svgAsString.js` serializes. `generatedStyles.js` derives all spacing from stave-line spacing plus font metrics. Music glyphs come from `font/music-js/<font>.js` tables generated from SMuFL fonts by `tools/smufl/`; only bravura and leland have tables, so only they may be listed in font configs.

**MIDI (`src/midi/`)** — `midi.js` walks `measuresParams` into time frames and returns MIDI bytes plus `timeStampsMappedWithRefsOn` / `refsOnMappedWithTimeStamps` for score ↔ playback sync.

**Browser delivery** — `src/worker.js` exposes the API over `postMessage` (`fonts.setup`, …). Module workers get no import map, so `scripts/copy-msq-into-apps.js` writes a copy of `src/` with `#msq` specifiers rewritten (via `worker.importmap` in `package.json`) into each app's `static/js/msq/worker/`, plus an unmodified `src/language` copy into `static/js/msq/language/` for main-thread parsing. `web-components/` (`<template is="msq-*">`, the editor) is copied into each app by `web-components:update`. All of these copies, fonts (symlinked by `setup:symlinks`) and vendored libs are gitignored — edit only `src/` and `web-components/`; `watch:src` / `watch:web-components` keep copies current.

**Tools (`tools/`)** — SMuFL → music-js font generation, MusicXML import/export, Magenta sound-font rendering; used by dev-tools, not shipped in the worker.

## Sibling libraries: nodes, EHTML, e-ui

All three are the maintainer's own zero-dependency, no-build libraries, living in sibling repos under `../../my-projects/` (`nodes.js`, `EHTML`, `e-ui`). They are copied in with `rsync -a --delete` by the `*:vendor` / `*:update` scripts, so **a local edit to a copy is wiped on the next run — fix bugs upstream in the sibling repo, then re-vendor**. The dev-tools and docs copies are gitignored. The browser app's copies (`browser-app/nodes/`, `static/css/e-ui.css`) are committed and refreshed only by `nodes:update` / `eui:update`, which `browser-app` does not run.

### nodes (server)

HTTP/2 backend framework built on Node's `cluster`. Every app (`browser-app`, `dev-tools`, `docs`) has the same layout under `web-app/`:

- `main.js` reads `env/${ENV:-local}.json` (port, host, TLS key/cert) and calls `cluster(primary, worker)({ config, numberOfWorkers })`
- `primary.js` holds primary-process setup (usually empty)
- `worker.js` calls `server(app({ indexFile, api: [...endpoints], static: [src(regexp, { baseFolder | mapper, … })] }))`

Each app imports its own copy through its own specifier: `#nodes/*` (examples), `#dev-nodes/*` (dev-tools), `#docs-nodes/*` (docs). Endpoints are defined with `endpoint()` and `body()` (see `dev-tools/web-app/api/`). **`src` static mounts resolve paths with a plain `path.join` and no traversal check.** Any mount that reaches outside `static/` must go through a `mapper` using `resolveInside` (`dev-tools/web-app/api/shared.js`), as the `/tests/`, `/tools/` and `/glyph-examples/` mounts do. nodes has no URL rewriting, so a mapper that returns a constant path is how docs serves one shell for every `/docs/...` URL.

### EHTML (page behaviour)

Custom elements and `<template is="…">` extensions for fetching JSON, templating and actions, with no bundler. Pages load it through the import map (`"#ehtml/": "/js/ehtml/"`, `"#ehtml/main": "/js/ehtml/main.js"`) and `import '#ehtml/main'`. The dev-tools and docs pages use `<e-json>`, `<template is="e-for-each">`, `e-if` and `e-reusable`. Their scripts also import EHTML internals directly (`elm.js`, `ajax.js`, `getNodeScopedState.js`, `evaluatedValueWithParamsFromState.js`, `actions/…`).

EHTML also ships **showdown**, the markdown converter the docs site renders with. `scripts/check-docs-examples.js` loads it from `docs/web-app/static/js/ehtml/showdown/showdown.js`, so `docs:check` needs `docs:ehtml:update` to have run.

### e-ui (design system)

`e-ui.css` (design tokens as `--e-*` CSS variables, layout, forms) plus custom elements in `#e-ui/` (`e-tab(s)`, `e-toast`, `e-dialog`, `e-confirm`, `e-sidebar`, …). It is designed to run alongside EHTML: components initialise on EHTML's `ehtml:activated` event. dev-tools uses it throughout; the docs shell uses it; **the docs landing page deliberately does not** (it has its own `landing.css`).

### e-dev (docs only, local only)

Lives in `../e-pages` (GitHub `Guseyn/e-dev`). Open a docs page with `?dev=true` and Alt + click any element to open its line in the editor. `docs:e-dev:update` copies its client to `docs/web-app/static/js/e-dev/` and its API to `docs/web-app/api/e-dev/` (both gitignored), rewriting `#nodes/` to `#docs-nodes/`. `docs/web-app/worker.js` registers the API only when `ENV=local` and the copy exists. Its settings (static folder, the `/docs` shell page, editor) are `eDev` in `docs/web-app/env/local.json`.

`web-components/` (`msq-*`) depends on neither EHTML nor e-ui. Those components talk only to the MSQ worker, so they can be embedded in any page.

## Documentation site

`docs/web-app/static/js/docs/sitemap.js` is the only place pages are declared; content is `static/md/<section>/<page>.md`. Examples are fenced blocks named after the element, ```` ```msq-editor opens-with=text ```` (attributes without `data-`; the fonts are the default), which the showdown extensions in `showdown-extensions/` (symlinked into docs by `setup:symlinks`) turn into `<template is="msq-…">` with the music kept out of markdown. A `<template>` wrapped in a `<div>` at column 0 also survives and is still checked. Examples must be **gradual**: `docs:check` asks the parser which named scenarios each example used and fails if a scenario is introduced (per `docs/concepts.js`) on a later page in sitemap order. A page that must show unparseable input marks itself `<!-- check-docs-examples: allow-errors -->`. Prose is written by the maintainer; pages hold `> **TO WRITE**` placeholders — see `docs/README.md`.

## Conventions

- ES modules, 2-space indent, no semicolons. Internal imports use the `#msq/…`, `#tools/…` specifiers from `package.json` `imports`, not relative paths.
- One function per file, default-exported, named by what it returns or does, often long (`initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll.js`).
- Comments are prose explaining *why* (see the scripts and `.gitignore`); match that when adding code.

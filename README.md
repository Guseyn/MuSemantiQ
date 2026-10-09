# MuSemantiQ

The Semantic Music Engine

<img src="logo.png" height="200"></img>

MuSemantiQ (MSQ) is a text language for music. You write music as plain text, and MSQ
draws it as a score (SVG) and plays it (MIDI). It's plain JavaScript that runs in Node.js
(22 or newer) and in the browser, with no build step and no runtime dependencies.

```text
measure
treble clef
1/4 c d e f
```

## What MSQ gives you

- **The engine** (`src/api.js`). Fonts are set up once, then a page goes through these
  steps: text → page schema → styles → SVG and MIDI.
  - `setupFonts`
  - `generateIntermediateStructuresForSinglePage` / `…ForMultiplePages`
  - `generateStylesForSinglePage` / `…ForMultiplePages`
  - `generateSvgForSinglePage` / `…ForMultiplePages`
  - `generateMidiForSinglePage` / `…ForMultiplePages`

  The MIDI comes with maps between the text and the playback time, so a player can show
  which note is playing.
- **The language alone** (`src/language/api.js`). It parses MSQ text without loading the
  drawer, the fonts or MIDI. It gives you the page schema, errors, comments, custom
  styles, MIDI settings and the editor's highlights. It also turns a parsed page back
  into text (the serializer).
- **The worker** (`src/worker.js`). The same API in a Web Worker, called with `postMessage`.
- **Web components** (`web-components/`). Put MSQ text in a page and get a score, a
  player or an editor: `msq-svg`, `msq-midi`, `msq-svg-midi`, `msq-editor` and
  `msq-font-loader`. They only talk to the worker, so they work on any page.
- **Showdown extensions** (`showdown-extensions/`). Write an `msq-…` fenced block in
  markdown and it becomes a web component.
- **Tools** (`tools/`).
  - `smufl/` turns a SMuFL font into the JavaScript font tables the drawer uses.
    Bravura and Leland are already done.
  - `magenta/` makes a sound font from Magenta's samples.

## Where things are

```
src/
  api.js, worker.js
  language/
    api.js                 parsing only; nothing here imports from outside src/language
    parser/                the parser (see src/language/parser/README.md)
      parseLanguage.js
      scenarios/
        main/              what every command does: the page schema, errors, styles…
        highlight/         the editor's highlights, with ref-ids (an adapter)
        highlight-without-ref-ids/   the same without ref-ids, for typing (an adapter)
    schema/                checks a page schema
    serializer/            parser output back to MSQ text
  drawer/
    elements/              grouped like the MSQ Language part of the docs:
                           notes-on-a-page/, grouping-notes/, the-page/, marks-on-units/,
                           spans/, measure-furniture/, layout-and-styles/,
                           plus basic/ (SVG primitives) and shared/
    generateStyles.js      all the spacing, from the stave line spacing and the font
    font/                  the music fonts as JavaScript tables
    lib/                   vendored opentype.js and svgpath
  midi/                    the page schema as MIDI; vendored @tonejs/midi and midi-file in lib/
web-components/            the msq-* elements and the editor
showdown-extensions/       msq-… fenced blocks in markdown
tools/                     the font and sound font generators
scripts/                   tests, copying, setup and docs scripts (run them with npm)
test/                      visual-tests/, audio-tests/, serializer-tests/
browser-app/               the example app in the browser
cli-app/                   the example app in the terminal
dev-tools/                 the app for working on MSQ itself
docs/                      the landing page and the documentation site
```

`src/` and `web-components/` are copied into every app (`static/js/msq/`). The copies are
not tracked, so edit only the originals. `npm run watch:src` and
`npm run watch:web-components` keep the copies up to date while you work.

## The apps

All three web apps run on [nodes](https://github.com/Guseyn/nodes.js), an HTTP/2 server.
Each one has the same layout in `web-app/`: `main.js` reads `env/local.json` (port, host,
certificate), and `worker.js` declares the routes. The certificates are self-signed, so the
browser warns once.

### browser-app

A small page with the web components: write music, see the score, play it.

```bash
npm run browser-app:setup   # once, and after you change src/ or web-components/
npm run browser-app         # https://127.0.0.1:8888
```

### cli-app

Makes SVG and MIDI files from MSQ text in the terminal. Without arguments it asks a few
questions first.

```bash
npm run cli-app -- --input score.txt --svg --midi
npm run cli-app -- --help
```

See `cli-app/README.md`.

### dev-tools

The app for working on MSQ itself:

- **Test viewer**: every test, with its expected and actual output side by side. You can
  accept the new output as expected from here.
- **Font viewer**: every glyph of a music font. You can tune how it's placed.
- **Font generator**: makes JavaScript font tables from a SMuFL font.
- **Magenta sound font generator**: makes a sound font for the player.

```bash
npm run dev-tools:setup   # downloads nodes, EHTML and e-ui from GitHub (asks first)
npm run dev-tools         # https://127.0.0.1:8889
```

### docs

The landing page (`/`) and the documentation (`/docs/<section>/<page>`).

```bash
npm run docs:vendor   # once: copies nodes, EHTML, e-ui and e-dev from the folders beside this one
npm run docs          # checks the examples, then https://127.0.0.1:8890
```

See `docs/README.md`.

## The documentation

Every page is declared in `docs/web-app/static/js/docs/sitemap.js`. The text of each page
is `docs/web-app/static/md/<section>/<page>.md`. The sections:

1. **Getting started**
2. **MSQ Language**: Notes on a Page, Grouping Notes, The Page, Marks on Units, Spans,
   Measure Furniture, Layout and Styles, Operational, Reference
3. **Low-Level API**
4. **Worker**
5. **Web Components**
6. **Showdown Extensions**
7. **With EHTML**
8. **Example apps**: the browser app and the CLI
9. **Tools, natively**
10. **Dev tools**
11. **Testing**
12. **Reference**

Examples in the pages are fenced blocks named after the element:

````markdown
```msq-editor opens-with=text
measure
treble clef
1/4 c d e f
```
````

`npm run docs:check` parses every example and checks two things: it has no errors, and it
doesn't use a command before the page that introduces it (`docs/concepts.js` says which
page introduces which command). So the examples go from simple to complex in the order of
the sitemap.

## Tests

The tests compare output with files saved in `expected/`:

- `test/visual-tests/bravura/` and `test/visual-tests/leland/`: SVG, page schema,
  highlights, errors, custom styles, comments
- `test/audio-tests/`: the same, plus MIDI and MIDI settings
- `test/serializer-tests/`: parse → serialize → parse again gives the same result

Each test is a `.txt` file of MSQ. Pages are split by `====next page====`. Every run
writes `actual/`. If the new output is right, copy it over `expected/`, by hand or with the
test viewer in dev-tools.

## Commands

```bash
# tests
npm run test:all                            # visual, audio and serializer tests
npm run test:visual:all                     # also test:audio:all, test:serializer:all
node scripts/visual-tests.js --only=chord   # only the tests with "chord" in the name
npm run coverage                            # the tests with coverage
npm run coverage:check                      # fails below the coverage thresholds

# apps
npm run browser-app:setup && npm run browser-app
npm run dev-tools:setup && npm run dev-tools
npm run docs
npm run cli-app -- --input score.txt --svg --midi

# copying src/ and web-components/ into the apps
npm run setup:symlinks                      # links the fonts into the apps (runs after npm install)
npm run msq:apps:update                     # copies src/ into every app
npm run web-components:update               # copies web-components/ into every app
npm run watch:src                           # keeps copying src/ while you work
npm run watch:web-components                # keeps copying web-components/ while you work
npm run create:msq:worker -- -o static/js/msq/worker   # only the worker, for your own app

# docs
npm run docs:check                          # checks every example in the docs
npm run docs:pipeline                       # redraws the "How it works" pictures on the landing page
npm run docs:art                            # redraws the landing page art
npm run docs:api-example                    # remakes score.svg and score.mid that the Low-Level API page links to
```

## nodes, EHTML, e-ui and e-dev

The apps use four small libraries by the same author, each with no dependencies and no
build step:

- [nodes](https://github.com/Guseyn/nodes.js): the HTTP/2 server
- [EHTML](https://github.com/Guseyn/EHTML): page behaviour in HTML (fetching JSON,
  templates, actions). It also ships showdown, which renders the docs.
- [e-ui](https://github.com/Guseyn/e-ui): the design system of dev-tools and the docs
- [e-dev](https://github.com/Guseyn/e-dev) (docs only, locally): open a docs page with
  `?dev=true` and Alt + click an element to open its line in the editor

They are copied into the apps, not installed:

- `dev-tools:setup` downloads them as zips from GitHub.
- The `*:vendor` and `*:update` scripts copy them from checkouts in folders beside this
  one (`../nodes.js`, `../EHTML`, `../e-ui`, `../e-pages`). They replace the copy each
  time, so fix a bug in the library itself, then copy it again.

## Code style

- ES modules, 2-space indent, no semicolons. Imports use the `#msq/…` and `#tools/…`
  names from `package.json`, not relative paths.
- One function per file, default-exported, and the file has the function's name. Names
  start with a verb: `draw…` returns SVG elements, `calculate…` returns a number or points,
  `find…` / `get…` pick something, `is…` returns a boolean. Tables and other data keep
  noun names.
- Comments say why, not what.
- The output must be the same byte for byte on every run. That's why the fonts are always
  loaded in the same order.

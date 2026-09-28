# Repository layout

MuSemantiQ is one repository with no packages inside it: the engine, the components, three apps, the tools and the tests all live side by side, and they share one `package.json`.

## 1. The top level

Let's take a look at the top level first:

```text
src/              the engine
web-components/   the <template is="msq-*"> elements and the editor
tools/            SMuFL font generation, MusicXML import and export, Magenta sound fonts
scripts/          the test runners, the copy and link scripts, the watchers, the docs check
examples/         the browser app and the CLI
dev-tools/        the dev tools app
docs/             the landing page and this documentation
test/             the visual, audio and serializer suites
package.json      the specifiers, the npm scripts, the two import-map fields
logo.svg          the wordmark every app links to
```

There is also `.nycrc.json`, the c8 configuration for `npm run coverage`, and a `coverage/` folder it writes, which is not tracked.

## 2. The engine

`src/` is the engine, and it has three parts plus two entry points:

| Path | What it is |
| --- | --- |
| `src/language/` | the language: `parser/` (the tokenizer in `parsedLanguage.js` and the scenarios in `parser/scenarios/`), `schema/` (the page schema and its validator), `serializer/` (the schema back to text), `lib/` (the vendored JSON schema validator), and `api.js`, the parsing half of the API |
| `src/drawer/` | the drawer: `elements/<concept>/` for every drawn thing, from `note/` and `beam/` to `page/`, `generatedStyles.js` for the styles, `font/` for the font files and the music `js` tables, and `lib/` for opentype.js and svgpath |
| `src/midi/` | the MIDI engine: `midi.js` and the functions it is built from, `lib/` for @tonejs/midi and midi-file, and the untracked sound banks |
| `src/api.js` | the whole API, described in [Overview](/docs/api/overview) |
| `src/worker.js` | the same API behind a message protocol, described in [The worker](/docs/architecture/the-worker) |

The language is the one part with a rule of its own: nothing in `src/language` imports outside it, because it is also served to the page as it is.

## 3. The components

`web-components/` holds the `msq-*` elements, one `msq-*-template.js` file each, and what only they need: `editor/`, `css/`, `icons/`, `utils/` (including the one worker instance) and `lib/`, the vendored player libraries. They are copied into every app by `npm run web-components:update`, and they depend on neither EHTML nor e-ui, so they can be embedded in any page.

## 4. The apps

There are three apps, and they are built the same way. Each has a `web-app/` with the same layout for the `nodes` server:

```text
web-app/
  main.js       reads env/${ENV:-local}.json and starts the cluster
  primary.js    the primary process
  worker.js     the routes: API endpoints and static mounts
  env/          port, host, TLS key and certificate
  static/       what the browser gets
```

| App | Where | Port | What it is |
| --- | --- | --- | --- |
| the browser example | `examples/browser/` | **8888** | the smallest page that engraves and plays a score |
| the dev tools | `dev-tools/` | **8889** | the test viewer, the font viewer and generator, the MusicXML tool, the sound-font tools; its endpoints are in `web-app/api/` |
| the documentation | `docs/` | **8890** | the landing page and these pages; `docs/concepts.js` is what the docs check reads |

What they share is everything under `static/js/msq/`, which is the engine and the components, generated into each of them, plus the fonts, linked into `static/font/`. What each has of its own is its pages and its own copy of `nodes`, under `nodes/`, imported through its own specifier: `#nodes/*`, `#dev-nodes/*` or `#docs-nodes/*`. The CLI, `examples/cli/`, is not a server at all: it calls `src/api.js` directly from Node.

## 5. The tests

`test/` has one folder per suite:

```text
test/visual-tests/bravura/   one tree per music font
test/visual-tests/leland/
test/audio-tests/
test/serializer-tests/
```

The visual and audio suites have an `msq/` folder of `.txt` inputs, with pages split by `====next page====`, and then one folder per kind of output, each with `expected/` and `actual/` inside. The visual suite has `svg`, `page-schema`, `html-highlights`, `errors`, `custom-styles`, `comments` and `char-progressions`; the audio suite has the same without `char-progressions`, plus `midi` and `midi-settings`. The serializer suite goes the other way round: its inputs are stored parser output, in `page-schema`, `custom-styles`, `midi-settings` and `comments`, and its `msq/` holds the text it is expected to write. The runners are `scripts/visual-tests.js`, `scripts/audio-tests.js` and `scripts/serializer-tests.js`, and they write `list-of-passed-tests.json` and `list-of-failed-tests.json` beside the folders. More about them in [The three suites](/docs/testing/the-suites).

`dev-tools/glyph-examples/` also holds MSQ, one file per glyph of the music font tables, which the font viewer draws.

Read next: [Vendoring](/docs/architecture/vendoring)

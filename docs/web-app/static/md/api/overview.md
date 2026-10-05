# Low-level API

<nav is="docs-contents"></nav>

> **TO WRITE**
> - what the low-level API is: `src/api.js`, plain ES modules, what the worker, the components, the CLI and the tests are built on
> - the pipeline: fonts, then parsing, then styles, then SVG and MIDI

## Setup and a full example

<e-tabs data-apply-hash-navigation>

<e-tab data-title="Node.js">

<details is="e-details">
<summary>Setup</summary>

First, download MuSemantiQ next to your project:

```sh
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
unzip MuSemantiQ.zip
mv MuSemantiQ-main MuSemantiQ
```

Then copy `src` from `MuSemantiQ` into your project, as the `msq` folder:

```sh
cd your-project
mkdir msq
rsync -a --delete ../MuSemantiQ/src/ msq/
```

Finally, add the imports to your `package.json` and mark the package as a module, so that every `#msq/…` import inside `msq` resolves:

```json
{
  "type": "module",
  "imports": {
    "#msq/drawer/*": "./msq/drawer/*",
    "#msq/language/*": "./msq/language/*",
    "#msq/midi/*": "./msq/midi/*",
    "#msq/api.js": "./msq/api.js"
  }
}
```

</details>

> **TO WRITE**
> - the full example: a script that reads a file of several pages and writes one SVG and one MIDI file
> - why it passes a font config: the defaults point into `./src/drawer/font/`, which exists only in `MuSemantiQ` itself

```js
// render.js
import fs from 'fs'
import {
  setupFonts,
  generateIntermediateStructuresForMultiplePages,
  generateStylesForMultiplePages,
  generateSvgForMultiplePages,
  generateMidiForMultiplePages
} from '#msq/api.js'

const fontConfig = {
  'chord-letters': {
    'gentium plus': './msq/drawer/font/chord-letters/GentiumPlus-Regular.ttf'
  },
  'text': {
    'noto-serif': {
      'regular': './msq/drawer/font/text/NotoSerif-Regular.ttf',
      'bold': './msq/drawer/font/text/NotoSerif-Bold.ttf'
    }
  },
  'music': {
    'bravura': {
      'font': './msq/drawer/font/music/Bravura.otf',
      'js': '#msq/drawer/font/music-js/bravura.js'
    }
  }
}

const text = fs.readFileSync('score.txt', 'utf-8')
const multiplePagesText = text.split('====next page====')

const supportedFontSources = await setupFonts(fontConfig)

const {
  pageSchemaForEachPage,
  errorsForEachPage,
  customStylesForEachPage,
  midiSettingsForEachPage
} = generateIntermediateStructuresForMultiplePages({ multiplePagesText })

errorsForEachPage.forEach((errors, pageIndex) => {
  errors.forEach((error) => console.error(`page ${pageIndex + 1}: ${error.trim()}`))
})

const pageStylesForEachPage = generateStylesForMultiplePages({
  customStylesForEachPage,
  supportedFontSources
})

const svg = generateSvgForMultiplePages({
  pageSchemaForEachPage,
  pageStylesForEachPage
})

const midi = generateMidiForMultiplePages({
  pageSchemaForEachPage,
  midiSettingsForEachPage
})

fs.writeFileSync('score.svg', svg)
fs.writeFileSync('score.mid', midi.data)

console.log(midi.refsOnMappedWithTimeStamps)
```

> **TO WRITE**
> - the file it reads, `score.txt`: two pages split by `====next page====`

```text
default tempo is "1/4 = 76"

title is "A Short Piece"

measure
treble clef
c d e f
====next page====
measure
g a b c5
```

> **TO WRITE**
> - running it from the root of your project

```sh
node render.js
```

> **TO WRITE**
> - what you get: `score.svg` and `score.mid`, and the time of every note in the terminal

```text
{
  '0': {
    'note-1-1-1-1-1': 0,
    'note-1-1-1-2-1': 0.7895,
    'note-1-1-1-3-1': 1.5789,
    'note-1-1-1-4-1': 2.3684
  },
  '1': {
    'note-1-1-1-1-1': 3.1579,
    'note-1-1-1-2-1': 3.9474,
    'note-1-1-1-3-1': 4.7368,
    'note-1-1-1-4-1': 5.5263
  }
}
```

</e-tab>

<e-tab data-title="Browser">

<details is="e-details">
<summary>Setup</summary>

**Important note:** this is not the recommended way. Everything runs on the main thread, so the page freezes while the fonts load and while a score is engraved. If you can, use the [Worker](/docs/worker/overview) instead.

First, download MuSemantiQ next to your project:

```sh
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
unzip MuSemantiQ.zip
mv MuSemantiQ-main MuSemantiQ
```

Then copy `src` from `MuSemantiQ` into your static `js` folder. The fonts come with it, under `drawer/font/`:

```sh
cd your-project
mkdir -p static/js/msq
rsync -a --delete ../MuSemantiQ/src/ static/js/msq/src
```

Finally, add an import map to your page, before any module script, so that the `#msq/…` imports inside `src` resolve in the browser:

```html
<script type="importmap">
  {
    "imports": {
      "#msq/": "/js/msq/src/"
    }
  }
</script>
```

</details>

> **TO WRITE**
> - the full example: a page that engraves a score into itself and offers the MIDI as a download
> - why the font config is required here: the browser has no defaults, and every entry is a URL

```html
<!-- static/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>A Short Piece</title>
    <script type="importmap">
      {
        "imports": {
          "#msq/": "/js/msq/src/"
        }
      }
    </script>
  </head>
  <body>
    <div id="score"></div>
    <a id="midi" download="score.mid">Download MIDI</a>

    <script type="module">
      import {
        setupFonts,
        generateIntermediateStructuresForSinglePage,
        generateStylesForSinglePage,
        generateSvgForSinglePage,
        generateMidiForSinglePage
      } from '#msq/api.js'

      const fontConfig = {
        'chord-letters': {
          'gentium plus': '/js/msq/src/drawer/font/chord-letters/GentiumPlus-Regular.ttf'
        },
        'text': {
          'noto-serif': {
            'regular': '/js/msq/src/drawer/font/text/NotoSerif-Regular.ttf',
            'bold': '/js/msq/src/drawer/font/text/NotoSerif-Bold.ttf'
          }
        },
        'music': {
          'bravura': {
            'font': '/js/msq/src/drawer/font/music/Bravura.otf',
            'js': '/js/msq/src/drawer/font/music-js/bravura.js'
          }
        }
      }

      const pageText = `
        title is "A Short Piece"

        measure
        treble clef
        c d e f
      `

      const supportedFontSources = await setupFonts(fontConfig)

      const {
        pageSchema,
        errors,
        customStyles,
        midiSettings
      } = generateIntermediateStructuresForSinglePage({ pageText })

      if (errors.length > 0) {
        console.error(errors)
      }

      const pageStyles = generateStylesForSinglePage({
        customStyles,
        supportedFontSources
      })

      document.querySelector('#score').innerHTML = generateSvgForSinglePage({
        pageSchema,
        pageStyles
      })

      pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
        measureParams.pageIndex = 0
        measureParams.measureIndexOnPage = measureIndex
      })
      const midi = generateMidiForSinglePage({ pageSchema, midiSettings })

      const midiBlob = new Blob([ midi.data ], { type: 'audio/midi' })
      document.querySelector('#midi').href = URL.createObjectURL(midiBlob)
    </script>
  </body>
</html>
```

> **TO WRITE**
> - serving `static/` with any static server, and opening the page

```sh
cd static
python3 -m http.server 8080
```

</e-tab>

</e-tabs>

## Functions

<h3 is="e-h" id="1-setupfonts">1. setupFonts</h3>

```js
async function setupFonts(fontConfig)
```

<details is="e-details">
<summary>Purpose</summary>

Loads every font the engine draws with. It is the only async function here, because it is the only one that reads files, so call it once and keep what it returns.

</details>

<details is="e-details">
<summary>Arguments</summary>

`fontConfig`: the fonts, by name, in three categories; optional in Node, where a category you leave out keeps its default, and required in full in the browser, where every entry is a URL.

```js
{
  'chord-letters': { [name]: pathToTtf },
  'text': { [name]: { regular: pathToTtf, bold: pathToTtf } },
  'music': { [name]: { font: pathToSmuflOtf, js: moduleOfItsGlyphTable } }
}
```

</details>

<details is="e-details">
<summary>Returns</summary>

A promise of `supportedFontSources`, the same tree with every file loaded:

- `chord-letters`: each chord-letter font, by name, as an opentype.js font.
- `text.regular`, `text.bold`: each text font, by name, as an opentype.js font.
- `music`: each music font, by name, as an opentype.js font; only braces are drawn from it.
- `music-js`: each music font's glyph table, by name; every other glyph is drawn from it, which is why only **bravura** and **leland**, the two fonts with a table at the moment, can be listed under `music`.

</details>

<h3 is="e-h" id="2-generateintermediatestructuresforsinglepage">2. generateIntermediateStructuresForSinglePage</h3>

```js
// also in '#msq/language/api.js', which loads no drawer and no fonts
function generateIntermediateStructuresForSinglePage({
  pageText,
  applyHighlighting,
  applyOnlyHighlightingWithoutRefIds,
  progressionOfCommandsFromScenarios,
  supportedFontNames
})
```

<details is="e-details">
<summary>Purpose</summary>

Parses the MSQ text of one page into everything the rest of the pipeline needs, in one pass. It never throws on bad music: what it cannot read goes into `errors`, and the rest is parsed anyway.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageText`: the MSQ text of one page; required.

```js
'measure\ntreble clef\nc d e f'
```

`applyHighlighting`: meant to switch the highlighted source off, but at the moment it is read as `applyHighlighting || true`, so the source is highlighted anyway.

```js
true
```

`applyOnlyHighlightingWithoutRefIds`: only highlight, with no ref ids, no page schema and no MIDI settings; this is the cheap parse the editor runs on every keystroke. **false** by default.

```js
false
```

`progressionOfCommandsFromScenarios`: the progression of commands to start from, for parsing from the middle of a text. Empty by default.

```js
[]
```

`supportedFontNames`: the font names a page may choose; by default the built-in ones, so pass the names you loaded if they differ.

```js
{ 'chord-letters': [ 'gentium plus' ], 'music': [ 'bravura' ], 'text': [ 'noto-serif' ] }
```

</details>

<details is="e-details">
<summary>Returns</summary>

One object:

- `pageSchema`: what the page means: measures, staves, voices and units, as plain JSON.
- `errors`: one string per line the parser could not use, naming the command and the line.
- `customStyles`: the style commands of the page, as written, for example `{ musicFont: 'leland' }`.
- `midiSettings`: the MIDI settings of the page, for example `{ defaultTempo: '"1/4 = 76"' }`.
- `comments`: the `comment:` blocks, each with its `text`, its quote and its line numbers.
- `highlightsHtmlBuffer`: the source as an array of HTML fragments, each token in a `<span>` with a `ref-id`; `join('')` it before use.
- `mapOfCharIndexesWithProgressionOfCommandsFromScenarios`: for every character of the source, the progression of commands at that point, which the editor uses for completion.

</details>

<h3 is="e-h" id="3-generateintermediatestructuresformultiplepages">3. generateIntermediateStructuresForMultiplePages</h3>

```js
// also in '#msq/language/api.js'
function generateIntermediateStructuresForMultiplePages({
  multiplePagesText,
  applyHighlighting,
  applyOnlyHighlightingWithoutRefIds,
  progressionOfCommandsFromScenarios,
  supportedFontNames
})
```

<details is="e-details">
<summary>Purpose</summary>

The same parse, once per page, plus `pageIndex` and `measureIndexOnPage` written on every measure, which the MIDI ref ids are built from.

</details>

<details is="e-details">
<summary>Arguments</summary>

`multiplePagesText`: the text of each page, in order; MSQ has no page break, so you split the text yourself, usually at `====next page====`.

```js
[ 'measure\nc d e f', 'measure\ng a b c5' ]
```

The other four are the same as in [generateIntermediateStructuresForSinglePage](#2-generateintermediatestructuresforsinglepage), and apply to every page.

</details>

<details is="e-details">
<summary>Returns</summary>

One object, with one array entry per page:

- `pageSchemaForEachPage`: the page schema of each page.
- `errorsForEachPage`: the errors of each page.
- `customStylesForEachPage`: the custom styles of each page; a style set on one page is not carried into the next.
- `midiSettingsForEachPage`: the MIDI settings of each page.
- `commentsForEachPage`: the comments of each page.
- `htmlHighlightsForEachPage`: the highlighted source of each page.
- `mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage`: the progression of commands of each page.

</details>

<h3 is="e-h" id="4-generatestylesforsinglepage">4. generateStylesForSinglePage</h3>

```js
function generateStylesForSinglePage({
  customStyles,
  supportedFontSources
})
```

<details is="e-details">
<summary>Purpose</summary>

Merges a page's custom styles with the defaults and picks its fonts out of the loaded ones. The page schema says what to draw; this says how it looks.

</details>

<details is="e-details">
<summary>Arguments</summary>

`customStyles`: what `generateIntermediateStructuresForSinglePage` returned under that name.

```js
{ musicFont: 'leland', intervalBetweenStaveLines: '10' }
```

`supportedFontSources`: what `setupFonts` returned.

```js
{ 'chord-letters': {…}, 'text': {…}, 'music': {…}, 'music-js': {…} }
```

</details>

<details is="e-details">
<summary>Returns</summary>

`pageStyles`:

- `pageStyles`: one flat object of a few hundred entries, the numbers, colours, fonts and glyphs the drawer reads, with every distance already multiplied by the interval between stave lines (**8.5** by default).

</details>

<h3 is="e-h" id="5-generatestylesformultiplepages">5. generateStylesForMultiplePages</h3>

```js
function generateStylesForMultiplePages({
  customStylesForEachPage,
  supportedFontSources
})
```

<details is="e-details">
<summary>Purpose</summary>

`generateStylesForSinglePage` once per page, with the same loaded fonts for all of them.

</details>

<details is="e-details">
<summary>Arguments</summary>

`customStylesForEachPage`: what `generateIntermediateStructuresForMultiplePages` returned under that name.

```js
[ { musicFont: 'leland' }, {} ]
```

`supportedFontSources`: what `setupFonts` returned.

```js
{ 'chord-letters': {…}, 'text': {…}, 'music': {…}, 'music-js': {…} }
```

</details>

<details is="e-details">
<summary>Returns</summary>

`pageStylesForEachPage`:

- `pageStylesForEachPage`: the page styles of each page, in order.

</details>

<h3 is="e-h" id="6-generatesvgforsinglepage">6. generateSvgForSinglePage</h3>

```js
function generateSvgForSinglePage({
  pageSchema,
  pageStyles,
  left,
  top
})
```

<details is="e-details">
<summary>Purpose</summary>

Draws one page. You get a string, so where it goes, a file or the DOM, is up to you.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageSchema`: the page to draw.

```js
{ measuresParams: [ … ] }
```

`pageStyles`: what `generateStylesForSinglePage` returned.

```js
{ intervalBetweenStaveLines: 8.5, … }
```

`left`, `top`: move the page right and down, in SVG units, by adding empty space; **0** by default.

```js
0, 0
```

</details>

<details is="e-details">
<summary>Returns</summary>

The SVG:

- a string with one `<svg>` element in it, where every drawn element carries a `ref-ids` attribute naming what it belongs to.

</details>

<h3 is="e-h" id="7-generatesvgformultiplepages">7. generateSvgForMultiplePages</h3>

```js
function generateSvgForMultiplePages({
  pageSchemaForEachPage,
  pageStylesForEachPage,
  left,
  top,
  intervalBetweenPages
})
```

<details is="e-details">
<summary>Purpose</summary>

Draws every page into one SVG, stacked from top to bottom. If you want one SVG per page, call `generateSvgForSinglePage` for each one instead.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageSchemaForEachPage`: the pages to draw, in order.

```js
[ { measuresParams: [ … ] }, { measuresParams: [ … ] } ]
```

`pageStylesForEachPage`: what `generateStylesForMultiplePages` returned.

```js
[ { … }, { … } ]
```

`left`, `top`: place the first page, as in the single-page form; **0** by default.

```js
0, 0
```

`intervalBetweenPages`: the space between two pages, in SVG units; **15** by default, and it is read as `intervalBetweenPages || 15`, so **0** gives you **15**.

```js
15
```

</details>

<details is="e-details">
<summary>Returns</summary>

The SVG:

- a string with one `<svg>` element that holds every page.

</details>

<h3 is="e-h" id="8-generatemidiforsinglepage">8. generateMidiForSinglePage</h3>

```js
function generateMidiForSinglePage({
  pageSchema,
  midiSettings
})
```

<details is="e-details">
<summary>Purpose</summary>

Performs one page. It needs no styles and no fonts, because nobody has ever heard a font.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageSchema`: the page to perform, with `pageIndex` and `measureIndexOnPage` on every measure, which the single-page parser does not set, so set them as the Browser example above does, or the ref ids come out as `note-NaN-…`.

```js
{ measuresParams: [ { pageIndex: 0, measureIndexOnPage: 0, … } ] }
```

`midiSettings`: what `generateIntermediateStructuresForSinglePage` returned under that name.

```js
{ defaultTempo: '"1/4 = 76"', defaultInstrument: 'flute' }
```

</details>

<details is="e-details">
<summary>Returns</summary>

One object; a page with no measures gives an empty `Buffer` instead:

- `data`: the MIDI file, a `Buffer` in Node and a `Uint8Array` in the browser.
- `timeStampsMappedWithRefsOn`: for each moment in seconds, what starts sounding then, as `{ 0.5: [ { refId, duration, pageIndex, measureIndexOnPage } ] }`.
- `refsOnMappedWithTimeStamps`: for each page index, when each unit starts, as `{ 0: { 'note-1-1-1-1-1': 0 } }`.

</details>

<h3 is="e-h" id="9-generatemidiformultiplepages">9. generateMidiForMultiplePages</h3>

```js
function generateMidiForMultiplePages({
  pageSchemaForEachPage,
  midiSettingsForEachPage
})
```

<details is="e-details">
<summary>Purpose</summary>

Performs every page as one continuous piece, because music does not stop at a page boundary. So a repeat on the second page can go back to the first, and no silence is added between pages.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageSchemaForEachPage`: what `generateIntermediateStructuresForMultiplePages` returned under that name, with `pageIndex` and `measureIndexOnPage` already set.

```js
[ { measuresParams: [ … ] }, { measuresParams: [ … ] } ]
```

`midiSettingsForEachPage`: the MIDI settings of each page; `default instrument` is taken from the page a note is on, and `default tempo` only from the first page.

```js
[ { defaultTempo: '"1/4 = 76"' }, {} ]
```

</details>

<details is="e-details">
<summary>Returns</summary>

The same object as the single-page form, for the whole document:

- `data`: one MIDI file for every page.
- `timeStampsMappedWithRefsOn`: every entry carries the `pageIndex` it came from.
- `refsOnMappedWithTimeStamps`: keyed by page index first, so the same ref id on two pages does not collide.

</details>

<h3 is="e-h" id="10-ispageschemavalid">10. isPageSchemaValid</h3>

```js
function isPageSchemaValid(pageSchema)
```

<details is="e-details">
<summary>Purpose</summary>

Checks the structure of a page schema against `src/language/schema/pageSchema.js`, not its music, so four whole notes in a measure of **2/4** pass with flying colours. It is for schemas that did not come from the parser: built by hand, imported from MusicXML, or changed after parsing.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageSchema`: the page schema to check.

```js
{ measuresParams: [ { stavesParams: [ { voicesParams: [ [ { unitDuration: 0.3 } ] ] } ] } ] }
```

</details>

<details is="e-details">
<summary>Returns</summary>

The result object of the JSON schema validator, which, despite the name of the function, is not a boolean and is always truthy:

- `valid`: **true** or **false**; this is the answer.
- `errors`: one entry per problem; its `stack` names the path to the value and what is wrong with it.

</details>

<h3 is="e-h" id="11-areallpageschemasvalid">11. areAllPageSchemasValid</h3>

```js
function areAllPageSchemasValid(pageSchemas)
```

<details is="e-details">
<summary>Purpose</summary>

Meant to check every page at once, but at the moment it returns **true** for any array, which is optimistic. Until that is fixed, use `pageSchemas.every((pageSchema) => isPageSchemaValid(pageSchema).valid)`.

</details>

<details is="e-details">
<summary>Arguments</summary>

`pageSchemas`: the page schema of each page.

```js
[ { measuresParams: [ … ] }, { measuresParams: [ … ] } ]
```

</details>

<details is="e-details">
<summary>Returns</summary>

A boolean:

- **true**, at the moment always.

</details>

Read next: [Worker](/docs/worker/overview)

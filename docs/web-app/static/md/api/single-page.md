# A single page

Engraving and performing one page takes four calls after the fonts are loaded. Each call takes one object and returns what the next one needs.

| Call | Takes | Returns |
| --- | --- | --- |
| `generateIntermediateStructuresForSinglePage` | `{ pageText }` and a few options | `{ pageSchema, errors, customStyles, midiSettings, comments, highlightsHtmlBuffer, mapOfCharIndexesWithProgressionOfCommandsFromScenarios }` |
| `generateStylesForSinglePage` | `{ customStyles, supportedFontSources }` | `pageStyles` |
| `generateSvgForSinglePage` | `{ pageSchema, pageStyles, left, top }` | an SVG string |
| `generateMidiForSinglePage` | `{ pageSchema, midiSettings }` | `{ data, timeStampsMappedWithRefsOn, refsOnMappedWithTimeStamps }` |

## 1. generateIntermediateStructuresForSinglePage

This is the parser. It takes the MSQ text of one page and goes through it once:

```js
const {
  pageSchema,
  errors,
  customStyles,
  midiSettings,
  comments,
  highlightsHtmlBuffer,
  mapOfCharIndexesWithProgressionOfCommandsFromScenarios
} = generateIntermediateStructuresForSinglePage({ pageText })
```

It takes these options:

| Option | Default | Meaning |
| --- | --- | --- |
| `pageText` | required | the MSQ text of one page; a multi-page text has to be split first |
| `applyHighlighting` | `true` | whether to build the highlighted source |
| `applyOnlyHighlightingWithoutRefIds` | `false` | highlight only: no ref ids, no page schema, no MIDI settings |
| `progressionOfCommandsFromScenarios` | `[]` | the progression of commands to start from, for parsing from the middle of a text |
| `supportedFontNames` | the built-in fonts | the font names a page is allowed to choose, as `{ 'chord-letters': [...], music: [...], text: [...] }` |

**Side note:** at the moment `applyHighlighting: false` has no effect, because the option is read as `applyHighlighting || true`. You always get the highlighted source back. If you need a cheaper parse, `applyOnlyHighlightingWithoutRefIds: true` is the one that skips work.

And this is everything it returns:

| Field | What it is |
| --- | --- |
| `pageSchema` | what the page means: measures, staves, voices and units, described in [The page schema](/docs/api/page-schema) |
| `errors` | an array of strings, one per line the parser could not use, naming the command and its line, for example `"command 'is 4/4\n' is not recognizable or applicable on the line 5"` |
| `customStyles` | the styles the page set, as written, for example `{ musicFont: 'leland', intervalBetweenStaveLines: '10' }` |
| `midiSettings` | the MIDI settings the page set, for example `{ defaultTempo: '"1/4 = 76"' }` |
| `comments` | the `comment:` blocks, each with its `text`, its quote and its line numbers |
| `highlightsHtmlBuffer` | the source as an array of HTML fragments, with `ref-id` attributes; `join('')` it before use |
| `mapOfCharIndexesWithProgressionOfCommandsFromScenarios` | for every character of the source, the progression of commands at that point; the editor uses it for completion and for re-parsing only what changed |

It's important to mention that errors do not stop the parser. As you remember from [Handling errors](/docs/language/handling-errors), a line that cannot be used is reported and skipped, and the page schema is built from everything else. So a page with errors still draws, and you decide what to do with the list.

## 2. generateStylesForSinglePage

The page schema says what to draw; the styles say how it looks:

```js
const pageStyles = generateStylesForSinglePage({
  customStyles,
  supportedFontSources
})
```

It merges the page's `customStyles` with the defaults. Every style a page did not set gets its default value, and every style it did set replaces it. Most distances are given in intervals between stave lines, so they are multiplied by `intervalBetweenStaveLines` here, which is **8.5** by default. Then the fonts the page chose are picked out of `supportedFontSources`, falling back to the first font of each category, and the music font's `js` table adds its own glyphs and metrics.

The result is one flat object with a few hundred entries: the numbers, colours, fonts and sets of options the drawer reads. The full list of what a page can set is in [The full style reference](/docs/language/style-reference).

## 3. generateSvgForSinglePage

This draws the page and returns it as a string:

```js
const svg = generateSvgForSinglePage({ pageSchema, pageStyles })
```

`left` and `top` move the page right and down, in SVG units, and both are **0** by default. The `viewBox` always starts at **0 0**, so an offset adds empty space to the left and above the page, and the width and height grow by the same amount. That is how the multi-page form stacks one page under another.

## 4. generateMidiForSinglePage

This performs the page:

```js
const midi = generateMidiForSinglePage({ pageSchema, midiSettings })
```

It returns three things:

| Field | What it is |
| --- | --- |
| `data` | the MIDI file, a `Buffer` in Node and a `Uint8Array` in the browser |
| `timeStampsMappedWithRefsOn` | for each time in seconds, what starts sounding: `{ 0.5: [ { refId, duration, pageIndex, measureIndexOnPage } ] }` |
| `refsOnMappedWithTimeStamps` | for each page index, when each unit starts: `{ 0: { 'note-1-1-1-1-1': 0 } }` |

The two maps are what connect the score and the playback: the first one highlights notes as they play, the second one starts playback from a note you click.

**Important note:** the ref ids are built from `pageIndex` and `measureIndexOnPage` on each measure. The multi-page parser sets both; the single-page one does not. So before calling `generateMidiForSinglePage`, set them yourself, the way the worker does, or the ref ids come out as `note-NaN-…`:

```js
pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
  measureParams.pageIndex = 0
  measureParams.measureIndexOnPage = measureIndex
})
```

The MIDI side does not need the styles or the fonts. A page schema with no measures at all gives back an empty `Buffer` rather than the object above.

## 5. A complete example

Let's put it all together. Save this as `render-page.js` in the root of the repository, so the `#msq/…` specifiers and the default font paths both resolve:

```js
import fs from 'fs'
import {
  setupFonts,
  generateIntermediateStructuresForSinglePage,
  generateStylesForSinglePage,
  generateSvgForSinglePage,
  generateMidiForSinglePage
} from '#msq/api.js'

const pageText = `
music font is leland
default tempo is "1/4 = 76"
comment: "A short phrase."

title is "A Short Piece"

measure
treble clef
c d e f
`

const supportedFontSources = await setupFonts()

const {
  pageSchema,
  errors,
  customStyles,
  midiSettings,
  comments
} = generateIntermediateStructuresForSinglePage({ pageText })

if (errors.length > 0) {
  console.error(errors)
}

const pageStyles = generateStylesForSinglePage({
  customStyles,
  supportedFontSources
})

const svg = generateSvgForSinglePage({ pageSchema, pageStyles })

pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
  measureParams.pageIndex = 0
  measureParams.measureIndexOnPage = measureIndex
})
const midi = generateMidiForSinglePage({ pageSchema, midiSettings })

fs.writeFileSync('page.svg', svg)
fs.writeFileSync('page.mid', midi.data)

console.log(customStyles, midiSettings, comments)
console.log(midi.refsOnMappedWithTimeStamps)
```

Then run it:

```bash
node render-page.js
```

And as a result you get `page.svg` and `page.mid` beside it, and this in the terminal:

```text
{ musicFont: 'leland' } { defaultTempo: '"1/4 = 76"' } [
  {
    text: 'A short phrase.',
    startLineNumber: 4,
    currentLineNumber: 4,
    startQuote: '"',
    endLineNumber: 4
  }
]
{
  '0': {
    'note-1-1-1-1-1': 0,
    'note-1-1-1-2-1': 0.7895,
    'note-1-1-1-3-1': 1.5789,
    'note-1-1-1-4-1': 2.3684
  }
}
```

As you can see, at 76 quarters per minute each quarter lasts about **0.79** seconds.

Read next: [Multiple pages](/docs/api/multiple-pages)

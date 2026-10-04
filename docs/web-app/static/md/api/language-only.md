# Using the language alone

The parser can be loaded without the rest of the engine. `#msq/language/api.js` is the parsing half of the API: it gives you the same two `generateIntermediateStructuresFor…` functions that `#msq/api.js` re-exports, and nothing that draws or plays.

## 1. Why this exists

It exists for the editor. The editor colours what you type by parsing it, and it does that on the main thread, between a keystroke and the next paint. Everything else, engraving and MIDI, runs in the worker, but the parser cannot wait behind a message queue that may be busy engraving a page: the colours would lag behind the text.

So the language is its own tree, with one rule that makes this possible: **nothing in `src/language` imports anything outside `src/language`**. That is why the page can load it as it is, from `/js/msq/language/`, through its own import map, with no rewriting and no copy of the drawer.

## 2. What it costs to load

Here is what each entry point pulls in, counting static imports:

| Entry point | Modules | Source | Fonts |
| --- | --- | --- | --- |
| `#msq/language/api.js` | about 140 | about 1 MB | none |
| `#msq/api.js` | about 550 | about 2.7 MB | loaded by `setupFonts` |

The difference is the drawer, opentype.js, svgpath and the MIDI engine. And the fonts come on top of that: a music font's `js` table alone is about 1.5 MB, and the `.otf` and `.ttf` files beside it are several more.

It's important to mention that the language needs no fonts at all. It only needs to know which font **names** a page may choose, and those it takes as `supportedFontNames`, with the built-in names as the default.

## 3. The highlighted source

`highlightsHtmlBuffer` is the source text as an array of HTML fragments. Every token is wrapped in a `<span>` whose class says what it is:

| Class | What it marks |
| --- | --- |
| `ch` | a comment |
| `sh`, `svh` | a style command and its value |
| `msh`, `msvh` | a MIDI setting and its value |
| `eh` | a key word of an element, such as `treble clef` |
| `sth` | a quoted string |
| `cnh` | a number |
| `clph`, `cmph`, `csph`, `cvph`, `cuph` | a page line, measure, stave, voice and unit position |
| `th` | plain text, and the wrapper around each command |
| `nrch` | a command the parser could not recognise |

The colours for these classes are in `web-components/css/highlights.js`. Let's look at what a short page gives back:

```js
import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'

const { highlightsHtmlBuffer } = generateIntermediateStructuresForSinglePage({
  pageText: 'measure\ntreble clef\nc d\n'
})

console.log(highlightsHtmlBuffer.join(''))
```

The first lines of the output are:

```html
<span class="th" ref-id="measure-1"><span class="cmph" ref-id="measure-1">measure</span>
</span><span class="th" ref-id="clef-1-1"><span class="eh" ref-id="clef-1-1">treble clef</span>
</span><span class="th" ref-id="note-1-1-1-1-1"><span class="cuph" ref-id="note-1-1-1-1-1">c</span> </span>
```

## 4. Ref ids

As you can see, every span carries a `ref-id`. That is what links the text to the score. A ref id names an element by its position, counted from **1**: `measure-1` is the first measure, `clef-1-1` is the clef of the first stave in it, and `note-1-1-1-1-1` is the first note of the first unit of the first voice of the first stave of the first measure.

The SVG carries the same ids. Every drawn element has a `ref-ids` attribute, a comma-separated list, since one element can belong to several things at once:

```html
<g data-name="noteBody" ref-ids="note-1-1-1-1-1,note-with-index-1-1-1-1-1">
```

So the editor can go both ways: hover a word and find the elements with its id in `ref-ids`, or click an element and find the span with one of its ids in `ref-id`. The MIDI maps use the same ids, which is how playback highlights the note that is sounding.

## 5. Highlighting without ref ids

Ref ids cost work: to number things, the parser has to build the page schema. For colouring alone, the editor passes `applyOnlyHighlightingWithoutRefIds: true`:

```js
const { highlightsHtmlBuffer, errors } = generateIntermediateStructuresForSinglePage({
  pageText: 'measure\nc d\n',
  applyOnlyHighlightingWithoutRefIds: true
})
```

Then only the highlighting part of each scenario runs: no ref ids, no page schema, no MIDI settings. And as a result you get plain spans:

```html
<span class="cmph">measure</span>
<span class="cuph">c</span> <span class="cuph">d</span>
```

This is what `web-components/editor/parsedHighlights.js` calls on every keystroke. The version with ref ids comes from the worker, together with the score, when the preview is drawn.

## 6. A worked example: checking a file

Let's write a script that checks MSQ files for errors, with no fonts and no drawer. Save it as `check-msq.js` in the root of the repository:

```js
import fs from 'fs'
import { generateIntermediateStructuresForMultiplePages } from '#msq/language/api.js'

const file = process.argv[2]
const multiplePagesText = fs.readFileSync(file, 'utf-8').split('====next page====')

const { errorsForEachPage } = generateIntermediateStructuresForMultiplePages({
  multiplePagesText
})

let numberOfErrors = 0
errorsForEachPage.forEach((errors, pageIndex) => {
  for (const error of errors) {
    console.error(`page ${pageIndex + 1}: ${error.replace(/\s*\n/g, '')}`)
    numberOfErrors++
  }
})

console.log(`${multiplePagesText.length} page(s), ${numberOfErrors} error(s)`)
process.exitCode = numberOfErrors > 0 ? 1 : 0
```

Now take a file of two pages, `score.txt`, with a mistake on the second one:

```text
measure
treble clef
c d e f
====next page====
measure
time signature is 4/4
g a
```

And run it:

```bash
node check-msq.js score.txt
```

And as a result you get:

```text
page 2: command 'is 4/4' is not recognizable or applicable on the line 3
2 page(s), 1 error(s)
```

The exit code is **1**, so the script can stop a CI job or a pre-commit hook. Nothing here loads a font, draws an SVG or builds a MIDI file.

Read next: [Worker](/docs/worker/overview)

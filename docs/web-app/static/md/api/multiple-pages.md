# Multiple pages

A document of several pages goes through the same four steps as [a single page](/docs/api/single-page). Each function has a multi-page form that takes an array, one entry per page, and returns arrays in the same order.

| Single page | Multiple pages |
| --- | --- |
| `generateIntermediateStructuresForSinglePage({ pageText })` | `generateIntermediateStructuresForMultiplePages({ multiplePagesText })` |
| `generateStylesForSinglePage({ customStyles, supportedFontSources })` | `generateStylesForMultiplePages({ customStylesForEachPage, supportedFontSources })` |
| `generateSvgForSinglePage({ pageSchema, pageStyles, left, top })` | `generateSvgForMultiplePages({ pageSchemaForEachPage, pageStylesForEachPage, left, top, intervalBetweenPages })` |
| `generateMidiForSinglePage({ pageSchema, midiSettings })` | `generateMidiForMultiplePages({ pageSchemaForEachPage, midiSettingsForEachPage })` |

## 1. Splitting the text

MSQ has no command for a page break, so the API does not split anything. `multiplePagesText` is an array of page texts, and you split the text yourself before calling it.

The convention the repository uses is a line that reads `====next page====`. Let's take two pages. The first one:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
repeat sign at the start
c d e f
</template>
</div>

and the second one:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
repeat sign at the end
g a b c5
</template>
</div>

In one file they are written one after another, with `====next page====` on its own line between them.

The same delimiter is used by the visual and audio test fixtures under `test/`, and by the CLI, which lets you change it with `--page-delimiter`. So a file written for one of them works with the others. In your own code it is just a `split`:

```js
const multiplePagesText = text.split('====next page====')
```

## 2. Parsing

`generateIntermediateStructuresForMultiplePages` takes the same options as the single-page form, `applyHighlighting`, `applyOnlyHighlightingWithoutRefIds`, `progressionOfCommandsFromScenarios` and `supportedFontNames`, and applies them to every page. It parses each page on its own and returns one array per field:

```js
const {
  pageSchemaForEachPage,
  errorsForEachPage,
  customStylesForEachPage,
  midiSettingsForEachPage,
  commentsForEachPage,
  htmlHighlightsForEachPage,
  mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage
} = generateIntermediateStructuresForMultiplePages({ multiplePagesText })
```

It also does one thing the single-page form does not: it writes `pageIndex` and `measureIndexOnPage` onto every measure of every page schema. Those two numbers are what the MIDI ref ids are built from, so here you do not need to set them yourself.

Since every page is parsed on its own, every page has its own styles and its own MIDI settings. A style set on the first page is not carried into the second.

## 3. Styles and SVG

`generateStylesForMultiplePages` calls the same style generation once per page, with the one `supportedFontSources` shared by all of them:

```js
const pageStylesForEachPage = generateStylesForMultiplePages({
  customStylesForEachPage,
  supportedFontSources
})
```

`generateSvgForMultiplePages` draws every page into **one** SVG, stacked from top to bottom:

```js
const svg = generateSvgForMultiplePages({
  pageSchemaForEachPage,
  pageStylesForEachPage,
  intervalBetweenPages: 20
})
```

Each page is drawn at the bottom of the previous one plus `intervalBetweenPages`, in SVG units. By default it is **15**. `left` and `top` place the first page, and are **0** by default, like in the single-page form.

**Side note:** the value is read as `intervalBetweenPages || 15`, so at the moment you cannot pass **0** to have pages touching. Pass a very small number instead.

If you want one SVG per page, like the CLI writes, call `generateSvgForSinglePage` once for each page instead.

## 4. MIDI

The MIDI side works differently, because music does not stop at a page boundary. `generateMidiForMultiplePages` puts the measures of all pages into one list, in order, and performs that list as one continuous piece:

```js
const midi = generateMidiForMultiplePages({
  pageSchemaForEachPage,
  midiSettingsForEachPage
})
```

You get one MIDI file for the whole document, and no silence is added between pages. The two maps work across pages: every entry of `timeStampsMappedWithRefsOn` carries the `pageIndex` it came from, and `refsOnMappedWithTimeStamps` is keyed by page index first, so the same ref id on two pages does not collide.

This is what it means for repeats: since the performance sees one list of measures, a repeat sign, a volta bracket, a sign or a coda can jump across a page boundary. In the example above, the repeat sign at the end of the second page goes back to the repeat sign at the start of the first, so the performance plays both pages twice. And a repeat sign at the end with no repeat sign at the start before it goes back to the first measure of the whole document, not of its own page.

The MIDI settings are still per page, but they are not all read the same way. `default instrument` is taken from the page each note is on. `default tempo` is read once, from the first page, at the start of the performance.

Read next: [Validation](/docs/api/validation)

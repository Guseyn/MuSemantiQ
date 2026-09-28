# Overview

The low-level API is what the web components, the CLI and the test runners are built on. It lives in `src/api.js`, it is plain ES modules, and it has no dependencies other than the libraries vendored under `src/`.

## 1. The functions

There are eleven public functions. Five of them come in a single-page and a multi-page form:

| Function | Takes | Returns |
| --- | --- | --- |
| `setupFonts(fontConfig)` | a font config (optional in Node) | a promise of `supportedFontSources` |
| `generateIntermediateStructuresForSinglePage({ pageText, … })` | the MSQ text of one page | `pageSchema`, `errors`, `customStyles`, `midiSettings`, `comments`, `highlightsHtmlBuffer`, … |
| `generateIntermediateStructuresForMultiplePages({ multiplePagesText, … })` | an array of page texts | the same, one array entry per page |
| `generateStylesForSinglePage({ customStyles, supportedFontSources })` | custom styles and loaded fonts | `pageStyles` |
| `generateStylesForMultiplePages({ customStylesForEachPage, supportedFontSources })` | the same, per page | an array of `pageStyles` |
| `generateSvgForSinglePage({ pageSchema, pageStyles, left, top })` | a schema and its styles | an SVG string |
| `generateSvgForMultiplePages({ pageSchemaForEachPage, pageStylesForEachPage, left, top, intervalBetweenPages })` | schemas and styles, per page | one SVG string with every page in it |
| `generateMidiForSinglePage({ pageSchema, midiSettings })` | a schema and its MIDI settings | `{ data, timeStampsMappedWithRefsOn, refsOnMappedWithTimeStamps }` |
| `generateMidiForMultiplePages({ pageSchemaForEachPage, midiSettingsForEachPage })` | schemas and settings, per page | the same, for the whole document |
| `isPageSchemaValid(pageSchema)` | a page schema | a validation result |
| `areAllPageSchemasValid(pageSchemas)` | an array of page schemas | a boolean |

Each of them has its own page further in this section.

## 2. The pipeline

The functions are meant to be called in one order:

```text
text ──► intermediate structures ──► styles ──► SVG
                 │
                 └──────────────────────────► MIDI
```

1. `setupFonts` loads the fonts once. You keep what it returns and reuse it for every page.
2. `generateIntermediateStructuresFor…` parses the text. This is where the page schema, the custom styles, the MIDI settings, the comments, the errors and the highlighted source all come from, in one pass.
3. `generateStylesFor…` combines the custom styles of a page with the loaded fonts into the full set of engraving values.
4. `generateSvgFor…` draws the page schema with those styles.
5. `generateMidiFor…` performs the page schema with the MIDI settings. It does not need the styles or the fonts at all.

It's important to mention that only `setupFonts` is async, because it is the only one that reads files. Everything after it is a plain synchronous call, so once the fonts are loaded, parsing and engraving a page is just a few function calls in a row.

## 3. The parse/render split

The two `generateIntermediateStructuresFor…` functions do not live in `src/api.js`. They only parse, so they are defined in `src/language/api.js` and `src/api.js` re-exports them:

```js
export {
  generateIntermediateStructuresForSinglePage,
  generateIntermediateStructuresForMultiplePages
} from '#msq/language/api.js'
```

This is why the split matters: `src/api.js` imports the drawer, opentype.js and the MIDI engine, and `src/language/api.js` imports none of them. A page that only needs to highlight text, like the editor does on every keystroke, imports `#msq/language/api.js` and never loads the drawer, the fonts or the MIDI engine. More about that you can read in [Using the language alone](/docs/api/language-only).

## 4. Node and the browser

In **Node** you import `#msq/api.js` and call the functions directly. The `#msq/…` specifiers are subpath imports declared in `package.json`, so they resolve for any module inside the repository. `setupFonts()` with no arguments loads the fonts from `src/drawer/font/`, relative to the current working directory, so run your script from the repository root.

In the **browser** the same functions run inside a module worker, `src/worker.js`, which the web components talk to by message. You do not call `src/api.js` from the page. The page gets two things only: the components, and the language, which it imports as `#msq/language/api.js` for highlighting on the main thread. The browser also has no default fonts, so `setupFonts` needs a full font config with URLs. More about that in [setupFonts](/docs/api/setup-fonts) and [The worker](/docs/architecture/the-worker).

Read next: [setupFonts](/docs/api/setup-fonts)

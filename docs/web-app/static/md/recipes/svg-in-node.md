# Engrave to SVG in Node

This recipe is a script that reads an MSQ file, engraves every page of it, and writes one SVG per page. It uses the low-level API directly, the same calls the test runners make, described in [Multiple pages](/docs/api/overview).

## 1. The script

Save it as `engrave.js` in the root of your clone:

```js
import fs from 'fs/promises'
import path from 'path'

import {
  setupFonts,
  generateIntermediateStructuresForMultiplePages,
  areAllPageSchemasValid,
  generateStylesForMultiplePages,
  generateSvgForSinglePage
} from '#msq/api.js'

const [ input, outDir = 'build' ] = process.argv.slice(2)
if (!input) {
  console.error('usage: node engrave.js <score.txt> [out dir]')
  process.exit(2)
}

// 1. The fonts, and the names the music may call them by.
const supportedFontSources = await setupFonts()
const supportedFontNames = {
  'chord-letters': Object.keys(supportedFontSources['chord-letters']),
  'music': Object.keys(supportedFontSources['music']),
  'text': [ ...new Set([
    ...Object.keys(supportedFontSources['text']['regular']),
    ...Object.keys(supportedFontSources['text']['bold'])
  ]) ]
}

// 2. The pages, split before parsing: the API splits nothing itself.
const text = await fs.readFile(input, 'utf-8')
const multiplePagesText = text
  .split('====next page====')
  .filter((page) => page.trim() !== '')

const {
  pageSchemaForEachPage,
  customStylesForEachPage,
  errorsForEachPage
} = generateIntermediateStructuresForMultiplePages({
  multiplePagesText,
  supportedFontNames
})

// 3. What the parser could not read.
let errorCount = 0
errorsForEachPage.forEach((errors, pageIndex) => {
  for (const error of errors) {
    console.error(`page ${pageIndex + 1}: ${error}`)
    errorCount++
  }
})

if (!areAllPageSchemasValid(pageSchemaForEachPage)) {
  console.error('a page schema is not valid; nothing was engraved')
  process.exit(1)
}

// 4. One SVG per page.
const pageStylesForEachPage = generateStylesForMultiplePages({
  customStylesForEachPage,
  supportedFontSources
})

await fs.mkdir(outDir, { recursive: true })
const name = path.basename(input, path.extname(input))
for (const [ pageIndex, pageSchema ] of pageSchemaForEachPage.entries()) {
  const svg = generateSvgForSinglePage({
    pageSchema,
    pageStyles: pageStylesForEachPage[pageIndex]
  })
  const file = path.join(outDir, `${name}.page-${pageIndex + 1}.svg`)
  await fs.writeFile(file, svg)
  console.log(`wrote ${file}`)
}

process.exit(errorCount > 0 ? 1 : 0)
```

And run it from the root of the clone:

```bash
node engrave.js score.txt build
```

For a file with two pages it prints:

```text
wrote build/score.page-1.svg
wrote build/score.page-2.svg
```

It's important to mention where the script lives. `#msq/api.js` is a specifier from the `imports` field of the repository's `package.json`, and Node only resolves it for files inside the package. A script somewhere else has to import `src/api.js` by its path instead.

## 2. The fonts a Node process needs

In Node, `setupFonts()` with no argument loads the fonts the repository ships: **Bravura** and **Leland** for music, **Noto Serif** and **Noto Sans** for text, **Gentium Plus** and **Gothic A1** for chord letters. Their paths are relative, `./src/drawer/font/…`, and they are resolved against the working directory, which is why the script is run from the root of the clone. Run it from anywhere else and the first font fails to load.

You can pass a config of your own instead. It replaces a whole family at a time: give it `music` and the default text and chord-letter fonts stay. The shape is described in [setupFonts](/docs/api/overview#1-setupfonts).

Two things come out of it, and both are needed. `supportedFontSources` is what the drawer engraves with. `supportedFontNames` is what the parser checks `music font is …`, `text font is …` and `chord letters font is …` against, so a name you did not register is an error in the music rather than a font that silently falls back.

## 3. One file per page

The script calls `generateSvgForSinglePage` once per page rather than `generateSvgForMultiplePages` once, because a page is a sheet of paper. The multi-page call stacks every page vertically into a single SVG, which is what the test suites compare, but it is rarely what you want to print or to put on a web page.

The file names follow the input: `score.txt` becomes `score.page-1.svg`, `score.page-2.svg`, and so on, so the outputs stay matched to the input they came from.

## 4. The errors to check before trusting the output

The parser does not stop at the first mistake. It reports what it could not read and carries on, so an SVG is still written, engraved from everything it did understand. That makes the output easy to trust when it should not be. So the script checks two things:

1. **`errorsForEachPage`**, one list per page, each error a sentence that ends with the line it came from:

   ```text
   page 1: measure after command 'to ' is not found on the line 11
   ```

   The script prints every one and exits with **1**, after writing the SVGs, so a shell or CI job can tell a clean run from one that engraved less than was written.

2. **`areAllPageSchemasValid`**, which checks the page schemas against the schema the drawer expects. There is nothing sensible to engrave from one that is not, so the script stops there, the same way the test runners do. It matters most when a page schema was built or changed by something other than the parser.

More about what the errors say you can read in [Handling errors](/docs/language/handling-errors).

Read next: [Render a folder from the CLI](/docs/recipes/folder-from-cli)

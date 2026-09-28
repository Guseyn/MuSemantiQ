# Convert a MusicXML library

This recipe converts a whole folder of MusicXML into MSQ, collects what each file lost into one summary, and shows how to take the result back out again. It uses the converters described in [MusicXML import](/docs/tools/musicxml-import) and [MusicXML export](/docs/tools/musicxml-export). There is no command for them, so the recipe is two short scripts.

## 1. The batch script

Save it as `convert-library.js` in the root of your clone. It uses the `#tools/…` and `#msq/…` specifiers from the repository's `package.json`, and Node only resolves those for files inside the package.

```js
import fs from 'fs/promises'
import path from 'path'

import fromMusicXml from '#tools/musicxml/fromMusicXml.js'
import serialize from '#msq/language/serializer/serialize.js'

const [ from, to = 'converted' ] = process.argv.slice(2)
if (!from) {
  console.error('usage: node convert-library.js <folder of MusicXML> [out folder]')
  process.exit(2)
}

await fs.mkdir(to, { recursive: true })

const files = (await fs.readdir(from))
  .filter((file) => /\.(musicxml|xml)$/i.test(file))
  .sort()

// what -> { count, files }
const summary = new Map()
const failed = []

for (const file of files) {
  const name = path.basename(file, path.extname(file))
  let converted
  try {
    converted = fromMusicXml(await fs.readFile(path.join(from, file), 'utf-8'))
  } catch (error) {
    failed.push({ file, error: error.message })
    continue
  }

  const { pageSchema, customStyles, midiSettings, report } = converted
  await fs.writeFile(
    path.join(to, `${name}.txt`),
    serialize(pageSchema, customStyles, midiSettings, [])
  )
  await fs.writeFile(
    path.join(to, `${name}.report.json`),
    JSON.stringify(report, null, 2)
  )

  for (const { what, count } of report.unsupported) {
    const seen = summary.get(what) || { count: 0, files: [] }
    seen.count += count
    seen.files.push(file)
    summary.set(what, seen)
  }
}

const rows = [ ...summary.entries() ]
  .sort(([ , one ], [ , other ]) => other.files.length - one.files.length)

console.log(`${files.length - failed.length} of ${files.length} converted into ${to}\n`)
for (const [ what, { count, files: where } ] of rows) {
  console.log(`${String(where.length).padStart(4)} files  ${String(count).padStart(5)}×  ${what}`)
}
for (const { file, error } of failed) {
  console.log(`could not read ${file}: ${error}`)
}

await fs.writeFile(
  path.join(to, 'summary.json'),
  JSON.stringify({ unsupported: Object.fromEntries(rows), failed }, null, 2)
)
process.exit(failed.length ? 1 : 0)
```

And run it from the root of the clone:

```bash
node convert-library.js library converted
```

For every `name.musicxml` (or `name.xml`) it writes `name.txt`, the page as MSQ, and `name.report.json`, the importer's report for that file. The converters read uncompressed XML only, so unzip any `.mxl` first.

## 2. One summary for the whole library

A report per file is what you need to fix one file, and a poor way to see a library. So the script also adds the reports up: for each kind of thing dropped, how many files it happened in and how many times in all, most widespread first. For a small folder it prints:

```text
3 of 4 converted into converted

   2 files      2×  <schleifer>
   1 files      1×  a page break, which becomes a line break
could not read broken.musicxml: the document has no root element
```

The same, with the name of every file under each entry, is written to `converted/summary.json`. A file the importer could not read at all is listed at the end, and the script exits with **1** when there is one, so a shell can tell.

It's important to mention what the summary cannot tell you. It adds up what the importer **knows** it dropped. An element it does not recognise at all is skipped without being reported, so a library with an empty summary is still worth looking at.

## 3. Deciding what is worth fixing by hand

Read the summary from the top. You have to remember the following rules:

1. **A feature in most files is a feature of the library.** If every file loses the same thing, fixing it by hand in each MSQ file is the wrong way round; it is worth asking whether the importer should learn it.
2. **A feature in one or two files is worth fixing in those files.** Open the `name.txt`, find the place, and write what was lost by hand, if MSQ can say it.
3. **Some losses cannot be fixed, only accepted.** An ornament MSQ has no mark for stays lost however you write the file. A page break is only a line break, because an MSQ page does not break into sheets on its own. Decide once whether that matters for this library.
4. **Engrave before you decide.** Open a few files of each kind in the [MusicXML tool](/docs/dev-tools/musicxml-tool), or engrave them with the CLI, and look. A dropped marking that nobody would miss on the page is not worth an hour.

Fix the MSQ, not the MusicXML. The `.txt` files are what you keep from now on.

## 4. Round-tripping back out

The second script takes the folder of MSQ back to MusicXML. Save it as `export-library.js` beside the first:

```js
import fs from 'fs/promises'
import path from 'path'

import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'
import toMusicXml from '#tools/musicxml/toMusicXml.js'

const [ from, to = 'exported' ] = process.argv.slice(2)
await fs.mkdir(to, { recursive: true })

// The names `music font is …` and the like are checked against.
const supportedFontNames = {
  'chord-letters': [ 'gentium plus', 'gothic a1' ],
  'music': [ 'bravura', 'leland' ],
  'text': [ 'noto-serif', 'noto-sans' ]
}

for (const file of (await fs.readdir(from)).filter((one) => one.endsWith('.txt')).sort()) {
  const name = path.basename(file, '.txt')
  const pageText = await fs.readFile(path.join(from, file), 'utf-8')
  const { pageSchema, customStyles, midiSettings, errors } =
    generateIntermediateStructuresForSinglePage({ pageText, supportedFontNames })
  if (errors.length) {
    console.log(`${file}: ${errors.length} parse errors, skipped`)
    continue
  }
  const { xml, report } = toMusicXml({ pageSchema, customStyles, midiSettings })
  await fs.writeFile(path.join(to, `${name}.musicxml`), xml)
  for (const { what, count } of report.unsupported) {
    console.log(`${file}: ${what} (${count}×) was not written`)
  }
}
```

```bash
node export-library.js converted exported
```

It only parses, so it needs no fonts, just their names. A file you edited by hand and broke is skipped and named, rather than exported from less than you wrote. It treats each file as one page, which is what the importer writes.

## 5. What changes when you do

A file that has been in and out again is the same music, but it is not the same file. Here is what to expect:

1. **Everything the import dropped stays dropped.** The export cannot write what the MSQ does not hold.
2. **The implicit becomes explicit.** Every note leaves with a written octave and a written stem direction, so importing the exported file again gives `1/4 g4, with stem up` where the first import gave `1/4 g4`.
3. **Some of the page's own words change.** Read back in, a `composer is` line comes back as `left subtitle is`, and a key or time signature written `for each line` comes back without it, stated in the measure where the importer found it.
4. **The layout is described, not kept.** The page size, the margins and the distances between staves and lines go out; how units are compressed or stretched in a line does not, and the export says so.
5. **The file itself is new.** 768 divisions per quarter note, `MuSemantiQ` as the encoding software, today's date, and no trace of the program that wrote the original.

So keep the original MusicXML. The round trip is for handing the music to another program, not for replacing the file you started from.

Read next: [Glossary](/docs/reference/glossary)

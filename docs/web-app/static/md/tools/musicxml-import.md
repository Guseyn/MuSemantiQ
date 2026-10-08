# MusicXML Import [beta]

<nav is="docs-contents"></nav>

`tools/musicxml/fromMusicXml.js` reads a MusicXML document and returns a MuSemantiQ page. The [MusicXML tool](/docs/dev-tools/musicxml-tool) in the dev tools runs it from the browser.

**Important note:** this feature is in beta. Unlike the rest of the code, it was mostly drafted with an LLM, and it needs a deeper approach. I added it just to help you migrate your scores to MSQ, so it solves this problem only partly. MusicXML is a difficult and poorly documented format, so improving it is not a high priority task at the moment, although it may be more important than I think.

## How to Use It

```js
import fromMusicXml from '#tools/musicxml/fromMusicXml.js'

const { pageSchema, customStyles, midiSettings, report } = fromMusicXml(xmlText)
```

- `xmlText`: the MusicXML document, as a string.
- It throws if the document is not `score-partwise` or `score-timewise`, or if it has no parts.
- A compressed `.mxl` file has to be unzipped first.

## What You Get

- `pageSchema`, `customStyles`, `midiSettings`: the same structures the parser returns, so you can engrave them, play them, or turn them into MSQ text with the serializer.
- `report`: what could not be imported.

## The Report

```json
{
  "unsupported": [
    { "what": "<schleifer>", "count": 1, "first": "ornaments" }
  ],
  "notes": []
}
```

- `unsupported`: one entry for each kind of thing that was dropped. `count` says how many times, and `first` says in which element it was found first.
- `notes`: remarks that are not losses, for example that a `score-timewise` document was converted first.

## What to Remember

- Nothing is guessed. What a page cannot hold is dropped and named in the report.
- An element the importer doesn't know at all is skipped without a report entry, so always look at the result.
- A page break becomes a line break.

Read next: [MusicXML export](/docs/tools/musicxml-export)

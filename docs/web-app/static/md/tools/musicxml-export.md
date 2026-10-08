# MusicXML Export [beta]

<nav is="docs-contents"></nav>

`tools/musicxml/toMusicXml.js` writes a MuSemantiQ page as a MusicXML 4.0 document. The [MusicXML tool](/docs/dev-tools/musicxml-tool) in the dev tools runs it from the browser.

**Important note:** this feature is in beta. Unlike the rest of the code, it was mostly drafted with an LLM, and it needs a deeper approach. I added it just to help you migrate your scores to MSQ, so it solves this problem only partly. MusicXML is a difficult and poorly documented format, so improving it is not a high priority task at the moment, although it may be more important than I think.

## How to Use It

```js
import toMusicXml from '#tools/musicxml/toMusicXml.js'

const { xml, report } = toMusicXml({ pageSchema, customStyles, midiSettings })
```

- `pageSchema`, `customStyles`, `midiSettings`: one page, as the parser returns it.
- It throws if the page schema has no `measuresParams`.

## What You Get

- `xml`: a `score-partwise` document. Braced staves become one part, like a piano, and every other stave is a part of its own.
- `report`: what could not be exported, in the same shape as in [MusicXML import](/docs/tools/musicxml-import).

## What It Adds

MusicXML needs some things that MSQ text can leave out:

- If a note has no octave, it takes the default octave of its clef: **4** for treble, **2** for bass, **3** for alto.
- The sounding pitch comes from the accidental on the note, then an earlier accidental in the same measure, then the key signature.

## What to Remember

- These are not exported, and the report says so: hiding the last measure, compressing or stretching units, and which stave the lyrics are under.
- These are not exported, and the report doesn't say so: fonts, colours and other styles except the page layout, MIDI settings except the default tempo, and comments.
- The file has today's date in it, so two exports of the same page on different days are not the same byte for byte.

Read next: [Overview](/docs/dev-tools/overview)

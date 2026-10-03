# MusicXML export

`tools/musicxml/toMusicXml.js` writes a MuSemantiQ page out as a MusicXML 4.0 `score-partwise` document, and returns a report of what it had nowhere to put:

```js
import toMusicXml from '#tools/musicxml/toMusicXml.js'

const { xml, report } = toMusicXml({ pageSchema, customStyles, midiSettings })
```

It takes one page, as the parser returns it, and throws when the page schema has no `measuresParams`. It is the transpose the importer does, done the other way: the staves of the page are gathered into parts first (braced staves become one part with `<staves>`, like a piano, and every other stave is a part of its own), and then each part is walked down the page.

## 1. Making explicit what MSQ leaves implicit

A page is allowed to leave things to context. MusicXML is not: it has nowhere to put "it depends". So the export has to decide, for every note, two things the page often does not say.

**The octave.** A page may write `a` and let the clef decide which A. MusicXML needs `<octave>`.

**The pitch.** MusicXML says both what is drawn, `<accidental>`, and what is heard, `<alter>`. The two differ wherever a key signature or an earlier accidental in the bar is doing the work, and a page records only what is drawn.

## 2. The octave comes from the clef

When a note has no octave of its own, the export takes the default octave of the clef its stave is in:

| Clef | Octave | Clef | Octave |
| --- | --- | --- | --- |
| **treble** | 4 | **tenor** | 3 |
| **bass** | 2 | **octaveEightUp** | 5 |
| **alto** | 3 | **octaveEightDown** | 3 |
| **baritone** | 4 | **octaveFifteenUp** | 6 |
| **mezzoSoprano** | 3 | **octaveFifteenDown** | 2 |
| **soprano** | 4 | | |

These are the same numbers the MIDI side uses to decide which note to play, in `src/midi/octaveForNoteTimeFrame.js`, so an exported file sounds like the page sounds. It's important to mention that they are the same values, not the same table: `toMusicXml.js` keeps its own copy, `DEFAULT_OCTAVE_BY_CLEF`, rather than importing the MIDI side's. If one changes, the other has to change with it.

## 3. `accidental` versus `alter`

For every measure, the export keeps two things per part:

- **from the key**: the sharps and flats the key signature puts in force, by step, worked out from its number of fifths
- **in the bar**: every accidental drawn so far in this measure, by step and octave

For each note, `alter` is then the first of these that applies: the accidental drawn on this note, else an accidental drawn earlier in the bar on the same step and octave, else the key signature. `accidental` is written only when the page actually draws one on the note. Both are tracked per measure because that is how the rule works on paper: a barline cancels the accidentals of the bar before it, and not the key signature.

## 4. What does not survive the trip out

The report names three things MusicXML has no way to say, because it describes a score, not a MuSemantiQ page:

| In the report | What it is on the page |
| --- | --- |
| **hiding the last measure** | `hideLastMeasure` |
| **compressing or stretching the units of a line** | `compress units by … times` and `stretch units by … times`, for a line or for the page |
| **which stave the lyrics sit under** | `lyricsUnderStaveIndex` |

Beyond those, some things are left out without a report entry:

1. Of the custom styles, only the page layout is written: the page height, the page width, the paddings as margins, and the intervals between staves and between page lines. Fonts, colours and every other style stay behind.
2. Of the MIDI settings, only the default tempo is written, as a metronome mark on the first measure.
3. Comments are not written at all. `toMusicXml` does not take them.
4. The file says it was written by **MuSemantiQ** on today's date, so two exports of the same page on different days are not byte for byte the same.

## 5. A worked example

Let's examine the following page. It is in G major, on a bass clef, and none of its notes says its octave except the last one:

```msq-editor opens-with=text
stretch units by 1.2 times in line 1

measure
key signature is g major
stave with bass clef
1/4 f
f with natural key
f
1/4 c4
```

The report says what was left behind:

```json
{
  "unsupported": [
    { "what": "compressing or stretching the units of a line", "count": 1 }
  ],
  "notes": []
}
```

And these are the four notes it writes, in 768 divisions per quarter:

```xml
<note>
  <pitch>
    <step>F</step>
    <alter>1</alter>
    <octave>2</octave>
  </pitch>
  <duration>768</duration>
  <voice>1</voice>
  <type>quarter</type>
  <stem>up</stem>
  <staff>1</staff>
</note>
<note>
  <pitch>
    <step>F</step>
    <octave>2</octave>
  </pitch>
  <duration>768</duration>
  <voice>1</voice>
  <type>quarter</type>
  <accidental>natural</accidental>
  <stem>up</stem>
  <staff>1</staff>
</note>
<note>
  <pitch>
    <step>F</step>
    <octave>2</octave>
  </pitch>
  <duration>768</duration>
  <voice>1</voice>
  <type>quarter</type>
  <stem>up</stem>
  <staff>1</staff>
</note>
<note>
  <pitch>
    <step>C</step>
    <octave>4</octave>
  </pitch>
  <duration>768</duration>
  <voice>1</voice>
  <type>quarter</type>
  <stem>up</stem>
  <staff>1</staff>
</note>
```

As you can see, every `f` became **F2**, because the clef is a bass clef. The first one sounds F sharp, because the key says so, and draws no accidental. The second draws a natural and sounds F. The third draws nothing and still sounds F, because the natural earlier in the bar is still in force. The last note said its own octave, so it is **C4**.

The divisions are **768** per quarter note because that number has to divide every value a page can write, down to a 256th, and still land on whole numbers inside triplets and their dots. 768 is 64 × 12, which does both.

Read next: [The three suites](/docs/testing/the-suites)

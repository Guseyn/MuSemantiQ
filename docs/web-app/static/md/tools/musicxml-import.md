# MusicXML import

`tools/musicxml/fromMusicXml.js` reads a MusicXML document and returns a MuSemantiQ page: a page schema, custom styles, MIDI settings, and a report of what it could not carry over. The [MusicXML tool](/docs/dev-tools/musicxml-tool) runs it from the browser; this page is about what it does.

```js
import fromMusicXml from '#tools/musicxml/fromMusicXml.js'

const { pageSchema, customStyles, midiSettings, report } = fromMusicXml(xmlText)
```

It takes the document as a string and throws when it cannot read it at all: when there is no root element, when the root is neither `score-partwise` nor `score-timewise`, or when the score has no parts. A compressed `.mxl` file has to be unzipped first, because the reader only reads XML text.

## 1. The central idea: a transpose

The two formats disagree about what the outermost thing is. MusicXML is a list of **parts**, and each part holds its own run of **measures**. A MuSemantiQ page is a list of **measures**, and each measure holds the **staves** sounding at that moment.

So importing is a transpose. The importer walks measure 1 of every part together and lays their staves side by side into measure 1 of the page, then measure 2, and so on. A part with two `<staves>`, a piano, becomes two staves of the page; a part that has run out of measures leaves its staves with an empty voice, because every stave of a measure needs one.

A `score-timewise` document nests the other way round, measure then part. It is rare enough that rather than teach the walk about both, it is turned partwise first, and the report says so in its `notes`.

Some things belong to the page rather than to one part, and for those only the first part is believed: where a new system starts (`<print new-system="yes">`, which becomes `new line`), and whether measure numbers are shown. A measure that begins a page line restates its clef, and a brace or bracket is restated on every page line, because a MuSemantiQ page line with no clef is not one it can lay out.

## 2. Pairing the spans

MusicXML marks a slur, a tuplet, a glissando and the other things that run between two notes with a `start` on one note and a `stop` on another, and tells them apart by a `number`, which is reused as soon as the span closes. A page marks both ends with the same `key`, unique on the whole page, and flags the last one `finish`.

So the importer mints a fresh key at every `start`, `slur-1`, `slur-2`, `tuplet-1`, and remembers it under its kind and number until the `stop` with the same kind and number arrives:

```json
{ "notes": [ { "noteName": "g", "octaveNumber": "4", "id": 0 } ], "unitDuration": 0.25, "slurMarks": [ { "key": "slur-1" } ] }
```

and, two notes later:

```json
{ "slurMarks": [ { "key": "slur-1", "finish": true } ] }
```

A `stop` that has no open `start` is dropped, because there is nothing to pair it with.

## 3. Nothing is guessed

When the importer meets a feature a page cannot hold, it does not approximate it. It drops it and names it in the report, so an import that lost something says so, rather than quietly engraving less than the file contained.

It's important to mention where that promise ends. The report names what the importer **knows** it cannot hold: an ornament it has no mark for, a `<harp-pedals>` or a `<scordatura>` direction, a time signature it cannot write, a page break. An element it does not know at all, like an `<image>` direction, is skipped without a word. So an empty report means nothing the importer recognised was lost, and the stave is still the final check.

## 4. Reading `report.unsupported`

The report has two lists:

```json
{
  "unsupported": [
    { "what": "<schleifer>", "count": 1, "first": "ornaments" }
  ],
  "notes": []
}
```

`unsupported` has one entry per kind of thing dropped. `what` says what it was, in words or as the element name. `count` says how many times it happened in the whole score, so one entry stands for every occurrence. `first` names the element it was first found in: `ornaments`, `direction`, `time`, `print`, `defaults`. `notes` holds remarks that are not losses, like the timewise conversion above.

## 5. A worked example

Let's start with a short flute part: four quarters with a slur over the first three and a schleifer on the fourth, then a new system and page, and a whole note with a fermata:

```xml
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Flute</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>1</duration><type>quarter</type>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>1</duration><type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>1</duration><type>quarter</type>
        <notations><slur type="stop" number="1"/></notations>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration><type>quarter</type>
        <notations><ornaments><schleifer/></ornaments></notations>
      </note>
    </measure>
    <measure number="2">
      <print new-system="yes" new-page="yes"/>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>4</duration><type>whole</type>
        <notations><fermata type="upright"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>
```

The report it produces:

```json
{
  "unsupported": [
    { "what": "<schleifer>", "count": 1, "first": "ornaments" },
    { "what": "a page break, which becomes a line break", "count": 1, "first": "print" }
  ],
  "notes": []
}
```

And the page, written back as MSQ by the serializer, and engraved:

```msq-editor opens-with=text
default instrument is flute

measure
time signature is 4:4
key signature is g major
instrument title is "Flute" for stave 1
stave
treble clef
1/4 g4
1/4 a4
1/4 b4
1/4 c5
slur from unit 1 to unit 3

new line

measure
stave
treble clef
1 d5, with fermata up
```

As you can see, the slur was paired into `slur from unit 1 to unit 3`, the part name became both the instrument title and the default instrument, and the second measure restates its clef because it begins a page line. The schleifer is gone, and the page break is now only a line break, and both of those are in the report.

Read next: [MusicXML export](/docs/tools/musicxml-export)

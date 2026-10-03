# The page schema

The page schema is what a page means, as a plain JSON-compatible object. The parser writes it, the drawer draws it, and the MIDI engine performs it. It is described, field by field, in `src/language/schema/pageSchema.js`, which is also what [validation](/docs/api/validation) checks against.

## 1. The shape, top down

A page schema is nested four levels deep:

```text
pageSchema
  title, subtitle, …                   the page
  measuresParams[]                     each measure, in order
    stavesParams[]                     each stave of that measure, top to bottom
      clef
      voicesParams[][]                 each voice of that stave, and in it
        { notes[], unitDuration, … }   each unit of that voice, in order
```

As you may notice, `voicesParams` is an array of arrays: a stave has several voices, and a voice is a list of units. A unit is a note, a chord or a rest, and a chord is simply a unit with more than one entry in `notes`.

The page itself has these fields:

| Field | Type | What it is |
| --- | --- | --- |
| `title`, `subtitle`, `leftSubtitle`, `rightSubtitle`, `pageNumber` | string | the page meta |
| `showMeasureNumbers` | string | **all**, **first**, **last** or **first&last** |
| `directionOfMeasureNumbers` | string | **up** or **down** |
| `lyricsUnderStaveIndex` | number | the stave the lyrics go under |
| `compressUnitsByNTimes`, `stretchUnitsByNTimes` | number | unit spacing, from **1** to **5** |
| `compressUnitsByNTimesInLines`, `stretchUnitsByNTimesInLines` | array | the same, per page line |
| `hideLastMeasure` | boolean | draws the page without its last measure |
| `measuresParams` | array | the measures |

A measure holds what belongs to it as a whole: `pageLineNumber`, `timeSignatureParams`, `keySignatureName`, `openingBarLineName` and `closingBarLineName`, `repeatDotsMarkAtTheStart` and `repeatDotsMarkAtTheEnd`, `voltaMark`, `sign`, `coda`, `repetitionNote`, `tempoMark`, `endsWithFermata`, `isMeasureRest` and `multiMeasureRestCount`, the simile counts, `connectionsParams` for braces and brackets, `instrumentTitlesParams`, and `stavesParams`. A stave holds its `clef` and its `voicesParams`.

## 2. A unit, field by field

This is everything a unit can have:

| Field | Type | What it is |
| --- | --- | --- |
| `notes` | array | the notes of the unit: `noteName` (**a** to **g**), `octaveNumber` (**1** to **9**, as a string), `positionNumber` for rests and position-based units, `stave` (**prev**, **current** or **next**, for cross-stave chords), `isGhost`, and `id` |
| `unitDuration` | number | **4**, **2**, **1**, **1/2**, **1/4** and so on down to **1/256** |
| `numberOfDots` | number | the dots |
| `isRest` | boolean | the unit is a rest |
| `isFullMeasure` | boolean | a rest or unit that takes the whole measure |
| `stemDirection` | string | **up** or **down** |
| `beamedWithNext`, `beamedWithNextWithJustOneBeam` | boolean | beaming to the next unit |
| `keysParams` | array | accidentals: `noteName`, `octaveNumber`, `keyType` (for example **sharpKey**), `withParentheses`, `textValue` |
| `tiedWithNext`, `tiedBefore`, `tiedAfter`, `tiedBeforeMeasure`, `tiedAfterMeasure` | object | ties: `direction`, `roundCoefficientFactor`, and `index` for the ones across measures |
| `slurMarks` | array | slurs: `key`, `finish`, `before`, `after`, `direction`, `sShape`, `roundCoefficientFactor`, corrections, `rightPlacement` |
| `glissandoMarks` | array | glissandos: `key`, `form` (**wave** or **line**), `direction`, `before`, `after`, `beforeMeasure`, `afterMeasure` |
| `tupletMarks` | array | tuplets: `key`, `value` such as **3** or **3:2**, `finish`, `direction`, `withBrackets` |
| `articulationParams` | array | articulations, ornaments, dynamics and text labels: `name`, `direction`, `textValue`, `keyAbove`, `keyBelow`, `inverted`, `withWave`, `yCorrection` |
| `octaveSignMark` | object | an octave sign: `key`, `octaveNumber`, `octavePostfix`, `direction`, `finish` |
| `pedalMark` | object | a pedal mark: `key`, `start`, `release`, `finish`, `withBrackets`, `variablePeak`, and where it begins and ends |
| `dynamicChangeMark` | object | a crescendo or diminuendo: `key`, `type`, `direction`, `valueBefore`, `valueAfter` |
| `tremoloParams` | object | a tremolo: `type` (**single** or **withNext**) and `customNumberOfTremoloStrokes` |
| `simileMark`, `isSimile` | object, boolean | similes |
| `parentheses` | array | parentheses around some notes, or `appliedToWholeUnit` |
| `arpeggiated` | object or boolean | an arpeggiated chord: `arrow`, `isConnectedWithNextChord` |
| `relatedLyrics` | array | the lyrics under the unit: `textValue`, `dashAfter`, `underscoreStarts`, `underscoreFinishes` |
| `relatedChordLetter` | object | the chord letter above the unit: `textValue`, `direction` |
| `isGrace`, `hasGraceCrushLine` | boolean | grace units |
| `clefBefore`, `keySignatureBefore` | string | a mid-measure clef or key signature before the unit |
| `breathMarkBefore` | object | a breath mark before the unit: `type` (**double slash** or **comma**) |
| `relatedXCorrection` | number | a horizontal adjustment of the unit |

Most fields have a `yCorrection` or a similar correction beside them, which is what the adjusting commands write.

## 3. What is filled in for you

The schema records what was meant, and most of it is only present when the text said so. A few fields, though, are always there, because the drawer needs them on every unit:

1. `unitDuration` and `stemDirection` are on every unit. When the text does not give them, they are carried over from the previous unit in the voice, starting from **1/4** and **up**.
2. every note in `notes` has an `id`, its index in the chord.
3. every measure has a `pageLineNumber` and a `closingBarLineName`, which is **barLine** unless you chose another.
4. `beamedWithNext` is often written as `false` even where nothing was said about beams.

Everything else is only present when written. The most important one to remember is `octaveNumber`: it is absent unless the text names an octave, and absent means the default octave of the clef, which is **4** for the treble clef and **2** for the bass clef. Octaves are not carried from one unit to the next, unlike durations.

The multi-page parser also adds `pageIndex` and `measureIndexOnPage` to every measure. They are not part of the schema definition, and they are there for the MIDI ref ids.

## 4. The interchange format

The page schema is the one format everything else in the repository speaks:

1. **the serializer**, `src/language/serializer/serialize.js`, turns it back into MSQ: `serialize(pageSchema, customStyles, midiSettings, comments)` returns text that parses to the same schema. It is a printer, not a transcript, so the text is normalised, one unit per line with stem directions always stated.
2. **the MusicXML import**, `tools/musicxml/fromMusicXml.js`, reads a MusicXML document and returns `{ pageSchema, customStyles, midiSettings, report }`.
3. **the MusicXML export**, `tools/musicxml/toMusicXml.js`, takes `{ pageSchema, customStyles, midiSettings }` and returns `{ xml, report }`.

So a MusicXML file can be imported to a schema, serialized to MSQ, and edited as text, and the same schema can go straight to the drawer without any text at all.

## 5. A worked example

Let's take one small page:

```msq-editor opens-with=text
title is "Schema"

measure
treble clef
time signature is 4:4
1/4 c dotted
1/8 f sharp
1/4 rest
chord
c e g5
```

And this is the page schema it produces:

```json
{
  "title": "Schema",
  "measuresParams": [
    {
      "closingBarLineName": "barLine",
      "pageLineNumber": 1,
      "stavesParams": [
        {
          "clef": "treble",
          "voicesParams": [
            [
              {
                "notes": [ { "noteName": "c", "id": 0 } ],
                "unitDuration": 0.25,
                "stemDirection": "up",
                "numberOfDots": 1,
                "beamedWithNext": false
              },
              {
                "notes": [ { "noteName": "f", "id": 0 } ],
                "unitDuration": 0.125,
                "stemDirection": "up",
                "keysParams": [ { "noteName": "f", "keyType": "sharpKey", "id": 0 } ]
              },
              {
                "notes": [ { "positionNumber": 2, "id": 0 } ],
                "isRest": true,
                "unitDuration": 0.25,
                "stemDirection": "up",
                "beamedWithNext": false
              },
              {
                "notes": [
                  { "noteName": "c", "id": 0 },
                  { "noteName": "e", "id": 1 },
                  { "noteName": "g", "octaveNumber": "5", "id": 2 }
                ],
                "unitDuration": 0.25,
                "beamedWithNext": false,
                "stemDirection": "up"
              }
            ]
          ]
        }
      ],
      "timeSignatureParams": { "numerator": "4", "denominator": "4" }
    }
  ]
}
```

As you can see, the dot is `numberOfDots`, the sharp is an entry in `keysParams` rather than part of the note, the rest is placed by `positionNumber` instead of a note name, and only the **g** has an `octaveNumber`, because it is the only note whose octave was written.

Read next: [Using the language alone](/docs/api/language-only)

# Command Index

This page lists every command of the language in alphabetical order, with its other spellings and a link to the page that explains it. The other pages are in learning order, so use this one when you just need to find a name.

In the tables below:

- `N` is a number;
- `"…"` is text in quotes;
- a word in angle brackets, like `<clef>`, is one of the names listed on the linked page.

Many commands also accept small words that change nothing: `is`, `the`, and `in`, `on` or `at` before a position. They are left out here to keep the tables short.

## 1. Commands That Start a Line

You write these at the start of a line. Most of them take the whole line.

| Command | Also written as | What it does | Page |
|---|---|---|---|
| `<clef> clef` | `treble` or `g`, `bass` or `f`, `alto` or `c`, `tenor`, `soprano`, `mezzo soprano` or `mezzo`, `baritone`, `octave up`, `octave down`, `two octaves up`, `two octaves down` | sets the clef of the current stave | [Clefs](/docs/language/clefs) |
| `bracket from stave N to stave M` | `brace`; `for stave N`; `for each line`, `for lines below` | connects staves with a bracket or a brace | [Cross-stave connections](/docs/language/cross-stave-connections) |
| `c d e f` | `1/4 c`, `c5`, `a flat`, `rest` | notes and rests: the units themselves | [Your first notes](/docs/language/first-notes) |
| `chord` | `1/4 chord`, followed by its notes on the next line | groups the notes of the next line into one unit | [Chords](/docs/language/chords) |
| `closing barline` | `closing double barline`, `closing bold double barline`, `closing double bold barline`, `closing dotted barline` | sets the barline at the end of the current measure | [Barlines](/docs/language/barlines) |
| `coda` | `at the start of the measure`, `at the end of the measure`, `N up`, `N down` | draws a coda sign | [Coda](/docs/language/coda) |
| `comment: "…"` | `comment : "…"`, `comment is "…"`, `side note: "…"` | text that is not drawn, on one line or several | [Comments](/docs/language/comments) |
| `compress units by N times` | `two` for `2`; `in line N`, `in the Nth line` | brings units closer together | [Unit spacing](/docs/language/unit-spacing) |
| `crescendo from … to …` | `cresc`, `cresc.`, `cres`, `cres.`, `diminuendo`, `dim`, `dim.`; `starts … finishes …`; `above stave`, `below stave` | draws a crescendo or diminuendo | [Crescendo and diminuendo](/docs/language/crescendo-and-diminuendo) |
| `default instrument is <instrument>` | | the instrument the page is played on | [MIDI settings](/docs/language/midi-settings) |
| `default tempo is "…"` | | the tempo the page is played at | [MIDI settings](/docs/language/midi-settings) |
| `ends with <barline>` | `closes with`, `finishes with` | sets the barline at the end of the measure, right after `measure` | [Barlines](/docs/language/barlines) |
| `ends with fermata` | `fermata at the end` | puts a fermata over the closing barline | [Fermata over barline](/docs/language/fermata-over-barline) |
| `fermata duration is N` | | how many seconds a fermata adds in playback | [MIDI settings](/docs/language/midi-settings) |
| `glissando from … to …` | `gliss`, `gliss.`; `up`, `down`; `as wave`, `as line` | draws a glissando between two units | [Glissando](/docs/language/glissando) |
| `hide the last measure` | | hides the empty last measure of the page | [Unit spacing](/docs/language/unit-spacing) |
| `instrument title is "…" for stave N` | `instrument title "…"`, `instrument is "…"`, `instrument "…"`; `between stave N and stave M`; `for each line`, `for lines below` | names the instrument of a stave, or of a group of staves | [Instrument titles](/docs/language/instrument-titles) |
| `key signature is <key>` | `for each line`, `for lines below` | sets the key signature | [Key signatures](/docs/language/key-signatures) |
| `lyrics is under stave N` | `lyrics are` | puts the lyrics under another stave | [Lyrics](/docs/language/lyrics) |
| `measure` | `measure with …`, followed by the measure commands of this table | starts a new measure | [Measures](/docs/language/measures) |
| `measure numbers for first measures` | `last`, `all`, `first and last`, `first & last`; `above measures`, `below measures` | numbers the measures | [Measure numbers](/docs/language/measure-numbers) |
| `measure rest` | `multi measure rest N times` | a rest for the whole measure, or for several | [Measures](/docs/language/measures) |
| `new line` | | ends the page line and starts the next one, with a new measure | [Page lines](/docs/language/page-lines) |
| `no opening barline` | `no start barline`, `bar line` for `barline`; `without opening barline`, `without start barline`, `starts without barline`, `opens without barline`, `with no opening barline` | a measure without a barline at its start | [Barlines](/docs/language/barlines) |
| `octave up from … to …` | `octave down`, `octave higher`, `octave lower`, `two octaves up`, `two octaves down`, `2 octaves …` | draws an octave sign over a span | [Octave signs](/docs/language/octave-signs) |
| `opening barline` | `opening double bold barline`, `opening bold double barline`; `opens with barline`, `starts with`, `begins with` | sets the barline at the start of the measure | [Barlines](/docs/language/barlines) |
| `repeat of previous beat from … to …` | `repeat of previous beats`, `prev`, `prev.` | a beat simile | [Similes](/docs/language/similes) |
| `repeat sign at the start` | `colon`; `at the end`; `measure with colon at the start` | a repeat sign at one end of the measure | [Repeat signs](/docs/language/repeat-signs) |
| `repetition note "…"` | `repetition mark`, `repetition instruction`, `repetition note is "…"`; `at the start of the measure`, `at the end of the measure` | an instruction like **D.C. al Coda** | [Repetition instructions](/docs/language/repetition-instructions) |
| `sign` | `segno`; `at the start of the measure`, `at the end of the measure` | draws a segno | [Sign (segno)](/docs/language/sign) |
| `simile from … to …` | `repeat from … to …`; `N times` | a simile over several units | [Similes](/docs/language/similes) |
| `simile of previous measure` | `repeat of`, `simile for`, `prev`, `prev.`; `simile of two previous measures`; `N times`; `measure with simile of …` | repeats the measure, or the two measures, before | [Similes](/docs/language/similes) |
| `slur from … to …` | `starts at`, `starts before`, `finishes at`, `finishes after`, `begins`, `ends`; `up`, `down`, `above`, `below` | draws a slur | [Slurs](/docs/language/slurs) |
| `stave` | `staff`; `stave with <clef> clef` | starts a new stave in the current measure | [Staves](/docs/language/staves) |
| `stretch units by N times` | `two` for `2`; `in line N`, `in the Nth line` | moves units further apart | [Unit spacing](/docs/language/unit-spacing) |
| `<style> is <value>` | see the style reference | colours, fonts and sizes of the page | [The full style reference](/docs/language/style-reference) |
| `tempo is "…"` | `tempo mark`, `tempo note`, `metronome`, `metronome mark`, `metro`; `N up`, `N down` | a tempo or metronome mark over the measure | [Tempo and metronome marks](/docs/language/tempo-and-metronome-marks) |
| `time signature is 3:4` | `c`, `crossed c`; `for each line`, `for lines below` | sets the time signature | [Time signatures](/docs/language/time-signatures) |
| `title is "…"` | `subtitle`, `author`, `description`; `left subtitle`, `composer`, `arrangement`; `right subtitle`; `page number` | the titles and the page number | [Titles and page meta](/docs/language/titles-and-page-meta) |
| `tuplet 3 from … to …` | `tuplet 3:2`; `with brackets`; `up`, `down`, `above`, `below` | draws a tuplet over a span | [Tuplets](/docs/language/tuplets) |
| `voice` | | starts a new voice on the current stave | [Voices](/docs/language/voices) |
| `volta with text "…" from … to …` | `volta bracket`, `volta brackets`; `starts before`, `finishes after` | draws a volta bracket over measures | [Volta brackets](/docs/language/volta-brackets) |

## 2. What a Unit Can Carry

You write these after a unit, on the same line. Several of them are separated by commas: `1/4 c with stem up, with staccato`. Everything here works for a note and for a chord, unless the row says otherwise.

| Command | Also written as | What it does | Page |
|---|---|---|---|
| `1/4` before the unit | `4`, `2`, `1`, `1/2`, `1/8`, `1/16`, `1/32`, `1/64`, `1/128`, `1/256` | the duration | [Durations](/docs/language/durations) |
| `5` after the letter | `c3`, `c5`, and so on | the octave | [Octaves](/docs/language/octaves) |
| `beamed` | `is beamed`, `beamed with next`; `not beamed`, `not beamed with next`; `beamed with only primary line`, `with only one line` | opens and closes beams | [Beams](/docs/language/beams) |
| `dotted` | `is dotted`, `with dot`, `with 1 dot`, `with 2 dots` | dots | [Dots](/docs/language/dots) |
| `flat` | `sharp`, `natural`, `double flat`, `double sharp`, `demiflat`, `sesquiflat`, `demisharp`, `sesquisharp`; `with <accidental> key`, which also takes the short forms like `fl`, `#`, `n`, `2fl`, `dmsh`; `with sharp key with parentheses` | an accidental | [Accidentals](/docs/language/accidentals) |
| `is centralized` | `centralized`, `is in the center`, `in the center` | centres a whole-measure unit | [Centralized units](/docs/language/centralized-units) |
| `is ghost` | `ghost`; `is not ghost`, `not ghost` | a note with an x for a head | [Ghost units](/docs/language/ghost-units) |
| `is grace` | `grace`, `is crushed grace`, `crushed grace`, `is grace with crush line` | a grace unit | [Grace units](/docs/language/grace-units) |
| `is left by N` | `is right by N` | moves the unit sideways | [Adjusting units](/docs/language/adjusting-units) |
| `is octave up` | `octave down`, `octave higher`, `octave lower`, `two octaves …` | an octave sign over one unit | [Octave signs](/docs/language/octave-signs) |
| `is rest` | `rest`, `top rest`, `mid rest`, `middle rest`, `bottom rest` | makes the unit a rest, or places a rest | [Rests](/docs/language/rests) |
| `is arpeggiated` | `is arpeggio`, `arpeggiated`, `arpeggio`; `with chord below`; `with arrow up`, `with arrow down` | an arpeggio line, for a chord | [Arpeggiated chords](/docs/language/arpeggiated-chords) |
| `on the next stave` | `on next stave`, `on the previous stave`, `on the prev stave`, `on the current stave`, `in`, `at` | draws a unit on a neighbouring stave | [Cross-stave chords](/docs/language/cross-stave-chords) |
| `repeat N times` | `repeat N times via simile` | repeats the unit, or draws a simile for the repeats | [Similes](/docs/language/similes) |
| `tied with next` | `is tied with next`; `is tied before`, `is tied after`, `… measure N`; `up`, `down`, `above`, `below`; `with roundness N` | a tie | [Ties](/docs/language/ties) |
| `with <articulation>` | `staccato`, `spiccato`, `accent`, `tenuto`, `marcato`, `fermata`, `left hand pizzicato`, `snap pizzicato`, `natural harmonic`, `up bow`, `down bow`, and their short forms; `up`, `down`, `above stave`, `below stave` | an articulation | [Articulations](/docs/language/articulations) |
| `with bass clef before` | any clef; `with bass clef and key signature f major before` | a clef in the middle of a measure | [Mid-measure clefs](/docs/language/mid-measure-clefs) |
| `with breath mark before` | `with breath before`, `with breath comma before`, `with breath double slash before` | a breath mark | [Breath marks](/docs/language/breath-marks) |
| `with chord "…"` | `above measure`, `below measure`; `N up`, `N down` | a chord letter | [Chord letters](/docs/language/chord-letters) |
| `with dynamic "…"` | `up`, `down`, `above`, `below`, `above stave`, `below stave` | a dynamic | [Dynamics](/docs/language/dynamics) |
| `with glissando after` | `with gliss`, `with gliss.`; `before`; `after measure N` | a glissando that runs off the unit | [Glissando](/docs/language/glissando) |
| `with key signature g major before` | `with g major before` | a key signature in the middle of a measure | [Mid-measure key signatures](/docs/language/mid-measure-key-signatures) |
| `with lyrics "…"` | `with lyric`, `with new lyrics`, `with new lyric`; `followed by dash`, `followed by hyphen`; `where underscore starts`, `where underscore ends`; `N down` | a syllable of lyrics | [Lyrics](/docs/language/lyrics) |
| `with parentheses` | `with brackets`; for a chord `from note N to note M` | parentheses around a unit or a part of a chord | [Parentheses](/docs/language/parentheses) |
| `with pedal before` | `with sustain pedal`; `after`; `"Ped."`; `opens with bracket`; `under stave N`; `with variable peak`; `with release`, `with pedal release`, `with release bracket`, `at the end of measure`, `after measure` | pedal marks | [Pedal marks](/docs/language/pedal-marks) |
| `with stem up` | `with stem down`, `stem up`, `with up stem` | the stem direction | [Stems](/docs/language/stems) |
| `with text "…"` | `beside`, `up`, `down`, `above`, `below`, `above stave`, `below stave` | a text label | [Text labels](/docs/language/text-labels) |
| `with tremolo` | `with tremolo with next`; `with 1 stroke`, `with 2 strokes`, `with 3 strokes` | a tremolo | [Tremolo](/docs/language/tremolo) |
| `with trill` | `with turn`, `with mordent`; `inverted`, for a turn or a mordent; `with wave after`; `with turn after`; `with sharp key above`; `up`, `down`, `above stave`, `below stave` | an ornament | [Ornaments](/docs/language/ornaments) |

You can move almost every mark on a unit up or down a little by adding `N up` or `N down` at its end: `with staccato above stave 1 up`.

## 3. What Goes Inside a Span

A span is a command that goes from one unit to another: a slur, a tuplet, a glissando, a crescendo, an octave sign, a simile, a volta bracket. They all name their ends the same way, as explained in [Slurs](/docs/language/slurs).

| Part | Also written as | What it does |
|---|---|---|
| `from unit N to unit M` | `starts at unit N`, `finishes at unit M`, `begins at`, `ends at` | where the span starts and finishes |
| `starts before unit N` | `begins before`, `finishes after unit M`, `ends after` | a span that begins before the unit or ends after it |
| `unit N` | `note N`, `chord N`, `the unit N`, `the Nth unit`, `first unit`, `3rd note` | names a unit |
| `in measure N` | `in the Nth measure`, `on`, `at` | names a measure of the page line |
| `on stave N` | `on staff N`, `in the Nth stave` | names a stave |
| `in voice N` | `in the Nth voice` | names a voice |
| `in line N` | `in the Nth line` | names a page line |
| `goes through unit N` | `changes stave`, `goes through above unit N` | a point a slur passes through |
| `with s shape` | `with s-shape`, `with sshape` | an S-shaped slur |
| `with left point N up` | `with right point`; `attached to middle of stem`, `attached to note body`, `attached to note head` | moves the ends of a slur |
| `with roundness N` | | how round a slur or a tie is, from **1** to **10** |

## 4. Styles and MIDI Settings

All the styles, with their spellings and defaults, are in [The full style reference](/docs/language/style-reference). The three MIDI settings, and every instrument name for `default instrument`, are in [MIDI settings](/docs/language/midi-settings).

## 5. Keeping This List Honest

The parser has a name for every construct it knows: **578** of them at the moment. `docs/concepts.js` says which page introduces each one, and `npm run docs:check` fails when a new construct has no page. So you can always print the full list from the source. Run this from the root of the repository:

```js
// node --input-type=module -e "…this…"
import createParserScenarios from '#msq/language/parser/scenarios/createParserScenarios.js'
import { introducedBy } from './docs/concepts.js'

for (const name of Object.keys(createParserScenarios()).sort()) {
  console.log(introducedBy(name), '\t', name)
}
```

It prints every construct next to the page that introduces it. The names in angle brackets, like every clef, articulation, accidental and instrument, are in `src/language/parser/scenarios/static-objects/`, one file for each list.

Read next: [Low-Level API](/docs/api/overview)

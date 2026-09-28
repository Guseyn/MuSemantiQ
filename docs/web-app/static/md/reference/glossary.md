# Glossary

The words these docs use, as MSQ and the code use them. Some are ordinary notation terms, some mean something narrower in MSQ than they do in general, and some belong only to this project.

## 1. The language

**Command.** One instruction in MSQ text, like `measure`, `treble clef` or `time signature is 4:4`. The key words of a command are what the parser recognises; anything it cannot recognise becomes an error on its line. See [Your first notes](/docs/language/first-notes) and the [Command index](/docs/language/command-index).

**Unit**, or **sound unit**. A note, a chord or a rest: anything in a voice that takes a duration and a place in time. A unit can be a rest, which is why rests are units too. A whole-measure rest is not a unit, it is a property of the measure. See [Your first notes](/docs/language/first-notes) and [Rests](/docs/language/rests).

**Page.** One piece of MSQ text, engraved as one sheet. The language itself has no notion of a page break: a document of several pages is split before parsing, and the CLI and the tests split it at a line reading `====next page====`. See [Multiple pages](/docs/api/multiple-pages).

**Page line.** One row of measures across the page, what engravers call a system. `new line` ends one page line and starts the next. Measures are numbered within their page line, which is what span commands rely on. See [Page lines](/docs/language/page-lines).

**Measure.** A bar. In MSQ a measure holds the staves, not the other way round: a page line is made of measures, a measure of staves, and a stave of voices. If you never write `measure`, one is created for you. See [Measures](/docs/language/measures).

**Stave.** A set of five lines inside a measure. `staff` is accepted as the same word. Because staves belong to measures, a piano score has two staves in every measure. See [Staves](/docs/language/staves).

**Voice.** An independent line of music on one stave, with its own units and its own rhythm. See [Voices](/docs/language/voices).

**Span.** Anything that connects units rather than belonging to one: a slur, a crescendo, an octave sign, a glissando, a volta. Spans are written after the music and name the units, measures, staves and page lines they start and finish on. See [Slurs](/docs/language/slurs).

**Ref.** The link between a word of MSQ text, the SVG elements it drew and the moments it sounds. The parser gives each thing it reads a reference, the drawer writes those references into the SVG as `ref-ids` attributes, and the MIDI engine maps them to time stamps. That is how the editor jumps between text and score on Cmd-click (Ctrl-click on other systems), and how the score follows playback. See [msq-editor](/docs/components/msq-editor).

## 2. Notation terms

**Ghost note.** A note whose rhythm matters more than its pitch, like a muted or barely played note. In MSQ a unit marked `is ghost` is drawn with a cross-shaped notehead, whose shape depends on its duration, and it still takes its full duration. See [Ghost units](/docs/language/ghost-units).

**Melisma.** One syllable of lyrics sung over several notes. It is drawn as an underscore line after the syllable, and in MSQ you mark where that underscore starts and where it finishes. See [Lyrics](/docs/language/lyrics).

**Segno.** The sign that marks a place to jump back to, as in *dal segno*. In MSQ it is the `sign` command, and `segno` is accepted as the same word. See [Sign (segno)](/docs/language/sign).

**Simile.** A mark that says "repeat what came before" instead of writing it out again. MSQ has it for a single unit, for a range of units (one or several previous beats), for the previous measure and for the two previous measures. See [Similes](/docs/language/similes).

**Volta.** The bracket over the measures of a first or second ending, with its number in it. In MSQ a volta addresses measures, not units. See [Volta brackets](/docs/language/volta-brackets).

## 3. Project terms

**Page schema.** The parsed page as a plain JSON object: page lines, measures, staves, voices and units with everything the text said about them. The parser builds it, and the drawer and the MIDI engine work from it rather than from the text. `--page-schema` in the CLI writes it out. See [The page schema](/docs/api/page-schema).

**Music-js font.** A JavaScript table of glyph outlines and metrics for one music font, in `src/drawer/font/music-js/`, generated from a SMuFL font by `tools/smufl/`. A music font needs both its `.otf` file and its music-js table. At the moment only **Bravura** and **Leland** have tables. See [SMuFL to music-js font](/docs/tools/smufl-font-generator).

**Soundbank.** A General MIDI `.sf2` file, kept in `src/midi/sound-banks/`. It is not played directly: it is rendered into a sample set first. See [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder).

**Sample set**, or **Magenta sound font**. What a soundbank is rendered into: one folder per instrument, each with an `instrument.json` and one `.mp3` per pitch and velocity, in `src/midi/magenta-sound-font/`. The player in the components plays through it. When a component is given no sound font, the player uses the default Magenta one hosted by Google. See [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder).

**Scenario.** One named construct the parser recognises, like `note`, `clef` or `slur`. There are 578 of them. Each scenario says when it applies and what it does, and the scenarios that have just fired decide which ones can fire next. The parser reports which scenarios every piece of text used, which is how these docs check that no example uses something before its page introduces it. See [Using the language alone](/docs/api/language-only).

Read next: [FAQ and limitations](/docs/reference/faq)

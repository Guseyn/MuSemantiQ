# Glossary

<nav is="docs-contents"></nav>

The words these docs use, and what they mean in MSQ.

## 1. The Language

**Command.** One instruction in MSQ text, like `measure`, `treble clef` or `time signature is 4:4`. If the parser doesn't recognise a command, you get an error on its line. See the [Command index](/docs/language/command-index).

**Unit**, or **sound unit**. A note, a chord or a rest. A whole-measure rest is not a unit, it's a property of the measure. See [Your first notes](/docs/language/first-notes).

**Page.** One piece of MSQ text, drawn as one sheet. MSQ has no page break: several pages are split before parsing, at a line `====next page====`.

**Page line.** One row of measures on the page (in engraving it's called a system). `new line` starts the next one. See [Page lines](/docs/language/page-lines).

**Measure.** A bar. A page line has measures, a measure has staves, and a stave has voices. See [Measures](/docs/language/measures).

**Stave.** Five lines inside a measure. `staff` means the same. See [Staves](/docs/language/staves).

**Voice.** One line of music on a stave, with its own units and rhythm. See [Voices](/docs/language/voices).

**Span.** Something that connects units, like a slur, a crescendo or a volta. You write it after the music and say where it starts and finishes. See [Slurs](/docs/language/slurs).

**Ref.** The link between a word in MSQ text, what it drew in the SVG and when it sounds in the MIDI. That's how the editor jumps between the text and the score, and how the score follows playback. See [`<msq-editor>`](/docs/components/overview#5-msq-editor).

## 2. Notation Terms

**Ghost note.** A note where the rhythm matters more than the pitch. A unit marked `is ghost` is drawn with a cross-shaped notehead. See [Ghost units](/docs/language/ghost-units).

**Melisma.** One syllable sung over several notes, drawn as a line after the syllable. See [Lyrics](/docs/language/lyrics).

**Segno.** The sign you jump back to. In MSQ it's the `sign` command, and `segno` means the same. See [Sign (segno)](/docs/language/sign).

**Simile.** A mark that says "repeat what came before". See [Similes](/docs/language/similes).

**Volta.** The bracket over a first or second ending. See [Volta brackets](/docs/language/volta-brackets).

## 3. Project Terms

**Page schema.** The parsed page as plain JSON. The drawer and the MIDI engine work from it, not from the text. See [Low-Level API](/docs/api/overview).

**Music-js font.** A JavaScript table with the glyphs and metrics of one music font, in `src/drawer/font/music-js/`. Only **Bravura** and **Leland** have one. See [SMuFL to music-js font](/docs/tools/smufl-font-generator).

**Soundbank.** A General MIDI `.sf2` file, in `src/midi/sound-banks/`. It's not played directly, it's turned into a sample set first. See [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder).

**Sample set**, or **Magenta sound font**. What a soundbank is turned into: one folder per instrument with `.mp3` files, in `src/midi/magenta-sound-font/`. The player plays through it. Without one, it uses the default Magenta sound font from Google.

**Scenario.** One named thing the parser recognises, like `note`, `clef` or `slur`. There are 578 of them. The parser reports which scenarios a text used, and that's how these docs check that no example uses something before its page explains it.

Read next: [FAQ and limitations](/docs/reference/faq)

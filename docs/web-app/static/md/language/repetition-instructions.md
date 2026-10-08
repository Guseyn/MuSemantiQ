# Repetition Instructions

Repetition instructions are the words that tell a performer where to go next: "D.C. al Fine", "D.S. al Coda", "Fine" and others. Each measure can have one. You add it with `repetition note`:

```msq-editor opens-with=text
measure
treble clef
c d e f
repetition note "D.C. al Fine"
```

You can also write `repetition mark` or `repetition instruction`, and you can put `is` before the text: `repetition instruction is "Fine"`.

You can write any text in the quotes. Let's take a look at instructions together with a [sign](/docs/language/sign) and [codas](/docs/language/coda):

```msq-editor opens-with=text
measure
treble clef
sign
c d e f
measure
closes with double barline
coda at the end of the measure
c d e f
measure
c d e f
measure
closes with double barline
repetition note "D.S. al Coda"
c d e f
measure
c d e f
repetition note "CODA"
measure
closes with double bold barline
c d e
```

Like codas and signs, a repetition instruction is at the start of the measure by default, and you can say explicitly where to put it:

```msq-editor opens-with=text
measure
treble clef
repetition note "Start" at the start of the measure
c d e f
measure
repetition note "End" at the end of the measure
g a b c5
```

Like codas and signs, a repetition instruction moves up or down by itself. But you can correct it:

```msq-editor opens-with=text
measure
treble clef
repetition note "Repetition note" 2 up
c d e f
```

Here we moved the repetition instruction up by two intervals between stave lines.

## What the MIDI Player Does With Them

Any text is drawn, but only a few texts are also played. You have to write them exactly as in the table, with the same letters, dots and capitals:

| Text | What is played |
| --- | --- |
| **D.C. al Fine** | back to the beginning, and then until the measure with "Fine" |
| **D.S. al Fine** | back to the sign, and then until the measure with "Fine" |
| **D.C. al Coda** | back to the beginning, until the first coda, and then from the next coda |
| **D.S. al Coda** | back to the sign, until the first coda, and then from the next coda |
| **Fine** | where the music ends after a "D.C. al Fine" or a "D.S. al Fine" |
| **Coda** | counts as a coda mark, like the `coda` command |

Any other text, like "CODA" in the example above, is only drawn.

Here, after the last measure, the music goes back to the beginning and ends at "Fine":

```msq-editor opens-with=text
measure
treble clef
c d e f
measure
closes with double barline
g a b c5
repetition note "Fine" at the end of the measure
measure
c5 b a g
measure
closes with double bold barline
f e d c
repetition note "D.C. al Fine" at the end of the measure
```

Read next: [Fermata over barline](/docs/language/fermata-over-barline)

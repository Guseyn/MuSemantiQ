# Repetition instructions

Repetition instructions are the words that tell a performer where to go next: "D.C. al Fine", "D.S. al Coda", "Fine" and others. Each measure can have one, and you declare it with `repetition note`:

```msq-editor opens-with=text
measure
treble clef
c d e f
repetition note "D.C. al Fine"
```

You can also write `repetition mark` or `repetition instruction`, and put `is` before the text if it reads better: `repetition instruction is "Fine"`.

The text is free, the language does not constrain what you write in the quotes. Let's take a look at how instructions combine with a [sign](/docs/language/sign) and [codas](/docs/language/coda):

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

Like codas and signs, a repetition instruction is at the start of the measure by default, and you can explicitly declare its position:

```msq-editor opens-with=text
measure
treble clef
repetition note "Start" at the start of the measure
c d e f
measure
repetition note "End" at the end of the measure
g a b c5
```

As for codas and signs, the vertical position of repetition instructions is always adjusted. But you can always correct it:

```msq-editor opens-with=text
measure
treble clef
repetition note "Repetition note" 2 up
c d e f
```

Here we moved the repetition instruction up by two intervals between stave lines.

## What the MIDI player does with them

The text is free for drawing, but only a few exact texts are also followed when the music is played. You have to write them exactly as in the table, with the same letters, dots and capitals:

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

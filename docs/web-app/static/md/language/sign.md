# Sign (Segno)

Each measure can have a sign (segno). You add it with `sign` inside the measure:

```msq-editor opens-with=text
measure
treble clef
sign
c d e f
```

You can also write `segno` instead of `sign`:

```msq-editor opens-with=text
measure
segno
treble clef
a b d5 e5
measure
c5 b a g
```

As you can see, by default the segno is at the start of the measure. It's because it's usually used with "Dal segno", which tells the performer to go back to the last segno and play from there.

If you want the segno at the end of the measure, or want to say explicitly that it's at the start, just write it:

```msq-editor opens-with=text
measure
treble clef
sign at the start of the measure
a b d e
measure
sign at the end of the measure
a b d e
measure
c d e f
```

You can skip `the`: `at start of measure` and `at end of measure` work as well.

The sign moves up or down by itself, depending on the notes in the measure:

```msq-editor opens-with=text
measure
treble clef
sign
a b d e
measure
sign
c6 d6 e6
```

But you can correct it:

```msq-editor opens-with=text
measure
treble clef
sign 1 up
a b d e
measure
c d e f
```

Here we moved the sign up by one interval between stave lines.

The MIDI player also follows the segno: when it meets a "D.S." instruction, it jumps back to it. The instructions are written with `repetition note`, see [Repetition instructions](/docs/language/repetition-instructions).

Read next: [Coda](/docs/language/coda)

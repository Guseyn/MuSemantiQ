# Sign (segno)

Each measure can have a sign (segno). You declare it with `sign` inside the measure:

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

As you can see, by default the segno is at the start of the measure. It's because this mark is usually used with "Dal segno", an instruction that tells the performer to repeat the music from the nearest preceding segno.

If you need a segno at the end of the measure, or you want to explicitly declare that it's at the start, you just say so:

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

The word `the` can be omitted: `at start of measure` and `at end of measure` work as well.

The vertical position of the sign is always adjusted to the content of the measure:

```msq-editor opens-with=text
measure
treble clef
sign
a b d e
measure
sign
c6 d6 e6
```

But you can also correct it, if you want:

```msq-editor opens-with=text
measure
treble clef
sign 1 up
a b d e
measure
c d e f
```

Here we just moved the sign up by one interval between stave lines.

A segno is also followed by the MIDI player: when it meets a "D.S." instruction, it jumps back to the segno. The instructions themselves are written with `repetition note`, which is described in [Repetition instructions](/docs/language/repetition-instructions).

Read next: [Coda](/docs/language/coda)

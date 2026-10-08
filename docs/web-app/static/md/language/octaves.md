# Octaves

To set the octave of a note, put its number right after the note name, without a space:

```msq-editor opens-with=text
c3 c4 c5 c6
```

The octaves are numbered the usual way: `c4` is the middle C, `c5` is one octave higher, and each octave goes from `c` up to `b`. So `b4` and `c5` are next to each other:

```msq-editor opens-with=text
g4 a4 b4 c5 d5 e5
```

A note without a number gets the default octave of its clef. For the treble clef, which is also what you get with no clef, it's **4**. So `c` and `c4` are the same note:

```msq-editor opens-with=text
c c4 d d4 e e4
```

It's important to mention that an octave belongs only to its note. The next notes don't get it, so every note without a number is in the default octave:

```msq-editor opens-with=text
c3 c c5 c3 c5
```

As you can see, the second note is the middle C again, not `c3`. If you want many notes in another octave, you give the number to each of them:

```msq-editor opens-with=text
c5 d5 e5 f5 g5 a5 b5 c6
```

The octave is one digit from **1** to **9**. `c0` or `c10` is not a note. Keep in mind that notes far from the stave get a lot of ledger lines:

```msq-editor opens-with=text
c2 g2 c7 g7
```

For such notes you would usually use another clef ([Clefs](/docs/language/clefs)) or an octave sign ([Octave signs](/docs/language/octave-signs)).

Read next: [Durations](/docs/language/durations)

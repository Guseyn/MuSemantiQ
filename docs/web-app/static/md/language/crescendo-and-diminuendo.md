# Crescendo and diminuendo

A crescendo or a diminuendo (a hairpin) is a span, like a [slur](/docs/language/slurs): it's a command of its own, written after the music, and it names the units where it starts and finishes.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

crescendo below stave from first unit to fourth unit
```

The key words can be written in different ways:

| Hairpin | Key words |
| --- | --- |
| crescendo | `crescendo`, `cresc`, `cresc.`, `cres`, `cres.` |
| diminuendo | `diminuendo`, `dim`, `dim.` |

An endpoint can also carry a dynamic, so the hairpin starts or finishes with letters:

```msq-editor opens-with=text
measure
treble clef
a c d e f
measure
a c d e f

crescendo in first measure
starts with "p" at 1st unit
finishes with "f" at 5th unit

diminuendo in second measure
starts with "f" at 1st unit
finishes with "p" at 5th unit
```

You can omit the dynamic letters if you don't need them, on one side or on both. The letters are written in quotes, like in `with dynamic` for a single unit, which you can read about in [Dynamics](/docs/language/dynamics).

By default, a hairpin is drawn above the stave. But you can easily change that, either with `up` and `down`, or with `above stave` and `below stave`:

```msq-editor opens-with=text
measure
treble clef
a c d e f
measure
a c d e f
measure
a c d e f
measure
a c d e f

crescendo up in first measure
starts with "p" at 1st unit
finishes with "f" at 5th unit

diminuendo down in second measure
starts with "f" at 1st unit
finishes with "p" at 5th unit

cresc above stave in third measure
starts with "p" at 1st unit
finishes with "f" at 5th unit

dim below stave in fourth measure
starts with "f" at 1st unit
finishes with "p" at 5th unit
```

You can also write `over stave` and `under stave`, and `staff` instead of `stave`.

The vertical position of a hairpin is always adjusted, so it does not intersect other elements. But you still can correct it:

```msq-editor opens-with=text
measure
treble clef
a c d e f
measure
a c d e f

crescendo 1 up above stave in first measure
starts with "p" at 1st unit
finishes with "f" at 5th unit

diminuendo 1 down below stave in second measure
starts with "f" at 1st unit
finishes with "p" at 5th unit
```

Here we moved the crescendo up by one interval between stave lines, and the diminuendo down by one interval.

A hairpin can run from one measure into another:

```msq-editor opens-with=text
measure
treble clef
c d e f
measure
g a b c5

diminuendo from third unit in first measure to second unit in second measure
```

The unit coordinates for crescendo and diminuendo work almost in the same way as for [slurs](/docs/language/slurs), you have to remember the following rules:

1. If a `line` is not specified after the `crescendo` or `diminuendo` key word, the hairpin applies to the last line declared before it.
2. If you don't specify `measure`, `stave` and `voice`, it assumes that you mean the first measure, the first stave and the first voice.
3. Along with a `unit` coordinate you can specify only `measure` (like `first note in first measure`). You cannot set `stave` and `voice` along with a unit, only right after the key word, for the whole hairpin, because a hairpin is not a cross-stave or cross-voice element. And you cannot set `line` along with a unit, because each hairpin is declared for the line where it is located.
4. If you specified `measure` for the first unit, and it does not change for the last one, you don't need to repeat it.

Here is a hairpin on the second stave, with the stave named for the whole hairpin:

```msq-editor opens-with=text
measure
stave with treble clef
c5 d5 e5 f5
stave with bass clef
c3 d3 e3 f3

crescendo in second stave below stave
starts with "mp" at first unit
finishes with "ff" at fourth unit
```

Read next: [Octave signs](/docs/language/octave-signs)

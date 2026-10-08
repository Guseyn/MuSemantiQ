# Crescendo and Diminuendo

A crescendo or a diminuendo (a hairpin) works like a [slur](/docs/language/slurs): it's a separate command, you write it after the music, and it names the units where it starts and finishes.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

crescendo below stave from first unit to fourth unit
```

You can write the key words in different ways:

| Hairpin | Key words |
| --- | --- |
| crescendo | `crescendo`, `cresc`, `cresc.`, `cres`, `cres.` |
| diminuendo | `diminuendo`, `dim`, `dim.` |

A hairpin can also start or finish with a dynamic:

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

You can skip the dynamic on one side or on both. The letters are in quotes, the same as `with dynamic` in [Dynamics](/docs/language/dynamics).

By default, a hairpin is drawn above the stave. But you can easily change that with `up` and `down`, or with `above stave` and `below stave`:

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

A hairpin is moved up or down automatically, so it doesn't cross other elements. But you can still move it yourself:

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

Here the crescendo goes up by one interval between stave lines, and the diminuendo goes down by one interval.

A hairpin can run from one measure into another:

```msq-editor opens-with=text
measure
treble clef
c d e f
measure
g a b c5

diminuendo from third unit in first measure to second unit in second measure
```

The coordinates of units work almost the same as for [slurs](/docs/language/slurs). You have to remember the following rules:

1. If you don't write `line` after `crescendo` or `diminuendo`, the hairpin applies to the last line above it.
2. If you don't write `measure`, `stave` and `voice`, it means the first measure, the first stave and the first voice.
3. Next to a `unit` you can write only `measure` (like `first note in first measure`).
   - `stave` and `voice` go right after the key word, for the whole hairpin, because a hairpin can't go from one stave or voice to another.
   - `line` can't go next to a unit, because each hairpin belongs to the line where it's written.
4. If the last unit is in the same `measure` as the first one, you don't need to repeat it.

Here is a hairpin on the second stave:

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

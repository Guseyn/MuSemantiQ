# Octave Signs

An octave sign says that the music under it sounds one or two octaves higher or lower than written. You can put it on one unit, or on a group of units with a bracket.

## 1. Octave Signs for Single Units

Let's see how you can add an octave sign to a single unit:

```msq-editor opens-with=text
measure
treble clef
a is octave up
a is octave down
a is two octaves up
a is two octaves down
```

Instead of `up` and `down`, you can write `higher` and `lower`, and `2` instead of `two`:

```msq-editor opens-with=text
measure
treble clef
a is octave higher
a is octave lower
a is 2 octaves higher
a is two octaves lower
```

An octave sign is placed up or down automatically, but you can still move it:

```msq-editor opens-with=text
measure
treble clef
a is octave up 1 up
a is octave down 1 down
a is two octaves up 1 up
a is two octaves down 1 down
```

Here `1 up` moves the octave sign up by one interval between stave lines, and `1 down` moves it down by one interval.

## 2. Octave Signs With Brackets

For several units, you write the octave sign after the music, like a [slur](/docs/language/slurs). The bracket goes from the first unit to the last one:

```msq-editor opens-with=text
measure
treble clef
1/4 c5 d5 e5 f5

octave up from first unit to fourth unit
```

A bracket can run through several measures:

```msq-editor opens-with=text
measure
treble clef
c c c
measure
c c c
measure

two octaves higher
from first unit in first measure
to third unit in second measure

new line
c c c
measure
c c c
measure

octave down
from first unit in first measure
to third unit in second measure
```

You can write the start and the finish as `from` and `to`, or as `starts at` and `finishes at` (`begins` and `ends` work too).

You can move an octave sign with a bracket up or down too:

```msq-editor opens-with=text
measure
treble clef
c c c
measure
c c c
measure

two octaves higher 1 up
from first unit in first measure
to third unit in second measure

new line
c c c
measure
c c c
measure

octave down 1 down
from first unit in first measure
to third unit in second measure
```

Like slurs, you can write all octave signs after all the lines, and name the line for each of them:

```msq-editor opens-with=text
measure
treble clef
c c c
measure
c c c
measure

new line
c c c
measure
c c c
measure

two octaves higher in first line
from first unit in first measure
to third unit in second measure

octave down in second line
from first unit in first measure
to third unit in second measure
```

The coordinates of units work almost the same as for [slurs](/docs/language/slurs). You have to remember the following rules:

1. If you don't write `line` after the octave sign, it applies to the last line above it.
2. If you don't write `measure`, `stave` and `voice`, it means the first measure, the first stave and the first voice.
3. Next to a `unit` you can write only `measure` (like `first note in first measure`).
   - `stave` and `voice` go right after the octave sign, for the whole bracket, because an octave sign can't go from one stave or voice to another.
   - `line` can't go next to a unit, because each octave sign belongs to the line where it's written.
4. If the last unit is in the same `measure` as the first one, you don't need to repeat it.

Here is an octave sign on the lower stave of a grand staff:

```msq-editor opens-with=text
measure
stave with treble clef
c5 d5 e5 f5
stave with bass clef
c2 d2 e2 f2

octave down in second stave from first unit to fourth unit
```

It's important to mention that an octave sign also changes what you hear: the units under it are played one or two octaves higher or lower. More about playback you can read in [MIDI settings](/docs/language/midi-settings).

Read next: [Glissando](/docs/language/glissando)

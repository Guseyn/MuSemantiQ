# Similes

A simile is a mark that says "repeat what came before", so you don't write the same music again. A simile can repeat:

1. a unit: you write it after the unit;
2. a range of units: a separate command after the music;
3. the previous measure: a property of a measure;
4. the two previous measures: a property of a measure.

## 1. Simile as a Unit

A simile is a sound unit, like notes, rests and chords. Let's start with a simple example, where we repeat a note several times:

```msq-editor opens-with=text
measure
treble clef
a repeat three times
```

As you can see, `repeat` goes right after the unit, and `N times` says how many times. Without `N times`, the unit is repeated once. You can also write `repeat via simile`:

```msq-editor opens-with=text
measure
treble clef
a repeat
c5 repeat via simile 2 times
```

A simile has the same duration as the unit it repeats:

```msq-editor opens-with=text
1/256 a repeat 2 times
1/16 a repeat 2 times
1/8 a repeat 2 times
1/4 a repeat 2 times
```

It works for chords as well:

```msq-editor opens-with=text
measure
treble clef
1/4 chord repeat 3 times
c e g
```

By default, simile marks are in the middle of the stave. But you can easily change that:

```msq-editor opens-with=text
measure
treble clef
voice
a5 repeat three times 2 up
voice
c repeat three times 2 down
```

All you need is to write a number and a direction. `2 down` moves the mark down by two intervals between stave lines.

## 2. Simile for a Range of Units

A simile can also repeat a range of units. Here we point to units by their positions, like for [slurs](/docs/language/slurs):

```msq-editor opens-with=text
measure
treble clef
c d e f
simile from first unit to 4th unit 3 times
```

The simile is drawn in the measure, but the `simile` command doesn't have to be written there. You can write all similes after all measures:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
e f g
new line
e f g
measure
c d e

simile in measure 1 from unit 1 to unit 3
```

As you may notice, we didn't write a page line for the simile above. In this case, it takes the last line before `simile`. That's why `measure 1` is the first measure of the second line.

Let's put the simile before the second line:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
e f g

simile in measure 1 from unit 1 to unit 3

new line
e f g
measure
c d e
```

You can also just name the line:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
e f g

new line
e f g
measure
c d e

simile on line 1, in measure 1 from unit 1 to unit 3
```

If you don't write `measure`, `stave` or `voice`, the simile takes the first measure, the first stave and the first voice of the line. Here we write all of them:

```msq-editor opens-with=text
measure
stave with treble clef
voice
g5 a5 b5
voice
c d e
stave with treble clef
voice
g5 a5 b5
voice
c d e
measure
stave
voice
g5 a5 b5
g5 a5 b5
voice
c d e
c d e
stave
voice
g5 a5 b5
voice
c d e

simile in first line, second measure, first stave, first voice
from first unit to third unit
1.5 up

simile in first line, second measure, first stave, second voice
from first unit to third unit
1.5 down
```

As you can see, the line, the measure, the stave and the voice go right after `simile`, and the units go after `from` and `to` (or `starts at` and `finishes at`).

It's important to mention that similes are sound units. The `simile` command is not a part of the measure, but the simile marks it adds are units of the measure. Let's take a look at the following example:

```msq-editor opens-with=text
measure
treble clef
c d e
e f g

simile from unit 1 to unit 3
simile from unit 4 to unit 6
```

As you can see, you need to be careful with unit positions: the 4th unit above is actually the first simile. So the range we repeated includes a simile. This is not what we want, so let's fix it:

```msq-editor opens-with=text
measure
treble clef
c d e
e f g

simile from unit 1 to unit 3
simile from unit 5 to unit 7
```

By default, a simile for a range of units is drawn as if it repeats the previous beat. MSQ doesn't know what your beat is, so you say yourself whether you repeat one beat or several beats:

```msq-editor opens-with=text
measure
treble clef
1/8 d e f
measure
1/8 d e f
g e f

repeat of previous beat in measure 1 from unit 1 to unit 3
repeat of previous beats in measure 2 from unit 1 to unit 6
```

As you can see, the beat above is 3/8:

- in the first measure, we repeat one previous beat, so the simile mark has just two strokes;
- in the second measure, we repeat two previous beats, so the mark has two strokes and a dot on each side.

You can write `simile` instead of `repeat`, and `prev` or `prev.` instead of `previous`.

**Important note:** if a range simile that starts with `repeat` comes right after a line of units, put an empty line before it. Otherwise `repeat` is read as a simile of the last unit. `simile` doesn't have this problem.

The same example with beams, to show the beats:

```msq-editor opens-with=text
measure
treble clef
1/8 d beamed, e, f
measure
1/8 d beamed, e, f not beamed
g beamed, e, f

repeat of previous beat in measure 1 from unit 1 to unit 3
repeat of previous beats in measure 2 from unit 1 to unit 6
```

Similes are lined up by their durations, like other units:

```msq-editor opens-with=text
measure
stave with treble clef
d e f
stave with treble clef
d e f
g f e
d e f

repeat of prev. beat in first stave from first unit to third unit two times
```

Like in the previous section, you can move simile marks up or down:

```msq-editor opens-with=text
measure
treble clef
1/8 c beamed d e

repeat from unit 1 to unit 3 three times 2 down
```

## 3. Simile of the Previous Measure

Like a [measure rest](/docs/language/measures), a simile of the previous measure is a property of a measure:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
simile of previous measure
```

It can also be written on one line with `measure`, and you can say how many times:

```msq-editor opens-with=text
measure
treble clef
c d e

measure with simile of previous measure 3 times
measure
```

To repeat the previous measure once, you don't need to write the number:

```msq-editor opens-with=text
measure
treble clef
c d e

measure with simile of previous measure
measure
```

A simile of the previous measure applies to all the staves:

```msq-editor opens-with=text
measure
stave with treble clef
c d e
stave with bass clef
c3 d3 e3

measure with simile of previous measure 3 times
measure
```

As a separate command, the number works the same way:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
simile of previous measure 2 times
measure
```

You can write `repeat` instead of `simile`, `for` instead of `of`, and `prev` or `prev.` instead of `previous`.

## 4. Simile of the Two Previous Measures

In the same way, you can repeat the two previous measures:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
d e f

measure with simile of two previous measures 3 times
measure
```

To repeat them once, you don't need to write the number:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
d e f

measure with simile of two previous measures
measure
```

It also applies to all the staves:

```msq-editor opens-with=text
measure
stave with treble clef
c d e
stave with bass clef
c3 d3 e3
measure
stave
d e f
stave
d3 e3 f3

measure with simile of two previous measures 3 times
measure
```

You can also write it as a separate command:

```msq-editor opens-with=text
measure
treble clef
c d e
measure
d e f
measure
simile of two previous measures 2 times
measure
```

`2` can be written instead of `two`.

Similes are not only drawn. The MIDI player plays the repeated units, measures and ranges as if they were written out in full.

Read next: [Unit spacing](/docs/language/unit-spacing)

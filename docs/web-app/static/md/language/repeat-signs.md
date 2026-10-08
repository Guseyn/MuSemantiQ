# Repeat Signs

A repeat sign belongs to a measure, like a barline. You can add it at the start of a measure, at the end, or both:

```msq-editor opens-with=text
measure
treble clef
repeat sign at the start
c d e f

measure
repeat sign at the end
g a b c5
```

It's important to mention that a repeat sign draws only the dots. The barline next to them is the usual barline of the measure, so you choose it yourself. Usually it's a double bold barline:

```msq-editor opens-with=text
measure
starts with double bold barline
with repeat sign at the start
treble clef
c d e f

measure
ends with double bold barline
with repeat sign at the end
g a b c5
```

As you remember from [Barlines](/docs/language/barlines), the lines right after `measure` must come before anything else in the measure. The same goes for `with repeat sign at the start` and `with repeat sign at the end`.

Instead of `repeat sign`, you can write `colon`:

```msq-editor opens-with=text
measure
starts with double bold barline
with colon at the start
treble clef
c d e f

measure
ends with double bold barline
with colon at the end
g a b c5
```

You can also write a repeat sign as a separate command. It belongs to the current measure and can go anywhere in it:

```msq-editor opens-with=text
measure
treble clef
c d e f
opening double bold barline
closing double bold barline
repeat sign at the start
repeat sign at the end
```

**Important note:** if a separate `repeat sign` comes right after a line of units, put an empty line before it. Otherwise `repeat` is read as "repeat the last unit", which is a [simile](/docs/language/similes). `colon` doesn't have this problem:

```msq-editor opens-with=text
measure
treble clef
c d e f

repeat sign at the start

measure
g a b c5
colon at the end
```

If you write just `repeat sign` (or `with repeat sign`), without a side, the dots are drawn on both sides of the measure:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
opening double bold barline
closing double bold barline
repeat sign
g a b c5

measure
c5 b a g
```

`at start` and `at end`, without `the`, work as well.

Repeat signs are also played. When the MIDI player reaches a repeat sign at the end of a measure, it goes back to the last repeat sign at the start of a measure, or to the beginning if there is none, and plays that part once more. More about playback you can read in [MIDI settings](/docs/language/midi-settings).

Read next: [Volta brackets](/docs/language/volta-brackets)

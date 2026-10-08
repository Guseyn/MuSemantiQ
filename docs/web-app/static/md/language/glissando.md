# Glissando

A glissando is a slide from one sound to another. You can write it in two ways: as an attribute of a unit, or as a separate command that connects two units.

## 1. Glissando as a Unit Attribute

If a glissando goes out of a unit and finishes after the measure, you just need to write `with glissando`:

```msq-editor opens-with=text
measure
treble clef
a with glissando
```

You can set a direction, and also say that the glissando finishes after the measure:

```msq-editor opens-with=text
measure
treble clef
a with glissando after up
```

In the same way, you can say that a glissando comes into a unit from before the measure:

```msq-editor opens-with=text
measure
treble clef
a with glissando before up
```

You can also write the number of the measure that a glissando finishes after or starts before. It's important to mention that those measures can't be empty:

```msq-editor opens-with=text
measure
stave
1/4 a with glissando after measure 2
stave
1/16 a beamed b c d a b c d not beamed
measure
stave
stave
1/16 a beamed b c d a b c d

new line
stave
stave
1/16 a beamed b c d a b c d not beamed
measure
stave
1/4 a with glissando before measure 1
stave
1/16 a beamed b c d a b c d
```

As you can see, this is how a glissando goes from one page line to the next: with `before` and `after` and a measure number. The measures are counted within the page line of the unit.

## 2. Glissando as a Separate Command

To connect two units, you write `glissando` as a separate command after the music, like a [slur](/docs/language/slurs):

```msq-editor opens-with=text
measure
treble clef
1/4 c5
1/4 c

glissando from first unit to second unit
```

Let's take a look at glissandos between notes and chords in different measures:

```msq-editor opens-with=text
measure
treble clef
a a5 1/16 a beamed b c d a b c d
measure
1/4 chord
c e g
chord
c5 e5 g5

1/16 a beamed b c d a b c d

glissando in first measure from first unit to second unit
glissando in second measure from unit 1 to unit 2
```

Like slurs, glissandos can go from one measure to another:

```msq-editor opens-with=text
measure
treble clef
c
measure
c5

glissando starts at first note in first measure
and finishes at first note in second measure
```

A glissando can also connect units on different staves:

```msq-editor opens-with=text
measure
stave with treble clef
a
stave with bass clef
rest
measure
stave
rest
stave
a2

glissando
from first unit in first measure on first stave
to first unit in second measure on second stave
```

A glissando can also start before a unit or finish after a unit:

```msq-editor opens-with=text
measure
stave with treble clef
a
stave with bass clef
a2
measure

glissando up starts before first unit on first stave
glissando down finishes after first unit on second stave
```

By default, a glissando is drawn as a wave. But you can say that it's a `wave` or a `line`:

```msq-editor opens-with=text
measure
stave with treble clef
a
stave with bass clef
rest
measure
stave
rest
stave
a2

measure
stave
a
stave
rest
measure
stave
rest
stave
a2

glissando as line
from first unit in first measure on first stave
to first unit in second measure on second stave

glissando as wave
from first unit in third measure on first stave
to first unit in fourth measure on second stave
```

You can also write `as waves` and `as lines`.

The coordinates of units work the same as for [slurs](/docs/language/slurs). You have to remember the following rules:

1. If you don't write `line` after `glissando`, it applies to the last line above it.
2. If you don't write `measure`, `stave` and `voice`, it means the first measure, the first stave and the first voice.
3. Next to a `unit` you can write only `measure` and `stave` (like `first note in first measure, in second stave`).
   - `voice` goes right after `glissando`, for the whole glissando, because a glissando can't go from one voice to another.
   - `line` can't go next to a unit, because each glissando, or each part of it, belongs to the line where it's written.
4. If `measure` and `stave` of the second unit are the same as of the first one, you don't need to repeat them.

You can also write `glissando` as `gliss` or `gliss.`, both as a command and in `with glissando`:

```msq-editor opens-with=text
measure
treble clef
1/4 c with gliss after
measure
1/4 e
1/4 c5

gliss. in second measure from first unit to second unit
```

You also hear both kinds of glissando: the MIDI player plays a glissando as a quick run of notes. For a glissando on one unit, it goes in the direction you set.

Read next: [Tremolo](/docs/language/tremolo)

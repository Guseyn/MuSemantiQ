# Centralized units

By default, all units are aligned to the left side of the measure. If you want a unit to be aligned in the center, you just need to mark it.

Let's take a look at the difference between a simple unit and a centralized one:

```msq-editor opens-with=text
measure
treble clef
1 a

measure
1 a is centralized

measure
1/4 c d e f
```

The case it exists for is a unit that fills a whole measure by itself, most often a whole rest:

```msq-editor opens-with=text
measure
treble clef
1 rest is centralized

measure
1/4 c d e f
```

The command has four spellings, and they all mean the same thing:

| You write         |
|-------------------|
| `is centralized`  |
| `centralized`     |
| `is in the center`|
| `in the center`   |

```msq-editor opens-with=text
measure
treble clef
1 a centralized

measure
1 a in the center

measure
1 chord is in the center
c e g

```

As you can see from the last measure, a chord is centralized on its `chord` line.

## 1. Only the only unit in its voice

There is an important detail that you need to keep in mind: you can centralize a unit only if it's the only unit in its voice.

Let's take a look at the following example:

```msq-editor opens-with=text
measure
stave with treble clef
stave with bass clef

measure
stave
voice
1 a5 is centralized
voice
1/4 a b c5 a
stave
1 rest is centralized
```

As you see, if we mark the only unit in a voice as centralized, it's positioned in the center of the measure, and the rest of the measure moves with it, so that the units stay in step. Otherwise, it does not happen:

```msq-editor opens-with=text
measure
treble clef
voice
1 a5 is centralized
voice
1/4 c d e f

measure
voice
1/2 a5 is centralized
1/2 a5 is centralized
voice
1/4 c d e f

measure
voice
1 a is centralized
voice
1 c is centralized
```

In the second measure the upper voice has two units, so neither of them is centralized.

Nothing is centralized in a measure where voices collide, or in a measure that contains [cross-stave chords](/docs/language/cross-stave-chords), because it would decrease the readability of the music score.

## 2. Centralized units and unit spacing

A unit is centralized after the measure has got its width. So when a measure is wider than its units need, for example because it's the last one on its page line and is stretched to the end of it, a centralized unit is still placed in its center:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

measure
1 rest is centralized
```

The same is true when you compress or stretch units: the measure changes its width, and a centralized unit follows its center. More about that you can read in [Unit spacing](/docs/language/unit-spacing).

Read next: [Adjusting units](/docs/language/adjusting-units)

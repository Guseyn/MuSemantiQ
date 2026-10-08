# Centralized Units

By default, all units are aligned to the left side of the measure. If you want a unit in the center, you just need to mark it.

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

It's for a unit that fills the whole measure by itself, most often a whole rest:

```msq-editor opens-with=text
measure
treble clef
1 rest is centralized

measure
1/4 c d e f
```

You can write it in four ways, and they all mean the same:

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

## 1. Only the Only Unit in Its Voice

It's important to remember that you can centralize a unit only if it's the only unit in its voice.

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

As you can see, if the only unit in a voice is centralized, it's placed in the center of the measure, and the rest of the measure moves with it, so the units stay in sync. Otherwise, nothing happens:

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

Nothing is centralized in a measure where voices collide, or in a measure with [cross-stave chords](/docs/language/cross-stave-chords), because it would make the score harder to read.

## 2. Centralized Units and Unit Spacing

A unit is centralized after the measure gets its width. So if a measure is wider than its units need, a centralized unit is still placed in its center. For example, when it's the last measure on its page line and it's stretched to the end of the line:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

measure
1 rest is centralized
```

The same is true when you compress or stretch units. The measure changes its width, and a centralized unit stays in its center. More about that you can read in [Unit spacing](/docs/language/unit-spacing).

Read next: [Adjusting units](/docs/language/adjusting-units)

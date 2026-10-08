# Tuplets

A tuplet puts some number of units into the time of a different number of units, like three eighths in the time of two. In MSQ, a tuplet is written after its notes, not before, because it points at those notes by their positions.

Let's start with a basic example:

```msq-editor opens-with=text
1/8 a beamed, b, e not beamed

tuplet 3 from first unit to third unit
```

A tuplet starts on a new line. It's good to put an empty line before it, so it's easy to see where the notes end.

## 1. Naming the Range

After `tuplet` and its value, you say where the tuplet starts and where it finishes. The units are counted from the start of the measure. Chords and rests are counted too, like notes:

```msq-editor opens-with=text
1/8 c d e f g a

tuplet 3 from first unit to third unit
tuplet 3 from fourth unit to 6th unit
```

As you can see, you can have as many tuplets as you need, one per line of text.

Numbers from 1 to 10 can be words. For example, `1` is `first`, or `one`, or `1st`. Other numbers are digits, or digits with a suffix like `11th` or `12th`. The number can go before or after the key word, so `first unit` and `unit 1` are the same:

```msq-editor opens-with=text
1/8 c d e
f g a

tuplet 3 from unit 1 to unit 3
tuplet 3 from the fourth unit to the sixth unit
```

Instead of `unit` you can write `note` or `chord`. To say where a tuplet starts and finishes, you can write:

- `from ... to ...`
- `starts at ... finishes at ...`
- `begins from ... ends with ...`

You can also put this on the next line:

```msq-editor opens-with=text
1/8 c d e
chord
f a

g rest

tuplet 3 starts at the first note, finishes at the third note
tuplet 3
from unit 4 to unit 6
```

It's important to mention that a tuplet has to be written after its units. If you write it before them, there are no units yet, and MSQ tells you that the units are not found.

## 2. Tuplet Values

You can write all sorts of tuplets:

```msq-editor opens-with=text
1/16 a beamed, b, a, b, a not beamed
1/8 a beamed, b, a, b, a, a not beamed

tuplet 5 from unit 1 to unit 5
tuplet 6 from unit 6 to unit 11
```

But keep in mind that the value `3` actually means `3:2`: three units in the time of two. If you need another ratio, you can write it in full:

```msq-editor opens-with=text
a a a a a a

tuplet 6:3 from first unit to sixth unit
```

Both numbers of the ratio are whole numbers, so `3/2` or `2.5` is not a tuplet value. The default ratios for values with one number:

| Tuplet value | Default ratio |
| --- | --- |
| `2` | 2:3 |
| `3` | 3:2 |
| `5` | 5:4 |
| `6` | 6:4 |
| `7` | 7:4 |
| `9` | 9:8 |
| `12` | 12:8 |
| `n`, if it's not one of the values above | n:(n - 1) |

The playback uses the ratio. On the page you see the value exactly as you wrote it.

## 3. Brackets

By default, a tuplet over one beamed group has no bracket. But you can add one with `with brackets`:

```msq-editor opens-with=text
1/8 a beamed, b, e not beamed

tuplet 3 with brackets from first unit to third unit
```

If the units of a tuplet are not beamed together, or they are quarters or longer, the bracket is always drawn, because without it you couldn't see which units are in the tuplet:

```msq-editor opens-with=text
1/4 a b c5

tuplet 3 from first unit to third unit
```

## 4. Placement

You can set the direction of a tuplet with `up` or `down`, `above` or `below`, `over` or `under`:

```msq-editor opens-with=text
1/8 b3 beamed, c, b3 not beamed
b3 beamed, c, b3 not beamed
a beamed, b, a not beamed
a beamed, b, a not beamed

tuplet 3 up with brackets from first unit to third unit
tuplet 3 above with brackets from fourth unit to sixth unit
tuplet 3 down with brackets from unit 7 to unit 9
tuplet 3 below with brackets from unit 10 to unit 12
```

There are also `above stave` and `below stave`. The difference is that `below stave` always draws the tuplet below the stave, and `below` doesn't:

```msq-editor opens-with=text
1/8 a beamed, b, a not beamed
b3 beamed, c, b3 not beamed

tuplet 3 above stave with brackets from first unit to third unit
tuplet 3 below stave with brackets from fourth unit to sixth unit
```

Tuplets are always moved so they don't cross other elements, but you can still move them yourself. Just say how much up or down, in intervals between stave lines:

```msq-editor opens-with=text
1/8 a beamed, b, a not beamed

tuplet 3 below stave with brackets 0.5 down
from first unit to third unit
```

Here the tuplet moves down by half of an interval between stave lines.

## 5. Starting Before and Finishing After

A tuplet can also start before a unit or finish after a unit:

```msq-editor opens-with=text
1/8 a beamed, b, a not beamed
b3 beamed, c, b3 not beamed

tuplet 3 up with brackets
starts before first unit and finishes at third unit

tuplet 3 above stave with brackets
starts at fourth unit and finishes after sixth unit
```

`before first unit` and `after third unit` without `starts` and `finishes` work the same.

## 6. Nested Tuplets

Tuplets can be inside other tuplets, and the playback takes all of them into account:

```msq-editor opens-with=text
1/8 a beamed a a not beamed
1/16 a beamed a a a a not beamed
1/8 a
1/4 a

tuplet 5:4 with brackets from unit 1 to unit 9
tuplet 3 with brackets from unit 1 to unit 3
tuplet 5 with brackets from unit 4 to unit 8
```

A tuplet can also go from one measure to another, and it can be set to a specific measure, stave and voice. This works exactly the same as for slurs, which you can read about in [Slurs](/docs/language/slurs).

Read next: [Measures](/docs/language/measures)

# Clefs

A clef says which note each line of the stave is. You write it on its own line: the name of the clef and then the word `clef`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
bass clef
c3 d3 e3 f3
```

## 1. A Clef Applies From There On

A clef is drawn in the measure where you declare it, and it works for the next measures until another clef. You don't need to repeat it in every measure:

```msq-editor opens-with=text
measure
bass clef
1/4 c3 d3 e3 f3

measure
1/4 g3 a3 b3 c4

measure
treble clef
1/4 c d e f
```

As you can see, the second measure has no clef, but its notes are still in the bass clef.

It doesn't matter on which line of the measure you write the clef. It's always drawn at the start of the measure, and it works for all units in the measure. To change the clef in the middle of a measure, see [Mid-measure clefs](/docs/language/mid-measure-clefs).

```msq-editor opens-with=text
measure
1/4 c3 d3
bass clef
1/4 e3 f3
```

## 2. No Clef at All

If you don't declare a clef, no clef is drawn, but the notes are placed as if it was a treble clef. That's why the examples on the previous pages looked right without one:

```msq-editor opens-with=text
measure
1/4 c d e f

measure
treble clef
1/4 c d e f
```

## 3. All Clefs

MSQ supports eleven clefs. Some of them have other names, aliases, which you can use instead:

| Clef | Aliases |
| --- | --- |
| `treble clef` | `g clef` |
| `bass clef` | `f clef` |
| `alto clef` | `c clef` |
| `tenor clef` | – |
| `soprano clef` | – |
| `mezzo soprano clef` | `mezzo clef` |
| `baritone clef` | – |
| `octave up clef` | `octave clef`, `octave eight up clef`, `octave 8 up clef` |
| `octave down clef` | `octave eight down clef`, `octave 8 down clef` |
| `two octaves up clef` | `2 octaves up clef`, `octave fifteen up clef`, `octave 15 up clef` |
| `two octaves down clef` | `2 octaves down clef`, `octave fifteen down clef`, `octave 15 down clef` |

Here are the clefs that name a line of the stave. Each one has the same notes written, so they sound different in each clef:

```msq-editor opens-with=text
measure
treble clef
c4 e4 g4

measure
bass clef
c3 e3 g3

measure
alto clef
c4 e4 g4

measure
tenor clef
c4 e4 g4

measure
soprano clef
c4 e4 g4

measure
mezzo soprano clef
c4 e4 g4

measure
baritone clef
c4 e4 g4
```

The aliases draw the same clefs:

```msq-editor opens-with=text
measure
g clef
c d e

measure
f clef
c3 d3 e3

measure
c clef
c4 d4 e4

measure
mezzo clef
c4 d4 e4
```

## 4. Octave Clefs

The octave clefs are treble clefs with a small **8** or **15** above or below them. They move everything on the stave one or two octaves up or down:

```msq-editor opens-with=text
measure
octave up clef
g5 a5 b5

measure
octave down clef
g3 a3 b3

measure
two octaves up clef
g6 a6 b6

measure
two octaves down clef
g2 a2 b2
```

The same with the other names from the table:

```msq-editor opens-with=text
measure
octave 8 up clef
g5 a5 b5

measure
octave eight down clef
g3 a3 b3

measure
octave 15 up clef
g6 a6 b6

measure
2 octaves down clef
g2 a2 b2
```

## 5. Notes Without an Octave Number

It's important to mention that a note without an octave number gets a default octave. The default octave depends on the clef, so that the note is somewhere around the stave:

| Clef | Default octave |
| --- | --- |
| treble | **4** |
| bass | **2** |
| alto, tenor, mezzo soprano, baritone | **3** |
| soprano | **4** |
| octave up | **5** |
| octave down | **3** |
| two octaves up | **6** |
| two octaves down | **2** |

So the same letters are in different octaves in different clefs:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
bass clef
c d e f

measure
alto clef
c d e f
```

When you change the clef, it's easier to write the octave numbers, like the examples above do.

**Side note:** A measure has one clef for each stave. If you write two clefs in the same measure, the second one doesn't replace the first one. It starts a second stave. More about that you can read in [Staves](/docs/language/staves).

Read next: [Key signatures](/docs/language/key-signatures)

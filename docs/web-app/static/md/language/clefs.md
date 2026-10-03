# Clefs

A clef says which pitch each line of the stave stands for. You write it on its own line, as the name of the clef followed by the word `clef`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
bass clef
c3 d3 e3 f3
```

## 1. A clef applies from there on

A clef is drawn in the measure where you declare it, and it stays in force for the measures after it until the next clef. You don't need to repeat it in every measure:

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

As you can see, the second measure has no clef drawn, but its notes are still read in the bass clef.

It doesn't matter on which line of the measure you write the clef: it always goes at the start of the measure, and it applies to all of the measure's units. If you want to change the clef in the middle of a measure, see [Mid-measure clefs](/docs/language/mid-measure-clefs).

```msq-editor opens-with=text
measure
1/4 c3 d3
bass clef
1/4 e3 f3
```

## 2. No clef at all

If you don't declare any clef, nothing is drawn, but the notes are placed as if the clef was treble. This is why all the examples on the previous pages looked right without one:

```msq-editor opens-with=text
measure
1/4 c d e f

measure
treble clef
1/4 c d e f
```

## 3. All clefs

MSQ supports eleven clefs. Some of them have aliases, which you can use instead of the full name:

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

Here are the clefs that name a line of the stave, each with the same written notes, so the sounding pitch differs from one to another:

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

The aliases draw exactly the same clefs:

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

## 4. Octave clefs

The octave clefs are treble clefs with a small **8** or **15** above or below them. They move everything written on the stave an octave (or two octaves) up or down:

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

And with the other spellings from the table:

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

## 5. Notes without an octave number

It's important to mention that a note without an octave number is placed in a default octave, and that octave depends on the clef, so that the note sits around the stave:

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

So the same letters land in different octaves in different clefs:

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

When you change clef, it's easier to write the octave numbers explicitly, as the examples above do.

**Side note:** A measure takes one clef for each stave. If you write two clefs in the same measure, the second one does not replace the first: it starts a second stave. More about that you can read in [Staves](/docs/language/staves).

Read next: [Key signatures](/docs/language/key-signatures)

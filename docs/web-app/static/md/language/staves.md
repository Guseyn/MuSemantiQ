# Staves

Each measure consists of staves. Until now every example had just one, and MSQ created it for you. When you need more, you declare them with `stave`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

As you can see, each `stave` opens a new stave in the current measure, and everything written after it, until the next `stave`, goes on that stave.

## 1. Declaring a stave

`stave` must be the first word on its line, and it takes nothing else on that line except, optionally, a clef. You can declare a stave with a clef in one command, as above, or declare the stave and put the clef on the next line, the way you did on [Clefs](/docs/language/clefs):

```msq-editor opens-with=text
measure
stave
treble clef
c5 b a g
stave
bass clef
c3 b2 a2 g2
```

Both forms produce the same thing. The combined form `stave with … clef` accepts every clef from [Clefs](/docs/language/clefs), including the octave ones:

```msq-editor opens-with=text
measure
stave with treble clef
stave with alto clef
stave with bass clef
stave with octave down clef
```

If you prefer the American spelling, `staff` is accepted everywhere `stave` is:

```msq-editor opens-with=text
measure
staff with treble clef
e f g a
staff with bass clef
e3 f3 g3 a3
```

**Side note:** A second clef in the same measure also opens a new stave, because one stave cannot start with two clefs. So `treble clef` followed later by `bass clef` gives you two staves even without the word `stave`. It works, but writing `stave` makes the structure much easier to read.

## 2. Staves are per measure

It's important to mention that staves belong to a measure, not to the whole page. Every measure declares its own staves, so a grand staff repeats `stave` in every measure:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

measure
stave
g a b c5
stave
g3 a3 b3 c4

measure
stave
1 c5
stave
1 c3
```

As you may notice, the clefs are written only in the first measure. A stave remembers the clef of the stave with the same number in the previous measures, so the second stave is still read in bass clef in the second and the third measure.

If a measure has notes but no `stave`, it has only one stave, and the others disappear from that measure:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

measure
g a b c5
```

The only exception is a measure with nothing in it at all. An empty measure is drawn with as many staves as the measure before it:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

measure
```

## 3. As many staves as you need

You can declare as many staves in a measure as you need, and a stave may stay empty in some measures:

```msq-editor opens-with=text
measure
stave with treble clef
stave with alto clef
stave with bass clef

measure
stave
1/4 c5 d5 e5 f5
stave
1/4 c d e f
stave
1/4 c3 d3 e3 f3

measure
stave
1 g5
stave
1 rest
stave
1 g3
```

The staves in the first measure have clefs and nothing else. That is enough to set up the system, and the measures after it only need to say which stave the music goes on.

Read next: [Voices](/docs/language/voices)

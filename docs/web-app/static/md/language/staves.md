# Staves

Each measure consists of staves. Until now every example had one stave, and MSQ created it for you. If you need more, you declare them with `stave`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

As you can see, each `stave` starts a new stave in the current measure. Everything after it, until the next `stave`, goes on that stave.

## 1. Declaring a Stave

`stave` must be the first word on its line. The only other thing you can write on that line is a clef. So you can declare a stave and its clef in one line, like above, or put the clef on the next line, like on [Clefs](/docs/language/clefs):

```msq-editor opens-with=text
measure
stave
treble clef
c5 b a g
stave
bass clef
c3 b2 a2 g2
```

Both give the same result. `stave with … clef` works with every clef from [Clefs](/docs/language/clefs), including the octave ones:

```msq-editor opens-with=text
measure
stave with treble clef
stave with alto clef
stave with bass clef
stave with octave down clef
```

You can also write `staff` instead of `stave`, everywhere:

```msq-editor opens-with=text
measure
staff with treble clef
e f g a
staff with bass clef
e3 f3 g3 a3
```

**Side note:** A second clef in the same measure also starts a new stave, because one stave can't start with two clefs. So `treble clef` and then `bass clef` give you two staves even without `stave`. It works, but with `stave` the text is much easier to read.

## 2. Staves Are per Measure

It's important to mention that staves belong to a measure, not to the page. Every measure declares its own staves, so for a grand staff you write `stave` in every measure:

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

As you may notice, the clefs are written only in the first measure. A stave takes the clef of the stave with the same number in the previous measures. So the second stave is still in bass clef in the second and the third measure.

If a measure has notes but no `stave`, it has only one stave, and the other staves are gone in that measure:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

measure
g a b c5
```

The only exception is a completely empty measure. It's drawn with as many staves as the measure before it:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

measure
```

## 3. As Many Staves as You Need

You can declare as many staves in a measure as you need, and a stave can be empty in some measures:

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

The staves in the first measure have only clefs. That's enough to set them up, and the next measures only need to say which stave the music goes on.

Read next: [Voices](/docs/language/voices)

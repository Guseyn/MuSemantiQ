# Breath Marks

A breath mark shows a singer or a wind player where to take a breath. You add it before a unit:

```msq-editor opens-with=text
1/4 c d
e with breath mark before
f g
a with breath before
b
```

As you can see, `mark` is optional: `with breath before` means the same as `with breath mark before`.

## 1. Shapes

By default, a breath mark is drawn as a comma. But you can easily change its shape:

```msq-editor opens-with=text
1/4 c d
e with breath comma before
f g
a with breath double slashes before
b
```

These are all the shapes supported at the moment:

| Shape | Key words |
|---|---|
| comma | `comma` |
| double slashes | `double slashes`, `double slash` |

You can also write the shape with `as`, or together with `mark`, if it reads better to you:

```msq-editor opens-with=text
1/4 c d
e with breath as comma before
f g
a with breath mark double slash before
b
```

## 2. Before, Not After

It's important to mention that a breath mark always belongs to the unit *after* the breath. So a breath at the end of a measure is written on the first unit of the next measure. It is drawn after the barline, right before that unit:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f
measure
1/4 g with breath comma before
a b c5
```

## 3. Vertical Position

A breath mark is placed above the stave, but you can move it up or down:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f
measure
1/4 g with breath comma before 1 down
a b c5
measure
1/4 b with breath double slashes before 2 up
a g f
```

`1 down` moves the breath mark down by one interval between stave lines, and `2 up` moves it up by two.

## 4. Breath Marks on Several Staves

A breath mark before a unit is added on the other staves too, so the units on all the staves stay in line:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/4 a
a with breath mark before
a
voice
c
c
c
stave with bass clef
1/4 a3
a3
a3
```

**Side note:** a breath mark is also heard. In playback, it adds a pause before its unit, on every stave at once.

Read next: [Arpeggiated chords](/docs/language/arpeggiated-chords)

# Cross-Stave Connections

A cross-stave connection is a brace or a bracket at the left of several staves. Usually:

- a brace joins the staves of one instrument, like the two staves of a piano;
- a bracket joins the staves of a group of instruments, like a string section.

You set them in a measure with `brace` and `bracket`.

## 1. Braces

Let's start with a simple example:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

A connection belongs to the measure where you write it, and it's drawn at the left edge of that measure. So usually you write it in the first measure of a line. The staves can be written as `stave 1` or as `first stave`:

```msq-editor opens-with=text
measure
brace from first stave to second stave
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

If you want a brace on each line, just add `for each line`:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2 for each line
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
new line
new line
```

You can change braces in the middle of a page. A new `for each line` connection replaces the old one from that line on:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2 for each line
stave
stave
new line
new line
brace from first stave to third stave for each line
stave
stave
stave
new line
```

You can also write `for lines below`. It works the same way, but it makes it clearer that braces can change further down:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2 for lines below
stave
stave
new line
new line
brace from first stave to third stave for lines below
stave
stave
stave
new line
```

You can even set a brace for just one stave, with `for`:

```msq-editor opens-with=text
measure
brace for first stave
treble clef
c d e f
```

If you set a brace for staves that don't exist, it's still drawn:

```msq-editor opens-with=text
measure
brace from first stave to second stave
stave
```

It's very important to let a user see errors or inaccuracies visually.

## 2. Brackets

All the rules above work for brackets as well:

```msq-editor opens-with=text
measure
bracket from first stave to second stave
stave with treble clef
c5 d5 e5 f5
stave with treble clef
c d e f
```

You can combine braces and brackets in one measure:

```msq-editor opens-with=text
measure
brace from first stave to second stave
bracket from third stave to fourth stave
stave
stave
stave
stave
```

The number of a stave can also be written as a word after it:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2
bracket from stave three to stave four
stave
stave
stave
stave
```

It's important to mention that `brace` and `bracket` must be the first words on their line.

Read next: [Cross-stave chords](/docs/language/cross-stave-chords)

# Page Lines

Each page consists of lines, and each page line consists of measures. MSQ doesn't break lines for you. A page line ends where you write `new line`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
c d e f

new line
c5 b a g
```

As you can see, `new line` ends the current page line and starts the next one.

## 1. A New Line Is Also a New Measure

`new line` must be alone on its line. It starts a new measure on the new page line, so you don't need to write `measure` after it. You can still write it if you like, and it doesn't add another measure:

```msq-editor opens-with=text
new line
measure
treble clef
c d e f

measure
g a b c5

new line
measure
treble clef
c5 b a g

measure
f e d c
```

This draws two page lines with two measures on each. The last measure of each line takes the rest of the space on that line, and it grows when you add more to it.

Page lines can be empty:

```msq-editor opens-with=text
new line
new line
new line
```

## 2. What a New Line Keeps, and What It Does Not

A new line keeps the staves of the measure before it. As you remember from [Staves](/docs/language/staves), an empty measure is drawn with as many staves as the previous one. An empty new line works the same way:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

new line
```

A new line doesn't draw again a clef, a key signature or a time signature that you declared once. The music is still in the same clef, but nothing is drawn at the start of the new line:

```msq-editor opens-with=text
measure
bass clef
key signature is d major
time signature is 3:4
1/4 d3 e3 f3

new line
1/4 c3 b2 a2
```

So on each new line you declare the clef again:

```msq-editor opens-with=text
measure
bass clef
1/4 d3 e3 f3 g3

new line
bass clef
1/4 c3 b2 a2 g2
```

As you remember from [Key signatures](/docs/language/key-signatures) and [Time signatures](/docs/language/time-signatures), you can write `for each line` instead of repeating a key signature or a time signature. Everything declared with `for each line` is drawn again at the start of every new line.

```msq-editor opens-with=text
measure
treble clef
key signature is d major for each line
time signature is 3:4 for each line
1/4 d e f

measure
g a b

new line
treble clef
1/4 c5 b a

measure
g f e
```

## 3. Measures Are Numbered Within Their Page Line

It's important to mention that MSQ counts measures in each page line, not in the whole page. The first measure after `new line` is measure **1** again. Page lines are counted from **1** at the top of the page.

You will need this for the commands in [Slurs](/docs/language/slurs) and the next pages. They find the units they connect by their position, `in line 2, in measure 1`. If you don't mention the line, they look in the page line where they are written.

Read next: [Titles and page meta](/docs/language/titles-and-page-meta)

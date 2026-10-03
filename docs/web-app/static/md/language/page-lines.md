# Page lines

Each page consists of lines, and each page line consists of measures. MSQ does not break lines for you: a page line ends where you say so, with `new line`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
c d e f

new line
c5 b a g
```

As you can see, `new line` ends the current page line and starts the next one.

## 1. A new line is also a new measure

`new line` must be alone on its line. It opens a fresh measure on the new page line, so you don't need to write `measure` after it. You can still write it, if you like how it looks; it does not add another measure:

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

The commands above draw two page lines with two measures on each of them. The last measure of each line fills the rest of the space on it, and it expands while you add more content there.

Page lines make sense even without any music in them:

```msq-editor opens-with=text
new line
new line
new line
```

## 2. What a new line keeps, and what it does not

A new line keeps the structure of the measure before it. As you remember from [Staves](/docs/language/staves), an empty measure is drawn with as many staves as the previous one, and a new line with nothing in it is no different:

```msq-editor opens-with=text
measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

new line
```

A new line does not restate a clef, a key signature or a time signature that you declared only once. The music is still read in the clef it was written in, but nothing is drawn at the start of the new line:

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

As you remember from [Key signatures](/docs/language/key-signatures) and [Time signatures](/docs/language/time-signatures), you can write `for each line` instead of repeating a key signature or a time signature. This is exactly the place where it pays off: anything declared `for each line` is restated at the start of every new line.

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

## 3. Measures are numbered within their page line

It's important to mention that MSQ counts measures within their page line, not across the whole page. The first measure after `new line` is measure **1** again, and the page line itself is numbered from **1** at the top of the page.

That matters for the commands you will meet in [Slurs](/docs/language/slurs) and the pages after it. They find the units they connect by their position, `in line 2, in measure 1`, and when you don't mention the line, they look in the page line they are written on.

Read next: [Titles and page meta](/docs/language/titles-and-page-meta)

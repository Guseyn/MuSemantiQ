# Your First Notes

A note is written as its letter name. You don't need anything before it: no header, no measure, no clef. Just a list of letters is already a valid page.

Let's start with a simple sequence of notes:

```msq-editor opens-with=text
c d e f g a b
```

The letters are **c**, **d**, **e**, **f**, **g**, **a** and **b**, always lowercase. `C` or `h` is not a note, and MSQ will tell you that.

Notes are separated by spaces. The number of spaces doesn't matter:

```msq-editor opens-with=text
c   d e    f
```

You can also separate notes by commas, if it's easier for you to read. Commas change nothing, so the text below gives the same notes as the first example:

```msq-editor opens-with=text
c, d, e, f, g, a, b
```

It's important to mention that a comma goes right after a word, and then comes a space. `c,d,e` without spaces is one word, and it's not a note. A semicolon and the word `and` work the same way as a comma:

```msq-editor opens-with=text
c; d; e and f
```

You can declare each note on a new line:

```msq-editor opens-with=text
c
d
e
f
g
a
b
```

Empty lines and indentation are only for you. The parser ignores them:

```msq-editor opens-with=text
c d e f

  g a b
```

As you may notice, there is no clef in the examples above. If you don't declare one, no clef is drawn, and the notes are placed as if it were a treble clef. So `c` is the middle C, on the ledger line below the stave. How to set a clef you can read in [Clefs](/docs/language/clefs).

Read next: [Octaves](/docs/language/octaves)

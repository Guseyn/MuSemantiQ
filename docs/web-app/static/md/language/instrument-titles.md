# Instrument Titles

An instrument title is the name written at the left of a stave. Like a clef or a barline, you set it in a measure:

```msq-editor opens-with=text
measure
instrument title is "Piano" for stave 1
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

You can write just `instrument` instead of `instrument title`, and you can skip `is`. The stave can be written as `stave 1` or `first stave`. If you don't write a stave, the title goes to the first stave:

```msq-editor opens-with=text
measure
instrument "Guitar"
treble clef
c d e f
```

One title for several staves, like the two staves of a grand staff:

```msq-editor opens-with=text
measure
instrument "Piano" between first stave and second stave
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

By default, a title is drawn only on the line where you write it. To draw it on each line, just add `for each line`:

```msq-editor opens-with=text
measure
instrument "Piano" between first stave and second stave for each line
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
new line
new line
```

Usually, the first line has the full name of an instrument, and the next lines have a short one, so the music has more space. That's why there is `for lines below`. It works the same as `for each line`, but it reads better when you write a title on a later line, for that line and the lines after it:

```msq-editor opens-with=text
measure
instrument title is "Violin" for stave 1
treble clef
c d e f

new line
instrument title is "Vln." for stave 1 for lines below
g a b c5

new line
c5 b a g
```

You can also change the instruments in the middle of a page. The new titles replace the old ones from that line on:

```msq-editor opens-with=text
measure
instrument "Piano" between first stave and second stave for each line
stave
stave
new line
new line
instrument "Violin" for first stave for each line
instrument "Piano" between stave 2 and stave 3 for each line
stave
stave
stave
new line
```

If you set an instrument for staves that don't exist, it's still drawn:

```msq-editor opens-with=text
measure
instrument "Piano" between first stave and second stave
stave
```

It's very important to let a user see errors or inaccuracies visually.

The size of instrument titles is set by the `instrument title font size` style (or `instrument font size`), in intervals between stave lines. By default it's **3.4**. More about styles you can read in [Page format](/docs/language/page-format).

The MIDI player also uses the instrument title to choose the sound of a stave. If the title is an instrument name the player knows, like **Piano**, **Violin** or **Flute**, the stave is played with that instrument. The full list of names is in [MIDI settings](/docs/language/midi-settings).

Read next: [Cross-stave connections](/docs/language/cross-stave-connections)

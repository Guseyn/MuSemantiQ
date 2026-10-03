# Instrument titles

An instrument title is the name written at the left of a stave. Like a clef or a barline, it's set in a measure, and in order to add a title to a certain stave, you use the following command:

```msq-editor opens-with=text
measure
instrument title is "Piano" for stave 1
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

You can also just write `instrument` instead of `instrument title`, and you can omit `is`. The stave can be written as `stave 1` or `first stave`, and if you don't mention it at all, the title goes to the first stave:

```msq-editor opens-with=text
measure
instrument "Guitar"
treble clef
c d e f
```

This is how you add one title for several staves, like the two staves of a grand staff:

```msq-editor opens-with=text
measure
instrument "Piano" between first stave and second stave
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
```

By default, a title is drawn only on the line where you declare it. In order to apply it to each line, just add `for each line`:

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

The first line usually differs from the rest: conventionally, it has the full name of an instrument, and the following lines have a short one, so the music on them has more space. That's why `for lines below` exists. It works in the same way as `for each line`, but it reads better when you declare a title on a later line that applies from there on:

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

You can also change the setup of instruments in the middle of a page, the new titles replace the previous ones from that line on:

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

If you set an instrument for staves that are missing, it will still be drawn:

```msq-editor opens-with=text
measure
instrument "Piano" between first stave and second stave
stave
```

It's very important to let a user see errors or inaccuracies visually.

The size of instrument titles is controlled by the `instrument title font size` style (or `instrument font size`), in intervals between stave lines. By default it's **3.4**. More about styles you can read in [Page format](/docs/language/page-format).

An instrument title is also what the MIDI player uses to choose the sound of a stave. If the title is one of the instrument names the player recognises, like **Piano**, **Violin** or **Flute**, that stave is played with that instrument. The full list of names is in [MIDI settings](/docs/language/midi-settings).

Read next: [Cross-stave connections](/docs/language/cross-stave-connections)

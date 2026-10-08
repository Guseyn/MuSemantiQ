# Tempo and Metronome Marks

Each measure can have a tempo or metronome mark. You write it as a text: a word, a metronome mark, or both. Durations in the text are drawn as note symbols.

Let's start with a simple example, with only a word:

```msq-editor opens-with=text
measure
treble clef
tempo is "Andante"
c d e f
```

You can write `tempo`, `tempo mark`, `tempo note`, `metronome`, `metronome mark` or `metro`. They all mean the same thing. You can skip `is`.

Let's add a note to the mark:

```msq-editor opens-with=text
measure
treble clef
metronome mark is "Allegro (1/4 = 120)"
c d e f
```

Each duration in the text is drawn as its note symbol. These are all the supported ones:

```msq-editor opens-with=text
measure
treble clef
metronome mark is "1 1/2 1/4 1/8 1/16 1/32 1/64"
c d e f
```

The durations can also be written as words: `whole`, `half`, `quarter`, `eighth`, `sixteenth`, `thirty second` and `sixty fourth`:

```msq-editor opens-with=text
measure
treble clef
tempo is "Moderato (quarter = 96)"
c d e f
```

To add a dot to a duration, write `dotted` or `with dot` after it:

```msq-editor opens-with=text
measure
treble clef
metronome mark is "1 dotted, 1/2 with dot, 1/4 dotted, 1/8 with dot, 1/16 dotted, 1/32 with dot"
c d e f
```

A tempo mark moves up or down by itself, but you can correct it:

```msq-editor opens-with=text
measure
treble clef
tempo is "Allegro" 2 up
c d e f
```

Here we moved the tempo mark up by two intervals between stave lines.

A tempo mark belongs to its measure, so it can change the tempo in the middle of a piece:

```msq-editor opens-with=text
measure
treble clef
tempo is "Adagio (1/4 = 60)"
c d e f
measure
g a b c5
measure
tempo is "a tempo (1/4 = 100)"
c5 b a g
```

It's important to mention that a tempo mark is not only drawn. The MIDI player also plays at that tempo:

- If the text has a metronome mark like **1/4 = 120**, that is the tempo.
- If it has only a tempo word, like **Andante** or **Presto**, the player picks a tempo for that word.
- Words like **accelerando** or **rit.** change the tempo gradually.
- Without any tempo mark, the music is played at **120** quarters per minute. The `default tempo` setting from [MIDI settings](/docs/language/midi-settings) changes that, but only when the first measure has no tempo mark of its own.

Read next: [Measure numbers](/docs/language/measure-numbers)

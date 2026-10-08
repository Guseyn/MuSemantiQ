# Ghost Units

A ghost unit is a note or chord played for its rhythm, not its pitch: a muted, percussive note. It is drawn with a cross instead of a regular note head.

Let's start with a simple example:

```msq-editor opens-with=text
1/4 c is ghost
d
e is ghost
f
```

## 1. Marking a Unit as Ghost

To make a note a ghost note, just mark it. `is ghost` and `ghost` mean the same:

```msq-editor opens-with=text
a is ghost
b ghost
a ghost
```

The shape of a ghost note depends on its duration:

```msq-editor opens-with=text
1 a is ghost
1/2 a
1/4 a
1/8 a
1/16 a
1/32 a
```

## 2. Ghost Carries Over

As you may notice in the example above, you only need to mark the first note as ghost. All the next units in the same voice become ghosts too, also in the next measures, until you say otherwise.

To stop it, mark a unit with `is not ghost` or `not ghost`:

```msq-editor opens-with=text
1/4 a is ghost
a
a is not ghost
a
a
```

It's important to mention that this works for each stave separately, so a ghost on one stave doesn't turn the next stave into ghosts:

```msq-editor opens-with=text
measure
stave with treble clef
1/4 a is ghost
a a a
stave with bass clef
1/4 c3 d3 e3 f3
```

## 3. Chords

To make a chord ghost, mark it on the `chord` line. Like with notes, the chords after it become ghosts too:

```msq-editor opens-with=text
chord is ghost
f c5 a5

chord
g d5 b5

```

Or you can mark just one note in a chord as ghost. Then it doesn't carry over to other notes or to the next unit:

```msq-editor opens-with=text
chord
f, c5 is ghost, a5

chord
g d5 b5

```

## 4. Ghost Units in Playback

A ghost unit still takes its full duration, like any other unit. But in playback it isn't played by the instrument of its stave. It gets a short percussive sound instead, so you hear only its rhythm.

**Side note:** a ghost unit is not the same as a unit in parentheses. A ghost note changes how a note is played. Parentheses only say that a note is optional or implied, and it is played as usual. Parentheses have their own page: [Parentheses](/docs/language/parentheses).

Read next: [Parentheses](/docs/language/parentheses)

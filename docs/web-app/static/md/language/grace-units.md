# Grace Units

A grace unit is a small note or chord played quickly before the next unit. It doesn't take any time in the measure.

Let's start with a simple example:

```msq-editor opens-with=text
1/8 c is grace
1/4 d
1/8 e is crushed grace
1/4 f
```

## 1. Marking a Unit as Grace

To make a note a grace note, just mark it. `is grace` and `grace` mean the same:

```msq-editor opens-with=text
1/4 a is grace
b grace
a grace
```

It's important to mention that, unlike most attributes, `grace` doesn't carry over to the next unit. You have to mark every grace unit:

```msq-editor opens-with=text
1/8 a is grace
1/4 b
1/8 a is grace
b is grace
1/4 c5
```

## 2. Durations

A grace unit has a duration like any other unit. The duration sets how it is drawn: its note head, flags and beams. This is how grace notes with different durations look:

```msq-editor opens-with=text
1 a is grace
1/2 a is grace
1/4 a is grace
1/8 a is grace
1/16 a is grace
1/32 a is grace
```

In playback, a grace unit sounds for a quarter of its written duration.

## 3. Crush Line

A grace note can have a crush line, the slash through its stem. You can write `is crushed grace`, `crushed grace`, or `is grace with crush line`:

```msq-editor opens-with=text
1/8 a is crushed grace
1/4 b
1/8 a crushed grace
1/4 b
1/8 a is grace with crush line
1/4 b
```

## 4. Everything Else Still Applies

Everything that works for simple notes works for grace notes too. Grace notes can be beamed together, and they can have stems, accidentals and articulations:

```msq-editor opens-with=text
1/8 a is grace, beamed with next, stem down
b is grace
c5 is grace
d5 is grace
1/4 e5

1/16 f is grace, with sharp key, beamed with next
g is grace
1/4 a with staccato
```

## 5. Chords

To make a chord grace, mark it on the `chord` line:

```msq-editor opens-with=text
1/8 chord is grace
f c5 a5

1/4 chord
g d5 b5

1/8 chord grace
f c5 a5

1/4 chord
g d5 b5

```

If you mark just one note in a chord as grace, the whole chord becomes grace. It works, but it's not recommended, mostly for the sake of better readability:

```msq-editor opens-with=text
1/8 chord
f c5 is grace a5

1/4 chord
g d5 b5

```

## 6. Grace Units on Several Staves

Grace units don't break the alignment of other units. Here the grace notes on the first stave don't push the notes on the second stave out of line:

```msq-editor opens-with=text
measure
stave with treble clef
1/8 a is grace, beamed with next
1/16 a is grace
1/16 a is grace
1/4 a
a
stave with bass clef
1/4 c3
d3
```

**Side note:** to write an appoggiatura or an acciaccatura, join a grace note to its main note with a slur. Slurs have their own page: [Slurs](/docs/language/slurs).

Read next: [Ghost units](/docs/language/ghost-units)

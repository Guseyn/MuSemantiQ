# Chords

A chord is a unit made of several notes that sound together. In order to create a chord, you need to type `chord`, and then list all its notes starting from the next line:

```msq-editor opens-with=text
chord
c e g
```

You can also put each note of the chord on a new line. Indentation is only decoration, the parser ignores it:

```msq-editor opens-with=text
chord
  c
  e
  g
```

Each chord must start on a new line. The notes can't be written on the same line as `chord`.

## 1. The empty line rule

A chord's note list runs on until something ends it. Another `chord` ends the previous one, so you can write chords one after another:

```msq-editor opens-with=text
chord
c e g
chord
d f a
chord
e g b
```

But a note is a different story. To separate a chord from the note that follows after, you have to put an empty line between them:

```msq-editor opens-with=text
chord
c e g

a
```

It's important to mention that this is the most common mistake with chords. Without the empty line, the next note is read as another member of the chord. In the example below, `a` is not a separate note, it's the fourth note of the chord:

```msq-editor opens-with=text
chord
c e g
a
```

So the habit is simple: always finish a chord with an empty line.

```msq-editor opens-with=text
chord
d f a

c d

chord
e g c5

```

## 2. Duration of a chord

Like for notes, the default duration of a chord is a quarter. To set a duration for the chord, you need to put it before `chord`, separated by a space:

```msq-editor opens-with=text
1/2 chord
c e g c5

1/8 chord
d f a

1/8 chord
e g b

```

A chord takes part in the same sticky duration as notes do: it keeps the duration of the units before it, and passes its own to the units after it:

```msq-editor opens-with=text
1/8 c d
chord
e g

f
1/2 chord
c e g

a
```

You still can set a duration for notes in the chord, but the chord has only one duration. The last specified duration overrides the durations mentioned before it:

```msq-editor opens-with=text
1/4 chord
1/2 c 1/8 e 1/16 g

```

As you can see, the chord is a sixteenth. Of course, it's not recommended to write this way: the duration goes on the `chord` line, not on the notes.

## 3. Notes in a chord

Each note in the chord can have an octave:

```msq-editor opens-with=text
chord
c3
c4
c5

chord
g3 e4 c5

```

The notes don't have to be in order. MSQ sorts them by pitch when it draws the chord:

```msq-editor opens-with=text
chord
g c e

```

A key follows its own note in the note list, exactly like for a single note:

```msq-editor opens-with=text
chord
c sharp e g flat

chord
d with fl key, f with # key with parentheses, a

```

## 4. Dots and rests

A dot is written after `chord`, and it applies to the whole chord:

```msq-editor opens-with=text
1/4 chord dotted
c e g

1/8 chord
d f a

1/2 chord with two dots
c e g c5

```

If you add dots to any of the notes in a chord, they will be applied to the whole chord as well. It's not recommended to do that, because it's easy to miss:

```msq-editor opens-with=text
1/2 chord
c with two dots, e, g

```

Chords can also be marked as a rest. As you remember from [Rests](/docs/language/rests), a rest pinned to a note is drawn where that note would be. For a chord, the rest takes the position of its first note:

```msq-editor opens-with=text
chord is rest
a b d5

chord
g, b is rest, d5

```

As you can see, marking any note of a chord as a rest makes the whole chord a rest. There is not much sense in it, unless you're experimenting and you just want to mark and unmark chords as rests easily.

Read next: [Beams](/docs/language/beams)

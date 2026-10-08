# Chords

A chord is a unit of several notes that sound together. To write a chord, type `chord`, and list its notes on the next line:

```msq-editor opens-with=text
chord
c e g
```

You can also put each note on its own line. The parser ignores indentation:

```msq-editor opens-with=text
chord
  c
  e
  g
```

Each chord starts on a new line. The notes can't be on the same line as `chord`.

## 1. The Empty Line Rule

The notes of a chord go on until something ends the chord. Another `chord` ends the previous one, so you can write chords one after another:

```msq-editor opens-with=text
chord
c e g
chord
d f a
chord
e g b
```

But a note doesn't end a chord. To write a note after a chord, you have to put an empty line between them:

```msq-editor opens-with=text
chord
c e g

a
```

It's important to mention that this is the most common mistake with chords. Without the empty line, the next note becomes part of the chord. In the example below, `a` is not a separate note, it's the fourth note of the chord:

```msq-editor opens-with=text
chord
c e g
a
```

So just always end a chord with an empty line.

```msq-editor opens-with=text
chord
d f a

c d

chord
e g c5

```

## 2. Duration of a Chord

Like a note, a chord is a quarter by default. To set its duration, put it before `chord`, with a space:

```msq-editor opens-with=text
1/2 chord
c e g c5

1/8 chord
d f a

1/8 chord
e g b

```

The duration works the same as with notes: a chord gets the duration of the units before it, and the units after it get the chord's duration:

```msq-editor opens-with=text
1/8 c d
chord
e g

f
1/2 chord
c e g

a
```

You can still write durations on the notes inside the chord, but a chord has only one duration. The last one wins:

```msq-editor opens-with=text
1/4 chord
1/2 c 1/8 e 1/16 g

```

As you can see, the chord is a sixteenth. It's not recommended to write this way: put the duration on the `chord` line, not on the notes.

## 3. Notes in a Chord

Each note in the chord can have an octave:

```msq-editor opens-with=text
chord
c3
c4
c5

chord
g3 e4 c5

```

The notes can be in any order. MSQ sorts them by pitch when it draws the chord:

```msq-editor opens-with=text
chord
g c e

```

A key goes after its own note, like with a single note:

```msq-editor opens-with=text
chord
c sharp e g flat

chord
d with fl key, f with # key with parentheses, a

```

## 4. Dots and Rests

A dot goes after `chord`, and it's for the whole chord:

```msq-editor opens-with=text
1/4 chord dotted
c e g

1/8 chord
d f a

1/2 chord with two dots
c e g c5

```

If you add dots to one of the notes in a chord, they also go to the whole chord. It's not recommended, because it's easy to miss:

```msq-editor opens-with=text
1/2 chord
c with two dots, e, g

```

A chord can also be marked as a rest. As you remember from [Rests](/docs/language/rests), a rest on a note is drawn where that note would be. For a chord, the rest is drawn where its first note would be:

```msq-editor opens-with=text
chord is rest
a b d5

chord
g, b is rest, d5

```

As you can see, if any note of a chord is a rest, the whole chord is a rest. It's only useful when you want to easily mark and unmark chords as rests while you experiment.

Read next: [Beams](/docs/language/beams)

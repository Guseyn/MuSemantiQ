# Arpeggiated Chords

An arpeggiated (rolled) chord is played one note after another, not all at once. It's drawn with a wavy line in front of it. Any chord can be arpeggiated:

```msq-editor opens-with=text
chord is arpeggiated
c e g c5

chord is arpeggiated with arrow up
d f a d5

```

As you remember from [Chords](/docs/language/chords), everything about a chord goes on the `chord` line, and `is arpeggiated` too. You can also write `is arpeggio`, or leave out `is`:

```msq-editor opens-with=text
chord is arpeggiated
c e g b

chord is arpeggio
c e g b

chord arpeggiated
c e g b

```

The wave is as tall as its chord, so a wider chord gets a longer wave:

```msq-editor opens-with=text
measure
treble clef
chord is arpeggiated
c e

chord is arpeggiated
c e g

chord is arpeggiated
c e g c5

chord is arpeggiated
c e g c5 e5 g5

```

## 1. Arrows

You can add an arrow to the wave to show the direction:

```msq-editor opens-with=text
chord is arpeggiated with arrow up
c e g b

chord is arpeggiated with arrow down
c e g b

```

If you write just `with arrow`, the arrow points up.

By default, the notes are played from the lowest one up. With an arrow down, they are played from the highest one down.

## 2. Arpeggiated Chords in Several Voices

If chords in different voices are arpeggiated, you can join their waves into one. You just need to write `with chord below` on the upper chord:

```msq-editor opens-with=text
measure
treble clef
voice
chord is arpeggiated with chord below
a c5 e5

voice
chord is arpeggiated
g3 b3 d

```

It's important to mention that the chord below has to be arpeggiated too, because `with chord below` only joins two waves. It doesn't create the second one.

## 3. Arpeggiated Chords Across Staves

In the same way, you can join arpeggiated chords on different staves, so one wave goes through both of them:

```msq-editor opens-with=text
measure
stave with treble clef
stave with bass clef

measure
stave
chord is arpeggiated with chord below
c5 e5 g5

stave
chord is arpeggiated
c3 g3 c

```

Joined waves are also played as one roll, through all the chords they connect.

Read next: [Chord letters](/docs/language/chord-letters)

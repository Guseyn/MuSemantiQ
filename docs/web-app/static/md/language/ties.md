# Ties

A tie joins two notes of the same pitch into one sound. The second note is not played again, it just makes the first one longer. You connect notes with ties like this:

```msq-editor opens-with=text
1/4 c is tied with next
c
1/2 d is tied with next
1/8 d
```

You can skip `is`, and write just `tied with next`.

## 1. Direction of a Tie

The direction of a tie depends on the stems and the positions of the tied notes:

```msq-editor opens-with=text
a with stem up, tied with next
a

a with stem down, tied with next
a

a with stem up, tied with next
a with stem down

a with stem down, tied with next
a with stem up
```

But you can set it with `up` or `down` right after the tie:

```msq-editor opens-with=text
a with stem down, tied with next up
a with stem up

a with stem down, tied with next down
a with stem up
```

You can also write `above` or `over` instead of `up`, and `below` or `under` instead of `down`:

```msq-editor opens-with=text
1/4 c5 tied with next above
c5
e tied with next below
e
```

## 2. Roundness of a Tie

You can also set how round a tie is. All you need is to write `with roundness` and a number from **1** to **10**. The bigger the number, the rounder the tie:

```msq-editor opens-with=text
1/2 a tied with next, with roundness 1
1/8 a

1/2 a tied with next, with roundness 5
1/8 a

1/2 a tied with next, with roundness 10
1/8 a
```

`with convex` works the same as `with roundness`. By default, the roundness depends on the distance between the tied units.

## 3. Tied Chords

You tie chords the same way:

```msq-editor opens-with=text
1/2 chord tied with next
c e g b
1/4 chord
c e g b

1/2 chord tied with next
c d e f g
1/4 chord
c d e f g

```

As you can see, a chord without whole tones and a chord with whole tones are tied differently. Let's change the direction of the ties:

```msq-editor opens-with=text
1/2 chord tied with next up
c e g b
1/4 chord
c e g b

1/2 chord tied with next down
c d e f g
1/4 chord
c d e f g

```

In the chord without whole tones, all the ties change direction. In the chord with whole tones, the top tie still goes up and the bottom tie still goes down, so ties don't cross notes.

If a note in a chord is tied, the whole chord is tied with the next one:

```msq-editor opens-with=text
chord
c e is tied with next, g
chord
c e g

```

## 4. What a Tie Connects To

A tie doesn't connect notes, it connects positions of notes. A tie looks for a note on the same position in the next units of the same voice. This way ties look nicer, especially for chords with whole tones.

So a tied chord can connect to separate notes, and separate tied notes to a chord:

```msq-editor opens-with=text
1/4 chord tied with next up
c e g

1/8 c
1/8 e
1/8 g

1/8 c tied with next down
1/8 e tied with next down
1/8 g tied with next down

1/4 chord
c e g

```

And a tie skips the units that have nothing on its position:

```msq-editor opens-with=text
1/2 c is tied with next
1/8 e g
1/4 c
```

If a tie can't find a note, it's drawn to the end of the line:

```msq-editor opens-with=text
1/4 c d e is tied with next
f
```

## 5. Ties Before and After

A tie can also come from before a unit, or go on after it, without a second note. You write `is tied before` or `is tied after`. You can skip `is` here too:

```msq-editor opens-with=text
1/2 a is tied before
1/4 b c5
d5 is tied after
```

The direction and the roundness work the same for them:

```msq-editor opens-with=text
1/2 a tied before up
1/4 b c5
d5 tied after down, with roundness 3
```

This is how you write a tie that comes from the previous page line, or goes on to the next one.

A tie before or after can also go into another measure. For that, add the number of a measure on the same page line:

- `is tied before measure 2` draws the tie from the start of the second measure of the line.
- `is tied after measure 4` draws it to the end of the fourth measure.

The measure must not be empty. It's useful with [volta brackets](/docs/language/volta-brackets). You will see how to write measures in [Measures](/docs/language/measures).

It's important to mention how a tie is different from a slur:

- A tie joins notes on the same position into one longer sound, and it finds its second note itself.
- A slur can connect any units, of any pitch, and you say exactly where it starts and where it finishes.

You can read about slurs in [Slurs](/docs/language/slurs).

Read next: [Tuplets](/docs/language/tuplets)

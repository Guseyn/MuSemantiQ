# Ties

A tie joins two notes of the same pitch into one sound: the second note is not played again, it just makes the first one longer. You can connect notes with ties as follows:

```msq-editor opens-with=text
1/4 c is tied with next
c
1/2 d is tied with next
1/8 d
```

You can omit `is`, and write just `tied with next`.

## 1. Direction of a tie

The direction of a tie depends on the stem directions and on the positions of the tied notes:

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

But you can force the direction of a tie with `up` or `down` right after it:

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

## 2. Roundness of a tie

You can also control the roundness, or convexity, of a tie. All you need is to specify a number from **1** to **10** with `with roundness`. The bigger the number, the more a tie is rounded:

```msq-editor opens-with=text
1/2 a tied with next, with roundness 1
1/8 a

1/2 a tied with next, with roundness 5
1/8 a

1/2 a tied with next, with roundness 10
1/8 a
```

`with convex` works the same way as `with roundness`. By default, if you don't specify the number, the roundness varies depending on the distance between the tied units.

## 3. Tied chords

The same way you tie chords:

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

As you can see above, a chord without whole tones and a chord with whole tones are connected differently. Let's try to change the direction of the ties:

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

For chords without whole tones we change the direction of all the ties. In the chord with whole tones, the top tie stays directed upwards and the bottom tie downwards, to avoid intersections between notes and ties.

If a note in a chord is tied, then the whole chord is tied with what follows:

```msq-editor opens-with=text
chord
c e is tied with next, g
chord
c e g

```

## 4. What a tie connects to

It's worth to note that a tie doesn't connect notes, it rather connects positions of notes. A tie always tries to find a note on the same position among the units that follow after the tied unit, in the same voice. By using this technique ties look more pleasant to the eye, especially for chords with whole tones.

So a tied chord can be connected to separate notes, and separate tied notes to a chord:

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

And a tie can skip the units that have nothing on its position:

```msq-editor opens-with=text
1/2 c is tied with next
1/8 e g
1/4 c
```

If a tie cannot connect to any note, it will be drawn till the end of the line:

```msq-editor opens-with=text
1/4 c d e is tied with next
f
```

## 5. Ties before and after

A tie can also come from before a unit, or go on after it, without a second note. You write it as `is tied before` or `is tied after`. `is` can be omitted here too:

```msq-editor opens-with=text
1/2 a is tied before
1/4 b c5
d5 is tied after
```

The direction and the roundness work for them in the same way:

```msq-editor opens-with=text
1/2 a tied before up
1/4 b c5
d5 tied after down, with roundness 3
```

It's the way to write a tie that comes from the previous line of the page, or goes on to the next one.

A tie before or after can also reach into another measure. For that, add the number of a measure on the same page line to it: `is tied before measure 2` draws the tie from the start of the second measure of the line, and `is tied after measure 4` draws it till the end of the fourth one. The measure must contain something though. It can be useful in combination with [volta brackets](/docs/language/volta-brackets). You will see how measures are declared in [Measures](/docs/language/measures).

It's important to mention how a tie differs from a slur. A tie joins notes on the same position into one longer sound, and it finds its second note by itself. A slur can connect any units, of any pitch, and you say exactly where it starts and where it finishes. Slurs you can read about in [Slurs](/docs/language/slurs).

Read next: [Tuplets](/docs/language/tuplets)

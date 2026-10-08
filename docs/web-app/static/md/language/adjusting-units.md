# Adjusting Units

Sometimes it's useful to move a unit to the left or to the right.

Let's start with the following example:

```msq-editor opens-with=text
measure
treble clef
1 a
1/4 a

new line
1 a
1/4 a is left by 3

new line
1 a
1/4 a is right by 3
```

As you can see, you just add `is left by N` or `is right by N` to a unit. The word `is` can be left out, and the number can be a decimal, or even a word:

```msq-editor opens-with=text
measure
treble clef
1/4 a
b right by 1.5
c5 left by 0.5
d5 is right by two
```

The number is in intervals between stave lines, like everything else on the page. So **1** moves a unit by one space of the stave, and if you change the interval between stave lines, the move changes with it.

A chord is adjusted on its `chord` line:

```msq-editor opens-with=text
measure
treble clef
1 a

1/8 chord is arpeggiated
a sharp b sharp c5 flat

new line
1 a

1/8 chord is arpeggiated, is right by 2
a sharp b sharp c5 flat

```

It's important to mention that when you move a unit, everything in front of it that belongs to it moves too: its accidentals, its arpeggio, and so on, as you can see above.

## 1. What Else Moves

Units in different voices and staves stay in sync. Everything that sounds at the same time moves together:

```msq-editor opens-with=text
measure
stave with treble clef
1/4 a b is right by 4 c5 d5
stave with bass clef
1/4 c3 d3 e3 f3
```

And all the units after it move as well:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
e is right by 5
f
```

## 2. When You Need It

In most cases, you don't need to move units:

- By default, MSQ keeps enough space between units.
- If a page is too tight or too loose, try [Unit spacing](/docs/language/unit-spacing) first.

But there are so many edge cases where it's not clear whether units should be moved, that it was decided to give you full control. Here are some examples where it's useful.

Let's start with [tuplets](/docs/language/tuplets). By default, the spaces between units in a tuplet are uneven when there are units in other voices or staves:

```msq-editor opens-with=text
measure
treble clef
voice
1/8 a beamed a a not beamed
1/16 a beamed a a a a not beamed
1/8 a
1/4 a
voice
1/8 c c
c c
1/4 c

tuplet 5:4 with brackets in first voice from unit 1 to unit 9
tuplet 3 with brackets in first voice from unit 1 to unit 3
tuplet 5 with brackets in first voice from unit 4 to unit 8
```

If you move a few units, the spaces become even:

```msq-editor opens-with=text
measure
treble clef
voice
1/8 a beamed a a not beamed is left by 0.7
1/16 a beamed a, a is left by 1.5, a a not beamed
1/8 a
1/4 a
voice
1/8 c c is left by 1
c is left by 1.5, c
1/4 c

tuplet 5:4 with brackets in first voice from unit 1 to unit 9
tuplet 3 with brackets in first voice from unit 1 to unit 3
tuplet 5 with brackets in first voice from unit 4 to unit 8
```

Now it looks much better. Let's take a look at another example:

```msq-editor opens-with=text
measure
stave with treble clef
1/16 e5 with stem down, beamed with next
g sharp
a
b is not beamed
c5 with stem up and beamed
d5
e5
chord is arpeggiated
a3 sharp c sharp f sharp

stave with bass clef
1/16 c3 with stem down, beamed with next
b2
a2
a2 not beamed
c3 beamed
b2
a2
g2
```

There is a wide gap before the arpeggiated chord. We can easily fix it:

```msq-editor opens-with=text
measure
stave with treble clef
1/16 e5 with stem down, beamed with next
g sharp, is left by 1
a
b is not beamed
c5 with stem up and beamed
d5
e5
chord is arpeggiated, is left by 5
a3 sharp c sharp f sharp

stave with bass clef
1/16 c3 with stem down, beamed with next
b2
a2
a2 not beamed
c3 beamed
b2
a2
g2
```

Read next: [Slurs](/docs/language/slurs)

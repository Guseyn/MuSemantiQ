# Cross-Stave Chords

A note or a chord can be drawn on the stave below or above the one where you write it. Piano music often does this: a hand's notes move to the other stave but stay in the same voice:

```msq-editor opens-with=text
measure
stave with treble clef
1/4 c5 b
stave with bass clef
1/4 c3 e3
1/4 g3 on previous stave
1/4 c3
```

You can write:

- `on next stave`;
- `on previous stave` or `on prev stave`;
- `on current stave` or `on cur stave`, for the stave where you write the unit.

`in` and `at` work instead of `on`, and `staff` instead of `stave`.

A single note inside a chord can move as well:

```msq-editor opens-with=text
measure
stave with treble clef
stave with treble clef
chord
a, b on next stave, c5 on prev stave
stave with treble clef
```

If you move notes to a stave that doesn't exist, they are drawn on the stave where you wrote them:

```msq-editor opens-with=text
measure
treble clef
chord
a, b on next stave, c5 on prev stave
```

To move a whole chord to the next or the previous stave, write the position right after `chord`:

```msq-editor opens-with=text
measure
stave with treble clef
chord on next stave
c d e
chord
f g a
chord
b c5 d5
stave with bass clef
```

As you can see above, when you move a whole chord, the next chords in the same voice are drawn on that stave too, until an empty line. To stop that, say that a chord must be drawn on the current stave:

```msq-editor opens-with=text
measure
stave with treble clef
chord on next stave
c d e
chord on current stave
f g a
chord
b c5 d5
stave with bass clef
```

A single note (not in a chord) moves alone. It doesn't affect the units after it, like `g3` in the first example on this page.

Keep in mind that a moved note or chord still belongs to the stave and the voice where you wrote it. It's only drawn somewhere else. Below, the chords of the second voice are written on the first stave, and they stay a part of it, while some of their notes are drawn on the next stave:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/2 chord
g a b
chord
c5 d5 e5
voice
1/4 chord
c, d on next stave, e on next stave
chord
c d e on next stave
chord
c, d on next stave, e on next stave
chord
c d e on next stave
stave with treble clef
```

It also means that a moved unit is still counted in its own stave and voice, for example when a [slur](/docs/language/slurs) points to it by its position.

Beamed units can cross between staves too. The beam then goes across both staves, and the stems reach between them:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2
stave with treble clef
1/8 c5 beamed, g, e, c on next stave, g3 on next stave, e3 on next stave,
c3 on next stave, g3 on next stave not beamed
stave with bass clef
```

As you may notice, each single note needs its own `on next stave`, because it doesn't carry over to the next unit.

Cross-stave chords that collide are moved apart:

```msq-editor opens-with=text
measure
stave with treble clef
chord
c d on next stave, e on next stave
chord
c e on next stave, f on next stave
stave with treble clef
chord with stem down
c d e
chord
c e f
```

And notes drawn on the next or the previous stave follow the clef of that stave:

```msq-editor opens-with=text
measure
stave with treble clef
chord
c d on next stave, e on next stave
chord
c e on next stave, f on next stave
stave with bass clef
chord with stem down
c d e
chord
c e f
```

Read next: [Similes](/docs/language/similes)

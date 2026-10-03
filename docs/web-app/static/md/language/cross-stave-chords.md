# Cross-stave chords

A note or a chord can be drawn on the next or the previous stave from the stave where it's declared. It's how piano music often moves a hand's notes to the other stave without changing the voice they belong to:

```msq-editor opens-with=text
measure
stave with treble clef
1/4 c5 b
stave with bass clef
1/4 c3 e3
1/4 g3 on previous stave
1/4 c3
```

You can write `on next stave`, `on previous stave` or `on prev stave`, and `on current stave` or `on cur stave` for the stave where the unit is declared. `in` and `at` work instead of `on`, and `staff` instead of `stave`.

A single note inside a chord can move as well:

```msq-editor opens-with=text
measure
stave with treble clef
stave with treble clef
chord
a, b on next stave, c5 on prev stave
stave with treble clef
```

If you position notes of a cross-stave chord on staves that are missing, they are drawn on the stave where they are declared:

```msq-editor opens-with=text
measure
treble clef
chord
a, b on next stave, c5 on prev stave
```

You can move a whole chord to the next or the previous stave, by typing the position right after the `chord` key word:

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

As you can see above, when you move a whole chord, all the following chords in the same voice are drawn on that stave as well, until an empty line. You can override this behaviour by saying that a chord must be drawn on the current stave:

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

A single note that is a unit of its own moves alone, it does not affect the units after it, like `g3` in the first example on this page.

You should keep in mind that although a note or a chord can be drawn on a different stave, in terms of the page structure it still belongs to the stave and the voice where it's declared. Below, the chords of the second voice are declared on the first stave, and they stay a part of it while some of their notes are drawn on the next stave:

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

It also means that a moved unit is still counted among the units of its own stave and voice, for example when a [slur](/docs/language/slurs) names it by its position.

Beamed units can cross between staves too. The beam then spans both staves, and the stems reach between them:

```msq-editor opens-with=text
measure
brace from stave 1 to stave 2
stave with treble clef
1/8 c5 beamed, g, e, c on next stave, g3 on next stave, e3 on next stave,
c3 on next stave, g3 on next stave not beamed
stave with bass clef
```

As you may notice, a single note needs its own `on next stave` each time, because its position does not carry over to the next unit.

You can expect that colliding cross-stave chords are visually separated:

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

And you can expect that the notes drawn on the next or the previous stave take into account the clef of that stave:

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

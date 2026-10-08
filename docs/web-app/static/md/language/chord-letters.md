# Chord Letters

Chord letters (chord symbols) show the harmony above the music, like in lead sheets and guitar parts. You add a chord letter to a unit with `with chord` and the symbol in quotes:

```msq-editor opens-with=text
1/4 c with chord "C"
e with chord "Am"
g with chord "F"
c5 with chord "G7"
```

## 1. Any Unit, in Any Voice and on Any Stave

You can add a chord letter to any unit, in any voice and on any stave. So you choose exactly where in time it is:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/2 a a
voice
1/8 c with chord "C", c, c, c
1/8 c, c, c with chord "F", c
stave with bass clef
voice
1/8 a3, a3, a3, a3
1/8 a3 with chord "A", a3, a3, a3
```

As you can see, no matter where you declare chord letters, they are drawn above the whole measure, over their units. This is different from other marks on units. A chord letter belongs to the whole measure, not to the stave of its unit, because it shows the harmony of all the staves at once.

A chord can carry a chord letter too, on its `chord` line:

```msq-editor opens-with=text
chord with chord "C"
c e g

chord with chord "G7"
b3 d f g

```

## 2. Below the Measure

If you want a chord letter below the measure, you just write it:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/2 a a
voice
1/8 c with chord "C" below measure, c, c, c
1/8 c, c, c with chord "F", c
stave with bass clef
voice
1/8 a3, a3, a3, a3
1/8 a3 with chord "A", a3, a3, a3
```

As you may notice, you write `below measure` only once. All the following chord letters stay below, until you write `above measure`.

The word `measure` is optional. `over` and `under` mean the same as `above` and `below`. You can also use `up` and `down`:

```msq-editor opens-with=text
1/4 c with chord "C" under
d with chord "Dm"
e with chord "Em" above measure
f with chord "F" down
g with chord "G" up
```

## 3. Vertical Position

The vertical position of chord letters is set automatically, but you can correct it:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/2 a a
voice
1/8 c with chord "C" 1 up, c, c, c
1/8 c, c, c with chord "F" 2 up, c
stave with bass clef
1/2 a3 a3
```

`1 up` moves the chord letter up by one interval between stave lines.

## 4. Superscripts

Let's see how you can write a superscript in a chord letter:

```msq-editor opens-with=text
1/4 c with chord "C^9"
e with chord "C^7"
g with chord "G^13"
c5 with chord "D^add9"
```

Everything after `^` is a superscript. A slash `/` ends it. After the slash you write the bass note of a slash chord, and it can have its own superscript:

```msq-editor opens-with=text
1/4 c with chord "C/G"
e with chord "A^flat/C"
g with chord "C/F^sharp"
c5 with chord "G^7/B"
```

You have to remember the following rules:

1. There is at most one `/` in a chord letter.
2. There is at most one `^` on each side of the `/`.

If a chord letter breaks one of them, it's not recognised, and you get an error.

## 5. Symbols

As you may notice, the `flat` key word becomes the flat symbol. These are all the symbols supported at the moment, and their key words:

| Symbol | Key words |
|---|---|
| ♯ | `sharp`, `#` |
| ♭ | `flat` |
| o | `diminished`, `dim` |
| ø | `half-diminished`, `half-dim`, `half dim`, `halfdim`, `hf dim`, `hfdim` |
| Δ | `major sign`, `major`, `maj` |

It's important to mention that these key words are replaced anywhere in the quotes, in any letter case. So `"Cmaj7"` is drawn as **CΔ7**. At the moment, you can't write the letters `maj` or `dim` as they are.

Let's take a look at some chord letters with these symbols:

```msq-editor opens-with=text
1/4 c with chord "C^halfdim13"
e with chord "Cmaj13"
g with chord "C13sharp5"
c5 with chord "C#m/G^sharp"
measure
1/4 d with chord "Bflat^major sign"
f with chord "Bdim"
a with chord "Dm7" 1 up
c5 with chord "G7" below measure
```

**Side note:** chord letters have their own font, which you can change. More about that you can read in [Fonts](/docs/language/fonts).

Read next: [Lyrics](/docs/language/lyrics)

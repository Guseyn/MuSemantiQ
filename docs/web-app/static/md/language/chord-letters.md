# Chord letters

Chord letters (chord symbols) name the harmony above the music, the way lead sheets and guitar parts do. You can attach a chord letter to any unit with `with chord` and the symbol in quotes:

```msq-editor opens-with=text
1/4 c with chord "C"
e with chord "Am"
g with chord "F"
c5 with chord "G7"
```

## 1. Any unit, in any voice and on any stave

A chord letter can be attached to any unit, in any voice and on any stave, so you can choose exactly where in time it lands:

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

As you can see, no matter where you declare chord letters, they are positioned above the whole measure, over the units where you declared them. That is the difference from other marks on units: a chord letter belongs to the measure as a whole, not to the stave of its unit, because it names the harmony of all the staves at once.

A chord can carry a chord letter too, on its `chord` line:

```msq-editor opens-with=text
chord with chord "C"
c e g

chord with chord "G7"
b3 d f g

```

## 2. Below the measure

If you want a chord letter to be positioned below the measure, you just say so in the text:

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

As you may notice, you need to type `below measure` only once, and all the following chord letters keep the same direction, until you change it with `above measure`.

The word `measure` is optional, and `over` and `under` mean the same as `above` and `below`. You can also use `up` and `down`:

```msq-editor opens-with=text
1/4 c with chord "C" under
d with chord "Dm"
e with chord "Em" above measure
f with chord "F" down
g with chord "G" up
```

## 3. Vertical position

The vertical position of chord letters is adjusted automatically, but you can correct it:

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

`1 up` means that the chord letter moves one interval between stave lines up.

## 4. Superscripts

Let's see how you can write a superscript in a chord letter:

```msq-editor opens-with=text
1/4 c with chord "C^9"
e with chord "C^7"
g with chord "G^13"
c5 with chord "D^add9"
```

It's quite simple: everything after the `^` character is displayed as a superscript. A slash `/` ends the superscript, and after it you write the bass note of a slash chord, which can have its own superscript:

```msq-editor opens-with=text
1/4 c with chord "C/G"
e with chord "A^flat/C"
g with chord "C/F^sharp"
c5 with chord "G^7/B"
```

You have to remember the following rules:

1. There is at most one `/` in a chord letter.
2. There is at most one `^` on each side of the `/`.

A chord letter that breaks one of them is not recognised, and the command is reported as an error.

## 5. Symbols

As you may notice, the `flat` key word turns into the flat symbol. These are all the symbols supported at the moment, and the key words that write them:

| Symbol | Key words |
|---|---|
| ♯ | `sharp`, `#` |
| ♭ | `flat` |
| o | `diminished`, `dim` |
| ø | `half-diminished`, `half-dim`, `half dim`, `halfdim`, `hf dim`, `hfdim` |
| Δ | `major sign`, `major`, `maj` |

It's important to mention that these key words are replaced wherever they appear in the quotes, in any letter case, so `"Cmaj7"` is drawn as **CΔ7**. There is no way at the moment to write the letters `maj` or `dim` as they are.

Let's take a look at some chord letters with the symbols above:

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

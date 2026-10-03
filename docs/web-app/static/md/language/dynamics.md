# Dynamics

A dynamic mark is an attribute of a unit. You write it with `with dynamic`, and the letters go in quotes.

Let's start with a simple example:

```msq-editor opens-with=text
1/4 c with dynamic "p"
d
e with dynamic "mf"
f
g with dynamic "ff" below stave
```

It's important to mention that the quotes are required: `with dynamic p` is not recognised. Either double or single quotes will do.

## 1. Supported letters

The music font has a drawn glyph for each of these values, so they look the way dynamics look in engraved music:

| | |
| --- | --- |
| soft | **pppppp**, **ppppp**, **pppp**, **ppp**, **pp**, **p**, **mp** |
| loud | **mf**, **f**, **ff**, **fff**, **ffff**, **fffff**, **ffffff** |
| accents | **fp**, **fz**, **sf**, **sfp**, **sfpp**, **sfz**, **sfzp**, **sffz**, **rf**, **rfz**, **pf** |
| single letters | **p**, **m**, **f**, **r**, **s**, **z** |

```msq-editor opens-with=text
1/4 a with dynamic "ppp"
a with dynamic "pp"
a with dynamic "p"
a with dynamic "mp"
a with dynamic "mf"
a with dynamic "f"
a with dynamic "ff"
a with dynamic "fff"
a with dynamic "fp"
a with dynamic "sf"
a with dynamic "sfz"
a with dynamic "rfz"
```

Anything else in the quotes is still drawn, just as plain text in the dynamics font rather than as a glyph:

```msq-editor opens-with=text
1/2 a with dynamic "poco f"
a
1/4 a a a a
```

## 2. Direction

By default, a dynamic mark is above the stave. But you can easily change that with `up` and `down`:

```msq-editor opens-with=text
a with dynamic "p" up
a with dynamic "mp" down
a with dynamic "mf" up
a with dynamic "f" down
```

You can use different phrasing to set a direction — `above` and `below`, `over` and `under`, or `is down`:

```msq-editor opens-with=text
a with dynamic "p" above
a with dynamic "mp" below
a with dynamic "mf" over
a with dynamic "f" under
a with dynamic "ff" is down
```

A dynamic mark is always outside the stave, whichever way you choose. So `above stave` and `below stave` do not change anything here, but you can use them to emphasise it:

```msq-editor opens-with=text
a with dynamic "p" above stave
a with dynamic "mp" below stave
a with dynamic "mf" above stave
a with dynamic "f" below stave
```

## 3. Vertical correction

The vertical position of a dynamic mark is always adjusted, so it does not intersect other elements. But you can still correct it: `1 up` moves it one interval between stave lines up, and `1 down` moves it one interval down:

```msq-editor opens-with=text
a with dynamic "p" above stave 1 up
a with dynamic "mp" below stave 1 down
a with dynamic "mf" above stave 1 up
a with dynamic "f" below stave 1 down
```

## 4. Chords

A chord takes a dynamic mark on its `chord` line:

```msq-editor opens-with=text
1/2 chord with dynamic "p"
c e g

chord with dynamic "f" below
c e g c5

```

## 5. Dynamics in playback

A dynamic mark sets how loud the music is played, from its unit onwards, until the next dynamic mark:

```msq-editor opens-with=text
1/4 c with dynamic "pp"
d e f
g with dynamic "ff"
a b c5
```

These are the MIDI velocities each value is played with, out of **127**. A unit before any dynamic mark is played at **100**:

| Value | Velocity | Value | Velocity | Value | Velocity |
| --- | --- | --- | --- | --- | --- |
| **pppppp** | 20 | **mf** | 70 | **fp** | 55 |
| **ppppp** | 25 | **pf** | 75 | **fz** | 65 |
| **pppp** | 30 | **f** | 80 | **sf** | 85 |
| **ppp** | 35 | **ff** | 90 | **sfp** | 95 |
| **pp** | 45 | **fff** | 110 | **sfpp** | 105 |
| **p** | 50 | **ffff** | 115 | **sfz** | 112 |
| **mp** | 55 | **fffff** | 120 | **sfzp** | 117 |
| **m** | 60 | **ffffff** | 125 | **sffz** | 122 |
| **r** | 100 | **rf** | 47 | **rfz** | 57 |
| **s** | 120 | **z** | 127 | | |

A gradual change of dynamics — a hairpin — is not an attribute of one unit but a span across several, so it has its own page: [Crescendo and diminuendo](/docs/language/crescendo-and-diminuendo).

Read next: [Text labels](/docs/language/text-labels)

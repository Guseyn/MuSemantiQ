# Accidentals

A note can have an accidental. In MSQ it's called a key. The simplest way to add one is to write its name right after the note:

```msq-editor opens-with=text
c sharp
d flat
e natural
f double sharp
g double flat
```

## 1. All the Keys

Besides the usual five, there are four quarter-tone keys. Here are all the keys supported at the moment:

```msq-editor opens-with=text
a sharp
a flat
a natural
a double sharp
a double flat
a demisharp
a sesquisharp
a demiflat
a sesquiflat
```

- **demisharp** raises a note by a quarter tone.
- **sesquisharp** raises it by three quarter tones.
- **demiflat** lowers it by a quarter tone.
- **sesquiflat** lowers it by three quarter tones.

The key goes after the note with its octave. The duration, as usual, goes before:

```msq-editor opens-with=text
1/2 c5 sharp
1/4 b4 flat
a4 natural
```

## 2. The Long Form and Its Aliases

Another way to write a key is `with ... key`:

```msq-editor opens-with=text
c with sharp key
d with flat key
e with natural key
f with double sharp key
g with double flat key
```

It's longer, but in this form you can use short aliases of the key names:

| Key name | Aliases |
| --- | --- |
| **sharp** | `#`, `sh` |
| **flat** | `fl` |
| **natural** | `n` |
| **double sharp** | `2#`, `2 sharp`, `double #`, `double sh` |
| **double flat** | `2fl`, `2 flat`, `double fl` |
| **demisharp** | `1/2#`, `1/2 sh`, `1/2 sharp`, `dm#`, `demi#`, `dmsh`, `demi sharp` |
| **sesquisharp** | `3/2#`, `3/2 sh`, `3/2 sharp`, `sqsh`, `sesqui sharp` |
| **demiflat** | `1/2fl`, `1/2 flat`, `dmfl`, `demi flat` |
| **sesquiflat** | `3/2fl`, `3/2 flat`, `sqfl`, `sesqui flat` |

So you can write the keys shorter:

```msq-editor opens-with=text
c with # key
d with fl key
e with n key
f with 2# key
g with 2fl key
a with 1/2# key
b with 3/2 sharp key
```

You cannot use aliases right after the note, mostly for the sake of better readability. `c #` or `c sh` is not recognised. An alias always needs `with` and `key` around it.

## 3. Cautionary Keys

To make a key cautionary, add `with parentheses` after it. `with brackets` means the same:

```msq-editor opens-with=text
c sharp with parentheses
d with flat key with parentheses
e natural with brackets
```

## 4. More Than One Key

If you write several keys for one note, all of them are drawn:

```msq-editor opens-with=text
a flat sharp natural
c5 with fl key with # key
```

MSQ draws what you wrote and doesn't guess which key you meant, because it's very important to let a user see mistakes visually.

## 5. How Long a Key Lasts

A key is drawn only where you write it. But when the page is played, it works like in normal sheet music: the key applies to every next note with the same name and octave, until the end of the measure. So the second `f` below also sounds as F sharp:

```msq-editor opens-with=text
f sharp g f e
```

In a chord, a key goes after its own note. You will see it in [Chords](/docs/language/chords).

Read next: [Comments](/docs/language/comments)

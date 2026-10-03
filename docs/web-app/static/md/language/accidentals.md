# Accidentals

Each note can have an accidental, which MSQ calls a key. The simplest way to add one is to write its name right after the note:

```msq-editor opens-with=text
c sharp
d flat
e natural
f double sharp
g double flat
```

## 1. All the keys

Besides the usual five, MSQ supports four quarter-tone keys. In the example below you can see all the keys supported at the moment:

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

A **demisharp** raises a note by a quarter tone, a **sesquisharp** by three quarter tones, and a **demiflat** and a **sesquiflat** lower it by the same amounts.

The key goes after the octave and the duration, as they belong to the note name:

```msq-editor opens-with=text
1/2 c5 sharp
1/4 b4 flat
a4 natural
```

## 2. The long form and its aliases

Another way to write a key is `with ... key`:

```msq-editor opens-with=text
c with sharp key
d with flat key
e with natural key
f with double sharp key
g with double flat key
```

It's longer, but in this form you can use shorter aliases of the key names. In the table below you can see all of them:

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

So you can write the keys in a compact way:

```msq-editor opens-with=text
c with # key
d with fl key
e with n key
f with 2# key
g with 2fl key
a with 1/2# key
b with 3/2 sharp key
```

You cannot use aliases right after the note, mostly for the sake of better readability. `c #` or `c sh` is not recognised: an alias always needs `with` and `key` around it.

## 3. Cautionary keys

To make a key cautionary, you just need to add `with parentheses` after it. `with brackets` means the same:

```msq-editor opens-with=text
c sharp with parentheses
d with flat key with parentheses
e natural with brackets
```

## 4. More than one key

If you specify multiple keys for a note, they all will be rendered:

```msq-editor opens-with=text
a flat sharp natural
c5 with fl key with # key
```

It's very important to let a user see errors or inaccuracies visually, so MSQ draws what you wrote rather than guessing which key you meant.

## 5. How long a key lasts

A key is drawn only where you write it. When the page is played, though, it works as in written music: a key keeps its effect on every following note with the same name and the same octave number until the end of the measure. So the second `f` below sounds as F sharp too:

```msq-editor opens-with=text
f sharp g f e
```

In a chord, a key follows its own note in the note list. You will see it in [Chords](/docs/language/chords).

Read next: [Comments](/docs/language/comments)

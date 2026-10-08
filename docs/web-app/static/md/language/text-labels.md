# Text Labels

A text label is a short text on a unit: a fingering, a string number, a word. It's useful for fingerpicking, or for anything else you want next to a note.

Let's start with a simple example:

```msq-editor opens-with=text
1/4 c with text "1"
d with text "2"
e with text "3"
f with text "sim." above stave
```

As you can see, by default a text label is placed on the left of the note, where an accidental would be.

## 1. The Key Word

The text goes in quotes, double or single. You can omit the `text` key word:

```msq-editor opens-with=text
1/4 a with text "1"
a with "2"
a with text '3'
a with '4'
```

## 2. Above, Below and Beside

A text label can be above a unit, below it, or beside it:

```msq-editor opens-with=text
1/4 a with text "1" above
a with text "1" below
a with text "1" beside
```

`up` and `down`, and `over` and `under`, mean the same as `above` and `below`:

```msq-editor opens-with=text
1/4 a with text "1" up
a with text "1" down
a with text "1" over
a with text "1" under
a with text "1" is down
```

## 3. Chords

For a chord, the text label goes on the `chord` line, above or below the chord. By default, it's above:

```msq-editor opens-with=text
chord with text "1"
c e g

chord with text "1" up
c e g

chord with text "1" down
c e g

```

Or you can give each note in a chord its own label, the same way as for a single note:

```msq-editor opens-with=text
chord
c with text "3" down
e with text "2" beside
g with text "1" up

chord
c with text "3" beside
e with text "2" beside
g with text "1" beside

```

`beside` works only for notes. A whole chord can't have a label beside it, because it doesn't have one note head to stand next to.

## 4. Above or Below the Stave

If you want a text label above or below the stave, not next to the unit, add `stave`:

```msq-editor opens-with=text
1/4 a with "a" below
a with text "a" below stave

a with stem down, with "a" above
a with text "a" above stave
```

You can also write `staff` instead of `stave`: `with text "a" under staff`.

## 5. Vertical Correction

A text label above or below a unit is always placed for you. But you can still move it yourself: `1 up` moves it up by one interval between stave lines, and `1 down` moves it down by one:

```msq-editor opens-with=text
1/4 a with text "1" above 1 up
a with text "1" below 1 down
a with text "1" above stave 2 up
a with text "1" below stave 2 down
```

It's important to mention that a label `beside` a note can't be moved, because it is placed exactly like an accidental.

**Side note:** a text label belongs to one unit only. Sung words are different: they are lined up with each other across the whole page line, so they have their own command. More about that you can read in [Lyrics](/docs/language/lyrics).

Read next: [Grace units](/docs/language/grace-units)

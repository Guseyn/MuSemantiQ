# Parentheses

Notes and chords can have parentheses. Usually they mean that a note is optional, or that it's there only as a reminder. It's up to you what exactly they mean.

Let's start with how you can add parentheses to a note:

```msq-editor opens-with=text
1/4 c with parentheses
d
e with parentheses
f
```

Instead of `parentheses` you can use `brackets`:

```msq-editor opens-with=text
1/4 c with brackets
d
e with brackets
f
```

## 1. Parentheses Around a Chord

`with parentheses` on the `chord` line puts parentheses around the whole chord:

```msq-editor opens-with=text
chord with parentheses
c e g

```

This is how you put parentheses around only some notes of a chord:

```msq-editor opens-with=text
chord with parentheses from note 1 to note 2
c e g b

```

Notes are counted from the top of the chord, so **note 1** is the highest note.

Numbers from 1 to 10 can also be written as words, and any number can have its postfix. So `note 2`, `2nd note`, `second note` and `the second note` all mean the same:

```msq-editor opens-with=text
chord with parentheses from second note to third note
c e g b

```

One chord can have several parentheses. It's easier to read if each of them goes on its own line under the `chord` line:

```msq-editor opens-with=text
chord
with parentheses from note 1 to note 3
with parentheses from note 6 to note 7
c e g b d5 f5 a5

```

## 2. Parentheses Around One Note of a Chord

You can also add parentheses to one note in a chord, right where you write that note:

```msq-editor opens-with=text
chord
c, e, g with parentheses, b

```

## 3. Parentheses Around an Accidental

As you remember from [Accidentals](/docs/language/accidentals), an accidental has its own parentheses. It's important to mention that they are not the same as the parentheses of a note. `with parentheses` right after an accidental belongs to the accidental.

```msq-editor opens-with=text
1/4 f sharp with parentheses
g
a with flat key with parentheses
b
```

To put parentheses around a note with an accidental, you write them separately. Commas are optional, but they make it easier to see where each command ends:

```msq-editor opens-with=text
chord
c, e with flat key with parentheses, with parentheses, g

```

You can write parentheses for the note and for its accidental in any order:

```msq-editor opens-with=text
chord
c, e with parentheses, with flat key with parentheses, g

```

Read next: [Breath marks](/docs/language/breath-marks)

# Mid-measure clefs

A mid-measure clef is essentially a clef before a unit. It is drawn smaller than the clef at the start of a stave, right in front of the unit that carries it.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
e3 with bass clef before
f3
```

All you need is to write `with <clef> clef before` after the unit. Every clef from [Clefs](/docs/language/clefs) can be used here, with the same names and the same short forms:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
e3 with f clef before
f3
g with g clef before
a
```

It's usually done when a line runs so low or so high that it would otherwise need a lot of ledger lines. Changing the clef for a few units makes such a passage much easier to read:

```msq-editor opens-with=text
measure
treble clef
1/4 g5 e5 c5
a3 with bass clef before

measure
f3 d3
b3 with treble clef before
d5
```

## 1. What a mid-measure clef changes

A mid-measure clef does not apply only to the unit that carries it. It changes how everything after it on the same stave is read, until the next clef. As you can see, the notes in the following measure are still read in bass clef:

```msq-editor opens-with=text
measure
treble clef
1/4 g5 e5 c5
a3 with bass clef before

measure
f3 d3 b2 g2
```

It also affects all the following page lines:

```msq-editor opens-with=text
measure
treble clef
key signature is d major for each line
1/4 g5 e5 c5
a3 with bass clef before

new line
f3 d3 b2 g2
```

It's important to mention that a clef belongs to a stave, not to a voice. So when a stave has several voices, the other voices on that stave are read in the new clef as well.

Units in other voices and on other staves adjust their horizontal position when a mid-measure clef is added, so that the synchronization of units does not get ruined:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/4 a
a with bass clef before
a
voice
1/4 c
c
c
stave with bass clef
voice
1/4 a3
a3
a3
voice
1/4 c3
c3
c3
```

## 2. Mid-measure clefs on chords

A chord takes a mid-measure clef in the same way, on its `chord` line:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
chord with bass clef before
c3 e3 g3

f3
```

## 3. Changing clef and key signature at once

You can change the clef and the key signature before the same unit with one command, `with <clef> clef and key signature <key signature> before`:

```msq-editor opens-with=text
measure
key signature is g major
treble clef
1/4 g a
d3 with bass clef and key signature f major before
c3
```

The words `and key signature` can be left out, so `with bass clef f major before` means the same thing:

```msq-editor opens-with=text
measure
treble clef
1/4 g a
d3 with bass clef f major before
c3
```

The key signature part of this command is a mid-measure key signature, and it follows the same rules. More about that you can read on the next page.

Read next: [Mid-measure key signatures](/docs/language/mid-measure-key-signatures)

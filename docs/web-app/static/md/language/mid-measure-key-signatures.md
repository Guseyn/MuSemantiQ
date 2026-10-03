# Mid-measure key signatures

A mid-measure key signature is essentially a key signature before a unit. It lets you change key part way through a measure, right in front of the unit where the new key starts.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
e with key signature g major before
f
```

All you need is to write `with key signature <key signature> before` after the unit. The names are the same as in [Key signatures](/docs/language/key-signatures), and a minor name works as well as a major one:

```msq-editor opens-with=text
measure
key signature is f sharp major
treble clef
1/4 f g
a with key signature e minor before
b
```

The words `key signature` can be left out, so `with g major before` means the same thing:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
e with g major before
f
```

As you may notice, a mid-measure key signature is always drawn together with a small clef in front of it. If you don't specify a mid-measure clef, it's the clef that the stave already has. If you never declared a clef for the stave, it's treble.

A chord takes a mid-measure key signature on its `chord` line:

```msq-editor opens-with=text
measure
treble clef
1/4 c d
chord with key signature e minor before
e g b

f
```

## 1. What a mid-measure key signature changes

A key signature applies to all staves, so a mid-measure key signature is drawn on every stave of the measure, even though you write it on one unit only:

```msq-editor opens-with=text
measure
stave with treble clef
1/4 c d
e with key signature a major before
f
stave with bass clef
1/4 c3 d3 e3 f3
```

Units in other voices and on other staves adjust their horizontal position when a mid-measure key signature is added, so that the synchronization of units does not get ruined.

It's important to mention how it works with [accidentals](/docs/language/accidentals). An accidental lasts until the end of its measure, but only until the mid-measure key signature: from that point on, the new key decides. In the example below the first two notes are **F sharp**, and the last one is **F natural**, because the key of **C major** came after the sharp:

```msq-editor opens-with=text
measure
treble clef
1/4 f sharp
f
g with key signature c major before
f
```

When you declared the key signature `for each line` or `for lines below`, a mid-measure key signature replaces it for all the following page lines:

```msq-editor opens-with=text
measure
key signature is f sharp major for each line
treble clef
1/4 f g
a with key signature g major before
b

new line
c5 d5 e5 f5
```

## 2. Changing clef and key signature at once

As you remember from [Mid-measure clefs](/docs/language/mid-measure-clefs), you can change the clef and the key signature with one command. You can also write them as two commands on the same unit, separated by a comma:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/4 a
a with bass clef before, with key signature g major before
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

## 3. When to use it

A mid-measure key signature is for the case when the key really changes in the middle of a measure. When the new key starts with a measure, it's better to declare it on that measure with `key signature is …`, as described in [Key signatures](/docs/language/key-signatures): then it's drawn after the barline, where a reader expects it.

Read next: [Centralized units](/docs/language/centralized-units)

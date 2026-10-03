# Key signatures

A key signature is the set of sharps or flats drawn after the clef. In MSQ it belongs to a measure, and you declare it with `key signature is` followed by the name of the key.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
key signature is e flat major
e f g a
```

The word `is` is optional, so `key signature e flat major` works just as well:

```msq-editor opens-with=text
measure
treble clef
key signature e flat major
e f g a
```

## 1. Names of keys

Every key can be named by its major or by its relative minor, and both give the same key signature. Names are written in lower case, with the words `sharp` and `flat`:

| Major | Minor | Key signature |
| --- | --- | --- |
| `c major` | `a minor` | no sharps or flats |
| `g major` | `e minor` | **1** sharp |
| `d major` | `b minor` | **2** sharps |
| `a major` | `f sharp minor` | **3** sharps |
| `e major` | `c sharp minor` | **4** sharps |
| `b major` | `g sharp minor` | **5** sharps |
| `f sharp major` | `d sharp minor` | **6** sharps |
| `c sharp major` | `a sharp minor` | **7** sharps |
| `f major` | `d minor` | **1** flat |
| `b flat major` | `g minor` | **2** flats |
| `e flat major` | `c minor` | **3** flats |
| `a flat major` | `f minor` | **4** flats |
| `d flat major` | `b flat minor` | **5** flats |
| `g flat major` | `e flat minor` | **6** flats |
| `c flat major` | `a flat minor` | **7** flats |

Here is the sharp side, one measure per key:

```msq-editor opens-with=text
measure
treble clef
key signature is g major
g a b

measure
key signature is d major
d e f

measure
key signature is a major
a b c5

measure
key signature is e major
e f g
```

And the same keys named by their minors:

```msq-editor opens-with=text
measure
treble clef
key signature is e minor
e f g

measure
key signature is b minor
b c5 d5

measure
key signature is f sharp minor
f g a

measure
key signature is c sharp minor
c d e
```

And the flat side:

```msq-editor opens-with=text
measure
treble clef
key signature is f major
f g a

measure
key signature is b flat major
b c5 d5

measure
key signature is a flat major
a b c5

measure
key signature is d flat major
d e f
```

## 2. It belongs to the measure

A key signature is drawn at the start of the measure where you declare it, and the clef is drawn again in front of it, even if the clef was declared in an earlier measure:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

measure
key signature is d major
1/4 d e f g
```

It is not drawn again in the next measures, but it keeps affecting how the notes sound until the next key signature. Since it belongs to the measure, a measure has only one key signature: if you write a second one without `measure` in between, a new measure is created for it:

```msq-editor opens-with=text
measure
treble clef
key signature is g major
1/4 g a b c5
key signature is b flat major
1/4 b c5 d5 e5
```

A key signature applies to every stave of its measure. You will see that on the [Staves](/docs/language/staves) page.

## 3. Cancelling a key

When the music moves from a key with sharps or flats back to a key without them, the old sharps or flats are cancelled with naturals. You write it as a transition, `X to c major` (or `X to a minor`):

```msq-editor opens-with=text
measure
treble clef
key signature is e flat major
e f g

measure
key signature is e flat major to c major
c d e

measure
key signature is a major
a b c5

measure
key signature is a major to a minor
f g a
```

It's important to mention that a transition can only lead to **c major** or **a minor**, because that is the one case where the old signs have to be cancelled with naturals. To go from one key with sharps or flats to another, you simply declare the new key:

```msq-editor opens-with=text
measure
treble clef
key signature is d major
d e f

measure
key signature is b flat major
b c5 d5
```

## 4. For each line

A printed score restates the key signature at the start of every line. In MSQ you ask for it with `for each line`:

```msq-editor opens-with=text
measure
treble clef
key signature is d major for each line
1/4 d e f g

measure
1/4 a b c5 d5
```

Without it a key signature is drawn only in its own measure, and a new line of music would start without it. That is why a key signature usually wants `for each line`.

You can also write `for lines below`. It works exactly the same, but it reads better when the key signature changes in the middle of a page, because it says the key holds for the lines that follow rather than for all of them:

```msq-editor opens-with=text
measure
treble clef
key signature is d sharp minor for lines below
1/4 d e f g

measure
key signature is d minor for lines below
1/4 d e f g
```

A new key signature always replaces the one that was restated. If you declare it without `for each line` or `for lines below`, the restating stops, and the lines after it start without a key signature.

How lines of music are started, and what `for each line` does on them, you can see on the [Page lines](/docs/language/page-lines) page.

Read next: [Time signatures](/docs/language/time-signatures)

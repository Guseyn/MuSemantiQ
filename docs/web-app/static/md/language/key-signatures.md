# Key Signatures

A key signature is the sharps or flats drawn after the clef. In MSQ it belongs to a measure. You declare it with `key signature is` and the name of the key.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
key signature is e flat major
e f g a
```

The word `is` is optional, so `key signature e flat major` works too:

```msq-editor opens-with=text
measure
treble clef
key signature e flat major
e f g a
```

## 1. Names of Keys

You can name a key by its major or by its relative minor. Both give the same key signature. Names are written in lower case, with the words `sharp` and `flat`:

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

Here are the keys with sharps, one measure for each key:

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

The same keys, named by their minors:

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

And the keys with flats:

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

## 2. It Belongs to the Measure

A key signature is drawn at the start of the measure where you declare it. The clef is drawn again before it, even if you declared the clef in an earlier measure:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

measure
key signature is d major
1/4 d e f g
```

It's not drawn again in the next measures, but it still changes how the notes sound until the next key signature. A measure can have only one key signature. If you write a second one without `measure` before it, a new measure is created for it:

```msq-editor opens-with=text
measure
treble clef
key signature is g major
1/4 g a b c5
key signature is b flat major
1/4 b c5 d5 e5
```

A key signature works for every stave in its measure. You will see that on the [Staves](/docs/language/staves) page.

## 3. Cancelling a Key

When the music goes from a key with sharps or flats to a key without them, the old sharps or flats are cancelled with naturals. You write it as `X to c major` or `X to a minor`:

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

It's important to mention that you can only go to **c major** or **a minor** this way, because only then the old signs have to be cancelled with naturals. To go from one key with sharps or flats to another, you simply declare the new key:

```msq-editor opens-with=text
measure
treble clef
key signature is d major
d e f

measure
key signature is b flat major
b c5 d5
```

## 4. For Each Line

In a printed score, the key signature is drawn again at the start of every line. In MSQ you get that with `for each line`:

```msq-editor opens-with=text
measure
treble clef
key signature is d major for each line
1/4 d e f g

measure
1/4 a b c5 d5
```

Without it, a key signature is drawn only in its own measure, and a new line starts without it. That's why you usually want `for each line`.

You can also write `for lines below`. It works the same, but it reads better when the key signature changes in the middle of a page, because the key works only for the next lines, not for all of them:

```msq-editor opens-with=text
measure
treble clef
key signature is d sharp minor for lines below
1/4 d e f g

measure
key signature is d minor for lines below
1/4 d e f g
```

A new key signature always replaces the old one. If you declare it without `for each line` or `for lines below`, the next lines start without a key signature.

How to start a new line, and what `for each line` does there, you can see on the [Page lines](/docs/language/page-lines) page.

Read next: [Time signatures](/docs/language/time-signatures)

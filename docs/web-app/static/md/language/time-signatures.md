# Time signatures

A time signature says how many beats a measure holds. Like a key signature, it belongs to a measure, and you declare it with `time signature is` followed by its value.

Let's start with a simple example:

```msq-editor opens-with=text
measure
treble clef
time signature is 3:4
1/4 c d e

measure
time signature is c
1/4 f g a b
```

## 1. Values

The usual way to write a time signature is two numbers separated by a colon, `is 3:4`. Any two positive numbers work:

```msq-editor opens-with=text
measure
treble clef
time signature is 2:4
1/4 c d

measure
time signature is 6:8
1/8 c d e f g a

measure
time signature is 5:4
1/4 c d e f g

measure
time signature is 12:8
1/8 c d e f g a b c5 d5 e5 f5 g5
```

There are also two symbols: `c` for common time (**4:4**) and `crossed c` for cut time (**2:2**):

```msq-editor opens-with=text
measure
treble clef
time signature is c
1/4 c d e f

measure
time signature is crossed c
1/2 g c5
```

The word `is` is optional here as well:

```msq-editor opens-with=text
measure
treble clef
time signature 3:4
1/4 c d e
```

## 2. It belongs to the measure

A time signature is drawn only in the measure where you declare it. If you want to see it again, you declare it again:

```msq-editor opens-with=text
measure
treble clef
time signature is 3:4
1/4 c d e

measure
1/4 f g a

measure
time signature is 2:4
1/4 b c5

measure
time signature is 3:4
1/4 d5 c5 b
```

A measure has only one time signature, so a second one written without `measure` in between starts a new measure:

```msq-editor opens-with=text
measure
treble clef
time signature is 3:4
1/4 c d e
time signature is 2:4
1/4 f g
```

## 3. Nothing is enforced

A time signature does not check the measure it is in. MSQ will not tell you that a measure is over-full or under-full, and it doesn't change how the music is played back:

```msq-editor opens-with=text
measure
treble clef
time signature is 3:4
1/4 c d e f g a

measure
time signature is 3:4
1/2 c5
```

As you remember from [Measures](/docs/language/measures), it is you who decides what goes into a measure. The time signature is a sign for the reader.

## 4. For each line

Just like a key signature, a time signature can be restated at the start of every line of music with `for each line`:

```msq-editor opens-with=text
measure
treble clef
time signature is 3:4 for each line
1/4 c d e

measure
1/4 f g a
```

Or with `for lines below`, which works the same and reads better when the time signature changes further down the page:

```msq-editor opens-with=text
measure
treble clef
time signature is 3:4 for lines below
1/4 c d e

measure
time signature is crossed c for lines below
1/2 f c5
```

What these do on new lines you can see on the [Page lines](/docs/language/page-lines) page.

Read next: [Staves](/docs/language/staves)

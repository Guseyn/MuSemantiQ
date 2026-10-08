# Measures

A page is made of measures, and every unit you write belongs to one of them. You open a measure with the key word `measure`.

Let's start with a simple example:

```msq-editor opens-with=text
measure
c d e f

measure
g a b c5

measure
measure rest
```

As you can see, each `measure` ends the previous measure with a bar line and starts a new one. The last measure on a line takes the rest of the space on that line.

## 1. Writing a Measure

`measure` must be the first word on its line, and the units of the measure start on the next line. Notes on the same line as `measure` are not recognised:

```msq-editor opens-with=text
measure
1/4 c d e f
measure
1/4 g a b c5
```

The parser ignores indentation and empty lines, so you can use them to make the text easier to read:

```msq-editor opens-with=text
measure
  1/4 c d e f

measure
  1/2 g c5
```

A measure can be empty. Then it's drawn as an empty piece of stave:

```msq-editor opens-with=text
measure
measure
measure
```

## 2. A Measure Is Created for You

You didn't need `measure` on the previous pages, because if you don't declare one, MSQ creates it for you. So these notes go into one measure:

```msq-editor opens-with=text
1/4 c d e f g a b c5
```

It's important to mention that notes before the first `measure` still get their own measure, and `measure` then starts the second one:

```msq-editor opens-with=text
1/4 c d e f
measure
1/4 g a b c5
```

## 3. Nothing Is Counted

A measure is not limited by a time signature. You can put as many units into a measure as you want, and MSQ doesn't tell you that it's too full or not full enough:

```msq-editor opens-with=text
measure
1/4 c d
measure
1/8 c d e f g a b c5 d5 e5
measure
1 c
```

So you can write the melody first and fix it later.

## 4. Measure Rests

A whole measure of silence belongs to the measure, it's not a unit. You just need to write `measure rest` inside the measure:

```msq-editor opens-with=text
measure
1/4 c d e f

measure
measure rest

measure
1/4 g a b c5
```

If the rest lasts several measures, write `multi measure rest N times`. The number is drawn above the rest:

```msq-editor opens-with=text
measure
1/4 c d e f

measure
multi measure rest 8 times

measure
1/4 g a b c5
```

The word `multi` is optional. The number can be written in digits or as a word from **one** to **ten**:

```msq-editor opens-with=text
measure
measure rest 4 times

measure
multi measure rest four times
```

`measure rest` can be on any line of the measure. If you write it without `measure`, and the current measure is already a measure rest, a new measure is created for it. So two rests in a row give you two measures:

```msq-editor opens-with=text
1/4 c d e f
measure
measure rest
measure rest
multi measure rest 3 times
```

## 5. Commands That Start With `with`

You can also write the properties of a measure on the same line as `measure`, after `with`:

```msq-editor opens-with=text
measure
1/4 c d e f

measure with measure rest

measure with multi measure rest 12 times

measure
1/4 g a b c5
```

You can put a comma after `measure`, or move the `with …` part to the next line:

```msq-editor opens-with=text
measure, with measure rest

measure
with multi measure rest 6 times
```

These commands work only right after `measure`. You have to remember the following rules:

1. A `with …` command of a measure must come right after `measure`, on the same line or on the next one.
2. If there is an empty line between them, the `with …` line is not recognised.
3. The same happens if there is any other command between them: a clef, a key signature, a time signature or a connection between staves.

So write the `with …` commands first, and everything else after them. The same rule works for all the other commands of a measure, like bar lines and fermatas, which you will see on later pages.

Read next: [Clefs](/docs/language/clefs)

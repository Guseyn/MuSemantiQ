# Barlines

A barline belongs to a measure: a measure can open with one and close with one. By default, the first measure on each page line opens with a barline, and every measure closes with a plain barline. But you can easily change that:

```msq-editor opens-with=text
measure
ends with double barline
treble clef
c d e f

measure
ends with double bold barline
g a b c5
```

There are two ways to write a barline, and they follow different rules:

1. As a part of the `measure` command: `measure ends with double barline` on one line, or `ends with double barline` on the lines right after `measure`. These attach to the measure while it's still being declared, so they must follow `measure` before anything else does, before a clef, a stave or a unit.
2. As a separate command: `closing double barline`, `opening double bold barline`, `no opening barline`. These still belong to the current measure, but they have no such ordering constraint, you can write them anywhere in the measure.

Here is the second way, written after the music of the measure:

```msq-editor opens-with=text
measure
treble clef
c d e f
closing double barline

measure
g a b c5
closing double bold barline
```

## 1. Measure without an opening barline

As mentioned, the first measure on each line starts with a barline. The following command makes a measure start without it:

```msq-editor opens-with=text
measure without start barline
treble clef
c d e f
```

You can also write `measure without opening barline`, `measure starts without barline`, `measure opens without barline` or `measure with no start barline`, and `bar line` as two words works as well.

You can also declare the same thing as a separate command:

```msq-editor opens-with=text
measure
treble clef
c d e f
no opening barline
```

`no start barline` is the same command.

## 2. Opening barlines

There are two opening barlines: a plain barline and a double bold barline. The plain one is what the first measure on a line gets by default, but you can specify it explicitly:

```msq-editor opens-with=text
measure starts with barline
treble clef
c d e f
```

You can also write `measure opens with barline` or `measure begins with barline`. As a separate command, it's `opening barline` or `start barline`. It's important to mention that a plain opening barline is drawn only on the first measure of a line, because in the middle of a line the closing barline of the previous measure is already there.

A double bold barline can open any measure:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure opens with double bold barline
g a b c5
```

You can write `bold double barline` as well. And you can declare it as a separate command:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
opening double bold barline
g a b c5
```

## 3. Closing barlines

There are four closing barlines: plain, double, dotted and double bold. A plain barline is the default, but you can specify it explicitly:

```msq-editor opens-with=text
measure closes with barline
treble clef
c d e f
```

This is how you add a double barline:

```msq-editor opens-with=text
measure closes with double barline
treble clef
c d e f
```

A dotted barline:

```msq-editor opens-with=text
measure closes with dotted barline
treble clef
c d e f
```

And a double bold barline, the one that usually ends a piece:

```msq-editor opens-with=text
measure closes with double bold barline
treble clef
c d e f
```

Instead of `closes` you can write `finishes` or `ends`. Each of them can also be declared as a separate command, `closing barline`, `closing double barline`, `closing dotted barline` and `closing double bold barline`:

```msq-editor opens-with=text
measure
treble clef
c d e f
closing dotted barline

measure
g a b c5
closing double barline

measure
c5 b a g
closing double bold barline
```

A measure can open and close with barlines at the same time, and both can be written on the lines after `measure`:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
starts with double bold barline
ends with double barline
g a b c5
```

Read next: [Repeat signs](/docs/language/repeat-signs)

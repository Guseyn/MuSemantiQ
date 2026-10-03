# Durations

By default, the duration of a note is a quarter. You can easily change it by putting the duration before the note name, separated by a space:

```msq-editor opens-with=text
1/2 c
1/4 d e
1/8 f g a b
```

The duration is a separate word, so the space is required: `1/2c` is not recognised. And it always goes before the note, never after it.

## 1. All the durations

A duration is written as a whole number or a fraction. Let's take a look at the short ones first:

```msq-editor opens-with=text
1/4 a
1/8 a
1/16 a
1/32 a
1/64 a
1/128 a
1/256 a
```

And the long ones:

```msq-editor opens-with=text
1/2 a
1 a
2 a
4 a
```

In the table below you can see all the durations that are supported at the moment:

| Duration | Name |
| --- | --- |
| `4` | quadruple whole note (longa) |
| `2` | double whole note (breve) |
| `1` | whole note |
| `1/2` | half note |
| `1/4` | quarter note |
| `1/8` | eighth note |
| `1/16` | sixteenth note |
| `1/32` | thirty-second note |
| `1/64` | sixty-fourth note |
| `1/128` | hundred twenty-eighth note |
| `1/256` | two hundred fifty-sixth note |

Any other number, like `3` or `1/3`, is not a duration. Uneven durations are made with [dots](/docs/language/dots) and [tuplets](/docs/language/tuplets).

## 2. A duration sticks

If you want to change the duration for a sequence of notes, you just need to specify it one time before the first note in that sequence. Every note after it keeps that duration until another one is given:

```msq-editor opens-with=text
1/4 a a a
1/8 a a a
1/2 a a
1/8 a a a
```

As you can see, the duration doesn't care about lines of the text: it carries on through them until you change it. So the first note on a line doesn't need a duration if it's the same as the one before:

```msq-editor opens-with=text
1/8 c d e f
g a b c5
1/4 c5 b a g
```

Only the notes before the first duration on a page take the default quarter:

```msq-editor opens-with=text
c d
1/2 e
f
```

It's important to mention that the last duration is remembered for each stave and each voice separately. So a duration in one voice never leaks into another. More about that you can read in [Staves](/docs/language/staves) and [Voices](/docs/language/voices).

Read next: [Dots](/docs/language/dots)

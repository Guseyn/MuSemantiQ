# Durations

By default, a note is a quarter. But you can easily change that by putting the duration before the note, with a space:

```msq-editor opens-with=text
1/2 c
1/4 d e
1/8 f g a b
```

The duration is a separate word, so the space is required: `1/2c` is not recognised. And it always goes before the note, never after.

## 1. All the Durations

A duration is a whole number or a fraction. Let's take a look at the short ones first:

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

All the durations supported at the moment:

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

Any other number, like `3` or `1/3`, is not a duration. For other lengths there are [dots](/docs/language/dots) and [tuplets](/docs/language/tuplets).

## 2. A Duration Sticks

You write a duration only once, before the first note. All the next notes get the same duration until you write another one:

```msq-editor opens-with=text
1/4 a a a
1/8 a a a
1/2 a a
1/8 a a a
```

As you can see, new lines don't change the duration either. So the first note on a line doesn't need a duration if it's the same as before:

```msq-editor opens-with=text
1/8 c d e f
g a b c5
1/4 c5 b a g
```

Only the notes before the first duration on a page are quarters by default:

```msq-editor opens-with=text
c d
1/2 e
f
```

It's important to mention that the last duration is remembered for each stave and each voice separately. So a duration in one voice never goes into another one. More about that you can read in [Staves](/docs/language/staves) and [Voices](/docs/language/voices).

Read next: [Dots](/docs/language/dots)

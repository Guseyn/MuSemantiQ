# Dots

A dot makes a note longer by half of its duration. A dotted quarter is a quarter plus an eighth. A dotted half is a half plus a quarter. To add a dot, write `dotted` after the note:

```msq-editor opens-with=text
1/4 c dotted
1/8 d
1/2 e dotted
1/4 f
```

You can also write it in other ways. They all mean the same:

```msq-editor opens-with=text
1/4 c dotted
d is dotted
e with dot
f with one dot
g with 1 dot
```

## 1. More Than One Dot

You can add more than one dot. Each next dot adds half of what the previous dot added, so a quarter with two dots is a quarter plus an eighth plus a sixteenth. For more dots, write `with N dots`:

```msq-editor opens-with=text
1/4 c with two dots
1/16 d
1/2 e with 2 dots
1/8 f
```

The number can be a digit or a word: `with 2 dots` is the same as `with two dots`. The number is from **1** to **9**:

```msq-editor opens-with=text
1/2 c with 1 dots
d with 2 dots
e with three dots
```

## 2. A Dot Belongs to One Note

Unlike a duration, a dot belongs only to its note. The next note is not dotted unless you write it:

```msq-editor opens-with=text
1/4 c dotted
1/8 d
1/4 e
f dotted
1/8 g
```

It's important to mention that a dot doesn't change the duration you wrote. In the [page schema](/docs/api/overview), a dotted quarter is stored as two separate things: the duration **1/4** and the number of dots **1**. That's why a dot doesn't change the duration of the next notes:

```msq-editor opens-with=text
1/2 c dotted
d
e with two dots
f
```

As you can see, `d` and `f` are plain halves.

Read next: [Rests](/docs/language/rests)

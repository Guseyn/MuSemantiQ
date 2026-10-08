# Stems

By default, stems go up in the first voice and down in other voices. It doesn't depend on how high or low the notes are, so on a page with one voice every stem goes up:

```msq-editor opens-with=text
1/8 c d e f g a b c5
d5 e5 f5 g5 a5 b5 c6
```

You will see voices in [Voices](/docs/language/voices).

## 1. Changing a Stem Direction

But you can easily change that with `with stem up` or `with stem down`:

```msq-editor opens-with=text
1/4 c with stem up
d with stem down
e with stem up
f
```

You can skip `with`. It works the same:

```msq-editor opens-with=text
1/4 c5 stem down
d5 stem up
```

## 2. A Stem Direction Sticks

As you may notice in the first example of the previous section, the stem of `f` goes down, although nothing is written on it. When you change the stem direction of one note, all the next notes in the same voice get it too, until you change it again:

```msq-editor opens-with=text
1/8 c5 with stem down, d5 e5 f5 g5 a5 b5
c with stem up, d e f g a b
```

Like durations, the last stem direction is remembered for each stave and each voice separately, and it goes on through new lines of the text.

A stem direction goes with the other marks of a unit, in any order:

```msq-editor opens-with=text
1/8 c5 beamed, with stem down, d5 e5 f5 not beamed
1/4 g5 dotted with stem down
```

## 3. Stems of Chords

For chords it works the same:

```msq-editor opens-with=text
chord with stem down
c d e

chord
f g a

chord with stem up
b c5 d5

chord
e5 f5 g5

```

If you write a stem direction on a chord and another one on a note in that chord, the last one wins:

```msq-editor opens-with=text
chord with stem up
e5, f5 with stem down, g5

```

A chord has only one stem, and it's very important to let a user see mistakes visually. So for chords, it's recommended to write the stem direction right after `chord`.

## 4. Stems in the Serializer

When the serializer turns a page back into text, it writes the stem direction of every note and chord, even where you didn't write one. If the text doesn't say it, the parser figures out the stem direction itself. Writing it out is what lets a page schema turn into text and back without any change. More about that you can read in [The page schema](/docs/api/overview).

Read next: [Ties](/docs/language/ties)

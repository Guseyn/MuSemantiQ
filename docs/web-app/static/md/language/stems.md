# Stems

By default, notes and chords in the first voice have stems pointing upwards, and in other voices their stems point downwards. It doesn't depend on how high or low the notes are, so on a page with one voice every stem goes up:

```msq-editor opens-with=text
1/8 c d e f g a b c5
d5 e5 f5 g5 a5 b5 c6
```

Voices you will meet in [Voices](/docs/language/voices).

## 1. Changing a stem direction

You can easily change the direction of a stem with `with stem up` or `with stem down`:

```msq-editor opens-with=text
1/4 c with stem up
d with stem down
e with stem up
f
```

You can omit `with`, it will work in the same way:

```msq-editor opens-with=text
1/4 c5 stem down
d5 stem up
```

## 2. A stem direction sticks

As you may notice in the first example of the previous section, `f` has its stem pointing down, although nothing is said about it. By changing the stem direction of just one note, you set it to all the notes in the same voice that follow after, till the next change of the stem direction:

```msq-editor opens-with=text
1/8 c5 with stem down, d5 e5 f5 g5 a5 b5
c with stem up, d e f g a b
```

Like durations, the last stem direction is remembered for each stave and each voice separately, and it goes through lines of the text.

A stem direction is written together with the other marks of a unit, in any order:

```msq-editor opens-with=text
1/8 c5 beamed, with stem down, d5 e5 f5 not beamed
1/4 g5 dotted with stem down
```

## 3. Stems of chords

For chords it works in the same way:

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

If you set a stem direction to a chord and at the same time you attach another stem direction to a note in that chord, you will get a chord with the last mentioned stem direction, which overrides the stem directions specified before:

```msq-editor opens-with=text
chord with stem up
e5, f5 with stem down, g5

```

It's very important to let a user see errors or inaccuracies visually, and a chord has only one stem. So for chords it's recommended to specify the stem direction right after the key word `chord`.

## 4. Stems in the serializer

When a page is turned back into text by the serializer, every note and chord gets its stem direction written out, even where you didn't write one. The parser infers a stem direction when the text is silent, and saying it explicitly is what makes a page schema turn into text and back without any change. More about that you can read in [The page schema](/docs/api/overview).

Read next: [Ties](/docs/language/ties)

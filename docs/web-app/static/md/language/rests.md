# Rests

Notes, and chords that you will meet soon, are called sound units, or just units. A rest is a unit too: it takes its place in the music the same way a note does, only it is silent.

Let's start with a simple one:

```msq-editor opens-with=text
c d rest e
```

## 1. Duration of a rest

Like for notes, the default duration of a rest is a quarter. You set a duration for it the same way, before the word `rest`:

```msq-editor opens-with=text
1/4 c
1/4 rest
1/2 d
1/2 rest
```

All the durations from [Durations](/docs/language/durations) work for rests:

```msq-editor opens-with=text
1/8 rest
1/16 rest
1/32 rest
1/64 rest
1/128 rest
1/256 rest
```

```msq-editor opens-with=text
1/4 rest
1/2 rest
1 rest
2 rest
4 rest
```

As you remember, a duration sticks. A rest takes it from the units before it, and it passes its own duration to the units after it:

```msq-editor opens-with=text
1/8 c d rest e
1/2 rest
f
```

Rests can have [dots](/docs/language/dots) as well:

```msq-editor opens-with=text
1/4 rest dotted
1/8 c
1/2 rest with two dots
1/8 d
```

## 2. Vertical position of a rest

By default, a rest is positioned in the middle of the stave. One way to set a vertical position for a rest is to write `top rest`, `middle rest` or `bottom rest`. You can use `mid` instead of `middle`:

```msq-editor opens-with=text
top rest
rest
middle rest
mid rest
bottom rest
```

The duration goes before the position:

```msq-editor opens-with=text
1/8 top rest
1/8 rest
1/8 middle rest
1/8 bottom rest
```

Another way to set a position for a rest is to declare a note and mark it as a rest with `is rest`. Then the rest is drawn on the line or space where that note would be:

```msq-editor opens-with=text
c is rest
d is rest
e is rest
f is rest
g is rest
a is rest
b is rest
```

The difference between `1/4 rest` and `1/4 g is rest` is only that: both are rests of the same duration, but the second one is pinned to the line of `g`. Such a rest takes a duration, an octave and dots like any note, so you can mark and unmark notes as rests easily:

```msq-editor opens-with=text
1/8 c is rest
1/8 d is rest
1/4 g is rest
1/4 g5 is rest dotted
```

It's important to mention that `rest` on its own is a unit, while `is rest` is something you say about a note. So `c is rest` is one silent unit, not a note followed by a rest.

## 3. Measure rests

A rest that lasts a whole measure is not a unit like the rests above, it's rather a property of the measure. You can read about it in [Measures](/docs/language/measures).

Read next: [Accidentals](/docs/language/accidentals)

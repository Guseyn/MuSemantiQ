# Rests

Notes, and chords that you will see soon, are called sound units, or just units. A rest is a unit too. It takes its place in the music like a note, but it's silent.

Let's start with a simple one:

```msq-editor opens-with=text
c d rest e
```

## 1. Duration of a Rest

Like a note, a rest is a quarter by default. You set its duration the same way, before the word `rest`:

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

As you remember, a duration stays until you change it. A rest gets it from the units before it, and the units after it get the rest's duration:

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

## 2. Vertical Position of a Rest

By default, a rest is in the middle of the stave. One way to move it is to write `top rest`, `middle rest` or `bottom rest`. You can write `mid` instead of `middle`:

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

Another way is to write a note and mark it with `is rest`. Then the rest is drawn where that note would be:

```msq-editor opens-with=text
c is rest
d is rest
e is rest
f is rest
g is rest
a is rest
b is rest
```

`1/4 rest` and `1/4 g is rest` are both quarter rests. The only difference is that the second one is drawn on the line of `g`. Such a rest can have a duration, an octave and dots like any note, so you can easily mark and unmark notes as rests:

```msq-editor opens-with=text
1/8 c is rest
1/8 d is rest
1/4 g is rest
1/4 g5 is rest dotted
```

It's important to mention that `rest` alone is a unit, and `is rest` is something you say about a note. So `c is rest` is one silent unit, not a note and then a rest.

## 3. Measure Rests

A rest for a whole measure is not a unit like the rests above. It's a property of the measure. You can read about it in [Measures](/docs/language/measures).

Read next: [Accidentals](/docs/language/accidentals)

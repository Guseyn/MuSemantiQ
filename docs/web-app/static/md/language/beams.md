# Beams

Beams work only for units with flags: notes and chords of `1/8`, `1/16` and shorter. In MSQ, a beamed unit is beamed with the *next* unit, not with the previous one:

```msq-editor opens-with=text
1/8 a is beamed with next
c5
```

You can skip `is` and `with next`. It works the same:

```msq-editor opens-with=text
1/8 a beamed
c5
```

## 1. Beaming Is Sticky

You don't need to mark every unit as beamed. Once a unit is beamed, all the next units in the same voice are beamed too:

```msq-editor opens-with=text
1/8 a beamed, b, c5, d5
```

Beaming stops at a unit marked `not beamed`. That unit is still connected to the unit before it, because that one is beamed with next. But it's not beamed with the unit after it, so it's the last unit of the group:

```msq-editor opens-with=text
1/8 c beamed, d, e, f not beamed
g beamed, a, b, c5 not beamed
```

You can also write `is not beamed` or `not beamed with next`. They mean the same.

It's important where exactly you put `not beamed`. In the first line below, the group ends at `e`, and `f` and `g` have their own flags. In the second line, the group ends at `f`:

```msq-editor opens-with=text
1/8 c beamed, d, e not beamed, f, g
1/8 c beamed, d, e, f not beamed, g
```

The units after `not beamed` are not beamed until you write `beamed` again. So a new group always starts with `beamed`:

```msq-editor opens-with=text
1/8 c beamed, d not beamed
e f
g beamed, a not beamed
```

As you can see, like durations, beaming goes on through new lines of the text. But a beamed group never goes from one page line to the next: beaming starts again on every page line. You can read about page lines in [Page lines](/docs/language/page-lines).

## 2. Different Durations in One Group

Units in one group can have different durations:

```msq-editor opens-with=text
1/8 a beamed with next
1/16 a
1/32 a
1/64 a not beamed
```

```msq-editor opens-with=text
1/16 b beamed
b
1/8 b dotted
1/32 b
1/32 b not beamed
```

It's very important to see clearly what duration each beamed unit has. So the duration of a beamed note is shown by the bigger number of beam lines on its left or right side.

A quarter or a longer unit has no flags, so it's never beamed. `beamed` on it does nothing, and it doesn't start a group:

```msq-editor opens-with=text
1/4 c beamed d
1/8 e beamed f g not beamed
```

## 3. Only the Primary Beam Line

Sometimes we want to split beamed notes into beats, connected by only one primary beam line. For that, mark the last unit of a beat as `beamed with only primary line`:

```msq-editor opens-with=text
1/16 a beamed, b, a, b beamed with only primary line,
a, b, a, b not beamed
```

`beamed with only one line` works the same. It's only for the unit it's written on, and the group goes on after it:

```msq-editor opens-with=text
1/16 c beamed d e f beamed with only one line
g a b c5 beamed with only one line
d5 e5 f5 g5 not beamed
```

## 4. Beamed Chords

Chords are beamed the same way as notes:

```msq-editor opens-with=text
1/16 chord beamed with next
c d e
chord
e f g
chord not beamed
a b c5

```

If at least one note in a chord is `beamed`, the whole chord is beamed:

```msq-editor opens-with=text
1/16 chord
c d e beamed with next
chord
e f g
chord
a b c5 not beamed

```

It's recommended to write `beamed` after `chord`, so it's easy to see where a group starts.

Notes and chords can also be beamed together:

```msq-editor opens-with=text
1/8 c beamed
chord
e g

d
chord not beamed
f a

```

Read next: [Stems](/docs/language/stems)

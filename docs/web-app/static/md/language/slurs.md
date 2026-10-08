# Slurs

A slur can connect units from different measures and even from different staves, so it doesn't belong to a measure. It's a separate command, and you write it **after** the music. It names the units by their positions, so those units must already be written above it.

## 1. Simple Slurs

Let's start with basics:

```msq-editor opens-with=text
measure
treble clef
1/4 c d e f

slur from first unit to fourth unit
```

You can write a position as a word or as a number, before or after the key word. `first unit`, `1st unit` and `unit 1` are the same.

- Words work only from **1** to **10** (`first` … `tenth`, `one` … `ten`), because it keeps highlighting in the editor fast, and most positions are there anyway.
- For bigger numbers, write `11th` or `unit 11`.
- `unit`, `note` and `chord` are the same here, and rests are counted as units too:

```msq-editor opens-with=text
measure
treble clef
1/4 c rest e f

slur from note 1 to 4th note
```

A slur takes its units from the last page line above it. So you can put slurs on several lines like this:

```msq-editor opens-with=text
measure
treble clef
a d f g

slur from first unit to fourth unit

new line
a d f g

slur from first unit to fourth unit
```

As you can see, each slur applies to the line above it. But you can also write all the slurs after all the lines, and name the line:

```msq-editor opens-with=text
measure
treble clef
a d f g

new line
a d f g

slur on first line from first unit to fourth unit
slur on second line from first unit to fourth unit
```

Let's see how you can put slurs in different measures:

```msq-editor opens-with=text
measure
treble clef
a d f g
measure
a d f g

new line
a d f g
measure
a d f g

slur on first line, in first measure from first unit to fourth unit
slur on first line, in second measure from first unit to fourth unit
slur on second line, in first measure from first unit to fourth unit
slur on second line, in second measure from first unit to fourth unit
```

It's important to mention that measures are counted within their page line. On the second line, `first measure` is the first measure of that line, not of the page.

In the same way, you can put slurs in different staves:

```msq-editor opens-with=text
measure
stave with treble clef
a5 d5 f5 g5
stave with bass clef
a2 d3 f3 g3

slur in first stave from first unit to fourth unit
slur in second stave from first unit to fourth unit
```

A slur connects units only in one voice, so you name the voice once, for the whole slur:

```msq-editor opens-with=text
measure
treble clef
voice
a5 d5 f5 g5
voice
a d f g

slur in first voice from first note to fourth unit
slur in second voice from first note to fourth unit down
```

As you can see, `up` and `down` set the direction of a slur.

A slur is a cross-measure element:

```msq-editor opens-with=text
measure
treble clef
a d f g
measure
a d f g

slur from first note in first measure to fourth unit in second measure
```

A slur is also a cross-stave element:

```msq-editor opens-with=text
measure
stave with treble clef
a d f g
stave with bass clef
1 rest
measure
stave
1 rest
stave
1/4 a d f g

slur
starts above first note in first measure in first stave
changes stave at first note in second measure in second stave
and finishes at fourth unit in second measure in second stave
```

It's important to name the unit where a slur changes its stave. Otherwise the slur doesn't know which units are under it, and it crosses or ignores some of them. Here is the same slur without `changes stave`:

```msq-editor opens-with=text
measure
stave with treble clef
a d f g
stave with bass clef
1 rest
measure
stave
1 rest
stave
1/4 a d f g

slur
starts above first note in first measure in first stave
and finishes at fourth unit in second measure in second stave
```

As you may notice, you can write a slur over several lines, and join its parts with commas or `and`. Cross-stave slurs look better when they are s-shaped. More about that below, in the section about s-shaped slurs.

If a slur needs to start before a unit or finish after a unit, you just say so:

```msq-editor opens-with=text
measure
treble clef
a d f g
measure

slur starts from first unit and finishes after 4th unit

new line
a d f g
measure

slur starts before first unit and finishes at 4th unit
```

This is how a slur goes from one page line to the next: its part on the first line `finishes after` a unit, and its part on the next line `starts before` a unit.

You can write the start and the finish in different ways:

| Start | Finish |
| --- | --- |
| `from`, `starts at`, `starts from`, `begins at`, `begins from` | `to`, `finishes at`, `ends at` |
| `starts before`, `begins before` | `finishes after`, `ends after` |

You can set the direction of a slur with `up` and `down`, or say that it starts or finishes `above` or `below` a unit:

```msq-editor opens-with=text
measure
treble clef
a d f g

slur starts above first unit and finishes at 4th unit

new line
a d f g

slur starts at first unit and finishes below 4th unit

new line
a d f g

slur up starts at first unit and finishes at 4th unit
```

If you write several directions for a simple slur, the last one wins.

## 2. Coordinates

For the coordinates of units in a slur (`line`, `measure`, `stave` and `voice`), you have to remember the following rules:

1. If you don't write `line` after `slur`, the slur applies to the last line above it.
2. If you don't write `measure`, `stave` and `voice`, it means the first measure, the first stave and the first voice.
3. Next to a `unit` you can write only `measure` and `stave` (like `first note in first measure, in second stave`).
   - `voice` goes right after `slur`, for the whole slur, because a slur can't go from one voice to another.
   - `line` can't go next to a unit, because each slur, or each part of a slur, belongs to the line where it's written.
4. If `measure` and `stave` of the next units are the same as of the first unit, you don't need to repeat them.

`stave` and `staff` are the same everywhere in a slur.

## 3. Shaping Slurs

You can set how round a slur is, with a number from **1** to **10** after `roundness` (or `convex`):

```msq-editor opens-with=text
measure
treble clef
a b c5 d5 e5
measure
a b c5 d5 e5
measure
a b c5 d5 e5

slur in first measure from first note to note 5 with roundness 1
slur in second measure from first note to note 5 with roundness 7
slur in third measure from first note to note 5 with roundness 10
```

You can also move the left and the right points of a slur up or down:

```msq-editor opens-with=text
measure
treble clef
c with stem down, d, e, c, f, g
measure
c with stem down, d, e, c, f, g

slur in first measure from first unit to 6th unit

slur in second measure from first unit to 6th unit
with left point 1 up
with right point 1 up
```

In the second measure we moved both points of the slur up by one interval between stave lines.

A slur adjusts itself, so it doesn't cross the notes and chords under it:

```msq-editor opens-with=text
measure
treble clef
c d3 c

slur from unit 1 to unit 3
```

For the right point of a slur, you can also say where it's attached: to the note head, or to the middle of the stem. It's useful for slurs that start from [grace notes](/docs/language/grace-units):

```msq-editor opens-with=text
measure
treble clef
1/8 a is grace
1/4 b

1/8 a is grace
1/4 b

1/8 a is grace
1/4 b

1/8 a with stem down, is grace
1/4 b

slur from first note to second note
with right point attached to note head

slur from third note to fourth note
with right point attached to note body

slur up from fifth note to sixth note
with right point attached to middle of stem

slur up from seventh note to eighth note
with right point attached to note head
```

As you may notice, `note head` and `note body` are the same thing.

## 4. S-Shaped Slurs

For a cross-stave slur, it's better to make it s-shaped with `with s-shape`:

```msq-editor opens-with=text
measure
stave with treble clef
1/8 a beamed, d, f, g
1/2 rest
stave with bass clef
1/2 rest
1/8 a3 beamed, b3, f3, g3

slur
starts above first note in first stave
changes stave below second unit in second stave
and finishes at unit 5
with s-shape
```

You can also write `with s shape` or `with sshape`. An s-shaped slur can change its direction on the same stave too, with `goes through`:

```msq-editor opens-with=text
measure
treble clef
1/16 a beamed and stem up, b, c5, f not beamed,
a beamed and stem up, b, c5, f not beamed,
a beamed and stem up, b, c5, f not beamed

slur
with s-shape
with roundness 9
starts below first note
goes through 5th note
goes through 9th note
finishes at 12th note
```

`goes through` marks the unit where the slur changes its direction. As you can see, everything that works for simple slurs works for s-shaped slurs too.

Read next: [Crescendo and diminuendo](/docs/language/crescendo-and-diminuendo)

# Slurs

A slur does not belong to a measure, because it can connect units from different measures and even from different staves. So a slur is a command of its own, and it's written **after** the music it covers: it names units by their positions, and those units must already exist when the slur is read.

## 1. Simple slurs

Let's start with basics:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 c d e f

slur from first unit to fourth unit
</template>
</div>

You can write a position as a word or as a number, before or after the key word: `first unit`, `1st unit` and `unit 1` are the same thing. Words work for numbers from **1** to **10** (`first` … `tenth`, `one` … `ten`), because it keeps highlighting in the editor fast, and that is where most positions are anyway. For bigger numbers you can write `11th` or `unit 11`. The key words `unit`, `note` and `chord` are also the same thing here, and rests are counted as units too:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 c rest e f

slur from note 1 to 4th note
</template>
</div>

A slur takes its units from the last page line declared before it. That is how you can put slurs on several lines:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a d f g

slur from first unit to fourth unit

new line
a d f g

slur from first unit to fourth unit
</template>
</div>

As you see, each slur applies to the last line declared before the slur. But you can also declare all the slurs after all the lines, and name the line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a d f g

new line
a d f g

slur on first line from first unit to fourth unit
slur on second line from first unit to fourth unit
</template>
</div>

Let's see how you can put slurs in different measures:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

It's important to mention that measures are numbered within their page line. On the second line, `first measure` is the first measure of that line, not the first measure of the page.

In the same way, you can put slurs in different staves:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
a5 d5 f5 g5
stave with bass clef
a2 d3 f3 g3

slur in first stave from first unit to fourth unit
slur in second stave from first unit to fourth unit
</template>
</div>

A slur connects units only in the same voice, so you name the voice for the whole slur:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
a5 d5 f5 g5
voice
a d f g

slur in first voice from first note to fourth unit
slur in second voice from first note to fourth unit down
</template>
</div>

As you can see, you can control the direction of a slur with the `up` and `down` key words.

A slur is a cross-measure element:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a d f g
measure
a d f g

slur from first note in first measure to fourth unit in second measure
</template>
</div>

A slur is also a cross-stave element:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

It's important to mention the exact unit where a slur changes its stave, because otherwise the slur misjudges which units are under it, and it would intersect or ignore some of them. Here is the same slur without `changes stave`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

As you may notice, a slur can be written over several lines, and you can join its parts with commas or `and`. Cross-stave slurs work and look better when they are s-shaped, more about that below, in the section about s-shaped slurs.

If a slur needs to start before a unit or finish after a unit, you just say so:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a d f g
measure

slur starts from first unit and finishes after 4th unit

new line
a d f g
measure

slur starts before first unit and finishes at 4th unit
</template>
</div>

This is how a slur reaches across the end of a page line: its part on the first line `finishes after` a unit, and its part on the next line `starts before` one.

The endpoints can be written in different ways, so you can choose what reads better:

| Start | Finish |
| --- | --- |
| `from`, `starts at`, `starts from`, `begins at`, `begins from` | `to`, `finishes at`, `ends at` |
| `starts before`, `begins before` | `finishes after`, `ends after` |

You can set a direction for a slur with `up` and `down`, or you can say that a slur starts or finishes `above` or `below` a certain unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

If you mention several directions for a simple slur, the last one wins over all the others.

## 2. Coordinates

In terms of the coordinates of units (`line`, `measure`, `stave` and `voice`) in slurs, you have to remember the following rules:

1. If a `line` is not specified after the `slur` key word, the slur applies to the last line declared before it.
2. If you don't specify `measure`, `stave` and `voice`, the slur assumes that you mean the first measure, the first stave and the first voice.
3. Along with a `unit` coordinate you can specify only `measure` and `stave` (like `first note in first measure, in second stave`). You cannot set `voice` along with a unit, only right after the `slur` key word, for the whole slur, because a slur is not a cross-voice element. And you cannot set `line` along with a unit, because each slur, or each part of a slur, is declared for the line where it is located.
4. If you specified `measure` and `stave` for the first unit of a slur, and they don't change for the other units, you don't need to repeat them.

The words `stave` and `staff` are the same thing everywhere in a slur.

## 3. Shaping slurs

You can configure how rounded a slur is. A number from **1** to **10** after `roundness` (or `convex`) sets the roundness of a slur:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

You can also correct the vertical position of the left and the right points of a slur:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c with stem down, d, e, c, f, g
measure
c with stem down, d, e, c, f, g

slur in first measure from first unit to 6th unit

slur in second measure from first unit to 6th unit
with left point 1 up
with right point 1 up
</template>
</div>

In the second measure we moved both points of the slur up by one interval between stave lines.

A slur adjusts itself, so it does not intersect notes and chords under it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d3 c

slur from unit 1 to unit 3
</template>
</div>

For the right point of a slur, you can also say where it is attached: to the note head, or to the middle of the stem. It is especially useful for slurs that start from [grace notes](/docs/language/grace-units):

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

As you may notice, `note head` and `note body` are the same thing.

## 4. S-shaped slurs

If you need a cross-stave slur, it's highly recommended to make it s-shaped with `with s-shape`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

You can also write `with s shape` or `with sshape`. An s-shaped slur can change its direction on the same stave too, with `goes through`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
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
</template>
</div>

`goes through` marks a unit where the slur changes its direction. As you can see, everything that works for simple slurs works for s-shaped slurs as well.

Read next: [Crescendo and diminuendo](/docs/language/crescendo-and-diminuendo)

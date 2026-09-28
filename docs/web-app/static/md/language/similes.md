# Similes

A simile is a mark that says "repeat what came before" instead of writing the same music again. There are four scopes of it: a unit, a range of units, the previous measure, and the two previous measures. A unit-level simile is written as an attribute of a unit, a range of units is a command of its own after the music, and a measure-level simile is a property of a measure.

## 1. Simile as a unit

A simile can be considered as a sound unit, like notes, rests and chords. Let's start with a simple example, when you want to repeat a note several times:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a repeat three times
</template>
</div>

As you can see, `repeat` goes right after the unit, and `N times` says how many times it's repeated. Without `N times`, the unit is repeated once. You can also write `repeat via simile`, if you want to say it more explicitly:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a repeat
c5 repeat via simile 2 times
</template>
</div>

Of course, the duration of a simile is the same as the duration of the repeated unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/256 a repeat 2 times
1/16 a repeat 2 times
1/8 a repeat 2 times
1/4 a repeat 2 times
</template>
</div>

It works for chords as well:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 chord repeat 3 times
c e g
</template>
</div>

By default, simile marks are vertically positioned in the middle of the stave. But you can easily change that:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
a5 repeat three times 2 up
voice
c repeat three times 2 down
</template>
</div>

All you need is to specify a number and a direction after it. `2 down` means that we lower the element by two intervals between stave lines.

## 2. Simile for a range of units

A simile can also repeat a range of units. Here we use unit positions, like for [slurs](/docs/language/slurs):

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f
simile from first unit to 4th unit 3 times
</template>
</div>

It might seem that the `simile` command is a part of the measure. Visually it is, of course. But in terms of the page structure, you can declare all similes after all measures. Let's take a look at the following example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
e f g
new line
e f g
measure
c d e

simile in measure 1 from unit 1 to unit 3
</template>
</div>

As you may notice, we didn't specify a page line for the simile above. In this case, it takes the last line declared before `simile`. That's why `measure 1` is the first measure of the second line.

Let's put the simile before the second line and see how it works in this case:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
e f g

simile in measure 1 from unit 1 to unit 3

new line
e f g
measure
c d e
</template>
</div>

You can also simply specify the line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
e f g

new line
e f g
measure
c d e

simile on line 1, in measure 1 from unit 1 to unit 3
</template>
</div>

If you don't mention `measure`, `stave` or `voice`, the simile takes the first measure, the first stave and the first voice of the line. Let's take a look at a more complex example, where we specify all the coordinates:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
voice
g5 a5 b5
voice
c d e
stave with treble clef
voice
g5 a5 b5
voice
c d e
measure
stave
voice
g5 a5 b5
g5 a5 b5
voice
c d e
c d e
stave
voice
g5 a5 b5
voice
c d e

simile in first line, second measure, first stave, first voice
from first unit to third unit
1.5 up

simile in first line, second measure, first stave, second voice
from first unit to third unit
1.5 down
</template>
</div>

As you can see, the coordinates of the line, the measure, the stave and the voice go right after `simile`, and the units are named with `from` and `to` (or `starts at` and `finishes at`).

Another important detail is that similes are also sound units. The `simile` command is not a part of the measure, but the units (simile marks) it adds belong to the measure. Let's examine the following commands:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
e f g

simile from unit 1 to unit 3
simile from unit 4 to unit 6
</template>
</div>

As you can see, you need to be careful when you specify unit positions, because the 4th unit above is actually the first simile. So we repeated a range of units where a simile is included. This is not what we want, so let's rewrite it correctly:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
e f g

simile from unit 1 to unit 3
simile from unit 5 to unit 7
</template>
</div>

By default, a simile for a range of units is drawn as if it repeats the previous beat. MSQ does not know anything about the beat you use each time, so for flexibility, you specify whether it's one beat you want to repeat, or several beats:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/8 d e f
measure
1/8 d e f
g e f

repeat of previous beat in measure 1 from unit 1 to unit 3
repeat of previous beats in measure 2 from unit 1 to unit 6
</template>
</div>

As you can see, the beat above is apparently equal to 3/8. In the first measure, we repeat one previous beat, so the simile mark has just two strokes. And in the second measure, we repeat two previous beats, and the simile mark has two strokes and one dot on each side. You can write `simile` instead of `repeat`, and `prev` or `prev.` instead of `previous`.

**Important note:** if a range simile starting with `repeat` comes right after a line of units, leave an empty line before it. Otherwise `repeat` gets attached to the last unit as a unit simile. `simile` does not have this problem.

The example above can be written with beams, to show separate beats:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/8 d beamed, e, f
measure
1/8 d beamed, e, f not beamed
g beamed, e, f

repeat of previous beat in measure 1 from unit 1 to unit 3
repeat of previous beats in measure 2 from unit 1 to unit 6
</template>
</div>

You can expect that similes are synchronised according to their durations, like other units:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
d e f
stave with treble clef
d e f
g f e
d e f

repeat of prev. beat in first stave from first unit to third unit two times
</template>
</div>

Like in the previous section, you can correct the vertical position of simile marks:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/8 c beamed d e

repeat from unit 1 to unit 3 three times 2 down
</template>
</div>

## 3. Simile of the previous measure

Like a [measure rest](/docs/language/measures), a simile of the previous measure is a property of a measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f

measure
simile of previous measure
</template>
</div>

It can also be written on one line with `measure`, and it can be counted:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e

measure with simile of previous measure 3 times
measure
</template>
</div>

If you need to repeat the previous measure once, you don't need to specify the number of repetitions:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e

measure with simile of previous measure
measure
</template>
</div>

A simile of the previous measure applies to all the staves:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
c d e
stave with bass clef
c3 d3 e3

measure with simile of previous measure 3 times
measure
</template>
</div>

As a separate command, it's counted in the same way:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
simile of previous measure 2 times
measure
</template>
</div>

You can write `repeat` instead of `simile`, `for` instead of `of`, and `prev` or `prev.` instead of `previous`.

## 4. Simile of the two previous measures

In the same way, you can declare a simile of the two previous measures:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
d e f

measure with simile of two previous measures 3 times
measure
</template>
</div>

If you need to repeat the two previous measures once, you don't need to specify the number of repetitions:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
d e f

measure with simile of two previous measures
measure
</template>
</div>

A simile of the two previous measures applies to all the staves:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
c d e
stave with bass clef
c3 d3 e3
measure
stave
d e f
stave
d3 e3 f3

measure with simile of two previous measures 3 times
measure
</template>
</div>

You can also declare it as a separate command:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e
measure
d e f
measure
simile of two previous measures 2 times
measure
</template>
</div>

`2` can be written instead of `two`.

Similes are not only drawn: the MIDI player plays the repeated units, measures and ranges as if they were written out in full.

Read next: [Unit spacing](/docs/language/unit-spacing)

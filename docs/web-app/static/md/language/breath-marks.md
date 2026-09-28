# Breath marks

A breath mark tells a singer or a wind player where to take a breath. You add it before a unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c d
e with breath mark before
f g
a with breath before
b
</template>
</div>

As you can see, `mark` is optional: `with breath before` means the same as `with breath mark before`.

## 1. Shapes

By default, a breath mark is drawn as a comma. But you can easily choose its shape:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c d
e with breath comma before
f g
a with breath double slashes before
b
</template>
</div>

These are all the shapes supported at the moment:

| Shape | Key words |
|---|---|
| comma | `comma` |
| double slashes | `double slashes`, `double slash` |

The shape can also be written with `as`, and together with `mark`, if it reads better to you:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c d
e with breath as comma before
f g
a with breath mark double slash before
b
</template>
</div>

## 2. Before, not after

It's important to mention that a breath mark always belongs to the unit that comes *after* the breath. So a breath at the end of a measure is written on the first unit of the next one, and it is drawn after the barline, right in front of that unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 c d e f
measure
1/4 g with breath comma before
a b c5
</template>
</div>

## 3. Vertical position

A breath mark is placed above the stave, but you can correct its vertical position:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 c d e f
measure
1/4 g with breath comma before 1 down
a b c5
measure
1/4 b with breath double slashes before 2 up
a g f
</template>
</div>

`1 down` means that the breath mark moves one interval between stave lines down, and `2 up` moves it two intervals up.

## 4. Breath marks on several staves

If you declare a breath mark before a unit, the same breath mark is added on the other staves as well, so that the units on all the staves stay in sync:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
voice
1/4 a
a with breath mark before
a
voice
c
c
c
stave with bass clef
1/4 a3
a3
a3
</template>
</div>

**Side note:** a breath mark is also heard: in playback, it adds a pause before the unit that carries it, on every stave at once.

Read next: [Arpeggiated chords](/docs/language/arpeggiated-chords)

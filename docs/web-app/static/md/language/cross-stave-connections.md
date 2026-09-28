# Cross-stave connections

A cross-stave connection is a brace or a bracket at the left of several staves. Conventionally, a brace joins the staves of one instrument, like the two staves of a piano, and a bracket joins the staves of a group of instruments, like a string section. For each measure you can set them with `brace` and `bracket`.

## 1. Braces

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from stave 1 to stave 2
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
</template>
</div>

A connection belongs to the measure where it's declared, and it's drawn at the left edge of that measure. So normally you declare it in the measure that opens a line. The staves can be written as `stave 1` or as `first stave`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from first stave to second stave
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
</template>
</div>

If you want a brace on each line, just add `for each line`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from stave 1 to stave 2 for each line
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3
new line
new line
</template>
</div>

You can always change the configuration of braces in the middle of a page. A new `for each line` connection replaces the previous one from that line on:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from stave 1 to stave 2 for each line
stave
stave
new line
new line
brace from first stave to third stave for each line
stave
stave
stave
new line
</template>
</div>

To be more transparent, you can use the words `for lines below`. They work in the same way, but they say that the configuration of braces can change further down:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from stave 1 to stave 2 for lines below
stave
stave
new line
new line
brace from first stave to third stave for lines below
stave
stave
stave
new line
</template>
</div>

In theory, you can declare a brace even for just one stave, with `for`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace for first stave
treble clef
c d e f
</template>
</div>

If you set a brace for staves that are missing, it will still be drawn:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from first stave to second stave
stave
</template>
</div>

It's very important to let a user see errors or inaccuracies visually.

## 2. Brackets

All the rules described above apply to brackets as well:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
bracket from first stave to second stave
stave with treble clef
c5 d5 e5 f5
stave with treble clef
c d e f
</template>
</div>

You can combine braces and brackets in one measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from first stave to second stave
bracket from third stave to fourth stave
stave
stave
stave
stave
</template>
</div>

The number of a stave can also be written as a word after it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
brace from stave 1 to stave 2
bracket from stave three to stave four
stave
stave
stave
stave
</template>
</div>

It's important to mention that `brace` and `bracket` must be the first words on their line.

Read next: [Cross-stave chords](/docs/language/cross-stave-chords)

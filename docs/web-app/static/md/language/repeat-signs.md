# Repeat signs

A repeat sign belongs to a measure, like a barline. You can add it at the start and/or at the end of each measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
repeat sign at the start
c d e f

measure
repeat sign at the end
g a b c5
</template>
</div>

It's important to mention that a repeat sign draws only the dots. The barline next to them is still the barline of that side of the measure, so you choose it yourself, and conventionally it's a double bold barline:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
starts with double bold barline
with repeat sign at the start
treble clef
c d e f

measure
ends with double bold barline
with repeat sign at the end
g a b c5
</template>
</div>

As you remember from [Barlines](/docs/language/barlines), the forms written right after `measure` must come before anything else in the measure. `with repeat sign at the start` and `with repeat sign at the end` are such forms as well.

You can also use the key word `colon` instead of `repeat sign`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
starts with double bold barline
with colon at the start
treble clef
c d e f

measure
ends with double bold barline
with colon at the end
g a b c5
</template>
</div>

And you can declare a repeat sign as a separate command, which still belongs to the current measure and can be written anywhere in it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f
opening double bold barline
closing double bold barline
repeat sign at the start
repeat sign at the end
</template>
</div>

**Important note:** if a separate `repeat sign` comes right after a line of units, leave an empty line before it. Otherwise the word `repeat` is read as a repeat of the last unit, which is a [simile](/docs/language/similes). `colon` does not have this problem:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f

repeat sign at the start

measure
g a b c5
colon at the end
</template>
</div>

If you just write `repeat sign` (or `with repeat sign`), without saying which side, the dots are drawn on both sides of the measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f

measure
opening double bold barline
closing double bold barline
repeat sign
g a b c5

measure
c5 b a g
</template>
</div>

`at start` and `at end`, without `the`, work as well.

Repeat signs are also played: when the MIDI player reaches a repeat sign at the end of a measure, it goes back to the last repeat sign at the start of a measure (or to the beginning, if there is none) and plays that part once more. More about playback you can read in [MIDI settings](/docs/language/midi-settings).

Read next: [Volta brackets](/docs/language/volta-brackets)

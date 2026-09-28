# Octave signs

An octave sign says that the music under it sounds one or two octaves higher or lower than it's written. It can be attached to a single unit, or it can cover a group of units with a bracket.

## 1. Octave signs for single units

Let's see how you can add an octave sign to a single unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a is octave up
a is octave down
a is two octaves up
a is two octaves down
</template>
</div>

Instead of `up` and `down`, you can write `higher` and `lower`, and `2` instead of `two`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a is octave higher
a is octave lower
a is 2 octaves higher
a is two octaves lower
</template>
</div>

The vertical position of an octave sign is always adjusted, but you can correct it regardless:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
a is octave up 1 up
a is octave down 1 down
a is two octaves up 1 up
a is two octaves down 1 down
</template>
</div>

Here `1 up` moves the octave sign up by one interval between stave lines, and `1 down` moves it down by one interval.

## 2. Octave signs with brackets

When an octave sign covers several units, you declare it like other elements that connect units, after the music. The bracket is drawn over the whole range, from the first unit to the last one:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 c5 d5 e5 f5

octave up from first unit to fourth unit
</template>
</div>

A bracket can run through several measures:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c c c
measure
c c c
measure

two octaves higher
from first unit in first measure
to third unit in second measure

new line
c c c
measure
c c c
measure

octave down
from first unit in first measure
to third unit in second measure
</template>
</div>

The endpoints can be written as `from` and `to`, or as `starts at` and `finishes at` (`begins` and `ends` work as well).

Like for single units, you can correct the vertical position of an octave sign with a bracket:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c c c
measure
c c c
measure

two octaves higher 1 up
from first unit in first measure
to third unit in second measure

new line
c c c
measure
c c c
measure

octave down 1 down
from first unit in first measure
to third unit in second measure
</template>
</div>

Like for slurs, you can declare all octave signs after all the lines, and name the line for each of them:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c c c
measure
c c c
measure

new line
c c c
measure
c c c
measure

two octaves higher in first line
from first unit in first measure
to third unit in second measure

octave down in second line
from first unit in first measure
to third unit in second measure
</template>
</div>

The unit coordinates for octave signs work almost in the same way as for [slurs](/docs/language/slurs), you have to remember the following rules:

1. If a `line` is not specified after the octave sign, it applies to the last line declared before it.
2. If you don't specify `measure`, `stave` and `voice`, it assumes that you mean the first measure, the first stave and the first voice.
3. Along with a `unit` coordinate you can specify only `measure` (like `first note in first measure`). The `stave` and `voice` are set right after the octave sign, for the whole bracket, because an octave sign is not a cross-stave or cross-voice element. And you cannot set `line` along with a unit, because each octave sign is declared for the line where it is located.
4. If you specified `measure` for the first unit, and it does not change for the last one, you don't need to repeat it.

Here is an octave sign on the lower stave of a grand staff:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
c5 d5 e5 f5
stave with bass clef
c2 d2 e2 f2

octave down in second stave from first unit to fourth unit
</template>
</div>

It's important to mention that an octave sign changes not only what you see, but also what you hear: the units under it are played one or two octaves higher or lower. More about playback you can read in [MIDI settings](/docs/language/midi-settings).

Read next: [Glissando](/docs/language/glissando)

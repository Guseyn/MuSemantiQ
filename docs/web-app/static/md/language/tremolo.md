# Tremolo

A tremolo is a fast repetition. There are two kinds of it: strokes on a single unit, which repeat that unit, and a tremolo *between* two units, which alternates them. Both are attributes of units, so they are written right on the unit, with no span command after the music.

Let's start with an example that has both of them:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c with tremolo with 3 strokes
d
1/2 e with tremolo with next
1/2 g
</template>
</div>

## 1. Tremolo for a single unit

All you need is to write `with tremolo` after a unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1 a with tremolo
1/2 a with tremolo
1/4 a with tremolo
1/8 a with tremolo
1/16 a with tremolo
1/32 a with tremolo
</template>
</div>

As you can see, the number of strokes depends on the duration. By default, units of a quarter and longer get three strokes, eighths get two, and sixteenths get one. Thirty-second units and shorter are not marked with tremolo at all, because their duration is already too small. You may also notice that for units with flags the strokes are drawn shorter (horizontally), because it's easier to read.

You can set the number of strokes yourself with `with 1 stroke`, `with 2 strokes` or `with 3 strokes`. But you have to remember the following rules:

1. You cannot set more than three strokes.
2. For eighth units, you can set only one or two strokes.
3. For sixteenth units, there is always one stroke, no matter how many strokes you specify.

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
new line
1 a with tremolo, with 3 strokes
1 a with tremolo, with 2 strokes
1 a with tremolo, with 1 stroke
new line
1/2 a with tremolo, with 3 strokes
1/2 a with tremolo, with 2 strokes
1/2 a with tremolo, with 1 stroke
new line
1/4 a with tremolo, with 3 strokes
1/4 a with tremolo, with 2 strokes
1/4 a with tremolo, with 1 stroke
new line
1/8 a with tremolo, with 3 strokes
1/8 a with tremolo, with 2 strokes
1/8 a with tremolo, with 1 stroke
new line
1/16 a with tremolo, with 3 strokes
1/16 a with tremolo, with 2 strokes
1/16 a with tremolo, with 1 stroke
</template>
</div>

The strokes also say how fast the unit is repeated when it's played: one stroke means eighths (for units longer than an eighth), two strokes mean sixteenths, and three strokes mean thirty-seconds. So a half note with three strokes is played as sixteen thirty-second notes.

## 2. Tremolo between two units

In order to connect two units with a tremolo, you write `with tremolo with next` on the first of them:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
1 f with tremolo with next
1 a with tremolo with next
measure
1/2 f with tremolo with next
1/2 a with tremolo with next
measure
1/4 f with tremolo with next
1/4 a with tremolo with next
new line
1/8 f with tremolo with next
1/8 a with tremolo with next
measure
1/16 f with tremolo with next
1/16 a with tremolo with next
</template>
</div>

Keep in mind that you can connect only two units with the same duration. The second unit is the next one in the same voice, and it can also be the first unit of the next measure. When it's played, the MIDI player alternates the two units, as fast as the strokes say.

The same rules on the number of strokes apply here as well:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
new line
1 a with tremolo with next, with 3 strokes
1 a with tremolo, with 3 strokes
1 a with tremolo with next, with 2 strokes
1 a with tremolo, with 2 strokes
1 a with tremolo with next, with 1 stroke
1 a with tremolo, with 1 stroke
new line
1/2 a with tremolo with next, with 3 strokes
1/2 a with tremolo, with 3 strokes
1/2 a with tremolo with next, with 2 strokes
1/2 a with tremolo, with 2 strokes
1/2 a with tremolo with next, with 1 stroke
1/2 a with tremolo, with 1 stroke
new line
1/4 a with tremolo with next, with 3 strokes
1/4 a with tremolo, with 3 strokes
1/4 a with tremolo with next, with 2 strokes
1/4 a with tremolo, with 2 strokes
1/4 a with tremolo with next, with 1 stroke
1/4 a with tremolo, with 1 stroke
new line
1/8 a with tremolo with next, with 3 strokes
1/8 a with tremolo, with 3 strokes
1/8 a with tremolo with next, with 2 strokes
1/8 a with tremolo, with 2 strokes
1/8 a with tremolo with next, with 1 stroke
1/8 a with tremolo, with 1 stroke
new line
1/16 a with tremolo with next, with 3 strokes
1/16 a with tremolo, with 3 strokes
1/16 a with tremolo with next, with 2 strokes
1/16 a with tremolo, with 2 strokes
1/16 a with tremolo with next, with 1 stroke
1/16 a with tremolo, with 1 stroke
</template>
</div>

Read next: [Pedal marks](/docs/language/pedal-marks)

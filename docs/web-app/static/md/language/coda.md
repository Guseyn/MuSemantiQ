# Coda

Each measure can have a coda symbol. Like a [sign](/docs/language/sign), you declare it with `coda` inside the measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
coda at the end of the measure
c d e f
</template>
</div>

By default, a coda is at the start of the measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f
measure
coda
g a b c5
</template>
</div>

You can explicitly say where you want to put it, at the start or at the end of the measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
coda at the start of the measure
c d e f
measure
coda at the end of the measure
g a b c5
measure
c5 b a g
</template>
</div>

The vertical position of a coda is always adjusted depending on the elements in the measure, but you still can correct it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
coda 1 up
a b d
</template>
</div>

Here we moved the coda up by one interval between stave lines.

Conventionally, a coda comes in a pair with a sign and a repetition instruction. The first coda marks the place where you leave, the second one marks where the coda section begins, and a "D.S. al Coda" (or "D.C. al Coda") instruction says when to go back. Here are the two codas and the sign, the instruction itself comes on the next page:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
sign
c d e f
measure
closes with double barline
coda at the end of the measure
g a b c5
measure
c5 b a g
measure
closes with double bold barline
coda
c e g c5
</template>
</div>

The MIDI player follows this: after "D.S. al Coda" it goes back to the sign, plays until the first coda, and then jumps to the next coda on the page. The instructions are described in [Repetition instructions](/docs/language/repetition-instructions).

Read next: [Repetition instructions](/docs/language/repetition-instructions)

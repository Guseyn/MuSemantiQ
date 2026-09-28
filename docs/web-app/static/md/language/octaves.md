# Octaves

To specify an octave for a note, you have to put its number right after the note name, without any space:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c3 c4 c5 c6
</template>
</div>

The octaves are numbered the usual way: `c4` is the middle C, `c5` is the C an octave above it, and each octave runs from `c` up to `b`. So `b4` and `c5` are neighbours:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
g4 a4 b4 c5 d5 e5
</template>
</div>

A note without a number takes the default octave of its clef. On the treble stave, which is what you get when there is no clef at all, the default octave is **4**. So `c` and `c4` are the same note:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c c4 d d4 e e4
</template>
</div>

It's important to mention that an octave belongs only to the note it is written on. It does not carry over to the notes that follow, so every note without a number goes back to the default octave:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c3 c c5 c3 c5
</template>
</div>

As you can see, the second note is the middle C again, not `c3`. If you want a whole passage in another octave, you have to give the number to each note of it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c5 d5 e5 f5 g5 a5 b5 c6
</template>
</div>

The octave number is a single digit from **1** to **9**. `c0` or `c10` is not recognised as a note. Keep in mind that notes far from the stave need a lot of ledger lines:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c2 g2 c7 g7
</template>
</div>

In practice, for such notes you would rather use another clef, which you can read about in [Clefs](/docs/language/clefs), or an octave sign, which is described in [Octave signs](/docs/language/octave-signs).

Read next: [Durations](/docs/language/durations)

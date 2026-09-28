# Tempo and metronome marks

Each measure can have a tempo or metronome mark. You declare it as a text, which can be a word, a metronome mark, or both. Durations written in the text are drawn as note symbols.

Let's start with a basic example, where we use only a word:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
tempo is "Andante"
c d e f
</template>
</div>

You can write `tempo`, `tempo mark`, `tempo note`, `metronome`, `metronome mark` or `metro`, they are all the same thing here, so you can use the words that feel more appropriate in each case. The `is` can be omitted.

Let's add a note to the mark:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
metronome mark is "Allegro (1/4 = 120)"
c d e f
</template>
</div>

Each time you write a duration in the text, it's converted to the corresponding note symbol. These are all the supported ones:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
metronome mark is "1 1/2 1/4 1/8 1/16 1/32 1/64"
c d e f
</template>
</div>

The durations can also be written as words: `whole`, `half`, `quarter`, `eighth`, `sixteenth`, `thirty second` and `sixty fourth`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
tempo is "Moderato (quarter = 96)"
c d e f
</template>
</div>

You can also write durations with dots, with `dotted` or `with dot` after them:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
metronome mark is "1 dotted, 1/2 with dot, 1/4 dotted, 1/8 with dot, 1/16 dotted, 1/32 with dot"
c d e f
</template>
</div>

The vertical position of a tempo mark is always adjusted, but you can correct it regardless:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
tempo is "Allegro" 2 up
c d e f
</template>
</div>

Here we moved the tempo mark up by two intervals between stave lines.

A tempo mark belongs to its measure, so it can change the tempo in the middle of a piece:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
tempo is "Adagio (1/4 = 60)"
c d e f
measure
g a b c5
measure
tempo is "a tempo (1/4 = 100)"
c5 b a g
</template>
</div>

It's important to mention that a tempo mark is not only drawn, it's also what the MIDI player plays at. If the text contains a metronome mark like **1/4 = 120**, that is the tempo. If it contains only a tempo word, like **Andante** or **Presto**, the player takes a tempo for that word, and words like **accelerando** or **rit.** change the tempo gradually. Without any tempo mark, the music is played at **120** quarters per minute, and the `default tempo` setting from [MIDI settings](/docs/language/midi-settings) changes that, but only when the first measure has no tempo mark of its own.

Read next: [Measure numbers](/docs/language/measure-numbers)

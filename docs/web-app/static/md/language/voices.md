# Voices

Each stave consists of voices. A voice is an independent line of music: two voices on one stave move at the same time, each with its own rhythm.

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
voice
1/4 c5 b a g
voice
1/2 c e
</template>
</div>

As you can see, each `voice` opens another voice on the current stave, and the units after it, until the next `voice`, belong to it.

## 1. Declaring a voice

`voice` must be the first word on its line, and the units of the voice start on the next line. You don't need a `stave` for voices: if there is none, the voices go on the one stave MSQ creates for you.

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/4 g a b c5
voice
1/4 c c c c
</template>
</div>

Visually voices make sense only when they have units in them. You can declare as many voices on a stave as you need:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/4 g a b c5
voice
1/4 e f g a
voice
1/4 c c c c
</template>
</div>

## 2. Stems

By default, the first voice takes stems up, and the second voice and every voice after it take stems down. That keeps the voices out of each other's way, and it is why you did not need to write a single stem direction above. As you remember from [Stems](/docs/language/stems), you can still change the direction of any unit.

## 3. Each voice remembers its own duration

As you remember from [Durations](/docs/language/durations), a duration sticks until you give another one. It's important to mention that it sticks *per voice*: each voice keeps its own duration and its own stem direction, from one measure to the next.

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/4 c5 b a g
voice
1/2 c e

measure
voice
f5 e5 d5 c5
voice
f a
</template>
</div>

As you may notice, in the second measure no voice has a duration, and still the first one is in quarters and the second one in halves.

## 4. Voices across staves

Voices live inside a stave, so each stave has its own voices, and they are numbered from one on every stave:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
voice
1/4 e5 d5 c5 b
voice
1/2 g g
stave with bass clef
voice
1/4 c3 d3 e3 f3
voice
1 c2
</template>
</div>

## 5. When rhythms do not line up

The units of different voices are placed by time, not by their order. A unit that starts at the same moment as a unit in another voice is drawn above or below it, and units that start in between are placed in between:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/2 c5
1/4 b a
voice
1/4 e f g f
</template>
</div>

Voices don't have to add up to the same length either. You can add as many units to a voice as you want, it's not restricted by the other voices or by a time signature. That allows you to focus on the melody and fix the details along the way:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/4 c5 c5 c5 c5 c5 c5
voice
1/2 e
</template>
</div>

When one voice has a pause, give it a rest, so the other voice keeps its place:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/2 d5
1/4 c5 b
voice
1/4 rest
1/4 g f e
</template>
</div>

Read next: [Page lines](/docs/language/page-lines)

# Ghost units

A ghost unit is a note or chord that is played for its rhythm rather than for its pitch: a muted, percussive note. It is drawn with a cross instead of a regular note head.

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c is ghost
d
e is ghost
f
</template>
</div>

## 1. Marking a unit as ghost

You can turn a note into a ghost note just by marking it. `is ghost` and plain `ghost` mean the same:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
a is ghost
b ghost
a ghost
</template>
</div>

The shape of a ghost note depends on its duration:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1 a is ghost
1/2 a
1/4 a
1/8 a
1/16 a
1/32 a
</template>
</div>

## 2. Ghost carries over

As you may notice in the example above, you only need to mark the first note as ghost, and all the following units in the same voice are assumed to be ghosts as well. It carries over the measures too, until you say otherwise.

If you want to stop this, just mark a unit as not a ghost, with `is not ghost` or `not ghost`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a is ghost
a
a is not ghost
a
a
</template>
</div>

It's important to mention that this is kept for each stave separately, so a ghost on one stave does not turn the next stave into ghosts:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
1/4 a is ghost
a a a
stave with bass clef
1/4 c3 d3 e3 f3
</template>
</div>

## 3. Chords

In the same way, you can mark a chord as ghost, on its `chord` line. And like with notes, the chords after it become ghosts too:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord is ghost
f c5 a5

chord
g d5 b5

</template>
</div>

Or you can mark just a certain note in a chord as ghost. Inside a chord, it does not carry over to other notes or to the next unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord
f, c5 is ghost, a5

chord
g d5 b5

</template>
</div>

## 4. Ghost units in playback

A ghost unit still occupies its full duration, like any other unit. But in playback it is not played by the instrument of its stave: it gets a short percussive sound instead, so what you hear is its rhythm.

**Side note:** a ghost unit is not the same as a unit in parentheses. A ghost note changes how a note is played, while parentheses only say that a note is optional or implied, and it is played as usual. Parentheses have their own page: [Parentheses](/docs/language/parentheses).

Read next: [Parentheses](/docs/language/parentheses)

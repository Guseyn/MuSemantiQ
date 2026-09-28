# Grace units

A grace unit is a small note or chord played quickly before the unit that follows it. It does not take any time in the measure.

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c is grace
1/4 d
1/8 e is crushed grace
1/4 f
</template>
</div>

## 1. Marking a unit as grace

You can turn a note into a grace note just by marking it. `is grace` and plain `grace` mean the same:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a is grace
b grace
a grace
</template>
</div>

It's important to mention that, unlike most attributes, `grace` does not carry over to the next unit. You mark every grace unit you need:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a is grace
1/4 b
1/8 a is grace
b is grace
1/4 c5
</template>
</div>

## 2. Durations

A grace unit takes a duration like any other unit, and the duration sets how it is drawn — its note head, flags and beams. This is how grace notes with different durations look:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1 a is grace
1/2 a is grace
1/4 a is grace
1/8 a is grace
1/16 a is grace
1/32 a is grace
</template>
</div>

In playback, a grace unit sounds for a quarter of the duration it is written with.

## 3. Crush line

A grace note can have a crush line, the slash through its stem. You can write it as `is crushed grace`, `crushed grace`, or add `with crush line` after `is grace`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a is crushed grace
1/4 b
1/8 a crushed grace
1/4 b
1/8 a is grace with crush line
1/4 b
</template>
</div>

## 4. Everything else still applies

Anything you can apply to simple notes, you can apply to grace notes as well. Grace notes beam among themselves, and take stems, accidentals and articulations:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a is grace, beamed with next, stem down
b is grace
c5 is grace
d5 is grace
1/4 e5

1/16 f is grace, with sharp key, beamed with next
g is grace
1/4 a with staccato
</template>
</div>

## 5. Chords

You can mark a chord as grace, on its `chord` line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 chord is grace
f c5 a5

1/4 chord
g d5 b5

1/8 chord grace
f c5 a5

1/4 chord
g d5 b5

</template>
</div>

If you mark just one note in a chord as grace, the whole chord is considered grace. It works, but it's not recommended, mostly for the sake of better readability:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 chord
f c5 is grace a5

1/4 chord
g d5 b5

</template>
</div>

## 6. Grace units on several staves

You can expect that grace units don't ruin the synchronisation of other units. Here the grace notes on the first stave do not push the notes on the second stave out of line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
1/8 a is grace, beamed with next
1/16 a is grace
1/16 a is grace
1/4 a
a
stave with bass clef
1/4 c3
d3
</template>
</div>

**Side note:** a grace note joined to its main note with a slur is how you write an appoggiatura or an acciaccatura. Slurs have their own page: [Slurs](/docs/language/slurs).

Read next: [Ghost units](/docs/language/ghost-units)

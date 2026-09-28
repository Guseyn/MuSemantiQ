# Beams

Beams work only for units with flags, like a note or a chord with duration `1/8`, `1/16` and shorter. In MSQ, a unit is considered as beamed if it's beamed with the *next* unit, not with the previous one:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a is beamed with next
c5
</template>
</div>

You can omit `is` and `with next`, it will work in the same way:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed
c5
</template>
</div>

## 1. Beaming is sticky

As you can see below, you don't need to mark each unit that it's beamed. Once a unit is beamed, it's assumed that all the following units in the same voice are beamed too:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed, b, c5, d5
</template>
</div>

Beaming of units is stopped at a unit with the `not beamed` mark. That unit is still connected to the one before it, because that one is beamed with next, but it's not beamed with the unit after it. So it's the last unit of the group:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c beamed, d, e, f not beamed
g beamed, a, b, c5 not beamed
</template>
</div>

You can also write `is not beamed` or `not beamed with next`, they mean the same.

It's important to mention where exactly you put `not beamed`, because it changes the reading. In the first line below the group ends at `e`, and `f` and `g` stand alone with their own flags. In the second line the group ends at `f`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c beamed, d, e not beamed, f, g
1/8 c beamed, d, e, f not beamed, g
</template>
</div>

The units after `not beamed` are not beamed until you say `beamed` again. So a new group always starts with `beamed`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c beamed, d not beamed
e f
g beamed, a not beamed
</template>
</div>

As you can see, the sticky beaming doesn't care about lines of the text, like durations. But a beamed group never goes from one line of the page to the next: beaming starts over on every page line, which you can read about in [Page lines](/docs/language/page-lines).

## 2. Different durations in one group

Units in one group can have different durations:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed with next
1/16 a
1/32 a
1/64 a not beamed
</template>
</div>

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/16 b beamed
b
1/8 b dotted
1/32 b
1/32 b not beamed
</template>
</div>

It's very important to make visually clear what duration each beamed unit has. Each beamed note has the duration that is dictated by the maximum number of beam lines from the left and the right sides of the note.

A quarter or a longer unit has no flags, so it's never beamed. Marking it as `beamed` has no effect, and it doesn't start a group either:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c beamed d
1/8 e beamed f g not beamed
</template>
</div>

## 3. Only the primary beam line

Sometimes we want to have beamed notes divided in groups, or beats, by only one primary beam line. For that, mark the last unit of a beat as `beamed with only primary line`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/16 a beamed, b, a, b beamed with only primary line,
a, b, a, b not beamed
</template>
</div>

`beamed with only one line` works the same way. It applies only to the unit it's written on, and the group carries on after it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/16 c beamed d e f beamed with only one line
g a b c5 beamed with only one line
d5 e5 f5 g5 not beamed
</template>
</div>

## 4. Beamed chords

Chords are beamed in the same way as notes:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/16 chord beamed with next
c d e
chord
e f g
chord not beamed
a b c5

</template>
</div>

If at least one note in a chord is marked as `beamed`, the whole chord will be considered as a beamed chord:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/16 chord
c d e beamed with next
chord
e f g
chord
a b c5 not beamed

</template>
</div>

It's recommended to mark chords as beamed after the key word `chord`, so it's easy to see where a group starts.

Notes and chords can also be beamed together:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c beamed
chord
e g

d
chord not beamed
f a

</template>
</div>

Read next: [Stems](/docs/language/stems)

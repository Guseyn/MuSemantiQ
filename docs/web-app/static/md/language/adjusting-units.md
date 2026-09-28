# Adjusting units

There are certain cases where it's quite useful to adjust the horizontal position of a unit. Let's first explore how this works in MSQ.

Let's start with the following example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1 a
1/4 a

new line
1 a
1/4 a is left by 3

new line
1 a
1/4 a is right by 3
</template>
</div>

As you see, just by adding `is left by N` or `is right by N` to a unit, you can control its horizontal position. The word `is` can be left out, and the number can be a decimal, or even written as a word:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 a
b right by 1.5
c5 left by 0.5
d5 is right by two
</template>
</div>

The number is measured in the distance between two stave lines, the same measure the rest of the engraving is built on. So **1** moves a unit by the height of one space of the stave, and the move stays in proportion when the interval between stave lines is changed.

A chord is adjusted on its `chord` line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1 a

1/8 chord is arpeggiated
a sharp b sharp c5 flat

new line
1 a

1/8 chord is arpeggiated, is right by 2
a sharp b sharp c5 flat

</template>
</div>

It's quite important to mention that when you move a unit, all the elements that belong to it and stand before it move too: its accidentals, its arpeggio, and so on, as you can see above.

## 1. What else moves

Moving a unit does not break the synchronization of units in different voices and staves. Everything that sounds at the same time moves together:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
1/4 a b is right by 4 c5 d5
stave with bass clef
1/4 c3 d3 e3 f3
</template>
</div>

And when you move a unit, all the units that follow it get repositioned as well:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
1/4 c d
e is right by 5
f
</template>
</div>

## 2. When you need it

In the majority of cases you don't need to adjust the position of units. This is an escape hatch: MSQ reserves a safe space between units by default, and when a page is too tight or too loose it's better to reach for [Unit spacing](/docs/language/unit-spacing) first. There are so many edge cases where it's unclear whether the positions of units should be adjusted, that it was decided to give the full control to you. However, there are some concrete examples where it's useful.

Let's start with [tuplets](/docs/language/tuplets). By default, tuplets have irregular spaces between their units when there are units in other voices or staves:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/8 a beamed a a not beamed
1/16 a beamed a a a a not beamed
1/8 a
1/4 a
voice
1/8 c c
c c
1/4 c

tuplet 5:4 with brackets in first voice from unit 1 to unit 9
tuplet 3 with brackets in first voice from unit 1 to unit 3
tuplet 5 with brackets in first voice from unit 4 to unit 8
</template>
</div>

By moving a few units, you can even out those spaces:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
1/8 a beamed a a not beamed is left by 0.7
1/16 a beamed a, a is left by 1.5, a a not beamed
1/8 a
1/4 a
voice
1/8 c c is left by 1
c is left by 1.5, c
1/4 c

tuplet 5:4 with brackets in first voice from unit 1 to unit 9
tuplet 3 with brackets in first voice from unit 1 to unit 3
tuplet 5 with brackets in first voice from unit 4 to unit 8
</template>
</div>

Now it looks much better. Let's take a look at another example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
1/16 e5 with stem down, beamed with next
g sharp
a
b is not beamed
c5 with stem up and beamed
d5
e5
chord is arpeggiated
a3 sharp c sharp f sharp

stave with bass clef
1/16 c3 with stem down, beamed with next
b2
a2
a2 not beamed
c3 beamed
b2
a2
g2
</template>
</div>

The arpeggiated chord leaves a wide gap before it. We can now easily optimize the space on the score:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
1/16 e5 with stem down, beamed with next
g sharp, is left by 1
a
b is not beamed
c5 with stem up and beamed
d5
e5
chord is arpeggiated, is left by 5
a3 sharp c sharp f sharp

stave with bass clef
1/16 c3 with stem down, beamed with next
b2
a2
a2 not beamed
c3 beamed
b2
a2
g2
</template>
</div>

Read next: [Slurs](/docs/language/slurs)

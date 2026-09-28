# Tuplets

A tuplet squeezes a number of units into the time of a different number of them, like three eighths in the time of two. In MSQ a tuplet is written after the notes it covers, not before them, because it points at those notes by their positions.

Let's start with a basic example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed, b, e not beamed

tuplet 3 from first unit to third unit
</template>
</div>

A tuplet must start on a new line. It's a good habit to separate it from the music with an empty line, so it's easy to see where the notes end.

## 1. Naming the range

After `tuplet` and its value, you say where the tuplet starts and where it finishes. The units are counted from the start of the measure, and chords and rests count as units the same way as notes:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c d e f g a

tuplet 3 from first unit to third unit
tuplet 3 from fourth unit to 6th unit
</template>
</div>

As you can see, one line of music can have as many tuplets as you need, one per line of text.

You can use numbers from 1 to 10 as words. For example, `1` is `first`, or `one`, or even `1st`. Other numbers you write as digits, or with a suffix like `11th` or `12th`. And the number can go before or after the key word, so `first unit` and `unit 1` are the same:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c d e
f g a

tuplet 3 from unit 1 to unit 3
tuplet 3 from the fourth unit to the sixth unit
</template>
</div>

Instead of `unit` you can write `note` or `chord`, whichever reads better. There are also several ways to say where a tuplet starts and finishes: `from ... to ...`, `starts at ... finishes at ...`, `begins from ... ends with ...`. You can also put the range on the next line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 c d e
chord
f a

g rest

tuplet 3 starts at the first note, finishes at the third note
tuplet 3
from unit 4 to unit 6
</template>
</div>

It's important to mention that the tuplet has to be written after its units. If you declare it before them, there are no units to point at yet, and MSQ tells you that the units are not found.

## 2. Tuplet values

You can declare all sorts of tuplets:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/16 a beamed, b, a, b, a not beamed
1/8 a beamed, b, a, b, a, a not beamed

tuplet 5 from unit 1 to unit 5
tuplet 6 from unit 6 to unit 11
</template>
</div>

But keep in mind that even when you see the value `3` in a tuplet, it actually means `3:2`: three units in the time of two. If you need another ratio, you can write it in full:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
a a a a a a

tuplet 6:3 from first unit to sixth unit
</template>
</div>

Both parts of the ratio are whole numbers, so `3/2` or `2.5` is not a tuplet value. Below in the table you can see the default ratios for values without the second part:

| Tuplet value | Default ratio |
| --- | --- |
| `2` | 2:3 |
| `3` | 3:2 |
| `5` | 5:4 |
| `6` | 6:4 |
| `7` | 7:4 |
| `9` | 9:8 |
| `12` | 12:8 |
| `n`, if it's not one of the values above | n:(n - 1) |

The ratio is what the playback uses, and the value is what you see on the page, exactly as you wrote it.

## 3. Brackets

By default, a tuplet over one beamed group goes without a bracket, but you can force one with `with brackets`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed, b, e not beamed

tuplet 3 with brackets from first unit to third unit
</template>
</div>

When the units of a tuplet are not beamed together, or they are quarters or longer, the bracket is drawn anyway, because without it you couldn't tell which units the tuplet covers:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a b c5

tuplet 3 from first unit to third unit
</template>
</div>

## 4. Placement

You can set the direction of a tuplet with `up` or `down`, or with `above` and `below`. `over` and `under` work too:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 b3 beamed, c, b3 not beamed
b3 beamed, c, b3 not beamed
a beamed, b, a not beamed
a beamed, b, a not beamed

tuplet 3 up with brackets from first unit to third unit
tuplet 3 above with brackets from fourth unit to sixth unit
tuplet 3 down with brackets from unit 7 to unit 9
tuplet 3 below with brackets from unit 10 to unit 12
</template>
</div>

There is also `above stave` and `below stave`. The difference between `below` and `below stave` is that `below stave` guarantees that a tuplet will be rendered below the stave:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed, b, a not beamed
b3 beamed, c, b3 not beamed

tuplet 3 above stave with brackets from first unit to third unit
tuplet 3 below stave with brackets from fourth unit to sixth unit
</template>
</div>

The vertical position of tuplets is always adjusted, so they don't intersect other elements, but you can correct it regardless. You just need to say how much up or down it should move, in intervals between stave lines:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed, b, a not beamed

tuplet 3 below stave with brackets 0.5 down
from first unit to third unit
</template>
</div>

Here we moved the tuplet down by half of an interval between stave lines.

## 5. Starting before and finishing after

You can also configure tuplets, so they start before a unit or finish after a unit:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed, b, a not beamed
b3 beamed, c, b3 not beamed

tuplet 3 up with brackets
starts before first unit and finishes at third unit

tuplet 3 above stave with brackets
starts at fourth unit and finishes after sixth unit
</template>
</div>

`before first unit` and `after third unit` without `starts` and `finishes` work in the same way.

## 6. Nested tuplets

Tuplets can be nested, and the playback takes all of them into account:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/8 a beamed a a not beamed
1/16 a beamed a a a a not beamed
1/8 a
1/4 a

tuplet 5:4 with brackets from unit 1 to unit 9
tuplet 3 with brackets from unit 1 to unit 3
tuplet 5 with brackets from unit 4 to unit 8
</template>
</div>

A tuplet can also go from one measure to another, and it can be set to a particular measure, stave and voice. The coordinates for that work absolutely in the same way as for slurs, which you can read about in [Slurs](/docs/language/slurs).

Read next: [Measures](/docs/language/measures)

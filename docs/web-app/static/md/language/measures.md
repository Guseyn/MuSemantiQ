# Measures

A page is made of measures, and every unit you write belongs to one of them. You open a measure with the key word `measure`.

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
c d e f

measure
g a b c5

measure
measure rest
</template>
</div>

As you can see, each `measure` closes the previous measure with a bar line and starts a new one. The last measure on a line fills the rest of the space on that line, so you can keep adding measures and watch the line grow.

## 1. Writing a measure

`measure` must be the first word on its line, and the units of the measure start on the next line. Notes written right after `measure` on the same line are not recognised, so the measure always looks like this:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
1/4 c d e f
measure
1/4 g a b c5
</template>
</div>

Indentation and empty lines are only for you: the parser ignores them. So you can shape the text the way that is easier to read:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
  1/4 c d e f

measure
  1/2 g c5
</template>
</div>

A measure can also be empty. Then it is drawn as an empty piece of stave:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
measure
measure
</template>
</div>

## 2. A measure is created for you

You didn't need `measure` on any of the previous pages, because if you don't declare one, a measure is created for you. So these notes land in one measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c d e f g a b c5
</template>
</div>

It's important to mention that notes written before the first `measure` still go into a measure of their own, and `measure` then starts the second one:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c d e f
measure
1/4 g a b c5
</template>
</div>

## 3. Nothing is counted

A measure is not restricted by any time signature. You can add as many units to a measure as you want, and MSQ will not tell you that it is over-full or under-full:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
1/4 c d
measure
1/8 c d e f g a b c5 d5 e5
measure
1 c
</template>
</div>

It allows you to focus on the melody first and make adjustments along the way.

## 4. Measure rests

A whole measure of silence is a property of the measure rather than a unit in it. You just need to write `measure rest` inside the measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
1/4 c d e f

measure
measure rest

measure
1/4 g a b c5
</template>
</div>

When the rest lasts several measures, you can say how many with `multi measure rest N times`. The count is drawn above the rest:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
1/4 c d e f

measure
multi measure rest 8 times

measure
1/4 g a b c5
</template>
</div>

The word `multi` is optional, and the count can be a number or a word from **one** to **ten**:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
measure rest 4 times

measure
multi measure rest four times
</template>
</div>

`measure rest` can go on any line of the measure. And if you write it without `measure` at all, a new measure is created for it when the current one already is a measure rest, so two rests in a row give you two measures:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c d e f
measure
measure rest
measure rest
multi measure rest 3 times
</template>
</div>

## 5. Commands that start with `with`

A measure can also carry its properties on the same line as `measure`, joined by `with`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
1/4 c d e f

measure with measure rest

measure with multi measure rest 12 times

measure
1/4 g a b c5
</template>
</div>

You can put a comma after `measure`, or move the `with …` part to the next line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure, with measure rest

measure
with multi measure rest 6 times
</template>
</div>

Such commands attach to the measure only while the measure is still the last thing you wrote. You have to remember the following rules:

1. A `with …` command of a measure must come right after `measure`, on the same line or on the next one.
2. An empty line between them ends the measure's own commands, so the `with …` line after it is not recognised.
3. Any other command in between — a clef, a key signature, a time signature, a connection between staves — ends them too.

So if a measure needs both, write the measure's own commands first and everything else after them. The same rule applies to every other command a measure has, like bar lines and fermatas, which you will meet on later pages.

Read next: [Clefs](/docs/language/clefs)

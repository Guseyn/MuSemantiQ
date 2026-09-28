# Dots

A dot lengthens a note by half of its duration. A dotted quarter lasts a quarter and an eighth, a dotted half lasts a half and a quarter. You add a dot by writing `dotted` after the note:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c dotted
1/8 d
1/2 e dotted
1/4 f
</template>
</div>

You can also say it the other ways, they all mean exactly the same:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c dotted
d is dotted
e with dot
f with one dot
g with 1 dot
</template>
</div>

## 1. More than one dot

You can add more than one dot. Each next dot adds half of what the previous one added, so a quarter with two dots lasts a quarter, an eighth and a sixteenth. For more dots, write `with N dots`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c with two dots
1/16 d
1/2 e with 2 dots
1/8 f
</template>
</div>

The number can be a digit or a word, they are interchangeable: `with 2 dots` and `with two dots` are the same thing, and so are `with 3 dots` and `with three dots`. The number is from **1** to **9**:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/2 c with 1 dots
d with 2 dots
e with three dots
</template>
</div>

## 2. A dot belongs to one note

Unlike a duration, a dot doesn't stick. It belongs only to the note it is written on, and the next note is not dotted unless you say so:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c dotted
1/8 d
1/4 e
f dotted
1/8 g
</template>
</div>

It's important to mention that the dot doesn't change the duration you wrote, it's stored beside it. There is no single word for "dotted quarter" in MSQ: in the [page schema](/docs/api/page-schema) the unit keeps its duration, **1/4**, and the number of its dots, **1**, as two separate things. That is also why a dot doesn't affect the duration that the next notes take:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/2 c dotted
d
e with two dots
f
</template>
</div>

As you can see, `d` and `f` are plain halves.

Read next: [Rests](/docs/language/rests)

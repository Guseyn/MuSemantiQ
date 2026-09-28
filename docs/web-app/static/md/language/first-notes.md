# Your first notes

A note is written as its letter name, and nothing else is required. You don't need a header, a measure, a clef or anything else before it: a bare list of letters is already a valid page.

Let's start with a simple sequence of notes:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c d e f g a b
</template>
</div>

The letters are **c**, **d**, **e**, **f**, **g**, **a** and **b**, and they are always lowercase. `C` or `h` is not a note, and MSQ will tell you that it doesn't recognise it.

Notes are separated by spaces. It doesn't matter how many spaces you put between them:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c   d e    f
</template>
</div>

You can also separate notes by commas, if it makes the text easier for you to read. Commas are only decoration, so the text below renders exactly the same notes as the first example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c, d, e, f, g, a, b
</template>
</div>

It's important to mention that a comma sits right after a word and is followed by a space. `c,d,e` without spaces is read as one word, and it's not a note. A semicolon works the same way as a comma, and so does the word `and`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c; d; e and f
</template>
</div>

You can declare each note on a new line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c
d
e
f
g
a
b
</template>
</div>

Empty lines and indentation between notes are only for you, the parser ignores them:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c d e f

  g a b
</template>
</div>

As you may notice, there is no clef in any of the examples above. When you don't declare one, no clef is drawn, and the notes are placed on the stave as if it had a treble clef. So `c` is the middle C, the one on the ledger line below the stave. How to set a clef you can read in [Clefs](/docs/language/clefs).

Read next: [Octaves](/docs/language/octaves)

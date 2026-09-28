# Text labels

A text label is any short text attached to a unit: a fingering, a string number, a word. It's very useful for fingerpicking notation, or just for some other information you want next to a note.

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c with text "1"
d with text "2"
e with text "3"
f with text "sim." above stave
</template>
</div>

As you can see, by default a text label on a note is placed beside it, on its left, where an accidental would be.

## 1. The key word

The text goes in quotes, double or single. You can omit the `text` key word:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a with text "1"
a with "2"
a with text '3'
a with '4'
</template>
</div>

## 2. Above, below and beside

You can attach a text label above a unit, below it, or beside it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a with text "1" above
a with text "1" below
a with text "1" beside
</template>
</div>

`up` and `down` mean the same as `above` and `below`, and so do `over` and `under`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a with text "1" up
a with text "1" down
a with text "1" over
a with text "1" under
a with text "1" is down
</template>
</div>

## 3. Chords

A chord can take a text label on its `chord` line, above or below it. By default, it's above:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord with text "1"
c e g

chord with text "1" up
c e g

chord with text "1" down
c e g

</template>
</div>

Or you can give every note of a chord its own label. A note in a chord takes a label in the same way as a single note does:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord
c with text "3" down
e with text "2" beside
g with text "1" up

chord
c with text "3" beside
e with text "2" beside
g with text "1" beside

</template>
</div>

`beside` is only for notes: a chord as a whole cannot have a label beside it, because it has no single note head to stand next to.

## 4. Above or below the stave

If you want a text label to be above or below the stave rather than next to the unit, you just need to emphasise that:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a with "a" below
a with text "a" below stave

a with stem down, with "a" above
a with text "a" above stave
</template>
</div>

`staff` is accepted instead of `stave`: `with text "a" under staff`.

## 5. Vertical correction

The vertical position of a text label above or below a unit is always adjusted. But you can correct it regardless: `1 up` moves it one interval between stave lines up, and `1 down` moves it one interval down:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 a with text "1" above 1 up
a with text "1" below 1 down
a with text "1" above stave 2 up
a with text "1" below stave 2 down
</template>
</div>

It's important to mention that a label placed `beside` a note cannot be corrected, because it is placed exactly like an accidental.

**Side note:** a text label belongs to one unit and is placed for that unit alone. Words that are sung are different: they are lined up with each other across the whole page line, so they have their own command, described in [Lyrics](/docs/language/lyrics).

Read next: [Grace units](/docs/language/grace-units)

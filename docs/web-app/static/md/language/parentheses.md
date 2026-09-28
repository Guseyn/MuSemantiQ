# Parentheses

Notes and chords can have parentheses. In notation they usually mean that a note is optional, or that it is there only as a reminder, so it's up to you what exactly they say.

Let's start with how you can add parentheses to a note:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c with parentheses
d
e with parentheses
f
</template>
</div>

Instead of `parentheses` you can use `brackets`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 c with brackets
d
e with brackets
f
</template>
</div>

## 1. Parentheses around a chord

The same rule applies to chords. `with parentheses` on the `chord` line brackets the whole chord:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord with parentheses
c e g

</template>
</div>

The following example shows how to put parentheses around only some notes of a chord:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord with parentheses from note 1 to note 2
c e g b

</template>
</div>

When you specify positions of notes, they are counted starting from the top of the chord, so **note 1** is the highest note.

Numbers from 1 to 10 can also be written as words, and any number can have its postfix, so `note 2`, `2nd note`, `second note` and `the second note` all mean the same:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord with parentheses from second note to third note
c e g b

</template>
</div>

You can add several parentheses to one chord. It's easier to read if each of them goes on its own line under the `chord` line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord
with parentheses from note 1 to note 3
with parentheses from note 6 to note 7
c e g b d5 f5 a5

</template>
</div>

## 2. Parentheses around one note of a chord

You can also add parentheses to a specific note in a chord, right where you write that note:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord
c, e, g with parentheses, b

</template>
</div>

## 3. Parentheses around an accidental

As you remember from [Accidentals](/docs/language/accidentals), an accidental has its own parentheses. It's important to mention that they are not the same as the parentheses of a note: `with parentheses` right after an accidental belongs to the accidental.

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
1/4 f sharp with parentheses
g
a with flat key with parentheses
b
</template>
</div>

To put parentheses around a note that has an accidental, you have to declare them separately. Commas are optional, but they help you separate different commands visually:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord
c, e with flat key with parentheses, with parentheses, g

</template>
</div>

You can declare parentheses for the note and for its accidental in any order:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord
c, e with parentheses, with flat key with parentheses, g

</template>
</div>

Read next: [Breath marks](/docs/language/breath-marks)

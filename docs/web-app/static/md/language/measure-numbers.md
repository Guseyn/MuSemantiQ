# Measure numbers

Measure numbers are a setting of the whole page. You turn them on with the `measure numbers` command, and say which measures get a number:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure numbers for all measures

measure
treble clef
c d e f

measure
g a b c5
</template>
</div>

As you may notice, the first measure on the page never gets a number.

There are four scopes: all measures, first measures, last measures, and first and last measures. `measure numbers` on its own means all measures. Let's see them one by one, on a page with several lines. This is how you set measure numbers to all measures:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure numbers for all measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
</template>
</div>

This is how you set a measure number only to the first measure on each line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure numbers for first measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
new line
c5 b a g
measure
f e d c
</template>
</div>

This is how you set a measure number only to the last measure on each line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure numbers for last measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
</template>
</div>

And this is how you set measure numbers to the first and the last measures on each line:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure numbers for first and last measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
</template>
</div>

You can also write `first last`, `first & last` or `first&last`.

It's important to mention that a measure number counts measures from the start of the page, not from the start of the page line. The number above the first measure of the second line is the number of that measure on the page. That's different from span commands like [slurs](/docs/language/slurs) and [volta brackets](/docs/language/volta-brackets), where measures are counted within their page line.

Numbering only the first measure of each line is the most common choice in printed music: every line tells you where it is, and the page is not cluttered. Numbering all measures is useful when people need to find any measure at once, for example in rehearsals.

By default, measure numbers are above the measures. But you can easily change that:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure numbers for all measures below measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
</template>
</div>

Instead of `below measures` you can write `below`, `under`, or `down`, and `above`, `over` or `up` for the default position.

Read next: [Instrument titles](/docs/language/instrument-titles)

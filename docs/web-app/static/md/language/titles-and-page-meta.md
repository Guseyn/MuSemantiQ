# Titles and page meta

Every page can have a title, subtitles and a page number. MSQ calls them page meta, because they belong to the page rather than to any measure in it.

Let's start with a simple example:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
title is "A Short Piece"
left subtitle is "Anonymous"
right subtitle is "1897"
page number is "1"

measure
treble clef
c d e f
</template>
</div>

## 1. Title and subtitles

There are four text fields at the top of a page, and each of them is written as the name of the field, `is`, and the text in quotes:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
title is "Title"
subtitle is "Subtitle"
left subtitle is "Left subtitle"
right subtitle is "Right subtitle"

measure
treble clef
c d e f
</template>
</div>

The title and the subtitle are centred above the music, the left subtitle sits on the left and the right subtitle on the right.

Some of the fields have other names, so you can use the one that reads best for your score:

| Field | You can also write |
| --- | --- |
| `subtitle` | `author`, `description` |
| `left subtitle` | `composer`, `arrangement` |

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
title is "Prelude"
subtitle is "from the First Book"
composer is "J. S. Bach"
right subtitle is "1722"

measure
treble clef
1/4 c e g c5

measure
1/4 b g d b3
</template>
</div>

## 2. Page number

It's really easy to set a number for a page:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
page number is "6"

measure
treble clef
c d e f
</template>
</div>

It is displayed at the bottom of the page, in the centre. The value is quoted, so you can write the number in any format you like:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
page number is "6/12"

measure
treble clef
c d e f
</template>
</div>

## 3. The value is always in quotes

It's important to mention that the value is always wrapped in quotes, and a value without them is not recognised as page meta. Everything between the first and the last quote is the value, so you can use quotes inside it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
title is ""Title with quotes""

measure
treble clef
c d e f
</template>
</div>

If you want a title or a subtitle on several lines, separate each line with **\n**:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
title is "First line\nSecond line"
right subtitle is "Op. 1\nNo. 2"

measure
treble clef
c d e f
</template>
</div>

## 4. One field per line

Each field must start on a new line and take the whole line. If you put two of them on one line, the first quote and the last quote belong to different fields, and everything between them becomes the title:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
title is "Title", subtitle is "Subtitle"

measure
treble clef
c d e f
</template>
</div>

Page meta may sit anywhere in the source, before the music, after it, or between two measures. It does not open a measure or a stave, and it does not change anything around it:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
c d e f

title is "Written at the end"
page number is "2"
</template>
</div>

Read next: [Articulations](/docs/language/articulations)

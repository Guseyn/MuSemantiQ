# msq-svg

`msq-svg` engraves the music as an SVG score, and nothing else. It is the component every example in this documentation is written with.

Let's start with a simple example:

```html
<template is='msq-svg' data-font-sources='msqFontSources'>
  measure
  treble clef
  c d e f
</template>
```

```msq-svg
measure
treble clef
c d e f
```

## 1. The attributes

| Attribute | Default | What it does |
| --- | --- | --- |
| `data-font-sources` | none, it is required | The reference a `msq-font-loader` registered its fonts under |
| `data-file-name` | a random id of the element | The name of the downloaded file, without the extension |

That's all. Everything else about how the score looks (the music font, the size, the colours, the page width) is written in the music itself, with the style commands from the [MSQ language](/docs/language/style-reference).

## 2. The toolbar

Hover over the score, or move the focus into it with Tab, and three buttons appear in its top right corner:

| Button | What it does |
| --- | --- |
| Download | Downloads the score as `<data-file-name>.svg` |
| Open in a new tab | Opens the SVG on its own in a new tab |
| Copy | Copies the MSQ source of the score to the clipboard |

The toolbar is hidden the rest of the time so that it does not cover the music. A score wider than its container scrolls, and because its scrollbars are hidden, you can also scroll it with the arrow keys once it has the focus.

If the music has mistakes in it, the score is still drawn from everything the parser understood, and the mistakes are listed in a panel under it. More about that you can read in [Errors and troubleshooting](/docs/components/errors).

## 3. When to choose it

Choose `msq-svg` when the score is all you want to show: in an article, in a documentation page, in a list of many small examples. It is the cheapest of the components that engrave, because it asks the worker for the score only, and it loads no player and no sound font.

When the reader should also hear the music, use [msq-svg-midi](/docs/components/msq-svg-midi) instead. When the reader should be able to change it, use [msq-editor](/docs/components/msq-editor).

## 4. A worked example

Let's take a look at something a bit longer, with a downloaded file name of its own:

```html
<template
  is='msq-svg'
  data-font-sources='msqFontSources'
  data-file-name='a-short-piece'
>
  title is "A Short Piece"
  right subtitle is "Anonymous"

  measure
  treble clef
  time signature is 3:4
  key signature is g major
  1/4 g with dynamic "p"
  a
  b

  measure
  1/2 c5 dotted

  measure
  1/4 b a g

  measure
  1/2 g dotted
</template>
```

```msq-svg file-name=a-short-piece
title is "A Short Piece"
right subtitle is "Anonymous"

measure
treble clef
time signature is 3:4
key signature is g major
1/4 g with dynamic "p"
a
b

measure
1/2 c5 dotted

measure
1/4 b a g

measure
1/2 g dotted
```

As you can see, the title and the subtitle are part of the music rather than attributes of the element. Press the download button on this score, and the file is called `a-short-piece.svg`.

Read next: [msq-midi](/docs/components/msq-midi)

# The full style reference

This page gathers every style of a page in one place. Each of them is explained, with examples, on the page that introduces it; here they are only listed, so you can find a name or a default quickly.

As you remember from [Page format](/docs/language/page-format), every style is written the same way, on a line of its own: the name, `is`, and a value without quotes. Styles apply to the whole page, wherever they are written:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
background color is ivory
font size is 7
page line width is 700
page left and right paddings is 5
title top offset is 2
title font size is 6
empty measure width is 20

title is "Styled"

measure
treble clef
c d e f
measure
measure
</template>
</div>

## 1. Colours

A colour is a CSS colour name in lower case, a hex value of **3**, **4**, **6** or **8** digits, `rgb(r, g, b)` or `rgba(r, g, b, a)`. See [Colours](/docs/language/colours).

| Style | Also written as | Default |
|---|---|---|
| `background color` | `background colour`, `bg color`, `bg colour` | **#FDF5E6** |
| `font color` | `font colour` | **#121212** |
| `stave lines color` | `stave lines colour`, `staff lines color`, `staff lines colour` | **#343434** |
| `page border color` | `page border colour`, `border color`, `border colour` | transparent |

## 2. Fonts

A font is the name it was registered with in the font config, in any case. See [Fonts](/docs/language/fonts).

| Style | Default | Names on this site |
|---|---|---|
| `music font` | the first music font in the config, **bravura** here | **bravura**, **leland** |
| `text font` | the first text font in the config, **noto-serif** here | **noto-serif**, **noto-sans** |
| `chord letters font` | the first chord letters font in the config, **gentium plus** here | **gentium plus**, **gothic a1** |

## 3. Sizes

A size is a number. Two of them are in pixels; every other one is in intervals between stave lines, which means it is multiplied by the font size. See [Page format](/docs/language/page-format).

| Style | Also written as | Default | Unit | What it sizes |
|---|---|---|---|---|
| `font size` | `interval between stave lines` | **8.5** | pixels | the distance between two stave lines, and so everything else |
| `page line width` | | **844** | pixels | the length of a page line |
| `page height` | | as tall as the music | pixels | the height of the page |
| `interval between staves` | | **13** | stave-line intervals | the space between two staves |
| `interval between lines` | | **10** | stave-line intervals | the space between two page lines |
| `page left and right paddings` | | **8** | stave-line intervals | the space left and right of the page lines |
| `page top padding` | | **9** | stave-line intervals | the space above everything on the page |
| `page bottom padding` | | **9** | stave-line intervals | the space below the last page line |
| `page lines top offset` | | **10** | stave-line intervals | the space between the titles and the first page line |
| `title top offset` | | **0** | stave-line intervals | the space above the title |
| `subtitle top offset` | | **1.5** | stave-line intervals | the space between the title and the subtitle |
| `left and right subtitles top offset` | | **4** | stave-line intervals | the space above the left and right subtitles |
| `page number bottom offset` | | **3** | stave-line intervals | the distance of the page number from the bottom edge |
| `page border width` | | **0.05** | stave-line intervals | the thickness of the page border |
| `title font size` | | **5.4** | stave-line intervals | the title |
| `subtitle font size` | | **3.8** | stave-line intervals | the subtitle |
| `left subtitle font size` | | **3.2** | stave-line intervals | the left subtitle |
| `right subtitle font size` | | **3.2** | stave-line intervals | the right subtitle |
| `page number font size` | | **3.2** | stave-line intervals | the page number |
| `instrument font size` | `instrument title font size` | **3.4** | stave-line intervals | instrument titles |
| `empty measure width` | | **10** | stave-line intervals | the narrowest a measure can be |

A size set to **0** is the same as a size not set, so its default is used.

## 4. Page format

| Style | Values | Default |
|---|---|---|
| `page format` | **a3**, **a4**, **b4**, **c4** | none |

With a format set, the page is the size of that paper at **96** pixels per inch, and `page line width` and `page height` are ignored. See [Page format](/docs/language/page-format).

## 5. How styles affect each other

A few styles are not independent, and it helps to know which:

1. `font size` scales every size measured in stave-line intervals. When you change it, the paddings, offsets, intervals and text sizes change with it, and the music gets wider, but `page line width` stays where it is. So a bigger font size fits fewer units on a line, and a smaller one fits more.
2. How many units fit on a line depends on `page line width` against the spacing between units. When a line doesn't fit, you can make it longer, make the font size smaller, or compress units, which is explained in [Unit spacing](/docs/language/unit-spacing).
3. `page format` takes over `page line width` and `page height`, and the page line becomes the width of the paper minus `page left and right paddings`. So with a format, the paddings are what decides how long a page line is.
4. `page lines top offset` only applies when the page has a title, a subtitle, or a left or right subtitle.
5. `page border width` is only visible once `page border color` is set, because the border is transparent by default.

## 6. Close to styles, but not styles

A few commands also apply to the whole page, but they are not written as `<name> is <value>`, so they are not in the tables above:

| Command | What it does | Page |
|---|---|---|
| `compress units by N times` | brings units closer together, on the page or `in line N` | [Unit spacing](/docs/language/unit-spacing) |
| `stretch units by N times` | moves units further apart, on the page or `in line N` | [Unit spacing](/docs/language/unit-spacing) |
| `hide the last measure` | hides the empty last measure of the page | [Unit spacing](/docs/language/unit-spacing) |

The settings that change what is heard rather than what is drawn are listed in [MIDI settings](/docs/language/midi-settings).

Read next: [Handling errors](/docs/language/handling-errors)

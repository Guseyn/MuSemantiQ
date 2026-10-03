# Page format

The size of a page, the space around the music on it and between its parts are all styles. You have already met some styles on [Colours](/docs/language/colours) and [Fonts](/docs/language/fonts); this page is about the ones that are sizes.

Let's start with a simple example:

```msq-editor opens-with=text
page line width is 500

measure
treble clef
c d e f
```

Every style is written the same way: its name, `is`, and a value, all on one line. The value is written as it is, without quotes: `page line width is 500`, not `page line width is "500"`. A number is just a number, without units like `px`. A style can be written anywhere on the page, and it applies to the whole page, but it reads best at the top.

## 1. Page line width

`page line width` is how long a page line is. By default it is **844**, and unlike every other size on this page it is written in pixels: it doesn't change when you change the font size.

## 2. Font size

All the other sizes are based on one number: the `interval between stave lines` (not to be mistaken for the `interval between staves`). By default it is **8.5**, and `font size` is another name for it:

```msq-editor opens-with=text
font size is 12

measure
treble clef
c d e f
```

As you can see, everything got bigger: the stave, the notes, the spaces between them. The only thing that stays the same is the width of the page line. Now, when you set other sizes, you need to keep in mind that the numbers you give are multiplied by the `interval between stave lines`. For example, by default `interval between staves` is **13**. But it's not just **13** pixels, it's **13** intervals between stave lines. So if you increase or decrease the font size, all the other intervals and elements are increased or decreased in proportion.

## 3. Interval between staves, interval between lines

Let's change the `interval between staves` and the `interval between lines`, which is the space between page lines:

```msq-editor opens-with=text
interval between staves is 8
interval between lines is 8

measure
stave with treble clef
c d e f
stave with bass clef
c3 d3 e3 f3

new line
stave
g a b c5
stave
g3 a3 b3 c
```

By default the interval between staves is **13**, and the interval between lines is **10**.

## 4. Paddings

A page has paddings around the music. The left and right paddings are always equal, and that's why the style has such a name:

```msq-editor opens-with=text
page left and right paddings is 4
page top padding is 4
page bottom padding is 6

measure
treble clef
c d e f
```

By default the left and right paddings are **8**, and the top and bottom paddings are **9**.

## 5. Titles and the page number

If you want to change the distance between the titles and the first page line, you can set `page lines top offset`, **10** by default. It only matters when the page has a title or a subtitle:

```msq-editor opens-with=text
page lines top offset is 4

title is "Title"

measure
treble clef
c d e f
```

The titles themselves have top offsets too. Each one is the distance from whatever is above it: the top padding for the title, the title for the subtitle, the subtitle for the left and right subtitles:

```msq-editor opens-with=text
title top offset is 3
subtitle top offset is 3
left and right subtitles top offset is 3

title is "Title"
subtitle is "Subtitle"
left subtitle is "Left subtitle"
right subtitle is "Right subtitle"

measure
treble clef
c d e f
```

By default they are **0**, **1.5** and **4**. The page number sits at the bottom of the page, and you can set how far from the bottom edge it is, **3** by default:

```msq-editor opens-with=text
page number bottom offset is 8

page number is "4"

measure
treble clef
c d e f
```

As you remember from [Fonts](/docs/language/fonts), the titles, the page number and instrument titles have their own font sizes:

```msq-editor opens-with=text
title font size is 8
subtitle font size is 5
left subtitle font size is 4
right subtitle font size is 4
page number font size is 2.5
instrument title font size is 4

title is "Title"
subtitle is "Subtitle"
left subtitle is "Left subtitle"
right subtitle is "Right subtitle"
page number is "7"

measure
instrument title is "Violin" for stave 1
treble clef
c d e f
```

## 6. Empty measure width

A measure is never narrower than `empty measure width`, and a measure without units is exactly that wide. By default it is **10**, but you can change it:

```msq-editor opens-with=text
empty measure width is 20

measure
measure
measure
measure
```

## 7. Page height

By default a page is as tall as its music: it ends at the bottom padding below the last page line. You can set a fixed `page height` instead, in pixels, like the page line width:

```msq-editor opens-with=text
page height is 400

measure
treble clef
c d e f
```

A fixed height doesn't grow with the music, so it's worth setting only when every page of a score has to be the same height.

## 8. Page format

If you want to print a score on paper of a certain size, you can set `page format`:

```msq-editor opens-with=text
page format is a4

measure
treble clef
c d e f
```

There are four formats supported at the moment, and each one is the size of the paper in inches, at **96** pixels per inch, the way CSS counts them:

| Format | Paper | Page width × height |
|---|---|---|
| `a3` | 11.7 × 16.5 in | **1123.2** × **1584** |
| `a4` | 8.3 × 11.7 in | **796.8** × **1123.2** |
| `b4` | 9.8 × 13.9 in | **940.8** × **1334.4** |
| `c4` | 9 × 12.8 in | **864** × **1228.8** |

The format is written in lower case. It's important to mention that a format sets both the width and the height of the whole page, so it takes over `page line width` and `page height`: when a format is set, those two are ignored. The page line becomes as long as the paper is wide, minus the left and right paddings.

The page format is calculated pretty roughly, because the size a page is printed at depends on your printer and your screen. If a format doesn't work well for you, you can find a size that does with `page line width` and `page height`.

## 9. Page border

As you remember from [Colours](/docs/language/colours), a page has a border that is transparent by default. When you give it a colour, you can also make it thicker than its default **0.05**:

```msq-editor opens-with=text
page border width is 1.1
page border color is #454545

measure
treble clef
c d e f
```

## 10. Zero and the defaults

It's important to mention that you cannot set a size to **0**. A size set to **0** is the same as a size not set at all, so its default is used: `page top padding is 0` gives you the default padding of **9**, not a page without one.

All the styles, with all their defaults and all their spellings, are gathered in one table in [The full style reference](/docs/language/style-reference).

Read next: [The full style reference](/docs/language/style-reference)

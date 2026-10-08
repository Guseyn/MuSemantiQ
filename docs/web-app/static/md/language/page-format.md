# Page Format

The size of a page and the spaces on it are styles. You already know some styles from [Colours](/docs/language/colours) and [Fonts](/docs/language/fonts). This page is about the styles that are sizes.

Let's start with a simple example:

```msq-editor opens-with=text
page line width is 500

measure
treble clef
c d e f
```

You write every style the same way:

- its name, `is`, and a value, on one line;
- the value without quotes: `page line width is 500`, not `page line width is "500"`;
- a number without units like `px`.

A style applies to the whole page, wherever you write it, but it's easier to read at the top.

## 1. Page Line Width

`page line width` is the length of a page line. By default, it's **844**. Unlike the other sizes on this page, it's in pixels, so it doesn't change when you change the font size.

## 2. Font Size

All the other sizes are based on one number: the `interval between stave lines` (not the `interval between staves`). By default, it's **8.5**, and `font size` is another name for it:

```msq-editor opens-with=text
font size is 12

measure
treble clef
c d e f
```

As you can see, everything got bigger: the stave, the notes, the spaces between them. Only the width of the page line stays the same.

When you set other sizes, remember that they are multiplied by the `interval between stave lines`. For example, by default `interval between staves` is **13**. That's not **13** pixels, it's **13** intervals between stave lines. So when you change the font size, all the other sizes change with it.

## 3. Interval Between Staves, Interval Between Lines

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

A page has paddings around the music. The left and right paddings are always equal, so they are one style:

```msq-editor opens-with=text
page left and right paddings is 4
page top padding is 4
page bottom padding is 6

measure
treble clef
c d e f
```

By default, the left and right paddings are **8**, and the top and bottom paddings are **9**.

## 5. Titles and the Page Number

`page lines top offset` is the distance between the titles and the first page line, **10** by default. It matters only when the page has a title or a subtitle:

```msq-editor opens-with=text
page lines top offset is 4

title is "Title"

measure
treble clef
c d e f
```

The titles have top offsets too. Each one is the distance from what is above it:

- for the title, from the top padding;
- for the subtitle, from the title;
- for the left and right subtitles, from the subtitle.

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

By default, they are **0**, **1.5** and **4**. The page number is at the bottom of the page. You can set its distance from the bottom edge, **3** by default:

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

## 6. Empty Measure Width

A measure is never narrower than `empty measure width`. A measure without units is exactly that wide. By default, it's **10**, but you can change it:

```msq-editor opens-with=text
empty measure width is 20

measure
measure
measure
measure
```

## 7. Page Height

By default, a page is as tall as its music: it ends at the bottom padding below the last page line. You can set a fixed `page height` instead. It's in pixels, like the page line width:

```msq-editor opens-with=text
page height is 400

measure
treble clef
c d e f
```

A fixed height doesn't grow with the music. Set it only when every page of a score must have the same height.

## 8. Page Format

If you want to print a score on paper of a certain size, set `page format`:

```msq-editor opens-with=text
page format is a4

measure
treble clef
c d e f
```

Four formats are supported at the moment. Each one is the paper size in inches, at **96** pixels per inch, as in CSS:

| Format | Paper | Page width × height |
|---|---|---|
| `a3` | 11.7 × 16.5 in | **1123.2** × **1584** |
| `a4` | 8.3 × 11.7 in | **796.8** × **1123.2** |
| `b4` | 9.8 × 13.9 in | **940.8** × **1334.4** |
| `c4` | 9 × 12.8 in | **864** × **1228.8** |

- The format is written in lower case.
- A format sets both the width and the height of the page. So when a format is set, `page line width` and `page height` are ignored.
- The page line is as long as the paper is wide, minus the left and right paddings.

The page format is only a rough size, because the printed size depends on your printer and your screen. If a format doesn't work for you, use `page line width` and `page height` instead.

## 9. Page Border

As you remember from [Colours](/docs/language/colours), the page border is transparent by default. When you give it a colour, you can also make it thicker than its default **0.05**:

```msq-editor opens-with=text
page border width is 1.1
page border color is #454545

measure
treble clef
c d e f
```

## 10. Zero and the Defaults

It's important to mention that you cannot set a size to **0**. A size of **0** means the size isn't set, so the default is used: `page top padding is 0` gives you the default padding of **9**, not no padding.

All the styles, with their defaults and spellings, are in one table in [The full style reference](/docs/language/style-reference).

Read next: [The full style reference](/docs/language/style-reference)

# The Full Style Reference

This page lists every style in one place, so you can quickly find a name or a default. Each style is explained, with examples, on its own page.

As you remember from [Page format](/docs/language/page-format), you write every style on its own line: the name, `is`, and a value without quotes. A style applies to the whole page, wherever you write it:

```msq-editor opens-with=text
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
```

## 1. Colours

A colour is one of these: a CSS colour name in lower case, a hex value of **3**, **4**, **6** or **8** digits, `rgb(r, g, b)` or `rgba(r, g, b, a)`. See [Colours](/docs/language/colours).

| Style | Also written as | Default |
|---|---|---|
| `background color` | `background colour`, `bg color`, `bg colour` | **#FDF5E6** |
| `font color` | `font colour` | **#121212** |
| `stave lines color` | `stave lines colour`, `staff lines color`, `staff lines colour` | **#343434** |
| `page border color` | `page border colour`, `border color`, `border colour` | transparent |

## 2. Fonts

A font is its name in the font config. Upper or lower case doesn't matter. See [Fonts](/docs/language/fonts).

| Style | Default | Names on this site |
|---|---|---|
| `music font` | the first music font in the config, **bravura** here | **bravura**, **leland** |
| `text font` | the first text font in the config, **noto-serif** here | **noto-serif**, **noto-sans** |
| `chord letters font` | the first chord letters font in the config, **gentium plus** here | **gentium plus**, **gothic a1** |

## 3. Sizes

A size is a number. `page line width` and `page height` are in pixels. The others, except `font size` itself, are in intervals between stave lines, so they are multiplied by the font size. See [Page format](/docs/language/page-format).

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

A size of **0** means the size isn't set, so its default is used.

## 4. Page Format

| Style | Values | Default |
|---|---|---|
| `page format` | **a3**, **a4**, **b4**, **c4** | none |

With a format, the page is the size of that paper at **96** pixels per inch, and `page line width` and `page height` are ignored. See [Page format](/docs/language/page-format).

## 5. How Styles Affect Each Other

Some styles affect each other:

1. `font size` scales every size in stave-line intervals: paddings, offsets, intervals and text sizes. The music gets wider, but `page line width` stays the same. So a bigger font size fits fewer units on a line, and a smaller one fits more.
2. How many units fit on a line depends on `page line width` and the spacing between units. When a line doesn't fit, you can make it longer, make the font size smaller, or compress units (see [Unit spacing](/docs/language/unit-spacing)).
3. `page format` replaces `page line width` and `page height`. The page line is the paper width minus `page left and right paddings`. So with a format, the paddings decide how long a page line is.
4. `page lines top offset` works only when the page has a title, a subtitle, or a left or right subtitle.
5. `page border width` is visible only when `page border color` is set, because the border is transparent by default.

## 6. Close to Styles, but Not Styles

These commands also apply to the whole page, but they are not written as `<name> is <value>`, so they are not in the tables above:

| Command | What it does | Page |
|---|---|---|
| `compress units by N times` | brings units closer together, on the page or `in line N` | [Unit spacing](/docs/language/unit-spacing) |
| `stretch units by N times` | moves units further apart, on the page or `in line N` | [Unit spacing](/docs/language/unit-spacing) |
| `hide the last measure` | hides the empty last measure of the page | [Unit spacing](/docs/language/unit-spacing) |

The settings that change what you hear, not what you see, are in [MIDI settings](/docs/language/midi-settings).

Read next: [Handling errors](/docs/language/handling-errors)

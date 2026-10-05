# Fonts

A page is drawn with three fonts: a music font, a text font and a font for chord letters. Each one is a style, so you choose it the same way you choose a colour.

## 1. Music font

The music font draws everything that is music: note heads, flags, rests, clefs, accidentals, articulations, ornaments, braces. There are two music fonts on this site: **Bravura**, which is the default, and **Leland**:

```msq-editor opens-with=text
music font is leland

measure
treble clef
key signature is d major
time signature is 3:4
1/8 d beamed, f, a not beamed
1/8 rest
1/4 d5 with staccato
```

Compare it with the same music in **Bravura**:

```msq-editor opens-with=text
music font is bravura

measure
treble clef
key signature is d major
time signature is 3:4
1/8 d beamed, f, a not beamed
1/8 rest
1/4 d5 with staccato
```

## 2. Text font

The text font draws every word on the page: the title and subtitles, lyrics, text labels, tempo marks, instrument titles, measure numbers. There are two text fonts on this site: **noto-serif**, which is the default, and **noto-sans**:

```msq-editor opens-with=text
text font is noto-serif

title is "Title"
subtitle is "Subtitle"
left subtitle is "Left subtitle"
right subtitle is "Right subtitle"

measure
treble clef
c d e f
```

```msq-editor opens-with=text
text font is noto-sans

title is "Title"
subtitle is "Subtitle"
left subtitle is "Left subtitle"
right subtitle is "Right subtitle"

measure
treble clef
c d e f
```

A text font comes in two weights, regular and bold. You don't choose the weight: the bold one is used where the notation asks for it, for example in tempo marks and in the number over a multi-measure rest.

## 3. Chord letters font

Chord letters have a font of their own, because they need figures that a text font does not draw well. There are two of them on this site: **gentium plus**, which is the default, and **gothic a1**:

```msq-editor opens-with=text
chord letters font is gentium plus

measure
treble clef
1/4 c with chord "C^halfdim13"
1/4 e with chord "Cmaj13"
1/4 g with chord "C13sharp5"
1/4 c5 with chord "C/F^sharp"
```

```msq-editor opens-with=text
chord letters font is gothic a1

measure
treble clef
1/4 c with chord "C^halfdim13"
1/4 e with chord "Cmaj13"
1/4 g with chord "C13sharp5"
1/4 c5 with chord "C/F^sharp"
```

## 4. Where the names come from

The names above are not a part of the language. A page can only name a font that has been registered before it is drawn, and the names are whatever the font config that registered them says. On this site the config names **bravura** and **leland**, **noto-serif** and **noto-sans**, **gentium plus** and **gothic a1**, and that's why exactly these six work here. If you name a font that is not registered, the line is reported as an error, and the page is drawn with the default font. The default is the first font of each kind in the config.

The names are not case sensitive: `music font is Leland` works as well as `music font is leland`.

How to register fonts, both in the browser and in Node, you can read in [Fonts and font config](/docs/components/overview#1-msq-font-loader) and [setupFonts](/docs/api/overview#1-setupfonts).

## 5. Why a music font is two files

A text font is one file. A music font is two: the font itself (an `.otf` file) and a JavaScript table generated from it. The table holds the outline of every glyph MuSemantiQ draws, already measured in stave-line spacings, together with the small corrections that put each glyph exactly where it belongs on a stave. That is what lets the drawer place a glyph without reading the font at the moment of drawing. The `.otf` file is still needed for the one glyph drawn at a size nobody can know in advance: a brace, which has to reach across however many staves it connects.

The tables are generated from SMuFL fonts by the tool in `tools/smufl/`, and at the moment only **Bravura** and **Leland** have one. That's why only these two can be listed as music fonts. How to make a table for another SMuFL font you can read in [SMuFL to music-js font](/docs/tools/smufl-font-generator).

## 6. Font sizes

There is no single size for the music font. The size of everything is measured against one number, the `interval between stave lines`, and `font size` is just another name for it. By default it is **8.5**. When you make it bigger, the whole score gets bigger in proportion: the glyphs, the spaces between them, the staves, the text.

The text on a page can also be sized on its own:

| Style | Default | What it sizes |
|---|---|---|
| `font size`, `interval between stave lines` | **8.5** | everything on the page |
| `title font size` | **5.4** | the title |
| `subtitle font size` | **3.8** | the subtitle |
| `left subtitle font size` | **3.2** | the left subtitle |
| `right subtitle font size` | **3.2** | the right subtitle |
| `page number font size` | **3.2** | the page number |
| `instrument font size`, `instrument title font size` | **3.4** | instrument titles |

It's important to mention that every size except the first one is written in stave-line spacings, not in pixels. **5.4** for the title means five and four tenths of the interval between stave lines, so the title grows together with the music when you change `font size`. How these are written, with examples, is explained in [Page format](/docs/language/page-format), together with the other sizes of a page.

Read next: [Page format](/docs/language/page-format)

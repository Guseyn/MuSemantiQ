# Fonts

A page uses three fonts: a music font, a text font and a font for chord letters. You choose each one the same way you choose a colour.

## 1. Music Font

The music font draws all the music symbols: note heads, flags, rests, clefs, accidentals, articulations, ornaments, braces. This site has two music fonts: **Bravura** (the default) and **Leland**:

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

## 2. Text Font

The text font draws every word on the page: the title and subtitles, lyrics, text labels, tempo marks, instrument titles, measure numbers. This site has two text fonts: **noto-serif** (the default) and **noto-sans**:

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

A text font has two weights, regular and bold. You don't choose the weight. Bold is used where notation needs it, for example in tempo marks and in the number over a multi-measure rest.

## 3. Chord Letters Font

Chord letters have their own font, because a text font doesn't draw their symbols well. This site has two: **gentium plus** (the default) and **gothic a1**:

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

## 4. Where the Names Come From

The names above are not part of the language. They come from the font config:

- A page can use only a font that was registered before the page is drawn.
- A font's name is the name it has in the font config. This site's config has **bravura** and **leland**, **noto-serif** and **noto-sans**, **gentium plus** and **gothic a1**. That's why exactly these six work here.
- If you name a font that isn't registered, you get an error on that line, and the page uses the default font.
- The default is the first font of each kind in the config.

The names are not case sensitive: `music font is Leland` works as well as `music font is leland`.

How to register fonts in the browser and in Node, you can read in [Fonts and font config](/docs/components/overview#1-msq-font-loader) and [setupFonts](/docs/api/overview#1-setupfonts).

## 5. Why a Music Font Is Two Files

A text font is one file. A music font is two files:

- the font itself, an `.otf` file;
- a JavaScript table made from it.

The table has the outline of every glyph MSQ draws, measured in stave-line spacings, and small corrections that put each glyph in the right place on a stave. So the drawer doesn't need to read the font while it draws. The `.otf` file is still needed for braces, because a brace has to be as tall as the staves it connects, and nobody knows that size in advance.

The tables are made from SMuFL fonts by the tool in `tools/smufl/`. At the moment, only **Bravura** and **Leland** have a table, so only these two can be music fonts. How to make a table for another SMuFL font, you can read in [SMuFL to music-js font](/docs/tools/smufl-font-generator).

## 6. Font Sizes

The music font has no size of its own. Everything is sized from one number, the `interval between stave lines`, and `font size` is another name for it. By default, it's **8.5**. Make it bigger, and the whole score gets bigger: the glyphs, the spaces between them, the staves, the text.

You can also size the text separately:

| Style | Default | What it sizes |
|---|---|---|
| `font size`, `interval between stave lines` | **8.5** | everything on the page |
| `title font size` | **5.4** | the title |
| `subtitle font size` | **3.8** | the subtitle |
| `left subtitle font size` | **3.2** | the left subtitle |
| `right subtitle font size` | **3.2** | the right subtitle |
| `page number font size` | **3.2** | the page number |
| `instrument font size`, `instrument title font size` | **3.4** | instrument titles |

It's important to mention that every size except the first one is in stave-line spacings, not in pixels. **5.4** for the title means 5.4 intervals between stave lines, so the title grows with the music when you change `font size`. Examples of these, and the other sizes of a page, are in [Page format](/docs/language/page-format).

Read next: [Page format](/docs/language/page-format)

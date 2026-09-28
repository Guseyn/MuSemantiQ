# SMuFL to music-js font

`tools/smufl/generate-smufl-js-font.js` traces every glyph MuSemantiQ draws out of a SMuFL `.otf` and writes the music-js font the drawer reads. The [Font generator](/docs/dev-tools/font-generator) page runs this same script; this page is about running it yourself.

## 1. The problem it solves

The drawer does not draw text with a font file. Every music sign on a page (a notehead, a clef, a flag) is an SVG path, placed by the drawer at a position it computes from the stave-line interval. So what it needs from a font is the outline of each glyph as path data, at a known scale, plus the corrections that say where each one sits. A `.otf` has the outlines but not in that form, and it has none of the corrections.

A music-js font is that form. `src/drawer/font/music-js/bravura.js` is a function of the interval that returns an object with one entry per glyph: the codepoint, the traced points, and values like `yCorrection` and `yOffset`. Tracing it once and committing the result means the engine never has to parse outlines per page, and the corrections, which are set by eye, have somewhere to live.

## 2. Running it

It takes two arguments, the font and the file to write:

```bash
node tools/smufl/generate-smufl-js-font.js src/drawer/font/music/Petaluma.otf src/drawer/font/music-js/petaluma.js
```

It prints one line for each glyph the font does not have, then a count, then where it wrote:

```text
  ! noteDot.points: U+E920 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
  ! Ped.points: U+F434 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
  ! Soft.points: U+F435 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
184 point arrays traced, 3 missing (3 drawn as "?")
Wrote /…/src/drawer/font/music-js/petaluma.js
```

It takes well under a second. Without both arguments it prints its usage and exits with **1**.

**Important note:** it overwrites the output file without asking. A music-js font that already exists has been tuned by hand, and generating it again starts every correction over. The page asks before it does that; the command does not.

## 3. What it writes

The file has the same shape as `bravura.js`. For each glyph, the codepoint is written as a `\uXXXX` escape, so it is readable in an editor, and the points are traced the way the committed fonts were: the character drawn at `musicFontSourceSize × interval` with an interval of **8.5**, moved to the top-left corner, and every coordinate written as `n.nn * intervalBetweenStaveLines`, with each command letter on its own line.

A few glyphs are engraved smaller than the rest, like the time-signature digits, and their scaffold entries carry a `scale` (**0.95** for the digits). Those are traced at the smaller size rather than shrunk afterwards, which keeps the rounding of the curves honest.

A glyph the font does not have is drawn as a question mark: the font's own **?** if it has one, and otherwise the **?** of `src/drawer/font/text/NotoSerif-Regular.ttf`. A SMuFL font almost never carries ASCII, so it is nearly always the borrowed one. The reason it is not left empty is that an empty path has no bounding box, and that surfaces much later as a `NaN` thrown from somewhere unrelated to the font.

## 4. The scaffold

What the file contains is not decided by the font. It comes from `tools/smufl/scaffold.js`, which is the shape of a music-js font written as data: **183** glyphs, **224** scalar values and **10** groups, in the order the file is written in. There are three kinds of node:

| Kind | What it is | Example |
| --- | --- | --- |
| `glyph` | a glyph the drawer expects: its name, its SMuFL codepoint, which point arrays it carries, and any adjustments under `rest` | `accent`, traced from `` into `points`, with a `yOffset` |
| `scalar` | a single number, and how it is written back out (`unit`) | `staveLineHeight`, **0.12** × the interval |
| `group` | a named object holding more nodes | `yCorrectionsForMidMeasureClefs` |

A glyph with several point fields is traced one character per field, in order: `fermata` is `` into `upPoints` and `downPoints`.

The adjustment values in the scaffold are the **mean of `bravura.js` and `leland.js`**. Nothing in the generator computes a correction, because no font file carries one. So a new font starts from the midpoint of the two hand-tuned ones rather than from either, and it is then tuned in the [Font viewer](/docs/dev-tools/font-viewer).

## 5. Adding a glyph the scaffold does not name

A new glyph is a new node in `scaffold.js`, in the place you want it written:

```js
{
  kind: 'glyph',
  name: "accent",
  smufl: '',
  fields: [ 'points' ],
  rest: [
    { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
  ]
},
```

That is the scaffold's own `accent`, and a new entry takes the same shape: a `name` the drawer will look it up by, the SMuFL codepoint, the point fields, and any adjustments it needs, starting from sensible values.

The glyph then has to get into the fonts that already exist, and there are two ways to do it:

1. Generate them again. That is simple, and it throws away every correction tuned into them by hand, so it is right only for a font nobody has tuned yet.
2. Add the entry to each `src/drawer/font/music-js/*.js` by hand, in the same formatting, with an empty `points: [],` for now. Then choose it in the font viewer, which offers every glyph the scaffold names, trace it, and press **Apply**, which fills that array in. Apply only writes an entry that is already in the file, which is why the empty array has to be there first.

It's important to mention that a glyph in the table is only data. Something in `src/drawer/elements/` has to draw it, by its name, before it appears on any page.

Read next: [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder)

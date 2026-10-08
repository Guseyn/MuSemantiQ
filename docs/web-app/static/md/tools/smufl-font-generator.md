# SMuFL to music-js font

<nav is="docs-contents"></nav>

`tools/smufl/generate-smufl-js-font.js` takes a SMuFL `.otf` font and writes a music-js font: the file with every glyph as SVG path points that the drawer uses. The [Font generator](/docs/dev-tools/font-generator) page in the dev tools runs the same script.

## How to Run It

From the root of the repository, give it the font and the file to write:

```bash
node tools/smufl/generate-smufl-js-font.js src/drawer/font/music/Petaluma.otf src/drawer/font/music-js/petaluma.js
```

It prints the glyphs the font doesn't have, and where it wrote the file:

```text
  ! Soft.points: U+F435 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
184 point arrays traced, 3 missing (3 drawn as "?")
Wrote /…/src/drawer/font/music-js/petaluma.js
```

## What You Get

- A file with the same shape as `src/drawer/font/music-js/bravura.js`: one entry per glyph, with its codepoint, its points, and corrections like `yOffset`.
- A glyph the font doesn't have is drawn as a **?**, so it never breaks the page.
- The list of glyphs comes from `tools/smufl/scaffold.js`, not from the font. To add a glyph, add it to the scaffold.
- The corrections start as the average of **Bravura** and **Leland**. You tune them by eye in the [Font viewer](/docs/dev-tools/font-viewer).

## What to Remember

- It overwrites the output file without asking. If you already tuned that font, your corrections are gone.
- A new glyph in the table is only data. Something in `src/drawer/elements/` has to draw it by its name.
- Only **Bravura** and **Leland** can be used in font configs at the moment, because only they have tables.

Read next: [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder)

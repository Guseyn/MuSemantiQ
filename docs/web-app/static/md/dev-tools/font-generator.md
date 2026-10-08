# Font Generator

<nav is="docs-contents"></nav>

The font generator turns a SMuFL `.otf` into a music-js font, the table the drawer reads. It does the same as the command in [SMuFL to music-js font](/docs/tools/smufl-font-generator).

Open https://127.0.0.1:8889/html/font-generator.html:

![Font generator](/images/dev-tools/font-generator.png)

## How to Use It

1. Choose an `.otf`, or drop it on the page.
2. Press **Generate the music-js font**. It takes a few seconds.
3. Read what the generator printed. Each line that starts with `!` is a glyph the font doesn't have. That glyph is drawn as **?**.

The `.otf` is saved to `src/drawer/font/music/`, and the table is written to `src/drawer/font/music-js/<name>.js`. The name is the file name in lower case, with anything that is not a letter or a digit turned into a dash: `Petaluma.otf` becomes `petaluma`, and you write `music font is petaluma` in the music.

**What is there now** lists every music font on disk, and whether it has a table yet.

## Good to Know

- A table that already exists is never replaced silently. The page asks you first, because a table is usually tuned by hand.
- What you get is a starting point, not a finished font. Where each glyph sits starts from the middle of Bravura and Leland. Open the font in the [Font viewer](/docs/dev-tools/font-viewer) and tune the glyphs by eye.
- The dev tools find a new font on their own. Everywhere else you add it to the font config: [setupFonts](/docs/api/overview#1-setupfonts) in Node.js, and [`<msq-font-loader>`](/docs/components/overview#1-msq-font-loader) in the browser.

Read next: [Magenta soundfont generator](/docs/dev-tools/soundfont-generator)

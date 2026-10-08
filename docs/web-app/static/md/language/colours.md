# Colours

You can set four colours on a page: the background, the font, the stave lines and the page border. You write each one as its name, `is`, and a value.

Let's start with the background:

```msq-editor opens-with=text
background color is lavenderblush

measure
treble clef
c d e f
```

By default, the background is **#FDF5E6**. You can write a colour in three ways:

- a CSS colour name, like **lavenderblush**;
- a hex value;
- `rgb()`.

So these two pages look the same as the one above:

```msq-editor opens-with=text
background color is #FFF0F5

measure
treble clef
c d e f
```

```msq-editor opens-with=text
background color is rgb(255, 240, 245)

measure
treble clef
c d e f
```

- A hex value can have **3**, **4**, **6** or **8** digits, so it can have transparency.
- `rgba()` works too, with the alpha as the fourth number.
- A colour name must be in lower case, as in CSS: **lavenderblush** works, **LavenderBlush** doesn't.

## 1. Font Colour and Stave Lines Colour

In the same way you can set `font color` and `stave lines color`:

```msq-editor opens-with=text
background color is lavenderblush
stave lines color is #2A2922
font color is rgb(40, 40, 60)

measure
treble clef
c d e f
```

The font colour is not only for text. It's the colour of everything on the page except the stave lines: note heads, stems, beams, clefs, barlines, slurs, titles and labels. By default, it's **#121212**.

The stave lines have their own colour, **#343434** by default, so you can make them lighter than the music.

## 2. Page Border Colour

By default, the page border is transparent, so you don't see it. Give it a colour, and it's drawn:

```msq-editor opens-with=text
page border color is #414A4C

measure
treble clef
c d e f
```

The border's thickness is a size, not a colour, so it's in [Page format](/docs/language/page-format).

## 3. Spellings

You can write `color` or `colour`, and some names have other forms:

| Style | Also written as |
|---|---|
| `background color` | `background colour`, `bg color`, `bg colour` |
| `font color` | `font colour` |
| `stave lines color` | `stave lines colour`, `staff lines color`, `staff lines colour` |
| `page border color` | `page border colour`, `border color`, `border colour` |

```msq-editor opens-with=text
bg colour is honeydew
staff lines colour is #7A7A7A
border colour is darkslategray

measure
treble clef
c d e f
```

## 4. Where to Write Them

A colour is set for the whole page, wherever you write it. It's easier to read when all the styles are at the top, before the music. If you set the same colour twice, the last one wins.

Read next: [Fonts](/docs/language/fonts)

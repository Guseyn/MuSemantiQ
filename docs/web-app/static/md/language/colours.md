# Colours

A page has four colours you can set: the background, the font, the stave lines and the page border. Each of them is a style, and a style is written as its name, `is`, and a value.

Let's start with the background:

```msq-editor opens-with=text
background color is lavenderblush

measure
treble clef
c d e f
```

By default the background is **#FDF5E6**. A colour can be written in three ways: as a CSS colour name like **lavenderblush**, as a hex value, or with `rgb()`. So both of the following give you the same page as the one above:

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

A hex value can have **3**, **4**, **6** or **8** digits, so it can carry transparency, and `rgba()` works as well, with the alpha as the fourth number. It's important to mention that a colour name has to be written in lower case, the way CSS lists them: **lavenderblush** works, **LavenderBlush** does not.

## 1. Font colour and stave lines colour

In the same way you can set `font color` and `stave lines color`:

```msq-editor opens-with=text
background color is lavenderblush
stave lines color is #2A2922
font color is rgb(40, 40, 60)

measure
treble clef
c d e f
```

The font colour is not only the colour of the text. It is the colour of everything drawn on the page except the stave lines: note heads, stems, beams, clefs, barlines, slurs, and every title and label. By default it is **#121212**. The stave lines have a colour of their own, **#343434** by default, so you can make them lighter than the music on top of them.

## 2. Page border colour

By default the page has no border: its colour is transparent. As soon as you give it a colour, it is drawn:

```msq-editor opens-with=text
page border color is #414A4C

measure
treble clef
c d e f
```

How thick the border is, is a size rather than a colour, so it is explained in [Page format](/docs/language/page-format).

## 3. Spellings

You can write both `color` and `colour`, and some of the names have a shorter or a different form:

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

## 4. Where to write them

A colour is a page-level style. Wherever you write it, it colours the whole page, so the text reads best when all the styles are at the top, before the music. If you set the same colour twice, the last one wins.

Read next: [Fonts](/docs/language/fonts)

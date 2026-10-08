# Titles and Page Meta

Every page can have a title, subtitles and a page number. MSQ calls them page meta, because they belong to the page, not to a measure.

Let's start with a simple example:

```msq-editor opens-with=text
title is "A Short Piece"
left subtitle is "Anonymous"
right subtitle is "1897"
page number is "1"

measure
treble clef
c d e f
```

## 1. Title and Subtitles

There are four text fields at the top of a page. You write each of them as the name of the field, `is`, and the text in quotes:

```msq-editor opens-with=text
title is "Title"
subtitle is "Subtitle"
left subtitle is "Left subtitle"
right subtitle is "Right subtitle"

measure
treble clef
c d e f
```

The title and the subtitle are in the centre above the music. The left subtitle is on the left, and the right subtitle is on the right.

Some fields have other names, and you can use any of them:

| Field | You can also write |
| --- | --- |
| `subtitle` | `author`, `description` |
| `left subtitle` | `composer`, `arrangement` |

```msq-editor opens-with=text
title is "Prelude"
subtitle is "from the First Book"
composer is "J. S. Bach"
right subtitle is "1722"

measure
treble clef
1/4 c e g c5

measure
1/4 b g d b3
```

## 2. Page Number

It's really easy to set a number for a page:

```msq-editor opens-with=text
page number is "6"

measure
treble clef
c d e f
```

It's shown at the bottom of the page, in the centre. The value is in quotes, so you can write the number in any format:

```msq-editor opens-with=text
page number is "6/12"

measure
treble clef
c d e f
```

## 3. The Value Is Always in Quotes

It's important to mention that the value is always in quotes. Without them, it's not recognised as page meta. The value is everything between the first and the last quote, so you can use quotes inside it:

```msq-editor opens-with=text
title is ""Title with quotes""

measure
treble clef
c d e f
```

To write a title or a subtitle on several lines, separate the lines with **\n**:

```msq-editor opens-with=text
title is "First line\nSecond line"
right subtitle is "Op. 1\nNo. 2"

measure
treble clef
c d e f
```

## 4. One Field per Line

Each field must be on its own line. If you put two fields on one line, everything between the first and the last quote becomes the title:

```msq-editor opens-with=text
title is "Title", subtitle is "Subtitle"

measure
treble clef
c d e f
```

Page meta can be anywhere in the text: before the music, after it, or between two measures. It doesn't start a measure or a stave, and it doesn't change anything around it:

```msq-editor opens-with=text
measure
treble clef
c d e f

title is "Written at the end"
page number is "2"
```

Read next: [Articulations](/docs/language/articulations)

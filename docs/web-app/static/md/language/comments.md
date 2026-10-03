# Comments

It's possible to add comments to the music. They don't get rendered, they are just notes for yourself or for whoever reads the text after you.

Let's start with a simple example:

```msq-editor opens-with=text
comment: "This melody is just a draft."
c d e f
```

## 1. How to write a comment

A comment starts with `comment` and its text goes in double quotes. You can use `side note` instead of `comment`, they mean the same thing:

```msq-editor opens-with=text
side note: "The same as a comment."
c d e f
```

The colon is optional. You can also write `is` instead of it, or nothing at all:

```msq-editor opens-with=text
comment "no colon"
c d
comment is "with is"
e f
```

You can use only double quotes for comments, unlike for other text in MSQ. It's done this way, so you can use single quotes inside of a comment:

```msq-editor opens-with=text
comment: "It's fine to write 'quotes' here."
c d e f
```

It's important to mention that `comment` and `side note` are written in lowercase, like every other key word in MSQ.

## 2. Comments over several lines

A comment may run over as many lines as you need. It lasts until the closing double quote:

```msq-editor opens-with=text
comment: "
  A comment is not drawn.
  It travels with the music.
"

c d e f
```

## 3. Where a comment can be

A comment can sit on a line of its own anywhere on the page, including between two lines of units:

```msq-editor opens-with=text
1/8 c d e f
comment: "the second half goes down"
g f e d
```

A comment can also finish a line of units:

```msq-editor opens-with=text
1/4 c d e f comment: "up"
g f e d comment: "and down"
```

But a comment always ends its line. Anything you write after the closing quote on the same line is not recognised, so the next units have to start on a new line.

## 4. Comments are kept

Comments are not thrown away when the text is parsed: the parser keeps each comment together with the lines it was written on. So when a page is turned back into text by the serializer, every comment is put back on the line where it was, as `comment: "..."`. More about the serializer you can read in [The page schema](/docs/api/page-schema).

Read next: [Chords](/docs/language/chords)

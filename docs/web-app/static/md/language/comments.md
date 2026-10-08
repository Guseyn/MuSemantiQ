# Comments

You can add comments to the music. They are not drawn. They are just notes for you or for whoever reads the text after you.

Let's start with a simple example:

```msq-editor opens-with=text
comment: "This melody is just a draft."
c d e f
```

## 1. How to Write a Comment

A comment starts with `comment`, and its text goes in double quotes. You can write `side note` instead of `comment`:

```msq-editor opens-with=text
side note: "The same as a comment."
c d e f
```

The colon is optional. You can write `is` instead, or nothing at all:

```msq-editor opens-with=text
comment "no colon"
c d
comment is "with is"
e f
```

Unlike other text in MSQ, comments use only double quotes. This way you can use single quotes inside a comment:

```msq-editor opens-with=text
comment: "It's fine to write 'quotes' here."
c d e f
```

`comment` and `side note` are lowercase, like every other key word in MSQ.

## 2. Comments Over Several Lines

A comment can take as many lines as you need. It ends at the closing double quote:

```msq-editor opens-with=text
comment: "
  A comment is not drawn.
  It travels with the music.
"

c d e f
```

## 3. Where a Comment Can Be

A comment can be on its own line anywhere on the page, also between two lines of units:

```msq-editor opens-with=text
1/8 c d e f
comment: "the second half goes down"
g f e d
```

A comment can also be at the end of a line of units:

```msq-editor opens-with=text
1/4 c d e f comment: "up"
g f e d comment: "and down"
```

But nothing can go after a comment on the same line. Anything after the closing quote is not recognised, so the next units start on a new line.

## 4. Comments Are Kept

The parser doesn't throw comments away. It keeps each comment with the lines it was written on. So when the serializer turns a page back into text, every comment goes back to its line, as `comment: "..."`. More about the serializer you can read in [The page schema](/docs/api/overview).

Read next: [Chords](/docs/language/chords)

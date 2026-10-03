# Volta brackets

A volta bracket marks the measures that are played on one of the passes of a repeat, like the first ending. It's a cross-measure element, so it addresses **measures**, not units. And like every span, it's written after the music it covers: you can declare each volta bracket in the scope of the line where it belongs, or declare all of them after all the measures on the page.

Let's start with a basic example:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
g a b c5

volta with text "1." from first measure to second measure
```

The same bracket can be written as `volta starts at first measure and ends at second measure`, and `volta bracket` or `volta brackets` can be used instead of `volta`.

`with text` sets the number in the bracket, and it can be any text:

```msq-editor opens-with=text
measure
treble clef
c d e f
measure
g a b c5
measure
ends with double bold barline
with repeat sign at the end
c5 b a g

volta with text "1, 2." from first measure to third measure
```

The vertical position of a volta bracket is always adjusted depending on the content of the measures it covers:

```msq-editor opens-with=text
measure
treble clef
c5 d5 e5
measure
c6 d6 e6
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

volta with text "1, 2." from first measure to third measure
```

But you still can correct it:

```msq-editor opens-with=text
measure
treble clef
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

volta with text "1, 2." from first measure to third measure 1.5 down
```

Here we moved the volta bracket down by one and a half intervals between stave lines.

If a volta bracket needs to continue after the line where it started, or it starts before the line where it's declared, in other words if it has open sides, you use `starts before` and `finishes after`:

```msq-editor opens-with=text
measure
treble clef
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

volta with text "1, 2." starts before first measure to third measure

new line
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

volta with text '1, 2.' from first measure and finishes after third measure

new line
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

volta with text "1, 2."
starts before first measure and finishes after third measure
```

As you may notice, you can omit `starts` and `finishes`, and just write `before first measure` or `after third measure`. The text can be written in double or single quotes.

As you can see above, each volta applies to the line where you declare it. It's important to mention that measures are numbered within their page line, so `first measure` on the second line is the first measure of that line. If you prefer to declare all voltas after all the measures, you name the line for each of them:

```msq-editor opens-with=text
measure
treble clef
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

new line
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

new line
c5 d5 e5
measure
c5 d5 e5
measure
ends with double bold barline
with repeat sign at the end
c5 d5 e5

volta on first line with text '1, 2.' starts before first measure to third measure
volta on second line with text '1, 2.' from first measure and finishes after third measure
volta on third line with text '1, 2.' starts before first measure and finishes after third measure
```

Volta brackets are also played: the measures under a bracket are played on the first pass, and after the [repeat sign](/docs/language/repeat-signs) sends the music back, they are skipped. So a typical first and second ending looks like this:

```msq-editor opens-with=text
measure
treble clef
repeat sign at the start
c d e f
measure
ends with double bold barline
with repeat sign at the end
g a b c5
measure
ends with double bold barline
c5 b a g

volta with text "1." from second measure to second measure
volta with text "2." from third measure to third measure
```

Read next: [Sign (segno)](/docs/language/sign)

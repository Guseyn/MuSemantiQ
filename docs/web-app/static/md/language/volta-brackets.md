# Volta Brackets

A volta bracket marks the measures that are played on one pass of a repeat, like the first ending. It covers **measures**, not units. Like every span, it's written after the music it covers. You can write each volta bracket after the line where it belongs, or write all of them after all the measures on the page.

Let's start with a basic example:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
g a b c5

volta with text "1." from first measure to second measure
```

You can also write it as `volta starts at first measure and ends at second measure`. Instead of `volta`, you can write `volta bracket` or `volta brackets`.

`with text` sets the number in the bracket. It can be any text:

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

A volta bracket moves up or down by itself, depending on the notes in the measures it covers:

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

But you can still correct it:

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

If a volta bracket continues on the next line, or comes from the previous line, use `starts before` and `finishes after`:

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

As you may notice, you can skip `starts` and `finishes` and just write `before first measure` or `after third measure`. The text can be in double or single quotes.

As you can see above, each volta belongs to the line where you write it. It's important to mention that measures are counted within their page line, so `first measure` on the second line is the first measure of that line.

If you want to write all voltas after all the measures, name the line for each of them:

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

Volta brackets are also played. The measures under a bracket are played on the first pass, and skipped after the [repeat sign](/docs/language/repeat-signs) sends the music back. So a typical first and second ending looks like this:

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

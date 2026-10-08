# Measure Numbers

Measure numbers are set for the whole page. You turn them on with `measure numbers`, and say which measures get a number:

```msq-editor opens-with=text
measure numbers for all measures

measure
treble clef
c d e f

measure
g a b c5
```

As you may notice, the first measure on the page never gets a number.

There are four options: all measures, first measures, last measures, and first and last measures. `measure numbers` on its own means all measures. Let's see them one by one, on a page with several lines. All measures:

```msq-editor opens-with=text
measure numbers for all measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
```

Only the first measure on each line:

```msq-editor opens-with=text
measure numbers for first measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
new line
c5 b a g
measure
f e d c
```

Only the last measure on each line:

```msq-editor opens-with=text
measure numbers for last measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
```

The first and the last measures on each line:

```msq-editor opens-with=text
measure numbers for first and last measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
```

You can also write `first last`, `first & last` or `first&last`.

It's important to mention that measure numbers count measures from the start of the page, not from the start of the page line. This is different from spans like [slurs](/docs/language/slurs) and [volta brackets](/docs/language/volta-brackets), where measures are counted within their page line.

In printed music, usually only the first measure of each line has a number. Numbering all measures helps when people need to find any measure quickly, for example in rehearsals.

By default, measure numbers are above the measures. But you can easily change that:

```msq-editor opens-with=text
measure numbers for all measures below measures

measure
treble clef
c d e f
measure
g a b c5
measure
c5 b a g
new line
f e d c
measure
c d e f
measure
g a b c5
```

Instead of `below measures` you can write `below`, `under` or `down`. For the default position, you can write `above`, `over` or `up`.

Read next: [Instrument titles](/docs/language/instrument-titles)

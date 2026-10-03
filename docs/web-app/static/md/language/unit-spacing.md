# Unit spacing

There are a couple of ways to manage space on a page. You can change the font size, or the width of a page line, and both are explained in [Page format](/docs/language/page-format). Another way is to change the spacing between units, and that is what this page is about.

In **MuSemantiQ**, the space between two units depends on the unit with the shortest duration on the page line those units belong to. Let's take a look at the following score:

```msq-editor opens-with=text
1 a
1/2 a
1/2 a

new line
1 a
1/2 a
1/4 a
1/4 a

new line
1 a
1/2 a
1/4 a
1/8 a
1/8 a
```

As you can see, the whole note on the first line takes less space than the whole note on the third line. The first line has nothing shorter than a half note, so a half note gets the least space there, and everything else is measured from it. On the third line the shortest unit is an eighth, so the eighth gets that least space, and every longer unit gets more.

It means that a line with short notes gets wide quickly. MuSemantiQ does not squeeze a line to make it fit: you can put on a line as many things as you want. But when at least one line crosses the bounds, a red dashed line is drawn where every line should end:

```msq-editor opens-with=text
1/32 c d e f g a b c5 d5 e5 f5 g5 a5 b5 c6 d6
1/32 d6 c6 b5 a5 g5 f5 e5 d5 c5 b a g f e d c
1/32 c d e f g a b c5 d5 e5 f5 g5 a5 b5 c6 d6
```

## 1. Compressing units

When a page is too loose, or a line does not fit, you can compress units:

```msq-editor opens-with=text
compress units by 2 times

1 a
1/2 a
1/2 a

new line
1 a
1/2 a
1/4 a
1/8 a
1/8 a
```

It's important to mention that the number must be greater than **1** and not greater than **5**. It does not have to be whole: **1.2** or **2.5** works just as well. You can also write it as a word:

```msq-editor opens-with=text
compress units by two times

1 a
1/2 a
1/4 a
1/8 a
1/8 a
```

## 2. Stretching units

In the same way, you can stretch units, and the number follows the same rules:

```msq-editor opens-with=text
stretch units by 1.4 times

measure
treble clef
1/4 c d e f
```

## 3. Only one line

Usually it's only one line that is crowded, and the rest of the page is fine. So you can compress or stretch units only in a certain page line, by adding `in line` and its number:

```msq-editor opens-with=text
compress units by 2 times in line 2
compress units by 3 times in line 3

1 a
1/2 a
1/2 a

new line
1 a
1/2 a
1/4 a
1/4 a

new line
1 a
1/2 a
1/4 a
1/8 a
1/8 a
```

Page lines are counted from **1**, the same way `new line` creates them. The line can also be named the other way round, with an ordinal, which reads more naturally sometimes:

```msq-editor opens-with=text
stretch units by 1.5 times in the first line
stretch units by 1.2 times in 2nd line

measure
treble clef
1/8 c beamed, d, e, f, g, a, b, c5 not beamed

new line
1/8 c5 beamed, b, a, g, f, e, d, c not beamed
```

Instead of `in` you can also write `on`, `at` or `with`, and `the` is optional: `on line 2`, `in the line 2`, `line 2`, `the 2nd line`.

A line that has its own setting ignores the setting for the whole page, so you can combine both: one number for the page, and a different one for the line that needs it. The only exception is when a line ends up with both a compression and a stretching, then the stretching wins.

## 4. Hiding the last measure

As you remember from [Measures](/docs/language/measures), the last measure of a line fills the rest of the space on that line. So if you want the last measure with music to keep its own width and its closing barline, you end the page with one more measure, an empty one, and that one stretches to the end of the line instead. You can hide it:

```msq-editor opens-with=text
hide the last measure

measure
treble clef
1/4 c d e f
measure
1/4 g a b c5
measure
```

As you can see, the music stops where it stops, and the page keeps its width. It works only for the last measure of the whole page, and only if that measure doesn't contain any units.

Read next: [Colours](/docs/language/colours)

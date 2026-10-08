# Unit Spacing

You can manage space on a page in a few ways:

- change the font size or the width of a page line, see [Page format](/docs/language/page-format);
- change the spacing between units, which is what this page is about.

The space between two units depends on the shortest unit on their page line. Let's take a look at the following score:

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

As you can see, the whole note on the first line takes less space than the whole note on the third line:

- On the first line, the shortest unit is a half note. It gets the least space, and the other units get more.
- On the third line, the shortest unit is an eighth. Now the eighth gets the least space, so every longer unit gets more.

So a line with short notes gets wide quickly. MSQ doesn't squeeze a line to make it fit: you can put as many things on a line as you want. But when a line goes too far, a red dashed line shows where every line should end:

```msq-editor opens-with=text
1/32 c d e f g a b c5 d5 e5 f5 g5 a5 b5 c6 d6
1/32 d6 c6 b5 a5 g5 f5 e5 d5 c5 b a g f e d c
1/32 c d e f g a b c5 d5 e5 f5 g5 a5 b5 c6 d6
```

## 1. Compressing Units

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

The number must be greater than **1** and not greater than **5**. It can be a fraction, like **1.2** or **2.5**. You can also write it as a word:

```msq-editor opens-with=text
compress units by two times

1 a
1/2 a
1/4 a
1/8 a
1/8 a
```

## 2. Stretching Units

In the same way, you can stretch units. The number has the same rules:

```msq-editor opens-with=text
stretch units by 1.4 times

measure
treble clef
1/4 c d e f
```

## 3. Only One Line

Usually only one line is crowded. So you can compress or stretch units only in one page line, by adding `in line` and its number:

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

Page lines are counted from **1**. You can also name a line with an ordinal, like `first` or `2nd`:

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

A line with its own setting ignores the setting for the whole page. So you can have one number for the page and another one for a single line. If a line has both a compression and a stretching, the stretching wins.

## 4. Hiding the Last Measure

As you remember from [Measures](/docs/language/measures), the last measure of a line fills the rest of that line. If you want the last measure with music to keep its own width, add one more empty measure at the end of the page. The empty one stretches to the end of the line instead, and you can hide it:

```msq-editor opens-with=text
hide the last measure

measure
treble clef
1/4 c d e f
measure
1/4 g a b c5
measure
```

As you can see, the music ends where it ends, and the page keeps its width. It works only for the last measure of the whole page, and only if that measure has no units.

Read next: [Colours](/docs/language/colours)

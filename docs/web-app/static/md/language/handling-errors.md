# Handling errors

Sooner or later you'll type something that MuSemantiQ doesn't understand. It never stops because of that. The parser doesn't throw: it collects every error it meets, and the page is drawn with everything it did understand.

Let's start with a simple example, a clef that doesn't exist:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
c d e f

stave with fancy clef
```

As you can see, the first stave is drawn as usual, and so is the second one: `stave` is a command MuSemantiQ knows. Only `with fancy clef` is not, so the second stave has no clef, and the rest of the line is reported. It's very important to let a user see errors and inaccuracies visually, rather than get an empty page or nothing at all.

## 1. What an error looks like

An error is a plain sentence that says what went wrong and on which line:

```text
command 'with fancy clef' is not recognizable or applicable on the line 5
```

Lines are counted from **1**, and empty lines and comments count too, so the number is the line you see in your editor. When a text has several pages, each page counts its own lines. There is no column in an error, only a line.

The quoted part is exactly the text the parser couldn't use, so in the raw string it may end with a space or a line break.

The sentence says "not recognizable **or applicable**" for a reason. A command can be perfectly correct and still be in a place where it means nothing. As you remember from [Fermata over barline](/docs/language/fermata-over-barline), `ends with fermata` belongs to a measure, so it has to come right after `measure`. Written after the units, it has nothing to attach to:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
c d e f
ends with fermata
```

```text
command 'ends with fermata' is not recognizable or applicable on the line 4
```

For the parser both cases are the same: it has text in front of it that it cannot attach to anything.

## 2. The common errors

There are only a few kinds of errors, and most of them you'll recognise at once.

**A command that is not recognizable.** It's a typo, or a word that doesn't exist, or a value that is not supported:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
c d e f
g with staccatto
```

```text
command 'with staccatto' is not recognizable or applicable on the line 4
```

As you may notice, the note `g` is still drawn. Only the part of the line that wasn't understood is lost.

**A unit that doesn't exist.** This is a logical error: every word is correct, but a span names a unit that is not there. Let's take a look at the following example:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
a b a b a

slur from unit 1 to unit 6
```

We want the slur to end at the sixth unit, but there are only five notes. So the slur has nowhere to end, and it runs to the end of the line, and you get:

```text
unit after command 'to' is not found on the line 5
```

The same happens with a measure that doesn't exist, in a command that names measures, like a volta bracket:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
a b c5
measure
a b c5

volta with text "1." from first measure to 5th measure
```

```text
measure after command 'to' is not found on the line 7
```

**An endpoint with no position.** A span needs to know where it starts and where it finishes, and when the number is missing, it cannot find out:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
1/8 a beamed, b, c5 not beamed

slur starts before unit
```

For this one you get two errors, because the line is wrong in two ways. The word `unit` without a number is not a position, so it is not recognizable. And `starts before` is left without a position:

```text
command 'unit' is not recognizable or applicable on the line 5
unit position after command 'starts before' is not specified on the line number 5
```

For a measure it is the same sentence with `measure position` in it.

## 3. In the editor

When you type a command in the editor that is not recognizable, it gets a red wavy underline, right where the problem is. Every score on a page, in the editor and in the examples on this site, also shows a table of errors under it, when there are any: the number of each error, its line, and its message. That is the table you see under the examples above.

## 4. In the API

If you use MuSemantiQ from code, the errors come back together with everything else the parser produces. They never come as an exception:

```js
import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'

const { pageSchema, errors } = generateIntermediateStructuresForSinglePage({
  pageText: 'stave with fancy clef'
})

// errors is an array of strings, and it is empty when everything is understood
```

For several pages, `generateIntermediateStructuresForMultiplePages` returns `errorsForEachPage`, one array for each page. More about that you can read in [Validation](/docs/api/overview#11-ispageschemavalid).

Read next: [MIDI settings](/docs/language/midi-settings)

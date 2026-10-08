# Handling Errors

Sooner or later you'll type something that MuSemantiQ doesn't understand. It doesn't stop because of that. The parser doesn't throw: it collects every error, and draws everything it understood.

Let's start with a simple example, a clef that doesn't exist:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
c d e f

stave with fancy clef
```

As you can see, both staves are drawn, because `stave` is a command MuSemantiQ knows. Only `with fancy clef` is not, so the second stave has no clef, and the rest of the line is reported as an error. It's very important to let a user see errors and inaccuracies visually, rather than get an empty page.

## 1. What an Error Looks Like

An error is a sentence that says what went wrong and on which line:

```text
command 'with fancy clef' is not recognizable or applicable on the line 5
```

- Lines are counted from **1**, and empty lines and comments count too, so it's the same line number you see in your editor.
- When a text has several pages, each page counts its own lines.
- An error has only a line, not a column.

The part in quotes is exactly the text the parser couldn't use, so it may end with a space or a line break.

The sentence says "not recognizable **or applicable**" for a reason. A command can be correct, but in a wrong place. As you remember from [Fermata over barline](/docs/language/fermata-over-barline), `ends with fermata` belongs to a measure, so it has to go right after `measure`. After the units, it has nothing to attach to:

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

For the parser both cases are the same: there is text that it can't attach to anything.

## 2. The Common Errors

There are only a few kinds of errors.

**A command that is not recognizable.** It's a typo, a word that doesn't exist, or a value that is not supported:

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

**A unit that doesn't exist.** Every word is correct, but a slur or another span names a unit that is not there. Let's take a look at the following example:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
a b a b a

slur from unit 1 to unit 6
```

The slur should end at the sixth unit, but there are only five notes. So the slur goes to the end of the line, and you get:

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

**A start or a finish without a position.** A span needs to know where it starts and where it finishes. If the number is missing, it can't know that:

<!-- check-docs-examples: allow-errors -->
```msq-editor opens-with=text
measure
treble clef
1/8 a beamed, b, c5 not beamed

slur starts before unit
```

Here you get two errors, because the line is wrong in two ways: `unit` without a number is not a position, so it's not recognizable, and `starts before` has no position:

```text
command 'unit' is not recognizable or applicable on the line 5
unit position after command 'starts before' is not specified on the line number 5
```

For a measure, it's the same sentence with `measure position` in it.

## 3. In the Editor

- In the editor, a command that is not recognizable gets a red wavy underline, right where the problem is.
- Every score, in the editor and in the examples on this site, shows a table of errors under it, if there are any: the number of each error, its line, and its message. That's the table you see under the examples above.

## 4. In the API

If you use MuSemantiQ from code, you get the errors together with everything else the parser returns. They never come as an exception:

```js
import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'

const { pageSchema, errors } = generateIntermediateStructuresForSinglePage({
  pageText: 'stave with fancy clef'
})

// errors is an array of strings, and it is empty when everything is understood
```

For several pages, `generateIntermediateStructuresForMultiplePages` returns `errorsForEachPage`, one array for each page. More about that you can read in [Validation](/docs/api/overview#11-ispageschemavalid).

Read next: [MIDI settings](/docs/language/midi-settings)

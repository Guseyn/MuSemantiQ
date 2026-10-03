# How the documentation is written

The voice is Guseyn's, taken from the Unison user documentation
(`../unison/web-app/md/user-documentation-pages/`) and the Unison blog
(`../unison/web-app/md/blog/`). This file is what those pages do, written down,
so every page in these docs sounds like the same person wrote it.

## The shape of a page

A page is a walk through examples. The prose is the bridge between one example
and the next, and it is short: one to three sentences, rarely more.

1. `# Title`, then one or two plain sentences saying what the thing is or where
   it belongs. No preamble, no "In this page we will…".
2. The simplest case first: "Let's start with a simple example:" and the example.
3. Then one variation at a time, each introduced by a sentence that ends in a
   colon and is followed immediately by its example.
4. After an example, when something in it needs pointing out, one sentence:
   "As you can see, …" / "As you may notice, …".
5. Several subtopics become numbered sections: `## 1. Simple slurs`,
   `## 2. S-shaped slurs`.
6. The page ends with a link to the next page in reading order:
   `Read next: [Octaves](/docs/language/octaves)`.

## Phrases that carry the voice

Use them, don't overuse them — two or three per page, not one per paragraph.

- Leading into something: **"Let's start with…"**, **"Let's take a look at…"**,
  **"Let's see how…"**, **"Let's examine the following…"**
- Defaults, then the change: **"By default, … But you can easily change that:"**
- Ease, when it really is easy: **"It's really easy to…"**, **"All you need is
  to…"**, **"You just need to…"**, **"You can simply…"**
- Pointing at the result: **"As you can see, …"**, **"As you may notice, …"**,
  **"The text above renders…"**, **"And as a result you get:"**
- Stressing a rule: **"It's important to mention that…"**
- Asides: **`**Side note:**`** and **`**Important note:**`** at the start of a
  paragraph.
- Honest limits: **"at the moment"**, **"supported at the moment"**,
  **"You cannot … mostly for the sake of better readability."** A limit always
  comes with its reason, joined by *because*.
- Remembering earlier pages: **"As you remember from [Styles](/docs/…), …"**,
  **"More about that you can read [here](/docs/…)."**

## Rules of the voice

- **You** for the reader, **we** / **let's** when doing something together.
  In the technical and architecture pages, **I** is fine where a decision is
  Guseyn's own ("I am using EHTML because…"), the way the Unison blog does it.
- **Plain words.** No marketing, no "powerful", "seamless", "robust",
  "effortless". No exclamation marks.
- **Reasons are short and concrete**, often a comma list: "It's free, it's easy
  to integrate, it's well documented."
- **A design belief can be stated flatly, once**, where it explains a behaviour:
  "It's very important to let a user see errors or inaccuracies visually."
- **Several constraints become a numbered list** introduced by "you have to
  remember the following rules:".
- **Formatting:** `backticks` for anything the reader types (commands, key
  words, file names, function names); **bold** for values and named things
  (**8.5**, **Bravura**, **quarter**). Tables for lists of aliases or options.
- **Words of the language** are used consistently: *unit* (note, chord or rest),
  *sound unit*, *page line*, *measure*, *stave*, *voice*, *command*, *key word*.

## What is not copied

The Unison pages have the slips of fast writing: missing articles ("following
rules"), no space before a parenthesis ("notes(or other elements)"), typos
("repmember", "defined" for "define"). Keep the wording, fix the grammar.

## Examples

Every claim a reader could try is shown, not described. Examples are editors
that open on their text, written as a fence named after the element (see the
README for how that becomes the element), so the reader sees what is written
first and the score one click away:

    ```msq-editor opens-with=text
    c d e f
    ```

The one exception is the components section, where each page shows the element
it is about.

They must stay **gradual**: an example may only use what this page or an
earlier one introduced. `npm run docs:check` enforces it.

For code (JavaScript, shell), fenced blocks with a language, and only code that
matches the source as it is.

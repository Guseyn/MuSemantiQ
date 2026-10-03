# Your first page

<!-- check-docs-examples: preview -->

A page of MSQ is plain text, one command after another. Let's write one, one step at a time. Each step is an editor that opens on the text, highlighted the way the editor highlights it. The score that text engraves is one click away: press **Render the score** in its toolbar.

## 1. Where to type it

You have two places to try it:

1. **The editor on this site.** The second screen of the [home page](/#see) is a real `msq-editor`, not a picture of one. It opens on the score. The button labelled **Edit the MuSemantiQ source** switches it to the text, where you can clear what is there and type your own, and the button labelled **Render the score** draws it again. The browser example (`npm run browser-app`, see [Install and run](/docs/getting-started/install-and-run)) has one as well.
2. **A file, through the CLI.** Save the text as, say, `first-page.txt` in the repository folder and run:

```bash
npm run cli-app -- --input first-page.txt --svg --midi
```

That writes `first-page.svg` and `first-page.mid` into the current folder. The output files are named after the input file, and `--out build` puts them into a `build` folder instead.

## 2. The smallest thing that works

Let's start with a single line of note letters:

```msq-editor opens-with=text
c d e f
```

That is already a valid page. You get one measure on one stave with four quarter notes, **C D E F**, starting from middle C. You don't need to write a measure, a stave or a clef, because the engine creates what you leave out.

As you may notice, nothing is drawn at the start of the stave. There is no clef until you write one, but the notes are still placed, and played, as if the clef were treble.

## 3. Adding measures

To split the music into measures, you just need to write `measure` on its own line before each one:

```msq-editor opens-with=text
measure
c d e f

measure
g a b c5
```

`measure` must be the first word on its line. The `5` in `c5` is an octave number: it is the C above the one the first measure starts from.

## 4. Adding a clef

A clef goes on its own line, inside the measure where it starts:

```msq-editor opens-with=text
measure
treble clef
c d e f

measure
g a b c5
```

It's important to mention that the clef applies from there on, so the second measure does not need its own.

## 5. Adding a time signature

A time signature is written with a colon between the two numbers:

```msq-editor opens-with=text
measure
treble clef
time signature is 4:4
c d e f

measure
g a b c5
```

As you can see, you get two measures of four quarter notes under a treble clef and **4/4**.

**Side note:** a time signature is only drawn. MSQ does not check that the notes in a measure add up to it, so you can put six quarter notes into a **4/4** measure and it draws all six. That lets you concentrate on the music first and fix the rhythm later.

## 6. When something is wrong

If you type something that is not a command, the parser does not stop. It draws everything it understood and reports what it could not read, with the line it was on. In the editor you see it right away, and the CLI prints it and exits with code **1**. More about that you can read in [Handling errors](/docs/language/handling-errors).

## 7. Onward

Everything above is covered properly in the [MSQ language](/docs/language/first-notes) section, together with the rest of the language: durations, rests, chords, beams, staves, voices, slurs and so on. That section is ordered to be read straight through, because no example there uses anything that an earlier page has not introduced.

Read next: [Where to go next](/docs/getting-started/where-to-go-next)

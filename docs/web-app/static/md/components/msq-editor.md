# msq-editor

`msq-editor` is the whole thing in one element: the score, the player, and the source that you can edit and render again. The score and the source are two views of one document, and you see one of them at a time.

Let's start with a simple example. Hover over the score and press the second button to see the source:

```html
<template is='msq-editor' data-font-sources='msqFontSources'>
  measure
  treble clef
  c d e f
</template>
```

```msq-editor
measure
treble clef
c d e f
```

Change something in the source, then press the same place in the toolbar again: the score is rendered from what you wrote, and so is the player.

## 1. The attributes

| Attribute | Default | What it does | Sets |
| --- | --- | --- | --- |
| `data-font-sources` | none, it is required | The reference a `msq-font-loader` registered its fonts under | |
| `data-opens-with` | **score** | Which view the element shows first: **score** or **text** | |
| `data-file-name` | a random id of the element | The name of the downloaded SVG and MIDI files, without the extension | |
| `data-highlight-color` | **#C40233** | The colour of a note while it sounds | |
| `data-sound-font` | empty, which means Magenta's own sound font | The URL of a Magenta-format sound font, as in [msq-midi](/docs/components/msq-midi) | |
| `data-editor-height` | **270px** | The height of the source view | `--editor-height` |
| `data-editor-font-family` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | The font of the source | `--editor-font-family` |
| `data-editor-font-size` | **1em** | The size of that font | `--editor-font-size` |
| `data-editor-font-src` | none | The URL of a font file for the first family in `data-editor-font-family` | |
| `data-navigation-highlight-color` | **#f5cd79** | The colour of the box that links a word in the source to what it drew | `--navigation-highlight-color` |

It's important to mention that `data-editor-height` is the height the source view falls back to. When you switch from the score to the source, the source view takes the size of the score and its player, so that the element does not change its shape and the page does not jump. The one exception is an editor that opens on the source, which is fitted to its text instead.

`data-editor-font-src` is used only together with `data-editor-font-family`. The file is registered on the document as the first family of that stack, and once it has loaded the editor measures its text again. If it fails to load, the error is logged to the console and the next family in the stack is used.

**The editor font must be monospace.** The source view is two layers: a transparent `<textarea>` that you type into, and the coloured text right under it. They only line up while they agree on the font, its size and the line height, character for character, and with a proportional font the colours drift away from the text you are typing.

By default, the editor opens on the score. But you can easily make it open on the source instead, with `data-opens-with="text"`:

```html
<template is='msq-editor' data-font-sources='msqFontSources' data-opens-with='text'>
  measure
  treble clef
  c d e f
</template>
```

```msq-editor opens-with=text
measure
treble clef
c d e f
```

As you can see, the source view is as tall as its text rather than as the score, so a short example stays short. The score is still rendered when the element starts, and pressing **Render** shows it with its player. It's important to mention that the element does not take the focus when it opens on the source, so a page with many of them does not scroll to whichever one opened last. That is how every example outside this section of the documentation is written.

Let's take a look at an editor with a height and a font size of its own:

```html
<template
  is='msq-editor'
  data-font-sources='msqFontSources'
  data-editor-height='320px'
  data-editor-font-size='0.9em'
  data-file-name='editor-example'
>
  title is "Edit Me"

  measure
  treble clef
  time signature is 3:4
  1/4 g a b

  measure
  1/2 c5 dotted
</template>
```

```msq-editor editor-height=320px editor-font-size=0.9em file-name=editor-example
title is "Edit Me"

measure
treble clef
time signature is 3:4
1/4 g a b

measure
1/2 c5 dotted
```

## 2. The custom properties

The attributes above set custom properties inside the element. You can also set them, and a few more, from your own CSS, on the `<div>` the element renders into. Every component has them, and the ones that are not about the source view work the same way in `msq-svg`, `msq-midi` and `msq-svg-midi`:

| Property | Default | What it is |
| --- | --- | --- |
| `--border-color` | **#c0c0c0** | The border of the surface |
| `--border-radius` | **1em** | Its corners |
| `--surface-bg` | **#fff** | Its background |
| `--font-color` | **#121212** | The text of the settings and the errors panel, and the focus ring |
| `--muted-font-color` | **#4c5866** | Line numbers, comments in the source, and the headings and line numbers of the errors panel |
| `--error-color` | **#c40233** | The heading of the errors panel |
| `--error-bg` | **#fdf3f5** | The background of the errors panel |
| `--editor-font-family` | a monospace stack | The font of the source |
| `--editor-font-size` | **1em** | Its size |
| `--editor-line-height` | **1.4em** | Its line height |
| `--editor-font-color` | **#1f2d3a** | Its colour |
| `--navigation-highlight-color` | **#f5cd79** | The box that links a word to what it drew |
| `--editor-height` | **270px** | The height of the source view |

```css
div[data-rendered-by='template[is="msq-editor"]'] {
  --surface-bg: #fbfaf7;
  --border-radius: 0.5em;
}
```

A value given by an attribute is set closer to the source view than a value set by your page, so when both are given, the attribute wins.

## 3. The source from script

The music does not have to be written as the content of the element. You can simply set it with `innerState` before the element is inserted:

```js
const editor = document.createElement('template', { is: 'msq-editor' })
editor.setAttribute('data-font-sources', 'msqFontSources')
editor.setAttribute('data-editor-height', '320px')
editor.innerState = 'measure\ntreble clef\nc d e f'
container.replaceChildren(editor)
```

This is the way to go when the music comes from somewhere else, from a file, a database or another input on the page, because nothing in it is parsed as HTML on the way. And as you remember from the [Overview](/docs/components/overview), an editor renders once: to show different music, build a fresh one.

To read back what is in the editor now, find the `<textarea>` in its shadow root:

```js
const host = container.querySelector('div[data-rendered-by]')
const music = host.shadowRoot.querySelector('textarea[data-msq-input]').value
```

## 4. The toolbar and the settings

The toolbar appears when you hover over the element or move the focus into it:

| Button | What it does |
| --- | --- |
| Download | Downloads the last rendered score as `<data-file-name>.svg` |
| Edit | Shows the source. In its place appears **Render**, which shows the score again |
| Copy | Copies the source to the clipboard |
| Settings | Shows the settings instead of the score or the source; press it again to go back |

The player under the score has the same two buttons as in [msq-midi](/docs/components/msq-midi): download the MIDI file, copy the source.

**Render** asks the worker for a new score only when the source has changed since the last time. While it works, the element is dimmed. When it is done, the score, the player and the errors panel are all replaced with the new ones.

The settings are a view of their own, and they apply to this element only:

| Setting | What it changes |
| --- | --- |
| Suggest commands as I type | Turns the completion list on and off |
| Colour the source | Turns the syntax highlighting on and off |
| Colour of a note as it sounds | The same as `data-highlight-color` |
| Colour of the box that links a word to its glyph | The same as `data-navigation-highlight-color` |
| Sound Font URL | The same as `data-sound-font`; leave it empty for the default one. The player loads the new samples by itself |

The settings are not saved anywhere. When the page is reloaded, the element starts again from its attributes.

## 5. Writing in the source view

The source view has line numbers, highlights the line the caret is on, and colours the music as you type. As you type a command, the editor suggests how it can go on:

| Key | What it does |
| --- | --- |
| **↑** / **↓** | Move through the suggestions |
| **Tab** or **Enter** | Complete the word with the selected suggestion |
| **Esc** | Close the suggestions |

You can also click a suggestion. It's important to mention that **Esc** is also how you leave the editor with the keyboard while suggestions are open, because **Tab** is taken for completing.

With nothing selected, the clipboard shortcuts work on the whole line the caret is on:

| Keys (macOS) | Keys (other systems) | What it does |
| --- | --- | --- |
| **⌘ + X** | **Ctrl + X** | Cuts the line |
| **⌘ + C** | **Ctrl + C** | Copies the line |
| **⌘ + V** | **Ctrl + V** | Pastes a line you took this way as a new line under the one you are on, keeping the column of the caret |

The line goes onto the real clipboard, so you can paste it into any other program, and cutting it can be undone. Anything you copied from somewhere else pastes as it always does.

## 6. Navigation between the score and the words

You can easily navigate between the source and the score that it rendered. All you need to do is to hold **⌘** (on macOS) or **Ctrl** (on other systems):

| Action | What happens |
| --- | --- |
| **⌘/Ctrl** + hover over a word in the source | The word is underlined if it drew something |
| **⌘/Ctrl** + click on that word | The score is shown, and a box flashes around everything that word drew |
| **⌘/Ctrl** + hover over something in the score | A box appears around it |
| **⌘/Ctrl** + click on it | The source is shown, and the words that drew it flash |
| Click on a note head or a rest | The player jumps to that note |

The link between the two is made when the score is rendered, so it only holds for the source that the score was rendered from. As soon as you type, the words lose their links. If you try to navigate then, the editor tells you so: "You have to re-render preview to match the changes in the text to be able to navigate." Press **Render**, and the links are back.

Read next: [Fonts and font config](/docs/components/fonts-and-config)

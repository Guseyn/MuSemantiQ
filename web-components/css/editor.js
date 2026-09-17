/**
 * The text view: a transparent <textarea> layered exactly on top of a
 * highlighted div, with a line-number gutter to the left.
 *
 * The textarea's own glyphs are invisible (`color: transparent`) and only its
 * caret and selection show; what you read is the highlight layer underneath.
 * That only works while both layers agree on font, font-size, line-height and
 * white-space, so those four are set from the same custom properties.
 *
 * Structure is addressed by data-attribute; only genuinely stateful bits use a
 * class (.current, .selected, .with-visible-text).
 */
export default /*css*/`
  div[data-text-container] {
    position: relative;
    /* Makes this a stacking context, so the textarea's z-index stays local.
       Without it the textarea ties with div[data-utils] at z-index 1, wins on
       tree order, and swallows every click meant for the toolbar buttons. */
    z-index: 0;
    display: block;
    box-sizing: border-box;
    height: var(--editor-height, 270px);
    /* Fallback only: the element pins this to the score's width on first show. */
    min-width: 24em;
    max-width: 100%;
    overflow: hidden;
    background: var(--surface-bg);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
  }

  div[data-line-numbers],
  div[data-highlights],
  textarea[data-msq-input] {
    position: absolute;
    top: 0.75em;
    height: calc(100% - 1.5em);
    margin: 0;
    padding: 0;
    border: none;
    font-family: var(--editor-font-family);
    font-size: var(--editor-font-size);
    line-height: var(--editor-line-height);
    white-space: pre;
    scrollbar-width: none;
  }
  div[data-line-numbers]::-webkit-scrollbar,
  div[data-highlights]::-webkit-scrollbar,
  textarea[data-msq-input]::-webkit-scrollbar {
    display: none;
  }

  div[data-line-numbers] {
    left: 0.75em;
    overflow: hidden;
    text-align: right;
    box-sizing: border-box;
    user-select: none;
    color: var(--muted-font-color);
  }
  /* The spans are joined with newlines and the column is white-space: pre, so
     the newline is the line break. Making these blocks would double it. */
  div[data-line-numbers] span[data-line-number] {
    text-align: right;
  }
  div[data-line-numbers] span[data-line-number].current {
    color: #ff7f50;
    font-weight: bold;
  }

  div[data-highlights] {
    z-index: 0;
    overflow: hidden;
    color: var(--editor-font-color);
    background: transparent;
    cursor: text;
  }
  div[data-highlights-text] {
    white-space: pre;
    width: max-content;
  }

  textarea[data-msq-input] {
    z-index: 1;
    overflow: auto;
    outline: none;
    resize: none;
    background: transparent;
    color: transparent;
    caret-color: var(--editor-font-color);
    cursor: text;
    font-weight: normal;
  }
  /* Empty textarea: give the text back its colour so the placeholder shows. */
  textarea[data-msq-input].with-visible-text {
    color: var(--editor-font-color);
  }
  textarea[data-msq-input]::selection {
    background: rgba(245, 205, 121, 0.7);
    color: transparent;
  }

  /* Against the viewport, at the top of the shadow root: the editor box hides
     its overflow, and a list placed inside it is cut off. The height is set
     from the room it actually has when it opens. */
  div[data-autocomplete] {
    position: fixed;
    z-index: 100;
    font-family: var(--editor-font-family);
    font-size: var(--editor-font-size);
    background: var(--surface-bg);
    min-width: 260px;
    width: fit-content;
    max-width: min(520px, 90vw);
    max-height: 300px;
    overflow: auto;
    border-radius: 5px;
    scrollbar-width: none;
    box-shadow: rgba(9, 30, 66, 0.45) 0 1px 1px, rgba(9, 30, 66, 0.25) 0 0 1px 1px;
  }
  div[data-autocomplete][hidden] {
    display: none;
  }
  div[data-autocomplete] div[data-option] {
    line-height: 30px;
    /* 10px here is load-bearing: the popup's left offset is computed against it. */
    padding-right: 10px;
    padding-left: 10px;
    width: 100%;
    white-space: nowrap;
    cursor: pointer;
    box-sizing: border-box;
  }
  div[data-autocomplete] div[data-option].selected {
    background: #faf0e6;
    color: var(--editor-font-color);
  }
  div[data-autocomplete] mark {
    background: transparent;
    color: #eb8100;
  }

  @keyframes msq-fading-message {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
  }
  /* Centred on div[data-inner-wrapper], which is the only positioned ancestor.
     The wrapper is overflow:hidden, so it must not outgrow it. */
  div[data-hint] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(300px, calc(100% - 2em));
    box-sizing: border-box;
    padding: 10px;
    border-radius: 6px;
    background: #323232;
    color: #fff;
    font-family: sans-serif;
    font-size: 0.8125em;
    text-align: center;
    z-index: 1000;
    animation: msq-fading-message 2.5s ease 2.5s forwards;
  }

  /* Cmd/Ctrl-hover cross-navigation between editor words and SVG glyphs. */
  div[data-highlights] span[ref-id]:hover {
    cursor: pointer;
  }
  @keyframes msq-hide-ref-span-background {
    0% { background: color-mix(in srgb, var(--navigation-highlight-color) 70%, transparent); }
    100% { background: transparent; }
  }
  .ref-span-background {
    background: color-mix(in srgb, var(--navigation-highlight-color) 70%, transparent);
    animation: msq-hide-ref-span-background 2s ease 0.8s forwards;
  }
  @keyframes msq-hide-rect-ref-hover {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
  }
  /* Set here rather than as a fill attribute, so the rect can pick up the
     custom property; a CSS declaration also outranks a presentation attribute. */
  .ref-rect-hover,
  .ref-rect-hover-no-animated,
  .ref-rect-hover-not-visible {
    fill: var(--navigation-highlight-color);
  }
  .ref-rect-hover {
    opacity: 0.8;
    animation: msq-hide-rect-ref-hover 3s forwards;
  }
  .ref-rect-hover-no-animated {
    opacity: 0.8;
    cursor: pointer;
  }
  .ref-rect-hover-not-visible {
    opacity: 0;
  }
`

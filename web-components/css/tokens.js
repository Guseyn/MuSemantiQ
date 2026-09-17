export default /*css*/`
  :host {
    font-size: 16px;
    --border-color: #c0c0c0;
    --border-radius: 1em;
    --surface-bg: #fff;
    --surface-bg-hovered: #f9fafc;
    --font-color: #121212;
    --muted-font-color: #4c5866;
    --error-color: #c40233;
    --error-bg: #fdf3f5;
    /* Must be monospace: the highlight layer sits exactly under the textarea
       and the two only line up while they agree on font, size and line-height.
       Override per element with data-editor-font-family (+ data-editor-font-src
       for a webfont), or from the page by setting this property on the host. */
    --editor-font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --editor-font-size: 1em;
    --editor-line-height: 1.4em;
    --editor-font-color: #1f2d3a;
    /* Cmd/Ctrl-click navigation between a word and its glyph. Distinct from
       --highlight-color, which marks notes as they play. */
    --navigation-highlight-color: #f5cd79;
  }
`

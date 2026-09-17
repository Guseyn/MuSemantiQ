export default /*css*/`
  /* Whatever sits above the panel gives up its bottom rounding to it. */
  div[data-inner-wrapper][data-has-errors] {
    --player-bottom-radius: 0;
  }
  div[data-inner-wrapper][data-has-errors] div[data-scroll],
  div[data-inner-wrapper][data-has-errors] div[data-text-container],
  div[data-inner-wrapper][data-has-errors] div[data-scroll] > svg {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  div[data-errors] {
    font-family: sans-serif;
    font-size: 0.8125em;
    color: var(--font-color);
    background: var(--error-bg);
    border-top: 1px solid var(--border-color);
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    box-sizing: border-box;
    max-height: 12em;
    overflow: auto;
    scrollbar-width: thin;
    /* The wrapper is width:max-content, so a long error message would otherwise
       stretch the whole element. Contributing 0 to intrinsic width and then
       filling the used width makes the panel follow the score instead of
       driving it. */
    width: 0;
    min-width: 100%;
  }
  div[data-errors] > header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.6em 0.9em;
    background: var(--error-bg);
    font-weight: 600;
    color: var(--error-color);
  }
  div[data-errors] > header > span[data-count] {
    display: inline-block;
    min-width: 1.5em;
    padding: 0 0.4em;
    border-radius: 1em;
    background: var(--error-color);
    color: #fff;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  div[data-errors] table {
    width: 100%;
    border-collapse: collapse;
    /* Fixed layout keeps the message column from sizing to its longest line. */
    table-layout: fixed;
  }
  div[data-errors] th,
  div[data-errors] td {
    text-align: left;
    padding: 0.35em 0.9em;
    vertical-align: top;
  }
  div[data-errors] thead th {
    font-weight: 600;
    color: var(--muted-font-color);
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid var(--border-color);
  }
  div[data-errors] tbody tr + tr td {
    border-top: 1px solid rgba(192, 192, 192, 0.4);
  }
  /* table-layout: fixed takes column widths from the first row, so they are
     set here rather than left to the content. */
  div[data-errors] th[data-index] { width: 2.5em; }
  div[data-errors] th[data-line] { width: 4em; }
  div[data-errors] td[data-index],
  div[data-errors] td[data-line],
  div[data-errors] th[data-index],
  div[data-errors] th[data-line] {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: var(--muted-font-color);
  }
  div[data-errors] td[data-message] {
    white-space: pre-wrap;
    word-break: break-word;
  }
`

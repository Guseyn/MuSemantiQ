export default /*css*/`
  div[data-utils] {
    position: absolute;
    top: 0.4em;
    right: 0.4em;
    z-index: 1;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0.0em;
    font-family: sans-serif;
  }
  /* Revealed on hover, and on focus so the buttons are reachable by Tab.
     Hidden with opacity rather than display, because a display:none button is
     not focusable and Tab would skip the toolbar entirely; pointer-events is
     what keeps the invisible buttons from swallowing clicks on the score. */
  div[data-utils] {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease 0s;
  }
  div[data-inner-wrapper]:hover div[data-utils],
  div[data-inner-wrapper]:focus-within div[data-utils] {
    opacity: 1;
    pointer-events: auto;
  }
  div[data-utils] button {
    text-align: center;
    background: rgba(204, 204, 204, 0);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    transition: background-color 0.25s ease 0s;
    padding: 0;
    cursor: pointer;
  }
  div[data-utils] button[hidden] {
    display: none;
  }
  div[data-utils] button:not(:disabled):hover {
    background: rgba(204, 204, 204, 0.3);
  }
  div[data-utils] button:not(:disabled):active {
    background: rgba(204, 204, 204, 0.6);
  }
  /* The wrapper clips overflow, so the ring is drawn inside the button. */
  div[data-utils] button:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--font-color);
  }
  div[data-utils] button svg {
    vertical-align: middle;
    fill: #000;
    margin: 0 auto;
  }
`

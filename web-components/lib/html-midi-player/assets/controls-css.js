/**
 * Styles for the `midi-player` control panel, scoped to its shadow root.
 *
 * Converted from html-midi-player `src/assets/controls.scss` (BSD-2-Clause),
 * https://github.com/cifkao/html-midi-player. Upstream relied on a bundler to
 * `import controlsCSS from './controls.scss'`; there is no build step here, so
 * the compiled CSS is a template string instead. The SCSS-only constructs were
 * resolved: nesting flattened, and `rgba(#ccc, x)` written out as
 * `rgba(204, 204, 204, x)`.
 *
 * There are no classes: every hook is a data attribute. Upstream's four
 * mutually exclusive state classes on the panel become one `data-state`
 * attribute in {stopped, playing, loading, error}; its fifth, `frozen`, is a
 * separate boolean `data-frozen` because it is also set in the initial
 * `stopped` state and so is not derivable from `data-state`.
 *
 * These rules live inside the element's shadow root, so nothing here can leak
 * into the page and nothing in the page can override it. Customize from outside
 * with the `::part()` selectors listed in `player.js`, e.g.
 *
 *   midi-player::part(control-panel) { background: aquamarine; }
 */

export const controlsCSS = /*css*/`
  :host {
    display: inline-block;
    width: 100%;
    vertical-align: bottom;
    font-family: sans-serif;
    font-size: 14px;
  }

  [data-control-panel] {
    width: inherit;
    height: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: relative;
    overflow: hidden;

    align-items: center;
    border-radius: 1em;
    background: #f2f5f6;
    user-select: none;
  }

  [data-control-panel] > * {
    margin: 0.8em 0.45em;
    box-sizing: border-box;
  }

  [data-control-panel] input,
  [data-control-panel] button {
    cursor: pointer;
  }

  [data-control-panel] input:disabled,
  [data-control-panel] button:disabled {
    cursor: inherit;
  }

  [data-control-panel] button {
    text-align: center;
    background: rgba(204, 204, 204, 0);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    transition: background-color 0.25s ease 0s;
    padding: 0;
  }

  [data-control-panel] button:not(:disabled):hover {
    background: rgba(204, 204, 204, 0.3);
  }

  [data-control-panel] button:not(:disabled):active {
    background: rgba(204, 204, 204, 0.6);
  }

  [data-control-panel] button [data-icon] {
    display: none;
    vertical-align: middle;
  }

  [data-control-panel] button [data-icon] svg {
    vertical-align: middle;
    fill: currentColor;
  }

  [data-control-panel] [data-seek-bar] {
    flex: 1;
    min-width: 0;
    margin-right: 1.1em;

    background: transparent;
    accent-color: #000;
  }

  /* For some reason, the track is invisible in Firefox by default */
  [data-control-panel] [data-seek-bar]::-moz-range-track {
    background-color: #555;
  }

  [data-control-panel][data-state="stopped"] [data-icon="play"],
  [data-control-panel][data-state="playing"] [data-icon="stop"],
  [data-control-panel][data-state="error"] [data-icon="error"] {
    display: inherit;
  }

  [data-control-panel][data-frozen] > div,
  [data-control-panel] > button:disabled [data-icon] {
    opacity: 0.5;
  }

  [data-control-panel] [data-overlay] {
    z-index: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    box-sizing: border-box;
    display: none;
    opacity: 1;
  }

  [data-control-panel][data-state="loading"] [data-overlay="loading"] {
    display: block;
    background: linear-gradient(110deg, #92929200 5%, #92929288 25%, #92929200 45%);
    background-size: 250% 100%;
    background-repeat: repeat-y;
    animation: shimmer 1.5s linear infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 125% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`

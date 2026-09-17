/**
 * The `midi-player` control panel markup.
 *
 * Replaces html-midi-player `src/assets/index.ts` (BSD-2-Clause),
 * https://github.com/cifkao/html-midi-player, which relied on a bundler to
 * inline `./play.svg` and `./controls.scss` via `import`. There is no build step
 * here, so the icons are inlined below (the `.svg` files alongside this one are
 * kept as the source of truth) and the styles come from `controls-css.js`.
 *
 * The template is fully self-contained: it carries its own `<style>` and is
 * cloned into the element's shadow root, so the player needs no external
 * stylesheet. The `part="..."` attributes are the intended customization
 * surface — see `player.js`.
 */

import { controlsCSS } from '#msq/lib/html-midi-player/assets/controls-css.js'

const playIcon = /*html*/`
  <svg width="24" height="24" version="1.1" viewBox="0 0 6.35 6.35" xmlns="http://www.w3.org/2000/svg">
   <path d="m4.4979 3.175-2.1167 1.5875v-3.175z" stroke-width=".70201"/>
  </svg>
`

const pauseIcon = /*html*/`
  <svg width="24" height="24" version="1.1" viewBox="0 0 6.35 6.35" xmlns="http://www.w3.org/2000/svg">
   <path d="m1.8521 1.5875v3.175h0.92604v-3.175zm1.7198 0v3.175h0.92604v-3.175z" stroke-width=".24153"/>
  </svg>
`

const errorIcon = /*html*/`
  <svg width="24" height="24" version="1.1" viewBox="0 0 6.35 6.35" xmlns="http://www.w3.org/2000/svg">
   <path transform="scale(.26458)" d="m12 3.5a8.4993 8.4993 0 0 0-8.5 8.5 8.4993 8.4993 0 0 0 8.5 8.5 8.4993 8.4993 0 0 0 8.5-8.5 8.4993 8.4993 0 0 0-8.5-8.5zm-1.4062 3.5h3v6h-3v-6zm0 8h3v2h-3v-2z"/>
  </svg>
`

export const controlsTemplate = document.createElement('template')
controlsTemplate.innerHTML = /*html*/`
  <style>
    ${controlsCSS}
  </style>
  <div data-control-panel data-state="stopped" data-frozen part="control-panel" role="region" aria-label="Player controls">
    <button data-play-button part="play-button" aria-label="Play" disabled>
      <span data-icon="play" aria-hidden="true">${playIcon}</span>
      <span data-icon="stop" aria-hidden="true">${pauseIcon}</span>
      <span data-icon="error" aria-hidden="true">${errorIcon}</span>
    </button>
    <div part="time">
      <span data-current-time part="current-time" aria-label="Elapsed time">0:00</span> / <span data-total-time part="total-time" aria-label="Total time">0:00</span>
    </div>
    <input type="range" min="0" max="0" value="0" step="any" data-seek-bar part="seek-bar" aria-label="Playback position" disabled>
    <div data-overlay="loading" part="loading-overlay"></div>
  </div>
`

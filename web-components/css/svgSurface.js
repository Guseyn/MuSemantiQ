/**
 * The SVG sits alone inside the surface, so it carries the full radius.
 * Used by msq-svg.
 *
 * Scoped to the score itself — the toolbar's icons are svgs too, and anything
 * looser rounds those as well.
 */
export const svgWithFullRadius = /*css*/`
  div[data-scroll] > svg {
    border-radius: var(--border-radius);
    display: block;
  }
`

/**
 * Something follows the SVG inside the surface (the midi player, the errors
 * panel), so only its top corners are rounded.
 * Used by msq-svg-midi and msq-editor.
 *
 * The container needs squaring too, not just the SVG: it is the div[data-scroll]
 * that surface.js gives the full radius to, and it clips the SVG, so its own
 * bottom corners are what shows above the player.
 */
export const svgWithTopRadius = /*css*/`
  div[data-svg-container],
  div[data-svg-container] > svg {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  div[data-svg-container] > svg {
    display: block;
  }
`

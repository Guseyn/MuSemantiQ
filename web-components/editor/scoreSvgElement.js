/**
 * The score's <svg>, never an icon's.
 *
 * The shadow root also holds the toolbar, whose buttons contain inline icon
 * <svg> elements — and the toolbar comes first in DOM order, so a bare
 * `shadowRoot.querySelector('svg')` returns a 24px icon rather than the score.
 * Every lookup has to be scoped to the score container.
 */
export default function scoreSvgElement(shadowHost) {
  return shadowHost.shadowRoot.querySelector('[data-svg-container] svg')
}

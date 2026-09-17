/**
 * Injected into the <midi-player>'s own shadow root, so it can only be driven
 * by custom properties inheriting down the flattened tree from the wrapper.
 *
 * Set on div[data-inner-wrapper] by the host element:
 *   --player-top-radius     rounding of the player's top corners
 *   --player-bottom-radius  rounding of its bottom corners; drop to 0 when the
 *                           errors panel is rendered underneath it
 *   --player-top-border     border between the player and whatever is above it
 */
export default /*css*/`
  [data-control-panel] {
    border-top-left-radius: var(--player-top-radius, 0);
    border-top-right-radius: var(--player-top-radius, 0);
    border-bottom-left-radius: var(--player-bottom-radius, 0);
    border-bottom-right-radius: var(--player-bottom-radius, 0);
    border-top: var(--player-top-border, none);
    box-sizing: border-box;
  }
`

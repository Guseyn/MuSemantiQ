import midiPlayerOverride from '#msq/css/midiPlayerOverride.js'

/**
 * <midi-player> is vendored third-party, so the only way to restyle its control
 * panel is to push a stylesheet into its shadow root, and the only way to
 * parameterise that sheet is via custom properties inherited from our wrapper.
 */
export default function overrideMidiPlayerStyles(midiPlayer) {
  const style = document.createElement('style')
  style.textContent = midiPlayerOverride
  midiPlayer.shadowRoot.appendChild(style)
}

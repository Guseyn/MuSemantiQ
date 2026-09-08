/**
 * Adds our own buttons into the player's control panel, next to its transport
 * controls, so they read as one bar.
 *
 * The icons are the only visible content, so `label` is what names each button
 * for assistive technology; it is required for that reason.
 *
 * @param {Array<{ label: string, innerHTML: string, onClick: (event: Event) => void }>} buttons
 */
export default function addUtilsToMidiPlayerControlPanel(midiPlayer, buttons) {
  const controlPanel = midiPlayer.shadowRoot.querySelector('[data-control-panel]')
  const utilsPanel = document.createElement('div')
  utilsPanel.setAttribute('data-utils', '')
  utilsPanel.setAttribute('role', 'group')
  utilsPanel.setAttribute('aria-label', 'Player actions')
  buttons.forEach(({ label, innerHTML, onClick }) => {
    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('aria-label', label)
    button.innerHTML = innerHTML
    button.addEventListener('click', onClick)
    utilsPanel.appendChild(button)
  })
  controlPanel.appendChild(utilsPanel)
  return utilsPanel
}

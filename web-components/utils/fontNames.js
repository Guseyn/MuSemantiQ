/**
 * The worker owns the loaded font *sources*, but the editor highlights on the
 * main thread and the parser needs the font *names* to recognise commands like
 * `music font is leland`. Names are derivable from the same config the font
 * loader already has, so it publishes them here as it registers them.
 */
const fontNamesByReference = {}

export function registerFontNames(reference, fontConfig) {
  fontNamesByReference[reference] = {
    'chord-letters': Object.keys(fontConfig['chord-letters'] || {}),
    'music': Object.keys(fontConfig['music'] || {}),
    'text': Object.keys(fontConfig['text'] || {})
  }
}

export function fontNames(reference) {
  return fontNamesByReference[reference]
}

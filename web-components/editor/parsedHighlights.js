import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'

const NEW_LINE = '\n'

/**
 * A highlight-only parse, through the public api.
 *
 * `applyOnlyHighlightingWithoutRefIds` is what keeps this cheap enough to run on
 * every keystroke: no reference ids, no page schema, no MIDI settings, no
 * command-progression effects. Engraving and MIDI happen only on the toggle to
 * the preview view, and those go through the worker.
 *
 * One wrinkle: api.js normalizes its input by appending one *more* newline when
 * the text already ends with one. That is invisible to a full render, but not
 * here — it adds a trailing newline to the highlight buffer and an extra entry
 * to the char-index map, and the incremental reparse splices that map by
 * absolute char index. So we undo it.
 */
export default function parsedHighlights(text, progressionOfCommandsFromScenarios, supportedFontNames) {
  const {
    highlightsHtmlBuffer,
    mapOfCharIndexesWithProgressionOfCommandsFromScenarios,
    errors
  } = generateIntermediateStructuresForSinglePage({
    pageText: text,
    applyHighlighting: true,
    applyOnlyHighlightingWithoutRefIds: true,
    progressionOfCommandsFromScenarios: progressionOfCommandsFromScenarios || [],
    supportedFontNames
  })

  let html = highlightsHtmlBuffer.join('')
  let charIndexes = mapOfCharIndexesWithProgressionOfCommandsFromScenarios

  if (text[text.length - 1] === NEW_LINE) {
    if (html[html.length - 1] === NEW_LINE) {
      html = html.slice(0, -1)
    }
    const charIndexValues = Object.values(charIndexes)
    charIndexValues.pop()
    charIndexes = { ...charIndexValues }
  }

  return { html, charIndexes, errors }
}

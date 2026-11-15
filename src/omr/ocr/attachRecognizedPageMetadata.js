'use strict'

/**
 * Only exact OCR becomes page metadata. Multiple physical lines retain their
 * line breaks; a draft never replaces a value already reviewed by the caller.
 */
export function attachRecognizedPageMetadata (pageSchema, recognizedText) {
  const lines = Array.isArray(recognizedText) ? recognizedText : recognizedText.lines || []
  const metadata = {}
  for (const role of [ 'title', 'subtitle', 'leftSubtitle', 'rightSubtitle', 'pageNumber' ]) {
    const roleLines = lines.filter((line) => line.role === role)
    const isExact = roleLines.length && roleLines.every((line) =>
      line.status === 'exact' && typeof line.text === 'string' && line.text.length
    )
    if (isExact) {
      metadata[role] = roleLines.map((line) => line.text).join('\n')
    }
  }
  return { ...pageSchema, ...metadata }
}

export default attachRecognizedPageMetadata

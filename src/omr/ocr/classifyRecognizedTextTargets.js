'use strict'

const dynamicPattern = /^[pmfsrz]+$/
const repetitionPattern = /^(?:D\.?C\.?|D\.?S\.?|Fine|Da Capo|Dal Segno)\b/i
const chordPattern = /^[A-G](?:#|b)?(?:maj|min|dim|aug|sus|add|alt|m|M|Δ|ø|°)?[A-G0-9+#b()/-]*$/

export function classifyRecognizedTextTargets (recognizedText) {
  return {
    ...recognizedText,
    lines: recognizedText.lines.map((line) => {
      if (line.status !== 'exact' || !line.target || line.target.targetType !== 'unitTextCandidate') {
        return line
      }
      const text = line.text.trim()
      let targetType = null
      if (repetitionPattern.test(text)) {
        targetType = 'repetitionNote'
      } else if (dynamicPattern.test(text)) {
        targetType = 'dynamicMark'
      } else if (chordPattern.test(text) && line.target.centerY < line.target.staveTopY) {
        targetType = 'relatedChordLetter'
      } else if (line.target.centerY > line.target.staveBottomY) {
        targetType = 'relatedLyrics'
      } else if (line.target.centerY < line.target.staveTopY) {
        targetType = line.target.unitIndex === 0 ? 'tempoMark' : 'noteLetter'
      }
      return targetType ? { ...line, target: { ...line.target, targetType } } : line
    })
  }
}

export default classifyRecognizedTextTargets

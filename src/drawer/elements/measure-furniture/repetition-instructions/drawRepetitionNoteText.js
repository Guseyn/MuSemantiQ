'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

export default function (measure, styles) {
  const repetitionNote = measure.repetitionNote
  measure.repetitionNote.measurePosition = measure.repetitionNote.measurePosition || 'start'
  const startXPoint = (measure.repetitionNote.measurePosition === 'start')
    ? (measure.stavesLeft || measure.left)
    : (measure.stavesRight || measure.right)
  const repetitionNoteText = createText(
    repetitionNote.value,
    styles.repetitionNoteFontOptions
  )(styles, startXPoint, measure.top)
  const repetitionNoteTextWidth = repetitionNoteText.right - repetitionNoteText.left
  const repetitionNoteTextHeight = repetitionNoteText.bottom - repetitionNoteText.top
  moveElement(
    repetitionNoteText,
    (measure.repetitionNote.measurePosition === 'start')
      ? styles.repetitionNoteXOffset
      : -repetitionNoteTextWidth - styles.repetitionNoteXOffset,
    -(repetitionNoteTextHeight / 2 + styles.repetitionNoteBottomOffset) + (repetitionNote.yCorrection || 0) * styles.intervalBetweenStaveLines
  )
  measure.top = Math.min(measure.top, repetitionNoteText.top)
  measure.bottom = Math.max(measure.bottom, repetitionNoteText.bottom)
  return repetitionNoteText
}

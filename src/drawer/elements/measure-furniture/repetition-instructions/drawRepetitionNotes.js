'use strict'

import drawRepetitionNoteText from '#msq/drawer/elements/measure-furniture/repetition-instructions/drawRepetitionNoteText.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measuresOnPageLine, styles) {
  const repetitionNotes = []
  measuresOnPageLine.forEach((measure) => {
    if (measure.repetitionNote && measure.repetitionNote.value) {
      const repetitionNote = drawRepetitionNoteText(measure, styles)
      addPropertiesToElement(
        repetitionNote,
        {
          'ref-ids': `repetition-note-${measure.measureIndexInGeneral + 1}`
        }
      )
      repetitionNotes.push(repetitionNote)
    }
  })
  return repetitionNotes
}

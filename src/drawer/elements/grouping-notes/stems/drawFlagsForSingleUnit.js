'use strict'

import drawNoteTopFlag from '#msq/drawer/elements/grouping-notes/stems/drawNoteTopFlag.js'
import drawNoteBottomFlag from '#msq/drawer/elements/grouping-notes/stems/drawNoteBottomFlag.js'
import calculateNumberOfFlagsBySingleUnitDuration from '#msq/drawer/elements/grouping-notes/stems/calculateNumberOfFlagsBySingleUnitDuration.js'

export default function (styles, unitDuration, stemWithCoordinates, stemDirection, isGrace) {
  const { stemWidth, graceElementsScaleFactor } = styles
  const numberOfFlagsByNoteLength = calculateNumberOfFlagsBySingleUnitDuration(unitDuration)
  let wave
  if (stemDirection === 'up') {
    wave = drawNoteTopFlag(numberOfFlagsByNoteLength)(styles, stemWithCoordinates.right - stemWidth / 2 * (isGrace ? graceElementsScaleFactor : 1), stemWithCoordinates.top)
  } else {
    wave = drawNoteBottomFlag(numberOfFlagsByNoteLength)(styles, stemWithCoordinates.right - stemWidth / 2 * (isGrace ? graceElementsScaleFactor : 1), stemWithCoordinates.bottom)
  }
  return wave
}

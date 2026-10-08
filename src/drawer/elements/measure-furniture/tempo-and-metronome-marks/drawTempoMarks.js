'use strict'

import drawTempoMark from '#msq/drawer/elements/measure-furniture/tempo-and-metronome-marks/drawTempoMark.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measuresOnPageLine, voicesBodiesOnPageLine, styles) {
  const tempoMarks = []
  measuresOnPageLine.forEach((measure) => {
    if (measure.tempoMark) {
      const tempoMark = drawTempoMark(measure, measure.measureIndexInGeneral, voicesBodiesOnPageLine[measure.measureIndexOnPageLine], styles)
      addPropertiesToElement(
        tempoMark,
        {
          'ref-ids': `tempo-mark-${measure.measureIndexInGeneral + 1}`
        }
      )
      tempoMarks.push(tempoMark)
    }
  })
  return tempoMarks
}

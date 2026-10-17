'use strict'

import untieUnitWithNotes from '#msq/midi/untieUnitWithNotes.js'

export default function (unitParams, measuresParams, measureParams, measureIndex, staveIndex, voiceIndex, unitIndex) {
  if (unitParams.tremoloParams) {
    if (unitParams.tremoloParams.type === 'withNext') {
      const nextUnitInThisMeasure = measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][unitIndex + 1]
      if (
        nextUnitInThisMeasure &&
        (unitParams.unitDuration === nextUnitInThisMeasure.unitDuration)
      ) {
        nextUnitInThisMeasure.tremoloParams = Object.assign({}, unitParams.tremoloParams)
        nextUnitInThisMeasure.tremoloParams.type = 'withPrevious'
        untieUnitWithNotes(unitParams)
      }

      const firstUnitInNextMeasure = (
        measuresParams[measureIndex + 1] &&
        measuresParams[measureIndex + 1].stavesParams &&
        measuresParams[measureIndex + 1].stavesParams[staveIndex] &&
        measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams &&
        measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex]
      )
        ? measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex][0]
        : undefined

      if (
        !nextUnitInThisMeasure &&
        firstUnitInNextMeasure &&
        (unitParams.unitDuration === firstUnitInNextMeasure.unitDuration)
      ) {
        firstUnitInNextMeasure.tremoloParams = Object.assign({}, unitParams.tremoloParams)
        firstUnitInNextMeasure.tremoloParams.type = 'withPrevious'
        untieUnitWithNotes(unitParams)
      }
      if (!nextUnitInThisMeasure && !firstUnitInNextMeasure) {
        unitParams.tremoloParams.type = 'single'
      }
    }
  }
}

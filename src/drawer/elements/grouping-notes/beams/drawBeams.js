'use strict'

import drawBeamsWithStemsForDrawnSingleUnitsInVoiceOnOneStave from '#msq/drawer/elements/grouping-notes/beams/drawBeamsWithStemsForDrawnSingleUnitsInVoiceOnOneStave.js'

const generateKeyForBeam = (staveIndex, voiceIndex, isGrace) => {
  return `${staveIndex}-${voiceIndex}-${isGrace}`
}

export default function (voicesOnPageLine, styles) {
  const beams = []
  const beamsStack = {}
  if (voicesOnPageLine) {
    for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
      if (voicesOnPageLine[measureIndex]) {
        const { singleUnitsInVoices, withoutVoices } = voicesOnPageLine[measureIndex]
        if (!withoutVoices) {
          for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
            if (singleUnitsInVoices[staveIndex]) {
              for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
                if (singleUnitsInVoices[staveIndex][voiceIndex]) {
                  for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
                    const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
                    const beamKey = generateKeyForBeam(staveIndex, voiceIndex, currentSingleUnit.isGrace)
                    if (!beamsStack[beamKey]) {
                      beamsStack[beamKey] = {
                        singleUnits: []
                      }
                    }
                    beamsStack[beamKey].singleUnits.push(
                      currentSingleUnit
                    )
                    if (currentSingleUnit.isLastSingleUnitInVoiceOnPageLine) {
                      const plainKeyForBeam = generateKeyForBeam(staveIndex, voiceIndex, false)
                      const graceKeyForBeam = generateKeyForBeam(staveIndex, voiceIndex, true)
                      if (beamsStack[plainKeyForBeam]) {
                        beams.push(
                          ...drawBeamsWithStemsForDrawnSingleUnitsInVoiceOnOneStave(
                            beamsStack[plainKeyForBeam].singleUnits, styles
                          )
                        )
                        delete beamsStack[plainKeyForBeam]
                      }
                      if (beamsStack[graceKeyForBeam]) {
                        beams.push(
                          ...drawBeamsWithStemsForDrawnSingleUnitsInVoiceOnOneStave(
                            beamsStack[graceKeyForBeam].singleUnits, styles
                          )
                        )
                        delete beamsStack[graceKeyForBeam]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return beams
}

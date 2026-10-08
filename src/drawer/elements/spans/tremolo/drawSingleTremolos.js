'use strict'

import drawSingleTremolo from '#msq/drawer/elements/spans/tremolo/drawSingleTremolo.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (voicesOnPageLine, styles) {
  const singleTremolos = []
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
                    const singleTremolo = drawSingleTremolo(currentSingleUnit, styles)
                    if (singleTremolo) {
                      addPropertiesToElement(
                        singleTremolo,
                        {
                          'ref-ids': `tremolo-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
                        }
                      )
                      currentSingleUnit.top = Math.min(currentSingleUnit.top, singleTremolo.top)
                      currentSingleUnit.bottom = Math.max(currentSingleUnit.bottom, singleTremolo.bottom)
                      singleTremolos.push(singleTremolo)
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
  return singleTremolos
}

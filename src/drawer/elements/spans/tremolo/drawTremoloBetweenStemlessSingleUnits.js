'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'

export default function (voicesOnPageLine, styles) {
  const { yDistanceBetweenSingleTremoloStrokes, tremoloStrokeOptions, beamWidth, noteSquareStemStrokeOptions, negativeXOffsetOfTremoloBeams, negativeXOffsetOfTremoloBeamsForUnitWithNotesOnLedgerLines } = styles
  const tremolos = []
  const stemWidth = noteSquareStemStrokeOptions.width
  const beamLineHeightNormal = Math.sqrt(Math.pow(beamWidth, 2) - Math.pow(stemWidth, 2))
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
                  const nextSingleUnitInVoice = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex + 1]
                  if (nextSingleUnitInVoice && currentSingleUnit.hasConnectedTremolo && currentSingleUnit.tremoloWithNext && currentSingleUnit.stemless && currentSingleUnit.unitDuration === nextSingleUnitInVoice.unitDuration) {
                    const allTremoloStrokeHeight = (currentSingleUnit.numberOfTremoloStrokes - 1) * yDistanceBetweenSingleTremoloStrokes + currentSingleUnit.numberOfTremoloStrokes * beamLineHeightNormal
                    const leftUnitNoteHeadsHeight = currentSingleUnit.bodyBottom - currentSingleUnit.bodyTop
                    const rightUnitNoteHeadsHeight = nextSingleUnitInVoice.bodyBottom - nextSingleUnitInVoice.bodyTop
                    const yStartOfTremoloLeftEdge = currentSingleUnit.bodyTop + (leftUnitNoteHeadsHeight - allTremoloStrokeHeight) / 2
                    const yStartOfTremoloRightEdge = nextSingleUnitInVoice.bodyTop + (rightUnitNoteHeadsHeight - allTremoloStrokeHeight) / 2
                    const xLeftEdge = currentSingleUnit.bodyRight + (currentSingleUnit.anyNotesOnLedgerLines ? negativeXOffsetOfTremoloBeamsForUnitWithNotesOnLedgerLines : negativeXOffsetOfTremoloBeams)
                    const xRightEdge = nextSingleUnitInVoice.bodyLeft - (nextSingleUnitInVoice.anyNotesOnLedgerLines ? negativeXOffsetOfTremoloBeamsForUnitWithNotesOnLedgerLines : negativeXOffsetOfTremoloBeams)
                    const tremoloPoints = []
                    for (let index = 0; index < currentSingleUnit.numberOfTremoloStrokes; index++) {
                      tremoloPoints.push(
                        'M',
                        xLeftEdge, yStartOfTremoloLeftEdge + index * (yDistanceBetweenSingleTremoloStrokes + beamLineHeightNormal),
                        'L',
                        xRightEdge, yStartOfTremoloRightEdge + index * (yDistanceBetweenSingleTremoloStrokes + beamLineHeightNormal),
                        'L',
                        xRightEdge, yStartOfTremoloRightEdge + index * (yDistanceBetweenSingleTremoloStrokes + beamLineHeightNormal) + beamLineHeightNormal,
                        'L',
                        xLeftEdge, yStartOfTremoloLeftEdge + index * (yDistanceBetweenSingleTremoloStrokes + beamLineHeightNormal) + beamLineHeightNormal,
                        'Z'
                      )
                    }
                    tremolos.push(
                      createPath(
                        tremoloPoints,
                        tremoloStrokeOptions
                      )
                    )
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return tremolos
}

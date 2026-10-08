'use strict'

import calculateNumberOfBeamsByDuration from '#msq/drawer/elements/shared/calculateNumberOfBeamsByDuration.js'
import drawBeamedStemExtension from '#msq/drawer/elements/grouping-notes/beams/drawBeamedStemExtension.js'
import drawBeamedStemExtensionForStemInBeamedSingleUnitsChainWithDifferentStemDirections from '#msq/drawer/elements/grouping-notes/beams/drawBeamedStemExtensionForStemInBeamedSingleUnitsChainWithDifferentStemDirections.js'
import drawBeamsPiece from '#msq/drawer/elements/grouping-notes/beams/drawBeamsPiece.js'

export default function (styles, stems, minNumberOfBeams, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection, beamLineCoefficients, anyStemDirectionChangesInBeamedSingleUnits) {
  const beamedStemExtensions = []
  const beamsPieces = []
  const firstStemDirection = stems[0].direction
  const numberOfDrawnBeamsForEachStemInLeftSide = []
  for (let index = 0; index < stems.length; index++) {
    const isFirstBeam = (index === 0)
    const isLastBeam = (index === stems.length - 2)
    const stem = stems[index]
    const nextStem = stems[index + 1]
    const nextToNextStem = stems[index + 2]
    if (nextStem) {
      const numberOfBeamsForStemInRightSide = calculateNumberOfBeamsByDuration(stem.unitDuration) + (stem.hasConnectedTremolo ? stem.numberOfTremoloStrokesInUnit : 0)
      const numberOfBeamsForNextStemInLeftSide = calculateNumberOfBeamsByDuration(nextStem.unitDuration) + (nextStem.hasConnectedTremolo ? nextStem.numberOfTremoloStrokesInUnit : 0)
      const numberOfBeamsForNextToNextStemInLeftSide = nextToNextStem ? (calculateNumberOfBeamsByDuration(nextToNextStem.unitDuration) + nextToNextStem.numberOfTremoloStrokesInUnit) : undefined
      let numberOfBeamsForStemInRightSideToDraw = numberOfBeamsForStemInRightSide
      let numberOfBeamsForNextStemInLeftSideToDraw = numberOfBeamsForNextStemInLeftSide
      if (numberOfBeamsForNextToNextStemInLeftSide >= numberOfBeamsForNextStemInLeftSide) {
        numberOfBeamsForNextStemInLeftSideToDraw = Math.min(numberOfBeamsForStemInRightSide, numberOfBeamsForNextStemInLeftSide)
      }
      if (numberOfDrawnBeamsForEachStemInLeftSide[index - 1]) {
        if (numberOfDrawnBeamsForEachStemInLeftSide[index - 1] >= numberOfBeamsForStemInRightSide) {
          numberOfBeamsForStemInRightSideToDraw = Math.min(numberOfBeamsForStemInRightSide, numberOfBeamsForNextStemInLeftSide)
        }
      }
      numberOfDrawnBeamsForEachStemInLeftSide.push(numberOfBeamsForNextStemInLeftSideToDraw)
      beamsPieces.push(
        drawBeamsPiece(styles, stem, nextStem, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection, isFirstBeam, isLastBeam, numberOfBeamsForStemInRightSideToDraw, numberOfBeamsForNextStemInLeftSideToDraw, beamLineCoefficients, anyStemDirectionChangesInBeamedSingleUnits, firstStemDirection)
      )
    }
  }
  for (let index = 0; index < stems.length; index++) {
    const stem = stems[index]
    if (!anyStemDirectionChangesInBeamedSingleUnits) {
      beamedStemExtensions.push(
        drawBeamedStemExtension(styles, stem, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection)
      )
    } else {
      beamedStemExtensions.push(
        drawBeamedStemExtensionForStemInBeamedSingleUnitsChainWithDifferentStemDirections(styles, stem)
      )
    }
  }
  return {
    beamedStemExtensions,
    beamsPieces
  }
}

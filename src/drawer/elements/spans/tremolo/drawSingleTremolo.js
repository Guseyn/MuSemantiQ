'use strict'

import calculateNumberOfBeamsByDuration from '#msq/drawer/elements/shared/calculateNumberOfBeamsByDuration.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (singleUnit, styles) {
  const pointsOfTremoloStrokes = []
  const { yDistanceBetweenSingleTremoloStrokes, singleTremoloStrokeNormalWidth, singleTremoloStrokeWithFlagsNormalWidth, tremoloStrokeLineAngleHeight, tremoloStrokeOptions, singleTremoloStrokesYStartOffsetFromStemEdgeInBeamedSingleUnits, singleTremoloStrokesStartOffsetFromBody, singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithTopFlags, singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithOneTopFlag, singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithBottomFlags, singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithOneBottomFlag, intervalBetweenBarLines, singleTremoloStrokeNormalVerticalWidth, noteSquareStemStrokeOptions, noteBeamStrokeOptions, graceElementsScaleFactor } = styles
  const graceFactor = singleUnit.isGrace ? graceElementsScaleFactor : 1
  if (singleUnit.numberOfTremoloStrokes > 0 && singleUnit.tremoloDurationFactor === 1) {
    const xCenterOfStrokes = singleUnit.stemless
      ? (singleUnit.bodyLeft + singleUnit.bodyRight) / 2
      : singleUnit.stemLeft
    const numberOfBeamsInCaseIfTheyAreDrawn = calculateNumberOfBeamsByDuration(singleUnit.unitDuration)
    const stemWidth = noteSquareStemStrokeOptions.width
    const beamLineHeightNormal = Math.sqrt(Math.pow(singleTremoloStrokeNormalVerticalWidth, 2) - Math.pow(stemWidth, 2))
    const yStartOfSingleTremoloStrokes = (singleUnit.beamedWithNext || singleUnit.beamedWithPrevious)
      ? singleUnit.stemDirection === 'up'
        ? (singleUnit.stemTop + (singleTremoloStrokesYStartOffsetFromStemEdgeInBeamedSingleUnits + numberOfBeamsInCaseIfTheyAreDrawn * beamLineHeightNormal + numberOfBeamsInCaseIfTheyAreDrawn * intervalBetweenBarLines + numberOfBeamsInCaseIfTheyAreDrawn * noteBeamStrokeOptions.width) * graceFactor)
        : (singleUnit.stemBottom - (singleTremoloStrokesYStartOffsetFromStemEdgeInBeamedSingleUnits + numberOfBeamsInCaseIfTheyAreDrawn * beamLineHeightNormal + numberOfBeamsInCaseIfTheyAreDrawn * intervalBetweenBarLines + numberOfBeamsInCaseIfTheyAreDrawn * noteBeamStrokeOptions.width) * graceFactor)
      : singleUnit.stemDirection === 'up'
        ? singleUnit.withFlags
          ? (singleUnit.numberOfTremoloStrokes === 1)
            ? singleUnit.bodyTop - singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithOneTopFlag * graceFactor
            : singleUnit.bodyTop - singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithTopFlags * graceFactor
          : singleUnit.bodyTop - singleTremoloStrokesStartOffsetFromBody * graceFactor
        : singleUnit.withFlags
          ? (singleUnit.numberOfTremoloStrokes === 1)
            ? singleUnit.bodyBottom + (singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithOneBottomFlag + beamLineHeightNormal) * graceFactor
            : singleUnit.bodyBottom + (singleTremoloStrokesYStartOffsetFromSingleUnitNoteHeadsWithBottomFlags + beamLineHeightNormal) * graceFactor
          : singleUnit.bodyBottom + (singleTremoloStrokesStartOffsetFromBody + beamLineHeightNormal) * graceFactor
    const tremoloYDirectionSing = (singleUnit.beamedWithNext || singleUnit.beamedWithPrevious)
      ? singleUnit.stemDirection === 'up' ? +1 : -1
      : singleUnit.stemDirection === 'up' ? -1 : +1
    for (let strokeIndex = 0; strokeIndex < singleUnit.numberOfTremoloStrokes; strokeIndex++) {
      const yLeftStart = yStartOfSingleTremoloStrokes + strokeIndex * tremoloYDirectionSing * (beamLineHeightNormal + yDistanceBetweenSingleTremoloStrokes) * graceFactor
      const yLeftEnd = yStartOfSingleTremoloStrokes + strokeIndex * tremoloYDirectionSing * (beamLineHeightNormal + yDistanceBetweenSingleTremoloStrokes) * graceFactor + tremoloYDirectionSing * beamLineHeightNormal * graceFactor
      const yRightStart = yLeftStart - tremoloStrokeLineAngleHeight * graceFactor
      const yRightEnd = yLeftEnd - tremoloStrokeLineAngleHeight * graceFactor
      const singleTremoloStrokeNormalWidthConsideringFlags = singleUnit.withFlags
        ? singleTremoloStrokeWithFlagsNormalWidth
        : singleTremoloStrokeNormalWidth
      pointsOfTremoloStrokes.push(
        'M',
        xCenterOfStrokes - singleTremoloStrokeNormalWidthConsideringFlags * graceFactor / 2,
        yLeftStart,
        'L',
        xCenterOfStrokes - singleTremoloStrokeNormalWidthConsideringFlags * graceFactor / 2,
        yLeftEnd,
        'L',
        xCenterOfStrokes + singleTremoloStrokeNormalWidthConsideringFlags * graceFactor / 2,
        yRightEnd,
        'L',
        xCenterOfStrokes + singleTremoloStrokeNormalWidthConsideringFlags * graceFactor / 2,
        yRightStart
      )
    }
  }
  if (pointsOfTremoloStrokes.length === 0) {
    return null
  }
  return createGroup(
    'singleTremoloStrokes',
    [
      createPath(pointsOfTremoloStrokes, tremoloStrokeOptions)
    ]
  )
}

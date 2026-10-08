'use strict'

import createLine from '#msq/drawer/elements/basic/createLine.js'

const calculateAdditionalStemHeightForUnitWithFlags = (numberOfStaveLines, stemDirection, unitDuration, numberOfTremoloStrokes, firstTwoNotesWithFlagsASecondApartAndFirstOneIsDisplaced, firstTwoNoteswithFlagsASecondApartAndFirstOneIsNotDisplaced, lastTwoNoteswithFlagsASecondApartAndLastOneIsDisplaced, lastTwoNoteswithFlagsASecondApartAndLastOneIsNotDisplaced, noteOnEdgeInSingleUnitwithFlagsIsOnStaveLine, noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines, thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote, thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote, isGrace, styles) => {
  let result = 0
  if (stemDirection === 'up') {
    if (firstTwoNotesWithFlagsASecondApartAndFirstOneIsDisplaced) {
      if (noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote) {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesAbove
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesAbove : 0)
        } else {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndBetweenStaveLines
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndBetweenStaveLines : 0)
        }
      } else {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote) {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesAbove
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesAbove : 0)
        } else {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndOnStaveLine
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsDisplacedAndOnStaveLine : 0)
        }
      }
    } else if (firstTwoNoteswithFlagsASecondApartAndFirstOneIsNotDisplaced) {
      if (noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote) {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesAbove
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesAbove : 0)
        } else {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndBetweenStaveLines
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndBetweenStaveLines : 0)
        }
      } else {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote) {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesAbove
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesAbove : 0)
        } else {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndOnStaveLine
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsNotDisplacedAndOnStaveLine : 0)
        }
      }
    } else {
      if (noteOnEdgeInSingleUnitwithFlagsIsOnStaveLine) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote) {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsOnStaveLineAndThereAreDrawnStaveLinesAbove
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWavesWhereFirstNoteIsOnStaveLineAndThereAreDrawnStaveLinesAbove : 0)
        } else {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteIsOnStaveLine
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteIsOnStaveLine : 0)
        }
      } else if (noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote) {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteBetweenStaveLinesAndThereAreDrawnStaveLinesAbove
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteBetweenStaveLinesAndThereAreDrawnStaveLinesAbove : 0)
        } else {
          result += styles.additionalHeightForUpStemWithFlagsWhereFirstNoteBetweenStaveLines
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForUpStemWithFlagsWhereFirstNoteBetweenStaveLines : 0)
        }
      }
    }
  } else if (stemDirection === 'down') {
    if (lastTwoNoteswithFlagsASecondApartAndLastOneIsDisplaced) {
      if (noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote) {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesBelow
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesBelow : 0)
        } else {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndBetweenStaveLines
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndBetweenStaveLines : 0)
        }
      } else {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote) {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesBelow
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesBelow : 0)
        } else {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndOnStaveLine
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsDisplacedAndOnStaveLine : 0)
        }
      }
    } else if (lastTwoNoteswithFlagsASecondApartAndLastOneIsNotDisplaced) {
      if (noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote) {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesBelow
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndBetweenStaveLinesAndThereAreDrawnStaveLinesBelow : 0)
        } else {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndBetweenStaveLines
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndBetweenStaveLines : 0)
        }
      } else {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote) {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesBelow
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndOnStaveLineAndThereAreDrawnStaveLinesBelow : 0)
        } else {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndOnStaveLine
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsNotDisplacedAndOnStaveLine : 0)
        }
      }
    } else {
      if (noteOnEdgeInSingleUnitwithFlagsIsOnStaveLine) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote) {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsOnStaveLineAndThereAreDrawnStaveLinesBelow
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsOnStaveLineAndThereAreDrawnStaveLinesBelow : 0)
        } else {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteIsOnStaveLine
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteIsOnStaveLine : 0)
        }
      } else if (noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines) {
        if (thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote) {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteBetweenStaveLinesAndThereAreDrawnStaveLinesBelow
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteBetweenStaveLinesAndThereAreDrawnStaveLinesBelow : 0)
        } else {
          result += styles.additionalHeightForDownStemWithFlagsWhereLastNoteBetweenStaveLines
          result += (isGrace ? styles.graceStemAdjustmentForAdditionalHeightForDownStemWithFlagsWhereLastNoteBetweenStaveLines : 0)
        }
      }
    }
  }
  return result
}

const calculateAdditionalStemHeightForSingleUnitWithTremoloStrokesAndNoFlags = (numberOfTremoloStrokes, withFlags, styles) => {
  if (!withFlags) {
    if (numberOfTremoloStrokes === 3) {
      return styles.additionalStemHeightForUnitWithThreeTremoloStrokes
    }
    if (numberOfTremoloStrokes === 2) {
      return styles.additionalStemHeightForUnitWithTwoTremoloStrokes
    }
    if (numberOfTremoloStrokes === 1) {
      return styles.additionalStemHeightForUnitWithOneTremoloStroke
    }
  }
  return 0
}

const calculateAdditionalStemHeightForSingleUnitWithConnectedTremoloAndUnitDurationIsQuarterOrHalf = (hasConnectedTremolo, numberOfTremoloStrokes, unitDuration, styles) => {
  if (hasConnectedTremolo && (unitDuration === 1 / 4 || unitDuration === 1 / 2)) {
    if (numberOfTremoloStrokes === 2) {
      return styles.additionalStemHeightForUnitWithConnectedTwoStrokesTremoloAndUnitDurationIsQuarterOrHalf
    }
    if (numberOfTremoloStrokes === 3) {
      return styles.additionalStemHeightForUnitWithConnectedThreeStrokesTremoloAndUnitDurationIsQuarterOrHalf
    }
  }
  return 0
}

export default function (numberOfStaveLines, styles, sortedNotes, withFlags, numberOfTremoloStrokes, hasConnectedTremolo, nonDisplacedPartOfSingleUnitWithCoordinates, displacedPartOfSingleUnitWithCoordinates, notesForNonDisplacedPartOfUnit, notesForDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, beamed, noteOnEdgeInSingleUnitwithFlagsIsOnStaveLine, noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines, thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsMoreThanMaxNotePositionNumberInCurrentSingleUnitOnTheSameStave, thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsLessThanMinNotePositionNumberInCurrentSingleUnitOnTheSameStave, isGrace) {
  const { noteStemStrokeOptions, defaultStemHeightForSingleUnit, defaultStemHeightForHalfSingleUnit, defaultStemHeightForQuadrupleSingleUnit, yDistanceFromNoteHeadForStem, verticalStemCorrectionForGhostHalfNoteAtEdgeOfUnitNoteHeads, verticalStemCorrectionForGhostNoteAtEdgeOfUnitNoteHeads, graceElementsScaleFactor } = styles
  const tunedNoteStemStrokeOptions = Object.assign({}, noteStemStrokeOptions)
  if (isGrace) {
    tunedNoteStemStrokeOptions.width *= graceElementsScaleFactor
  }
  const chordBodyTop = displacedPartOfSingleUnitWithCoordinates ? Math.min(nonDisplacedPartOfSingleUnitWithCoordinates.top, displacedPartOfSingleUnitWithCoordinates.top) : nonDisplacedPartOfSingleUnitWithCoordinates.top
  const chordBodyBottom = displacedPartOfSingleUnitWithCoordinates ? Math.max(nonDisplacedPartOfSingleUnitWithCoordinates.bottom, displacedPartOfSingleUnitWithCoordinates.bottom) : nonDisplacedPartOfSingleUnitWithCoordinates.bottom
  let stemHeight = defaultStemHeightForSingleUnit
  if (unitDuration === 1 / 2) {
    stemHeight = defaultStemHeightForHalfSingleUnit
  } else if (unitDuration === 4) {
    stemHeight = defaultStemHeightForQuadrupleSingleUnit
  }
  const isNotBeamedAndWithoutConnectedTremolo = !beamed && !hasConnectedTremolo
  if (stemDirection === 'up') {
    const xPosition = nonDisplacedPartOfSingleUnitWithCoordinates.right - (unitDuration === 4 ? 0 : noteStemStrokeOptions.width / 2) * (isGrace ? graceElementsScaleFactor : 1)
    const isLastNoteGhost = notesForNonDisplacedPartOfUnit[notesForNonDisplacedPartOfUnit.length - 1].isGhost
    const bottomPoint = chordBodyBottom - (yDistanceFromNoteHeadForStem + (isLastNoteGhost && unitDuration !== 1 / 2 ? verticalStemCorrectionForGhostNoteAtEdgeOfUnitNoteHeads : 0) - (isLastNoteGhost && unitDuration === 1 / 2 ? verticalStemCorrectionForGhostHalfNoteAtEdgeOfUnitNoteHeads : 0)) * (isGrace ? graceElementsScaleFactor : 1)
    const firstTwoNotesWithFlagsASecondApartAndFirstOneIsDisplaced = withFlags && sortedNotes[0] && sortedNotes[1] && sortedNotes[0].displaced
    const firstTwoNoteswithFlagsASecondApartAndFirstOneIsNotDisplaced = withFlags && sortedNotes[0] && sortedNotes[1] && sortedNotes[1].displaced
    const thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote = sortedNotes[0] && ((sortedNotes[0].positionNumber > 0) || thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsLessThanMinNotePositionNumberInCurrentSingleUnitOnTheSameStave)
    const stemLine = createLine(
      xPosition,
      isNotBeamedAndWithoutConnectedTremolo
        ? (
          chordBodyTop - (
            stemHeight + (
              calculateAdditionalStemHeightForSingleUnitWithTremoloStrokesAndNoFlags(numberOfTremoloStrokes, withFlags, styles) +
              calculateAdditionalStemHeightForUnitWithFlags(numberOfStaveLines, stemDirection, unitDuration, numberOfTremoloStrokes, firstTwoNotesWithFlagsASecondApartAndFirstOneIsDisplaced, firstTwoNoteswithFlagsASecondApartAndFirstOneIsNotDisplaced, false, false, noteOnEdgeInSingleUnitwithFlagsIsOnStaveLine, noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines, thereAreDrawnStaveLinesIncludingAdditionalOnesAboveFirstNote, false, isGrace, styles)
            )
          ) * (isGrace ? graceElementsScaleFactor : 1)
        )
        : chordBodyTop - calculateAdditionalStemHeightForSingleUnitWithConnectedTremoloAndUnitDurationIsQuarterOrHalf(hasConnectedTremolo, numberOfTremoloStrokes, unitDuration, styles) * (isGrace ? graceElementsScaleFactor : 1),
      xPosition,
      bottomPoint,
      tunedNoteStemStrokeOptions, 0, 0, 'stem'
    )
    return stemLine
  } else {
    const xPosition = nonDisplacedPartOfSingleUnitWithCoordinates.left + (unitDuration === 4 ? 0 : noteStemStrokeOptions.width / 2) * (isGrace ? graceElementsScaleFactor : 1)
    const isFirstNoteGhost = notesForNonDisplacedPartOfUnit[0].isGhost
    const topPoint = chordBodyTop + (yDistanceFromNoteHeadForStem + (isFirstNoteGhost && unitDuration !== 1 / 2 ? verticalStemCorrectionForGhostNoteAtEdgeOfUnitNoteHeads : 0) - (isFirstNoteGhost && unitDuration === 1 / 2 ? verticalStemCorrectionForGhostHalfNoteAtEdgeOfUnitNoteHeads : 0)) * (isGrace ? graceElementsScaleFactor : 1)
    const lastTwoNoteswithFlagsASecondApartAndLastOneIsDisplaced = withFlags && sortedNotes[sortedNotes.length - 1] && sortedNotes[sortedNotes.length - 2] && sortedNotes[sortedNotes.length - 1].displaced
    const lastTwoNoteswithFlagsASecondApartAndLastOneIsNotDisplaced = withFlags && sortedNotes[sortedNotes.length - 1] && sortedNotes[sortedNotes.length - 2] && sortedNotes[sortedNotes.length - 2].displaced
    const thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote = sortedNotes[sortedNotes.length - 1] && ((sortedNotes[sortedNotes.length - 1].positionNumber < numberOfStaveLines - 1) || thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsMoreThanMaxNotePositionNumberInCurrentSingleUnitOnTheSameStave)
    const stemLine = createLine(
      xPosition,
      topPoint,
      xPosition,
      isNotBeamedAndWithoutConnectedTremolo
        ? (
          chordBodyBottom + (
            stemHeight + (
              calculateAdditionalStemHeightForSingleUnitWithTremoloStrokesAndNoFlags(numberOfTremoloStrokes, withFlags, styles) +
              calculateAdditionalStemHeightForUnitWithFlags(numberOfStaveLines, stemDirection, unitDuration, numberOfTremoloStrokes, false, false, lastTwoNoteswithFlagsASecondApartAndLastOneIsDisplaced, lastTwoNoteswithFlagsASecondApartAndLastOneIsNotDisplaced, noteOnEdgeInSingleUnitwithFlagsIsOnStaveLine, noteOnEdgeInSingleUnitWithFlagsIsBetweenStaveLines, false, thereAreDrawnStaveLinesIncludingAdditionalOnesBelowLastNote, isGrace, styles)
            )
          ) * (isGrace ? graceElementsScaleFactor : 1)
        )
        : chordBodyBottom + calculateAdditionalStemHeightForSingleUnitWithConnectedTremoloAndUnitDurationIsQuarterOrHalf(hasConnectedTremolo, numberOfTremoloStrokes, unitDuration, styles) * (isGrace ? graceElementsScaleFactor : 1),
      tunedNoteStemStrokeOptions, 0, 0, 'stem'
    )
    return stemLine
  }
}

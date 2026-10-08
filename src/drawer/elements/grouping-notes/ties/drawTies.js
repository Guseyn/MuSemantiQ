'use strict'

import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import drawTieShape from '#msq/drawer/elements/grouping-notes/ties/drawTieShape.js'
import calculateTieDirection from '#msq/drawer/elements/grouping-notes/ties/calculateTieDirection.js'
import calculateTieJunctionPoint from '#msq/drawer/elements/grouping-notes/ties/calculateTieJunctionPoint.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

const generateKeyForTie = (staveIndex, voiceIndex) => {
  return `${staveIndex}-${voiceIndex}`
}

// A tie that starts or ends at the side of a note head (between the notes of a
// chord) is moved a little toward its direction, off the middle of the note.
const moveTieOffMiddleOfNote = (tie, junctionPoint, tieDirection, styles) => {
  if (!junctionPoint.tiedFromTopOrBottomOfNote) {
    moveElement(
      tie,
      0,
      tieDirection === 'up' ? -styles.tieJunctionPointInMiddleYOffset : +styles.tieJunctionPointInMiddleYOffset
    )
  }
}

export default function (voicesOnPageLine, voicesBodiesOnPageLine, styles) {
  const ties = []
  const tiesStack = {}
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { measureIndexOnPageLine, numberOfStaveLines, singleUnitsInVoices, topOffsetsForEachStave, voicesBody, isOnLastMeasureInGeneral, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
          if (singleUnitsInVoices[staveIndex]) {
            for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
              if (singleUnitsInVoices[staveIndex][voiceIndex]) {
                for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
                  const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
                  const keyForTie = generateKeyForTie(staveIndex, voiceIndex)
                  if (tiesStack[keyForTie]) {
                    tiesStack[keyForTie].rightSingleUnit = currentSingleUnit
                    for (let tieJunctionPointIndex = 0; tieJunctionPointIndex < currentSingleUnit.sortedNotes.length; tieJunctionPointIndex++) {
                      const currentNotePositionNumberInRightSingleUnitOfTie = currentSingleUnit.sortedNotes[tieJunctionPointIndex].positionNumber
                      const currentStaveInRightSingleUnitOfTie = currentSingleUnit.sortedNotes[tieJunctionPointIndex].stave
                      const correspondingTieJunctionPointIndexWithCurrentNotePositionNumberInLeftSingleUnit = tiesStack[keyForTie].leftJunctionPoints.findIndex(leftJunctionPoint => leftJunctionPoint.notePositionNumber === currentNotePositionNumberInRightSingleUnitOfTie && leftJunctionPoint.stave === currentStaveInRightSingleUnitOfTie)
                      const correspondingLeftTieJunctionPoint = tiesStack[keyForTie].leftJunctionPoints[correspondingTieJunctionPointIndexWithCurrentNotePositionNumberInLeftSingleUnit]
                      const rightTieJunctionPoint = calculateTieJunctionPoint(currentSingleUnit, topOffsetsForEachStave, staveIndex, tieJunctionPointIndex, numberOfStaveLines, 'right', correspondingLeftTieJunctionPoint, styles)
                      if (correspondingLeftTieJunctionPoint) {
                        const tieDirection = calculateTieDirection(correspondingLeftTieJunctionPoint, rightTieJunctionPoint)
                        const tie = drawTieShape(
                          correspondingLeftTieJunctionPoint.xPosition,
                          correspondingLeftTieJunctionPoint.yPosition,
                          rightTieJunctionPoint.xPosition,
                          rightTieJunctionPoint.yPosition,
                          tieDirection,
                          tiesStack[keyForTie].leftSingleUnit,
                          tiesStack[keyForTie].rightSingleUnit,
                          tiesStack[keyForTie].roundCoefficientFactor,
                          styles
                        )
                        addPropertiesToElement(
                          tie,
                          {
                            'ref-ids': `tie-${correspondingLeftTieJunctionPoint.singleUnit.measureIndexInGeneral + 1}-${correspondingLeftTieJunctionPoint.singleUnit.staveIndex + 1}-${correspondingLeftTieJunctionPoint.singleUnit.voiceIndex + 1}-${correspondingLeftTieJunctionPoint.singleUnit.singleUnitIndex + 1}`
                          }
                        )
                        addPropertiesToElement(
                          rightTieJunctionPoint.singleUnit,
                          {
                            'ref-ids': `next-to-unit-under-tie-${correspondingLeftTieJunctionPoint.singleUnit.measureIndexInGeneral + 1}-${correspondingLeftTieJunctionPoint.singleUnit.staveIndex + 1}-${correspondingLeftTieJunctionPoint.singleUnit.voiceIndex + 1}-${correspondingLeftTieJunctionPoint.singleUnit.singleUnitIndex + 1}`
                          }
                        )
                        ties.push(tie)
                        moveTieOffMiddleOfNote(tie, correspondingLeftTieJunctionPoint, tieDirection, styles)
                        tiesStack[keyForTie].leftJunctionPoints.splice(correspondingTieJunctionPointIndexWithCurrentNotePositionNumberInLeftSingleUnit, 1)
                        const theCaseWhenNothingIsLeftWeNeedToCleanItUpSoThatWeCanImmediatelyCreateNewTiesWithNewSetup = tiesStack[keyForTie].leftJunctionPoints.length === 0
                        if (theCaseWhenNothingIsLeftWeNeedToCleanItUpSoThatWeCanImmediatelyCreateNewTiesWithNewSetup) {
                          delete tiesStack[keyForTie]
                        }
                      }
                    }
                  }
                  if (currentSingleUnit.tiedWithNext) {
                    if (!tiesStack[keyForTie]) {
                      tiesStack[keyForTie] = {
                        staveIndex: staveIndex,
                        voiceIndex: voiceIndex,
                        leftJunctionPoints: [],
                        leftSingleUnit: currentSingleUnit,
                        roundCoefficientFactor: currentSingleUnit.tiedWithNext.roundCoefficientFactor
                      }
                    }
                    if (currentSingleUnit.sortedNotesPositionNumbers.length > 0) {
                      for (let tieJunctionPointIndex = 0; tieJunctionPointIndex < currentSingleUnit.sortedNotes.length; tieJunctionPointIndex++) {
                        const leftTieJunctionPoint = calculateTieJunctionPoint(currentSingleUnit, topOffsetsForEachStave, staveIndex, tieJunctionPointIndex, numberOfStaveLines, 'left', null, styles)
                        const leftTieJunctionPointIndex = tiesStack[keyForTie].leftJunctionPoints.findIndex(existingLeftJunctionPoint => existingLeftJunctionPoint.notePositionNumber === leftTieJunctionPoint.notePositionNumber && existingLeftJunctionPoint.stave === leftTieJunctionPoint.stave)
                        if (leftTieJunctionPointIndex === -1) {
                          tiesStack[keyForTie].leftJunctionPoints.push(leftTieJunctionPoint)
                        }
                      }
                    }
                  }
                  if (tiesStack[keyForTie]) {
                    if (singleUnitIndex === singleUnitsInVoices[staveIndex][voiceIndex].length - 1 && (currentSingleUnit.isOnLastMeasureOfPageLine || isOnLastMeasureInGeneral) && tiesStack[keyForTie].leftJunctionPoints.length > 0) {
                      for (let remainedLeftJunctionPointIndex = 0; remainedLeftJunctionPointIndex < tiesStack[keyForTie].leftJunctionPoints.length; remainedLeftJunctionPointIndex++) {
                        const leftTieJunctionPoint = tiesStack[keyForTie].leftJunctionPoints[remainedLeftJunctionPointIndex]
                        const tieDirection = calculateTieDirection(leftTieJunctionPoint, null)
                        const tie = drawTieShape(
                          leftTieJunctionPoint.xPosition,
                          leftTieJunctionPoint.yPosition,
                          voicesBody.right,
                          leftTieJunctionPoint.yPosition,
                          tieDirection,
                          currentSingleUnit,
                          null,
                          tiesStack[keyForTie].roundCoefficientFactor,
                          styles
                        )
                        addPropertiesToElement(
                          tie,
                          {
                            'ref-ids': `tie-${leftTieJunctionPoint.singleUnit.measureIndexInGeneral + 1}-${leftTieJunctionPoint.singleUnit.staveIndex + 1}-${leftTieJunctionPoint.singleUnit.voiceIndex + 1}-${leftTieJunctionPoint.singleUnit.singleUnitIndex + 1}`
                          }
                        )
                        moveTieOffMiddleOfNote(tie, leftTieJunctionPoint, tieDirection, styles)
                        ties.push(tie)
                      }
                      tiesStack[keyForTie].leftJunctionPoints = []
                    }
                    if (tiesStack[keyForTie].leftJunctionPoints.length === 0) {
                      delete tiesStack[keyForTie]
                    }
                  }
                  if (currentSingleUnit.tiedBefore) {
                    for (let tieJunctionPointIndex = 0; tieJunctionPointIndex < currentSingleUnit.sortedNotes.length; tieJunctionPointIndex++) {
                      const rightTieJunctionPoint = calculateTieJunctionPoint(currentSingleUnit, topOffsetsForEachStave, staveIndex, tieJunctionPointIndex, numberOfStaveLines, 'right', null, styles)
                      const tieDirection = calculateTieDirection(null, rightTieJunctionPoint)
                      const tie = drawTieShape(
                        voicesBody.left + styles.leftMarginForConnectionsThatStartBefore,
                        rightTieJunctionPoint.yPosition,
                        rightTieJunctionPoint.xPosition,
                        rightTieJunctionPoint.yPosition,
                        tieDirection,
                        null,
                        currentSingleUnit,
                        currentSingleUnit.tiedBefore.roundCoefficientFactor,
                        styles
                      )
                      addPropertiesToElement(
                        tie,
                        {
                          'ref-ids': `tie-before-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
                        }
                      )
                      moveTieOffMiddleOfNote(tie, rightTieJunctionPoint, tieDirection, styles)
                      ties.push(tie)
                    }
                  }
                  if (currentSingleUnit.tiedAfter) {
                    for (let tieJunctionPointIndex = 0; tieJunctionPointIndex < currentSingleUnit.sortedNotes.length; tieJunctionPointIndex++) {
                      const leftTieJunctionPoint = calculateTieJunctionPoint(currentSingleUnit, topOffsetsForEachStave, staveIndex, tieJunctionPointIndex, numberOfStaveLines, 'left', null, styles)
                      const tieDirection = calculateTieDirection(leftTieJunctionPoint, null)
                      const tie = drawTieShape(
                        leftTieJunctionPoint.xPosition,
                        leftTieJunctionPoint.yPosition,
                        voicesBody.right,
                        leftTieJunctionPoint.yPosition,
                        tieDirection,
                        currentSingleUnit,
                        null,
                        currentSingleUnit.tiedAfter.roundCoefficientFactor,
                        styles
                      )
                      addPropertiesToElement(
                        tie,
                        {
                          'ref-ids': `tie-after-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
                        }
                      )
                      moveTieOffMiddleOfNote(tie, leftTieJunctionPoint, tieDirection, styles)
                      ties.push(tie)
                    }
                  }
                  if (currentSingleUnit.tiedBeforeMeasure) {
                    let measureIndexThatTieStartsBefore = (currentSingleUnit.tiedBeforeMeasure.index || 1) - 1
                    if (isNaN(measureIndexThatTieStartsBefore)) {
                      measureIndexThatTieStartsBefore = measureIndexOnPageLine
                    }
                    for (let tieJunctionPointIndex = 0; tieJunctionPointIndex < currentSingleUnit.sortedNotes.length; tieJunctionPointIndex++) {
                      const rightTieJunctionPoint = calculateTieJunctionPoint(currentSingleUnit, topOffsetsForEachStave, staveIndex, tieJunctionPointIndex, numberOfStaveLines, 'right', null, styles)
                      const tieDirection = calculateTieDirection(null, rightTieJunctionPoint)
                      const tie = drawTieShape(
                        ((voicesBodiesOnPageLine[measureIndexThatTieStartsBefore] !== undefined && !voicesBodiesOnPageLine[measureIndexThatTieStartsBefore].isEmpty) ? (voicesBodiesOnPageLine[measureIndexThatTieStartsBefore].left + styles.leftMarginForConnectionsThatStartBefore) : (voicesBody.left + styles.leftMarginForConnectionsThatStartBefore)),
                        rightTieJunctionPoint.yPosition,
                        rightTieJunctionPoint.xPosition,
                        rightTieJunctionPoint.yPosition,
                        tieDirection,
                        null,
                        currentSingleUnit,
                        currentSingleUnit.tiedBeforeMeasure.roundCoefficientFactor,
                        styles
                      )
                      addPropertiesToElement(
                        tie,
                        {
                          'ref-ids': `tie-before-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
                        }
                      )
                      moveTieOffMiddleOfNote(tie, rightTieJunctionPoint, tieDirection, styles)
                      ties.push(tie)
                    }
                  }
                  if (currentSingleUnit.tiedAfterMeasure) {
                    let measureIndexThatTieFinishesAfter = (currentSingleUnit.tiedAfterMeasure.index || 1) - 1
                    if (isNaN(measureIndexThatTieFinishesAfter)) {
                      measureIndexThatTieFinishesAfter = measureIndexOnPageLine
                    }
                    for (let tieJunctionPointIndex = 0; tieJunctionPointIndex < currentSingleUnit.sortedNotes.length; tieJunctionPointIndex++) {
                      const leftTieJunctionPoint = calculateTieJunctionPoint(currentSingleUnit, topOffsetsForEachStave, staveIndex, tieJunctionPointIndex, numberOfStaveLines, 'left', null, styles)
                      const tieDirection = calculateTieDirection(leftTieJunctionPoint, null)
                      const tie = drawTieShape(
                        leftTieJunctionPoint.xPosition,
                        leftTieJunctionPoint.yPosition,
                        ((voicesBodiesOnPageLine[measureIndexThatTieFinishesAfter] !== undefined && !voicesBodiesOnPageLine[measureIndexThatTieFinishesAfter].isEmpty) ? (voicesBodiesOnPageLine[measureIndexThatTieFinishesAfter].right) : (voicesBody.right)),
                        leftTieJunctionPoint.yPosition,
                        tieDirection,
                        currentSingleUnit,
                        null,
                        currentSingleUnit.tiedAfterMeasure.roundCoefficientFactor,
                        styles
                      )
                      addPropertiesToElement(
                        tie,
                        {
                          'ref-ids': `tie-after-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
                        }
                      )
                      moveTieOffMiddleOfNote(tie, leftTieJunctionPoint, tieDirection, styles)
                      ties.push(tie)
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
  return ties
}

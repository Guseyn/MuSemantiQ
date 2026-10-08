'use strict'

import calculateTopOffsetOfElementConsideringItsStave from '#msq/drawer/elements/shared/calculateTopOffsetOfElementConsideringItsStave.js'
import drawParenthesesSpline from '#msq/drawer/elements/marks-on-units/parentheses/drawParenthesesSpline.js'
import moveSingleUnit from '#msq/drawer/elements/shared/moveSingleUnit.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (singleUnit, additionalInformation, numberOfStaveLines, parentheses, topOffset, styles) {
  const { intervalBetweenStaveLines, offsetForNoteParenthesesFromBothSides, offsetForNoteParenthesesFromRightSideOfWave, offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides, parenthesesYCorrection } = styles
  const drawnParentheses = []
  const openBrackets = []
  const closeBrackets = []
  for (let parenthesesIndex = 0; parenthesesIndex < parentheses.length; parenthesesIndex++) {
    const currentParentheses = parentheses[parenthesesIndex]
    if (currentParentheses.appliedToWholeUnit) {
      currentParentheses.fromNoteIndex = 0
      currentParentheses.toNoteIndex = singleUnit.sortedNotes.length - 1
    }
    if (currentParentheses.fromNoteIndex === undefined) {
      currentParentheses.fromNoteIndex = 0
    }
    if (currentParentheses.toNoteIndex === undefined) {
      currentParentheses.toNoteIndex = singleUnit.sortedNotes.length - 1
    }
    if (currentParentheses.fromNoteIndex < 0) {
      currentParentheses.fromNoteIndex = 0
    }
    if (currentParentheses.toNoteIndex > singleUnit.sortedNotes.length - 1) {
      currentParentheses.toNoteIndex = singleUnit.sortedNotes.length - 1
    }
    if (currentParentheses.toNoteIndex < currentParentheses.fromNoteIndex) {
      currentParentheses.toNoteIndex = currentParentheses.fromNoteIndex
    }
    currentParentheses.startPositionNumber = singleUnit.sortedNotesPositionNumbers[currentParentheses.fromNoteIndex]
    currentParentheses.endPositionNumber = singleUnit.sortedNotesPositionNumbers[currentParentheses.toNoteIndex]
    currentParentheses.startStave = singleUnit.sortedNotes[currentParentheses.fromNoteIndex].stave
    currentParentheses.endStave = singleUnit.sortedNotes[currentParentheses.toNoteIndex].stave
    const startPositionNumberIndex = currentParentheses.fromNoteIndex
    const endPositionNumberIndex = currentParentheses.toNoteIndex
    const anyDisplacedNotesBetweenStartAndEndPositionNumbers = singleUnit.sortedNotes.slice(startPositionNumberIndex, endPositionNumberIndex + 1).some(note => note.displaced)
    const anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide = singleUnit.sortedNotes.slice(startPositionNumberIndex, endPositionNumberIndex + 1).some(note => note.isOnLedgerLines && note.isOnTheLeftSideOfUnit)
    const anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnRightSide = singleUnit.sortedNotes.slice(startPositionNumberIndex, endPositionNumberIndex + 1).some(note => note.isOnLedgerLines && note.isOnTheRightSideOfUnit)
    const yParenthesesPaddingCoefficient = 0.25
    const topOfStartPositionNumber = calculateTopOffsetOfElementConsideringItsStave({ stave: currentParentheses.startStave }, numberOfStaveLines, topOffset, styles) + ((currentParentheses.startPositionNumber || singleUnit.sortedNotesPositionNumbers[0]) - yParenthesesPaddingCoefficient) * intervalBetweenStaveLines + parenthesesYCorrection
    const bottomOfEndPositionNumber = calculateTopOffsetOfElementConsideringItsStave({ stave: currentParentheses.endStave }, numberOfStaveLines, topOffset, styles) + ((currentParentheses.endPositionNumber || singleUnit.sortedNotesPositionNumbers[singleUnit.sortedNotesPositionNumbers.length - 1]) + 1 + yParenthesesPaddingCoefficient) * intervalBetweenStaveLines + parenthesesYCorrection
    let leftPositionOfParentheses
    let rightPositionOfParentheses
    if (singleUnit.numberOfDots > 0) {
      leftPositionOfParentheses = singleUnit.left - (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
      rightPositionOfParentheses = singleUnit.right + offsetForNoteParenthesesFromBothSides
    } else {
      if (singleUnit.stemDirection === 'up') {
        if (singleUnit.withFlags && startPositionNumberIndex === 0) {
          leftPositionOfParentheses = singleUnit.left - (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
          rightPositionOfParentheses = singleUnit.flagsRight + offsetForNoteParenthesesFromRightSideOfWave
        } else {
          leftPositionOfParentheses = singleUnit.left - (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
          rightPositionOfParentheses = singleUnit.right + (
            anyDisplacedNotesBetweenStartAndEndPositionNumbers
              ? (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnRightSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
              : (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
          )
        }
      } else {
        leftPositionOfParentheses = singleUnit.stemLeft - (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
        rightPositionOfParentheses = singleUnit.right + (
          anyDisplacedNotesBetweenStartAndEndPositionNumbers
            ? (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnRightSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
            : (anyNotesBetweenStartAndEndPositionNumbersOnLedgerLinesOnLeftSide ? offsetForNoteParenthesesThatAreOnLedgerLinesFromBothSides : offsetForNoteParenthesesFromBothSides)
        )
      }
    }
    const openBracket = drawParenthesesSpline(
      {
        x: leftPositionOfParentheses,
        y: topOfStartPositionNumber
      },
      {
        x: leftPositionOfParentheses,
        y: bottomOfEndPositionNumber
      },
      'left',
      styles
    )
    const closedBracket = drawParenthesesSpline(
      {
        x: rightPositionOfParentheses,
        y: topOfStartPositionNumber
      },
      {
        x: rightPositionOfParentheses,
        y: bottomOfEndPositionNumber
      },
      'right',
      styles
    )
    if (currentParentheses.id !== undefined) {
      addPropertiesToElement(
        openBracket,
        {
          'ref-ids': `note-parentheses-${singleUnit.measureIndexInGeneral + 1}-${singleUnit.staveIndex + 1}-${singleUnit.voiceIndex + 1}-${singleUnit.singleUnitIndex + 1}-${currentParentheses.id + 1}`
        }
      )
      addPropertiesToElement(
        closedBracket,
        {
          'ref-ids': `note-parentheses-${singleUnit.measureIndexInGeneral + 1}-${singleUnit.staveIndex + 1}-${singleUnit.voiceIndex + 1}-${singleUnit.singleUnitIndex + 1}-${currentParentheses.id + 1}`
        }
      )
    }
    addPropertiesToElement(
      openBracket,
      {
        'ref-ids': `unit-parentheses-${singleUnit.measureIndexInGeneral + 1}-${singleUnit.staveIndex + 1}-${singleUnit.voiceIndex + 1}-${singleUnit.singleUnitIndex + 1}-${parenthesesIndex + 1}`
      }
    )
    addPropertiesToElement(
      closedBracket,
      {
        'ref-ids': `unit-parentheses-${singleUnit.measureIndexInGeneral + 1}-${singleUnit.staveIndex + 1}-${singleUnit.voiceIndex + 1}-${singleUnit.singleUnitIndex + 1}-${parenthesesIndex + 1}`
      }
    )
    drawnParentheses.push(
      openBracket,
      closedBracket
    )
    openBrackets.push(
      openBracket
    )
    closeBrackets.push(
      closedBracket
    )
  }
  const allOpenBrackets = createGroup(
    'allOpenBrackets',
    openBrackets
  )
  const allCloseBrackets = createGroup(
    'allOpenBrackets',
    closeBrackets
  )
  additionalInformation.parenthesesLeft = allOpenBrackets.left
  additionalInformation.parenthesesRight = allCloseBrackets.right
  const singleUnitWithParentheses = createElementWithAdditionalInformation(
    createGroup(
      'withParentheses',
      [
        singleUnit,
        ...drawnParentheses
      ]
    ),
    additionalInformation
  )
  moveSingleUnit(
    singleUnitWithParentheses,
    singleUnit.left - allOpenBrackets.left
  )
  return singleUnitWithParentheses
}

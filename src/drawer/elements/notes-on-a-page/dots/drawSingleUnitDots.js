'use strict'

import calculateTopOffsetOfElementConsideringItsStave from '#msq/drawer/elements/shared/calculateTopOffsetOfElementConsideringItsStave.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

const isASecondApartWithNoteAbove = (note, noteIndex, sortedNotes) => {
  const secondDelta = 0.5
  return (
    (sortedNotes[noteIndex - 1] !== undefined) &&
    (sortedNotes[noteIndex].stave === sortedNotes[noteIndex - 1].stave) &&
    (sortedNotes[noteIndex].positionNumber - sortedNotes[noteIndex - 1].positionNumber === secondDelta)
  )
}

const isASecondApartWithNoteBelow = (note, noteIndex, sortedNotes) => {
  const secondDelta = 0.5
  return (
    (sortedNotes[noteIndex + 1] !== undefined) &&
    (sortedNotes[noteIndex + 1].stave === sortedNotes[noteIndex].stave) &&
    (sortedNotes[noteIndex + 1].positionNumber - sortedNotes[noteIndex].positionNumber === secondDelta)
  )
}

const isASecondApartWithNotesAboveAndBelow = (note, noteIndex, sortedNotes) => {
  return isASecondApartWithNoteAbove(note, noteIndex, sortedNotes) &&
    isASecondApartWithNoteBelow(note, noteIndex, sortedNotes)
}

export default function (numberOfStaveLines, sortedNotes, numberOfDots, unitDuration, stemDirection, anySecondsInSingleUnit, anyNotesOnLedgerLines, withFlags, isRest, isGrace) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, fontColor, noteDot, distanceBetweenDots, leftOffsetForDotsInSingleUnitWithNotesOnStaveLinesAndStemDirectionIsUpAndUnitDurationIsEqualToEighth, leftOffsetForDotsInSingleUnitWithNotesOnStaveLinesAndStemDirectionIsUpAndUnitDurationIsLessThanEighth, leftOffsetForDotsInSingleUnit, graceElementsScaleFactor } = styles
    const singleUnitsDotsWithCoordinates = []
    const tunedDistanceBetweenDots = distanceBetweenDots * (isGrace ? graceElementsScaleFactor : 1)
    if (isRest) {
      const rest = sortedNotes[0]
      const restPositionNumber = rest.positionNumber
      const isRestOnStaveLine = Math.abs(restPositionNumber * 10 % 2) === 0
      const topOffsetForDots = topOffset +
        (isRestOnStaveLine ? (restPositionNumber - 0.5) : restPositionNumber) * intervalBetweenStaveLines +
        ((isRestOnStaveLine && unitDuration === 1) ? 1 * intervalBetweenStaveLines : 0) +
        ((!isRestOnStaveLine && unitDuration === 1 / 2) ? -1 * intervalBetweenStaveLines : 0)
      const topOffsetForDotsConsideringItsStave = calculateTopOffsetOfElementConsideringItsStave(rest, numberOfStaveLines, topOffsetForDots, styles) + noteDot.yCorrection
      let lastLeftOffset = leftOffset + leftOffsetForDotsInSingleUnit
      for (let i = 0; i < numberOfDots; i++) {
        const dot = createPath(
          noteDot.points,
          null,
          fontColor,
          lastLeftOffset,
          topOffsetForDotsConsideringItsStave
        )
        lastLeftOffset = dot.right + tunedDistanceBetweenDots
        if (isGrace) {
          scaleElementAroundPoint(
            dot,
            graceElementsScaleFactor,
            graceElementsScaleFactor,
            {
              x: dot.left,
              y: (dot.top + dot.bottom) / 2
            }
          )
        }
        singleUnitsDotsWithCoordinates.push(dot)
      }
      return createGroup(
        'singleUnitsDots',
        singleUnitsDotsWithCoordinates
      )
    }

    const leftOffsetForDots = leftOffset +
      (
        unitDuration <= 1 / 8 && stemDirection === 'up' && withFlags
          ? unitDuration === 1 / 8
            ? leftOffsetForDotsInSingleUnitWithNotesOnStaveLinesAndStemDirectionIsUpAndUnitDurationIsEqualToEighth
            : leftOffsetForDotsInSingleUnitWithNotesOnStaveLinesAndStemDirectionIsUpAndUnitDurationIsLessThanEighth
          : leftOffsetForDotsInSingleUnit
      )
    sortedNotes.forEach((note, noteIndex) => {
      const notePositionNumber = note.positionNumber
      const isNoteOnStaveLine = Math.abs(notePositionNumber * 10 % 2) === 0
      const isNoteASecondApartWithNotesAboveAndBelow = isASecondApartWithNotesAboveAndBelow(note, noteIndex, sortedNotes)
      if (!(isNoteASecondApartWithNotesAboveAndBelow && isNoteOnStaveLine)) {
        const isNoteASecondApartWithNoteAbove = isASecondApartWithNoteAbove(note, noteIndex, sortedNotes)
        const isLastNote = noteIndex === (sortedNotes.length - 1)
        const topOffsetForDots = topOffset +
          (isNoteOnStaveLine ? (notePositionNumber - 0.5) : notePositionNumber) * intervalBetweenStaveLines +
          ((isLastNote && isNoteOnStaveLine && isNoteASecondApartWithNoteAbove) ? 1 * intervalBetweenStaveLines : 0) +
          noteDot.yCorrection
        const topOffsetForDotsConsideringItsStave = calculateTopOffsetOfElementConsideringItsStave(note, numberOfStaveLines, topOffsetForDots, styles)
        let lastLeftOffset = leftOffsetForDots
        for (let i = 0; i < numberOfDots; i++) {
          const dot = createPath(
            noteDot.points,
            null,
            fontColor,
            lastLeftOffset,
            topOffsetForDotsConsideringItsStave
          )
          lastLeftOffset = dot.right + tunedDistanceBetweenDots
          if (isGrace) {
            scaleElementAroundPoint(
              dot,
              graceElementsScaleFactor,
              graceElementsScaleFactor,
              {
                x: dot.left,
                y: (dot.top + dot.bottom) / 2
              }
            )
          }
          singleUnitsDotsWithCoordinates.push(dot)
        }
      }
    })
    return createGroup(
      'singleUnitsDots',
      singleUnitsDotsWithCoordinates
    )
  }
}

'use strict'

/*
Where one end of a tie touches one note of a unit.

A tie is drawn between two such points: the left one, where the tie starts
(after the note), and the right one, where it ends (before the note). The right
point is always calculated with its left point at hand, and takes its height
from it, so a tie is always horizontal.

A tie meets a note in one of two ways:
- at the top or the bottom of the note head: a single note, and the outer notes
  of a stemless or whole-tone unit, or of a chord whose tie goes away from it;
- at the side of the note head, between the notes of a chord.

The returned object is also read by calculateTieDirection and by the call for
the right point, so its fields stay as they are.
*/

// Notes closer than one position are a second apart: one of their heads is
// moved to the other side of the stem (it is "displaced").
const SECOND = 1

const isPositionOnLedgerLines = (positionNumber, numberOfStaveLines) => positionNumber <= -1 || positionNumber >= numberOfStaveLines

const isLessThanSecondApart = (lowerNote, higherNote) => higherNote.positionNumber - lowerNote.positionNumber < SECOND

const oppositeOf = (stemDirection) => (stemDirection === 'up') ? 'down' : 'up'

// The space between a note head (or a unit) and the tie
const xOffsetFromNote = (onLedgerLines, styles) => onLedgerLines
  ? styles.tieJunctionPointForLedgerLinesXOffset
  : styles.tieJunctionPointXOffset

// The space between a stem and the tie
const xOffsetFromStem = (onLedgerLines, styles) => onLedgerLines
  ? styles.tieJunctionPointXOffsetFromStemForNotesOnLedgerLines
  : styles.tieJunctionPointXOffsetFromStem

function presumeDirection (singleUnit, noteIsFirst, noteIsLast, leftPoint, customDirection) {
  // in a unit with whole tones the outer notes are tied away from it
  if (noteIsFirst && singleUnit.anySeconds) {
    return 'up'
  }
  if (noteIsLast && singleUnit.anySeconds) {
    return 'down'
  }
  if (leftPoint && typeof leftPoint.presumedTieDirectionForSimpleCase === 'string') {
    return leftPoint.presumedTieDirectionForSimpleCase
  }
  if (leftPoint) {
    return oppositeOf(leftPoint.singleUnit.stemDirection)
  }
  return customDirection || oppositeOf(singleUnit.stemDirection)
}

function isTiedFromTopOrBottomOfNote (tieSide, singleUnit, numberOfNotes, noteIsFirst, noteIsLast, leftPoint) {
  if (numberOfNotes === 1) {
    return true
  }
  const isOuterNoteOfStemlessUnitOrUnitWithSeconds = (noteIsFirst || noteIsLast) && (singleUnit.stemless || singleUnit.anySeconds)
  if (tieSide === 'right' && leftPoint) {
    // the right end follows the left one: from the top of the first note, or the bottom of the last
    return (noteIsFirst && leftPoint.presumedTieDirectionForSimpleCase === 'up') ||
      (noteIsLast && leftPoint.presumedTieDirectionForSimpleCase === 'down')
  }
  return Boolean(isOuterNoteOfStemlessUnitOrUnitWithSeconds)
}

// x of a tie that starts after the note, at the side of its head
function calculateXAfterNote (singleUnit, noteHead, note, hasSecondNearby, onLedgerLines, styles) {
  if (singleUnit.numberOfDots !== 0) {
    return singleUnit.right + styles.tieJunctionPointXOffset
  }
  if (!singleUnit.stemless && singleUnit.stemDirection === 'up') {
    if (hasSecondNearby) {
      return singleUnit.right + (note.displaced ? xOffsetFromNote(onLedgerLines, styles) : xOffsetFromStem(onLedgerLines, styles))
    }
    return singleUnit.stemRight + xOffsetFromStem(onLedgerLines, styles)
  }
  if (!note.displaced && !hasSecondNearby) {
    return noteHead.right + xOffsetFromNote(onLedgerLines, styles)
  }
  return singleUnit.right + xOffsetFromNote(onLedgerLines, styles)
}

// x of a tie that ends before the note, at the side of its head
function calculateXBeforeNote (singleUnit, noteHead, note, hasSecondNearby, hasSecondNearbyOnLedgerLines, onLedgerLines, noteIsInner, leftPoint, prevNote, nextNote, styles) {
  const leftNoteIsInner = !(leftPoint && leftPoint.isFirst) && !(leftPoint && leftPoint.isLast)
  const leftUnitMissesANeighbourOfThisNote = leftPoint
    ? (
      (nextNote ? leftPoint.singleUnit.sortedNotesPositionNumbers.indexOf(nextNote.positionNumber) === -1 : false) ||
      (prevNote ? leftPoint.singleUnit.sortedNotesPositionNumbers.indexOf(prevNote.positionNumber) === -1 : false)
    )
    : false
  const onOrNearLedgerLines = onLedgerLines || hasSecondNearbyOnLedgerLines
  if (hasSecondNearby && (noteIsInner || leftNoteIsInner || leftUnitMissesANeighbourOfThisNote)) {
    return singleUnit.left - xOffsetFromNote(onOrNearLedgerLines, styles)
  }
  if (!singleUnit.stemless && singleUnit.stemDirection === 'down') {
    if (hasSecondNearby || hasSecondNearbyOnLedgerLines) {
      return singleUnit.left - (note.displaced ? xOffsetFromNote(onLedgerLines, styles) : xOffsetFromStem(onLedgerLines, styles))
    }
    return singleUnit.stemLeft - xOffsetFromStem(onOrNearLedgerLines, styles)
  }
  if (!note.displaced && !hasSecondNearby) {
    return noteHead.left - xOffsetFromNote(onLedgerLines, styles)
  }
  return singleUnit.left - xOffsetFromNote(onOrNearLedgerLines, styles)
}

export default function (singleUnit, topOffsetsForEachStave, staveIndex, positionIndex, numberOfStaveLines, tieSide, leftPoint, styles) {
  const {
    intervalBetweenStaveLines,
    tieJunctionPointXOffset,
    tieJunctionPointForLedgerLinesXOffset,
    tieJunctionPointYOffset,
    tieJunctionPointOfTieWithUpDirectionThatIsOnTopFirstNoteInSingleUnitYOffset: yOffsetAboveNote,
    tieJunctionPointOfTieWithDownDirectionThatIsOnBottomOfLastNoteInSingleUnitYOffset: yOffsetBelowNote,
    ledgerLinesStrokeOptions
  } = styles

  const note = singleUnit.sortedNotes[positionIndex]
  const noteHead = singleUnit.notesWithCoordinates[positionIndex]
  const prevNote = singleUnit.sortedNotes[positionIndex - 1]
  const nextNote = singleUnit.sortedNotes[positionIndex + 1]
  const numberOfNotes = singleUnit.sortedNotes.length
  const noteIsFirst = positionIndex === 0
  const noteIsLast = positionIndex === singleUnit.sortedNotesPositionNumbers.length - 1
  const positionNumber = note.positionNumber

  // a note written on the previous or the next stave hangs from that stave's top
  let staveTop = topOffsetsForEachStave[staveIndex]
  if (note.stave === 'prev' && topOffsetsForEachStave[staveIndex - 1]) {
    staveTop = topOffsetsForEachStave[staveIndex - 1]
  } else if (note.stave === 'next' && topOffsetsForEachStave[staveIndex + 1]) {
    staveTop = topOffsetsForEachStave[staveIndex + 1]
  }

  // ledger lines: the note is on them, in a space beyond one (below or above), or has one through its head
  const onLedgerLines = isPositionOnLedgerLines(positionNumber, numberOfStaveLines)
  const inSpaceBelowLedgerLine = positionNumber >= numberOfStaveLines && !Number.isInteger(positionNumber)
  const inSpaceAboveLedgerLine = positionNumber <= -1 && !Number.isInteger(positionNumber)
  const ledgerLineGoesThroughNoteHead = onLedgerLines && !inSpaceBelowLedgerLine && !inSpaceAboveLedgerLine

  // a neighbour on the same stave a second away, not counting the outer side of the outer notes
  const hasSecondWithPrevNote = prevNote !== undefined && prevNote.stave === note.stave && isLessThanSecondApart(prevNote, note) && !noteIsLast
  const hasSecondWithNextNote = nextNote !== undefined && nextNote.stave === note.stave && isLessThanSecondApart(note, nextNote) && !noteIsFirst
  const hasSecondNearby = hasSecondWithPrevNote || hasSecondWithNextNote
  const hasSecondNearbyOnLedgerLines = (hasSecondWithPrevNote && isPositionOnLedgerLines(prevNote.positionNumber, numberOfStaveLines)) ||
    (hasSecondWithNextNote && isPositionOnLedgerLines(nextNote.positionNumber, numberOfStaveLines))

  const customDirection = singleUnit.tiedWithNext.direction ||
    singleUnit.tiedBefore.direction ||
    singleUnit.tiedAfter.direction ||
    singleUnit.tiedBeforeMeasure.direction ||
    singleUnit.tiedAfterMeasure.direction
  const presumedTieDirectionForSimpleCase = presumeDirection(singleUnit, noteIsFirst, noteIsLast, leftPoint, customDirection)
  const tiedFromTopOrBottomOfNote = isTiedFromTopOrBottomOfNote(tieSide, singleUnit, numberOfNotes, noteIsFirst, noteIsLast, leftPoint)

  let xPosition
  let yPosition = staveTop + positionNumber * intervalBetweenStaveLines

  if (tiedFromTopOrBottomOfNote) {
    const fromMiddleOfNoteHead = tieSide === 'left' ||
      (leftPoint && leftPoint.tiedFromTopOrBottomOfNote) ||
      (!leftPoint && numberOfNotes === 1)
    xPosition = fromMiddleOfNoteHead
      ? (noteHead.right + noteHead.left) / 2
      : noteHead.left - (ledgerLineGoesThroughNoteHead ? tieJunctionPointForLedgerLinesXOffset : tieJunctionPointXOffset)
    if (leftPoint) {
      yPosition = leftPoint.yPosition
    } else {
      const isUp = presumedTieDirectionForSimpleCase === 'up'
      const isDown = presumedTieDirectionForSimpleCase === 'down'
      const edgeOfNoteHead = isUp
        ? noteHead.top - yOffsetAboveNote
        : noteHead.bottom + yOffsetBelowNote
      // a tie that passes over a ledger line keeps clear of its stroke
      const passesOverLedgerLine = (inSpaceBelowLedgerLine && isUp) || (inSpaceAboveLedgerLine && isDown)
      const clearanceFromLedgerLine = passesOverLedgerLine
        ? (isUp ? -1 : +1) * ledgerLinesStrokeOptions.width / 2
        : 0
      yPosition = edgeOfNoteHead + clearanceFromLedgerLine
    }
  } else if (tieSide === 'left') {
    xPosition = calculateXAfterNote(singleUnit, noteHead, note, hasSecondNearby, onLedgerLines, styles)
    // the outer note of a second moves the tie a little away from its neighbour
    if (noteIsFirst && (note.displaced || (nextNote && nextNote.displaced && isLessThanSecondApart(note, nextNote)))) {
      yPosition -= tieJunctionPointYOffset
    } else if (noteIsLast && (note.displaced || (prevNote && prevNote.displaced && isLessThanSecondApart(prevNote, note)))) {
      yPosition += tieJunctionPointYOffset
    }
  } else {
    const noteIsInner = !noteIsFirst && !noteIsLast
    xPosition = calculateXBeforeNote(singleUnit, noteHead, note, hasSecondNearby, hasSecondNearbyOnLedgerLines, onLedgerLines, noteIsInner, leftPoint, prevNote, nextNote, styles)
    if (leftPoint) {
      yPosition = leftPoint.yPosition
    }
  }

  return {
    isFirst: noteIsFirst,
    isLast: noteIsLast,
    positionIndex: positionIndex,
    isInNonDisplacedPartOfUnitWithCoordinates: !note.displaced,
    yPosition: yPosition,
    xPosition: xPosition,
    tiedFromTopOrBottomOfNote,
    singleUnit: singleUnit,
    numberOfNotes,
    isOnLedgerLines: onLedgerLines,
    notePositionNumber: positionNumber,
    presumedTieDirectionForSimpleCase,
    stave: note.stave,
    customDirection
  }
}

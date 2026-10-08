'use strict'

import drawBlackNoteHead from '#msq/drawer/elements/notes-on-a-page/notes/drawBlackNoteHead.js'
import drawHalfNoteHead from '#msq/drawer/elements/notes-on-a-page/notes/drawHalfNoteHead.js'
import drawWholeNoteHead from '#msq/drawer/elements/notes-on-a-page/notes/drawWholeNoteHead.js'
import drawDoubleWholeNoteHead from '#msq/drawer/elements/notes-on-a-page/notes/drawDoubleWholeNoteHead.js'
import drawQuadrupleWholeNoteHead from '#msq/drawer/elements/notes-on-a-page/notes/drawQuadrupleWholeNoteHead.js'
import drawGhostNoteHead from '#msq/drawer/elements/marks-on-units/ghost-units/drawGhostNoteHead.js'
import calculateTopOffsetOfElementConsideringItsStave from '#msq/drawer/elements/shared/calculateTopOffsetOfElementConsideringItsStave.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex, numberOfStaveLines, notes, unitDuration, anySeconds, stemDirection, isDisplaced, isGrace) {
  return (styles, leftOffset, topOffset) => {
    const { graceElementsScaleFactor } = styles
    const noteBodiesWithCoordinates = []
    notes.forEach((note, noteIndex) => {
      const topOffsetOfNoteConsideringItsStave = calculateTopOffsetOfElementConsideringItsStave(note, numberOfStaveLines, topOffset, styles)
      let currentNoteHead
      if (note.isGhost) {
        currentNoteHead = drawGhostNoteHead(note.positionNumber, unitDuration)(styles, leftOffset, topOffsetOfNoteConsideringItsStave)
      } else {
        if (unitDuration === 4) {
          currentNoteHead = drawQuadrupleWholeNoteHead(note.positionNumber)(styles, leftOffset, topOffsetOfNoteConsideringItsStave)
        } else if (unitDuration === 2) {
          currentNoteHead = drawDoubleWholeNoteHead(note.positionNumber)(styles, leftOffset, topOffsetOfNoteConsideringItsStave)
        } else if (unitDuration === 1) {
          currentNoteHead = drawWholeNoteHead(note.positionNumber)(styles, leftOffset, topOffsetOfNoteConsideringItsStave)
        } else if (unitDuration === 1 / 2) {
          currentNoteHead = drawHalfNoteHead(note.positionNumber)(styles, leftOffset, topOffsetOfNoteConsideringItsStave)
        } else {
          currentNoteHead = drawBlackNoteHead(note.positionNumber)(styles, leftOffset, topOffsetOfNoteConsideringItsStave)
        }
      }
      addPropertiesToElement(
        currentNoteHead,
        {
          'ref-ids': `note-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}-${note.id + 1}`
        }
      )
      if (isGrace) {
        if (unitDuration === 1) {
          if (isDisplaced) {
            scaleElementAroundPoint(
              currentNoteHead,
              graceElementsScaleFactor,
              graceElementsScaleFactor,
              {
                x: (currentNoteHead.left + currentNoteHead.right) / 2,
                y: (currentNoteHead.top + currentNoteHead.bottom) / 2
              }
            )
          } else {
            scaleElementAroundPoint(
              currentNoteHead,
              graceElementsScaleFactor,
              graceElementsScaleFactor,
              {
                x: (currentNoteHead.left + currentNoteHead.right) / 2,
                y: (currentNoteHead.top + currentNoteHead.bottom) / 2
              }
            )
          }
        } else {
          if (stemDirection === 'up') {
            if (isDisplaced) {
              scaleElementAroundPoint(
                currentNoteHead,
                graceElementsScaleFactor,
                graceElementsScaleFactor,
                {
                  x: currentNoteHead.left,
                  y: (currentNoteHead.top + currentNoteHead.bottom) / 2
                }
              )
            } else {
              scaleElementAroundPoint(
                currentNoteHead,
                graceElementsScaleFactor,
                graceElementsScaleFactor,
                {
                  x: (currentNoteHead.left + currentNoteHead.right) / 2,
                  y: (currentNoteHead.top + currentNoteHead.bottom) / 2
                }
              )
            }
          } else {
            if (isDisplaced) {
              scaleElementAroundPoint(
                currentNoteHead,
                graceElementsScaleFactor,
                graceElementsScaleFactor,
                {
                  x: (currentNoteHead.left + currentNoteHead.right) / 2,
                  y: (currentNoteHead.top + currentNoteHead.bottom) / 2
                }
              )
            } else {
              scaleElementAroundPoint(
                currentNoteHead,
                graceElementsScaleFactor,
                graceElementsScaleFactor,
                {
                  x: currentNoteHead.left,
                  y: (currentNoteHead.top + currentNoteHead.bottom) / 2
                }
              )
            }
          }
        }
      }
      const isOnLedgerLines = (note.positionNumber <= -1) || (note.positionNumber >= numberOfStaveLines)
      noteBodiesWithCoordinates.push(
        createElementWithAdditionalInformation(
          currentNoteHead,
          {
            positionNumber: note.positionNumber,
            isOnLedgerLines,
            displaced: note.displaced,
            isOnTheRightSideOfUnit: note.isOnTheRightSideOfUnit,
            isOnTheLeftSideOfUnit: note.isOnTheLeftSideOfUnit,
            stave: note.stave,
            staveIndexConsideringStavePosition: note.staveIndexConsideringStavePosition,
            isGhost: note.isGhost
          }
        )
      )
      note.isOnLedgerLines = isOnLedgerLines
    })
    const singleUnitNoteHeads = createGroup(
      'singleUnitNoteHeads',
      noteBodiesWithCoordinates
    )
    const allNotesShouldBeAlighedToTheRight = (!isDisplaced && stemDirection === 'up') || (isDisplaced && stemDirection === 'down')
    for (let noteIndex = 0; noteIndex < noteBodiesWithCoordinates.length; noteIndex++) {
      if (allNotesShouldBeAlighedToTheRight && (noteBodiesWithCoordinates[noteIndex].right < singleUnitNoteHeads.right)) {
        moveElement(
          noteBodiesWithCoordinates[noteIndex],
          singleUnitNoteHeads.right - noteBodiesWithCoordinates[noteIndex].right
        )
      } else if (!allNotesShouldBeAlighedToTheRight && (noteBodiesWithCoordinates[noteIndex].left > singleUnitNoteHeads.left)) {
        moveElement(
          noteBodiesWithCoordinates[noteIndex],
          noteBodiesWithCoordinates[noteIndex].left - singleUnitNoteHeads.left
        )
      }
    }
    return createElementWithAdditionalInformation(
      singleUnitNoteHeads,
      {
        notes: noteBodiesWithCoordinates
      }
    )
  }
}

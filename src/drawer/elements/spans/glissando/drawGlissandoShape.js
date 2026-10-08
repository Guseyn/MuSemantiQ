'use strict'

import createWave from '#msq/drawer/elements/basic/createWave.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createLine from '#msq/drawer/elements/basic/createLine.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (markedGlissando, glissandoMarkKey, voicesBody, voicesBodiesOnPageLine, measuresOnPageLine, extendedFromLeftSide, extendedToRightSide, numberOfStaveLines, styles) {
  const glissandoShapeComponents = []
  const { intervalBetweenStaveLines, glissandoWavePeriod, glissandoStrokeWidth, glissandoOffsetFromNoteHead, glissandoOffsetFromNoteHeadOnLedgerLines, fontColor, graceElementsScaleFactor, leftMarginForConnectionsThatStartBefore, leftMarginForConnectionsThatStartBeforeMeasureWithEmptyVoicesBody, rightMarginForConnectionsThatFinishAfterMeasureWithEmptyVoicesBody } = styles
  const isGrace = (markedGlissando.leftSingleUnit && markedGlissando.leftSingleUnit.isGrace) || (markedGlissando.rightSingleUnit && markedGlissando.rightSingleUnit.isGrace)
  if (markedGlissando.leftSingleUnit && markedGlissando.rightSingleUnit) {
    for (let index = 0; index < markedGlissando.leftSingleUnit.notesWithCoordinates.length; index++) {
      if (markedGlissando.rightSingleUnit.notesWithCoordinates[index]) {
        const centerOfLeftNote = (markedGlissando.leftSingleUnit.notesWithCoordinates[index].top + markedGlissando.leftSingleUnit.notesWithCoordinates[index].bottom) / 2
        const centerOfRightNote = (markedGlissando.rightSingleUnit.notesWithCoordinates[index].top + markedGlissando.rightSingleUnit.notesWithCoordinates[index].bottom) / 2
        const centerOfLeftNoteIsCloseToCenterOfRightNote = Math.abs(centerOfLeftNote - centerOfRightNote) <= intervalBetweenStaveLines
        const glissandoDirectionForCurrentNote = (centerOfLeftNote > centerOfRightNote) ? 'up' : 'down'
        const isLeftNoteOnLedgerLines = markedGlissando.leftSingleUnit.notesWithCoordinates[index].positionNumber <= -1 || markedGlissando.leftSingleUnit.notesWithCoordinates[index].positionNumber >= numberOfStaveLines
        const isRightNoteOnLedgerLines = markedGlissando.rightSingleUnit.notesWithCoordinates[index].positionNumber <= -1 || markedGlissando.rightSingleUnit.notesWithCoordinates[index].positionNumber >= numberOfStaveLines
        const glissandoStartPoint = {
          x: (markedGlissando.leftSingleUnit.numberOfDots === 0 ? markedGlissando.leftSingleUnit.bodyRight : markedGlissando.leftSingleUnit.right) + (isLeftNoteOnLedgerLines ? glissandoOffsetFromNoteHeadOnLedgerLines : glissandoOffsetFromNoteHead),
          y: centerOfLeftNoteIsCloseToCenterOfRightNote
            ? centerOfLeftNote
            : (glissandoDirectionForCurrentNote === 'up')
              ? markedGlissando.leftSingleUnit.notesWithCoordinates[index].top
              : markedGlissando.leftSingleUnit.notesWithCoordinates[index].bottom
        }
        const glissandoEndPoint = {
          x: markedGlissando.rightSingleUnit.bodyLeft - (isRightNoteOnLedgerLines ? glissandoOffsetFromNoteHeadOnLedgerLines : glissandoOffsetFromNoteHead),
          y: centerOfLeftNoteIsCloseToCenterOfRightNote
            ? centerOfRightNote
            : (glissandoDirectionForCurrentNote === 'up')
              ? markedGlissando.rightSingleUnit.notesWithCoordinates[index].bottom
              : markedGlissando.rightSingleUnit.notesWithCoordinates[index].top
        }
        if (glissandoEndPoint.x < glissandoStartPoint.x) {
          glissandoEndPoint.x = glissandoStartPoint.x
        }
        if (markedGlissando.form === 'wave') {
          glissandoShapeComponents.push(
            createWave(
              glissandoStartPoint,
              glissandoEndPoint,
              glissandoWavePeriod,
              fontColor,
              graceElementsScaleFactor,
              isGrace
            )
          )
        } else if (markedGlissando.form === 'line') {
          glissandoShapeComponents.push(
            createLine(
              glissandoStartPoint.x,
              glissandoStartPoint.y,
              glissandoEndPoint.x,
              glissandoEndPoint.y,
              {
                width: glissandoStrokeWidth,
                color: fontColor
              }
            )
          )
        }
      }
    }
  } else if (extendedFromLeftSide && markedGlissando.rightSingleUnit) {
    const glissandoDirectionSign = markedGlissando.glissandoDirection === 'up' ? -1 : +1
    for (let index = 0; index < markedGlissando.rightSingleUnit.notesWithCoordinates.length; index++) {
      const isRightNoteOnLedgerLines = markedGlissando.rightSingleUnit.notesWithCoordinates[index].positionNumber < 0 || markedGlissando.rightSingleUnit.notesWithCoordinates[index].positionNumber > numberOfStaveLines - 1
      const glissandoStartPoint = {
        x: (
          (
            markedGlissando.startsBeforeCertainMeasure !== undefined &&
            voicesBodiesOnPageLine[markedGlissando.startsBeforeCertainMeasure] &&
            !voicesBodiesOnPageLine[markedGlissando.startsBeforeCertainMeasure].isEmpty
          ) ? (voicesBodiesOnPageLine[markedGlissando.startsBeforeCertainMeasure].left + leftMarginForConnectionsThatStartBefore)
            : (
              markedGlissando.startsBeforeCertainMeasure !== undefined &&
              measuresOnPageLine[markedGlissando.startsBeforeCertainMeasure] &&
              !measuresOnPageLine[markedGlissando.startsBeforeCertainMeasure].isEmpty
            ) ? measuresOnPageLine[markedGlissando.startsBeforeCertainMeasure].right + leftMarginForConnectionsThatStartBeforeMeasureWithEmptyVoicesBody
              : (voicesBody.left + leftMarginForConnectionsThatStartBefore)
        ),
        y: (markedGlissando.rightSingleUnit.notesWithCoordinates[index].top + markedGlissando.rightSingleUnit.notesWithCoordinates[index].bottom) / 2 + glissandoDirectionSign * intervalBetweenStaveLines
      }
      const glissandoEndPoint = {
        x: markedGlissando.rightSingleUnit.bodyLeft - (isRightNoteOnLedgerLines ? glissandoOffsetFromNoteHeadOnLedgerLines : glissandoOffsetFromNoteHead),
        y: (markedGlissando.rightSingleUnit.notesWithCoordinates[index].top + markedGlissando.rightSingleUnit.notesWithCoordinates[index].bottom) / 2
      }
      if (markedGlissando.form === 'wave') {
        glissandoShapeComponents.push(
          createWave(
            glissandoStartPoint,
            glissandoEndPoint,
            glissandoWavePeriod,
            fontColor,
            graceElementsScaleFactor,
            isGrace
          )
        )
      } else if (markedGlissando.form === 'line') {
        glissandoShapeComponents.push(
          createLine(
            glissandoStartPoint.x,
            glissandoStartPoint.y,
            glissandoEndPoint.x,
            glissandoEndPoint.y,
            {
              width: glissandoStrokeWidth,
              color: fontColor
            }
          )
        )
      }
    }
  } else if (extendedToRightSide && markedGlissando.leftSingleUnit) {
    const glissandoDirectionSign = markedGlissando.glissandoDirection === 'up' ? -1 : +1
    for (let index = 0; index < markedGlissando.leftSingleUnit.notesWithCoordinates.length; index++) {
      const isLeftNoteOnLedgerLines = markedGlissando.leftSingleUnit.notesWithCoordinates[index].positionNumber <= -1 || markedGlissando.leftSingleUnit.notesWithCoordinates[index].positionNumber >= numberOfStaveLines
      const glissandoStartPoint = {
        x: (markedGlissando.leftSingleUnit.numberOfDots === 0 ? markedGlissando.leftSingleUnit.bodyRight : markedGlissando.leftSingleUnit.right) + (isLeftNoteOnLedgerLines ? glissandoOffsetFromNoteHeadOnLedgerLines : glissandoOffsetFromNoteHead),
        y: (markedGlissando.leftSingleUnit.notesWithCoordinates[index].top + markedGlissando.leftSingleUnit.notesWithCoordinates[index].bottom) / 2
      }
      const glissandoEndPoint = {
        x: (
          (
            markedGlissando.finishesAfterCertainMeasure !== undefined &&
            voicesBodiesOnPageLine[markedGlissando.finishesAfterCertainMeasure] &&
            !voicesBodiesOnPageLine[markedGlissando.finishesAfterCertainMeasure].isEmpty
          ) ? voicesBodiesOnPageLine[markedGlissando.finishesAfterCertainMeasure].right
            : (
              markedGlissando.finishesAfterCertainMeasure !== undefined &&
              measuresOnPageLine[markedGlissando.finishesAfterCertainMeasure] &&
              !measuresOnPageLine[markedGlissando.finishesAfterCertainMeasure].isEmpty
            ) ? (measuresOnPageLine[markedGlissando.finishesAfterCertainMeasure].right - rightMarginForConnectionsThatFinishAfterMeasureWithEmptyVoicesBody)
              : voicesBody.right
        ),
        y: (markedGlissando.leftSingleUnit.notesWithCoordinates[index].top + markedGlissando.leftSingleUnit.notesWithCoordinates[index].bottom) / 2 + glissandoDirectionSign * intervalBetweenStaveLines
      }
      if (markedGlissando.form === 'wave') {
        glissandoShapeComponents.push(
          createWave(
            glissandoStartPoint,
            glissandoEndPoint,
            glissandoWavePeriod,
            fontColor,
            graceElementsScaleFactor,
            isGrace
          )
        )
      } else if (markedGlissando.form === 'line') {
        glissandoShapeComponents.push(
          createLine(
            glissandoStartPoint.x,
            glissandoStartPoint.y,
            glissandoEndPoint.x,
            glissandoEndPoint.y,
            {
              width: glissandoStrokeWidth,
              color: fontColor
            }
          )
        )
      }
    }
  }
  const glissando = createGroup(
    'glissando',
    glissandoShapeComponents
  )
  addPropertiesToElement(
    glissando,
    {
      'ref-ids': glissandoMarkKey
    }
  )
  return glissando
}

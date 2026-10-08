'use strict'

import createLine from '#msq/drawer/elements/basic/createLine.js'

export default function (voicesOnPageLine, styles) {
  const { intervalBetweenStaveLines, ledgerLinesStrokeOptions, ledgerLinesRadiusFromNoteHead, graceElementsScaleFactor } = styles
  const ledgerLines = []
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { singleUnitsInAllCrossStaveUnits, numberOfStaveLines, topOffsetsForEachStave, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let crossStaveUnitIndex = 0; crossStaveUnitIndex < singleUnitsInAllCrossStaveUnits.length; crossStaveUnitIndex++) {
          const currentCrossStaveUnit = singleUnitsInAllCrossStaveUnits[crossStaveUnitIndex]
          const informationThatHelpsToDrawLedgerLines = {}
          for (let crossVoiceUnitIndex = 0; crossVoiceUnitIndex < currentCrossStaveUnit.length; crossVoiceUnitIndex++) {
            const currentCrossVoiceUnitInCurrentCrossStaveUnit = currentCrossStaveUnit[crossVoiceUnitIndex]
            for (let singleUnitIndex = 0; singleUnitIndex < currentCrossVoiceUnitInCurrentCrossStaveUnit.length; singleUnitIndex++) {
              const currentSingleUnit = currentCrossVoiceUnitInCurrentCrossStaveUnit[singleUnitIndex]
              const ledgerLinesShouldBeDrawn = !currentSingleUnit.isRest || currentSingleUnit.unitDuration === 1 || currentSingleUnit.unitDuration === 1 / 2
              if (ledgerLinesShouldBeDrawn) {
                for (let noteIndex = 0; noteIndex < currentSingleUnit.notesWithCoordinates.length; noteIndex++) {
                  const currentNote = currentSingleUnit.notesWithCoordinates[noteIndex]
                  let staveIndex = currentSingleUnit.staveIndex
                  if (currentNote.stave === 'prev') {
                    staveIndex -= 1
                  } else if (currentNote.stave === 'next') {
                    staveIndex += 1
                  }
                  if (!informationThatHelpsToDrawLedgerLines[staveIndex]) {
                    informationThatHelpsToDrawLedgerLines[staveIndex] = {
                      aboveMainStaveLines: {
                        notesByPositions: {},
                        minLeft: undefined,
                        maxRight: undefined,
                        minNotePosition: undefined
                      },
                      belowMainStaveLines: {
                        notesByPositions: {},
                        minLeft: undefined,
                        maxRight: undefined,
                        maxNotePosition: undefined
                      }
                    }
                    if (currentSingleUnit.isGrace) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].isGrace = true
                    }
                  }
                  if (currentNote.positionNumber < -0.5) {
                    if (!informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.notesByPositions[currentNote.positionNumber]) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.notesByPositions[currentNote.positionNumber] = []
                    }
                    informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.notesByPositions[currentNote.positionNumber].push(
                      currentNote
                    )
                    if (informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minLeft === undefined || informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minLeft > currentNote.left) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minLeft = currentNote.left
                    }
                    if (informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.maxRight === undefined || informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.maxRight < currentNote.right) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.maxRight = currentNote.right
                    }
                    if (informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minNotePosition === undefined || informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minNotePosition > currentNote.positionNumber) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minNotePosition = currentNote.positionNumber
                    }
                  }
                  if (currentNote.positionNumber > numberOfStaveLines - 0.5) {
                    if (!informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.notesByPositions[currentNote.positionNumber]) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.notesByPositions[currentNote.positionNumber] = []
                    }
                    informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.notesByPositions[currentNote.positionNumber].push(
                      currentNote
                    )
                    if (informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.minLeft === undefined || informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.minLeft > currentNote.left) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.minLeft = currentNote.left
                    }
                    if (informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxRight === undefined || informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxRight < currentNote.right) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxRight = currentNote.right
                    }
                    if (informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxNotePosition === undefined || informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxNotePosition < currentNote.positionNumber) {
                      informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxNotePosition = currentNote.positionNumber
                    }
                  }
                }
              }
            }
          }
          for (let staveIndex in informationThatHelpsToDrawLedgerLines) {
            const ledgerLineStrokeOptionsForUnit = Object.assign({}, ledgerLinesStrokeOptions)
            let ledgerLinesOffsetFromNoteHead = ledgerLinesRadiusFromNoteHead
            if (topOffsetsForEachStave[staveIndex] !== undefined) {
              if (informationThatHelpsToDrawLedgerLines[staveIndex].isGrace) {
                ledgerLineStrokeOptionsForUnit.width *= graceElementsScaleFactor
                ledgerLinesOffsetFromNoteHead *= graceElementsScaleFactor
              }
              for (let positionIndex = -1; positionIndex >= informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minNotePosition; positionIndex -= 1) {
                const topOffsetForAdditionalLine = topOffsetsForEachStave[staveIndex] + positionIndex * intervalBetweenStaveLines
                if (positionIndex === informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minNotePosition) {
                  const minLeft = Math.min(...informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.notesByPositions[positionIndex].map(note => note.left))
                  const maxRight = Math.max(...informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.notesByPositions[positionIndex].map(note => note.right))
                  ledgerLines.push(
                    createLine(
                      minLeft - ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      maxRight + ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      ledgerLineStrokeOptionsForUnit,
                      0, 0,
                      'ledgerLine'
                    )
                  )
                } else {
                  ledgerLines.push(
                    createLine(
                      informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.minLeft - ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      informationThatHelpsToDrawLedgerLines[staveIndex].aboveMainStaveLines.maxRight + ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      ledgerLineStrokeOptionsForUnit,
                      0, 0,
                      'ledgerLine'
                    )
                  )
                }
              }
              for (let positionIndex = numberOfStaveLines; positionIndex <= informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxNotePosition; positionIndex += 1) {
                const topOffsetForAdditionalLine = topOffsetsForEachStave[staveIndex] + positionIndex * intervalBetweenStaveLines
                if (positionIndex === informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxNotePosition) {
                  const minLeft = Math.min(...informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.notesByPositions[positionIndex].map(note => note.left))
                  const maxRight = Math.max(...informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.notesByPositions[positionIndex].map(note => note.right))
                  ledgerLines.push(
                    createLine(
                      minLeft - ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      maxRight + ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      ledgerLineStrokeOptionsForUnit,
                      0, 0,
                      'ledgerLine'
                    )
                  )
                } else {
                  ledgerLines.push(
                    createLine(
                      informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.minLeft - ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      informationThatHelpsToDrawLedgerLines[staveIndex].belowMainStaveLines.maxRight + ledgerLinesOffsetFromNoteHead,
                      topOffsetForAdditionalLine,
                      ledgerLineStrokeOptionsForUnit,
                      0, 0,
                      'ledgerLine'
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
  return ledgerLines
}

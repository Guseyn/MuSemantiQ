'use strict'

import sortNotesForSingleUnitConsideringStaves from '#msq/drawer/elements/grouping-notes/chords/sortNotesForSingleUnitConsideringStaves.js'
import drawSingleUnitNoteHeads from '#msq/drawer/elements/notes-on-a-page/notes/drawSingleUnitNoteHeads.js'
import drawSingleUnitDots from '#msq/drawer/elements/notes-on-a-page/dots/drawSingleUnitDots.js'
import drawSingleUnitWithParentheses from '#msq/drawer/elements/marks-on-units/parentheses/drawSingleUnitWithParentheses.js'
import areAnySecondsInSingleUnit from '#msq/drawer/elements/grouping-notes/chords/areAnySecondsInSingleUnit.js'
import areAnyNotesOnLedgerLinesInSingleUnit from '#msq/drawer/elements/notes-on-a-page/notes/areAnyNotesOnLedgerLinesInSingleUnit.js'
import collectNotesForDisplacedPartOfSingleUnit from '#msq/drawer/elements/grouping-notes/chords/collectNotesForDisplacedPartOfSingleUnit.js'
import calculateAdditionalOffsetForDisplacedPartOfUnit from '#msq/drawer/elements/grouping-notes/chords/calculateAdditionalOffsetForDisplacedPartOfUnit.js'
import drawStemForSingleUnit from '#msq/drawer/elements/grouping-notes/stems/drawStemForSingleUnit.js'
import drawFlagsForSingleUnit from '#msq/drawer/elements/grouping-notes/stems/drawFlagsForSingleUnit.js'
import isNoteOnEdgeInSingleUnitWithFlagsBetweenStaveLines from '#msq/drawer/elements/grouping-notes/stems/isNoteOnEdgeInSingleUnitWithFlagsBetweenStaveLines.js'
import isNoteOnEdgeInSingleUnitWithFlagsOnStaveLine from '#msq/drawer/elements/grouping-notes/stems/isNoteOnEdgeInSingleUnitWithFlagsOnStaveLine.js'
import drawRest from '#msq/drawer/elements/notes-on-a-page/rests/drawRest.js'
import calculateTopOffsetOfElementConsideringItsStave from '#msq/drawer/elements/shared/calculateTopOffsetOfElementConsideringItsStave.js'
import drawSimile from '#msq/drawer/elements/measure-furniture/similes/drawSimile.js'
import calculateNumberOfTremoloStrokes from '#msq/drawer/elements/spans/tremolo/calculateNumberOfTremoloStrokes.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function ({
  pageLineNumber,
  numberOfStaveLines,
  measureIndexOnPageLine,
  measureIndexInGeneral,
  staveIndex,
  voiceIndex,
  singleUnitIndex,
  containsNotesOnCurrentStave,
  containsNotesOnPrevStave,
  containsNotesOnNextStave,
  containsKeysOnCurrentStave,
  containsKeysOnPrevStave,
  containsKeysOnNextStave,
  notes,
  unitDuration,
  actualDuration,
  stemDirection,
  numberOfDots,
  keysParams,
  parentheses,
  arpeggiated,
  beamedWithNext,
  beamedWithNextWithJustOneBeam,
  beamedWithPrevious,
  isRest,
  isOnlyUnitOnStaveWithoutMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave,
  isFullMeasure,
  isFullMeasureAndShouldBeCentralizedBecauseOfThat,
  isSimile,
  isGrace,
  isGraceUnitAndNextUnitIsNotGrace,
  hasGraceCrushLine,
  simileRefId,
  simileYCorrection,
  numberOfSimileStrokes,
  tiedWithNext,
  slurMarks,
  tiedBefore,
  tiedAfter,
  tiedBeforeMeasure,
  tiedAfterMeasure,
  glissandoMarks,
  tupletMarks,
  octaveSignMark,
  pedalMark,
  dynamicChangeMark,
  articulationParams,
  withArticulations,
  tremoloParams,
  isOnLastMeasureOfPageLine,
  isLastSingleUnitInVoiceOnPageLine,
  thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsMoreThanMaxNotePositionNumberInCurrentSingleUnitOnTheSameStave,
  thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsLessThanMinNotePositionNumberInCurrentSingleUnitOnTheSameStave
}) {
  return (styles, leftOffset, topOffset) => {
    const { graceElementsScaleFactor } = styles

    if (isSimile) {
      const simileNote = notes[0]
      const similePositionNumber = simileNote.positionNumber
      const simileStave = simileNote.stave
      const topOffsetOfSimileConsideringItsStave = calculateTopOffsetOfElementConsideringItsStave(simileNote, numberOfStaveLines, topOffset, styles)
      const simileBody = createElementWithAdditionalInformation(
        drawSimile(numberOfSimileStrokes, simileYCorrection)(styles, leftOffset, topOffsetOfSimileConsideringItsStave),
        {
          positionNumber: similePositionNumber,
          stave: simileStave
        }
      )
      if (isGrace) {
        scaleElementAroundPoint(
          simileBody,
          graceElementsScaleFactor,
          graceElementsScaleFactor,
          {
            x: (simileBody.left + simileBody.right) / 2,
            y: (simileBody.top + simileBody.bottom) / 2
          }
        )
      }
      const singleUnit = createElementWithAdditionalInformation(
        createGroup(
          'singleUnit',
          [
            simileBody
          ]
        ),
        {
          measureIndexOnPageLine,
          measureIndexInGeneral,
          staveIndex,
          voiceIndex,
          singleUnitIndex,
          containsNotesOnCurrentStave,
          containsNotesOnPrevStave,
          containsNotesOnNextStave,
          containsKeysOnCurrentStave,
          containsKeysOnPrevStave,
          containsKeysOnNextStave,
          isRest,
          isOnlyUnitOnStaveWithoutMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave,
          isFullMeasure,
          isFullMeasureAndShouldBeCentralizedBecauseOfThat,
          isSimile,
          isGrace,
          isGraceUnitAndNextUnitIsNotGrace,
          hasGraceCrushLine: false,
          tiedWithNext,
          slurMarks,
          tiedBefore,
          tiedAfter,
          tiedBeforeMeasure,
          tiedAfterMeasure,
          glissandoMarks,
          tupletMarks,
          octaveSignMark,
          pedalMark,
          dynamicChangeMark,
          isOnLastMeasureOfPageLine,
          isLastSingleUnitInVoiceOnPageLine,
          anySeconds: false,
          anyNotesOnLedgerLines: false,
          unitDuration: 0,
          actualDuration,
          sortedNotes: [ simileNote ],
          sortedNotesPositionNumbers: [ similePositionNumber ],
          stemDirection: 'up',
          withFlags: false,
          beamedWithNext: false,
          beamedWithNextWithJustOneBeam: false,
          beamedWithPrevious: false,
          beamed: false,
          numberOfDots: 0,
          keysParams,
          arpeggiated,
          articulationParams,
          stemless: false,
          tremoloDurationFactor: 1,
          numberOfTremoloStrokes: 0,
          hasConnectedTremolo: false,
          tremoloWithNext: false,
          tremoloWithPrevious: false,
          notesWithCoordinates: [ simileBody ],
          notesPositionNumbersInNonDisplacedPartOfSingleUnit: [ similePositionNumber ],
          notesPositionNumbersInDisplacedPartOfSingleUnit: [],
          nonDisplacedPartOfSingleUnitWithCoordinates: {
            isEmpty: true,
            name: 'g',
            transformations: [],
            top: simileBody.top,
            right: simileBody.right,
            bottom: simileBody.bottom,
            left: simileBody.left
          },
          bodyTop: simileBody.top,
          bodyRight: simileBody.right,
          bodyLeft: simileBody.left,
          bodyBottom: simileBody.bottom,
          stemTop: simileBody.top,
          stemRight: simileBody.right,
          stemBottom: simileBody.bottom,
          stemLeft: simileBody.right,
          dotsTop: simileBody.top,
          dotsRight: simileBody.right,
          dotsBottom: simileBody.bottom,
          dotsLeft: simileBody.right
        }
      )
      if (simileRefId) {
        addPropertiesToElement(
          singleUnit,
          {
            'ref-ids': simileRefId
          }
        )
      }
      return singleUnit
    }

    const sortedNotes = sortNotesForSingleUnitConsideringStaves(notes)
    const sortedNotesPositionNumbers = sortedNotes.map(note => note.positionNumber)
    const hasConnectedTremolo = tremoloParams && (tremoloParams.type === 'withNext' || tremoloParams.type === 'withPrevious') && (unitDuration > 1 / 32)
    const tremoloWithNext = hasConnectedTremolo && (tremoloParams.type === 'withNext')
    const tremoloWithPrevious = hasConnectedTremolo && (tremoloParams.type === 'withPrevious')
    const stemless = (unitDuration === 1) || (unitDuration === 2)
    const withFlags = (!beamedWithNext && !beamedWithPrevious && !hasConnectedTremolo) && (unitDuration < 1 / 4)
    const beamed = ((beamedWithNext || beamedWithPrevious) && (unitDuration < 1 / 4)) || hasConnectedTremolo

    if (isRest) {
      const restNote = notes[0]
      const anyNotesOnLedgerLines = false
      const anySeconds = false
      const restPositionNumber = restNote.positionNumber
      const restStave = restNote.stave
      const topOffsetOfRestConsideringItsStave = calculateTopOffsetOfElementConsideringItsStave(restNote, numberOfStaveLines, topOffset, styles)
      const restBody = createElementWithAdditionalInformation(
        drawRest(unitDuration, restPositionNumber, isGrace)(styles, leftOffset, topOffsetOfRestConsideringItsStave),
        {
          positionNumber: restPositionNumber,
          stave: restStave
        }
      )
      if (isGrace) {
        scaleElementAroundPoint(
          restBody,
          graceElementsScaleFactor,
          graceElementsScaleFactor,
          {
            x: (restBody.left + restBody.right) / 2,
            y: (restBody.top + restBody.bottom) / 2
          }
        )
      }
      addPropertiesToElement(
        restBody,
        {
          'ref-ids': `rest-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
        }
      )
      addPropertiesToElement(
        restBody,
        {
          'ref-ids': `unit-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
        }
      )
      addPropertiesToElement(
        restBody,
        {
          'ref-ids': `note-with-index-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}-1`
        }
      )
      const dotsWithCoordinates = drawSingleUnitDots(numberOfStaveLines, [ restNote ], numberOfDots, unitDuration, stemDirection, anySeconds, anyNotesOnLedgerLines, withFlags, isRest, isGrace)(styles, restBody.right, topOffset)
      addPropertiesToElement(
        dotsWithCoordinates,
        {
          'ref-ids': `dots-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
        }
      )
      const stemPoint = stemDirection === 'up' ? restBody.right : restBody.left

      const singleUnit = createElementWithAdditionalInformation(
        createGroup(
          'singleUnit',
          [
            restBody,
            dotsWithCoordinates
          ]
        ),
        {
          measureIndexOnPageLine,
          measureIndexInGeneral,
          staveIndex,
          voiceIndex,
          singleUnitIndex,
          containsNotesOnCurrentStave,
          containsNotesOnPrevStave,
          containsNotesOnNextStave,
          containsKeysOnCurrentStave,
          containsKeysOnPrevStave,
          containsKeysOnNextStave,
          isRest,
          isOnlyUnitOnStaveWithoutMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave,
          isFullMeasure,
          isFullMeasureAndShouldBeCentralizedBecauseOfThat,
          isSimile,
          isGrace,
          isGraceUnitAndNextUnitIsNotGrace,
          hasGraceCrushLine: false,
          tiedWithNext,
          slurMarks,
          tiedBefore,
          tiedAfter,
          tiedBeforeMeasure,
          tiedAfterMeasure,
          glissandoMarks,
          tupletMarks,
          octaveSignMark,
          pedalMark,
          dynamicChangeMark,
          isOnLastMeasureOfPageLine,
          isLastSingleUnitInVoiceOnPageLine,
          anySeconds: false,
          anyNotesOnLedgerLines: false,
          unitDuration,
          actualDuration,
          sortedNotes: [ restNote ],
          sortedNotesPositionNumbers: [ restPositionNumber ],
          stemDirection,
          withFlags: false,
          beamedWithNext,
          beamedWithNextWithJustOneBeam,
          beamedWithPrevious,
          beamed,
          numberOfDots,
          keysParams,
          arpeggiated,
          articulationParams,
          stemless,
          tremoloDurationFactor: 1,
          numberOfTremoloStrokes: 0,
          hasConnectedTremolo: false,
          tremoloWithNext: false,
          tremoloWithPrevious: false,
          notesWithCoordinates: [ restBody ],
          notesPositionNumbersInNonDisplacedPartOfSingleUnit: [ restPositionNumber ],
          notesPositionNumbersInDisplacedPartOfSingleUnit: [],
          nonDisplacedPartOfSingleUnitWithCoordinates: {
            isEmpty: true,
            name: 'g',
            transformations: [],
            top: restBody.top,
            right: restBody.right,
            bottom: restBody.bottom,
            left: restBody.left
          },
          bodyTop: restBody.top,
          bodyRight: restBody.right,
          bodyLeft: restBody.left,
          bodyBottom: restBody.bottom,
          stemTop: restBody.top,
          stemRight: stemPoint,
          stemBottom: restBody.bottom,
          stemLeft: stemPoint,
          dotsTop: dotsWithCoordinates.top,
          dotsRight: dotsWithCoordinates.right,
          dotsBottom: dotsWithCoordinates.bottom,
          dotsLeft: dotsWithCoordinates.left
        }
      )
      return singleUnit
    }

    const anyNotesOnLedgerLines = areAnyNotesOnLedgerLinesInSingleUnit(numberOfStaveLines, sortedNotesPositionNumbers)
    const anySeconds = areAnySecondsInSingleUnit(sortedNotes)
    const numberOfTremoloStrokes = calculateNumberOfTremoloStrokes(unitDuration, tremoloParams)

    const notesForDisplacedPartOfUnit = collectNotesForDisplacedPartOfSingleUnit(sortedNotes, stemDirection)
    const notesPositionNumbersInDisplacedPartOfSingleUnit = notesForDisplacedPartOfUnit.map(note => note.positionNumber)
    const notesForNonDisplacedPartOfUnit = sortedNotes.filter(note => !note.displaced)
    const notesPositionNumbersInNonDisplacedPartOfSingleUnit = notesForNonDisplacedPartOfUnit.map(note => note.positionNumber)

    const leftOffsetForUnitNoteHeads = leftOffset

    let nonDisplacedPartOfSingleUnitWithCoordinates
    let displacedPartOfSingleUnitWithCoordinates
    let dotsWithCoordinates
    let stemWithCoordinates
    let chordFlagsWithCoordinates

    const isNoteOnEdgeInSingleUnitIsOnStaveLineInUnitwithFlags = isNoteOnEdgeInSingleUnitWithFlagsOnStaveLine(numberOfStaveLines, sortedNotes, withFlags, stemDirection)
    const isNoteOnEdgeInSingleUnitIsBetweenStaveLinesInUnitwithFlags = isNoteOnEdgeInSingleUnitWithFlagsBetweenStaveLines(numberOfStaveLines, sortedNotes, withFlags, stemDirection)

    const singleUnitNoteHeadsParts = []
    if (anySeconds) {
      const allNotesInNonDisplacedUnitNoteHeadsAreGhosts = (stemDirection === 'up' ? notesForNonDisplacedPartOfUnit : notesForDisplacedPartOfUnit).every(note => note.isGhost)
      const additionalOffsetForDisplacedPartOfUnit = calculateAdditionalOffsetForDisplacedPartOfUnit(unitDuration, isGrace, allNotesInNonDisplacedUnitNoteHeadsAreGhosts, styles)
      if (stemDirection === 'up') {
        nonDisplacedPartOfSingleUnitWithCoordinates = drawSingleUnitNoteHeads(measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex, numberOfStaveLines, notesForNonDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, false, isGrace)(styles, leftOffsetForUnitNoteHeads, topOffset)
        displacedPartOfSingleUnitWithCoordinates = drawSingleUnitNoteHeads(measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex, numberOfStaveLines, notesForDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, true, isGrace)(styles, nonDisplacedPartOfSingleUnitWithCoordinates.right + additionalOffsetForDisplacedPartOfUnit, topOffset)
        dotsWithCoordinates = drawSingleUnitDots(numberOfStaveLines, sortedNotes, numberOfDots, unitDuration, stemDirection, anySeconds, anyNotesOnLedgerLines, withFlags, isRest, isGrace)(styles, displacedPartOfSingleUnitWithCoordinates.right, topOffset)
        addPropertiesToElement(
          dotsWithCoordinates,
          {
            'ref-ids': `dots-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
          }
        )
      } else {
        displacedPartOfSingleUnitWithCoordinates = drawSingleUnitNoteHeads(measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex, numberOfStaveLines, notesForDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, true, isGrace)(styles, leftOffsetForUnitNoteHeads, topOffset)
        nonDisplacedPartOfSingleUnitWithCoordinates = drawSingleUnitNoteHeads(measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex, numberOfStaveLines, notesForNonDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, false, isGrace)(styles, displacedPartOfSingleUnitWithCoordinates.right + additionalOffsetForDisplacedPartOfUnit, topOffset)
        dotsWithCoordinates = drawSingleUnitDots(numberOfStaveLines, sortedNotes, numberOfDots, unitDuration, stemDirection, anySeconds, anyNotesOnLedgerLines, withFlags, isRest, isGrace)(styles, nonDisplacedPartOfSingleUnitWithCoordinates.right, topOffset)
        addPropertiesToElement(
          dotsWithCoordinates,
          {
            'ref-ids': `dots-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
          }
        )
      }
      if (!stemless) {
        stemWithCoordinates = drawStemForSingleUnit(numberOfStaveLines, styles, sortedNotes, withFlags, numberOfTremoloStrokes, hasConnectedTremolo, nonDisplacedPartOfSingleUnitWithCoordinates, displacedPartOfSingleUnitWithCoordinates, notesForNonDisplacedPartOfUnit, notesForDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, beamed, isNoteOnEdgeInSingleUnitIsOnStaveLineInUnitwithFlags, isNoteOnEdgeInSingleUnitIsBetweenStaveLinesInUnitwithFlags, thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsMoreThanMaxNotePositionNumberInCurrentSingleUnitOnTheSameStave, thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsLessThanMinNotePositionNumberInCurrentSingleUnitOnTheSameStave, isGrace)
        addPropertiesToElement(
          stemWithCoordinates,
          {
            'ref-ids': `stem-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
          }
        )
        if (withFlags) {
          chordFlagsWithCoordinates = drawFlagsForSingleUnit(styles, unitDuration, stemWithCoordinates, stemDirection, isGrace)
          if (isGrace) {
            scaleElementAroundPoint(
              chordFlagsWithCoordinates,
              graceElementsScaleFactor,
              graceElementsScaleFactor,
              {
                x: chordFlagsWithCoordinates.left,
                y: chordFlagsWithCoordinates.stemEndY
              }
            )
          }
        }
      }
      singleUnitNoteHeadsParts.push(
        nonDisplacedPartOfSingleUnitWithCoordinates,
        displacedPartOfSingleUnitWithCoordinates
      )
    } else {
      nonDisplacedPartOfSingleUnitWithCoordinates = drawSingleUnitNoteHeads(measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex, numberOfStaveLines, notesForNonDisplacedPartOfUnit, unitDuration, anySeconds, stemDirection, false, isGrace)(styles, leftOffsetForUnitNoteHeads, topOffset)
      dotsWithCoordinates = drawSingleUnitDots(numberOfStaveLines, sortedNotes, numberOfDots, unitDuration, stemDirection, anySeconds, anyNotesOnLedgerLines, withFlags, isRest, isGrace)(styles, nonDisplacedPartOfSingleUnitWithCoordinates.right, topOffset)
      addPropertiesToElement(
        dotsWithCoordinates,
        {
          'ref-ids': `dots-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
        }
      )
      if (!stemless) {
        stemWithCoordinates = drawStemForSingleUnit(numberOfStaveLines, styles, sortedNotes, withFlags, numberOfTremoloStrokes, hasConnectedTremolo, nonDisplacedPartOfSingleUnitWithCoordinates, null, notesForNonDisplacedPartOfUnit, null, unitDuration, anySeconds, stemDirection, beamed, isNoteOnEdgeInSingleUnitIsOnStaveLineInUnitwithFlags, isNoteOnEdgeInSingleUnitIsBetweenStaveLinesInUnitwithFlags, thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsMoreThanMaxNotePositionNumberInCurrentSingleUnitOnTheSameStave, thereAreNotesInTheSameCrossStaveUnitThatTheirPositionNumberIsLessThanMinNotePositionNumberInCurrentSingleUnitOnTheSameStave, isGrace)
        addPropertiesToElement(
          stemWithCoordinates,
          {
            'ref-ids': `stem-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
          }
        )
        if (withFlags) {
          chordFlagsWithCoordinates = drawFlagsForSingleUnit(styles, unitDuration, stemWithCoordinates, stemDirection, isGrace)
          if (isGrace) {
            scaleElementAroundPoint(
              chordFlagsWithCoordinates,
              graceElementsScaleFactor,
              graceElementsScaleFactor,
              {
                x: chordFlagsWithCoordinates.left,
                y: chordFlagsWithCoordinates.stemEndY
              }
            )
          }
        }
      }
      singleUnitNoteHeadsParts.push(
        nonDisplacedPartOfSingleUnitWithCoordinates
      )
    }
    const groupForSingleUnitNoteHeadsParts = createGroup(
      'singleUnitNoteHeadsParts',
      singleUnitNoteHeadsParts
    )
    addPropertiesToElement(
      groupForSingleUnitNoteHeadsParts,
      {
        'ref-ids': `unit-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}`
      }
    )

    let notesWithCoordinates = []
    if (nonDisplacedPartOfSingleUnitWithCoordinates) {
      notesWithCoordinates.push(...nonDisplacedPartOfSingleUnitWithCoordinates.notes)
    }
    if (displacedPartOfSingleUnitWithCoordinates) {
      notesWithCoordinates.push(...displacedPartOfSingleUnitWithCoordinates.notes)
    }
    notesWithCoordinates = notesWithCoordinates.sort((n1, n2) => n1.top - n2.top)
    notesWithCoordinates.forEach((noteWithCoordinates, noteIndex) => {
      addPropertiesToElement(
        noteWithCoordinates,
        {
          'ref-ids': `note-with-index-${measureIndexInGeneral + 1}-${staveIndex + 1}-${voiceIndex + 1}-${singleUnitIndex + 1}-${noteIndex + 1}`
        }
      )
    })

    const additionalInformation = {
      measureIndexOnPageLine,
      measureIndexInGeneral,
      staveIndex,
      voiceIndex,
      singleUnitIndex,
      containsNotesOnCurrentStave,
      containsNotesOnPrevStave,
      containsNotesOnNextStave,
      containsKeysOnCurrentStave,
      containsKeysOnPrevStave,
      containsKeysOnNextStave,
      isRest,
      isOnlyUnitOnStaveWithoutMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave,
      isFullMeasure,
      isFullMeasureAndShouldBeCentralizedBecauseOfThat,
      isSimile,
      isGrace,
      isGraceUnitAndNextUnitIsNotGrace,
      hasGraceCrushLine,
      tiedWithNext,
      slurMarks,
      tiedBefore,
      tiedAfter,
      tiedBeforeMeasure,
      tiedAfterMeasure,
      glissandoMarks,
      tupletMarks,
      octaveSignMark,
      pedalMark,
      dynamicChangeMark,
      isOnLastMeasureOfPageLine,
      isLastSingleUnitInVoiceOnPageLine,
      anySeconds,
      anyNotesOnLedgerLines,
      isNoteOnEdgeInSingleUnitIsBetweenStaveLinesInUnitwithFlags,
      isNoteOnEdgeInSingleUnitIsOnStaveLineInUnitwithFlags,
      unitDuration,
      actualDuration,
      sortedNotes,
      sortedNotesPositionNumbers,
      stemDirection,
      withFlags,
      beamedWithNext,
      beamedWithNextWithJustOneBeam,
      beamedWithPrevious,
      beamed,
      numberOfDots,
      keysParams,
      arpeggiated,
      articulationParams,
      notesPositionNumbersInDisplacedPartOfSingleUnit,
      notesPositionNumbersInNonDisplacedPartOfSingleUnit,
      displacedPartOfSingleUnitWithCoordinates,
      nonDisplacedPartOfSingleUnitWithCoordinates,
      notesWithCoordinates,
      stemless,
      tremoloDurationFactor: tremoloParams ? tremoloParams.tremoloDurationFactor : 1,
      numberOfTremoloStrokes,
      hasConnectedTremolo,
      tremoloWithNext,
      tremoloWithPrevious,
      bodyTop: groupForSingleUnitNoteHeadsParts.top,
      bodyRight: groupForSingleUnitNoteHeadsParts.right,
      bodyLeft: groupForSingleUnitNoteHeadsParts.left,
      bodyBottom: groupForSingleUnitNoteHeadsParts.bottom,
      stemTop: stemWithCoordinates ? stemWithCoordinates.top : groupForSingleUnitNoteHeadsParts.top,
      stemRight: stemWithCoordinates ? stemWithCoordinates.right : (stemDirection === 'up' ? nonDisplacedPartOfSingleUnitWithCoordinates.right : nonDisplacedPartOfSingleUnitWithCoordinates.left),
      stemBottom: stemWithCoordinates ? stemWithCoordinates.bottom : groupForSingleUnitNoteHeadsParts.bottom,
      stemLeft: stemWithCoordinates ? stemWithCoordinates.left : (stemDirection === 'up' ? nonDisplacedPartOfSingleUnitWithCoordinates.right : nonDisplacedPartOfSingleUnitWithCoordinates.left),
      flagsTop: chordFlagsWithCoordinates ? chordFlagsWithCoordinates.top : undefined,
      flagsRight: chordFlagsWithCoordinates ? chordFlagsWithCoordinates.right : undefined,
      flagsBottom: chordFlagsWithCoordinates ? chordFlagsWithCoordinates.bottom : undefined,
      flagsLeft: chordFlagsWithCoordinates ? chordFlagsWithCoordinates.right : undefined,
      dotsTop: dotsWithCoordinates.top,
      dotsRight: dotsWithCoordinates.right,
      dotsBottom: dotsWithCoordinates.bottom,
      dotsLeft: dotsWithCoordinates.left
    }

    let singleUnit = createElementWithAdditionalInformation(
      createGroup(
        'singleUnit',
        [
          groupForSingleUnitNoteHeadsParts,
          dotsWithCoordinates,
          stemWithCoordinates,
          chordFlagsWithCoordinates
        ]
      ),
      additionalInformation
    )

    if (parentheses.length > 0) {
      return drawSingleUnitWithParentheses(singleUnit, additionalInformation, numberOfStaveLines, parentheses, topOffset, styles)
    }

    return singleUnit
  }
}

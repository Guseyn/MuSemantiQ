'use strict'

// eslint-disable-next-line  no-undef
const itIsBrowserEnv = typeof window !== 'undefined' || typeof process === 'undefined'

import { Midi } from '#msq/midi/lib/@tonejs/Midi.js'

import parseTempoValueParts from '#msq/language/parser/scenarios/token/parseTempoValueParts.js'

import calculateDurationInSeconds from '#msq/midi/calculateDurationInSeconds.js'
import updateTempoAuraIfNeeded from '#msq/midi/updateTempoAuraIfNeeded.js'
import calculateOctaveForNoteTimeFrame from '#msq/midi/calculateOctaveForNoteTimeFrame.js'
import calculateOctaveAdjustmentForUnitParams from '#msq/midi/calculateOctaveAdjustmentForUnitParams.js'
import findFirstArticulationWithName from '#msq/midi/findFirstArticulationWithName.js'
import deleteArticulationsWithName from '#msq/midi/deleteArticulationsWithName.js'
import createOrnamentTopAlternateNote from '#msq/midi/createOrnamentTopAlternateNote.js'
import createOrnamentBottomAlternateNote from '#msq/midi/createOrnamentBottomAlternateNote.js'
import createNextHigherGlissandoNote from '#msq/midi/createNextHigherGlissandoNote.js'
import createNextLowerGlissandoNote from '#msq/midi/createNextLowerGlissandoNote.js'
import shouldNoteWithTrillEndWithTurn from '#msq/midi/shouldNoteWithTrillEndWithTurn.js'
import clearUpPitchAdjustmentsForNewMeasureByAddingNewTimeFrame from '#msq/midi/clearUpPitchAdjustmentsForNewMeasureByAddingNewTimeFrame.js'
import calculatePitchForNoteTimeFrame from '#msq/midi/calculatePitchForNoteTimeFrame.js'
import calculateVelocityForNote from '#msq/midi/calculateVelocityForNote.js'
import attachTrackToNote from '#msq/midi/attachTrackToNote.js'
import orderTimeFrames from '#msq/midi/orderTimeFrames.js'
import insertUnitsThatNeedsToBeRepeatedIntoVoiceInsteadOfSimileUnitWhichRelatedToThoseUnits from '#msq/midi/insertUnitsThatNeedsToBeRepeatedIntoVoiceInsteadOfSimileUnitWhichRelatedToThoseUnits.js'
import markUnitParamsIfItIsLastSingleUnitInVoiceOnPageLine from '#msq/midi/markUnitParamsIfItIsLastSingleUnitInVoiceOnPageLine.js'
import fillTupletValuesAuraForEachVoiceInEachStave from '#msq/midi/fillTupletValuesAuraForEachVoiceInEachStave.js'
import assignTremoloTypeToUnit from '#msq/midi/assignTremoloTypeToUnit.js'
import calculateActualDurationOfUnit from '#msq/midi/calculateActualDurationOfUnit.js'
import fillSimilesAuraForEachVoiceInEachStave from '#msq/midi/fillSimilesAuraForEachVoiceInEachStave.js'
import releaseTupletValuesAuraForEachVoiceInEachStave from '#msq/midi/releaseTupletValuesAuraForEachVoiceInEachStave.js'
import attachStaveIndexToNoteConsideringItsStavePosition from '#msq/midi/attachStaveIndexToNoteConsideringItsStavePosition.js'
import calculateGraceNoteTimeAdjustment from '#msq/midi/calculateGraceNoteTimeAdjustment.js'
import calculateBreathMarksTimeAdjustment from '#msq/midi/calculateBreathMarksTimeAdjustment.js'
import calculateFermataArticulationTimeAdjustment from '#msq/midi/calculateFermataArticulationTimeAdjustment.js'
import calculateStaveIndexWhereClefBeforeIsConsidered from '#msq/midi/calculateStaveIndexWhereClefBeforeIsConsidered.js'
import findStaveIndexesOccupiedByUnit from '#msq/midi/findStaveIndexesOccupiedByUnit.js'
import calculateTimeSignatureInQuarters from '#msq/midi/calculateTimeSignatureInQuarters.js'
import calculateDurationOfMeasureRestInSeconds from '#msq/midi/calculateDurationOfMeasureRestInSeconds.js'
import calculateMinTimeAmongTimeProgressionsForEachVoiceInEachStave from '#msq/midi/calculateMinTimeAmongTimeProgressionsForEachVoiceInEachStave.js'

import addTimeFrameToIndicateNewClefOnStave from '#msq/midi/addTimeFrameToIndicateNewClefOnStave.js'
import addTimeFrameToIndicateNewClefOnStaveBeforeUnit from '#msq/midi/addTimeFrameToIndicateNewClefOnStaveBeforeUnit.js'
import addTimeFrameToIndicateNewKeySignatureOnStave from '#msq/midi/addTimeFrameToIndicateNewKeySignatureOnStave.js'
import addTimeFrameToIndicateNewKeySignatureOnStaveBeforeUnit from '#msq/midi/addTimeFrameToIndicateNewKeySignatureOnStaveBeforeUnit.js'
import addTimeFrameToIndicateOctaveSignOnStaveInVoice from '#msq/midi/addTimeFrameToIndicateOctaveSignOnStaveInVoice.js'
import addTimeFrameToIndicateKeysThatLastOneMeasure from '#msq/midi/addTimeFrameToIndicateKeysThatLastOneMeasure.js'
import addTimeFrameToIndicateDynamic from '#msq/midi/addTimeFrameToIndicateDynamic.js'
import addTimeFramesToIndicateNotes from '#msq/midi/addTimeFramesToIndicateNotes.js'

import addMidiNoteToTrack from '#msq/midi/addMidiNoteToTrack.js'

import NORMALIZED_PITCHES from '#msq/midi/normalizedPitches.js'
import PITCHES_BY_NOTE_NAMES from '#msq/midi/pitchesByNoteNames.js'
import PITCH_ADJUSTEMENTS_BY_KEY_SIGNATURES from '#msq/midi/pitchAdjustmentsByKeySignatures.js'
import PITCH_ADJUSTEMENTS_BY_KEY_TYPE from '#msq/midi/pitchAdjustmentsByKeyType.js'

import {  clone  } from '#msq/midi/toolbox.js'

const VERY_SMALL_TIME_TO_SEPARATE_MEASURES_IN_DIFFERENT_TIME_FRAMES_FOR_SURE = 0.000001

const MEASURE_FERAMATA_DURATION_IN_SECONDS = 2.5

const GLISSANDO_DEFAULT_FACTOR = 1 / 64

const REGEXP_WITH_QUOTES = /^"|"$/g

export default function (pageSchema, midiSettingsForEachPage = []) {
  if (!pageSchema.measuresParams) {
    return Buffer.alloc(0)
  }

  pageSchema = clone(pageSchema)
  midiSettingsForEachPage = clone(midiSettingsForEachPage)

  const midi = new Midi()

  const timeStampsMappedWithRefsOn = {}
  const refsOnMappedWithTimeStamps = {}

  const instrumentsMappedWithChannels = {}
  const tracksForEachInstrumentOnEachStaveInEachVoice = {}
  const currentInstrumentsForEachStaveOnEachVoice = {}

  const clefAurasForEachStaveSplittedInTimeFrames = {}
  const octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames = {}
  const pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames = {}
  const pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames = {}
  const dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames = {}
  const graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames = {}
  const graceTimeOffestForEachGraceUnitInEachVoiceOnEachStaveSplittedInTimeFrames = {}
  const graceCountersForEachVoiceInEachStaveSplittedInTimeFrames = {}
  const notesSplittedInTimeFrames = {}

  let timeProgressionForAllMeasures = 0
  const timeProgressionsForEachVoiceInEachStave = []

  const tempoAura = {
    quartersPerMinute: 120,
    aimingToQuartersPerMinute: 120
  }

  let lastTimeSignatureInQuarters
  let fullDurationOfLastMeasure = 0

  const tupletValuesAuraForEachVoiceInEachStave = {}
  const similesAuraForEachVoiceInEachStave = {}
  const indicatorsOfOctaveSignEndingsByStaveAndVoice = {}

  const measureIndexesWithMappedIndicatorsOfWhetherRepeatDotsAtTheStartOfMeasuresAreNotActiveAnymore = {}
  const measureIndexesMappedWithIndicatorsOfWhetherRepeatDotsAtTheEndOfMeasureAreNotActiveAnymore = {}
  let lastMeasureIndexWithRepeatDotsAtTheStart
  
  const measureIndexesThatWeNeedToSkipBecauseOfVoltaBracketsAboveThem = []
  let voltaBracketsAreActive = false

  let weAreLookingForFineMark = false
  let weAreLookingForFirstCodaMark = false
  let weWantToJumpToSecondCodaMark = false
  let weWantToJumpToSegnoMark = false

  let weAttemptedToUpdateTempoAuraInCaseIfThereIsDefaultTempoInSettings = false

  const pointsOfTimeWhenBreathMarkIsApplied = []
  const pointsOfTimeWhenFermataArticulationIsApplied = []

  const currentDynamicsAuraObjectsForEachVoiceOnEachStave = {}
  const lastMentionedDynamicsForEachVoiceOnEachStave = {}

  const slurMarksMappedWithTracks = {}

  const staveIndexesMappedWithOtherStaveIndexesByConnection = {}

  const measuresParams = pageSchema.measuresParams

  let fermataDurationFromMidiSettings 

  for (let measureIndex = 0; measureIndex < measuresParams.length; measureIndex++) {
    if (measureIndexesThatWeNeedToSkipBecauseOfVoltaBracketsAboveThem.includes(measureIndex)) {
      continue
    }
    const measureParams = clone(measuresParams[measureIndex])

    let weMetFirstUnitInThisMeasure = false

    lastTimeSignatureInQuarters = calculateTimeSignatureInQuarters(measureParams.timeSignatureParams)

    if (measureIndex === 0 && !weAttemptedToUpdateTempoAuraInCaseIfThereIsDefaultTempoInSettings) {
      const midiSettingsForCurrentPage = midiSettingsForEachPage[measureIndex]
      if (!measureParams.tempoMark && midiSettingsForCurrentPage && midiSettingsForCurrentPage.defaultTempo) {
        const unwrappedDefaultTempoValueFromQuotes = midiSettingsForCurrentPage.defaultTempo.replace(REGEXP_WITH_QUOTES, '')
        const tempoMark = {
          textValueParts: parseTempoValueParts(unwrappedDefaultTempoValueFromQuotes)
        }
        updateTempoAuraIfNeeded(tempoMark, tempoAura, null, true)
        tempoAura.initialQuartersPerMinute = tempoAura.quartersPerMinute
      }
      weAttemptedToUpdateTempoAuraInCaseIfThereIsDefaultTempoInSettings = true
    }

    if (midiSettingsForEachPage[measureIndex] && midiSettingsForEachPage[measureIndex].fermataDuration) {
      fermataDurationFromMidiSettings = midiSettingsForEachPage[measureIndex].fermataDuration * 1
    }

    if (measureParams.repeatDotsMarkAtTheStart && measureParams.stavesParams) {
      lastMeasureIndexWithRepeatDotsAtTheStart = measureIndex
    }

    measureParams.connectionsParams = measureParams.connectionsParams || []

    for (let connectionIndex = 0; connectionIndex < measureParams.connectionsParams.length; connectionIndex++) {
      for (let staveIndex = measureParams.connectionsParams[connectionIndex].staveStartNumber; staveIndex <= measureParams.connectionsParams[connectionIndex].staveEndNumber; staveIndex++) {
        staveIndexesMappedWithOtherStaveIndexesByConnection[staveIndex] = Array.from(
          { length: (measureParams.connectionsParams[connectionIndex].staveEndNumber - measureParams.connectionsParams[connectionIndex].staveStartNumber) + 1 },
          (value, index) => measureParams.connectionsParams[connectionIndex].staveStartNumber + index
        )
      }
    }

    if (weWantToJumpToSegnoMark && !measureParams.sign) {
      continue
    }

    if (weWantToJumpToSegnoMark && !weAreLookingForFirstCodaMark) {
      weAreLookingForFineMark = true
    }

    const measureContainsSignAtTheEnd = measureParams.sign && measureParams.sign.measurePosition === 'end'

    if (weWantToJumpToSegnoMark && measureContainsSignAtTheEnd) {
      weWantToJumpToSegnoMark = false
      continue
    }

    if (weWantToJumpToSegnoMark) {
      weWantToJumpToSegnoMark = false
    }

    const measureContainsCodaAtTheStart = measureParams.coda && measureParams.coda.measurePosition === 'start'
    const measureContainsCodaAtTheEnd = measureParams.coda && measureParams.coda.measurePosition === 'end'
    const measureContainsCodaNote = measureParams.repetitionNote && measureParams.repetitionNote.value === 'Coda'
    const measureContainsCodaNoteAtTheStart = measureContainsCodaNote && measureParams.repetitionNote.measurePosition === 'start'
    const measureContainsCodaNoteAtTheEnd = measureContainsCodaNote && measureParams.repetitionNote.measurePosition === 'end'

    if (weAreLookingForFirstCodaMark && (measureContainsCodaAtTheStart || measureContainsCodaNoteAtTheStart)) {
      weAreLookingForFirstCodaMark = false
      weWantToJumpToSecondCodaMark = true
      continue
    }

    if (weWantToJumpToSecondCodaMark && !measureParams.coda && !measureContainsCodaNote) {
      continue
    }

    if (weWantToJumpToSecondCodaMark && (measureContainsCodaAtTheEnd || measureContainsCodaNoteAtTheEnd)) {
      weWantToJumpToSecondCodaMark = false
      continue
    }

    if (weWantToJumpToSecondCodaMark && (measureParams.coda || measureContainsCodaNote)) {
      weWantToJumpToSecondCodaMark = false
    }

    if (measureParams.voltaMark && (measureParams.voltaMark.startsHere || measureParams.voltaMark.startsBefore)) {
      voltaBracketsAreActive = true
    }
    if (voltaBracketsAreActive) {
      measureIndexesThatWeNeedToSkipBecauseOfVoltaBracketsAboveThem.push(measureIndex)
    }

    if (measureParams.isMeasureRest) {
      timeProgressionsForEachVoiceInEachStave.splice(0)
      const durationOfMeasureRestInSeconds = calculateDurationOfMeasureRestInSeconds(
        lastTimeSignatureInQuarters,
        tempoAura,
        fullDurationOfLastMeasure
      )
      const measureRestCount = measureParams.multiMeasureRestCount * 1 || 1
      timeProgressionForAllMeasures += measureRestCount * durationOfMeasureRestInSeconds
      continue
    }

    let timeOfTheLastSoundsThatStartPlayingInThisMeasure

    if (!measureParams.stavesParams) {
      continue
    }

    timeProgressionsForEachVoiceInEachStave.splice(measureParams.stavesParams.length)
    pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[timeProgressionForAllMeasures] = pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[timeProgressionForAllMeasures] || []

    clearUpPitchAdjustmentsForNewMeasureByAddingNewTimeFrame(pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, timeProgressionForAllMeasures, measureParams, measureIndex)

    if (measureIndexesWithMappedIndicatorsOfWhetherRepeatDotsAtTheStartOfMeasuresAreNotActiveAnymore[measureIndex]) {
      measureParams.repeatDotsMarkAtTheStart = false
      measureIndexesWithMappedIndicatorsOfWhetherRepeatDotsAtTheStartOfMeasuresAreNotActiveAnymore[measureIndex] = false
    }
    if (measureParams.repeatDotsMarkAtTheStart) {
      measureIndexesWithMappedIndicatorsOfWhetherRepeatDotsAtTheStartOfMeasuresAreNotActiveAnymore[measureIndex] = true
    }

    for (let staveIndex = 0; staveIndex < measureParams.stavesParams.length; staveIndex++) {

      if (!timeProgressionsForEachVoiceInEachStave[staveIndex]) {
        timeProgressionsForEachVoiceInEachStave[staveIndex] = []
      }

      const staveParams = measureParams.stavesParams[staveIndex]
      addTimeFrameToIndicateNewClefOnStave(staveParams.clef, clefAurasForEachStaveSplittedInTimeFrames, timeProgressionForAllMeasures, staveIndex)
      addTimeFrameToIndicateNewKeySignatureOnStave(measureParams.keySignatureName, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, timeProgressionForAllMeasures, PITCH_ADJUSTEMENTS_BY_KEY_SIGNATURES)

      if (!staveParams.voicesParams) {
        continue
      }

      timeProgressionsForEachVoiceInEachStave[staveIndex].splice(staveParams.voicesParams.length)

      for (let voiceIndex = 0; voiceIndex < staveParams.voicesParams.length; voiceIndex++) {

        const staveVoiceKey = `${staveIndex}-${voiceIndex}`
        timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] = timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] || timeProgressionForAllMeasures
        const voiceParams = staveParams.voicesParams[voiceIndex]

        let visualUnitIndex = -1

        for (let unitIndex = 0; unitIndex < voiceParams.length; unitIndex++) {

          const voiceTime = timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex]
          const unitParams = voiceParams[unitIndex]
          let unitHasNotesOnDifferentStaves = false
          let staveIndexWhereClefBeforeIsConsidered

          assignTremoloTypeToUnit(unitParams, measuresParams, measureParams, measureIndex, staveIndex, voiceIndex, unitIndex)

          if (!unitParams.isRepetition) {
            visualUnitIndex++
          }

          for (let noteIndex = 0; noteIndex < unitParams.notes.length; noteIndex++) {
            const note = unitParams.notes[noteIndex]
            note.pageIndex = measureParams.pageIndex
            note.measureIndex = measureIndex
            note.measureIndexOnPage = measureParams.measureIndexOnPage
            note.staveIndex = staveIndex
            attachStaveIndexToNoteConsideringItsStavePosition(note, measureParams)
            note.voiceIndex = voiceIndex
            note.unitIndex = visualUnitIndex
            note.noteIndex = noteIndex
            note.hasFirstNoteIndexInUnit = noteIndex === 0
            note.hasLastNoteIndexInUnit = noteIndex === (unitParams.notes.length - 1)
            staveIndexWhereClefBeforeIsConsidered = calculateStaveIndexWhereClefBeforeIsConsidered(unitHasNotesOnDifferentStaves, note, staveIndex)
            note.visualDuration = unitParams.unitDuration
            note.isRest = unitParams.isRest
            note.isSimile = unitParams.isSimile
            note.isRepetition = unitParams.isRepetition
            note.isGrace = unitParams.isGrace
            note.unitIsTiedWithNext = unitParams.tiedWithNext
            note.unitIsTiedAfter = unitParams.tiedAfter
            note.unitIsTiedAfterMeasure = unitParams.tiedAfterMeasure
            note.unitIsTiedBefore = unitParams.tiedBefore
            note.unitIsTiedBeforeMeasure = unitParams.tiedBeforeMeasure
            note.articulationParams = unitParams.articulationParams
            note.tremoloParams = unitParams.tremoloParams
            note.isTremolo = unitParams.tremoloParams ? true : false
            note.isSingleTremolo = unitParams.tremoloParams ? (unitParams.tremoloParams.type === 'single') : false
            note.slurMarks = unitParams.slurMarks
            note.pedalMark = unitParams.pedalMark
            note.glissandoMarks = unitParams.glissandoMarks
            note.staveIndexesUnitedByConnection = clone(staveIndexesMappedWithOtherStaveIndexesByConnection[note.staveIndexConsideringStavePosition] || [])
            note.arpeggiated = unitParams.arpeggiated
            const midiSettingsForNote = midiSettingsForEachPage[note.pageIndex] || {}
            attachTrackToNote(midi, note, midiSettingsForNote, measureParams.instrumentTitlesParams, tracksForEachInstrumentOnEachStaveInEachVoice, instrumentsMappedWithChannels, currentInstrumentsForEachStaveOnEachVoice)
          }

          if (staveIndexWhereClefBeforeIsConsidered === undefined) {
            staveIndexWhereClefBeforeIsConsidered = staveIndex
          }

          unitParams.occupiedStaveIndexes = findStaveIndexesOccupiedByUnit(unitParams, staveIndex)

          if (unitParams.breathMarkBefore && !pointsOfTimeWhenBreathMarkIsApplied.includes(voiceTime)) {
            pointsOfTimeWhenBreathMarkIsApplied.push(voiceTime)
          }

          if (unitParams.isSimile) {
            insertUnitsThatNeedsToBeRepeatedIntoVoiceInsteadOfSimileUnitWhichRelatedToThoseUnits(similesAuraForEachVoiceInEachStave, voiceParams, staveVoiceKey, unitParams, unitIndex)
            unitIndex--
            continue
          }

          markUnitParamsIfItIsLastSingleUnitInVoiceOnPageLine(measuresParams, measureParams, voiceParams, unitParams, measureIndex, staveIndex, voiceIndex, unitIndex)
          fillTupletValuesAuraForEachVoiceInEachStave(tupletValuesAuraForEachVoiceInEachStave, unitParams, staveVoiceKey)
          fillSimilesAuraForEachVoiceInEachStave(similesAuraForEachVoiceInEachStave, unitParams, staveVoiceKey)

          const actualDurationOfUnit = calculateActualDurationOfUnit(tupletValuesAuraForEachVoiceInEachStave, unitParams, staveVoiceKey)
          const unitDurationInQuarters = actualDurationOfUnit * 4

          releaseTupletValuesAuraForEachVoiceInEachStave(tupletValuesAuraForEachVoiceInEachStave, unitParams, staveVoiceKey)

          let thisIsFirstUnitInMeasure = false
          if (!weMetFirstUnitInThisMeasure) {
            thisIsFirstUnitInMeasure = true
            weMetFirstUnitInThisMeasure = true
          }

          updateTempoAuraIfNeeded(measureParams.tempoMark, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure)

          if (measureIndex === 0 && thisIsFirstUnitInMeasure) {
            tempoAura.initialQuartersPerMinute = tempoAura.quartersPerMinute
          }

          const unitDurationInSeconds = calculateDurationInSeconds(unitDurationInQuarters, tempoAura.quartersPerMinute)

          const octaveAdjustmentForUnitParams = calculateOctaveAdjustmentForUnitParams(unitParams)

          if (unitParams.isGrace) {
            graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime] = graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime] || {}
          }

          const graceCounterExistsForCurrentStaveAndVoice = graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime] && graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] !== undefined

          if (unitParams.isGrace && graceCounterExistsForCurrentStaveAndVoice) {
            graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] += 1
          }

          if (unitParams.isGrace && !graceCounterExistsForCurrentStaveAndVoice) {
            graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] = 0
          }

          addTimeFrameToIndicateNewClefOnStaveBeforeUnit(unitParams.clefBefore, clefAurasForEachStaveSplittedInTimeFrames, unitParams.isGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, voiceTime, staveIndexWhereClefBeforeIsConsidered, staveVoiceKey)
          addTimeFrameToIndicateOctaveSignOnStaveInVoice(unitParams.octaveSignMark, octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames, indicatorsOfOctaveSignEndingsByStaveAndVoice, unitParams.isGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, voiceTime, unitParams.occupiedStaveIndexes, voiceIndex, staveVoiceKey)
          addTimeFrameToIndicateNewKeySignatureOnStaveBeforeUnit(unitParams.keySignatureBefore, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, unitParams.isGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, voiceTime, PITCH_ADJUSTEMENTS_BY_KEY_SIGNATURES, staveVoiceKey)
          addTimeFrameToIndicateKeysThatLastOneMeasure(unitParams.keysParams, PITCHES_BY_NOTE_NAMES, PITCH_ADJUSTEMENTS_BY_KEY_TYPE, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, unitParams.isGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, voiceTime, measureIndex, staveIndex, staveVoiceKey)
          addTimeFrameToIndicateDynamic(unitParams.articulationParams, unitParams.dynamicChangeMark, dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames, currentDynamicsAuraObjectsForEachVoiceOnEachStave, lastMentionedDynamicsForEachVoiceOnEachStave, unitParams.isGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, voiceTime, staveVoiceKey, unitParams.isLastSingleUnitInVoiceOnPageLine)
          addTimeFramesToIndicateNotes(unitParams, notesSplittedInTimeFrames, actualDurationOfUnit, unitDurationInSeconds, octaveAdjustmentForUnitParams, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, voiceTime, staveVoiceKey)
          
          if ((unitParams.octaveSignMark && unitParams.octaveSignMark.finish) || unitParams.isLastSingleUnitInVoiceOnPageLine) {
            indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey] = indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey] || [ staveVoiceKey ]
            unitParams.occupiedStaveIndexes.forEach(staveIndex => {
              const occupiedStaveVoiceKey = `${staveIndex}-${voiceIndex}`
              if (!indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey].includes(occupiedStaveVoiceKey)) {
                indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey].push(occupiedStaveVoiceKey)
              }
            })
          }

          if (unitParams.isGrace) {
            graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime] = graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime] || {}
            graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] = graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] || 0
            graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] += unitDurationInSeconds

            graceTimeOffestForEachGraceUnitInEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime] = graceTimeOffestForEachGraceUnitInEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime] || []
            graceTimeOffestForEachGraceUnitInEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime][`${staveVoiceKey}-${graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey]}`] = graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[voiceTime][staveVoiceKey] - unitDurationInSeconds
          }

          if (!unitParams.isGrace && (timeOfTheLastSoundsThatStartPlayingInThisMeasure === undefined)) {
            timeOfTheLastSoundsThatStartPlayingInThisMeasure = timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex]
          }

          if (!unitParams.isGrace && (timeOfTheLastSoundsThatStartPlayingInThisMeasure < timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex])) {
            timeOfTheLastSoundsThatStartPlayingInThisMeasure = timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex]
          }

          if (!unitParams.isGrace) {
            timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] += unitDurationInSeconds 
          }

          const fermataArticulationShouldBeApplied = (unitParams.articulationParams ? true : false)
            && (pointsOfTimeWhenFermataArticulationIsApplied.find(timePoint => Math.abs(timePoint - voiceTime) < 0.0001) === undefined)
            && unitParams.articulationParams.some(articulationParam => articulationParam.name === 'fermata')

          if (fermataArticulationShouldBeApplied) {
            pointsOfTimeWhenFermataArticulationIsApplied.push(voiceTime)
          }
        }
      }
    }

    let minTimeAmongTimeProgressionsForEachVoiceInEachStave = calculateMinTimeAmongTimeProgressionsForEachVoiceInEachStave(
      timeProgressionsForEachVoiceInEachStave,
      timeOfTheLastSoundsThatStartPlayingInThisMeasure,
      measureParams.endsWithFermata,
      fermataDurationFromMidiSettings
    )

    const oldTimeProgressionForAllMeasures = timeProgressionForAllMeasures
    timeProgressionForAllMeasures = minTimeAmongTimeProgressionsForEachVoiceInEachStave || (
      timeProgressionForAllMeasures + (
        measureParams.endsWithFermata
          ? fermataDurationFromMidiSettings !== undefined
            ? fermataDurationFromMidiSettings !== 0
              ? fermataDurationFromMidiSettings
              : VERY_SMALL_TIME_TO_SEPARATE_MEASURES_IN_DIFFERENT_TIME_FRAMES_FOR_SURE
            : MEASURE_FERAMATA_DURATION_IN_SECONDS
          : VERY_SMALL_TIME_TO_SEPARATE_MEASURES_IN_DIFFERENT_TIME_FRAMES_FOR_SURE)
    )
    fullDurationOfLastMeasure = timeProgressionForAllMeasures - oldTimeProgressionForAllMeasures

    if (measureIndexesMappedWithIndicatorsOfWhetherRepeatDotsAtTheEndOfMeasureAreNotActiveAnymore[measureIndex]) {
      measureParams.repeatDotsMarkAtTheEnd = false
      measureIndexesMappedWithIndicatorsOfWhetherRepeatDotsAtTheEndOfMeasureAreNotActiveAnymore[measureIndex] = false
    }
    if (measureParams.repeatDotsMarkAtTheEnd) {
      measureIndexesMappedWithIndicatorsOfWhetherRepeatDotsAtTheEndOfMeasureAreNotActiveAnymore[measureIndex] = true
      lastMeasureIndexWithRepeatDotsAtTheStart = lastMeasureIndexWithRepeatDotsAtTheStart || 0
      measureIndex = lastMeasureIndexWithRepeatDotsAtTheStart - 1
      measureIndexesWithMappedIndicatorsOfWhetherRepeatDotsAtTheStartOfMeasuresAreNotActiveAnymore[lastMeasureIndexWithRepeatDotsAtTheStart] = true
      voltaBracketsAreActive = false
    }

    if (measureParams.voltaMark && (measureParams.voltaMark.finishesHere || measureParams.voltaMark.finishesAfter)) {
      voltaBracketsAreActive = false
    }

    const measureContainsFineRepetitionNote = measureParams.repetitionNote && (measureParams.repetitionNote.value === 'Fine')

    if (weAreLookingForFineMark && measureContainsFineRepetitionNote) {
      weAreLookingForFineMark = false
      break
    }

    if (weAreLookingForFirstCodaMark && measureContainsCodaAtTheEnd && !weWantToJumpToSegnoMark && !weAreLookingForFineMark) {
      weAreLookingForFirstCodaMark = false
      weWantToJumpToSecondCodaMark = true
    }

    if (measureParams.repetitionNote && !weAreLookingForFineMark && !weAreLookingForFirstCodaMark) {
      weAreLookingForFineMark = measureParams.repetitionNote.value === 'D.C. al Fine'
      weAreLookingForFirstCodaMark = measureParams.repetitionNote.value === 'D.C. al Coda' || measureParams.repetitionNote.value === 'D.S. al Coda'
      weWantToJumpToSegnoMark = measureParams.repetitionNote.value === 'D.S. al Fine'|| measureParams.repetitionNote.value === 'D.S. al Coda'

      measureIndex = (weAreLookingForFineMark || weAreLookingForFirstCodaMark || weWantToJumpToSegnoMark)
        ? -1
        : measureIndex
    }
  }

  const orderedTimeFramesFromClefAurasForEachStaveSplittedInTimeFrames = orderTimeFrames(clefAurasForEachStaveSplittedInTimeFrames)
  const orderedTimeFramesFromOctaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames = orderTimeFrames(octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames)
  const orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames = orderTimeFrames(pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames)
  const orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames = orderTimeFrames(pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames)
  const orderedTimeFramesFromDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames = orderTimeFrames(dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames)
  const orderedTimeFramesFromNotesSplittedInTimeFrames = orderTimeFrames(notesSplittedInTimeFrames)

  const tiesAuraForEachVoiceInEachStave = {}

  const noteWithTremoloWithNextOnEachStaveInEachVoice = {}

  const glissandos = {}

  let globalCurrentGraceTimeOffset = 0

  for (let timeIndex = 0; timeIndex < orderedTimeFramesFromNotesSplittedInTimeFrames.length; timeIndex++) {
    const time = orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]

    let graceMaxTimeOffsetAmongStavesForCurrentTime = 0
    if (graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[time]) {
      for (const staveVoiceKey in graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[time]) {
        if (graceMaxTimeOffsetAmongStavesForCurrentTime < graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey]) {
          graceMaxTimeOffsetAmongStavesForCurrentTime = graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey]
        }
      }
    }
    globalCurrentGraceTimeOffset += graceMaxTimeOffsetAmongStavesForCurrentTime

    let graceMaxCountForCurrentTime = 0
    if (graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time]) {
      for (const staveVoiceKey in graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time]) {
        if (graceMaxCountForCurrentTime < graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey]) {
          graceMaxCountForCurrentTime = graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey]
        }
      }
    }

    const groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit = []

    for (let noteTimeIndex = 0; noteTimeIndex < notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]].length; noteTimeIndex++) {
      const note = notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndex]

      const trackForNote = note.track

      if (!trackForNote) {
        continue
      }

      const staveVoiceKey = `${note.staveIndex}-${note.voiceIndex}`

      const pitchForNote = calculatePitchForNoteTimeFrame(note, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
      const octaveForNote = calculateOctaveForNoteTimeFrame(note, pitchForNote, clefAurasForEachStaveSplittedInTimeFrames, orderedTimeFramesFromClefAurasForEachStaveSplittedInTimeFrames, octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames, orderedTimeFramesFromOctaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
      const velocityForNote = calculateVelocityForNote(note, dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames, orderedTimeFramesFromDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, note.staveIndex, staveVoiceKey)
      const graceNoteTimeAdjustment = calculateGraceNoteTimeAdjustment(note, globalCurrentGraceTimeOffset, graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames, graceTimeOffestForEachGraceUnitInEachVoiceOnEachStaveSplittedInTimeFrames, staveVoiceKey)
      const breathMarkTimeAdjustment = calculateBreathMarksTimeAdjustment(note, pointsOfTimeWhenBreathMarkIsApplied)
      const fermataArticulationTimeAdjustment = calculateFermataArticulationTimeAdjustment(note, pointsOfTimeWhenFermataArticulationIsApplied, fermataDurationFromMidiSettings)

      const pitchFactor = pitchForNote % NORMALIZED_PITCHES.length
      const absolutePitchFactor = (pitchFactor >= 0) ? pitchFactor : (NORMALIZED_PITCHES.length - Math.abs(pitchFactor))

      note.midiPitch = NORMALIZED_PITCHES[absolutePitchFactor]
      note.midiVelocity = velocityForNote
      note.midiOctave = octaveForNote
      note.graceTimeAdjustment = graceNoteTimeAdjustment
      note.breathMarkTimeAjustment = breathMarkTimeAdjustment
      note.fermataArticulationTimeAdjustment = fermataArticulationTimeAdjustment
      note.allTimeAdjustments = note.graceTimeAdjustment + note.breathMarkTimeAjustment + note.fermataArticulationTimeAdjustment

      if (note.isGrace) {
        const normalizer = (graceMaxCountForCurrentTime - graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey])
        note.normalizedGraceCount = normalizer + note.graceCount
      }

      if (!note.isGrace && note.arpeggiated) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0] = groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0] || [ [] ]        
      }

      if (
        !note.isGrace &&
        note.arpeggiated &&
        note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length - 1].arpeggiated &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length - 1].arpeggiated.isConnectedWithNextChord
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].push(
          note
        )
        continue
      }

      if (
        !note.isGrace &&
        note.arpeggiated &&
        note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length - 1].arpeggiated &&
        !groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length - 1].arpeggiated.isConnectedWithNextChord
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].push([])
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].push(
          note
        )
        continue
      }

      if (
        !note.isGrace &&
        note.arpeggiated &&
        note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1] &&
        (groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].length === 0)
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].push(
          note
        )
        continue
      }

      if (
        !note.isGrace &&
        note.arpeggiated &&
        !note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1]
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[0].length - 1].push(
          note
        )
        continue
      }

      if (note.isGrace && note.arpeggiated) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1] = groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1] || [ [] ]        
      }

      if (
        note.isGrace &&
        note.arpeggiated &&
        note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length - 1].arpeggiated &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length - 1].arpeggiated.isConnectedWithNextChord
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].push(
          note
        )
        continue
      }

      if (
        note.isGrace &&
        note.arpeggiated &&
        note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length - 1] &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length - 1].arpeggiated &&
        !groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length - 1].arpeggiated.isConnectedWithNextChord
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].push([])
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].push(
          note
        )
        continue
      }

      if (
        note.isGrace &&
        note.arpeggiated &&
        note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1] &&
        (groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].length === 0)
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].push(
          note
        )
        continue
      }

      if (
        note.isGrace &&
        note.arpeggiated &&
        !note.hasFirstNoteIndexInUnit &&
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1]
      ) {
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1][groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[note.normalizedGraceCount + 1].length - 1].push(
          note
        )
        continue
      }
    }

    for (let crossStaveIndex = 0; crossStaveIndex < groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit.length; crossStaveIndex++) {
      if (!groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex]) {
        continue
      }

      for (let arpeggiatedGroupIndex = 0; arpeggiatedGroupIndex < groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex].length; arpeggiatedGroupIndex++) {
        const arpeggiatedDirection = (groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex][arpeggiatedGroupIndex].filter(note => note.arpeggiated.arrow === 'down').length !== 0) ? -1 : +1
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex][arpeggiatedGroupIndex].sort((arpeggiatedNoteBefore, arpeggiatedNoteAfter) => {
          if (arpeggiatedNoteBefore.midiOctave > arpeggiatedNoteAfter.midiOctave) {
            return arpeggiatedDirection
          }
          if (
            (arpeggiatedNoteBefore.midiOctave === arpeggiatedNoteAfter.midiOctave) &&
            NORMALIZED_PITCHES.indexOf(arpeggiatedNoteBefore.midiPitch) > NORMALIZED_PITCHES.indexOf(arpeggiatedNoteAfter.midiPitch)
          ) {
            return arpeggiatedDirection
          }
          return -1 * arpeggiatedDirection
        })
        groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex][arpeggiatedGroupIndex].forEach((arpeggiatedNote, arpeggiatedNoteIndex) => {
          const numberOfArpeggiatedNotes = groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex][arpeggiatedGroupIndex].length
          const timeOffset = arpeggiatedNoteIndex * arpeggiatedNote.durationInSeconds / numberOfArpeggiatedNotes
          if (arpeggiatedNote.durationInSeconds > timeOffset) {
            arpeggiatedNote.time += timeOffset
            arpeggiatedNote.durationInSeconds -= timeOffset
          }
          if (arpeggiatedNoteIndex === 0) {
            arpeggiatedNote.isFirstArpeggiatedNote = true
          }
          if (arpeggiatedNoteIndex === (groupsOfArpeggiatedNotesInCurrentTimeFrameForEachCrossStaveUnit[crossStaveIndex][arpeggiatedGroupIndex].length - 1)) {
            arpeggiatedNote.isLastArpeggiatedNote = true
          }
        })
      }

    }

    for (let noteTimeIndex = 0; noteTimeIndex < notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]].length; noteTimeIndex++) {
      const note = notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndex]
      const stavePositionVoiceKey = `${note.staveIndexConsideringStavePosition}-${note.voiceIndex}`
      const staveVoiceKey = `${note.staveIndex}-${note.voiceIndex}`

      const trackForNote = note.track
      if (!trackForNote) {
        continue
      }

      if (note.glissandoMarks) {
        for (let glissandoMarkIndex = 0; glissandoMarkIndex < note.glissandoMarks.length; glissandoMarkIndex++) {
          const currentGlissando = note.glissandoMarks[glissandoMarkIndex]
          const currentGlissandoKey = `${currentGlissando.key}-${note.noteIndex}`
          if (!glissandos[currentGlissandoKey] && (currentGlissando.after || currentGlissando.afterMeasure) && (!currentGlissando.direction || currentGlissando.direction === 'up')) {
            note.numberOfGlissandoNotes = Math.floor(note.actualDuration / GLISSANDO_DEFAULT_FACTOR)
            note.glissandoNotes = [ note ]
            note.durationOfEachGlissandoNoteInSeconds = note.durationInSeconds / note.numberOfGlissandoNotes
            for (let i = 0; i < (note.numberOfGlissandoNotes - 1); i++) {
              note.glissandoNotes.push(
                createNextHigherGlissandoNote(
                  note.glissandoNotes[note.glissandoNotes.length - 1]
                )
              )
            }
            addMidiNoteToTrack(
              note,
              noteWithTremoloWithNextOnEachStaveInEachVoice,
              slurMarksMappedWithTracks,
              tracksForEachInstrumentOnEachStaveInEachVoice,
              timeStampsMappedWithRefsOn,
              refsOnMappedWithTimeStamps
            )
            continue
          }
          if (!glissandos[currentGlissandoKey] && (currentGlissando.after || currentGlissando.afterMeasure) && (currentGlissando.direction === 'down')) {
            note.numberOfGlissandoNotes = Math.floor(note.actualDuration / GLISSANDO_DEFAULT_FACTOR)
            note.glissandoNotes = [ note ]
            note.durationOfEachGlissandoNoteInSeconds = note.durationInSeconds / note.numberOfGlissandoNotes
            for (let i = 0; i < (note.numberOfGlissandoNotes - 1); i++) {
              note.glissandoNotes.push(
                createNextLowerGlissandoNote(
                  note.glissandoNotes[note.glissandoNotes.length - 1]
                )
              )
            }
            addMidiNoteToTrack(
              note,
              noteWithTremoloWithNextOnEachStaveInEachVoice,
              slurMarksMappedWithTracks,
              tracksForEachInstrumentOnEachStaveInEachVoice,
              timeStampsMappedWithRefsOn,
              refsOnMappedWithTimeStamps
            )
            continue
          }
          if (!glissandos[currentGlissandoKey] && (currentGlissando.before || currentGlissando.beforeMeasure) && (!currentGlissando.direction || currentGlissando.direction === 'up')) {
            note.numberOfGlissandoNotes = Math.floor(note.actualDuration / GLISSANDO_DEFAULT_FACTOR)
            note.glissandoNotes = [ ]
            note.durationOfEachGlissandoNoteInSeconds = note.durationInSeconds / note.numberOfGlissandoNotes
            for (let i = 0; i < note.numberOfGlissandoNotes; i++) {
              note.glissandoNotes.unshift(
                createNextHigherGlissandoNote(
                  note.glissandoNotes[0] || note
                )
              )
            }
            addMidiNoteToTrack(
              note,
              noteWithTremoloWithNextOnEachStaveInEachVoice,
              slurMarksMappedWithTracks,
              tracksForEachInstrumentOnEachStaveInEachVoice,
              timeStampsMappedWithRefsOn,
              refsOnMappedWithTimeStamps
            )
            note.glissandoHasBeenPerformedBeforeNote = true
            continue
          }
          if (!glissandos[currentGlissandoKey] && (currentGlissando.before || currentGlissando.beforeMeasure) && (currentGlissando.direction === 'down')) {
            note.numberOfGlissandoNotes = Math.floor(note.actualDuration / GLISSANDO_DEFAULT_FACTOR)
            note.glissandoNotes = [ ]
            note.durationOfEachGlissandoNoteInSeconds = note.durationInSeconds / note.numberOfGlissandoNotes
            for (let i = 0; i < note.numberOfGlissandoNotes; i++) {
              note.glissandoNotes.unshift(
                createNextLowerGlissandoNote(
                  note.glissandoNotes[0] || note
                )
              )
            }
            addMidiNoteToTrack(
              note,
              noteWithTremoloWithNextOnEachStaveInEachVoice,
              slurMarksMappedWithTracks,
              tracksForEachInstrumentOnEachStaveInEachVoice,
              timeStampsMappedWithRefsOn,
              refsOnMappedWithTimeStamps
            )
            note.glissandoHasBeenPerformedBeforeNote = true
            continue
          }
          if (!glissandos[currentGlissandoKey]) {
            glissandos[currentGlissandoKey] = {
              startNote: note
            }
            continue
          }
          if (glissandos[currentGlissandoKey]) {
            const startGlissandoNote = glissandos[currentGlissandoKey].startNote
            const glissandoGoesUp = (note.midiOctave > startGlissandoNote.midiOctave) ||
              (NORMALIZED_PITCHES.indexOf(note.midiPitch) > NORMALIZED_PITCHES.indexOf(startGlissandoNote.midiPitch))
            const glissandoGoesDown = !glissandoGoesUp
            const maxNumberOfGlissandoNotes = 88
            note.glissandoNotes = [ startGlissandoNote ]
            if (
              (startGlissandoNote.midiPitch !== note.midiPitch) ||
              (startGlissandoNote.midiOctave !== note.midiOctave)
            ) {
              while (note.glissandoNotes.length <= maxNumberOfGlissandoNotes) {
                let nextGlissandoNote
                if (glissandoGoesUp) {
                  nextGlissandoNote = createNextHigherGlissandoNote(
                    note.glissandoNotes[note.glissandoNotes.length - 1]
                  )
                }
                if (glissandoGoesDown) {
                  nextGlissandoNote = createNextLowerGlissandoNote(
                    note.glissandoNotes[note.glissandoNotes.length - 1]
                  )
                }
                if (
                  (nextGlissandoNote.midiPitch === note.midiPitch) &&
                  (nextGlissandoNote.midiOctave === note.midiOctave)
                ) {
                  break
                }
                note.glissandoNotes.push(
                  nextGlissandoNote
                )
              }
            }
            note.numberOfGlissandoNotes = note.glissandoNotes.length
            note.durationOfEachGlissandoNoteInSeconds = note.durationInSeconds / note.numberOfGlissandoNotes
            addMidiNoteToTrack(
              note,
              noteWithTremoloWithNextOnEachStaveInEachVoice,
              slurMarksMappedWithTracks,
              tracksForEachInstrumentOnEachStaveInEachVoice,
              timeStampsMappedWithRefsOn,
              refsOnMappedWithTimeStamps
            )
            note.glissandoHasBeenPerformedBeforeNote = true
            delete glissandos[currentGlissandoKey]
            continue
          }
        }
        if (note.glissandoMarks.length === 1 && note.glissandoHasBeenPerformedBeforeNote) {
          note.glissandoMarks = undefined
          note.glissandoNotes = undefined
          note.numberOfGlissandoNotes = undefined
          note.durationOfEachGlissandoNoteInSeconds = undefined
          noteTimeIndex--
        }
        continue
      }

      const trillOfNote = findFirstArticulationWithName(note, 'trill')

      if (trillOfNote && !note.isGrace && !note.isRest && (note.actualDuration >= 1 / 32)) {
        note.trillTopAlternateNote = createOrnamentTopAlternateNote(note, trillOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
        note.trillBottomAlternateNote = createOrnamentBottomAlternateNote(note, trillOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)

        const trillFactor = 1 / 32
        note.numberOfTrillNotes = Math.floor(note.actualDuration / trillFactor)
        note.durationOfEachTrillNoteInSeconds = note.durationInSeconds / note.numberOfTrillNotes

        note.isTrilled = true
        note.shouldEndWithTurn = shouldNoteWithTrillEndWithTurn(note, notesSplittedInTimeFrames, orderedTimeFramesFromNotesSplittedInTimeFrames, timeIndex, noteTimeIndex)
      }

      const turnOfNote = findFirstArticulationWithName(note, 'turn')

      if (turnOfNote && !turnOfNote.followedAfter && !note.isGrace && !note.isRest && (note.actualDuration >= 1 / 32)) {
        note.turnTopAlternateNote = createOrnamentTopAlternateNote(note, turnOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
        note.turnBottomAlternateNote = createOrnamentBottomAlternateNote(note, turnOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)

        note.numberOfTurnNotes = 4
        note.durationOfEachTurnNoteInSeconds = note.durationInSeconds / note.numberOfTurnNotes

        note.isTurned = true
        note.isTurnedInverted = turnOfNote.inverted
      }

      if (turnOfNote && turnOfNote.followedAfter && !note.isGrace && !note.isRest && (note.actualDuration >= 1 / 2)) {
        note.turnTopAlternateNote = createOrnamentTopAlternateNote(note, turnOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
        note.turnBottomAlternateNote = createOrnamentBottomAlternateNote(note, turnOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)

        note.numberOfTurnNotes = 4
        note.durationOfLongPrincipalNoteBeforeTurnNotes = note.durationInSeconds * 3 / 4
        note.durationOfEachTurnNoteInSeconds = (note.durationInSeconds * 1 / 4) / note.numberOfTurnNotes

        note.isTurned = true
        note.isTurnedInverted = turnOfNote.inverted
      }

      const mordentOfNote = findFirstArticulationWithName(note, 'mordent')

      if (mordentOfNote && !note.isGrace && !note.isRest && (note.actualDuration >= 1 / 32)) {
        note.mordentTopAlternateNote = createOrnamentTopAlternateNote(note, mordentOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
        note.mordentBottomAlternateNote = createOrnamentBottomAlternateNote(note, mordentOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)

        const mordentFactor = 1 / 32

        note.numberOfShortMordentNotes = 2
        note.durationOfEachShortMordentNoteInSeconds = note.durationInSeconds / Math.floor(note.actualDuration / mordentFactor)
        note.durationOfPrincipalNoteAfterShortMordentNotesInSeconds = note.durationInSeconds - note.numberOfShortMordentNotes * note.durationOfEachShortMordentNoteInSeconds

        note.isMordent = true
        note.isMordentInverted = mordentOfNote.inverted
      }

      const noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey]
        ? tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].findIndex(noteBefore => {
          return (noteBefore.midiPitch === note.midiPitch) && (noteBefore.octaveNumber === note.octaveNumber)
        })
        : -1

      note.unitIsTiedFromRightSide = (note.unitIsTiedWithNext || note.unitIsTiedAfter || note.unitIsTiedAfterMeasure)
      note.unitIsTiedFromLeftSide = (note.unitIsTiedBefore || note.unitIsTiedBeforeMeasure || (noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura !== -1))
      note.unitIsNotTiedBeforeAndNoteBeforeIsTiedAfter = (!note.unitIsTiedBefore && !note.unitIsTiedBeforeMeasure) &&
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] &&
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura] &&
        (
          tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura].unitIsTiedAfter ||
          tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura].unitIsTiedAfterMeasure
        )

      if (note.unitIsNotTiedBeforeAndNoteBeforeIsTiedAfter) {
        const noteBeforeWhichWasSomehowTiedAndHasNoLongerConnectionWithCurrentNoteButNotPlayedYet = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura]
        addMidiNoteToTrack(
          noteBeforeWhichWasSomehowTiedAndHasNoLongerConnectionWithCurrentNoteButNotPlayedYet,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].splice(noteIndexBeforeWhichIsTiedToCurrentNoteInGeneralBeforeClearingTiesAura, 1)
        if (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].length === 0) {
          delete tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey]
        }
      }

      const noteIndexBeforeWhichIsTiedToCurrentNote = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey]
        ? tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].findIndex(noteBefore => {
          return (noteBefore.midiPitch === note.midiPitch) && (noteBefore.octaveNumber === note.octaveNumber)
        })
        : -1
      let thereIsNoteBeforeWhichIsTiedToCurrentNote = noteIndexBeforeWhichIsTiedToCurrentNote !== -1

      if (thereIsNoteBeforeWhichIsTiedToCurrentNote) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].notesInTieChain = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].notesInTieChain || []
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].notesInTieChain.push(note)
      }

      if (
        thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        note.isTremolo
      ) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].durationInSeconds = (
          (note.time + note.allTimeAdjustments) -
          (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].time + tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].allTimeAdjustments) +
          note.durationOfEachTremoloNoteInSeconds
        )

        const noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].splice(noteIndexBeforeWhichIsTiedToCurrentNote, 1)[0]
        addMidiNoteToTrack(
          noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        thereIsNoteBeforeWhichIsTiedToCurrentNote = false
        note.unitIsTiedFromLeftSide = false
        note.firstTremoloNoteWasTiedAndItsBeenPlayed = true
        note.time += note.durationOfEachTremoloNoteInSeconds
      }

      if (
        thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        !note.isTremolo &&
        note.isTrilled
      ) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].durationInSeconds = (
          (note.time + note.allTimeAdjustments) -
          (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].time + tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].allTimeAdjustments) +
          note.durationOfEachTrillNoteInSeconds
        )

        const noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].splice(noteIndexBeforeWhichIsTiedToCurrentNote, 1)[0]
        addMidiNoteToTrack(
          noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        thereIsNoteBeforeWhichIsTiedToCurrentNote = false
        note.unitIsTiedFromLeftSide = false
        note.firstTrillNoteWasTiedAndItsBeenPlayed = true
        note.time += note.durationOfEachTrillNoteInSeconds
      }

      if (
        thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        !note.isTremolo &&
        !note.isTrilled &&
        note.isTurned
      ) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].durationInSeconds = (
          (note.time + note.allTimeAdjustments) -
          (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].time + tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].allTimeAdjustments) +
          (note.durationOfLongPrincipalNoteBeforeTurnNotes || note.durationOfEachTurnNoteInSeconds)
        )

        const noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].splice(noteIndexBeforeWhichIsTiedToCurrentNote, 1)[0]
        addMidiNoteToTrack(
          noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        thereIsNoteBeforeWhichIsTiedToCurrentNote = false
        note.unitIsTiedFromLeftSide = false
        note.firstTurnNoteWasTiedAndItsBeenPlayed = true
        note.time += note.durationOfEachTurnNoteInSeconds
      }

      if (
        thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        !note.isTremolo &&
        !note.isTrilled &&
        !note.isTurned &&
        note.isMordent
      ) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].durationInSeconds = (
          (note.time + note.allTimeAdjustments) -
          (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].time + tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].allTimeAdjustments) +
          note.durationOfEachShortMordentNoteInSeconds
        )

        const noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].splice(noteIndexBeforeWhichIsTiedToCurrentNote, 1)[0]
        addMidiNoteToTrack(
          noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        thereIsNoteBeforeWhichIsTiedToCurrentNote = false
        note.unitIsTiedFromLeftSide = false
        note.firstMordentNoteWasTiedAndItsBeenPlayed = true
        note.time += note.durationOfEachShortMordentNoteInSeconds
      }

      if (
        thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        !note.isTremolo &&
        !note.isTrilled &&
        !note.isTurned &&
        !note.isMordent
      ) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].durationInSeconds = (
          (note.time + note.allTimeAdjustments) -
          (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].time + tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey][noteIndexBeforeWhichIsTiedToCurrentNote].allTimeAdjustments) +
          note.durationInSeconds
        )
      }

      if (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] && tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].length === 0) {
        delete tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey]
      }

      if (
        !thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        note.unitIsTiedFromRightSide &&
        note.isSingleTremolo
      ) {
        const lastTremoloNote = Object.assign({}, note)
        lastTremoloNote.tremoloParams = undefined
        lastTremoloNote.isTremolo = false
        lastTremoloNote.isSingleTremolo = false
        lastTremoloNote.numberOfTremoloNotes = undefined
        lastTremoloNote.durationOfEachTremoloNoteInSeconds = undefined
        lastTremoloNote.durationInSeconds = note.durationOfEachTremoloNoteInSeconds
        lastTremoloNote.time = note.time + (note.numberOfTremoloNotes - 1) * note.durationOfEachTremoloNoteInSeconds
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] || []
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].push(lastTremoloNote)
        addMidiNoteToTrack(
          note,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        note.unitIsTiedFromRightSide = false
        continue
      }

      if (
        !thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        note.unitIsTiedFromRightSide &&
        !note.isSingleTremolo &&
        note.isTrilled
      ) {
        const lastTrilledNote = Object.assign({}, note)
        deleteArticulationsWithName(lastTrilledNote, 'trill')
        lastTrilledNote.numberOfTrillNotes = undefined
        lastTrilledNote.durationOfEachTrillNoteInSeconds = undefined
        lastTrilledNote.isTrilled = false
        lastTrilledNote.durationInSeconds = note.durationOfEachTrillNoteInSeconds
        lastTrilledNote.time = note.time + (note.numberOfTrillNotes - 1) * note.durationOfEachTrillNoteInSeconds
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] || []
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].push(lastTrilledNote)
        addMidiNoteToTrack(
          note,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        note.unitIsTiedFromRightSide = false
        continue
      }

      if (
        !thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        note.unitIsTiedFromRightSide &&
        !note.isSingleTremolo &&
        !note.isTrilled &&
        note.isTurned
      ) {
        const lastTurnedNote = Object.assign({}, note)
        deleteArticulationsWithName(lastTurnedNote, 'turn')
        lastTurnedNote.numberOfTurnNotes= undefined
        lastTurnedNote.durationOfEachTurnNoteInSeconds = undefined
        lastTurnedNote.isTurned = false
        lastTurnedNote.durationInSeconds = note.durationOfEachTurnNoteInSeconds
        lastTurnedNote.time = note.time + (note.numberOfTurnNotes - 1) * note.durationOfEachTurnNoteInSeconds
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] || []
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].push(lastTurnedNote)
        addMidiNoteToTrack(
          note,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        note.unitIsTiedFromRightSide = false
        continue
      }

      if (
        !thereIsNoteBeforeWhichIsTiedToCurrentNote &&
        note.unitIsTiedFromRightSide &&
        !note.isSingleTremolo &&
        !note.isTrilled &&
        !note.isTurned &&
        note.isMordent
      ) {
        const lastMorderntNote = Object.assign({}, note)
        deleteArticulationsWithName(lastMorderntNote, 'mordent')
        lastMorderntNote.numberOfShortMordentNotes = undefined
        lastMorderntNote.durationOfEachShortMordentNoteInSeconds = undefined
        lastMorderntNote.durationOfPrincipalNoteAfterShortMordentNotesInSeconds = undefined
        lastMorderntNote.isMordent = false
        lastMorderntNote.isMordentInverted = false
        lastMorderntNote.durationInSeconds = note.durationOfPrincipalNoteAfterShortMordentNotesInSeconds
        lastMorderntNote.time = note.time + note.numberOfShortMordentNotes * note.durationOfEachShortMordentNoteInSeconds
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] || []
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].push(lastMorderntNote)
        addMidiNoteToTrack(
          note,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        note.unitIsTiedFromRightSide = false
        continue
      }

      if (!thereIsNoteBeforeWhichIsTiedToCurrentNote && note.unitIsTiedFromRightSide) {
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] || []
        tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].push(note)
        continue
      }

      if (
        (!note.unitIsTiedFromRightSide || note.unitIsLastSingleUnitOnPageInVoice) &&
        (thereIsNoteBeforeWhichIsTiedToCurrentNote && tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey])
      ) {
        const noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne = tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].splice(noteIndexBeforeWhichIsTiedToCurrentNote, 1)[0]
        addMidiNoteToTrack(
          noteBeforeWhichIsTiedToCurrentNoteAndReadyToBePlayedFromItsTimeWithAddedUpDurationFromAllTiedNotesTillCurrentOne,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }

      if (tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey] && tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey].length === 0) {
        delete tiesAuraForEachVoiceInEachStave[stavePositionVoiceKey]
      }

      if ((!note.unitIsTiedFromRightSide || note.unitIsLastSingleUnitOnPageInVoice) && !thereIsNoteBeforeWhichIsTiedToCurrentNote) {
        addMidiNoteToTrack(
          note,
          noteWithTremoloWithNextOnEachStaveInEachVoice,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
    }
  }

  // print(midi)

  if (itIsBrowserEnv) {
    return {
      data: midi.toArray(),
      timeStampsMappedWithRefsOn,
      refsOnMappedWithTimeStamps
    }
  }
  return {
    data: Buffer.from(midi.toArray()),
    timeStampsMappedWithRefsOn,
    refsOnMappedWithTimeStamps
  }
}

// if (itIsBrowserEnv && typeof window !== 'undefined') {
//   window.midiForAllPages = module.exports
// }

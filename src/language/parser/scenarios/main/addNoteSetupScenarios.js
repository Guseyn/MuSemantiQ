'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findNextTokenValuesOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValuesOnTheLine.js'
import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import isHorizontalCorrection from '#msq/language/parser/scenarios/token/isHorizontalCorrection.js'
import parseHorizontalCorrection from '#msq/language/parser/scenarios/token/parseHorizontalCorrection.js'
import isDirection from '#msq/language/parser/scenarios/token/isDirection.js'
import isStaveIndex from '#msq/language/parser/scenarios/token/isStaveIndex.js'
import parseDirection from '#msq/language/parser/scenarios/token/parseDirection.js'
import parseStaveIndexByTokens from '#msq/language/parser/scenarios/token/parseStaveIndexByTokens.js'
import isRoundness from '#msq/language/parser/scenarios/token/isRoundness.js'
import parseRoundness from '#msq/language/parser/scenarios/token/parseRoundness.js'
import isAboveBelowOverUnderStaveLines from '#msq/language/parser/scenarios/token/isAboveBelowOverUnderStaveLines.js'
import isAboveBelowOverUnder from '#msq/language/parser/scenarios/token/isAboveBelowOverUnder.js'
import parseDirectionByAboveBelowOverUnderStaveLines from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnderStaveLines.js'
import parseDirectionByAboveBelowOverUnder from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnder.js'
import isMeasureNumber from '#msq/language/parser/scenarios/token/isMeasureNumber.js'
import parseMeasureNumber from '#msq/language/parser/scenarios/token/parseMeasureNumber.js'
import isNumberOfStrokes from '#msq/language/parser/scenarios/token/isNumberOfStrokes.js'
import parseNumberOfStrokes from '#msq/language/parser/scenarios/token/parseNumberOfStrokes.js'
import isNumberOfTimes from '#msq/language/parser/scenarios/token/isNumberOfTimes.js'
import parseNumberOfTimes from '#msq/language/parser/scenarios/token/parseNumberOfTimes.js'
import getRestPositionNumberByRestPositionName from '#msq/language/parser/scenarios/page-schema/getRestPositionNumberByRestPositionName.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll from '#msq/language/parser/scenarios/page-schema/initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll.js'
import initNewVoiceParamsIfThereIsNoVoicesAtAllAndInitNewChordParamsIfThereIsAlreadySuchChordProperty from '#msq/language/parser/scenarios/page-schema/initNewVoiceParamsIfThereIsNoVoicesAtAllAndInitNewChordParamsIfThereIsAlreadySuchChordProperty.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import getLastStaveParams from '#msq/language/parser/scenarios/page-schema/getLastStaveParams.js'
import getLastVoiceParams from '#msq/language/parser/scenarios/page-schema/getLastVoiceParams.js'
import findLastNonSimileChordParams from '#msq/language/parser/scenarios/page-schema/findLastNonSimileChordParams.js'
import getLastNoteParams from '#msq/language/parser/scenarios/page-schema/getLastNoteParams.js'
import getLastKeyParams from '#msq/language/parser/scenarios/page-schema/getLastKeyParams.js'
import getLastArticulationParams from '#msq/language/parser/scenarios/page-schema/getLastArticulationParams.js'
import getLastGlissandoMark from '#msq/language/parser/scenarios/page-schema/getLastGlissandoMark.js'
import getLastLyric from '#msq/language/parser/scenarios/page-schema/getLastLyric.js'
import findKeySignatureThatUserMeant from '#msq/language/parser/scenarios/page-schema/findKeySignatureThatUserMeant.js'
import noteDurations from '#msq/language/parser/scenarios/static-objects/noteDurations.js'
import stavePositions from '#msq/language/parser/scenarios/static-objects/stavePositions.js'
import noteKeys from '#msq/language/parser/scenarios/static-objects/noteKeys.js'
import breathMarks from '#msq/language/parser/scenarios/static-objects/breathMarks.js'
import clefs from '#msq/language/parser/scenarios/static-objects/clefs.js'
import articulations from '#msq/language/parser/scenarios/static-objects/articulations.js'
import ornamentKeys from '#msq/language/parser/scenarios/static-objects/ornamentKeys.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

const defaultChordDuration = 1 / 4

const addSimileUnitsToPageSchema = (parserState, simileMark, currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits) => {
  for (let simileIndex = 0; simileIndex < simileMark.count; simileIndex++) {
    parserState.pageSchema.measuresParams[currentNumberOfMeasures - 1].stavesParams[currentNumberOfStaves - 1].voicesParams[currentNumberOfVoices - 1].splice(
      (currentNumberOfUnits - 1) + simileIndex + 1, 0,
      { notes: [{ positionNumber: (simileMark.yCorrection || 0) + 2.0 }], isSimile: true, simileRefId: `simile-mark-${parserState.numberOfSimileMarks}`, simileCountDown: (simileMark.count - simileIndex), simileYCorrection: simileMark.yCorrection }
    )
  }
}

const CLEF = 'clef'
const NOTE = 'note'

export default function (scenarios) {
  scenarios['note'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const itIsNote = (
        regexps.noteWithDurationAndOctave.test(tokenValues) ||
        (regexps.rest.test(tokenValues) && currentToken.firstOnTheLine) ||
        regexps.topMidBottomRest.test(tokenValues)
      ) && (
        findNextTokenValueOnTheLine(
          unitext,
          currentToken.firstCharIndexOfNextToken
        ) !== CLEF
      ) && (
        (progressionOfCommandsFromScenarios.indexOf(NOTE) !== -1) ||
        currentToken.isOnNewLine
      )
      return itIsNote
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'stavesParams', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll(lastMeasureParamsValue, 'voicesParams', parserState)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      initNewVoiceParamsIfThereIsNoVoicesAtAllAndInitNewChordParamsIfThereIsAlreadySuchChordProperty(lastStaveParamsValue, 'notes')
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const chordScopeIsNotActive = !parserState.chordScopeIsActive
      if (chordScopeIsNotActive) {
        lastVoiceParamsValue.push({})
        const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
        const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
        if (parserState.lastStavePosition[currentNumberOfStaves - 1] && parserState.lastStavePosition[currentNumberOfStaves - 1][currentNumberOfVoices - 1]) {
          parserState.lastStavePosition[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = undefined
        }
      }
      const itIsNote = regexps.noteWithDurationAndOctave.test(tokenValues)
      const itIsRest = (regexps.rest.test(tokenValues) && currentToken.firstOnTheLine) || regexps.topMidBottomRest.test(tokenValues)
      let noteDuration
      let noteName
      let octaveNumber
      let positionNumber
      if (itIsNote) {
        const match = regexps.noteWithDurationAndOctave.match(tokenValues)
        if (match[0]) {
          noteDuration = noteDurations[match[0]]
        }
        if (match[1]) {
          noteName = match[1]
        }
        if (match[2]) {
          octaveNumber = match[2]
        }
      } else if (itIsRest) {
        const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
        if (lastChordParamsValue.notes && lastChordParamsValue.notes.length > 0) {
          parserState.chordScopeIsActive = false
          lastVoiceParamsValue.push({})
        }
        const match = regexps.topMidBottomRest.match(tokenValues)
        noteDuration = noteDurations[match[0]]
        positionNumber = getRestPositionNumberByRestPositionName(match[1])
      }
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = lastVoiceParamsValue.length
      parserState.numberOfUnitsBeforeFinishingDeclaringNewOne = currentNumberOfUnits
      const noteParams = {
        noteName,
        octaveNumber,
        positionNumber
      }
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.notes = lastChordParamsValue.notes || []
      lastChordParamsValue.notes.push(noteParams)
      const currentNumberOfNotes = lastChordParamsValue.notes.length
      noteParams.id = currentNumberOfNotes - 1
      const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
      if (itIsRest) {
        lastChordParamsValue.isRest = true
      }
      if (noteDuration) {
        lastChordParamsValue.unitDuration = noteDuration
        if (!parserState.lastChordDuration[currentNumberOfStaves - 1]) {
          parserState.lastChordDuration[currentNumberOfStaves - 1] = {}
        }
        parserState.lastChordDuration[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = noteDuration
      } else if (
        parserState.lastChordDuration[currentNumberOfStaves - 1] &&
        parserState.lastChordDuration[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      ) {
        lastChordParamsValue.unitDuration = parserState.lastChordDuration[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      } else {
        lastChordParamsValue.unitDuration = defaultChordDuration
        if (!parserState.lastChordDuration[currentNumberOfStaves - 1]) {
          parserState.lastChordDuration[currentNumberOfStaves - 1] = {}
        }
        parserState.lastChordDuration[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = noteDuration
      }
      parserState.keysOfLastNote = []
      if (
        parserState.lastStemDirection[currentNumberOfStaves - 1] &&
        parserState.lastStemDirection[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      ) {
        lastChordParamsValue.stemDirection = parserState.lastStemDirection[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      } else {
        if (currentNumberOfVoices === 1) {
          lastChordParamsValue.stemDirection = 'up'
        } else {
          lastChordParamsValue.stemDirection = 'down'
        }
      }
      if (
        parserState.lastStavePosition[currentNumberOfStaves - 1] &&
        parserState.lastStavePosition[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      ) {
        lastNoteParamsValue.stave = parserState.lastStavePosition[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      }
      if (
        parserState.lastGhostStatus[currentNumberOfStaves - 1] &&
        parserState.lastGhostStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]
      ) {
        lastNoteParamsValue.isGhost = true
      }
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfNotes = lastChordParamsValue.notes.length

      if (!parserState.lastBeamStatus[currentNumberOfStaves - 1]) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1] = {}
      }
      if (!parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = {
          plain: false,
          grace: false
        }
      }
      if (lastChordParamsValue.unitDuration >= 1 / 4) {
        lastChordParamsValue.beamedWithNext = false
      }
      if (
        lastChordParamsValue.beamedWithNext === false &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['plain'] &&
        !lastChordParamsValue.isGrace
      ) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['plain'] = false
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] = false
      }
      if (
        lastChordParamsValue.beamedWithNext === false &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] &&
        lastChordParamsValue.isGrace
      ) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] = false
      }
      if (
        parserState.lastBeamStatus[currentNumberOfStaves - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] &&
        !lastChordParamsValue.isGrace
      ) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] = false
      }
      if (
        parserState.lastBeamStatus[currentNumberOfStaves - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['plain'] &&
        !lastChordParamsValue.isGrace
      ) {
        lastChordParamsValue.beamedWithNext = true
      }
      if (
        parserState.lastBeamStatus[currentNumberOfStaves - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] &&
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] &&
        lastChordParamsValue.isGrace
      ) {
        lastChordParamsValue.beamedWithNext = true
      }
      if (
        lastChordParamsValue.beamedWithNext === true &&
        !lastChordParamsValue.isGrace
      ) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['plain'] = true
      }
      if (
        lastChordParamsValue.beamedWithNext === true &&
        lastChordParamsValue.isGrace
      ) {
        parserState.lastBeamStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1]['grace'] = true
      }

      if (scenarioNameThatChangedCommandsProgression !== NOTE) {
        parserState.chordScopeIsActive = false
      }
      return {
        isRest: lastChordParamsValue.isRest,
        currentNumberOfMeasures,
        currentNumberOfStaves,
        currentNumberOfVoices,
        currentNumberOfUnits,
        currentNumberOfNotes
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['empty line after note'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    type: 'on empty line',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return true
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.chordScopeIsActive = false
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      if (parserState.lastStavePosition[currentNumberOfStaves - 1] && parserState.lastStavePosition[currentNumberOfStaves - 1][currentNumberOfVoices - 1]) {
        parserState.lastStavePosition[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = undefined
      }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['note stem direction'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.stemDirection.test(tokenValues) ||
        regexps.directionOfStem.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const firstCommandVariation = regexps.stemDirection.match(tokenValues)
      const secondCommandVariation = regexps.directionOfStem.match(tokenValues)
      const stemDirection = (firstCommandVariation || secondCommandVariation)[0]
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.stemDirection = stemDirection
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = lastVoiceParamsValue.length
      if (!parserState.lastStemDirection[currentNumberOfStaves - 1]) {
        parserState.lastStemDirection[currentNumberOfStaves - 1] = {}
      }
      parserState.lastStemDirection[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = stemDirection
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note stave position'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.stavePosition.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const stavePositionName = regexps.stavePosition.match(tokenValues)[0]
      const stavePosition = stavePositions[stavePositionName]
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
      lastNoteParamsValue.stave = stavePosition
      parserState.keysOfLastNote.forEach(keyParams => {
        keyParams.stave = stavePosition
      })
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      let stavePositionInRefId = currentNumberOfStaves
      return { stavePositionName, stavePositionInRefId, currentNumberOfStaves, currentNumberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with number of dots'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withNumberOfDots.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const numberOfDots = regexps.withNumberOfDots.match(
        replaceWordsWithNumbers(tokenValues)
      )[0] * 1
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.numberOfDots = numberOfDots
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['dotted note'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.dotted.test(tokenValues) || regexps.withDot.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.numberOfDots = 1
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note beamed'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.beamed.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      lastChordParamsValue.beamedWithNext = true
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note not beamed'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.notBeamed.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.beamedWithNext = false
      parserState.groupScoreIsActive = false
      parserState.graceGroupScoreIsActive = false
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note beamed with next'] = {
    requiredCommandProgression: 'note beamed',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withNext.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note not beamed with next'] = {
    requiredCommandProgression: 'note not beamed',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withNext.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note beamed with only primary line'] = {
    requiredCommandProgression: 'note beamed',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withOnlyPrimaryLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.beamedWithNextWithJustOneBeam = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with key'] = {
    requiredCommandProgression: 'note',
    prohibitedCommandProgressions: [ 'note with turn', 'note with mordent', 'note with trill' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withNoteKey.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
      const { noteName, octaveNumber, positionNumber, stave } = lastNoteParamsValue
      lastChordParamsValue.keysParams = lastChordParamsValue.keysParams || []
      const keyTypeName = regexps.withNoteKey.match(tokenValues)
      const keyType = noteKeys[keyTypeName]
      const newKeyParams = {
        noteName,
        octaveNumber,
        positionNumber,
        stave,
        keyType
      }
      lastChordParamsValue.keysParams.push(newKeyParams)
      parserState.keysOfLastNote.push(newKeyParams)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfNoteKeys = lastChordParamsValue.keysParams.length
      newKeyParams.id = currentNumberOfNoteKeys - 1
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNoteKeys }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with key with parentheses'] = {
    requiredCommandProgression: 'note with key',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withParentheses.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastKeyParamsValue = getLastKeyParams(lastChordParamsValue)
      lastKeyParamsValue.withParentheses = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfNoteKeys = lastChordParamsValue.keysParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNoteKeys }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with parentheses'] = {
    requiredCommandProgression: 'note',
    prohibitedCommandProgressions: [ 'note with key' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withParentheses.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const numberOfNotes = lastChordParamsValue.notes.length
      lastChordParamsValue.parentheses = lastChordParamsValue.parentheses || []
      lastChordParamsValue.parentheses.push({
        fromNoteIndex: numberOfNotes - 1,
        toNoteIndex: numberOfNotes - 1,
        id: numberOfNotes - 1
      })
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfNotes = lastChordParamsValue.notes.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNotes }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with text'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withText.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const textValue = regexps.withText.match(tokenValues)[0]
      parserState.lastNoteTextValue = textValue
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      let noteKeyRefId
      if (parserState.lastNoteTextPositionApplicationToNote === undefined) {
        parserState.lastNoteTextPositionApplicationToNote = true
        const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
        const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
        const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
        const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
        const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
        const { noteName, octaveNumber, positionNumber, stave } = lastNoteParamsValue
        lastChordParamsValue.keysParams = lastChordParamsValue.keysParams || []
        const keyType = 'noteLetter'
        const textValue = parserState.lastNoteTextValue
        const newKeyParams = {
          noteName,
          octaveNumber,
          positionNumber,
          stave,
          keyType,
          textValue
        }
        lastChordParamsValue.keysParams.push(newKeyParams)
        newKeyParams.id = lastChordParamsValue.keysParams.length - 1
        parserState.keysOfLastNote.push(newKeyParams)
        const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
        const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
        const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
        const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
        noteKeyRefId = `note-key-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${newKeyParams.id + 1}`
      }
      parserState.lastNoteTextValue = undefined
      parserState.lastNoteTextPositionApplicationToNote = undefined
      return { noteKeyRefId }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with text beside'] = {
    requiredCommandProgression: 'note with text',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.beside.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastNoteTextPositionApplicationToNote = 'beside'
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
      const { noteName, octaveNumber, positionNumber, stave } = lastNoteParamsValue
      lastChordParamsValue.keysParams = lastChordParamsValue.keysParams || []
      const keyType = 'noteLetter'
      const textValue = parserState.lastNoteTextValue
      const newKeyParams = {
        noteName,
        octaveNumber,
        positionNumber,
        stave,
        keyType,
        textValue
      }
      lastChordParamsValue.keysParams.push(newKeyParams)
      newKeyParams.id = lastChordParamsValue.keysParams.length - 1
      parserState.keysOfLastNote.push(newKeyParams)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, newKeyParams }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with text up or down'] = {
    requiredCommandProgression: 'note with text',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastNoteTextPositionApplicationToNote = 'up|down'
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulationParams = {
        name: 'noteLetter',
        direction: parseDirection(tokenValues),
        textValue: parserState.lastNoteTextValue
      }
      lastChordParamsValue.articulationParams.push(newArticulationParams)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with text above or below'] = {
    requiredCommandProgression: 'note with text',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues) &&
        !regexps.staveWithAndWithoutDelimeter.test(
          [
            findNextTokenValueOnTheLine(
              unitext, currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastNoteTextPositionApplicationToNote = 'up|down'
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulationParams = {
        name: 'noteLetter',
        direction: parseDirectionByAboveBelowOverUnder(tokenValues),
        textValue: parserState.lastNoteTextValue
      }
      lastChordParamsValue.articulationParams.push(newArticulationParams)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with text above or below stave'] = {
    requiredCommandProgression: 'note with text',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnderStaveLines(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastNoteTextPositionApplicationToNote = 'up|down'
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulationParams = {
        name: 'noteLetter',
        direction: parseDirectionByAboveBelowOverUnderStaveLines(tokenValues),
        textValue: parserState.lastNoteTextValue,
        aboveBelowOverUnderStaveLines: true
      }
      lastChordParamsValue.articulationParams.push(newArticulationParams)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with text up or down vertical correction'] = {
    requiredCommandProgression: 'note with text up or down',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 3
  }
  scenarios['note with text above or below vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text up or down vertical correction'],
    'note with text above or below'
  )
  scenarios['note with text above or below stave vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text up or down vertical correction'],
    'note with text above or below stave'
  )
  scenarios['note is tied with next'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.tiedWithNext.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tiedWithNext = {}
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note is tied before'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.tiedBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tiedBefore = {}
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note is tied before measure number'] = {
    requiredCommandProgression: 'note is tied before',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isMeasureNumber(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const measureNumberValue = parseMeasureNumber(tokenValues)
      lastChordParamsValue.tiedBeforeMeasure = Object.assign({
        index: measureNumberValue
      }, lastChordParamsValue.tiedBefore)
      lastChordParamsValue.tiedBefore = undefined
      return { measureNumberValue }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note is tied after'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.tiedAfter.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tiedAfter = {}
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note is tied after measure number'] = {
    requiredCommandProgression: 'note is tied after',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isMeasureNumber(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const measureNumberValue = parseMeasureNumber(tokenValues)
      lastChordParamsValue.tiedAfterMeasure = Object.assign({
        index: measureNumberValue
      }, lastChordParamsValue.tiedAfter)
      lastChordParamsValue.tiedAfter = undefined
      return { measureNumberValue }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied with next direction'] = {
    requiredCommandProgression: 'note is tied with next',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tiedWithNext.direction = parseDirection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied with next above or below'] = {
    requiredCommandProgression: 'note is tied with next',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tiedWithNext.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied before direction'] = {
    requiredCommandProgression: 'note is tied before',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (lastChordParamsValue.tiedBefore) {
        lastChordParamsValue.tiedBefore.direction = parseDirection(tokenValues)
      } else if (lastChordParamsValue.tiedBeforeMeasure) {
        lastChordParamsValue.tiedBeforeMeasure.direction = parseDirection(tokenValues)
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied before above or below'] = {
    requiredCommandProgression: 'note is tied before',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (lastChordParamsValue.tiedBefore) {
        lastChordParamsValue.tiedBefore.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
      } else if (lastChordParamsValue.tiedBeforeMeasure) {
        lastChordParamsValue.tiedBeforeMeasure.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied after direction'] = {
    requiredCommandProgression: 'note is tied after',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (lastChordParamsValue.tiedAfter) {
        lastChordParamsValue.tiedAfter.direction = parseDirection(tokenValues)
      } else if (lastChordParamsValue.tiedAfterMeasure) {
        lastChordParamsValue.tiedAfterMeasure.direction = parseDirection(tokenValues)
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied after above or below'] = {
    requiredCommandProgression: 'note is tied after',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (lastChordParamsValue.tiedAfter) {
        lastChordParamsValue.tiedAfter.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
      } else if (lastChordParamsValue.tiedAfterMeasure) {
        lastChordParamsValue.tiedAfterMeasure.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied with next roundness'] = {
    requiredCommandProgression: 'note is tied with next',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isRoundness(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tiedWithNext.roundCoefficientFactor = parseRoundness(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied before roundness'] = {
    requiredCommandProgression: 'note is tied before',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isRoundness(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (lastChordParamsValue.tiedBefore) {
        lastChordParamsValue.tiedBefore.roundCoefficientFactor = parseRoundness(tokenValues)
      } else if (lastChordParamsValue.tiedBeforeMeasure) {
        lastChordParamsValue.tiedBeforeMeasure.roundCoefficientFactor = parseRoundness(tokenValues)
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note tied after roundness'] = {
    requiredCommandProgression: 'note is tied after',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isRoundness(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (lastChordParamsValue.tiedAfter) {
        lastChordParamsValue.tiedAfter.roundCoefficientFactor = parseRoundness(tokenValues)
      } else if (lastChordParamsValue.tiedAfterMeasure) {
        lastChordParamsValue.tiedAfterMeasure.roundCoefficientFactor = parseRoundness(tokenValues)
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with glissando'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withGlissando.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.numberOfGlissandos += 1
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const key = `glissando-${parserState.numberOfGlissandos}`
      lastChordParamsValue.glissandoMarks = lastChordParamsValue.glissandoMarks || []
      lastChordParamsValue.glissandoMarks.push({ key })
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastGlissandoMarkValue = getLastGlissandoMark(lastChordParamsValue)
      if (lastGlissandoMarkValue && !lastGlissandoMarkValue.after && (lastGlissandoMarkValue.afterMeasure === undefined) && !lastGlissandoMarkValue.before && (lastGlissandoMarkValue.beforeMeasure === undefined)) {
        lastGlissandoMarkValue.after = true
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with glissando direction'] = {
    requiredCommandProgression: 'note with glissando',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastGlissandoMarkValue = getLastGlissandoMark(lastChordParamsValue)
      lastGlissandoMarkValue.direction = parseDirection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with glissando after'] = {
    requiredCommandProgression: 'note with glissando',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.after.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastGlissandoMarkValue = getLastGlissandoMark(lastChordParamsValue)
      lastGlissandoMarkValue.after = true
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with glissando before'] = {
    requiredCommandProgression: 'note with glissando',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.before.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastGlissandoMarkValue = getLastGlissandoMark(lastChordParamsValue)
      lastGlissandoMarkValue.before = true
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with glissando after measure number'] = {
    requiredCommandProgression: 'note with glissando after',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isMeasureNumber(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastGlissandoMarkValue = getLastGlissandoMark(lastChordParamsValue)
      const measureNumberValue = parseMeasureNumber(tokenValues)
      lastGlissandoMarkValue.afterMeasure = measureNumberValue
      lastGlissandoMarkValue.after = false
      return { measureNumberValue }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with glissando before measure number'] = {
    requiredCommandProgression: 'note with glissando before',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isMeasureNumber(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastGlissandoMarkValue = getLastGlissandoMark(lastChordParamsValue)
      const measureNumberValue = parseMeasureNumber(tokenValues)
      lastGlissandoMarkValue.beforeMeasure = measureNumberValue
      lastGlissandoMarkValue.after = false
      return { measureNumberValue }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note is rest'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isRest.test(tokenValues) && !currentToken.firstOnTheLine
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.isRest = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note is ghost'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isGhost.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const chordScopeIsNotActive = !parserState.chordScopeIsActive
      if (chordScopeIsNotActive) {
        if (!parserState.lastGhostStatus[currentNumberOfStaves - 1]) {
          parserState.lastGhostStatus[currentNumberOfStaves - 1] = {}
        }
        parserState.lastGhostStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = true
      }
      lastNoteParamsValue.isGhost = true
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note is not ghost'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isNotGhost.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastNoteParamsValue = getLastNoteParams(lastChordParamsValue)
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const chordScopeIsNotActive = !parserState.chordScopeIsActive
      if (chordScopeIsNotActive) {
        if (!parserState.lastGhostStatus[currentNumberOfStaves - 1]) {
          parserState.lastGhostStatus[currentNumberOfStaves - 1] = {}
        }
        parserState.lastGhostStatus[currentNumberOfStaves - 1][currentNumberOfVoices - 1] = false
      }
      lastNoteParamsValue.isGhost = false
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note is grace'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isGrace.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.isGrace = true
      if (regexps.isGrace.match(tokenValues)[0]) {
        lastChordParamsValue.hasGraceCrushLine = true
      }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with crushed grace'] = {
    requiredCommandProgression: 'note is grace',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withCrushLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.hasGraceCrushLine = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note is centralized'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isCentralized.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.isFullMeasure = true
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with breath mark before'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withBreathMarkBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const breathMarkTypeName = regexps.withBreathMarkBefore.match(tokenValues)[0]
      const breathMarkType = breathMarks[breathMarkTypeName]
      lastChordParamsValue.breathMarkBefore = {
        type: breathMarkType
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with breath mark before vertical correction'] = {
    requiredCommandProgression: 'note with breath mark before',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.breathMarkBefore.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with key signature before'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withKeySignatureBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const keySignatureName = regexps.withKeySignatureBefore.match(tokenValues)[0]
      lastChordParamsValue.keySignatureBefore = findKeySignatureThatUserMeant(keySignatureName)
      if (parserState.lastKeySignatureName) {
        parserState.lastKeySignatureName = lastChordParamsValue.keySignatureBefore
        parserState.lastKeySignatureNameForEachLineId += 1
      }
      if (!lastChordParamsValue.clefBefore) {
        lastChordParamsValue.clefBefore = parserState.lastClef[currentNumberOfStaves - 1] || 'treble'
      }
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with clef before'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withClefBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const clefName = regexps.withClefBefore.match(tokenValues)[0]
      const clef = clefs[clefName]
      lastChordParamsValue.clefBefore = clef
      parserState.lastClef[currentNumberOfStaves - 1] = clef
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with clef and key signature before'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withClefAndKeySignatureBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const match = regexps.withClefAndKeySignatureBefore.match(tokenValues)
      const clefName = match[0]
      const clef = clefs[clefName]
      const keySignatureName = match[1]
      const keySignature = findKeySignatureThatUserMeant(keySignatureName)
      lastChordParamsValue.clefBefore = clef
      lastChordParamsValue.keySignatureBefore = keySignature
      parserState.lastClef[currentNumberOfStaves - 1] = clef
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['note with articulation'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withArticulation.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const match = regexps.withArticulation.match(tokenValues)
      const articulationName = articulations[match[0]]
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulation = {
        name: articulationName
      }
      lastChordParamsValue.articulationParams.push(newArticulation)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with turn'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withTurn.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const articulationName = 'turn'
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulation = {
        name: articulationName
      }
      lastChordParamsValue.articulationParams.push(newArticulation)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with mordent'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withMordent.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const articulationName = 'mordent'
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulation = {
        name: articulationName
      }
      lastChordParamsValue.articulationParams.push(newArticulation)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with trill'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withTrill.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const articulationName = 'trill'
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulation = {
        name: articulationName
      }
      lastChordParamsValue.articulationParams.push(newArticulation)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with articulation direction'] = {
    requiredCommandProgression: 'note with articulation',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.direction = parseDirection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with turn direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'note with turn'
  )
  scenarios['note with mordent direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'note with mordent'
  )
  scenarios['note with trill direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'note with trill'
  )
  scenarios['note with articulation above or below'] = {
    requiredCommandProgression: 'note with articulation',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues) &&
        !regexps.staveWithAndWithoutDelimeter.test(
          [
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with turn above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'note with turn'
  )
  scenarios['note with mordent above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'note with mordent'
  )
  scenarios['note with trill above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'note with trill'
  )
  scenarios['note with articulation above or below stave'] = {
    requiredCommandProgression: 'note with articulation',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnderStaveLines(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.direction = parseDirectionByAboveBelowOverUnderStaveLines(tokenValues)
      lastArticulationParamsValue.aboveBelowOverUnderStaveLines = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      return { currentNumberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with turn above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'note with turn'
  )
  scenarios['note with mordent above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'note with mordent'
  )
  scenarios['note with trill above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'note with trill'
  )
  scenarios['note with turn key above or below'] = {
    requiredCommandProgression: 'note with turn',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withOrnamentKeyAboveBelowOverUnder.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      const match = regexps.withOrnamentKeyAboveBelowOverUnder.match(tokenValues)
      const ornamentKeyName = ornamentKeys[match[0]]
      const ornamentKeyPosition = match[1]
      let ornamentKeyPositionValue
      if (ornamentKeyPosition === 'above' || ornamentKeyPosition === 'over') {
        lastArticulationParamsValue.keyAbove = ornamentKeyName
        ornamentKeyPositionValue = 'above'
      } else if (ornamentKeyPosition === 'below' || ornamentKeyPosition === 'under') {
        lastArticulationParamsValue.keyBelow = ornamentKeyName
        ornamentKeyPositionValue = 'below'
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { ornamentKeyPositionValue, currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with mordent key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn key above or below'], 'note with mordent'
  )
  scenarios['note with trill key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn key above or below'], 'note with trill'
  )
  scenarios['note with turn after'] = {
    requiredCommandProgression: 'note with turn',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.after.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.followedAfter = true
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with turn inverted'] = {
    requiredCommandProgression: 'note with turn',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isInverted.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.inverted = true
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with mordent inverted'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn inverted'], 'note with mordent'
  )
  scenarios['note with trill with wave after'] = {
    requiredCommandProgression: 'note with trill',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withWaveAfter.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.withWave = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with articulation vertical correction'] = {
    requiredCommandProgression: 'note with articulation',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with turn vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'note with turn'
  )
  scenarios['note with mordent vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'note with mordent'
  )
  scenarios['note with trill vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'note with trill'
  )
  scenarios['note with chord letter'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withChord.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const chordLetter = regexps.withChord.match(tokenValues)[0]
      lastChordParamsValue.relatedChordLetter = {
        textValue: chordLetter
      }
      if (parserState.lastChordLetterDirection) {
        lastChordParamsValue.relatedChordLetter.direction = parserState.lastChordLetterDirection
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with chord letter direction'] = {
    requiredCommandProgression: 'note with chord letter',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.relatedChordLetter.direction = parseDirection(tokenValues)
      parserState.lastChordLetterDirection = lastChordParamsValue.relatedChordLetter.direction
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with chord letter above or below'] = {
    requiredCommandProgression: 'note with chord letter',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      lastChordParamsValue.relatedChordLetter.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
      parserState.lastChordLetterDirection = lastChordParamsValue.relatedChordLetter.direction
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with chord letter above or below measure'] = {
    requiredCommandProgression: 'note with chord letter above or below',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.measure.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      return { currentNumberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with chord letter vertical correction'] = {
    requiredCommandProgression: 'note with chord letter',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.relatedChordLetter.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with octave sign'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const nextTwoTokens = findNextTokenValuesOnTheLine(
        unitext, currentToken.firstCharIndexOfNextToken, 2
      )
      return regexps.isOctaveOrTwoOctavesHigherOrLower.test(tokenValues) &&
        (nextTwoTokens.indexOf('from') === -1) &&
        (nextTwoTokens.indexOf('starts') === -1) &&
        (nextTwoTokens.indexOf('clef') === -1)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const match = regexps.isOctaveOrTwoOctavesHigherOrLower.match(tokenValues)
      const isTwoOctaves = match[0]
      const octaveSignMainValue = isTwoOctaves ? '15' : '8'
      const octaveSignUpperValue = isTwoOctaves ? 'ma' : 'va'
      const octaveSignDirection = (match[1] === 'up' || match[1] === 'higher') ? 'up' : 'down'
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulation = {
        name: 'octaveSign',
        aboveBelowOverUnderStaveLines: true,
        direction: octaveSignDirection,
        textValue: octaveSignMainValue,
        subTextValue: octaveSignUpperValue
      }
      lastChordParamsValue.articulationParams.push(newArticulation)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with octave sign vertical correction'] = {
    requiredCommandProgression: 'note with octave sign',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with tremolo'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withTremolo.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tremoloParams = {
        type: 'single'
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with tremolo with next'] = {
    requiredCommandProgression: 'note with tremolo',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withNext.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tremoloParams.type = 'withNext'
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with tremolo number of strokes'] = {
    requiredCommandProgression: 'note with tremolo',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isNumberOfStrokes(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.tremoloParams.customNumberOfTremoloStrokes = parseNumberOfStrokes(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['repeat note'] = {
    requiredCommandProgression: 'note',
    prohibitedCommandProgressions: [ 'empty line after note' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.repeat.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      parserState.numberOfSimileMarks += 1
      lastChordParamsValue.simileMark = {
        refId: `simile-mark-${parserState.numberOfSimileMarks}`,
        count: 1,
        finish: true
      }
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      addSimileUnitsToPageSchema(parserState, lastChordParamsValue.simileMark, currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits)
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['repeat note via simile'] = {
    requiredCommandProgression: 'repeat note',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.viaSimile.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['repeat note number of times'] = {
    requiredCommandProgression: 'repeat note',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isNumberOfTimes(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.simileMark.count = parseNumberOfTimes(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['repeat note vertical correction'] = {
    requiredCommandProgression: 'repeat note',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.simileMark.yCorrection = parseVerticalCorrection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with dynamic'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withDynamic.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const dynamicTextValue = regexps.withDynamic.match(tokenValues)[0]
      lastChordParamsValue.articulationParams = lastChordParamsValue.articulationParams || []
      const newArticulationParams = {
        name: 'dynamicMark',
        textValue: dynamicTextValue
      }
      lastChordParamsValue.articulationParams.push(newArticulationParams)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with dynamic above or below'] = {
    requiredCommandProgression: 'note with dynamic',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues) &&
        !regexps.staveWithAndWithoutDelimeter.test(
          [
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.direction = parseDirectionByAboveBelowOverUnder(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with dynamic above or below stave'] = {
    requiredCommandProgression: 'note with dynamic',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnderStaveLines(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.direction = parseDirectionByAboveBelowOverUnderStaveLines(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      return { currentNumberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with dynamic direction'] = {
    requiredCommandProgression: 'note with dynamic',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.direction = parseDirection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note dynamic vertical correction'] = {
    requiredCommandProgression: 'note with dynamic',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastArticulationParamsValue = getLastArticulationParams(lastChordParamsValue)
      lastArticulationParamsValue.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfArticulations = lastChordParamsValue.articulationParams.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with lyrics'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withLyrics.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.relatedLyrics = lastChordParamsValue.relatedLyrics || []
      lastChordParamsValue.relatedLyrics.push({})
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfLyrics = lastChordParamsValue.relatedLyrics.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with lyrics text value'] = {
    requiredCommandProgression: 'note with lyrics',
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.textValue.test(tokenValues, false, true)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastLyricValue = getLastLyric(lastChordParamsValue)
      const textValue = regexps.textValue.match(tokenValues)[0]
      lastLyricValue.textValue = textValue
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfLyrics = lastChordParamsValue.relatedLyrics.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics }
    }
  }
  scenarios['note with lyrics followed by dash'] = {
    requiredCommandProgression: 'note with lyrics',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.followedByDash.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastLyricValue = getLastLyric(lastChordParamsValue)
      lastLyricValue.dashAfter = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfLyrics = lastChordParamsValue.relatedLyrics.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics }
    }
  }
  scenarios['note with lyrics where underscore starts'] = {
    requiredCommandProgression: 'note with lyrics',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.underscoreStarts.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastLyricValue = getLastLyric(lastChordParamsValue)
      lastLyricValue.underscoreStarts = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfLyrics = lastChordParamsValue.relatedLyrics.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics }
    }
  }
  scenarios['note with lyrics where underscore finishes'] = {
    requiredCommandProgression: 'note with lyrics',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.underscoreFinishes.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastLyricValue = getLastLyric(lastChordParamsValue)
      lastLyricValue.underscoreFinishes = true
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfLyrics = lastChordParamsValue.relatedLyrics.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics }
    }
  }
  scenarios['note with lyrics with vertical correction'] = {
    requiredCommandProgression: 'note with lyrics',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const lastLyricValue = getLastLyric(lastChordParamsValue)
      lastLyricValue.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      const currentNumberOfLyrics = lastChordParamsValue.relatedLyrics.length
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics }
    }
  }
  scenarios['note with pedal'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withPedal.test(tokenValues) &&
        !regexps.release.test(
          [
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.numberOfPedalMarks += 1
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark = {
        key: `pedal-${parserState.numberOfPedalMarks}`,
        textValue: 'Ped.',
        start: true,
        finish: true
      }
      parserState[`lastStartPedalMark-${parserState.numberOfPedalMarks}`] = lastChordParamsValue.pedalMark
      if (regexps.withSustain.test(tokenValues)) {
        lastChordParamsValue.pedalMark.withBrackets = true
        lastChordParamsValue.pedalMark.finish = false
      }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with pedal under'] = {
    requiredCommandProgression: 'note with pedal',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.belowUnder.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with pedal under stave index'] = {
    requiredCommandProgression: 'note with pedal under',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      lastChordParamsValue.pedalMark.underStaveIndex = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures, staveIndex }
    },
    itIsNewCommandProgressionFromLevel: 3
  }
  scenarios['note with pedal vertical correction'] = {
    requiredCommandProgression: 'note with pedal',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.yCorrection = parseVerticalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with pedal text'] = {
    requiredCommandProgression: 'note with pedal',
    prohibitedCommandProgressions: [ 'note with pedal opens with bracket', 'note with pedal before|after' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.text.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.textValue = regexps.text.match(tokenValues)[0]
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with pedal opens with bracket'] = {
    requiredCommandProgression: 'note with pedal',
    prohibitedCommandProgressions: [ 'note with pedal text', 'note with pedal before|after' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.opensWithBracket.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.textValue = undefined
      lastChordParamsValue.pedalMark.withBrackets = true
      lastChordParamsValue.pedalMark.finish = false
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with pedal before|after'] = {
    requiredCommandProgression: 'note with pedal',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.afterBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const pedalPositionToTheChord = regexps.afterBefore.match(tokenValues)[0]
      if (pedalPositionToTheChord === 'after') {
        lastChordParamsValue.pedalMark.afterUnit = true
      } else if (pedalPositionToTheChord === 'before') {
        lastChordParamsValue.pedalMark.beforeUnit = true
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with variable peak'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withVariablePeak.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (parserState[`lastStartPedalMark-${parserState.numberOfPedalMarks}`]) {
        parserState[`lastStartPedalMark-${parserState.numberOfPedalMarks}`].finish = false
        parserState[`lastStartPedalMark-${parserState.numberOfPedalMarks}`].withBrackets = true
      }
      lastChordParamsValue.pedalMark = {
        key: `pedal-${parserState.numberOfPedalMarks}`,
        variablePeak: true
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with variable peak before|after'] = {
    requiredCommandProgression: 'note with variable peak',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.afterBefore.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const variablePeakPositionToTheChord = regexps.afterBefore.match(tokenValues)[0]
      if (variablePeakPositionToTheChord === 'after') {
        lastChordParamsValue.pedalMark.afterUnit = true
      } else if (variablePeakPositionToTheChord === 'before') {
        lastChordParamsValue.pedalMark.beforeUnit = true
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with variable peak text'] = {
    requiredCommandProgression: 'note with variable peak',
    prohibitedCommandProgressions: [ 'note with variable peak before|after' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.text.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.textValue = regexps.text.match(tokenValues)[0]
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with release'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withRelease.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      if (parserState[`lastStartPedalMark-${parserState.numberOfPedalMarks}`]) {
        parserState[`lastStartPedalMark-${parserState.numberOfPedalMarks}`].finish = false
      }
      lastChordParamsValue.pedalMark = {
        key: `pedal-${parserState.numberOfPedalMarks}`,
        release: true,
        finish: true
      }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['note with release before|after'] = {
    requiredCommandProgression: 'note with release',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.afterBefore.test(tokenValues) &&
        !regexps.afterMeasure.test(
          [
            currentToken.value,
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      const releasePositionToTheChord = regexps.afterBefore.match(tokenValues)[0]
      if (releasePositionToTheChord === 'after') {
        lastChordParamsValue.pedalMark.afterUnit = true
      } else if (releasePositionToTheChord === 'before') {
        lastChordParamsValue.pedalMark.beforeUnit = true
      }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with release bracket'] = {
    requiredCommandProgression: 'note with release',
    prohibitedCommandProgressions: [ 'note with release before|after' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.bracket.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.withBrackets = true
      lastChordParamsValue.pedalMark.withBracketClosure = true
      lastChordParamsValue.pedalMark.release = false
      lastChordParamsValue.pedalMark.finish = true
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with release at the end of measure'] = {
    requiredCommandProgression: 'note with release',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.atTheEndOfTheMeasure.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.atEndOfMeasure = true
      lastChordParamsValue.pedalMark.finish = true
      if (lastChordParamsValue.pedalMark.withBrackets) {
        lastChordParamsValue.pedalMark.withBracketClosure = true
        lastChordParamsValue.pedalMark.tillEndOfMeasure = true
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      return { currentNumberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['note with release after measure'] = {
    requiredCommandProgression: 'note with release',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.afterMeasure.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.pedalMark.atEndOfMeasure = true
      lastChordParamsValue.pedalMark.tillEndOfMeasure = true
      lastChordParamsValue.pedalMark.release = false
      lastChordParamsValue.pedalMark.withBrackets = true
      lastChordParamsValue.pedalMark.withBracketClosure = false
      lastChordParamsValue.pedalMark.finish = false
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      return { currentNumberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 2
  },
  scenarios['note with horizontal correction'] = {
    requiredCommandProgression: 'note',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isHorizontalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      const lastVoiceParamsValue = getLastVoiceParams(lastStaveParamsValue)
      const lastChordParamsValue = findLastNonSimileChordParams(lastVoiceParamsValue)
      lastChordParamsValue.relatedXCorrection = parseHorizontalCorrection(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      const currentNumberOfStaves = lastMeasureParamsValue.stavesParams.length
      const currentNumberOfVoices = lastStaveParamsValue.voicesParams.length
      const currentNumberOfUnits = parserState.numberOfUnitsBeforeFinishingDeclaringNewOne
      return { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

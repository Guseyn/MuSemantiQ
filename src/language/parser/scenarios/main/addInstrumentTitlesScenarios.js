'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import getLastInstrumentTitleParam from '#msq/language/parser/scenarios/page-schema/getLastInstrumentTitleParam.js'
import parseStaveIndexByTokens from '#msq/language/parser/scenarios/token/parseStaveIndexByTokens.js'
import isStaveIndex from '#msq/language/parser/scenarios/token/isStaveIndex.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findNextTokenValuesOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValuesOnTheLine.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['instrument title'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.instrumentTitle.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'instrumentTitlesParams', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.instrumentTitlesParams = lastMeasureParamsValue.instrumentTitlesParams || []
      parserState.lastInstrumentTitlesParamsForEachLine = parserState.lastInstrumentTitlesParamsForEachLine || []
      const instrumentTitle = regexps.instrumentTitle.match(tokenValues)[0]
      lastMeasureParamsValue.instrumentTitlesParams.push(
        {
          value: instrumentTitle,
          staveNumber: 0,
          staveStartNumber: 0,
          staveEndNumber: 0
        }
      )
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      const numberOfInstrumentTitles = lastMeasureParamsValue.instrumentTitlesParams.length
      return { numberOfMeasures, numberOfInstrumentTitles }
    },
    itIsNewCommandProgressionFromLevel: 0,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title for'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    prohibitedCommandProgressions: [ 'instrument title for each line', 'instrument title for lines below' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.for.test(tokenValues) &&
      !regexps.forEach.test(
        [
          currentToken.value,
          findNextTokenValueOnTheLine(
            unitext,
            currentToken.firstCharIndexOfNextToken
          )
        ]
      ) &&
      !regexps.forLines.test(
        [
          currentToken.value,
          findNextTokenValueOnTheLine(
            unitext,
            currentToken.firstCharIndexOfNextToken
          )
        ]
      ) &&
      !regexps.forLinesBelow.test(
        [
          currentToken.value,
          findNextTokenValuesOnTheLine(
            unitext,
            currentToken.firstCharIndexOfNextToken,
            2
          )
        ]
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title between'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    prohibitedCommandProgressions: [ 'instrument title for each line', 'instrument title for lines below' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.between.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title for stave index'] = {
    requiredCommandProgression: 'instrument title for',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitleParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex = lastMeasureParamsValue.instrumentTitlesParams.findIndex(param => ((param.staveStartNumber === staveIndex) || (param.staveEndNumber === staveIndex)))
      if (
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== -1) &&
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== (lastMeasureParamsValue.instrumentTitlesParams.length - 1))
      ) {
        lastMeasureParamsValue.instrumentTitlesParams.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex, 1)
      }
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex = parserState.lastInstrumentTitlesParamsForEachLine.findIndex(param => ((param.staveStartNumber === staveIndex) || (param.staveEndNumber === staveIndex)))
      if (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex !== -1) {
        parserState.lastInstrumentTitlesParamsForEachLine.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex, 1)
      }
      lastInstrumentTitleParamValue.staveNumber = staveIndex
      lastInstrumentTitleParamValue.staveStartNumber = staveIndex
      lastInstrumentTitleParamValue.staveEndNumber = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures, staveIndex }
    },
    itIsNewCommandProgressionFromLevel: 2,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title between stave index 1'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['instrument title for stave index'],
    'instrument title between'
  )
  scenarios['instrument title between stave index 1 followed by and'] = {
    requiredCommandProgression: 'instrument title between stave index 1',
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.and.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title between stave index 2'] = {
    requiredCommandProgression: 'instrument title between stave index 1 followed by and',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitleParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex = lastMeasureParamsValue.instrumentTitlesParams.findIndex(param => (param.staveEndNumber === staveIndex))
      if (
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== -1) &&
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== (lastMeasureParamsValue.instrumentTitlesParams.length - 1))
      ) {
        lastMeasureParamsValue.instrumentTitlesParams.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex, 1)
      }
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex = parserState.lastInstrumentTitlesParamsForEachLine.findIndex(param => (param.staveEndNumber === staveIndex))
      if (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex !== -1) {
        parserState.lastInstrumentTitlesParamsForEachLine.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex, 1)
      }
      lastInstrumentTitleParamValue.staveEndNumber = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures, staveIndex }
    },
    itIsNewCommandProgressionFromLevel: 2,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title for each line'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forEachLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitlesParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      lastInstrumentTitlesParamValue.forEachLineId = parserState.lastInstrumentTitlesParamsForEachLineId
      parserState.lastInstrumentTitlesParamsForEachLine.push(lastInstrumentTitlesParamValue)
      const lastInstrumentTitlesParamsForEachLineId = parserState.lastInstrumentTitlesParamsForEachLineId
      parserState.lastInstrumentTitlesParamsForEachLineId += 1
      return { lastInstrumentTitlesParamsForEachLineId }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['instrument title for lines below'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forLinesBelow.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitlesParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      lastInstrumentTitlesParamValue.forEachLineId = parserState.lastInstrumentTitlesParamsForEachLineId
      parserState.lastInstrumentTitlesParamsForEachLine.push(lastInstrumentTitlesParamValue)
      const lastInstrumentTitlesParamsForEachLineId = parserState.lastInstrumentTitlesParamsForEachLineId
      parserState.lastInstrumentTitlesParamsForEachLineId += 1
      return { lastInstrumentTitlesParamsForEachLineId }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

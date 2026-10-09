'use strict'

import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['repeat sign'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.repeatSign.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      if (!lastMeasureParamsValue.repeatDotsMarkAtTheStart && !lastMeasureParamsValue.repeatDotsMarkAtTheEnd) {
        initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'repeatDotsMarkAtTheStart', parserState)
        const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
        lastMeasureParamsValue.repeatDotsMarkAtTheStart = true
        lastMeasureParamsValue.repeatDotsMarkAtTheEnd = true
      }
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['repeat sign at the start'] = {
    requiredCommandProgression: 'repeat sign',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.atTheStart.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'repeatDotsMarkAtTheStart', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.repeatDotsMarkAtTheStart = true
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['repeat sign at the end'] = {
    requiredCommandProgression: 'repeat sign',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.atTheEnd.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'repeatDotsMarkAtTheEnd', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.repeatDotsMarkAtTheEnd = true
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

'use strict'

import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['measure rest'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.measureRest.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'isMeasureRest', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.isMeasureRest = true
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 0,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['multi measure rest count'] = {
    requiredCommandProgression: 'measure rest',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const optionsForMeasureRest = replaceWordsWithNumbers(tokenValues)
      return regexps.multiMeasureRestCount.test(optionsForMeasureRest)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const optionsForMeasureRest = replaceWordsWithNumbers(tokenValues)
      const multiMeasureRestCount = regexps.multiMeasureRestCount.match(optionsForMeasureRest)[0]
      getLastMeasureParams(parserState.pageSchema).multiMeasureRestCount = `${multiMeasureRestCount}`
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

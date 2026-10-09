'use strict'

import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import openingBarLines from '#msq/language/parser/scenarios/static-objects/openingBarLines.js'
import closingBarLines from '#msq/language/parser/scenarios/static-objects/closingBarLines.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['no start bar line'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.noStartBarLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'withoutStartBarLine', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.withoutStartBarLine = true
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['opening bar line'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.openingBarLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'openingBarLineName', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const openingBarLineName = regexps.openingBarLine.match(tokenValues)[0]
      const openingBarLine = openingBarLines[openingBarLineName]
      lastMeasureParamsValue.openingBarLineName = openingBarLine
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['closing bar line'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.closingBarLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'closingBarLineName', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const closingBarLineName = regexps.closingBarLine.match(tokenValues)[0]
      const closingBarLine = closingBarLines[closingBarLineName]
      lastMeasureParamsValue.closingBarLineName = closingBarLine
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
}

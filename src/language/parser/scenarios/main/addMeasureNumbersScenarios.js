'use strict'

import isDirection from '#msq/language/parser/scenarios/token/isDirection.js'
import parseDirection from '#msq/language/parser/scenarios/token/parseDirection.js'
import isAboveBelowOverUnder from '#msq/language/parser/scenarios/token/isAboveBelowOverUnder.js'
import parseDirectionByAboveBelowOverUnder from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnder.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import applicationOfMeasureNumbers from '#msq/language/parser/scenarios/static-objects/applicationOfMeasureNumbers.js'

export default function (scenarios) {
  scenarios['measure numbers'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.measureNumbers.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.pageSchema.showMeasureNumbers = 'all'
      parserState.pageSchema.directionOfMeasureNumbers = 'up'
    },
    itIsNewCommandProgressionFromLevel: 0,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['direction of measure numbers'] = {
    requiredCommandProgression: 'measure numbers',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.pageSchema.directionOfMeasureNumbers = parseDirection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['measure numbers above or below'] = {
    requiredCommandProgression: 'measure numbers',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.pageSchema.directionOfMeasureNumbers = parseDirectionByAboveBelowOverUnder(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['measure numbers above or below measures'] = {
    requiredCommandProgression: 'measure numbers above or below',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.measures.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['application of measure numbers'] = {
    requiredCommandProgression: 'measure numbers',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.applicationOfMeasureNumbers.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const measureNumbersApplicationName = regexps.applicationOfMeasureNumbers.match(tokenValues)[0]
      const measureNumbersApplication = applicationOfMeasureNumbers[measureNumbersApplicationName]
      parserState.pageSchema.showMeasureNumbers = measureNumbersApplication
      return { measureNumbersApplication }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

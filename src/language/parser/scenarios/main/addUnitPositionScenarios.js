'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/main/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios, requiredCommandProgression, commandProgressionLevel = 2, allowedCoordinates) {
  scenarios[`unit position (${requiredCommandProgression})`] = {
    requiredCommandProgression,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      return regexps.unitPosition.test(tokensWithNumbersInsteadOfWords)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      const unitPosition = regexps.unitPosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
      parserState.lastMentionedUnitPosition = unitPosition
    },
    itIsNewCommandProgressionFromLevel: commandProgressionLevel
  }
  scenarios[`position of unit (${requiredCommandProgression})`] = {
    requiredCommandProgression,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      return regexps.positionOfUnit.test(tokensWithNumbersInsteadOfWords)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      const unitPosition = regexps.positionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
      parserState.lastMentionedUnitPosition = unitPosition
    },
    itIsNewCommandProgressionFromLevel: commandProgressionLevel
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, requiredCommandProgression, [], commandProgressionLevel, false, allowedCoordinates)
}

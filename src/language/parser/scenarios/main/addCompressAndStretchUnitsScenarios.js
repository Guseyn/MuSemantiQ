'use strict'

import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['compress units by n times'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.compressUnitsByNTimes.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastMentionedUnitsCompression = regexps.compressUnitsByNTimes.match(
        replaceWordsWithNumbers(tokenValues)
      )[0]
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedUnitsCompressionWasForSpecificLine) {
        parserState.lastMentionedUnitsCompressionWasForSpecificLine = false
        parserState.lastMentionedUnitsCompression = undefined
      } else {
        parserState.pageSchema.compressUnitsByNTimes = parserState.lastMentionedUnitsCompression
        parserState.lastMentionedUnitsCompression = undefined
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['compress units by n times in line position'] = {
    requiredCommandProgression: 'compress units by n times',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.unitLinePosition.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      const unitLinePosition = regexps.unitLinePosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
      parserState.pageSchema.compressUnitsByNTimesInLines = parserState.pageSchema.compressUnitsByNTimesInLines || []
      parserState.pageSchema.compressUnitsByNTimesInLines[unitLinePosition] = parserState.lastMentionedUnitsCompression
      parserState.lastMentionedUnitsCompressionWasForSpecificLine = true
      return { unitLinePosition }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['compress units by n times in position of line'] = {
    requiredCommandProgression: 'compress units by n times',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.linePositionOfUnit.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      const unitLinePosition = regexps.linePositionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
      parserState.pageSchema.compressUnitsByNTimesInLines = parserState.pageSchema.compressUnitsByNTimesInLines || []
      parserState.pageSchema.compressUnitsByNTimesInLines[unitLinePosition] = parserState.lastMentionedUnitsCompression
      parserState.lastMentionedUnitsCompressionWasForSpecificLine = true
      return { unitLinePosition }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['stretch units by n times'] = {
    startsOnNewLine: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.stretchUnitsByNTimes.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastMentionedUnitsStretching = regexps.stretchUnitsByNTimes.match(
        replaceWordsWithNumbers(tokenValues)
      )[0]
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedUnitsStretchingWasForSpecificLine) {
        parserState.lastMentionedUnitsStretchingWasForSpecificLine = false
        parserState.lastMentionedUnitsStretching = undefined
      } else {
        parserState.pageSchema.stretchUnitsByNTimes = parserState.lastMentionedUnitsStretching
        parserState.lastMentionedUnitsStretching = undefined
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['stretch units by n times in line'] = {
    requiredCommandProgression: 'stretch units by n times',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.unitLinePosition.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      const unitLinePosition = regexps.unitLinePosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
      parserState.pageSchema.stretchUnitsByNTimesInLines = parserState.pageSchema.stretchUnitsByNTimesInLines || []
      parserState.pageSchema.stretchUnitsByNTimesInLines[unitLinePosition] = parserState.lastMentionedUnitsStretching
      parserState.lastMentionedUnitsStretchingWasForSpecificLine = true
      return { unitLinePosition }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['stretch units by n times in position of line'] = {
    requiredCommandProgression: 'stretch units by n times',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.linePositionOfUnit.test(
        replaceWordsWithNumbers(tokenValues)
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
      const unitLinePosition = regexps.linePositionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
      parserState.pageSchema.stretchUnitsByNTimesInLines = parserState.pageSchema.stretchUnitsByNTimesInLines || []
      parserState.pageSchema.stretchUnitsByNTimesInLines[unitLinePosition] = parserState.lastMentionedUnitsStretching
      parserState.lastMentionedUnitsStretchingWasForSpecificLine = true
      return { unitLinePosition }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

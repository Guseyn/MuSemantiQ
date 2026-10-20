'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'

export default function (
  scenarios,
  requiredCommandProgression,
  prohibitedCommandProgressions = [],
  commandProgressionLevel = 2,
  forConnection = false,
  allowedCoordinates = { line: true, measure: true, stave: true, voice: true }
) {
  if (allowedCoordinates.line) {
    scenarios[`line position (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.unitLinePosition.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitLinePosition = regexps.unitLinePosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionPageLinePosition = unitLinePosition
        }
        parserState.lastMentionedPageLinePosition = unitLinePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
    scenarios[`position of line (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.linePositionOfUnit.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitLinePosition = regexps.linePositionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionPageLinePosition = unitLinePosition
        }
        parserState.lastMentionedPageLinePosition = unitLinePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
  }
  if (allowedCoordinates.measure) {
    scenarios[`measure position (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.unitMeasurePosition.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitMeasurePosition = regexps.unitMeasurePosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionMeasurePosition = unitMeasurePosition
        }
        parserState.lastMentionedMeasurePosition = unitMeasurePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
    scenarios[`position of measure (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.measurePositionOfUnit.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitMeasurePosition = regexps.measurePositionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionMeasurePosition = unitMeasurePosition
        }
        parserState.lastMentionedMeasurePosition = unitMeasurePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
  }
  if (allowedCoordinates.stave) {
    scenarios[`stave position (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.unitStavePosition.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitStavePosition = regexps.unitStavePosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionStavePosition = unitStavePosition
        }
        parserState.lastMentionedStavePosition = unitStavePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
    scenarios[`position of stave (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.stavePositionOfUnit.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitStavePosition = regexps.stavePositionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionStavePosition = unitStavePosition
        }
        parserState.lastMentionedStavePosition = unitStavePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
  }
  if (allowedCoordinates.voice) {
    scenarios[`voice position (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.unitVoicePosition.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitVoicePosition = regexps.unitVoicePosition.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionVoicePosition = unitVoicePosition
        }
        parserState.lastMentionedVoicePosition = unitVoicePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
    scenarios[`position of voice (${requiredCommandProgression})`] = {
      requiredCommandProgression,
      prohibitedCommandProgressions,
      considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
      onTheSameLineAsPrevScenario: true,
      condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        if (forConnection && (parserState.lastMentionedUnitPosition !== undefined)) {
          return false
        }
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        return regexps.voicePositionOfUnit.test(tokensWithNumbersInsteadOfWords)
      },
      action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
        const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
        const unitVoicePosition = regexps.voicePositionOfUnit.match(tokensWithNumbersInsteadOfWords)[0] * 1 - 1
        if (forConnection) {
          parserState.lastMentionedConnectionVoicePosition = unitVoicePosition
        }
        parserState.lastMentionedVoicePosition = unitVoicePosition
      },
      itIsNewCommandProgressionFromLevel: commandProgressionLevel
    }
  }
}

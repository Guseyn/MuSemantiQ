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
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.unitsHighlight, (match) => {
            return `<span class="cuph" ref-id="all-units">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="all-units">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.unitsHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
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
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
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
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="clpph" ref-id="${unitLinePosition}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph">${p4}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
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
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="clpph" ref-id="${unitLinePosition}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph">${p4}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
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
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.unitsHighlight, (match) => {
            return `<span class="cuph" ref-id="all-units">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="all-units">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.unitsHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
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
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
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
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="clpph" ref-id="line-${unitLinePosition + 1}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph">${p4}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
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
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="clpph" ref-id="line-${unitLinePosition + 1}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph">${p4}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}

'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios, requiredCommandProgression, commandProgressionLevel = 2, allowedCoordinates) {
  scenarios[`unit position (${requiredCommandProgression})`] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="cuph" ref-id="">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="cupph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
      state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
        state.highlightsHtmlBuffer.length - 1
      )
    }
  }
  scenarios[`position of unit (${requiredCommandProgression})`] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="cuph" ref-id="">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="cupph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
      state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
        state.highlightsHtmlBuffer.length - 1
      )
    }
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, requiredCommandProgression, [], commandProgressionLevel, false, allowedCoordinates)
}

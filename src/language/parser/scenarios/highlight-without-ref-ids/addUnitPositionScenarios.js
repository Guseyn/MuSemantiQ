'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios, requiredCommandProgression, commandProgressionLevel = 2, allowedCoordinates) {
  scenarios[`unit position (${requiredCommandProgression})`] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="cuph">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
    }
  }
  scenarios[`position of unit (${requiredCommandProgression})`] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="cuph">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
      )
    }
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, requiredCommandProgression, [], commandProgressionLevel, false, allowedCoordinates)
}

'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

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
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="clpph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
    scenarios[`position of line (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="clpph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
  }
  if (allowedCoordinates.measure) {
    scenarios[`measure position (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cmph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="cmpph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
    scenarios[`position of measure (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cmph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="cmpph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
  }
  if (allowedCoordinates.stave) {
    scenarios[`stave position (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="csph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="cspph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
    scenarios[`position of stave (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="csph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="cspph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
  }
  if (allowedCoordinates.voice) {
    scenarios[`voice position (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cvph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="cvpph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
    scenarios[`position of voice (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cvph" ref-id="">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="cvpph" ref-id="">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
        if (forConnection) {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection.push(
            state.highlightsHtmlBuffer.length - 1
          )
        } else {
          state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            state.highlightsHtmlBuffer.length - 1
          )
        }
      }
    }
  }
}

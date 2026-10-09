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
            return `${p1 || ''}<span class="clph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
    scenarios[`position of line (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="clph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
  }
  if (allowedCoordinates.measure) {
    scenarios[`measure position (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cmph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
    scenarios[`position of measure (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cmph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
  }
  if (allowedCoordinates.stave) {
    scenarios[`stave position (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="csph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
    scenarios[`position of stave (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="csph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
  }
  if (allowedCoordinates.voice) {
    scenarios[`voice position (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cvph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
    scenarios[`position of voice (${requiredCommandProgression})`] = {
      action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
        const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
        const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
          regexps.positionPreposition, (match, p1, p2, p3, p4) => {
            return `${p1 || ''}<span class="cvph">${p4}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}`
        )
      }
    }
  }
}

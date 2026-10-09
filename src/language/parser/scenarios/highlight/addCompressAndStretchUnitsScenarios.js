'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['compress units by n times'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.unitsHighlight, (match) => {
          return `<span class="cuph" ref-id="all-units">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="all-units">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['compress units by n times in line position'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { unitLinePosition } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="clpph" ref-id="${unitLinePosition}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
      )
    }
  }
  scenarios['compress units by n times in position of line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { unitLinePosition } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="clpph" ref-id="${unitLinePosition}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
      )
    }
  }
  scenarios['stretch units by n times'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.unitsHighlight, (match) => {
          return `<span class="cuph" ref-id="all-units">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="all-units">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['stretch units by n times in line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { unitLinePosition } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="clpph" ref-id="line-${unitLinePosition + 1}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
      )
    }
  }
  scenarios['stretch units by n times in position of line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { unitLinePosition } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll('all-units', `all-units-on-line-${unitLinePosition + 1}`)
      const tokensWithNumbersInsteadOfWordsWithTrimmedEnd = joinedTokenValuesWithRealDelimiters.trimEnd()
      const tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition = tokensWithNumbersInsteadOfWordsWithTrimmedEnd.replace(
        regexps.positionPreposition, (match, p1, p2, p3, p4) => {
          return `${p1 || ''}<span class="clph" ref-id="line-${unitLinePosition + 1}">${p4}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="clpph" ref-id="line-${unitLinePosition + 1}">${tokensWithNumbersInsteadOfWordsWithTrimmedEndWithHighlightedPosition}</span>${joinedTokenValuesWithRealDelimiters.slice(tokensWithNumbersInsteadOfWordsWithTrimmedEnd.length)}</span>`
      )
    }
  }
}

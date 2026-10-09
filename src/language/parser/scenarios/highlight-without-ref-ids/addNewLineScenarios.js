'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['new'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.newHighlight, (match) => {
          return `<span class="clph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimitersWithHighlightedElement)
    }
  }
  scenarios['new line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.lineHighlight, (match) => {
          return `<span class="clph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimitersWithHighlightedElement)
    }
  }
}

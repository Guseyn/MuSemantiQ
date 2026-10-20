'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['clef'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.clefHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
}

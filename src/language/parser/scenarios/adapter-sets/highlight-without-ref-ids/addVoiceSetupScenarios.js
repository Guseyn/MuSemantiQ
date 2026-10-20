'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['voice'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.voiceHighlight, (match) => {
          return `<span class="cvph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
}

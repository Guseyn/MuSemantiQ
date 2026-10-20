'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['measure fermata'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.fermataHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure fermata at the end'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.atTheEndHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
}

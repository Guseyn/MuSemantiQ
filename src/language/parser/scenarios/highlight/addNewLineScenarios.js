'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['new'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.newHighlight, (match) => {
          return `<span class="clph" ref-id="">${match}`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['new line'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll('ref-id=""', `ref-id="line-${parserState.numberOfPageLines}"`)
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.lineHighlight, (match) => {
          return `${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    }
  }
}

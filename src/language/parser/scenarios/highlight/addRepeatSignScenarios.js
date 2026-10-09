'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['repeat sign'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withRepeatSignHighlight, (match) => {
          return `<span class="eh" ref-id="">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { numberOfMeasures } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 2] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 2].replaceAll(
        'ref-id=""', `ref-id="repeat-sign-${numberOfMeasures}"`
      )
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll(
        'ref-id=""', `ref-id="repeat-sign-${numberOfMeasures}"`
      )
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['repeat sign at the start'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.atTheStartHighlight, (match) => {
          return `<span class="th" ref-id="repeat-sign-at-the-start-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="repeat-sign-at-the-start-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['repeat sign at the end'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.atTheEndHighlight, (match) => {
          return `<span class="th" ref-id="repeat-sign-at-the-end-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="repeat-sign-at-the-end-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

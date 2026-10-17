'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, numberOfStaves } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.staveHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="csph" ref-id="stave-lines-${numberOfMeasures}-${numberOfStaves}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stave-lines-${numberOfMeasures}-${numberOfStaves}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['stave with clef'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, currentNumberOfStaves } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.clefHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh" ref-id="clef-${numberOfMeasures}-${currentNumberOfStaves}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="clef-${numberOfMeasures}-${currentNumberOfStaves}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

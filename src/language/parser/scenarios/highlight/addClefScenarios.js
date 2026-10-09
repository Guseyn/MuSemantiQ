'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['clef'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, currentNumberOfStaves } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.clefHighlight, (match) => {
          return `<span class="eh" ref-id="clef-${numberOfMeasures}-${currentNumberOfStaves}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="clef-${numberOfMeasures}-${currentNumberOfStaves}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

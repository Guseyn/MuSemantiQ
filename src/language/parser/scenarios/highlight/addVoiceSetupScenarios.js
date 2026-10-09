'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['voice'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, numberOfStaves, numberOfVoices } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.voiceHighlight, (match) => {
          return `<span class="cvph" ref-id="voice-${numberOfMeasures}-${numberOfStaves}-${numberOfVoices}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="voice-${numberOfMeasures}-${numberOfStaves}-${numberOfVoices}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['simile of previous measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.simileHighlight, (match) => {
          return `<span class="eh" ref-id="simile-${numberOfMeasures}">${match}</span>`
        }
      ).replace(
        regexps.previousMeasureHighlight, (match) => {
          return `<span class="cmph" ref-id="simile-prev-measure-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['simile of two previous measures'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.simileHighlight, (match) => {
          return `<span class="eh" ref-id="simile-${numberOfMeasures}">${match}</span>`
        }
      ).replace(
        regexps.twoPreviousMeasuresHighlight, (match) => {
          return `<span class="cmph" ref-id="simile-two-prev-measures-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['simile count for previous measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.numberHighlight, (match) => {
          return `<span class="cnh" ref-id="simile-count-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-count-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['simile count for two previous measures'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.numberHighlight, (match) => {
          return `<span class="cnh" ref-id="simile-count-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-count-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
}

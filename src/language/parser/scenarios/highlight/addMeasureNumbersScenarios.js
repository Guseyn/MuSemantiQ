'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['measure numbers'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureNumbersHighlight, (match) => {
          return `<span class="eh" ref-id="measure-numbers">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-numbers">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['direction of measure numbers'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['measure numbers above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="every-measure">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['measure numbers above or below measures'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measuresHighlight, (match) => {
          return `<span class="cmph" ref-id="every-measure">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="every-measure">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['application of measure numbers'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { measureNumbersApplication } }) => {
      let joinedTokenValuesWithRealDelimitersWithHighlightedElement
      if (measureNumbersApplication === 'first&last') {
        joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.applicationOfMeasureNumbersHighlight, (match) => {
            return `<span class="cmph" ref-id="first-or-last-measure">${match}</span>`
          }
        )
      } else if (measureNumbersApplication === 'first') {
        joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.applicationOfMeasureNumbersHighlight, (match) => {
            return `<span class="cmph" ref-id="first-measure">${match}</span>`
          }
        )
      } else if (measureNumbersApplication === 'last') {
        joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.applicationOfMeasureNumbersHighlight, (match) => {
            return `<span class="cmph" ref-id="last-measure">${match}</span>`
          }
        )
      } else {
        joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.applicationOfMeasureNumbersHighlight, (match) => {
            return `<span class="cmph" ref-id="every-measure">${match}</span>`
          }
        )
      }
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-numbers">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

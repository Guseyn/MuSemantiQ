'use strict'

import regexps, { replaceMany } from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['simile of previous measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = replaceMany(joinedTokenValuesWithRealDelimiters, [
        [ regexps.simileHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
        ],
        [ regexps.previousMeasureHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
        ]
      ])
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['simile of two previous measures'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = replaceMany(joinedTokenValuesWithRealDelimiters, [
        [ regexps.simileHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
        ],
        [ regexps.twoPreviousMeasuresHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
        ]
      ])
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['simile count for previous measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = regexps.numberHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="cnh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
  scenarios['simile count for two previous measures'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = regexps.numberHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="cnh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
}

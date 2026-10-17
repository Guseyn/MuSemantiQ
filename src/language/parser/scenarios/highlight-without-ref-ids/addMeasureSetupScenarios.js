'use strict'

import regexps, { replaceMany } from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure without start bar line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.withoutStartBarLineHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure opens with bar line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.openingBarLineHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure closes with bar line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.closingBarLineHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure with repeat sign'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.withRepeatSignHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure with repeat sign at the start'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.atTheStartHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure with repeat sign at the end'] = {
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
  scenarios['measure with measure rest'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.measureRestHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['measure with multi measure rest count'] = {
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
  scenarios['measure with simile of previous measure'] = {
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
  scenarios['measure with simile of two previous measures'] = {
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
  scenarios['measure with simile count for previous measure'] = {
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
  scenarios['measure with simile count for two previous measures'] = {
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
  scenarios['measure ends with fermata'] = {
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
}

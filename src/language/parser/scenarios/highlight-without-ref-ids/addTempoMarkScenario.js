'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['tempo mark'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tempoMarkHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['tempo mark text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (matchWithHighlighedString) => {
          let lastMatchIsNote = false
          const matchWithHighlighedNotes = matchWithHighlighedString.replace(regexps.tempoDurationPartHighlight, (matchWithTempoDurationPart, p1, offset, string) => {
            if (regexps.tempoDurationPartIsDot.test(matchWithTempoDurationPart)) {
              if (lastMatchIsNote) {
                lastMatchIsNote = false
                return `<span class="eh">${matchWithTempoDurationPart}</span>`
              } else {
                return `<span class="sth">${matchWithTempoDurationPart}</span>`
              }
            } else {
              lastMatchIsNote = true
              const textThatFollowsAfterMatchWithTempoDurationPart = string.slice(offset + matchWithTempoDurationPart.length)
              if (
                !regexps.tempoMarkWithDotHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart) &&
                !regexps.tempoMarkDottedHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart)
              ) {
                lastMatchIsNote = false
                return `<span class="cuph">${matchWithTempoDurationPart}</span>`
              }
              return `<span class="cuph">${matchWithTempoDurationPart}</span>`
            }
          })
          return `<span class="sth">${matchWithHighlighedNotes}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString
      )
    }
  }
  scenarios['tempo mark vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
}

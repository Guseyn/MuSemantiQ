'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['tempo mark'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tempoMarkHighlight, (match) => {
          return `<span class="eh" ref-id="tempo-mark-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['tempo mark text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (matchWithHighlighedString) => {
          let matchIndexWithTempoDurationPart = 0
          let lastMatchIsNote = false
          const matchWithHighlighedNotes = matchWithHighlighedString.replace(regexps.tempoDurationPartHighlight, (matchWithTempoDurationPart, p1, offset, string) => {
            if (regexps.tempoDurationPartIsDot.test(matchWithTempoDurationPart)) {
              if (lastMatchIsNote) {
                lastMatchIsNote = false
                return `<span class="eh" ref-id="tempo-duration-part-${numberOfMeasures}-${++matchIndexWithTempoDurationPart}">${matchWithTempoDurationPart}</span>`
              } else {
                return `<span class="sth" ref-id="tempo-mark-${numberOfMeasures}">${matchWithTempoDurationPart}</span>`
              }
            } else {
              lastMatchIsNote = true
              const textThatFollowsAfterMatchWithTempoDurationPart = string.slice(offset + matchWithTempoDurationPart.length)
              if (
                !regexps.tempoMarkWithDotHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart) &&
                !regexps.tempoMarkDottedHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart)
              ) {
                lastMatchIsNote = false
                return `<span class="cuph" ref-id="tempo-duration-part-${numberOfMeasures}-${++matchIndexWithTempoDurationPart}">${matchWithTempoDurationPart}</span>`
              }
              return `<span class="cuph" ref-id="tempo-duration-part-${numberOfMeasures}-${++matchIndexWithTempoDurationPart}">${matchWithTempoDurationPart}</span>`
            }
          })
          return `<span class="sth" ref-id="tempo-mark-${numberOfMeasures}">${matchWithHighlighedNotes}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString}</span>`
      )
    }
  }
  scenarios['tempo mark vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
}

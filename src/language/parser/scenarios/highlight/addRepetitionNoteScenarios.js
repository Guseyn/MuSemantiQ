'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['repetition note'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="repetition-note-${numberOfMeasures}">${match}</span>`
        }
      ).replace(
        regexps.repetitionNoteHighlight, (match) => {
          return `<span class="eh" ref-id="repetition-note-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="repetition-note-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['repetition note at the start of the measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedMeasure = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="repetition-note-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedMeasure}</span>`
      )
    }
  }
  scenarios['repetition note at the end of the measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedMeasure = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="repetition-note-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedMeasure}</span>`
      )
    }
  }
  scenarios['repetition note vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="repetition-note-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="repetition-note-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

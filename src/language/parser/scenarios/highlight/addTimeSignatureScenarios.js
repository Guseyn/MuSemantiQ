'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['time signature'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.timeSignatureHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="eh" ref-id="time-signature-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="eh" ref-id="time-signature-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['time signature value'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.timeSignatureValueHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="cnh" ref-id="time-signature-${numberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="time-signature-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['time signature for each line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { lastTimeSignatureValueForEachLineId } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.forEachLineHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="clph" ref-id="time-signature-for-each-line-${lastTimeSignatureValueForEachLineId}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="time-signature-for-each-line-${lastTimeSignatureValueForEachLineId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['time signature for lines below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { lastTimeSignatureValueForEachLineId } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.linesHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="clph" ref-id="time-signature-for-each-line-${lastTimeSignatureValueForEachLineId}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="time-signature-for-each-line-${lastTimeSignatureValueForEachLineId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

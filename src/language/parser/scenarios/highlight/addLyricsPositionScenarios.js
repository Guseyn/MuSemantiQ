'use strict'

import parseStaveIndexByTokens from '#msq/language/parser/scenarios/token/parseStaveIndexByTokens.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['lyrics position'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.lyricsHighlight, (match) => {
          return `<span class="eh" ref-id="lyrics">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['lyrics position stave index'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, tokenValues, state }) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues)
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveIndexHighlight, (match) => {
          return `<span class="csph" ref-id="stave-${staveIndex}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stave-${staveIndex}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

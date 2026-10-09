'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['crescendo|diminuendo'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.crescendoOrDiminuendoHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['crescendo|diminuendo starts'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'crescendo|diminuendo starts', 2, { measure: true })
  scenarios['crescendo|diminuendo finishes'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'crescendo|diminuendo finishes', 2, { measure: true })
  scenarios['crescendo|diminuendo direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['crescendo|diminuendo above or below stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['crescendo|diminuendo vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'crescendo|diminuendo',
    [
      'crescendo|diminuendo starts',
      'crescendo|diminuendo finishes'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}

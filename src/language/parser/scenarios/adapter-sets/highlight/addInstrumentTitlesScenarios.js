'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['instrument title'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, numberOfInstrumentTitles } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = regexps.stringHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="sth" ref-id="instrument-title-${numberOfMeasures}-${numberOfInstrumentTitles}">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement = regexps.instrumentTitleHighlight.replace(
        joinedTokenValuesWithRealDelimitersWithHighlightedString, (match) => {
          return `<span class="eh" ref-id="instrument-title-${numberOfMeasures}-${numberOfInstrumentTitles}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="instrument-title-${numberOfMeasures}-${numberOfInstrumentTitles}">${joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['instrument title for'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['instrument title between'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['instrument title for stave index'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, staveIndex } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replace(
        'ref-id=""', `ref-id="stave-${numberOfMeasures}-${staveIndex + 1}"`
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.staveIndexHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="csph" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['instrument title between stave index 1'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['instrument title for stave index'],
    'instrument title between'
  )
  scenarios['instrument title between stave index 1 followed by and'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['instrument title between stave index 2'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, staveIndex } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 2] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 2].replace(
        'ref-id=""', `ref-id="stave-${numberOfMeasures}-${staveIndex + 1}"`
      )
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replace(
        'ref-id=""', `ref-id="stave-${numberOfMeasures}-${staveIndex + 1}"`
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.staveIndexHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="csph" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['instrument title for each line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { lastInstrumentTitlesParamsForEachLineId } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.forEachLineHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="clph" ref-id="instrument-title-for-each-line-${lastInstrumentTitlesParamsForEachLineId}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="instrument-title-for-each-line-${lastInstrumentTitlesParamsForEachLineId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['instrument title for lines below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { lastInstrumentTitlesParamsForEachLineId } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.linesHighlight.replace(
        joinedTokenValuesWithRealDelimiters, (match) => {
          return `<span class="clph" ref-id="instrument-title-for-each-line-${lastInstrumentTitlesParamsForEachLineId}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="instrument-title-for-each-line-${lastInstrumentTitlesParamsForEachLineId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}

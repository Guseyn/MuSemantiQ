'use strict'

import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

const NEW_LINE = '\n'

export default function (scenarios) {
  scenarios['comment starts and ends with text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment starts with text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment text ends (comment starts with text)'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['quote ends comment (comment starts with text)'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment text (comment starts with text)'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment followed by column or is'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment text starts and ends'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment text starts'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="ch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
  scenarios['comment text ends (comment text starts)'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['comment text ends (comment starts with text)'],
    'comment text starts'
  )
  scenarios['quote ends comment (comment text starts)'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['quote ends comment (comment starts with text)'],
    'comment text starts'
  )
  scenarios['comment text (comment text starts)'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['comment text (comment starts with text)'],
    'comment text starts'
  )
}

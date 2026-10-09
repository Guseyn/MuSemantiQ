'use strict'

import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['comment starts and ends with text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment starts with text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment text ends (comment starts with text)'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['quote ends comment (comment starts with text)'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment text (comment starts with text)'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment followed by column or is'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment text starts and ends'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['comment text starts'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="ch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
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

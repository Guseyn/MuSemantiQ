'use strict'

export default function (scenarios) {
  scenarios['midi setting name'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="msh">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['midi setting name is'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['midi setting value'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="msvh">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
}

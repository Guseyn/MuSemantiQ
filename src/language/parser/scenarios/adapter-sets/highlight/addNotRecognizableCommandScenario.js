'use strict'

export default function (scenarios) {
  scenarios['command is not recognizable'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="nrch">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
}

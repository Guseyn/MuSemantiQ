'use strict'

export default function (scenarios) {
  scenarios['empty line in general'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
}

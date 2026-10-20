'use strict'

const NEW_LINE = '\n'

export default function (scenarios) {
  scenarios['command is not recognizable'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersSplittedInLines = joinedTokenValuesWithRealDelimiters.split(NEW_LINE)
      joinedTokenValuesWithRealDelimitersSplittedInLines.forEach((value, index) => {
        state.highlightsHtmlBuffer.push(
          `<span class="nrch">${value}</span>`
        )
        if (index < joinedTokenValuesWithRealDelimitersSplittedInLines.length - 1) {
          state.highlightsHtmlBuffer.push(NEW_LINE)
        }
      })
    }
  }
}

'use strict'

const IS = 'is'
const NEW_LINE = '\n'

export default function (scenarios) {
  scenarios['page meta'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const wordIsFirstCharIndex = joinedTokenValuesWithRealDelimiters.indexOf(IS)
      const pageMetaNameAndValue = [ joinedTokenValuesWithRealDelimiters.slice(0, wordIsFirstCharIndex), joinedTokenValuesWithRealDelimiters.slice(wordIsFirstCharIndex + 2) ]
      const lastNewLineCharIndexInPageMetaName = pageMetaNameAndValue[0].lastIndexOf(NEW_LINE)
      const firstNewLineCharIndexInPageMetaValue = pageMetaNameAndValue[1].indexOf(NEW_LINE)
      if (lastNewLineCharIndexInPageMetaName === -1) {
        state.highlightsHtmlBuffer.push(
          `<span class="eh">${pageMetaNameAndValue[0]}</span>${IS}`
        )
      } else {
        state.highlightsHtmlBuffer.push(
          `${pageMetaNameAndValue[0].slice(0, lastNewLineCharIndexInPageMetaName + 1)}<span class="eh">${pageMetaNameAndValue[0].slice(lastNewLineCharIndexInPageMetaName + 1)}</span>${IS}`
        )
      }
      if (firstNewLineCharIndexInPageMetaValue === -1) {
        state.highlightsHtmlBuffer.push(
          `<span class="sth">${pageMetaNameAndValue[1]}</span>`
        )
      } else {
        state.highlightsHtmlBuffer.push(
          `<span class="sth">${pageMetaNameAndValue[1].slice(0, firstNewLineCharIndexInPageMetaValue)}</span>${pageMetaNameAndValue[1].slice(firstNewLineCharIndexInPageMetaValue)}`
        )
      }
    }
  }
}

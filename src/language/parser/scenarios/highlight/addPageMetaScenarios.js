'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

const IS = 'is'
const EMPTY_STRING = ''

export default function (scenarios) {
  scenarios['page meta'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { pageMetaKey } }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters.replace(regexps.somethingIsSomethingWithDelimetersHighlight, (match, p1, p2, p3) => {
          if (p3.startsWith(IS)) {
            p3 = p3.replace(IS, EMPTY_STRING)
          }
          const p1WithTrimmedEnd = p1.trimEnd()
          const p3WithTrimmedStart = p3.trimStart()
          return `<span class="th" ref-id="${pageMetaKey}"><span class="eh" ref-id="${pageMetaKey}">${p1WithTrimmedEnd}</span>${p1.slice(p1WithTrimmedEnd.length)}${p2}${p3.slice(0, p3.length - p3WithTrimmedStart.length)}<span class="sth" ref-id="${pageMetaKey}">${p3WithTrimmedStart}</span></span>`
        })
      )
    }
  }
}

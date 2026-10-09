'use strict'

import configurableStyles from '#msq/language/parser/scenarios/static-objects/configurableStyles.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

const NEW_LINE = '\n'

const styleNameAction = ({ parserState, joinedTokenValuesWithRealDelimiters, tokenValues, state }) => {
  const match = regexps.styleName.match(tokenValues)
  const styleName = match[0]
  parserState.lastMentionedStyleKey = configurableStyles[styleName]
  const lastNewLineIndex = joinedTokenValuesWithRealDelimiters.lastIndexOf(NEW_LINE)
  if (lastNewLineIndex === -1) {
    state.highlightsHtmlBuffer.push(
      `<span class="sh">${joinedTokenValuesWithRealDelimiters}</span>`
    )
  } else {
    state.highlightsHtmlBuffer.push(
      `${joinedTokenValuesWithRealDelimiters.slice(0, lastNewLineIndex + 1)}<span class="sh">${joinedTokenValuesWithRealDelimiters.slice(lastNewLineIndex + 1)}</span>`
    )
  }
}

const styleNameIsAction = ({ joinedTokenValuesWithRealDelimiters, state }) => {
  state.highlightsHtmlBuffer.push(
    joinedTokenValuesWithRealDelimiters
  )
}

const styleValueAction = ({ joinedTokenValuesWithRealDelimiters, state }) => {
  const firstNewLineIndex = joinedTokenValuesWithRealDelimiters.indexOf(NEW_LINE)
  if (firstNewLineIndex === -1) {
    state.highlightsHtmlBuffer.push(
      `<span class="svh">${joinedTokenValuesWithRealDelimiters}</span>`
    )
  } else {
    state.highlightsHtmlBuffer.push(
      `<span class="svh">${joinedTokenValuesWithRealDelimiters.slice(0, firstNewLineIndex)}</span>${joinedTokenValuesWithRealDelimiters.slice(firstNewLineIndex)}`
    )
  }
}

export default function (scenarios) {
  scenarios['color style name'] = {
    action: styleNameAction
  }
  scenarios['color style name is'] = {
    action: styleNameIsAction
  }
  scenarios['color style value'] = {
    action: styleValueAction
  }

  scenarios['music font style name'] = {
    action: styleNameAction
  }
  scenarios['music font style name is'] = {
    action: styleNameIsAction
  }
  scenarios['music font style value'] = {
    action: styleValueAction
  }

  scenarios['text font style name'] = {
    action: styleNameAction
  }
  scenarios['text font style name is'] = {
    action: styleNameIsAction
  }
  scenarios['text font style value'] = {
    action: styleValueAction
  }

  scenarios['chord letters font style name'] = {
    action: styleNameAction
  }
  scenarios['chord letters font style name is'] = {
    action: styleNameIsAction
  }
  scenarios['chord letters font style value'] = {
    action: styleValueAction
  }

  scenarios['style name'] = {
    action: styleNameAction
  }
  scenarios['style name is'] = {
    action: styleNameIsAction
  }
  scenarios['style value'] = {
    action: styleValueAction
  }
}

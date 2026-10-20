'use strict'

const styleNameAction = ({ joinedTokenValuesWithRealDelimiters, state }) => {
  state.highlightsHtmlBuffer.push(
    `<span class="sh">${joinedTokenValuesWithRealDelimiters}</span>`
  )
}

const styleNameIsAction = ({ joinedTokenValuesWithRealDelimiters, state }) => {
  state.highlightsHtmlBuffer.push(
    joinedTokenValuesWithRealDelimiters
  )
}

const styleValueAction = ({ joinedTokenValuesWithRealDelimiters, state }) => {
  state.highlightsHtmlBuffer.push(
    `<span class="svh">${joinedTokenValuesWithRealDelimiters}</span>`
  )
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

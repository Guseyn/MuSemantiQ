'use strict'

import extractTokenValuesFromTokens from '#msq/language/parser/scenarios/token/extractTokenValuesFromTokens.js'

export default function (tokens) {
  return extractTokenValuesFromTokens(tokens).join(' ')
}

'use strict'

import findSlurMarkWithSpecifiedKey from '#msq/language/parser/scenarios/page-schema/findSlurMarkWithSpecifiedKey.js'

export default function (parserState, slurMarkKey, placement) {
  const slurMarkWithSpecifiedKey = findSlurMarkWithSpecifiedKey(parserState, slurMarkKey)
  if (slurMarkWithSpecifiedKey) {
    slurMarkWithSpecifiedKey.rightPlacement = placement
  }
}

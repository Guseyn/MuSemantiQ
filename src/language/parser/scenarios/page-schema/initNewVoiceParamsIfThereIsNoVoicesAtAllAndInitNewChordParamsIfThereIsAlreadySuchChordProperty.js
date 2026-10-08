'use strict'

import findLastNonSimileChordParams from '#msq/language/parser/scenarios/page-schema/findLastNonSimileChordParams.js'

export default function (lastStaveParams, componentName, parserState) {
  if (!lastStaveParams.voicesParams) {
    lastStaveParams.voicesParams = []
  }
  if (lastStaveParams.voicesParams.length === 0) {
    lastStaveParams.voicesParams.push([])
  }
  if (componentName) {
    const lastChordParamsValue = findLastNonSimileChordParams(lastStaveParams)
    if (
      lastChordParamsValue &&
      lastChordParamsValue[componentName] &&
      !Array.isArray(lastChordParamsValue[componentName])
    ) {
      lastStaveParams.voicesParams.push([])
    }
  }
}

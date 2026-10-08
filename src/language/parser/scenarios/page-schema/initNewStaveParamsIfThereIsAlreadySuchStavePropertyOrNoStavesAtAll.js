'use strict'

import getLastStaveParams from '#msq/language/parser/scenarios/page-schema/getLastStaveParams.js'

export default function (lastMeasureParams, componentName, parserState) {
  if (!lastMeasureParams.stavesParams) {
    lastMeasureParams.stavesParams = []
  }
  if (lastMeasureParams.stavesParams.length === 0) {
    lastMeasureParams.stavesParams.push({})
  }
  if (componentName) {
    if (
      getLastStaveParams(lastMeasureParams)[componentName] &&
      !Array.isArray(getLastStaveParams(lastMeasureParams)[componentName])
    ) {
      lastMeasureParams.stavesParams.push({})
    }
  }
}

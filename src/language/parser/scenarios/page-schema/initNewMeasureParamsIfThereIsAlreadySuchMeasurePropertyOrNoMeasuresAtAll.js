'use strict'

import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'

export default function (pageSchema, componentName, parserState) {
  pageSchema.measuresParams = pageSchema.measuresParams || []
  if (parserState.numberOfPageLines === 0) {
    parserState.numberOfPageLines += 1
  }
  const componentNameIsNotBarLine = componentName !== 'closingBarLineName'
  if (pageSchema.measuresParams.length === 0) {
    if (componentNameIsNotBarLine) {
      pageSchema.measuresParams.push({
        closingBarLineName: 'barLine',
        pageLineNumber: parserState.numberOfPageLines
      })
    } else if (!parserState.newlineAlreadyIntroducedNewMeasure) {
      pageSchema.measuresParams.push({
        pageLineNumber: parserState.numberOfPageLines
      })
    }
  }
  if (componentName) {
    if (
      getLastMeasureParams(pageSchema)[componentName] &&
      !Array.isArray(getLastMeasureParams(pageSchema)[componentName]) &&
      componentNameIsNotBarLine &&
      !parserState.newlineAlreadyIntroducedNewMeasure
    ) {
      pageSchema.measuresParams.push({
        closingBarLineName: 'barLine',
        pageLineNumber: parserState.numberOfPageLines
      })
    }
  }
  parserState.newlineAlreadyIntroducedNewMeasure = false
  parserState.newlineAlreadyIntroducedNewStave = false
  /* const updatedLastMeasureParamsValue = lastMeasureParams(pageSchema)
  if (parserState.lastCrossStaveConnectionsParamsForEachLine) {
    updatedLastMeasureParamsValue.connectionsParams = JSON.parse(JSON.stringify(parserState.lastCrossStaveConnectionsParamsForEachLine))
  }
  if (parserState.lastInstrumentTitlesParamsForEachLine) {
    updatedLastMeasureParamsValue.instrumentTitlesParams = JSON.parse(JSON.stringify(parserState.lastInstrumentTitlesParamsForEachLine))
  }
  if (parserState.lastKeySignatureName) {
    updatedLastMeasureParamsValue.keySignatureName = parserState.lastKeySignatureName
    updatedLastMeasureParamsValue.keySignatureNameForEachLineId = parserState.lastKeySignatureNameForEachLineId
  }
  if (parserState.lastTimeSignatureParams) {
    updatedLastMeasureParamsValue.timeSignatureParams = parserState.lastTimeSignatureParams
  } */
}

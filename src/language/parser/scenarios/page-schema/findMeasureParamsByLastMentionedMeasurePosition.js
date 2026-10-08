'use strict'

import getCurrentPageLineIndex from '#msq/language/parser/scenarios/page-schema/getCurrentPageLineIndex.js'

export default function (parserState) {
  const pageSchema = parserState.pageSchema
  let pageLinePosition = parserState.lastMentionedPageLinePosition
  const measurePosition = parserState.lastMentionedMeasurePosition
  let pageLinePositionIsNotSpecified = pageLinePosition === undefined
  const measurePositionIsNotSpecified = measurePosition === undefined
  if (pageLinePositionIsNotSpecified) {
    pageLinePosition = getCurrentPageLineIndex(parserState)
    pageLinePositionIsNotSpecified = pageLinePosition === undefined
  }
  if (!measurePositionIsNotSpecified && !pageLinePositionIsNotSpecified) {
    let lineCount = 0
    let measureOnLineCount = 0
    for (let measureIndex = 0; measureIndex < pageSchema.measuresParams.length; measureIndex++) {
      const lastMeasureOnPageLine = pageSchema.measuresParams[measureIndex].isLastMeasureOnPageLine ||
        (measureIndex === pageSchema.measuresParams.length - 1)
      if (
        lineCount === pageLinePosition &&
        measureOnLineCount === measurePosition
      ) {
        return pageSchema.measuresParams[measureIndex]
      }
      if (lastMeasureOnPageLine) {
        measureOnLineCount = 0
        lineCount += 1
      } else {
        measureOnLineCount += 1
      }
    }
  }
  return null
}

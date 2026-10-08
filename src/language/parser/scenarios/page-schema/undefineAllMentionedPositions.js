'use strict'

export default function (parserState) {
  parserState.lastMentionedPageLinePosition = undefined
  parserState.lastMentionedMeasurePosition = undefined
  parserState.lastMentionedStavePosition = undefined
  parserState.lastMentionedVoicePosition = undefined
  parserState.lastMentionedUnitPosition = undefined
  parserState.unitMeasureIndexByLastMentionedPositions = undefined
  parserState.unitStaveIndexByLastMentionedPositions = undefined
  parserState.unitVoiceIndexByLastMentionedPositions = undefined
  parserState.unitIndexByLastMentionedPositions = undefined
  parserState.lastMentionedConnectionPageLinePosition = undefined
  parserState.lastMentionedConnectionMeasurePosition = undefined
  parserState.lastMentionedConnectionStavePosition = undefined
  parserState.lastMentionedConnectionVoicePosition = undefined
}

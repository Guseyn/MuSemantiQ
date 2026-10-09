'use strict'

import getCurrentPageLineIndex from '#msq/language/parser/scenarios/page-schema/getCurrentPageLineIndex.js'

// The positions a command named (line, measure, stave, voice, unit), as they are now, for the adapters: they are cleared when the command is over
export default function (parserState) {
  return {
    lastMentionedPageLinePosition: parserState.lastMentionedPageLinePosition,
    lastMentionedMeasurePosition: parserState.lastMentionedMeasurePosition,
    lastMentionedStavePosition: parserState.lastMentionedStavePosition,
    lastMentionedVoicePosition: parserState.lastMentionedVoicePosition,
    lastMentionedConnectionPageLinePosition: parserState.lastMentionedConnectionPageLinePosition,
    lastMentionedConnectionMeasurePosition: parserState.lastMentionedConnectionMeasurePosition,
    lastMentionedConnectionStavePosition: parserState.lastMentionedConnectionStavePosition,
    lastMentionedConnectionVoicePosition: parserState.lastMentionedConnectionVoicePosition,
    unitPageLineIndexByLastMentionedPositions: parserState.unitPageLineIndexByLastMentionedPositions,
    unitMeasureIndexByLastMentionedPositions: parserState.unitMeasureIndexByLastMentionedPositions,
    unitStaveIndexByLastMentionedPositions: parserState.unitStaveIndexByLastMentionedPositions,
    unitVoiceIndexByLastMentionedPositions: parserState.unitVoiceIndexByLastMentionedPositions,
    unitIndexByLastMentionedPositions: parserState.unitIndexByLastMentionedPositions,
    currentPageLineIndex: getCurrentPageLineIndex(parserState)
  }
}

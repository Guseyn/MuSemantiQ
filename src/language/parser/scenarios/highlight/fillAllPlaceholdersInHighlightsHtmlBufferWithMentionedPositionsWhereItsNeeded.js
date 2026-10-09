'use strict'

/*
Fills the ref-ids of the spans that were written before their positions were known:
"slur from note 1 in measure 2" writes its spans first, and only when the command is
over are the line, measure, stave, voice and unit it named known. The positions come
from the main scenarios (see getMentionedPositions), taken before they are cleared.
*/
export default function (state, mentionedPositions, forConnection) {
  const indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders = forConnection
    ? state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection
    : state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders
  if (
    (mentionedPositions.unitPageLineIndexByLastMentionedPositions !== undefined) &&
    (mentionedPositions.unitMeasureIndexByLastMentionedPositions !== undefined) &&
    (mentionedPositions.unitStaveIndexByLastMentionedPositions !== undefined) &&
    (mentionedPositions.unitVoiceIndexByLastMentionedPositions !== undefined) &&
    (mentionedPositions.unitIndexByLastMentionedPositions !== undefined) &&
    !forConnection
  ) {
    for (let index = 0; index < indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.length; index++) {
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="clph" ref-id=""',
        `class="clph" ref-id="line-${mentionedPositions.unitPageLineIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="clpph" ref-id=""',
        `class="clpph" ref-id="line-${mentionedPositions.unitPageLineIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cmph" ref-id=""',
        `class="cmph" ref-id="measure-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cmpph" ref-id=""',
        `class="cmpph" ref-id="measure-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="csph" ref-id=""',
        `class="csph" ref-id="stave-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cspph" ref-id=""',
        `class="cspph" ref-id="stave-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cvph" ref-id=""',
        `class="cvph" ref-id="voice-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}-${mentionedPositions.unitVoiceIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cvpph" ref-id=""',
        `class="cvpph" ref-id="voice-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}-${mentionedPositions.unitVoiceIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cuph" ref-id=""',
        `class="cuph" ref-id="unit-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}-${mentionedPositions.unitVoiceIndexByLastMentionedPositions + 1}-${mentionedPositions.unitIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cupph" ref-id=""',
        `class="cupph" ref-id="unit-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}-${mentionedPositions.unitVoiceIndexByLastMentionedPositions + 1}-${mentionedPositions.unitIndexByLastMentionedPositions + 1}"`
      )
      state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="th" ref-id=""',
        `class="th" ref-id="unit-${mentionedPositions.unitMeasureIndexByLastMentionedPositions + 1}-${mentionedPositions.unitStaveIndexByLastMentionedPositions + 1}-${mentionedPositions.unitVoiceIndexByLastMentionedPositions + 1}-${mentionedPositions.unitIndexByLastMentionedPositions + 1}"`
      )
    }
  } else {
    let pageLinePosition = forConnection ? mentionedPositions.lastMentionedConnectionPageLinePosition : mentionedPositions.lastMentionedPageLinePosition
    const measurePosition = forConnection ? mentionedPositions.lastMentionedConnectionMeasurePosition : mentionedPositions.lastMentionedMeasurePosition
    const stavePosition = forConnection ? mentionedPositions.lastMentionedConnectionStavePosition : mentionedPositions.lastMentionedStavePosition
    const voicePosition = forConnection ? mentionedPositions.lastMentionedConnectionVoicePosition : mentionedPositions.lastMentionedVoicePosition
    let pageLinePositionIsNotSpecified = pageLinePosition === undefined
    const measurePositionIsSpecified = measurePosition !== undefined
    const stavePositionIsSpecified = stavePosition !== undefined
    const voicePositionIsSpecified = voicePosition !== undefined
    if (pageLinePositionIsNotSpecified) {
      pageLinePosition = mentionedPositions.currentPageLineIndex
      pageLinePositionIsNotSpecified = pageLinePosition === undefined
    }
    if (!pageLinePositionIsNotSpecified) {
      for (let index = 0; index < indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.length; index++) {
        state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
          'class="clph" ref-id=""',
          `class="clph" ref-id="line-${pageLinePosition + 1}"`
        )
        state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
          'class="clpph" ref-id=""',
          `class="clpph" ref-id="line-${pageLinePosition + 1}"`
        )
        if (measurePositionIsSpecified) {
          state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
            'class="cmph" ref-id=""',
            `class="cmph" ref-id="measure-${pageLinePosition + 1}-${measurePosition + 1}"`
          )
          state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
            'class="cmpph" ref-id=""',
            `class="cmpph" ref-id="measure-${pageLinePosition + 1}-${measurePosition + 1}"`
          )
          if (stavePositionIsSpecified) {
            state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="csph" ref-id=""',
              `class="csph" ref-id="stave-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}"`
            )
            state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="cspph" ref-id=""',
              `class="cspph" ref-id="stave-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}"`
            )
            if (voicePositionIsSpecified) {
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}-${voicePosition + 1}"`
              )
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}-${voicePosition + 1}"`
              )
            }
          } else {
            if (voicePositionIsSpecified) {
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-in-measure-on-all-staves-${pageLinePosition + 1}-${measurePosition + 1}-${voicePosition + 1}"`
              )
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-in-measure-on-all-staves-${pageLinePosition + 1}-${measurePosition + 1}-${voicePosition + 1}"`
              )
            }
          }
        } else {
          if (stavePositionIsSpecified) {
            state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="csph" ref-id=""',
              `class="csph" ref-id="stave-in-all-measures-on-line-${pageLinePosition + 1}-${stavePosition + 1}"`
            )
            state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="cspph" ref-id=""',
              `class="cspph" ref-id="stave-in-all-measures-on-line-${pageLinePosition + 1}-${stavePosition + 1}"`
            )
            if (voicePositionIsSpecified) {
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-${stavePosition + 1}-${voicePosition + 1}"`
              )
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-${stavePosition + 1}-${voicePosition + 1}"`
              )
            }
          } else {
            if (voicePositionIsSpecified) {
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-in-all-measures-and-on-all-staves-on-line-${pageLinePosition + 1}-${voicePosition + 1}"`
              )
              state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = state.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-in-all-measures-and-on-all-staves-on-line-${pageLinePosition + 1}-${voicePosition + 1}"`
              )
            }
          }
        }
      }
    }
  }
  indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.length = 0
}

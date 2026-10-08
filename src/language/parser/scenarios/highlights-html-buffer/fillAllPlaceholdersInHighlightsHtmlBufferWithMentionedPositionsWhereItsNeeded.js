'use strict'

import getCurrentPageLineIndex from '#msq/language/parser/scenarios/page-schema/getCurrentPageLineIndex.js'

export default function (parserState, forConnection) {
  const indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders = forConnection
    ? parserState.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection
    : parserState.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders
  if (
    (parserState.unitPageLineIndexByLastMentionedPositions !== undefined) &&
    (parserState.unitMeasureIndexByLastMentionedPositions !== undefined) &&
    (parserState.unitStaveIndexByLastMentionedPositions !== undefined) &&
    (parserState.unitVoiceIndexByLastMentionedPositions !== undefined) &&
    (parserState.unitIndexByLastMentionedPositions !== undefined) &&
    !forConnection
  ) {
    for (let index = 0; index < indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.length; index++) {
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="clph" ref-id=""',
        `class="clph" ref-id="line-${parserState.unitPageLineIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="clpph" ref-id=""',
        `class="clpph" ref-id="line-${parserState.unitPageLineIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cmph" ref-id=""',
        `class="cmph" ref-id="measure-${parserState.unitMeasureIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cmpph" ref-id=""',
        `class="cmpph" ref-id="measure-${parserState.unitMeasureIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="csph" ref-id=""',
        `class="csph" ref-id="stave-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cspph" ref-id=""',
        `class="cspph" ref-id="stave-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cvph" ref-id=""',
        `class="cvph" ref-id="voice-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}-${parserState.unitVoiceIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cvpph" ref-id=""',
        `class="cvpph" ref-id="voice-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}-${parserState.unitVoiceIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cuph" ref-id=""',
        `class="cuph" ref-id="unit-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}-${parserState.unitVoiceIndexByLastMentionedPositions + 1}-${parserState.unitIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="cupph" ref-id=""',
        `class="cupph" ref-id="unit-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}-${parserState.unitVoiceIndexByLastMentionedPositions + 1}-${parserState.unitIndexByLastMentionedPositions + 1}"`
      )
      parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
        'class="th" ref-id=""',
        `class="th" ref-id="unit-${parserState.unitMeasureIndexByLastMentionedPositions + 1}-${parserState.unitStaveIndexByLastMentionedPositions + 1}-${parserState.unitVoiceIndexByLastMentionedPositions + 1}-${parserState.unitIndexByLastMentionedPositions + 1}"`
      )
    }
  } else {
    let pageLinePosition = forConnection ? parserState.lastMentionedConnectionPageLinePosition : parserState.lastMentionedPageLinePosition
    const measurePosition = forConnection ? parserState.lastMentionedConnectionMeasurePosition : parserState.lastMentionedMeasurePosition
    const stavePosition = forConnection ? parserState.lastMentionedConnectionStavePosition : parserState.lastMentionedStavePosition
    const voicePosition = forConnection ? parserState.lastMentionedConnectionVoicePosition : parserState.lastMentionedVoicePosition
    let pageLinePositionIsNotSpecified = pageLinePosition === undefined
    const measurePositionIsSpecified = measurePosition !== undefined
    const stavePositionIsSpecified = stavePosition !== undefined
    const voicePositionIsSpecified = voicePosition !== undefined
    if (pageLinePositionIsNotSpecified) {
      pageLinePosition = getCurrentPageLineIndex(parserState)
      pageLinePositionIsNotSpecified = pageLinePosition === undefined
    }
    if (!pageLinePositionIsNotSpecified) {
      for (let index = 0; index < indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.length; index++) {
        parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
          'class="clph" ref-id=""',
          `class="clph" ref-id="line-${pageLinePosition + 1}"`
        )
        parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
          'class="clpph" ref-id=""',
          `class="clpph" ref-id="line-${pageLinePosition + 1}"`
        )
        if (measurePositionIsSpecified) {
          parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
            'class="cmph" ref-id=""',
            `class="cmph" ref-id="measure-${pageLinePosition + 1}-${measurePosition + 1}"`
          )
          parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
            'class="cmpph" ref-id=""',
            `class="cmpph" ref-id="measure-${pageLinePosition + 1}-${measurePosition + 1}"`
          )
          if (stavePositionIsSpecified) {
            parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="csph" ref-id=""',
              `class="csph" ref-id="stave-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}"`
            )
            parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="cspph" ref-id=""',
              `class="cspph" ref-id="stave-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}"`
            )
            if (voicePositionIsSpecified) {
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}-${voicePosition + 1}"`
              )
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-${pageLinePosition + 1}-${measurePosition + 1}-${stavePosition + 1}-${voicePosition + 1}"`
              )
            }
          } else {
            if (voicePositionIsSpecified) {
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-in-measure-on-all-staves-${pageLinePosition + 1}-${measurePosition + 1}-${voicePosition + 1}"`
              )
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-in-measure-on-all-staves-${pageLinePosition + 1}-${measurePosition + 1}-${voicePosition + 1}"`
              )
            }
          }
        } else {
          if (stavePositionIsSpecified) {
            parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="csph" ref-id=""',
              `class="csph" ref-id="stave-in-all-measures-on-line-${pageLinePosition + 1}-${stavePosition + 1}"`
            )
            parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
              'class="cspph" ref-id=""',
              `class="cspph" ref-id="stave-in-all-measures-on-line-${pageLinePosition + 1}-${stavePosition + 1}"`
            )
            if (voicePositionIsSpecified) {
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-${stavePosition + 1}-${voicePosition + 1}"`
              )
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvpph" ref-id=""',
                `class="cvpph" ref-id="voice-${stavePosition + 1}-${voicePosition + 1}"`
              )
            }
          } else {
            if (voicePositionIsSpecified) {
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
                'class="cvph" ref-id=""',
                `class="cvph" ref-id="voice-in-all-measures-and-on-all-staves-on-line-${pageLinePosition + 1}-${voicePosition + 1}"`
              )
              parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]] = parserState.highlightsHtmlBuffer[indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders[index]].replace(
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

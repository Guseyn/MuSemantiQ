'use strict'

const calculateCompressedRange = (range, compressUnitsByNTimes, stretchUnitsByNTimes, styles) => {
  let result
  if (stretchUnitsByNTimes !== undefined) {
    result = range * stretchUnitsByNTimes
  } else if (compressUnitsByNTimes !== undefined) {
    result = range / compressUnitsByNTimes
  } else {
    result = range
  }
  return +result.toFixed(2)
}

export default function (crossStaveUnit, minUnitDurationOnPageLine, compressUnitsByNTimes, stretchUnitsByNTimes, styles) {
  const { spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo } = styles
  if (minUnitDurationOnPageLine <= 1 / 32) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 1 / 32']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 32) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 16) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 8) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[4], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[5], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[6], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[7], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[8], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[9], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 1 / 16) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 1 / 16']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 16) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 8) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[4], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[5], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[6], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[7], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[8], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 1 / 8) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 1 / 8']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 8) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[4], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[5], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[6], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[7], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 1 / 4) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 1 / 4']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[4], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[5], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[6], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 1 / 2) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 1 / 2']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1 / 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[4], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[5], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 1) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 1']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 1) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[4], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 2) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 2']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 2) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[3], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  if (minUnitDurationOnPageLine <= 4) {
    const spaceRangesAfterCrossStaveUnit = spaceRangesAfterCrossStaveUnitsAccordingMinUnitDurationOnPageLineTheyBelongTo['min <= 4']
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit === 0) {
      return spaceRangesAfterCrossStaveUnit[0]
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit <= 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[1], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
    if (crossStaveUnit.minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit > 4) {
      return calculateCompressedRange(spaceRangesAfterCrossStaveUnit[2], compressUnitsByNTimes, stretchUnitsByNTimes, styles)
    }
  }
  return 0
}

'use strict'

export default function (unitDuration, tremoloParams) {
  if (!tremoloParams || unitDuration < 1 / 16) {
    return 0
  }
  const customNumberOfTremoloStrokes = tremoloParams.customNumberOfTremoloStrokes
  if (customNumberOfTremoloStrokes && customNumberOfTremoloStrokes >= 1 && customNumberOfTremoloStrokes <= 3) {
    if (unitDuration === 1 / 8 && customNumberOfTremoloStrokes <= 2) {
      return customNumberOfTremoloStrokes
    }
    if (unitDuration > 1 / 8) {
      return customNumberOfTremoloStrokes
    }
  }
  if (unitDuration === 1 / 8) {
    return 2
  }
  if (unitDuration === 1 / 16) {
    return 1
  }
  return 3
}

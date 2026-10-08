'use strict'

// customRoundCoefficientFactor (is supposed to be from 1 to 10)
// https://en.wikipedia.org/wiki/Logistic_function
export default function (xRangeOfSlur, customRoundCoefficientFactor, styles) {
  const minValue = 0.55
  const maxValue = 1.0
  if (customRoundCoefficientFactor) {
    const maxCustomRoundCoefficientFactor = 10
    const d = maxCustomRoundCoefficientFactor / (maxValue - minValue)
    const finalValue = Math.min(minValue + customRoundCoefficientFactor / d, maxValue)
    return finalValue
  }
  const step = styles.slurRoundCoefficientByXRangeOfSShapeSlurStepForLogisticFunction
  const x0 = 0
  return (minValue + maxValue) - Math.max(minValue, 1 / (1 + Math.exp(-1 * step * (xRangeOfSlur - x0))))
}

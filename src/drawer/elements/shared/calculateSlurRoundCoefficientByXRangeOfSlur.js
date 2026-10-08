'use strict'

// customRoundCoefficientFactor (is supposed to be from 1 to 10)
export default function (xRangeOfSlur, customRoundCoefficientFactor, styles) {
  const minValue = 0.9
  const maxValue = 1.0
  if (customRoundCoefficientFactor) {
    const finalValue = Math.min(minValue + customRoundCoefficientFactor / 100, maxValue)
    return finalValue
  }
  const { correlationIntervalOfXRangeForSlurRoundCoefficient } = styles
  const stepForSlurRoundCoefficient = styles.slurRoundCoefficientByXRangeOfSlurStep
  return Math.max(maxValue - Math.ceil(xRangeOfSlur / correlationIntervalOfXRangeForSlurRoundCoefficient) * stepForSlurRoundCoefficient, minValue)
}

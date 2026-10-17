'use strict'

// Format numbers to eliminate floating-point precision noise while maintaining rendering accuracy
// Rounds to 10 decimal places, which is imperceptible at typical screen resolutions
export default function formatNumber (num) {
  if (typeof num !== 'number') return num
  // Round to 10 decimal places to handle floating-point precision differences
  // This is ~0.0000000001 pixels, well below visual perception
  return Math.round(num * 1e10) / 1e10
}

'use strict'

export default function (x, slurStartX, slurEndX, xEpsilon = 0.00001) {
  return Math.max((x - slurStartX), xEpsilon) / Math.max((slurEndX - slurStartX), xEpsilon)
}

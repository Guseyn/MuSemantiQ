'use strict'

export default function (slurSplinePoints, yOffset) {
  const slurSplinePointsCopy = slurSplinePoints.slice()
  slurSplinePointsCopy[2] += yOffset
  slurSplinePointsCopy[5] += yOffset
  slurSplinePointsCopy[7] += yOffset
  slurSplinePointsCopy[9] += yOffset
  slurSplinePointsCopy[12] += yOffset
  slurSplinePointsCopy[14] += yOffset
  slurSplinePointsCopy[16] += yOffset
  slurSplinePointsCopy[19] += yOffset
  slurSplinePointsCopy[21] += yOffset
  slurSplinePointsCopy[23] += yOffset
  return slurSplinePointsCopy
}

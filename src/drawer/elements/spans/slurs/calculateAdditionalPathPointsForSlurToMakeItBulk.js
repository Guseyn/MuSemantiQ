'use strict'

export default function (slurSplinePoints, slurDirection, isGrace, styles) {
  const p0 = { x: slurSplinePoints[1], y: slurSplinePoints[2] }
  const p1 = { x: slurSplinePoints[11], y: slurSplinePoints[12] }
  const p2 = { x: slurSplinePoints[13], y: slurSplinePoints[14] }
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  return [
    'C',
    p2.x, p2.y + slurDirectionSign * styles.slurBulkCoefficient * (isGrace ? styles.graceElementsScaleFactor : 1),
    p1.x, p1.y + slurDirectionSign * styles.slurBulkCoefficient * (isGrace ? styles.graceElementsScaleFactor : 1),
    p0.x, p0.y
  ]
}

'use strict'

import calculateSlurJunctionPointForSingleUnit from '#msq/drawer/elements/spans/slurs/calculateSlurJunctionPointForSingleUnit.js'
import calculateTimeInSlurSplinePointsBySomeXPointThere from '#msq/drawer/elements/shared/calculateTimeInSlurSplinePointsBySomeXPointThere.js'

export default function (singleUnit, slurSplinePoints, slurDirection, styles) {
  const slurFirstCurveXRange = {
    start: slurSplinePoints[1],
    end: slurSplinePoints[8]
  }
  const slurSecondCurveXRange = {
    start: slurSplinePoints[8],
    end: slurSplinePoints[15]
  }
  const slurThirdCurveXRange = {
    start: slurSplinePoints[15],
    end: slurSplinePoints[22]
  }

  let slurStartX
  let slurEndX
  let p0
  let p1
  let p2
  let p3

  const sx = calculateSlurJunctionPointForSingleUnit(singleUnit, slurDirection, 'middle', null, styles).x
  const slurDirectionSign = slurDirection === 'up' ? +1 : -1
  const additionalYCorrectionForEachSlurJunctionPoint = slurDirectionSign * styles.minSpaceBetweenSingleUnitExtremePointAndSShapeSlur
  if (sx <= slurFirstCurveXRange.end) {
    slurStartX = slurFirstCurveXRange.start
    slurEndX = slurFirstCurveXRange.end
    p0 = { x: slurSplinePoints[1], y: slurSplinePoints[2] + additionalYCorrectionForEachSlurJunctionPoint }
    p1 = { x: slurSplinePoints[4], y: slurSplinePoints[5] + additionalYCorrectionForEachSlurJunctionPoint }
    p2 = { x: slurSplinePoints[6], y: slurSplinePoints[7] + additionalYCorrectionForEachSlurJunctionPoint }
    p3 = { x: slurSplinePoints[8], y: slurSplinePoints[9] + additionalYCorrectionForEachSlurJunctionPoint }
  } else if (sx >= slurSecondCurveXRange.start && sx <= slurSecondCurveXRange.end) {
    slurStartX = slurSecondCurveXRange.start
    slurEndX = slurSecondCurveXRange.end
    p0 = { x: slurSplinePoints[8], y: slurSplinePoints[9] + additionalYCorrectionForEachSlurJunctionPoint }
    p1 = { x: slurSplinePoints[11], y: slurSplinePoints[12] + additionalYCorrectionForEachSlurJunctionPoint }
    p2 = { x: slurSplinePoints[13], y: slurSplinePoints[14] + additionalYCorrectionForEachSlurJunctionPoint }
    p3 = { x: slurSplinePoints[15], y: slurSplinePoints[16] + additionalYCorrectionForEachSlurJunctionPoint }
  } else if (sx >= slurThirdCurveXRange.start) {
    slurStartX = slurThirdCurveXRange.start
    slurEndX = slurThirdCurveXRange.end
    p0 = { x: slurSplinePoints[15], y: slurSplinePoints[16] + additionalYCorrectionForEachSlurJunctionPoint }
    p1 = { x: slurSplinePoints[18], y: slurSplinePoints[19] + additionalYCorrectionForEachSlurJunctionPoint }
    p2 = { x: slurSplinePoints[20], y: slurSplinePoints[21] + additionalYCorrectionForEachSlurJunctionPoint }
    p3 = { x: slurSplinePoints[22], y: slurSplinePoints[23] + additionalYCorrectionForEachSlurJunctionPoint }
  }
  let t = calculateTimeInSlurSplinePointsBySomeXPointThere(sx, slurStartX, slurEndX)
  return {
    singleUnit,
    x: sx,
    y: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y
  }
}

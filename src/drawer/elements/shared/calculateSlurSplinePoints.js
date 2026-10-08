'use strict'

const calculateVectorLength = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

const calculateMiddleCurvePoints = (firstPoint, secondPoint, thirdPoint, fourthPoint, alpha, epsilon) => {
  const d1 = Math.pow(calculateVectorLength(secondPoint, firstPoint), alpha)
  const d2 = Math.pow(calculateVectorLength(thirdPoint, secondPoint), alpha)
  const d3 = Math.pow(calculateVectorLength(fourthPoint, thirdPoint), alpha)

  const a1 = Math.pow(d1, 2)
  const b1 = Math.pow(d2, 2)
  const c1 = 2 * a1 + 3 * d1 * d2 + b1
  const denominator1 = (3 * d1 * (d1 + d2)) || epsilon

  const firstControlPoint = {
    x: (a1 * thirdPoint.x - b1 * firstPoint.x + c1 * secondPoint.x) / denominator1,
    y: (a1 * thirdPoint.y - b1 * firstPoint.y + c1 * secondPoint.y) / denominator1
  }

  const a2 = Math.pow(d3, 2)
  const b2 = Math.pow(d2, 2)
  const c2 = 2 * a2 + 3 * d3 * d2 + b2
  const denominator2 = (3 * d3 * (d3 + d2)) || epsilon

  const secondControlPoint = {
    x: (a2 * secondPoint.x - b2 * fourthPoint.x + c2 * thirdPoint.x) / denominator2,
    y: (a2 * secondPoint.y - b2 * fourthPoint.y + c2 * thirdPoint.y) / denominator2
  }

  return [
    secondPoint.x, secondPoint.y,
    firstControlPoint.x, firstControlPoint.y,
    secondControlPoint.x, secondControlPoint.y,
    thirdPoint.x, thirdPoint.y
  ]
}

export default function (firstPoint, secondPoint, thirdPoint, fourthPoint, alpha = 1) {
  const epsilon = 0.0001

  const firstPhantomPoint = {
    x: firstPoint.x + epsilon * (firstPoint.x - secondPoint.x),
    y: firstPoint.y + epsilon * (firstPoint.y - secondPoint.y)
  }
  const secondPhantomPoint = {
    x: thirdPoint.x + epsilon * (thirdPoint.x - fourthPoint.x),
    y: thirdPoint.y + epsilon * (thirdPoint.y - fourthPoint.y)
  }

  const curvePointsBetweenFirstAndSecondPoints = calculateMiddleCurvePoints(firstPhantomPoint, firstPoint, secondPoint, thirdPoint, alpha, epsilon)
  const curvePointsBetweenSecondAndThirdPoints = calculateMiddleCurvePoints(firstPoint, secondPoint, thirdPoint, fourthPoint, alpha, epsilon)
  const curvePointsBetweenThirdAndFourthPoints = calculateMiddleCurvePoints(secondPoint, thirdPoint, fourthPoint, secondPhantomPoint, alpha, epsilon)

  return [

    'M',
    curvePointsBetweenFirstAndSecondPoints[0], curvePointsBetweenFirstAndSecondPoints[1], // 1,2
    'C',
    curvePointsBetweenFirstAndSecondPoints[2], curvePointsBetweenFirstAndSecondPoints[3], // 4,5
    curvePointsBetweenFirstAndSecondPoints[4], curvePointsBetweenFirstAndSecondPoints[5], // 6,7
    curvePointsBetweenFirstAndSecondPoints[6], curvePointsBetweenFirstAndSecondPoints[7], // 8,9

    'C',
    curvePointsBetweenSecondAndThirdPoints[2], curvePointsBetweenSecondAndThirdPoints[3], // 11,12
    curvePointsBetweenSecondAndThirdPoints[4], curvePointsBetweenSecondAndThirdPoints[5], // 13,14
    curvePointsBetweenSecondAndThirdPoints[6], curvePointsBetweenSecondAndThirdPoints[7], // 15,16

    'C',
    curvePointsBetweenThirdAndFourthPoints[2], curvePointsBetweenThirdAndFourthPoints[3], // 18,19
    curvePointsBetweenThirdAndFourthPoints[4], curvePointsBetweenThirdAndFourthPoints[5], // 20,21
    curvePointsBetweenThirdAndFourthPoints[6], curvePointsBetweenThirdAndFourthPoints[7] // 22,23

    /* 'M',
    firstPoint.x, firstPoint.y,
    'L',
    secondPoint.x, secondPoint.y,
    'L',
    thirdPoint.x, thirdPoint.y,
    'L',
    fourthPoint.x, fourthPoint.y */
  ]
}

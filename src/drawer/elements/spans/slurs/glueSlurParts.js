'use strict'

// inspired by https://www.math.ucla.edu/~baker/149.1.02w/handouts/dd_splines.pdf

export default function (slurParts, slurPartsDirections, styles) {
  const slurPartsAsResult = slurParts.map(slurPart => slurPart.slice())
  for (let partIndex = 0; partIndex < slurPartsAsResult.length - 1; partIndex++) {
    const lastCurveOfCurrentSlurPart = slurPartsAsResult[partIndex].slice(15, 24)
    const firstCurveOfNextSlurPart = slurPartsAsResult[partIndex + 1].slice(1, 10)

    const p1 = {
      x: lastCurveOfCurrentSlurPart[3],
      y: lastCurveOfCurrentSlurPart[4]
    }
    const p2 = {
      x: lastCurveOfCurrentSlurPart[5],
      y: lastCurveOfCurrentSlurPart[6]
    }
    const q1 = {
      x: firstCurveOfNextSlurPart[3],
      y: firstCurveOfNextSlurPart[4]
    }
    const q2 = {
      x: firstCurveOfNextSlurPart[5],
      y: firstCurveOfNextSlurPart[6]
    }

    const aPlus = {
      x: 2 * p2.x - p1.x,
      y: 2 * p2.y - p1.y
    }

    const aMinus = {
      x: 2 * q1.x - q2.x,
      y: 2 * q1.y - q2.y
    }

    const a = {
      x: (aPlus.x + aMinus.x) / 2,
      y: (aPlus.y + aMinus.y) / 2
    }

    const s = {
      x: (p2.x + q1.x) / 2,
      y: (p2.y + q1.y) / 2
    }

    const newP2 = {
      x: (p1.x + a.x) / 2,
      y: (p1.y + a.y) / 2
    }

    const newQ1 = {
      x: (q2.x + a.x) / 2,
      y: (q2.y + a.y) / 2
    }

    slurPartsAsResult[partIndex][22] = s.x
    slurPartsAsResult[partIndex][23] = s.y
    slurPartsAsResult[partIndex + 1][1] = s.x
    slurPartsAsResult[partIndex + 1][2] = s.y

    slurPartsAsResult[partIndex][20] = newP2.x
    slurPartsAsResult[partIndex][21] = newP2.y

    slurPartsAsResult[partIndex + 1][4] = newQ1.x
    slurPartsAsResult[partIndex + 1][5] = newQ1.y
  }
  return slurPartsAsResult
}

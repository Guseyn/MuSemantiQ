'use strict'

import { createSeededRandom } from '#msq/omr/training/seededRandom.js'

// A vertical piecewise warp changes each stave and each gap independently. All
// source lines and the bottom page edge have targets, so no notation is clipped.
export function varyFullPageLocalGeometry (bitmap, staves, { seed = 1, variation = 0.15 } = {}) {
  if (!staves.length || variation < 0 || variation > 0.5) {
    throw new Error('Local geometry mutation needs staves and variation between 0 and 0.5')
  }
  const random = createSeededRandom(seed)
  const ordered = [ ...staves ].sort((first, second) => first.topY - second.topY)
  const targetStaves = []
  let targetTop = ordered[0].topY
  for (const [ staveIndex, stave ] of ordered.entries()) {
    if (staveIndex > 0) {
      const previous = ordered[staveIndex - 1]
      const previousTarget = targetStaves[targetStaves.length - 1]
      const sourceGap = stave.topY - previous.bottomY
      const gapFactor = factor(random, variation)
      targetTop = previousTarget.bottomY + sourceGap * gapFactor
    }
    const interval = stave.intervalBetweenStaveLines * factor(random, variation)
    const linesY = stave.linesY.map((line, lineIndex) => targetTop + lineIndex * interval)
    targetStaves.push({
      staveIndex: staves.indexOf(stave),
      pageLineNumber: (stave.systemIndex ?? 0) + 1,
      sourceLinesY: [ ...stave.linesY ],
      linesY,
      topY: linesY[0],
      bottomY: linesY[linesY.length - 1],
      intervalBetweenStaveLines: interval,
      staveLineThickness: stave.staveLineThickness
    })
  }
  const sourcePoints = [ 0 ]
  const targetPoints = [ 0 ]
  for (let index = 0; index < ordered.length; index++) {
    sourcePoints.push(...ordered[index].linesY)
    targetPoints.push(...targetStaves[index].linesY)
  }
  const lastTarget = targetStaves[targetStaves.length - 1].bottomY
  const lastSource = ordered[ordered.length - 1].bottomY
  sourcePoints.push(bitmap.height - 1)
  targetPoints.push(lastTarget + (bitmap.height - 1 - lastSource))
  const outputHeight = Math.max(1, Math.ceil(targetPoints[targetPoints.length - 1]) + 1)
  const grayscale = new Float32Array(bitmap.width * outputHeight)
  for (let y = 0; y < outputHeight; y++) {
    const sourceY = interpolateInverse(y, sourcePoints, targetPoints)
    const lower = Math.max(0, Math.min(bitmap.height - 1, Math.floor(sourceY)))
    const upper = Math.max(0, Math.min(bitmap.height - 1, lower + 1))
    const fraction = Math.max(0, Math.min(1, sourceY - lower))
    for (let x = 0; x < bitmap.width; x++) {
      const lowerInk = bitmap.grayscale[lower * bitmap.width + x]
      const upperInk = bitmap.grayscale[upper * bitmap.width + x]
      grayscale[y * bitmap.width + x] = lowerInk + (upperInk - lowerInk) * fraction
    }
  }
  const intervalBetweenStaves = []
  const intervalBetweenPageLines = []
  for (let index = 1; index < targetStaves.length; index++) {
    const upper = targetStaves[index - 1]
    const lower = targetStaves[index]
    if (upper.pageLineNumber === lower.pageLineNumber) {
      intervalBetweenStaves.push({
        pageLineNumber: lower.pageLineNumber,
        upperStaveIndex: upper.staveIndex,
        lowerStaveIndex: lower.staveIndex,
        pixels: lower.topY - upper.bottomY
      })
    } else {
      intervalBetweenPageLines.push({
        upperPageLineNumber: upper.pageLineNumber,
        lowerPageLineNumber: lower.pageLineNumber,
        pixels: lower.topY - upper.bottomY
      })
    }
  }
  return {
    bitmap: { width: bitmap.width, height: outputHeight, grayscale },
    metadata: {
      type: 'local-stave-and-page-line-geometry-mutation',
      seed,
      variation,
      sourcePoints,
      targetPoints,
      staves: targetStaves,
      intervalBetweenStaves,
      intervalBetweenPageLines
    }
  }
}

function factor (random, variation) {
  return 1 - variation + 2 * variation * random()
}

function interpolateInverse (targetY, sourcePoints, targetPoints) {
  for (let index = 1; index < targetPoints.length; index++) {
    if (targetY <= targetPoints[index]) {
      const targetInterval = targetPoints[index] - targetPoints[index - 1]
      if (targetInterval <= 0) {
        return sourcePoints[index - 1]
      }
      const fraction = (targetY - targetPoints[index - 1]) / targetInterval
      return sourcePoints[index - 1] + fraction * (sourcePoints[index] - sourcePoints[index - 1])
    }
  }
  return sourcePoints[sourcePoints.length - 1]
}

export default varyFullPageLocalGeometry

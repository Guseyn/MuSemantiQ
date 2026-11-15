'use strict'

import rendererSymbolDefinitions from '#msq/omr/training/rendererSymbolDefinitions.js'
import { resampleComponentToGrid } from '#msq/omr/training/cropComponents.js'

// SVG truth follows the same coordinate transforms as the bitmap. No detector
// is allowed to relabel a crop after degradation.
export function cropFullPageTrainingSamples (sample, { gridSize = 48, classIds = Object.keys(rendererSymbolDefinitions) } = {}) {
  if (!sample.sourceSvgGeometry) {
    return []
  }
  const targetCounts = Object.values(rendererSymbolDefinitions).reduce((counts, definition) => {
    counts[definition.targetName] = (counts[definition.targetName] || 0) + 1
    return counts
  }, {})
  const samples = []
  for (const [ classIndex, classId ] of classIds.entries()) {
    if (targetCounts[rendererSymbolDefinitions[classId]?.targetName] !== 1) {
      continue
    }
    const definition = rendererSymbolDefinitions[classId]
    if (!definition) {
      throw new Error(`Unknown renderer symbol class: ${classId}`)
    }
    const groups = sample.sourceSvgGeometry.groups.filter((group) => group.name === definition.targetName && group.bounds)
      .sort((first, second) => area(first.bounds) - area(second.bounds))
    if (!groups.length) {
      continue
    }
    const group = groups[0]
    const box = definition.primitiveIndex === undefined
      ? group.bounds
      : primitiveBounds(sample.sourceSvgGeometry.primitives, group.bounds, definition.primitiveIndex)
    if (!box) {
      continue
    }
    const transformed = transformBounds(box, sample)
    const cropped = cropBox(transformed, sample.bitmap)
    if (!cropped) {
      continue
    }
    samples.push({
      pixels: Array.from(resampleComponentToGrid(sample.bitmap, cropped, gridSize)),
      classId,
      classIndex,
      compositionId: sample.compositionId,
      split: sample.split,
      font: sample.stylePreset.styles.musicFont || 'bravura',
      scale: sample.sourceSvgGeometry.rasterization.scale,
      mutationProfile: sample.mutationMetadata.profile,
      box: cropped
    })
  }
  return samples
}

function primitiveBounds (primitives, groupBounds, index) {
  const centerY = (groupBounds.top + groupBounds.bottom) / 2
  const candidates = primitives.filter((primitive) =>
    primitive.attributes?.d && primitive.bounds &&
    primitive.bounds.left >= groupBounds.left - 0.01 && primitive.bounds.right <= groupBounds.right + 0.01 &&
    primitive.bounds.top >= groupBounds.top - 0.01 && primitive.bounds.top <= centerY + 0.01 &&
    primitive.style?.fill !== '#343434'
  ).sort((first, second) => first.bounds.left - second.bounds.left)
  return candidates[index]?.bounds || null
}

function transformBounds (bounds, sample) {
  const scale = sample.sourceSvgGeometry.rasterization.scale
  const operation = sample.mutationMetadata.operations.find((candidate) => candidate.name === 'geometry')
  const matrix = operation?.outputForwardHomography || [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]
  const local = sample.localGeometryMetadata
  return [
    [ bounds.left, bounds.top ],
    [ bounds.right, bounds.top ],
    [ bounds.right, bounds.bottom ],
    [ bounds.left, bounds.bottom ]
  ].map(([ x, y ]) => {
    const scaledY = y * scale
    const locallyTransformedY = local ? interpolateForward(scaledY, local.sourcePoints, local.targetPoints) : scaledY
    const denominator = matrix[6] * x * scale + matrix[7] * locallyTransformedY + matrix[8]
    return {
      x: (matrix[0] * x * scale + matrix[1] * locallyTransformedY + matrix[2]) / denominator,
      y: (matrix[3] * x * scale + matrix[4] * locallyTransformedY + matrix[5]) / denominator
    }
  })
}

function interpolateForward (sourceY, sourcePoints, targetPoints) {
  for (let index = 1; index < sourcePoints.length; index++) {
    if (sourceY <= sourcePoints[index]) {
      const sourceInterval = sourcePoints[index] - sourcePoints[index - 1]
      if (sourceInterval <= 0) {
        return targetPoints[index - 1]
      }
      const fraction = (sourceY - sourcePoints[index - 1]) / sourceInterval
      return targetPoints[index - 1] + fraction * (targetPoints[index] - targetPoints[index - 1])
    }
  }
  return targetPoints[targetPoints.length - 1]
}

function cropBox (points, bitmap) {
  const left = Math.max(0, Math.floor(Math.min(...points.map((point) => point.x))))
  const top = Math.max(0, Math.floor(Math.min(...points.map((point) => point.y))))
  const right = Math.min(bitmap.width, Math.ceil(Math.max(...points.map((point) => point.x))))
  const bottom = Math.min(bitmap.height, Math.ceil(Math.max(...points.map((point) => point.y))))
  return right - left >= 2 && bottom - top >= 2
    ? { x: left, y: top, w: right - left, h: bottom - top }
    : null
}

function area (bounds) {
  return Math.max(0, bounds.right - bounds.left) * Math.max(0, bounds.bottom - bounds.top)
}

export default cropFullPageTrainingSamples

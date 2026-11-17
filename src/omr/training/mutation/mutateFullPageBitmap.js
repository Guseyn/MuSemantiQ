'use strict'

import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import fullPageMutationProfiles from '#msq/omr/training/mutation/fullPageMutationProfiles.js'
import warpFullPageBitmap from '#msq/omr/training/mutation/warpFullPageBitmap.js'
import blurFullPageBitmap from '#msq/omr/training/mutation/blurFullPageBitmap.js'
import changeFullPageBitmapInkThickness from '#msq/omr/training/mutation/changeFullPageBitmapInkThickness.js'
import illuminateFullPageBitmap from '#msq/omr/training/mutation/illuminateFullPageBitmap.js'
import changeFullPageBitmapContrast from '#msq/omr/training/mutation/changeFullPageBitmapContrast.js'
import addFullPageBitmapNoise from '#msq/omr/training/mutation/addFullPageBitmapNoise.js'

/**
 * Ink remains 1 and paper remains 0. Every geometric output is expanded around
 * the complete transformed page; later operations never crop that canvas.
 */
export function mutateFullPageBitmap (bitmap, {
  seed = 1,
  profile = 'clean',
  intervalBetweenStaveLines = 8.5,
  staveLineThickness = intervalBetweenStaveLines * 0.12,
  profiles = fullPageMutationProfiles
} = {}) {
  validateBitmap(bitmap)
  if (!profiles[profile]) {
    throw new Error(`Unknown full-page mutation profile: ${profile}`)
  }
  if (!Number.isFinite(intervalBetweenStaveLines) || intervalBetweenStaveLines <= 0) {
    throw new Error('intervalBetweenStaveLines must be a positive finite number of pixels')
  }
  if (!Number.isFinite(staveLineThickness) || staveLineThickness <= 0) {
    throw new Error('staveLineThickness must be a positive finite number of pixels')
  }
  const normalizedSeed = seed >>> 0
  const inputSize = { width: bitmap.width, height: bitmap.height }
  if (profile === 'clean') {
    return {
      bitmap: {
        width: bitmap.width,
        height: bitmap.height,
        grayscale: new Float32Array(bitmap.grayscale)
      },
      metadata: {
        type: 'seeded-full-page-bitmap-mutation',
        seed: normalizedSeed,
        profile,
        inputSize,
        outputSize: inputSize,
        localPixelScale: { intervalBetweenStaveLines, staveLineThickness },
        operations: []
      }
    }
  }

  const selectedProfile = profiles[profile]
  const random = createSeededRandom(normalizedSeed)
  const requested = {
    scaleX: drawRange(random, selectedProfile.scaleX),
    scaleY: drawRange(random, selectedProfile.scaleY),
    offsetXStaffSpaces: drawRange(random, selectedProfile.offsetXStaffSpaces),
    offsetYStaffSpaces: drawRange(random, selectedProfile.offsetYStaffSpaces),
    rotationDegrees: drawRange(random, selectedProfile.rotationDegrees),
    skewXDegrees: drawRange(random, selectedProfile.skewXDegrees),
    skewYDegrees: drawRange(random, selectedProfile.skewYDegrees),
    perspectiveX: drawRange(random, selectedProfile.perspectiveX),
    perspectiveY: drawRange(random, selectedProfile.perspectiveY),
    blurRadiusStaveLineThicknesses: drawRange(random, selectedProfile.blurRadiusStaveLineThicknesses),
    inkThicknessStaveLineThicknesses: drawRange(random, selectedProfile.inkThicknessStaveLineThicknesses),
    noiseStandardDeviation: drawRange(random, selectedProfile.noiseStandardDeviation),
    illuminationAmplitude: drawRange(random, selectedProfile.illuminationAmplitude),
    illuminationDirectionDegrees: 360 * random(),
    vignetteAmplitude: drawRange(random, selectedProfile.vignetteAmplitude),
    contrastFactor: drawRange(random, selectedProfile.contrastFactor),
    paperLevel: drawRange(random, selectedProfile.paperLevel)
  }
  if (requested.scaleX <= 0 || requested.scaleY <= 0) {
    throw new Error('Mutation scale must be positive')
  }
  const requestedBlurRadiusPixels = requested.blurRadiusStaveLineThicknesses * staveLineThickness
  const requestedInkThicknessPixels = requested.inkThicknessStaveLineThicknesses * staveLineThickness
  const blurRadiusPixels = Math.min(8, requestedBlurRadiusPixels)
  const inkThicknessPixels = Math.max(-4, Math.min(4, requestedInkThicknessPixels))
  const offsetXPixels = requested.offsetXStaffSpaces * intervalBetweenStaveLines
  const offsetYPixels = requested.offsetYStaffSpaces * intervalBetweenStaveLines
  const padding = Math.ceil(
    selectedProfile.paddingStaffSpaces * intervalBetweenStaveLines +
    3 * blurRadiusPixels + Math.abs(inkThicknessPixels) + 2
  )
  const operations = []
  const warped = warpFullPageBitmap(bitmap, {
    scaleX: requested.scaleX,
    scaleY: requested.scaleY,
    offsetX: offsetXPixels,
    offsetY: offsetYPixels,
    rotationDegrees: requested.rotationDegrees,
    skewXDegrees: requested.skewXDegrees,
    skewYDegrees: requested.skewYDegrees,
    perspectiveX: requested.perspectiveX,
    perspectiveY: requested.perspectiveY,
    padding,
    maxOutputPixels: selectedProfile.maxOutputPixels
  })
  let result = warped.bitmap
  operations.push(warped.operation)

  const blurred = blurFullPageBitmap(result, blurRadiusPixels)
  result = blurred.bitmap
  operations.push({
    ...blurred.operation,
    requestedRadiusStaveLineThicknesses: requested.blurRadiusStaveLineThicknesses,
    requestedRadiusPixels: requestedBlurRadiusPixels,
    maximumRadiusPixels: 8
  })

  const thicknessChanged = changeFullPageBitmapInkThickness(result, inkThicknessPixels)
  result = thicknessChanged.bitmap
  operations.push({
    ...thicknessChanged.operation,
    requestedRadiusStaveLineThicknesses: requested.inkThicknessStaveLineThicknesses,
    requestedSignedRadiusPixels: requestedInkThicknessPixels,
    maximumAbsoluteRadiusPixels: 4
  })

  const illuminated = illuminateFullPageBitmap(result, {
    amplitude: requested.illuminationAmplitude,
    directionDegrees: requested.illuminationDirectionDegrees,
    vignetteAmplitude: requested.vignetteAmplitude,
    paperLevel: requested.paperLevel
  })
  result = illuminated.bitmap
  operations.push(illuminated.operation)

  const contrastChanged = changeFullPageBitmapContrast(result, requested.contrastFactor)
  result = contrastChanged.bitmap
  operations.push(contrastChanged.operation)

  const noiseAdded = addFullPageBitmapNoise(result, requested.noiseStandardDeviation, random)
  result = noiseAdded.bitmap
  operations.push(noiseAdded.operation)

  return {
    bitmap: result,
    metadata: {
      type: 'seeded-full-page-bitmap-mutation',
      seed: normalizedSeed,
      profile,
      inputSize,
      outputSize: { width: result.width, height: result.height },
      localPixelScale: { intervalBetweenStaveLines, staveLineThickness },
      requestedParameters: requested,
      derivedPixelParameters: {
        offsetXPixels,
        offsetYPixels,
        requestedBlurRadiusPixels,
        blurRadiusPixels,
        requestedInkThicknessPixels,
        inkThicknessPixels,
        paddingPixels: padding
      },
      operations
    }
  }
}

function drawRange (random, range) {
  if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[0] > range[1]) {
    throw new Error('Mutation profile ranges must contain two ordered finite numbers')
  }
  return range[0] + (range[1] - range[0]) * random()
}

function validateBitmap ({ width, height, grayscale }) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    throw new Error('bitmap width and height must be positive safe integers')
  }
  if (!grayscale || typeof grayscale.length !== 'number' || grayscale.length !== width * height) {
    throw new Error('bitmap grayscale must contain exactly width * height samples')
  }
}

export default mutateFullPageBitmap

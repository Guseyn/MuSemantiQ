'use strict'

import deskewBitmap from '#msq/omr/analysis/deskewBitmap.js'
import detectStaves from '#msq/omr/analysis/detectStaves.js'
import groupStavesIntoSystems from '#msq/omr/analysis/groupStavesIntoSystems.js'
import findTextBlocks from '#msq/omr/analysis/findTextBlocks.js'
import measureStyles from '#msq/omr/analysis/measureStyles.js'

/**
 * What the image shows, as numbers.
 *
 * The analysis every later stage reads: staves and their lines, systems, the
 * word blocks with their roles, and the page's proportions. Coordinates are
 * pixels on the straightened bitmap; sizes are staff spaces. Nothing here is
 * guessed — each field is a measurement, and anything uncertain gets reported
 * by the stages that consume it.
 *
 * `analyzeStraightenedImage` skips the deskew for callers that straighten the
 * bitmap once and measure symbols against the very same pixels.
 */

export function analyzeImage ({ width, height, grayscale }) {
  return analyzeStraightenedImage(deskewBitmap({ width, height, grayscale }))
}

export function analyzeStraightenedImage (upright) {
  const { staves, referenceIntervalBetweenStaveLines } = detectStaves(upright)
  const systems = groupStavesIntoSystems(staves, upright)
  const textBlocks = findTextBlocks({ ...upright, staves, systems, intervalBetweenStaveLines: referenceIntervalBetweenStaveLines })
  const { fontSizes, colors, localIntervals } = measureStyles({ ...upright, staves, systems, textBlocks })
  return {
    skewAngleInDegrees: upright.skewAngleInDegrees || 0,
    referenceIntervalBetweenStaveLines: roundTo2(referenceIntervalBetweenStaveLines),
    staves: staves.map((stave, index) => ({
      index,
      systemIndex: systemIndexOf(staves, systems, index),
      linesY: stave.linesY.map(roundTo2),
      intervalBetweenStaveLines: roundTo2(stave.intervalBetweenStaveLines),
      staveLineThickness: roundTo2(stave.staveLineThickness),
      topY: roundTo2(stave.topY),
      bottomY: roundTo2(stave.bottomY),
      xStart: stave.xStart,
      xEnd: stave.xEnd
    })),
    systems,
    localIntervals,
    textBlocks,
    measuredStyles: fontSizes,
    colors
  }
}

function systemIndexOf (staves, systems, staveIndex) {
  return systems.findIndex((system) => system.staveIndexes.includes(staveIndex))
}

function roundTo2 (value) {
  return Math.round(value * 100) / 100
}

export default analyzeImage

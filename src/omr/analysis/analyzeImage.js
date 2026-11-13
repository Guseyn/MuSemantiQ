'use strict'

import deskewBitmap from './deskewBitmap.js'
import detectStaves from './detectStaves.js'
import groupStavesIntoSystems from './groupStavesIntoSystems.js'
import findTextBlocks from './findTextBlocks.js'
import measureStyles from './measureStyles.js'

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
  const { staves, staffSpaceHeightPx } = detectStaves(upright)
  const systems = groupStavesIntoSystems(staves)
  const textBlocks = findTextBlocks({ ...upright, staves, systems, staffSpaceHeightPx })
  const { fontSizes, colors } = measureStyles({ ...upright, staves, systems, textBlocks, staffSpaceHeightPx })
  return {
    skewAngleInDegrees: upright.skewAngleInDegrees || 0,
    staffSpaceHeightPx: roundTo2(staffSpaceHeightPx),
    staves: staves.map((stave, index) => ({
      index,
      systemIndex: systemIndexOf(staves, systems, index),
      linesY: stave.linesY.map(roundTo2),
      staffSpaceHeightPx: roundTo2(stave.staffSpaceHeightPx),
      topY: roundTo2(stave.topY),
      bottomY: roundTo2(stave.bottomY),
      xStart: stave.xStart,
      xEnd: stave.xEnd
    })),
    systems,
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

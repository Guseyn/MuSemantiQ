'use strict'

/**
 * The page's palette, text sizes and spacing, as proportions.
 *
 * Sizes are text height divided by the staff space — the same units MSQ
 * styles are written in ("stave-line intervals"). Spacing is stave-to-stave
 * and line-to-line in the same units. Colours are medians of the ink they
 * belong to: the paper, the stave lines, the words. Everything here is a
 * ratio or a colour, never an absolute size — `font size` itself (the one
 * pixel anchor) stays out and keeps its default.
 */

export function measureStyles ({ width, height, grayscale, staves, systems, textBlocks, staffSpaceHeightPx }) {
  const fontSizes = {
    titleFontSize: largestBlockSize(textBlocks, [ 'title' ]),
    subtitleFontSize: largestBlockSize(textBlocks, [ 'subtitle' ]),
    leftSubtitleFontSize: largestBlockSize(textBlocks, [ 'leftSubtitle' ]),
    rightSubtitleFontSize: largestBlockSize(textBlocks, [ 'rightSubtitle' ]),
    instrumentFontSize: largestBlockSize(textBlocks, [ 'instrument' ]),
    pageNumberFontSize: largestBlockSize(textBlocks, [ 'pageNumber' ]),
    intervalBetweenStaves: averageGapInStaffSpaces(groupedStaves(staves, systems), staffSpaceHeightPx),
    intervalBetweenPageLines: averageGapInStaffSpaces([ systems ], staffSpaceHeightPx)
  }
  const colors = {
    background: backgroundHex({ width, height, grayscale }),
    staveLines: staveLinesHex({ width, height, grayscale, staves }),
    text: textHex({ width, height, grayscale, textBlocks })
  }
  return { fontSizes, colors }
}

function largestBlockSize (textBlocks, roles) {
  const sizes = textBlocks.filter((block) => roles.includes(block.role)).map((block) => block.sizeInStaffSpaces)
  return sizes.length ? Math.round(Math.max(...sizes) * 100) / 100 : null
}

// Staves grouped by the system they belong to; spacing is measured inside
// each group, so a gap between systems is never mistaken for stave spacing.
function groupedStaves (staves, systems) {
  return systems.map((system) =>
    system.staveIndexes.map((index) => staves[index]).sort((first, second) => first.topY - second.topY)
  )
}

function averageGapInStaffSpaces (groups, staffSpaceHeightPx) {
  const spacings = []
  for (const group of groups) {
    for (let index = 1; index < group.length; index++) {
      spacings.push((group[index].topY - group[index - 1].topY) / staffSpaceHeightPx)
    }
  }
  if (!spacings.length) {
    return null
  }
  return Math.round(spacings.reduce((sum, spacing) => sum + spacing, 0) / spacings.length * 100) / 100
}

// The paper is what almost everything that is not ink is: the most common
// value among the light pixels.
function backgroundHex ({ width, height, grayscale }) {
  const histogram = new Float64Array(256)
  for (let index = 0; index < grayscale.length; index++) {
    if (grayscale[index] < 0.1) {
      histogram[Math.round((1 - grayscale[index]) * 255)]++
    }
  }
  return hexOfChannel(strongestChannel(histogram))
}

function staveLinesHex ({ width, height, grayscale, staves }) {
  const samples = []
  for (const stave of staves) {
    for (const line of stave.linesY) {
      const y = Math.round(line)
      for (let x = stave.xStart; x <= stave.xEnd; x += 3) {
        if (y >= 0 && y < height && grayscale[y * width + x] > 0.5) {
          samples.push(grayscale[y * width + x])
        }
      }
    }
  }
  return samples.length ? hexOfChannel(Math.round((1 - median(samples)) * 255)) : null
}

function textHex ({ width, height, grayscale, textBlocks }) {
  const samples = []
  for (const block of textBlocks) {
    for (let y = block.box.y; y < block.box.y + block.box.h; y++) {
      for (let x = block.box.x; x < block.box.x + block.box.w; x++) {
        const ink = grayscale[y * width + x]
        if (ink > 0.5) {
          samples.push(ink)
        }
      }
    }
  }
  return samples.length ? hexOfChannel(Math.round((1 - median(samples)) * 255)) : null
}

function strongestChannel (histogram) {
  let best = 0
  for (let channel = 0; channel < histogram.length; channel++) {
    if (histogram[channel] > histogram[best]) {
      best = channel
    }
  }
  return best
}

function median (values) {
  const sorted = [ ...values ].sort((first, second) => first - second)
  return sorted[Math.floor(sorted.length / 2)]
}

function hexOfChannel (channel) {
  const hex = Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0')
  return `#${hex}${hex}${hex}`
}

export default measureStyles

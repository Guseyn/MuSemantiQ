'use strict'

import measureLocalIntervals from '#msq/omr/analysis/measureLocalIntervals.js'

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

export function measureStyles ({ width, height, grayscale, rgb, staves, systems, textBlocks }) {
  const localIntervals = measureLocalIntervals(staves, systems)
  const fontSizes = {
    titleFontSize: largestBlockSize(textBlocks, [ 'title' ]),
    subtitleFontSize: largestBlockSize(textBlocks, [ 'subtitle' ]),
    leftSubtitleFontSize: largestBlockSize(textBlocks, [ 'leftSubtitle' ]),
    rightSubtitleFontSize: largestBlockSize(textBlocks, [ 'rightSubtitle' ]),
    instrumentFontSize: largestBlockSize(textBlocks, [ 'instrument' ]),
    pageNumberFontSize: largestBlockSize(textBlocks, [ 'pageNumber' ]),
    intervalBetweenStaves: averageValue(localIntervals.intervalBetweenStaves),
    intervalBetweenPageLines: averageValue(localIntervals.intervalBetweenPageLines)
  }
  const colors = {
    background: backgroundHex({ width, height, grayscale, rgb }),
    staveLines: staveLinesHex({ width, height, grayscale, rgb, staves }),
    text: textHex({ width, height, grayscale, rgb, textBlocks })
  }
  return { fontSizes, colors, localIntervals }
}

function largestBlockSize (textBlocks, roles) {
  const sizes = textBlocks.filter((block) => roles.includes(block.role)).map((block) => block.sizeInStaffSpaces)
  return sizes.length ? Math.round(Math.max(...sizes) * 100) / 100 : null
}

function averageValue (entries) {
  if (!entries.length) {
    return null
  }
  const average = entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length
  return Math.round(average * 100) / 100
}

// The paper is what almost everything that is not ink is: the most common
// value among the light pixels.
function backgroundHex ({ width, height, grayscale, rgb }) {
  if (rgb) {
    const paper = []
    for (let index = 0; index < grayscale.length; index++) {
      if (grayscale[index] < 0.1) {
        paper.push(index)
      }
    }
    return rgbHex(paper, rgb)
  }
  const histogram = new Float64Array(256)
  for (let index = 0; index < grayscale.length; index++) {
    if (grayscale[index] < 0.1) {
      histogram[Math.round((1 - grayscale[index]) * 255)]++
    }
  }
  return hexOfChannel(strongestChannel(histogram))
}

function staveLinesHex ({ width, height, grayscale, rgb, staves }) {
  const samples = []
  for (const stave of staves) {
    for (const line of stave.linesY) {
      const y = Math.round(line)
      for (let x = stave.xStart; x <= stave.xEnd; x += 3) {
        if (y >= 0 && y < height && grayscale[y * width + x] > 0.5) {
          samples.push(y * width + x)
        }
      }
    }
  }
  if (!samples.length) {
    return null
  }
  return rgb ? rgbHex(samples, rgb) : hexOfChannel(Math.round((1 - median(samples.map((index) => grayscale[index]))) * 255))
}

function textHex ({ width, height, grayscale, rgb, textBlocks }) {
  const samples = []
  for (const block of textBlocks) {
    for (let y = block.box.y; y < block.box.y + block.box.h; y++) {
      for (let x = block.box.x; x < block.box.x + block.box.w; x++) {
        if (grayscale[y * width + x] > 0.5) {
          samples.push(y * width + x)
        }
      }
    }
  }
  if (!samples.length) {
    return null
  }
  return rgb ? rgbHex(samples, rgb) : hexOfChannel(Math.round((1 - median(samples.map((index) => grayscale[index]))) * 255))
}

function rgbHex (samples, rgb) {
  if (!samples.length) {
    return null
  }
  return '#' + [ 0, 1, 2 ].map((channel) => {
    const values = samples.map((index) => Math.round(rgb[index * 3 + channel] * 255))
    return median(values).toString(16).padStart(2, '0')
  }).join('')
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

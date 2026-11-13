'use strict'

/**
 * Where the words are.
 *
 * Ink outside the staves is words: titles above, instrument names at the left,
 * page numbers below. Blocks are clusters of ink — split on row gaps bigger
 * than half a staff space and column gaps bigger than one — and given a role
 * from where they sit around the systems. What the words say is not read here.
 */

const INK_THRESHOLD = 0.5
const STAVE_MARGIN_IN_STAFF_SPACES = 0.3
const ROW_GAP_IN_STAFF_SPACES = 0.4
const COLUMN_GAP_IN_STAFF_SPACES = 1

export function findTextBlocks ({ width, height, grayscale, staves, systems, staffSpaceHeightPx }) {
  const mask = buildMaskOutsideStaves({ width, height, grayscale, staves, staffSpaceHeightPx })
  const bands = splitIntoRowBands(mask, width, height, staffSpaceHeightPx)
  const blocks = bands.flatMap((band) => splitBandIntoBlocks(band, mask, width, staffSpaceHeightPx))
  return blocks.map((block) => ({
    box: { x: block.x, y: block.y, w: block.w, h: block.h },
    role: roleOfBlock(block, { width, systems, staffSpaceHeightPx, blocks }),
    sizeInStaffSpaces: roundTo2(block.h / staffSpaceHeightPx)
  }))
}

function buildMaskOutsideStaves ({ width, height, grayscale, staves, staffSpaceHeightPx }) {
  const mask = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grayscale[y * width + x] <= INK_THRESHOLD) {
        continue
      }
      mask[y * width + x] = isInsideStave(x, y, staves, staffSpaceHeightPx) ? 0 : 1
    }
  }
  return mask
}

function isInsideStave (x, y, staves, staffSpaceHeightPx) {
  return staves.some((stave) => {
    const margin = STAVE_MARGIN_IN_STAFF_SPACES * stave.staffSpaceHeightPx
    return y >= stave.topY - margin && y <= stave.bottomY + margin &&
      x >= stave.xStart - margin && x <= stave.xEnd + margin
  })
}

function splitIntoRowBands (mask, width, height, staffSpaceHeightPx) {
  const rowHasInk = []
  for (let y = 0; y < height; y++) {
    let ink = false
    for (let x = 0; x < width && !ink; x++) {
      ink = mask[y * width + x] === 1
    }
    rowHasInk.push(ink)
  }
  const gapLimit = ROW_GAP_IN_STAFF_SPACES * staffSpaceHeightPx
  const bands = []
  let band = null
  for (let y = 0; y < height; y++) {
    if (rowHasInk[y]) {
      if (band && y - band.lastY <= gapLimit) {
        band.lastY = y
      } else {
        band = { firstY: y, lastY: y }
        bands.push(band)
      }
    }
  }
  return bands
}

function splitBandIntoBlocks (band, mask, width, staffSpaceHeightPx) {
  const columnsWithInk = []
  for (let x = 0; x < width; x++) {
    let ink = false
    for (let y = band.firstY; y <= band.lastY && !ink; y++) {
      ink = mask[y * width + x] === 1
    }
    columnsWithInk.push(ink)
  }
  const gapLimit = COLUMN_GAP_IN_STAFF_SPACES * staffSpaceHeightPx
  const blocks = []
  let block = null
  for (let x = 0; x < width; x++) {
    if (columnsWithInk[x]) {
      if (block && x - block.lastX <= gapLimit) {
        block.lastX = x
      } else {
        block = { firstX: x, lastX: x }
        blocks.push(block)
      }
    }
  }
  return blocks.map((columns) => ({
    x: columns.firstX,
    y: band.firstY,
    w: columns.lastX - columns.firstX + 1,
    h: band.lastY - band.firstY + 1
  }))
}

function roleOfBlock (block, { width, systems, staffSpaceHeightPx, blocks }) {
  const centerX = block.x + block.w / 2
  const centerY = block.y + block.h / 2
  const pageCenterX = width / 2
  const isCentered = Math.abs(centerX - pageCenterX) < 0.25 * width
  const firstSystemTopY = systems[0].topY
  const lastSystemBottomY = systems[systems.length - 1].bottomY
  if (block.y + block.h < firstSystemTopY - 0.5 * staffSpaceHeightPx && isCentered) {
    const centeredAbove = blocks
      .filter((other) => other.y + other.h < firstSystemTopY - 0.5 * staffSpaceHeightPx &&
        Math.abs(other.x + other.w / 2 - pageCenterX) < 0.25 * width)
      .sort((first, second) => first.y - second.y)
    return centeredAbove[0] === block ? 'title' : 'subtitle'
  }
  if (block.y > lastSystemBottomY + 0.5 * staffSpaceHeightPx && isCentered) {
    return 'pageNumber'
  }
  for (const system of systems) {
    const leftOfSystem = block.x + block.w < system.xStart - 0.2 * staffSpaceHeightPx
    const atStaveHeight = centerY > system.topY - staffSpaceHeightPx && centerY < system.bottomY + staffSpaceHeightPx
    if (leftOfSystem && atStaveHeight) {
      return 'instrument'
    }
  }
  return 'text'
}

function roundTo2 (value) {
  return Math.round(value * 100) / 100
}

export default findTextBlocks

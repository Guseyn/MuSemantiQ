'use strict'

export function nearestStave (box, staves, marginInStaffSpaces = 6) {
  const centerY = box.y + (box.h - 1) / 2
  let nearest = null
  staves.forEach((stave, staveIndex) => {
    const intervalBetweenStaveLines = stave.intervalBetweenStaveLines
    if (!(intervalBetweenStaveLines > 0)) {
      return
    }
    const anchorY = centerY < stave.topY
      ? stave.topY
      : centerY > stave.bottomY ? stave.bottomY : centerY
    const distance = Math.abs(centerY - anchorY)
    if (distance <= marginInStaffSpaces * intervalBetweenStaveLines && (!nearest || distance < nearest.distance)) {
      nearest = {
        stave,
        staveIndex,
        intervalBetweenStaveLines,
        staveLineThickness: Math.max(1, stave.staveLineThickness || 1),
        distance
      }
    }
  })
  return nearest
}

export function columnInk ({ width, grayscale }, box) {
  const columns = []
  for (let x = box.x; x < box.x + box.w; x++) {
    let count = 0
    let totalY = 0
    let minY = Infinity
    let maxY = -1
    for (let y = box.y; y < box.y + box.h; y++) {
      if (grayscale[y * width + x] > 0.25) {
        count++
        totalY += y
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
    columns.push(count ? { x, count, centerY: totalY / count, minY, maxY } : null)
  }
  return columns
}

export function fitStraightInk ({ width, grayscale }, box) {
  let count = 0
  let totalX = 0
  let totalY = 0
  const columns = new Set()
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      if (grayscale[y * width + x] > 0.25) {
        count++
        totalX += x
        totalY += y
        columns.add(x)
      }
    }
  }
  if (!count) {
    return null
  }
  const meanX = totalX / count
  const meanY = totalY / count
  let varianceX = 0
  let covariance = 0
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      if (grayscale[y * width + x] > 0.25) {
        varianceX += (x - meanX) ** 2
        covariance += (x - meanX) * (y - meanY)
      }
    }
  }
  const slope = varianceX ? covariance / varianceX : 0
  const intercept = meanY - slope * meanX
  let squaredResiduals = 0
  for (let y = box.y; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      if (grayscale[y * width + x] > 0.25) {
        squaredResiduals += (y - (slope * x + intercept)) ** 2
      }
    }
  }
  return {
    slope,
    intercept,
    perpendicularResidual: Math.sqrt(squaredResiduals / count) / Math.sqrt(1 + slope * slope),
    columnCoverage: columns.size / box.w
  }
}

export function interpolatedCenterLine (bitmap, box) {
  const columns = columnInk(bitmap, box)
  const known = columns.map((column, index) => column ? index : -1).filter((index) => index >= 0)
  if (known.length < 2) {
    return []
  }
  const centers = []
  for (let index = known[0]; index <= known[known.length - 1]; index++) {
    if (columns[index]) {
      centers.push(columns[index].centerY)
      continue
    }
    const before = known.filter((knownIndex) => knownIndex < index).pop()
    const after = known.find((knownIndex) => knownIndex > index)
    const fraction = (index - before) / (after - before)
    centers.push(columns[before].centerY + fraction * (columns[after].centerY - columns[before].centerY))
  }
  return centers
}

export function combinedBox (boxes) {
  const left = Math.min(...boxes.map((box) => box.x))
  const top = Math.min(...boxes.map((box) => box.y))
  const right = Math.max(...boxes.map((box) => box.x + box.w - 1))
  const bottom = Math.max(...boxes.map((box) => box.y + box.h - 1))
  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 }
}

export function centerX (box) {
  return box.x + (box.w - 1) / 2
}

export function centerY (box) {
  return box.y + (box.h - 1) / 2
}

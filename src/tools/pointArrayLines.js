'use strict'

/**
 * Writing point arrays the way the music-js fonts hold them.
 *
 * Shared by the generator (src/tools/generate-smufl-js-font.js) and the
 * browser font viewer, so a glyph traced in either place is written
 * identically. Keep this module free of Node built-ins.
 */

// The music-js files write coordinates to this many decimals.
export const COORDINATE_DECIMALS = 2

/**
 * Convert a traced path from pixels to the stave-line intervals the music-js
 * files are written in.
 */
export function pointsInStaveIntervals(points, interval) {
  return points.map(
    (point) => typeof point === 'string'
      ? point
      : Number((point / interval).toFixed(COORDINATE_DECIMALS))
  )
}

/**
 * Lay a point array out the way the committed music-js fonts are written: each
 * command letter on its own line, followed by its coordinates.
 */
export function pointArrayLines(points) {
  const lines = []
  let coordinates = []

  const flushCoordinates = () => {
    if (coordinates.length) {
      lines.push(coordinates.join(', '))
      coordinates = []
    }
  }

  for (const point of points) {
    if (typeof point === 'string') {
      flushCoordinates()
      lines.push(`'${point}'`)
    } else {
      // A coordinate that rounds to negative zero is written '-0.00', the way
      // toFixed produced it before the value made the round trip through Number.
      const written = Object.is(point, -0)
        ? `-${(0).toFixed(COORDINATE_DECIMALS)}`
        : point.toFixed(COORDINATE_DECIMALS)
      coordinates.push(`${written} * intervalBetweenStaveLines`)
    }
  }
  flushCoordinates()

  return lines.map(
    (line, index) => index === lines.length - 1 ? line : `${line},`
  )
}

export default pointArrayLines

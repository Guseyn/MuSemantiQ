'use strict'

import { deflateSync } from 'node:zlib'

/**
 * A bitmap, written as a PNG — the test side of decodeImageToGrayscale.
 *
 * 8-bit greyscale, no interlace, no filtering: the smallest honest PNG. The
 * round trip through the decoder must be exact for the drawn pages, which is
 * what the "any image becomes MSQ" test leans on.
 */

export function encodePng ({ width, height, grayscale }) {
  const scanlines = Buffer.alloc((width + 1) * height)
  for (let y = 0; y < height; y++) {
    scanlines[y * (width + 1)] = 0
    for (let x = 0; x < width; x++) {
      scanlines[y * (width + 1) + 1 + x] = Math.round((1 - grayscale[y * width + x]) * 255)
    }
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 0
  return Buffer.concat([
    Buffer.from([ 137, 80, 78, 71, 13, 10, 26, 10 ]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(scanlines)),
    chunk('IEND', Buffer.alloc(0))
  ])
}

function chunk (type, data) {
  const body = Buffer.concat([ Buffer.from(type, 'ascii'), data ])
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  return Buffer.concat([ length, body, crc32Of(body) ])
}

function crc32Of (buffer) {
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(buffer) >>> 0, 0)
  return crc
}

function crc32 (buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

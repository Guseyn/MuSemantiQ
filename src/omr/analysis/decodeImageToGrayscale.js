'use strict'

/**
 * PNG bytes → the numbers the analysis works in.
 *
 * PNG is what screenshots and exports are, and its one hard part — inflate —
 * ships with Node, so decoding needs no dependency. JPEGs are not decoded
 * here: convert one first (`sips -s format png photo.jpg` on macOS,
 * `magick photo.jpg photo.png`), or in a browser hand the canvas pixels to
 * readBitmapFromImage. The output is ink: 0 is paper, 1 is black, the same
 * convention as readBitmapFromImage.
 */

const PNG_SIGNATURE = [ 137, 80, 78, 71, 13, 10, 26, 10 ]
const CHANNELS_BY_COLOR_TYPE = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }

export function decodeImageToGrayscale (bytes) {
  const zlib = globalThis.process?.getBuiltinModule?.('node:zlib')
  if (!zlib) {
    throw new Error('decodeImageToGrayscale runs in Node (for zlib); in a browser, hand the canvas pixels to readBitmapFromImage')
  }
  const buffer = Buffer.from(bytes)
  if (!isPng(buffer)) {
    throw new Error('not a PNG — convert a JPEG first: sips -s format png photo.jpg (macOS) or magick photo.jpg photo.png')
  }
  const { header, palette, compressed } = readChunks(buffer)
  const channels = CHANNELS_BY_COLOR_TYPE[header.colorType]
  if (!channels) {
    throw new Error(`PNG colour type ${header.colorType} is not read`)
  }
  if (header.bitDepth !== 8 || header.interlace !== 0) {
    throw new Error('only 8-bit, non-interlaced PNGs are read')
  }
  const raw = zlib.inflateSync(Buffer.concat(compressed))
  const pixels = unfilter(raw, header.width, header.height, channels)
  const grayscale = new Float32Array(header.width * header.height)
  for (let index = 0; index < grayscale.length; index++) {
    grayscale[index] = inkAt(pixels, header.colorType, palette, index)
  }
  return { width: header.width, height: header.height, grayscale }
}

function isPng (buffer) {
  return PNG_SIGNATURE.every((byte, index) => buffer[index] === byte)
}

function readChunks (buffer) {
  let offset = PNG_SIGNATURE.length
  let header = null
  let palette = null
  const compressed = []
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12]
      }
    }
    if (type === 'PLTE') {
      palette = data
    }
    if (type === 'IDAT') {
      compressed.push(Buffer.from(data))
    }
    offset += 12 + length
  }
  if (!header) {
    throw new Error('PNG has no header')
  }
  return { header, palette, compressed }
}

function unfilter (raw, width, height, channels) {
  const stride = width * channels
  const pixels = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0
      const upLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0
      let predictor = 0
      if (filter === 1) {
        predictor = left
      } else if (filter === 2) {
        predictor = up
      } else if (filter === 3) {
        predictor = Math.floor((left + up) / 2)
      } else if (filter === 4) {
        predictor = paeth(left, up, upLeft)
      }
      pixels[y * stride + x] = (raw[y * (stride + 1) + 1 + x] + predictor) & 0xff
    }
  }
  return pixels
}

function paeth (left, up, upLeft) {
  const prediction = left + up - upLeft
  const distanceLeft = Math.abs(prediction - left)
  const distanceUp = Math.abs(prediction - up)
  const distanceUpLeft = Math.abs(prediction - upLeft)
  return distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft
    ? left
    : distanceUp <= distanceUpLeft ? up : upLeft
}

// Ink on white paper: a transparent pixel is paper, a black one is ink.
function inkAt (pixels, colorType, palette, index) {
  if (colorType === 0) {
    return 1 - pixels[index] / 255
  }
  if (colorType === 4) {
    return (1 - pixels[index * 2] / 255) * (pixels[index * 2 + 1] / 255)
  }
  let offset = index * 3
  if (colorType === 3) {
    offset = pixels[index] * 3
    return 1 - luma(palette[offset], palette[offset + 1], palette[offset + 2]) / 255
  }
  if (colorType === 6) {
    const alpha = pixels[index * 4 + 3] / 255
    const red = pixels[index * 4] * alpha + 255 * (1 - alpha)
    const green = pixels[index * 4 + 1] * alpha + 255 * (1 - alpha)
    const blue = pixels[index * 4 + 2] * alpha + 255 * (1 - alpha)
    return 1 - luma(red, green, blue) / 255
  }
  return 1 - luma(pixels[offset], pixels[offset + 1], pixels[offset + 2]) / 255
}

function luma (red, green, blue) {
  return 0.299 * red + 0.587 * green + 0.114 * blue
}

export default decodeImageToGrayscale

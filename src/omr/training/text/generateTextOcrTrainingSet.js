'use strict'

import { setupFonts } from '#msq/api.js'
import { rasterizeSvg } from '#msq/omr/training/raster/rasterizeSvg.js'
import { resampleToGrid } from '#msq/omr/training/cropComponents.js'
import { applyDegradations } from '#msq/omr/training/applyDegradations.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { textOcrAlphabet } from '#msq/omr/training/text/textOcrAlphabet.js'

const sourceCache = new Map()

// Character labels come from the renderer's own font objects. A merged title
// path cannot provide this truth because it no longer identifies each glyph.
export async function generateTextOcrTrainingSet ({
  seed = 1,
  samplesPerCharacter = 1,
  gridSize = 48,
  degrade = true,
  scales = [ 0.5, 1, 2 ],
  fontSizes = [ 16, 24, 32 ]
} = {}) {
  const baseSamples = await characterSources({ gridSize: gridSize * 2, scales, fontSizes })
  const random = createSeededRandom(seed)
  const samples = []
  for (const base of baseSamples) {
    for (let variant = 0; variant < samplesPerCharacter; variant++) {
      const source = degrade
        ? applyDegradations({ width: gridSize * 2, height: gridSize * 2, grayscale: base.pixels }, random)
        : { width: gridSize * 2, height: gridSize * 2, grayscale: base.pixels }
      samples.push({
        pixels: resampleToGrid(source, { x1: 0, y1: 0, x2: source.width, y2: source.height }, gridSize),
        classId: base.classId,
        classIndex: base.classIndex,
        character: base.character,
        font: base.font,
        fontSize: base.fontSize,
        scale: base.scale
      })
    }
  }
  return { classIds: [ ...textOcrAlphabet ], samples }
}

async function characterSources ({ gridSize, scales, fontSizes }) {
  const key = JSON.stringify({ gridSize, scales, fontSizes })
  if (!sourceCache.has(key)) {
    sourceCache.set(key, buildCharacterSources({ gridSize, scales, fontSizes }))
  }
  return sourceCache.get(key)
}

async function buildCharacterSources ({ gridSize, scales, fontSizes }) {
  const fonts = await setupFonts({
    'chord-letters': {
      'gentium plus': './src/drawer/font/chord-letters/GentiumPlus-Regular.ttf',
      'gothic a1': './src/drawer/font/chord-letters/GothicA1-Regular.ttf'
    },
    text: {
      'noto-serif': {
        regular: './src/drawer/font/text/NotoSerif-Regular.ttf',
        bold: './src/drawer/font/text/NotoSerif-Bold.ttf'
      },
      'noto-sans': {
        regular: './src/drawer/font/text/NotoSans-Regular.ttf',
        bold: './src/drawer/font/text/NotoSans-Bold.ttf'
      }
    }
  })
  const sources = []
  for (const [ family, weights ] of Object.entries(fonts.text)) {
    for (const [ weight, font ] of Object.entries(weights)) {
      sources.push({ id: `${family}:${weight}`, font })
    }
  }
  for (const [ family, font ] of Object.entries(fonts['chord-letters'])) {
    sources.push({ id: `chord:${family}`, font })
  }
  const samples = []
  for (const source of sources) {
    for (const fontSize of fontSizes) {
      for (const scale of scales) {
        for (const [ classIndex, character ] of textOcrAlphabet.entries()) {
          samples.push({
            classId: character,
            classIndex,
            character,
            font: source.id,
            fontSize,
            scale,
            pixels: rasterizeCharacter(source.font, character, fontSize, gridSize, scale)
          })
        }
      }
    }
  }
  return samples
}

function rasterizeCharacter (font, character, fontSize, gridSize, scale) {
  if (/^\s$/u.test(character)) {
    return new Float32Array(gridSize * gridSize)
  }
  const path = font.getPath(character, 0, fontSize, fontSize)
  const bounds = path.getBoundingBox()
  const padding = Math.max(2, Math.ceil(fontSize * 0.1))
  const width = Math.max(1, Math.ceil(bounds.x2 - bounds.x1) + 2 * padding)
  const height = Math.max(1, Math.ceil(bounds.y2 - bounds.y1) + 2 * padding)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#ffffff"/><g transform="translate(${padding - bounds.x1},${padding - bounds.y1})"><path d="${path.toPathData()}" fill="#000000"/></g></svg>`
  const bitmap = rasterizeSvg(svg, { scale })
  return resampleToGrid(bitmap, { x1: 0, y1: 0, x2: bitmap.width, y2: bitmap.height }, gridSize)
}

export default generateTextOcrTrainingSet

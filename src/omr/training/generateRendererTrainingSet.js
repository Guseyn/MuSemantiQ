'use strict'

import {
  setupFonts,
  supportedFontNamesFrom,
  generateIntermediateStructuresForSinglePage,
  generateStylesForMultiplePages,
  generateSvgForMultiplePages
} from '#msq/api.js'
import { rasterizeSvg } from '#msq/omr/training/raster/rasterizeSvg.js'
import { parseSvgPrimitives } from '#msq/omr/training/raster/parseSvgPrimitives.js'
import rendererSymbolDefinitions from '#msq/omr/training/rendererSymbolDefinitions.js'
import { drawableClassIds } from '#msq/omr/training/drawSymbols.js'
import { resampleComponentToGrid, resampleToGrid } from '#msq/omr/training/cropComponents.js'
import { applyDegradations } from '#msq/omr/training/applyDegradations.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { drawSymbolSample } from '#msq/omr/training/drawSymbols.js'
import detectStaves from '#msq/omr/analysis/detectStaves.js'
import removeStaffLines from '#msq/omr/analysis/removeStaffLines.js'

const sourceCache = new Map()
const FONT_SOURCES = {
  bravura: { font: './src/drawer/font/music/Bravura.otf', js: '#msq/drawer/font/music-js/bravura.js' },
  leland: { font: './src/drawer/font/music/Leland.otf', js: '#msq/drawer/font/music-js/leland.js' }
}

/**
 * Real renderer glyphs, cached only as small clean crops. Degradation happens
 * after that cache, so every epoch can see a fresh capture of the same truth.
 */
export async function generateRendererTrainingSet ({
  seed = 1,
  samplesPerClass = 1,
  gridSize = 48,
  classIds = drawableClassIds,
  degrade = true,
  scales = [ 0.5, 0.75, 1, 1.5, 2, 3 ],
  onClass = null
}) {
  const baseSamples = await rendererSourceSamples(gridSize * 2, scales)
  const random = createSeededRandom(seed)
  const samples = []
  for (const [ classIndex, classId ] of classIds.entries()) {
    if (onClass) {
      onClass(classId, classIndex + 1, classIds.length)
    }
    for (const base of baseSamples.filter((sample) => sample.classId === classId)) {
      for (let variant = 0; variant < samplesPerClass; variant++) {
        const source = degrade
          ? applyDegradations({ width: gridSize * 2, height: gridSize * 2, grayscale: base.pixels }, random)
          : { width: gridSize * 2, height: gridSize * 2, grayscale: base.pixels }
        samples.push({
          pixels: resampleToGrid(source, { x1: 0, y1: 0, x2: source.width, y2: source.height }, gridSize),
          classId,
          classIndex,
          font: base.font,
          scale: base.scale
        })
      }
    }
  }
  return { classIds, samples }
}

async function rendererSourceSamples (drawSize, scales) {
  const cacheKey = `${drawSize}:${scales.join(',')}`
  if (!sourceCache.has(cacheKey)) {
    sourceCache.set(cacheKey, buildRendererSourceSamples(drawSize, scales))
  }
  return sourceCache.get(cacheKey)
}

async function buildRendererSourceSamples (drawSize, scales) {
  const supportedFontSources = await setupFonts({ music: FONT_SOURCES })
  const supportedFontNames = supportedFontNamesFrom(supportedFontSources)
  const samples = []
  for (const [ classId, definition ] of Object.entries(rendererSymbolDefinitions)) {
    for (const font of Object.keys(FONT_SOURCES)) {
      for (const scale of scales) {
        const pageText = `music font is ${font}\n${definition.msq}`
        const parsed = generateIntermediateStructuresForSinglePage({ pageText, supportedFontNames })
        if (parsed.errors.length) {
          throw new Error(`${classId}: ${parsed.errors.map((error) => error.message).join(', ')}`)
        }
        const pageStylesForEachPage = generateStylesForMultiplePages({
          customStylesForEachPage: [ parsed.customStyles ],
          supportedFontSources
        })
        const svg = generateSvgForMultiplePages({
          pageSchemaForEachPage: [ parsed.pageSchema ],
          pageStylesForEachPage
        })
        const bitmap = rasterizeSvg(svg, { scale })
        const { staves } = detectStaves(bitmap)
        const withoutStaffLines = removeStaffLines(bitmap, staves)
        const document = parseSvgPrimitives(svg)
        const group = document.groups.filter((candidate) => candidate.name === definition.targetName)
          .sort((first, second) => areaOf(first.bounds) - areaOf(second.bounds))[0]
        if (!group) {
          throw new Error(`${classId}: no ${definition.targetName} group; available: ${[ ...new Set(document.groups.map((item) => item.name)) ].filter(Boolean).join(', ')}`)
        }
        const box = definition.primitiveIndex === undefined
          ? boxFromBounds(group.bounds, scale)
          : primitiveBox(document, group, definition.primitiveIndex, scale)
        samples.push({
          classId,
          font,
          scale,
          pixels: resampleComponentToGrid(withoutStaffLines, box, drawSize)
        })
      }
    }
  }
  const random = createSeededRandom(1)
  samples.push({ classId: 'other', font: 'synthetic-junk', pixels: drawSymbolSample('other', drawSize, random).grayscale })
  return samples
}

function primitiveBox (document, group, index, scale) {
  const centerY = (group.bounds.top + group.bounds.bottom) / 2
  const primitives = document.primitives.filter((primitive) =>
    primitive.attributes.d && primitive.bounds &&
    primitive.bounds.left >= group.bounds.left - 0.01 && primitive.bounds.right <= group.bounds.right + 0.01 &&
    primitive.bounds.top >= group.bounds.top - 0.01 && primitive.bounds.top <= centerY + 0.01 &&
    primitive.style.fill !== '#343434')
    .sort((first, second) => first.bounds.left - second.bounds.left)
  if (!primitives[index]) {
    throw new Error(`No text primitive ${index} in ${group.name}`)
  }
  return boxFromBounds(primitives[index].bounds, scale)
}

function areaOf (bounds) {
  return Math.max(0, bounds.right - bounds.left) * Math.max(0, bounds.bottom - bounds.top)
}

function boxFromBounds (bounds, scale = 1) {
  const x = Math.floor(bounds.left * scale)
  const y = Math.floor(bounds.top * scale)
  return {
    x,
    y,
    w: Math.max(1, Math.ceil(bounds.right * scale) - x),
    h: Math.max(1, Math.ceil(bounds.bottom * scale) - y)
  }
}

export default generateRendererTrainingSet

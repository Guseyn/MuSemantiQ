#!/usr/bin/env node

'use strict'

/**
 * A deterministic smoke check for renderer-derived OMR pages.
 *
 *   node scripts/omr-raster-check.js
 *   node scripts/omr-raster-check.js --fixture=layout-page-format.svg
 *   node scripts/omr-raster-check.js --all
 *   node scripts/omr-raster-check.js --out=/tmp/page.png
 *
 * Nothing is written unless --out is supplied. The hash covers quantized ink,
 * not a PNG encoder's metadata or compression choices.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

import { rasterizeSvg } from '#msq/omr/training/raster/rasterizeSvg.js'
import { encodePng } from '#msq/omr/training/encodePng.js'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
const scale = options.scale === undefined ? 1 : Number(options.scale)
const supersample = options.supersample === undefined ? 2 : Number(options.supersample)
const roots = [ 'bravura', 'leland' ].map((family) => path.join('test/visual-tests', family, 'svg/expected'))

if (options.all) {
  if (options.out) {
    throw new Error('--out writes one fixture and cannot be combined with --all')
  }
  const files = (await Promise.all(roots.map(async (root) => {
    return (await fs.readdir(root)).filter((name) => name.endsWith('.svg')).sort().map((name) => path.join(root, name))
  }))).flat()
  const corpusHash = createHash('sha256')
  const diagnostics = new Map()
  let totalInk = 0
  let totalPixels = 0
  let minimumInkRatio = Infinity
  let maximumInkRatio = 0
  for (const file of files) {
    const result = await check(file)
    corpusHash.update(result.hash)
    totalInk += result.inkRatio * result.width * result.height
    totalPixels += result.width * result.height
    minimumInkRatio = Math.min(minimumInkRatio, result.inkRatio)
    maximumInkRatio = Math.max(maximumInkRatio, result.inkRatio)
    for (const [ kind, values ] of Object.entries(result.unsupported)) {
      for (const value of values) {
        if (!diagnostics.has(`${kind}: ${value}`)) {
          diagnostics.set(`${kind}: ${value}`, [])
        }
        diagnostics.get(`${kind}: ${value}`).push(file)
      }
    }
  }
  console.log(JSON.stringify({
    files: files.length,
    inkRatio: Number((totalInk / totalPixels).toFixed(8)),
    minimumInkRatio: Number(minimumInkRatio.toFixed(8)),
    maximumInkRatio: Number(maximumInkRatio.toFixed(8)),
    hash: corpusHash.digest('hex'),
    unsupported: Object.fromEntries([ ...diagnostics ].map(([ name, locations ]) => [ name, {
      count: locations.length,
      fixtures: locations.slice(0, 4)
    } ]))
  }, null, 2))
} else {
  const file = await fixturePath(options.fixture || 'chords-seconds-and-clusters.svg')
  const result = await check(file)
  if (options.out) {
    const bitmap = rasterizeSvg(await fs.readFile(file, 'utf8'), { scale, supersample })
    await fs.writeFile(options.out, encodePng(bitmap))
  }
  console.log(JSON.stringify({ fixture: file, ...result }, null, 2))
}

async function check (file) {
  const bitmap = rasterizeSvg(await fs.readFile(file, 'utf8'), { scale, supersample })
  const quantized = Buffer.alloc(bitmap.grayscale.length)
  let total = 0
  for (let index = 0; index < bitmap.grayscale.length; index++) {
    const ink = bitmap.grayscale[index]
    if (!Number.isFinite(ink) || ink < 0 || ink > 1) {
      throw new Error(`${file}: invalid ink sample ${ink} at ${index}`)
    }
    total += ink
    quantized[index] = Math.round(ink * 255)
  }
  return {
    width: bitmap.width,
    height: bitmap.height,
    inkRatio: Number((total / bitmap.grayscale.length).toFixed(8)),
    hash: createHash('sha256').update(quantized).digest('hex'),
    unsupported: {
      elements: bitmap.unsupportedElements,
      commands: bitmap.unsupportedCommands,
      transforms: bitmap.unsupportedTransforms,
      colors: bitmap.unsupportedColors
    }
  }
}

async function fixturePath (requested) {
  if (requested.includes('/') || requested.includes('\\')) {
    return requested
  }
  for (const root of roots) {
    const candidate = path.join(root, requested)
    try {
      await fs.access(candidate)
      return candidate
    } catch {}
  }
  throw new Error(`Unknown fixture: ${requested}`)
}
